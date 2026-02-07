'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  getDay,
} from 'date-fns';
import { useAppointments } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { Appointment } from '@/lib/api';

interface CalendarViewProps {
  clinicianFilter?: string[];
  statusFilter?: string[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

// Must match AppointmentStatus enum in database schema
const statusColors: Record<string, string> = {
  BOOKED: 'bg-teal-100 border-l-teal-500 text-teal-800',
  CONFIRMED: 'bg-emerald-100 border-l-emerald-500 text-emerald-800',
  ARRIVED: 'bg-amber-100 border-l-amber-500 text-amber-800',
  IN_PROGRESS: 'bg-cyan-100 border-l-cyan-500 text-cyan-800',
  COMPLETED: 'bg-green-100 border-l-green-500 text-green-800',
  DNA: 'bg-red-100 border-l-red-500 text-red-800',
  CANCELLED: 'bg-gray-100 border-l-gray-400 text-gray-600',
};

export function CalendarView({ clinicianFilter, statusFilter, onAppointmentClick }: CalendarViewProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  // Calculate date ranges based on view
  const { startDate, endDate, displayDays } = useMemo(() => {
    let start: Date;
    let end: Date;
    let days: Date[];

    switch (view) {
      case 'day':
        start = startOfDay(currentDate);
        end = endOfDay(currentDate);
        days = [currentDate];
        break;
      case 'week':
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
        days = eachDayOfInterval({ start, end });
        break;
      case 'month':
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        // For month view, we need to include days from prev/next month to fill the grid
        const monthStart = startOfWeek(start, { weekStartsOn: 1 });
        const monthEnd = endOfWeek(end, { weekStartsOn: 1 });
        days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        break;
      default:
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
        days = eachDayOfInterval({ start, end });
    }

    return { startDate: start, endDate: end, displayDays: days };
  }, [currentDate, view]);

  // Only fetch when auth is complete and user exists
  const canFetch = !authLoading && !!user;

  // Fetch appointments for the current view range
  const { data: appointmentsData, isLoading, error, refetch } = useAppointments({
    startDate: startOfDay(startDate).toISOString(),
    endDate: endOfDay(endDate).toISOString(),
    clinicianId: clinicianFilter?.length === 1 ? clinicianFilter[0] : undefined,
    status: statusFilter,
  }, canFetch);

  const appointments = appointmentsData?.data || [];

  // Navigation functions
  const goToPrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Get the header title based on view
  const getHeaderTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
    }
  };

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach((apt) => {
      const dateKey = format(parseISO(apt.scheduledStart), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [appointments]);

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return appointmentsByDate[dateKey] || [];
  };

  const getAppointmentStyle = (scheduledStart: string, duration: number) => {
    const date = parseISO(scheduledStart);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = (hours - 8) * 60 + minutes;
    const top = (totalMinutes / 30) * 48;
    const height = (duration / 30) * 48;
    return { top: `${top}px`, height: `${Math.max(height, 24)}px` };
  };

  const getPatientName = (apt: Appointment) => {
    if (apt.patient) {
      return `${apt.patient.firstName} ${apt.patient.lastName}`;
    }
    return 'Unknown Patient';
  };

  // Only show error if not loading (prevents flash during view changes)
  if (error && !isLoading) {
    return (
      <div className="bg-white rounded-lg border h-full flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm text-gray-600 mb-3">Failed to load appointments</p>
        <p className="text-xs text-gray-400 mb-3">{error.message}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Month view component
  const renderMonthView = () => (
    <div className="flex-1 overflow-auto p-4">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {displayDays.map((day) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[100px] border rounded-lg p-2 cursor-pointer hover:bg-gray-50',
                !isCurrentMonth && 'bg-gray-50 text-gray-400',
                isToday && 'border-primary bg-primary/5'
              )}
              onClick={() => {
                setCurrentDate(day);
                setView('day');
              }}
            >
              <div className={cn(
                'text-sm font-medium mb-1',
                isToday && 'text-primary'
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      'text-xs p-1 rounded truncate cursor-pointer',
                      statusColors[apt.status] || 'bg-gray-100'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick?.(apt);
                    }}
                  >
                    {format(parseISO(apt.scheduledStart), 'HH:mm')} {getPatientName(apt)}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Day/Week view component
  const renderDayWeekView = () => {
    const columns = view === 'day' ? 2 : 8;
    const gridClass = view === 'day' ? 'grid-cols-2' : 'grid-cols-8';

    return (
      <div className="flex-1 overflow-auto">
        <div className={view === 'day' ? 'min-w-[400px]' : 'min-w-[800px]'}>
          {/* Day headers */}
          <div className={`grid ${gridClass} border-b sticky top-0 bg-white z-10`}>
            <div className="p-2 text-center text-xs text-gray-500 border-r">
              Time
            </div>
            {displayDays.map((day) => {
              const dayAppointments = getAppointmentsForDate(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-2 text-center border-r',
                    isSameDay(day, new Date()) && 'bg-primary/5'
                  )}
                >
                  <p className="text-xs text-gray-500">{format(day, 'EEE')}</p>
                  <p
                    className={cn(
                      'text-lg font-semibold',
                      isSameDay(day, new Date()) ? 'text-primary' : 'text-gray-900'
                    )}
                  >
                    {format(day, 'd')}
                  </p>
                  {dayAppointments.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {dayAppointments.length} appt{dayAppointments.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className={`grid ${gridClass}`}>
            {/* Time column */}
            <div className="border-r">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-12 border-b px-2 py-1 text-xs text-gray-500 text-right"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {displayDays.map((day) => {
              const dayAppointments = getAppointmentsForDate(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'border-r relative',
                    isSameDay(day, new Date()) && 'bg-primary/5'
                  )}
                >
                  {/* Grid lines */}
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="h-12 border-b hover:bg-gray-50 cursor-pointer"
                    />
                  ))}

                  {/* Appointments */}
                  <div className="absolute inset-0 pointer-events-none">
                    {dayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          'absolute left-1 right-1 p-1 rounded border-l-4 text-xs cursor-pointer pointer-events-auto hover:shadow-md transition-shadow overflow-hidden',
                          statusColors[apt.status] || 'bg-gray-100 border-l-gray-400'
                        )}
                        style={getAppointmentStyle(apt.scheduledStart, apt.duration)}
                        onClick={() => onAppointmentClick?.(apt)}
                      >
                        <p className="font-medium truncate">{getPatientName(apt)}</p>
                        <p className="text-[10px] opacity-75 truncate">
                          {format(parseISO(apt.scheduledStart), 'HH:mm')} - {apt.appointmentType.replace(/_/g, ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border h-full flex flex-col relative">
      {/* Calendar header */}
      <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button type="button" variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-base sm:text-lg font-semibold">
            {getHeaderTitle()}
          </h2>
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Month picker */}
          <input
            type="month"
            value={format(currentDate, 'yyyy-MM')}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-').map(Number);
              setCurrentDate(new Date(year, month - 1, 1));
            }}
            className="px-2 py-1 text-sm border rounded-md bg-white mr-2"
          />
          <Button
            type="button"
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
          >
            Day
          </Button>
          <Button
            type="button"
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            Week
          </Button>
          <Button
            type="button"
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Calendar content */}
      {view === 'month' ? renderMonthView() : renderDayWeekView()}
    </div>
  );
}
