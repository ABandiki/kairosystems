'use client';

import { useRouter } from 'next/navigation';
import { Clock, MoreVertical, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTodayAppointments } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { appointmentsApi, Appointment } from '@/lib/api';
import { format, parseISO } from 'date-fns';

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
  SCHEDULED: 'Booked',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Arrived',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DNA: 'DNA',
};

function AppointmentSkeleton() {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-center min-w-[60px]">
          <Skeleton className="h-6 w-12 mx-auto" />
          <Skeleton className="h-3 w-10 mx-auto mt-1" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

export function UpcomingAppointments() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  // Only fetch when auth is complete and user exists
  const canFetch = !authLoading && !!user;
  const { data: appointmentsData, isLoading, error, refetch } = useTodayAppointments(canFetch);
  const appointments = appointmentsData?.data || [];

  const handleCheckIn = async (appointment: Appointment) => {
    try {
      await appointmentsApi.checkIn(appointment.id);
      refetch();
    } catch (err) {
      console.error('Failed to check in:', err);
    }
  };

  const handleStart = async (appointment: Appointment) => {
    try {
      await appointmentsApi.start(appointment.id);
      refetch();
    } catch (err) {
      console.error('Failed to start:', err);
    }
  };

  const handleComplete = async (appointment: Appointment) => {
    try {
      await appointmentsApi.complete(appointment.id);
      refetch();
    } catch (err) {
      console.error('Failed to complete:', err);
    }
  };

  const handleCancel = async (appointment: Appointment) => {
    try {
      await appointmentsApi.cancel(appointment.id);
      refetch();
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const getPatientInitials = (appointment: Appointment) => {
    if (appointment.patient) {
      return `${appointment.patient.firstName[0]}${appointment.patient.lastName[0]}`;
    }
    return '??';
  };

  const getPatientName = (appointment: Appointment) => {
    if (appointment.patient) {
      return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    }
    return 'Unknown Patient';
  };

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Today's Appointments</h3>
        <p className="text-sm text-gray-500">Your upcoming appointments for today</p>
      </div>

      {isLoading ? (
        <div className="divide-y">
          <AppointmentSkeleton />
          <AppointmentSkeleton />
          <AppointmentSkeleton />
          <AppointmentSkeleton />
          <AppointmentSkeleton />
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Failed to load appointments</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-8 text-center">
          <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">No appointments scheduled for today</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push('/appointments')}>
            View All Appointments
          </Button>
        </div>
      ) : (
        <div className="divide-y">
          {appointments.slice(0, 8).map((appointment) => (
            <div
              key={appointment.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[60px]">
                  <p className="text-lg font-semibold text-gray-900">
                    {format(parseISO(appointment.scheduledStart), 'HH:mm')}
                  </p>
                  <p className="text-xs text-gray-500">{appointment.duration} min</p>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getPatientInitials(appointment)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{getPatientName(appointment)}</p>
                  <p className="text-sm text-gray-500">
                    {appointment.appointmentType.replace(/_/g, ' ')}
                    {appointment.isUrgent && (
                      <span className="ml-2 text-red-600 font-medium">URGENT</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariants[appointment.status] || 'default'}>
                  {statusLabels[appointment.status] || appointment.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {appointment.status === 'SCHEDULED' && (
                      <DropdownMenuItem onClick={() => handleCheckIn(appointment)}>
                        Mark as Arrived
                      </DropdownMenuItem>
                    )}
                    {appointment.status === 'CHECKED_IN' && (
                      <DropdownMenuItem onClick={() => handleStart(appointment)}>
                        Start Consultation
                      </DropdownMenuItem>
                    )}
                    {appointment.status === 'IN_PROGRESS' && (
                      <DropdownMenuItem onClick={() => handleComplete(appointment)}>
                        Complete Consultation
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => router.push(`/patients/${appointment.patientId}`)}>
                      View Patient
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Appointment</DropdownMenuItem>
                    {['SCHEDULED', 'CONFIRMED'].includes(appointment.status) && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleCancel(appointment)}
                      >
                        Cancel Appointment
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" onClick={() => router.push('/appointments')}>
          View All Appointments
        </Button>
      </div>
    </div>
  );
}
