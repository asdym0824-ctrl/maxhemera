import { VisitType, Doctor, DoctorOffice } from '../types';

export interface PendingBookingIntent {
  id: string;
  doctorId: string;
  doctorSlug?: string;
  doctorName?: string;
  clinicId?: string;
  branchId?: string;
  officeId?: string;
  officeTitle?: string; // Optional display data only, NOT identity
  visitType: VisitType;
  selectedDate: string;
  selectedTime?: string;
  selectedTimeSlot?: string;
  symptomsNote?: string;
  patientTarget?: string;
  familyMemberId?: string;
  returnUrl: string;
  step?: number;
  createdAt: number;
  timestamp?: number;
}

export interface IntentValidationResult {
  valid: boolean;
  code: 'VALID' | 'EXPIRED' | 'DOCTOR_NOT_FOUND' | 'OFFICE_NOT_FOUND' | 'RELATIONSHIP_MISMATCH' | 'SLOT_UNAVAILABLE';
  message?: string;
  doctor?: Doctor;
  office?: DoctorOffice;
  isSlotAvailable?: boolean;
}

const STORAGE_KEY = 'hamrah_pending_booking_intent_v1';

// Default intent expiration: 45 minutes (within the 30-60 minutes prototype requirement)
export const INTENT_EXPIRATION_MS = 45 * 60 * 1000;

export function createGuestBookingSessionId(): string {
  return `guest-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const bookingIntentService = {
  save(
    intent: Partial<PendingBookingIntent> & {
      doctorId: string;
      selectedDate: string;
      returnUrl: string;
    }
  ): PendingBookingIntent {
    const now = Date.now();
    const resolvedTime = intent.selectedTime || intent.selectedTimeSlot || '';
    const creationTime = intent.createdAt || intent.timestamp || now;

    const completeIntent: PendingBookingIntent = {
      id: intent.id || createGuestBookingSessionId(),
      doctorId: intent.doctorId,
      doctorSlug: intent.doctorSlug,
      doctorName: intent.doctorName,
      clinicId: intent.clinicId,
      branchId: intent.branchId,
      officeId: intent.officeId,
      officeTitle: intent.officeTitle,
      visitType: intent.visitType || 'in_person',
      selectedDate: intent.selectedDate,
      selectedTime: resolvedTime,
      selectedTimeSlot: resolvedTime,
      symptomsNote: intent.symptomsNote,
      patientTarget: intent.patientTarget,
      familyMemberId: intent.familyMemberId || (intent.patientTarget !== 'self' ? intent.patientTarget : undefined),
      returnUrl: intent.returnUrl,
      step: intent.step ?? 1,
      createdAt: creationTime,
      timestamp: creationTime
    };

    if (typeof window !== 'undefined') {
      try {
        const serialized = JSON.stringify(completeIntent);
        sessionStorage.setItem(STORAGE_KEY, serialized);
        // Also mirror to localStorage for resilient cross-tab/PWA login recovery
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch (err) {
        console.warn('Could not save booking intent to storage:', err);
      }
    }

    return completeIntent;
  },

  get(): PendingBookingIntent | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed: PendingBookingIntent = JSON.parse(raw);
      
      const createdAt = parsed.createdAt || parsed.timestamp || 0;
      const time = parsed.selectedTime || parsed.selectedTimeSlot || '';
      
      parsed.createdAt = createdAt;
      parsed.timestamp = createdAt;
      parsed.selectedTime = time;
      parsed.selectedTimeSlot = time;

      // Intent expires after 30-60 minutes (configured at 45 minutes)
      const age = Date.now() - createdAt;
      if (!createdAt || age > INTENT_EXPIRATION_MS || age < 0) {
        this.clear();
        return null;
      }
      return parsed;
    } catch (err) {
      console.warn('Error reading booking intent:', err);
      return null;
    }
  },

  clear(): void {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn('Error clearing booking intent:', err);
      }
    }
  },

  hasPending(): boolean {
    return this.get() !== null;
  },

  /**
   * Validates restored intent against doctor and office hierarchies
   */
  validateIntent(intent: PendingBookingIntent, doctor?: Doctor | null): IntentValidationResult {
    // 1. Check expiration
    const createdAt = intent.createdAt || intent.timestamp || 0;
    if (!createdAt || Date.now() - createdAt > INTENT_EXPIRATION_MS || Date.now() < createdAt) {
      return {
        valid: false,
        code: 'EXPIRED',
        message: 'مهلت زمانی رزرو موقت به پایان رسیده است.'
      };
    }

    // 2. Validate Doctor exists
    if (!doctor || (doctor.id !== intent.doctorId && doctor.slug !== intent.doctorSlug)) {
      return {
        valid: false,
        code: 'DOCTOR_NOT_FOUND',
        message: 'اطلاعات پزشک مورد نظر در سامانه یافت نشد.'
      };
    }

    // 3. Validate Office exists if in_person
    let resolvedOffice: DoctorOffice | undefined;
    if (intent.visitType === 'in_person' && intent.officeId) {
      if (doctor.offices && doctor.offices.length > 0) {
        resolvedOffice = doctor.offices.find(o => o.id === intent.officeId);
        if (!resolvedOffice) {
          return {
            valid: false,
            code: 'OFFICE_NOT_FOUND',
            message: 'مطب انتخاب شده دیگر در لیست مطب‌های فعال این پزشک نیست.',
            doctor
          };
        }
      }
    }

    // 4. Validate Clinic and Branch relationship
    if (resolvedOffice) {
      if (intent.branchId && resolvedOffice.branchId && intent.branchId !== resolvedOffice.branchId) {
        return {
          valid: false,
          code: 'RELATIONSHIP_MISMATCH',
          message: 'عدم تطابق اطلاعات شعبه و مطب انتخابی.',
          doctor,
          office: resolvedOffice
        };
      }
      if (intent.clinicId && resolvedOffice.clinicId && intent.clinicId !== resolvedOffice.clinicId) {
        return {
          valid: false,
          code: 'RELATIONSHIP_MISMATCH',
          message: 'عدم تطابق اطلاعات مرکز درمانی با مطب انتخابی.',
          doctor,
          office: resolvedOffice
        };
      }
    }

    return {
      valid: true,
      code: 'VALID',
      doctor,
      office: resolvedOffice
    };
  }
};
