import { Doctor, ClinicBranch, InsuranceCompany, InsuranceCoverageCalculationResult, Specialty } from '../types';
import { MOCK_INSURANCES } from '../data/mockData';

export interface InsuranceItemNormalized {
  id: string;
  name: string;
  type: 'basic' | 'supplementary' | 'specialized';
  coveragePercent: number;
}

/**
 * Standard insurance identifiers mapping to support both IDs and Persian display strings
 */
const INSURANCE_ALIAS_MAP: Record<string, { id: string; type: 'basic' | 'supplementary' | 'specialized' }> = {
  // Basic
  'ins-tamin': { id: 'ins-tamin', type: 'basic' },
  'تأمین اجتماعی': { id: 'ins-tamin', type: 'basic' },
  'تامین اجتماعی': { id: 'ins-tamin', type: 'basic' },
  'تأمین': { id: 'ins-tamin', type: 'basic' },
  'تامین': { id: 'ins-tamin', type: 'basic' },

  'ins-salamat': { id: 'ins-salamat', type: 'basic' },
  'بیمه سلامت (خدمات درمانی)': { id: 'ins-salamat', type: 'basic' },
  'بیمه سلامت': { id: 'ins-salamat', type: 'basic' },
  'سلامت': { id: 'ins-salamat', type: 'basic' },
  'خدمات درمانی': { id: 'ins-salamat', type: 'basic' },

  'ins-sata': { id: 'ins-sata', type: 'basic' },
  'نیروهای مسلح (ساتا)': { id: 'ins-sata', type: 'basic' },
  'نیروهای مسلح': { id: 'ins-sata', type: 'basic' },
  'ساتا': { id: 'ins-sata', type: 'basic' },

  'ins-salamat-hamgani': { id: 'ins-salamat-hamgani', type: 'basic' },
  'سلامت همگانی / ایرانیان': { id: 'ins-salamat-hamgani', type: 'basic' },
  'سلامت همگانی': { id: 'ins-salamat-hamgani', type: 'basic' },
  'ایرانیان': { id: 'ins-salamat-hamgani', type: 'basic' },

  // Supplementary
  'ins-iran': { id: 'ins-iran', type: 'supplementary' },
  'بیمه ایران': { id: 'ins-iran', type: 'supplementary' },
  'ایران': { id: 'ins-iran', type: 'supplementary' },

  'ins-dana': { id: 'ins-dana', type: 'supplementary' },
  'بیمه دانا': { id: 'ins-dana', type: 'supplementary' },
  'دانا': { id: 'ins-dana', type: 'supplementary' },

  'ins-asia': { id: 'ins-asia', type: 'supplementary' },
  'بیمه آسیا': { id: 'ins-asia', type: 'supplementary' },
  'آسیا': { id: 'ins-asia', type: 'supplementary' },

  'ins-alborz': { id: 'ins-alborz', type: 'supplementary' },
  'بیمه البرز': { id: 'ins-alborz', type: 'supplementary' },
  'البرز': { id: 'ins-alborz', type: 'supplementary' },

  'ins-pasargad': { id: 'ins-pasargad', type: 'supplementary' },
  'بیمه پاسارگاد': { id: 'ins-pasargad', type: 'supplementary' },
  'پاسارگاد': { id: 'ins-pasargad', type: 'supplementary' },

  'ins-saman': { id: 'ins-saman', type: 'supplementary' },
  'بیمه سامان': { id: 'ins-saman', type: 'supplementary' },
  'سامان': { id: 'ins-saman', type: 'supplementary' },

  'ins-parsian': { id: 'ins-parsian', type: 'supplementary' },
  'بیمه پارسیان': { id: 'ins-parsian', type: 'supplementary' },
  'پارسیان': { id: 'ins-parsian', type: 'supplementary' },

  'ins-kowsar': { id: 'ins-kowsar', type: 'supplementary' },
  'بیمه کوثر': { id: 'ins-kowsar', type: 'supplementary' },
  'کوثر': { id: 'ins-kowsar', type: 'supplementary' }
};

/**
 * Normalizes an insurance string/id to a known company record
 */
export function resolveInsuranceCompany(input?: string | null): InsuranceCompany | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (!trimmed || trimmed === 'بدون بیمه پایه' || trimmed === 'فاقد بیمه تکمیلی' || trimmed === 'همه بیمه‌ها') {
    return undefined;
  }

  // 1. Direct ID match
  const byId = MOCK_INSURANCES.find(i => i.id.toLowerCase() === trimmed.toLowerCase());
  if (byId) return byId;

  // 2. Direct Name match
  const byName = MOCK_INSURANCES.find(i => i.name.toLowerCase() === trimmed.toLowerCase());
  if (byName) return byName;

  // 3. Alias map lookup
  const alias = INSURANCE_ALIAS_MAP[trimmed];
  if (alias) {
    const found = MOCK_INSURANCES.find(i => i.id === alias.id);
    if (found) return found;
  }

  // 4. Fuzzy inclusion lookup
  const fuzzy = MOCK_INSURANCES.find(i => 
    i.name.includes(trimmed) || 
    trimmed.includes(i.name) ||
    (trimmed.includes('سلامت') && i.name.includes('خدمات درمانی')) ||
    (trimmed.includes('خدمات') && i.name.includes('سلامت'))
  );

  return fuzzy;
}

