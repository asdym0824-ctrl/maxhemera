import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ServiceItem } from '../types';
import { apiService } from '../services/apiService';
import { setSeoMetaData } from '../utils/seoUtils';
import { ArrowRight, Clock, ShieldCheck, Calendar, CheckCircle, FileText } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      apiService.getServiceBySlug(slug).then(srv => {
        setService(srv || null);
        if (srv) {
          setSeoMetaData(
            `${srv.title} | خدمات سلامت همرا کلینیک (HEMERA CLINIC)`,
            `جزئیات کامل، قیمت تعرفه، شرایط آمادگی و رزرو نوبت ${srv.title} در همرا کلینیک.`
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
        <p className="text-xs text-slate-500">در حال دریافت جزئیات خدمت کلینیک...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">خدمت مورد نظر یافت نشد</h2>
        <button
          onClick={() => navigate('/services')}
          className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به فهرست خدمات
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
          <Link to="/services" className="hover:underline">خدمات</Link> /
          <span className="text-slate-800 font-bold">{service.title}</span>
        </div>
        <button onClick={() => navigate('/services')} className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1">
          <ArrowRight className="w-4 h-4" />
          بازگشت به خدمات
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="blue">{service.category}</Badge>
          {service.popular && <Badge variant="emerald">پردرخواست‌ترین</Badge>}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold">{service.title}</h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          {service.description}
        </p>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              مدت زمان ارائه: {service.durationMinutes} دقیقه
            </span>
            <span className="flex items-center gap-1.5 font-bold text-blue-300 text-base">
              تعرفه: {service.price.toLocaleString('fa-IR')} تومان
            </span>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Calendar className="w-4 h-4" />}
            onClick={() => navigate('/doctors')}
          >
            رزرو این خدمت
          </Button>
        </div>
      </div>

      {/* Prerequisites & Instructions */}
      {service.prerequisites && service.prerequisites.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 p-6 rounded-2xl space-y-3 text-amber-950 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <FileText className="w-5 h-5 text-amber-600" />
            <span>آمادگی‌های قبل از مراجعه جهت انجام خدمت:</span>
          </div>
          <ul className="space-y-2 pt-1 text-slate-800 font-medium">
            {service.prerequisites.map((req, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-base">نیاز به راهنمایی تلفنی دارید؟</h3>
          <p className="text-xs text-slate-500">پذیرش مرکزی کلینیک آماده پاسخگویی به سوالات شماست</p>
        </div>
        <a
          href="tel:02188990000"
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shrink-0"
        >
          تماس با ۰۲۱-۸۸۹۹۰۰۰۰
        </a>
      </div>
    </div>
  );
};
