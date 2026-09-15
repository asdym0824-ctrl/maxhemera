import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HealthArticle, DiseaseCondition } from '../types';
import { apiService } from '../services/apiService';
import { setSeoMetaData } from '../utils/seoUtils';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const HealthLibraryPage: React.FC<{ onNavigateToDoctors?: () => void }> = ({ onNavigateToDoctors }) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [activeArticle, setActiveArticle] = useState<HealthArticle | null>(null);
  const [condition, setCondition] = useState<DiseaseCondition | null>(null);

  useEffect(() => {
    setSeoMetaData(
      'مجله و دانشنامه جامع سلامت | همرا کلینیک',
      'مقالات علمی پزشکی، راهنمای درمان بیماری‌ها و توصیه‌های پیشگیری تاییدشده توسط متخصصین همرا کلینیک.'
    );
    apiService.getArticles().then(arts => {
      setArticles(arts);
      if (arts.length > 0) setActiveArticle(arts[0]);
    });
    apiService.getDiseaseBySlug('migraine').then(setCondition);
  }, []);

  const handleBook = () => {
    if (onNavigateToDoctors) {
      onNavigateToDoctors();
    } else {
      navigate('/doctors');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
        <Badge variant="blue">پزشکی مبتنی بر شواهد علمی</Badge>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">مجله، دانشنامه و راهنمای جامع سلامت همرا کلینیک</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          کلیه مقالات این بخش توسط هیئت تخصصی پزشکان همرا کلینیک بازبینی علمی شده و مطابق با آخرین دستورالعمل‌های بین‌المللی ارائه‌شده‌اند.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Article Content */}
        {activeArticle && (
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <img
              src={activeArticle.coverImage}
              alt={activeArticle.title}
              className="w-full h-64 object-cover rounded-2xl cursor-pointer"
              onClick={() => navigate(`/health/article/${activeArticle.slug}`)}
            />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="blue">{activeArticle.category}</Badge>
                <Badge variant="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  بازبینی علمی: {activeArticle.reviewerDoctorName}
                </Badge>
              </div>

              <h2 
                onClick={() => navigate(`/health/article/${activeArticle.slug}`)}
                className="text-2xl font-black text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {activeArticle.title}
              </h2>

              <div className="text-xs text-slate-400 flex items-center gap-4">
                <span>نویسنده: {activeArticle.authorDoctorName}</span>
                <span>•</span>
                <span>بروزرسانی: {activeArticle.updatedAt}</span>
                <span>•</span>
                <span>زمان مطالعه: {activeArticle.readTimeMinutes} دقیقه</span>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-100 pt-6">
              {activeArticle.content}
            </div>

            {/* CTA inside article */}
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-blue-950">نیاز به ویزیت با متخصص مربوطه دارید؟</h4>
                <p className="text-xs text-blue-800">امکان رزرو آنلاین نوبت حضوری و مشاوره تلفنی فراهم است.</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleBook}>
                رزرو نوبت پزشک
              </Button>
            </div>
          </div>
        )}

        {/* Sidebar Articles & Conditions */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-base text-slate-900">سایر مقالات برتر:</h3>
            <div className="space-y-3">
              {articles.map(art => (
                <div
                  key={art.id}
                  onClick={() => {
                    setActiveArticle(art);
                    navigate(`/health/article/${art.slug}`);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    activeArticle?.id === art.id
                      ? 'bg-blue-50 border-blue-300 font-bold text-blue-900'
                      : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="text-xs">{art.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{art.category}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Disease Guide Box */}
          {condition && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-3 shadow-lg border border-slate-800">
              <Badge variant="blue">دانشنامه بیماری‌ها</Badge>
              <h3 
                onClick={() => navigate(`/health/condition/${condition.slug}`)}
                className="font-extrabold text-base text-white hover:text-blue-300 transition-colors cursor-pointer"
              >
                {condition.persianTitle}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{condition.overview}</p>

              <div className="space-y-1 pt-2 text-xs">
                <span className="font-bold text-blue-300 block">علائم اصلی:</span>
                {condition.symptoms.slice(0, 3).map((sym, i) => (
                  <div key={i} className="text-slate-300">• {sym}</div>
                ))}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button variant="primary" size="sm" className="w-full" onClick={() => navigate(`/health/condition/${condition.slug}`)}>
                  مطالعه کامل راهنمای {condition.persianTitle}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