/**
 * Checks if a list of supported insurance strings matches a specific target insurance
 */
export function supportsInsurance(supportedInsurances: string[] | undefined, targetInsurance?: string | null): boolean {
  if (!targetInsurance) return true;
  const target = resolveInsuranceCompany(targetInsurance);
  if (!target) return true; // If target was non-selective (e.g. 'none'), it matches

  if (!supportedInsurances || supportedInsurances.length === 0) {
    return false;
  }

  return supportedInsurances.some(docIns => {
    const resolvedDocIns = resolveInsuranceCompany(docIns);
    if (resolvedDocIns && resolvedDocIns.id === target.id) {
      return true;
    }
    // Fallback text check
    return docIns.includes(target.name) || target.name.includes(docIns);
  });
}

/**
 * Central matching logic for doctor vs selected basic & supplementary insurances.
 * Case A (Basic only): Doctor must support basic insurance.
 * Case B (Supp only): Doctor must support supplementary insurance.
 * Case C (Both selected): Doctor must support BOTH basic AND supplementary insurances.
 */
export function matchesDoctorInsuranceSelection(
  doctor: Doctor,
  selectedBasicInsurance?: string | null,
  selectedSupplementaryInsurance?: string | null
): boolean {
  const hasBasicChoice = Boolean(
    selectedBasicInsurance &&
    selectedBasicInsurance !== 'بدون بیمه پایه' &&
    selectedBasicInsurance !== 'همه بیمه‌ها' &&
    selectedBasicInsurance.trim() !== ''
  );

  const hasSuppChoice = Boolean(
    selectedSupplementaryInsurance &&
    selectedSupplementaryInsurance !== 'فاقد بیمه تکمیلی' &&
    selectedSupplementaryInsurance !== 'همه بیمه‌ها' &&
    selectedSupplementaryInsurance.trim() !== ''
  );

  // If no insurance filter is active, any doctor matches
  if (!hasBasicChoice && !hasSuppChoice) {
    return true;
  }

  const basicMatches = hasBasicChoice
    ? supportsInsurance(doctor.supportedInsurances, selectedBasicInsurance)
    : true;

  const suppMatches = hasSuppChoice
    ? supportsInsurance(doctor.supportedInsurances, selectedSupplementaryInsurance)
    : true;

  // Case C: When both are selected, doctor must satisfy BOTH requirements
  if (hasBasicChoice && hasSuppChoice) {
    return basicMatches && suppMatches;
  }

  // Case A: Only basic selected
  if (hasBasicChoice) {
    return basicMatches;
  }

  // Case B: Only supplementary selected
  return suppMatches;
}

/**
 * Checks if a branch supports the given insurance combination
 */
export function matchesBranchInsuranceSelection(
  branch: ClinicBranch,
  selectedBasicInsurance?: string | null,
  selectedSupplementaryInsurance?: string | null
): boolean {
  const hasBasicChoice = Boolean(
    selectedBasicInsurance &&
    selectedBasicInsurance !== 'بدون بیمه پایه' &&
    selectedBasicInsurance !== 'همه بیمه‌ها' &&
    selectedBasicInsurance.trim() !== ''
  );

  const hasSuppChoice = Boolean(
    selectedSupplementaryInsurance &&
    selectedSupplementaryInsurance !== 'فاقد بیمه تکمیلی' &&
    selectedSupplementaryInsurance !== 'همه بیمه‌ها' &&
    selectedSupplementaryInsurance.trim() !== ''
  );

  // If no insurance filter is active, branch matches
  if (!hasBasicChoice && !hasSuppChoice) {
    return true;
  }

  const branchInsurances = branch.supportedInsurances || [];

  const basicMatches = hasBasicChoice
    ? supportsInsurance(branchInsurances, selectedBasicInsurance)
    : true;

  const suppMatches = hasSuppChoice
    ? supportsInsurance(branchInsurances, selectedSupplementaryInsurance)
    : true;

  if (hasBasicChoice && hasSuppChoice) {
    return basicMatches && suppMatches;
  }

  if (hasBasicChoice) {
    return basicMatches;
  }

  return suppMatches;
}

/**
 * Checks if supported insurances match ANY of the target insurances
 */
