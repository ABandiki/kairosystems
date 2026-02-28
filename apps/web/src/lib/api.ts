// API Client for Kairo Healthcare System

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  practiceId: string;
  avatar?: string;
  subscriptionTier?: 'STARTER' | 'PROFESSIONAL' | 'CUSTOM';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Patient {
  id: string;
  patientNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
  status: string;
  registeredGp?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  alerts?: PatientAlert[];
  _count?: {
    appointments: number;
  };
}

export interface PatientAlert {
  id: string;
  type: string;
  severity: string;
  description: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  clinicianId: string;
  appointmentType: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  duration: number;
  reason?: string;
  notes?: string;
  isUrgent: boolean;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone?: string;
  };
  clinician?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  room?: {
    id: string;
    name: string;
  };
}

export interface Staff {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatar?: string;
  gmcNumber?: string;
  nmcNumber?: string;
  isActive: boolean;
  workingHours?: WorkingHours[];
}

export interface WorkingHours {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Practice {
  id: string;
  name: string;
  odsCode: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  postcode: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  odsCode?: string;
  addressLine1: string;
  city: string;
  postcode: string;
  phone: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface AppointmentTypeSetting {
  id: string;
  type: string;
  label: string;
  code: string;
  defaultDuration: number;
  color: string;
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  todayTotal: number;
  todayPending: number;
  todayCompleted: number;
  monthMissed: number;
  monthCancelled: number;
}

export interface PatientStats {
  totalPatients: number;
  activePatients: number;
  registeredToday: number;
}

// API Error class
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management
let accessToken: string | null = null;
let deviceFingerprint: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('access_token');
  }
  return accessToken;
}

export function setDeviceFingerprint(fingerprint: string | null) {
  deviceFingerprint = fingerprint;
  if (typeof window !== 'undefined' && fingerprint) {
    localStorage.setItem('device_fingerprint', fingerprint);
  }
}

export function getDeviceFingerprint(): string | null {
  if (deviceFingerprint) return deviceFingerprint;
  if (typeof window !== 'undefined') {
    deviceFingerprint = localStorage.getItem('device_fingerprint');
  }
  return deviceFingerprint;
}

// Base fetch function
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const fingerprint = getDeviceFingerprint();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  // Include device fingerprint for device verification
  if (fingerprint) {
    (headers as Record<string, string>)['X-Device-Fingerprint'] = fingerprint;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    // If unauthorized, clear the token to trigger re-login
    if (response.status === 401) {
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    }

    console.error(`API Error ${response.status}: ${errorMessage}`, { endpoint, errorText });
    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(response.access_token);
    return response;
  },

  getProfile: async (): Promise<User> => {
    return apiFetch<User>('/auth/profile');
  },

  logout: () => {
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },
};

