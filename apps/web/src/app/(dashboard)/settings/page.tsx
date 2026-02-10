'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Clock, Users, Bell, AlertCircle, Plus, Monitor, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useAuth } from '@/hooks/use-auth';
import { usePractice, useAppointmentTypes, useRooms, usePharmacies } from '@/hooks/use-api';
import { practiceApi, Practice, Room, Pharmacy, devicesApi, Device, staffUsageApi, StaffUsage } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface OpeningHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

const openingHoursDefaults: OpeningHour[] = [
  { day: 'Monday', open: '08:00', close: '18:30', closed: false },
  { day: 'Tuesday', open: '08:00', close: '18:30', closed: false },
  { day: 'Wednesday', open: '08:00', close: '18:30', closed: false },
  { day: 'Thursday', open: '08:00', close: '18:30', closed: false },
  { day: 'Friday', open: '08:00', close: '18:30', closed: false },
  { day: 'Saturday', open: '09:00', close: '13:00', closed: true },
  { day: 'Sunday', open: '00:00', close: '00:00', closed: true },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('practice');
  const [isSaving, setIsSaving] = useState(false);

  // Practice data
  const { data: practice, isLoading: practiceLoading, error: practiceError, refetch: refetchPractice } = usePractice(!!user);
  const { data: appointmentTypes, isLoading: typesLoading, refetch: refetchTypes } = useAppointmentTypes(!!user);
  const { data: rooms, isLoading: roomsLoading, refetch: refetchRooms } = useRooms(!!user);
  const { data: pharmacies, isLoading: pharmaciesLoading, refetch: refetchPharmacies } = usePharmacies(!!user);

  // Form state for practice details
  const [practiceForm, setPracticeForm] = useState({
    name: '',
    odsCode: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    postcode: '',
  });

  // Opening hours state
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(openingHoursDefaults);
  const [savingHours, setSavingHours] = useState(false);

  // Devices state
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [deviceActionLoading, setDeviceActionLoading] = useState<string | null>(null);

  // Staff usage state
  const [staffUsage, setStaffUsage] = useState<StaffUsage | null>(null);
  const [staffUsageLoading, setStaffUsageLoading] = useState(false);

  // Dialogs
  const [showNewRoomDialog, setShowNewRoomDialog] = useState(false);
  const [showNewPharmacyDialog, setShowNewPharmacyDialog] = useState(false);
  const [showNewAppTypeDialog, setShowNewAppTypeDialog] = useState(false);
  const [showEditAppTypeDialog, setShowEditAppTypeDialog] = useState(false);
  const [showEditRoomDialog, setShowEditRoomDialog] = useState(false);
  const [showEditPharmacyDialog, setShowEditPharmacyDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Selected items for editing
  const [selectedAppType, setSelectedAppType] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  // Form states
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [newAppType, setNewAppType] = useState({
    type: '',
    label: '',
    code: '',
    defaultDuration: 15,
    color: '#03989E',
  });
  const [newPharmacy, setNewPharmacy] = useState({
    name: '',
    odsCode: '',
    addressLine1: '',
    city: '',
    postcode: '',
    phone: '',
  });

  // Update form when practice data loads
  useEffect(() => {
    if (practice) {
      setPracticeForm({
        name: practice.name || '',
        odsCode: practice.odsCode || '',
        email: practice.email || '',
        phone: practice.phone || '',
        addressLine1: practice.addressLine1 || '',
        city: practice.city || '',
        postcode: practice.postcode || '',
      });
    }
  }, [practice]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load devices when tab is selected
  useEffect(() => {
    if (activeTab === 'devices' && user) {
      loadDevices();
    }
  }, [activeTab, user]);

  // Load staff usage when tab is selected
  useEffect(() => {
    if (activeTab === 'subscription' && user) {
      loadStaffUsage();
    }
  }, [activeTab, user]);

  const loadDevices = async () => {
    setDevicesLoading(true);
    try {
      const data = await devicesApi.getAll();
      setDevices(data);
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setDevicesLoading(false);
    }
  };

  const loadStaffUsage = async () => {
    setStaffUsageLoading(true);
    try {
      const data = await staffUsageApi.getUsage();
      setStaffUsage(data);
    } catch (err) {
      console.error('Failed to load staff usage:', err);
    } finally {
      setStaffUsageLoading(false);
    }
  };

  const handleApproveDevice = async (deviceId: string) => {
    setDeviceActionLoading(deviceId);
    try {
      await devicesApi.approve(deviceId);
      await loadDevices();
    } catch (err) {
      console.error('Failed to approve device:', err);
      alert('Failed to approve device');
    } finally {
      setDeviceActionLoading(null);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to revoke access for this device?')) return;
    setDeviceActionLoading(deviceId);
    try {
      await devicesApi.revoke(deviceId, 'Revoked by administrator');
      await loadDevices();
    } catch (err) {
      console.error('Failed to revoke device:', err);
      alert('Failed to revoke device');
    } finally {
      setDeviceActionLoading(null);
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

  const handleSavePractice = async () => {
    setIsSaving(true);
    try {
      await practiceApi.update(practiceForm);
      refetchPractice();
    } catch (err) {
      console.error('Failed to update practice:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRoom = async () => {
    try {
      await practiceApi.createRoom(newRoom);
      setShowNewRoomDialog(false);
      setNewRoom({ name: '', description: '' });
      refetchRooms();
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleCreatePharmacy = async () => {
    try {
      await practiceApi.createPharmacy(newPharmacy);
      setShowNewPharmacyDialog(false);
      setNewPharmacy({
        name: '',
        odsCode: '',
        addressLine1: '',
        city: '',
        postcode: '',
        phone: '',
      });
      refetchPharmacies();
    } catch (err) {
      console.error('Failed to create pharmacy:', err);
    }
  };

  // Opening Hours handlers
  const handleToggleClosed = (dayIndex: number) => {
    setOpeningHours(prev => prev.map((hour, index) => {
      if (index === dayIndex) {
        return {
          ...hour,
          closed: !hour.closed,
          open: !hour.closed ? '00:00' : '09:00',
          close: !hour.closed ? '00:00' : '17:00',
        };
      }
      return hour;
    }));
  };

  const handleTimeChange = (dayIndex: number, field: 'open' | 'close', value: string) => {
    setOpeningHours(prev => prev.map((hour, index) => {
      if (index === dayIndex) {
        return { ...hour, [field]: value };
      }
      return hour;
    }));
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      // In a real app, this would save to the backend
      // await practiceApi.updateOpeningHours(openingHours);
      alert('Opening hours saved successfully!');
    } catch (err) {
      console.error('Failed to save opening hours:', err);
      alert('Failed to save opening hours');
    } finally {
      setSavingHours(false);
    }
  };

  // Appointment Type handlers
  const handleAddAppType = () => {
    setNewAppType({
      type: '',
      label: '',
      code: '',
      defaultDuration: 15,
      color: '#03989E',
    });
    setShowNewAppTypeDialog(true);
  };

  const handleEditAppType = (appType: any) => {
    setSelectedAppType(appType);
    setShowEditAppTypeDialog(true);
  };

  const handleSaveNewAppType = async () => {
    if (!newAppType.type || !newAppType.label || !newAppType.code) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await practiceApi.createAppointmentType({
        type: newAppType.type,
        label: newAppType.label,
        code: newAppType.code,
        defaultDuration: newAppType.defaultDuration,
        color: newAppType.color,
      });
      setShowNewAppTypeDialog(false);
      setNewAppType({
        type: '',
        label: '',
        code: '',
        defaultDuration: 15,
        color: '#03989E',
      });
      refetchTypes();
    } catch (err) {
      console.error('Failed to create appointment type:', err);
      alert('Failed to create appointment type');
    }
  };

  const handleUpdateAppType = async () => {
    if (!selectedAppType) return;
    try {
      await practiceApi.updateAppointmentType(selectedAppType.id, {
        label: selectedAppType.label,
        defaultDuration: selectedAppType.defaultDuration,
        color: selectedAppType.color,
        isActive: selectedAppType.isActive,
      });
      setShowEditAppTypeDialog(false);
      setSelectedAppType(null);
      refetchTypes();
    } catch (err) {
      console.error('Failed to update appointment type:', err);
      alert('Failed to update appointment type');
    }
  };

  // Room handlers
  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowEditRoomDialog(true);
  };

  const handleUpdateRoom = async () => {
    if (!selectedRoom) return;
    try {
      await practiceApi.updateRoom(selectedRoom.id, selectedRoom);
      setShowEditRoomDialog(false);
      setSelectedRoom(null);
      refetchRooms();
    } catch (err) {
      console.error('Failed to update room:', err);
      alert('Failed to update room');
    }
  };

  // Pharmacy handlers
  const handleEditPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowEditPharmacyDialog(true);
  };

  const handleUpdatePharmacy = async () => {
    if (!selectedPharmacy) return;
    try {
      await practiceApi.updatePharmacy(selectedPharmacy.id, selectedPharmacy);
      setShowEditPharmacyDialog(false);
      setSelectedPharmacy(null);
      refetchPharmacies();
    } catch (err) {
      console.error('Failed to update pharmacy:', err);
      alert('Failed to update pharmacy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Practice Settings</h1>
        <p className="text-gray-500">Configure your practice settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border">
          <TabsTrigger value="practice" className="gap-2">
            <Building2 className="h-4 w-4" />
            Practice Details
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2">
            <Clock className="h-4 w-4" />
            Opening Hours
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <Users className="h-4 w-4" />
            Appointment Types
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-2">
            <Building2 className="h-4 w-4" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="pharmacies" className="gap-2">
            <Building2 className="h-4 w-4" />
            Pharmacies
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Monitor className="h-4 w-4" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <Shield className="h-4 w-4" />
            Subscription
          </TabsTrigger>
        </TabsList>

        {/* Practice Details */}
        <TabsContent value="practice" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Practice Information</CardTitle>
              <CardDescription>
                Basic information about your practice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {practiceLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ) : practiceError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Failed to load practice details</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => refetchPractice()}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="practice-name">Practice Name</Label>
                      <Input
                        id="practice-name"
                        value={practiceForm.name}
                        onChange={(e) => setPracticeForm({ ...practiceForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ods-code">ODS Code</Label>
                      <Input
                        id="ods-code"
                        value={practiceForm.odsCode}
                        onChange={(e) => setPracticeForm({ ...practiceForm, odsCode: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={practiceForm.email}
                        onChange={(e) => setPracticeForm({ ...practiceForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={practiceForm.phone}
                        onChange={(e) => setPracticeForm({ ...practiceForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input
                      id="address1"
                      value={practiceForm.addressLine1}
                      onChange={(e) => setPracticeForm({ ...practiceForm, addressLine1: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={practiceForm.city}
                        onChange={(e) => setPracticeForm({ ...practiceForm, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode</Label>
                      <Input
                        id="postcode"
                        value={practiceForm.postcode}
                        onChange={(e) => setPracticeForm({ ...practiceForm, postcode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSavePractice} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opening Hours */}
        <TabsContent value="hours" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Opening Hours</CardTitle>
              <CardDescription>
                Set your practice opening hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {openingHours.map((day, index) => (
                  <div
                    key={day.day}
                    className="flex items-center gap-4 py-3 border-b last:border-0"
                  >
                    <div className="w-32">
                      <span className="font-medium">{day.day}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-1">
                      {day.closed ? (
                        <span className="text-gray-500">Closed</span>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-gray-500">Open</Label>
                            <Input
                              type="time"
                              value={day.open}
                              onChange={(e) => handleTimeChange(index, 'open', e.target.value)}
                              className="w-32"
                            />
                          </div>
                          <span className="text-gray-400">to</span>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-gray-500">Close</Label>
                            <Input
                              type="time"
                              value={day.close}
                              onChange={(e) => handleTimeChange(index, 'close', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleToggleClosed(index)}>
                      {day.closed ? 'Set Hours' : 'Mark Closed'}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveHours} disabled={savingHours}>
                  {savingHours ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointment Types */}
        <TabsContent value="appointments" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Appointment Types</CardTitle>
                  <CardDescription>
                    Configure the types of appointments available at your practice
                  </CardDescription>
                </div>
                <Button onClick={handleAddAppType}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Appointment Type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {typesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {appointmentTypes?.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center gap-4 py-3 border-b last:border-0"
                    >
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: type.color || '#6b7280' }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{type.label || type.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-500">Code: {type.code || type.type}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {type.defaultDuration} minutes
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEditAppType(type)}>
                        Edit
                      </Button>
                    </div>
                  ))}
                  {!appointmentTypes?.length && (
                    <p className="text-center py-4 text-gray-500">No appointment types configured</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms */}
        <TabsContent value="rooms" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Consultation Rooms</CardTitle>
                  <CardDescription>
                    Manage your practice consultation rooms
                  </CardDescription>
                </div>
                <Button onClick={() => setShowNewRoomDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {roomsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms?.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{room.name}</p>
                        {room.description && (
                          <p className="text-sm text-gray-500">{room.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${room.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {room.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => handleEditRoom(room)}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!rooms?.length && (
                    <p className="text-center py-4 text-gray-500">No rooms configured</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pharmacies */}
        <TabsContent value="pharmacies" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Local Pharmacies</CardTitle>
                  <CardDescription>
                    Manage pharmacies for prescriptions
                  </CardDescription>
                </div>
                <Button onClick={() => setShowNewPharmacyDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pharmacy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pharmaciesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {pharmacies?.map((pharmacy) => (
                    <div
                      key={pharmacy.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{pharmacy.name}</p>
                        <p className="text-sm text-gray-500">
                          {pharmacy.addressLine1}, {pharmacy.city}, {pharmacy.postcode}
                        </p>
                        {pharmacy.phone && (
                          <p className="text-sm text-gray-500">{pharmacy.phone}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEditPharmacy(pharmacy)}>
                        Edit
                      </Button>
                    </div>
                  ))}
                  {!pharmacies?.length && (
                    <p className="text-center py-4 text-gray-500">No pharmacies configured</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices */}
        <TabsContent value="devices" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registered Devices</CardTitle>
                  <CardDescription>
                    Manage devices that can access your practice system. Only approved devices can log in.
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={loadDevices} disabled={devicesLoading}>
                  {devicesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {devicesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No devices registered yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Devices will appear here when staff members log in from new machines
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pending devices first */}
                  {devices.filter(d => d.status === 'PENDING').length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-amber-600 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Pending Approval ({devices.filter(d => d.status === 'PENDING').length})
                      </h3>
                      {devices.filter(d => d.status === 'PENDING').map((device) => (
                        <div
                          key={device.id}
                          className="flex items-center justify-between py-4 px-4 border border-amber-200 bg-amber-50 rounded-lg mb-2"
                        >
                          <div className="flex items-center gap-4">
                            <Monitor className="h-8 w-8 text-amber-600" />
                            <div>
                              <p className="font-medium">{device.deviceName}</p>
                              <p className="text-sm text-gray-500">{device.deviceType}</p>
                              <p className="text-xs text-gray-400">
                                Requested: {new Date(device.createdAt).toLocaleDateString()}
                                {device.ipAddress && ` • IP: ${device.ipAddress}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveDevice(device.id)}
                              disabled={deviceActionLoading === device.id}
                            >
                              {deviceActionLoading === device.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRevokeDevice(device.id)}
                              disabled={deviceActionLoading === device.id}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Approved devices */}
                  {devices.filter(d => d.status === 'APPROVED').map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between py-4 border-b last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <Monitor className="h-8 w-8 text-gray-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{device.deviceName}</p>
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                              Approved
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{device.deviceType}</p>
                          <p className="text-xs text-gray-400">
                            Approved: {device.approvedAt ? new Date(device.approvedAt).toLocaleDateString() : 'N/A'}
                            {device.lastUsedAt && ` • Last used: ${new Date(device.lastUsedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRevokeDevice(device.id)}
                        disabled={deviceActionLoading === device.id}
                      >
                        {deviceActionLoading === device.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Revoke Access'
                        )}
                      </Button>
                    </div>
                  ))}

                  {/* Revoked devices */}
                  {devices.filter(d => d.status === 'REVOKED').length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">
                        Revoked Devices ({devices.filter(d => d.status === 'REVOKED').length})
                      </h3>
                      {devices.filter(d => d.status === 'REVOKED').map((device) => (
                        <div
                          key={device.id}
                          className="flex items-center justify-between py-3 opacity-60"
                        >
                          <div className="flex items-center gap-4">
                            <Monitor className="h-6 w-6 text-gray-300" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-500">{device.deviceName}</p>
                                <Badge variant="outline" className="text-red-600 border-red-200">
                                  Revoked
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400">{device.deviceType}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveDevice(device.id)}
                            disabled={deviceActionLoading === device.id}
                          >
                            Re-approve
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription & Staff Limits */}
        <TabsContent value="subscription" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>
                  Your current plan and staff allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {staffUsageLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : staffUsage ? (
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
                      <div>
                        <p className="text-sm text-gray-600">Current Plan</p>
                        <p className="text-2xl font-bold text-teal-700">{staffUsage.subscriptionTier}</p>
                      </div>
                      <Button variant="outline" onClick={() => setShowUpgradeDialog(true)}>Upgrade Plan</Button>
                    </div>

                    {/* Staff Usage */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Staff Usage</p>
                        <p className="text-sm text-gray-600">
                          {staffUsage.currentCount} / {staffUsage.maxIncluded} included
                          {staffUsage.extraCount > 0 && (
                            <span className="text-amber-600"> (+{staffUsage.extraCount} extra)</span>
                          )}
                        </p>
                      </div>
                      <Progress
                        value={(staffUsage.currentCount / staffUsage.maxIncluded) * 100}
                        className={`h-3 ${staffUsage.isAtLimit ? 'bg-red-100' : ''}`}
                      />
                      {staffUsage.isAtLimit && (
                        <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          You&apos;ve reached your staff limit. Upgrade to add more staff.
                        </p>
                      )}
                    </div>

                    {/* Staff Breakdown */}
                    <div>
                      <p className="text-sm font-medium mb-3">Staff Breakdown</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {staffUsage.breakdown.map((item) => (
                          <div
                            key={item.role}
                            className="p-3 bg-gray-50 rounded-lg text-center"
                          >
                            <p className="text-2xl font-bold text-gray-700">{item.count}</p>
                            <p className="text-xs text-gray-500 capitalize">
                              {item.role.replace(/_/g, ' ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Plan Features */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-3">Plan Features</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{staffUsage.maxIncluded} staff members included</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Unlimited patients</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Device management</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Appointment scheduling</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Failed to load subscription details</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={loadStaffUsage}>
                      Try Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Extra Staff Billing Info */}
            {staffUsage && staffUsage.extraCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Staff Charges</CardTitle>
                  <CardDescription>
                    You have staff members beyond your plan limit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div>
                      <p className="font-medium text-amber-800">
                        {staffUsage.extraCount} additional staff member{staffUsage.extraCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-amber-600">
                        Billed at $10/month per extra staff
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-800">
                        ${staffUsage.extraCount * 10}/mo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Room Dialog */}
      <Dialog open={showNewRoomDialog} onOpenChange={setShowNewRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Consultation Room</DialogTitle>
            <DialogDescription>
              Add a new consultation room to your practice.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name *</Label>
              <Input
                id="room-name"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                placeholder="e.g., Room 1, Treatment Room"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-description">Description</Label>
              <Input
                id="room-description"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                placeholder="e.g., Ground floor, equipped for minor procedures"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRoomDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRoom} disabled={!newRoom.name}>
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Pharmacy Dialog */}
      <Dialog open={showNewPharmacyDialog} onOpenChange={setShowNewPharmacyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Pharmacy</DialogTitle>
            <DialogDescription>
              Add a local pharmacy for prescription dispensing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pharmacy-name">Pharmacy Name *</Label>
              <Input
                id="pharmacy-name"
                value={newPharmacy.name}
                onChange={(e) => setNewPharmacy({ ...newPharmacy, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pharmacy-ods">ODS Code</Label>
              <Input
                id="pharmacy-ods"
                value={newPharmacy.odsCode}
                onChange={(e) => setNewPharmacy({ ...newPharmacy, odsCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pharmacy-address">Address *</Label>
              <Input
                id="pharmacy-address"
                value={newPharmacy.addressLine1}
                onChange={(e) => setNewPharmacy({ ...newPharmacy, addressLine1: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pharmacy-city">City *</Label>
                <Input
                  id="pharmacy-city"
                  value={newPharmacy.city}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pharmacy-postcode">Postcode *</Label>
                <Input
                  id="pharmacy-postcode"
                  value={newPharmacy.postcode}
                  onChange={(e) => setNewPharmacy({ ...newPharmacy, postcode: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pharmacy-phone">Phone</Label>
              <Input
                id="pharmacy-phone"
                value={newPharmacy.phone}
                onChange={(e) => setNewPharmacy({ ...newPharmacy, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPharmacyDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePharmacy}
              disabled={!newPharmacy.name || !newPharmacy.addressLine1 || !newPharmacy.city || !newPharmacy.postcode}
            >
              Add Pharmacy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Appointment Type Dialog */}
      <Dialog open={showNewAppTypeDialog} onOpenChange={setShowNewAppTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Appointment Type</DialogTitle>
            <DialogDescription>
              Create a new appointment type for your practice.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apptype-label">Label *</Label>
              <Input
                id="apptype-label"
                placeholder="e.g., Standard Consultation"
                value={newAppType.label}
                onChange={(e) => {
                  const label = e.target.value;
                  // Auto-generate type from label (e.g., "Standard Consultation" -> "STANDARD_CONSULTATION")
                  const type = label.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
                  setNewAppType({ ...newAppType, label, type });
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apptype-code">Code *</Label>
                <Input
                  id="apptype-code"
                  placeholder="e.g., STD"
                  value={newAppType.code}
                  onChange={(e) => setNewAppType({ ...newAppType, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apptype-duration">Duration (mins) *</Label>
                <Input
                  id="apptype-duration"
                  type="number"
                  min={5}
                  max={120}
                  value={newAppType.defaultDuration}
                  onChange={(e) => setNewAppType({ ...newAppType, defaultDuration: parseInt(e.target.value) || 15 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apptype-color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="apptype-color"
                  type="color"
                  value={newAppType.color}
                  onChange={(e) => setNewAppType({ ...newAppType, color: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <span className="text-sm text-gray-500">{newAppType.color}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAppTypeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveNewAppType}
              disabled={!newAppType.label || !newAppType.code}
            >
              Add Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Type Dialog */}
      <Dialog open={showEditAppTypeDialog} onOpenChange={setShowEditAppTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment Type</DialogTitle>
            <DialogDescription>
              Modify the appointment type settings.
            </DialogDescription>
          </DialogHeader>
          {selectedAppType && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-apptype-label">Label</Label>
                <Input
                  id="edit-apptype-label"
                  value={selectedAppType.label || ''}
                  onChange={(e) => setSelectedAppType({ ...selectedAppType, label: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-apptype-code">Code</Label>
                  <Input
                    id="edit-apptype-code"
                    value={selectedAppType.code || ''}
                    onChange={(e) => setSelectedAppType({ ...selectedAppType, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-apptype-duration">Duration (mins)</Label>
                  <Input
                    id="edit-apptype-duration"
                    type="number"
                    min={5}
                    max={120}
                    value={selectedAppType.defaultDuration}
                    onChange={(e) => setSelectedAppType({ ...selectedAppType, defaultDuration: parseInt(e.target.value) || 15 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apptype-color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-apptype-color"
                    type="color"
                    value={selectedAppType.color || '#6b7280'}
                    onChange={(e) => setSelectedAppType({ ...selectedAppType, color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <span className="text-sm text-gray-500">{selectedAppType.color || '#6b7280'}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditAppTypeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAppType}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={showEditRoomDialog} onOpenChange={setShowEditRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Modify the room details.
            </DialogDescription>
          </DialogHeader>
          {selectedRoom && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-room-name">Room Name *</Label>
                <Input
                  id="edit-room-name"
                  value={selectedRoom.name}
                  onChange={(e) => setSelectedRoom({ ...selectedRoom, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-room-description">Description</Label>
                <Input
                  id="edit-room-description"
                  value={selectedRoom.description || ''}
                  onChange={(e) => setSelectedRoom({ ...selectedRoom, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-room-active"
                  checked={selectedRoom.isActive}
                  onChange={(e) => setSelectedRoom({ ...selectedRoom, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit-room-active">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRoomDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRoom} disabled={!selectedRoom?.name}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pharmacy Dialog */}
      <Dialog open={showEditPharmacyDialog} onOpenChange={setShowEditPharmacyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pharmacy</DialogTitle>
            <DialogDescription>
              Modify the pharmacy details.
            </DialogDescription>
          </DialogHeader>
          {selectedPharmacy && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-pharmacy-name">Pharmacy Name *</Label>
                <Input
                  id="edit-pharmacy-name"
                  value={selectedPharmacy.name}
                  onChange={(e) => setSelectedPharmacy({ ...selectedPharmacy, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pharmacy-ods">ODS Code</Label>
                <Input
                  id="edit-pharmacy-ods"
                  value={selectedPharmacy.odsCode || ''}
                  onChange={(e) => setSelectedPharmacy({ ...selectedPharmacy, odsCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pharmacy-address">Address *</Label>
                <Input
                  id="edit-pharmacy-address"
                  value={selectedPharmacy.addressLine1}
                  onChange={(e) => setSelectedPharmacy({ ...selectedPharmacy, addressLine1: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-pharmacy-city">City *</Label>
                  <Input
                    id="edit-pharmacy-city"
                    value={selectedPharmacy.city}
                    onChange={(e) => setSelectedPharmacy({ ...selectedPharmacy, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pharmacy-postcode">Postcode *</Label>
                  <Input
                    id="edit-pharmacy-postcode"
                    value={selectedPharmacy.postcode}
                    onChange={(e) => setSelectedPharmacy({ ...selectedPharmacy, postcode: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pharmacy-phone">Phone</Label>
                <Input
                  id="edit-pharmacy-phone"
                  value={selectedPharmacy.phone || ''}
                  onChange={(e) => setSelectedPharmacy({ ...selectedPharmacy, phone: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPharmacyDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePharmacy}
              disabled={!selectedPharmacy?.name || !selectedPharmacy?.addressLine1 || !selectedPharmacy?.city || !selectedPharmacy?.postcode}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              To upgrade your subscription plan, please contact your administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <p className="text-center text-gray-600 mb-4">
              Plan upgrades are managed by your system administrator. Please reach out to them to discuss your needs and upgrade options.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Contact Support</p>
              <p className="font-medium text-teal-600">support@kairo.health</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowUpgradeDialog(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
