'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Edit,
  Plus,
  FileText,
  Clock,
  User,
  Activity,
  Pill,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { patientsApi, appointmentsApi, Patient, Appointment, PatientAlert } from '@/lib/api';
import { format, parseISO, differenceInYears } from 'date-fns';

// Note interface
interface Note {
  id: string;
  title: string;
  content: string;
  noteType: string;
  createdAt: string;
  createdBy: string;
  colorCode?: string;
}

// Mock notes data - in production this would come from API
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Initial Consultation',
    content: 'Patient presented with persistent cough for 2 weeks. No fever. Prescribed cough suppressant and advised to return if symptoms persist.',
    noteType: 'CONSULTATION',
    createdAt: '2026-02-01T10:30:00Z',
    createdBy: 'Dr. Tatenda Chikwanha',
    colorCode: '#03989E',
  },
  {
    id: '2',
    title: 'Follow-up Visit',
    content: 'Cough has improved significantly. Patient reports better sleep. Continue current medication for another week.',
    noteType: 'FOLLOW_UP',
    createdAt: '2026-02-03T14:00:00Z',
    createdBy: 'Dr. Tatenda Chikwanha',
    colorCode: '#4CBD90',
  },
  {
    id: '3',
    title: 'Lab Results Review',
    content: 'Blood test results normal. Cholesterol levels within healthy range. No action required.',
    noteType: 'LAB_REVIEW',
    createdAt: '2026-01-28T09:15:00Z',
    createdBy: 'Nurse Rudo Mutasa',
    colorCode: '#F59E0B',
  },
];

const noteTypeColors: Record<string, string> = {
  CONSULTATION: 'bg-teal-100 text-teal-800',
  FOLLOW_UP: 'bg-emerald-100 text-emerald-800',
  LAB_REVIEW: 'bg-amber-100 text-amber-800',
  REFERRAL: 'bg-cyan-100 text-cyan-800',
  PHONE_CALL: 'bg-purple-100 text-purple-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const alertSeverityColors: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-800 border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
  LOW: 'bg-blue-100 text-blue-800 border-blue-200',
};

