// ============================================
// GP Practice Management System - Shared Types
// ============================================

// ==================== ENUMS ====================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  PRACTICE_ADMIN = 'PRACTICE_ADMIN',
  GP = 'GP',
  NURSE = 'NURSE',
  HCA = 'HCA', // Healthcare Assistant
  RECEPTIONIST = 'RECEPTIONIST',
  PRACTICE_MANAGER = 'PRACTICE_MANAGER',
}

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  CONFIRMED = 'CONFIRMED',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DNA = 'DNA', // Did Not Attend
  CANCELLED = 'CANCELLED',
}

export enum AppointmentType {
  GP_CONSULTATION = 'GP_CONSULTATION',
  GP_EXTENDED = 'GP_EXTENDED',
  GP_TELEPHONE = 'GP_TELEPHONE',
  GP_VIDEO = 'GP_VIDEO',
  NURSE_APPOINTMENT = 'NURSE_APPOINTMENT',
  NURSE_CHRONIC_DISEASE = 'NURSE_CHRONIC_DISEASE',
  HCA_BLOOD_TEST = 'HCA_BLOOD_TEST',
  HCA_HEALTH_CHECK = 'HCA_HEALTH_CHECK',
  VACCINATION = 'VACCINATION',
  SMEAR_TEST = 'SMEAR_TEST',
  MINOR_SURGERY = 'MINOR_SURGERY',
  HOME_VISIT = 'HOME_VISIT',
}

export enum PatientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DECEASED = 'DECEASED',
  TRANSFERRED = 'TRANSFERRED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum DocumentType {
  LAB_RESULT = 'LAB_RESULT',
  REFERRAL_LETTER = 'REFERRAL_LETTER',
  DISCHARGE_SUMMARY = 'DISCHARGE_SUMMARY',
  SCAN_REPORT = 'SCAN_REPORT',
  ECG = 'ECG',
  CONSENT_FORM = 'CONSENT_FORM',
  FIT_NOTE = 'FIT_NOTE',
  PATIENT_CORRESPONDENCE = 'PATIENT_CORRESPONDENCE',
  OTHER = 'OTHER',
}

export enum PrescriptionType {
  ACUTE = 'ACUTE',
  REPEAT = 'REPEAT',
}

export enum PrescriptionStatus {
  PENDING = 'PENDING',
  ISSUED = 'ISSUED',
  DISPENSED = 'DISPENSED',
  CANCELLED = 'CANCELLED',
}

// ==================== INTERFACES ====================

// Practice
export interface Practice {
  id: string;
  name: string;
  odsCode: string; // NHS ODS Code
  email: string;
  phone: string;
  address: Address;
  logo?: string;
  openingHours: OpeningHours[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export interface OpeningHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  isClosed: boolean;
}

// User / Staff
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  practiceId: string;
  phone?: string;
  avatar?: string;
  signature?: string;
  gmcNumber?: string; // For doctors
  nmcNumber?: string; // For nurses
  workingHours: WorkingHours[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomId?: string;
  isActive: boolean;
}

// Patient
export interface Patient {
  id: string;
  practiceId: string;
  nhsNumber?: string;
  title?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address: Address;
  preferredLanguage?: string;
  interpreterRequired: boolean;
  emergencyContact?: EmergencyContact;
  registeredGpId?: string;
  nominatedPharmacyId?: string;
  status: PatientStatus;
  alerts: PatientAlert[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface PatientAlert {
  id: string;
  type: 'ALLERGY' | 'SAFEGUARDING' | 'MEDICAL' | 'COMMUNICATION' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  createdAt: Date;
}

// Appointment
export interface Appointment {
  id: string;
  practiceId: string;
  patientId: string;
  patient?: Patient;
  clinicianId: string;
  clinician?: User;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  scheduledStart: Date;
  scheduledEnd: Date;
  duration: number; // minutes
  reason?: string;
  notes?: string;
  roomId?: string;
  isUrgent: boolean;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Consultation
export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  clinicianId: string;
  practiceId: string;
  consultationType: AppointmentType;
  presentingComplaint?: string;
  history?: string;
  examination?: string;
  diagnosis?: string;
  plan?: string;
  notes?: string;
  isSigned: boolean;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Prescription
export interface Prescription {
  id: string;
  patientId: string;
  prescriberId: string;
  practiceId: string;
  consultationId?: string;
  type: PrescriptionType;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  pharmacyId?: string;
  issuedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

// Document
export interface Document {
  id: string;
  patientId: string;
  practiceId: string;
  type: DocumentType;
  name: string;
  description?: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedById: string;
  reviewedById?: string;
  reviewedAt?: Date;
  linkedConsultationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pharmacy
export interface Pharmacy {
  id: string;
  practiceId: string;
  name: string;
  odsCode?: string;
  address: Address;
  phone: string;
  email?: string;
  fax?: string;
  type: 'COMMUNITY' | 'HOSPITAL' | 'ONLINE';
  epsEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== API TYPES ====================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalPatients: number;
  patientsRegisteredToday: number;
  pendingAppointments: number;
  appointmentsToday: number;
  missedAppointments: number;
  cancelledAppointments: number;
  appointmentsByType: { type: AppointmentType; count: number }[];
  appointmentsByStatus: { status: AppointmentStatus; count: number }[];
}