export function supportsAnyInsurance(supportedInsurances: string[] | undefined, targetInsurances: string[]): boolean {
  if (!targetInsurances || targetInsurances.length === 0) return true;
  return targetInsurances.some(t => supportsInsurance(supportedInsurances, t));
}

/**
 * Checks if supported insurances match ALL of the target insurances
 */
export function supportsAllInsurances(supportedInsurances: string[] | undefined, targetInsurances: string[]): boolean {
  if (!targetInsurances || targetInsurances.length === 0) return true;
  return targetInsurances.every(t => supportsInsurance(supportedInsurances, t));
}

/**
 * Returns which target insurances are accepted
 */
export function getMatchingInsurances(supportedInsurances: string[] | undefined, targetInsurances: string[]): string[] {
  if (!targetInsurances || targetInsurances.length === 0) return [];
  return targetInsurances.filter(t => supportsInsurance(supportedInsurances, t));
}

/**
 * Calculates best coverage given multiple selected insurances
 */
export function calculateMultiInsuranceCoverage(
  baseFee: number,
  selectedInsurances: string[]
): InsuranceCoverageCalculationResult {
  const safeFee = Math.max(0, Math.round(Number(baseFee) || 0));
  if (!selectedInsurances || selectedInsurances.length === 0) {
    return calculateDemoCoverage(safeFee, null, null);
  }

  // Find all basic insurances in selection and pick the one with highest coverage
  const resolved = selectedInsurances.map(s => resolveInsuranceCompany(s)).filter((x): x is InsuranceCompany => Boolean(x));
  const basicList = resolved.filter(i => i.type === 'basic');
  const suppList = resolved.filter(i => i.type === 'supplementary' || i.type === 'specialized');

  const bestBasic = basicList.sort((a, b) => b.coverageCoPayPercent - a.coverageCoPayPercent)[0];
  const bestSupp = suppList.sort((a, b) => b.coverageCoPayPercent - a.coverageCoPayPercent)[0];

  return calculateDemoCoverage(safeFee, bestBasic?.name, bestSupp?.name);
}

/**
 * Calculates demo coverage with consistent formula
 */
export function calculateDemoCoverage(
  baseFee: number,
  selectedBasicInsurance?: string | null,
  selectedSupplementaryInsurance?: string | null
): InsuranceCoverageCalculationResult {
  const safeFee = Math.max(0, Math.round(Number(baseFee) || 0));

  const basicIns = resolveInsuranceCompany(selectedBasicInsurance);
  const suppIns = resolveInsuranceCompany(selectedSupplementaryInsurance);

  let basicDiscount = 0;
  if (basicIns && basicIns.type === 'basic') {
    basicDiscount = Math.round(safeFee * (basicIns.coverageCoPayPercent / 100));
  }

  const remainingAfterBasic = Math.max(0, safeFee - basicDiscount);

  let suppDiscount = 0;
  if (suppIns && (suppIns.type === 'supplementary' || suppIns.type === 'specialized')) {
    suppDiscount = Math.round(remainingAfterBasic * (suppIns.coverageCoPayPercent / 100));
  }

  const totalDiscount = Math.min(safeFee, basicDiscount + suppDiscount);
  const patientPayable = Math.max(0, safeFee - totalDiscount);
  const savingsPercentage = safeFee > 0 ? Math.round((totalDiscount / safeFee) * 100) : 0;

  return {
    baseFee: safeFee,
    basicInsuranceDiscount: basicDiscount,
    supplementaryInsuranceDiscount: suppDiscount,
    totalDiscount,
    patientPayable,
    appliedBasicInsurance: basicIns?.name,
    appliedSupplementaryInsurance: suppIns?.name,
    directClaimSupported: false, // Explicit prototype honesty
    ePrescriptionSupported: Boolean(basicIns?.electronicRxSupported),
    savingsPercentage
  };
}

export const DEMO_DISCLAIMER_TITLE = 'برآورد نمایشی هزینه و سهم بیمه';
export const DEMO_DISCLAIMER_TEXT = 'این محاسبه بر اساس داده‌های نمایشی انجام می‌شود و مبلغ واقعی ممکن است با توجه به قرارداد، تعرفه و شرایط بیمه متفاوت باشد.';

export const PRESET_DEMO_SERVICES = [
  { id: 'visit_specialist', label: 'ویزیت پزشک متخصص / فوق‌تخصص', fee: 350000 },
  { id: 'echo_cardio', label: 'اکوکاردیوگرافی پیشرفته قلب', fee: 450000 },
  { id: 'endoscopy', label: 'آندوسکوپی گوارش با بیهوشی', fee: 650000 },
  { id: 'physio', label: 'یک جلسه فیزیوتراپی کامل', fee: 280000 },
  { id: 'holter', label: 'هولتر مانیتورینگ ۲۴ ساعته', fee: 320000 },
  { id: 'custom', label: 'مبلغ دلخواه شما', fee: 350000 }
];
