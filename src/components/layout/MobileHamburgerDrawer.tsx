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
  ChevronLeft,
  Bot,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Doctor, Appointment } from '../../types';
import { apiService } from '../../services/apiService';
import { NearestBranchModal } from '../branches/NearestBranchModal';
import { InsuranceFinderModal } from '../insurance/InsuranceFinderModal';

interface MobileHamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookingModal?: () => void;
  onOpenAvatarModal?: () => void;
}

interface NavLinkItem {
  id: string;
  title: string;
  subtitle?: string;
  path?: string;
  action?: () => void;
  icon: React.ReactNode;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
  keywords: string[];
}

interface NavCategory {
  id: string;
  title: string;
  items: NavLinkItem[];
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
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Quick Tracking Widget State
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackedAppointment, setTrackedAppointment] = useState<Appointment | null | 'not_found'>(null);
  const [isSearchingTracking, setIsSearchingTracking] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      apiService.getDoctors().then(setDoctors).catch(() => {});
      apiService.getAppointments().then(setAppointments).catch(() => {});
    }
  }, [isOpen]);

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
      setIsTrackingOpen(false);
      setTrackingInput('');
      setTrackedAppointment(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Quick Tracking Lookup
  const handleTrackAppointment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = trackingInput.trim().toLowerCase();
    if (!query) return;

    setIsSearchingTracking(true);
    setTimeout(() => {
      const match = appointments.find(a => 
        a.trackingCode?.toLowerCase() === query ||
        a.patientPhone?.replace(/\s+/g, '') === query.replace(/\s+/g, '') ||
        a.id === query
      );
      setTrackedAppointment(match || 'not_found');
      setIsSearchingTracking(false);
    }, 200);
  };

  // Trigger Care Navigator AI
  const handleOpenAiAssistant = () => {
    onClose();
    window.dispatchEvent(new CustomEvent('open-ai-assistant'));
  };

  // All accessible parts of the entire website
  const navCategories: NavCategory[] = useMemo(() => [
    {
      id: 'main',
      title: 'صفحات اصلی و نوبت‌دهی',
      items: [
        {
          id: 'home',
          title: 'صفحه اصلی کلینیک',
          subtitle: 'معرفی خدمات، امکانات و راهنمای بیماران',
          path: '/',
          icon: <Home className="w-4 h-4" />,
          iconColor: 'bg-blue-50 text-blue-600',
          keywords: ['خانه', 'اصلی', 'سایت', 'کلینیک', 'hemera']
        },
        {
          id: 'book-appointment',
          title: 'دریافت نوبت اینترنتی',
          subtitle: 'رزرو سریع ویزیت حضوری یا آنلاین',
          action: () => {
            onClose();
            if (onOpenBookingModal) {
              onOpenBookingModal();
            } else {
              navigate('/doctors');
            }
          },
          icon: <CalendarCheck className="w-4 h-4" />,
          iconColor: 'bg-emerald-50 text-emerald-600',
          badge: 'رزرو سریع',
          badgeColor: 'bg-emerald-600 text-white',
          keywords: ['نوبت', 'رزرو', 'وقت', 'ویزیت', 'گرفتن وقت', 'دکتر', 'پزشک']
        },
        {
          id: 'doctors-list',
          title: 'پزشکان و متخصصان',
          subtitle: 'مشاهده لیست پزشکان، نظرات و امتیازات',
          path: '/doctors',
          icon: <Stethoscope className="w-4 h-4" />,
          iconColor: 'bg-sky-50 text-sky-600',
          keywords: ['پزشک', 'دکتر', 'متخصص', 'پزشکان', 'فوق تخصص']
        },
        {
          id: 'telemedicine',
          title: 'مشاوره آنلاین و تصویری',
          subtitle: 'ویزیت غیرحضوری ۲۴ ساعته',
          path: '/telemedicine',
          icon: <Video className="w-4 h-4" />,
          iconColor: 'bg-purple-50 text-purple-600',
          badge: '۲۴ ساعته',
          badgeColor: 'bg-purple-100 text-purple-800',
          keywords: ['آنلاین', 'ویزیت آنلاین', 'مشاوره', 'تصویری', 'تله مدیسین']
        },
        {
          id: 'tracking-action',
          title: 'پیگیری وضعیت نوبت',
          subtitle: 'استعلام با کد رهگیری یا موبایل',
          action: () => {
            setIsTrackingOpen(true);
          },
          icon: <Search className="w-4 h-4" />,
          iconColor: 'bg-amber-50 text-amber-600',
          keywords: ['پیگیری', 'کد رهگیری', 'استعلام', 'وضعیت نوبت']
        }
      ]
    },
    {
      id: 'departments',
      title: 'تخصص‌ها و درمانگاه‌ها',
      items: [
        {
          id: 'specialties-all',
          title: 'تمام دپارتمان‌ها و تخصص‌ها',
          subtitle: 'مشاهده کلیه تخصص‌های فعال کلینیک',
          path: '/specialties',
          icon: <Building2 className="w-4 h-4" />,
          iconColor: 'bg-indigo-50 text-indigo-600',
          badge: 'همه تخصص‌ها',
          badgeColor: 'bg-indigo-100 text-indigo-700',
          keywords: ['تخصص', 'دپارتمان', 'بخش']
        },
        {
          id: 'spec-cardiology',
          title: 'قلب و عروق',
          subtitle: 'اکوکاردیوگرافی، نوار قلب و آنژیوگرافی',
          path: '/specialties',
          icon: <Activity className="w-4 h-4" />,
          iconColor: 'bg-rose-50 text-rose-600',
          keywords: ['قلب', 'عروق', 'اکو', 'نوار قلب', 'فشار خون']
        },
        {
          id: 'spec-neurology',
          title: 'مغز و اعصاب (نورولوژی)',
          subtitle: 'نوار مغز، درمان سردرد و ستون فقرات',
          path: '/specialties',
          icon: <Stethoscope className="w-4 h-4" />,
          iconColor: 'bg-violet-50 text-violet-600',
          keywords: ['مغز', 'اعصاب', 'نورولوژی', 'سردرد', 'تشنج']
        },
        {
          id: 'spec-gastro',
          title: 'گوارش و کبد',
          subtitle: 'آندوسکوپی، کولونوسکوپی و کبد چرب',
          path: '/specialties',
          icon: <Stethoscope className="w-4 h-4" />,
          iconColor: 'bg-amber-50 text-amber-600',
          keywords: ['گوارش', 'کبد', 'معده', 'روده', 'آندوسکوپی']
        },
        {
          id: 'spec-ortho',
          title: 'ارتوپدی و مفاصل',
          subtitle: 'درمان دیسک کمر، زانو و آرتروز',
          path: '/specialties',
          icon: <Activity className="w-4 h-4" />,
          iconColor: 'bg-teal-50 text-teal-600',
          keywords: ['ارتوپدی', 'مفاصل', 'زانو', 'کمر', 'شکستگی']
        },
        {
          id: 'spec-women',
          title: 'زنان، زایمان و نازایی',
          subtitle: 'مراقبت‌های بارداری و چکاپ بانوان',
          path: '/specialties',
          icon: <Heart className="w-4 h-4" />,
          iconColor: 'bg-pink-50 text-pink-600',
          keywords: ['زنان', 'زایمان', 'بارداری', 'نازایی']
        }
      ]
    },
    {
      id: 'services',
      title: 'خدمات پاراکلینیک و تصویربرداری',
      items: [
        {
          id: 'services-all',
          title: 'فهرست خدمات پاراکلینیک',
          subtitle: 'آزمایشگاه، MRI، سونوگرافی و فیزیوتراپی',
          path: '/services',
          icon: <Activity className="w-4 h-4" />,
          iconColor: 'bg-violet-50 text-violet-600',
          keywords: ['پاراکلینیک', 'خدمات', 'تصویربرداری', 'آزمایشگاه']
        },
        {
          id: 'services-mri',
          title: 'ام‌آر‌آی (MRI) و تصویربرداری',
          subtitle: 'دستگاه‌های پیشرفته با جوابدهی سریع',
          path: '/services',
          icon: <Activity className="w-4 h-4" />,
          iconColor: 'bg-cyan-50 text-cyan-600',
          keywords: ['MRI', 'ام آر آی', 'سی تی اسکن', 'رادیولوژی']
        },
        {
          id: 'services-lab',
          title: 'آزمایشگاه شبانه‌روزی',
          subtitle: 'خون، هورمونی و پاتوبیولوژی با جواب آنلاین',
          path: '/services',
          icon: <Activity className="w-4 h-4" />,
          iconColor: 'bg-emerald-50 text-emerald-600',
          badge: '۲۴ ساعته',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          keywords: ['آزمایش', 'آزمایشگاه', 'خون', 'پاتوبیولوژی']
        }
      ]
    },
    {
      id: 'branches-insurance',
      title: 'شعب و بیمه‌های طرف قرارداد',
      items: [
        {
          id: 'branches-list',
          title: 'فهرست کلیه شعب درمانگاه',
          subtitle: 'شعب سعادت‌آباد، ونک و تجریش',
          path: '/branches',
          icon: <Building2 className="w-4 h-4" />,
          iconColor: 'bg-amber-50 text-amber-600',
          keywords: ['شعبه', 'شعب', 'آدرس', 'لوکیشن', 'حضوری']
        },
        {
          id: 'nearest-gps',
          title: 'مسیریابی نزدیک‌ترین شعبه (GPS)',
          subtitle: 'یافتن نزدیک‌ترین مرکز روی نقشه',
          action: () => {
            onClose();
            setBranchModalOpen(true);
          },
          icon: <MapPin className="w-4 h-4" />,
          iconColor: 'bg-rose-50 text-rose-600',
          badge: 'GPS',
          badgeColor: 'bg-rose-100 text-rose-800',
          keywords: ['نزدیکترین', 'GPS', 'مسیریابی', 'نقشه', 'فاصله']
        },
        {
          id: 'insurance-guide',
          title: 'استعلام بیمه‌های طرف قرارداد',
          subtitle: 'بیمه‌های پایه و تکمیلی (ایران، دانا و...)',
          action: () => {
            onClose();
            setInsuranceModalOpen(true);
          },
          icon: <ShieldCheck className="w-4 h-4" />,
          iconColor: 'bg-emerald-50 text-emerald-600',
          badge: 'استعلام',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          keywords: ['بیمه', 'تکمیلی', 'تامین اجتماعی', 'ایران', 'دانا', 'البرز']
        }
      ]
    },
    {
      id: 'patient-portal',
      title: 'پرتال بیمار و پرونده سلامت',
      items: [
        {
          id: 'portal-dashboard',
          title: 'میزکار و خلاصه وضعیت سلامت',
          subtitle: 'داشبورد نوبت‌ها و پرونده درمانی',
          path: isLoggedIn && currentUser?.role === 'patient' ? '/patient' : '/login',
          icon: <UserIcon className="w-4 h-4" />,
          iconColor: 'bg-blue-50 text-blue-600',
          keywords: ['پرتال', 'داشبورد', 'حساب', 'بیمار', 'پروفایل']
        },
        {
          id: 'portal-appointments',
          title: 'نوبت‌های من و تاریخچه ویزیت‌ها',
          subtitle: 'مدیریت و پیگیری نوبت‌های فعال',
          path: isLoggedIn ? '/patient/appointments' : '/login',
          icon: <Calendar className="w-4 h-4" />,
          iconColor: 'bg-indigo-50 text-indigo-600',
          keywords: ['نوبت های من', 'تاریخچه', 'رزروهای من', 'کد رهگیری']
        },
        {
          id: 'portal-records',
          title: 'پرونده الکترونیک و جواب آزمایش',
          subtitle: 'مشاهده نسخ، آزمایشات و تصاویر',
          path: isLoggedIn ? '/patient/records' : '/login',
          icon: <FileText className="w-4 h-4" />,
          iconColor: 'bg-teal-50 text-teal-600',
          keywords: ['پرونده', 'آزمایش', 'جواب آزمایش', 'نسخه', 'دارو']
        },
        {
          id: 'portal-family',
          title: 'پرونده سلامت خانواده',
          subtitle: 'ثبت نوبت برای فرزندان و والدین',
          path: isLoggedIn ? '/patient/family' : '/login',
          icon: <Users className="w-4 h-4" />,
          iconColor: 'bg-purple-50 text-purple-600',
          keywords: ['خانواده', 'فرزند', 'همسر', 'والدین']
        }
      ]
    },
    {
      id: 'magazine',
      title: 'آموزش و اخبار سلامت',
      items: [
        {
          id: 'health-mag',
          title: 'مجله سلامت و مقالات پزشکی',
          subtitle: 'راهنمای پیشگیری، درمان و داروها',
          path: '/health',
          icon: <Newspaper className="w-4 h-4" />,
          iconColor: 'bg-teal-50 text-teal-600',
          keywords: ['مجله', 'مقاله', 'سلامت', 'بیماری', 'دارو', 'آموزش']
        }
      ]
    },
    {
      id: 'staff-portals',
      title: 'بخش پزشکان و پرسنل درمانگاه',
      items: [
        {
          id: 'doctor-portal',
          title: 'پرتال اختصاصی پزشکان',
          subtitle: 'مدیریت ویزیت‌ها، نسخه الکترونیک و پرونده',
          path: '/doctor',
          icon: <Stethoscope className="w-4 h-4" />,
          iconColor: 'bg-sky-50 text-sky-600',
          keywords: ['پزشک', 'مطب', 'پنل پزشک', 'نسخه نویسی']
        },
        {
          id: 'secretary-workspace',
          title: 'میزکار منشی و پذیرش',
          subtitle: 'مدیریت صف، پذیرش و تماس‌های بیماران',
          path: '/secretary',
          icon: <FileText className="w-4 h-4" />,
          iconColor: 'bg-blue-50 text-blue-600',
          keywords: ['منشی', 'پذیرش', 'صف انتظار', 'شیفت']
        },
        {
          id: 'admin-panel',
          title: 'پنل مدیریت کلینیک',
          subtitle: 'گزارش‌های مدیریتی، مالی و شعب',
          path: '/admin',
          icon: <Building2 className="w-4 h-4" />,
          iconColor: 'bg-slate-100 text-slate-700',
          keywords: ['مدیریت', 'ادمین', 'گزارش', 'مالی']
        },
        {
          id: 'clinic-branding',
          title: 'خدمات برندینگ و ساب‌دامنه پزشکان',
          subtitle: 'سایت اختصاصی پزشکان و هویت بصری',
          path: '/clinic-branding',
          icon: <Sparkles className="w-4 h-4" />,
          iconColor: 'bg-purple-50 text-purple-600',
          badge: 'ویژه پزشکان',
          badgeColor: 'bg-purple-100 text-purple-800',
          keywords: ['برندینگ', 'سایت پزشک', 'ساب دامنه', 'توسعه']
        }
      ]
    },
    {
      id: 'ai-assistant',
      title: 'راهبر هوشمند سلامت',
      items: [
        {
          id: 'care-ai',
          title: 'دستیار صوتی و متنی سلامت (AI)',
          subtitle: 'راهنمایی انتخاب تخصص بر اساس علائم',
          action: handleOpenAiAssistant,
          icon: <Bot className="w-4 h-4" />,
          iconColor: 'bg-purple-50 text-purple-600',
          badge: 'هوش مصنوعی',
          badgeColor: 'bg-purple-600 text-white',
          keywords: ['هوش مصنوعی', 'دستیار', 'علائم', 'ویس', 'صدا', 'ai']
        }
      ]
    }
  ], [onClose, onOpenBookingModal, navigate, isLoggedIn, currentUser]);

  // Filtered navigation items by search query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return navCategories;

    return navCategories.map(cat => {
      const matchedItems = cat.items.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const subMatch = item.subtitle?.toLowerCase().includes(q);
        const keyMatch = item.keywords.some(k => k.toLowerCase().includes(q));
        return titleMatch || subMatch || keyMatch;
      });

      return {
        ...cat,
        items: matchedItems
      };
    }).filter(cat => cat.items.length > 0);
  }, [navCategories, searchQuery]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop with Blur - Covers the remaining screen */}
      <div 
        className="fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side-Drawer: Covers ~75-80% of mobile screen (leaving the left side visible) */}
      <aside
        id="accessible-mobile-hamburger-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="منوی ناوبری صفحات و اجزای کلینیک"
        className="fixed inset-y-0 right-0 z-[9999] w-[80vw] max-w-[320px] sm:max-w-[350px] bg-white shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-250 ease-out font-sans text-slate-800 border-l border-slate-200/90 h-screen h-[100dvh]"
        dir="rtl"
      >
        {/* Header Bar */}
        <div className="p-3 bg-gradient-to-l from-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-xs shrink-0">
              <Heart className="w-4 h-4 fill-white/20" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-black text-xs sm:text-sm tracking-tight truncate">همرا کلینیک</span>
                <span className="text-[8px] bg-blue-500/30 text-blue-200 border border-blue-400/30 px-1 py-0.2 rounded font-bold">
                  HEMERA
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                پذیرش شبانه‌روزی
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center active:scale-90 shrink-0"
            aria-label="بستن منو"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity or Quick Login Strip (Compact) */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
          {isLoggedIn && currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-blue-500 shadow-2xs"
                  />
                  {onOpenAvatarModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAvatarModal();
                      }}
                      className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-blue-600 text-white rounded-full border border-white shadow-2xs cursor-pointer"
                      title="تغییر عکس"
                    >
                      <Camera className="w-2 h-2" />
                    </button>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {currentUser.role === 'patient' ? 'بیمار محترم' : currentUser.role === 'doctor' ? 'پزشک کلینیک' : 'حساب کاربری'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to={getRoleDefaultPath(currentUser.role)}
                  onClick={onClose}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95"
                >
                  <UserIcon className="w-3 h-3" />
                  <span>میزکار</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                    navigate('/');
                  }}
                  className="p-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  title="خروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="w-full py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-between active:scale-95"
            >
              <div className="flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                <span>ورود / عضویت بیماران</span>
              </div>
              <ArrowLeft className="w-3.5 h-3.5 text-blue-200" />
            </Link>
          )}
        </div>

        {/* Search Input for Instant Site Navigation Filter */}
        <div className="p-2 bg-white border-b border-slate-100 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی بخش یا تخصص..."
              className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pr-8 pl-7 py-1.5 text-xs transition-all outline-none font-medium placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 text-xs"
                aria-label="پاک کردن"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Tracking Collapsible Box (If Toggled) */}
        {isTrackingOpen && (
          <div className="p-2.5 bg-blue-50 border-b border-blue-200 shrink-0 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-950">
              <span>استعلام نوبت با کد رهگیری یا موبایل:</span>
              <button
                type="button"
                onClick={() => setIsTrackingOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleTrackAppointment} className="flex items-center gap-1">
              <input
                type="text"
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                placeholder="مثلاً HC-1001 یا 0912..."
                className="flex-1 min-w-0 px-2 py-1 bg-white border border-blue-200 rounded-lg text-xs text-slate-900 outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={!trackingInput.trim() || isSearchingTracking}
                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSearchingTracking ? '...' : 'جستجو'}
              </button>
            </form>

            {trackedAppointment === 'not_found' && (
              <p className="text-[10px] text-rose-700">نوبتی با این مشخصات یافت نشد.</p>
            )}

            {trackedAppointment && trackedAppointment !== 'not_found' && (
              <div className="p-2 bg-white border border-emerald-300 rounded-lg text-[11px] space-y-1">
                <div className="font-bold text-slate-900">{trackedAppointment.doctorName}</div>
                <div className="text-slate-600 text-[10px]">
                  {trackedAppointment.date} - ساعت {trackedAppointment.timeSlot}
                </div>
                <div className="text-emerald-700 font-bold text-[10px]">
                  وضعیت: {trackedAppointment.status === 'scheduled' ? 'تأیید شده' : 'انجام شده'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scrollable Navigation Body - Complete Site Directory */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-2 px-2.5 space-y-3">
          {filteredCategories.length > 0 ? (
            filteredCategories.map(cat => (
              <div key={cat.id} className="space-y-1">
                {/* Category Header */}
                <div className="px-1 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-0.5">
                  <span>{cat.title}</span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {cat.items.length}
                  </span>
                </div>

                {/* Category Navigation Items */}
                <div className="space-y-0.5">
                  {cat.items.map(item => {
                    const isItemActive = item.path ? (
                      item.path === '/' 
                        ? location.pathname === '/' 
                        : location.pathname.startsWith(item.path)
                    ) : false;

                    const rowContent = (
                      <div className={`w-full text-right px-2.5 py-2 rounded-xl transition-colors flex items-center justify-between gap-2 min-h-[44px] cursor-pointer active:scale-[0.98] ${
                        isItemActive
                          ? 'bg-blue-50 border border-blue-300 text-blue-950 font-bold'
                          : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-transparent'
                      }`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconColor}`}>
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs truncate ${isItemActive ? 'font-black text-blue-900' : 'font-semibold text-slate-800'}`}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className={`text-[8px] px-1 py-0.2 rounded font-bold shrink-0 ${item.badgeColor || 'bg-blue-100 text-blue-700'}`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <ChevronLeft className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isItemActive ? 'text-blue-600' : 'text-slate-300'
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
                          {rowContent}
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
                        {rowContent}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 px-3 text-slate-500 space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-700">موردی یافت نشد</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                نمایش همه صفحات
              </button>
            </div>
          )}
        </div>

        {/* Drawer Sticky Bottom Footer (Emergency & Hotline Call) */}
        <div className="p-2.5 bg-slate-900 text-white border-t border-slate-800 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>تماس ۲۴ ساعته:</span>
            <span className="text-emerald-400 font-bold">پذیرش درمانگاه</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <a
              href="tel:02188990000"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold text-blue-300 border border-slate-700 transition-colors active:scale-95"
            >
              <PhoneCall className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="font-mono">۸۸۹۹۰۰۰۰</span>
            </a>

            <a
              href="tel:115"
              className="p-1.5 bg-rose-950 hover:bg-rose-900 rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold text-rose-300 border border-rose-800 transition-colors active:scale-95"
            >
              <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
              <span>اورژانس ۱۱۵</span>
            </a>
          </div>
        </div>
      </aside>

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
