import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doctor, Specialty, ClinicBranch } from '../../types';
import { MOCK_INSURANCES } from '../../data/mockData';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  RotateCcw, 
  Sparkles, 
  Building2, 
  Stethoscope, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Video, 
  PhoneCall, 
  UserCheck, 
  Award, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Globe, 
  Car, 
  FileText, 
  Star,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { formatToman } from '../../utils/currencyUtils';

export interface AdvancedSearchFilters {
  searchQuery: string;
  specialtyId: string;
  branchId: string;
  visitType: 'all' | 'in_person' | 'online' | 'phone';
  insurance: string;
  timing: 'all' | 'today' | 'tomorrow' | '3days' | 'evening';
  gender: 'all' | 'female' | 'male';
  seniority: 'all' | 'fellowship' | 'specialist' | 'experience10';
  hasSubdomain: boolean;
  hasEHR: boolean;
  hasParking: boolean;
  sortBy: 'recommended' | 'rating' | 'experience' | 'earliest' | 'price_asc';
}

interface AdvancedSearchConsoleProps {
  specialties: Specialty[];
  branches?: ClinicBranch[];
  doctors: Doctor[];
  initialFilters?: Partial<AdvancedSearchFilters>;
  onClose?: () => void;
  isInline?: boolean;
}

