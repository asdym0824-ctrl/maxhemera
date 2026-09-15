import { describe, it, expect, beforeEach } from 'vitest';
import { apiService, generateAppointmentTrackingCode } from '../services/apiService';
import { queueService } from '../services/queueService';
import { getRelativeISODate } from '../utils/dateUtils';
import { isValidIranianMobile, formatStandardIranianMobile, isValidIranianNationalId, normalizeDigits } from '../utils/validationUtils';
import { Appointment } from '../types';
import { MOCK_DOCTORS } from '../data/mockData';

// Helper to find an available slot for a doctor on a future date without existing mock appointments
async function findValidSlotForDoctor(doctorId: string, targetOfficeId?: string) {
  const doc = MOCK_DOCTORS.find(d => d.id === doctorId);
  const office = doc?.offices?.find(o => o.id === targetOfficeId) || doc?.offices?.[0];
  const defaultBranchId = office?.branchId || doc?.branchId || 'branch-1';
  const defaultOfficeId = office?.id || 'off-1';

  for (let offset = 4; offset < 14; offset++) {
    const testDate = getRelativeISODate(offset);
    const slots = await apiService.calculateAvailableSlots({
      doctorId,
      date: testDate,
      officeId: targetOfficeId,
      visitType: 'in_person',
      includeUnavailable: true
    });
    const avail = slots.find(s => s.isAvailable);
    if (avail) {
      return {
        date: testDate,
        timeSlot: avail.timeSlot,
        officeId: avail.officeId || defaultOfficeId,
        branchId: avail.branchId || defaultBranchId
      };
    }
  }
  throw new Error(`No available slot found for doctor ${doctorId}`);
}

