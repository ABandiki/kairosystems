import { VALIDATION } from '../constants';

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', options ?? {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a time string (HH:mm)
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date and time together
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

/**
 * Format a patient's full name with title
 */
export function formatPatientName(patient: {
  title?: string;
  firstName: string;
  lastName: string;
}): string {
  const parts = [];
  if (patient.title) parts.push(patient.title);
  parts.push(patient.firstName);
  parts.push(patient.lastName);
  return parts.join(' ');
}

/**
 * Format a staff member's full name
 */
export function formatStaffName(staff: {
  firstName: string;
  lastName: string;
}): string {
  return `${staff.firstName} ${staff.lastName}`;
}

/**
 * Validate NHS Number using Modulus 11 check
 */
export function validateNhsNumber(nhsNumber: string): boolean {
  // Remove spaces and check length
  const cleaned = nhsNumber.replace(/\s/g, '');
  if (cleaned.length !== VALIDATION.NHS_NUMBER_LENGTH) return false;
  if (!/^\d+$/.test(cleaned)) return false;

  // Modulus 11 check
  const digits = cleaned.split('').map(Number);
  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }

  const remainder = sum % 11;
  const checkDigit = 11 - remainder;

  // Check digit of 11 becomes 0, 10 is invalid
  if (checkDigit === 10) return false;
  const expectedCheckDigit = checkDigit === 11 ? 0 : checkDigit;

  return digits[9] === expectedCheckDigit;
}

/**
 * Format NHS Number with spaces (XXX XXX XXXX)
 */
export function formatNhsNumber(nhsNumber: string): string {
  const cleaned = nhsNumber.replace(/\s/g, '');
  if (cleaned.length !== 10) return nhsNumber;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}

/**
 * Validate UK postcode
 */
export function validatePostcode(postcode: string): boolean {
  return VALIDATION.POSTCODE_REGEX.test(postcode);
}

/**
 * Format UK postcode
 */
export function formatPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  if (cleaned.length < 5) return postcode;
  return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
}

/**
 * Validate UK phone number
 */
export function validatePhoneNumber(phone: string): boolean {
  return VALIDATION.PHONE_REGEX.test(phone.replace(/\s/g, ''));
}

/**
 * Generate initials from a name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Get time slots for a day based on duration
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    currentMinutes += slotDuration;
  }

  return slots;
}

/**
 * Check if two date ranges overlap
 */
export function doDateRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Get the start of day for a date
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of day for a date
 */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Get week start (Monday) for a date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get week end (Sunday) for a date
 */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}
