'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Send,
  Clock,
  Mail,
  Smartphone,
  Plus,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Loader2,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import {
  useMessageHistory,
  useMessageTemplates,
  useMessagingStatus,
  usePatients,
} from '@/hooks/use-api';
import {
  messagingApi,
  Patient,
  MsgTemplate,
  MessageLog,
} from '@/lib/api';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MESSAGE_STATUS_COLORS: Record<string, string> = {
  SENT: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  PENDING: 'bg-amber-100 text-amber-800',
  BOUNCED: 'bg-red-100 text-red-800',
};

const CHANNEL_COLORS: Record<string, string> = {
  EMAIL: 'bg-blue-100 text-blue-800',
  SMS: 'bg-purple-100 text-purple-800',
  WHATSAPP: 'bg-green-100 text-green-800',
};

const TEMPLATE_TYPE_OPTIONS = [
  { value: 'APPOINTMENT_CONFIRMATION', label: 'Appointment Confirmation' },
  { value: 'APPOINTMENT_REMINDER', label: 'Appointment Reminder' },
  { value: 'APPOINTMENT_CANCELLATION', label: 'Appointment Cancellation' },
  { value: 'GENERAL', label: 'General' },
  { value: 'FOLLOW_UP', label: 'Follow-Up' },
  { value: 'RESULTS', label: 'Results Notification' },
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'CUSTOM', label: 'Custom' },
];

// ---------------------------------------------------------------------------
// Skeleton loaders
// ---------------------------------------------------------------------------

function HistoryTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-48 flex-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

function TemplateSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MessagingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('send');

  // ---- Send Message state ------------------------------------------------
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [channel, setChannel] = useState<'EMAIL' | 'SMS' | 'WHATSAPP'>('EMAIL');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const patientSearchRef = useRef<HTMLDivElement>(null);

  // ---- History state -----------------------------------------------------
  const [historyChannelFilter, setHistoryChannelFilter] = useState('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [historyPage, setHistoryPage] = useState(1);

  // ---- Template state ----------------------------------------------------
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MsgTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    channel: 'EMAIL' as 'EMAIL' | 'SMS' | 'WHATSAPP',
    type: 'GENERAL',
    subject: '',
    body: '',
  });
  const [isTemplateSubmitting, setIsTemplateSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);

  // ---- Data fetching -----------------------------------------------------
  const canFetch = !authLoading && !!user;

  const { data: messagingStatus, isLoading: statusLoading } = useMessagingStatus(canFetch);

  const { data: patientsData, isLoading: patientsLoading } = usePatients(
    { search: patientSearch || undefined, pageSize: 10 },
    canFetch && patientSearch.length >= 2
  );

  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useMessageHistory(
    {
      channel: historyChannelFilter !== 'all' ? historyChannelFilter : undefined,
      status: historyStatusFilter !== 'all' ? historyStatusFilter : undefined,
      page: historyPage,
      pageSize: 20,
    },
    canFetch
  );

  const {
    data: templates,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = useMessageTemplates(canFetch);

  // ---- Auth redirect -----------------------------------------------------
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // ---- Close patient dropdown on outside click ---------------------------
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (patientSearchRef.current && !patientSearchRef.current.contains(e.target as Node)) {
        setShowPatientResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- Clear send result after 5s ---------------------------------------
  useEffect(() => {
    if (sendResult) {
      const timer = setTimeout(() => setSendResult(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [sendResult]);

  // ---- Derived -----------------------------------------------------------
  const isAdmin = user?.role === 'PRACTICE_ADMIN' || user?.role === 'SUPER_ADMIN';
  const patients = patientsData?.data || [];
  const messages = historyData?.data || [];
  const totalHistoryPages = historyData?.totalPages || 1;

  const emailConfigured = messagingStatus?.emailConfigured ?? true;
  const smsConfigured = messagingStatus?.smsConfigured ?? true;
  const whatsappConfigured = messagingStatus?.whatsappConfigured ?? false;

  // ---- Handlers ----------------------------------------------------------

  const handleSelectPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearch(`${patient.firstName} ${patient.lastName}`);
    setShowPatientResults(false);
  }, []);

  const handleClearPatient = useCallback(() => {
    setSelectedPatient(null);
    setPatientSearch('');
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!selectedPatient) return;
    if (!messageBody.trim()) return;
    if (channel === 'EMAIL' && !subject.trim()) return;

    setIsSending(true);
    setSendResult(null);

    try {
      await messagingApi.sendMessage({
        patientId: selectedPatient.id,
        channel,
        subject: channel === 'EMAIL' ? subject : undefined,
        body: messageBody,
      });

      setSendResult({ type: 'success', message: `Message sent successfully via ${channel}.` });
      setSelectedPatient(null);
      setPatientSearch('');
      setSubject('');
      setMessageBody('');
      refetchHistory();
    } catch (err: any) {
      setSendResult({
        type: 'error',
        message: err?.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  }, [selectedPatient, channel, subject, messageBody, refetchHistory]);

  const handleOpenCreateTemplate = useCallback(() => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', channel: 'EMAIL', type: 'GENERAL', subject: '', body: '' });
    setShowTemplateDialog(true);
  }, []);

  const handleOpenEditTemplate = useCallback((template: MsgTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      channel: template.channel,
      type: template.type,
      subject: template.subject || '',
      body: template.body,
    });
    setShowTemplateDialog(true);
  }, []);

  const handleSaveTemplate = useCallback(async () => {
    if (!templateForm.name.trim() || !templateForm.body.trim()) return;

    setIsTemplateSubmitting(true);
    try {
      if (editingTemplate) {
        await messagingApi.updateTemplate(editingTemplate.id, {
          name: templateForm.name,
          channel: templateForm.channel,
          type: templateForm.type,
          subject: templateForm.channel === 'EMAIL' ? templateForm.subject : undefined,
          body: templateForm.body,
        });
      } else {
        await messagingApi.createTemplate({
          name: templateForm.name,
          channel: templateForm.channel,
          type: templateForm.type,
          subject: templateForm.channel === 'EMAIL' ? templateForm.subject : undefined,
          body: templateForm.body,
        });
      }
      setShowTemplateDialog(false);
      refetchTemplates();
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setIsTemplateSubmitting(false);
    }
  }, [editingTemplate, templateForm, refetchTemplates]);

  const handleDeleteTemplate = useCallback(async (id: string) => {
    setIsDeletingTemplate(true);
    try {
      await messagingApi.deleteTemplate(id);
      setShowDeleteConfirm(null);
      refetchTemplates();
    } catch (err) {
      console.error('Failed to delete template:', err);
    } finally {
      setIsDeletingTemplate(false);
    }
  }, [refetchTemplates]);

  const handleApplyTemplate = useCallback((template: MsgTemplate) => {
    setChannel(template.channel);
    setSubject(template.subject || '');
    setMessageBody(template.body);
    setActiveTab('send');
  }, []);

  // ---- Loading / guard ---------------------------------------------------

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // ---- Render ------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messaging</h1>
        <p className="text-gray-500">Send messages to patients and manage templates</p>
      </div>

      {/* Configuration status banner */}
      {!statusLoading && (!emailConfigured || !smsConfigured || !whatsappConfigured) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800">Messaging configuration incomplete</p>
              <div className="text-sm text-amber-700 space-y-0.5">
                {!emailConfigured && (
                  <p className="flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5" />
                    Email sending is not configured. Contact your administrator to set up SMTP settings.
                  </p>
                )}
                {!smsConfigured && (
                  <p className="flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5" />
                    SMS sending is not configured. Contact your administrator to set up an SMS provider.
                  </p>
                )}
                {!whatsappConfigured && (
                  <p className="flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5" />
                    WhatsApp sending is not configured. Set up a Twilio WhatsApp number to enable.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="send" className="gap-1.5">
            <Send className="h-4 w-4" />
            Send Message
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Message History
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* TAB: Send Message                                               */}
        {/* ============================================================== */}
        <TabsContent value="send" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                Compose and send a message to a patient via email, SMS, or WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Send result banner */}
              {sendResult && (
                <div
                  className={`rounded-lg border p-3 flex items-center gap-2 text-sm ${
                    sendResult.type === 'success'
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {sendResult.type === 'success' ? (
                    <Check className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {sendResult.message}
                </div>
              )}

              {/* Patient search */}
              <div className="space-y-2">
                <Label htmlFor="patient-search">Patient *</Label>
                <div ref={patientSearchRef} className="relative">
                  {selectedPatient ? (
                    <div className="flex items-center justify-between rounded-md border px-3 py-2 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                          {selectedPatient.firstName[0]}
                          {selectedPatient.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {selectedPatient.firstName} {selectedPatient.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedPatient.email || selectedPatient.phone || 'No contact info'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleClearPatient}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="patient-search"
                        placeholder="Search patients by name..."
                        className="pl-9"
                        value={patientSearch}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setShowPatientResults(true);
                        }}
                        onFocus={() => {
                          if (patientSearch.length >= 2) setShowPatientResults(true);
                        }}
                      />
                      {/* Patient search results dropdown */}
                      {showPatientResults && patientSearch.length >= 2 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto">
                          {patientsLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              <span className="ml-2 text-sm text-gray-500">Searching...</span>
                            </div>
                          ) : patients.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-gray-500 text-center">
                              No patients found
                            </div>
                          ) : (
                            patients.map((patient) => (
                              <button
                                key={patient.id}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                                onClick={() => handleSelectPatient(patient)}
                              >
                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                                  {patient.firstName[0]}
                                  {patient.lastName[0]}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {patient.firstName} {patient.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {patient.email || patient.phone || 'No contact info'}
                                  </p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Channel toggle */}
              <div className="space-y-2">
                <Label>Channel *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={channel === 'EMAIL' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setChannel('EMAIL')}
                    disabled={!emailConfigured}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={channel === 'SMS' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setChannel('SMS')}
                    disabled={!smsConfigured}
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    type="button"
                    variant={channel === 'WHATSAPP' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setChannel('WHATSAPP')}
                    disabled={!whatsappConfigured}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
                {channel === 'EMAIL' && !emailConfigured && (
                  <p className="text-xs text-red-500">Email is not configured for this practice.</p>
                )}
                {channel === 'SMS' && !smsConfigured && (
                  <p className="text-xs text-red-500">SMS is not configured for this practice.</p>
                )}
                {channel === 'WHATSAPP' && !whatsappConfigured && (
                  <p className="text-xs text-red-500">WhatsApp is not configured for this practice.</p>
                )}
              </div>

              {/* Subject (email only) */}
              {channel === 'EMAIL' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              {/* Message body */}
              <div className="space-y-2">
                <Label htmlFor="message-body">Message *</Label>
                <Textarea
                  id="message-body"
                  placeholder={
                    channel === 'SMS'
                      ? 'Enter your SMS message (max 160 characters recommended)...'
                      : channel === 'WHATSAPP'
                        ? 'Enter your WhatsApp message...'
                        : 'Enter your email message...'
                  }
                  className="min-h-[160px]"
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                />
                {channel === 'SMS' && (
                  <p className={`text-xs ${messageBody.length > 160 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {messageBody.length}/160 characters
                    {messageBody.length > 160 && ' (may be split into multiple SMS)'}
                  </p>
                )}
              </div>

              {/* Send button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    isSending ||
                    !selectedPatient ||
                    !messageBody.trim() ||
                    (channel === 'EMAIL' && !subject.trim()) ||
                    (channel === 'EMAIL' && !emailConfigured) ||
                    (channel === 'SMS' && !smsConfigured) ||
                    (channel === 'WHATSAPP' && !whatsappConfigured)
                  }
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB: Message History                                            */}
        {/* ============================================================== */}
        <TabsContent value="history" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                <Filter className="h-4 w-4" />
                Filters
              </div>
              <Select value={historyChannelFilter} onValueChange={(v) => { setHistoryChannelFilter(v); setHistoryPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              <Select value={historyStatusFilter} onValueChange={(v) => { setHistoryStatusFilter(v); setHistoryPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="BOUNCED">Bounced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* History list */}
          {historyLoading ? (
            <HistoryTableSkeleton />
          ) : historyError ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">Failed to load message history</p>
              <Button variant="outline" size="sm" onClick={() => refetchHistory()}>
                Try Again
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                {historyChannelFilter !== 'all' || historyStatusFilter !== 'all'
                  ? 'No messages match your filters'
                  : 'No messages sent yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg border overflow-hidden">
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50/60">
                        <th className="text-left font-medium text-gray-500 px-4 py-3">Recipient</th>
                        <th className="text-left font-medium text-gray-500 px-4 py-3">Channel</th>
                        <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                        <th className="text-left font-medium text-gray-500 px-4 py-3">Subject / Preview</th>
                        <th className="text-left font-medium text-gray-500 px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {messages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            {msg.patient
                              ? `${msg.patient.firstName} ${msg.patient.lastName}`
                              : msg.recipient}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className={CHANNEL_COLORS[msg.channel] || ''}>
                              {msg.channel === 'EMAIL' ? (
                                <Mail className="h-3 w-3 mr-1" />
                              ) : msg.channel === 'WHATSAPP' ? (
                                <MessageSquare className="h-3 w-3 mr-1" />
                              ) : (
                                <Smartphone className="h-3 w-3 mr-1" />
                              )}
                              {msg.channel}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className={MESSAGE_STATUS_COLORS[msg.status] || ''}>
                              {msg.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 max-w-xs truncate text-gray-600">
                            {msg.subject || msg.body}
                          </td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {format(new Date(msg.sentAt || msg.createdAt), 'dd MMM yyyy, HH:mm')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {msg.patient
                            ? `${msg.patient.firstName} ${msg.patient.lastName}`
                            : msg.recipient}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(msg.sentAt || msg.createdAt), 'dd MMM, HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`text-xs ${CHANNEL_COLORS[msg.channel] || ''}`}>
                          {msg.channel}
                        </Badge>
                        <Badge variant="secondary" className={`text-xs ${MESSAGE_STATUS_COLORS[msg.status] || ''}`}>
                          {msg.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {msg.subject || msg.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalHistoryPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-gray-500">
                    Page {historyPage} of {totalHistoryPages}
                    {historyData?.total !== undefined && (
                      <span className="ml-1">({historyData.total} total messages)</span>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage <= 1}
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage >= totalHistoryPages}
                      onClick={() => setHistoryPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB: Templates                                                  */}
        {/* ============================================================== */}
        <TabsContent value="templates" className="mt-6 space-y-4">
          {/* Header with create button (admin only) */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Message Templates</h2>
              <p className="text-sm text-gray-500">
                Reusable templates for common patient communications
              </p>
            </div>
            {isAdmin && (
              <Button onClick={handleOpenCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            )}
          </div>

          {/* Templates list */}
          {templatesLoading ? (
            <TemplateSkeleton />
          ) : templatesError ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">Failed to load templates</p>
              <Button variant="outline" size="sm" onClick={() => refetchTemplates()}>
                Try Again
              </Button>
            </div>
          ) : !templates || templates.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No templates created yet</p>
              {isAdmin && (
                <Button variant="outline" size="sm" className="mt-3" onClick={handleOpenCreateTemplate}>
                  Create First Template
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base leading-snug">{template.name}</CardTitle>
                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleOpenEditTemplate(template)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setShowDeleteConfirm(template.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <Badge variant="secondary" className={CHANNEL_COLORS[template.channel] || ''}>
                        {template.channel === 'EMAIL' ? (
                          <Mail className="h-3 w-3 mr-1" />
                        ) : template.channel === 'WHATSAPP' ? (
                          <MessageSquare className="h-3 w-3 mr-1" />
                        ) : (
                          <Smartphone className="h-3 w-3 mr-1" />
                        )}
                        {template.channel}
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {TEMPLATE_TYPE_OPTIONS.find((t) => t.value === template.type)?.label || template.type}
                      </Badge>
                      {template.isDefault && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Default
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {template.subject && (
                      <p className="text-sm font-medium text-gray-700 mb-1 truncate">
                        Subject: {template.subject}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-3">{template.body}</p>
                  </CardContent>
                  <div className="px-6 pb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleApplyTemplate(template)}
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Use Template
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ================================================================ */}
      {/* Dialog: Create / Edit Template                                    */}
      {/* ================================================================ */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? 'Update the message template details.'
                : 'Create a new reusable message template.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g. Appointment Reminder"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-channel">Channel *</Label>
                <Select
                  value={templateForm.channel}
                  onValueChange={(v) =>
                    setTemplateForm({ ...templateForm, channel: v as 'EMAIL' | 'SMS' | 'WHATSAPP' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-type">Type *</Label>
                <Select
                  value={templateForm.type}
                  onValueChange={(v) => setTemplateForm({ ...templateForm, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {templateForm.channel === 'EMAIL' && (
              <div className="space-y-2">
                <Label htmlFor="template-subject">Subject</Label>
                <Input
                  id="template-subject"
                  placeholder="Email subject line..."
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="template-body">Body *</Label>
              <Textarea
                id="template-body"
                placeholder="Template message body..."
                className="min-h-[120px]"
                value={templateForm.body}
                onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                You can use placeholders: {'{{patientName}}'}, {'{{appointmentDate}}'}, {'{{appointmentTime}}'}, {'{{practiceName}}'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={
                isTemplateSubmitting || !templateForm.name.trim() || !templateForm.body.trim()
              }
            >
              {isTemplateSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingTemplate ? (
                'Save Changes'
              ) : (
                'Create Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* Dialog: Confirm Delete Template                                   */}
      {/* ================================================================ */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeletingTemplate}
              onClick={() => showDeleteConfirm && handleDeleteTemplate(showDeleteConfirm)}
            >
              {isDeletingTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
