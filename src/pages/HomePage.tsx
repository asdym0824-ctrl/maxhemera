import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Doctor, Specialty, ServiceItem, HealthArticle, ClinicBranch } from '../types';
import { setSeoMetaData } from '../utils/seoUtils';
import { apiService } from '../services/apiService';
import { 
  Search, 
  ShieldCheck, 
  Stethoscope, 
  ArrowLeft, 
  ChevronLeft,
  Activity,
  Calendar,
  PhoneCall,
  Video,
  FileText,
  MapPin,
  Clock,
  Star,
  Sparkles,
  CheckCircle2,
  Users,
  Building2,
  HelpCircle,
  X,
  Zap,
  Award,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Filter,
  Navigation,
  LayoutGrid,
  List
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { DoctorCompactCard } from '../components/doctors/DoctorCompactCard';
import { MobileSpecialtiesModal } from '../components/specialties/MobileSpecialtiesModal';
import { SymptomDiscovery } from '../components/symptom/SymptomDiscovery';
import { AdvancedSearchConsole } from '../components/search/AdvancedSearchConsole';
import { MedicalPulseDivider } from '../components/common/medicalPattern/MedicalPulseDivider';
import { DnaHelixWatermark } from '../components/common/medicalPattern/DnaHelixWatermark';
import { ClinicalCornerAccents } from '../components/common/medicalPattern/ClinicalCardAccent';
import { MedicalVectorPattern } from '../components/common/medicalPattern/MedicalVectorPattern';
import { MobileDoctoretoReviews, PatientReview } from '../components/reviews/MobileDoctoretoReviews';
import { MobileDoctoretoArticles } from '../components/health/MobileDoctoretoArticles';

interface HomePageProps {
  doctors: Doctor[];
  specialties: Specialty[];
  services: ServiceItem[];
  articles: HealthArticle[];
  onNavigate?: (tab: string, extra?: any) => void;
  onSelectDoctor?: (slug: string) => void;
}

type HeroTabType = 'doctor' | 'advanced' | 'branch' | 'insurance' | 'symptom';
type DoctorFilterType = 'all' | 'today' | 'telehealth' | 'top-rated' | 'insurance';

export const HomePage: React.FC<HomePageProps> = ({
  doctors,
  specialties,
  services,
  articles,
  onNavigate,
  onSelectDoctor
}) => {
  const navigate = useNavigate();
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [activeHeroTab, setActiveHeroTab] = useState<HeroTabType>('doctor');
  const [selectedSpecialtyCategory, setSelectedSpecialtyCategory] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<DoctorFilterType>('all');
  const [selectedSpecialtyChip, setSelectedSpecialtyChip] = useState<string>('all');
  const [doctorViewMode, setDoctorViewMode] = useState<'grid' | 'compact'>('grid');
  const [visibleDoctorsCount, setVisibleDoctorsCount] = useState<number>(4);
  const [isSpecialtiesModalOpen, setIsSpecialtiesModalOpen] = useState(false);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('all');
  const [mobileServiceView, setMobileServiceView] = useState<'carousel' | 'list'>('carousel');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [branches, setBranches] = useState<ClinicBranch[]>([]);
  const [selectedInsurance, setSelectedInsurance] = useState('all');

  const availableServiceCategories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats);
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedServiceCategory === 'all') {
      return services;
    }
    return services.filter(s => s.category === selectedServiceCategory);
  }, [services, selectedServiceCategory]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSeoMetaData(
      'کلینیک تخصصی و فوق‌تخصصی همرا کلینیک | نوبت‌دهی آنلاین، ویزیت فوری و مشاوره پزشکی ۲۴ ساعته',
      'پلتفرم جامع پزشکی و دپارتمان‌های چندتخصصی همرا کلینیک. نوبت‌دهی حضوری و تصویری بیش از ۱۰۰ پزشک متخصص، پرونده الکترونیک سلامت، استعلام بیمه و خدمات پاراکلینیک.'
    );

    apiService.getBranches().then(b => setBranches(b)).catch(() => {});

    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDoctor = (slug: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (onSelectDoctor) {
      onSelectDoctor(slug);
    }
    navigate(`/doctors/${slug}`);
  };

  const handleQuickBookDoctor = (slug: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (onSelectDoctor) {
      onSelectDoctor(slug);
    }
    navigate(`/doctors/${slug}?book=true`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(heroSearchQuery)}`);
    } else {
      navigate('/doctors');
    }
  };

  // Instant autocomplete matched doctors
  const liveMatchedDoctors = useMemo(() => {
    if (!heroSearchQuery.trim() || heroSearchQuery.length < 2) return [];
    const q = heroSearchQuery.toLowerCase().trim();
    return doctors.filter(doc => 
      doc.name.toLowerCase().includes(q) ||
      doc.specialtyName.toLowerCase().includes(q) ||
      (doc.title && doc.title.toLowerCase().includes(q)) ||
      (doc.services && doc.services.some(s => s.toLowerCase().includes(q)))
    ).slice(0, 4);
  }, [doctors, heroSearchQuery]);

  // Filtered doctors list in showcase with specialty & feature filters
  const totalMatchingDoctors = useMemo(() => {
    let list = [...doctors];
    if (doctorFilter === 'today') {
      list = list.filter(d => d.nextAvailableSlot && (d.nextAvailableSlot.includes('امروز') || d.nextAvailableSlot.includes('فردا')));
    } else if (doctorFilter === 'telehealth') {
      list = list.filter(d => d.hasOnlineConsultation);
    } else if (doctorFilter === 'top-rated') {
      list = list.filter(d => d.rating >= 4.8);
    } else if (doctorFilter === 'insurance') {
      list = list.filter(d => d.supportedInsurances && d.supportedInsurances.length > 2);
    }

    if (selectedSpecialtyChip !== 'all') {
      list = list.filter(d => d.specialtyId === selectedSpecialtyChip || d.specialtyName.includes(selectedSpecialtyChip));
    }

    return list;
  }, [doctors, doctorFilter, selectedSpecialtyChip]);

  const displayedDoctors = useMemo(() => {
    return totalMatchingDoctors.slice(0, visibleDoctorsCount);
  }, [totalMatchingDoctors, visibleDoctorsCount]);

  const quickChips = [
    { label: 'متخصص قلب و عروق', query: 'قلب' },
    { label: 'پوست، مو و زیبایی', query: 'پوست' },
    { label: 'زنان و زایمان', query: 'زنان' },
    { label: 'کودکان و اطفال', query: 'اطفال' },
    { label: 'روانپزشکی و اعصاب', query: 'روان' },
    { label: 'ارتوپدی و مفاصل', query: 'ارتوپدی' },
    { label: 'چکاپ کامل سلامت', query: 'چکاپ' }
  ];

  const popularInsurances = [
    { id: 'tamin', name: 'تأمین اجتماعی', discount: 'پوشش تا ۹۰٪', type: 'پایه' },
    { id: 'salamat', name: 'بیمه سلامت / خدمات درمانی', discount: 'پوشش تا ۸۵٪', type: 'پایه' },
    { id: 'iran', name: 'بیمه ایران (تکمیلی)', discount: 'فرانشیز ۱۰٪', type: 'تکمیلی' },
    { id: 'dana', name: 'بیمه دانا (تکمیلی)', discount: 'آنلاین و بدون معرفی‌نامه', type: 'تکمیلی' },
    { id: 'alborz', name: 'بیمه البرز (تکمیلی)', discount: 'پوشش کامل خدمات', type: 'تکمیلی' },
    { id: 'asia', name: 'بیمه آسیا (تکمیلی)', discount: 'پوشش دارو و ویزیت', type: 'تکمیلی' },
    { id: 'atiyeh', name: 'آتیه‌سازان حافظ', discount: 'طرف قرارداد بازنشستگان', type: 'تکمیلی' },
    { id: 'pasargad', name: 'بیمه پاسارگاد', discount: 'صدور الکترونیک خسارت', type: 'تکمیلی' },
  ];

  const patientReviews: PatientReview[] = [
    {
      id: 'r1',
      name: 'مریم صالحی',
      doctor: 'دکتر مریم سعادت',
      specialty: 'فوق تخصص قلب و عروق',
      visitType: 'ویزیت حضوری • شعبه سعادت‌آباد',
      service: 'اکوکاردیوگرافی و نوار قلب',
      comment: 'دقت و آرامش دکتر فوق‌العاده بود. نوبت آنلاین بدون معطلی و در زمان مشخص انجام شد. سیستم پرونده سلامت هم خیلی کار را راحت کرده.',
      rating: 5,
      date: '۲ روز پیش',
      helpfulCount: 24,
      recommended: true,
      initial: 'م'
    },
    {
      id: 'r2',
      name: 'علیرضا رضایی',
      doctor: 'دکتر سهراب مرادی',
      specialty: 'متخصص جراحی ارتوپدی',
      visitType: 'ویزیت تصویری آنلاین',
      service: 'مشاوره مفاصل و زانو',
      comment: 'امکان ویزیت تصویری آنلاین برای من که در شهرستان بودم نجات‌بخش بود. نسخه الکترونیک بلافاصله در سامانه ثبت شد و پیامک تایید دریافت کردم.',
      rating: 5,
      date: '۴ روز پیش',
      helpfulCount: 19,
      recommended: true,
      initial: 'ع'
    },
    {
      id: 'r3',
      name: 'فاطمه ناصری',
      doctor: 'دکتر نسترن کمالی',
      specialty: 'متخصص پوست، مو و زیبایی',
      visitType: 'ویزیت حضوری • شعبه ونک',
      service: 'لیزر و پاکسازی تخصصی',
      comment: 'کلینیک شعبه ونک بسیار مجهز، تمیز و با پرسنل پاسخگو بود. با بیمه تکمیلی دانا پذیرش شدم و بدون معطلی ویزیت شدم.',
      rating: 5,
      date: 'هفته گذشته',
      helpfulCount: 31,
      recommended: true,
      initial: 'ف'
    },
    {
      id: 'r4',
      name: 'حسین محمدپور',
      doctor: 'دکتر بهاره رادمنش',
      specialty: 'فوق تخصص گوارش و کبد',
      visitType: 'ویزیت حضوری • شعبه تجریش',
      service: 'آندوسکوپی و چکاپ گوارشی',
      comment: 'دکتر بسیار باحوصله شرح حال گرفتن و هیچ استرسی به بیمار وارد نمیکنن. فضای درمانگاه بسیار تمیز و منظم و نوبت‌دهی سر ساعت بود.',
      rating: 5,
      date: '۵ روز پیش',
      helpfulCount: 17,
      recommended: true,
      initial: 'ح'
    },
    {
      id: 'r5',
      name: 'زهرا مرادیان',
      doctor: 'دکتر کامران احمدی',
      specialty: 'متخصص مغز و اعصاب',
      visitType: 'ویزیت تصویری آنلاین',
      service: 'نوار مغز و کنترل میگرن',
      comment: 'مشاوره آنلاین با دکتر احمدی عالی بود. تمام سوالاتم رو با دقت جواب دادن و داروها رو در سامانه بیمه ثبت کردن. کاملاً راضی هستم.',
      rating: 5,
      date: '۱ هفته پیش',
      helpfulCount: 28,
      recommended: true,
      initial: 'ز'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 font-sans text-slate-800" dir="rtl">
      
      {/* ======================================================== */}
      {/* 1. HERO SECTION & SMART INTERACTIVE SEARCH HUB */}
      {/* ======================================================== */}
      <section className="relative pt-6 sm:pt-10 pb-10 sm:pb-14 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-4 sm:p-10 overflow-hidden shadow-2xl border border-slate-800">
        {/* Glow and Mesh Backdrop */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Abstract Medical DNA Helix Watermarks */}
        <DnaHelixWatermark className="w-48 sm:w-64 h-[420px] -left-10 -top-8 rotate-12" opacity="opacity-[0.14]" />
        <DnaHelixWatermark className="hidden md:block w-48 sm:w-64 h-[420px] -right-12 -bottom-16 -rotate-12" opacity="opacity-[0.09]" />

        {/* Matte Medical Vectors Pattern (Stethoscope, Cross, Syringe, Heartbeat) */}
        <MedicalVectorPattern opacity={0.065} variant="light" patternId="hero-med-pattern" />

        {/* Swiss Clinical Cross Markers in Hero Corners */}
        <div className="absolute top-4 left-4 text-xs font-mono text-sky-400/30 select-none pointer-events-none">+ +</div>
        <div className="absolute bottom-4 right-4 text-xs font-mono text-sky-400/30 select-none pointer-events-none">+ +</div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Header Badges & Ticker */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-blue-300 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>سامانه سلامت هوشمند و نوبت‌دهی متمرکز کلینیک</span>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>نوبت‌دهی آنلاین فعال • پاسخگویی ۲۴ ساعته</span>
            </div>
          </div>

          {/* Hero Headlines */}
          <div className="text-center space-y-3">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight sm:leading-snug">
              دریافت فوری نوبت و مشاوره تخصصی پزشکی
            </h1>
            <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              <span className="sm:hidden font-medium text-blue-200">
                زیر ۲۰ ثانیه درمان شو
              </span>
              <span className="hidden sm:inline">
                مسیر درمان را هوشمندانه و بدون معطلی آغاز کنید؛ با ارزیابی هوشمند علائم، نوبت‌دهی آنی و ارتباط مستقیم با برترین متخصصان، در سریع‌ترین زمان به بهبودی برسید.
              </span>
            </p>
          </div>

          {/* Hero Interactive Tabs (Hidden on mobile for clean focused search, visible on sm and larger) */}
          <div className="hidden sm:flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 backdrop-blur-md max-w-3xl mx-auto items-center justify-between gap-1 shadow-lg">
            <button
              onClick={() => setActiveHeroTab('doctor')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeHeroTab === 'doctor'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 shrink-0" />
              <span>جستجوی سریع</span>
            </button>

            <button
              onClick={() => setActiveHeroTab('advanced')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeHeroTab === 'advanced'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span>جستجوی پیشرفته</span>
              <span className="hidden lg:inline text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded-md font-extrabold">همه فیلترها</span>
            </button>

            <button
              onClick={() => setActiveHeroTab('branch')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeHeroTab === 'branch'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>شعب و نوبت حضوری</span>
            </button>

            <button
              onClick={() => setActiveHeroTab('insurance')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeHeroTab === 'insurance'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>بیمه‌ها</span>
            </button>

            <button
              onClick={() => setActiveHeroTab('symptom')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeHeroTab === 'symptom'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>دستیار علائم</span>
            </button>
          </div>

          {/* TAB 1: Doctor Search & Live Autocomplete */}
          {activeHeroTab === 'doctor' && (
            <div className="space-y-4" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
                <div className="flex items-center gap-1 sm:gap-1.5 bg-white rounded-2xl p-1.5 sm:p-2 shadow-2xl border border-slate-200 text-slate-800 focus-within:ring-4 focus-within:ring-blue-500/30 transition-all">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 sm:mr-3 shrink-0" />
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={e => setHeroSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="جستجوی پزشک، تخصص یا بیماری..."
                    className="flex-1 min-w-0 text-xs sm:text-sm bg-transparent outline-hidden font-medium text-slate-900 placeholder-slate-400 py-1"
                  />
                  {heroSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setHeroSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span>جستجو</span>
                    <ArrowLeft className="w-3.5 h-3.5 hidden sm:inline" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('advanced')}
                    className="shrink-0 flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-xs"
                    title="فیلترهای پیشرفته (بیمه، شعبه، آنلاین، زمان و...)"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline">فیلترها</span>
                  </button>
                </div>

                {/* Instant Autocomplete Suggestions Dropdown */}
                {isSearchFocused && liveMatchedDoctors.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in-50 text-slate-900 text-right">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 flex items-center justify-between">
                      <span>پزشکان یافت شده ({liveMatchedDoctors.length})</span>
                      <span className="text-[10px] text-blue-600">انتخاب جهت نوبت‌دهی فوری</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                      {liveMatchedDoctors.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => handleSelectDoctor(doc.slug)}
                          className="p-3 hover:bg-blue-50/70 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={doc.avatar}
                              alt={doc.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{doc.name}</h4>
                              <p className="text-[11px] text-slate-500 truncate">{doc.specialtyName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {doc.nextAvailableSlot && (
                              <span className="hidden sm:inline-block text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                                نوبت خالی: {doc.nextAvailableSlot}
                              </span>
                            )}
                            <button
                              type="button"
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                            >
                              رزرو نوبت
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>

              {/* Quick Search Chips - Mobile Horizontal Swipe */}
              <div className="flex items-center gap-1.5 sm:gap-2 pt-1 text-xs overflow-x-auto no-scrollbar justify-start sm:justify-center py-1 -mx-2 px-2 sm:mx-0 sm:px-0">
                <span className="text-slate-400 font-medium hidden sm:inline shrink-0">جستجوی پرتکرار:</span>
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`/doctors?search=${encodeURIComponent(chip.query)}`)}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl border border-white/10 transition-colors cursor-pointer text-xs shrink-0 whitespace-nowrap active:scale-95"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Dedicated Advanced Search Console */}
          {activeHeroTab === 'advanced' && (
            <div className="max-w-4xl mx-auto animate-in fade-in">
              <AdvancedSearchConsole
                specialties={specialties}
                branches={branches}
                doctors={doctors}
                initialFilters={{ searchQuery: heroSearchQuery }}
                onClose={() => setActiveHeroTab('doctor')}
              />
            </div>
          )}

          {/* TAB 2: Branch & GPS Quick Finder */}
          {activeHeroTab === 'branch' && (
            <div className="bg-slate-800/90 p-4 sm:p-6 rounded-2xl border border-slate-700 text-right space-y-4 max-w-2xl mx-auto backdrop-blur-md animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>شعب فعال همرا کلینیک در تهران</span>
                </div>
                <span className="text-xs text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/30">
                  ۴ شعبه مجهز و شبانه‌روزی
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {branches.slice(0, 4).map(b => (
                  <div 
                    key={b.id} 
                    onClick={() => navigate(`/branches`)}
                    className="bg-slate-900/90 hover:bg-slate-900 p-3 rounded-xl border border-slate-700/80 hover:border-blue-500/50 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{b.name}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">
                        {b.isOpenNow ? 'هم‌اکنون باز است' : 'شبانه‌روزی'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{b.address}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                <span className="text-xs text-slate-300">مسیریابی هوشمند با نشان، بلد و Google Maps</span>
                <Button variant="primary" size="sm" onClick={() => navigate('/branches')}>
                  مشاهده نقشه و رزرو نوبت حضوری
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: Insurance Finder */}
          {activeHeroTab === 'insurance' && (
            <div className="bg-slate-800/90 p-4 sm:p-6 rounded-2xl border border-slate-700 text-right space-y-4 max-w-2xl mx-auto backdrop-blur-md animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  طرف قرارداد با کلیه بیمه‌های پایه و تکمیلی
                </span>
                <span className="text-[11px] text-slate-300">پذیرش آنلاین بدون کاغذ</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {popularInsurances.slice(0, 8).map(ins => (
                  <button
                    key={ins.id}
                    onClick={() => navigate('/insurance')}
                    className="p-2.5 bg-slate-900/80 hover:bg-slate-900 rounded-xl border border-slate-700 hover:border-emerald-500/40 text-center transition-all cursor-pointer space-y-1"
                  >
                    <div className="font-bold text-xs text-white">{ins.name}</div>
                    <div className="text-[10px] text-emerald-300">{ins.discount}</div>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                <span className="text-xs text-slate-300">استعلام مدارک و تعرفه نهایی پیش از مراجعه</span>
                <button
                  type="button"
                  onClick={() => navigate('/insurance')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-700/80 hover:bg-slate-700 border border-slate-600 shadow-sm transition-all cursor-pointer select-none active:scale-[0.98]"
                >
                  راهنمای جامع بیمه‌ها
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Symptom Guide */}
          {activeHeroTab === 'symptom' && (
            <div className="bg-slate-800/90 p-4 sm:p-6 rounded-2xl border border-slate-700 text-right space-y-4 max-w-2xl mx-auto backdrop-blur-md animate-in fade-in">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-white">نمی‌دانید به چه پزشکی مراجعه کنید؟</h3>
                <p className="text-xs text-slate-300">
                  علائم خود (مانند سردرد، تپش قلب، درد مفاصل یا تب) را انتخاب کنید تا هوش مصنوعی کلینیک شما را به دپارتمان تخصصی مرتبط راهنمایی کند.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['تپش قلب و درد قفسه سینه', 'میگرن و سردردهای مزمن', 'درد زانو و کمر', 'جوش و حساسیت پوستی', 'سرفه‌های مکرر و تنگی نفس', 'اضطراب و بی‌خوابی'].map((sym, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const el = document.getElementById('symptom-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-200 text-xs rounded-xl transition-all cursor-pointer"
                  >
                    {sym}
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById('symptom-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  ورود به دستیار هوشمند علائم
                </Button>
              </div>
            </div>
          )}

          {/* Key Metrics Counters */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-white/10 text-xs">
            <div className="space-y-0.5 bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
              <div className="text-xl sm:text-2xl font-black text-blue-400">+۵۰</div>
              <div className="text-slate-300 font-medium">پزشک متخصص و فوق‌تخصص</div>
            </div>
            <div className="space-y-0.5 bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
              <div className="text-xl sm:text-2xl font-black text-sky-400">۴ شعبه</div>
              <div className="text-slate-300 font-medium">مراکز فعال در تهران</div>
            </div>
            <div className="space-y-0.5 bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-400">۹۸.۶٪</div>
              <div className="text-slate-300 font-medium">رضایت‌مندی بیماران</div>
            </div>
            <div className="space-y-0.5 bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">۲۴/۷</div>
              <div className="text-slate-300 font-medium">پشتیبانی و نوبت‌دهی زنده</div>
            </div>
          </div>

          {/* Mobile Metrics Strip - Compact & Clean */}
          <div className="sm:hidden grid grid-cols-4 gap-1.5 pt-4 border-t border-white/10 text-center text-slate-200">
            <div className="bg-white/5 py-1.5 px-1 rounded-xl border border-white/5">
              <div className="text-xs font-black text-blue-400">+۵۰</div>
              <div className="text-[10px] text-slate-300">پزشک</div>
            </div>
            <div className="bg-white/5 py-1.5 px-1 rounded-xl border border-white/5">
              <div className="text-xs font-black text-sky-400">۴ شعبه</div>
              <div className="text-[10px] text-slate-300">تهران</div>
            </div>
            <div className="bg-white/5 py-1.5 px-1 rounded-xl border border-white/5">
              <div className="text-xs font-black text-amber-400">۹۸.۶٪</div>
              <div className="text-[10px] text-slate-300">رضایت</div>
            </div>
            <div className="bg-white/5 py-1.5 px-1 rounded-xl border border-white/5">
              <div className="text-xs font-black text-emerald-400">۲۴/۷</div>
              <div className="text-[10px] text-slate-300">پشتیبانی</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. FOUR INTERACTIVE QUICK-ACTION CARDS (میزکار خدمات کلینیک) */}
      {/* ======================================================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Fast Booking */}
        <div 
          onClick={() => navigate('/doctors')}
          className="relative overflow-hidden bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-2 sm:gap-4"
        >
          <ClinicalCornerAccents variant="cross" className="opacity-30 group-hover:opacity-75 group-hover:text-blue-500 transition-all" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="space-y-1 min-w-0 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">نوبت‌دهی آنلاین</h3>
              <span className="text-[9px] sm:text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-md shrink-0">فوری</span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 leading-relaxed">
              رزرو نوبت نزدیک‌ترین پزشکان در کمتر از ۲ دقیقه با تایید آنی پیامکی
            </p>
            <p className="sm:hidden text-[10px] text-slate-400 truncate">رزرو در ۲ دقیقه</p>
          </div>
        </div>

        {/* Card 2: Telehealth Consultation */}
        <div 
          onClick={() => navigate('/doctors?consultation=telehealth')}
          className="relative overflow-hidden bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-indigo-400 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-2 sm:gap-4"
        >
          <ClinicalCornerAccents variant="cross" className="opacity-30 group-hover:opacity-75 group-hover:text-indigo-500 transition-all" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
            <Video className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="space-y-1 min-w-0 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">ویزیت تصویری</h3>
              <span className="text-[9px] sm:text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-md shrink-0">آنلاین</span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 leading-relaxed">
              مشاوره پزشکی تصویری و صوتی مستقیم از منزل با پزشکان آنکال
            </p>
            <p className="sm:hidden text-[10px] text-slate-400 truncate">مشاوره مستقیم از منزل</p>
          </div>
        </div>

        {/* Card 3: Laboratory & Records */}
        <div 
          onClick={() => navigate('/services')}
          className="relative overflow-hidden bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-400 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-2 sm:gap-4"
        >
          <ClinicalCornerAccents variant="cross" className="opacity-30 group-hover:opacity-75 group-hover:text-emerald-500 transition-all" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="space-y-1 min-w-0 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">جواب‌دهی آزمایش</h3>
              <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md shrink-0">الکترونیک</span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 leading-relaxed">
              مشاهده آنلاین آزمایش‌ها، پرونده سلامت و نسخه‌های الکترونیک
            </p>
            <p className="sm:hidden text-[10px] text-slate-400 truncate">مشاهده آنلاین پرونده</p>
          </div>
        </div>

        {/* Card 4: Branches & GPS */}
        <div 
          onClick={() => navigate('/branches')}
          className="relative overflow-hidden bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-sky-400 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-2 sm:gap-4"
        >
          <ClinicalCornerAccents variant="cross" className="opacity-30 group-hover:opacity-75 group-hover:text-sky-500 transition-all" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 group-hover:bg-sky-600 text-sky-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
            <Navigation className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="space-y-1 min-w-0 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">نزدیک‌ترین شعب</h3>
              <span className="text-[9px] sm:text-[10px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded-md shrink-0">GPS</span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 leading-relaxed">
              یافتن نزدیک‌ترین شعبه بر اساس موقعیت مکانی و پایش زنده صف
            </p>
            <p className="sm:hidden text-[10px] text-slate-400 truncate">مسیریابی شعب تهران</p>
          </div>
        </div>
      </section>

      {/* Medical ECG Rhythm Pulse Divider */}
      <MedicalPulseDivider label="پایش و غربالگری هوشمند علائم" />

      {/* ======================================================== */}
      {/* 3. SYMPTOM DISCOVERY SECTION */}
      {/* ======================================================== */}
      <div id="symptom-section">
        <SymptomDiscovery onSelectDoctor={handleSelectDoctor} />
      </div>

      {/* Medical ECG Rhythm Pulse Divider */}
      <MedicalPulseDivider label="دپارتمان‌ها و تخصص‌های درمانی" />

      {/* ======================================================== */}
      {/* 6. SPECIALTIES DIRECTORY GRID & MOBILE DRAWER */}
      {/* ======================================================== */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div>
            <Badge variant="blue">دپارتمان‌های درمانی</Badge>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">تخصص‌های درمانی همرا کلینیک</h2>
            <p className="text-xs text-slate-500 mt-0.5">پوشش جامع کلیه رشته‌های تخصصی و فوق‌تخصصی</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSpecialtiesModalOpen(true)}
            icon={<ChevronLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            مشاهده و جستجوی همه ({specialties.length})
          </Button>
        </div>

        {/* Mobile Quick Search & Explore Bar */}
        <div 
          onClick={() => setIsSpecialtiesModalOpen(true)}
          className="sm:hidden bg-gradient-to-l from-blue-50/90 to-indigo-50/70 border border-blue-200/80 rounded-2xl p-3 flex items-center justify-between gap-2 cursor-pointer shadow-2xs active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 min-w-0">
            <Search className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">جستجو در {specialties.length} تخصص کلینیک (قلب، پوست، زانو...)</span>
          </div>
          <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-lg shrink-0">
            فهرست کامل
          </span>
        </div>

        {/* Mobile-Optimized Grid (Top 7 + 1 More Button) */}
        <div className="grid grid-cols-4 gap-2 sm:hidden">
          {specialties.slice(0, 7).map(spec => (
            <div
              key={spec.id}
              onClick={() => {
                setSelectedSpecialtyChip(spec.id);
                setVisibleDoctorsCount(4);
                // Smooth scroll to doctors section
                const el = document.getElementById('doctors-showcase');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`bg-white rounded-2xl border p-2.5 flex flex-col items-center justify-center text-center space-y-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer ${
                selectedSpecialtyChip === spec.id ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200/80'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                selectedSpecialtyChip === spec.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <Stethoscope className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[11px] text-slate-800 leading-tight line-clamp-1">
                {spec.name.replace('متخصص ', '').replace('فوق تخصص ', '')}
              </h3>
              <span className="text-[9px] text-slate-400 font-medium">
                {spec.doctorCount} پزشک
              </span>
            </div>
          ))}

          {/* 8th Mobile Action Tile: View All Specialties */}
          <div
            onClick={() => setIsSpecialtiesModalOpen(true)}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-2.5 flex flex-col items-center justify-center text-center space-y-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[11px] leading-tight text-white line-clamp-1">
              + سایر تخصص‌ها
            </h3>
            <span className="text-[9px] text-blue-100 font-medium">
              +{specialties.length - 7} مورد
            </span>
          </div>
        </div>

        {/* Desktop / Tablet Grid */}
        <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {specialties.slice(0, 10).map(spec => (
            <div
              key={spec.id}
              onClick={() => navigate(`/specialties/${spec.slug}`)}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-2 sm:space-y-3 shadow-2xs hover:shadow-md hover:border-blue-400 hover:-translate-y-1 active:scale-95 transition-all cursor-pointer group text-center"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center mx-auto transition-colors shadow-2xs">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {spec.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                  {spec.doctorCount} پزشک فعال
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Medical ECG Rhythm Pulse Divider */}
      <MedicalPulseDivider label="پزشکان متخصص و نوبت‌های آزاد" />

      {/* ======================================================== */}
      {/* 7. RECOMMENDED DOCTORS SECTION WITH SMART MOBILE CONTROLS */}
      {/* ======================================================== */}
      <section id="doctors-showcase" className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div>
            <Badge variant="blue">پزشکان همرا کلینیک</Badge>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
              پزشکان پیشنهادی با نزدیک‌ترین زمان نوبت
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">امکان ویزیت حضوری و مشاوره آنلاین تصویری</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/doctors')}
            icon={<ChevronLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            جستجوی پیشرفته ({doctors.length})
          </Button>
        </div>

        {/* Live Feature Filter Bar */}
        <div className="flex items-center gap-2 pb-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => {
              setDoctorFilter('all');
              setVisibleDoctorsCount(4);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              doctorFilter === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            همه نوبت‌ها
          </button>
          <button
            onClick={() => {
              setDoctorFilter('today');
              setVisibleDoctorsCount(4);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
              doctorFilter === 'today'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>نوبت امروز/فردا</span>
          </button>
          <button
            onClick={() => {
              setDoctorFilter('telehealth');
              setVisibleDoctorsCount(4);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
              doctorFilter === 'telehealth'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>ویزیت آنلاین تصویری</span>
          </button>
          <button
            onClick={() => {
              setDoctorFilter('top-rated');
              setVisibleDoctorsCount(4);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
              doctorFilter === 'top-rated'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current text-amber-200" />
            <span>بالاترین امتیاز (۴.۸+)</span>
          </button>
          <button
            onClick={() => {
              setDoctorFilter('insurance');
              setVisibleDoctorsCount(4);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
              doctorFilter === 'insurance'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>پوشش بیمه تکمیلی</span>
          </button>
        </div>

        {/* Swipeable Specialty Chips Filter Bar */}
        <div className="flex items-center gap-1.5 pb-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => {
              setSelectedSpecialtyChip('all');
              setVisibleDoctorsCount(4);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedSpecialtyChip === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200'
            }`}
          >
            همه تخصص‌ها
          </button>
          {specialties.slice(0, 8).map(spec => (
            <button
              key={spec.id}
              onClick={() => {
                setSelectedSpecialtyChip(spec.id);
                setVisibleDoctorsCount(4);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                selectedSpecialtyChip === spec.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{spec.name.replace('متخصص ', '').replace('فوق تخصص ', '')}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded-md ${
                selectedSpecialtyChip === spec.id ? 'bg-blue-700 text-white' : 'bg-slate-200/80 text-slate-500'
              }`}>
                {spec.doctorCount}
              </span>
            </button>
          ))}
          <button
            onClick={() => setIsSpecialtiesModalOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>سایر تخصص‌ها...</span>
          </button>
        </div>

        {/* Mobile View Controls & Doctor Count Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span>
              نمایش <strong className="text-slate-900 font-extrabold">{displayedDoctors.length}</strong> از <strong className="text-slate-900 font-extrabold">{totalMatchingDoctors.length}</strong> پزشک
            </span>
            {selectedSpecialtyChip !== 'all' && (
              <button
                onClick={() => setSelectedSpecialtyChip('all')}
                className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
              >
                <span>(حذف فیلتر تخصص)</span>
              </button>
            )}
          </div>

          {/* View Mode Switcher: Card vs Compact List */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
            <button
              onClick={() => setDoctorViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                doctorViewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="نمای کارتی"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDoctorViewMode('compact')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                doctorViewMode === 'compact'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="نمای فشرده (مخصوص موبایل)"
            >
              <List className="w-4 h-4" />
              <span className="text-[10px] hidden xs:inline">فشرده</span>
            </button>
          </div>
        </div>

        {/* Doctor List (Card or Compact) */}
        {displayedDoctors.length > 0 ? (
          doctorViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedDoctors.map(doc => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onSelect={handleSelectDoctor}
                  onQuickBook={() => handleQuickBookDoctor(doc.slug)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {displayedDoctors.map(doc => (
                <DoctorCompactCard
                  key={doc.id}
                  doctor={doc}
                  onSelect={handleSelectDoctor}
                  onQuickBook={() => handleQuickBookDoctor(doc.slug)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">پزشکی با این مشخصات یافت نشد</h3>
            <p className="text-xs text-slate-500">فیلترهای انتخابی را تغییر دهید تا پزشکان سایر بخش‌ها نمایش داده شوند.</p>
            <button
              onClick={() => {
                setDoctorFilter('all');
                setSelectedSpecialtyChip('all');
              }}
              className="mt-1 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              نمایش همه پزشکان کلینیک
            </button>
          </div>
        )}

        {/* Smart Progressive Batch Loader ("نمایش پزشکان بیشتر") */}
        {totalMatchingDoctors.length > 0 && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 rounded-2xl p-3 sm:p-4 border border-slate-200/80">
            {/* Progress indicator */}
            <div className="w-full sm:w-1/2 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>پیشرفت نمایش پزشکان</span>
                <span>{displayedDoctors.length} از {totalMatchingDoctors.length}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((displayedDoctors.length / Math.max(totalMatchingDoctors.length, 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {displayedDoctors.length < totalMatchingDoctors.length ? (
                <button
                  onClick={() => setVisibleDoctorsCount(prev => prev + 4)}
                  className="w-full sm:w-auto bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>نمایش ۴ پزشک دیگر (+۴)</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>همه {totalMatchingDoctors.length} پزشک نمایش داده شدند</span>
                </span>
              )}

              <button
                onClick={() => navigate('/doctors')}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>جستجوی پیشرفته</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Specialty Bottom Sheet Drawer */}
      <MobileSpecialtiesModal
        isOpen={isSpecialtiesModalOpen}
        onClose={() => setIsSpecialtiesModalOpen(false)}
        specialties={specialties}
        selectedSpecialtyId={selectedSpecialtyChip !== 'all' ? selectedSpecialtyChip : undefined}
        onSelectSpecialty={(spec) => {
          setSelectedSpecialtyChip(spec.id);
          setVisibleDoctorsCount(4);
          const el = document.getElementById('doctors-showcase');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Medical ECG Rhythm Pulse Divider */}
      <MedicalPulseDivider label="خدمات تشخیصی و پاراکلینیک" />

      {/* ======================================================== */}
      {/* 8. CLINIC PARACLINICAL & SPECIALIZED SERVICES */}
      {/* ======================================================== */}
      <section className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-10 border border-slate-800 space-y-3 sm:space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Abstract DNA Watermark in Paraclinical Panel */}
        <DnaHelixWatermark className="w-56 h-[400px] -right-10 -bottom-10 rotate-45" opacity="opacity-[0.08]" />
        
        {/* Matte Medical Vectors Pattern */}
        <MedicalVectorPattern opacity={0.045} variant="light" patternId="paraclinic-med-pattern" />
        
        {/* Section Header: Compact & Fast on Mobile */}
        <div className="relative z-10 flex items-center justify-between gap-2.5">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-indigo-400 bg-indigo-500/10 border border-indigo-400/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold mb-1 sm:mb-2">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>دپارتمان پاراکلینیک و تشخیصی</span>
            </div>
            <h2 className="text-base sm:text-2xl font-black text-white truncate">
              خدمات درمانی و چکاپ جامع
            </h2>
            <p className="hidden sm:block text-xs text-slate-300 mt-1">
              امکان رزرو آنلاین خدمات با تعرفه مصوب و بیمه تکمیلی
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 shadow-sm transition-all cursor-pointer select-none active:scale-[0.98] shrink-0"
          >
            <span>همه ({services.length})</span>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          </button>
        </div>

        {/* Mobile Navigation Toolbar: Categories + View Switcher (Zero Unnecessary Scrolling) */}
        <div className="relative z-10 sm:hidden flex items-center justify-between gap-2 pt-0.5">
          {/* Scrollable Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px] flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setSelectedServiceCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedServiceCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              همه ({services.length})
            </button>
            {availableServiceCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedServiceCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedServiceCategory === cat
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Slider vs Compact List */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileServiceView('carousel')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                mobileServiceView === 'carousel' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="مشاهده اسلایدری افقی"
              aria-label="مشاهده اسلایدری افقی"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileServiceView('list')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                mobileServiceView === 'list' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="مشاهده فهرست فشرده"
              aria-label="مشاهده فهرست فشرده"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1. MOBILE ONLY PRESENTATION (Takes ~170px instead of ~800px vertical space) */}
        <div className="relative z-10 sm:hidden">
          {mobileServiceView === 'carousel' ? (
            /* Mode A: Horizontal Snap Carousel (No vertical scrolling!) */
            <div className="space-y-1.5">
              <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-2.5 pb-1 -mx-3.5 px-3.5">
                {(filteredServices.length > 0 ? filteredServices : services).slice(0, 6).map(srv => (
                  <div
                    key={srv.id}
                    className="w-[78vw] max-w-[270px] shrink-0 snap-start bg-slate-800/95 border border-slate-700/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-md active:border-indigo-500/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        {srv.category && (
                          <span className="text-[10px] bg-slate-700/80 text-indigo-200 px-2 py-0.5 rounded-md truncate max-w-[130px] font-medium">
                            {srv.category}
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-sm text-white truncate">{srv.title}</h3>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mt-1">
                        {srv.description}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-slate-700/80 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 block leading-none">تعرفه مصوب:</span>
                        <span className="font-black text-xs text-indigo-300 mt-0.5 block truncate">
                          {srv.price.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/services/${srv.slug}`)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <span>رزرو</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel Navigation Hint */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5">
                <span>← برای مشاهده سایر خدمات به چپ بکشید</span>
                <span className="text-indigo-300 font-bold">
                  {Math.min(6, (filteredServices.length > 0 ? filteredServices : services).length)} خدمت فعال
                </span>
              </div>
            </div>
          ) : (
            /* Mode B: Ultra-Compact 1-Tap List (Takes only ~150px total!) */
            <div className="space-y-1.5">
              {(filteredServices.length > 0 ? filteredServices : services).slice(0, 4).map(srv => (
                <div
                  key={srv.id}
                  onClick={() => navigate(`/services/${srv.slug}`)}
                  className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between gap-2 cursor-pointer active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-white truncate">{srv.title}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {srv.category && (
                          <span className="text-[9px] text-indigo-300 font-medium truncate">
                            {srv.category}
                          </span>
                        )}
                        <span className="text-slate-600 text-[8px]">•</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {srv.price.toLocaleString('fa-IR')} ت
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-0.5">
                    <span>رزرو</span>
                    <ChevronLeft className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. DESKTOP ONLY PRESENTATION (Keeps the original full 3-column desktop layout) */}
        <div className="relative z-10 hidden sm:grid sm:grid-cols-3 gap-5">
          {(filteredServices.length > 0 ? filteredServices : services).slice(0, 3).map(srv => (
            <div key={srv.id} className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 space-y-4 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-white">{srv.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{srv.description}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                <span className="font-extrabold text-sm text-indigo-300">
                  {srv.price.toLocaleString('fa-IR')} تومان
                </span>
                <Button variant="primary" size="sm" onClick={() => navigate(`/services/${srv.slug}`)}>
                  جزئیات و رزرو
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Medical ECG Rhythm Pulse Divider */}
      <MedicalPulseDivider label="تجربه مراجعین و رضایت درمان" />

      {/* ======================================================== */}
      {/* 9. PATIENT REVIEWS & TRUST TESTIMONIALS */}
      {/* ======================================================== */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="emerald">نظرات و تجربیات مراجعین</Badge>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">دیدگاه مراجعین همرا کلینیک</h2>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>بیش از ۱۲,۰۰۰ نوبت موفق ثبت شده</span>
          </div>
        </div>

        {/* 1. MOBILE ONLY: Animated Doctoreto-style Review Experience */}
        <MobileDoctoretoReviews 
          reviews={patientReviews} 
          onNavigateDoctors={() => navigate('/doctors')} 
        />

        {/* 2. DESKTOP ONLY: Clean 3-Column Testimonial Grid */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-5">
          {patientReviews.slice(0, 3).map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{r.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  «{r.comment}»
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{r.name}</h4>
                  <p className="text-[10px] text-blue-600 font-medium">
                    {r.doctor} {r.specialty ? `(${r.specialty})` : ''}
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                  بیمار تایید شده
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. HEALTH LIBRARY ARTICLES */}
      {/* ======================================================== */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Badge variant="slate">مجله سلامت همرا کلینیک</Badge>
            <h2 className="text-base sm:text-2xl font-black text-slate-900 mt-1">
              آخرین مقالات علمی و راهنماهای پزشکی
            </h2>
            <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
              محتوای تخصصی به قلم پزشکان متخصص همراه با تاییدیه مراجع علمی
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/health')}
            icon={<ChevronLeft className="w-3.5 h-3.5" />}
            iconPosition="left"
            className="text-xs shrink-0"
          >
            <span>آرشیو مجله ({articles.length})</span>
          </Button>
        </div>

        {/* Multi-Topic Horizontal Sliding Articles Showcase (Doctoreto Style for all device sizes) */}
        <MobileDoctoretoArticles
          articles={articles}
          onSelectArticle={(art) => navigate(`/health/article/${art.slug}`)}
          onViewAll={() => navigate('/health')}
        />
      </section>

      {/* ======================================================== */}
      {/* 11. CLINIC BRANDING & DEVELOPMENT SERVICES HIGHLIGHT */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>دپارتمان راهبردی همرا کلینیک</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              خدمات برندینگ و توسعه کلینیک‌های درمانی
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              توسعه هویت بصری، ساب‌دامنه‌های اختصاصی هر پزشک در همرا (<span className="text-purple-300 font-mono" dir="ltr">subdomain.hamrah.ir</span>)، سئو تخصصی، تولید ویدیو و اتوماسیون وفاداری بیمار
            </p>
          </div>

          <button
            onClick={() => navigate('/clinic-branding')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <span>مشاهده خدمات برندینگ و محاسبه ROI</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => navigate('/clinic-branding')}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors">
              هویت بصری و طراحی ۳۶۰ درجه
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              طراحی لوگو، تابلوی استاندارد نظام پزشکی، ست اداری و راهنمای بصری مراجعین کلینیک
            </p>
          </div>

          <div 
            onClick={() => navigate('/clinic-branding')}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition-colors">
              وبسایت و ساب‌دامنه‌های رسمی
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              راه‌اندازی فوری پرتال پزشکان بر روی ساب‌دامنه‌های همرا، نوبت‌دهی آنلاین ۲۴ ساعته و سئو
            </p>
          </div>

          <div 
            onClick={() => navigate('/clinic-branding')}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-300 transition-colors">
              سیستم وفاداری و CRM بیمار
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              پیامک نظرسنجی بعد از ویزیت، پیگیری خودکار سلامت، یادآوری چکاپ و افزایش مراجعین
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 12. EMERGENCY HOTLINE & 24/7 SUPPORT BANNER */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-2xl p-5 sm:p-7 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-right">
          <h3 className="text-base sm:text-lg font-black flex items-center justify-center sm:justify-start gap-2">
            <PhoneCall className="w-5 h-5 text-blue-200 animate-bounce" />
            <span>نیاز به راهنمایی فوری یا نوبت‌دهی تلفنی دارید؟</span>
          </h3>
          <p className="text-xs text-blue-100">
            کارشناسان پذیرش و پشتیبانی پزشکی همرا کلینیک در تمامی ساعات شبانه‌روز آماده پاسخگویی هستند.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:02188889999"
            className="inline-flex items-center gap-2 bg-white text-blue-900 hover:bg-blue-50 font-black text-sm px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-blue-600" />
            <span>۰۲۱-۸۸۸۸۹۹۹۹</span>
          </a>
        </div>
      </section>

    </div>
  );
};
