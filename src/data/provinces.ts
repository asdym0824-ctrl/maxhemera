/**
 * فهرست جامع استان‌های کشور جهت دسته‌بندی و فیلتر پزشکان
 * مطابق با فهرست استاندارد درخواست شده توسط کاربر
 */

export const IRAN_PROVINCES = [
  'استان آذربایجان شرقی',
  'استان آذربایجان غربی',
  'استان اردبیل',
  'استان اصفهان',
  'استان البرز',
  'استان ایلام',
  'استان بوشهر',
  'استان تهران',
  'استان چهارمحال و بختیاری',
  'استان خراسان جنوبی',
  'استان خراسان رضوی',
  'استان خراسان شمالی',
  'استان خوزستان',
  'استان زنجان',
  'استان سمنان',
  'استان سیستان و بلوچستان',
  'استان فارس',
  'استان قزوین',
  'استان قم',
  'استان گلستان',
  'استان گیلان',
  'استان لرستان',
  'استان مازندران',
  'استان مرکزی',
  'استان هرمزگان',
  'استان همدان',
  'استان کردستان',
  'استان کرمان',
] as const;

export type IranProvince = typeof IRAN_PROVINCES[number];

/**
 * حذف پیشوند 'استان ' جهت نمایش فشرده‌تر در صورت لزوم
 */
export function getShortProvinceName(provinceFullName: string): string {
  if (!provinceFullName) return '';
  return provinceFullName.replace(/^استان\s+/, '').trim();
}

/**
 * تطبیق پزشک با استان مورد نظر
 */
export function isDoctorInProvince(
  doctor: { province?: string; city?: string; address?: string },
  targetProvince: string
): boolean {
  if (!targetProvince) return true;

  const targetClean = targetProvince.trim();
  const targetShort = getShortProvinceName(targetClean);

  if (doctor.province) {
    const docProv = doctor.province.trim();
    if (docProv === targetClean || getShortProvinceName(docProv) === targetShort) {
      return true;
    }
  }

  // بررسی شهر یا متن آدرس پزشک
  if (doctor.city) {
    const city = doctor.city.trim();
    if (city.includes(targetShort) || targetShort.includes(city)) {
      return true;
    }
  }

  if (doctor.address) {
    if (doctor.address.includes(targetClean) || doctor.address.includes(targetShort)) {
      return true;
    }
  }

  return false;
}
