'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  patientsApi,
  appointmentsApi,
  staffApi,
  practiceApi,
  notesApi,
  formTemplatesApi,
  formSubmissionsApi,
  invoicesApi,
  messagingApi,
  notificationsApi,
  prescriptionsApi,
  documentsApi,
  Patient,
  Appointment,
  Staff,
  Practice,
  Pharmacy,
  Room,
  AppointmentTypeSetting,
  DashboardStats,
  PatientStats,
  Note,
  FormTemplate,
  FormSubmission,
  Invoice,
  BillingStats,
  MessageLog,
  MsgTemplate,
  AppNotification,
  MessagingStatus,
  Prescription,
  PaginatedResponse,
  getAccessToken,
  ApiError,
} from '@/lib/api';
import type { Document as KairoDocument } from '@/lib/api';

// Generic hook for fetching data - only fetches when enabled
function useApiQuery<T>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  // Clear error when deps change to allow retry
  useEffect(() => {
    setError(null);
  }, deps);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!enabled) {
        setIsLoading(false);
        return;
      }

      // Check if we have a token before making requests
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          // Don't set error for 401 - it will trigger a re-login
          if (err instanceof ApiError && err.status === 401) {
            setData(null);
          } else {
            setError(err instanceof Error ? err : new Error('Unknown error'));
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [...deps, enabled]);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      // Don't set error for 401 - it will trigger a re-login
      if (err instanceof ApiError && err.status === 401) {
        setData(null);
      } else {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [...deps, enabled]);

  return { data, isLoading, error, refetch };
}

// Patient hooks
export function usePatients(params?: {
  search?: string;
  status?: string;
  registeredGpId?: string;
  page?: number;
  pageSize?: number;
}, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Patient>>(
    () => patientsApi.getAll(params),
    [params?.search, params?.status, params?.registeredGpId, params?.page, params?.pageSize],
    enabled
  );
}

export function usePatient(id: string, enabled: boolean = true) {
  return useApiQuery<Patient>(() => patientsApi.getById(id), [id], enabled && !!id);
}

export function usePatientStats(enabled: boolean = true) {
  return useApiQuery<PatientStats>(() => patientsApi.getStats(), [], enabled);
}

// Appointment hooks
export function useAppointments(params?: {
  startDate?: string;
  endDate?: string;
  clinicianId?: string;
  patientId?: string;
  status?: string[];
}, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Appointment>>(
    () => appointmentsApi.getAll(params),
    [params?.startDate, params?.endDate, params?.clinicianId, params?.patientId, JSON.stringify(params?.status)],
    enabled
  );
}

export function useAppointment(id: string, enabled: boolean = true) {
  return useApiQuery<Appointment>(() => appointmentsApi.getById(id), [id], enabled && !!id);
}

export function useAppointmentStats(enabled: boolean = true) {
  return useApiQuery<DashboardStats>(() => appointmentsApi.getStats(), [], enabled);
}

// Staff hooks
export function useStaff(role?: string, enabled: boolean = true) {
  return useApiQuery<Staff[]>(() => staffApi.getAll(role), [role], enabled);
}

export function useClinicians(enabled: boolean = true) {
  return useApiQuery<Staff[]>(() => staffApi.getClinicians(), [], enabled);
}

export function useStaffMember(id: string, enabled: boolean = true) {
  return useApiQuery<Staff>(() => staffApi.getById(id), [id], enabled && !!id);
}

// Practice hooks
export function usePractice(enabled: boolean = true) {
  return useApiQuery<Practice>(() => practiceApi.getCurrent(), [], enabled);
}

export function usePharmacies(enabled: boolean = true) {
  return useApiQuery<Pharmacy[]>(() => practiceApi.getPharmacies(), [], enabled);
}

export function useRooms(enabled: boolean = true) {
  return useApiQuery<Room[]>(() => practiceApi.getRooms(), [], enabled);
}

export function useAppointmentTypes(enabled: boolean = true) {
  return useApiQuery<AppointmentTypeSetting[]>(() => practiceApi.getAppointmentTypes(), [], enabled);
}

// Today's appointments
export function useTodayAppointments(enabled: boolean = true) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return useAppointments({
    startDate: today.toISOString(),
    endDate: tomorrow.toISOString(),
  }, enabled);
}