// Patients API
export const patientsApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    registeredGpId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Patient>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.registeredGpId) searchParams.set('registeredGpId', params.registeredGpId);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<Patient>>(`/patients${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<Patient> => {
    return apiFetch<Patient>(`/patients/${id}`);
  },

  create: async (data: Partial<Patient>): Promise<Patient> => {
    return apiFetch<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    return apiFetch<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getStats: async (): Promise<PatientStats> => {
    return apiFetch<PatientStats>('/patients/stats');
  },

  addAlert: async (patientId: string, data: {
    type: string;
    severity: string;
    description: string;
  }): Promise<PatientAlert> => {
    return apiFetch<PatientAlert>(`/patients/${patientId}/alerts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Appointments API
export const appointmentsApi = {
  getAll: async (params?: {
    startDate?: string;
    endDate?: string;
    clinicianId?: string;
    patientId?: string;
    status?: string[];
  }): Promise<PaginatedResponse<Appointment>> => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.clinicianId) searchParams.set('clinicianId', params.clinicianId);
    if (params?.patientId) searchParams.set('patientId', params.patientId);
    if (params?.status) {
      params.status.forEach(s => searchParams.append('status', s));
    }

    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<Appointment>>(`/appointments${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<Appointment> => {
    return apiFetch<Appointment>(`/appointments/${id}`);
  },

  create: async (data: {
    patientId: string;
    clinicianId: string;
    appointmentType: string;
    scheduledStart: string;
    duration: number;
    reason?: string;
    roomId?: string;
  }): Promise<Appointment> => {
    return apiFetch<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  checkIn: async (id: string): Promise<Appointment> => {
    return apiFetch<Appointment>(`/appointments/${id}/check-in`, {
      method: 'PUT',
    });
  },

  start: async (id: string): Promise<Appointment> => {
    return apiFetch<Appointment>(`/appointments/${id}/start`, {
      method: 'PUT',
    });
  },

  complete: async (id: string): Promise<Appointment> => {
    return apiFetch<Appointment>(`/appointments/${id}/complete`, {
      method: 'PUT',
    });
  },

  cancel: async (id: string): Promise<Appointment> => {
    return apiFetch<Appointment>(`/appointments/${id}/cancel`, {
      method: 'PUT',
    });
  },

  markDna: async (id: string): Promise<Appointment> => {
    return apiFetch<Appointment>(`/appointments/${id}/dna`, {
      method: 'PUT',
    });
  },

  getStats: async (): Promise<DashboardStats> => {
    return apiFetch<DashboardStats>('/appointments/stats');
  },
};

// Staff API
export const staffApi = {
  getAll: async (role?: string): Promise<Staff[]> => {
    const query = role ? `?role=${role}` : '';
    return apiFetch<Staff[]>(`/staff${query}`);
  },

  getClinicians: async (): Promise<Staff[]> => {
    return apiFetch<Staff[]>('/staff/clinicians');
  },

  getById: async (id: string): Promise<Staff> => {
    return apiFetch<Staff>(`/staff/${id}`);
  },

  create: async (data: Partial<Staff>): Promise<Staff> => {
    return apiFetch<Staff>('/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Staff>): Promise<Staff> => {
    return apiFetch<Staff>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateWorkingHours: async (id: string, workingHours: WorkingHours[]): Promise<Staff> => {
    return apiFetch<Staff>(`/staff/${id}/working-hours`, {
      method: 'PUT',
      body: JSON.stringify({ workingHours }),
    });
  },
};

// Practice API
export const practiceApi = {
  getCurrent: async (): Promise<Practice> => {
    return apiFetch<Practice>('/practices/current');
  },

  update: async (data: Partial<Practice>): Promise<Practice> => {
    return apiFetch<Practice>('/practices/current', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getPharmacies: async (): Promise<Pharmacy[]> => {
    return apiFetch<Pharmacy[]>('/practices/current/pharmacies');
  },

  createPharmacy: async (data: Partial<Pharmacy>): Promise<Pharmacy> => {
    return apiFetch<Pharmacy>('/practices/current/pharmacies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getRooms: async (): Promise<Room[]> => {
    return apiFetch<Room[]>('/practices/current/rooms');
  },

  createRoom: async (data: { name: string; description?: string }): Promise<Room> => {
    return apiFetch<Room>('/practices/current/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRoom: async (id: string, data: Partial<Room>): Promise<Room> => {
    return apiFetch<Room>(`/practices/current/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updatePharmacy: async (id: string, data: Partial<Pharmacy>): Promise<Pharmacy> => {
    return apiFetch<Pharmacy>(`/practices/current/pharmacies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getAppointmentTypes: async (): Promise<AppointmentTypeSetting[]> => {
    return apiFetch<AppointmentTypeSetting[]>('/practices/current/appointment-types');
  },

  createAppointmentType: async (data: {
    type: string;
    label: string;
    code: string;
    defaultDuration: number;
    color: string;
  }): Promise<AppointmentTypeSetting> => {
    return apiFetch<AppointmentTypeSetting>('/practices/current/appointment-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAppointmentType: async (id: string, data: Partial<AppointmentTypeSetting>): Promise<void> => {
    return apiFetch<void>(`/practices/current/appointment-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Note type
export interface Note {
  id: string;
  title: string;
  content: string;
  noteType: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  createdBy: string;
  colorCode?: string;
  headerImage?: string;
  footerImage?: string;
}

// Notes API
export const notesApi = {
  getAll: async (params?: {
    search?: string;
    noteType?: string;
    patientId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Note>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.noteType) searchParams.set('noteType', params.noteType);
    if (params?.patientId) searchParams.set('patientId', params.patientId);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<Note>>(`/notes${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<Note> => {
    return apiFetch<Note>(`/notes/${id}`);
  },

  create: async (data: {
    title: string;
    content: string;
    noteType: string;
    patientId: string;
    colorCode?: string;
    headerImage?: string;
    footerImage?: string;
    appointmentId?: string;
  }): Promise<Note> => {
    return apiFetch<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Note>): Promise<Note> => {
    return apiFetch<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Form Template types
export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: 'INTAKE' | 'ASSESSMENT' | 'CONSENT' | 'QUESTIONNAIRE' | 'CUSTOM';
  status: 'ACTIVE' | 'DRAFT';
  language: string;
  isPublic: boolean;
  questions: any[];
  questionCount: number;
  lastModified: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

// Form Templates API
export const formTemplatesApi = {
  getAll: async (params?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<FormTemplate>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<FormTemplate>>(`/form-templates${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<FormTemplate> => {
    return apiFetch<FormTemplate>(`/form-templates/${id}`);
  },

  create: async (data: {
    name: string;
    description?: string;
    category?: string;
    status?: string;
    language?: string;
    isPublic?: boolean;
    questions?: any[];
  }): Promise<FormTemplate> => {
    return apiFetch<FormTemplate>('/form-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<FormTemplate>): Promise<FormTemplate> => {
    return apiFetch<FormTemplate>(`/form-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  duplicate: async (id: string): Promise<FormTemplate> => {
    return apiFetch<FormTemplate>(`/form-templates/${id}/duplicate`, {
      method: 'POST',
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/form-templates/${id}`, {
      method: 'DELETE',
    });
  },
};

// Invoice types
export interface InvoiceItem {
  id: string;
  description: string;
  code?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  subtotal: number;
  tax: number;
  discount: number;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentMethod?: string;
  notes?: string;
  items: InvoiceItem[];
  createdBy: string;
  createdAt: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    city?: string;
    postcode?: string;
  };
}

export interface BillingStats {
  billedThisMonth: number;
  collectedThisMonth: number;
  outstandingBalance: number;
}

// Invoices API
export const invoicesApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Invoice>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.patientId) searchParams.set('patientId', params.patientId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<Invoice>>(`/invoices${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<Invoice> => {
    return apiFetch<Invoice>(`/invoices/${id}`);
  },

  getStats: async (): Promise<BillingStats> => {
    return apiFetch<BillingStats>('/invoices/stats');
  },

  create: async (data: {
    patientId: string;
    appointmentId?: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    paymentMethod?: string;
    notes?: string;
    items: Array<{
      description: string;
      code?: string;
      quantity: number;
      unitPrice: number;
    }>;
    tax?: number;
    discount?: number;
  }): Promise<Invoice> => {
    return apiFetch<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
    return apiFetch<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/invoices/${id}`, {
      method: 'DELETE',
    });
  },

  // Billing PIN
  getBillingPinStatus: async (): Promise<{ hasPinSet: boolean; canBypass: boolean }> => {
    return apiFetch('/invoices/billing-pin/status');
  },

  verifyBillingPin: async (pin: string): Promise<{ verified: boolean }> => {
    return apiFetch('/invoices/billing-pin/verify', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },

  setBillingPin: async (pin: string): Promise<{ success: boolean }> => {
    return apiFetch('/invoices/billing-pin/set', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },

  removeBillingPin: async (): Promise<{ success: boolean }> => {
    return apiFetch('/invoices/billing-pin', {
      method: 'DELETE',
    });
  },
};

// ==================== MESSAGING ====================

export interface MessageLog {
  id: string;
  patientId: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
  recipient: string;
  subject?: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED';
  statusDetail?: string;
  sentById?: string;
  appointmentId?: string;
  sentAt?: string;
  createdAt: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  sentBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface MsgTemplate {
  id: string;
  name: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
  type: string;
  subject?: string;
  body: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface MessagingStatus {
  emailConfigured: boolean;
  smsConfigured: boolean;
  whatsappConfigured: boolean;
}

export const messagingApi = {
  sendMessage: async (data: {
    patientId: string;
    channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
    subject?: string;
    body: string;
  }): Promise<any> => {
    return apiFetch('/messaging/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  sendConfirmation: async (appointmentId: string): Promise<any> => {
    return apiFetch(`/messaging/appointment/${appointmentId}/confirm`, {
      method: 'POST',
    });
  },

  sendReminder: async (appointmentId: string): Promise<any> => {
    return apiFetch(`/messaging/appointment/${appointmentId}/remind`, {
      method: 'POST',
    });
  },

  getHistory: async (params?: {
    patientId?: string;
    channel?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<MessageLog>> => {
    const searchParams = new URLSearchParams();
    if (params?.patientId) searchParams.set('patientId', params.patientId);
    if (params?.channel) searchParams.set('channel', params.channel);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    return apiFetch(`/messaging/history${query ? `?${query}` : ''}`);
  },

  getMessageById: async (id: string): Promise<MessageLog> => {
    return apiFetch(`/messaging/history/${id}`);
  },

  getTemplates: async (): Promise<MsgTemplate[]> => {
    return apiFetch('/messaging/templates');
  },

  createTemplate: async (data: Partial<MsgTemplate>): Promise<MsgTemplate> => {
    return apiFetch('/messaging/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTemplate: async (id: string, data: Partial<MsgTemplate>): Promise<MsgTemplate> => {
    return apiFetch(`/messaging/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTemplate: async (id: string): Promise<void> => {
    return apiFetch(`/messaging/templates/${id}`, {
      method: 'DELETE',
    });
  },

  getStatus: async (): Promise<MessagingStatus> => {
    return apiFetch('/messaging/status');
  },
};

// ==================== NOTIFICATIONS ====================

export const notificationsApi = {
  getAll: async (params?: {
    unreadOnly?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<AppNotification>> => {
    const searchParams = new URLSearchParams();
    if (params?.unreadOnly) searchParams.set('unreadOnly', 'true');
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    return apiFetch(`/notifications${query ? `?${query}` : ''}`);
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    return apiFetch('/notifications/unread-count');
  },

  markAsRead: async (id: string): Promise<void> => {
    return apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
  },

  markAllAsRead: async (): Promise<void> => {
    return apiFetch('/notifications/read-all', { method: 'PUT' });
  },

  dismiss: async (id: string): Promise<void> => {
    return apiFetch(`/notifications/${id}`, { method: 'DELETE' });
  },
};

// Device types
export interface Device {
  id: string;
  deviceFingerprint: string;
  deviceName: string;
  deviceType: string;
  status: 'PENDING' | 'APPROVED' | 'REVOKED';
  approvedAt?: string;
  lastUsedAt?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DeviceCheckResult {
  registered: boolean;
  approved: boolean;
  status?: string;
  deviceId?: string;
  deviceName?: string;
  message: string;
}

// Devices API
export const devicesApi = {
  getAll: async (): Promise<Device[]> => {
    return apiFetch<Device[]>('/devices');
  },

  approve: async (deviceId: string): Promise<Device> => {
    return apiFetch<Device>(`/devices/${deviceId}/approve`, {
      method: 'PUT',
    });
  },

  revoke: async (deviceId: string, reason?: string): Promise<Device> => {
    return apiFetch<Device>(`/devices/${deviceId}/revoke`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },
};

// Onboarding types
export interface PracticeRegistrationData {
  practiceName: string;
  practiceEmail: string;
  practicePhone: string;
  odsCode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county?: string;
  postcode: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  deviceFingerprint: string;
  deviceName: string;
  deviceType: string;
}

export interface PracticeRegistrationResponse {
  message: string;
  token: string;
  practice: {
    id: string;
    name: string;
    email: string;
    subscriptionTier: string;
  };
  user: User;
  device: {
    id: string;
    deviceName: string;
    status: string;
  };
}

// Onboarding API
export const onboardingApi = {
  registerPractice: async (data: PracticeRegistrationData): Promise<PracticeRegistrationResponse> => {
    const response = await apiFetch<PracticeRegistrationResponse>('/onboarding/register-practice', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Set the token from registration
    setAccessToken(response.token);
    return response;
  },

  requestDevice: async (data: {
    practiceId: string;
    deviceFingerprint: string;
    deviceName: string;
    deviceType: string;
  }): Promise<{ status: string; message: string; device: Device }> => {
    return apiFetch('/onboarding/request-device', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  checkDevice: async (practiceId: string, deviceFingerprint: string): Promise<DeviceCheckResult> => {
    return apiFetch<DeviceCheckResult>(
      `/onboarding/check-device?practiceId=${encodeURIComponent(practiceId)}&deviceFingerprint=${encodeURIComponent(deviceFingerprint)}`
    );
  },

  lookupPractice: async (email: string): Promise<{ id: string; name: string; email: string; isActive: boolean }> => {
    return apiFetch(`/onboarding/practice-lookup?email=${encodeURIComponent(email)}`);
  },
};

// Staff usage stats type
export interface StaffUsage {
  currentCount: number;
  maxIncluded: number;
  extraCount: number;
  subscriptionTier: string;
  isAtLimit: boolean;
  breakdown: Array<{ role: string; count: number }>;
}

// Staff API additions
export const staffUsageApi = {
  getUsage: async (): Promise<StaffUsage> => {
    return apiFetch<StaffUsage>('/staff/usage');
  },
};

// Prescription types
export interface PrescriptionItem {
  id?: string;
  medication: string;
  dosage: string;
  frequency: string;
  route?: string;
  quantity?: number;
  unit?: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  type: 'ACUTE' | 'REPEAT';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate?: string;
  reviewDate?: string;
  notes?: string;
  issuedAt: string;
  items: PrescriptionItem[];
  patientId: string;
  patientName?: string;
  prescriberId: string;
  prescriberName?: string;
}

// Prescriptions API
export const prescriptionsApi = {
  getAll: async (params?: {
    search?: string;
    type?: string;
    status?: string;
    patientId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Prescription>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.patientId) searchParams.set('patientId', params.patientId);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<Prescription>>(`/prescriptions${query ? `?${query}` : ''}`);
  },
  getById: async (id: string): Promise<Prescription> => {
    return apiFetch<Prescription>(`/prescriptions/${id}`);
  },
  create: async (data: any): Promise<Prescription> => {
    return apiFetch<Prescription>('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: any): Promise<Prescription> => {
    return apiFetch<Prescription>(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/prescriptions/${id}`, { method: 'DELETE' });
  },
};

// Documents API
export interface Document {
  id: string;
  type: string;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  patientId: string;
  patientName?: string;
  uploadedByName?: string;
}

export const documentsApi = {
  getAll: async (params?: {
    patientId?: string;
    type?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Document>> => {
    const searchParams = new URLSearchParams();
    if (params?.patientId) searchParams.set('patientId', params.patientId);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<Document>>(`/documents${query ? `?${query}` : ''}`);
  },
  create: async (data: any): Promise<Document> => {
    return apiFetch<Document>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/documents/${id}`, { method: 'DELETE' });
  },
};

// Medical History API
export interface MedicalHistoryEntry {
  id?: string;
  condition: string;
  diagnosedDate?: string;
  status: string;
  notes?: string;
}

export const medicalHistoryApi = {
  getByPatient: async (patientId: string): Promise<MedicalHistoryEntry[]> => {
    return apiFetch<MedicalHistoryEntry[]>(`/patients/${patientId}/medical-history`);
  },
  update: async (patientId: string, entries: MedicalHistoryEntry[]): Promise<MedicalHistoryEntry[]> => {
    return apiFetch<MedicalHistoryEntry[]>(`/patients/${patientId}/medical-history`, {
      method: 'PUT',
      body: JSON.stringify({ entries }),
    });
  },
};

// Dashboard Tasks API
export interface DashboardTask {
  type: string;
  label: string;
  count: number;
  route: string;
  color: string;
}

export const dashboardApi = {
  getTasks: async (): Promise<DashboardTask[]> => {
    return apiFetch<DashboardTask[]>('/dashboard/tasks');
  },
};

// Practice Analytics API
export interface PracticeAnalytics {
  patientDemographics: { gender: Record<string, number>; ageGroups: Record<string, number> };
  appointmentStats: { byType: Record<string, number>; byClinician: Array<{ name: string; count: number }>; completionRate: number; dnaRate: number };
  revenueStats: { monthly: Array<{ month: string; amount: number }>; byMethod: Record<string, number> };
  staffWorkload: Array<{ name: string; appointments: number; patients: number }>;
}

export const reportsApi = {
  getAnalytics: async (): Promise<PracticeAnalytics> => {
    return apiFetch<PracticeAnalytics>('/practices/current/analytics');
  },
};

// Form Submission types
export interface FormSubmission {
  id: string;
  templateId: string;
  patientId: string;
  submittedById?: string;
  answers: Record<string, any>;
  score?: number | null;
  scoreDetails?: {
    totalScore: number;
    maxPossibleScore: number;
    questionScores: Array<{ questionId: string; value: number; maxValue: number }>;
  } | null;
  createdAt: string;
  updatedAt: string;
  patientName?: string;
  templateName?: string;
  submittedByName?: string | null;
  template?: {
    id: string;
    name: string;
    category: string;
    description?: string;
    questions?: any[];
    questionCount?: number;
  };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
  };
  submittedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface TemplateStats {
  totalSubmissions: number;
  averageScore: number | null;
  scoreDistribution: Record<string, number>;
  lastSubmittedAt: string | null;
}

// Form Submissions API
export const formSubmissionsApi = {
  getAll: async (params?: {
    search?: string;
    patientId?: string;
    templateId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<FormSubmission>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.patientId) searchParams.set('patientId', params.patientId);
    if (params?.templateId) searchParams.set('templateId', params.templateId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<FormSubmission>>(`/form-submissions${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<FormSubmission> => {
    return apiFetch<FormSubmission>(`/form-submissions/${id}`);
  },

  getByPatient: async (patientId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<FormSubmission>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    return apiFetch<PaginatedResponse<FormSubmission>>(`/form-submissions/patient/${patientId}${query ? `?${query}` : ''}`);
  },

  getTemplateStats: async (templateId: string): Promise<TemplateStats> => {
    return apiFetch<TemplateStats>(`/form-submissions/template/${templateId}/stats`);
  },

  create: async (data: {
    templateId: string;
    patientId: string;
    answers: Record<string, any>;
    score?: number;
    scoreDetails?: any;
  }): Promise<FormSubmission> => {
    return apiFetch<FormSubmission>('/form-submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    answers?: Record<string, any>;
    score?: number;
    scoreDetails?: any;
  }): Promise<FormSubmission> => {
    return apiFetch<FormSubmission>(`/form-submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/form-submissions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Auth additions
export const authPasswordApi = {
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    return apiFetch('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};
