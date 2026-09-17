import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Stethoscope, 
  Calendar, 
  Grid, 
  User as UserIcon, 
  LogIn, 
  Menu, 
  X, 
  Building2, 
  Activity, 
  Video, 
  Newspaper, 
  MapPin, 
  ShieldCheck, 
  Camera, 
  Upload, 
  Check, 
  Sparkles, 
  FileText, 
  Users, 
  LogOut, 
  ChevronLeft,
  CalendarCheck,
  PhoneCall,
  CheckSquare,
  UserCheck,
  Globe,
  LayoutDashboard,
  BarChart3,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Doctor } from '../../types';
import { apiService } from '../../services/apiService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { NearestBranchModal } from '../branches/NearestBranchModal';
import { InsuranceFinderModal } from '../insurance/InsuranceFinderModal';
import { MobileHamburgerDrawer } from './MobileHamburgerDrawer';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
];

interface MobileNavigationProps {
  onOpenBookingModal?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ onOpenBookingModal }) => {
  const { currentUser, isLoggedIn, logout, getRoleDefaultPath, updateCurrentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiService.getDoctors().then(setDoctors);
  }, []);

  // Close sheet on route changes
  useEffect(() => {
    setIsMoreSheetOpen(false);
  }, [location.pathname, location.search]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('لطفاً یک فایل تصویری معتبر (JPG، PNG، WebP) انتخاب فرمایید.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حداکثر حجم تصویر ۵ مگابایت است.');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await updateCurrentUser({ avatar: base64 });
      setIsUploadingPhoto(false);
      setAvatarSuccessMsg(true);
      setTimeout(() => setAvatarSuccessMsg(false), 3000);
      setIsAvatarModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = async (presetUrl: string) => {
    setIsUploadingPhoto(true);
    await updateCurrentUser({ avatar: presetUrl });
    setIsUploadingPhoto(false);
    setAvatarSuccessMsg(true);
    setTimeout(() => setAvatarSuccessMsg(false), 3000);
    setIsAvatarModalOpen(false);
  };

  const isCurrentActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Determine user portal path
  const userPortalPath = isLoggedIn && currentUser ? getRoleDefaultPath(currentUser.role) : '/login';

  // Detect secretary workspace context
  const isSecretaryPanel = location.pathname.startsWith('/secretary') || location.pathname.startsWith('/reception');
  const searchParams = new URLSearchParams(location.search);
  const secretaryTab = searchParams.get('tab') || 'queue';

  // Detect doctor workspace context
  const isDoctorPanel = location.pathname.startsWith('/doctor');
  const doctorTab = searchParams.get('tab') || 'clinical';

  // Detect clinic manager workspace context
  const isClinicPanel = location.pathname.startsWith('/clinic');
  const clinicTab = searchParams.get('tab') || 'overview';

  return (
    <>
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Persistent Bottom Navigation Bar (Mobile & Tablet) */}
      <nav 
        id="mobile-bottom-navigation-bar"
        aria-label={
          isClinicPanel
            ? 'ناوبری مرکز عملیات و مدیریت همرا کلینیک'
            : isDoctorPanel 
              ? 'ناوبری میزکار و پرتال بالینی پزشک' 
              : isSecretaryPanel 
                ? 'ناوبری میزکار منشی و پذیرش' 
                : 'ناوبری صفحات موبایل و تبلت'
        }
        className={`xl:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t pb-[env(safe-area-inset-bottom,0px)] transition-all ${
          isClinicPanel
            ? 'border-purple-200/80 bg-white/98 shadow-[0_-4px_24px_rgba(147,51,234,0.11)]'
            : isDoctorPanel
              ? 'border-slate-800/15 bg-white/98 shadow-[0_-4px_24px_rgba(15,23,42,0.08)]'
              : isSecretaryPanel 
                ? 'border-indigo-100 shadow-[0_-4px_24px_rgba(79,70,229,0.09)]' 
                : 'border-slate-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]'
        }`}
      >
        <div className="grid grid-cols-5 items-center h-16 sm:h-18 max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-6">
          {/* 1. Home or Clinic Operations Overview or Doctor Patients Queue or Secretary Queue */}
          <Link
            id="mobile-nav-home"
            to={
              isClinicPanel 
                ? '/clinic?tab=overview' 
                : isDoctorPanel 
                  ? '/doctor?tab=clinical' 
                  : isSecretaryPanel 
                    ? '/secretary?tab=queue' 
                    : '/'
            }
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-3 rounded-2xl transition-all ${
              isClinicPanel
                ? (clinicTab === 'overview' ? 'text-purple-700 font-bold bg-purple-50/90' : 'text-slate-500 hover:text-purple-900 hover:bg-slate-50')
                : isDoctorPanel
                  ? (doctorTab === 'clinical' ? 'text-blue-600 font-bold bg-blue-50/90' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                  : isSecretaryPanel
                    ? (secretaryTab === 'queue' ? 'text-indigo-600 font-bold bg-indigo-50/90' : 'text-slate-500 hover:text-indigo-900 hover:bg-slate-50')
                    : (isCurrentActive('/') && !location.pathname.startsWith('/doctors') && !location.pathname.startsWith('/specialties') && !location.pathname.startsWith('/services') && !location.pathname.startsWith('/patient') && !location.pathname.startsWith('/doctor') && !location.pathname.startsWith('/secretary') && !location.pathname.startsWith('/clinic') && !location.pathname.startsWith('/admin')
                        ? 'text-blue-600 font-bold bg-blue-50/70'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50')
            }`}
          >
            <div className="relative">
              {isClinicPanel ? (
                <BarChart3 className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isDoctorPanel ? (
                <Users className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isSecretaryPanel ? (
                <Users className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : (
                <Home className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              )}
              {isClinicPanel ? (
                clinicTab === 'overview' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-purple-600 rounded-full" />
                )
              ) : isDoctorPanel ? (
                doctorTab === 'clinical' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )
              ) : isSecretaryPanel ? (
                secretaryTab === 'queue' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                )
              ) : (
                isCurrentActive('/') && location.pathname === '/' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )
              )}
            </div>
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight">
              {isClinicPanel ? 'پایش عملیات' : isDoctorPanel ? 'صف بیماران' : isSecretaryPanel ? 'صف مراجعین' : 'صفحه اصلی'}
            </span>
          </Link>

          {/* 2. Clinic Staff or Doctor Task Center / Orders or Secretary Task Center or Doctors */}
          <Link
            id="mobile-nav-doctors"
            to={
              isClinicPanel 
                ? '/clinic?tab=staff' 
                : isDoctorPanel 
                  ? '/doctor?tab=tasks' 
                  : isSecretaryPanel 
                    ? '/secretary?tab=tasks' 
                    : '/doctors'
            }
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-3 rounded-2xl transition-all ${
              isClinicPanel
                ? (clinicTab === 'staff' ? 'text-purple-700 font-bold bg-purple-50/90' : 'text-slate-500 hover:text-purple-900 hover:bg-slate-50')
                : isDoctorPanel
                  ? (doctorTab === 'tasks' ? 'text-blue-600 font-bold bg-blue-50/90' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                  : isSecretaryPanel
                    ? (secretaryTab === 'tasks' ? 'text-indigo-600 font-bold bg-indigo-50/90' : 'text-slate-500 hover:text-indigo-900 hover:bg-slate-50')
                    : (isCurrentActive('/doctors')
                        ? 'text-blue-600 font-bold bg-blue-50/70'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50')
            }`}
          >
            <div className="relative">
              {isClinicPanel ? (
                <Users className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isDoctorPanel ? (
                <CheckSquare className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isSecretaryPanel ? (
                <CheckSquare className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : (
                <Stethoscope className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              )}
              {isClinicPanel ? (
                clinicTab === 'staff' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-purple-600 rounded-full" />
                )
              ) : isDoctorPanel ? (
                doctorTab === 'tasks' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )
              ) : isSecretaryPanel ? (
                secretaryTab === 'tasks' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                )
              ) : (
                isCurrentActive('/doctors') && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )
              )}
            </div>
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight">
              {isClinicPanel ? 'پرسنل و شیفت' : isDoctorPanel ? 'دستورات مطب' : isSecretaryPanel ? 'کارتابل و تسک' : 'پزشکان'}
            </span>
          </Link>

          {/* 3. Center Elevated Action Button: Clinic AI Advisor / Doctor Clinical Visit / Secretary Check-in / Patient Booking */}
          <div className="flex flex-col items-center justify-center relative -top-3 sm:-top-4">
            <button
              id="mobile-nav-book-btn"
              type="button"
              onClick={() => {
                if (isClinicPanel) {
                  window.dispatchEvent(new CustomEvent('synapse_open_clinic_quick_action'));
                  const el = document.getElementById('clinic-ai-advisor');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                } else if (isDoctorPanel) {
                  window.dispatchEvent(new CustomEvent('synapse_open_doctor_clinical'));
                } else if (isSecretaryPanel) {
                  window.dispatchEvent(new CustomEvent('synapse_open_quick_checkin'));
                } else if (onOpenBookingModal) {
                  onOpenBookingModal();
                } else {
                  navigate('/doctors');
                }
              }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white shadow-lg flex items-center justify-center active:scale-90 hover:scale-105 transition-all border-3 border-white cursor-pointer ${
                isClinicPanel
                  ? 'bg-gradient-to-tr from-purple-800 via-purple-700 to-slate-950 hover:from-purple-900 hover:to-slate-900 shadow-purple-900/40 ring-2 ring-purple-400/50'
                  : isDoctorPanel
                    ? 'bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-700 hover:from-slate-900 hover:to-blue-600 shadow-blue-950/40 ring-2 ring-blue-400/50'
                    : isSecretaryPanel
                      ? 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-700 hover:to-slate-800 shadow-indigo-600/35 ring-2 ring-indigo-300/40'
                      : 'bg-gradient-to-tr from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-blue-600/30'
              }`}
              aria-label={
                isClinicPanel
                  ? 'مشاور هوش مصنوعی و بهینه‌سازی عملیات کلینیک'
                  : isDoctorPanel 
                    ? 'فراخوانی بیمار و باز کردن پرونده بالینی' 
                    : isSecretaryPanel 
                      ? 'ثبت و اعلام حضور فوری مراجعین' 
                      : 'رزرو آنلاین نوبت پزشک'
              }
              title={
                isClinicPanel
                  ? 'مشاور هوش مصنوعی مدیریت کلینیک'
                  : isDoctorPanel 
                    ? 'ویزیت بالینی و پرونده بیمار' 
                    : isSecretaryPanel 
                      ? 'اعلام حضور فوری مراجع' 
                      : 'رزرو آنلاین نوبت پزشک'
              }
            >
              {isClinicPanel ? (
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-pulse" />
              ) : isDoctorPanel ? (
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-pulse" />
              ) : isSecretaryPanel ? (
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
            <span className={`text-[10px] sm:text-xs font-extrabold mt-0.5 sm:mt-1 ${
              isClinicPanel ? 'text-purple-900' : isDoctorPanel ? 'text-slate-900' : isSecretaryPanel ? 'text-indigo-700' : 'text-blue-700'
            }`}>
              {isClinicPanel ? 'مشاور هوشمند' : isDoctorPanel ? 'ویزیت فعال' : isSecretaryPanel ? 'اعلام حضور' : 'نوبت‌دهی'}
            </span>
          </div>

          {/* 4. Clinic Tasks / Doctor Personal Website / Secretary Call List / Specialties */}
          <Link
            id="mobile-nav-specialties"
            to={
              isClinicPanel 
                ? '/clinic?tab=tasks' 
                : isDoctorPanel 
                  ? '/doctor?tab=website' 
                  : isSecretaryPanel 
                    ? '/secretary?tab=calls' 
                    : '/specialties'
            }
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-3 rounded-2xl transition-all ${
              isClinicPanel
                ? (clinicTab === 'tasks' ? 'text-purple-700 font-bold bg-purple-50/90' : 'text-slate-500 hover:text-purple-900 hover:bg-slate-50')
                : isDoctorPanel
                  ? (doctorTab === 'website' ? 'text-blue-600 font-bold bg-blue-50/90' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                  : isSecretaryPanel
                    ? (secretaryTab === 'calls' || secretaryTab === 'sms' ? 'text-indigo-600 font-bold bg-indigo-50/90' : 'text-slate-500 hover:text-indigo-900 hover:bg-slate-50')
                    : (isCurrentActive('/specialties') || isCurrentActive('/services')
                        ? 'text-blue-600 font-bold bg-blue-50/70'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50')
            }`}
          >
            <div className="relative">
              {isClinicPanel ? (
                <CheckSquare className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isDoctorPanel ? (
                <Globe className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isSecretaryPanel ? (
                <PhoneCall className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : (
                <Building2 className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              )}
              {isClinicPanel ? (
                clinicTab === 'tasks' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-purple-600 rounded-full" />
                )
              ) : isDoctorPanel ? (
                doctorTab === 'website' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )
              ) : isSecretaryPanel ? (
                (secretaryTab === 'calls' || secretaryTab === 'sms') && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                )
              ) : (
                (isCurrentActive('/specialties') || isCurrentActive('/services')) && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )
              )}
            </div>
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight">
              {isClinicPanel ? 'وظایف پرسنل' : isDoctorPanel ? 'سایت پزشک' : isSecretaryPanel ? 'تماس و پیامک' : 'تخصص‌ها'}
            </span>
          </Link>

          {/* 5. Clinic Menu / Doctor Menu / Secretary Shift Audit Logs / User Portal */}
          <button
            id="mobile-nav-more-btn"
            type="button"
            onClick={() => {
              if (isClinicPanel) {
                setIsMoreSheetOpen(true);
              } else if (isDoctorPanel) {
                setIsMoreSheetOpen(true);
              } else if (isSecretaryPanel) {
                if (secretaryTab === 'logs') {
                  setIsMoreSheetOpen(true);
                } else {
                  navigate('/secretary?tab=logs');
                }
              } else {
                navigate(userPortalPath);
              }
            }}
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-3 rounded-2xl transition-all cursor-pointer ${
              isClinicPanel
                ? (isMoreSheetOpen || clinicTab === 'automations' || clinicTab === 'branding' || clinicTab === 'audit'
                    ? 'text-purple-700 font-bold bg-purple-50/90'
                    : 'text-slate-500 hover:text-purple-900 hover:bg-slate-50')
                : isDoctorPanel
                  ? (isMoreSheetOpen ? 'text-blue-600 font-bold bg-blue-50/90' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                  : isSecretaryPanel
                    ? (secretaryTab === 'logs' ? 'text-indigo-600 font-bold bg-indigo-50/90' : 'text-slate-500 hover:text-indigo-900 hover:bg-slate-50')
                    : (isCurrentActive(userPortalPath) || (isLoggedIn && (
                        location.pathname.startsWith('/patient') ||
                        location.pathname.startsWith('/doctor') ||
                        location.pathname.startsWith('/secretary') ||
                        location.pathname.startsWith('/clinic') ||
                        location.pathname.startsWith('/admin')
                      ))
                        ? 'text-blue-600 font-bold bg-blue-50/70'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50')
            }`}
            aria-label={
              isClinicPanel 
                ? 'منوی امکانات و مدیریت کلینیک' 
                : isDoctorPanel 
                  ? 'منو و ابزارهای سریع پزشک' 
                  : isSecretaryPanel 
                    ? 'لاگ و فعالیت‌های شیفت منشی' 
                    : (isLoggedIn ? `ورود به پنل کاربری ${currentUser?.name || ''}` : 'ورود به حساب کاربری')
            }
            title={
              isClinicPanel 
                ? 'منوی امکانات و مدیریت کلینیک' 
                : isDoctorPanel 
                  ? 'منوی امکانات و ابزارهای پزشک' 
                  : isSecretaryPanel 
                    ? 'لاگ و گزارش فعالیت‌های شیفت' 
                    : (isLoggedIn ? `ورود به پنل کاربری ${currentUser?.name || ''}` : 'ورود به حساب کاربری')
            }
          >
            <div className="relative">
              {isClinicPanel ? (
                isLoggedIn && currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full object-cover border border-purple-600 shadow-2xs"
                  />
                ) : (
                  <Building2 className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
                )
              ) : isDoctorPanel ? (
                isLoggedIn && currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full object-cover border border-blue-600 shadow-2xs"
                  />
                ) : (
                  <LayoutDashboard className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
                )
              ) : isSecretaryPanel ? (
                <Activity className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isLoggedIn && currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full object-cover border border-blue-500 shadow-2xs"
                />
              ) : (
                <UserIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              )}
              {isClinicPanel ? (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-600 border border-white rounded-full" />
              ) : isDoctorPanel ? (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 border border-white rounded-full" />
              ) : isSecretaryPanel ? (
                secretaryTab === 'logs' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                )
              ) : (
                isLoggedIn && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                )
              )}
            </div>
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight truncate max-w-[56px] sm:max-w-none">
              {isClinicPanel ? 'منوی کلینیک' : isDoctorPanel ? 'منوی پزشک' : isSecretaryPanel ? 'لاگ و شیفت' : (
                isLoggedIn ? (
                  currentUser?.role === 'patient' ? 'پنل بیمار' :
                  currentUser?.role === 'doctor' ? 'پنل پزشک' :
                  currentUser?.role === 'secretary' || currentUser?.role === 'reception' || currentUser?.role === 'nurse' ? 'پنل منشی' :
                  currentUser?.role === 'clinic_manager' || currentUser?.role === 'branch_manager' ? 'مدیریت کلینیک' :
                  currentUser?.role === 'super_admin' || currentUser?.role === 'admin' ? 'پنل مدیریت' :
                  'پنل من'
                ) : 'ورود به پنل'
              )}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Hamburger Navigation Drawer */}
      <MobileHamburgerDrawer
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        onOpenBookingModal={onOpenBookingModal}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
      />

      {/* Profile Photo Upload / Edit Modal */}
      <Modal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        title="تغییر و بارگذاری تصویر پروفایل"
      >
        <div className="space-y-6 text-slate-800">
          {/* Current Profile Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                alt={currentUser?.name || 'کاربر'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
              />
              <span className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full border-2 border-white">
                <Check className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-2.5">
              <p className="font-bold text-sm text-slate-900">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 font-mono">{currentUser?.phone}</p>
            </div>
          </div>

          {/* Upload From Device / Camera */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-600" />
              بارگذاری عکس با دوربین گوشی یا از گالری:
            </label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group active:scale-[0.99]"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-colors">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-blue-700 hover:underline">برای گرفتن عکس یا انتخاب از گالری لمس کنید</span>
                <p className="text-[11px] text-slate-400 mt-1">فرمت‌های مجاز: JPG, PNG, WebP (حداکثر ۵ مگابایت)</p>
              </div>
            </div>
          </div>

          {/* Preset Avatar Options */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              یا انتخاب از میان آواتارهای آماده:
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative rounded-2xl p-1 border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                    currentUser?.avatar === preset 
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/30' 
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <img
                    src={preset}
                    alt={`Avatar ${idx + 1}`}
                    className="w-full aspect-square rounded-xl object-cover"
                  />
                  {currentUser?.avatar === preset && (
                    <span className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAvatarModalOpen(false)}
            >
              انصراف
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Camera className="w-4 h-4" />}
              isLoading={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
            >
              انتخاب / گرفتن عکس
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modals */}
      <NearestBranchModal
        isOpen={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        doctors={doctors}
      />
      <InsuranceFinderModal
        isOpen={insuranceModalOpen}
        onClose={() => setInsuranceModalOpen(false)}
      />
    </>
  );
};
