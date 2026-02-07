'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Filter, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarView } from '@/components/appointments/calendar-view';
import { AppointmentFilters } from '@/components/appointments/appointment-filters';
import { AppointmentListView } from '@/components/appointments/appointment-list-view';
import { NewAppointmentDialog } from '@/components/appointments/new-appointment-dialog';
import { useAuth } from '@/hooks/use-auth';
import { Appointment } from '@/lib/api';

function AppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [filters, setFilters] = useState<{
    clinicians: string[];
    types: string[];
    statuses: string[];
  }>({
    clinicians: [],
    types: [],
    statuses: [],
  });

  // Check for pre-selected patient from URL params
  const preSelectedPatientId = searchParams.get('patientId');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (preSelectedPatientId) {
      setShowNewAppointment(true);
    }
  }, [preSelectedPatientId]);

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    // Could open a detail dialog here
  };

  const handleNewAppointmentClose = () => {
    setShowNewAppointment(false);
    // Remove patient ID from URL if present
    if (preSelectedPatientId) {
      router.replace('/appointments');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage your practice appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <div className="flex border rounded-md">
            <Button
              type="button"
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('calendar')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button type="button" onClick={() => setShowNewAppointment(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Appointment
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <AppointmentFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onFiltersChange={handleFiltersChange}
        />
        <div className="flex-1 overflow-hidden">
          {viewMode === 'calendar' ? (
            <CalendarView
              clinicianFilter={filters.clinicians}
              statusFilter={filters.statuses}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : (
            <AppointmentListView
              clinicianFilter={filters.clinicians}
              statusFilter={filters.statuses}
              onAppointmentClick={handleAppointmentClick}
            />
          )}
        </div>
      </div>

      {/* New Appointment Dialog */}
      <NewAppointmentDialog
        open={showNewAppointment}
        onClose={handleNewAppointmentClose}
        preSelectedPatientId={preSelectedPatientId || undefined}
      />
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AppointmentsContent />
    </Suspense>
  );
}
