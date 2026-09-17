import { Doctor, DoctorClinicMembership, DoctorWebsiteConfig, DoctorWebsiteStatus, User } from '../types';
import { canManageDoctorWebsite } from './authUtils';

/**
 * Domain Configuration for Hamrah Network:
 * Main site: hamrah.ir
 * Doctor websites: [subdomain].hamrah.ir
 */
export const HAMRAH_MAIN_DOMAIN = 'hamrah.ir';
export const HAMRAH_MAIN_URL = 'https://hamrah.ir';

/**
 * Generates or resolves the official Hamrah subdomain for a doctor or slug.
 * Format: dr-maryam.hamrah.ir or [subdomain].hamrah.ir
 */
export function getDoctorSubdomain(doctorOrSlug?: { slug?: string; websiteConfig?: { websiteSubdomain?: string } } | string | null): string {
  if (!doctorOrSlug) return `doctor.${HAMRAH_MAIN_DOMAIN}`;
  
  if (typeof doctorOrSlug === 'string') {
    let clean = doctorOrSlug.replace(/^(dr-)?/, '');
    clean = clean.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    return `dr-${clean || 'specialist'}.${HAMRAH_MAIN_DOMAIN}`;
  }

  const custom = doctorOrSlug.websiteConfig?.websiteSubdomain;
  if (custom) {
    // Normalize any legacy format like hamrahclinic.ir -> hamrah.ir
    let normalized = custom.trim().toLowerCase().replace(/\.hamrahclinic\.ir$/i, `.${HAMRAH_MAIN_DOMAIN}`);
    if (!normalized.endsWith(`.${HAMRAH_MAIN_DOMAIN}`) && !normalized.includes('.')) {
      normalized = `${normalized}.${HAMRAH_MAIN_DOMAIN}`;
    }
    return normalized;
  }

  const slug = doctorOrSlug.slug || 'doctor';
  const clean = slug.replace(/^(dr-)?/, '').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  return `dr-${clean || 'specialist'}.${HAMRAH_MAIN_DOMAIN}`;
}

/**
 * Checks if this is the primary/first doctor website (uses main Hamrah domain link).
 * Per requirement: First site uses main Hamrah link (hemera.clinic/dr/slug), other sites use Hamrah subdomain (slug.hemera.clinic).
 */
export function isPrimaryDoctorSite(doctorOrSlug?: { id?: string; slug?: string } | string | null): boolean {
  if (!doctorOrSlug) return false;
  if (typeof doctorOrSlug === 'string') {
    return doctorOrSlug === 'dr-maryam-hosseini' || doctorOrSlug === 'doc-1';
  }
  return doctorOrSlug.id === 'doc-1' || doctorOrSlug.slug === 'dr-maryam-hosseini';
}

/**
 * Returns the exact public URL configuration for a doctor site:
 * - First doctor (سایت اول): uses main Hamrah link e.g. hemera.clinic/dr/dr-maryam-hosseini
 * - Other doctors (مابقی سایت‌ها): use Hamrah subdomain e.g. dr-alireza-karimi.hemera.clinic
 */
export function getDoctorOfficialSiteUrl(doctorOrSlug?: { id?: string; slug?: string; websiteConfig?: { websiteSubdomain?: string } } | string | null): {
  url: string;
  displayUrl: string;
  isPrimary: boolean;
  badgeLabel: string;
  subdomainOnly: string;
} {
  const isPrimary = isPrimaryDoctorSite(doctorOrSlug);
  const slug = typeof doctorOrSlug === 'string' ? doctorOrSlug : (doctorOrSlug?.slug || 'doctor');

  if (isPrimary) {
    const displayUrl = `hemera.clinic/dr/${slug}`;
    return {
      url: `https://${displayUrl}`,
      displayUrl,
      isPrimary: true,
      badgeLabel: 'لینک اختصاصی همرا',
      subdomainOnly: 'hemera.clinic'
    };
  }

  // Other doctors: use Hamrah subdomain
  const cleanSub = slug.replace(/^(dr-)?/, '').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  const subdomain = `dr-${cleanSub || 'specialist'}.hemera.clinic`;
  return {
    url: `https://${subdomain}`,
    displayUrl: subdomain,
    isPrimary: false,
    badgeLabel: 'ساب‌دامنه اختصاصی همرا',
    subdomainOnly: `dr-${cleanSub || 'specialist'}`
  };
}

/**
 * Returns the full HTTPS URL for the doctor's subdomain
 * e.g. 'https://dr-maryam.hamrah.ir'
 */
export function getDoctorSubdomainUrl(doctorOrSlug?: { slug?: string; websiteConfig?: { websiteSubdomain?: string } } | string | null): string {
  const subdomain = getDoctorSubdomain(doctorOrSlug);
  return `https://${subdomain}`;
}

/**
 * Returns the prefix of the subdomain (e.g. 'dr-maryam' from 'dr-maryam.hamrah.ir')
 */
export function getDoctorSubdomainPrefix(doctorOrSlug?: { slug?: string; websiteConfig?: { websiteSubdomain?: string } } | string | null): string {
  const full = getDoctorSubdomain(doctorOrSlug);
  return full.replace(new RegExp(`\\.${HAMRAH_MAIN_DOMAIN.replace('.', '\\.')}$`), '');
}

/**
 * Extracts a doctor subdomain or slug from hostname (e.g., when visiting *.hamrah.ir or *.localhost)
 */
