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
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Patient {
  id: string;
  nhsNumber?: string;
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

// Base fetch function
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
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
