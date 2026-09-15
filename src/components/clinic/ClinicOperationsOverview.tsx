import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  BarChart3, 
  DollarSign,
  CalendarCheck,
  ShieldCheck
} from 'lucide-react';
import { Appointment, Doctor } from '../../types';

interface ClinicOperationsOverviewProps {
  appointments: Appointment[];
  doctors: Doctor[];
  overview: any;
}

export const ClinicOperationsOverview: React.FC<ClinicOperationsOverviewProps> = ({
  appointments,
  doctors,
  overview
}) => {
  const total = appointments.length;
  const arrived = appointments.filter(a => a.status === 'arrived').length;
  const inVisit = appointments.filter(a => a.status === 'in_visit').length;
  const completed = appointments.filter(a => a.status === 'completed').length;
  const cancelled = appointments.filter(a => a.status === 'canceled' || a.status === 'no_show').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const noShowRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0.0';

  const computedRevenue = appointments
    .filter(a => a.paidStatus === 'paid')
    .reduce((sum, a) => sum + (a.fee || 0), 0);
  const displayRevenue = (computedRevenue || overview?.todayRevenue || 0).toLocaleString('fa-IR');

  return (
    <div id="clinic-operations-overview" className="space-y-5">
      {/* 4 Core Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>کل مراجعین امروز</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 flex items-baseline gap-1.5">
            {total}
            <span className="text-xs font-semibold text-blue-600">نوبت</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>تکمیل‌شده: {completed}</span>
            <span>در انتظار: {arrived}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>میانگین زمان انتظار بیمار</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-700 flex items-baseline gap-1.5">
            {overview?.estimatedAvgWaitMinutes ?? 0}
            <span className="text-xs font-semibold text-slate-400">دقیقه</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-600 font-bold pt-2 border-t border-slate-100">
            <span>{(overview?.estimatedAvgWaitMinutes || 0) <= 20 ? '✅ در محدوده استاندارد (زیر ۲۰ دقیقه)' : '⚠️ نیازمند بهینه‌سازی جریان پذیرش'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>نرخ لغو و عدم حضور (No-Show)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800 flex items-baseline gap-1.5">
            %{noShowRate}
            <span className="text-xs font-semibold text-slate-400">({cancelled} مورد)</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>تکمیل موفق ویزیت‌ها: {completionRate}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>درآمد خدمات شیفت امروز</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 flex items-baseline gap-1.5">
            {displayRevenue}
            <span className="text-xs font-semibold text-slate-400">تومان</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>تسویه آنلاین و پوز کلینیک</span>
          </div>
        </div>
      </div>

      {/* Realtime Doctor Room Occupancy & Department Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              وضعیت اشغال اتاق‌های ویزیت و بهره‌وری پزشکان
            </h3>
            <span className="text-xs text-slate-400">{doctors.length} پزشک فعال در شیفت جاری</span>
          </div>

          <div className="space-y-3.5">
            {doctors.map((doc, index) => {
              const docApps = appointments.filter(a => a.doctorId === doc.id);
              const docArrived = docApps.filter(a => a.status === 'arrived').length;
              const docInVisit = docApps.find(a => a.status === 'in_visit');
              const docCompleted = docApps.filter(a => a.status === 'completed').length;
              const docTotal = docApps.length;
              const percent = docTotal > 0 ? Math.min(100, Math.round((docCompleted / docTotal) * 100)) : 0;

              return (
                <div key={doc.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{doc.name}</div>
                        <div className="text-[11px] text-slate-500">{doc.specialtyName} — {doc.roomNumber || `اتاق ${101 + index}`}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {docInVisit ? (
                        <span className="bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-purple-200">
                          <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                          ویزیت بیمار: {docInVisit.patientName}
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
                          آماده پذیرش بیمار بعدی
                        </span>
                      )}

                      <span className="bg-amber-50 text-amber-900 border border-amber-200 font-bold px-2 py-1 rounded-lg">
                        {docArrived} در انتظار
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>پیشرفت نوبت‌ها: {docCompleted} از {docTotal} ویزیت</span>
                      <span className="font-bold">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottleneck Alert & Operational Recommendations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            تحلیل گلوگاه‌ها و پیشنهادهای بهینه‌سازی
          </h3>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1.5">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              تجمع نوبت در بخش گوارش (ساعت ۱۱:۳۰)
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              ۳ بیمار برای اندوسکوپی همزمان نوبت دارند. پیشنهاد: فاصله زمانی بین پذیرش‌ها به ۲۵ دقیقه تغییر یابد.
            </p>
          </div>

          <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs space-y-1.5">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              عملکرد عالی در سالن قلب و عروق
            </div>
            <p className="text-blue-800 text-[11px] leading-relaxed">
              زمان پذیرش دکتر حسینی میانگین ۱۰ دقیقه است و هیچ تأخیری ثبت نگردیده است.
            </p>
          </div>

          <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200 text-xs space-y-1.5">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
              پیشنهاد افزایش ظرفیت روزهای پنج‌شنبه
            </div>
            <p className="text-indigo-800 text-[11px] leading-relaxed">
              تقاضای نوبت‌های آنلاین آخر هفته ۲۰٪ فراتر از سقف پذیرش است.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
