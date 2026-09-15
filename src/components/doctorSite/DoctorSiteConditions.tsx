import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HeartPulse, 
  Search, 
  ArrowLeft, 
  AlertTriangle,
  FileQuestion
} from 'lucide-react';
import { Doctor, DiseaseCondition } from '../../types';
import { ThemeStyles } from './themeConfig';
import { MOCK_DISEASES } from '../../data/mockData';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
  onSelectCondition?: (conditionSlug: string) => void;
  onBookCondition: (conditionName: string) => void;
  isStandalonePage?: boolean;
}

export const DoctorSiteConditions: React.FC<Props> = ({
  doctor,
  theme,
  onSelectCondition,
  onBookCondition,
  isStandalonePage = false
}) => {
  const location = useLocation();
  const [search, setSearch] = useState('');

  const basePath = location.pathname.startsWith('/dr/') 
    ? `/dr/${doctor.slug}`
    : location.pathname.startsWith('/doctor-site/')
    ? `/doctor-site/${doctor.slug}`
    : `/site/${doctor.slug}`;

  // Filter diseases relevant to this doctor's specialty or general
  const relatedDiseases = MOCK_DISEASES.filter(d => 
    d.relatedSpecialties.includes(doctor.specialtyId) ||
    doctor.services.some(s => d.overview.includes(s.split(' ')[0]) || d.persianTitle.includes(s.split(' ')[0])) ||
    d.relatedSpecialties.length > 0
  );

  const displayedDiseases = search.trim()
    ? relatedDiseases.filter(d => 
        d.persianTitle.includes(search) || 
        d.overview.includes(search) || 
        d.symptoms.some(sym => sym.includes(search))
      )
    : relatedDiseases;

  if (displayedDiseases.length === 0 && !isStandalonePage) {
    return null;
  }

  return (
    <section id="conditions" className="py-16 md:py-20 bg-white border-b border-slate-200/80 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
            <HeartPulse className="w-3.5 h-3.5" />
            <span>بیماری‌ها و حوزه‌های تحت درمان</span>
          </span>
          <h2 className={`text-2xl sm:text-3xl ${theme.sectionHeadingClass}`}>
            بیماری‌های شایع و تخصص‌های درمانی {doctor.name}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            راهنمای آموزشی جامع پیرامون علائم بالینی، رویکردهای تشخیصی و اقدامات پیشرفته درمانی توسط {doctor.name}
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجوی بیماری، علامت یا عارضه بالینی..."
            className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
        </div>

        {/* Empty Search State */}
        {displayedDiseases.length === 0 && isStandalonePage && (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              مبحث بالینی منطبق با جستجو یافت نشد
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              جهت طرح علائم اختصاصی و دریافت مشاوره تخصصی می‌توانید با مطب تماس حاصل فرمایید.
            </p>
            <button
              onClick={() => setSearch('')}
              className="text-xs text-blue-700 font-bold hover:underline"
            >
              نمایش همه مباحث
            </button>
          </div>
        )}

        {/* Conditions Grid */}
        {displayedDiseases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDiseases.map(disease => (
              <div
                key={disease.id}
                className={`p-6 rounded-3xl ${theme.cardBg} ${theme.cardBorder} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                      {disease.title}
                    </span>
                    {disease.whenToSeeDoctor && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>راهنمای مراجعه</span>
                      </span>
                    )}
                  </div>

                  <Link
                    to={`${basePath}/conditions/${disease.slug}`}
                    className="text-base font-extrabold text-slate-900 hover:text-blue-700 transition-colors block"
                  >
                    {disease.persianTitle}
                  </Link>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {disease.overview}
                  </p>

                  {/* Symptoms Preview */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500">علائم بالینی شایع:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {disease.symptoms.slice(0, 3).map((sym, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                  <Link
                    to={`${basePath}/conditions/${disease.slug}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors text-center"
                  >
                    مطالعه راهنما
                  </Link>
                  <button
                    onClick={() => onBookCondition(disease.persianTitle)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold transition-colors text-center flex items-center justify-center gap-1 cursor-pointer ${theme.primaryButton}`}
                  >
                    <span>رزرو ویزیت</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
