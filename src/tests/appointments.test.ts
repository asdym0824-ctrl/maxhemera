import { describe, it, expect, beforeEach } from 'vitest';
import { canTransitionAppointment, getValidNextStatuses } from '../utils/appointmentUtils';
import { appointmentAvailabilityService } from '../services/appointmentAvailabilityService';
import { apiService } from '../services/apiService';

describe('Appointment Status Lifecycle Transitions', () => {
  it('scheduled -> arrived is valid', () => {
    expect(canTransitionAppointment('scheduled', 'arrived')).toBe(true);
  });

  it('arrived -> in_visit is valid', () => {
    expect(canTransitionAppointment('arrived', 'in_visit')).toBe(true);
  });

  it('in_visit -> completed is valid', () => {
    expect(canTransitionAppointment('in_visit', 'completed')).toBe(true);
  });

  it('completed -> arrived is invalid (terminal state)', () => {
    expect(canTransitionAppointment('completed', 'arrived')).toBe(false);
  });

  it('completed -> in_visit is invalid', () => {
    expect(canTransitionAppointment('completed', 'in_visit')).toBe(false);
  });

  it('scheduled -> canceled is valid', () => {
    expect(canTransitionAppointment('scheduled', 'canceled')).toBe(true);
  });

  it('completed -> canceled is invalid', () => {
    expect(canTransitionAppointment('completed', 'canceled')).toBe(false);
  });

  it('getValidNextStatuses lists only valid transitions for scheduled', () => {
    const next = getValidNextStatuses('scheduled');
    expect(next).toContain('arrived');
    expect(next).toContain('canceled');
    expect(next).toContain('no_show');
    expect(next).not.toContain('completed');
  });
});

describe('Appointment Confirmation State & Double Booking Prevention', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('validates slot availability and detects double booking conflicts', async () => {
    const testDoctorId = 'doc-1';
    // 2026-08-22 is Saturday (dayOfWeek 0: شنبه) - doc-1 is at off-1 from 16:00 to 20:30
    const testDate = '2026-08-22';
    const testTimeSlot = '16:30';

    // First booking attempt should succeed
    const firstValidation = await appointmentAvailabilityService.validateSlotAvailability({
      doctorId: testDoctorId,
      date: testDate,
      timeSlot: testTimeSlot,
      officeId: 'off-1',
      visitType: 'in_person'
    });

    expect(firstValidation.success).toBe(true);

    // Create the appointment
    const created = await apiService.createAppointment({
      doctorId: testDoctorId,
      doctorName: 'دکتر مریم حسینی',
      doctorSpecialty: 'متخصص قلب و عروق',
      doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      clinicAddress: 'تهران، سعادت‌آباد، میدان کاج',
      patientId: 'user-patient-1',
      patientName: 'امیرحسین رضایی',
      patientPhone: '09121112233',
      date: testDate,
      timeSlot: testTimeSlot,
      visitType: 'in_person',
      officeId: 'off-1',
      clinicId: 'clinic-1',
      branchId: 'branch-1',
      fee: 2500000,
      paidStatus: 'pending'
    });

    expect(created.id).toBeDefined();
    expect(created.status).toBe('scheduled');
    expect(created.confirmationStatus).toBe('pending');

    // Attempting to book the EXACT SAME slot must fail with conflict
    const secondValidation = await appointmentAvailabilityService.validateSlotAvailability({
      doctorId: testDoctorId,
      date: testDate,
      timeSlot: testTimeSlot,
      officeId: 'off-1',
      visitType: 'in_person'
    });

    expect(secondValidation.success).toBe(false);
    expect(secondValidation.reason).toBe('SLOT_ALREADY_BOOKED');
  });

  it('allows confirmation and sets confirmed status properly', async () => {
    // 2026-08-25 is Tuesday (dayOfWeek 3: سه‌شنبه) - doc-1 is at off-1 from 16:00 to 20:30
    const created = await apiService.createAppointment({
      doctorId: 'doc-1',
      doctorName: 'دکتر مریم حسینی',
      doctorSpecialty: 'متخصص قلب و عروق',
      doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      clinicAddress: 'تهران، سعادت‌آباد، میدان کاج',
      patientId: 'user-patient-1',
      patientName: 'امیرحسین رضایی',
      patientPhone: '09121112233',
      date: '2026-08-25',
      timeSlot: '17:00',
      visitType: 'in_person',
      officeId: 'off-1',
      clinicId: 'clinic-1',
      branchId: 'branch-1',
      fee: 2500000,
      paidStatus: 'pending'
    });

    expect(created.confirmationStatus).toBe('pending');

    const confirmed = await apiService.confirmAppointment(created.id, {
      actorUserId: 'user-secretary-1',
      actorName: 'سارا کاظمی',
      actorRole: 'secretary'
    });

    expect(confirmed).not.toBeNull();
    expect(confirmed?.confirmationStatus).toBe('confirmed');
    expect(confirmed?.confirmedByUserId).toBe('user-secretary-1');
  });
});
