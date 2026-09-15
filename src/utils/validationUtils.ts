/**
 * Persian / Iranian validation and normalization utilities
 */

/**
 * Normalizes Persian and Arabic numerals to English digits (0-9)
 */
export function normalizeDigits(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  const str = String(input);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  return str
    .replace(/[۰-۹]/g, d => String(persianDigits.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(arabicDigits.indexOf(d)))
    .trim();
}

/**
 * Validates whether a given string is a valid Iranian mobile number (e.g. 09121234567)
 */
export function isValidIranianMobile(phone: string | undefined | null): boolean {
  if (!phone) return false;
  const normalized = normalizeDigits(phone).replace(/[\s\-+]/g, '');
  
  // Format: 09XXXXXXXXX (11 digits) or 989XXXXXXXXX (12 digits) or 00989XXXXXXXXX (14 digits) or 9XXXXXXXXX (10 digits)
  const mobileRegex = /^(?:(?:0098|98)|0)?9\d{9}$/;
  return mobileRegex.test(normalized);
}

/**
 * Formats a phone number to standard 11-digit Iranian format (09XXXXXXXXX)
 */
export function formatStandardIranianMobile(phone: string | undefined | null): string {
  if (!phone) return '';
  let digits = normalizeDigits(phone).replace(/\D/g, '');
  if (digits.startsWith('989')) {
    digits = '0' + digits.slice(2);
  } else if (digits.startsWith('9') && digits.length === 10) {
    digits = '0' + digits;
  }
  return digits;
}

/**
 * Validates standard 10-digit Iranian National ID (کد ملی)
 */
export function isValidIranianNationalId(nationalId: string | undefined | null): boolean {
  if (!nationalId) return false;
  const code = normalizeDigits(nationalId).replace(/\D/g, '');

  if (code.length !== 10) return false;

  // Reject all identical digits like 0000000000, 1111111111, etc.
  if (/^(\d)\1{9}$/.test(code)) return false;

  const checkDigit = parseInt(code[9], 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(code[i], 10) * (10 - i);
  }

  const remainder = sum % 11;
  if (remainder < 2) {
    return checkDigit === remainder;
  } else {
    return checkDigit === 11 - remainder;
  }
}
