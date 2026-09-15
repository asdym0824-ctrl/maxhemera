import { describe, it, expect, beforeEach } from 'vitest';
import { apiService } from '../services/apiService';
import { appointmentAvailabilityService, getPersianDayOfWeek } from '../services/appointmentAvailabilityService';
import { getRelativeISODate } from '../utils/dateUtils';
import { MOCK_DOCTORS } from '../data/mockData';

describe('In-Person Booking & Availability Engine Integration', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('correctly calculates slots and stores today booking with real today ISO date', async () => {
    const todayISO = getRelativeISODate(0);
    const dayOfWeek = getPersianDayOfWeek(todayISO);
    
    // doc-1 is available on Sat, Sun, Tue, Wed (0, 1, 3, 4) at off-1, or Mon, Thu (2, 5) at off-2
    let targetDocId = 'doc-1';
    let targetOfficeId = (dayOfWeek === 2 || dayOfWeek === 5) ? 'off-2' : 'off-1';
    let targetBranchId = (dayOfWeek === 2 || dayOfWeek === 5) ? 'branch-2' : 'branch-1';

    let slots = await apiService.calculateAvailableSlots({
      doctorId: targetDocId,
      date: todayISO,
      officeId: targetOfficeId,
      branchId: targetBranchId,
      visitType: 'in_person',
      includeUnavailable: true
    });

    if (slots.length === 0 || !slots.some(s => s.isAvailable)) {
      // Find another active doctor today
      for (const d of MOCK_DOCTORS) {
        const testSlots = await apiService.calculateAvailableSlots({
          doctorId: d.id,
          date: todayISO,
          visitType: 'in_person',
          includeUnavailable: true
        });
        if (testSlots.some(s => s.isAvailable)) {
          targetDocId = d.id;
          slots = testSlots;
          targetOfficeId = testSlots.find(s => s.isAvailable)?.officeId || 'off-1';
          targetBranchId = testSlots.find(s => s.isAvailable)?.branchId || 'branch-1';
          break;
        }
      }
    }

    const targetDoc = MOCK_DOCTORS.find(d => d.id === targetDocId) || MOCK_DOCTORS[0];
    const availableSlot = slots.find(s => s.isAvailable) || slots[0];
    expect(availableSlot).toBeDefined();

    const created = await apiService.createAppointment({
      doctorId: targetDoc.id,
      doctorName: targetDoc.name,
      doctorSpecialty: targetDoc.specialtyName,
      doctorAvatar: targetDoc.avatar,
      patientId: 'patient-test-today',
      patientName: 'بیمار امروز',
      patientPhone: '09121112233',
      visitType: 'in_person',
      date: todayISO, // Real today ISO date
      timeSlot: availableSlot.timeSlot,
      clinicAddress: targetDoc.offices?.[0]?.address || 'شعبه سعادت‌آباد همرا کلینیک',
      clinicId: targetDoc.clinicId || 'clinic-1',
      branchId: targetDoc.offices?.[0]?.branchId || targetDoc.branchId || targetBranchId,
      officeId: targetDoc.offices?.[0]?.id || targetOfficeId,
      fee: targetDoc.consultationFee,
      paidStatus: 'pending'
    });

    expect(created.id).toBeDefined();
    expect(created.date).toBe(todayISO);
    expect(created.timeSlot).toBe(availableSlot.timeSlot);
    expect(created.visitType).toBe('in_person');
  });

  it('correctly calculates slots and stores tomorrow booking with real tomorrow ISO date (not today)', async () => {
    const todayISO = getRelativeISODate(0);
    const tomorrowISO = getRelativeISODate(1);

    expect(tomorrowISO).not.toBe(todayISO);

    // Calculate slots specifically for tomorrow
    const dowTomorrow = getPersianDayOfWeek(tomorrowISO);
    const targetOfficeId = (dowTomorrow === 2 || dowTomorrow === 5) ? 'off-2' : 'off-1';
    const targetBranchId = (dowTomorrow === 2 || dowTomorrow === 5) ? 'branch-2' : 'branch-1';

    let slots = await apiService.calculateAvailableSlots({
      doctorId: 'doc-1',
      date: tomorrowISO,
      officeId: targetOfficeId,
      branchId: targetBranchId,
      visitType: 'in_person',
      includeUnavailable: true
    });

    let chosenDocId = 'doc-1';
    let chosenOfficeId = targetOfficeId;
    let chosenBranchId = targetBranchId;

    if (slots.length === 0 || !slots.some(s => s.isAvailable)) {
      for (const d of MOCK_DOCTORS) {
        const testSlots = await apiService.calculateAvailableSlots({
          doctorId: d.id,
          date: tomorrowISO,
          visitType: 'in_person',
          includeUnavailable: true
        });
        if (testSlots.some(s => s.isAvailable)) {
          chosenDocId = d.id;
          slots = testSlots;
          chosenOfficeId = testSlots.find(s => s.isAvailable)?.officeId || 'off-1';
          chosenBranchId = testSlots.find(s => s.isAvailable)?.branchId || 'branch-1';
          break;
        }
      }
    }

    const availableSlot = slots.find(s => s.isAvailable) || slots[0];
    expect(availableSlot).toBeDefined();

    const createdTomorrow = await apiService.createAppointment({
      doctorId: chosenDocId,
      doctorName: 'دکتر مریم حسینی',
      doctorSpecialty: 'متخصص قلب و عروق',
      doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      patientId: 'patient-test-tomorrow',
      patientName: 'بیمار فردا',
      patientPhone: '09129998877',
      visitType: 'in_person',
      date: tomorrowISO, // Must be stored with tomorrow's ISO date
      timeSlot: availableSlot.timeSlot,
      clinicAddress: 'شعبه ونک همرا کلینیک',
      clinicId: 'clinic-1',
      branchId: chosenBranchId,
      officeId: chosenOfficeId,
      fee: 250000,
      paidStatus: 'pending'
    });

    // Verification: Appointment date MUST match tomorrowISO exactly, NEVER todayISO
    expect(createdTomorrow.date).toBe(tomorrowISO);
    expect(createdTomorrow.date).not.toBe(todayISO);

    // Retrieve from API to guarantee stored data integrity
    const all = await apiService.getAppointments();
    const found = all.find(a => a.id === createdTomorrow.id);
    expect(found).toBeDefined();
    expect(found?.date).toBe(tomorrowISO);
  });

  it('marks booked slots as unavailable and prevents double booking with conflict message', async () => {
    // 2026-08-22 is Saturday (day 0: شنبه) - doc-1 is at off-1 from 16:00 to 20:30
    const testDate = '2026-08-22';
    const testSlot = '17:00';

    // 1. Initial slots check
    const initialSlots = await apiService.calculateAvailableSlots({
      doctorId: 'doc-1',
      date: testDate,
      officeId: 'off-1',
      branchId: 'branch-1',
      visitType: 'in_person',
      includeUnavailable: true
    });

    const targetSlotBefore = initialSlots.find(s => s.timeSlot === testSlot);
    expect(targetSlotBefore?.isAvailable).toBe(true);

    // 2. Book the slot
    await apiService.createAppointment({
      doctorId: 'doc-1',
      doctorName: 'دکتر مریم حسینی',
      doctorSpecialty: 'متخصص قلب و عروق',
      doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      patientId: 'patient-first',
      patientName: 'بیمار اول',
      patientPhone: '09121111111',
      visitType: 'in_person',
      date: testDate,
      timeSlot: testSlot,
      clinicAddress: 'سعادت‌آباد',
      clinicId: 'clinic-1',
      branchId: 'branch-1',
      officeId: 'off-1',
      fee: 250000,
      paidStatus: 'pending'
    });

    // 3. Subsequent slots check: the slot must now be unavailable with reason 'booked'
    const updatedSlots = await apiService.calculateAvailableSlots({
      doctorId: 'doc-1',
      date: testDate,
      officeId: 'off-1',
      branchId: 'branch-1',
      visitType: 'in_person',
      includeUnavailable: true
    });

    const targetSlotAfter = updatedSlots.find(s => s.timeSlot === testSlot);
    expect(targetSlotAfter?.isAvailable).toBe(false);
    expect(targetSlotAfter?.unavailableReason).toBe('booked');

    // 4. Attempting a second booking for the same slot must throw SLOT_CONFLICT / SLOT_ALREADY_BOOKED
    await expect(
      apiService.createAppointment({
        doctorId: 'doc-1',
        doctorName: 'دکتر مریم حسینی',
        doctorSpecialty: 'متخصص قلب و عروق',
        doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        patientId: 'patient-second',
        patientName: 'بیمار دوم',
        patientPhone: '09122222222',
        visitType: 'in_person',
        date: testDate,
        timeSlot: testSlot,
        clinicAddress: 'سعادت‌آباد',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        officeId: 'off-1',
        fee: 250000,
        paidStatus: 'pending'
      })
    ).rejects.toThrow('این زمان لحظاتی قبل رزرو شد. لطفاً زمان دیگری انتخاب کنید.');
  });

  it('cancelling an appointment frees the slot back to available', async () => {
    // 2026-08-25 is Tuesday (day 3: سه‌شنبه) - doc-1 is at off-1 from 16:00 to 20:30
    const testDate = '2026-08-25';
    const testSlot = '18:00';

    const booked = await apiService.createAppointment({
      doctorId: 'doc-1',
      doctorName: 'دکتر مریم حسینی',
      doctorSpecialty: 'متخصص قلب و عروق',
      doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      patientId: 'patient-to-cancel',
      patientName: 'بیمار انصرافی',
      patientPhone: '09123333333',
      visitType: 'in_person',
      date: testDate,
      timeSlot: testSlot,
      clinicAddress: 'سعادت‌آباد',
      clinicId: 'clinic-1',
      branchId: 'branch-1',
      officeId: 'off-1',
      fee: 250000,
      paidStatus: 'pending'
    });

    // Check slot is booked
    let slots = await apiService.calculateAvailableSlots({
      doctorId: 'doc-1',
      date: testDate,
      officeId: 'off-1',
      branchId: 'branch-1',
      visitType: 'in_person',
      includeUnavailable: true
    });
    expect(slots.find(s => s.timeSlot === testSlot)?.isAvailable).toBe(false);

    // Cancel appointment via updateAppointmentStatus
    const cancelled = await apiService.updateAppointmentStatus(booked.id, 'canceled');
    expect(cancelled?.status).toBe('canceled');

    // Slot must now be freed and available again
    slots = await apiService.calculateAvailableSlots({
      doctorId: 'doc-1',
      date: testDate,
      officeId: 'off-1',
      branchId: 'branch-1',
      visitType: 'in_person',
      includeUnavailable: true
    });
    expect(slots.find(s => s.timeSlot === testSlot)?.isAvailable).toBe(true);

    // Another patient can now book this slot
    const newBooking = await apiService.createAppointment({
      doctorId: 'doc-1',
      doctorName: 'دکتر مریم حسینی',
      doctorSpecialty: 'متخصص قلب و عروق',
      doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      patientId: 'patient-new',
      patientName: 'بیمار جدید',
      patientPhone: '09124444444',
      visitType: 'in_person',
      date: testDate,
      timeSlot: testSlot,
      clinicAddress: 'سعادت‌آباد',
      clinicId: 'clinic-1',
      branchId: 'branch-1',
      officeId: 'off-1',
      fee: 250000,
      paidStatus: 'pending'
    });
    expect(newBooking.id).toBeDefined();
    expect(newBooking.status).toBe('scheduled');
  });

  it('correctly separates Office A (Saadat Abad) vs Office B (Vanak) schedules and slots', async () => {
    // Dr. Maryam Hosseini has:
    // Office B (off-2, branch-2, Vanak): Mon (day 2) & Thu (day 5) 09:00 - 13:30 (Morning)
    // Office A (off-1, branch-1, Saadat Abad): Sat (day 0), Sun (day 1), Tue (day 3), Wed (day 4) 16:00 - 20:30 (Afternoon)
    
    // 2026-08-24 is Monday (day 2: دوشنبه)
    const mondayDate = '2026-08-24';
    // 2026-08-25 is Tuesday (day 3: سه‌شنبه)
    const tuesdayDate = '2026-08-25';

    // 1. Check Office B (Vanak) on Monday
    const officeBSlotsOnMon = await apiService.calculateAvailableSlots({
      doctorId: 'doc-1',
      date: mondayDate,
      officeId: 'off-2',
      branchId: 'branch-2',
      visitType: 'in_person',
      includeUnavailable: true
    });

    expect(officeBSlotsOnMon.length).toBeGreaterThan(0);
    expect(officeBSlotsOnMon.every(s => s.officeId === 'off-2')).toBe(true);
    expect(officeBSlotsOnMon.every(s => s.branchId === 'branch-2')).toBe(true);
    // Morning slots like 09:00, 09:30, 10:00 should exist
    expect(officeBSlotsOnMon.some(s => s.timeSlot === '09:00')).toBe(true);
    expect(officeBSlotsOnMon.some(s => s.timeSlot === '10:00')).toBe(true);
    // Afternoon slots should NOT be in Office B
    expect(officeBSlotsOnMon.some(s => s.timeSlot === '17:00')).toBe(false);

    // 2. Querying Office A on Monday should yield NO slots because doctor is at Office B
    const officeASlotsOnMon = await apiService.calculateAvailableSlots({
      doctorId: 'doc-1',
      date: mondayDate,
      officeId: 'off-1',
      branchId: 'branch-1',
      visitType: 'in_person',
      includeUnavailable: true
    });
    expect(officeASlotsOnMon.length).toBe(0);

    // 3. Check Office A (Saadat Abad) on Tuesday
    const officeASlotsOnTue = await apiService.calculateAvailableSlots({
      doctorId: 'doc-1',
      date: tuesdayDate,
      officeId: 'off-1',
      branchId: 'branch-1',
      visitType: 'in_person',
      includeUnavailable: true
    });

    expect(officeASlotsOnTue.length).toBeGreaterThan(0);
    expect(officeASlotsOnTue.every(s => s.officeId === 'off-1')).toBe(true);
    expect(officeASlotsOnTue.every(s => s.branchId === 'branch-1')).toBe(true);
    // Afternoon slots like 16:00, 16:30, 17:00 should exist
    expect(officeASlotsOnTue.some(s => s.timeSlot === '16:00')).toBe(true);
    expect(officeASlotsOnTue.some(s => s.timeSlot === '17:00')).toBe(true);
    // Morning slots should NOT be in Office A
    expect(officeASlotsOnTue.some(s => s.timeSlot === '09:00')).toBe(false);
  });

  it('blocks slots when doctor is on leave', async () => {
    // MOCK_SCHEDULE_BLOCKS defines a leave block for doc-1 at getRelativeISODate(6)
    const leaveDate = getRelativeISODate(6);

    const validation = await appointmentAvailabilityService.validateSlotAvailability({
      doctorId: 'doc-1',
      date: leaveDate,
      timeSlot: '17:00',
      officeId: 'off-1',
      visitType: 'in_person'
    });

    expect(validation.success).toBe(false);
    expect(validation.reason).toBe('DOCTOR_ON_LEAVE');
    expect(validation.message).toContain('مرخصی');

    // Attempting to create an appointment on doctor's leave date must fail
    await expect(
      apiService.createAppointment({
        doctorId: 'doc-1',
        doctorName: 'دکتر مریم حسینی',
        doctorSpecialty: 'متخصص قلب و عروق',
        doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        patientId: 'patient-leave-test',
        patientName: 'بیمار مرخصی',
        patientPhone: '09121112233',
        visitType: 'in_person',
        date: leaveDate,
        timeSlot: '17:00',
        clinicAddress: 'سعادت‌آباد',
        clinicId: 'clinic-1',
        branchId: 'branch-1',
        officeId: 'off-1',
        fee: 250000,
        paidStatus: 'pending'
      })
    ).rejects.toThrow('پزشک در این تاریخ در مرخصی به سر می‌برد.');
  });
});
