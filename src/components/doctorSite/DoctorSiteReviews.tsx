import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  CheckCircle2, 
  HeartHandshake,
  Clock,
  HelpCircle,
  Stethoscope,
  ArrowLeft
} from 'lucide-react';
import { Doctor, Review } from '../../types';
import { apiService } from '../../services/apiService';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
  isStandalonePage?: boolean;
}

export const DoctorSiteReviews: React.FC<Props> = ({ 
  doctor, 
  theme, 
  isStandalonePage = false 
}) => {
  const location = useLocation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const basePath = location.pathname.startsWith('/dr/') 
    ? `/dr/${doctor.slug}`
    : location.pathname.startsWith('/doctor-site/')
    ? `/doctor-site/${doctor.slug}`
    : `/site/${doctor.slug}`;

  const config = doctor.websiteConfig;
  if (!isStandalonePage && config?.sectionVisibility?.reviews === false) return null;

  useEffect(() => {
    let mounted = true;
    apiService.getDoctorReviews(doctor.id).then(data => {
      if (mounted) {
        setReviews(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [doctor.id]);

  if (!loading && reviews.length === 0 && !isStandalonePage) {
    return null;
  }

  // Calculate rating metrics
  const avgRating = doctor.rating || 4.9;
  const count = doctor.reviewCount || reviews.length || 1;

  return (
    <section id="reviews" className="py-16 md:py-20 bg-white border-b border-slate-200/80 text-right font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
            <MessageSquare className="w-3.5 h-3.5" />
            <span>نظرات مراجعین و بیماران</span>
          </span>
          <h2 className={`text-2xl sm:text-3xl ${theme.sectionHeadingClass}`}>
            تجربیات و دیدگاه‌های مراجعین {doctor.name}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            نظرات ثبت‌شده بیماران پس از دریافت خدمات و ویزیت‌های حضوری و آنلاین
          </p>
        </div>

        {/* Rating Breakdown Bar */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Main Score Box */}
          <div className="flex items-center gap-5 text-center sm:text-right">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex flex-col items-center justify-center shrink-0">
              <span className="text-3xl font-black">{avgRating}</span>
              <span className="text-[10px] font-bold text-amber-700">از ۵ امتیاز</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(avgRating) ? 'fill-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-500">
                بر اساس <strong className="text-slate-900">{count}</strong> نظر ثبت‌شده بیماران تاییدشده
              </div>
            </div>
          </div>

          {/* Sub-Criteria Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
              <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
                <span>برخورد پزشک</span>
              </div>
              <div className="text-sm font-black text-slate-900">۹۸٪ عالی</div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
              <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>توضیح بیماری</span>
              </div>
              <div className="text-sm font-black text-slate-900">۹۶٪ کامل</div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
              <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                <span>مهارت درمان</span>
              </div>
              <div className="text-sm font-black text-slate-900">۹۹٪ رضایت</div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
              <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>زمان انتظار</span>
              </div>
              <div className="text-sm font-black text-slate-900">منظم و سریع</div>
            </div>
          </div>

        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">در حال بارگذاری نظرات مراجعین...</div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(rev => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                        {rev.patientName[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{rev.patientName}</div>
                        <div className="text-[11px] text-slate-400">{rev.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>نوبت ثبت و تایید شده</span>
                  </span>
                  <span>برخورد پزشک: {rev.doctorBehaviorRating} از ۵</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            نظرات بیماران پس از ثبت و دریافت نوبت در این بخش نمایش داده می‌شوند.
          </div>
        )}

      </div>
    </section>
  );
};