export const AdvancedSearchConsole: React.FC<AdvancedSearchConsoleProps> = ({
  specialties,
  branches = [],
  doctors,
  initialFilters,
  onClose,
  isInline = false
}) => {
  const navigate = useNavigate();

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');
  const [specialtyId, setSpecialtyId] = useState(initialFilters?.specialtyId || '');
  const [branchId, setBranchId] = useState(initialFilters?.branchId || '');
  const [visitType, setVisitType] = useState<'all' | 'in_person' | 'online' | 'phone'>(
    initialFilters?.visitType || 'all'
  );
  const [insurance, setInsurance] = useState(initialFilters?.insurance || '');
  const [timing, setTiming] = useState<'all' | 'today' | 'tomorrow' | '3days' | 'evening'>(
    initialFilters?.timing || 'all'
  );
  const [gender, setGender] = useState<'all' | 'female' | 'male'>(
    initialFilters?.gender || 'all'
  );
  const [seniority, setSeniority] = useState<'all' | 'fellowship' | 'specialist' | 'experience10'>(
    initialFilters?.seniority || 'all'
  );
  const [hasSubdomain, setHasSubdomain] = useState(initialFilters?.hasSubdomain || false);
  const [hasEHR, setHasEHR] = useState(initialFilters?.hasEHR || false);
  const [hasParking, setHasParking] = useState(initialFilters?.hasParking || false);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'experience' | 'earliest' | 'price_asc'>(
    initialFilters?.sortBy || 'recommended'
  );

  // Quick preview collapsed / expanded state
  const [showQuickResults, setShowQuickResults] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(true);

  // Active filters count calculation
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (specialtyId) count++;
    if (branchId) count++;
    if (visitType !== 'all') count++;
    if (insurance) count++;
    if (timing !== 'all') count++;
    if (gender !== 'all') count++;
    if (seniority !== 'all') count++;
    if (hasSubdomain) count++;
    if (hasEHR) count++;
    if (hasParking) count++;
    if (sortBy !== 'recommended') count++;
    return count;
  }, [
    searchQuery,
    specialtyId,
    branchId,
    visitType,
    insurance,
    timing,
    gender,
    seniority,
    hasSubdomain,
    hasEHR,
    hasParking,
    sortBy
  ]);

  // Real-time matched doctors
  const matchedDoctors = useMemo(() => {
    return doctors.filter(doc => {
      // 1. Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesSpecialty = doc.specialtyName.toLowerCase().includes(q);
        const matchesTitle = doc.title ? doc.title.toLowerCase().includes(q) : false;
        const matchesServices = doc.services && doc.services.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesSpecialty && !matchesTitle && !matchesServices) {
          return false;
        }
      }

      // 2. Specialty
      if (specialtyId && doc.specialtyId !== specialtyId) {
        return false;
      }

      // 3. Branch
      if (branchId) {
        if (doc.branchId && doc.branchId !== branchId) {
          return false;
        }
      }

      // 4. Visit Type
      if (visitType === 'online' && !doc.hasOnlineConsultation) {
        return false;
      }

      // 5. Insurance
      if (insurance) {
        const docInsurances = doc.supportedInsurances || [];
        const matchesIns = docInsurances.some(i => 
          i.toLowerCase().includes(insurance.toLowerCase()) || 
          insurance.toLowerCase().includes(i.toLowerCase())
        );
        if (!matchesIns) return false;
      }

      // 6. Timing / Slot
      if (timing === 'today') {
        const slot = doc.nextAvailableSlot || '';
        if (!slot.includes('امروز')) return false;
      } else if (timing === 'tomorrow') {
        const slot = doc.nextAvailableSlot || '';
        if (!slot.includes('فردا') && !slot.includes('امروز')) return false;
      } else if (timing === 'evening') {
        const slot = doc.nextAvailableSlot || '';
        const hasEveningHour = /(1[6-9]|2[0-1]):/.test(slot) || slot.includes('عصر');
        if (!hasEveningHour) return false;
      }

      // 7. Gender
      if (gender !== 'all' && doc.gender !== gender) {
        return false;
      }

      // 8. Seniority
      if (seniority === 'fellowship') {
        const isFellow = doc.title && (doc.title.includes('فوق تخصص') || doc.title.includes('فلوشیپ'));
        if (!isFellow) return false;
      } else if (seniority === 'experience10') {
        if (doc.experienceYears < 10) return false;
      }

      // 9. Subdomain
      if (hasSubdomain) {
        if (!doc.websiteSubdomain && doc.websiteConfig?.websiteStatus !== 'published') {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'price_asc') return (a.consultationFee || 0) - (b.consultationFee || 0);
      if (sortBy === 'earliest') {
        const aToday = (a.nextAvailableSlot || '').includes('امروز');
        const bToday = (b.nextAvailableSlot || '').includes('امروز');
        if (aToday && !bToday) return -1;
        if (!aToday && bToday) return 1;
      }
      return 0;
    });
  }, [
    doctors,
    searchQuery,
    specialtyId,
    branchId,
    visitType,
    insurance,
    timing,
    gender,
    seniority,
    hasSubdomain,
    sortBy
  ]);

  // Reset all filters
  const handleReset = () => {
    setSearchQuery('');
    setSpecialtyId('');
    setBranchId('');
    setVisitType('all');
    setInsurance('');
    setTiming('all');
    setGender('all');
    setSeniority('all');
    setHasSubdomain(false);
    setHasEHR(false);
    setHasParking(false);
    setSortBy('recommended');
  };

  // Submit and navigate to results page with URL query params
  const handleApplyAndSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (specialtyId) params.set('specialtyId', specialtyId);
    if (branchId) params.set('branchId', branchId);
    if (visitType === 'online') params.set('hasOnline', 'true');
    if (visitType !== 'all') params.set('visitType', visitType);
    if (insurance) params.set('insurance', insurance);
    if (timing !== 'all') params.set('timing', timing);
    if (gender !== 'all') params.set('gender', gender);
    if (seniority !== 'all') params.set('seniority', seniority);
    if (hasSubdomain) params.set('hasSubdomain', 'true');
    if (sortBy !== 'recommended') params.set('sortBy', sortBy);

    navigate(`/doctors?${params.toString()}`);
  };

  // Popular quick specialty tags
  const popularSpecialties = specialties.slice(0, 7);

  return (
    <div 
      className="bg-slate-900/95 border border-slate-700/90 text-white rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in transition-all text-right" 
      dir="rtl"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">جستجوی پیشرفته و فیلترهای جامع</h2>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-extrabold">
                  {activeFiltersCount} فیلتر فعال
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ترکیب تمام فیلترهای تخصصی، شعب، پوشش بیمه‌ها، نوبت آنلاین و فوری
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک‌سازی فیلترها</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="بازگشت به جستجوی سریع"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>بازگشت به جستجوی سریع</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Row: Keyword & Search Input */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span>نام پزشک، بیماری، علامت یا خدمت مورد نظر:</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="مثال: دکتر سعادت، آنژیوگرافی، میگرن، دیسک کمر، اکوکاردیوگرافی، بوتاکس..."
            className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl py-2.5 px-4 text-xs sm:text-sm text-white placeholder-slate-500 outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Core Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Medical Specialty */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
            <span>تخصص و دپارتمان پزشکی:</span>
          </label>
          <select
            value={specialtyId}
            onChange={e => setSpecialtyId(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="">همه تخصص‌ها ({specialties.length} تخصص فعال)</option>
            {specialties.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.doctorCount} پزشک)
              </option>
            ))}
          </select>
        </div>

        {/* 2. Clinic Branch & Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>شعبه یا کلینیک درمانی:</span>
          </label>
          <select
            value={branchId}
            onChange={e => setBranchId(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="">همه شعب همرا کلینیک</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.city} - {b.isOpenNow ? 'پذیرش فعال' : 'شبانه‌روزی'})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Insurance Coverage */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>بیمه پایه یا تکمیلی طرف قرارداد:</span>
          </label>
          <select
            value={insurance}
            onChange={e => setInsurance(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="">همه بیمه‌ها (بدون محدودیت بیمه)</option>
            <optgroup label="بیمه‌های پایه">
              {MOCK_INSURANCES.filter(i => i.type === 'basic').map(ins => (
                <option key={ins.id} value={ins.name}>
                  {ins.name} ({ins.coverageCoPayPercent}٪ پوشش آنلاین)
                </option>
              ))}
            </optgroup>
            <optgroup label="بیمه‌های تکمیلی">
              {MOCK_INSURANCES.filter(i => i.type !== 'basic').map(ins => (
                <option key={ins.id} value={ins.name}>
                  {ins.name} ({ins.coverageCoPayPercent}٪ کسر مستقیم)
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* 4. Visit Modality */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-sky-400" />
            <span>نوع و شیوه ویزیت:</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setVisitType('all')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                visitType === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              همه شیوه‌ها
            </button>
            <button
              type="button"
              onClick={() => setVisitType('in_person')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                visitType === 'in_person'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              حضوری در مطب
            </button>
            <button
              type="button"
              onClick={() => setVisitType('online')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                visitType === 'online'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              آنلاین تصویری
            </button>
          </div>
        </div>

        {/* 5. Appointment Availability & Timing */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>زمان و فوریت نوبت:</span>
          </label>
          <select
            value={timing}
            onChange={e => setTiming(e.target.value as any)}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="all">همه زمان‌ها (عادی و رزروهای آتی)</option>
            <option value="today">نوبت فوری خالی امروز</option>
            <option value="tomorrow">نوبت خالی فردا</option>
            <option value="evening">شیفت عصر (ساعت ۱۶:۰۰ تا ۲۱:۰۰)</option>
          </select>
        </div>

        {/* 6. Sorting Criterion */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>مرتب‌سازی نتایج:</span>
          </label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="recommended">پیشنهادی هوشمند همرا کلینیک</option>
            <option value="rating">بالاترین امتیاز رضایت بیماران (ستاره)</option>
            <option value="experience">بیشترین سابقه و سال‌های طبابت</option>
            <option value="earliest">نزدیک‌ترین نوبت آزاد (فوری)</option>
            <option value="price_asc">کمترین تعرفه ویزیت</option>
          </select>
        </div>
      </div>

      {/* Quick Specialty Chips Filter */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold text-slate-400 block">دسترسی سریع به تخصص‌های پرتکرار:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSpecialtyId('')}
            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              specialtyId === ''
                ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            همه تخصص‌ها
          </button>
          {popularSpecialties.map(spec => (
            <button
              key={spec.id}
              type="button"
              onClick={() => setSpecialtyId(spec.id === specialtyId ? '' : spec.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                specialtyId === spec.id
                  ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {spec.name}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Capabilities & Feature Toggles (Collapsible or visible) */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between py-1 cursor-pointer" onClick={() => setShowMoreFilters(!showMoreFilters)}>
          <span className="text-xs font-extrabold text-slate-300 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>ویژگی‌های تکمیلی (جنسیت پزشک، رتبه علمی، ساب‌دامنه همرا و خدمات دیجیتال)</span>
          </span>
          <button
            type="button"
            className="text-xs text-blue-400 flex items-center gap-1 cursor-pointer font-bold"
          >
            <span>{showMoreFilters ? 'بستن گزینه‌های تکمیلی' : 'نمایش گزینه‌های تکمیلی'}</span>
            {showMoreFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showMoreFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            {/* Gender */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">جنسیت پزشک:</label>
              <div className="grid grid-cols-3 gap-1 text-xs">
                {[
                  { id: 'all', label: 'همه' },
                  { id: 'female', label: 'خانم' },
                  { id: 'male', label: 'آقا' }
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGender(g.id as any)}
                    className={`py-1.5 rounded-lg border text-center font-bold text-xs transition-colors cursor-pointer ${
                      gender === g.id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-950/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seniority */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">مرتبه علمی و سابقه:</label>
              <select
                value={seniority}
                onChange={e => setSeniority(e.target.value as any)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="all">همه مراتب علمی</option>
                <option value="fellowship">فقط فوق تخصص و فلوشیپ</option>
                <option value="experience10">بیش از ۱۰ سال سابقه بالینی</option>
              </select>
            </div>

            {/* Digital capabilities */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">خدمات دیجیتال و برندینگ:</label>
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasSubdomain}
                    onChange={e => setHasSubdomain(e.target.checked)}
                    className="w-4 h-4 rounded-sm bg-slate-950 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                  />
                  <span>دارای سایت و ساب‌دامنه اختصاصی همرا (<span className="text-purple-300 font-mono text-[10px]" dir="ltr">*.hamrah.ir</span>)</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar & Live Matching Indicator */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Real-time Matching Counter */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs shrink-0">
            {matchedDoctors.length}
          </div>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>{matchedDoctors.length} پزشک متخصص منطبق با فیلترها</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {matchedDoctors.length > 0
                ? 'امکان رزرو آنلاین فوری نوبت و مشاوره'
                : 'با تغییر یا کاهش فیلترها، پزشکان بیشتری نمایش داده می‌شوند'}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {matchedDoctors.length > 0 && (
            <button
              type="button"
              onClick={() => setShowQuickResults(!showQuickResults)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{showQuickResults ? 'بستن پیش‌نمایش' : 'پیش‌نمایش نتایج'}</span>
              {showQuickResults ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            onClick={handleApplyAndSearch}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>نمایش نتایج و رزرو نوبت ({matchedDoctors.length})</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Results Drawer / Previews */}
      {showQuickResults && matchedDoctors.length > 0 && (
        <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>پیش‌نمایش برترین پزشکان منطبق با فیلترهای انتخابی شما:</span>
            <button
              onClick={handleApplyAndSearch}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>مشاهده همه در صفحه جستجوی جامع</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {matchedDoctors.slice(0, 3).map(doc => (
              <div
                key={doc.id}
                onClick={() => navigate(`/doctors/${doc.slug}`)}
                className="bg-slate-950/70 hover:bg-slate-950 p-3.5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-white group-hover:text-blue-400 transition-colors truncate">
                      {doc.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{doc.specialtyName}</p>
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-500">({doc.reviewCount} نظر)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold">
                    {doc.nextAvailableSlot || 'نوبت فعال'}
                  </span>
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
                  >
                    رزرو نوبت
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
