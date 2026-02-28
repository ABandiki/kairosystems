'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  Building2,
  Users,
  Search,
  LogOut,
  CheckCircle,
  XCircle,
  ChevronRight,
  Plus,
  Clock,
  CreditCard,
  BarChart3,
  Activity,
  DollarSign,
  Bell,
  Send,
  TrendingUp,
  AlertTriangle,
  X,
  ChevronDown,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Practice {
  id: string; name: string; odsCode: string; email: string; subscriptionTier: string;
  isActive: boolean; isTrial: boolean; trialEndsAt: string | null; createdAt: string;
  _count: { users: number; patients: number; devices: number };
}

interface AnalyticsData {
  overview: { totalPractices: number; activePractices: number; inactivePractices: number; totalStaff: number; totalPatients: number; totalAppointments: number; totalInvoices: number };
  subscriptions: { tierBreakdown: { STARTER: number; PROFESSIONAL: number; CUSTOM: number }; trialCount: number; paidCount: number; activeTrials: number; expiredTrials: number };
  growth: { newPractices7d: number; newPractices30d: number; monthlyGrowth: { month: string; practices: number }[] };
  topPractices: { name: string; staff: number; patients: number; appointments: number; tier: string }[];
}

interface RevenueData {
  summary: { totalRevenue: number; pendingRevenue: number; overdueRevenue: number; totalInvoices: number };
  monthlyRevenue: { month: string; revenue: number; invoices: number }[];
  revenueByPractice: { name: string; tier: string; revenue: number; invoiceCount: number }[];
  statusBreakdown: { PAID: number; PENDING: number; DRAFT: number; OVERDUE: number; CANCELLED: number };
}

interface ActivityLog {
  id: string; action: string; practiceId: string | null; details: any; createdAt: string;
  superAdmin: { firstName: string; lastName: string; email: string };
}

type Tab = 'practices' | 'analytics' | 'revenue' | 'activity' | 'notifications';

function getTrialBadge(practice: Practice) {
  if (!practice.isTrial) return { label: 'Paid', className: 'border-green-500 text-green-400' };
  if (!practice.trialEndsAt) return { label: 'Trial', className: 'border-blue-500 text-blue-400' };
  const now = new Date();
  const ends = new Date(practice.trialEndsAt);
  if (now > ends) return { label: 'Expired', className: 'border-red-500 text-red-400 bg-red-500/10' };
  const hoursLeft = Math.round((ends.getTime() - now.getTime()) / (1000 * 60 * 60));
  if (hoursLeft < 24) return { label: `${hoursLeft}h left`, className: 'border-amber-500 text-amber-400' };
  return { label: `${Math.ceil(hoursLeft / 24)}d left`, className: 'border-blue-500 text-blue-400' };
}

function formatCurrency(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); }

