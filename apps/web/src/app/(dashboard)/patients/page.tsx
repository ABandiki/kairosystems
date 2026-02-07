'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, MoreVertical, AlertCircle, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { usePatients, useClinicians } from '@/hooks/use-api';
import { patientsApi, Patient, Staff } from '@/lib/api';
import { format, parseISO, differenceInYears } from 'date-fns';

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  );
}

function PatientsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  // Initialize search query from URL params
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('all');
  const [gpFilter, setGpFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Update search query when URL params change
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
      setPage(1);
    }
  }, [searchParams]);
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    email: '',
    phone: '',
    nhsNumber: '',
    addressLine1: '',
    city: '',
    postcode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clinicians } = useClinicians(!!user);
  const { data: patientsData, isLoading, error, refetch } = usePatients({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    registeredGpId: gpFilter !== 'all' ? gpFilter : undefined,
    page,
    pageSize: 20,
  }, !!user);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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

  const patients = patientsData?.data || [];
  const totalPatients = patientsData?.total || 0;
  const totalPages = patientsData?.totalPages || 1;

  const getPatientAge = (dateOfBirth: string) => {
    try {
      return differenceInYears(new Date(), parseISO(dateOfBirth));
    } catch {
      return 0;
    }
  };

  const formatDOB = (dateOfBirth: string) => {
    try {
      return format(parseISO(dateOfBirth), 'dd/MM/yyyy');
    } catch {
      return dateOfBirth;
    }
  };

  const formatNhsNumber = (nhs?: string) => {
    if (!nhs) return 'Not recorded';
    // Format as XXX XXX XXXX
    const cleaned = nhs.replace(/\s/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return nhs;
  };

  const getRegisteredGpName = (patient: Patient) => {
    if (patient.registeredGp) {
      return `Dr. ${patient.registeredGp.firstName} ${patient.registeredGp.lastName}`;
    }
    return 'Not assigned';
  };

  const handleCreatePatient = async () => {
    setIsSubmitting(true);
    try {
      await patientsApi.create({
        ...newPatient,
        status: 'ACTIVE',
      });
      setShowNewPatientDialog(false);
      setNewPatient({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'MALE',
        email: '',
        phone: '',
        nhsNumber: '',
        addressLine1: '',
        city: '',
        postcode: '',
      });
      refetch();
    } catch (err) {
      console.error('Failed to create patient:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500">Manage patient records</p>
        </div>
        <Button onClick={() => setShowNewPatientDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Register Patient
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, NHS number, or email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="DECEASED">Deceased</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gpFilter} onValueChange={(v) => { setGpFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Registered GP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All GPs</SelectItem>
              {clinicians?.map((clinician) => (
                <SelectItem key={clinician.id} value={clinician.id}>
                  Dr. {clinician.firstName} {clinician.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Patients table */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>NHS Number</TableHead>
                <TableHead>Age / Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Registered GP</TableHead>
                <TableHead>Appointments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </TableBody>
          </Table>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Failed to load patients</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              {searchQuery || statusFilter !== 'all' || gpFilter !== 'all'
                ? 'No patients match your filters'
                : 'No patients registered yet'}
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowNewPatientDialog(true)}>
              Register First Patient
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>NHS Number</TableHead>
                <TableHead>Age / Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Registered GP</TableHead>
                <TableHead>Appointments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/patients/${patient.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">DOB: {formatDOB(patient.dateOfBirth)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatNhsNumber(patient.nhsNumber)}
                  </TableCell>
                  <TableCell>
                    {getPatientAge(patient.dateOfBirth)} yrs / {patient.gender}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{patient.phone || 'No phone'}</p>
                      <p className="text-gray-500">{patient.email || 'No email'}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getRegisteredGpName(patient)}</TableCell>
                  <TableCell>{patient._count?.appointments || 0}</TableCell>
                  <TableCell>
                    <Badge variant={patient.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {patient.status.toLowerCase()}
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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/patients/${patient.id}`); }}>
                          View Patient
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/appointments?patientId=${patient.id}`); }}>
                          Book Appointment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          View Medical History
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Deactivate Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {!isLoading && !error && patients.length > 0 && (
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalPatients)} of {totalPatients} patients
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New Patient Dialog */}
      <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient's details to register them with the practice.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newPatient.firstName}
                  onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newPatient.dateOfBirth}
                  onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={newPatient.gender}
                  onValueChange={(v) => setNewPatient({ ...newPatient, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="NOT_STATED">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nhsNumber">NHS Number</Label>
              <Input
                id="nhsNumber"
                placeholder="123 456 7890"
                value={newPatient.nhsNumber}
                onChange={(e) => setNewPatient({ ...newPatient, nhsNumber: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address</Label>
              <Input
                id="addressLine1"
                value={newPatient.addressLine1}
                onChange={(e) => setNewPatient({ ...newPatient, addressLine1: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newPatient.city}
                  onChange={(e) => setNewPatient({ ...newPatient, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={newPatient.postcode}
                  onChange={(e) => setNewPatient({ ...newPatient, postcode: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPatientDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePatient}
              disabled={isSubmitting || !newPatient.firstName || !newPatient.lastName || !newPatient.dateOfBirth}
            >
              {isSubmitting ? 'Registering...' : 'Register Patient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Loading fallback for Suspense
function PatientsPageLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Export wrapper with Suspense for useSearchParams
export default function PatientsPageWrapper() {
  return (
    <Suspense fallback={<PatientsPageLoading />}>
      <PatientsPageContent />
    </Suspense>
  );
}
