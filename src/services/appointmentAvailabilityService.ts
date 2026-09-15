import {
  DoctorSchedule,
  ScheduleBlock,
  ScheduleBlockReasonType,
  TimeSlotInfo,
  BookingValidationResult,
  BookingConflictReason,
  EarliestSlotInfo,
  VisitType,
  Appointment
} from '../types';
import { MOCK_DOCTOR_SCHEDULES, MOCK_SCHEDULE_BLOCKS } from '../data/mockData';
import { getRelativeISODate, formatToPersianDate, getPersianWeekdayName, formatToPersianDigits, isDateToday } from '../utils/dateUtils';

const STORAGE_KEYS = {
  SCHEDULES: 'synapse_doctor_schedules_v1',
  BLOCKS: 'synapse_schedule_blocks_v1',
  APPOINTMENTS: 'synapse_appointments_v4'
};

/**
 * Persian Week Index Helper:
 * In Iran, the week starts on Saturday (شنبه):
 * 0 = Saturday (شنبه)
 * 1 = Sunday (یکشنبه)
 * 2 = Monday (دوشنبه)
 * 3 = Tuesday (سه‌شنبه)
 * 4 = Wednesday (چهارشنبه)
 * 5 = Thursday (پنج‌شنبه)
 * 6 = Friday (جمعه)
 */
export function getPersianDayOfWeek(dateInput: string | Date): number {
  const d = typeof dateInput === 'string'
    ? new Date(dateInput.includes('T') ? dateInput : `${dateInput}T12:00:00`)
    : dateInput;
  if (isNaN(d.getTime())) return 0;
  const jsDay = d.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  return (jsDay + 1) % 7;
}

/**
 * Converts "HH:MM" (or Persian digits) into minutes from midnight (0..1439).
 */
export function timeStringToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const english = timeStr.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const clean = english.replace(/[^0-9:]/g, '');
  const [h, m] = clean.split(':').map(n => parseInt(n, 10) || 0);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Converts minutes from midnight into 24h format "HH:MM".
 */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTimeWithPersianDigits(timeStr: string): string {
  return formatToPersianDigits(timeStr);
}

function getStoredSchedules(): DoctorSchedule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(MOCK_DOCTOR_SCHEDULES));
  return MOCK_DOCTOR_SCHEDULES;
}

function saveSchedules(schedules: DoctorSchedule[]): void {
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
}

function getStoredBlocks(): ScheduleBlock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(MOCK_SCHEDULE_BLOCKS));
  return MOCK_SCHEDULE_BLOCKS;
}

function saveBlocks(blocks: ScheduleBlock[]): void {
  localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
}

function getStoredAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // fallback
  }
  return [];
}

