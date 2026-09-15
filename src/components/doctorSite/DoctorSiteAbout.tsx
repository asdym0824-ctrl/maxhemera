import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Globe2, 
  ShieldCheck, 
  Award,
  Languages,
  CheckCircle
} from 'lucide-react';
import { Doctor } from '../../types';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
}

export const DoctorSiteAbout: React.FC<Props> = ({ doctor, theme }) => {
  const config = doctor.websiteConfig;
  if (config?.sectionVisibility?.about === false) return null;

  return (
    <section id="about" className="py-16 md:py-20 bg-slate-50/60 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>بیوگرافی و سوابق علمی</span>
          </span>
          <h2 className={`text-2xl sm:text-3xl ${theme.sectionHeadingClass}`}>
            درباره {doctor.name}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            آشنایی با پیشینه تحصیلی، مدارک بورد تخصصی، عضویت در مجامع علمی و حوزه‌های بالینی تحت پوشش
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Detailed Biography Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className={`p-6 sm:p-8 rounded-2xl bg-white ${theme.cardBorder} shadow-2xs space-y-4`}>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${theme.accentIconColor}`} />
                <span>معرفی و رویکرد درمانی</span>
              </h3>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {config?.detailedBiography || doctor.bio}
              </p>

              {/* Consultation Languages */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <Languages className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-500 font-medium">زبان‌های ویزیت و مشاوره:</span>
                <div className="flex items-center gap-1.5">
                  {doctor.languages.map(lang => (
                    <span key={lang} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Supported Insurances Block */}
            <div className={`p-6 rounded-2xl bg-white ${theme.cardBorder} shadow-2xs space-y-3`}>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>بیمه‌های طرف قرارداد و پذیرش</span>
              </h3>
              <p className="text-xs text-slate-500">
                مراجعین محترم می‌توانند از پوشش بیمه‌های پایه و تکمیلی زیر در مطب یا مشاوره‌های آنلاین بهره‌مند شوند:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {doctor.supportedInsurances.map(ins => (
                  <span key={ins} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100">
                    {ins}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Academic & Education Timeline */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`p-6 sm:p-8 rounded-2xl bg-white ${theme.cardBorder} shadow-2xs space-y-6`}>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className={`w-5 h-5 ${theme.accentIconColor}`} />
                <span>مدارک و سوابق تحصیلی</span>
              </h3>

              <div className="relative border-r-2 border-slate-200 pr-5 space-y-6 mr-2">
                {doctor.education.map((edu, idx) => (
                  <div key={idx} className="relative">
                    {/* Bullet */}
                    <div className="absolute -right-[27px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600" />
                    <div className="text-sm font-semibold text-slate-800 leading-snug">
                      {edu}
                    </div>
                  </div>
                ))}
              </div>

              {/* Memberships & Certifications */}
              {config?.memberships && config.memberships.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>عضویت در مجامع علمی و تخصصی</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {config.memberships.map((m, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
