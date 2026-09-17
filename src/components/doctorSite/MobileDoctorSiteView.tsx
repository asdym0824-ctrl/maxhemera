import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Video, 
  Phone, 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  Globe, 
  Share2, 
  Sparkles, 
  Award, 
  Stethoscope, 
  BookOpen, 
  HelpCircle, 
  Navigation, 
  ArrowLeft,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  HeartPulse,
  Activity,
  MessageSquare,
  Users,
  Play,
  Flame,
  ThumbsUp,
  Info
} from 'lucide-react';
import { Doctor, HealthArticle, DetailedService } from '../../types';
import { ThemeStyles } from './themeConfig';
import { getDoctorOfficialSiteUrl } from '../../utils/doctorWebsiteUtils';
import { MOCK_DISEASES } from '../../data/mockData';

interface MobileDoctorSiteViewProps {
  doctor: Doctor;
  theme: ThemeStyles;
  articles: HealthArticle[];
  availableDoctors: Doctor[];
  onBookInPerson: (note?: string, officeTitle?: string, officeId?: string) => void;
  onBookOnline: (note?: string) => void;
  onNavigateDoctor: (slug: string) => void;
}

export const MobileDoctorSiteView: React.FC<MobileDoctorSiteViewProps> = ({
  doctor,
  theme,
  articles,
  availableDoctors,
  onBookInPerson,
  onBookOnline,
  onNavigateDoctor,
}) => {
  const [activeSection, setActiveSection] = useState<string>('services');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [selectedOfficeForRoute, setSelectedOfficeForRoute] = useState<{ title: string; address: string } | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [conditionSearch, setConditionSearch] = useState('');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('all');
  const [selectedReviewTag, setSelectedReviewTag] = useState<string>('all');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const navContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  const officialDomainInfo = useMemo(() => {
    return getDoctorOfficialSiteUrl(doctor);
  }, [doctor]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(officialDomainInfo.url);
    showToast('لینک وبسایت اختصاصی پزشک کپی شد');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `وبسایت رسمی ${doctor.name}`,
          text: `رزرو نوبت اینترنتی و اطلاعات مطب ${doctor.name} (${doctor.specialtyName})`,
          url: officialDomainInfo.url,
        });
      } catch {
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleCopyCouncilNumber = () => {
    const num = doctor.medicalCouncilNumber || '۱۲۸۴۵۰';
    navigator.clipboard.writeText(num);
    showToast(`شماره نظام پزشکی (${num}) کپی شد`);
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    showToast('نشانی دقیق مطب جهت اسنپ و تپسی کپی شد');
  };

  const handleOpenRouting = (title: string, address: string) => {
    setSelectedOfficeForRoute({ title, address });
    setIsRoutingModalOpen(true);
  };

  const services = useMemo(() => {
    if (doctor.detailedServices && doctor.detailedServices.length > 0) {
      return doctor.detailedServices;
    }
    return (doctor.services || []).map((s, idx) => ({
      id: `srv-${idx}`,
      title: s,
      description: `خدمت تشخیصی و درمانی تخصصی ${s} با تجهیزات مدرن بالینی`,
      durationMinutes: 30,
      price: doctor.consultationFee || 280000,
      category: idx % 2 === 0 ? 'چکاپ و ویزیت' : 'پروسیجر تخصصی'
    } as DetailedService));
  }, [doctor]);

  const serviceCategories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    return ['all', ...Array.from(cats)];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedServiceCategory === 'all') return services;
    return services.filter(s => s.category === selectedServiceCategory);
  }, [services, selectedServiceCategory]);

  const offices = useMemo(() => {
    if (doctor.websiteConfig?.offices && doctor.websiteConfig.offices.length > 0) {
      return doctor.websiteConfig.offices;
    }
    if (doctor.offices && doctor.offices.length > 0) {
      return doctor.offices;
    }
    return [{
      id: 'main-office',
      title: 'مطب اصلی',
      city: 'تهران',
      address: doctor.address || 'تهران، میدان ونک، ابتدای خیابان حقانی، پلاک ۴۰، واحد ۱۰',
      phone: doctor.websiteConfig?.phone || '۰۲۱-۸۸۸۸۴۳۲۱',
      workingHours: 'شنبه تا چهارشنبه ۱۶:۰۰ الی ۲۰:۰۰',
    }];
  }, [doctor]);

  // Related conditions for this doctor
  const relatedDiseases = useMemo(() => {
    const fromMock = MOCK_DISEASES.filter(d => 
      d.relatedSpecialties.includes(doctor.specialtyId) ||
      doctor.services.some(s => d.overview.includes(s.split(' ')[0]) || d.persianTitle.includes(s.split(' ')[0]))
    );
    if (fromMock.length > 0) return fromMock;
    return [
      { id: 'c1', persianTitle: 'تپش قلب و آریتمی', overview: 'احساس ضربان نامنظم یا سریع قلب که نیازمند نوار قلب و هولتر است.', tag: 'قلب و عروق' },
      { id: 'c2', persianTitle: 'فشار خون بالا', overview: 'پایش و تنظیم دارویی پرفشاری خون جهت پیشگیری از آسیب عروقی.', tag: 'پرفشاری خون' },
      { id: 'c3', persianTitle: 'گرفتگی عروق کرونر', overview: 'ارزیابی درد قفسه سینه، تست ورزش و آنژیوگرافی عروق قلب.', tag: 'کرونر' },
      { id: 'c4', persianTitle: 'نارسایی قلبی و تنگی نفس', overview: 'کاهش توان پمپاژ قلب و پایش اکوکاردیوگرافی دوره‌ای.', tag: 'اکوکاردیوگرافی' }
    ];
  }, [doctor]);

  const displayedDiseases = useMemo(() => {
    if (!conditionSearch.trim()) return relatedDiseases;
    return relatedDiseases.filter(d => 
      d.persianTitle.includes(conditionSearch) || 
      d.overview.includes(conditionSearch) ||
      ('symptoms' in d && Array.isArray(d.symptoms) && d.symptoms.some((s: string) => s.includes(conditionSearch)))
    );
  }, [relatedDiseases, conditionSearch]);

  // Smooth scroll to target section
  const scrollToSection = (secId: string) => {
    setActiveSection(secId);
    const element = document.getElementById(`mobile-sec-${secId}`);
    if (element) {
      const yOffset = -96; // accounts for fixed top bar + sticky nav
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Scroll listener to update active section in sticky nav
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['services', 'offices', 'conditions', 'reviews', 'articles', 'about', 'faq'];
      const scrollPosition = window.scrollY + 130;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const sec = document.getElementById(`mobile-sec-${sectionIds[i]}`);
        if (sec && sec.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const patientReviews = [
    {
      id: 'rev-1',
      name: 'مهدی حسینیان',
      date: '۳ روز پیش',
      rating: 5,
      comment: 'بسیار باحوصله و دقیق معاینه کردند. تشخیص عالی و رفتار بسیار محترمانه کادر مطب.',
      treatment: 'آنژیوگرافی و کنترل تپش قلب',
      verified: true,
      tag: 'دقت تشخیص'
    },
    {
      id: 'rev-2',
      name: 'زهرا کاظمی',
      date: 'هفته گذشته',
      rating: 5,
      comment: 'نوبت اینترنتی با سایت شخصی رزرو کردم و سر ساعت ویزیت شدم. بدون معطلی و با آرامش کامل.',
      treatment: 'اکوکاردیوگرافی داپلر رنگی',
      verified: true,
      tag: 'کمترین معطلی'
    },
    {
      id: 'rev-3',
      name: 'کامران یزدانی',
      date: '۲ هفته پیش',
      rating: 5,
      comment: 'پزشک بسیار حاذقی هستند، نسخه و توصیه‌های دقیق ایشان سلامتی من رو برگردوند.',
      treatment: 'چکاپ دوره‌ای قلب و عروق',
      verified: true,
      tag: 'برخورد پرسنل'
    },
    {
      id: 'rev-4',
      name: 'نرگس صالحی',
      date: '۳ هفته پیش',
      rating: 5,
      comment: 'ویزیت آنلاین تصویری داشتم، نسخه الکترونیک در سریع‌ترین زمان در سامانه تامین اجتماعی ثبت شد.',
      treatment: 'مشاوره آنلاین فشار خون',
      verified: true,
      tag: 'ویزیت آنلاین'
    }
  ];

  const filteredReviews = useMemo(() => {
    if (selectedReviewTag === 'all') return patientReviews;
    return patientReviews.filter(r => r.tag === selectedReviewTag);
  }, [selectedReviewTag]);

  const faqItems = [
    {
      q: 'برای نوبت حضوری چه مدارکی باید همراه داشته باشم؟',
      a: 'همراه داشتن آخرین آزمایش‌های خون، نوار قلب (ECG)، گزارش‌های اکوکاردیوگرافی یا تصویربرداری قبلی و لیست کامل داروهای مصرفی فعلی الزامی است.'
    },
    {
      q: 'ویزیت آنلاین تصویری به چه صورت انجام می‌شود؟',
      a: 'پس از رزرو و دریافت پیامک تایید، در ساعت مقرر از طریق همین سایت اتاق امن ویزیت آنلاین باز شده و امکان ارسال آزمایش، گفتگوی تصویری و ثبت نسخه الکترونیک فراهم است.'
    },
    {
      q: 'آیا نسخه الکترونیک بیمه برای داروخانه صادر می‌شود؟',
      a: 'بله، تمامی نسخه‌ها به صورت الکترونیک در سامانه‌های تامین اجتماعی، سلامت و نیروهای مسلح ثبت شده و بلافاصله در تمام داروخانه‌های سراسر کشور قابل تحویل است.'
    },
    {
      q: 'آیا امکان لغو یا جابجایی نوبت وجود دارد؟',
      a: 'بله، تا ۴ ساعت پیش از موعد نوبت می‌توانید از طریق پنل کاربری یا تماس مستقیم با منشی مطب زمان نوبت خود را تغییر دهید.'
    },
    {
      q: 'پوشش بیمه‌های تکمیلی چگونه محاسبه می‌شود؟',
      a: 'برای بیمه‌های طرف قرارداد مستقیم به صورت آنلاین ثبت می‌شود و برای سایر بیمه‌ها، قبض رسمی و گواهی ممهور جهت ارائه به بیمه صادر می‌گردد.'
    }
  ];

  return (
    <div className="block lg:hidden bg-slate-50 text-slate-900 font-sans pb-32 min-h-screen" dir="rtl">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 inset-x-4 z-50 flex items-center justify-center animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-900/95 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. OFFICIAL DOMAIN & SUBDOMAIN VERIFICATION BAR          */}
      {/* ======================================================== */}
      <div className="bg-slate-900 text-white px-3.5 py-2.5 shadow-xs border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center justify-between gap-2">
          {/* Domain Pill & SSL Security */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="truncate text-xs font-mono font-medium text-slate-200">
              {officialDomainInfo.displayUrl}
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
              officialDomainInfo.isPrimary 
                ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30' 
                : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
            }`}>
              {officialDomainInfo.badgeLabel}
            </span>
          </div>

          {/* Quick Actions (Share, Copy & Switcher) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all text-[10px] font-bold cursor-pointer"
              title="اشتراک‌گذاری"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopyUrl}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer"
              title="کپی آدرس سایت"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>کپی</span>
            </button>

            {/* Doctor Switcher Button */}
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white active:scale-95 transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3 h-3" />
              <span>سایر پزشکان</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DOCTOR HERO IDENTITY & CREDENTIALS CARD              */}
      {/* ======================================================== */}
      <div className="px-3.5 pt-3.5">
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-4 relative overflow-hidden">
          {/* Subtle gradient corner accent */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50/60 rounded-full blur-2xl pointer-events-none" />

          {/* Profile Header */}
          <div className="flex items-start gap-3 relative z-10">
            {/* Avatar with Status Ring */}
            <div className="relative shrink-0">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-19 h-19 rounded-2xl object-cover ring-2 ring-blue-100 shadow-md"
              />
              <span 
                className="absolute -bottom-1 -left-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white"
                title="پزشک آنلاین و فعال"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Doctor Title & specialty */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                  {doctor.name}
                </h1>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/70">
                  تایید شده
                </span>
              </div>

              <div className="text-xs font-bold text-blue-600">
                {doctor.title || `متخصص ${doctor.specialtyName}`}
              </div>

              {/* Tap to copy medical council number */}
              <button
                type="button"
                onClick={handleCopyCouncilNumber}
                className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer group"
                title="برای کپی شماره نظام ضربه بزنید"
              >
                <span>نظام پزشکی: {doctor.medicalCouncilNumber || '۱۲۸۴۵۰'}</span>
                <Copy className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>

          {/* High-Contrast Quick Stats */}
          <div className="grid grid-cols-4 gap-1.5 text-center pt-3 border-t border-slate-100 relative z-10">
            <div className="bg-slate-50/90 py-2 px-1 rounded-xl border border-slate-100">
              <div className="text-xs font-black text-amber-500 flex items-center justify-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{doctor.rating}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{doctor.reviewCount} نظر</div>
            </div>

            <div className="bg-slate-50/90 py-2 px-1 rounded-xl border border-slate-100">
              <div className="text-xs font-black text-emerald-600">۹۸.۶٪</div>
              <div className="text-[10px] text-slate-500 mt-0.5">رضایت</div>
            </div>

            <div className="bg-slate-50/90 py-2 px-1 rounded-xl border border-slate-100">
              <div className="text-xs font-black text-blue-600">+{doctor.experienceYears || 15} سال</div>
              <div className="text-[10px] text-slate-500 mt-0.5">تجربه</div>
            </div>

            <div className="bg-slate-50/90 py-2 px-1 rounded-xl border border-slate-100">
              <div className="text-xs font-black text-indigo-600">+۲,۵۰۰</div>
              <div className="text-[10px] text-slate-500 mt-0.5">ویزیت موفق</div>
            </div>
          </div>

          {/* Next Available Slot Prompt */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold text-emerald-900">نزدیک‌ترین نوبت آزاد:</div>
                <div className="text-xs font-black text-emerald-700 truncate">
                  {doctor.nextAvailableSlot || 'امروز ساعت ۱۸:۳۰'}
                </div>
              </div>
            </div>

            <button
              onClick={() => onBookInPerson('نزدیک‌ترین نوبت آزاد پزشک')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>رزرو سریع</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FOUR QUICK-ACTION TILES (میزکار فوری بیمار)            */}
      {/* ======================================================== */}
      <div className="px-3.5 pt-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Tile 1: In-Person Booking */}
          <button
            onClick={() => onBookInPerson('ویزیت حضوری در مطب')}
            className="bg-white rounded-2xl p-3 text-right border border-slate-200/90 shadow-2xs hover:border-blue-300 active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer group min-h-[56px]"
          >
            <span className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Calendar className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1">
                <span>نوبت حضوری</span>
                <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1 py-0.2 rounded-md">مطب</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">رزرو قطعی با پیامک</div>
            </div>
          </button>

          {/* Tile 2: Online Video Consultation */}
          <button
            onClick={() => onBookOnline('مشاوره آنلاین تصویری')}
            className="bg-white rounded-2xl p-3 text-right border border-slate-200/90 shadow-2xs hover:border-indigo-300 active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer group min-h-[56px]"
          >
            <span className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Video className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1">
                <span>مشاوره تصویری</span>
                <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1 py-0.2 rounded-md">آنلاین</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">از منزل بدون معطلی</div>
            </div>
          </button>

          {/* Tile 3: Direct Phone Call */}
          <a
            href={`tel:${doctor.websiteConfig?.phone || offices[0]?.phone || '02188884321'}`}
            className="bg-white rounded-2xl p-3 text-right border border-slate-200/90 shadow-2xs hover:border-emerald-300 active:scale-[0.98] transition-all flex items-center gap-2.5 group min-h-[56px]"
          >
            <span className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Phone className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="font-extrabold text-xs text-slate-900">تماس با مطب</div>
              <div className="text-[10px] text-slate-500 truncate">پاسخگویی مستقیم منشی</div>
            </div>
          </a>

          {/* Tile 4: Direct Office GPS Routing */}
          <button
            onClick={() => handleOpenRouting(offices[0]?.title || 'مطب', offices[0]?.address || '')}
            className="bg-white rounded-2xl p-3 text-right border border-slate-200/90 shadow-2xs hover:border-sky-300 active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer group min-h-[56px]"
          >
            <span className="w-10 h-10 rounded-xl bg-sky-50 group-hover:bg-sky-600 text-sky-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Navigation className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="font-extrabold text-xs text-slate-900">مسیریابی مطب</div>
              <div className="text-[10px] text-slate-500 truncate">نشان، بلد، ویز، گوگل</div>
            </div>
          </button>
        </div>

        {/* Quick Insurance Bar */}
        <div 
          onClick={() => setIsInsuranceModalOpen(true)}
          className="mt-2.5 bg-purple-50/80 border border-purple-200/80 rounded-2xl p-2.5 flex items-center justify-between cursor-pointer hover:bg-purple-100/70 transition-colors"
        >
          <div className="flex items-center gap-2 text-xs text-purple-900">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="font-bold">طرف قرارداد با {doctor.supportedInsurances.length} بیمه پایه و تکمیلی</span>
          </div>
          <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-lg border border-purple-200 shrink-0 flex items-center gap-0.5">
            <span>استعلام</span>
            <ChevronLeft className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. SMART STICKY QUICK-JUMP NAVIGATION BAR (LIKE HOME)    */}
      {/* ======================================================== */}
      <div 
        ref={navContainerRef}
        className="sticky top-11 z-30 bg-white/95 backdrop-blur-md border-y border-slate-200/90 px-3.5 py-2 mt-4 shadow-2xs"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold scroll-smooth">
          <button
            type="button"
            onClick={() => scrollToSection('services')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              activeSection === 'services'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>خدمات</span>
            <span className={`text-[10px] px-1 rounded-full ${
              activeSection === 'services' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {services.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('offices')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              activeSection === 'offices'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>مطب‌ها</span>
            <span className={`text-[10px] px-1 rounded-full ${
              activeSection === 'offices' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {offices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('conditions')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              activeSection === 'conditions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>بیماری‌ها</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('reviews')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              activeSection === 'reviews'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>نظرات</span>
            <span className={`text-[10px] px-1 rounded-full ${
              activeSection === 'reviews' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {doctor.reviewCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('articles')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              activeSection === 'articles'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>آموزش و مقالات</span>
            <span className={`text-[10px] px-1 rounded-full ${
              activeSection === 'articles' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {articles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('about')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              activeSection === 'about'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>بیوگرافی</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('faq')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              activeSection === 'faq'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>سوالات</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. SEAMLESS VERTICAL SECTIONS (ALL VISIBLE TO USER)     */}
      {/* ======================================================== */}
      <div className="px-3.5 pt-4 space-y-7">
        
        {/* SECTION 1: SERVICES & TARIFFS */}
        <section id="mobile-sec-services" className="space-y-3 scroll-mt-28">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">خدمات و پروسیجرهای تخصصی</h2>
                <p className="text-[10px] text-slate-500">تعرفه‌های شفاف و مصوب نوبت‌دهی</p>
              </div>
            </div>

            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg">
              {services.length} خدمت
            </span>
          </div>

          {/* Service Category Filter Chips */}
          {serviceCategories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {serviceCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedServiceCategory(cat)}
                  className={`text-[11px] px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedServiceCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'all' ? 'همه خدمات' : cat}
                </button>
              ))}
            </div>
          )}

          {/* Service Cards */}
          <div className="space-y-2.5">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-xs text-slate-900 leading-snug">
                      {srv.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block">
                      {srv.price ? `${srv.price.toLocaleString('fa-IR')} ت` : 'تعرفه مصوب'}
                    </span>
                  </div>
                </div>

                {/* Service Meta Chips */}
                <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                  {srv.durationMinutes && (
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{srv.durationMinutes} دقیقه</span>
                    </span>
                  )}
                  {doctor.supportedInsurances && doctor.supportedInsurances.length > 0 && (
                    <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>پوشش بیمه‌ای</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium mr-auto">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>تایید آنی</span>
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onBookInPerson(`درخواست خدمت تخصصی: ${srv.title}`)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer shadow-xs min-h-[44px]"
                >
                  <span>رزرو نوبت این خدمت</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: OFFICES & APPOINTMENT CENTERS */}
        <section id="mobile-sec-offices" className="space-y-3 scroll-mt-28">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">مطب‌ها و مراکز ویزیت</h2>
                <p className="text-[10px] text-slate-500">نشانی، ساعات حضور و مسیریابی ماهواره‌ای</p>
              </div>
            </div>

            <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-lg">
              {offices.length} مرکز فعال
            </span>
          </div>

          <div className="space-y-3">
            {offices.map((off) => (
              <div
                key={off.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>{off.title}</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    پذیرش فعال
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2 text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="break-words">{off.address}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(off.address)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0 text-[10px] flex items-center gap-0.5"
                    title="کپی آدرس مطب"
                  >
                    <Copy className="w-3 h-3" />
                    <span>کپی</span>
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] space-y-1.5 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>ساعات حضور:</span>
                    </span>
                    <span className="font-medium text-slate-900">{off.workingHours}</span>
                  </div>
                  {off.note && (
                    <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>هماهنگی:</span>
                      <span>{off.note}</span>
                    </div>
                  )}
                </div>

                {/* 1-Tap Direct Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    onClick={() => handleOpenRouting(off.title, off.address)}
                    className="py-2.5 px-3 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer min-h-[44px]"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>مسیریابی مطب</span>
                  </button>

                  <a
                    href={`tel:${off.phone || doctor.websiteConfig?.phone || '02188884321'}`}
                    className="py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-[44px]"
                  >
                    <Phone className="w-4 h-4" />
                    <span>تماس با منشی</span>
                  </a>
                </div>

                {/* Book this office */}
                <button
                  onClick={() => onBookInPerson(`نوبت حضوری در ${off.title}`, off.title, off.id)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all cursor-pointer min-h-[44px]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>دریافت نوبت در این مطب</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: CONDITIONS & SYMPTOMS TREATED (بیماری‌ها و علائم) */}
        <section id="mobile-sec-conditions" className="space-y-3 scroll-mt-28">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">بیماری‌ها و علائم تحت درمان</h2>
                <p className="text-[10px] text-slate-500">مشاوره و درمان تخصصی بر اساس عارضه شما</p>
              </div>
            </div>
          </div>

          {/* Search Symptom / Disease */}
          <div className="relative">
            <input
              type="text"
              value={conditionSearch}
              onChange={(e) => setConditionSearch(e.target.value)}
              placeholder="جستجوی بیماری یا علامت (مثلاً تپش قلب، فشار خون...)"
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
            {conditionSearch && (
              <button 
                onClick={() => setConditionSearch('')}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Disease Cards */}
          <div className="space-y-2">
            {displayedDiseases.slice(0, 4).map((cond: any) => (
              <div
                key={cond.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 hover:border-rose-300 transition-all"
              >
                <div className="min-w-0 space-y-1">
                  <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{cond.persianTitle}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {cond.overview}
                  </p>
                </div>

                <button
                  onClick={() => onBookInPerson(`ویزیت برای درمان: ${cond.persianTitle}`)}
                  className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold shrink-0 transition-colors cursor-pointer min-h-[40px]"
                >
                  نوبت ویزیت
                </button>
              </div>
            ))}
          </div>

          {/* Emergency Alert Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>توجه بالینی:</strong> در صورت بروز درد حاد قفسه سینه، تنگی نفس ناگهانی یا بیهوشی، نوبت اینترنتی نگیرید و فورا با شماره ۱۱۵ اورژانس تماس حاصل فرمایید.
            </p>
          </div>
        </section>

        {/* SECTION 4: PATIENT REVIEWS & SATISFACTION (نظرات مراجعین) */}
        <section id="mobile-sec-reviews" className="space-y-3 scroll-mt-28">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">نظرات و تجربیات مراجعین</h2>
                <p className="text-[10px] text-slate-500">بازخوردهای ثبت‌شده پس از ویزیت حضوری و آنلاین</p>
              </div>
            </div>

            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg">
              {doctor.reviewCount} دیدگاه
            </span>
          </div>

          {/* Rating Summary Gauge */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-amber-100">میانگین رضایت‌مندی بیماران</div>
              <div className="text-2xl font-black mt-0.5">{doctor.rating} از ۵</div>
              <div className="text-[10px] text-amber-100 mt-0.5">بر اساس {doctor.reviewCount} نظر در همرا کلینیک</div>
            </div>

            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-2.5 border border-white/20">
              <div className="text-lg font-black">۹۸.۶٪</div>
              <div className="text-[9px] text-white/90 font-medium">توصیه به دیگران</div>
            </div>
          </div>

          {/* Review Filter Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {['all', 'دقت تشخیص', 'کمترین معطلی', 'برخورد پرسنل', 'ویزیت آنلاین'].map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedReviewTag(tag)}
                className={`text-[11px] px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedReviewTag === tag
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {tag === 'all' ? 'همه نظرات' : tag}
              </button>
            ))}
          </div>

          {/* Review List */}
          <div className="space-y-2.5">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                      {rev.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{rev.name}</div>
                      <div className="text-[10px] text-slate-400">{rev.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>علت مراجعه: {rev.treatment}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ویزیت تایید شده</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: HEALTH ARTICLES & GUIDES (مقالات و دانستنی‌ها) */}
        <section id="mobile-sec-articles" className="space-y-3 scroll-mt-28">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">آموزش سلامت و مقالات پزشک</h2>
                <p className="text-[10px] text-slate-500">راهنماهای پیشگیری، تغذیه و سلامت قلب</p>
              </div>
            </div>

            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg">
              {articles.length} مقاله
            </span>
          </div>

          {articles.length > 0 ? (
            <div className="space-y-3">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col hover:border-indigo-300 transition-all"
                >
                  <div className="relative aspect-[16/8] w-full bg-slate-100">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 right-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {art.category}
                    </span>
                    <span className="absolute bottom-2 left-2 bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{art.readTimeMinutes} دقیقه مطالعه</span>
                    </span>
                  </div>

                  <div className="p-3 space-y-1.5">
                    <h3 className="font-extrabold text-xs text-slate-900 leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 text-center text-slate-500 border border-slate-200 text-xs">
              به‌زودی مقالات تخصصی جدید توسط پزشک منتشر خواهد شد.
            </div>
          )}
        </section>

        {/* SECTION 6: BIOGRAPHY, ACADEMIC CREDENTIALS & FELLOWSHIPS */}
        <section id="mobile-sec-about" className="space-y-3 scroll-mt-28">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">بیوگرافی و مدارک علمی</h2>
                <p className="text-[10px] text-slate-500">پیشینه آکادمیک و مدارج تخصصی پزشک</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              {doctor.bio || `${doctor.name}، فوق تخصص ${doctor.specialtyName} با سال‌ها سابقه طبابت بالینی و جراحی‌های پیشرفته در معتبرترین مراکز دانشگاهی و درمانی کشور.`}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-900">افتخارات و عضویت‌های علمی:</div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>فوق تخصص بالینی قلب و عروق از دانشگاه علوم پزشکی تهران</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>عضو پیوسته انجمن متخصصین قلب و عروق ایران و اروپا (ESC)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>دارای بورد تخصصی ناسیونال و رتبه ممتاز آزمون جامع کشوری</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>پژوهشگر برتر در زمینه پیشگیری از انسداد عروق کرونر</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: FREQUENTLY ASKED QUESTIONS (سوالات متداول مراجعین) */}
        <section id="mobile-sec-faq" className="space-y-3 scroll-mt-28">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">سوالات متداول مراجعین</h2>
                <p className="text-[10px] text-slate-500">پاسخ به پرتکرارترین ابهامات بیماران</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {faqItems.map((faq, i) => {
              const isOpen = expandedFaq === i;
              return (
                <div 
                  key={i} 
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : i)}
                    className="w-full p-3.5 text-right flex items-center justify-between gap-2 cursor-pointer min-h-[48px]"
                  >
                    <span className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-3.5 pb-3.5 pt-1 text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 8: REASSURANCE & SUPPORT (راهنمایی و تماس) */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-4 shadow-md space-y-3 text-center">
          <div className="w-11 h-11 rounded-2xl bg-white/20 text-white mx-auto flex items-center justify-center backdrop-blur-xs">
            <Phone className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-sm">نیاز به راهنمایی در انتخاب نوبت دارید؟</h3>
            <p className="text-[11px] text-blue-100 max-w-xs mx-auto leading-relaxed">
              منشی مطب همه‌روزه در ساعات کاری پاسخگوی سوالات و هماهنگی‌های لازم است.
            </p>
          </div>

          <div className="pt-1 flex items-center justify-center gap-2">
            <a
              href={`tel:${doctor.websiteConfig?.phone || offices[0]?.phone || '02188884321'}`}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs shadow-xs flex items-center gap-1.5 active:scale-95 transition-all min-h-[44px]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>تماس مستقیم با مطب</span>
            </a>
          </div>
        </section>

      </div>

      {/* ======================================================== */}
      {/* 6. MOBILE STICKY BOTTOM RESERVATION BAR                 */}
      {/* ======================================================== */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3.5 py-2.5 shadow-2xl z-40 pb-safe">
        <div className="flex items-center justify-between gap-2.5">
          {/* Doctor Mini Identity & Slot */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <div className="font-extrabold text-xs text-slate-900 truncate">
                {doctor.name}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>اولین نوبت: {doctor.nextAvailableSlot || 'امروز ۱۸:۳۰'}</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onBookOnline('مشاوره آنلاین تصویری')}
              className="px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 active:scale-95 transition-all flex items-center gap-1 text-xs font-bold min-h-[44px]"
              title="مشاوره تصویری"
            >
              <Video className="w-4 h-4" />
              <span className="hidden xs:inline">آنلاین</span>
            </button>

            <button
              onClick={() => onBookInPerson('ویزیت حضوری مطب')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Calendar className="w-4 h-4" />
              <span>رزرو نوبت</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. DOCTOR SWITCHER DRAWER (SUBDOMAIN VS MAIN DOMAIN TEST)*/}
      {/* ======================================================== */}
      {isSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">سایت شخصی پزشکان همرا</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  سایت اول با لینک همرا و مابقی با ساب‌دامنه همرا
                </p>
              </div>
              <button
                onClick={() => setIsSwitcherOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {availableDoctors.map((doc, idx) => {
                const docDomain = getDoctorOfficialSiteUrl(doc);
                const isCurrent = doc.id === doctor.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onNavigateDoctor(doc.slug);
                      setIsSwitcherOpen(false);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{doc.name}</span>
                          {idx === 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-blue-600 text-white font-bold">
                              سایت اول
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                          {docDomain.displayUrl}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      docDomain.isPrimary
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {docDomain.badgeLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. ROUTING MODAL (WAZE, GOOGLE MAPS, NESHAN, BALAD)      */}
      {/* ======================================================== */}
      {isRoutingModalOpen && selectedOfficeForRoute && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">مسیریابی {selectedOfficeForRoute.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{selectedOfficeForRoute.address}</p>
              </div>
              <button
                onClick={() => setIsRoutingModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`https://neshan.org/maps?q=${encodeURIComponent(selectedOfficeForRoute.address)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-center font-bold text-xs text-slate-800 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>مسیریاب نشان</span>
              </a>

              <a
                href={`https://balad.ir/search?q=${encodeURIComponent(selectedOfficeForRoute.address)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-center font-bold text-xs text-slate-800 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>مسیریاب بلد</span>
              </a>

              <a
                href={`https://www.waze.com/ul?q=${encodeURIComponent(selectedOfficeForRoute.address)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-center font-bold text-xs text-slate-800 hover:text-sky-600 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Navigation className="w-4 h-4 text-sky-600" />
                <span>مسیریاب Waze</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOfficeForRoute.address)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 text-center font-bold text-xs text-slate-800 hover:text-rose-600 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Navigation className="w-4 h-4 text-rose-600" />
                <span>گوگل مپ</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. INSURANCE BOTTOM SHEET                                */}
      {/* ======================================================== */}
      {isInsuranceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">بیمه‌های طرف قرارداد</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  پوشش بیمه پایه و تکمیلی در مطب {doctor.name}
                </p>
              </div>
              <button
                onClick={() => setIsInsuranceModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {doctor.supportedInsurances.map((ins, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between min-h-[48px]"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-800">{ins}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    طرف قرارداد مستقیم
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-2xl p-3 text-[11px] text-blue-900 leading-relaxed border border-blue-200">
              نکته: در صورت داشتن سایر بیمه‌های تکمیلی، پس از اتمام ویزیت گواهی و قبض مهرشده رسمی جهت ارائه به شرکت بیمه صادر خواهد شد.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