export const appointmentAvailabilityService = {
  /**
   * Get all schedules, optionally filtered by doctorId, officeId, or visitType.
   */
  async getDoctorSchedules(doctorId?: string, officeId?: string, visitType?: VisitType): Promise<DoctorSchedule[]> {
    let list = getStoredSchedules();
    if (doctorId) list = list.filter(s => s.doctorId === doctorId);
    if (officeId) list = list.filter(s => !s.officeId || s.officeId === officeId);
    if (visitType) list = list.filter(s => s.visitTypes.includes(visitType));
    return list;
  },

  /**
   * Get all schedule blocks (leaves, closed offices, breaks, etc.)
   */
  async getScheduleBlocks(doctorId?: string, officeId?: string): Promise<ScheduleBlock[]> {
    let list = getStoredBlocks();
    if (doctorId) list = list.filter(b => !b.doctorId || b.doctorId === doctorId);
    if (officeId) list = list.filter(b => !b.officeId || b.officeId === officeId);
    return list;
  },

  /**
   * Calculate available and unavailable slots for a doctor on a specific date.
   * Derived from:
   * Doctor Schedule + Office Schedule + Blocked Times + Visit Duration + Existing Appointments.
   */
  async calculateAvailableSlots(params: {
    doctorId: string;
    date: string; // YYYY-MM-DD
    officeId?: string;
    branchId?: string;
    visitType?: VisitType;
    includeUnavailable?: boolean;
  }): Promise<TimeSlotInfo[]> {
    const { doctorId, date, officeId, branchId, visitType = 'in_person', includeUnavailable = false } = params;

    if (!doctorId || !date) return [];

    const dayOfWeek = getPersianDayOfWeek(date);
    const allSchedules = getStoredSchedules();
    const allBlocks = getStoredBlocks();
    const allAppointments = getStoredAppointments();

    // 1. Find matching active schedules for this day of week
    const matchingSchedules = allSchedules.filter(s => {
      if (!s.active) return false;
      if (s.doctorId !== doctorId) return false;
      if (s.dayOfWeek !== dayOfWeek) return false;
      if (officeId && s.officeId && s.officeId !== officeId) return false;
      if (branchId && s.branchId && s.branchId !== branchId) return false;
      if (visitType && !s.visitTypes.includes(visitType)) return false;
      return true;
    });

    if (matchingSchedules.length === 0) {
      return [];
    }

    // 2. Check blocks for this doctor and date
    const relevantBlocks = allBlocks.filter(b => {
      if (!b.active) return false;
      // Doctor scope
      if (b.doctorId && b.doctorId !== doctorId) return false;
      // Office scope
      if (officeId && b.officeId && b.officeId !== officeId) return false;
      // Branch scope
      if (branchId && b.branchId && b.branchId !== branchId) return false;

      // Date range check
      const endD = b.endDate || b.startDate;
      return date >= b.startDate && date <= endD;
    });

    // 3. Relevant existing appointments for this doctor on this date
    // Cancelled appointments FREE their slots. Active ones occupy their slots.
    const activeAppointments = allAppointments.filter(a => {
      if (a.doctorId !== doctorId) return false;
      if (a.date !== date) return false;
      // Canceled appointments do not block availability
      if (a.status === 'canceled') return false;
      return true;
    });

    const slotsMap = new Map<string, TimeSlotInfo>();
    const isToday = isDateToday(date);
    const now = new Date();
    const currentMinutesToday = isToday ? now.getHours() * 60 + now.getMinutes() : -1;

    for (const sch of matchingSchedules) {
      const startMin = timeStringToMinutes(sch.startTime);
      const endMin = timeStringToMinutes(sch.endTime);
      const interval = Math.max(10, sch.slotIntervalMinutes || sch.visitDurationMinutes || 20);
      const duration = sch.visitDurationMinutes || interval;

      for (let m = startMin; m + duration <= endMin; m += interval) {
        const timeSlot = minutesToTimeString(m);
        const slotEndMin = m + duration;

        // Determine if slot is blocked by a ScheduleBlock
        let isBlocked = false;
        let blockedReason: 'leave' | 'closed' | 'blocked' | undefined;

        for (const block of relevantBlocks) {
          const isFullDayBlock = !block.startTime && !block.endTime;
          if (isFullDayBlock) {
            isBlocked = true;
            blockedReason = block.reasonType === 'leave'
              ? 'leave'
              : block.reasonType === 'closed_office'
              ? 'closed'
              : 'blocked';
            break;
          } else {
            const bStart = timeStringToMinutes(block.startTime);
            const bEnd = timeStringToMinutes(block.endTime);
            // Overlap check
            if (m < bEnd && slotEndMin > bStart) {
              isBlocked = true;
              blockedReason = block.reasonType === 'leave'
                ? 'leave'
                : block.reasonType === 'closed_office'
                ? 'closed'
                : 'blocked';
              break;
            }
          }
        }

        // Determine if already booked
        const isBooked = activeAppointments.some(a => {
          const appSlotMinutes = timeStringToMinutes(a.timeSlot);
          // Match same time slot or overlapping duration
          return Math.abs(appSlotMinutes - m) < Math.min(interval, duration);
        });

        // Determine if already passed today (only if booking real-time today in the past)
        const isPassed = isToday && (m + 5 < currentMinutesToday);

        let unavailableReason: TimeSlotInfo['unavailableReason'] = undefined;
        let isAvailable = true;

        if (isBlocked) {
          isAvailable = false;
          unavailableReason = blockedReason;
        } else if (isBooked) {
          isAvailable = false;
          unavailableReason = 'booked';
        } else if (isPassed) {
          isAvailable = false;
          unavailableReason = 'passed';
        }

        const slotInfo: TimeSlotInfo = {
          timeSlot,
          persianTimeSlot: formatToPersianDigits(timeSlot),
          durationMinutes: duration,
          visitType: sch.visitTypes.includes(visitType) ? visitType : sch.visitTypes[0],
          officeId: sch.officeId,
          officeTitle: sch.officeTitle,
          branchId: sch.branchId,
          isAvailable,
          unavailableReason,
          scheduleId: sch.id
        };

        if (isAvailable || includeUnavailable) {
          // If already added by an earlier schedule, keep the available one
          if (!slotsMap.has(timeSlot) || (isAvailable && !slotsMap.get(timeSlot)?.isAvailable)) {
            slotsMap.set(timeSlot, slotInfo);
          }
        }
      }
    }

    // Return slots sorted chronologically
    const result = Array.from(slotsMap.values()).sort((a, b) => {
      return timeStringToMinutes(a.timeSlot) - timeStringToMinutes(b.timeSlot);
    });

    return result;
  },

  /**
   * Service-level validator: strictly validates if a slot is currently available before booking.
   * Prevents race conditions and double bookings.
   */
  async validateSlotAvailability(params: {
    doctorId: string;
    date: string;
    timeSlot: string;
    officeId?: string;
    branchId?: string;
    visitType?: VisitType;
  }): Promise<BookingValidationResult> {
    const { doctorId, date, timeSlot, officeId, branchId, visitType } = params;

    if (!doctorId || !date || !timeSlot) {
      return {
        success: false,
        reason: 'INVALID_DATE',
        message: 'اطلاعات تاریخ و زمان نوبت ناقص است.'
      };
    }

    // 1. Check existing appointments for conflict
    const allAppointments = getStoredAppointments();
    const conflictingApp = allAppointments.find(a => {
      if (a.doctorId !== doctorId) return false;
      if (a.date !== date) return false;
      if (a.status === 'canceled') return false; // Canceled visits free their slot
      return a.timeSlot === timeSlot;
    });

    if (conflictingApp) {
      return {
        success: false,
        reason: 'SLOT_ALREADY_BOOKED',
        message: 'این زمان لحظاتی قبل رزرو شد. لطفاً زمان دیگری انتخاب کنید.',
        conflictingAppointmentId: conflictingApp.id
      };
    }

    // 2. Check schedule blocks
    const allBlocks = getStoredBlocks();
    const slotMin = timeStringToMinutes(timeSlot);
    const dayOfWeek = getPersianDayOfWeek(date);
    const allSchedules = getStoredSchedules();

    // Look up matching schedule to determine actual visit duration
    const matchingSchedule = allSchedules.find(s => {
      if (!s.active || s.doctorId !== doctorId || s.dayOfWeek !== dayOfWeek) return false;
      if (officeId && s.officeId && s.officeId !== officeId) return false;
      if (branchId && s.branchId && s.branchId !== branchId) return false;
      if (visitType && !s.visitTypes.includes(visitType)) return false;

      const sStart = timeStringToMinutes(s.startTime);
      const sEnd = timeStringToMinutes(s.endTime);
      return slotMin >= sStart && slotMin < sEnd;
    }) || allSchedules.find(s => {
      if (!s.active || s.doctorId !== doctorId || s.dayOfWeek !== dayOfWeek) return false;
      if (officeId && s.officeId && s.officeId !== officeId) return false;
      if (branchId && s.branchId && s.branchId !== branchId) return false;
      if (visitType && !s.visitTypes.includes(visitType)) return false;
      return true;
    });

    const interval = matchingSchedule
      ? Math.max(10, matchingSchedule.slotIntervalMinutes || matchingSchedule.visitDurationMinutes || 20)
      : 20;
    const duration = matchingSchedule?.visitDurationMinutes || interval;
    const slotEndMin = slotMin + duration;

    for (const b of allBlocks) {
      if (!b.active) continue;
      if (b.doctorId && b.doctorId !== doctorId) continue;
      if (officeId && b.officeId && b.officeId !== officeId) continue;
      if (branchId && b.branchId && b.branchId !== branchId) continue;

      const endD = b.endDate || b.startDate;
      if (date >= b.startDate && date <= endD) {
        if (!b.startTime && !b.endTime) {
          return {
            success: false,
            reason: b.reasonType === 'leave' ? 'DOCTOR_ON_LEAVE' : 'SCHEDULE_BLOCKED',
            message: b.reasonType === 'leave'
              ? 'پزشک در این تاریخ در مرخصی به سر می‌برد.'
              : (b.reasonDescription || 'این تاریخ توسط کلینیک مسدود شده است.')
          };
        } else {
          const bStart = timeStringToMinutes(b.startTime);
          const bEnd = timeStringToMinutes(b.endTime);
          if (slotMin < bEnd && slotEndMin > bStart) {
            return {
              success: false,
              reason: 'SCHEDULE_BLOCKED',
              message: b.reasonDescription || 'این بازه زمانی غیرفعال است.'
            };
          }
        }
      }
    }

    // 3. Check if slot belongs to an active doctor schedule
    const hasMatchingSchedule = allSchedules.some(s => {
      if (!s.active || s.doctorId !== doctorId || s.dayOfWeek !== dayOfWeek) return false;
      if (officeId && s.officeId && s.officeId !== officeId) return false;
      if (visitType && !s.visitTypes.includes(visitType)) return false;

      const sStart = timeStringToMinutes(s.startTime);
      const sEnd = timeStringToMinutes(s.endTime);
      return slotMin >= sStart && slotMin < sEnd;
    });

    if (!hasMatchingSchedule) {
      return {
        success: false,
        reason: 'OUTSIDE_WORKING_HOURS',
        message: 'زمان انتخاب شده خارج از ساعات کاری و برنامه حضور پزشک است.'
      };
    }

    return { success: true };
  },

  /**
   * Computes the genuine earliest available slot for a doctor across upcoming days.
   * Used uniformly across DoctorCards, Doctor Profiles, and Doctor Sites without fabricating "امروز".
   */
  async getEarliestAvailableSlot(
    doctorId: string,
    options?: {
      officeId?: string;
      visitType?: VisitType;
      maxDaysToCheck?: number;
    }
  ): Promise<EarliestSlotInfo> {
    const maxDays = options?.maxDaysToCheck || 14;

    for (let offset = 0; offset < maxDays; offset++) {
      const dateStr = getRelativeISODate(offset);
      const slots = await this.calculateAvailableSlots({
        doctorId,
        date: dateStr,
        officeId: options?.officeId,
        visitType: options?.visitType
      });

      const availableSlots = slots.filter(s => s.isAvailable);

      if (availableSlots.length > 0) {
        const first = availableSlots[0];
        const isToday = offset === 0;
        const isTomorrow = offset === 1;
        const weekdayName = getPersianWeekdayName(dateStr);
        const persianDate = formatToPersianDate(dateStr);

        let label = '';
        if (isToday) {
          label = `امروز ساعت ${first.persianTimeSlot}`;
        } else if (isTomorrow) {
          label = `فردا (${weekdayName}) ساعت ${first.persianTimeSlot}`;
        } else {
          label = `${weekdayName} ${persianDate} ساعت ${first.persianTimeSlot}`;
        }

        return {
          label,
          date: dateStr,
          timeSlot: first.timeSlot,
          persianDateFormatted: persianDate,
          officeId: first.officeId,
          officeTitle: first.officeTitle,
          visitType: first.visitType,
          isToday,
          hasSlot: true
        };
      }
    }

    return {
      label: 'تکمیل ظرفیت / بدون نوبت فعال',
      isToday: false,
      hasSlot: false
    };
  },

  // Management CRUD Methods
  async createSchedule(schedule: Omit<DoctorSchedule, 'id'>): Promise<DoctorSchedule> {
    const list = getStoredSchedules();
    const created: DoctorSchedule = {
      ...schedule,
      id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    list.push(created);
    saveSchedules(list);
    return created;
  },

  async updateSchedule(id: string, updates: Partial<DoctorSchedule>): Promise<DoctorSchedule | null> {
    const list = getStoredSchedules();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    saveSchedules(list);
    return list[idx];
  },

  async deleteSchedule(id: string): Promise<boolean> {
    const list = getStoredSchedules();
    const filtered = list.filter(s => s.id !== id);
    if (filtered.length === list.length) return false;
    saveSchedules(filtered);
    return true;
  },

  async createScheduleBlock(block: Omit<ScheduleBlock, 'id'>): Promise<ScheduleBlock> {
    const list = getStoredBlocks();
    const created: ScheduleBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };
    list.push(created);
    saveBlocks(list);
    return created;
  },

  async deleteScheduleBlock(id: string): Promise<boolean> {
    const list = getStoredBlocks();
    const filtered = list.filter(b => b.id !== id);
    if (filtered.length === list.length) return false;
    saveBlocks(filtered);
    return true;
  },

  /**
   * Automated verification test runner for the 6 required scenarios.
   */
  async runAvailabilityEngineTests(): Promise<{
    passed: boolean;
    totalTests: number;
    passedTests: number;
    results: {
      id: string;
      title: string;
      passed: boolean;
      details: string;
    }[];
  }> {
    const results: { id: string; title: string; passed: boolean; details: string }[] = [];
    const testDocId = 'test-doc-spec-engine';
    const testOfficeA = 'off-test-a';
    const testOfficeB = 'off-test-b';

    // Setup fresh test state
    const originalSchedules = getStoredSchedules();
    const originalBlocks = getStoredBlocks();
    const originalAppointments = getStoredAppointments();

    try {
      // Test Schedule: Monday (Persian Day 2) for Office A (09:00-11:00) and Tuesday (Persian Day 3) for Office B (14:00-16:00)
      const testSchedules: DoctorSchedule[] = [
        {
          id: 'test-sch-a',
          doctorId: testDocId,
          officeId: testOfficeA,
          officeTitle: 'مطب الف',
          dayOfWeek: 2, // دوشنبه
          startTime: '09:00',
          endTime: '11:00',
          visitDurationMinutes: 30,
          slotIntervalMinutes: 30,
          visitTypes: ['in_person'],
          active: true
        },
        {
          id: 'test-sch-b',
          doctorId: testDocId,
          officeId: testOfficeB,
          officeTitle: 'مطب ب',
          dayOfWeek: 3, // سه‌شنبه
          startTime: '14:00',
          endTime: '16:00',
          visitDurationMinutes: 30,
          slotIntervalMinutes: 30,
          visitTypes: ['in_person'],
          active: true
        }
      ];
      saveSchedules(testSchedules);
      saveBlocks([]);
      saveAppointments([]);

      // Helper to find a specific Monday and Tuesday date
      const findUpcomingDateForPersianDay = (targetDayOfWeek: number) => {
        for (let i = 1; i <= 14; i++) {
          const dStr = getRelativeISODate(i);
          if (getPersianDayOfWeek(dStr) === targetDayOfWeek) {
            return dStr;
          }
        }
        return getRelativeISODate(1);
      };

      const testMonday = findUpcomingDateForPersianDay(2);
      const testTuesday = findUpcomingDateForPersianDay(3);

      // TEST 1: Valid slot appears for configured schedule
      const slotsMon = await this.calculateAvailableSlots({
        doctorId: testDocId,
        date: testMonday,
        officeId: testOfficeA,
        visitType: 'in_person'
      });
      const t1Passed = slotsMon.length === 4 && slotsMon[0].timeSlot === '09:00' && slotsMon[3].timeSlot === '10:30';
      results.push({
        id: 'TEST_1_VALID_SLOT_APPEARS',
        title: '۱. محاسبه و نمایش زمان‌های خالی بر اساس برنامه کاری پزشک',
        passed: t1Passed,
        details: t1Passed
          ? `۴ بازه زمانی (۰۹:۰۰، ۰۹:۳۰، ۱۰:۰۰، ۱۰:۳۰) برای روز دوشنبه به درستی تولید شد.`
          : `خطا در تولید اسلات‌ها: تعداد ${slotsMon.length} دریافت شد.`
      });

      // TEST 2: Already booked slot disappears from available slots
      const mockBookedApp: Appointment = {
        id: 'test-app-booked-1',
        trackingCode: 'SYN-TEST-1',
        doctorId: testDocId,
        doctorName: 'پزشک تست',
        doctorSpecialty: 'عمومی',
        doctorAvatar: '',
        patientId: 'p-test',
        patientName: 'بیمار تستی',
        patientPhone: '09120000000',
        visitType: 'in_person',
        date: testMonday,
        timeSlot: '09:30',
        status: 'scheduled',
        clinicAddress: 'مطب الف',
        officeId: testOfficeA,
        fee: 200000,
        paidStatus: 'paid',
        createdAt: new Date().toISOString()
      };
      saveAppointments([mockBookedApp]);

      const slotsAfterBooking = await this.calculateAvailableSlots({
        doctorId: testDocId,
        date: testMonday,
        officeId: testOfficeA,
        visitType: 'in_person'
      });
      const t2Passed = slotsAfterBooking.length === 3 && !slotsAfterBooking.some(s => s.timeSlot === '09:30');
      results.push({
        id: 'TEST_2_BOOKED_SLOT_DISAPPEARS',
        title: '۲. حذف نوبت رزرو شده از لیست اسلات‌های در دسترس',
        passed: t2Passed,
        details: t2Passed
          ? `نوبت ساعت ۰۹:۳۰ پس از رزرو با موفقیت از لیست نوبت‌های آزاد حذف گردید.`
          : `نوبت رزرو شده همچنان در لیست موجود است.`
      });

      // TEST 3: Simultaneous/double booking attempt is rejected
      const validationConflict = await this.validateSlotAvailability({
        doctorId: testDocId,
        date: testMonday,
        timeSlot: '09:30',
        officeId: testOfficeA,
        visitType: 'in_person'
      });
      const t3Passed = !validationConflict.success && validationConflict.reason === 'SLOT_ALREADY_BOOKED';
      results.push({
        id: 'TEST_3_DOUBLE_BOOKING_REJECTED',
        title: '۳. رد درخواست رزرو تکراری و پیشگیری از Double Booking',
        passed: t3Passed,
        details: t3Passed
          ? `رزرو همزمان نوبت اشغال‌شده رد شد با پیام: "${validationConflict.message}".`
          : `اعتبارسنجی رزرو تکراری شکست خورد.`
      });

      // TEST 4: Cancelled slot becomes available again
      const canceledAppointments: Appointment[] = [
        {
          ...mockBookedApp,
          status: 'canceled',
          canceledAt: new Date().toISOString()
        }
      ];
      saveAppointments(canceledAppointments);

      const slotsAfterCancel = await this.calculateAvailableSlots({
        doctorId: testDocId,
        date: testMonday,
        officeId: testOfficeA,
        visitType: 'in_person'
      });
      const t4Passed = slotsAfterCancel.some(s => s.timeSlot === '09:30') && slotsAfterCancel.length === 4;
      results.push({
        id: 'TEST_4_CANCELLED_SLOT_REAVAILABLE',
        title: '۴. آزاد شدن مجدد زمان پس از لغو نوبت (Appointment Cancellation)',
        passed: t4Passed,
        details: t4Passed
          ? `نوبت لغو شده (۰۹:۳۰) بلافاصله در لیست زمان‌های آزاد قرار گرفت.`
          : `نوبت پس از لغو آزاد نشد.`
      });

      // TEST 5: Office A schedule does not appear under Office B
      const slotsOfficeBOnMonday = await this.calculateAvailableSlots({
        doctorId: testDocId,
        date: testMonday,
        officeId: testOfficeB,
        visitType: 'in_person'
      });
      const slotsOfficeBOnTuesday = await this.calculateAvailableSlots({
        doctorId: testDocId,
        date: testTuesday,
        officeId: testOfficeB,
        visitType: 'in_person'
      });
      const t5Passed = slotsOfficeBOnMonday.length === 0 && slotsOfficeBOnTuesday.length === 4;
      results.push({
        id: 'TEST_5_OFFICE_SPECIFIC_AVAILABILITY',
        title: '۵. تفکیک نوبت‌دهی و زمان‌های حضور بر اساس مطب انتخابی',
        passed: t5Passed,
        details: t5Passed
          ? `برنامه مطب الف (دوشنبه‌ها) به درستی در مطب ب نمایش داده نشد و تفکیک رعایت گردید.`
          : `تداخل بین برنامه‌های مطب الف و مطب ب مشاهده شد.`
      });

      // TEST 6: Doctor leave / ScheduleBlock blocks the date
      const testLeaveBlock: ScheduleBlock = {
        id: 'test-block-leave',
        doctorId: testDocId,
        startDate: testMonday,
        endDate: testMonday,
        reasonType: 'leave',
        reasonDescription: 'مرخصی استعلاجی تستی',
        active: true
      };
      saveBlocks([testLeaveBlock]);

      const slotsDuringLeave = await this.calculateAvailableSlots({
        doctorId: testDocId,
        date: testMonday,
        officeId: testOfficeA,
        visitType: 'in_person'
      });
      const leaveValidation = await this.validateSlotAvailability({
        doctorId: testDocId,
        date: testMonday,
        timeSlot: '09:00',
        officeId: testOfficeA,
        visitType: 'in_person'
      });
      const t6Passed = slotsDuringLeave.length === 0 && !leaveValidation.success && (leaveValidation.reason === 'DOCTOR_ON_LEAVE' || leaveValidation.reason === 'SCHEDULE_BLOCKED');
      results.push({
        id: 'TEST_6_LEAVE_BLOCKS_DATE',
        title: '۶. مسدود شدن کامل تاریخ در زمان مرخصی یا تعطیلی مطب (ScheduleBlock)',
        passed: t6Passed,
        details: t6Passed
          ? `ثبت مرخصی روز دوشنبه کلیه نوبت‌ها را مسدود کرد و درخواست با پیام "${leaveValidation.message}" مسدود شد.`
          : `مرخصی مانع تولید نوبت نشد.`
      });
    } finally {
      // Restore original state
      saveSchedules(originalSchedules);
      saveBlocks(originalBlocks);
      saveAppointments(originalAppointments);
    }

    const passedCount = results.filter(r => r.passed).length;
    return {
      passed: passedCount === results.length,
      totalTests: results.length,
      passedTests: passedCount,
      results
    };
  }
};

function saveAppointments(appointments: Appointment[]): void {
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
}