// Notes hooks
export function useNotes(params?: {
  search?: string;
  noteType?: string;
  patientId?: string;
  page?: number;
  pageSize?: number;
}, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Note>>(
    () => notesApi.getAll(params),
    [params?.search, params?.noteType, params?.patientId, params?.page, params?.pageSize],
    enabled
  );
}

export function useNote(id: string, enabled: boolean = true) {
  return useApiQuery<Note>(() => notesApi.getById(id), [id], enabled && !!id);
}

// Form Template hooks
export function useFormTemplates(params?: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<FormTemplate>>(
    () => formTemplatesApi.getAll(params),
    [params?.search, params?.category, params?.status, params?.page, params?.pageSize],
    enabled
  );
}

export function useFormTemplate(id: string, enabled: boolean = true) {
  return useApiQuery<FormTemplate>(() => formTemplatesApi.getById(id), [id], enabled && !!id);
}

// Invoice hooks
export function useInvoices(params?: {
  search?: string;
  status?: string;
  patientId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Invoice>>(
    () => invoicesApi.getAll(params),
    [params?.search, params?.status, params?.patientId, params?.startDate, params?.endDate, params?.page, params?.pageSize],
    enabled
  );
}

export function useInvoice(id: string, enabled: boolean = true) {
  return useApiQuery<Invoice>(() => invoicesApi.getById(id), [id], enabled && !!id);
}

export function useBillingStats(enabled: boolean = true) {
  return useApiQuery<BillingStats>(() => invoicesApi.getStats(), [], enabled);
}

// Messaging hooks
export function useMessageHistory(params?: {
  patientId?: string;
  channel?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<MessageLog>>(
    () => messagingApi.getHistory(params),
    [params?.patientId, params?.channel, params?.status, params?.page, params?.pageSize],
    enabled
  );
}

export function useMessageTemplates(enabled: boolean = true) {
  return useApiQuery<MsgTemplate[]>(() => messagingApi.getTemplates(), [], enabled);
}

export function useMessagingStatus(enabled: boolean = true) {
  return useApiQuery<MessagingStatus>(() => messagingApi.getStatus(), [], enabled);
}

// Notification hooks
export function useNotifications(params?: {
  unreadOnly?: boolean;
  page?: number;
  pageSize?: number;
}, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<AppNotification>>(
    () => notificationsApi.getAll(params),
    [params?.unreadOnly, params?.page, params?.pageSize],
    enabled
  );
}

export function useUnreadNotificationCount(enabled: boolean = true) {
  return useApiQuery<{ count: number }>(() => notificationsApi.getUnreadCount(), [], enabled);
}

// Prescription hooks
export function usePrescriptions(params?: {
  search?: string;
  type?: string;
  status?: string;
  patientId?: string;
  page?: number;
  pageSize?: number;
}, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<Prescription>>(
    () => prescriptionsApi.getAll(params),
    [params?.search, params?.type, params?.status, params?.patientId, params?.page, params?.pageSize],
    enabled
  );
}

export function usePrescription(id: string, enabled: boolean = true) {
  return useApiQuery<Prescription>(() => prescriptionsApi.getById(id), [id], enabled && !!id);
}

// Document hooks
export function useDocuments(params?: {
  patientId?: string;
  type?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<KairoDocument>>(
    () => documentsApi.getAll(params),
    [params?.patientId, params?.type, params?.search, params?.page, params?.pageSize],
    enabled
  );
}

// Form Submission hooks
export function useFormSubmissions(params?: {
  search?: string;
  patientId?: string;
  templateId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<FormSubmission>>(
    () => formSubmissionsApi.getAll(params),
    [params?.search, params?.patientId, params?.templateId, params?.startDate, params?.endDate, params?.page, params?.pageSize],
    enabled
  );
}

export function useFormSubmission(id: string, enabled: boolean = true) {
  return useApiQuery<FormSubmission>(
    () => formSubmissionsApi.getById(id),
    [id],
    enabled && !!id
  );
}

export function usePatientFormSubmissions(patientId: string, params?: {
  page?: number;
  pageSize?: number;
}, enabled: boolean = true) {
  return useApiQuery<PaginatedResponse<FormSubmission>>(
    () => formSubmissionsApi.getByPatient(patientId, params),
    [patientId, params?.page, params?.pageSize],
    enabled && !!patientId
  );
}