const appointmentStatusColors: Record<string, string> = {
  BOOKED: 'bg-teal-100 text-teal-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  ARRIVED: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-cyan-100 text-cyan-800',
  COMPLETED: 'bg-green-100 text-green-800',
  DNA: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [showNewAlertDialog, setShowNewAlertDialog] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    noteType: 'CONSULTATION',
    colorCode: '#03989E',
  });
  const [newAlert, setNewAlert] = useState({
    type: 'MEDICAL',
    severity: 'MEDIUM',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && patientId) {
      fetchPatientData();
    }
  }, [user, authLoading, patientId]);

  const fetchPatientData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch patient details
      const patientData = await patientsApi.getById(patientId);
      setPatient(patientData);

      // Fetch patient appointments
      const appointmentsData = await appointmentsApi.getAll({ patientId });
      setAppointments(appointmentsData.data || []);
    } catch (err) {
      console.error('Failed to fetch patient data:', err);
      setError('Failed to load patient details');
    } finally {
      setIsLoading(false);
    }
  };

  const getPatientAge = (dateOfBirth: string) => {
    try {
      return differenceInYears(new Date(), parseISO(dateOfBirth));
    } catch {
      return 0;
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'dd MMM yyyy');
    } catch {
      return date;
    }
  };

  const formatDateTime = (date: string) => {
    try {
      return format(parseISO(date), 'dd MMM yyyy, HH:mm');
    } catch {
      return date;
    }
  };

  const formatNhsNumber = (nhs?: string) => {
    if (!nhs) return 'Not recorded';
    const cleaned = nhs.replace(/\s/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return nhs;
  };

  const handleAddNote = () => {
    if (!newNote.title || !newNote.content) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      noteType: newNote.noteType,
      createdAt: new Date().toISOString(),
      createdBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      colorCode: newNote.colorCode,
    };

    setNotes([note, ...notes]);
    setNewNote({
      title: '',
      content: '',
      noteType: 'CONSULTATION',
      colorCode: '#03989E',
    });
    setShowNewNoteDialog(false);
  };

  const handleAddAlert = async () => {
    if (!newAlert.description) return;

    setIsSubmitting(true);
    try {
      const alert = await patientsApi.addAlert(patientId, newAlert);
      if (patient) {
        setPatient({
          ...patient,
          alerts: [...(patient.alerts || []), alert],
        });
      }
      setNewAlert({
        type: 'MEDICAL',
        severity: 'MEDIUM',
        description: '',
      });
      setShowNewAlertDialog(false);
    } catch (err) {
      console.error('Failed to add alert:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Patient not found'}
          </h2>
          <p className="text-gray-500 mb-4">
            The patient you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push('/patients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {patient.firstName[0]}{patient.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <Badge variant={patient.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {patient.status.toLowerCase()}
              </Badge>
            </div>
            <p className="text-gray-500">
              {getPatientAge(patient.dateOfBirth)} years old • {patient.gender} • NHS: {formatNhsNumber(patient.nhsNumber)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/appointments?patientId=${patientId}`)}>
            <Calendar className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
          <Button variant="outline" onClick={() => setShowNewNoteDialog(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Add Note
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Patient
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {patient.alerts && patient.alerts.length > 0 && (
        <div className="space-y-2">
          {patient.alerts.filter(a => a.isActive).map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${alertSeverityColors[alert.severity] || 'bg-gray-100'}`}
            >
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium">{alert.type}: </span>
                <span>{alert.description}</span>
              </div>
              <Badge variant="outline">{alert.severity}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{patient.phone || 'No phone recorded'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{patient.email || 'No email recorded'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p>{patient.addressLine1 || 'No address recorded'}</p>
                    {patient.city && <p>{patient.city}</p>}
                    {patient.postcode && <p>{patient.postcode}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registered GP</p>
                  <p className="font-medium">
                    {patient.registeredGp
                      ? `Dr. ${patient.registeredGp.firstName} ${patient.registeredGp.lastName}`
                      : 'Not assigned'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Alerts & Warnings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alerts & Warnings
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowNewAlertDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {patient.alerts && patient.alerts.filter(a => a.isActive).length > 0 ? (
                  <div className="space-y-2">
                    {patient.alerts.filter(a => a.isActive).map((alert) => (
                      <div key={alert.id} className="p-2 rounded border text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{alert.type}</span>
                          <Badge variant="outline" className="text-xs">{alert.severity}</Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No active alerts</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Notes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Notes
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowNewNoteDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.slice(0, 3).map((note) => (
                    <div key={note.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{note.title}</h4>
                          <Badge className={noteTypeColors[note.noteType] || 'bg-gray-100'}>
                            {note.noteType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{formatDateTime(note.createdAt)}</p>
                      </div>
                      <p className="text-gray-600 mt-2">{note.content}</p>
                      <p className="text-sm text-gray-400 mt-2">By {note.createdBy}</p>
                    </div>
                  ))}
                  {notes.length > 3 && (
                    <Button variant="link" className="w-full" onClick={() => setActiveTab('notes')}>
                      View all {notes.length} notes
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No notes recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Appointments
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push(`/appointments?patientId=${patientId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Clinician</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.slice(0, 5).map((appt) => (
                      <TableRow key={appt.id}>
                        <TableCell>{formatDateTime(appt.scheduledStart)}</TableCell>
                        <TableCell>{appt.appointmentType.replace(/_/g, ' ')}</TableCell>
                        <TableCell>
                          {appt.clinician
                            ? `Dr. ${appt.clinician.firstName} ${appt.clinician.lastName}`
                            : 'Not assigned'}
                        </TableCell>
                        <TableCell>
                          <Badge className={appointmentStatusColors[appt.status] || 'bg-gray-100'}>
                            {appt.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-4">No appointments recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Patient Notes</h2>
            <Button onClick={() => setShowNewNoteDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>

          {notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{note.title}</h4>
                          <Badge className={noteTypeColors[note.noteType] || 'bg-gray-100'}>
                            {note.noteType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{note.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                          <span>{formatDateTime(note.createdAt)}</span>
                          <span>By {note.createdBy}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notes recorded for this patient</p>
              <Button className="mt-4" onClick={() => setShowNewNoteDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Note
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Appointment History</h2>
            <Button onClick={() => router.push(`/appointments?patientId=${patientId}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>

          {appointments.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Clinician</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => (
                    <TableRow key={appt.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell>{formatDateTime(appt.scheduledStart)}</TableCell>
                      <TableCell>{appt.appointmentType.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        {appt.clinician
                          ? `Dr. ${appt.clinician.firstName} ${appt.clinician.lastName}`
                          : 'Not assigned'}
                      </TableCell>
                      <TableCell>{appt.room?.name || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{appt.reason || '-'}</TableCell>
                      <TableCell>
                        <Badge className={appointmentStatusColors[appt.status] || 'bg-gray-100'}>
                          {appt.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No appointments recorded for this patient</p>
              <Button className="mt-4" onClick={() => router.push(`/appointments?patientId=${patientId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Book First Appointment
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className="bg-white rounded-lg border p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No documents uploaded for this patient</p>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </TabsContent>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions">
          <div className="bg-white rounded-lg border p-8 text-center">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No prescriptions recorded for this patient</p>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Prescription
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Note Dialog */}
      <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Add a clinical note for {patient.firstName} {patient.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="noteTitle">Title *</Label>
                <Input
                  id="noteTitle"
                  placeholder="Note Title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noteType">Note Type *</Label>
                <Select
                  value={newNote.noteType}
                  onValueChange={(v) => setNewNote({ ...newNote, noteType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Note Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSULTATION">Consultation</SelectItem>
                    <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                    <SelectItem value="LAB_REVIEW">Lab Review</SelectItem>
                    <SelectItem value="REFERRAL">Referral</SelectItem>
                    <SelectItem value="PHONE_CALL">Phone Call</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="noteContent">Note Content *</Label>
              <Textarea
                id="noteContent"
                placeholder="Enter note content..."
                rows={6}
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="colorCode">Color Code</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="colorCode"
                  type="color"
                  className="w-12 h-10 p-1"
                  value={newNote.colorCode}
                  onChange={(e) => setNewNote({ ...newNote, colorCode: e.target.value })}
                />
                <Input
                  value={newNote.colorCode}
                  onChange={(e) => setNewNote({ ...newNote, colorCode: e.target.value })}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewNoteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={!newNote.title || !newNote.content}
            >
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Alert Dialog */}
      <Dialog open={showNewAlertDialog} onOpenChange={setShowNewAlertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Patient Alert</DialogTitle>
            <DialogDescription>
              Add an alert or warning for {patient.firstName} {patient.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alertType">Alert Type</Label>
                <Select
                  value={newAlert.type}
                  onValueChange={(v) => setNewAlert({ ...newAlert, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALLERGY">Allergy</SelectItem>
                    <SelectItem value="MEDICAL">Medical</SelectItem>
                    <SelectItem value="SAFEGUARDING">Safeguarding</SelectItem>
                    <SelectItem value="COMMUNICATION">Communication</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alertSeverity">Severity</Label>
                <Select
                  value={newAlert.severity}
                  onValueChange={(v) => setNewAlert({ ...newAlert, severity: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alertDescription">Description *</Label>
              <Textarea
                id="alertDescription"
                placeholder="Describe the alert..."
                rows={3}
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAlertDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAlert}
              disabled={isSubmitting || !newAlert.description}
            >
              {isSubmitting ? 'Adding...' : 'Add Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