describe('Queue Service & Single Source of Tracking Code Tests', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('1. Deterministic Queue Number Generation', () => {
    it('generates sequential queue numbers without Math.random() based on clinic/branch/date context', async () => {
      const slotInfo = await findValidSlotForDoctor('doc-1', 'off-1');

      const q1 = await queueService.getNextQueueNumber({
        clinicId: 'clinic-1',
        branchId: slotInfo.branchId,
        date: slotInfo.date
      });

      expect(q1).toBe(1);

      // Create first appointment at branch-1
      const app1 = await apiService.createAppointment({
        doctorId: 'doc-1',
        doctorName: 'دکتر مریم حسینی',
        doctorSpecialty: 'قلب',
        doctorAvatar: '',
        patientId: 'patient-test-1',
        patientName: 'علی رضایی',
        patientPhone: '09123456789',
        visitType: 'in_person',
        date: slotInfo.date,
        timeSlot: slotInfo.timeSlot,
        clinicAddress: 'تهران، سعادت‌آباد',
        clinicId: 'clinic-1',
        branchId: slotInfo.branchId,
        officeId: slotInfo.officeId,
        fee: 200000,
        paidStatus: 'pending'
      });

      expect(app1.queuePosition).toBe(1);

      // Next queue number for branch-1 should be 2
      const q2 = await queueService.getNextQueueNumber({
        clinicId: 'clinic-1',
        branchId: slotInfo.branchId,
        date: slotInfo.date
      });

      expect(q2).toBe(2);

      // Find another available slot for the second appointment on the same date/branch
      const slots = await apiService.calculateAvailableSlots({
        doctorId: 'doc-1',
        date: slotInfo.date,
        officeId: slotInfo.officeId,
        branchId: slotInfo.branchId,
        visitType: 'in_person',
        includeUnavailable: true
      });
      const secondSlot = slots.find(s => s.isAvailable);
      expect(secondSlot).toBeDefined();

      const app2 = await apiService.createAppointment({
        doctorId: 'doc-1',
        doctorName: 'دکتر مریم حسینی',
        doctorSpecialty: 'قلب',
        doctorAvatar: '',
        patientId: 'patient-test-2',
        patientName: 'سارا محمدی',
        patientPhone: '09129876543',
        visitType: 'in_person',
        date: slotInfo.date,
        timeSlot: secondSlot!.timeSlot,
        clinicAddress: 'تهران، سعادت‌آباد',
        clinicId: 'clinic-1',
        branchId: slotInfo.branchId,
        officeId: slotInfo.officeId,
        fee: 200000,
        paidStatus: 'pending'
      });

      expect(app2.queuePosition).toBe(2);
      expect(app2.queuePosition).not.toBe(app1.queuePosition);
    });

    it('isolates queue numbers across different branches and different dates', async () => {
      const slotInfoA = await findValidSlotForDoctor('doc-1', 'off-1');
      const dateB = getRelativeISODate(12);

      // Branch 1 on Date A
      await apiService.createAppointment({
        doctorId: 'doc-1',
        doctorName: 'دکتر حسینی',
        doctorSpecialty: 'قلب',
        doctorAvatar: '',
        patientId: 'patient-1',
        patientName: 'بیمار ۱',
        patientPhone: '09121111111',
        visitType: 'in_person',
        date: slotInfoA.date,
        timeSlot: slotInfoA.timeSlot,
        clinicAddress: 'سعادت‌آباد',
        clinicId: 'clinic-1',
        branchId: slotInfoA.branchId,
        officeId: slotInfoA.officeId,
        fee: 200000,
        paidStatus: 'pending'
      });

      // Branch 2 on Date A (different branch -> queue starts at 1)
      const qBranch2 = await queueService.getNextQueueNumber({
        clinicId: 'clinic-1',
        branchId: 'branch-2',
        date: slotInfoA.date
      });
      expect(qBranch2).toBe(1);

      // Branch 1 on Date B (different date -> queue starts at 1)
      const qDateB = await queueService.getNextQueueNumber({
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        date: dateB
      });
      expect(qDateB).toBe(1);
    });

    it('calculates deterministic estimated wait times correctly', () => {
      expect(queueService.calculateEstimatedWaitMinutes({ queueNumber: 1, averageMinutesPerPatient: 12 })).toBe(5);
      expect(queueService.calculateEstimatedWaitMinutes({ queueNumber: 2, averageMinutesPerPatient: 12 })).toBe(12);
      expect(queueService.calculateEstimatedWaitMinutes({ queueNumber: 3, averageMinutesPerPatient: 15 })).toBe(30);
    });
  });

  describe('2. Single Source of Tracking Code', () => {
    it('generates unique, consistent tracking codes from apiService.createAppointment', async () => {
      const slot = await findValidSlotForDoctor('doc-1', 'off-1');

      const app = await apiService.createAppointment({
        doctorId: 'doc-1',
        doctorName: 'دکتر مریم حسینی',
        doctorSpecialty: 'قلب و عروق',
        doctorAvatar: '',
        patientId: 'patient-test',
        patientName: 'نرگس کریمی',
        patientPhone: '09191234567',
        visitType: 'in_person',
        date: slot.date,
        timeSlot: slot.timeSlot,
        clinicAddress: 'سعادت‌آباد',
        clinicId: 'clinic-1',
        branchId: slot.branchId,
        officeId: slot.officeId,
        fee: 220000,
        paidStatus: 'pending'
      });

      expect(app.trackingCode).toBeDefined();
      expect(app.trackingCode.startsWith('HC-')).toBe(true);

      // Fetch stored appointments to ensure stored trackingCode matches exactly
      const allApps = await apiService.getAppointments();
      const found = allApps.find(a => a.id === app.id);
      expect(found?.trackingCode).toBe(app.trackingCode);
    });

    it('ensures tracking code generator produces HC- prefix and avoids duplicate codes with legacy SYN- codes', () => {
      const mockList: Appointment[] = [
        { id: '1', trackingCode: 'SYN-88201', doctorId: 'd1', doctorName: 'd1', doctorSpecialty: 's1', doctorAvatar: '', patientId: 'p1', patientName: 'p1', patientPhone: '', visitType: 'in_person', date: '2026-08-20', timeSlot: '10:00', clinicAddress: '', clinicId: 'c1', branchId: 'b1', fee: 0, status: 'scheduled', paidStatus: 'paid', createdAt: '2026-08-17T10:00:00Z' },
        { id: '2', trackingCode: 'SYN-88202', doctorId: 'd1', doctorName: 'd1', doctorSpecialty: 's1', doctorAvatar: '', patientId: 'p1', patientName: 'p1', patientPhone: '', visitType: 'in_person', date: '2026-08-20', timeSlot: '10:30', clinicAddress: '', clinicId: 'c1', branchId: 'b1', fee: 0, status: 'scheduled', paidStatus: 'paid', createdAt: '2026-08-17T10:00:00Z' }
      ];

      const nextCode = generateAppointmentTrackingCode(mockList);
      expect(nextCode).toBe('HC-88203');
      expect(mockList.some(m => m.trackingCode === nextCode)).toBe(false);
    });
  });

  describe('3. Patient Identity Resolution & Guest Session Handling', () => {
    it('does not persist temporary booking session IDs as permanent patientId', async () => {
      const slot = await findValidSlotForDoctor('doc-1', 'off-1');

      const app = await apiService.createAppointment({
        doctorId: 'doc-1',
        doctorName: 'دکتر مریم حسینی',
        doctorSpecialty: 'قلب',
        doctorAvatar: '',
        patientId: 'guest-session-1718000000', // temporary session ID
        patientName: 'بیمار مهمان',
        patientPhone: '۰۹۳۵۱۲۳۴۵۶۷', // Persian numerals
        visitType: 'in_person',
        date: slot.date,
        timeSlot: slot.timeSlot,
        clinicAddress: 'شعبه مرکزی',
        clinicId: 'clinic-1',
        branchId: slot.branchId,
        officeId: slot.officeId,
        fee: 250000,
        paidStatus: 'pending'
      });

      expect(app.patientId).not.toBe('guest-session-1718000000');
      expect(app.patientId.startsWith('guest-session-')).toBe(false);
      expect(app.patientId).toBe('patient-09351234567');
    });

    it('matches existing registered patient if phone number corresponds to known user', async () => {
      const slot = await findValidSlotForDoctor('doc-1', 'off-1');

      const app = await apiService.createAppointment({
        doctorId: 'doc-1',
        doctorName: 'دکتر مریم حسینی',
        doctorSpecialty: 'قلب',
        doctorAvatar: '',
        patientId: 'guest',
        patientName: 'امیرحسین رضایی',
        patientPhone: '09121112233', // matches initial patient-1
        visitType: 'in_person',
        date: slot.date,
        timeSlot: slot.timeSlot,
        clinicAddress: 'شعبه سعادت‌آباد',
        clinicId: 'clinic-1',
        branchId: slot.branchId,
        officeId: slot.officeId,
        fee: 250000,
        paidStatus: 'pending'
      });

      expect(app.patientId).toBe('user-patient-1');
    });
  });

  describe('4. Phone & National ID Validation', () => {
    it('validates Iranian mobile numbers with various prefixes and Persian numerals', () => {
      expect(isValidIranianMobile('09121234567')).toBe(true);
      expect(isValidIranianMobile('۰۹۱۲۱۲۳۴۵۶۷')).toBe(true);
      expect(isValidIranianMobile('+989121234567')).toBe(true);
      expect(isValidIranianMobile('09351234567')).toBe(true);
      
      expect(isValidIranianMobile('08121234567')).toBe(false); // not starting with 09
      expect(isValidIranianMobile('091212345')).toBe(false); // too short
      expect(isValidIranianMobile('')).toBe(false);
      expect(isValidIranianMobile(undefined)).toBe(false);
    });

    it('formats mobile numbers to standard Iranian format (09XXXXXXXXX)', () => {
      expect(formatStandardIranianMobile('۰۹۱۲۱۲۳۴۵۶۷')).toBe('09121234567');
      expect(formatStandardIranianMobile('+989121234567')).toBe('09121234567');
      expect(formatStandardIranianMobile('9121234567')).toBe('09121234567');
    });

    it('validates Iranian National ID checksum correctly', () => {
      expect(isValidIranianNationalId('0012345678')).toBe(false); // non-matching checksum
      expect(isValidIranianNationalId('1111111111')).toBe(false); // identical digits rejected
      expect(isValidIranianNationalId('0070000000')).toBe(false); // invalid
      expect(isValidIranianNationalId('')).toBe(false);
    });
  });
});
