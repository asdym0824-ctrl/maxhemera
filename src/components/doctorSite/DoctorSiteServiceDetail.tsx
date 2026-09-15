import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Stethoscope, 
  Clock, 
  CreditCard, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Doctor, DetailedService } from '../../types';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  service: DetailedService;
  theme: ThemeStyles;
  onBookService: (serviceTitle: string) => void;
  onBackToServices?: () => void;
}

export const DoctorSiteServiceDetail: React.FC<Props> = ({
  doctor,
  service,
  theme,
  onBookService,
  onBackToServices
}) => {
  const location = useLocation();

  const basePath = location.pathname.startsWith('/dr/') 
    ? `/dr/${doctor.slug}`
    : location.pathname.startsWith('/doctor-site/')
    ? `/doctor-site/${doctor.slug}`
    : `/site/${doctor.slug}`;

  return (
    <div className="py-12 md:py-16 bg-slate-50/60 min-h-screen text-right font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Link 
              to={basePath}
              className="hover:text-blue-700 font-medium transition-colors"
            >
              وبسایت {doctor.name}
            </Link>
            <span>/</span>
            <Link 
              to={`${basePath}/services`}
              className="hover:text-blue-700 font-medium transition-colors"
            >
              خدمات تخصصی
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">{service.title}</span>
          </div>

          <Link
            to={`${basePath}/services`}
            className="flex items-center gap-1 text-blue-700 hover:underline font-bold"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>همه خدمات</span>
          </Link>
        </div>

        {/* Main Service Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>خدمت بالینی و تشخیصی</span>
                </span>
                {service.featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>ویژه</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {service.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                ارائه مستقیم توسط <strong className="text-slate-800">{doctor.name}</strong> - {doctor.title}
              </p>
            </div>

            {/* Quick Specs */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
              {service.durationMinutes && (
                <div className="text-center px-2">
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>مدت زمان</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    {service.durationMinutes} دقیقه
                  </div>
                </div>
              )}

              {service.price !== undefined && (
                <div className="text-center px-2 border-r border-slate-200">
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>تعرفه خدمت</span>
                  </div>
                  <div className="text-sm font-black text-blue-700 mt-0.5">
                    {service.price === 0 ? 'رایگان' : `${service.price.toLocaleString('fa-IR')} تومان`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">شرح اقدام و هدف درمانی:</h3>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                {service.description}
              </p>
            </div>
          )}

          {/* Standards & Guidelines */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>استانداردهای مراقبتی و بالینی همرا کلینیک:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-blue-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>بهره‌گیری از تجهیزات استاندارد و استریل</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>امکان دریافت پرونده و خلاصه شرح‌حال آنلاین</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>پشتیبانی و پیگیری پس از انجام اقدام</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>امکان پرداخت از طریق سامانه‌های الکترونیک</span>
              </div>
            </div>
          </div>

          {/* Booking Action Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 text-center sm:text-right">
              نوبت‌دهی برای این خدمت به صورت مستقیم و بدون نیاز به مراجعه حضوری قبلی انجام می‌شود.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to={`${basePath}/services`}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors text-center"
              >
                سایر خدمات
              </Link>
              <button
                onClick={() => onBookService(service.title)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold shadow-md cursor-pointer ${theme.primaryButton}`}
              >
                <Calendar className="w-4 h-4" />
                <span>رزرو نوبت {service.title}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
