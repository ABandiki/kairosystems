'use client';

import { MoreVertical, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppointments } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { appointmentsApi, Appointment } from '@/lib/api';
import { format, parseISO, startOfDay, addDays, endOfDay } from 'date-fns';

interface AppointmentListViewProps {
  clinicianFilter?: string[];
  statusFilter?: string[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

const statusVariants: Record<string, 'booked' | 'confirmed' | 'arrived' | 'in-progress' | 'default'> = {
  SCHEDULED: 'booked',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'arrived',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'default',
  CANCELLED: 'default',
  DNA: 'default',
};

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Arrived',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DNA: 'DNA',
};

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  );
}

export function AppointmentListView({
  clinicianFilter,
  statusFilter,
  onAppointmentClick,
}: AppointmentListViewProps) {
  const { user, isLoading: authLoading } = useAuth();
  const today = startOfDay(new Date());
  const nextWeek = endOfDay(addDays(today, 7));

  // Only fetch when auth is complete and user exists
  const canFetch = !authLoading && !!user;

  const { data: appointmentsData, isLoading, error, refetch } = useAppointments({
    startDate: today.toISOString(),
    endDate: nextWeek.toISOString(),
    clinicianId: clinicianFilter?.length === 1 ? clinicianFilter[0] : undefined,
    status: statusFilter,
  }, canFetch);

  const appointments = appointmentsData?.data || [];

  const handleCheckIn = async (apt: Appointment) => {
    try {
      await appointmentsApi.checkIn(apt.id);
      refetch();
    } catch (err) {
      console.error('Failed to check in:', err);
    }
  };

  const handleStart = async (apt: Appointment) => {
    try {
      await appointmentsApi.start(apt.id);
      refetch();
    } catch (err) {
      console.error('Failed to start:', err);
    }
  };

  const handleComplete = async (apt: Appointment) => {
    try {
      await appointmentsApi.complete(apt.id);
      refetch();
    } catch (err) {
      console.error('Failed to complete:', err);
    }
  };

  const handleCancel = async (apt: Appointment) => {
    try {
      await appointmentsApi.cancel(apt.id);
      refetch();
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const getPatientName = (apt: Appointment) => {
    if (apt.patient) {
      return `${apt.patient.firstName} ${apt.patient.lastName}`;
    }
    return 'Unknown Patient';
  };

  const getPatientInitials = (apt: Appointment) => {
    if (apt.patient) {
      return `${apt.patient.firstName[0]}${apt.patient.lastName[0]}`;
    }
    return '??';
  };

  const getClinicianName = (apt: Appointment) => {
    if (apt.clinician) {
      const prefix = apt.clinician.role.includes('GP') ? 'Dr. ' : '';
      return `${prefix}${apt.clinician.firstName} ${apt.clinician.lastName}`;
    }
    return 'Unassigned';
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm text-gray-600 mb-3">Failed to load appointments</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!isLoading && appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Calendar className="h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm text-gray-600">No appointments found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-white">
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Clinician</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </>
          ) : (
            appointments.map((apt) => (
              <TableRow
                key={apt.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onAppointmentClick?.(apt)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {format(parseISO(apt.scheduledStart), 'EEE, MMM d')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(apt.scheduledStart), 'HH:mm')} - {format(parseISO(apt.scheduledEnd), 'HH:mm')}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getPatientInitials(apt)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getPatientName(apt)}</p>
                      {apt.isUrgent && (
                        <span className="text-xs text-red-600 font-medium">URGENT</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{apt.appointmentType.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500">{apt.duration} min</p>
                </TableCell>
                <TableCell className="text-sm">{getClinicianName(apt)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[apt.status] || 'default'}>
                    {statusLabels[apt.status] || apt.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {apt.status === 'SCHEDULED' && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCheckIn(apt); }}>
                          Mark as Arrived
                        </DropdownMenuItem>
                      )}
                      {apt.status === 'CHECKED_IN' && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStart(apt); }}>
                          Start Consultation
                        </DropdownMenuItem>
                      )}
                      {apt.status === 'IN_PROGRESS' && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleComplete(apt); }}>
                          Complete Consultation
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        View Patient
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        Edit Appointment
                      </DropdownMenuItem>
                      {['SCHEDULED', 'CONFIRMED'].includes(apt.status) && (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => { e.stopPropagation(); handleCancel(apt); }}
                        >
                          Cancel Appointment
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
