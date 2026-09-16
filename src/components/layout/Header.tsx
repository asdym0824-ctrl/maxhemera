import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  User as UserIcon, 
  ChevronDown, 
  Menu, 
  X, 
  PhoneCall,
  Activity,
  Heart,
  MapPin,
  Building2,
  ShieldCheck,
  LogOut,
  LogIn,
  Stethoscope,
  Globe,
  RefreshCw,
  LayoutDashboard,
  Users,
  ClipboardList,
  MessageSquare,
  ShieldAlert,
  Clock,
  Sparkles,
  ExternalLink,
  CheckSquare,
  BellRing,
  PhoneForwarded,
  Eye,
  Sliders,
  DollarSign,
  Video,
  Newspaper,
  Camera,
  Upload,
  Check,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Doctor } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { DEMO_MODE } from '../../config';
import { NearestBranchModal } from '../branches/NearestBranchModal';
import { InsuranceFinderModal } from '../insurance/InsuranceFinderModal';
import { MobileHamburgerDrawer } from './MobileHamburgerDrawer';
import { apiService } from '../../services/apiService';
import { INITIAL_USERS } from '../../data/mockData';

interface HeaderProps {
  onOpenBookingModal?: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
];

export const Header: React.FC<HeaderProps> = ({
  onOpenBookingModal
}) => {
  const { currentUser, switchUser, isLoggedIn, logout, getRoleDefaultPath, setRole, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || '';

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMoreMenuOpen, setDesktopMoreMenuOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-close mobile drawer and dropdowns on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setRoleDropdownOpen(false);
    setDesktopMoreMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    apiService.getDoctors().then(setDoctors);
  }, []);

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

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string; route: string }> = {
    patient: { label: 'بیمار', badge: 'بیمار', color: 'blue', route: '/patient' },
    doctor: { label: 'پزشک متخصص', badge: currentUser?.role === 'doctor' && currentUser?.name ? currentUser.name : 'پزشک متخصص', color: 'blue', route: '/doctor' },
    secretary: { label: 'منشی و پذیرش', badge: 'منشی شیفت', color: 'indigo', route: '/secretary' },
    reception: { label: 'پذیرش مرکزی', badge: 'پذیرش کلینیک', color: 'indigo', route: '/secretary' },
    clinic_manager: { label: 'مدیر کلینیک', badge: 'مدیریت کلینیک', color: 'purple', route: '/clinic' },
    nurse: { label: 'پرستاری و تریاژ', badge: 'پرستار تریاژ', color: 'blue', route: '/secretary' },
    admin: { label: 'مدیریت سیستم', badge: 'مدیر سامانه', color: 'rose', route: '/admin' },
    super_admin: { label: 'سوپر ادمین', badge: 'سوپر ادمین', color: 'rose', route: '/admin' },
    finance: { label: 'واحد مالی', badge: 'امور مالی', color: 'amber', route: '/admin/finance' },
    hr: { label: 'منابع انسانی', badge: 'پرسنلی', color: 'blue', route: '/admin/hr' },
    content_manager: { label: 'مدیریت محتوا', badge: 'محتوا', color: 'blue', route: '/admin/marketing' },
    branch_manager: { label: 'مدیریت شعب', badge: 'مدیر شعبه', color: 'purple', route: '/clinic' }
  };

  const handleUserSelect = async (userId: string) => {
    const user = await switchUser(userId);
    setRoleDropdownOpen(false);
    setUserDropdownOpen(false);
    if (user) {
      navigate(getRoleDefaultPath(user.role));
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setRoleDropdownOpen(false);
    navigate('/login');
  };

  // Find linked doctor for doctor site quick link
  const currentDoctorSlug = currentUser?.role === 'doctor'
    ? (doctors.find(d => d.id === currentUser?.doctorId || d.name === currentUser?.name)?.slug || 'dr-maryam-hosseini')
    : 'dr-maryam-hosseini';

  const linkedDoctor = currentUser ? doctors.find(d => d.id === currentUser.doctorId || d.name === currentUser.name) : undefined;

  // Check if current user is in a specialized medical staff role
  const isDoctor = isLoggedIn && currentUser?.role === 'doctor';
  const isSecretary = isLoggedIn && (currentUser?.role === 'secretary' || currentUser?.role === 'reception' || currentUser?.role === 'nurse');
  const isClinicManager = isLoggedIn && (currentUser?.role === 'clinic_manager' || currentUser?.role === 'branch_manager');
  const isAdmin = isLoggedIn && (currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'finance' || currentUser?.role === 'hr' || currentUser?.role === 'content_manager');

  const renderAvatarModal = () => (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
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
    </>
  );

  // ----------------------------------------------------
  // RENDER SPECIALIZED HEADER FOR DOCTORS
  // ----------------------------------------------------
  if (isLoggedIn && isDoctor) {
    const doctorNav = [
      { id: 'clinical', label: 'صف ویزیت و بیماران', path: '/doctor?tab=clinical', icon: Stethoscope, active: location.pathname === '/doctor' && (currentTab === 'clinical' || !currentTab) },
      { id: 'tasks', label: 'دستورات و تسک‌های منشی', path: '/doctor?tab=tasks', icon: CheckSquare, active: location.pathname === '/doctor' && currentTab === 'tasks' },
      { id: 'website', label: 'تنظیمات و قالب وب‌سایت', path: '/doctor?tab=website', icon: Sliders, active: location.pathname === '/doctor' && currentTab === 'website' },
      { id: 'site_preview', label: 'وب‌سایت اختصاصی مطب من', path: `/site/${currentDoctorSlug}`, icon: Globe, active: location.pathname.startsWith('/site/') || location.pathname.startsWith('/dr/'), external: true },
    ];

    return (
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md font-sans w-full max-w-full overflow-x-clip box-border" dir="rtl">
        {/* Doctor Workspace Top Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 w-full box-border">
          {/* Doctor Portal Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/doctor" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm sm:text-lg tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                  پرتال بالینی پزشکان
                  <span className="text-[9px] sm:text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded-full hidden sm:inline">
                    مطب هوشمند
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/80 font-normal hidden sm:block truncate">
                  {currentUser.name} • کد نظام: {linkedDoctor?.medicalCouncilNumber || 'تایید شده'}
                </p>
              </div>
            </Link>
          </div>

          {/* Doctor Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {doctorNav.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  target={item.external ? "_blank" : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    item.active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.external && <ExternalLink className="w-2.5 h-2.5 opacity-60 mr-0.5" />}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Live Status Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-600/40 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>آماده ویزیت</span>
            </div>

            {/* View Doctor Personal Site Link */}
            <Link
              to={`/site/${currentDoctorSlug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">مشاهده وبسایت مطب</span>
              <ExternalLink className="w-3 h-3 text-blue-300" />
            </Link>

            {/* Doctor User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-slate-700"
              >
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=80"}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-blue-400"
                />
                <span className="max-w-[120px] truncate hidden sm:inline">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in zoom-in-95 font-sans" dir="rtl">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                    <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                    <div className="text-xs text-blue-600 font-semibold mt-0.5">پزشک متخصص معالج</div>
                    <div className="text-[11px] text-slate-400 mt-1">کد نظام: {linkedDoctor?.medicalCouncilNumber || 'ثبت شده'}</div>
                  </div>

                  <div className="p-1 space-y-1 text-xs font-semibold">
                    <Link
                      to="/doctor"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-blue-50 text-blue-900 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      <span>میزکار بالینی و صف ویزیت</span>
                    </Link>

                    <Link
                      to={`/site/${currentDoctorSlug}`}
                      target="_blank"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-sky-50 text-sky-900 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-sky-600" />
                      <span>مشاهده وبسایت مطب</span>
                      <ExternalLink className="w-3 h-3 text-sky-400 mr-auto" />
                    </Link>

                    <Link
                      to="/?preview=true"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>پیش‌نمایش سایت عمومی کلینیک</span>
                    </Link>

                    <Link
                      to="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                      <span>تغییر پرتال یا کاربر</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsAvatarModalOpen(true);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-blue-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>تغییر تصویر پروفایل</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-3 py-2 hover:bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>خروج از حساب</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Doctor Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700 px-4 py-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAvatarModalOpen(true);
              }}
              className="w-full text-right px-3 py-2 rounded-xl text-xs font-semibold bg-slate-700 text-blue-300 hover:bg-slate-600 flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-blue-400" />
              <span>تغییر تصویر پروفایل</span>
            </button>
            {doctorNav.map(item => (
              <Link
                key={item.id}
                to={item.path}
                target={item.external ? "_blank" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                  item.active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
        {renderAvatarModal()}
      </header>
    );
  }

  // ----------------------------------------------------
  // RENDER SPECIALIZED HEADER FOR SECRETARY / RECEPTION
  // ----------------------------------------------------
  if (isLoggedIn && isSecretary) {
    const secretaryNav = [
      { id: 'queue', label: 'صف انتظار و تریاژ', path: '/secretary?tab=queue', icon: Users, active: location.pathname === '/secretary' && (currentTab === 'queue' || !currentTab) },
      { id: 'calls', label: 'تماس‌ها و استعلام تلفنی', path: '/secretary?tab=calls', icon: PhoneForwarded, active: location.pathname === '/secretary' && currentTab === 'calls' },
      { id: 'sms', label: 'سامانه پیامک و یادآوری', path: '/secretary?tab=sms', icon: MessageSquare, active: location.pathname === '/secretary' && currentTab === 'sms' },
      { id: 'tasks', label: 'کارتابل وظایف کلینیک', path: '/secretary?tab=tasks', icon: CheckSquare, active: location.pathname === '/secretary' && currentTab === 'tasks' },
      { id: 'logs', label: 'لاگ ورود و رویدادها', path: '/secretary?tab=logs', icon: Activity, active: location.pathname === '/secretary' && currentTab === 'logs' },
    ];

    return (
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-indigo-900/60 shadow-md font-sans w-full max-w-full overflow-x-clip box-border" dir="rtl">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 w-full box-border">
          {/* Secretary Brand */}
          <Link to="/secretary" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform shrink-0">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm sm:text-lg tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                میزکار پذیرش و منشی
                <span className="text-[9px] sm:text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.5 rounded-full hidden sm:inline">
                  پذیرش درمانگاه
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/80 font-normal hidden sm:block truncate">
                همرا کلینیک • شیفت فعال: {currentUser.name}
              </p>
            </div>
          </Link>

          {/* Secretary Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            {secretaryNav.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    item.active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Shift Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>شیفت فعال پذیرش</span>
            </div>

            {/* Quick Check-in Trigger */}
            <button
              onClick={() => {
                navigate('/secretary?tab=queue');
                // Trigger quick checkin modal by dispatching custom event
                window.dispatchEvent(new CustomEvent('synapse_open_quick_checkin'));
              }}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <span>+ اعلام حضور فوری</span>
            </button>

            {/* Secretary Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-slate-700"
              >
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=80"}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-indigo-400"
                />
                <span className="max-w-[120px] truncate hidden sm:inline">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in zoom-in-95 font-sans" dir="rtl">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                    <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                    <div className="text-xs text-indigo-600 font-semibold mt-0.5">منشی و مسئول پذیرش مراجعین</div>
                  </div>

                  <div className="p-1 space-y-1 text-xs font-semibold">
                    <Link
                      to="/secretary"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-indigo-50 text-indigo-900 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                      <span>میزکار و صف پذیرش</span>
                    </Link>

                    <Link
                      to="/?preview=true"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>پیش‌نمایش سایت عمومی کلینیک</span>
                    </Link>

                    <Link
                      to="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                      <span>تغییر پرتال یا کاربر</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsAvatarModalOpen(true);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-indigo-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-indigo-600" />
                      <span>تغییر تصویر پروفایل</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-3 py-2 hover:bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>خروج از حساب</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-800 border-t border-slate-700 px-4 py-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAvatarModalOpen(true);
              }}
              className="w-full text-right px-3 py-2 rounded-xl text-xs font-semibold bg-slate-700 text-indigo-300 hover:bg-slate-600 flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>تغییر تصویر پروفایل</span>
            </button>
            {secretaryNav.map(item => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                  item.active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
        {renderAvatarModal()}
      </header>
    );
  }

  // ----------------------------------------------------
  // RENDER SPECIALIZED HEADER FOR CLINIC MANAGERS
  // ----------------------------------------------------
  if (isLoggedIn && isClinicManager) {
    const managerNav = [
      { id: 'overview', label: 'دیدبان زنده عملیات', path: '/clinic?tab=overview', icon: Activity, active: location.pathname === '/clinic' && (currentTab === 'overview' || !currentTab) },
      { id: 'staff', label: 'پایش پرسنل و پزشکان', path: '/clinic?tab=staff', icon: Users, active: location.pathname === '/clinic' && currentTab === 'staff' },
      { id: 'automations', label: 'قوانین و اتوماسیون', path: '/clinic?tab=automations', icon: Sliders, active: location.pathname === '/clinic' && currentTab === 'automations' },
      { id: 'tasks', label: 'کارتابل تسک‌ها', path: '/clinic?tab=tasks', icon: CheckSquare, active: location.pathname === '/clinic' && currentTab === 'tasks' },
      { id: 'audit', label: 'لاگ‌های نظارتی و حسابرسی', path: '/clinic?tab=audit', icon: ShieldAlert, active: location.pathname === '/clinic' && currentTab === 'audit' },
    ];

    return (
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-purple-950 shadow-md font-sans w-full max-w-full overflow-x-clip box-border" dir="rtl">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 w-full box-border">
          <Link to="/clinic" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm sm:text-lg tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                مرکز عملیات و مدیریت کلینیک
                <span className="text-[9px] sm:text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 px-1.5 py-0.5 rounded-full hidden sm:inline">
                  فرماندهی شعب
                </span>
              </div>
              <p className="text-[11px] text-purple-200/80 font-normal hidden sm:block truncate">
                همرا کلینیک • مدیر: {currentUser.name}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            {managerNav.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    item.active
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>شعبه مرکزی فعال</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-slate-700"
              >
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80"}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-purple-400"
                />
                <span className="max-w-[120px] truncate hidden sm:inline">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in zoom-in-95 font-sans" dir="rtl">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                    <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                    <div className="text-xs text-purple-600 font-semibold mt-0.5">مدیر کلینیک و عملیات درمانگاه</div>
                  </div>

                  <div className="p-1 space-y-1 text-xs font-semibold">
                    <Link
                      to="/clinic"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-purple-50 text-purple-900 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-purple-600" />
                      <span>داشبورد عملیات کلینیک</span>
                    </Link>

                    <Link
                      to="/?preview=true"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>پیش‌نمایش سایت عمومی کلینیک</span>
                    </Link>

                    <Link
                      to="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                      <span>تغییر پرتال یا کاربر</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsAvatarModalOpen(true);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-purple-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-purple-600" />
                      <span>تغییر تصویر پروفایل</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-3 py-2 hover:bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>خروج از حساب</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-800 border-t border-slate-700 px-4 py-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAvatarModalOpen(true);
              }}
              className="w-full text-right px-3 py-2 rounded-xl text-xs font-semibold bg-slate-700 text-purple-300 hover:bg-slate-600 flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-purple-400" />
              <span>تغییر تصویر پروفایل</span>
            </button>
            {managerNav.map(item => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                  item.active ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
        {renderAvatarModal()}
      </header>
    );
  }

  // ----------------------------------------------------
  // RENDER SPECIALIZED HEADER FOR SUPER ADMINS
  // ----------------------------------------------------
  if (isLoggedIn && isAdmin) {
    const adminNav = [
      { id: 'admin_home', label: 'داشبورد جامع کلان', path: '/admin', icon: LayoutDashboard, active: location.pathname === '/admin' },
      { id: 'admin_users', label: 'کاربران و پرمیشن‌ها', path: '/admin/users', icon: Users, active: location.pathname === '/admin/users' },
      { id: 'admin_finance', label: 'واحد مالی و تسویه‌ها', path: '/admin/finance', icon: DollarSign, active: location.pathname === '/admin/finance' },
      { id: 'admin_marketing', label: 'مدیریت محتوا', path: '/admin/marketing', icon: Sliders, active: location.pathname === '/admin/marketing' },
      { id: 'admin_settings', label: 'تنظیمات و امنیت', path: '/admin/settings', icon: ShieldAlert, active: location.pathname === '/admin/settings' },
    ];

    return (
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-rose-950 shadow-md font-sans w-full max-w-full overflow-x-clip box-border" dir="rtl">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 w-full box-border">
          <Link to="/admin" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20 group-hover:scale-105 transition-transform shrink-0">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm sm:text-lg tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                کنسول ارشد مدیریت سامانه
                <span className="text-[9px] sm:text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30 px-1.5 py-0.5 rounded-full hidden sm:inline">
                  Enterprise Admin
                </span>
              </div>
              <p className="text-[11px] text-rose-200/80 font-normal hidden sm:block truncate">
                همرا کلینیک • مدیر ارشد: {currentUser.name}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {adminNav.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    item.active
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>سرورها و API پایدار</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-slate-800"
              >
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80"}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-rose-500"
                />
                <span className="max-w-[120px] truncate hidden sm:inline">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in zoom-in-95 font-sans" dir="rtl">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                    <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                    <div className="text-xs text-rose-600 font-semibold mt-0.5">سوپر ادمین و مدیر ارشد سیستم</div>
                  </div>

                  <div className="p-1 space-y-1 text-xs font-semibold">
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-rose-50 text-rose-900 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-rose-600" />
                      <span>داشبورد کلان سامانه</span>
                    </Link>

                    <Link
                      to="/?preview=true"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>پیش‌نمایش سایت عمومی کلینیک</span>
                    </Link>

                    <Link
                      to="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-right px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                      <span>تغییر پرتال یا کاربر</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsAvatarModalOpen(true);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-rose-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-rose-600" />
                      <span>تغییر تصویر پروفایل</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-3 py-2 hover:bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>خروج از حساب</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAvatarModalOpen(true);
              }}
              className="w-full text-right px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-rose-300 hover:bg-slate-700 flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-rose-400" />
              <span>تغییر تصویر پروفایل</span>
            </button>
            {adminNav.map(item => (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                  item.active ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
        {renderAvatarModal()}
      </header>
    );
  }

  // ----------------------------------------------------
  // RENDER STANDARD PUBLIC & PATIENT CLINIC HEADER
  // ----------------------------------------------------
  const publicNavItems = [
    { id: 'home', label: 'صفحه اصلی', path: '/' },
    { id: 'doctors', label: 'پزشکان', path: '/doctors' },
    { id: 'specialties', label: 'تخصص‌ها', path: '/specialties' },
    { id: 'services', label: 'پاراکلینیک', path: '/services' },
    { id: 'telemedicine', label: 'مشاوره آنلاین', path: '/telemedicine' },
    { id: 'health', label: 'مجله سلامت', path: '/health' }
  ];

  const isCurrentPathActive = (path: string) => {
    if (path === '/') return location.pathname === '/' && searchParams.get('preview') !== 'true';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-2xs font-sans w-full max-w-full overflow-x-clip box-border" dir="rtl">
      {/* Top Info & Demo Switcher Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 sm:py-1.5 px-2.5 sm:px-8 border-b border-slate-800 w-full box-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-blue-400 font-medium truncate text-[10px] sm:text-xs">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate font-bold">همرا کلینیک</span>
              <span className="hidden sm:inline text-slate-400 font-normal">(HEMERA CLINIC)</span>
            </span>
            <span className="hidden md:inline-block text-slate-500">|</span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <PhoneCall className="w-3 h-3 text-slate-400" />
              پشتیبانی و نوبت‌دهی: ۰۲۱-۸۸۹۹۰۰۰۰
            </span>
          </div>

          {/* Quick User Switcher in Demo Bar */}
          {DEMO_MODE && (
            <div className="relative shrink-0">
              {isLoggedIn && currentUser ? (
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition-colors text-[10px] sm:text-xs cursor-pointer whitespace-nowrap"
                >
                  <span className="text-slate-400 hidden sm:inline">کاربر فعال:</span>
                  <span className="font-semibold text-blue-300 max-w-[65px] sm:max-w-[150px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition-colors text-[10px] sm:text-xs font-bold cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <LogIn className="w-3 h-3 shrink-0" />
                  <span>ورود به سامانه</span>
                </button>
              )}

              {roleDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in zoom-in-95 font-sans" dir="rtl">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>تغییر سریع حساب کاربری (دمو)</span>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto py-1">
                    {INITIAL_USERS.map(u => (
                      <button
                        key={u.id}
                        onClick={() => handleUserSelect(u.id)}
                        className={`w-full text-right px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between transition-colors ${
                          currentUser?.id === u.id ? 'bg-blue-50/80 font-bold text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=60"}
                            alt={u.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div>{u.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {roleLabels[u.role]?.label || u.role}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {roleLabels[u.role]?.label || u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4 w-full box-border">
        {/* Brand Logo */}
        <Link 
          to="/"
          className="flex items-center gap-1.5 sm:gap-2.5 group shrink min-w-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white/20" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-sm sm:text-lg lg:text-xl tracking-tight text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
              <span className="truncate">همرا کلینیک</span>
              <span className="text-[9px] sm:text-[10px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full tracking-wider hidden sm:inline-block">
                HEMERA CLINIC
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block truncate">
              سیستم جامع سلامت و نوبت‌دهی پلتفرم HEMERA
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links (Visible on Extra Large Screens) */}
        <nav className="hidden xl:flex items-center gap-1 xl:gap-2">
          <Link
            to="/"
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              isCurrentPathActive('/')
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            صفحه اصلی
          </Link>

          <Link
            to="/doctors"
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              isCurrentPathActive('/doctors')
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            پزشکان
          </Link>

          <Link
            to="/branches"
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              isCurrentPathActive('/branches') || isCurrentPathActive('/nearest-branch')
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            مراکز
          </Link>

          <Link
            to="/specialties"
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              isCurrentPathActive('/specialties')
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            تخصص‌ها
          </Link>

          <Link
            to="/services"
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              isCurrentPathActive('/services')
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            پاراکلینیک
          </Link>

          {/* Desktop More Menu Dropdown for Telemedicine & Health Magazine */}
          <div className="relative">
            <button
              onClick={() => setDesktopMoreMenuOpen(!desktopMoreMenuOpen)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                isCurrentPathActive('/telemedicine') || isCurrentPathActive('/health')
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <span>سایر بخش‌ها</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${desktopMoreMenuOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
            </button>

            {desktopMoreMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 text-slate-800 z-50 animate-in fade-in zoom-in-95 font-sans"
                dir="rtl"
              >
                <Link
                  to="/telemedicine"
                  onClick={() => setDesktopMoreMenuOpen(false)}
                  className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    isCurrentPathActive('/telemedicine') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-4 h-4 text-blue-600" />
                  <div>
                    <div>مشاوره آنلاین پزشکی</div>
                    <div className="text-[10px] text-slate-400 font-normal">ویزیت تصویری و متنی ۲۴ ساعته</div>
                  </div>
                </Link>

                <Link
                  to="/health"
                  onClick={() => setDesktopMoreMenuOpen(false)}
                  className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    isCurrentPathActive('/health') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Newspaper className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div>مجله سلامت و تندرستی</div>
                    <div className="text-[10px] text-slate-400 font-normal">مقالات علمی و راهنماهای پزشکی</div>
                  </div>
                </Link>

                <div className="border-t border-slate-100 my-1"></div>

                <Link
                  to="/clinic-branding"
                  onClick={() => setDesktopMoreMenuOpen(false)}
                  className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    isCurrentPathActive('/clinic-branding') ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>برندینگ و توسعه کلینیک</span>
                      <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-bold">ویژه مراکز</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">هویت بصری، ساب‌دامنه همرا و CRM</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Patient Portal Tab if patient is logged in */}
          {isLoggedIn && currentUser && currentUser.role === 'patient' && (
            <Link
              to="/patient"
              className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/patient')
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>پرونده من</span>
            </Link>
          )}
        </nav>

        {/* Actions & User Section */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Insurance Finder Quick Button - Desktop/Tablet only */}
          <button
            onClick={() => setInsuranceModalOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="راهنمای پزشکان و شعب بر اساس بیمه شما"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>راهنمای بیمه</span>
          </button>

          {/* User Profile / Portal Menu Button */}
          {isLoggedIn && currentUser ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-900 text-xs font-bold px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer border border-slate-200/80 whitespace-nowrap"
              >
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80"}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-300 shrink-0"
                />
                <span className="max-w-[45px] min-[360px]:max-w-[65px] sm:max-w-[120px] truncate text-[10px] sm:text-xs">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in zoom-in-95 font-sans" 
                  dir="rtl"
                >
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                    <div className="text-xs text-blue-600 font-semibold mt-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{roleLabels[currentUser.role]?.label || currentUser.role}</span>
                    </div>
                  </div>

                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate(getRoleDefaultPath(currentUser.role));
                      }}
                      className="w-full text-right px-3 py-2 text-xs font-semibold hover:bg-blue-50 text-blue-900 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                        <span>ورود به پرتال اختصاصی</span>
                      </span>
                      <ChevronDown className="w-3 h-3 -rotate-90 text-blue-400" />
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="w-full text-right px-3 py-2 text-xs font-semibold hover:bg-slate-50 text-slate-700 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-500" />
                      <span>تغییر پرتال یا کاربر</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-3 py-2 text-xs font-semibold hover:bg-rose-50 text-rose-700 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>خروج از حساب</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-bold px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md shrink-0 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">ورود / عضویت</span>
              <span className="sm:hidden text-[11px]">ورود</span>
            </button>
          )}

          {/* Book Appointment CTA Button */}
          <button
            id="header-book-appointment-btn"
            type="button"
            onClick={() => {
              if (onOpenBookingModal) {
                onOpenBookingModal();
              } else {
                navigate('/doctors');
              }
            }}
            className="inline-flex items-center gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] sm:text-xs font-bold px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-emerald-600/20 cursor-pointer shrink-0 whitespace-nowrap"
            title="دریافت نوبت اینترنتی"
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">دریافت نوبت</span>
            <span className="sm:hidden">نوبت</span>
          </button>

          {/* Mobile & Tablet Menu Toggle Button (Specialized for Smartphone Users) */}
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`xl:hidden relative min-w-[42px] min-h-[42px] p-2 sm:px-3 sm:py-2 rounded-xl cursor-pointer shrink-0 transition-all duration-200 border flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs select-none ${
              mobileMenuOpen
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm ring-2 ring-rose-200/60'
                : 'bg-slate-50/90 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border-slate-200/90 hover:border-blue-200'
            }`}
            aria-label={mobileMenuOpen ? 'بستن منوی ناوبری' : 'باز کردن منوی ناوبری و خدمات کلینیک'}
            aria-expanded={mobileMenuOpen}
            title={mobileMenuOpen ? 'بستن منو' : 'منوی ناوبری و دسترسی سریع به بخش‌های کلینیک'}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-rose-600 transition-transform duration-200 rotate-90" />
            ) : (
              <>
                <Menu className="w-5 h-5 text-slate-800 transition-transform duration-200" />
                {/* Mobile Active Clinic / Pulse Dot */}
                <span className="sm:hidden absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
                </span>
              </>
            )}
            <span className="hidden sm:inline text-xs font-bold text-slate-800">
              {mobileMenuOpen ? 'بستن' : 'منو'}
            </span>
          </button>
        </div>
      </div>

      {/* Hidden Global File Input for Mobile & Desktop Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Accessible Mobile Hamburger Drawer */}
      <MobileHamburgerDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenBookingModal={onOpenBookingModal}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
      />

      {/* Profile Photo Upload / Edit Modal (Mobile & Desktop) */}
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
        doctors={doctors}
      />
    </header>
  );
};
