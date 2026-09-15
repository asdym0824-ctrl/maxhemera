import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Share2, 
  CheckCircle2, 
  ShieldCheck,
  User,
  Heart,
  Check
} from 'lucide-react';
import { Doctor, HealthArticle } from '../../types';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  article: HealthArticle;
  theme: ThemeStyles;
  onBookClick: (note?: string) => void;
  onBackToArticles?: () => void;
}

export const DoctorSiteArticleDetail: React.FC<Props> = ({
  doctor,
  article,
  theme,
  onBookClick,
  onBackToArticles
}) => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const basePath = location.pathname.startsWith('/dr/') 
    ? `/dr/${doctor.slug}`
    : location.pathname.startsWith('/doctor-site/')
    ? `/doctor-site/${doctor.slug}`
    : `/site/${doctor.slug}`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

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
              to={`${basePath}/articles`}
              className="hover:text-blue-700 font-medium transition-colors"
            >
              مقالات و آموزش‌ها
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold line-clamp-1">{article.title}</span>
          </div>

          <Link
            to={`${basePath}/articles`}
            className="flex items-center gap-1 text-blue-700 hover:underline font-bold"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>همه مقالات</span>
          </Link>
        </div>

        {/* Article Container Card */}
        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8">
          
          {/* Header Area */}
          <div className="space-y-4 pb-6 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
                {article.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                زمان مطالعه: {article.readTimeMinutes} دقیقه
              </span>
              {article.updatedAt && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  بروزرسانی: {article.updatedAt}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              {article.title}
            </h1>

            {/* Author Profile Strip */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-600/30"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">{article.authorDoctorName || doctor.name}</div>
                  <div className="text-[11px] text-slate-500">{doctor.title}</div>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'لینک کپی شد' : 'اشتراک‌گذاری'}</span>
              </button>
            </div>
          </div>

          {/* Featured Image */}
          {article.coverImage && (
            <div className="rounded-2xl overflow-hidden max-h-96 w-full bg-slate-100 shadow-2xs">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Summary Box */}
          {article.summary && (
            <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-100 text-blue-950 text-sm leading-relaxed font-medium">
              <div className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>خلاصه و نکات کلیدی مطلب:</span>
              </div>
              <p>{article.summary}</p>
            </div>
          )}

          {/* Body Content */}
          <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-loose space-y-6">
            <p className="whitespace-pre-line">
              {article.content}
            </p>
          </div>

          {/* Doctor Booking Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-right">
              <h4 className="text-base font-bold text-white">نیاز به ویزیت تخصصی در این زمینه دارید؟</h4>
              <p className="text-xs text-slate-400">
                می‌توانید نوبت حضوری یا مشاوره آنلاین تصویری خود را به صورت مستقیم رزرو نمایید.
              </p>
            </div>

            <button
              onClick={() => onBookClick(`درخواست نوبت پیرامون مقاله: ${article.title}`)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap shadow-md cursor-pointer ${theme.primaryButton}`}
            >
              دریافت نوبت از {doctor.name}
            </button>
          </div>

        </article>

      </div>
    </div>
  );
};
