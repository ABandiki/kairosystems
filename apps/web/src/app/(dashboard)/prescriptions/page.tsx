'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Pill,
  RefreshCw,
  AlertTriangle,
  Clock,
  X,
  Trash2,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/use-auth';
import { usePrescriptions } from '@/hooks/use-api';
import { prescriptionsApi, patientsApi, Prescription, PrescriptionItem, Patient } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { format, parseISO } from 'date-fns';

const typeColors: Record<string, string> = {
  ACUTE: 'bg-blue-100 text-blue-800',
  REPEAT: 'bg-purple-100 text-purple-800',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
};

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'As needed',
  'Weekly',
];

const ROUTE_OPTIONS = [
  'Oral',
  'Topical',
  'Inhaled',
  'Injection',
  'Rectal',
  'Sublingual',
];

const emptyItem: PrescriptionItem = {
  medication: '',
  dosage: '',
  frequency: 'Once daily',
  route: 'Oral',
  quantity: undefined,
  unit: '',
  instructions: '',
};

export default function PrescriptionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialogs
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // New prescription form
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    type: 'ACUTE' as 'ACUTE' | 'REPEAT',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reviewDate: '',
    notes: '',
    items: [{ ...emptyItem }] as PrescriptionItem[],
  });
  const [submitting, setSubmitting] = useState(false);

  const canFetch = !authLoading && !!user;
  const { data: prescriptionsData, isLoading: prescriptionsLoading, refetch } = usePrescriptions(
    {
      search: searchQuery || undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    },
    canFetch
  );

  const prescriptions = prescriptionsData?.data || [];

  // Calculate stats
  const totalActive = prescriptions.filter(p => p.status === 'ACTIVE').length;
  const repeatCount = prescriptions.filter(p => p.type === 'REPEAT' && p.status === 'ACTIVE').length;
  const dueForReview = prescriptions.filter(p => {
    if (!p.reviewDate || p.status !== 'ACTIVE') return false;
    return new Date(p.reviewDate) <= new Date();
  }).length;
  const expiredCount = prescriptions.filter(p => p.status === 'EXPIRED').length;

  // Fetch patients when dialog opens
  useEffect(() => {
    if (showNewDialog) {
      fetchPatients('');
    }
  }, [showNewDialog]);

  const fetchPatients = async (search: string) => {
    setPatientsLoading(true);
    try {
      const result = await patientsApi.getAll({ search, pageSize: 20 });
      setPatients(result.data);
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setPatientsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (patientSearch.length >= 2) {
      const timeout = setTimeout(() => fetchPatients(patientSearch), 300);
      return () => clearTimeout(timeout);
    }
  }, [patientSearch]);

  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'dd MMM yyyy');
    } catch {
      return date;
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...emptyItem }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      type: 'ACUTE',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      reviewDate: '',
      notes: '',
      items: [{ ...emptyItem }],
    });
    setPatientSearch('');
  };

  const handleCreate = async () => {
    if (!formData.patientId) {
      toast.warning('Please select a patient');
      return;
    }
    if (formData.items.length === 0 || !formData.items[0].medication) {
      toast.warning('Please add at least one medication');
      return;
    }

    setSubmitting(true);
    try {
      await prescriptionsApi.create({
        patientId: formData.patientId,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        reviewDate: formData.reviewDate || undefined,
        notes: formData.notes || undefined,
        items: formData.items.filter(item => item.medication),
      });
      toast.success('Prescription created', 'The prescription has been saved successfully.');
      setShowNewDialog(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error('Failed to create prescription', error.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await prescriptionsApi.delete(id);
      toast.success('Prescription deleted');
      refetch();
    } catch (error: any) {
      toast.error('Failed to delete prescription', error.message || 'Please try again.');
    }
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowViewDialog(true);
  };

  // Loading skeleton
  if (authLoading || prescriptionsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-3" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-500">Manage patient prescriptions and medications</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Prescription
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Pill className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Active</p>
                <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Repeat Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{repeatCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Due for Review</p>
                <p className="text-2xl font-bold text-gray-900">{dueForReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, medication..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ACUTE">Acute</SelectItem>
                <SelectItem value="REPEAT">Repeat</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card>
        {prescriptions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Review Date</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow
                  key={prescription.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewPrescription(prescription)}
                >
                  <TableCell className="font-medium">
                    {prescription.patientName || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {prescription.items[0]?.medication || 'No medication'}
                      </p>
                      {prescription.items.length > 1 && (
                        <p className="text-xs text-gray-500">
                          +{prescription.items.length - 1} more
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${typeColors[prescription.type]} border-0`}>
                      {prescription.type === 'ACUTE' ? 'Acute' : 'Repeat'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[prescription.status]} border-0`}>
                      {prescription.status.charAt(0) + prescription.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(prescription.startDate)}</TableCell>
                  <TableCell>
                    {prescription.reviewDate ? (
                      <span className={
                        new Date(prescription.reviewDate) <= new Date()
                          ? 'text-amber-600 font-medium'
                          : ''
                      }>
                        {formatDate(prescription.reviewDate)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleViewPrescription(prescription);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(prescription.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">No prescriptions found</p>
            <p className="text-gray-500 mb-4">Get started by creating a new prescription.</p>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </div>
        )}
      </Card>

      {/* New Prescription Dialog */}
      <Dialog open={showNewDialog} onOpenChange={(open) => {
        setShowNewDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Prescription</DialogTitle>
            <DialogDescription>
              Create a new prescription for a patient.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Patient Selector */}
            <div className="space-y-2">
              <Label>Patient *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for a patient..."
                  className="pl-9"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
              {formData.patientId && (
                <div className="flex items-center gap-2 p-2 bg-teal-50 border border-teal-200 rounded-md">
                  <span className="text-sm font-medium text-teal-800">
                    {patients.find(p => p.id === formData.patientId)
                      ? `${patients.find(p => p.id === formData.patientId)!.firstName} ${patients.find(p => p.id === formData.patientId)!.lastName}`
                      : 'Selected patient'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-auto"
                    onClick={() => setFormData(prev => ({ ...prev, patientId: '' }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {!formData.patientId && patients.length > 0 && patientSearch.length >= 2 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {patientsLoading ? (
                    <div className="p-3 text-sm text-gray-500">Loading...</div>
                  ) : (
                    patients.map((patient) => (
                      <button
                        key={patient.id}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b last:border-b-0"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, patientId: patient.id }));
                          setPatientSearch('');
                        }}
                      >
                        <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                        <span className="text-gray-500 ml-2">
                          DOB: {formatDate(patient.dateOfBirth)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Prescription Type */}
            <div className="space-y-2">
              <Label>Prescription Type *</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'ACUTE' | 'REPEAT' }))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ACUTE" id="type-acute" />
                  <Label htmlFor="type-acute" className="font-normal cursor-pointer">Acute</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="REPEAT" id="type-repeat" />
                  <Label htmlFor="type-repeat" className="font-normal cursor-pointer">Repeat</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Review Date</Label>
                <Input
                  type="date"
                  value={formData.reviewDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, reviewDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Medication Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Medications *</Label>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medication
                </Button>
              </div>

              {formData.items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Medication {index + 1}
                      </span>
                      {formData.items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-700"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Medication Name *</Label>
                        <Input
                          placeholder="e.g. Amoxicillin"
                          value={item.medication}
                          onChange={(e) => updateItem(index, 'medication', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Dosage *</Label>
                        <Input
                          placeholder="e.g. 500mg"
                          value={item.dosage}
                          onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Frequency *</Label>
                        <Select
                          value={item.frequency}
                          onValueChange={(value) => updateItem(index, 'frequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FREQUENCY_OPTIONS.map((freq) => (
                              <SelectItem key={freq} value={freq}>
                                {freq}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Route</Label>
                        <Select
                          value={item.route || 'Oral'}
                          onValueChange={(value) => updateItem(index, 'route', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUTE_OPTIONS.map((route) => (
                              <SelectItem key={route} value={route}>
                                {route}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 28"
                          value={item.quantity ?? ''}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Unit</Label>
                        <Input
                          placeholder="e.g. tablets"
                          value={item.unit || ''}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Instructions</Label>
                      <Input
                        placeholder="e.g. Take with food"
                        value={item.instructions || ''}
                        onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes about this prescription..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowNewDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Prescription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Prescription Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-6 py-4">
              {/* Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{selectedPrescription.patientName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prescribed By</p>
                  <p className="font-medium">{selectedPrescription.prescriberName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <Badge className={`${typeColors[selectedPrescription.type]} border-0`}>
                    {selectedPrescription.type === 'ACUTE' ? 'Acute' : 'Repeat'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={`${statusColors[selectedPrescription.status]} border-0`}>
                    {selectedPrescription.status.charAt(0) + selectedPrescription.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(selectedPrescription.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">
                    {selectedPrescription.endDate ? formatDate(selectedPrescription.endDate) : '-'}
                  </p>
                </div>
                {selectedPrescription.reviewDate && (
                  <div>
                    <p className="text-sm text-gray-500">Review Date</p>
                    <p className={`font-medium ${
                      new Date(selectedPrescription.reviewDate) <= new Date()
                        ? 'text-amber-600'
                        : ''
                    }`}>
                      {formatDate(selectedPrescription.reviewDate)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Issued At</p>
                  <p className="font-medium">{formatDate(selectedPrescription.issuedAt)}</p>
                </div>
              </div>

              {/* Medications */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Medications</h3>
                <div className="space-y-3">
                  {selectedPrescription.items.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{item.medication}</p>
                            <p className="text-sm text-gray-600">
                              {item.dosage} - {item.frequency}
                              {item.route ? ` (${item.route})` : ''}
                            </p>
                            {item.quantity && (
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} {item.unit || ''}
                              </p>
                            )}
                            {item.instructions && (
                              <p className="text-sm text-gray-500 mt-1 italic">
                                {item.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
