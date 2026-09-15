import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
   Palette, 
   Globe, 
   Video, 
   HeartHandshake, 
   TrendingUp, 
   Sparkles, 
   ShieldCheck, 
   CheckCircle2, 
   ArrowLeft, 
   PhoneCall, 
   FileText, 
   Building2, 
   Users, 
   Award, 
   Star, 
   ChevronDown, 
   ChevronUp, 
   Zap, 
   BarChart3, 
   Target, 
   Lock, 
   Layers,
   ArrowRight,
   Send,
   Check,
   AlertCircle,
   ExternalLink,
   Clock
} from 'lucide-react';
import { setSeoMetaData } from '../utils/seoUtils';
import { apiService } from '../services/apiService';
import { 
  CLINIC_BRANDING_PILLARS, 
  CLINIC_GROWTH_PACKAGES, 
  CLINIC_CASE_STUDIES, 
  CLINIC_BRANDING_FAQS,
  ClinicGrowthPackage
} from '../data/clinicBrandingData';
import { ClinicRoiCalculator } from '../components/clinicBranding/ClinicRoiCalculator';
import { ClinicBrandingRequest } from '../types';

export const ClinicBrandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Active service pillar tab
  const [activePillarId, setActivePillarId] = useState<string>('visual-identity');
  
  // Selected package for inquiry
  const [selectedPackage, setSelectedPackage] = useState<ClinicGrowthPackage | null>(null);

  // FAQ accordion state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Consultation Form state
  const [clinicName, setClinicName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [specialtyType, setSpecialtyType] = useState('پلی‌کلینیک چندتخصصی');
  const [city, setCity] = useState('تهران');
  const [doctorCount, setDoctorCount] = useState<number>(5);
  const [currentChallenges, setCurrentChallenges] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'هویت بصری و تابلوی کلینیک',
    'وبسایت و ساب‌دامنه همرا'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<ClinicBrandingRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formSectionRef = useRef<HTMLDivElement>(null);
  const calculatorSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSeoMetaData(
      'خدمات برندینگ و توسعه کلینیک و مراکز درمانی | شبکه هوشمند همرا',
      'طراحی ۳۶۰ درجه هویت بصری، ساب‌دامنه‌های اختصاصی پزشکان در همرا (subdomain.hamrah.ir)، تولید محتوای ویدیویی سلامت، سیستم وفاداری بیمار و استراتژی رشد درآمد مراکز درمانی.'
    );
  }, []);

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCalculator = () => {
    calculatorSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleServiceSelection = (serviceTitle: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceTitle) 
        ? prev.filter(t => t !== serviceTitle) 
        : [...prev, serviceTitle]
    );
  };

  const handleApplyRoiScenario = (scenario: {
    doctorCount: number;
    monthlyPatients: number;
    selectedServices: string[];
    estimatedGrowthRevenue: number;
  }) => {
    setDoctorCount(scenario.doctorCount);
    setSelectedServices(scenario.selectedServices);
    setCurrentChallenges(`هدف: جذب مراجعین بیشتر برای ${scenario.doctorCount} پزشک با پتانسیل رشد تخمینی درآمد.`);
    scrollToForm();
  };

  const handleSelectPackage = (pkg: ClinicGrowthPackage) => {
    setSelectedPackage(pkg);
    setSelectedServices(prev => {
      const merged = Array.from(new Set([...prev, `پکیج: ${pkg.name}`]));
      return merged;
    });
    scrollToForm();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clinicName.trim()) {
      setErrorMessage('لطفاً نام کلینیک یا مرکز درمانی را وارد کنید.');
      return;
    }
    if (!contactPerson.trim()) {
      setErrorMessage('لطفاً نام پزشک یا مدیر رابط را وارد کنید.');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setErrorMessage('لطفاً شماره تماس معتبر (همراه یا ثابت کلینیک) را وارد کنید.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await apiService.submitClinicBrandingRequest({
        clinicName: clinicName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        specialtyType,
        city,
        doctorCount,
        selectedServices,
        currentChallenges: currentChallenges.trim() || undefined,
        budgetRange: selectedPackage ? selectedPackage.name : 'پیشنهاد کارشناسی'
      });

      setSubmittedRequest(result);
      setIsSubmitting(false);
    } catch {
      setErrorMessage('خطایی در ثبت درخواست رخ داد. لطفاً مجدداً تلاش فرمایید.');
      setIsSubmitting(false);
    }
  };

  const activePillar = CLINIC_BRANDING_PILLARS.find(p => p.id === activePillarId) || CLINIC_BRANDING_PILLARS[0];

  const getPillarIcon = (name: string) => {
    switch (name) {
      case 'Palette': return <Palette className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'Video': return <Video className="w-5 h-5" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-16 pb-16 font-sans text-slate-800" dir="rtl">
      {/* ---------------------------------------------------- */}
      {/* 1. HERO SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>راهکار ۳۶۰ درجه همرا کلینیک برای پزشکان، پلی‌کلینیک‌ها و بیمارستان‌ها</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight sm:leading-snug">
            خدمات تخصصی <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-sky-400">برندینگ و توسعه کلینیک‌های</span> درمانی
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            از خلق هویت بصری فاخر و تابلوی تاییدشده نظام پزشکی تا راه‌اندازی وبسایت‌های ساب‌دامنه همرا (<span className="text-purple-300 font-mono" dir="ltr">subdomain.hamrah.ir</span>)، تولید محتوای ویدیویی، سیستم وفاداری بیمار و مهندسی سودآوری مراکز درمانی.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={scrollToForm}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-extrabold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>درخواست ارزیابی رایگان برند کلینیک</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToCalculator}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>محاسبه آنلاین بازدهی و رشد مراجعین</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 border-t border-slate-800/80 text-right">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-purple-400">۳.۲ برابر</div>
              <div className="text-[11px] text-slate-400 mt-0.5">افزایش میانگین مراجعین آنلاین</div>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-indigo-400">۵۰+</div>
              <div className="text-[11px] text-slate-400 mt-0.5">مرکز درمانی و کلینیک همکار</div>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-emerald-400">۹۸٪</div>
              <div className="text-[11px] text-slate-400 mt-0.5">رضایت پزشکان از وبسایت‌ها</div>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl font-black text-sky-400">۱۰۰٪</div>
              <div className="text-[11px] text-slate-400 mt-0.5">مطابق ضوابط نظام پزشکی</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. CORE PILLARS OF CLINIC BRANDING & DEVELOPMENT */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            <Target className="w-3.5 h-3.5 text-purple-600" />
            <span>ارکان تحول مراکز درمانی</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ۵ گام اساسی برای برندسازی و توسعه پایدار کلینیک
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            با یکپارچه‌سازی فرآیندهای بصری، نرم‌افزاری و بازاریابی، کلینیک شما به مرجع اول درمان در منطقه تبدیل می‌شود.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CLINIC_BRANDING_PILLARS.map(pillar => {
            const isActive = pillar.id === activePillarId;
            return (
              <button
                key={pillar.id}
                onClick={() => setActivePillarId(pillar.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-purple-700 text-white border-purple-700 shadow-md shadow-purple-600/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span>{getPillarIcon(pillar.iconName)}</span>
                <span>{pillar.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-lg transition-all animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  {activePillar.tag}
                </span>
                <span className="text-xs text-slate-400 font-medium">سرویس تخصصی همرا کلینیک</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {activePillar.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {activePillar.fullDescription}
              </p>

              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-extrabold text-slate-800">تحویل‌دادنی‌ها و اقدامات اجرایی:</h4>
                <ul className="space-y-2">
                  {activePillar.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/70 text-purple-900 text-xs font-medium flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <span className="font-bold">مزیت رقابتی و نتیجه: </span>
                  <span>{activePillar.kpiBenefit}</span>
                </div>
              </div>
            </div>

            {/* Pillar Visual Showcase Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                    {getPillarIcon(activePillar.iconName)}
                  </div>
                  <span className="text-xs font-bold text-slate-300">شاخص‌های کیفیت همرا</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-md font-mono">
                  SLA 100%
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">سرعت استقرار و اجرا:</span>
                  <span className="font-bold text-white">۲ الی ۳ هفته کاری</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">انطباق با قوانین درمانی:</span>
                  <span className="font-bold text-emerald-400">تاییدیه نظام پزشکی</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">پشتیبانی و بازبینی:</span>
                  <span className="font-bold text-white">۱۲ ماه گارانتی تحول</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">اتصال به ساب‌دامنه همرا:</span>
                  <span className="font-bold text-sky-400 font-mono" dir="ltr">*.hamrah.ir</span>
                </div>
              </div>

              <button
                onClick={scrollToForm}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>درخواست مشاوره برای این بخش</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. INTERACTIVE ROI & GROWTH CALCULATOR */}
      {/* ---------------------------------------------------- */}
      <section ref={calculatorSectionRef} className="space-y-4">
        <ClinicRoiCalculator onApplyScenario={handleApplyRoiScenario} />
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. GROWTH PACKAGES */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>پکیج‌های هدفمند</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            برنامه‌های جامع توسعه و تجهیز دیجیتال کلینیک
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            بسته به مرحله رشد مرکز درمانی، مناسب‌ترین پکیج توسعه را انتخاب فرمایید.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLINIC_GROWTH_PACKAGES.map(pkg => {
            const isSelected = selectedPackage?.id === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                  pkg.isPopular
                    ? 'bg-gradient-to-b from-purple-900 via-indigo-950 to-slate-900 text-white border-2 border-purple-500 shadow-2xl shadow-purple-600/20'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-md hover:shadow-xl'
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md">
                    {pkg.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className={`text-lg font-black ${pkg.isPopular ? 'text-white' : 'text-slate-900'}`}>
                      {pkg.name}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${pkg.isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                      {pkg.subtitle}
                    </p>
                  </div>

                  <div className={`p-3 rounded-2xl text-xs font-semibold ${
                    pkg.isPopular ? 'bg-white/10 text-purple-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <div>مناسب برای: {pkg.recommendedFor}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">زمان تحویل اولیه: {pkg.setupTime}</div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className={`text-xs font-bold ${pkg.isPopular ? 'text-slate-200' : 'text-slate-800'}`}>
                      ویژگی‌ها و خدمات گنجانده شده:
                    </div>
                    <ul className="space-y-2">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className={`flex items-start gap-2 text-xs leading-relaxed ${
                          pkg.isPopular ? 'text-slate-200' : 'text-slate-600'
                        }`}>
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${
                            pkg.isPopular ? 'text-purple-400' : 'text-purple-600'
                          }`} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/20">
                  <button
                    onClick={() => handleSelectPackage(pkg)}
                    className={`w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      pkg.isPopular
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-lg'
                        : isSelected
                        ? 'bg-purple-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{isSelected ? 'پکیج انتخاب شده' : 'انتخاب این پکیج و درخواست مشاوره'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. REAL CASE STUDIES */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>داستان‌های موفقیت کلینیک‌ها</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            نتایج مستند مراکز درمانی همکار با پلتفرم همرا
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            تجربه ملموس مدیران و پزشکان از راه‌اندازی برندینگ و سیستم نوبت‌دهی یکپارچه
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLINIC_CASE_STUDIES.map(study => (
            <div key={study.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{study.clinicName}</h3>
                    <p className="text-xs text-slate-500">{study.specialty}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                  {study.stats.map((s, idx) => (
                    <div key={idx} className="p-1.5 bg-slate-50 rounded-xl">
                      <div className="text-xs font-black text-purple-700">{s.value}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <blockquote className="text-xs text-slate-600 leading-relaxed italic bg-purple-50/40 p-3 rounded-xl border border-purple-100/60">
                  «{study.quote}»
                </blockquote>
              </div>

              <div className="text-[11px] text-slate-400 font-medium border-t border-slate-100 pt-3">
                {study.doctorInCharge}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. CONSULTATION & AUDIT REQUEST FORM */}
      {/* ---------------------------------------------------- */}
      <section ref={formSectionRef} className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-12 border border-slate-800 shadow-2xl space-y-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>مشاوره و ممیزی تخصصی</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            درخواست ارزیابی رایگان هویت و پتانسیل رشد کلینیک
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            مشخصات مرکز درمانی خود را ثبت فرمایید. مشاوران ارشد برندینگ سلامت همرا ظرف حداکثر ۲۴ ساعت کاری جهت هماهنگی جلسه حضوری یا آنلاین با شما تماس خواهند گرفت.
          </p>
        </div>

        {submittedRequest ? (
          <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">درخواست شما با موفقیت ثبت گردید</h3>
              <p className="text-xs text-slate-300">
                مرکز درمانی <strong>{submittedRequest.clinicName}</strong> در اولویت بررسی کارشناسان برندینگ درمانی قرار گرفت.
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>کد پیگیری رسمی:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{submittedRequest.trackingCode}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>مسئول رابط:</span>
                <span className="text-white font-bold">{submittedRequest.contactPerson}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>شماره تماس ثبت‌شده:</span>
                <span className="text-white font-mono" dir="ltr">{submittedRequest.phone}</span>
              </div>
            </div>

            <button
              onClick={() => setSubmittedRequest(null)}
              className="px-6 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              ثبت درخواست دیگر برای مرکز جدید
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitForm} className="max-w-3xl mx-auto space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">نام کلینیک / مرکز درمانی *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: پلی‌کلینیک تخصصی مهرگان"
                  value={clinicName}
                  onChange={e => setClinicName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">نام پزشک یا مدیر رابط *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دکتر علیرضا رستمی"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">شماره تماس (همراه یا ثابت) *</label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="0912..."
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">زمینه فعالیت / تخصص</label>
                <select
                  value={specialtyType}
                  onChange={e => setSpecialtyType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="پلی‌کلینیک چندتخصصی">پلی‌کلینیک چندتخصصی شبانه‌روزی</option>
                  <option value="کلینیک دندانپزشکی و ایمپلنت">کلینیک دندانپزشکی و ایمپلنت</option>
                  <option value="مرکز جراحی محدود و زیبایی">مرکز جراحی محدود و زیبایی</option>
                  <option value="کلینیک قلب و عروق">کلینیک قلب و عروق</option>
                  <option value="مرکز تصویربرداری و پاراکلینیک">مرکز تصویربرداری و آزمایشگاه</option>
                  <option value="کلینیک ارتوپدی و فیزیوتراپی">کلینیک ارتوپدی و فیزیوتراپی</option>
                  <option value="مطب گروهی یا کلینیک سایر تخصص‌ها">مطب گروهی یا کلینیک سایر تخصص‌ها</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">شهر محل استقرار</label>
                <input
                  type="text"
                  placeholder="مثال: تهران، اصفهان، مشهد، شیراز..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">تعداد پزشکان فعال مرکز</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={doctorCount}
                  onChange={e => setDoctorCount(Number(e.target.value))}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Selected Services Multi-Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">خدمات و اولویت‌های توسعه مدنظر کلینیک:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {[
                  'هویت بصری و تابلوی کلینیک',
                  'وبسایت و ساب‌دامنه همرا',
                  'تولید محتوای ویدیویی و سوشال‌مدیا',
                  'سامانه پیامکی و CRM وفاداری',
                  'مشاوره افزایش سودآوری و درآمد',
                  'آموزش پرسنل پذیرش و تریاژ'
                ].map((title, idx) => {
                  const isChecked = selectedServices.includes(title);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleServiceSelection(title)}
                      className={`p-3 rounded-xl text-right text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span>{title}</span>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-purple-500 text-white' : 'border border-slate-600'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">چالش‌های کنونی یا توضیحات تکمیلی (اختیاری)</label>
              <textarea
                rows={3}
                placeholder="توضیح دهید کلینیک با چه چالش‌هایی مواجه است (کنسلی نوبت‌ها، نیاز به طراحی تابلو، سئوی گوگل و...)"
                value={currentChallenges}
                onChange={e => setCurrentChallenges(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>در حال ثبت اطلاعات...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ثبت درخواست ممیزی و دریافت مشاوره رایگان</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>اطلاعات تماس شما نزد دپارتمان توسعه همرا محفوظ است و بدون هماهنگی به اشتراک گذاشته نمی‌شود.</span>
            </div>
          </form>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">
            پرسش‌های متداول توسعه و برندینگ مراکز درمانی
          </h2>
          <p className="text-xs text-slate-500">
            پاسخ به سوالات پرتکرار مدیران مراکز درمانی و پزشکان متخصص
          </p>
        </div>

        <div className="space-y-3">
          {CLINIC_BRANDING_FAQS.map((faq, index) => {
            const isExpanded = expandedFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                  className="w-full p-4 sm:p-5 text-right flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-xl bg-slate-100 text-slate-500 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 bg-purple-50 text-purple-600' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 8. FOOTER BANNER & DIRECT CONTACT */}
      {/* ---------------------------------------------------- */}
      <section className="rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-800 text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold text-purple-200">دپارتمان برندینگ و توسعه شبکه همرا</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            نیاز به مشاوره تلفنی فوری یا جلسه حضوری دارید؟
          </h3>
          <p className="text-xs text-purple-200 max-w-xl leading-relaxed">
            کارشناسان ارشد توسعه کلینیک آماده پاسخگویی به سوالات و ارائه طرح توجیهی اقتصادی متناسب با مرکز شما هستند.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href="tel:02188990000"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-purple-900 hover:bg-purple-50 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-purple-700" />
            <span>تماس مستقیم: ۰۲۱-۸۸۹۹۰۰۰۰</span>
          </a>

          <button
            onClick={scrollToForm}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-purple-900/60 hover:bg-purple-900/80 text-white border border-purple-400/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>درخواست آنلاین جلسه</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
