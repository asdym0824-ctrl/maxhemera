import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Award, 
  Trophy, 
  FileCheck, 
  Users, 
  Presentation, 
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import { Doctor } from '../../types';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
  isStandalonePage?: boolean;
}

export const DoctorSiteAchievements: React.FC<Props> = ({ 
  doctor, 
  theme, 
  isStandalonePage = false 
}) => {
  const location = useLocation();
  const config = doctor.websiteConfig;
  if (!isStandalonePage && config?.sectionVisibility?.achievements === false) return null;

  const achievements = doctor.achievements || [];
  const education = doctor.education || [];

  const basePath = location.pathname.startsWith('/dr/') 
    ? `/dr/${doctor.slug}`
    : location.pathname.startsWith('/doctor-site/')
    ? `/doctor-site/${doctor.slug}`
    : `/site/${doctor.slug}`;

  if (achievements.length === 0 && education.length === 0 && !isStandalonePage) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'award':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'certification':
        return <FileCheck className="w-5 h-5 text-emerald-500" />;
      case 'membership':
        return <Users className="w-5 h-5 text-sky-500" />;
      case 'conference':
        return <Presentation className="w-5 h-5 text-indigo-500" />;
      default:
        return <GraduationCap className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <section id="achievements" className="py-16 md:py-20 bg-slate-50/70 border-b border-slate-200/80 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
            <Award className="w-3.5 h-3.5" />
            <span>افتخارات و رتبه‌ها</span>
          </span>
          <h2 className={`text-2xl sm:text-3xl ${theme.sectionHeadingClass}`}>
            دستاوردها، گواهینامه‌ها و مدارک {doctor.name}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            افتخارات کسب‌شده در آزمون‌های بورد تخصصی، مدارک آکادمیک، عضویت در مجامع بین‌المللی و گواهینامه‌های علمی
          </p>
        </div>

        {/* Empty State */}
        {achievements.length === 0 && education.length === 0 && isStandalonePage && (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              سوابق و افتخارات تکمیلی به زودی افزوده می‌شود
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              مدارک علمی و گواهینامه‌های دوره‌های تکمیلی توسط سامانه در حال اعتبارسنجی است.
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

        {/* Achievements Grid */}
        {achievements.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-6 rounded-3xl ${theme.cardBg} ${theme.cardBorder} shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {getCategoryIcon(ach.category)}
                    </div>
                    {ach.year && (
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {ach.year}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-slate-900 leading-snug">
                    {ach.title}
                  </h3>

                  {ach.issuer && (
                    <p className="text-xs text-blue-700 font-medium">
                      {ach.issuer}
                    </p>
                  )}

                  {ach.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {ach.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Academic Education Cards */}
        {education.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>پیشینه تحصیلی و درجات آکادمیک</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {education.map((eduText, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <div className="text-xs font-black text-slate-900 leading-relaxed">{eduText}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
