'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MoreVertical, Phone, Mail, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useStaff } from '@/hooks/use-api';
import { staffApi, Staff } from '@/lib/api';

const roleColors: Record<string, string> = {
  GP_PARTNER: 'bg-teal-100 text-teal-800',
  GP_SALARIED: 'bg-teal-100 text-teal-800',
  GP_REGISTRAR: 'bg-teal-100 text-teal-800',
  PRACTICE_NURSE: 'bg-emerald-100 text-emerald-800',
  HEALTHCARE_ASSISTANT: 'bg-amber-100 text-amber-800',
  RECEPTIONIST: 'bg-cyan-100 text-cyan-800',
  PRACTICE_MANAGER: 'bg-gray-100 text-gray-800',
  ADMIN: 'bg-gray-100 text-gray-800',
  PHARMACIST: 'bg-green-100 text-green-800',
};

const roleLabels: Record<string, string> = {
  GP_PARTNER: 'GP Partner',
  GP_SALARIED: 'Salaried GP',
  GP_REGISTRAR: 'GP Registrar',
  PRACTICE_NURSE: 'Practice Nurse',
  HEALTHCARE_ASSISTANT: 'Healthcare Assistant',
  RECEPTIONIST: 'Receptionist',
  PRACTICE_MANAGER: 'Practice Manager',
  ADMIN: 'Admin',
  PHARMACIST: 'Pharmacist',
};

function StaffCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

export default function StaffPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showNewStaffDialog, setShowNewStaffDialog] = useState(false);
  const [newStaff, setNewStaff] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'RECEPTIONIST',
    phone: '',
    gmcNumber: '',
    nmcNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: staffData, isLoading, error, refetch } = useStaff(
    roleFilter !== 'all' ? roleFilter : undefined,
    !!user
  );

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

  const staff = staffData || [];

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getDayAbbreviations = (workingHours?: Staff['workingHours']) => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const workingDays = new Set<number>();
    workingHours?.forEach(wh => {
      if (wh.isActive) {
        workingDays.add(wh.dayOfWeek);
      }
    });
    return days.map((day, index) => ({
      day,
      isWorking: workingDays.has(index),
    }));
  };

  const handleCreateStaff = async () => {
    setIsSubmitting(true);
    try {
      await staffApi.create({
        ...newStaff,
        isActive: true,
      });
      setShowNewStaffDialog(false);
      setNewStaff({
        email: '',
        firstName: '',
        lastName: '',
        role: 'RECEPTIONIST',
        phone: '',
        gmcNumber: '',
        nmcNumber: '',
      });
      refetch();
    } catch (err) {
      console.error('Failed to create staff member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">Manage practice staff and their schedules</p>
        </div>
        <Button onClick={() => setShowNewStaffDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="GP_PARTNER">GP Partner</SelectItem>
              <SelectItem value="GP_SALARIED">Salaried GP</SelectItem>
              <SelectItem value="GP_REGISTRAR">GP Registrar</SelectItem>
              <SelectItem value="PRACTICE_NURSE">Practice Nurse</SelectItem>
              <SelectItem value="HEALTHCARE_ASSISTANT">Healthcare Assistant</SelectItem>
              <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
              <SelectItem value="PRACTICE_MANAGER">Practice Manager</SelectItem>
              <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Staff grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StaffCardSkeleton />
          <StaffCardSkeleton />
          <StaffCardSkeleton />
          <StaffCardSkeleton />
          <StaffCardSkeleton />
          <StaffCardSkeleton />
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-3">Failed to load staff members</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            {searchQuery || roleFilter !== 'all'
              ? 'No staff members match your filters'
              : 'No staff members added yet'}
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowNewStaffDialog(true)}>
            Add First Staff Member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.firstName[0]}{member.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {member.role.includes('GP') ? 'Dr. ' : ''}{member.firstName} {member.lastName}
                      </CardTitle>
                      <Badge className={roleColors[member.role] || 'bg-gray-100 text-gray-800'} variant="secondary">
                        {roleLabels[member.role] || member.role.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>Manage Schedule</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.gmcNumber && (
                  <p className="text-sm text-gray-500">GMC: {member.gmcNumber}</p>
                )}
                {member.nmcNumber && (
                  <p className="text-sm text-gray-500">NMC: {member.nmcNumber}</p>
                )}
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-1">Working Days</p>
                  <div className="flex flex-wrap gap-1">
                    {getDayAbbreviations(member.workingHours).map(({ day, isWorking }, index) => (
                      <span
                        key={index}
                        className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                          isWorking
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                {!member.isActive && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Inactive
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Staff Dialog */}
      <Dialog open={showNewStaffDialog} onOpenChange={setShowNewStaffDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Add a new staff member to your practice.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newStaff.firstName}
                  onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newStaff.lastName}
                  onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={newStaff.role}
                onValueChange={(v) => setNewStaff({ ...newStaff, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GP_PARTNER">GP Partner</SelectItem>
                  <SelectItem value="GP_SALARIED">Salaried GP</SelectItem>
                  <SelectItem value="GP_REGISTRAR">GP Registrar</SelectItem>
                  <SelectItem value="PRACTICE_NURSE">Practice Nurse</SelectItem>
                  <SelectItem value="HEALTHCARE_ASSISTANT">Healthcare Assistant</SelectItem>
                  <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                  <SelectItem value="PRACTICE_MANAGER">Practice Manager</SelectItem>
                  <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              />
            </div>
            {(newStaff.role.includes('GP') || newStaff.role === 'PHARMACIST') && (
              <div className="space-y-2">
                <Label htmlFor="gmcNumber">GMC Number</Label>
                <Input
                  id="gmcNumber"
                  value={newStaff.gmcNumber}
                  onChange={(e) => setNewStaff({ ...newStaff, gmcNumber: e.target.value })}
                />
              </div>
            )}
            {newStaff.role === 'PRACTICE_NURSE' && (
              <div className="space-y-2">
                <Label htmlFor="nmcNumber">NMC Number</Label>
                <Input
                  id="nmcNumber"
                  value={newStaff.nmcNumber}
                  onChange={(e) => setNewStaff({ ...newStaff, nmcNumber: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewStaffDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateStaff}
              disabled={isSubmitting || !newStaff.firstName || !newStaff.lastName || !newStaff.email}
            >
              {isSubmitting ? 'Adding...' : 'Add Staff Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
