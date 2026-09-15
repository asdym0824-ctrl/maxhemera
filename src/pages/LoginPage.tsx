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
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { MedicalVectorPattern } from '../components/common/medicalPattern/MedicalVectorPattern';
import { bookingIntentService } from '../services/bookingIntentService';
import { formatToPersianDate } from '../utils/dateUtils';
import { INITIAL_USERS } from '../data/mockData';
import { User, UserRole } from '../types';

type LoginTab = 'otp' | 'password' | 'roles';

export const LoginPage: React.FC<{ onSuccess?: (user: User) => void }> = ({ onSuccess }) => {
  const { loginWithPhone, loginWithPassword, loginAsUser, getRoleDefaultPath, isLoggedIn, currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const returnUrl = searchParams.get('returnUrl');
  const pendingIntent = bookingIntentService.get();
  const effectiveReturnUrl = returnUrl || pendingIntent?.returnUrl;
  const isFromDoctorSite = effectiveReturnUrl && (effectiveReturnUrl.startsWith('/site/') || effectiveReturnUrl.startsWith('/dr/') || effectiveReturnUrl.startsWith('/doctor/'));

  // Active Login Mode Tab
  const [activeTab, setActiveTab] = useState<LoginTab>('otp');

  // OTP State
  const [phone, setPhone] = useState('09123334455');
  const [nationalCode, setNationalCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone');
  const [resendTimer, setResendTimer] = useState(119);
  const [canResend, setCanResend] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const registrationPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('لطفاً یک فایل تصویری معتبر (JPG، PNG، WebP) انتخاب فرمایید.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('حداکثر حجم تصویر ۵ مگابایت است.');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  // Password / Medical Staff State
  const [staffIdentifier, setStaffIdentifier] = useState('09123334455');
  const [staffPassword, setStaffPassword] = useState('******');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // General Form States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Resend Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpStep === 'verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpStep, resendTimer]);

  // Clean phone helper
  const cleanPhone = (p: string) => {
    return p
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/\s+/g, '')
      .replace(/[-+()]/g, '')
      .trim();
  };

  // Identify user in real-time as phone number is typed
  const detectedUser = INITIAL_USERS.find(u => cleanPhone(u.phone) === cleanPhone(phone));

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normalized = cleanPhone(phone);
    if (!normalized.startsWith('09') || normalized.length !== 11) {
      setErrorMessage('لطفاً یک شماره همراه معتبر ۱۱ رقمی (شروع با ۰۹) وارد فرمایید.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpStep('verify');
      setResendTimer(119);
      setCanResend(false);
      setOtp('123456'); // auto-fill friendly test code
      setSuccessMessage('کد تأیید ۶ رقمی به شماره همراه شما پیامک شد.');
    }, 400);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otp.length < 5) {
      setErrorMessage('لطفاً کد تأیید ۶ رقمی را به صورت کامل وارد نمایید.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithPhone(phone, otp, fullName, nationalCode, avatarUrl || undefined);
      setIsLoading(false);
      setSuccessMessage(`خوش آمدید ${result.user.name}`);

      setTimeout(() => {
        if (effectiveReturnUrl) {
          navigate(effectiveReturnUrl, { replace: true });
        } else if (onSuccess) {
          onSuccess(result.user);
        } else {
          navigate(result.redirectPath, { replace: true });
        }
      }, 300);
    } catch {
      setIsLoading(false);
      setErrorMessage('خطا در احراز هویت. لطفاً مجدداً تلاش نمایید.');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!staffIdentifier.trim()) {
      setErrorMessage('لطفاً کد نظام پزشکی، شماره همراه یا نام کاربری سازمانی را وارد نمایید.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithPassword(staffIdentifier, staffPassword);
      setIsLoading(false);

      if (result.success) {
        setSuccessMessage(`احراز هویت موفق: خوش آمدید ${result.user.name}`);
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

  const handleResendCode = () => {
    if (!canResend) return;
    setResendTimer(119);
    setCanResend(false);
    setOtp('123456');
    setSuccessMessage('کد تأیید جدید مجدداً ارسال گردید.');
  };

  // Group demo users by categories
  const doctorsList = INITIAL_USERS.filter(u => u.role === 'doctor');
  const patientUser = INITIAL_USERS.find(u => u.role === 'patient');
  const secretaryUser = INITIAL_USERS.find(u => u.role === 'secretary');
  const managerUser = INITIAL_USERS.find(u => u.role === 'clinic_manager');
  const adminUser = INITIAL_USERS.find(u => u.role === 'super_admin');

  return (
    <div className="max-w-3xl mx-auto my-6 sm:my-10 px-3 sm:px-4 font-sans text-right" dir="rtl">
      
      {/* Top Breadcrumb & Return Option */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
          <span>صفحه اصلی سایت کلینیک</span>
        </Link>
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>درگاه ورود امن SSL-256</span>
        </span>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Pending Booking Intent Banner */}
        {pendingIntent && (
          <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white p-4 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>رزرو فعال نوبت: {pendingIntent.doctorName || 'پزشک متخصص'}</span>
              </span>
              {effectiveReturnUrl && (
                <button 
                  onClick={() => {
                    bookingIntentService.clear();
                    navigate(effectiveReturnUrl);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                >
                  انصراف از رزرو
                </button>
              )}
            </div>
            <p className="text-blue-50 text-xs">
              تاریخ: <strong>{formatToPersianDate(pendingIntent.selectedDate)}</strong> • ساعت: <strong>{pendingIntent.selectedTimeSlot}</strong>
              <br />
              پس از ورود، نوبت به صورت خودکار در پرونده درمانی شما نهایی و ثبت خواهد شد.
            </p>
          </div>
        )}

        {/* Protected Route Redirect Notice */}
        {!pendingIntent && effectiveReturnUrl && (
          <div className="bg-amber-50 border-b border-amber-200 p-3.5 text-xs text-amber-900 flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>جهت دسترسی به این بخش، لطفاً ابتدا وارد حساب کاربری خود شوید.</span>
            </span>
            <Link to="/" className="text-amber-800 underline text-xs font-bold">
              انصراف
            </Link>
          </div>
        )}

        {/* Header Branding Area */}
        <div className="relative overflow-hidden p-6 sm:p-8 text-center space-y-2 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <MedicalVectorPattern opacity={0.038} variant="colored" patternId="login-med-pattern" />
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
            <Heart className="w-7 h-7 fill-white/20" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              سامانه یکپارچه همرا کلینیک
            </h1>
            <span className="text-xs font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
              HEMERA CLINIC
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            درگاه احراز هویت بیماران، پزشکان متخصص، پرسنل پذیرش و مدیریت کلینیک پلتفرم HEMERA
          </p>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setActiveTab('otp');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'otp'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">ورود با پیامک (OTP)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('password');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">ورود کادر درمان</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('roles');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">پرتال‌های دمو</span>
            </button>
          </div>
        </div>

        {/* Form Body Area */}
        <div className="p-6 sm:p-8">
          
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 1: OTP PHONE LOGIN / REGISTRATION */}
          {/* ==================================================== */}
          {activeTab === 'otp' && (
            <div>
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-xs text-slate-700">شماره تلفن همراه:</label>
                      <span className="text-[11px] text-slate-400">کد تأیید ارسال خواهد شد</span>
                    </div>
                    <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white rounded-2xl px-3.5 py-3 transition-colors">
                      <Phone className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        className="w-full bg-transparent outline-hidden font-mono font-bold text-slate-900 text-sm"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Real-time Phone Recognition Card */}
                  {detectedUser ? (
                    <div className="p-3 bg-blue-50/80 border border-blue-200/90 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={detectedUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                          alt={detectedUser.name}
                          className="w-8 h-8 rounded-full object-cover border border-blue-300 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-blue-950">{detectedUser.name}</div>
                          <div className="text-[10px] text-blue-700">
                            حساب شناخته‌شده: {detectedUser.role === 'doctor' ? 'پزشک متخصص' : detectedUser.role === 'secretary' ? 'منشی و پذیرش' : detectedUser.role === 'clinic_manager' ? 'مدیر کلینیک' : detectedUser.role === 'super_admin' ? 'مدیریت کلان' : 'بیمار کلینیک'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-1 rounded-lg border border-blue-200 shrink-0">
                        ورود سریع
                      </span>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setIsNewPatient(!isNewPatient)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isNewPatient ? '− عدم ثبت مشخصات تکمیلی' : '+ اولین بار است مراجعه می‌کنید؟ (ثبت‌نام بیمار جدید)'}</span>
                      </button>

                      {isNewPatient && (
                        <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">نام و نام خانوادگی:</label>
                            <input
                              type="text"
                              value={fullName}
                              onChange={e => setFullName(e.target.value)}
                              placeholder="مثال: سارا رضایی"
                              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-800 outline-hidden"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">کد ملی (اختیاری جهت استعلام بیمه):</label>
                            <input
                              type="text"
                              maxLength={10}
                              value={nationalCode}
                              onChange={e => setNationalCode(e.target.value)}
                              placeholder="۰۰۱۲۳۴۵۶۷۸"
                              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-hidden"
                              dir="ltr"
                            />
                          </div>

                          {/* Profile Avatar Upload */}
                          <div className="space-y-2 pt-2 border-t border-slate-200/80">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                <Camera className="w-3.5 h-3.5 text-blue-600" />
                                تصویر پروفایل کاربر جدید:
                              </label>
                              <span className="text-[10px] text-slate-400">اختیاری</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Avatar Preview */}
                              <div className="relative shrink-0">
                                <img
                                  src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                                  alt="پیش‌نمایش پروفایل"
                                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-xs bg-white"
                                />
                                {avatarUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setAvatarUrl('')}
                                    title="حذف تصویر"
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[9px] hover:bg-rose-700 cursor-pointer shadow-xs"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>

                              {/* Upload Trigger Button & File Input */}
                              <div className="flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => photoInputRef.current?.click()}
                                  className="w-full py-2 px-3 border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{avatarUrl ? 'تغییر فایل تصویر' : 'بارگذاری عکس از سیستم'}</span>
                                </button>
                                <input
                                  type="file"
                                  ref={photoInputRef}
                                  onChange={handlePhotoUpload}
                                  accept="image/*"
                                  className="hidden"
                                />
                              </div>
                            </div>

                            {/* Preset Avatars for Fast Selection */}
                            <div className="pt-1.5">
                              <span className="text-[10px] text-slate-500 block mb-1.5">یا انتخاب آواتار پیش‌فرض:</span>
                              <div className="flex items-center gap-2">
                                {registrationPresets.map((preset, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setAvatarUrl(preset)}
                                    className={`relative rounded-full p-0.5 border-2 transition-all hover:scale-105 cursor-pointer ${
                                      avatarUrl === preset ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-transparent'
                                    }`}
                                  >
                                    <img
                                      src={preset}
                                      alt={`آواتار ${idx + 1}`}
                                      className="w-7 h-7 rounded-full object-cover"
                                    />
                                    {avatarUrl === preset && (
                                      <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white rounded-full p-0.5">
                                        <Check className="w-2 h-2" />
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                    type="submit"
                    icon={<ArrowLeft className="w-4 h-4" />}
                  >
                    دریافت کد تأیید پیامکی
                  </Button>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    با ورود یا عضویت، قوانین و مقررات محرمانگی سوابق درمانی همرا کلینیک را می‌پذیرید.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-100 text-blue-900 text-center space-y-1">
                    <p className="text-xs">
                      کد تأیید ۶ رقمی به شماره <strong>{phone}</strong> ارسال گردید.
                    </p>
                    <div className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-bold bg-white px-2.5 py-0.5 rounded-md border border-blue-200 mt-1">
                      <span>کد تأیید تست: </span>
                      <strong className="font-mono text-xs">123456</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-xs text-slate-700">کد تأیید ۶ رقمی:</label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep('phone');
                          setErrorMessage(null);
                        }}
                        className="text-xs text-blue-600 hover:underline cursor-pointer"
                      >
                        ویرایش شماره ({phone})
                      </button>
                    </div>

                    <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white rounded-2xl px-3.5 py-3 transition-colors">
                      <KeyRound className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-transparent outline-hidden font-mono font-black text-center text-2xl tracking-[0.4em] text-slate-900"
                        dir="ltr"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Resend Timer */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {canResend ? (
                        <button
                          type="button"
                          onClick={handleResendCode}
                          className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer underline"
                        >
                          ارسال مجدد کد پیامکی
                        </button>
                      ) : (
                        <span>زمان باقی‌مانده تا ارسال مجدد: <strong className="font-mono text-slate-700">{formatTimer(resendTimer)}</strong></span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setOtp('123456')}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      تکمیل خودکار کد تستی
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                    type="submit"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    {pendingIntent 
                      ? 'تأیید و ثبت نهایی رزرو نوبت' 
                      : isFromDoctorSite 
                      ? 'ورود و انتقال به وبسایت پزشک' 
                      : detectedUser?.role === 'doctor'
                      ? `ورود به پرتال ${detectedUser.name}`
                      : 'تأیید و ورود به پرتال'}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: MEDICAL STAFF & PASSWORD LOGIN */}
          {/* ==================================================== */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 text-xs text-indigo-950 flex items-center gap-3">
                <Stethoscope className="w-5 h-5 text-indigo-600 shrink-0" />
                <p className="leading-relaxed">
                  ویژه پزشکان متخصص کلینیک، پرسنل پذیرش، منشی‌ها و مدیریت سیستم.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-xs text-slate-700">کد نظام پزشکی، شماره همراه یا نام کاربری:</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white rounded-2xl px-3.5 py-3 transition-colors">
                  <UserIcon className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
                  <input
                    type="text"
                    required
                    value={staffIdentifier}
                    onChange={e => setStaffIdentifier(e.target.value)}
                    placeholder="مثال: ۰۹۱۲۳۳۳۴۴۵۵ یا کد نظام پزشکی"
                    className="w-full bg-transparent outline-hidden text-slate-900 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-slate-700">کلمه عبور سازمانی:</label>
                  <button
                    type="button"
                    onClick={() => alert('جهت بازیابی رمز عبور سازمانی، با واحد فناوری اطلاعات کلینیک تماس حاصل فرمایید: ۰۲۱-۸۸۹۹۰۰۰۰')}
                    className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                  >
                    فراموشی رمز عبور؟
                  </button>
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white rounded-2xl px-3.5 py-3 transition-colors">
                  <Lock className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={staffPassword}
                    onChange={e => setStaffPassword(e.target.value)}
                    placeholder="کلمه عبور خود را وارد کنید"
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

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>مرا در این دستگاه به خاطر بسپار</span>
                </label>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                isLoading={isLoading}
                type="submit"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                ورود به پنل کادر درمان
              </Button>
            </form>
          )}

          {/* ==================================================== */}
          {/* TAB 3: QUICK DEMO ROLES SELECTION */}
          {/* ==================================================== */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              
              {/* Section 1: Doctors */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span>پرتال پزشکان متخصص (صف ویزیت و مطب دیجیتال)</span>
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                    /doctor
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctorsList.map(docUser => (
                    <button
                      key={docUser.id}
                      type="button"
                      onClick={() => handleQuickLogin(docUser)}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-right group cursor-pointer shadow-2xs hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={docUser.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"}
                          alt={docUser.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:border-blue-400 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700">
                            {docUser.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            تلفن: {docUser.phone}
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Patient */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                    <span>پرتال بیماران (پرونده من، نوبت‌ها و سوابق)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    /patient
                  </span>
                </div>

                {patientUser && (
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(patientUser)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-right group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={patientUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                        alt={patientUser.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:border-emerald-400 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700">
                          {patientUser.name} (بیمار کلینیک)
                        </div>
                        <div className="text-[10px] text-slate-400">
                          مشاهده نوبت‌های فعال، آزمایش‌ها و سوابق دارویی
                        </div>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:-translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              {/* Section 3: Operations & Staff */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>کادر درمان، پذیرش و مدیریت کلینیک</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {secretaryUser && (
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(secretaryUser)}
                      className="flex flex-col justify-between p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all text-right group cursor-pointer shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-xs text-indigo-900 group-hover:text-indigo-700 mb-0.5">
                          میزکار منشی و پذیرش
                        </div>
                        <div className="text-[10px] text-slate-400 mb-2">
                          {secretaryUser.name}
                        </div>
                      </div>
                      <div className="text-[10px] font-semibold text-indigo-600 flex items-center gap-1">
                        <span>ورود به /secretary</span>
                        <ChevronLeft className="w-3 h-3" />
                      </div>
                    </button>
                  )}

                  {managerUser && (
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(managerUser)}
                      className="flex flex-col justify-between p-3 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all text-right group cursor-pointer shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-xs text-purple-900 group-hover:text-purple-700 mb-0.5">
                          مدیریت کلینیک و شعب
                        </div>
                        <div className="text-[10px] text-slate-400 mb-2">
                          {managerUser.name}
                        </div>
                      </div>
                      <div className="text-[10px] font-semibold text-purple-600 flex items-center gap-1">
                        <span>ورود به /clinic</span>
                        <ChevronLeft className="w-3 h-3" />
                      </div>
                    </button>
                  )}

                  {adminUser && (
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(adminUser)}
                      className="flex flex-col justify-between p-3 rounded-2xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/40 transition-all text-right group cursor-pointer shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-xs text-rose-900 group-hover:text-rose-700 mb-0.5">
                          سوپر ادمین سیستم
                        </div>
                        <div className="text-[10px] text-slate-400 mb-2">
                          مدیریت کلان و امنیت
                        </div>
                      </div>
                      <div className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                        <span>ورود به /admin</span>
                        <ChevronLeft className="w-3 h-3" />
                      </div>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Security & Support Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>اطلاعات پزشکی مطابق با استانداردهای نظام پزشکی کشور رمزنگاری می‌شود.</span>
          </div>
          <div className="text-slate-400">
            پشتیبانی: ۰۲۱-۸۸۹۹۰۰۰۰
          </div>
        </div>

      </div>

    </div>
  );
};
export default LoginPage;
