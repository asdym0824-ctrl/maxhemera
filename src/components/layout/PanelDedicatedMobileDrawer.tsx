import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, 
  ChevronLeft, 
  Building2, 
  Users, 
  Stethoscope, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Clock, 
  Sparkles, 
  Zap, 
  BarChart3, 
  ShieldAlert, 
  DollarSign, 
  Globe, 
  Activity, 
  PhoneCall, 
  Video, 
  UserCheck, 
  Home, 
  LogOut, 
  ExternalLink, 
  PieChart, 
  Camera,
  Heart,
  CalendarDays,
  ShieldCheck,
  Send,
  Sliders,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type PanelType = 'clinic' | 'doctor' | 'secretary' | 'patient' | 'admin';

interface PanelDedicatedMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  panelType: PanelType;
  onOpenAvatarModal?: () => void;
}

export const PanelDedicatedMobileDrawer: React.FC<PanelDedicatedMobileDrawerProps> = ({
  isOpen,
  onClose,
  panelType,
  onOpenAvatarModal
}) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  // Content configuration per panel
  const renderPanelContent = () => {
    switch (panelType) {
      case 'clinic': {
        const searchParams = new URLSearchParams(location.search);
        const currentTab = searchParams.get('tab') || 'overview';

        return (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 bg-gradient-to-l from-purple-950 via-purple-900 to-slate-950 text-white shrink-0 border-b border-purple-800/60 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-200 shadow-xs shrink-0">
                    <Building2 className="w-5 h-5 text-purple-200" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
                      مرکز عملیات و مدیریت کلینیک
                    </h2>
                    <span className="text-[11px] text-purple-300/90 font-medium truncate block">
                      {currentUser?.name || 'مدیر درمانگاه'} • شعبه مرکزی سعادت‌آباد
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90 shrink-0"
                  aria-label="بستن منو"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Status Pill */}
              <div className="flex items-center justify-between text-xs bg-purple-900/50 border border-purple-700/40 rounded-xl px-3 py-2">
                <span className="flex items-center gap-1.5 text-purple-200 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  پایش زنده و آماده‌باش عملیاتی
                </span>
                <span className="text-[10px] bg-purple-800/80 text-purple-200 px-2 py-0.5 rounded-full font-bold">
                  نسخه 2.5
                </span>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
              {/* Quick AI Advisor Action */}
              <div 
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('synapse_open_clinic_quick_action'));
                  const el = document.getElementById('clinic-ai-advisor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-l from-purple-50 via-indigo-50/70 to-purple-50/40 border border-purple-200/80 hover:border-purple-400 shadow-xs cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-purple-950 flex items-center gap-1.5">
                      مشاور هوشمند مدیریت کلینیک
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-300">
                        هوش مصنوعی
                      </span>
                    </h3>
                    <p className="text-[11px] text-purple-700/90 mt-0.5">
                      پیشنهادات بهینه‌سازی شیفت و تحلیل راندمان
                    </p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-purple-400 group-hover:translate-x-[-2px] transition-transform" />
              </div>

              {/* Navigation Sections */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 px-1">ماژول‌ها و بخش‌های کلینیک</h4>
                <div className="space-y-1.5">
                  {[
                    {
                      id: 'overview',
                      title: 'پایش عملیات و شاخص‌ها',
                      sub: 'داشبورد جامع، راندمان شعب و مراجعین',
                      path: '/clinic?tab=overview',
                      icon: <BarChart3 className="w-4 h-4" />,
                      color: 'bg-purple-100 text-purple-700'
                    },
                    {
                      id: 'staff',
                      title: 'کادر درمان، پزشکان و شیفت‌ها',
                      sub: 'مدیریت پزشکان، منشی‌ها و ساعات حضور',
                      path: '/clinic?tab=staff',
                      icon: <Users className="w-4 h-4" />,
                      color: 'bg-blue-100 text-blue-700'
                    },
                    {
                      id: 'tasks',
                      title: 'کارتابل وظایف درمانگاه',
                      sub: 'چک‌لیست‌ها، تسک‌های اداری و عملیاتی',
                      path: '/clinic?tab=tasks',
                      icon: <CheckSquare className="w-4 h-4" />,
                      color: 'bg-emerald-100 text-emerald-700'
                    },
                    {
                      id: 'automations',
                      title: 'قواعد و اتوماسیون هوشمند',
                      sub: 'پیامک یادآوری، تریاژ خودکار و رویدادها',
                      path: '/clinic?tab=automations',
                      icon: <Zap className="w-4 h-4" />,
                      color: 'bg-amber-100 text-amber-700'
                    },
                    {
                      id: 'branding',
                      title: 'برندینگ و ساب‌دامنه پزشکان',
                      sub: 'طراحی سایت اختصاصی و هویت بصری',
                      path: '/clinic?tab=branding',
                      icon: <Globe className="w-4 h-4" />,
                      color: 'bg-cyan-100 text-cyan-700'
                    },
                    {
                      id: 'audit',
                      title: 'لاگ و گزارش حسابرسی',
                      sub: 'ردیابی امنیت، ورودها و تغییرات داده',
                      path: '/clinic?tab=audit',
                      icon: <Activity className="w-4 h-4" />,
                      color: 'bg-rose-100 text-rose-700'
                    }
                  ].map(item => {
                    const isActive = location.pathname === '/clinic' && currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-right ${
                          isActive 
                            ? 'bg-purple-50 text-purple-900 font-bold border border-purple-300 shadow-2xs' 
                            : 'hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                            {item.icon}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold block">{item.title}</span>
                            <span className="text-[11px] text-slate-400 font-normal block">{item.sub}</span>
                          </div>
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Features & Development */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 px-1">سایر خدمات کلینیک</h4>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/clinic-branding')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer text-right text-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold block">پرتال جامع برندینگ پزشکان</span>
                        <span className="text-[11px] text-slate-400 block">مشاهده طرح‌ها و پکیج‌های توسعه مطب</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/90 shrink-0 space-y-2">
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-purple-900 hover:bg-purple-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-purple-600" />
                مشاهده وب‌سایت عمومی درمانگاه
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                خروج از حساب کاربری
              </button>
            </div>
          </div>
        );
      }

      case 'doctor': {
        const searchParams = new URLSearchParams(location.search);
        const currentTab = searchParams.get('tab') || 'clinical';

        return (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 bg-gradient-to-l from-slate-950 via-slate-900 to-blue-950 text-white shrink-0 border-b border-blue-900/60 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-200 shadow-xs shrink-0">
                    <Stethoscope className="w-5 h-5 text-blue-200" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
                      میزکار و پرتال بالینی پزشک
                    </h2>
                    <span className="text-[11px] text-blue-300/90 font-medium truncate block">
                      {currentUser?.name || 'پزشک محترم'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90 shrink-0"
                  aria-label="بستن منو"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Pill */}
              <div className="flex items-center justify-between text-xs bg-slate-900/70 border border-slate-700/60 rounded-xl px-3 py-2">
                <span className="flex items-center gap-1.5 text-blue-200 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  پذیرش و ویزیت بالینی فعال
                </span>
                <span className="text-[10px] bg-blue-900/90 text-blue-200 px-2 py-0.5 rounded-full font-bold">
                  اتاق معاینه
                </span>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
              {/* Quick Doctor Profile Card */}
              {currentUser?.avatar && (
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-xs"
                    />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{currentUser.name}</h4>
                      <p className="text-[11px] text-slate-500">پزشک معالج درمانگاه</p>
                    </div>
                  </div>
                  {onOpenAvatarModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAvatarModal();
                      }}
                      className="text-[11px] font-bold text-blue-600 bg-white border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      ویرایش عکس
                    </button>
                  )}
                </div>
              )}

              {/* Navigation Sections */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 px-1">بخش‌های میزکار بالینی</h4>
                <div className="space-y-1.5">
                  {[
                    {
                      id: 'clinical',
                      title: 'صف ویزیت و بیماران امروز',
                      sub: 'فراخوانی بیمار، ثبت شرح‌حال، پرونده بالینی',
                      path: '/doctor?tab=clinical',
                      icon: <Users className="w-4 h-4" />,
                      color: 'bg-blue-100 text-blue-700'
                    },
                    {
                      id: 'tasks',
                      title: 'کارتابل دستورات و تسک‌های مطب',
                      sub: 'دستورات آزمایش، سونوگرافی، ارجاعات منشی',
                      path: '/doctor?tab=tasks',
                      icon: <CheckSquare className="w-4 h-4" />,
                      color: 'bg-emerald-100 text-emerald-700'
                    },
                    {
                      id: 'website',
                      title: 'وب‌سایت شخصی و برندینگ پزشک',
                      sub: 'مدیریت بیوگرافی، مقالات، خدمات و قالب',
                      path: '/doctor?tab=website',
                      icon: <Globe className="w-4 h-4" />,
                      color: 'bg-purple-100 text-purple-700'
                    }
                  ].map(item => {
                    const isActive = location.pathname === '/doctor' && currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-right ${
                          isActive 
                            ? 'bg-blue-50 text-blue-900 font-bold border border-blue-300 shadow-2xs' 
                            : 'hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                            {item.icon}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold block">{item.title}</span>
                            <span className="text-[11px] text-slate-400 font-normal block">{item.sub}</span>
                          </div>
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Online Services */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 px-1">خدمات تکمیلی پزشک</h4>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/telemedicine')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer text-right text-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold block">مشاوره آنلاین و تله‌مدیسین</span>
                        <span className="text-[11px] text-slate-400 block">ویزیت غیرحضوری و تصویری بیماران</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('/dr/dr-maryam-hosseini')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer text-right text-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold block">مشاهده وب‌سایت زنده پزشک</span>
                        <span className="text-[11px] text-slate-400 block">پیش‌نمایش پرتال نوبت‌دهی آنلاین مراجعین</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/90 shrink-0 space-y-2">
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-900 hover:bg-blue-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-blue-600" />
                مشاهده وب‌سایت عمومی درمانگاه
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                خروج از حساب کاربری
              </button>
            </div>
          </div>
        );
      }

      case 'secretary': {
        const searchParams = new URLSearchParams(location.search);
        const currentTab = searchParams.get('tab') || 'queue';

        return (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 bg-gradient-to-l from-slate-950 via-indigo-950 to-blue-950 text-white shrink-0 border-b border-indigo-800/60 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-200 shadow-xs shrink-0">
                    <UserCheck className="w-5 h-5 text-indigo-200" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
                      میزکار و پذیرش منشی
                    </h2>
                    <span className="text-[11px] text-indigo-300/90 font-medium truncate block">
                      {currentUser?.name || 'مسئول پذیرش'} • شعبه مرکزی
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90 shrink-0"
                  aria-label="بستن منو"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Pill */}
              <div className="flex items-center justify-between text-xs bg-indigo-950/70 border border-indigo-700/60 rounded-xl px-3 py-2">
                <span className="flex items-center gap-1.5 text-indigo-200 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  شیفت فعال پذیرش و تریاژ
                </span>
                <span className="text-[10px] bg-indigo-800/90 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                  میز پذیرش
                </span>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
              {/* Quick Actions Strip */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent('open_secretary_checkin'));
                  }}
                  className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-900 flex flex-col items-center justify-center gap-1 text-center font-bold text-xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  اعلام حضور فوری مراجع
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    handleNavigate('/secretary?tab=sms');
                  }}
                  className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-900 flex flex-col items-center justify-center gap-1 text-center font-bold text-xs transition-colors cursor-pointer"
                >
                  <Send className="w-5 h-5 text-purple-600" />
                  ارسال پیامک اطلاع‌رسانی
                </button>
              </div>

              {/* Navigation Sections */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 px-1">بخش‌های پذیرش درمانگاه</h4>
                <div className="space-y-1.5">
                  {[
                    {
                      id: 'queue',
                      title: 'صف مراجعین و نوبت‌های امروز',
                      sub: 'پایش صف، اعلام حضور و ارجاع به مطب',
                      path: '/secretary?tab=queue',
                      icon: <Users className="w-4 h-4" />,
                      color: 'bg-indigo-100 text-indigo-700'
                    },
                    {
                      id: 'tasks',
                      title: 'کارتابل وظایف شیفت منشی',
                      sub: 'چک‌لیست تجهیزات، هماهنگی‌های روزانه',
                      path: '/secretary?tab=tasks',
                      icon: <CheckSquare className="w-4 h-4" />,
                      color: 'bg-emerald-100 text-emerald-700'
                    },
                    {
                      id: 'calls',
                      title: 'فهرست تماس‌ها و پیگیری تلفنی',
                      sub: 'پیگیری جواب آزمایش، لغو و تغییر نوبت',
                      path: '/secretary?tab=calls',
                      icon: <PhoneCall className="w-4 h-4" />,
                      color: 'bg-amber-100 text-amber-700'
                    },
                    {
                      id: 'logs',
                      title: 'لاگ و گزارش فعالیت‌های شیفت',
                      sub: 'تاریخچه اقدامات، ثبت‌ها و تریاژ',
                      path: '/secretary?tab=logs',
                      icon: <FileText className="w-4 h-4" />,
                      color: 'bg-slate-200 text-slate-700'
                    }
                  ].map(item => {
                    const isActive = (location.pathname === '/secretary' || location.pathname === '/reception') && currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-right ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-300 shadow-2xs' 
                            : 'hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                            {item.icon}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold block">{item.title}</span>
                            <span className="text-[11px] text-slate-400 font-normal block">{item.sub}</span>
                          </div>
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/90 shrink-0 space-y-2">
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-900 hover:bg-indigo-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-indigo-600" />
                مشاهده وب‌سایت عمومی درمانگاه
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                خروج از حساب کاربری
              </button>
            </div>
          </div>
        );
      }

      case 'patient': {
        return (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-950 text-white shrink-0 border-b border-emerald-800/60 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-200 shadow-xs shrink-0">
                    <Heart className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
                      پرونده سلامت و پرتال مراجع
                    </h2>
                    <span className="text-[11px] text-emerald-300/90 font-medium truncate block">
                      {currentUser?.name || 'بیمار گرامی'} • {currentUser?.phone || ''}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90 shrink-0"
                  aria-label="بستن منو"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Pill */}
              <div className="flex items-center justify-between text-xs bg-emerald-900/60 border border-emerald-700/50 rounded-xl px-3 py-2">
                <span className="flex items-center gap-1.5 text-emerald-200 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  پرونده الکترونیک سلامت فعال
                </span>
                <span className="text-[10px] bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  کد: {currentUser?.id?.slice(0, 6) || '1042'}
                </span>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
              {/* Quick Book Appointment CTA */}
              <div 
                onClick={() => handleNavigate('/doctors')}
                className="p-3 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600 text-white shadow-sm cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-5 h-5 text-amber-300" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">رزرو آنلاین نوبت پزشک</h4>
                    <p className="text-[11px] text-emerald-100">انتخاب تخصص، پزشک و دریافت نوبت فوری</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-white" />
              </div>

              {/* Navigation Sections */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 px-1">بخش‌های پرونده سلامت شما</h4>
                <div className="space-y-1.5">
                  {[
                    {
                      id: 'home',
                      title: 'داشبورد سلامت من',
                      sub: 'خلاصه نوبت‌ها، سوابق و اطلاعیه‌ها',
                      path: '/patient',
                      icon: <Home className="w-4 h-4" />,
                      color: 'bg-emerald-100 text-emerald-700'
                    },
                    {
                      id: 'appointments',
                      title: 'نوبت‌های من و تاریخچه ویزیت',
                      sub: 'نوبت‌های آینده، سوابق و چاپ کارت نوبت',
                      path: '/patient/appointments',
                      icon: <Calendar className="w-4 h-4" />,
                      color: 'bg-blue-100 text-blue-700'
                    },
                    {
                      id: 'records',
                      title: 'پرونده الکترونیک و آزمایشات',
                      sub: 'نتایج آزمایشگاه، MRI، سونوگرافی و نسخ',
                      path: '/patient/records',
                      icon: <FileText className="w-4 h-4" />,
                      color: 'bg-purple-100 text-purple-700'
                    },
                    {
                      id: 'family',
                      title: 'مدیریت سلامت اعضای خانواده',
                      sub: 'پرونده فرزندان، والدین و نوبت‌گیری نیابتی',
                      path: '/patient/family',
                      icon: <Users className="w-4 h-4" />,
                      color: 'bg-rose-100 text-rose-700'
                    }
                  ].map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-right ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300 shadow-2xs' 
                            : 'hover:bg-slate-100/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                            {item.icon}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold block">{item.title}</span>
                            <span className="text-[11px] text-slate-400 font-normal block">{item.sub}</span>
                          </div>
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Online Care & Profile */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 px-1">سایر امکانات بیمار</h4>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/telemedicine')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer text-right text-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold block">مشاوره آنلاین تصویری و متنی</span>
                        <span className="text-[11px] text-slate-400 block">ویزیت غیرحضوری ۲۴ ساعته</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>

                  {onOpenAvatarModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAvatarModal();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer text-right text-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-bold block">تغییر تصویر و آواتار پرونده</span>
                          <span className="text-[11px] text-slate-400 block">بارگذاری عکس از دوربین یا گالری</span>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/90 shrink-0 space-y-2">
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                مشاهده وب‌سایت عمومی درمانگاه
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                خروج از حساب کاربری
              </button>
            </div>
          </div>
        );
      }

      case 'admin': {
        const p = location.pathname;
        const currentAdminTab = 
          p.includes('/crm') ? 'crm' :
          p.includes('/finance') ? 'finance' :
          p.includes('/hr') ? 'hr' :
          p.includes('/marketing') ? 'marketing' :
          p.includes('/websites') ? 'websites' :
          p.includes('/operations') ? 'operations' :
          p.includes('/analytics') ? 'analytics' : 'overview';

        return (
          <div className="flex flex-col h-full bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="p-4 bg-gradient-to-l from-rose-950 via-slate-900 to-slate-950 text-white shrink-0 border-b border-rose-900/40 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-200 shadow-xs shrink-0">
                    <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
                      مرکز فرماندهی ارشد (Super Admin)
                    </h2>
                    <span className="text-[11px] text-rose-300/90 font-medium truncate block">
                      {currentUser?.name || 'مدیریت کلینیک‌ها'} • دسترسی اجرایی کلان
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90 shrink-0"
                  aria-label="بستن منو"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Pill */}
              <div className="flex items-center justify-between text-xs bg-slate-900/90 border border-rose-900/60 rounded-xl px-3 py-2">
                <span className="flex items-center gap-1.5 text-rose-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  سیستم مانیتورینگ سلامت کلیه شعب
                </span>
                <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-bold">
                  Root Admin
                </span>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2 px-1">ماژول‌های ارشد و فرماندهی</h4>
                <div className="space-y-1.5">
                  {[
                    {
                      id: 'overview',
                      title: 'داشبورد ارشد و KPI',
                      sub: 'پایش کل شعب، درآمد و راندمان سیستم',
                      path: '/admin',
                      icon: <BarChart3 className="w-4 h-4 text-rose-400" />
                    },
                    {
                      id: 'crm',
                      title: 'مدیریت ارتباط با مراجعین (CRM)',
                      sub: 'پرونده مراجعین، کانال‌های ورودی و وفاداری',
                      path: '/admin/crm',
                      icon: <UserCheck className="w-4 h-4 text-emerald-400" />
                    },
                    {
                      id: 'finance',
                      title: 'خزانه‌داری، مالی و سودآوری',
                      sub: 'تراز مالی شعب و تسویه‌حساب پزشکان',
                      path: '/admin/finance',
                      icon: <DollarSign className="w-4 h-4 text-amber-400" />
                    },
                    {
                      id: 'hr',
                      title: 'منابع انسانی و ارزیابی (HR)',
                      sub: 'عملکرد پرسنل، کارکرد پزشکان و شیفت‌ها',
                      path: '/admin/hr',
                      icon: <Users className="w-4 h-4 text-blue-400" />
                    },
                    {
                      id: 'marketing',
                      title: 'کمپین‌های بازاریابی و جذب (Growth)',
                      sub: 'تحلیل کانال‌ها، نرخ تبدیل و کمپین‌ها',
                      path: '/admin/marketing',
                      icon: <Zap className="w-4 h-4 text-indigo-400" />
                    },
                    {
                      id: 'operations',
                      title: 'مدیریت عملیات و زنجیره تأمین',
                      sub: 'انبارداری، تجهیزات و ظرفیت کلینیک‌ها',
                      path: '/admin/operations',
                      icon: <ShieldAlert className="w-4 h-4 text-purple-400" />
                    },
                    {
                      id: 'websites',
                      title: 'پرتال‌ها و وب‌سایت‌های سازمانی',
                      sub: 'مدیریت پرتال‌ها، وبلاگ و محتوای عمومی',
                      path: '/admin/websites',
                      icon: <Globe className="w-4 h-4 text-cyan-400" />
                    },
                    {
                      id: 'analytics',
                      title: 'هوش تجاری و آنالیتیکس پیشرفته (BI)',
                      sub: 'کلان‌داده، پیش‌بینی هوشمند و گزارش‌ساز',
                      path: '/admin/analytics',
                      icon: <PieChart className="w-4 h-4 text-teal-400" />
                    }
                  ].map(item => {
                    const isActive = currentAdminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-right ${
                          isActive 
                            ? 'bg-rose-950/70 text-rose-300 font-bold border border-rose-800/80 shadow-2xs' 
                            : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold block text-slate-100">{item.title}</span>
                            <span className="text-[11px] text-slate-400 font-normal block">{item.sub}</span>
                          </div>
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-950" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 shrink-0 space-y-2">
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className="w-full py-2 px-3 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-rose-400" />
                مشاهده وب‌سایت عمومی درمانگاه
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl text-rose-400 hover:bg-rose-950/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                خروج از حساب کاربری
              </button>
            </div>
          </div>
        );
      }
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side-Drawer: Covers ~80% of mobile screen */}
      <aside
        id="panel-dedicated-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="منوی اختصاصی پنل کاربری"
        className="fixed inset-y-0 right-0 z-[9999] w-[82vw] max-w-[340px] sm:max-w-[360px] bg-white shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-250 ease-out font-sans text-slate-800 border-l border-slate-200/90 h-screen h-[100dvh]"
        dir="rtl"
      >
        {renderPanelContent()}
      </aside>
    </>,
    document.body
  );
};
