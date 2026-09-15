import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Stethoscope, 
  Clock, 
  Sparkles, 
  Calendar, 
  ArrowLeft,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';
import { Doctor, DetailedService } from '../../types';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
  onBookService: (serviceTitle: string) => void;
  onSelectService?: (service: DetailedService) => void;
  isStandalonePage?: boolean;
}

export const DoctorSiteServices: React.FC<Props> = ({
  doctor,
  theme,
  onBookService,
  onSelectService,
  isStandalonePage = false
}) => {
  const location = useLocation();
  const config = doctor.websiteConfig;
  if (!isStandalonePage && config?.sectionVisibility?.services === false) return null;

  const detailedServices = doctor.detailedServices || [];
  const simpleServices = doctor.services || [];

  const basePath = location.pathname.startsWith('/dr/') 
    ? `/dr/${doctor.slug}`
    : location.pathname.startsWith('/doctor-site/')
    ? `/doctor-site/${doctor.slug}`
    : `/site/${doctor.slug}`;

  const hasAnyServices = detailedServices.length > 0 || simpleServices.length > 0;

  if (!hasAnyServices && !isStandalonePage) return null;

  return (
    <section id="services" className="py-16 md:py-20 bg-white border-b border-slate-200/80 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
            <Stethoscope className="w-3.5 h-3.5" />
            <span>خدمات و اقدامات تخصصی</span>
          </span>
          <h2 className={`text-2xl sm:text-3xl ${theme.sectionHeadingClass}`}>
            خدمات درمانی و بالینی {doctor.name}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            ارائه کلیه پروسیدجرهای تشخیصی، درمانی و مشاوره‌های تخصصی بر اساس جدیدترین گایدلاین‌های بین‌المللی
          </p>
        </div>

        {/* Empty State */}
        {!hasAnyServices && isStandalonePage && (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              خدمات مطب به زودی تکمیل خواهد شد
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              جهت استعلام دقیق خدمات و دریافت نوبت مشاوره می‌توانید مستقیماً با مطب تماس حاصل فرمایید.
            </p>
            <Link
              to={basePath}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${theme.primaryButton}`}
            >
              <span>بازگشت به صفحه اصلی</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Detailed Services Grid */}
        {detailedServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {detailedServices.map(service => (
              <div
                key={service.id}
                className={`p-6 rounded-3xl ${theme.cardBg} ${theme.cardBorder} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    {service.featured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>ویژه</span>
                      </span>
                    )}
                  </div>

                  <Link
                    to={`${basePath}/services/${service.id}`}
                    className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors block"
                  >
                    {service.title}
                  </Link>

                  {service.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    {service.durationMinutes ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{service.durationMinutes} دقیقه</span>
                      </span>
                    ) : (
                      <span />
                    )}
                    {service.price ? (
                      <span className="font-extrabold text-slate-900 text-sm">
                        {service.price.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-blue-700">طبق تعرفه مصوب</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`${basePath}/services/${service.id}`}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors text-center"
                    >
                      جزئیات
                    </Link>
                    <button
                      onClick={() => onBookService(service.title)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold ${theme.primaryButton}`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>رزرو این خدمت</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          simpleServices.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {simpleServices.map((srv, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs text-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span className="font-bold">{srv}</span>
                  </div>
                  <button
                    onClick={() => onBookService(srv)}
                    className="text-blue-700 hover:underline font-bold"
                  >
                    رزرو نوبت
                  </button>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </section>
  );
};
