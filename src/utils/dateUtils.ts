/**
 * Utility functions for generating dynamic relative dates and formatting dates for Persian users.
 */

export function getRelativeISODate(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDateToday(dateInput?: string): boolean {
  if (!dateInput) return false;
  const todayISO = getRelativeISODate(0);
  return dateInput === todayISO;
}

export function isAppointmentToday(appointment: { date: string }): boolean {
  return isDateToday(appointment.date);
}

export function formatToPersianDate(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  } catch (e) {
    return String(dateInput);
  }
}

export function formatPersianTimestamp(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    const dateFormatted = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      month: 'short',
      day: 'numeric'
    }).format(d);

    const timeFormatted = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);

    return `${dateFormatted}، ساعت ${timeFormatted}`;
  } catch {
    return isoString;
  }
}

export function formatPersianTimeOnly(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  } catch {
    return isoString;
  }
}

export function calculateWaitTimeMinutes(arrivedAt?: string, visitStartedAt?: string): number | null {
  if (!arrivedAt) return null;
  try {
    const start = new Date(arrivedAt).getTime();
    const end = visitStartedAt ? new Date(visitStartedAt).getTime() : Date.now();
    if (isNaN(start) || isNaN(end) || end < start) return null;
    return Math.max(1, Math.round((end - start) / 60000));
  } catch {
    return null;
  }
}

export function calculateConsultationDurationMinutes(visitStartedAt?: string, completedAt?: string): number | null {
  if (!visitStartedAt) return null;
  try {
    const start = new Date(visitStartedAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    if (isNaN(start) || isNaN(end) || end < start) return null;
    return Math.max(1, Math.round((end - start) / 60000));
  } catch {
    return null;
  }
}

export function getPersianWeekdayName(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(d);
  } catch (e) {
    return '';
  }
}

export function getDynamicBookingDates() {
  return [0, 1, 2, 3].map((offset, idx) => {
    const dateStr = getRelativeISODate(offset);
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dayName = getPersianWeekdayName(d);
    const label = idx === 0 ? 'امروز' : idx === 1 ? 'فردا' : dayName;
    const persianFormatted = formatToPersianDate(d);
    return {
      label,
      dateStr,
      dayName,
      persianFormatted
    };
  });
}

export function formatToPersianDigits(num: number | string): string {
  return String(num).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
}

/**
 * Calculates patient age dynamically from birth date or birth year.
 * Returns undefined if no valid date/year is provided rather than fabricating age.
 */
export function calculateAge(birthDateOrYear?: string | number | null): number | undefined {
  if (!birthDateOrYear) return undefined;
  if (typeof birthDateOrYear === 'number') {
    if (birthDateOrYear > 1300 && birthDateOrYear < 1450) {
      // Solar Hijri year e.g. 1365 -> approx 1404 - 1365 = 39
      const currentShYear = 1404;
      const age = currentShYear - birthDateOrYear;
      return age >= 0 ? age : undefined;
    }
    if (birthDateOrYear > 1900 && birthDateOrYear < 2050) {
      const currentGrYear = new Date().getFullYear();
      const age = currentGrYear - birthDateOrYear;
      return age >= 0 ? age : undefined;
    }
    if (birthDateOrYear >= 0 && birthDateOrYear <= 120) {
      return birthDateOrYear;
    }
  }
  if (typeof birthDateOrYear === 'string') {
    const trimmed = birthDateOrYear.trim();
    if (/^\d{2,4}$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      return calculateAge(num);
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - parsed.getFullYear();
      const m = today.getMonth() - parsed.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < parsed.getDate())) {
        age--;
      }
      return age >= 0 ? age : undefined;
    }
  }
  return undefined;
}


