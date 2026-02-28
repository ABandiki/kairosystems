'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useClinicians, usePatients, useAppointmentTypes, useRooms } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { appointmentsApi, Patient } from '@/lib/api';
import { format, setHours, setMinutes } from 'date-fns';

interface NewAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  preSelectedPatientId?: string;
}

const timeSlots = [
  '08:00', '08:15', '08:30', '08:45',
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30', '17:45',
  '18:00',
];

export function NewAppointmentDialog({
  open,
  onClose,
  preSelectedPatientId,
}: NewAppointmentDialogProps) {
  const { user, isLoading: authLoading } = useAuth();
  // Only fetch when auth is complete, user exists, and dialog is open
  const canFetch = !authLoading && !!user && open;
  const { data: clinicians } = useClinicians(canFetch);
  const { data: appointmentTypes } = useAppointmentTypes(canFetch);
  const { data: rooms } = useRooms(canFetch);

  // Patient search
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(!preSelectedPatientId);
  const { data: patientsData } = usePatients({
    search: patientSearch || undefined,
    pageSize: 5,
  }, canFetch);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [clinicianId, setClinicianId] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(10);
  const [reason, setReason] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load pre-selected patient
  useEffect(() => {
    if (preSelectedPatientId && patientsData?.data) {
      const patient = patientsData.data.find(p => p.id === preSelectedPatientId);
      if (patient) {
        setSelectedPatient(patient);
        setShowPatientSearch(false);
      }
    }
  }, [preSelectedPatientId, patientsData]);

  // Update duration when appointment type changes
  useEffect(() => {
    if (appointmentType && appointmentTypes) {
      const type = appointmentTypes.find(t => t.type === appointmentType);
      if (type) {
        setDuration(type.defaultDuration);
      }
    }
  }, [appointmentType, appointmentTypes]);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setPatientSearch('');
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setShowPatientSearch(true);
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !clinicianId || !appointmentType || !date || !time) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse date and time
      const [hours, minutes] = time.split(':').map(Number);
      let scheduledStart = new Date(date);
      scheduledStart = setHours(scheduledStart, hours);
      scheduledStart = setMinutes(scheduledStart, minutes);

      await appointmentsApi.create({
        patientId: selectedPatient.id,
        clinicianId,
        appointmentType,
        scheduledStart: scheduledStart.toISOString(),
        duration,
        reason: reason || undefined,
        roomId: roomId || undefined,
      });

      // Reset form and close
      setSelectedPatient(null);
      setClinicianId('');
      setAppointmentType('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setTime('09:00');
      setDuration(10);
      setReason('');
      setRoomId('');
      setIsUrgent(false);
      setShowPatientSearch(true);
      onClose();
    } catch (err) {
      console.error('Failed to create appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const patients = patientsData?.data || [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new appointment for a patient.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label>Patient *</Label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedPatient.patientNumber || 'Patient number not recorded'}
                    </p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleClearPatient}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients by name or patient number..."
                    className="pl-9"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                </div>
                {patientSearch && patients.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {patient.patientNumber || 'No patient number'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {patientSearch && patients.length === 0 && (
                  <p className="text-sm text-gray-500 p-2">No patients found</p>
                )}
              </div>
            )}
          </div>

          {/* Clinician and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinician">Clinician *</Label>
              <Select value={clinicianId} onValueChange={setClinicianId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clinician" />
                </SelectTrigger>
                <SelectContent>
                  {clinicians?.map((clinician) => (
                    <SelectItem key={clinician.id} value={clinician.id}>
                      {clinician.role.includes('GP') ? 'Dr. ' : ''}{clinician.firstName} {clinician.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type *</Label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes?.map((type) => (
                    <SelectItem key={type.type} value={type.type}>
                      {type.label || type.type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Room */}
          <div className="space-y-2">
            <Label htmlFor="room">Room</Label>
            <Select value={roomId} onValueChange={(v) => setRoomId(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select room (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No room assigned</SelectItem>
                {rooms?.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for appointment</Label>
            <Textarea
              id="reason"
              placeholder="Brief description of the appointment reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          {/* Urgent flag */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="urgent"
              checked={isUrgent}
              onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
            />
            <label htmlFor="urgent" className="text-sm cursor-pointer">
              Mark as urgent appointment
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedPatient || !clinicianId || !appointmentType}
          >
            {isSubmitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
