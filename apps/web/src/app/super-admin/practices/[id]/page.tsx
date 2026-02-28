'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield, Building2, Users, ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock,
  CreditCard, Crown, UserCheck, Smartphone, Plus, Key, Edit3, X, UserPlus,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface PracticeDetails {
  id: string; name: string; odsCode: string; email: string; phone: string;
  addressLine1: string; addressLine2?: string; city: string; county?: string; postcode: string;
  isActive: boolean; subscriptionTier: string; maxStaffIncluded: number; extraStaffCount: number;
  isTrial: boolean; trialEndsAt: string | null; subscriptionStartDate: string | null; subscriptionEndDate: string | null; createdAt: string;
  users: Array<{ id: string; email: string; firstName: string; lastName: string; role: string; isActive: boolean; lastLoginAt: string | null; phone?: string }>;
  devices: Array<{ id: string; deviceName: string; deviceType: string; status: string; lastUsedAt: string | null; createdAt: string }>;
}

const TIER_CONFIG: Record<string, { label: string; staff: number; color: string }> = {
  STARTER: { label: 'Starter', staff: 3, color: 'border-slate-500 text-slate-400' },
  PROFESSIONAL: { label: 'Professional', staff: 10, color: 'border-blue-500 text-blue-400' },
  CUSTOM: { label: 'Custom', staff: 999, color: 'border-amber-500 text-amber-400' },
};

const ROLES = ['PRACTICE_ADMIN', 'PRACTICE_MANAGER', 'GP', 'NURSE', 'HCA', 'RECEPTIONIST'];

