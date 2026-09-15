import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HeartPulse, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Stethoscope
} from 'lucide-react';
import { Doctor, DiseaseCondition } from '../../types';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  condition: DiseaseCondition;
  theme: ThemeStyles;
  onBookCondition: (conditionTitle: string) => void;
  onBackToConditions?: () => void;
}

export const DoctorSiteConditionDetail: React.FC<Props> = ({
  doctor,
  condition,
  theme,
  onBookCondition,
  onBackToConditions
}) => {
  const location = useLocation();

  const basePath = location.pathname.startsWith('/dr/') 
    ? `/dr/${doctor.slug}`
    : location.pathname.startsWith('/doctor-site/')
    ? `/doctor-site/${doctor.slug}`
    : `/site/${doctor.slug}`;

  return (
    <div className="py-12 md:py-16 bg-slate-50/60 min-h-screen text-right font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Breadcrumb */}
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
              to={`${basePath}/conditions`}
              className="hover:text-blue-700 font-medium transition-colors"
            >
              حوزه‌های درمان
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">{condition.persianTitle}</span>
          </div>

          <Link
            to={`${basePath}/conditions`}
            className="flex items-center gap-1 text-blue-700 hover:underline font-bold"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>همه بیماری‌ها</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>راهنمای تشخیصی و درمانی</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {condition.title}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {condition.persianTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                پروتکل‌های تشخیصی و درمانی تحت نظارت <strong className="text-slate-800">{doctor.name}</strong>
              </p>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">مرور کلی بر بیماری و پاتوفیزیولوژی:</h3>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {condition.overview}
            </p>
          </div>

          {/* Symptoms List */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>نشانه‌ها و علائم بالینی شایع:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {condition.symptoms.map((symptom, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <span>{symptom}</span>
                </div>
              ))}
            </div>
          </div>

          {/* When to see a doctor warning */}
          {condition.whenToSeeDoctor && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>چه زمانی باید فوراً به پزشک مراجعه کنید؟ (Red Flags):</span>
              </h4>
              <p className="text-xs text-rose-950 leading-relaxed">
                {condition.whenToSeeDoctor}
              </p>
            </div>
          )}

          {/* Treatments Overview */}
          {condition.treatments && condition.treatments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>روش‌ها و رویکردهای درمانی قابل ارائه در مطب:</span>
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                {condition.treatments.map((tr, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-2.5">
                    <span className="font-bold text-blue-700 mt-0.5">{idx + 1}.</span>
                    <span>{tr}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTA */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 text-center sm:text-right">
              در صورت بروز هر یک از این نشانه‌ها، مشاوره تخصصی زودهنگام از عوارض بعدی پیشگیری خواهد کرد.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to={`${basePath}/conditions`}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors text-center"
              >
                سایر بیماری‌ها
              </Link>
              <button
                onClick={() => onBookCondition(condition.persianTitle)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold shadow-md cursor-pointer ${theme.primaryButton}`}
              >
                <Calendar className="w-4 h-4" />
                <span>رزرو نوبت بررسی {condition.persianTitle}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
