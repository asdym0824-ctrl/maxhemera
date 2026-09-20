import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Phone, 
  Lock, 
  CheckCircle2, 
  Heart, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Stethoscope, 
  User as UserIcon, 
  ClipboardList, 
  Building2, 
  ShieldAlert, 
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Check,
  AlertCircle,
  HelpCircle,
  FileText,
  BadgeCheck,
  ArrowRightLeft,
  ChevronLeft,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  Activity,
  Layers,
  FileSpreadsheet,
  Headset,
  CheckCircle,
  Zap,
  Info,
  Calendar,
  CreditCard,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { MedicalVectorPattern } from '../components/common/medicalPattern/MedicalVectorPattern';
import { bookingIntentService } from '../services/bookingIntentService';
import { formatToPersianDate } from '../utils/dateUtils';
import { INITIAL_USERS, MOCK_DOCTORS } from '../data/mockData';
import { User, UserRole } from '../types';

type LoginTab = 'password' | 'register' | 'roles';

export const LoginPage: React.FC<{ onSuccess?: (user: User) => void }> = ({ onSuccess }) => {
  const { loginWithPassword, registerUser, loginAsUser, getRoleDefaultPath, isLoggedIn, currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const returnUrl = searchParams.get('returnUrl');
  const pendingIntent = bookingIntentService.get();
  const effectiveReturnUrl = returnUrl || pendingIntent?.returnUrl;
  const isFromDoctorSite = effectiveReturnUrl && (effectiveReturnUrl.startsWith('/site/') || effectiveReturnUrl.startsWith('/dr/') || effectiveReturnUrl.startsWith('/doctor/'));

  // Active Login Mode Tab: default to password login
  const [activeTab, setActiveTab] = useState<LoginTab>('password');

  // Selected Portal Category for Tab 3
  const [selectedPortalCategory, setSelectedPortalCategory] = useState<'all' | 'patient' | 'doctor' | 'staff'>('all');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('09121112233');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotHelp, setShowForgotHelp] = useState(false);

  // Register Form State (for new users who set up their password)
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regNationalCode, setRegNationalCode] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // General Form States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clean phone helper
  const cleanPhone = (p: string) => {
    return p
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/\s+/g, '')
      .replace(/[-+()]/g, '')
      .trim();
  };

  // Real-time detected user for quick hints
  const detectedUser = INITIAL_USERS.find(u => cleanPhone(u.phone) === cleanPhone(loginIdentifier) || u.id === loginIdentifier);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      setErrorMessage('لطفاً شماره همراه یا کد ملی خود را وارد نمایید.');
      return;
    }

    if (!loginPassword.trim()) {
      setErrorMessage('لطفاً رمز عبور خود را وارد نمایید.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithPassword(cleanId, loginPassword);
      setIsLoading(false);

      if (result.success) {
        setSuccessMessage(`ورود موفق: خوش آمدید ${result.user.name}`);
        setTimeout(() => {
          if (effectiveReturnUrl) {
            navigate(effectiveReturnUrl, { replace: true });
          } else if (onSuccess) {
            onSuccess(result.user);
          } else {
            navigate(result.redirectPath, { replace: true });
          }
        }, 300);
      } else {
        setErrorMessage(result.error || 'اطلاعات ورود اشتباه است.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('خطا در برقراری ارتباط با سرور احراز هویت.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regFullName.trim()) {
      setErrorMessage('لطفاً نام و نام خانوادگی خود را وارد نمایید.');
      return;
    }

    const cleanNumber = cleanPhone(regPhone);
    if (!cleanNumber.startsWith('09') || cleanNumber.length !== 11) {
      setErrorMessage('شماره همراه باید ۱۱ رقم و با ۰۹ شروع شود.');
      return;
    }

    if (!regPassword || regPassword.trim().length < 4) {
      setErrorMessage('رمز عبور باید حداقل ۴ کاراکتر باشد.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('تکرار رمز عبور با رمز عبور انتخابی مطابقت ندارد.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerUser({
        name: regFullName.trim(),
        phone: cleanNumber,
        nationalId: regNationalCode.trim() || undefined,
        password: regPassword.trim()
      });
      setIsLoading(false);

      if (result.success) {
        setSuccessMessage(`حساب کاربری شما با موفقیت ایجاد شد: خوش آمدید ${result.user.name}`);
        setTimeout(() => {
          if (effectiveReturnUrl) {
            navigate(effectiveReturnUrl, { replace: true });
          } else if (onSuccess) {
            onSuccess(result.user);
          } else {
            navigate(result.redirectPath, { replace: true });
          }
        }, 300);
      } else {
        setErrorMessage(result.error || 'خطا در ثبت‌نام حساب کاربری.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('خطا در ایجاد حساب کاربری.');
    }
  };

  const handleQuickLogin = (user: User) => {
    const result = loginAsUser(user);
    if (effectiveReturnUrl) {
      navigate(effectiveReturnUrl, { replace: true });
    } else if (onSuccess) {
      onSuccess(result.user);
    } else {
      navigate(result.redirectPath, { replace: true });
    }
  };

  // Group demo users by categories
  const doctorsList = INITIAL_USERS.filter(u => u.role === 'doctor');
  const patientUser = INITIAL_USERS.find(u => u.role === 'patient');
  const secretaryUser = INITIAL_USERS.find(u => u.role === 'secretary' || u.role === 'reception');
  const managerUser = INITIAL_USERS.find(u => u.role === 'clinic_manager');
  const adminUser = INITIAL_USERS.find(u => u.role === 'super_admin');

  return (
    <div className="w-full max-w-4xl mx-auto my-0.5 sm:my-8 px-0 sm:px-6 font-sans text-right" dir="rtl">
      
      {/* Top Breadcrumb & Return Option */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 sm:mb-3 px-1">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-medium transition-colors bg-white/90 py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-xl border border-slate-200/80 shadow-2xs text-[11px] sm:text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5 rotate-180 text-blue-600 shrink-0" />
          <span>صفحه اصلی</span>
          <span className="hidden sm:inline">کلینیک</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            سامانه آنلاین پرونده الکترونیک
          </span>
          <span className="flex items-center gap-1 text-slate-500 bg-white/90 py-1 px-2 sm:px-2.5 rounded-lg sm:rounded-xl border border-slate-200/80 text-[10px] sm:text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-mono font-bold">SSL-256</span>
          </span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm sm:shadow-xl shadow-slate-200/50 overflow-hidden backdrop-blur-xs">
        
        {/* Pending Booking Intent Banner */}
        {pendingIntent && (
          <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white p-3 sm:p-5 text-xs space-y-1.5 sm:space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="leading-tight">در حال نهایی‌سازی رزرو نوبت: {pendingIntent.doctorName || 'پزشک متخصص'}</span>
              </span>
              {effectiveReturnUrl && (
                <button 
                  onClick={() => {
                    bookingIntentService.clear();
                    navigate(effectiveReturnUrl);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  انصراف
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-blue-50 text-[10px] sm:text-xs bg-black/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl">
              <span>تاریخ: <strong>{formatToPersianDate(pendingIntent.selectedDate)}</strong></span>
              <span>ساعت: <strong>{pendingIntent.selectedTimeSlot}</strong></span>
              <span className="text-blue-100/80 text-[10px] sm:text-[11px] hidden xs:inline">پس از ورود، نوبت در پرونده شما نهایی می‌شود.</span>
            </div>
          </div>
        )}

        {/* Protected Route Redirect Notice */}
        {!pendingIntent && effectiveReturnUrl && (
          <div className="bg-amber-50 border-b border-amber-200 p-2.5 sm:p-3.5 text-xs text-amber-900 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-[11px] sm:text-xs">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 shrink-0" />
              <span>جهت دسترسی به پرتال، لطفاً ابتدا وارد حساب خود شوید.</span>
            </span>
            <Link to="/" className="text-amber-800 hover:text-amber-950 underline text-[11px] sm:text-xs font-bold shrink-0">
              انصراف
            </Link>
          </div>
        )}

        {/* Header Clinical Branding Area */}
        <div className="relative overflow-hidden p-3.5 sm:p-8 text-center space-y-2 sm:space-y-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/90 via-blue-50/20 to-white">
          <MedicalVectorPattern opacity={0.035} variant="colored" patternId="login-med-pattern-v2" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md sm:shadow-lg shadow-blue-500/25 mb-1.5 sm:mb-3 ring-4 ring-blue-50">
              <Heart className="w-5 h-5 sm:w-8 sm:h-8 fill-white/20" />
            </div>

            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-base sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                <span className="sm:hidden">ورود به پرتال همرا کلینیک</span>
                <span className="hidden sm:inline">سامانه یکپارچه و پرتال درمانی همرا کلینیک</span>
              </h1>
              <span className="text-[9px] sm:text-[11px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                HEMERA PORTAL
              </span>
            </div>

            <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed mt-0.5 sm:mt-1">
              درگاه تخصصی احراز هویت بیماران، مطب دیجیتال پزشکان و کادر کلینیک
            </p>

            {/* Quick Status Highlights */}
            <div className="mt-2 sm:mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-slate-200">
                <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                <span>پرونده سلامت یکپارچه</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-slate-200">
                <FileSpreadsheet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                <span>نسخه‌نویسی الکترونیک</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-slate-200">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />
                <span>صف زنده ویزیت</span>
              </span>
            </div>
          </div>
        </div>

        {/* Specialized Tabs Bar */}
        <div className="px-2 sm:px-8 pt-2.5 sm:pt-4 pb-2 bg-slate-50/50 border-b border-slate-100">
          <div className="grid grid-cols-3 gap-1 sm:gap-2 bg-slate-200/80 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setActiveTab('password');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 sm:py-3 px-1 sm:px-2 rounded-lg sm:rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
                activeTab === 'password'
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
              <span className="text-[10px] sm:text-xs leading-tight">
                <span className="sm:hidden">ورود با رمز</span>
                <span className="hidden sm:inline">ورود با رمز عبور</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 sm:py-3 px-1 sm:px-2 rounded-lg sm:rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
                activeTab === 'register'
                  ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span className="text-[10px] sm:text-xs leading-tight">
                <span className="sm:hidden">ثبت‌نام جدید</span>
                <span className="hidden sm:inline">ثبت‌نام کاربر جدید</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('roles');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 sm:py-3 px-1 sm:px-2 rounded-lg sm:rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
                activeTab === 'roles'
                  ? 'bg-white text-purple-700 shadow-sm ring-1 ring-slate-200'
                  : 'hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 shrink-0" />
              <span className="text-[10px] sm:text-xs leading-tight">
                <span className="sm:hidden">پرتال‌ها</span>
                <span className="hidden sm:inline">پرتال‌های تخصصی (دمو)</span>
              </span>
            </button>
          </div>
        </div>

        {/* Form Body Area */}
        <div className="p-3 sm:p-8">
          
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="leading-relaxed font-medium">{successMessage}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 1: PASSWORD LOGIN (FOR ALL USERS) */}
          {/* ==================================================== */}
          {activeTab === 'password' && (
            <div className="max-w-md mx-auto">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-100 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 text-xs text-blue-950 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed text-[11px] sm:text-xs">
                    <strong className="block font-bold text-blue-900 mb-0.5">ورود امن با رمز عبور</strong>
                    جهت دسترسی به نوبت‌ها و پرونده سلامت، شماره موبایل یا کد ملی و رمز عبور خود را وارد کنید. بدون نیاز به انتظار برای پیامک.
                  </div>
                </div>

                {/* Identifier Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-slate-700">شماره موبایل یا کدملی:</label>
                    <span className="text-[10px] sm:text-[11px] text-slate-400">فرمت: ۰۹۱۲۳۴۵۶۷۸۹ یا کدملی</span>
                  </div>
                  <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-blue-500/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all">
                    <Phone className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                      placeholder="۰۹۱۲۱۱۱۲۲۳۳"
                      className="w-full bg-transparent outline-hidden font-mono font-bold text-slate-900 text-sm tracking-wider"
                      dir="ltr"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Real-time recognized user card if phone matches */}
                {detectedUser && (
                  <div className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2.5 text-xs animate-in fade-in shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={detectedUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                        alt={detectedUser.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-blue-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-blue-950 text-xs flex items-center gap-1.5 truncate">
                          <span>{detectedUser.name}</span>
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        </div>
                        <div className="text-[10px] text-blue-700 font-medium truncate">
                          نقش: {detectedUser.role === 'doctor' ? 'پزشک متخصص' : detectedUser.role === 'patient' ? 'بیمار ثبت‌شده' : 'کادر کلینیک'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(detectedUser)}
                      className="text-xs font-bold text-blue-700 bg-white hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg border border-blue-200 transition-all shrink-0 cursor-pointer shadow-2xs"
                    >
                      ورود فوری
                    </button>
                  </div>
                )}

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-slate-700">رمز عبور:</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotHelp(prev => !prev)}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer font-medium"
                    >
                      فراموشی رمز عبور؟
                    </button>
                  </div>
                  <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-blue-500/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all">
                    <Lock className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="رمز عبور خود را وارد نمایید"
                      className="w-full bg-transparent outline-hidden font-mono text-slate-900 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer mr-2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {showForgotHelp && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1 animate-in fade-in">
                    <div className="font-bold flex items-center gap-1.5">
                      <Headset className="w-4 h-4 text-blue-600" />
                      <span>راهنمای ورود و بازیابی رمز عبور:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-blue-800">
                      اگر رمز عبور خود را به یاد ندارید، یا برای اولین بار است که به کلینیک مراجعه می‌کنید، می‌توانید از برگه «ثبت‌نام کاربر جدید» به صورت آنی رمز دلخواه خود را تعیین نمایید یا با پشتیبانی کلینیک با شماره <strong>۰۲۱-۸۸۹۹۰۰۰۰</strong> تماس بگیرید.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>مرا به خاطر بسپار</span>
                  </label>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 cursor-pointer"
                  isLoading={isLoading}
                  type="submit"
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  {pendingIntent 
                    ? 'ورود و نهایی‌سازی رزرو نوبت' 
                    : isFromDoctorSite 
                    ? 'ورود و بازگشت به مطب پزشک' 
                    : 'ورود به حساب کاربری'}
                </Button>

                {/* Callout to switch to register tab */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                  <span>حساب کاربری ندارید یا کاربر جدید هستید؟</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>ثبت‌نام کاربر جدید و تعیین رمز</span>
                  </button>
                </div>

                {/* Demo Quick Login Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] text-slate-500 font-bold block">ورود سریع به حساب‌های نمونه:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        if (patientUser) handleQuickLogin(patientUser);
                      }}
                      className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-900 text-right transition-all cursor-pointer"
                    >
                      <div className="font-bold text-[11px]">امیرحسین رضایی</div>
                      <div className="text-[9px] text-blue-700">بیمار کلینیک (دمو)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const doc = doctorsList[0];
                        if (doc) handleQuickLogin(doc);
                      }}
                      className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 text-right transition-all cursor-pointer"
                    >
                      <div className="font-bold text-[11px]">دکتر مریم حسینی</div>
                      <div className="text-[9px] text-indigo-700">پزشک قلب و عروق</div>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: REGISTER NEW USER (NAME + PHONE + PASSWORD) */}
          {/* ==================================================== */}
          {activeTab === 'register' && (
            <div className="max-w-md mx-auto">
              <form onSubmit={handleRegister} className="space-y-3.5 sm:space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                  <UserPlus className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed text-[11px] sm:text-xs">
                    <strong className="block font-bold text-emerald-900 mb-0.5">ثبت‌نام مستقیم و آنی کاربر جدید</strong>
                    مشخصات خود را تکمیل کرده و رمز دلخواه خود را تعیین کنید. برای مراجعات بعدی با همین شماره و رمز عبور خود وارد خواهید شد.
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">نام و نام خانوادگی:</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-emerald-500/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 transition-all">
                    <UserIcon className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="مثال: نرگس محمدی"
                      className="w-full bg-transparent outline-hidden text-slate-900 text-xs font-semibold"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-slate-700">شماره تلفن همراه:</label>
                    <span className="text-[10px] text-slate-400">۱۱ رقمی با ۰۹</span>
                  </div>
                  <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-emerald-500/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 transition-all">
                    <Phone className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      className="w-full bg-transparent outline-hidden font-mono font-bold text-slate-900 text-xs tracking-wider"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* National Code (Optional) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">کد ملی ۱۰ رقمی:</label>
                    <span className="text-[10px] text-slate-400">اختیاری (جهت تشکیل پرونده سلامت)</span>
                  </div>
                  <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-emerald-500/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 transition-all">
                    <CreditCard className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
                    <input
                      type="text"
                      maxLength={10}
                      value={regNationalCode}
                      onChange={e => setRegNationalCode(e.target.value)}
                      placeholder="۰۰۱۲۳۴۵۶۷۸"
                      className="w-full bg-transparent outline-hidden font-mono text-slate-900 text-xs tracking-widest"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Password Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">کلمه عبور انتخابی:</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-emerald-500/10 rounded-xl px-3 py-2 transition-all">
                      <Lock className="w-3.5 h-3.5 text-slate-400 ml-2 shrink-0" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="حداقل ۴ کاراکتر"
                        className="w-full bg-transparent outline-hidden font-mono text-slate-900 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">تکرار کلمه عبور:</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-emerald-500/10 rounded-xl px-3 py-2 transition-all">
                      <Lock className="w-3.5 h-3.5 text-slate-400 ml-2 shrink-0" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder="تکرار رمز عبور"
                        className="w-full bg-transparent outline-hidden font-mono text-slate-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer mr-1.5"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 cursor-pointer"
                  isLoading={isLoading}
                  type="submit"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  ثبت‌نام و ورود به سامانه
                </Button>

                {/* Callout to switch back to login */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                  <span>قبلاً در سامانه ثبت‌نام کرده‌اید؟</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('password');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>ورود با شماره و رمز عبور</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: DEDICATED CLINICAL PORTALS GATEWAY (پرتال‌ها) */}
          {/* ==================================================== */}
          {activeTab === 'roles' && (
            <div className="space-y-4 sm:space-y-6">
              
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 border-b border-slate-100 text-xs scrollbar-none">
                <span className="text-slate-400 text-[11px] sm:text-xs font-bold pl-1.5 sm:pl-2 shrink-0">فیلتر پرتال:</span>
                {[
                  { id: 'all', label: 'تمام پرتال‌ها' },
                  { id: 'patient', label: 'پرونده بیماران' },
                  { id: 'doctor', label: 'مطب پزشکان' },
                  { id: 'staff', label: 'پذیرش و مدیریت' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedPortalCategory(cat.id as any)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-bold transition-all shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                      selectedPortalCategory === cat.id
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of Specialized Portals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

                {/* 1. PORTAL: PATIENT HEALTH RECORD */}
                {(selectedPortalCategory === 'all' || selectedPortalCategory === 'patient') && (
                  <div className="bg-gradient-to-br from-white to-emerald-50/40 rounded-xl sm:rounded-2xl border border-emerald-200/90 p-3.5 sm:p-5 flex flex-col justify-between hover:shadow-md transition-all shadow-2xs">
                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-black text-xs sm:text-sm text-slate-900 truncate">پرتال بیماران و مراجعین</h3>
                            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold block truncate">پرونده الکترونیک سلامت (EHR)</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 sm:px-2 py-0.5 rounded-lg border border-emerald-200 shrink-0">
                          /patient
                        </span>
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        دسترسی مستقیم به نوبت‌های فعال، سوابق نسخ الکترونیک تامین اجتماعی، جواب آزمایش و تصویربرداری و پیگیری پرونده سلامت.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-600 pt-0.5 sm:pt-1">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>نوبت‌های رزرو شده من</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>سوابق ویزیت و دارویی</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>گزارش آزمایشگاه</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>استعلام پوشش بیمه‌ای</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 sm:pt-4 mt-2.5 sm:mt-3 border-t border-emerald-100">
                      {patientUser ? (
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(patientUser)}
                          className="w-full flex items-center justify-between p-2 sm:p-2.5 bg-white hover:bg-emerald-600 hover:text-white rounded-xl border border-emerald-300 text-emerald-900 transition-all cursor-pointer group shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={patientUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                              alt={patientUser.name}
                              className="w-7 h-7 rounded-full object-cover border border-emerald-400 shrink-0"
                            />
                            <div className="text-right min-w-0">
                              <span className="font-bold text-xs block truncate">{patientUser.name}</span>
                              <span className="text-[10px] text-slate-400 group-hover:text-emerald-100 block truncate">بیمار تستی نمونه</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold flex items-center gap-1 shrink-0">
                            <span>ورود مستقیم</span>
                            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveTab('password')}
                          className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                          ورود بیمار با رمز عبور
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. PORTAL: FRONT DESK & RECEPTION */}
                {(selectedPortalCategory === 'all' || selectedPortalCategory === 'staff') && (
                  <div className="bg-gradient-to-br from-white to-indigo-50/40 rounded-xl sm:rounded-2xl border border-indigo-200/90 p-3.5 sm:p-5 flex flex-col justify-between hover:shadow-md transition-all shadow-2xs">
                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <Headset className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-black text-xs sm:text-sm text-slate-900 truncate">میزکار منشی و پذیرش</h3>
                            <span className="text-[10px] sm:text-[11px] text-indigo-700 font-semibold block truncate">Front-Desk & Reception</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-1.5 sm:px-2 py-0.5 rounded-lg border border-indigo-200 shrink-0">
                          /secretary
                        </span>
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        مدیریت صف حضوری مطب‌ها، باجه نوبت‌دهی تلفنی، چاپ قبض پذیرش، صدور صورتحساب صندوق و تنظیم تقویم پزشکان کلینیک.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-600 pt-0.5 sm:pt-1">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>پذیرش سریع مراجعین</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>مدیریت صف سالن انتظار</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>صندوق و دریافت ویزیت</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>تقویم شیفت پزشکان</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 sm:pt-4 mt-2.5 sm:mt-3 border-t border-indigo-100">
                      {secretaryUser ? (
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(secretaryUser)}
                          className="w-full flex items-center justify-between p-2 sm:p-2.5 bg-white hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-300 text-indigo-900 transition-all cursor-pointer group shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={secretaryUser.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"}
                              alt={secretaryUser.name}
                              className="w-7 h-7 rounded-full object-cover border border-indigo-400 shrink-0"
                            />
                            <div className="text-right min-w-0">
                              <span className="font-bold text-xs block truncate">{secretaryUser.name}</span>
                              <span className="text-[10px] text-slate-400 group-hover:text-indigo-100 block truncate">مسئول پذیرش و نوبت‌دهی</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold flex items-center gap-1 shrink-0">
                            <span>ورود به میزکار</span>
                            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveTab('password')}
                          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          ورود کادر پذیرش
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. PORTAL: CLINIC MANAGEMENT & MULTI-BRANCH */}
                {(selectedPortalCategory === 'all' || selectedPortalCategory === 'staff') && (
                  <div className="bg-gradient-to-br from-white to-purple-50/40 rounded-xl sm:rounded-2xl border border-purple-200/90 p-3.5 sm:p-5 flex flex-col justify-between hover:shadow-md transition-all shadow-2xs">
                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-black text-xs sm:text-sm text-slate-900 truncate">مدیریت کلینیک و شعب</h3>
                            <span className="text-[10px] sm:text-[11px] text-purple-700 font-semibold block truncate">Clinic Management & Admin</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-1.5 sm:px-2 py-0.5 rounded-lg border border-purple-200">
                            /clinic
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-1.5 sm:px-2 py-0.5 rounded-lg border border-rose-200">
                            /admin
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        داشبورد مالی و درآمد کلینیک، نظارت لحظه‌ای بر شعب سعادت‌آباد و نیاوران، آمار مراجعین، مدیریت پرسنل و دسترسی‌های کلان.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-600 pt-0.5 sm:pt-1">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>گزارش درآمد و تراکنش‌ها</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>نظارت زنده بر شعب</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>مدیریت قرارداد پزشکان</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>امنیت و لاگ‌های سیستمی</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 sm:pt-4 mt-2.5 sm:mt-3 border-t border-purple-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {managerUser && (
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(managerUser)}
                          className="flex-1 py-2 sm:py-2.5 px-3 bg-white hover:bg-purple-600 hover:text-white rounded-xl border border-purple-300 text-purple-900 transition-all cursor-pointer font-bold text-xs text-center shadow-2xs"
                        >
                          ورود مدیر کلینیک
                        </button>
                      )}
                      {adminUser && (
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(adminUser)}
                          className="flex-1 py-2 sm:py-2.5 px-3 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl border border-rose-300 text-rose-900 transition-all cursor-pointer font-bold text-xs text-center shadow-2xs"
                        >
                          سوپر ادمین سیستم
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. PORTAL: SPECIALIST DOCTORS PRACTICE */}
                {(selectedPortalCategory === 'all' || selectedPortalCategory === 'doctor') && (
                  <div className="bg-gradient-to-br from-white to-blue-50/40 rounded-xl sm:rounded-2xl border border-blue-200/90 p-3.5 sm:p-5 flex flex-col justify-between hover:shadow-md transition-all shadow-2xs md:col-span-2">
                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-black text-xs sm:text-sm text-slate-900 truncate">پرتال پزشکان متخصص (مطب دیجیتال)</h3>
                            <span className="text-[10px] sm:text-[11px] text-blue-700 font-semibold block truncate">Specialist Doctors EMR Suite</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 rounded-lg border border-blue-200 shrink-0">
                          /doctor
                        </span>
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed max-w-2xl">
                        کارتابل بالینی، ثبت نسخه الکترونیک تامین اجتماعی و سلامت، مشاهده آزمایش‌های متصل، صف هوشمند بیماران در اتاق معاینه و دستیار هوشمند ویزیت.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-1.5 sm:gap-x-4 sm:gap-y-2 text-[10px] sm:text-[11px] text-slate-600 pt-0.5 sm:pt-1">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>صف زنده سالن انتظار</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>نسخه الکترونیک بیمه</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>مشاوره آنلاین تصویری</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>دستیار هوش مصنوعی بالینی</span>
                        </span>
                      </div>
                    </div>

                    {/* Specialist Doctor Profiles List for Instant One-Click Login */}
                    <div className="pt-3 sm:pt-4 mt-2.5 sm:mt-3 border-t border-blue-100">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-700 block mb-2">
                        انتخاب مطب پزشک متخصص جهت ورود فوری به دمو:
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                        {doctorsList.map(docUser => {
                          const docMeta = MOCK_DOCTORS.find(d => d.id === docUser.doctorId);
                          return (
                            <button
                              key={docUser.id}
                              type="button"
                              onClick={() => handleQuickLogin(docUser)}
                              className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/60 transition-all text-right group cursor-pointer shadow-2xs"
                            >
                              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                                <img
                                  src={docUser.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"}
                                  alt={docUser.name}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl object-cover border border-slate-200 group-hover:border-blue-400 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                                    {docUser.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {docMeta ? docMeta.specialtyName : 'پزشک متخصص'} • نظام: {docMeta?.medicalCouncilNumber || '۴۸۱۲۵'}
                                  </div>
                                </div>
                              </div>
                              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-transform shrink-0 mr-1" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

        {/* Security & Support Footer */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-slate-50 via-slate-100/60 to-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-center sm:text-right">
          <div className="flex items-center gap-2 text-slate-600 justify-center sm:justify-start">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
            <span className="leading-relaxed text-[10px] sm:text-xs">
              تمامی سوابق بالینی و نسخ الکترونیک طبق استاندارد امنیت داده‌های پزشکی رمزنگاری و ثبت می‌گردد.
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs shrink-0">
            <span className="text-slate-400">پشتیبانی انفورماتیک:</span>
            <a href="tel:02188990000" className="font-mono font-bold text-blue-700 hover:underline dir-ltr">
              ۰۲۱-۸۸۹۹۰۰۰۰
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
export default LoginPage;