export function detectSubdomainSlug(hostname: string = typeof window !== 'undefined' ? window.location.hostname : ''): string | null {
  if (!hostname) return null;
  const parts = hostname.toLowerCase().split('.');
  if (parts.length >= 3) {
    const sub = parts[0];
    const reserved = ['www', 'api', 'admin', 'app', 'mail', 'auth', 'cdn', 'static'];
    if (!reserved.includes(sub)) {
      return sub;
    }
  }
  return null;
}

/**
 * Normalizes doctor website states into canonical format:
 * 'disabled' | 'draft' | 'published' | 'suspended'
 *
 * Resolves backward compatibility for legacy websiteEnabled and websitePublished booleans.
 */
export function resolveDoctorWebsiteStatus(config?: Partial<DoctorWebsiteConfig> | null): DoctorWebsiteStatus {
  if (!config) return 'draft';
  
  // Direct canonical status takes top priority
  if (config.websiteStatus) {
    return config.websiteStatus;
  }
  
  // Legacy resolution rules
  if (config.websiteEnabled === false) {
    return 'disabled';
  }
  
  if (config.websitePublished === false) {
    return 'draft';
  }
  
  if (config.websitePublished === true) {
    return 'published';
  }
  
  return 'draft';
}

/**
 * Checks if the doctor website is visible to anonymous public visitors.
 * Public visitors can access ONLY when status === 'published'.
 */
export function isWebsitePubliclyVisible(config?: Partial<DoctorWebsiteConfig> | null): boolean {
  return resolveDoctorWebsiteStatus(config) === 'published';
}

/**
 * Authorized preview permission check:
 * Preview is allowed ONLY for:
 * 1. The doctor who owns the website (currentUser.doctorId === targetDoctor.id)
 * 2. Explicitly authorized clinic manager (with doctor.website.manage permission AND matching active membership)
 * 3. Authorized Super Admin / Admin
 * Anonymous visitors or other doctors receive false.
 */
export function canPreviewDoctorWebsite(
  user: User | null | undefined, 
  doctorId: string,
  options?: {
    memberships?: DoctorClinicMembership[];
    doctor?: Doctor;
  }
): boolean {
  return canManageDoctorWebsite(user, doctorId, options);
}

/**
 * Helper to sync legacy boolean fields with canonical status when updating config.
 */
export function syncWebsiteStatusBooleans(status: DoctorWebsiteStatus): {
  websiteStatus: DoctorWebsiteStatus;
  websiteEnabled: boolean;
  websitePublished: boolean;
} {
  switch (status) {
    case 'published':
      return { websiteStatus: 'published', websiteEnabled: true, websitePublished: true };
    case 'draft':
      return { websiteStatus: 'draft', websiteEnabled: true, websitePublished: false };
    case 'disabled':
      return { websiteStatus: 'disabled', websiteEnabled: false, websitePublished: false };
    case 'suspended':
      return { websiteStatus: 'suspended', websiteEnabled: false, websitePublished: false };
    default:
      return { websiteStatus: 'draft', websiteEnabled: true, websitePublished: false };
  }
}

export interface WebsiteStatusMeta {
  status: DoctorWebsiteStatus;
  label: string;
  badgeVariant: 'emerald' | 'amber' | 'slate' | 'rose';
  description: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
}

export function getWebsiteStatusMeta(status: DoctorWebsiteStatus): WebsiteStatusMeta {
  switch (status) {
    case 'published':
      return {
        status: 'published',
        label: 'منتشر شده (عمومی)',
        badgeVariant: 'emerald',
        description: 'وبسایت در دسترس عموم کاربران و موتورهای جستجو قرار دارد.',
        emptyStateTitle: '',
        emptyStateDescription: ''
      };
    case 'draft':
      return {
        status: 'draft',
        label: 'پیش‌نویس (خصوصی)',
        badgeVariant: 'amber',
        description: 'وبسایت در حال ویرایش است و فقط برای پزشک و مدیر ارشد قابل پیش‌نمایش است.',
        emptyStateTitle: 'وبسایت این پزشک هنوز منتشر نشده است.',
        emptyStateDescription: 'این وبسایت در حال آماده‌سازی و بازبینی محتوا توسط پزشک معالج است و به زودی در دسترس عموم قرار خواهد گرفت.'
      };
    case 'disabled':
      return {
        status: 'disabled',
        label: 'غیرفعال',
        badgeVariant: 'slate',
        description: 'وبسایت توسط پزشک یا کلینیک غیرفعال گردیده است.',
        emptyStateTitle: 'وبسایت این پزشک فعال نیست.',
        emptyStateDescription: 'وبسایت اختصاصی این پزشک در حال حاضر غیرفعال می‌باشد.'
      };
    case 'suspended':
      return {
        status: 'suspended',
        label: 'تعلیق شده (توسط مدیریت)',
        badgeVariant: 'rose',
        description: 'دسترسی به این وبسایت به دلیل بررسی‌های نظارتی موقتاً محدود شده است.',
        emptyStateTitle: 'وبسایت این پزشک موقتاً در دسترس نیست.',
        emptyStateDescription: 'دسترسی عمومی به این صفحه موقتاً مقدور نمی‌باشد. جهت هماهنگی می‌توانید با پذیرش کلینیک تماس حاصل فرمایید.'
      };
  }
}
