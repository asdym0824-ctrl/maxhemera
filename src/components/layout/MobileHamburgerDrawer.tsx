import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  X, 
  Search, 
  Home, 
  Stethoscope, 
  Building2, 
  Activity, 
  Video, 
  Newspaper, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  CalendarCheck, 
  FileText, 
  Users, 
  PhoneCall, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Camera, 
  Sparkles, 
  Heart, 
  AlertCircle, 
  Check, 
  ArrowLeft, 
  ZoomIn, 
  ChevronLeft,
  RefreshCw,
  Compass,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Doctor } from '../../types';
import { apiService } from '../../services/apiService';
import { NearestBranchModal } from '../branches/NearestBranchModal';
import { InsuranceFinderModal } from '../insurance/InsuranceFinderModal';
import { MedicalVectorPattern } from '../common/medicalPattern/MedicalVectorPattern';

interface MobileHamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookingModal?: () => void;
  onOpenAvatarModal?: () => void;
}

interface NavSectionItem {
  id: string;
  title: string;
  subtitle: string;
  path?: string;
  action?: () => void;
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
  badgeColor?: string;
  keywords: string[];
}

export const MobileHamburgerDrawer: React.FC<MobileHamburgerDrawerProps> = ({
  isOpen,
  onClose,
  onOpenBookingModal,
  onOpenAvatarModal,
}) => {
  const { currentUser, isLoggedIn, logout, getRoleDefaultPath } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isLargeTextMode, setIsLargeTextMode] = useState<boolean>(() => {
    return localStorage.getItem('hemera_mobile_easy_view') === 'true';
  });
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiService.getDoctors().then(setDoctors);
  }, []);

  // Save easy view mode preference
  const toggleLargeTextMode = () => {
    const next = !isLargeTextMode;
    setIsLargeTextMode(next);
    localStorage.setItem('hemera_mobile_easy_view', String(next));
  };

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // All accessible sections in the clinic
  const allSections: { category: string; categoryTitle: string; items: NavSectionItem[] }[] = useMemo(() => [
    {
      category: 'primary',
      categoryTitle: 'صفحات و خدمات اصلی درمان',
      items: [
        {
          id: 'home',
          title: 'صفحه اصلی کلینیک',
          subtitle: 'معرفی جامع امکانات، خدمات، اخبار و راهنمای بیماران',
          path: '/',
          icon: <Home className="w-5 h-5 text-blue-600" />,
          iconBg: 'bg-blue-100/90 text-blue-700',
          keywords: ['خانه', 'اصلی', 'سایت', 'کلینیک', 'hemera', 'شروع']
        },
        {
          id: 'booking',
          title: 'نوبت‌دهی آنلاین و فوری پزشک',
          subtitle: 'انتخاب سریع پزشک، تاریخ و رزرو آنلاین ویزیت حضوری یا آنلاین',
          action: () => {
            onClose();
            if (onOpenBookingModal) {
              onOpenBookingModal();
            } else {
              navigate('/doctors');
            }
          },
          icon: <CalendarCheck className="w-5 h-5 text-emerald-600" />,
          iconBg: 'bg-emerald-100/90 text-emerald-700',
          badge: 'رزرو سریع',
          badgeColor: 'bg-emerald-600 text-white',
          keywords: ['نوبت', 'رزرو', 'وقت', 'ویزیت', 'گرفتن وقت', 'دکتر', 'پزشک']
        },
        {
          id: 'doctors',
          title: 'فهرست پزشکان و متخصصان',
          subtitle: 'جستجوی پزشکان، مشاهده بیوگرافی، امتیازات و نظرات بیماران',
          path: '/doctors',
          icon: <Stethoscope className="w-5 h-5 text-sky-600" />,
          iconBg: 'bg-sky-100/90 text-sky-700',
          keywords: ['پزشک', 'دکتر', 'متخصص', 'فوق تخصص', 'نوبت دهی', 'رزرو', 'پزشکان']
        },
        {
          id: 'specialties',
          title: 'دپارتمان‌ها و تخصص‌های کلینیک',
          subtitle: 'قلب و عروق، گوارش، مغز و اعصاب، ارتوپدی، زنان، کودکان و چشم‌پزشکی',
          path: '/specialties',
          icon: <Building2 className="w-5 h-5 text-indigo-600" />,
          iconBg: 'bg-indigo-100/90 text-indigo-700',
          keywords: ['تخصص', 'دپارتمان', 'قلب', 'گوارش', 'زنان', 'پوست', 'چشم', 'مغز و اعصاب']
        },
        {
          id: 'services',
          title: 'خدمات پاراکلینیک و تصویربرداری',
          subtitle: 'ام‌آر‌آی (MRI)، آزمایشگاه، سی‌تی‌اسکن، فیزیوتراپی و سونوگرافی',
          path: '/services',
          icon: <Activity className="w-5 h-5 text-violet-600" />,
          iconBg: 'bg-violet-100/90 text-violet-700',
          keywords: ['پاراکلینیک', 'آزمایشگاه', 'ام آر آی', 'MRI', 'سونوگرافی', 'سی تی اسکن', 'رادیولوژی', 'نوار قلب', 'آزمایش', 'تصویربرداری']
        },
        {
          id: 'telemedicine',
          title: 'ویزیت و مشاوره آنلاین تصویری',
          subtitle: 'مشاوره متنی و ویدیویی ۲۴ ساعته بدون نیاز به مراجعه حضوری',
          path: '/telemedicine',
          icon: <Video className="w-5 h-5 text-purple-600" />,
          iconBg: 'bg-purple-100/90 text-purple-700',
          badge: '۲۴ ساعته',
          badgeColor: 'bg-purple-100 text-purple-800 font-bold',
          keywords: ['آنلاین', 'ویزیت آنلاین', 'مشاوره', 'تصویری', 'تلفنی', 'غیرحضوری', 'تله مدیسین']
        },
        {
          id: 'health-mag',
          title: 'مجله سلامت و پیشگیری از بیماری‌ها',
          subtitle: 'مقالات پزشکی علمی، راهنمای داروها و خودمراقبتی سلامت',
          path: '/health',
          icon: <Newspaper className="w-5 h-5 text-teal-600" />,
          iconBg: 'bg-teal-100/90 text-teal-700',
          keywords: ['مجله', 'مقاله', 'سلامت', 'بیماری', 'دارو', 'علائم', 'آموزش', 'پیشگیری']
        }
      ]
    },
    {
      category: 'branches_insurance',
      categoryTitle: 'شعب درمانی، مسیریابی و بیمه‌های طرف قرارداد',
      items: [
        {
          id: 'branches',
          title: 'فهرست کلیه شعب و مراکز درمانی',
          subtitle: 'آدرس شعب، ساعات کاری، شماره تماس و اطلاعات بخش‌های درمانی',
          path: '/branches',
          icon: <Building2 className="w-5 h-5 text-amber-600" />,
          iconBg: 'bg-amber-100/90 text-amber-700',
          keywords: ['شعبه', 'شعب', 'مرکز', 'آدرس', 'لوکیشن', 'حضوری', 'درمانگاه', 'سعادت آباد', 'ونک', 'تجریش']
        },
        {
          id: 'nearest-branch',
          title: 'یافتن نزدیک‌ترین شعبه با GPS',
          subtitle: 'محاسبه فاصله دقیق و مسیریابی هوشمند بر روی نقشه آنلاین',
          action: () => {
            onClose();
            setBranchModalOpen(true);
          },
          icon: <MapPin className="w-5 h-5 text-rose-600" />,
          iconBg: 'bg-rose-100/90 text-rose-700',
          badge: 'مسیریاب GPS',
          badgeColor: 'bg-rose-100 text-rose-800 font-bold',
          keywords: ['نزدیکترین', 'GPS', 'مسیریابی', 'نقشه', 'فاصله', 'لوکیشن من']
        },
        {
          id: 'insurance-guide',
          title: 'راهنمای بیمه‌های طرف قرارداد',
          subtitle: 'استعلام پوشش بیمه‌های تکمیلی (ایران، دانا، البرز، آسیا، نیروهای مسلح و...)',
          action: () => {
            onClose();
            setInsuranceModalOpen(true);
          },
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
          iconBg: 'bg-emerald-100/90 text-emerald-700',
          badge: 'استعلام بیمه',
          badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
          keywords: ['بیمه', 'تکمیلی', 'تامین اجتماعی', 'سلامت', 'ایران', 'دانا', 'البرز', 'آسیا', 'نیروهای مسلح', 'قرارداد']
        }
      ]
    },
    {
      category: 'patient_portal',
      categoryTitle: 'پرتال بیمار و پرونده سلامت',
      items: [
        {
          id: 'patient-dashboard',
          title: 'میز کار و داشبورد سلامت بیمار',
          subtitle: 'مشاهده خلاصه وضعیت نوبت‌ها، اعلان‌های درمانی و پرونده',
          path: isLoggedIn && currentUser?.role === 'patient' ? '/patient' : '/login',
          icon: <UserIcon className="w-5 h-5 text-blue-600" />,
          iconBg: 'bg-blue-100/90 text-blue-700',
          keywords: ['پرتال', 'داشبورد', 'حساب', 'بیمار', 'پروفایل', 'میزکار']
        },
        {
          id: 'patient-appointments',
          title: 'نوبت‌های من و تاریخچه ویزیت‌ها',
          subtitle: 'مشاهده نوبت‌های فعال، تغییر، لغو و دریافت کد پیگیری',
          path: isLoggedIn ? '/patient/appointments' : '/login',
          icon: <Calendar className="w-5 h-5 text-indigo-600" />,
          iconBg: 'bg-indigo-100/90 text-indigo-700',
          keywords: ['نوبت های من', 'تاریخچه', 'رزروهای من', 'کد رهگیری', 'لغو نوبت', 'تغییر نوبت']
        },
        {
          id: 'patient-records',
          title: 'پرونده الکترونیک سلامت و آزمایشات',
          subtitle: 'نتایج آزمایشگاه، تصاویر رادیولوژی و نسخه‌های دارویی الکترونیک',
          path: isLoggedIn ? '/patient/records' : '/login',
          icon: <FileText className="w-5 h-5 text-teal-600" />,
          iconBg: 'bg-teal-100/90 text-teal-700',
          keywords: ['پرونده', 'آزمایش', 'جواب آزمایش', 'نسخه', 'دارو', 'پزشکی', 'سوابق']
        },
        {
          id: 'patient-family',
          title: 'مدیریت پرونده سلامت خانواده',
          subtitle: 'افزودن فرزندان و والدین برای رزرو نوبت و مدیریت درمان اعضای خانواده',
          path: isLoggedIn ? '/patient/family' : '/login',
          icon: <Users className="w-5 h-5 text-purple-600" />,
          iconBg: 'bg-purple-100/90 text-purple-700',
          keywords: ['خانواده', 'فرزند', 'همسر', 'والدین', 'نوبت برای دیگران', 'همراه']
        }
      ]
    },
    {
      category: 'clinic_growth',
      categoryTitle: 'خدمات توسعه و برندینگ مراکز درمانی',
      items: [
        {
          id: 'clinic-branding-services',
          title: 'خدمات برندینگ و توسعه کلینیک',
          subtitle: 'هویت بصری ۳۶۰ درجه، ساب‌دامنه‌های همرا، تولید محتوا و CRM مراجعین',
          path: '/clinic-branding',
          icon: <Sparkles className="w-5 h-5 text-purple-600" />,
          iconBg: 'bg-purple-100/90 text-purple-700',
          badge: 'ویژه پزشکان و کلینیک‌ها',
          badgeColor: 'bg-purple-100 text-purple-800 font-bold',
          keywords: ['برندینگ', 'کلینیک', 'توسعه', 'هویت بصری', 'لوگو', 'تابلو', 'ساب دامنه', 'همرا', 'سئو', 'CRM', 'افزایش بیمار']
        }
      ]
    }
  ], [onClose, onOpenBookingModal, navigate, isLoggedIn, currentUser]);

  // Filtered items by search query and category
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allSections.map(sec => {
      if (activeCategory !== 'all' && sec.category !== activeCategory) {
        return { ...sec, items: [] };
      }

      if (!query) {
        return sec;
      }

      const matchingItems = sec.items.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const subMatch = item.subtitle.toLowerCase().includes(query);
        const keyMatch = item.keywords.some(k => k.toLowerCase().includes(query));
        return titleMatch || subMatch || keyMatch;
      });

      return {
        ...sec,
        items: matchingItems
      };
    }).filter(sec => sec.items.length > 0);
  }, [allSections, searchQuery, activeCategory]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop with Blur */}
      <div 
        className="fixed inset-0 z-[9998] bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Off-Canvas Drawer (Optimized for Mobile & Tablet) */}
      <div
        id="accessible-mobile-hamburger-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="منوی همبرگری و دسترسی سریع به بخش‌های کلینیک"
        className="fixed inset-y-0 right-0 z-[9999] w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-300 font-sans text-slate-800 border-l border-slate-200 h-screen h-[100dvh]"
        dir="rtl"
      >
        {/* Drawer Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-l from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white/20" />
            </div>
            <div>
              <div className="font-black text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                <span>همرا کلینیک</span>
                <span className="text-[9px] sm:text-[10px] bg-blue-500/40 text-blue-200 px-2 py-0.5 rounded-md font-black tracking-wider">
                  HEMERA
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">منوی ناوبری و دسترسی سریع به سامانه</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Easy-View / Large Font Mode Button */}
            <button
              type="button"
              onClick={toggleLargeTextMode}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isLargeTextMode 
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 scale-105' 
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
              }`}
              title={isLargeTextMode ? 'بازگشت به اندازه متن معمولی' : 'فعال‌سازی حالت مشاهده آسان با متن درشت'}
              aria-label="حالت مشاهده آسان با فونت درشت"
            >
              <ZoomIn className="w-4 h-4 text-inherit" />
              <span className="text-[11px] sm:text-xs whitespace-nowrap">
                {isLargeTextMode ? 'متن درشت ✓' : 'متن درشت'}
              </span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="بستن منو"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* User Status Bar if Logged In / Guest Prompt */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200/90 shrink-0">
          {isLoggedIn && currentUser ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                    alt={currentUser.name}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-blue-600 shadow-xs"
                  />
                  {onOpenAvatarModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAvatarModal();
                      }}
                      className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-full border-2 border-white shadow-xs cursor-pointer hover:bg-blue-700 transition-colors"
                      title="تغییر عکس پروفایل"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="min-w-0">
                  <div className={`font-extrabold text-slate-900 truncate ${isLargeTextMode ? 'text-lg' : 'text-sm'}`}>
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                    <span>{currentUser.phone}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-emerald-700 font-semibold">حساب فعال</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={getRoleDefaultPath(currentUser.role)}
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>ورود به پرتال اختصاصی</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                    navigate('/');
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200/80 rounded-xl transition-colors cursor-pointer"
                  title="خروج از حساب کاربری"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">حساب کاربری مراجعین و بیماران</span>
                <span className="text-[11px] sm:text-xs text-slate-500">برای پیگیری نوبت‌ها، سوابق درمان و نتایج آزمایشات</span>
              </div>
              <Link
                to="/login"
                onClick={onClose}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>ورود / عضویت در سامانه سلامت</span>
              </Link>
            </div>
          )}
        </div>

        {/* Search & Category Filter Section */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-100 shrink-0 space-y-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی صفحه، تخصص درمانی، آزمایش، بیمه یا خدمت..."
              className={`w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-2xl pr-10 sm:pr-11 pl-8 transition-all outline-none font-medium placeholder-slate-400 ${
                isLargeTextMode ? 'py-3.5 text-base' : 'py-2.5 sm:py-3 text-xs sm:text-sm'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                aria-label="پاک کردن جستجو"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Category Chips */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl whitespace-nowrap transition-all font-bold cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              همه بخش‌ها
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('primary')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl whitespace-nowrap transition-all font-bold cursor-pointer ${
                activeCategory === 'primary'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              پزشکان و خدمات
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('branches_insurance')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl whitespace-nowrap transition-all font-bold cursor-pointer ${
                activeCategory === 'branches_insurance'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              شعب و بیمه‌ها
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('patient_portal')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl whitespace-nowrap transition-all font-bold cursor-pointer ${
                activeCategory === 'patient_portal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              پرونده و نوبت‌ها
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-5">
          {/* Quick Book Callout Banner (Wide & Responsive) */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className={`font-black tracking-tight flex items-center gap-2 ${isLargeTextMode ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>
                <CalendarCheck className="w-5 h-5 shrink-0" />
                <span>رزرو آنلاین نوبت پزشک متخصص</span>
              </div>
              <p className={`text-blue-100 mt-1 line-clamp-2 ${isLargeTextMode ? 'text-sm' : 'text-xs'}`}>
                سریع‌ترین روش ثبت نوبت حضوری و مشاوره تلفنی/تصویری ۲۴ ساعته
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenBookingModal) {
                  onOpenBookingModal();
                } else {
                  navigate('/doctors');
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-white text-blue-800 hover:bg-blue-50 rounded-xl font-extrabold text-xs sm:text-sm shadow-sm transition-all shrink-0 cursor-pointer text-center active:scale-95"
            >
              شروع نوبت‌دهی
            </button>
          </div>

          {/* Quick Direct Tiles (Tablet / Large Mobile Highlight) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                setBranchModalOpen(true);
              }}
              className="p-3 rounded-2xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/80 text-rose-950 text-right flex flex-col justify-between gap-2 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-200/70 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-rose-900">مسیریاب GPS</div>
                <div className="text-[10px] text-rose-700">یافتن نزدیک‌ترین شعبه</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                setInsuranceModalOpen(true);
              }}
              className="p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-950 text-right flex flex-col justify-between gap-2 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-emerald-900">استعلام بیمه</div>
                <div className="text-[10px] text-emerald-700">پوشش بیمه تکمیلی</div>
              </div>
            </button>

            <Link
              to="/telemedicine"
              onClick={onClose}
              className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 text-purple-950 text-right flex flex-col justify-between gap-2 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-200/70 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Video className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-purple-900">ویزیت آنلاین ۲۴ساعته</div>
                <div className="text-[10px] text-purple-700">مشاوره تصویری و متنی</div>
              </div>
            </Link>
          </div>

          {/* Render Categorized Sections in 2-Column Responsive Grid on Tablet */}
          {filteredSections.length > 0 ? (
            filteredSections.map(sec => (
              <div key={sec.category} className="space-y-2">
                <div className="px-1 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-1">
                  <span>{sec.categoryTitle}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
                    {sec.items.length} مورد
                  </span>
                </div>

                {/* 2 Columns on Tablet / 1 Column on Small Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                  {sec.items.map(item => {
                    const isItemActive = item.path ? (
                      item.path === '/' 
                        ? location.pathname === '/' 
                        : location.pathname.startsWith(item.path)
                    ) : false;

                    const cardInner = (
                      <div className={`h-full text-right p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 min-h-[58px] group ${
                        isItemActive
                          ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-xs font-bold ring-1 ring-blue-300'
                          : 'bg-white hover:bg-slate-50/90 border-slate-200/80 text-slate-800 hover:border-slate-300 hover:shadow-xs'
                      }`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${item.iconBg} group-hover:scale-105 transition-transform`}>
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-slate-900 truncate ${isLargeTextMode ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'}`}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${item.badgeColor || 'bg-blue-100 text-blue-700'}`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className={`text-slate-500 truncate mt-0.5 ${isLargeTextMode ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'}`}>
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <ChevronLeft className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:-translate-x-1 ${
                          isItemActive ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      </div>
                    );

                    if (item.action) {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={item.action}
                          className="w-full block text-right cursor-pointer"
                        >
                          {cardInner}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        to={item.path || '/'}
                        onClick={onClose}
                        className="w-full block text-right"
                      >
                        {cardInner}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <AlertCircle className="w-9 h-9 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">موردی متناسب با جستجوی شما یافت نشد</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                عبارت دیگری مانند «قلب»، «نوبت»، «آزمایشگاه»، «ام‌آر‌آی» یا «بیمه» را جستجو کنید.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-2 text-xs sm:text-sm font-bold text-blue-600 hover:underline cursor-pointer"
              >
                نمایش همه بخش‌ها
              </button>
            </div>
          )}
        </div>

        {/* Drawer Emergency & Hotline Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white border-t border-slate-800 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-300 font-medium">پشتیبانی و راهنمایی تلفنی بیماران:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              پاسخگویی ۲۴ ساعته
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <a
              href="tel:02188990000"
              className="p-2.5 sm:p-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-blue-300 border border-slate-700 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-mono">۰۲۱-۸۸۹۹۰۰۰۰</span>
            </a>

            <a
              href="tel:115"
              className="p-2.5 sm:p-3 bg-rose-950/80 hover:bg-rose-900 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-rose-300 border border-rose-800/80 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>اورژانس (۱۱۵)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sub Modals */}
      <NearestBranchModal
        isOpen={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        doctors={doctors}
      />
      <InsuranceFinderModal
        isOpen={insuranceModalOpen}
        onClose={() => setInsuranceModalOpen(false)}
      />
    </>,
    document.body
  );
};
