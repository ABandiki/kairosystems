'use client';

import { useState, useEffect, useCallback } from 'react';
import { Leaf, AlertTriangle, Plus, Pencil, Trash2, CircleSlash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { traditionalMedicineApi, TraditionalMedicineRecord } from '@/lib/api';
import { format, parseISO } from 'date-fns';

const categoryLabels: Record<string, string> = {
  HERBAL: 'Herbal',
  DIETARY: 'Dietary',
  SPIRITUAL: 'Spiritual',
  PHYSICAL: 'Physical',
  OTHER: 'Other',
};

const categoryColors: Record<string, string> = {
  HERBAL: 'bg-emerald-100 text-emerald-800',
  DIETARY: 'bg-amber-100 text-amber-800',
  SPIRITUAL: 'bg-purple-100 text-purple-800',
  PHYSICAL: 'bg-cyan-100 text-cyan-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const practitionerLabels: Record<string, string> = {
  SELF_ADMINISTERED: 'Self-administered',
  HERBALIST: 'Herbalist',
  TRADITIONAL_HEALTH_PRACTITIONER: 'Traditional health practitioner',
  FAITH_HEALER: 'Faith healer',
  FAMILY_COMMUNITY: 'Family / community',
  UNKNOWN: 'Not specified',
};

// Common Southern African remedies offered as autocomplete suggestions.
// Names follow "Common name (botanical)" so records stay searchable.
const commonRemedies = [
  'African potato (Hypoxis hemerocallidea)',
  'Zumbani / Umsuzwane (Lippia javanica)',
  'Umhlonyane (Artemisia afra)',
  'Aloe (Aloe vera / ferox)',
  "Devil's claw (Harpagophytum procumbens)",
  'Moringa (Moringa oleifera)',
  'Guava leaf (Psidium guajava)',
  'Gumtree / eucalyptus steam (Eucalyptus spp.)',
  'Cancer bush (Sutherlandia frutescens)',
  'Buchu (Agathosma betulina)',
];

const emptyForm = {
  remedyName: '',
  localName: '',
  category: 'HERBAL',
  preparation: '',
  indication: '',
  frequency: '',
  practitionerType: 'UNKNOWN',
  practitionerName: '',
  status: 'CURRENT',
  startedAt: '',
  hasInteractionRisk: false,
  interactionNotes: '',
  notes: '',
};

interface TraditionalMedicineTabProps {
  patientId: string;
  onRecordsChanged?: () => void;
}

export function TraditionalMedicineTab({
  patientId,
  onRecordsChanged,
}: TraditionalMedicineTabProps) {
  const [records, setRecords] = useState<TraditionalMedicineRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await traditionalMedicineApi.getAll({
        patientId,
        pageSize: 100,
      });
      setRecords(response.data || []);
    } catch (err) {
      console.error('Failed to fetch traditional medicine records:', err);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEditDialog = (record: TraditionalMedicineRecord) => {
    setEditingId(record.id);
    setForm({
      remedyName: record.remedyName,
      localName: record.localName || '',
      category: record.category,
      preparation: record.preparation || '',
      indication: record.indication || '',
      frequency: record.frequency || '',
      practitionerType: record.practitionerType,
      practitionerName: record.practitionerName || '',
      status: record.status,
      startedAt: record.startedAt ? record.startedAt.slice(0, 10) : '',
      hasInteractionRisk: record.hasInteractionRisk,
      interactionNotes: record.interactionNotes || '',
      notes: record.notes || '',
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!form.remedyName.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        remedyName: form.remedyName.trim(),
        localName: form.localName.trim() || undefined,
        category: form.category,
        preparation: form.preparation.trim() || undefined,
        indication: form.indication.trim() || undefined,
        frequency: form.frequency.trim() || undefined,
        practitionerType: form.practitionerType,
        practitionerName: form.practitionerName.trim() || undefined,
        status: form.status,
        startedAt: form.startedAt || undefined,
        hasInteractionRisk: form.hasInteractionRisk,
        interactionNotes: form.interactionNotes.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (editingId) {
        await traditionalMedicineApi.update(editingId, payload);
      } else {
        await traditionalMedicineApi.create({ ...payload, patientId });
      }

      setShowDialog(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchRecords();
      onRecordsChanged?.();
    } catch (err) {
      console.error('Failed to save traditional medicine record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkStopped = async (record: TraditionalMedicineRecord) => {
    try {
      await traditionalMedicineApi.update(record.id, {
        status: 'PAST',
        stoppedAt: new Date().toISOString().slice(0, 10),
      });
      await fetchRecords();
      onRecordsChanged?.();
    } catch (err) {
      console.error('Failed to update record:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await traditionalMedicineApi.delete(id);
      await fetchRecords();
      onRecordsChanged?.();
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    try {
      return format(parseISO(date), 'dd MMM yyyy');
    } catch {
      return date;
    }
  };

  const currentRecords = records.filter((r) => r.status === 'CURRENT');
  const pastRecords = records.filter((r) => r.status === 'PAST');

  const renderRecord = (record: TraditionalMedicineRecord) => (
    <div
      key={record.id}
      className={`p-4 rounded-lg border ${
        record.hasInteractionRisk && record.status === 'CURRENT'
          ? 'border-red-200 bg-red-50/50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{record.remedyName}</span>
            {record.localName && (
              <span className="text-gray-500 text-sm">({record.localName})</span>
            )}
            <Badge className={categoryColors[record.category] || categoryColors.OTHER}>
              {categoryLabels[record.category] || record.category}
            </Badge>
            {record.status === 'PAST' && <Badge variant="secondary">Past use</Badge>}
            {record.hasInteractionRisk && (
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Interaction risk
              </Badge>
            )}
          </div>

          <div className="mt-2 text-sm text-gray-600 space-y-1">
            {record.indication && (
              <p>
                <span className="text-gray-400">Used for:</span> {record.indication}
              </p>
            )}
            {(record.preparation || record.frequency) && (
              <p>
                {record.preparation && (
                  <>
                    <span className="text-gray-400">Preparation:</span>{' '}
                    {record.preparation}
                  </>
                )}
                {record.preparation && record.frequency && ' • '}
                {record.frequency && (
                  <>
                    <span className="text-gray-400">Frequency:</span> {record.frequency}
                  </>
                )}
              </p>
            )}
            <p>
              <span className="text-gray-400">Source:</span>{' '}
              {practitionerLabels[record.practitionerType] || record.practitionerType}
              {record.practitionerName && ` — ${record.practitionerName}`}
            </p>
            {record.hasInteractionRisk && record.interactionNotes && (
              <p className="text-red-700">
                <span className="font-medium">Interaction note:</span>{' '}
                {record.interactionNotes}
              </p>
            )}
            {record.notes && <p className="text-gray-500">{record.notes}</p>}
            <p className="text-xs text-gray-400">
              {record.startedAt && `Started ${formatDate(record.startedAt)}`}
              {record.startedAt && record.stoppedAt && ' • '}
              {record.stoppedAt && `Stopped ${formatDate(record.stoppedAt)}`}
              {(record.startedAt || record.stoppedAt) && ' • '}
              Recorded by {record.recordedByName || 'Unknown'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {record.status === 'CURRENT' && (
            <Button
              variant="ghost"
              size="sm"
              title="Mark as stopped"
              onClick={() => handleMarkStopped(record)}
            >
              <CircleSlash className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            title="Edit"
            onClick={() => openEditDialog(record)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Delete"
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDelete(record.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              Traditional & Complementary Medicine
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Remedies and practices the patient uses outside conventional care —
              recorded so the full treatment picture is visible before prescribing.
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Record Use
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-10">
              <Leaf className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                No traditional medicine use recorded
              </p>
              <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                Asking about traditional and home remedies during consultations helps
                catch interactions with prescribed treatment early.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentRecords.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Current use ({currentRecords.length})
                  </h4>
                  {currentRecords.map(renderRecord)}
                </div>
              )}
              {pastRecords.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-500">
                    Past use ({pastRecords.length})
                  </h4>
                  {pastRecords.map(renderRecord)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Traditional Medicine Record' : 'Record Traditional Medicine Use'}
            </DialogTitle>
            <DialogDescription>
              Document what the patient is using so it can be considered alongside
              conventional treatment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="tm-remedy">Remedy / practice *</Label>
              <Input
                id="tm-remedy"
                list="tm-common-remedies"
                placeholder="e.g. African potato (Hypoxis)"
                value={form.remedyName}
                onChange={(e) => setForm({ ...form, remedyName: e.target.value })}
              />
              <datalist id="tm-common-remedies">
                {commonRemedies.map((remedy) => (
                  <option key={remedy} value={remedy} />
                ))}
              </datalist>
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="tm-local">Local name</Label>
              <Input
                id="tm-local"
                placeholder="e.g. Zumbani"
                value={form.localName}
                onChange={(e) => setForm({ ...form, localName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-preparation">Preparation</Label>
              <Input
                id="tm-preparation"
                placeholder="e.g. Infusion (tea), steam, poultice"
                value={form.preparation}
                onChange={(e) => setForm({ ...form, preparation: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tm-indication">Used for</Label>
              <Input
                id="tm-indication"
                placeholder="e.g. Cough and chest congestion"
                value={form.indication}
                onChange={(e) => setForm({ ...form, indication: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-frequency">Frequency</Label>
              <Input
                id="tm-frequency"
                placeholder="e.g. Twice daily"
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={form.practitionerType}
                onValueChange={(value) => setForm({ ...form, practitionerType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(practitionerLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-practitioner">Practitioner name</Label>
              <Input
                id="tm-practitioner"
                placeholder="If known"
                value={form.practitionerName}
                onChange={(e) => setForm({ ...form, practitionerName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Currently using</SelectItem>
                  <SelectItem value="PAST">Past use</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-started">Started</Label>
              <Input
                id="tm-started"
                type="date"
                value={form.startedAt}
                onChange={(e) => setForm({ ...form, startedAt: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50">
              <Checkbox
                id="tm-interaction"
                checked={form.hasInteractionRisk}
                onCheckedChange={(checked) =>
                  setForm({ ...form, hasInteractionRisk: checked === true })
                }
                className="mt-0.5"
              />
              <div className="space-y-2 flex-1">
                <Label htmlFor="tm-interaction" className="font-medium cursor-pointer">
                  Possible interaction with conventional treatment
                </Label>
                <p className="text-xs text-gray-500">
                  Flagging this creates a high-priority alert on the patient record so
                  it&apos;s visible before prescribing.
                </p>
                {form.hasInteractionRisk && (
                  <Textarea
                    placeholder="e.g. Hypoxis may reduce ARV efficacy — reviewed with patient"
                    value={form.interactionNotes}
                    onChange={(e) =>
                      setForm({ ...form, interactionNotes: e.target.value })
                    }
                    rows={2}
                  />
                )}
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="tm-notes">Notes</Label>
              <Textarea
                id="tm-notes"
                placeholder="Any additional context"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !form.remedyName.trim()}
            >
              {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