export default function PracticeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const [practice, setPractice] = useState<PracticeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [subTier, setSubTier] = useState('STARTER');
  const [maxStaff, setMaxStaff] = useState(3);
  const [subEndDate, setSubEndDate] = useState('');

  // Staff management
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'GP', phone: '' });
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [editStaffForm, setEditStaffForm] = useState({ firstName: '', lastName: '', email: '', role: '', phone: '', isActive: true });
  const [showResetPassword, setShowResetPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const getToken = () => localStorage.getItem('super_admin_token');

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/super-admin/login'); return; }
    loadPractice(token);
  }, [practiceId, router]);

  const loadPractice = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/practices/${practiceId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { if (res.status === 401) router.push('/super-admin/login'); return; }
      const data = await res.json();
      setPractice(data);
      setSubTier(data.subscriptionTier);
      setMaxStaff(data.maxStaffIncluded);
      setSubEndDate(data.subscriptionEndDate ? data.subscriptionEndDate.split('T')[0] : '');
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const activateSubscription = async () => {
    const token = getToken(); if (!token) return;
    setIsSaving(true); setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/practices/${practiceId}/subscription`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrial: false, trialEndsAt: null, subscriptionTier: subTier, maxStaffIncluded: maxStaff, subscriptionEndDate: subEndDate || undefined }),
      });
      if (!res.ok) throw new Error('Failed');
      setMessage({ type: 'success', text: 'Subscription activated!' });
      loadPractice(token);
    } catch { setMessage({ type: 'error', text: 'Failed to activate.' }); } finally { setIsSaving(false); }
  };

  const extendTrial = async (days: number) => {
    const token = getToken(); if (!token) return;
    setIsSaving(true); setMessage(null);
    try {
      const newEnd = new Date(); newEnd.setDate(newEnd.getDate() + days);
      const res = await fetch(`${API_BASE_URL}/super-admin/practices/${practiceId}/subscription`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrial: true, trialEndsAt: newEnd.toISOString() }),
      });
      if (!res.ok) throw new Error('Failed');
      setMessage({ type: 'success', text: `Trial extended by ${days} days.` });
      loadPractice(token);
    } catch { setMessage({ type: 'error', text: 'Failed to extend trial.' }); } finally { setIsSaving(false); }
  };

  const toggleActive = async () => {
    const token = getToken(); if (!token || !practice) return;
    setIsSaving(true); setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/practices/${practiceId}/status`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !practice.isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      setMessage({ type: 'success', text: practice.isActive ? 'Practice deactivated.' : 'Practice activated.' });
      loadPractice(token);
    } catch { setMessage({ type: 'error', text: 'Failed to update status.' }); } finally { setIsSaving(false); }
  };

  // Device actions
  const handleDeviceAction = async (deviceId: string, action: 'approve' | 'revoke') => {
    const token = getToken(); if (!token) return;
    setIsSaving(true); setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/devices/${deviceId}/${action}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'revoke' ? { reason: 'Revoked by super admin' } : {}),
      });
      if (!res.ok) throw new Error('Failed');
      setMessage({ type: 'success', text: `Device ${action}d successfully.` });
      loadPractice(token);
    } catch { setMessage({ type: 'error', text: `Failed to ${action} device.` }); } finally { setIsSaving(false); }
  };

  // Staff actions
  const handleAddStaff = async () => {
    const token = getToken(); if (!token) return;
    setIsSaving(true); setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/practices/${practiceId}/staff`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed'); }
      setMessage({ type: 'success', text: 'Staff member added!' });
      setStaffForm({ firstName: '', lastName: '', email: '', password: '', role: 'GP', phone: '' });
      setShowAddStaff(false);
      loadPractice(token);
    } catch (err: any) { setMessage({ type: 'error', text: err.message || 'Failed to add staff.' }); } finally { setIsSaving(false); }
  };

  const handleUpdateStaff = async (userId: string) => {
    const token = getToken(); if (!token) return;
    setIsSaving(true); setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/staff/${userId}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editStaffForm),
      });
      if (!res.ok) throw new Error('Failed');
      setMessage({ type: 'success', text: 'Staff updated!' });
      setEditingStaff(null);
      loadPractice(token);
    } catch { setMessage({ type: 'error', text: 'Failed to update staff.' }); } finally { setIsSaving(false); }
  };

  const handleResetPassword = async (userId: string) => {
    const token = getToken(); if (!token) return;
    setIsSaving(true); setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/staff/${userId}/reset-password`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) throw new Error('Failed');
      setMessage({ type: 'success', text: 'Password reset!' });
      setShowResetPassword(null);
      setNewPassword('');
    } catch { setMessage({ type: 'error', text: 'Failed to reset password.' }); } finally { setIsSaving(false); }
  };

  const handleToggleStaffActive = async (userId: string, currentActive: boolean) => {
    const token = getToken(); if (!token) return;
    setIsSaving(true);
    try {
      await fetch(`${API_BASE_URL}/super-admin/staff/${userId}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      loadPractice(token);
    } catch { } finally { setIsSaving(false); }
  };

  const getTrialStatus = () => {
    if (!practice) return null;
    if (!practice.isTrial) return { label: 'Paid', color: 'bg-green-500/20 text-green-400', icon: CreditCard };
    if (!practice.trialEndsAt) return { label: 'Trial (No Expiry)', color: 'bg-blue-500/20 text-blue-400', icon: Clock };
    const now = new Date(); const ends = new Date(practice.trialEndsAt);
    if (now > ends) return { label: 'Trial Expired', color: 'bg-red-500/20 text-red-400', icon: XCircle };
    const hoursLeft = Math.round((ends.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (hoursLeft < 24) return { label: `Trial (${hoursLeft}h left)`, color: 'bg-amber-500/20 text-amber-400', icon: AlertTriangle };
    return { label: `Trial (${Math.ceil(hoursLeft / 24)}d left)`, color: 'bg-blue-500/20 text-blue-400', icon: Clock };
  };

  if (isLoading) return <div className="min-h-screen bg-slate-900 p-8"><Skeleton className="h-8 w-48 bg-slate-700 mb-8" /><Skeleton className="h-64 w-full bg-slate-700" /></div>;
  if (!practice) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="text-slate-400">Practice not found</p></div>;

  const trialStatus = getTrialStatus();
  const tierConfig = TIER_CONFIG[practice.subscriptionTier] || TIER_CONFIG.STARTER;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/super-admin/dashboard')} className="text-slate-300 hover:text-white hover:bg-slate-700"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg"><Shield className="h-5 w-5 text-white" /></div>
              <div><h1 className="text-lg font-semibold text-white">{practice.name}</h1><p className="text-xs text-slate-400">{practice.odsCode} &bull; {practice.email}</p></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}{message.text}
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className={`p-3 rounded-lg ${trialStatus?.color}`}>{trialStatus?.icon && <trialStatus.icon className="h-5 w-5" />}</div><div><p className="text-sm font-medium text-white">{trialStatus?.label}</p><p className="text-xs text-slate-400">Subscription</p></div></div></CardContent></Card>
          <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-3 bg-purple-500/20 rounded-lg"><Crown className="h-5 w-5 text-purple-400" /></div><div><p className="text-sm font-medium text-white">{tierConfig.label}</p><p className="text-xs text-slate-400">Plan ({practice.maxStaffIncluded} staff)</p></div></div></CardContent></Card>
          <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-3 bg-blue-500/20 rounded-lg"><Users className="h-5 w-5 text-blue-400" /></div><div><p className="text-sm font-medium text-white">{practice.users.length}</p><p className="text-xs text-slate-400">Staff Members</p></div></div></CardContent></Card>
          <Card className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center gap-3"><div className={`p-3 rounded-lg ${practice.isActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>{practice.isActive ? <CheckCircle className="h-5 w-5 text-green-400" /> : <XCircle className="h-5 w-5 text-red-400" />}</div><div><p className="text-sm font-medium text-white">{practice.isActive ? 'Active' : 'Inactive'}</p><p className="text-xs text-slate-400">Status</p></div></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Management */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><CreditCard className="h-5 w-5 text-amber-400" />Subscription</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-slate-700/50 rounded-lg space-y-2">
                <p className="text-sm font-medium text-slate-300">Current Status</p>
                <div className="flex items-center gap-2">
                  <Badge className={trialStatus?.color}>{trialStatus?.label}</Badge>
                  <Badge variant="outline" className={tierConfig.color}>{tierConfig.label}</Badge>
                </div>
                {practice.isTrial && practice.trialEndsAt && <p className="text-xs text-slate-400">Trial ends: {new Date(practice.trialEndsAt).toLocaleString()}</p>}
                {!practice.isTrial && practice.subscriptionEndDate && <p className="text-xs text-slate-400">Subscription ends: {new Date(practice.subscriptionEndDate).toLocaleDateString()}</p>}
              </div>
              {practice.isTrial && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-300">Extend Trial</p>
                  <div className="flex gap-2">{[2, 7, 14, 30].map(d => <Button key={d} size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => extendTrial(d)} disabled={isSaving}>+{d} Days</Button>)}</div>
                </div>
              )}
              <div className="space-y-4 border-t border-slate-600 pt-4">
                <p className="text-sm font-medium text-slate-300">{practice.isTrial ? 'Activate Paid' : 'Update Subscription'}</p>
                <div><label className="text-xs text-slate-400 block mb-1">Plan</label><select value={subTier} onChange={e => { setSubTier(e.target.value); if (e.target.value === 'STARTER') setMaxStaff(3); else if (e.target.value === 'PROFESSIONAL') setMaxStaff(10); }} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"><option value="STARTER">Starter (3 staff)</option><option value="PROFESSIONAL">Professional (10 staff)</option><option value="CUSTOM">Custom</option></select></div>
                <div><label className="text-xs text-slate-400 block mb-1">Max Staff</label><Input type="number" value={maxStaff} onChange={e => setMaxStaff(parseInt(e.target.value) || 3)} min={1} className="bg-slate-700 border-slate-600 text-white" /></div>
                <div><label className="text-xs text-slate-400 block mb-1">End Date (optional)</label><Input type="date" value={subEndDate} onChange={e => setSubEndDate(e.target.value)} className="bg-slate-700 border-slate-600 text-white" /></div>
                <Button onClick={activateSubscription} disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700"><CreditCard className="h-4 w-4 mr-2" />{practice.isTrial ? 'Activate Paid' : 'Update'}</Button>
              </div>
              <div className="border-t border-slate-600 pt-4">
                <Button onClick={toggleActive} disabled={isSaving} variant="outline" className={`w-full ${practice.isActive ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-green-500/50 text-green-400 hover:bg-green-500/10'}`}>
                  {practice.isActive ? <><XCircle className="h-4 w-4 mr-2" />Deactivate</> : <><CheckCircle className="h-4 w-4 mr-2" />Activate</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Practice Info */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-400" />Practice Details</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-slate-400">Phone</p><p className="text-white">{practice.phone || '\u2014'}</p></div>
                  <div><p className="text-slate-400">City</p><p className="text-white">{practice.city || '\u2014'}</p></div>
                  <div><p className="text-slate-400">Address</p><p className="text-white">{practice.addressLine1 || '\u2014'}</p></div>
                  <div><p className="text-slate-400">Registered</p><p className="text-white">{new Date(practice.createdAt).toLocaleDateString()}</p></div>
                </div>
              </CardContent>
            </Card>

            {/* Devices with Approve/Revoke */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Smartphone className="h-5 w-5 text-amber-400" />Devices ({practice.devices.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {practice.devices.map(device => (
                    <div key={device.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">{device.deviceName || 'Unknown Device'}</p>
                        <p className="text-xs text-slate-400">{device.deviceType}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={device.status === 'APPROVED' ? 'border-green-500 text-green-400' : device.status === 'PENDING' ? 'border-amber-500 text-amber-400' : 'border-red-500 text-red-400'}>{device.status}</Badge>
                        {device.status === 'PENDING' && (
                          <Button size="sm" onClick={() => handleDeviceAction(device.id, 'approve')} disabled={isSaving} className="bg-green-600 hover:bg-green-700 h-7 text-xs">Approve</Button>
                        )}
                        {device.status === 'APPROVED' && (
                          <Button size="sm" variant="outline" onClick={() => handleDeviceAction(device.id, 'revoke')} disabled={isSaving} className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-7 text-xs">Revoke</Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {practice.devices.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No devices registered</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Staff Management */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2"><UserCheck className="h-5 w-5 text-green-400" />Staff ({practice.users.length})</CardTitle>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600" onClick={() => setShowAddStaff(!showAddStaff)}><UserPlus className="h-4 w-4 mr-2" />Add Staff</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Staff Form */}
            {showAddStaff && (
              <div className="p-4 bg-slate-700/50 rounded-lg space-y-4 border border-slate-600">
                <h4 className="text-sm font-medium text-amber-400">Add New Staff Member</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div><label className="text-xs text-slate-400 block mb-1">First Name *</label><Input value={staffForm.firstName} onChange={e => setStaffForm({...staffForm, firstName: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                  <div><label className="text-xs text-slate-400 block mb-1">Last Name *</label><Input value={staffForm.lastName} onChange={e => setStaffForm({...staffForm, lastName: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                  <div><label className="text-xs text-slate-400 block mb-1">Role *</label><select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm">{ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}</select></div>
                  <div><label className="text-xs text-slate-400 block mb-1">Email *</label><Input type="email" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                  <div><label className="text-xs text-slate-400 block mb-1">Password *</label><Input type="password" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                  <div><label className="text-xs text-slate-400 block mb-1">Phone</label><Input value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddStaff} disabled={isSaving || !staffForm.firstName || !staffForm.email || !staffForm.password} className="bg-green-600 hover:bg-green-700">Add Staff</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddStaff(false)} className="border-slate-600 text-slate-300">Cancel</Button>
                </div>
              </div>
            )}

            {/* Staff List */}
            <div className="space-y-2">
              {practice.users.map(user => (
                <div key={user.id} className="p-3 bg-slate-700/50 rounded-lg">
                  {editingStaff === user.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div><label className="text-xs text-slate-400 block mb-1">First Name</label><Input value={editStaffForm.firstName} onChange={e => setEditStaffForm({...editStaffForm, firstName: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                        <div><label className="text-xs text-slate-400 block mb-1">Last Name</label><Input value={editStaffForm.lastName} onChange={e => setEditStaffForm({...editStaffForm, lastName: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                        <div><label className="text-xs text-slate-400 block mb-1">Role</label><select value={editStaffForm.role} onChange={e => setEditStaffForm({...editStaffForm, role: e.target.value})} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm">{ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}</select></div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdateStaff(user.id)} disabled={isSaving} className="bg-green-600 hover:bg-green-700">Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingStaff(null)} className="border-slate-600 text-slate-300">Cancel</Button>
                      </div>
                    </div>
                  ) : showResetPassword === user.id ? (
                    <div className="space-y-3">
                      <p className="text-sm text-white">Reset password for {user.firstName} {user.lastName}</p>
                      <div className="flex gap-2">
                        <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="bg-slate-700 border-slate-600 text-white max-w-xs" />
                        <Button size="sm" onClick={() => handleResetPassword(user.id)} disabled={isSaving || !newPassword} className="bg-amber-500 hover:bg-amber-600">Reset</Button>
                        <Button size="sm" variant="outline" onClick={() => { setShowResetPassword(null); setNewPassword(''); }} className="border-slate-600 text-slate-300">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-slate-500 text-slate-400 text-xs">{user.role.replace('_', ' ')}</Badge>
                        <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                        <Button size="sm" variant="ghost" onClick={() => { setEditingStaff(user.id); setEditStaffForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, phone: '', isActive: user.isActive }); }} className="text-slate-400 hover:text-white h-7 w-7 p-0"><Edit3 className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowResetPassword(user.id)} className="text-slate-400 hover:text-amber-400 h-7 w-7 p-0"><Key className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleToggleStaffActive(user.id, user.isActive)} className={`h-7 w-7 p-0 ${user.isActive ? 'text-slate-400 hover:text-red-400' : 'text-red-400 hover:text-green-400'}`}>
                          {user.isActive ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {practice.users.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No staff members</p>}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
