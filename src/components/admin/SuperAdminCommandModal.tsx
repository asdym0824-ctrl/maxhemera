import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  X, 
  BarChart3, 
  Globe, 
  UserCheck, 
  DollarSign, 
  Briefcase, 
  Megaphone, 
  Settings, 
  PieChart, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  ChevronLeft, 
  ExternalLink, 
  Building2, 
  Stethoscope, 
  Users, 
  Activity,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers
} from 'lucide-react';
import { AdminKPIs } from '../../types';
import { apiService } from '../../services/apiService';

interface SuperAdminCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperAdminCommandModal: React.FC<SuperAdminCommandModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiService.getAdminKPIs().then(setKpis).catch(() => {});
    }
  }, [isOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await apiService.getAdminKPIs();
      setKpis(data);
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 2500);
    } catch {
      // error handled silently
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isOpen) return null;

  const modules = [
    {
      id: 'overview',
      title: 'نمای کلی و KPIs',
      subtitle: 'پایش شاخص‌های حیاتی و درآمد لحظه‌ای',
      path: '/admin',
      icon: <BarChart3 className="w-5 h-5 text-rose-400" />,
      badge: 'زنده',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'websites',
      title: 'مدیریت وبسایت پزشکان',
      subtitle: 'تایید دامنه، تغییر قالب و انتشار پورتال پزشک',
      path: '/admin/websites',
      icon: <Globe className="w-5 h-5 text-sky-400" />,
      badge: '۲ در انتظار',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    },
    {
      id: 'crm',
      title: 'مدیریت ارتباط بیماران (CRM)',
      subtitle: 'پرونده‌های طلایی، پیگیری نارضایتی و سوابق',
      path: '/admin/crm',
      icon: <UserCheck className="w-5 h-5 text-emerald-400" />,
      badge: 'VIP',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'finance',
      title: 'مالی و تراکنش‌ها',
      subtitle: 'تسویه حساب، کارمزد شعب، پوز و درگاه',
      path: '/admin/finance',
      icon: <DollarSign className="w-5 h-5 text-amber-400" />,
      badge: 'سود روزانه',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'hr',
      title: 'منابع انسانی و کادر درمان',
      subtitle: 'قرارداد پزشکان، شیفت منشی‌ها و ارزیابی',
      path: '/admin/hr',
      icon: <Briefcase className="w-5 h-5 text-indigo-400" />,
      badge: 'شیفت فعال',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'marketing',
      title: 'کمپین و بازاریابی',
      subtitle: 'کانال‌های ورودی، کدهای تخفیف و جذب مراجع',
      path: '/admin/marketing',
      icon: <Megaphone className="w-5 h-5 text-pink-400" />,
      badge: 'تبلیغات',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    },
    {
      id: 'operations',
      title: 'عملیات و بهره‌وری شعب',
      subtitle: 'مدیریت یونیت‌ها، زمان انتظار و ظرفیت',
      path: '/admin/operations',
      icon: <Settings className="w-5 h-5 text-purple-400" />,
      badge: 'بهینه‌ساز',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      id: 'analytics',
      title: 'تحلیل هوشمند و پیش‌بینی AI',
      subtitle: 'مدل‌های یادگیری ماشین و گزارشات تحلیلی',
      path: '/admin/analytics',
      icon: <PieChart className="w-5 h-5 text-teal-400" />,
      badge: 'هوش مصنوعی',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-slate-900 border-t sm:border border-rose-900/40 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/50 ring-2 ring-rose-400/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">مرکز فرماندهی سوپر ادمین</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  مدیریت ارشد
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">کنترل یکپارچه شعب، مالی، CRM و زیرساخت همرا کلینیک</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Quick Metrics Flash Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                شاخص‌های زنده شیفت امروز کلینیک
              </span>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{refreshSuccess ? 'به‌روز شد' : 'به‌روزرسانی'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">درآمد امروز</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block">
                  {kpis ? kpis.todayRevenue.toLocaleString('fa-IR') : '۷۴,۲۰۰,۰۰۰'} <span className="text-[10px] font-normal text-slate-400">تومان</span>
                </span>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">پزشکان فعال شیفت</span>
                <span className="text-sm font-extrabold text-sky-400 mt-0.5 block">
                  {kpis ? kpis.activeDoctorsCount.toLocaleString('fa-IR') : '۲۴'} <span className="text-[10px] font-normal text-slate-400">پزشک</span>
                </span>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">مراجعین امروز</span>
                <span className="text-sm font-extrabold text-amber-400 mt-0.5 block">
                  {kpis ? kpis.todayPatients.toLocaleString('fa-IR') : '۱۶۸'} <span className="text-[10px] font-normal text-slate-400">نفر</span>
                </span>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">رضایت مراجعین</span>
                <span className="text-sm font-extrabold text-rose-400 mt-0.5 block">
                  {kpis ? `${kpis.patientSatisfactionPercent}٪` : '۹۸.۲٪'}
                </span>
              </div>
            </div>
          </div>

          {/* Super Admin Modules Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 px-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              ماژول‌های هشت‌گانه پنل ارشد
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {modules.map(mod => (
                <button
                  key={mod.id}
                  onClick={() => {
                    onClose();
                    navigate(mod.path);
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-rose-500/40 transition-all text-right group cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                      {mod.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                          {mod.title}
                        </span>
                        {mod.badge && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${mod.badgeColor}`}>
                            {mod.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 line-clamp-1">
                        {mod.subtitle}
                      </span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Supervisor Cross-Portal Switcher */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 px-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ورود ناظر به سایر پرتال‌های سازمانی (Supervisor Jump)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/clinic');
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 text-right cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="truncate">
                  <span className="text-xs font-bold text-purple-200 block truncate">مدیریت کلینیک</span>
                  <span className="text-[10px] text-purple-400/80 block truncate">عملیات و شیفت‌ها</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/doctor');
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 text-right cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="truncate">
                  <span className="text-xs font-bold text-blue-200 block truncate">پرتال پزشک</span>
                  <span className="text-[10px] text-blue-400/80 block truncate">ویزیت و نسخه</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/secretary');
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/50 text-right cursor-pointer"
              >
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="truncate">
                  <span className="text-xs font-bold text-indigo-200 block truncate">میزکار منشی</span>
                  <span className="text-[10px] text-indigo-400/80 block truncate">پذیرش و صف</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/?preview=true');
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 text-right cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-slate-300 shrink-0" />
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-200 block truncate">پیش‌نمایش سایت</span>
                  <span className="text-[10px] text-slate-400 block truncate">دیدگاه مراجع</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            سامانه ایمن HEMERA CORE v4.8
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
