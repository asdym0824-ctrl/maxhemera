import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Appointment, MedicalRecord, FamilyMember } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { getRelativeISODate, formatToPersianDate } from '../utils/dateUtils';
import { 
  Calendar, 
  FileText, 
  Users, 
  Pill, 
  Activity,
  Camera,
  Upload,
  Check,
  Sparkles,
  Clock,
  ChevronLeft,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  PhoneCall,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  TestTube,
  FileCheck2,
  Heart,
  Info,
  Building2,
  Plus
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { HealthTimeline } from '../components/patient/HealthTimeline';
import { FamilyHealthManager } from '../components/patient/FamilyHealthManager';
import { SmartQueueWidget } from '../components/patient/SmartQueueWidget';
import { MedicalVectorPattern } from '../components/common/medicalPattern/MedicalVectorPattern';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
];

export const PatientDashboardPage: React.FC<{ onNavigateToDoctors: () => void }> = ({ onNavigateToDoctors }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getActiveTab = () => {
    if (location.pathname.endsWith('/appointments')) return 'appointments';
    if (location.pathname.endsWith('/records')) return 'records';
    if (location.pathname.endsWith('/family')) return 'family';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: 'home' | 'appointments' | 'records' | 'family') => {
    if (tab === 'home') navigate('/patient');
    else navigate(`/patient/${tab}`);
  };

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    document.title = 'پرونده و نوبت‌های بیمار | همرا کلینیک';
    if (currentUser) {
      Promise.all([
        apiService.getAppointmentsByPatient(currentUser.id),
        apiService.getPatientMedicalRecords(currentUser.id),
        apiService.getFamilyMembers(currentUser.id)
      ]).then(([apps, recs, fams]) => {
        setAppointments(apps);
        setRecords(recs);
        setFamilyMembers(fams);
      });
    }
  }, [currentUser]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('لطفاً یک فایل تصویری (JPG، PNG، WebP) انتخاب فرمایید.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حداکثر حجم تصویر ۵ مگابایت است.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await updateCurrentUser({ avatar: base64 });
      setIsUploading(false);
      setAvatarSuccessMsg(true);
      setTimeout(() => setAvatarSuccessMsg(false), 3500);
      setIsAvatarModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = async (presetUrl: string) => {
    setIsUploading(true);
    await updateCurrentUser({ avatar: presetUrl });
    setIsUploading(false);
    setAvatarSuccessMsg(true);
    setTimeout(() => setAvatarSuccessMsg(false), 3500);
    setIsAvatarModalOpen(false);
  };

  const handleCheckIn = async (appId: string) => {
    await apiService.updateAppointmentStatus(appId, 'arrived');
    setAppointments(prev =>
      prev.map(a => (a.id === appId ? { ...a, status: 'arrived' } : a))
    );
  };

  const handleAddFamilyMember = async (newFam: Omit<FamilyMember, 'id'>) => {
    const created = await apiService.addFamilyMember(newFam);
    setFamilyMembers(prev => [...prev, created]);
  };

  const todayIso = getRelativeISODate(0);
  const todayAppointment = appointments.find(
    a => a.date === todayIso && ['scheduled', 'arrived', 'waiting', 'in_visit'].includes(a.status)
  );

  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled');
  const nextAppointment = upcomingAppointments[0];

  const activeMedications = records.flatMap(r => (r.medications || []).map(m => ({
    ...m,
    doctorName: r.doctorName,
    date: r.date
  })));

  const followUps = records.filter(r => r.type === 'followup' || r.title.includes('پیگیری') || r.summary.includes('پیگیری'));

  const navItems = [
    { id: 'home', label: 'داشبورد اصلی', icon: <Activity className="w-4 h-4" /> },
    { id: 'appointments', label: 'نوبت‌های من', count: appointments.length, icon: <Calendar className="w-4 h-4" /> },
    { id: 'records', label: 'پرونده الکترونیک', count: records.length, icon: <FileText className="w-4 h-4" /> },
    { id: 'family', label: 'اعضای خانواده', count: familyMembers.length, icon: <Users className="w-4 h-4" /> }
  ];

  const patientHealthId = currentUser?.nationalId 
    ? `IR-EHR-${currentUser.nationalId}` 
    : `IR-HC-${(currentUser?.name?.length || 5) * 1482}`;

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-12 font-sans" dir="rtl">
      
      {/* Top Mobile Pill Navigation (High usability on mobile) */}
      <div className="lg:hidden bg-white rounded-2xl border border-slate-200/90 p-1.5 shadow-xs sticky top-16 z-20 backdrop-blur-md bg-white/95">
        <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold text-center">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as any)}
              className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Patient Sidebar (Desktop Persistent & Mobile Enhanced) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs text-center relative group">
            {/* Avatar Container with Upload overlay */}
            <div className="relative w-22 h-22 sm:w-24 sm:h-24 mx-auto">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                alt={currentUser?.name || 'کاربر'}
                className="w-22 h-22 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-blue-600 shadow-md transition-all duration-300 group-hover:opacity-95"
              />
              
              {/* Online status indicator */}
              <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="آنلاین در پرتال" />

              {/* Camera Upload Action Button */}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                title="بارگذاری و تغییر عکس پروفایل"
                className="absolute -bottom-1 -right-1 p-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full shadow-lg border-2 border-white transition-all cursor-pointer flex items-center justify-center"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Hidden Direct File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">{currentUser?.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{currentUser?.phone}</p>
              
              {/* Clinical ID Pill */}
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[10px] font-mono px-2.5 py-1 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  <span>{patientHealthId}</span>
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                <Badge variant="blue" size="sm">بیمه تامین اجتماعی فعال</Badge>
                <Badge variant="emerald" size="sm">پرونده سلامت معتبر</Badge>
              </div>
              
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="mt-3 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>ویرایش تصویر پروفایل</span>
              </button>

              {avatarSuccessMsg && (
                <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 py-1.5 px-2.5 rounded-xl font-medium flex items-center justify-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تصویر پروفایل با موفقیت به‌روزرسانی شد</span>
                </div>
              )}
            </div>

            {/* Quick Profile Health Stats */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-right text-[11px]">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">گروه خونی:</span>
                <span className="font-bold text-slate-800 text-xs">O مثبت (O+)</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px]">حساسیت دارویی:</span>
                <span className="font-bold text-rose-600 text-xs truncate block">پنی‌سیلین</span>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar Nav */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/80 p-3 space-y-1.5 text-xs font-medium shadow-2xs">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Clinic Emergency Support Card */}
          <div className="hidden sm:block bg-gradient-to-br from-blue-50/80 to-indigo-50/60 rounded-2xl border border-blue-100 p-4 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-950">
              <PhoneCall className="w-4 h-4 text-blue-600" />
              <span>پشتیبانی شبانه‌روزی کلینیک</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              در صورت نیاز به راهنمایی در نوبت‌دهی یا اورژانس درمانی، با شماره مستقیم کلینیک تماس حاصل فرمایید.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-blue-700">
              <span className="font-mono text-xs">۰۲۱ - ۸۸۹۹ ۱۲۳۴</span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-blue-200">داخلی پذیرش</span>
            </div>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="lg:col-span-3 space-y-5 sm:space-y-6">
          
          {/* TAB 1: DASHBOARD MAIN OVERVIEW */}
          {activeTab === 'home' && (
            <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
              
              {/* Premium Clinical Hero Welcome Banner */}
              <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800">
                <MedicalVectorPattern opacity={0.045} variant="light" patternId="patient-hero-pattern" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-400/20">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>پرتال تخصصی پرونده الکترونیک سلامت همرا</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
                      <span>سلام، {currentUser?.name} عزیز</span>
                      <span className="text-sm font-normal text-slate-300 hidden md:inline">| روزتان سرشار از سلامتی</span>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      خلاصه وضعیت درمانی، نوبت‌های فعال، پایش صف ویزیت و نسخه‌های دارویی شما در این داشبورد به‌صورت لحظه‌ای در دسترس است.
                    </p>

                    {/* Status Highlights */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-300">
                      <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                        <Building2 className="w-3 h-3 text-blue-400" />
                        <span>شعبه مرکزی: سعادت‌آباد</span>
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>احراز هویت پیامکی تأییدشده</span>
                      </span>
                    </div>
                  </div>

                  {/* Call to Action Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={onNavigateToDoctors}
                      icon={<Calendar className="w-4 h-4" />}
                      className="shadow-lg shadow-blue-600/30 font-bold py-3 text-xs sm:text-sm cursor-pointer"
                    >
                      رزرو نوبت پزشک متخصص
                    </Button>
                  </div>
                </div>
              </div>

              {/* 4 VITAL HEALTH METRIC CARDS (Bento Grid) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                
                {/* 1. Upcoming Appointments */}
                <div 
                  onClick={() => handleTabChange('appointments')}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{upcomingAppointments.length}</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">نوبت‌های رزرو شده</div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    {nextAppointment ? `نزدیک‌ترین: ${formatToPersianDate(nextAppointment.date)}` : 'بدون نوبت پیش‌رو'}
                  </div>
                </div>

                {/* 2. Active Medications */}
                <div 
                  onClick={() => {
                    const el = document.getElementById('medications-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Pill className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 transition-colors" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{activeMedications.length}</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">داروهای تجویزی</div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    {activeMedications.length > 0 ? 'با برنامه مصرف فعال' : 'بدون داروی ثبت‌شده'}
                  </div>
                </div>

                {/* 3. Medical Records & Labs */}
                <div 
                  onClick={() => handleTabChange('records')}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{records.length}</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">سوابق پرونده</div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    شامل ویزیت، آزمایش، تصویر
                  </div>
                </div>

                {/* 4. Family Members */}
                <div 
                  onClick={() => handleTabChange('family')}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{familyMembers.length}</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">اعضای خانواده</div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    پرونده‌های تحت تکفل
                  </div>
                </div>

              </div>

              {/* QUICK CLINICAL ACTIONS BAR */}
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 sm:p-4">
                <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-blue-600" />
                  <span>دسترسی سریع به خدمات درمانی:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    onClick={onNavigateToDoctors}
                    className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center gap-2 text-slate-800 transition-all cursor-pointer font-medium"
                  >
                    <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">نوبت‌دهی آنلاین</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('records')}
                    className="p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center gap-2 text-slate-800 transition-all cursor-pointer font-medium"
                  >
                    <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">نسخه‌های الکترونیک</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('records')}
                    className="p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center gap-2 text-slate-800 transition-all cursor-pointer font-medium"
                  >
                    <TestTube className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="truncate">جواب آزمایشگاه</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('family')}
                    className="p-2.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl flex items-center gap-2 text-slate-800 transition-all cursor-pointer font-medium"
                  >
                    <Plus className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="truncate">افزودن بستگان</span>
                  </button>
                </div>
              </div>

              {/* SMART QUEUE / TODAY APPOINTMENT WIDGET */}
              {todayAppointment ? (
                <SmartQueueWidget appointment={todayAppointment} onCheckIn={handleCheckIn} />
              ) : nextAppointment ? (
                /* Next Upcoming Appointment Feature Card */
                <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white rounded-2xl border border-blue-200/90 p-4 sm:p-5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={nextAppointment.doctorAvatar} 
                        alt={nextAppointment.doctorName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-xs" 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md">
                            نوبت آینده شما
                          </span>
                          <span className="text-xs text-slate-500 font-mono">کد رهگیری: {nextAppointment.trackingCode}</span>
                        </div>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1">
                          ویزیت با {nextAppointment.doctorName} ({nextAppointment.doctorSpecialty})
                        </h4>
                        <div className="text-xs text-blue-800 font-semibold mt-0.5">
                          تاریخ: {formatToPersianDate(nextAppointment.date)} • ساعت {nextAppointment.timeSlot} • شعبه {nextAppointment.clinicAddress}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTabChange('appointments')}
                        className="text-xs w-full sm:w-auto cursor-pointer"
                      >
                        جزئیات نوبت
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* DUAL SECTION: MEDICATIONS & CARE FOLLOW-UPS */}
              <div id="medications-section" className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                
                {/* Active Medications Schedule */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-sky-600" />
                      <span>داروهای تجویزی فعال و نحوه مصرف:</span>
                    </h3>
                    <Badge variant={activeMedications.length > 0 ? 'blue' : 'slate'} size="sm">
                      {activeMedications.length > 0 ? `${activeMedications.length} قلم دارو` : 'بدون نسخه فعال'}
                    </Badge>
                  </div>

                  {activeMedications.length > 0 ? (
                    <div className="space-y-2.5 text-xs">
                      {activeMedications.map((med, i) => (
                        <div key={i} className="bg-slate-50/90 hover:bg-slate-50 p-3 rounded-xl border border-slate-200/70 transition-colors space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                              <span>{med.name}</span>
                              {med.dosage && (
                                <span className="text-[11px] font-normal text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                                  {med.dosage}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                              {med.duration || 'دوره جاری'}
                            </span>
                          </div>
                          
                          <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>دوز مصرف: <strong>{med.frequency}</strong></span>
                          </div>

                          <div className="text-[10px] text-slate-400 pt-0.5">
                            تجویز شده توسط {med.doctorName} • تاریخ: {med.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50/70 rounded-xl border border-slate-100 text-center space-y-1 text-slate-500 text-xs">
                      <Pill className="w-6 h-6 text-slate-400 mx-auto" />
                      <p>هیچ داروی تجویزی فعالی در پرونده سلامت شما ثبت نشده است.</p>
                      <p className="text-[10px] text-slate-400">پس از ویزیت پزشک، نسخه‌ها به‌طور خودکار در اینجا قرار می‌گیرند.</p>
                    </div>
                  )}
                </div>

                {/* Follow-up Tasks & Care Recommendations */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span>پیگیری‌های درمانی و توصیه‌های پزشک:</span>
                    </h3>
                    <Badge variant={followUps.length > 0 ? 'blue' : 'slate'} size="sm">
                      {followUps.length > 0 ? `${followUps.length} مورد معوق` : 'بروز و بدون پیگیری'}
                    </Badge>
                  </div>

                  {followUps.length > 0 ? (
                    <div className="text-xs space-y-2.5">
                      {followUps.map((fu, i) => (
                        <div key={`fu-${i}`} className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-blue-950 space-y-1">
                          <div className="font-bold flex items-center justify-between">
                            <span>{fu.title}</span>
                            <span className="text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">پیگیری الزامی</span>
                          </div>
                          <div className="text-slate-600 leading-relaxed">{fu.summary}</div>
                          <div className="text-[10px] text-slate-400 pt-0.5">پزشک معالج: {fu.doctorName}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50/70 rounded-xl border border-slate-100 text-center space-y-1 text-slate-500 text-xs">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                      <p className="font-semibold text-slate-700">وضعیت پیگیری‌های بالینی شما منظم است.</p>
                      <p className="text-[10px] text-slate-400">هیچ آزمایش یا مراقبت معوقه‌ای برای شما ثبت نشده است.</p>
                    </div>
                  )}

                  {/* General Clinic Tip */}
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      کلیه نسخه‌های الکترونیک کلینیک به‌صورت آنلاین در سامانه‌های تامین اجتماعی و سلامت استعلام‌پذیر هستند.
                    </p>
                  </div>
                </div>

              </div>

              {/* RECENT TIMELINE PREVIEW SECTION */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>آخرین سوابق و وقایع ثبت‌شده در پرونده الکترونیک</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">مراجعات، تشخیص‌ها، گزارش آزمایش و تصویربرداری</p>
                  </div>
                  <button
                    onClick={() => handleTabChange('records')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>مشاهده کل پرونده</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <HealthTimeline records={records.slice(0, 2)} />
              </div>

            </div>
          )}

          {/* TAB 2: ALL APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 space-y-5 shadow-xs animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">نوبت‌های رزرو شده و تاریخچه ویزیت‌ها</h3>
                  <p className="text-xs text-slate-500">لیست تمامی نوبت‌های آینده و سوابق مراجعات حضوری و آنلاین</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onNavigateToDoctors}
                  icon={<Calendar className="w-4 h-4" />}
                  className="cursor-pointer"
                >
                  رزرو نوبت جدید
                </Button>
              </div>

              {appointments.length > 0 ? (
                <div className="space-y-3.5">
                  {appointments.map(app => (
                    <div 
                      key={app.id} 
                      className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-white hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <img 
                          src={app.doctorAvatar} 
                          alt={app.doctorName} 
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm sm:text-base">{app.doctorName}</div>
                          <div className="text-slate-500 text-[11px]">{app.doctorSpecialty}</div>
                          <div className="text-blue-700 font-semibold mt-1 flex items-center gap-2 flex-wrap text-[11px]">
                            <span>تاریخ: <strong>{formatToPersianDate(app.date)}</strong></span>
                            <span>•</span>
                            <span>ساعت: <strong>{app.timeSlot}</strong></span>
                            {app.clinicAddress && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500">{app.clinicAddress}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Badge variant={app.status === 'completed' ? 'slate' : app.status === 'arrived' ? 'emerald' : 'blue'}>
                          {app.status === 'completed' ? 'تکمیل شده' : app.status === 'arrived' ? 'پذیرش شده' : 'رزرو قطعی'}
                        </Badge>
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          کد: {app.trackingCode}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="text-slate-600 text-sm font-semibold">شما هیچ نوبت فعالی در سیستم ندارید.</div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onNavigateToDoctors}
                    className="mx-auto"
                  >
                    دریافت اولین نوبت ویزیت
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FULL MEDICAL RECORDS */}
          {activeTab === 'records' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs animate-in fade-in duration-200">
              <HealthTimeline records={records} />
            </div>
          )}

          {/* TAB 4: FAMILY MEMBERS MANAGER */}
          {activeTab === 'family' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs animate-in fade-in duration-200">
              <FamilyHealthManager members={familyMembers} onAddMember={handleAddFamilyMember} />
            </div>
          )}

        </div>
      </div>

      {/* Avatar Upload / Selection Modal */}
      <Modal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        title="ویرایش و بارگذاری تصویر پروفایل"
      >
        <div className="space-y-6 text-slate-800">
          {/* Current Profile Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                alt={currentUser?.name || 'کاربر'}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
              />
              <span className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full border-2 border-white">
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-3">
              <p className="font-bold text-sm text-slate-900">{currentUser?.name}</p>
              <p className="text-xs text-slate-500">{currentUser?.phone}</p>
            </div>
          </div>

          {/* Upload From Device Dropzone */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-600" />
              بارگذاری عکس از گالری یا رایانه:
            </label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-colors">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-blue-700 hover:underline">کلیک کنید یا تصویر را اینجا رها فرمایید</span>
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
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative rounded-2xl p-1 border-2 transition-all hover:scale-105 cursor-pointer ${
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
              icon={<Upload className="w-4 h-4" />}
              isLoading={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              انتخاب عکس جدید
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