function formatAction(action: string) {
  const m: Record<string, { label: string; color: string }> = {
    LOGIN: { label: 'Login', color: 'text-blue-400' },
    VIEW_PRACTICE: { label: 'Viewed Practice', color: 'text-slate-400' },
    CREATE_PRACTICE: { label: 'Created Practice', color: 'text-green-400' },
    CREATE_PRACTICE_ADMIN: { label: 'Created Admin', color: 'text-green-400' },
    CREATE_STAFF: { label: 'Created Staff', color: 'text-green-400' },
    UPDATE_SUBSCRIPTION: { label: 'Updated Subscription', color: 'text-amber-400' },
    UPDATE_STAFF: { label: 'Updated Staff', color: 'text-amber-400' },
    RESET_PASSWORD: { label: 'Reset Password', color: 'text-amber-400' },
    ACTIVATE_PRACTICE: { label: 'Activated Practice', color: 'text-green-400' },
    DEACTIVATE_PRACTICE: { label: 'Deactivated Practice', color: 'text-red-400' },
    APPROVE_DEVICE: { label: 'Approved Device', color: 'text-green-400' },
    REVOKE_DEVICE: { label: 'Revoked Device', color: 'text-red-400' },
    SEND_NOTIFICATION: { label: 'Sent Notification', color: 'text-purple-400' },
    BROADCAST_NOTIFICATION: { label: 'Broadcast', color: 'text-purple-400' },
    BULK_ACTIVATE: { label: 'Bulk Activated', color: 'text-green-400' },
    BULK_DEACTIVATE: { label: 'Bulk Deactivated', color: 'text-red-400' },
    BULK_EXTEND_TRIAL: { label: 'Bulk Extended Trial', color: 'text-amber-400' },
  };
  return m[action] || { label: action, color: 'text-slate-400' };
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [superAdmin, setSuperAdmin] = useState<{ id: string; email: string; firstName: string; lastName: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('practices');
  const [practices, setPractices] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPractices, setSelectedPractices] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showCreatePractice, setShowCreatePractice] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', odsCode: '', email: '', phone: '', addressLine1: '', city: '', postcode: '', subscriptionTier: 'STARTER', adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyTarget, setNotifyTarget] = useState<'all' | string>('all');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notifyResult, setNotifyResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getToken = () => localStorage.getItem('super_admin_token');

  useEffect(() => {
    const token = localStorage.getItem('super_admin_token');
    const adminData = localStorage.getItem('super_admin');
    if (!token || !adminData) { router.push('/super-admin/login'); return; }
    try { setSuperAdmin(JSON.parse(adminData)); } catch { router.push('/super-admin/login'); return; }
    loadPractices(token);
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    if (activeTab === 'analytics' && !analytics) loadAnalytics(token);
    if (activeTab === 'revenue' && !revenue) loadRevenue(token);
    if (activeTab === 'activity' && activityLog.length === 0) loadActivityLog(token);
  }, [activeTab]);

  const loadPractices = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/practices`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { if (res.status === 401) { localStorage.removeItem('super_admin_token'); localStorage.removeItem('super_admin'); router.push('/super-admin/login'); } return; }
      setPractices(await res.json());
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const loadAnalytics = async (token: string) => {
    setAnalyticsLoading(true);
    try { const res = await fetch(`${API_BASE_URL}/super-admin/analytics`, { headers: { Authorization: `Bearer ${token}` } }); if (res.ok) setAnalytics(await res.json()); }
    catch (err) { console.error(err); } finally { setAnalyticsLoading(false); }
  };

  const loadRevenue = async (token: string) => {
    setRevenueLoading(true);
    try { const res = await fetch(`${API_BASE_URL}/super-admin/revenue`, { headers: { Authorization: `Bearer ${token}` } }); if (res.ok) setRevenue(await res.json()); }
    catch (err) { console.error(err); } finally { setRevenueLoading(false); }
  };

  const loadActivityLog = async (token: string) => {
    setActivityLoading(true);
    try { const res = await fetch(`${API_BASE_URL}/super-admin/activity-log?limit=200`, { headers: { Authorization: `Bearer ${token}` } }); if (res.ok) setActivityLog(await res.json()); }
    catch (err) { console.error(err); } finally { setActivityLoading(false); }
  };

  const handleCreatePractice = async () => {
    const token = getToken(); if (!token) return;
    setIsCreating(true); setCreateMessage(null);
    try {
      const pRes = await fetch(`${API_BASE_URL}/super-admin/practices`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createForm.name, odsCode: createForm.odsCode, email: createForm.email, phone: createForm.phone, addressLine1: createForm.addressLine1, city: createForm.city, postcode: createForm.postcode, subscriptionTier: createForm.subscriptionTier, maxStaffIncluded: createForm.subscriptionTier === 'STARTER' ? 3 : createForm.subscriptionTier === 'PROFESSIONAL' ? 10 : 20 }),
      });
      if (!pRes.ok) { const err = await pRes.json(); throw new Error(err.message || 'Failed to create practice'); }
      const practice = await pRes.json();
      if (createForm.adminEmail && createForm.adminPassword) {
        const aRes = await fetch(`${API_BASE_URL}/super-admin/practices/${practice.id}/admin`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: createForm.adminEmail, password: createForm.adminPassword, firstName: createForm.adminFirstName, lastName: createForm.adminLastName }),
        });
        if (!aRes.ok) { setCreateMessage({ type: 'success', text: 'Practice created but failed to create admin.' }); loadPractices(token); return; }
      }
      setCreateMessage({ type: 'success', text: `Practice "${createForm.name}" created!` });
      setCreateForm({ name: '', odsCode: '', email: '', phone: '', addressLine1: '', city: '', postcode: '', subscriptionTier: 'STARTER', adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '' });
      loadPractices(token);
      setTimeout(() => setShowCreatePractice(false), 2000);
    } catch (err: any) { setCreateMessage({ type: 'error', text: err.message || 'Failed' }); } finally { setIsCreating(false); }
  };

  const toggleSelect = (id: string) => { setSelectedPractices(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
  const selectAll = () => { if (selectedPractices.size === filteredPractices.length) setSelectedPractices(new Set()); else setSelectedPractices(new Set(filteredPractices.map(p => p.id))); };

  const handleBulk = async (action: 'activate' | 'deactivate' | 'extend7' | 'extend30') => {
    const token = getToken(); if (!token || selectedPractices.size === 0) return;
    try {
      if (action === 'activate' || action === 'deactivate') {
        await fetch(`${API_BASE_URL}/super-admin/practices/bulk/status`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ practiceIds: Array.from(selectedPractices), isActive: action === 'activate' }) });
      } else {
        await fetch(`${API_BASE_URL}/super-admin/practices/bulk/extend-trial`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ practiceIds: Array.from(selectedPractices), days: action === 'extend7' ? 7 : 30 }) });
      }
      setSelectedPractices(new Set()); setShowBulkActions(false); loadPractices(token);
    } catch (err) { console.error(err); }
  };

  const handleSendNotification = async () => {
    const token = getToken(); if (!token || !notifyTitle || !notifyMessage) return;
    setIsSendingNotification(true); setNotifyResult(null);
    try {
      const url = notifyTarget === 'all' ? `${API_BASE_URL}/super-admin/broadcast` : `${API_BASE_URL}/super-admin/practices/${notifyTarget}/notify`;
      const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: notifyTitle, message: notifyMessage }) });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setNotifyResult({ type: 'success', text: `Sent ${data.notificationsSent} notification(s)!` });
      setNotifyTitle(''); setNotifyMessage('');
    } catch { setNotifyResult({ type: 'error', text: 'Failed to send.' }); } finally { setIsSendingNotification(false); }
  };

  const handleLogout = () => { localStorage.removeItem('super_admin_token'); localStorage.removeItem('super_admin'); router.push('/super-admin/login'); };

  const filteredPractices = practices.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.odsCode.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const stats = { totalPractices: practices.length, paidPractices: practices.filter(p => !p.isTrial).length, onTrial: practices.filter(p => p.isTrial).length, totalStaff: practices.reduce((s, p) => s + (p._count?.users || 0), 0) };

  if (!superAdmin) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'practices', label: 'Practices', icon: <Building2 className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'activity', label: 'Activity Log', icon: <Activity className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notify', icon: <Bell className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg"><Shield className="h-6 w-6 text-white" /></div>
              <div><h1 className="text-lg font-semibold text-white">Super Admin</h1><p className="text-xs text-slate-400">Kairo System Administration</p></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">{superAdmin.firstName} {superAdmin.lastName}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-300 hover:text-white hover:bg-slate-700"><LogOut className="h-4 w-4 mr-2" />Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* PRACTICES */}
        {activeTab === 'practices' && (<>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Practices', value: stats.totalPractices, icon: Building2, bg: 'bg-blue-500/20', ic: 'text-blue-400' },
              { label: 'Paid Subscriptions', value: stats.paidPractices, icon: CreditCard, bg: 'bg-green-500/20', ic: 'text-green-400' },
              { label: 'On Trial', value: stats.onTrial, icon: Clock, bg: 'bg-amber-500/20', ic: 'text-amber-400' },
              { label: 'Total Staff', value: stats.totalStaff, icon: Users, bg: 'bg-purple-500/20', ic: 'text-purple-400' },
            ].map((s, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className={`p-3 rounded-lg ${s.bg}`}><s.icon className={`h-6 w-6 ${s.ic}`} /></div><div><p className="text-2xl font-bold text-white">{s.value}</p><p className="text-sm text-slate-400">{s.label}</p></div></div></CardContent></Card>
            ))}
          </div>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div><CardTitle className="text-white">Practices</CardTitle><CardDescription className="text-slate-400">Manage all registered practices</CardDescription></div>
                <div className="flex gap-2">
                  {selectedPractices.size > 0 && (
                    <div className="relative">
                      <Button variant="outline" size="sm" onClick={() => setShowBulkActions(!showBulkActions)} className="border-slate-600 text-slate-300 hover:bg-slate-700">Bulk ({selectedPractices.size})<ChevronDown className="h-3 w-3 ml-1" /></Button>
                      {showBulkActions && (
                        <div className="absolute right-0 mt-1 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10 py-1">
                          <button onClick={() => handleBulk('activate')} className="w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-slate-600">Activate All</button>
                          <button onClick={() => handleBulk('deactivate')} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-600">Deactivate All</button>
                          <button onClick={() => handleBulk('extend7')} className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-slate-600">Extend Trial +7d</button>
                          <button onClick={() => handleBulk('extend30')} className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-slate-600">Extend Trial +30d</button>
                        </div>
                      )}
                    </div>
                  )}
                  <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setShowCreatePractice(true)}><Plus className="h-4 w-4 mr-2" />Add Practice</Button>
                </div>
              </div>
              <div className="relative mt-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search practices..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" /></div>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full bg-slate-700" />)}</div>
              : filteredPractices.length === 0 ? <div className="text-center py-12"><Building2 className="h-12 w-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No practices found</p></div>
              : <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400"><input type="checkbox" checked={selectedPractices.size === filteredPractices.length && filteredPractices.length > 0} onChange={selectAll} className="rounded border-slate-500" /><span>Select all ({filteredPractices.length})</span></div>
                  {filteredPractices.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                      <div className="flex items-center gap-4">
                        <input type="checkbox" checked={selectedPractices.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded border-slate-500" onClick={e => e.stopPropagation()} />
                        <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => router.push(`/super-admin/practices/${p.id}`)}>
                          <div className="p-2 bg-slate-600 rounded-lg"><Building2 className="h-6 w-6 text-slate-300" /></div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-white">{p.name}</h3>
                              <Badge variant="outline" className={p.isActive ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                              <Badge variant="outline" className={getTrialBadge(p).className}>{getTrialBadge(p).label}</Badge>
                              <Badge variant="outline" className="border-slate-500 text-slate-400">{p.subscriptionTier}</Badge>
                            </div>
                            <p className="text-sm text-slate-400">{p.odsCode} &bull; {p.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 cursor-pointer" onClick={() => router.push(`/super-admin/practices/${p.id}`)}>
                        <div className="text-center"><p className="text-lg font-semibold text-white">{p._count?.users || 0}</p><p className="text-xs text-slate-400">Staff</p></div>
                        <div className="text-center"><p className="text-lg font-semibold text-white">{p._count?.devices || 0}</p><p className="text-xs text-slate-400">Devices</p></div>
                        <ChevronRight className="h-5 w-5 text-slate-500" />
                      </div>
                    </div>
                  ))}
                </div>}
            </CardContent>
          </Card>

          {showCreatePractice && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl my-8">
                <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Plus className="h-5 w-5 text-amber-400" />Create New Practice</h2>
                  <button onClick={() => setShowCreatePractice(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {createMessage && <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${createMessage.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{createMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{createMessage.text}</div>}
                  <div>
                    <h3 className="text-sm font-medium text-amber-400 mb-3">Practice Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs text-slate-400 block mb-1">Practice Name *</label><Input value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} className="bg-slate-700 border-slate-600 text-white" placeholder="e.g. Sunrise Medical" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Practice Code *</label><Input value={createForm.odsCode} onChange={e => setCreateForm({...createForm, odsCode: e.target.value})} className="bg-slate-700 border-slate-600 text-white" placeholder="SMC001" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Email *</label><Input type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Phone *</label><Input value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                      <div className="col-span-2"><label className="text-xs text-slate-400 block mb-1">Address *</label><Input value={createForm.addressLine1} onChange={e => setCreateForm({...createForm, addressLine1: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">City *</label><Input value={createForm.city} onChange={e => setCreateForm({...createForm, city: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Postcode *</label><Input value={createForm.postcode} onChange={e => setCreateForm({...createForm, postcode: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                      <div className="col-span-2"><label className="text-xs text-slate-400 block mb-1">Tier</label><select value={createForm.subscriptionTier} onChange={e => setCreateForm({...createForm, subscriptionTier: e.target.value})} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"><option value="STARTER">Starter</option><option value="PROFESSIONAL">Professional</option><option value="CUSTOM">Custom</option></select></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-amber-400 mb-3">Initial Admin User</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs text-slate-400 block mb-1">First Name *</label><Input value={createForm.adminFirstName} onChange={e => setCreateForm({...createForm, adminFirstName: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Last Name *</label><Input value={createForm.adminLastName} onChange={e => setCreateForm({...createForm, adminLastName: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Email *</label><Input type="email" value={createForm.adminEmail} onChange={e => setCreateForm({...createForm, adminEmail: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Password *</label><Input type="password" value={createForm.adminPassword} onChange={e => setCreateForm({...createForm, adminPassword: e.target.value})} className="bg-slate-700 border-slate-600 text-white" /></div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreatePractice(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</Button>
                  <Button onClick={handleCreatePractice} disabled={isCreating || !createForm.name || !createForm.odsCode || !createForm.email} className="bg-amber-500 hover:bg-amber-600">{isCreating ? 'Creating...' : 'Create Practice'}</Button>
                </div>
              </div>
            </div>
          )}
        </>)}

        {/* ANALYTICS */}
        {activeTab === 'analytics' && (<>
          {analyticsLoading ? <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 bg-slate-700" />)}</div></div>
          : analytics ? <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { l: 'Practices', v: analytics.overview.totalPractices },
                { l: 'Active', v: analytics.overview.activePractices },
                { l: 'Staff', v: analytics.overview.totalStaff },
                { l: 'Patients', v: analytics.overview.totalPatients },
                { l: 'Appointments', v: analytics.overview.totalAppointments },
                { l: 'Invoices', v: analytics.overview.totalInvoices },
                { l: 'Inactive', v: analytics.overview.inactivePractices },
              ].map((s, i) => <Card key={i} className="bg-slate-800 border-slate-700"><CardContent className="pt-4 pb-4"><p className="text-2xl font-bold text-white">{s.v}</p><p className="text-xs text-slate-400">{s.l}</p></CardContent></Card>)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700"><CardHeader><CardTitle className="text-white text-base">Subscription Breakdown</CardTitle></CardHeader>
                <CardContent><div className="space-y-4">
                  {[{ t: 'Starter', c: analytics.subscriptions.tierBreakdown.STARTER, bg: 'bg-slate-500' }, { t: 'Professional', c: analytics.subscriptions.tierBreakdown.PROFESSIONAL, bg: 'bg-blue-500' }, { t: 'Custom', c: analytics.subscriptions.tierBreakdown.CUSTOM, bg: 'bg-amber-500' }].map(i => {
                    const pct = analytics.overview.totalPractices > 0 ? (i.c / analytics.overview.totalPractices * 100) : 0;
                    return <div key={i.t}><div className="flex justify-between text-sm mb-1"><span className="text-slate-300">{i.t}</span><span className="text-white font-medium">{i.c} ({pct.toFixed(0)}%)</span></div><div className="h-2 bg-slate-700 rounded-full"><div className={`h-2 rounded-full ${i.bg}`} style={{ width: `${pct}%` }} /></div></div>;
                  })}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                    <div className="text-center"><p className="text-lg font-bold text-green-400">{analytics.subscriptions.paidCount}</p><p className="text-xs text-slate-400">Paid</p></div>
                    <div className="text-center"><p className="text-lg font-bold text-amber-400">{analytics.subscriptions.activeTrials}</p><p className="text-xs text-slate-400">Active Trials</p></div>
                  </div>
                  {analytics.subscriptions.expiredTrials > 0 && <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg text-sm text-red-400"><AlertTriangle className="h-4 w-4" />{analytics.subscriptions.expiredTrials} expired trial(s)</div>}
                </div></CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700"><CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-400" />Monthly Growth</CardTitle><CardDescription className="text-slate-400">+{analytics.growth.newPractices7d} this week, +{analytics.growth.newPractices30d} this month</CardDescription></CardHeader>
                <CardContent><div className="flex items-end justify-between gap-2 h-40">
                  {analytics.growth.monthlyGrowth.map((m, i) => {
                    const max = Math.max(...analytics.growth.monthlyGrowth.map(x => x.practices), 1);
                    const h = (m.practices / max) * 100;
                    return <div key={i} className="flex-1 flex flex-col items-center gap-1"><span className="text-xs text-white font-medium">{m.practices}</span><div className="w-full bg-slate-700 rounded-t-sm relative" style={{ height: '120px' }}><div className="absolute bottom-0 w-full bg-amber-500 rounded-t-sm" style={{ height: `${Math.max(h, 5)}%` }} /></div><span className="text-xs text-slate-500">{m.month}</span></div>;
                  })}
                </div></CardContent>
              </Card>
            </div>
            <Card className="bg-slate-800 border-slate-700"><CardHeader><CardTitle className="text-white text-base">Top Practices</CardTitle></CardHeader>
              <CardContent><div className="space-y-3">
                {analytics.topPractices.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3"><span className="text-lg font-bold text-amber-400 w-6">#{i+1}</span><div><p className="text-sm font-medium text-white">{p.name}</p><Badge variant="outline" className="border-slate-500 text-slate-400 text-xs">{p.tier}</Badge></div></div>
                    <div className="flex gap-6 text-center"><div><p className="text-sm font-bold text-white">{p.staff}</p><p className="text-xs text-slate-400">Staff</p></div><div><p className="text-sm font-bold text-white">{p.patients}</p><p className="text-xs text-slate-400">Patients</p></div><div><p className="text-sm font-bold text-white">{p.appointments}</p><p className="text-xs text-slate-400">Appts</p></div></div>
                  </div>
                ))}
                {analytics.topPractices.length === 0 && <p className="text-center text-slate-500 py-4">No data yet</p>}
              </div></CardContent>
            </Card>
          </div> : <p className="text-slate-400 text-center py-12">Failed to load analytics</p>}
        </>)}

        {/* REVENUE */}
        {activeTab === 'revenue' && (<>
          {revenueLoading ? <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 bg-slate-700" />)}</div>
          : revenue ? <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { l: 'Total Revenue (Paid)', v: formatCurrency(revenue.summary.totalRevenue), icon: DollarSign, bg: 'bg-green-500/20', ic: 'text-green-400' },
                { l: 'Pending', v: formatCurrency(revenue.summary.pendingRevenue), icon: Clock, bg: 'bg-amber-500/20', ic: 'text-amber-400' },
                { l: 'Overdue', v: formatCurrency(revenue.summary.overdueRevenue), icon: AlertTriangle, bg: 'bg-red-500/20', ic: 'text-red-400' },
                { l: 'Total Invoices', v: String(revenue.summary.totalInvoices), icon: CreditCard, bg: 'bg-blue-500/20', ic: 'text-blue-400' },
              ].map((s, i) => <Card key={i} className="bg-slate-800 border-slate-700"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className={`p-3 rounded-lg ${s.bg}`}><s.icon className={`h-6 w-6 ${s.ic}`} /></div><div><p className="text-2xl font-bold text-white">{s.v}</p><p className="text-sm text-slate-400">{s.l}</p></div></div></CardContent></Card>)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700"><CardHeader><CardTitle className="text-white text-base">Monthly Revenue</CardTitle></CardHeader>
                <CardContent><div className="flex items-end justify-between gap-2 h-48">
                  {revenue.monthlyRevenue.map((m, i) => {
                    const max = Math.max(...revenue.monthlyRevenue.map(x => x.revenue), 1);
                    const h = (m.revenue / max) * 100;
                    return <div key={i} className="flex-1 flex flex-col items-center gap-1"><span className="text-xs text-white font-medium">{formatCurrency(m.revenue).replace('$','')}</span><div className="w-full bg-slate-700 rounded-t-sm relative" style={{ height: '140px' }}><div className="absolute bottom-0 w-full bg-green-500 rounded-t-sm" style={{ height: `${Math.max(h, 5)}%` }} /></div><span className="text-xs text-slate-500">{m.month}</span></div>;
                  })}
                </div></CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700"><CardHeader><CardTitle className="text-white text-base">Invoice Status</CardTitle></CardHeader>
                <CardContent><div className="space-y-4">
                  {[{ s: 'Paid', c: revenue.statusBreakdown.PAID, bg: 'bg-green-500', tc: 'text-green-400' }, { s: 'Pending', c: revenue.statusBreakdown.PENDING, bg: 'bg-amber-500', tc: 'text-amber-400' }, { s: 'Draft', c: revenue.statusBreakdown.DRAFT, bg: 'bg-slate-500', tc: 'text-slate-400' }, { s: 'Overdue', c: revenue.statusBreakdown.OVERDUE, bg: 'bg-red-500', tc: 'text-red-400' }, { s: 'Cancelled', c: revenue.statusBreakdown.CANCELLED, bg: 'bg-gray-500', tc: 'text-gray-400' }].map(i => {
                    const t = Object.values(revenue.statusBreakdown).reduce((a, b) => a + b, 0);
                    const pct = t > 0 ? (i.c / t * 100) : 0;
                    return <div key={i.s}><div className="flex justify-between text-sm mb-1"><span className={i.tc}>{i.s}</span><span className="text-white font-medium">{i.c}</span></div><div className="h-2 bg-slate-700 rounded-full"><div className={`h-2 rounded-full ${i.bg}`} style={{ width: `${pct}%` }} /></div></div>;
                  })}
                </div></CardContent>
              </Card>
            </div>
            <Card className="bg-slate-800 border-slate-700"><CardHeader><CardTitle className="text-white text-base">Revenue by Practice</CardTitle></CardHeader>
              <CardContent><div className="space-y-3">
                {revenue.revenueByPractice.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3"><span className="text-lg font-bold text-green-400 w-6">#{i+1}</span><div><p className="text-sm font-medium text-white">{p.name}</p><Badge variant="outline" className="border-slate-500 text-slate-400 text-xs">{p.tier}</Badge></div></div>
                    <div className="text-right"><p className="text-sm font-bold text-green-400">{formatCurrency(p.revenue)}</p><p className="text-xs text-slate-400">{p.invoiceCount} invoices</p></div>
                  </div>
                ))}
                {revenue.revenueByPractice.length === 0 && <p className="text-center text-slate-500 py-4">No revenue data yet</p>}
              </div></CardContent>
            </Card>
          </div> : <p className="text-slate-400 text-center py-12">Failed to load revenue data</p>}
        </>)}

        {/* ACTIVITY */}
        {activeTab === 'activity' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Activity className="h-5 w-5 text-amber-400" />Activity Log</CardTitle><CardDescription className="text-slate-400">All super admin actions recorded</CardDescription></CardHeader>
            <CardContent>
              {activityLoading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 bg-slate-700" />)}</div>
              : activityLog.length === 0 ? <div className="text-center py-12"><Activity className="h-12 w-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No activity logged yet</p></div>
              : <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {activityLog.map(log => {
                    const ai = formatAction(log.action);
                    return <div key={log.id} className="flex items-start justify-between p-3 bg-slate-700/50 rounded-lg gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${ai.color}`}>{ai.label}</span>
                          {log.details && typeof log.details === 'object' && (<>
                            {log.details.name && <span className="text-xs text-slate-400">&bull; {log.details.name}</span>}
                            {log.details.email && <span className="text-xs text-slate-400">&bull; {log.details.email}</span>}
                            {log.details.deviceName && <span className="text-xs text-slate-400">&bull; {log.details.deviceName}</span>}
                            {log.details.title && <span className="text-xs text-slate-400">&bull; {log.details.title}</span>}
                            {log.details.days && <span className="text-xs text-slate-400">&bull; +{log.details.days}d</span>}
                          </>)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">by {log.superAdmin.firstName} {log.superAdmin.lastName}</p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>;
                  })}
                </div>}
            </CardContent>
          </Card>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Send className="h-5 w-5 text-amber-400" />Send Notification</CardTitle><CardDescription className="text-slate-400">Notify practice administrators</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {notifyResult && <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${notifyResult.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{notifyResult.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{notifyResult.text}</div>}
                <div><label className="text-xs text-slate-400 block mb-1">Recipient</label><select value={notifyTarget} onChange={e => setNotifyTarget(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"><option value="all">All Active Practices</option>{practices.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div><label className="text-xs text-slate-400 block mb-1">Title *</label><Input value={notifyTitle} onChange={e => setNotifyTitle(e.target.value)} className="bg-slate-700 border-slate-600 text-white" placeholder="e.g. Scheduled Maintenance" /></div>
                <div><label className="text-xs text-slate-400 block mb-1">Message *</label><textarea value={notifyMessage} onChange={e => setNotifyMessage(e.target.value)} rows={5} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm resize-none" placeholder="Write your message..." /></div>
                <Button onClick={handleSendNotification} disabled={isSendingNotification || !notifyTitle || !notifyMessage} className="w-full bg-amber-500 hover:bg-amber-600"><Send className="h-4 w-4 mr-2" />{isSendingNotification ? 'Sending...' : notifyTarget === 'all' ? 'Broadcast to All' : 'Send Notification'}</Button>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader><CardTitle className="text-white text-base">Quick Templates</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: 'Scheduled Maintenance', message: 'Kairo will undergo scheduled maintenance on [DATE] from [TIME] to [TIME]. The system may be temporarily unavailable.' },
                  { title: 'New Feature Available', message: 'A new feature is now available in Kairo! [DESCRIBE FEATURE]. Log in to try it out.' },
                  { title: 'Subscription Reminder', message: 'Your trial period is ending soon. Contact us to upgrade your subscription.' },
                  { title: 'System Update', message: 'Kairo has been updated. Key improvements: [LIST]. No action required.' },
                ].map((t, i) => (
                  <button key={i} onClick={() => { setNotifyTitle(t.title); setNotifyMessage(t.message); }} className="w-full text-left p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                    <p className="text-sm font-medium text-white">{t.title}</p><p className="text-xs text-slate-400 line-clamp-2 mt-1">{t.message}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
