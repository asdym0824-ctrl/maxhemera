import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  UserCheck,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { Doctor, HealthArticle } from '../../types';
import { apiService } from '../../services/apiService';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
  onSelectArticle?: (article: HealthArticle) => void;
  isStandalonePage?: boolean;
}

export const DoctorSiteArticles: React.FC<Props> = ({ 
  doctor, 
  theme, 
  onSelectArticle,
  isStandalonePage = false 
}) => {
  const location = useLocation();
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const basePath = location.pathname.startsWith('/dr/') 
    ? `/dr/${doctor.slug}`
    : location.pathname.startsWith('/doctor-site/')
    ? `/doctor-site/${doctor.slug}`
    : `/site/${doctor.slug}`;

  const config = doctor.websiteConfig;
  if (!isStandalonePage && config?.sectionVisibility?.articles === false) return null;

  useEffect(() => {
    let mounted = true;
    apiService.getArticlesByDoctor(doctor.id).then(data => {
      if (mounted) {
        setArticles(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [doctor.id]);

  if (!loading && articles.length === 0 && !isStandalonePage) {
    return null;
  }

  return (
    <section id="articles" className="py-16 md:py-20 bg-slate-50/50 border-b border-slate-200/80 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
            <BookOpen className="w-3.5 h-3.5" />
            <span>آموزش و آگاهی سلامت</span>
          </span>
          <h2 className={`text-2xl sm:text-3xl ${theme.sectionHeadingClass}`}>
            مقالات و یادداشت‌های آموزشی {doctor.name}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            مجموعه مطالب کاربردی و مستند پزشکی به قلم پزشک جهت ارتقای سبک زندگی و آگاهی بیماران
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-slate-400 text-xs">
            در حال بارگذاری مقالات آموزشی...
          </div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              هنوز مقاله‌ای توسط {doctor.name} ثبت نشده است
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              یادداشت‌ها و مقالات آموزشی تخصصی به زودی پس از بازبینی و تأیید علمی در این بخش قرار خواهد گرفت.
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

        {/* Articles Grid */}
        {!loading && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <div
                key={article.id}
                className={`rounded-3xl overflow-hidden ${theme.cardBg} ${theme.cardBorder} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group`}
              >
                <div>
                  {/* Cover Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-blue-900 shadow-2xs backdrop-blur-xs">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTimeMinutes} دقیقه مطالعه
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {article.authorDoctorName || doctor.name}
                      </span>
                    </div>

                    <Link
                      to={`${basePath}/articles/${article.slug}`}
                      className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 block"
                    >
                      {article.title}
                    </Link>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`${basePath}/articles/${article.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
                    >
                      <span>مطالعه کامل مقاله</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                    {article.updatedAt && (
                      <span className="text-[11px] text-slate-400">
                        {article.updatedAt}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
