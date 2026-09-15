import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bookingIntentService, INTENT_EXPIRATION_MS } from '../services/bookingIntentService';
import { MOCK_DOCTORS } from '../data/mockData';
import { apiService } from '../services/apiService';

describe('Booking Authentication & Intent Preservation', () => {
  beforeEach(() => {
    bookingIntentService.clear();
  });

  it('preserves Office B booking intent across authentication using stable IDs', () => {
    const doctor = MOCK_DOCTORS.find(d => d.id === 'doc-1')!;
    const officeB = doctor.offices?.find(o => o.id === 'off-2')!;
    expect(officeB).toBeDefined();
    expect(officeB.id).toBe('off-2');
    expect(officeB.branchId).toBe('branch-2');

    // 1. Visitor selects Doctor 1 -> Office B ('off-2') -> date & slot
    const intentData = {
      doctorId: doctor.id,
      doctorSlug: doctor.slug,
      doctorName: doctor.name,
      clinicId: officeB.clinicId,
      branchId: officeB.branchId,
      officeId: officeB.id,
      officeTitle: officeB.title, // Optional display data only
      visitType: 'in_person' as const,
      selectedDate: '2026-08-25',
      selectedTime: '10:00',
      selectedTimeSlot: '10:00',
      patientTarget: 'self',
      returnUrl: `/site/${doctor.slug}/offices`,
      step: 2
    };

    const saved = bookingIntentService.save(intentData);
    expect(saved.id).toBeDefined();
    expect(saved.createdAt).toBeGreaterThan(0);
    expect(saved.officeId).toBe('off-2');
    expect(saved.branchId).toBe('branch-2');
    expect(saved.clinicId).toBe('clinic-1');
    expect(bookingIntentService.hasPending()).toBe(true);

    // 2. User logs in -> intent is restored
    const retrieved = bookingIntentService.get();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.officeId).toBe('off-2');
    expect(retrieved?.branchId).toBe('branch-2');
    expect(retrieved?.clinicId).toBe('clinic-1');
    expect(retrieved?.selectedTime).toBe('10:00');
    expect(retrieved?.selectedTimeSlot).toBe('10:00');

    // 3. Validate intent against doctor & office hierarchy
    const validation = bookingIntentService.validateIntent(retrieved!, doctor);
    expect(validation.valid).toBe(true);
    expect(validation.code).toBe('VALID');
    expect(validation.office?.id).toBe('off-2');

    // 4. Create appointment -> cleans up pending intent
    bookingIntentService.clear();
    expect(bookingIntentService.hasPending()).toBe(false);
    expect(bookingIntentService.get()).toBeNull();
  });

  it('enforces 30-60 minutes expiration on stale booking intents', () => {
    const pastTime = Date.now() - (50 * 60 * 1000); // 50 minutes ago (> 45 min limit)

    // Save intent with past timestamp
    bookingIntentService.save({
      doctorId: 'doc-1',
      selectedDate: '2026-08-25',
      returnUrl: '/site/dr-maryam-hosseini',
      officeId: 'off-2',
      createdAt: pastTime,
      timestamp: pastTime
    });

    // Attempting to retrieve expired intent must return null and clear storage
    const retrieved = bookingIntentService.get();
    expect(retrieved).toBeNull();
    expect(bookingIntentService.hasPending()).toBe(false);
  });

  it('validates doctor, office and branch relationship integrity', () => {
    const doctor = MOCK_DOCTORS.find(d => d.id === 'doc-1')!;

    // Case 1: Non-existent doctor
    const invalidDoctorIntent = {
      id: 'test-session-1',
      doctorId: 'non-existent-doc',
      visitType: 'in_person' as const,
      selectedDate: '2026-08-25',
      returnUrl: '/site/dr-unknown',
      createdAt: Date.now()
    };
    const docVal = bookingIntentService.validateIntent(invalidDoctorIntent, doctor);
    expect(docVal.valid).toBe(false);
    expect(docVal.code).toBe('DOCTOR_NOT_FOUND');

    // Case 2: Non-existent office
    const invalidOfficeIntent = {
      id: 'test-session-2',
      doctorId: 'doc-1',
      officeId: 'off-9999',
      visitType: 'in_person' as const,
      selectedDate: '2026-08-25',
      returnUrl: '/site/dr-maryam-hosseini',
      createdAt: Date.now()
    };
    const offVal = bookingIntentService.validateIntent(invalidOfficeIntent, doctor);
    expect(offVal.valid).toBe(false);
    expect(offVal.code).toBe('OFFICE_NOT_FOUND');

    // Case 3: Branch relationship mismatch
    const mismatchBranchIntent = {
      id: 'test-session-3',
      doctorId: 'doc-1',
      officeId: 'off-2',
      branchId: 'wrong-branch-id',
      visitType: 'in_person' as const,
      selectedDate: '2026-08-25',
      returnUrl: '/site/dr-maryam-hosseini',
      createdAt: Date.now()
    };
    const branchVal = bookingIntentService.validateIntent(mismatchBranchIntent, doctor);
    expect(branchVal.valid).toBe(false);
    expect(branchVal.code).toBe('RELATIONSHIP_MISMATCH');
  });

  it('clears booking intent when user explicitly cancels the booking', () => {
    bookingIntentService.save({
      doctorId: 'doc-1',
      officeId: 'off-2',
      selectedDate: '2026-08-25',
      returnUrl: '/site/dr-maryam-hosseini'
    });

    expect(bookingIntentService.hasPending()).toBe(true);

    // User cancels
    bookingIntentService.clear();

    expect(bookingIntentService.hasPending()).toBe(false);
    expect(bookingIntentService.get()).toBeNull();
  });
});
