import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HealthArticle } from '../types';
import { apiService } from '../services/apiService';
import { setSeoMetaData } from '../utils/seoUtils';
import { Calendar, Clock, User, ArrowRight, BookOpen, Share2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<HealthArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      apiService.getArticleBySlug(slug).then(art => {
        setArticle(art || null);
        if (art) {
          setSeoMetaData(
            `${art.title} | مجله سلامت همرا کلینیک`,
            art.summary || `مطالعه مقاله پزشکی ${art.title} در مجله و دانشنامه تخصصی سلامت همرا کلینیک.`
          );
        }
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-slate-500">در حال بارگذاری مقاله‌های علمی سلامت...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">مقاله مورد نظر یافت نشد</h2>
        <button
          onClick={() => navigate('/health')}
          className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به مجله سلامت
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:underline">صفحه اصلی</Link> /
          <Link to="/health" className="hover:underline">مجله سلامت</Link> /
          <span className="text-slate-800 font-bold truncate max-w-xs">{article.title}</span>
        </div>
        <button onClick={() => navigate('/health')} className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1">
          <ArrowRight className="w-4 h-4" />
          بازگشت به مجله
        </button>
      </div>

      {/* Hero Header */}
      <div className="space-y-4">
        <Badge variant="blue">{article.category}</Badge>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-200 pb-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <User className="w-4 h-4 text-blue-600" />
            نویسنده: {article.authorDoctorName}
          </span>
          {article.reviewerDoctorName && (
            <span className="text-slate-400">• بازبینی بالینی: {article.reviewerDoctorName}</span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {article.updatedAt}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            زمان مطالعه: {article.readTimeMinutes} دقیقه
          </span>
        </div>
      </div>

      {/* Main Cover Image */}
      {article.coverImage && (
        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200 max-h-96">
          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Summary Box */}
      <div className="bg-blue-50/80 border border-blue-200/80 p-5 rounded-2xl text-blue-950 text-sm font-medium leading-relaxed">
        <strong>خلاصه مقاله: </strong>
        {article.summary}
      </div>

      {/* Content */}
      <div className="prose prose-slate max-w-none text-slate-700 leading-loose text-sm sm:text-base space-y-6">
        {article.content.split('\n\n').map((paragraph, idx) => {
          if (paragraph.startsWith('###')) {
            return (
              <h3 key={idx} className="text-lg font-bold text-slate-900 mt-6 mb-2">
                {paragraph.replace('###', '').trim()}
              </h3>
            );
          }
          return <p key={idx}>{paragraph}</p>;
        })}
      </div>

      {/* Tags & Action */}
      <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700">برچسب‌ها:</span>
          {article.tags.map((tag, idx) => (
            <Badge key={idx} variant="slate">#{tag}</Badge>
          ))}
        </div>

        <button
          onClick={() => navigate('/doctors')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          دریافت نوبت از متخصصین مربوطه
        </button>
      </div>
    </div>
  );
};
