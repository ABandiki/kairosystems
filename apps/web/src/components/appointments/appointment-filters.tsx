'use client';

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useClinicians, useAppointmentTypes } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';

interface AppointmentFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange?: (filters: {
    clinicians: string[];
    types: string[];
    statuses: string[];
  }) => void;
}

// Must match AppointmentStatus enum in database schema
const defaultStatuses = [
  { id: 'BOOKED', label: 'Booked', checked: true },
  { id: 'CONFIRMED', label: 'Confirmed', checked: true },
  { id: 'ARRIVED', label: 'Arrived', checked: true },
  { id: 'IN_PROGRESS', label: 'In Progress', checked: true },
  { id: 'COMPLETED', label: 'Completed', checked: false },
  { id: 'DNA', label: 'DNA', checked: false },
  { id: 'CANCELLED', label: 'Cancelled', checked: false },
];

const defaultAppointmentTypes = [
  { id: 'GP_CONSULTATION', label: 'GP Consultation', checked: true },
  { id: 'GP_TELEPHONE', label: 'Telephone Consultation', checked: true },
  { id: 'GP_VIDEO', label: 'Video Consultation', checked: true },
  { id: 'NURSE_APPOINTMENT', label: 'Nurse Appointment', checked: true },
  { id: 'BLOOD_TEST', label: 'Blood Test', checked: true },
  { id: 'VACCINATION', label: 'Vaccination', checked: true },
];

export function AppointmentFilters({ isOpen, onClose, onFiltersChange }: AppointmentFiltersProps) {
  const { user, isLoading: authLoading } = useAuth();
  // Only fetch when auth is complete and user exists
  const canFetch = !authLoading && !!user;
  const { data: cliniciansData, isLoading: cliniciansLoading } = useClinicians(canFetch);
  const { data: appointmentTypesData, isLoading: typesLoading } = useAppointmentTypes(canFetch);

  const [selectedClinicians, setSelectedClinicians] = useState<Record<string, boolean>>({});
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>(() => {
    const types: Record<string, boolean> = {};
    defaultAppointmentTypes.forEach(t => { types[t.id] = t.checked; });
    return types;
  });
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, boolean>>(() => {
    const statuses: Record<string, boolean> = {};
    defaultStatuses.forEach(s => { statuses[s.id] = s.checked; });
    return statuses;
  });

  // Initialize clinicians when data is loaded
  useEffect(() => {
    if (cliniciansData && Object.keys(selectedClinicians).length === 0) {
      const clinicians: Record<string, boolean> = {};
      cliniciansData.forEach(c => { clinicians[c.id] = true; });
      setSelectedClinicians(clinicians);
    }
  }, [cliniciansData]);

  // Update appointment types when data is loaded
  useEffect(() => {
    if (appointmentTypesData && appointmentTypesData.length > 0) {
      const types: Record<string, boolean> = {};
      appointmentTypesData.forEach(t => { types[t.type] = true; });
      setSelectedTypes(types);
    }
  }, [appointmentTypesData]);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange?.({
      clinicians: Object.entries(selectedClinicians).filter(([, v]) => v).map(([k]) => k),
      types: Object.entries(selectedTypes).filter(([, v]) => v).map(([k]) => k),
      statuses: Object.entries(selectedStatuses).filter(([, v]) => v).map(([k]) => k),
    });
  }, [selectedClinicians, selectedTypes, selectedStatuses, onFiltersChange]);

  const toggleClinician = (id: string) => {
    setSelectedClinicians(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleType = (id: string) => {
    setSelectedTypes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStatus = (id: string) => {
    setSelectedStatuses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAllClinicians = () => {
    const clinicians: Record<string, boolean> = {};
    cliniciansData?.forEach(c => { clinicians[c.id] = true; });
    setSelectedClinicians(clinicians);
  };

  const clearAllClinicians = () => {
    setSelectedClinicians({});
  };

  if (!isOpen) return null;

  // Use API data if available, otherwise fall back to defaults
  const appointmentTypes = appointmentTypesData && appointmentTypesData.length > 0
    ? appointmentTypesData.map(t => ({ id: t.type, label: t.label || t.type.replace(/_/g, ' ') }))
    : defaultAppointmentTypes;

  return (
    <div className="w-64 border-r bg-white h-full overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Clinicians */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs font-semibold text-gray-500 uppercase">
            Clinicians
          </Label>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto py-0 px-1 text-xs"
              onClick={selectAllClinicians}
            >
              All
            </Button>
            <span className="text-gray-300">|</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto py-0 px-1 text-xs"
              onClick={clearAllClinicians}
            >
              None
            </Button>
          </div>
        </div>
        {cliniciansLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {cliniciansData?.map((clinician) => (
              <div key={clinician.id} className="flex items-center gap-2">
                <Checkbox
                  id={`clinician-${clinician.id}`}
                  checked={selectedClinicians[clinician.id] || false}
                  onCheckedChange={() => toggleClinician(clinician.id)}
                />
                <label
                  htmlFor={`clinician-${clinician.id}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {clinician.role.includes('GP') ? 'Dr. ' : ''}{clinician.firstName} {clinician.lastName}
                </label>
              </div>
            ))}
            {!cliniciansData?.length && (
              <p className="text-xs text-gray-500">No clinicians found</p>
            )}
          </div>
        )}
      </div>

      {/* Appointment Types */}
      <div className="p-4 border-b">
        <Label className="text-xs font-semibold text-gray-500 uppercase mb-3 block">
          Appointment Types
        </Label>
        {typesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {appointmentTypes.map((type) => (
              <div key={type.id} className="flex items-center gap-2">
                <Checkbox
                  id={`type-${type.id}`}
                  checked={selectedTypes[type.id] || false}
                  onCheckedChange={() => toggleType(type.id)}
                />
                <label
                  htmlFor={`type-${type.id}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="p-4">
        <Label className="text-xs font-semibold text-gray-500 uppercase mb-3 block">
          Status
        </Label>
        <div className="space-y-2">
          {defaultStatuses.map((status) => (
            <div key={status.id} className="flex items-center gap-2">
              <Checkbox
                id={`status-${status.id}`}
                checked={selectedStatuses[status.id] || false}
                onCheckedChange={() => toggleStatus(status.id)}
              />
              <label
                htmlFor={`status-${status.id}`}
                className="text-sm text-gray-700 cursor-pointer"
              >
                {status.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
