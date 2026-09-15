import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceItem } from '../types';
import { apiService } from '../services/apiService';
import { setSeoMetaData } from '../utils/seoUtils';
import { Activity, ArrowLeft } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const ServicesPage: React.FC<{ onBookService?: () => void }> = ({ onBookService }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    setSeoMetaData(
      'خدمات درمانی و چکاپ‌های سلامت | همرا کلینیک',
      'فهرست کامل خدمات پاراکلینیک، چکاپ‌های دوره‌ای سلامت، نوار قلب، اکو، سونوگرافی و تست‌های تشخیصی در همرا کلینیک.'
    );
    apiService.getServices().then(setServices);
  }, []);

  const handleBook = (slug: string) => {
    if (onBookService) {
      onBookService();
    } else {
      navigate(`/services/${slug}`);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
        <Badge variant="blue">پاراکلینیک و چکاپ تخصصی</Badge>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">خدمات جامع درمانی و چکاپ‌های سلامت همرا کلینیک</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          ارائه کلیه خدمات پاراکلینیک، چکاپ سالانه، آزمایشگاه تخصصی، سونوگرافی و مشاوره آنلاین با تعرفه‌های دقیق مصوب.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(srv => (
          <div key={srv.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Activity className="w-6 h-6" />
                </div>
                {srv.popular && <Badge variant="amber">پرمخاطب</Badge>}
              </div>

              <h3 
                onClick={() => navigate(`/services/${srv.slug}`)}
                className="font-bold text-lg text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {srv.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{srv.description}</p>

              {srv.prerequisites && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block">پیش‌نیازها و ناشتایی:</span>
                  {srv.prerequisites.map((p, i) => (
                    <div key={i}>• {p}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">هزینه تعرفه:</span>
                <span className="font-extrabold text-base text-slate-900">
                  {srv.price.toLocaleString('fa-IR')} تومان
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleBook(srv.slug)}
                icon={<ArrowLeft className="w-3 h-3" />}
              >
                رزرو و اطلاعات
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
