import { AppointmentType, UserRole } from '../types';

// Appointment type configurations for GP Practice
export const APPOINTMENT_TYPE_CONFIG: Record<
  AppointmentType,
  {
    label: string;
    code: string;
    defaultDuration: number;
    color: string;
    allowedRoles: UserRole[];
  }
> = {
  [AppointmentType.GP_CONSULTATION]: {
    label: 'GP Consultation',
    code: 'GP01',
    defaultDuration: 10,
    color: '#3B82F6', // blue
    allowedRoles: [UserRole.GP],
  },
  [AppointmentType.GP_EXTENDED]: {
    label: 'GP Extended Consultation',
    code: 'GP02',
    defaultDuration: 20,
    color: '#2563EB', // darker blue
    allowedRoles: [UserRole.GP],
  },
  [AppointmentType.GP_TELEPHONE]: {
    label: 'GP Telephone Consultation',
    code: 'GP03',
    defaultDuration: 10,
    color: '#06B6D4', // cyan
    allowedRoles: [UserRole.GP],
  },
  [AppointmentType.GP_VIDEO]: {
    label: 'GP Video Consultation',
    code: 'GP04',
    defaultDuration: 10,
    color: '#0891B2', // darker cyan
    allowedRoles: [UserRole.GP],
  },
  [AppointmentType.NURSE_APPOINTMENT]: {
    label: 'Nurse Appointment',
    code: 'NUR01',
    defaultDuration: 15,
    color: '#10B981', // green
    allowedRoles: [UserRole.NURSE],
  },
  [AppointmentType.NURSE_CHRONIC_DISEASE]: {
    label: 'Chronic Disease Review',
    code: 'NUR02',
    defaultDuration: 30,
    color: '#059669', // darker green
    allowedRoles: [UserRole.NURSE],
  },
  [AppointmentType.HCA_BLOOD_TEST]: {
    label: 'Blood Test',
    code: 'HCA01',
    defaultDuration: 10,
    color: '#F59E0B', // amber
    allowedRoles: [UserRole.HCA, UserRole.NURSE],
  },
  [AppointmentType.HCA_HEALTH_CHECK]: {
    label: 'NHS Health Check',
    code: 'HCA02',
    defaultDuration: 20,
    color: '#D97706', // darker amber
    allowedRoles: [UserRole.HCA, UserRole.NURSE],
  },
  [AppointmentType.VACCINATION]: {
    label: 'Vaccination',
    code: 'VAC01',
    defaultDuration: 5,
    color: '#8B5CF6', // purple
    allowedRoles: [UserRole.NURSE, UserRole.HCA],
  },
  [AppointmentType.SMEAR_TEST]: {
    label: 'Cervical Screening',
    code: 'SMR01',
    defaultDuration: 20,
    color: '#EC4899', // pink
    allowedRoles: [UserRole.NURSE],
  },
  [AppointmentType.MINOR_SURGERY]: {
    label: 'Minor Surgery',
    code: 'SUR01',
    defaultDuration: 30,
    color: '#EF4444', // red
    allowedRoles: [UserRole.GP],
  },
  [AppointmentType.HOME_VISIT]: {
    label: 'Home Visit',
    code: 'HV01',
    defaultDuration: 30,
    color: '#6366F1', // indigo
    allowedRoles: [UserRole.GP, UserRole.NURSE],
  },
};

// Role display names
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.PRACTICE_ADMIN]: 'Practice Admin',
  [UserRole.GP]: 'General Practitioner',
  [UserRole.NURSE]: 'Practice Nurse',
  [UserRole.HCA]: 'Healthcare Assistant',
  [UserRole.RECEPTIONIST]: 'Receptionist',
  [UserRole.PRACTICE_MANAGER]: 'Practice Manager',
};

// Appointment status colors and labels
export const APPOINTMENT_STATUS_CONFIG = {
  BOOKED: { label: 'Booked', color: '#3B82F6', bgColor: '#DBEAFE' },
  CONFIRMED: { label: 'Confirmed', color: '#10B981', bgColor: '#D1FAE5' },
  ARRIVED: { label: 'Arrived', color: '#F59E0B', bgColor: '#FEF3C7' },
  IN_PROGRESS: { label: 'In Progress', color: '#8B5CF6', bgColor: '#EDE9FE' },
  COMPLETED: { label: 'Completed', color: '#059669', bgColor: '#D1FAE5' },
  DNA: { label: 'Did Not Attend', color: '#EF4444', bgColor: '#FEE2E2' },
  CANCELLED: { label: 'Cancelled', color: '#6B7280', bgColor: '#F3F4F6' },
};

// Days of the week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Default practice opening hours
export const DEFAULT_OPENING_HOURS = [
  { dayOfWeek: 0, openTime: '00:00', closeTime: '00:00', isClosed: true }, // Sunday
  { dayOfWeek: 1, openTime: '08:00', closeTime: '18:30', isClosed: false }, // Monday
  { dayOfWeek: 2, openTime: '08:00', closeTime: '18:30', isClosed: false }, // Tuesday
  { dayOfWeek: 3, openTime: '08:00', closeTime: '18:30', isClosed: false }, // Wednesday
  { dayOfWeek: 4, openTime: '08:00', closeTime: '18:30', isClosed: false }, // Thursday
  { dayOfWeek: 5, openTime: '08:00', closeTime: '18:30', isClosed: false }, // Friday
  { dayOfWeek: 6, openTime: '00:00', closeTime: '00:00', isClosed: true }, // Saturday
];

// Validation constants
export const VALIDATION = {
  NHS_NUMBER_LENGTH: 10,
  POSTCODE_REGEX: /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i,
  PHONE_REGEX: /^(\+44|0)[0-9]{10,11}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};
