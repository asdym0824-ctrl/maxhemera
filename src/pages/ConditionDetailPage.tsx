import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DiseaseCondition } from '../types';
import { apiService } from '../services/apiService';
import { setSeoMetaData } from '../utils/seoUtils';
import { ArrowRight, Activity, AlertTriangle, Stethoscope, CheckCircle, HelpCircle } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const ConditionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [condition, setCondition] = useState<DiseaseCondition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      apiService.getDiseaseBySlug(slug).then(cond => {
        setCondition(cond || null);
        if (cond) {
          setSeoMetaData(
            `علائم، تشخیص و درمان ${cond.persianTitle} (${cond.title}) | دانشنامه سلامت همرا کلینیک`,
            cond.overview || `راهنمای جامع علائم، علل بروز، روش‌های تشخیص و درمان بیماری ${cond.persianTitle} در همرا کلینیک.`
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
        <p className="text-xs text-slate-500">در حال دریافت راهنمای بالینی بیماری...</p>
      </div>
    );
  }

  if (!condition) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">اطلاعات بیماری مورد نظر یافت نشد</h2>
        <button
          onClick={() => navigate('/health')}
          className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به دانشنامه سلامت
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
          <Link to="/health" className="hover:underline">دانشنامه سلامت</Link> /
          <span className="text-slate-800 font-bold">{condition.persianTitle}</span>
        </div>
        <button onClick={() => navigate('/health')} className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1">
          <ArrowRight className="w-4 h-4" />
          بازگشت به دانشنامه
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 space-y-4">
        <Badge variant="blue">راهنمای تخصصی بیماری‌ها</Badge>
        <h1 className="text-2xl sm:text-4xl font-extrabold">{condition.persianTitle}</h1>
        <p className="text-sm text-slate-400 font-medium">نام بین‌المللی: {condition.title}</p>
        <p className="text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
          {condition.overview}
        </p>
      </div>

      {/* Warning Box */}
      {condition.whenToSeeDoctor && (
        <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-start gap-3 text-rose-950 text-xs sm:text-sm font-medium">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-rose-900 font-bold mb-1">چه زمانی باید فوراً به پزشک مراجعه کنید؟</strong>
            {condition.whenToSeeDoctor}
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symptoms */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>علائم شایع بیماری</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {condition.symptoms.map((symptom, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Causes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <HelpCircle className="w-5 h-5 text-sky-600" />
            <span>علل و عوامل زمینه‌ساز</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {condition.causes.map((cause, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Diagnosis */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
            <span>روش‌های تشخیص پزشکی</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {condition.diagnosisMethods.map((diag, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>{diag}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Treatments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>روش‌های درمان و مدیریت</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {condition.treatments.map((treat, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{treat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-blue-700 to-sky-800 text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-1 text-center sm:text-right">
          <h3 className="text-xl font-bold">می‌خواهید با پزشک متخصص مشاوره کنید؟</h3>
          <p className="text-xs text-blue-100">رزرو نوبت حضوری یا مشاوره تلفنی فوری در کمتر از ۲ دقیقه</p>
        </div>
        <button
          onClick={() => navigate('/doctors')}
          className="bg-white text-blue-900 font-bold px-6 py-3 rounded-2xl hover:bg-blue-50 transition-colors shadow-md cursor-pointer shrink-0"
        >
          رزرو نوبت متخصص
        </button>
      </div>
    </div>
  );
};
