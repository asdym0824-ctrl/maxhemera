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
  Zap,
  ShieldAlert,
  DollarSign,
  PieChart,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Doctor } from '../../types';
import { apiService } from '../../services/apiService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { NearestBranchModal } from '../branches/NearestBranchModal';
import { InsuranceFinderModal } from '../insurance/InsuranceFinderModal';
import { MobileHamburgerDrawer } from './MobileHamburgerDrawer';
import { PanelDedicatedMobileDrawer, PanelType } from './PanelDedicatedMobileDrawer';
import { SuperAdminCommandModal } from '../admin/SuperAdminCommandModal';

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
  const [isPanelDrawerOpen, setIsPanelDrawerOpen] = useState(false);
  const [activePanelType, setActivePanelType] = useState<PanelType>('clinic');
  const [isAdminCommandModalOpen, setIsAdminCommandModalOpen] = useState(false);
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

  // Close sheets on route changes
  useEffect(() => {
    setIsMoreSheetOpen(false);
    setIsPanelDrawerOpen(false);
    setIsAdminCommandModalOpen(false);
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

  // Detect super admin workspace context
  const isAdminPanel = 
    (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) &&
    isLoggedIn &&
    currentUser?.role === 'super_admin';

  const adminTab = (() => {
    const p = location.pathname;
    if (p.includes('/crm')) return 'crm';
    if (p.includes('/finance')) return 'finance';
    if (p.includes('/hr')) return 'hr';
    if (p.includes('/marketing')) return 'marketing';
    if (p.includes('/websites')) return 'websites';
    if (p.includes('/operations')) return 'operations';
    if (p.includes('/analytics')) return 'analytics';
    return 'overview';
  })();

  // Detect patient workspace context
  // Per user requirement: standard mobile bottom navigation remains unchanged for patient / regular user
  const isPatientPanel = false;

  // Detect secretary workspace context
  const isSecretaryPanel = 
    !isAdminPanel &&
    (location.pathname === '/secretary' || location.pathname.startsWith('/secretary/') || location.pathname === '/reception' || location.pathname.startsWith('/reception/')) &&
    isLoggedIn &&
    (currentUser?.role === 'secretary' || currentUser?.role === 'reception' || currentUser?.role === 'clinic_manager' || currentUser?.role === 'super_admin');
  const searchParams = new URLSearchParams(location.search);
  const secretaryTab = searchParams.get('tab') || 'queue';

  // Detect doctor workspace context - strictly for doctor portal, NOT the public /doctors search page
  const isDoctorPanel = 
    !isAdminPanel &&
    (location.pathname === '/doctor' || (location.pathname.startsWith('/doctor/') && !location.pathname.startsWith('/doctors') && !location.pathname.startsWith('/doctor-site'))) &&
    isLoggedIn &&
    (currentUser?.role === 'doctor' || currentUser?.role === 'super_admin');
  const doctorTab = searchParams.get('tab') || 'clinical';

  // Detect clinic manager workspace context
  const isClinicPanel = 
    !isAdminPanel &&
    (location.pathname === '/clinic' || (location.pathname.startsWith('/clinic/') && !location.pathname.startsWith('/clinic-') && !location.pathname.startsWith('/clinics'))) &&
    isLoggedIn &&
    (currentUser?.role === 'clinic_manager' || currentUser?.role === 'branch_manager' || currentUser?.role === 'super_admin');
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
          isAdminPanel
            ? 'ناوبری مرکز فرماندهی و ارزیابی سوپر ادمین همرا کلینیک'
            : isClinicPanel
              ? 'ناوبری مرکز عملیات و مدیریت همرا کلینیک'
              : isDoctorPanel 
                ? 'ناوبری میزکار و پرتال بالینی پزشک' 
                : isSecretaryPanel 
                  ? 'ناوبری میزکار منشی و پذیرش' 
                  : isPatientPanel
                    ? 'ناوبری پرتال بیمار و پرونده سلامت'
                    : 'ناوبری صفحات موبایل و تبلت'
        }
        className={`xl:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl border-t pb-[env(safe-area-inset-bottom,0px)] transition-all ${
          isAdminPanel
            ? 'border-rose-900/40 bg-slate-950/98 shadow-[0_-4px_30px_rgba(225,29,72,0.22)]'
            : isClinicPanel
              ? 'border-purple-200/80 bg-white/98 shadow-[0_-4px_24px_rgba(147,51,234,0.11)]'
              : isDoctorPanel
                ? 'border-slate-800/15 bg-white/98 shadow-[0_-4px_24px_rgba(15,23,42,0.08)]'
                : isSecretaryPanel 
                  ? 'border-indigo-100 bg-white/98 shadow-[0_-4px_24px_rgba(79,70,229,0.09)]' 
                  : isPatientPanel
                    ? 'border-emerald-100/90 bg-white/98 shadow-[0_-4px_24px_rgba(16,185,129,0.09)]'
                    : 'border-slate-200/90 bg-white/95 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]'
        }`}
      >
        <div className="grid grid-cols-5 items-center h-16 sm:h-18 max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-6">
          {/* 1. Super Admin Overview or Clinic Operations or Doctor Patients or Secretary Queue or Patient Home */}
          <Link
            id="mobile-nav-home"
            to={
              isAdminPanel
                ? '/admin'
                : isClinicPanel 
                  ? '/clinic?tab=overview' 
                  : isDoctorPanel 
                    ? '/doctor?tab=clinical' 
                    : isSecretaryPanel 
                      ? '/secretary?tab=queue' 
                      : isPatientPanel
                        ? '/patient'
                        : '/'
            }
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-3 rounded-2xl transition-all ${
              isAdminPanel
                ? (adminTab === 'overview'
                    ? 'text-rose-400 font-extrabold bg-rose-950/80 ring-1 ring-rose-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900')
                : isClinicPanel
                  ? (clinicTab === 'overview' ? 'text-purple-700 font-bold bg-purple-50/90' : 'text-slate-500 hover:text-purple-900 hover:bg-slate-50')
                  : isDoctorPanel
                    ? (doctorTab === 'clinical' ? 'text-blue-600 font-bold bg-blue-50/90' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                    : isSecretaryPanel
                      ? (secretaryTab === 'queue' ? 'text-indigo-600 font-bold bg-indigo-50/90' : 'text-slate-500 hover:text-indigo-900 hover:bg-slate-50')
                      : isPatientPanel
                        ? (location.pathname === '/patient' || location.pathname === '/patient/' ? 'text-emerald-700 font-bold bg-emerald-50/90' : 'text-slate-500 hover:text-emerald-900 hover:bg-slate-50')
                        : (location.pathname === '/'
                            ? 'text-blue-600 font-bold bg-blue-50/70'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50')
            }`}
          >
            <div className="relative">
              {isAdminPanel ? (
                <BarChart3 className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isClinicPanel ? (
                <BarChart3 className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isDoctorPanel ? (
                <Users className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isSecretaryPanel ? (
                <Users className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : (
                <Home className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              )}
              {isAdminPanel ? (
                adminTab === 'overview' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-slate-950" />
                )
              ) : isClinicPanel ? (
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
              ) : isPatientPanel ? (
                (location.pathname === '/patient' || location.pathname === '/patient/') && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                )
              ) : (
                isCurrentActive('/') && location.pathname === '/' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )
              )}
            </div>
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight">
              {isAdminPanel ? 'داشبورد ارشد' : isClinicPanel ? 'پایش عملیات' : isDoctorPanel ? 'صف بیماران' : isSecretaryPanel ? 'صف مراجعین' : isPatientPanel ? 'داشبورد من' : 'صفحه اصلی'}
            </span>
          </Link>

          {/* 2. Super Admin CRM / Clinic Staff / Doctor Task Center / Secretary Task Center / Patient Appointments / Doctors */}
          <Link
            id="mobile-nav-doctors"
            to={
              isAdminPanel
                ? '/admin/crm'
                : isClinicPanel 
                  ? '/clinic?tab=staff' 
                  : isDoctorPanel 
                    ? '/doctor?tab=tasks' 
                    : isSecretaryPanel 
                      ? '/secretary?tab=tasks' 
                      : isPatientPanel
                        ? '/patient/appointments'
                        : '/doctors'
            }
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-3 rounded-2xl transition-all ${
              isAdminPanel
                ? (adminTab === 'crm'
                    ? 'text-rose-400 font-extrabold bg-rose-950/80 ring-1 ring-rose-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900')
                : isClinicPanel
                  ? (clinicTab === 'staff' ? 'text-purple-700 font-bold bg-purple-50/90' : 'text-slate-500 hover:text-purple-900 hover:bg-slate-50')
                  : isDoctorPanel
                    ? (doctorTab === 'tasks' ? 'text-blue-600 font-bold bg-blue-50/90' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                    : isSecretaryPanel
                      ? (secretaryTab === 'tasks' ? 'text-indigo-600 font-bold bg-indigo-50/90' : 'text-slate-500 hover:text-indigo-900 hover:bg-slate-50')
                      : isPatientPanel
                        ? (location.pathname.startsWith('/patient/appointments') ? 'text-emerald-700 font-bold bg-emerald-50/90' : 'text-slate-500 hover:text-emerald-900 hover:bg-slate-50')
                        : (isCurrentActive('/doctors')
                            ? 'text-blue-600 font-bold bg-blue-50/70'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50')
            }`}
          >
            <div className="relative">
              {isAdminPanel ? (
                <UserCheck className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isClinicPanel ? (
                <Users className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isDoctorPanel ? (
                <CheckSquare className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isSecretaryPanel ? (
                <CheckSquare className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isPatientPanel ? (
                <Calendar className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : (
                <Stethoscope className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              )}
              {isAdminPanel ? (
                adminTab === 'crm' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-slate-950" />
                )
              ) : isClinicPanel ? (
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
              ) : isPatientPanel ? (
                location.pathname.startsWith('/patient/appointments') && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                )
              ) : (
                isCurrentActive('/doctors') && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )
              )}
            </div>
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight">
              {isAdminPanel ? 'مراجعین CRM' : isClinicPanel ? 'پرسنل و شیفت' : isDoctorPanel ? 'دستورات مطب' : isSecretaryPanel ? 'کارتابل و تسک' : isPatientPanel ? 'نوبت‌های من' : 'پزشکان'}
            </span>
          </Link>

          {/* 3. Center Elevated Action Button: Super Admin Command Center / Clinic Advisor / Doctor Visit / Secretary Check-in / Patient Booking */}
          <div className="flex flex-col items-center justify-center relative -top-3 sm:-top-4">
            <button
              id="mobile-nav-book-btn"
              type="button"
              onClick={() => {
                if (isAdminPanel) {
                  setIsAdminCommandModalOpen(true);
                } else if (isClinicPanel) {
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
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white shadow-lg flex items-center justify-center active:scale-90 hover:scale-105 transition-all border-3 cursor-pointer ${
                isAdminPanel
                  ? 'bg-gradient-to-tr from-rose-700 via-rose-600 to-amber-500 hover:from-rose-800 hover:to-amber-600 shadow-rose-950/70 ring-2 ring-rose-400/60 border-slate-950'
                  : isClinicPanel
                    ? 'bg-gradient-to-tr from-purple-800 via-purple-700 to-slate-950 hover:from-purple-900 hover:to-slate-900 shadow-purple-900/40 ring-2 ring-purple-400/50 border-white'
                    : isDoctorPanel
                      ? 'bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-700 hover:from-slate-900 hover:to-blue-600 shadow-blue-950/40 ring-2 ring-blue-400/50 border-white'
                      : isSecretaryPanel
                        ? 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-700 hover:to-slate-800 shadow-indigo-600/35 ring-2 ring-indigo-300/40 border-white'
                        : isPatientPanel
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-emerald-600/30 border-white'
                          : 'bg-gradient-to-tr from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-blue-600/30 border-white'
              }`}
              aria-label={
                isAdminPanel
                  ? 'مرکز فرماندهی و عملیات سوپر ادمین'
                  : isClinicPanel
                    ? 'مشاور هوش مصنوعی و بهینه‌سازی عملیات کلینیک'
                    : isDoctorPanel 
                      ? 'فراخوانی بیمار و باز کردن پرونده بالینی' 
                      : isSecretaryPanel 
                        ? 'ثبت و اعلام حضور فوری مراجعین' 
                        : 'رزرو آنلاین نوبت پزشک'
              }
              title={
                isAdminPanel
                  ? 'مرکز فرماندهی سوپر ادمین'
                  : isClinicPanel
                    ? 'مشاور هوش مصنوعی مدیریت کلینیک'
                    : isDoctorPanel 
                      ? 'ویزیت بالینی و پرونده بیمار' 
                      : isSecretaryPanel 
                        ? 'اعلام حضور فوری مراجع' 
                        : 'رزرو آنلاین نوبت پزشک'
              }
            >
              {isAdminPanel ? (
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
              ) : isClinicPanel ? (
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
              isAdminPanel
                ? 'text-rose-400 font-black'
                : isClinicPanel 
                  ? 'text-purple-900' 
                  : isDoctorPanel 
                    ? 'text-slate-900' 
                    : isSecretaryPanel 
                      ? 'text-indigo-700' 
                      : isPatientPanel 
                        ? 'text-emerald-700' 
                        : 'text-blue-700'
            }`}>
              {isAdminPanel ? 'فرماندهی ارشد' : isClinicPanel ? 'مشاور هوشمند' : isDoctorPanel ? 'ویزیت فعال' : isSecretaryPanel ? 'اعلام حضور' : isPatientPanel ? 'رزرو نوبت' : 'نوبت‌دهی'}
            </span>
          </div>

          {/* 4. Super Admin Finance / Clinic Tasks / Doctor Website / Secretary Calls / Patient Records / Specialties */}
          <Link
            id="mobile-nav-specialties"
            to={
              isAdminPanel
                ? '/admin/finance'
                : isClinicPanel 
                  ? '/clinic?tab=tasks' 
                  : isDoctorPanel 
                    ? '/doctor?tab=website' 
                    : isSecretaryPanel 
                      ? '/secretary?tab=calls' 
                      : isPatientPanel
                        ? '/patient/records'
                        : '/specialties'
            }
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-3 rounded-2xl transition-all ${
              isAdminPanel
                ? (adminTab === 'finance'
                    ? 'text-rose-400 font-extrabold bg-rose-950/80 ring-1 ring-rose-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900')
                : isClinicPanel
                  ? (clinicTab === 'tasks' ? 'text-purple-700 font-bold bg-purple-50/90' : 'text-slate-500 hover:text-purple-900 hover:bg-slate-50')
                  : isDoctorPanel
                    ? (doctorTab === 'website' ? 'text-blue-600 font-bold bg-blue-50/90' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                    : isSecretaryPanel
                      ? (secretaryTab === 'calls' || secretaryTab === 'sms' ? 'text-indigo-600 font-bold bg-indigo-50/90' : 'text-slate-500 hover:text-indigo-900 hover:bg-slate-50')
                      : isPatientPanel
                        ? (location.pathname.startsWith('/patient/records') ? 'text-emerald-700 font-bold bg-emerald-50/90' : 'text-slate-500 hover:text-emerald-900 hover:bg-slate-50')
                        : (isCurrentActive('/specialties') || isCurrentActive('/services')
                            ? 'text-blue-600 font-bold bg-blue-50/70'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50')
            }`}
          >
            <div className="relative">
              {isAdminPanel ? (
                <DollarSign className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isClinicPanel ? (
                <CheckSquare className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isDoctorPanel ? (
                <Globe className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isSecretaryPanel ? (
                <PhoneCall className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : isPatientPanel ? (
                <FileText className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              ) : (
                <Building2 className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              )}
              {isAdminPanel ? (
                adminTab === 'finance' && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-slate-950" />
                )
              ) : isClinicPanel ? (
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
              ) : isPatientPanel ? (
                location.pathname.startsWith('/patient/records') && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                )
              ) : (
                (isCurrentActive('/specialties') || isCurrentActive('/services')) && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )
              )}
            </div>
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight">
              {isAdminPanel ? 'مالی و سود' : isClinicPanel ? 'وظایف پرسنل' : isDoctorPanel ? 'سایت پزشک' : isSecretaryPanel ? 'تماس و پیامک' : isPatientPanel ? 'پرونده سلامت' : 'تخصص‌ها'}
            </span>
          </Link>

          {/* 5. Super Admin Modules / Clinic Menu / Doctor Menu / Secretary Menu / Patient Menu / User Portal */}
          <button
            id="mobile-nav-more-btn"
            type="button"
            onClick={() => {
              if (isAdminPanel) {
                setActivePanelType('admin');
                setIsPanelDrawerOpen(true);
              } else if (isClinicPanel) {
                setActivePanelType('clinic');
                setIsPanelDrawerOpen(true);
              } else if (isDoctorPanel) {
                setActivePanelType('doctor');
                setIsPanelDrawerOpen(true);
              } else if (isSecretaryPanel) {
                setActivePanelType('secretary');
                setIsPanelDrawerOpen(true);
              } else if (isPatientPanel) {
                setActivePanelType('patient');
                setIsPanelDrawerOpen(true);
              } else if (isLoggedIn && currentUser) {
                // If logged in on public site, open dedicated drawer for user's role
                if (currentUser.role === 'super_admin' || currentUser.role === 'admin') {
                  setActivePanelType('admin');
                  setIsPanelDrawerOpen(true);
                } else if (currentUser.role === 'clinic_manager' || currentUser.role === 'branch_manager') {
                  setActivePanelType('clinic');
                  setIsPanelDrawerOpen(true);
                } else if (currentUser.role === 'doctor') {
                  setActivePanelType('doctor');
                  setIsPanelDrawerOpen(true);
                } else if (currentUser.role === 'secretary' || currentUser.role === 'reception' || currentUser.role === 'nurse') {
                  setActivePanelType('secretary');
                  setIsPanelDrawerOpen(true);
                } else if (currentUser.role === 'patient') {
                  if (location.pathname === '/patient' || location.pathname.startsWith('/patient/')) {
                    setActivePanelType('patient');
                    setIsPanelDrawerOpen(true);
                  } else {
                    navigate('/patient');
                  }
                } else {
                  navigate(userPortalPath);
                }
              } else {
                navigate(userPortalPath);
              }
            }}
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-3 rounded-2xl transition-all cursor-pointer active:scale-95 ${
              isAdminPanel
                ? (isPanelDrawerOpen || isAdminCommandModalOpen || adminTab === 'websites' || adminTab === 'hr' || adminTab === 'marketing' || adminTab === 'operations' || adminTab === 'analytics'
                    ? 'text-rose-400 font-extrabold bg-rose-950/80 ring-1 ring-rose-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900')
                : isClinicPanel
                  ? (isPanelDrawerOpen || clinicTab === 'automations' || clinicTab === 'branding' || clinicTab === 'audit'
                      ? 'text-purple-700 font-bold bg-purple-50/90 ring-1 ring-purple-400/40'
                      : 'text-slate-500 hover:text-purple-900 hover:bg-slate-50')
                  : isDoctorPanel
                    ? (isPanelDrawerOpen ? 'text-blue-600 font-bold bg-blue-50/90 ring-1 ring-blue-400/40' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                    : isSecretaryPanel
                      ? (isPanelDrawerOpen || secretaryTab === 'logs' ? 'text-indigo-600 font-bold bg-indigo-50/90 ring-1 ring-indigo-400/40' : 'text-slate-500 hover:text-indigo-900 hover:bg-slate-50')
                      : isPatientPanel
                        ? (isPanelDrawerOpen ? 'text-emerald-700 font-bold bg-emerald-50/90 ring-1 ring-emerald-400/40' : 'text-slate-500 hover:text-emerald-900 hover:bg-slate-50')
                        : (isPanelDrawerOpen || isCurrentActive(userPortalPath) || (isLoggedIn && (
                            location.pathname.startsWith('/patient') ||
                            (location.pathname === '/doctor' || (location.pathname.startsWith('/doctor/') && !location.pathname.startsWith('/doctors'))) ||
                            location.pathname.startsWith('/secretary') ||
                            (location.pathname === '/clinic' || (location.pathname.startsWith('/clinic/') && !location.pathname.startsWith('/clinic-'))) ||
                            location.pathname.startsWith('/admin')
                          ))
                            ? 'text-blue-600 font-bold bg-blue-50/70'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50')
            }`}
            aria-label={
              isAdminPanel
                ? 'مرکز کنترل و سایر ماژول‌های سوپر ادمین'
                : isClinicPanel 
                  ? 'منوی امکانات و مدیریت کلینیک' 
                  : isDoctorPanel 
                    ? 'منو و ابزارهای سریع پزشک' 
                    : isSecretaryPanel 
                      ? 'منو و ابزارهای میزکار منشی' 
                      : isPatientPanel
                        ? 'منوی پرونده و خدمات بیمار'
                        : (isLoggedIn ? `ورود به پنل کاربری ${currentUser?.name || ''}` : 'ورود به حساب کاربری')
            }
            title={
              isAdminPanel
                ? 'سایر بخش‌ها و امکانات سوپر ادمین'
                : isClinicPanel 
                  ? 'منوی امکانات و مدیریت کلینیک' 
                  : isDoctorPanel 
                    ? 'منوی امکانات و ابزارهای پزشک' 
                    : isSecretaryPanel 
                      ? 'منوی میزکار و پرتال منشی' 
                      : isPatientPanel
                        ? 'منوی پرونده و خدمات بیمار'
                        : (isLoggedIn ? `ورود به پنل کاربری ${currentUser?.name || ''}` : 'ورود به حساب کاربری')
            }
          >
            <div className="relative">
              {isAdminPanel ? (
                currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full object-cover border border-rose-500 shadow-2xs"
                  />
                ) : (
                  <PieChart className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
                )
              ) : isClinicPanel ? (
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
                isLoggedIn && currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full object-cover border border-indigo-600 shadow-2xs"
                  />
                ) : (
                  <UserCheck className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
                )
              ) : isPatientPanel ? (
                isLoggedIn && currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full object-cover border border-emerald-600 shadow-2xs"
                  />
                ) : (
                  <Heart className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
                )
              ) : isLoggedIn && currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full object-cover border border-blue-500 shadow-2xs"
                />
              ) : (
                <UserIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform active:scale-90" />
              )}
              {isAdminPanel ? (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 border border-slate-950 rounded-full" />
              ) : isClinicPanel ? (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-600 border border-white rounded-full" />
              ) : isDoctorPanel ? (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 border border-white rounded-full" />
              ) : isSecretaryPanel ? (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-600 border border-white rounded-full" />
              ) : isPatientPanel ? (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-600 border border-white rounded-full" />
              ) : (
                isLoggedIn && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                )
              )}
            </div>
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight truncate max-w-[56px] sm:max-w-none">
              {isAdminPanel ? 'سایر بخش‌ها' : isClinicPanel ? 'منوی کلینیک' : isDoctorPanel ? 'منوی پزشک' : isSecretaryPanel ? 'منوی منشی' : isPatientPanel ? 'منوی بیمار' : (
                isLoggedIn ? (
                  currentUser?.role === 'patient' ? 'پروفایل من' :
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

      {/* Dedicated Workspace Mobile Drawer (Specific to Active Panel) */}
      <PanelDedicatedMobileDrawer
        isOpen={isPanelDrawerOpen}
        onClose={() => setIsPanelDrawerOpen(false)}
        panelType={activePanelType}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
      />

      {/* Mobile Hamburger Navigation Drawer (General Website) */}
      <MobileHamburgerDrawer
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        onOpenBookingModal={onOpenBookingModal}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
      />

      {/* Super Admin Executive Command Modal */}
      <SuperAdminCommandModal
        isOpen={isAdminCommandModalOpen}
        onClose={() => setIsAdminCommandModalOpen(false)}
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
