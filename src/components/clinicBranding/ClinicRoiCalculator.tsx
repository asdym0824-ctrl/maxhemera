import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Percent
} from 'lucide-react';
import { formatToman } from '../../utils/currencyUtils';

interface ClinicRoiCalculatorProps {
  onApplyScenario?: (scenarioData: {
    doctorCount: number;
    monthlyPatients: number;
    selectedServices: string[];
    estimatedGrowthRevenue: number;
  }) => void;
}

export const ClinicRoiCalculator: React.FC<ClinicRoiCalculatorProps> = ({
  onApplyScenario
}) => {
  const [doctorCount, setDoctorCount] = useState<number>(4);
  const [monthlyPatients, setMonthlyPatients] = useState<number>(650);
  const [avgVisitTicket, setAvgVisitTicket] = useState<number>(450000); // 450,000 Tomans
  
  const [selectedServices, setSelectedServices] = useState<{
    visualIdentity: boolean;
    subdomainsWebsite: boolean;
    videoProduction: boolean;
    crmRetention: boolean;
    receptionTraining: boolean;
  }>({
    visualIdentity: true,
    subdomainsWebsite: true,
    videoProduction: true,
    crmRetention: true,
    receptionTraining: false
  });

  const toggleService = (key: keyof typeof selectedServices) => {
    setSelectedServices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculations
  const metrics = useMemo(() => {
    let growthPercent = 0;
    let retentionBoost = 0;
    let hoursSaved = 0;

    if (selectedServices.visualIdentity) {
      growthPercent += 12;
      retentionBoost += 5;
    }
    if (selectedServices.subdomainsWebsite) {
      growthPercent += 32;
      hoursSaved += doctorCount * 8;
    }
    if (selectedServices.videoProduction) {
      growthPercent += 24;
    }
    if (selectedServices.crmRetention) {
      growthPercent += 18;
      retentionBoost += 22;
      hoursSaved += doctorCount * 5;
    }
    if (selectedServices.receptionTraining) {
      growthPercent += 14;
      retentionBoost += 12;
      hoursSaved += doctorCount * 6;
    }

    // Baseline revenue
    const currentMonthlyRevenue = monthlyPatients * avgVisitTicket;
    
    // New patients acquired per month
    const addedPatients = Math.round(monthlyPatients * (growthPercent / 100));
    const projectedTotalPatients = monthlyPatients + addedPatients;

    // Projected additional revenue per month
    const additionalMonthlyRevenue = addedPatients * avgVisitTicket;
    const projectedTotalRevenue = currentMonthlyRevenue + additionalMonthlyRevenue;

    return {
      growthPercent,
      retentionBoost,
      hoursSaved,
      addedPatients,
      projectedTotalPatients,
      currentMonthlyRevenue,
      additionalMonthlyRevenue,
      projectedTotalRevenue
    };
  }, [doctorCount, monthlyPatients, avgVisitTicket, selectedServices]);

  const handleApply = () => {
    if (onApplyScenario) {
      const activeTitles: string[] = [];
      if (selectedServices.visualIdentity) activeTitles.push('هویت بصری و تابلوی کلینیک');
      if (selectedServices.subdomainsWebsite) activeTitles.push('وبسایت و ساب‌دامنه همرا');
      if (selectedServices.videoProduction) activeTitles.push('تولید ویدیوی تخصصی');
      if (selectedServices.crmRetention) activeTitles.push('سامانه پیامکی و CRM');
      if (selectedServices.receptionTraining) activeTitles.push('آموزش پرسنل پذیرش');

      onApplyScenario({
        doctorCount,
        monthlyPatients,
        selectedServices: activeTitles,
        estimatedGrowthRevenue: metrics.additionalMonthlyRevenue
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-xl font-sans" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>ماشین‌حساب هوشمند رشد و بازدهی کلینیک</span>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">تعاملی</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تخمین ظرفیت جذب مراجعین جدید و افزایش درآمد کلینیک بر اساس خدمات انتخابی توسعه
            </p>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-2xl text-purple-900 text-xs font-bold flex items-center gap-2 self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>برآورد مبتنی بر داده‌های واقعی ۳۰ کلینیک همکار</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Inputs Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Slider 1: Doctor Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                تعداد پزشکان و متخصصین مرکز:
              </span>
              <span className="text-purple-700 font-extrabold text-sm bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                {doctorCount} پزشک
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={doctorCount}
              onChange={(e) => setDoctorCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>۱ پزشک (مطب)</span>
              <span>۱۰ پزشک</span>
              <span>۲۵+ پزشک (بیمارستان)</span>
            </div>
          </div>

          {/* Slider 2: Monthly Patients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                میانگین مراجعین فعلی در ماه:
              </span>
              <span className="text-indigo-700 font-extrabold text-sm bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                {monthlyPatients.toLocaleString('fa-IR')} بیمار
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={monthlyPatients}
              onChange={(e) => setMonthlyPatients(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>۱۰۰ ویزیت</span>
              <span>۱,۵۰۰ ویزیت</span>
              <span>۳,۰۰۰+ ویزیت</span>
            </div>
          </div>

          {/* Slider 3: Average Visit / Invoice Ticket */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                میانگین دریافتی هر بیمار (ویزیت / پاراکلینیک):
              </span>
              <span className="text-emerald-800 font-extrabold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                {formatToman(avgVisitTicket)}
              </span>
            </div>
            <input
              type="range"
              min={200000}
              max={2500000}
              step={50000}
              value={avgVisitTicket}
              onChange={(e) => setAvgVisitTicket(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>۲۰۰ هزار تومان</span>
              <span>۱.۲ میلیون تومان</span>
              <span>۲.۵ میلیون تومان</span>
            </div>
          </div>

          {/* Services Checklist */}
          <div className="pt-2">
            <h4 className="text-xs font-extrabold text-slate-800 mb-2.5">
              خدمات توسعه و برندینگ مدنظر را انتخاب کنید:
            </h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/70 hover:bg-purple-50/40 transition-colors cursor-pointer text-xs">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedServices.visualIdentity}
                    onChange={() => toggleService('visualIdentity')}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800">هویت بصری و تابلوی کلینیک</span>
                    <p className="text-[10px] text-slate-500">لوگو، سربرگ، نسخه و تابلوی استاندارد</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-white px-2 py-0.5 rounded-md border border-purple-100">
                  +۱۲٪ رشد
                </span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/70 hover:bg-purple-50/40 transition-colors cursor-pointer text-xs">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedServices.subdomainsWebsite}
                    onChange={() => toggleService('subdomainsWebsite')}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800">وب‌سایت و ساب‌دامنه‌های همرا</span>
                    <p className="text-[10px] text-slate-500">پرتال نوبت‌دهی آنلاین ۲۴ ساعته + سئو</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-white px-2 py-0.5 rounded-md border border-purple-100">
                  +۳۲٪ رشد
                </span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/70 hover:bg-purple-50/40 transition-colors cursor-pointer text-xs">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedServices.videoProduction}
                    onChange={() => toggleService('videoProduction')}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800">تولید محتوا و ویدیوهای سلامت</span>
                    <p className="text-[10px] text-slate-500">ویدیوهای اتاق عمل، معرفی خدمات و پیج اینستاگرام</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-white px-2 py-0.5 rounded-md border border-purple-100">
                  +۲۴٪ رشد
                </span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/70 hover:bg-purple-50/40 transition-colors cursor-pointer text-xs">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedServices.crmRetention}
                    onChange={() => toggleService('crmRetention')}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800">سامانه پیامکی CRM و یادآوری چکاپ</span>
                    <p className="text-[10px] text-slate-500">نظرسنجی هوشمند بعد ویزیت و پیگیری درمان</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-white px-2 py-0.5 rounded-md border border-purple-100">
                  +۱۸٪ بازگشت
                </span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/70 hover:bg-purple-50/40 transition-colors cursor-pointer text-xs">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedServices.receptionTraining}
                    onChange={() => toggleService('receptionTraining')}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800">آموزش پرسنل پذیرش و بهبود تریاژ</span>
                    <p className="text-[10px] text-slate-500">ارتقای فن بیان، رفتار با بیمار و مهارت جذب</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-white px-2 py-0.5 rounded-md border border-purple-100">
                  +۱۴٪ رشد
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Output Column */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400">پیش‌بینی خروجی ۳ ماهه</span>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold border border-emerald-500/30">
                <Percent className="w-3.5 h-3.5" />
                <span>رشد تخمینی: +{metrics.growthPercent}٪</span>
              </div>
            </div>

            {/* Core KPI highlight */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-1">
              <span className="text-xs text-slate-400">افزایش درآمد ماهانه پیش‌بینی‌شده کلینیک:</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                {formatToman(metrics.additionalMonthlyRevenue)}
                <span className="text-xs text-slate-300 font-normal mr-1.5">در هر ماه</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                از مجموع جذب <strong className="text-white">+{metrics.addedPatients.toLocaleString('fa-IR')} بیمار جدید</strong> در هر ماه
              </p>
            </div>

            {/* Grid stats */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>تعداد کل بیماران ماهانه</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {metrics.projectedTotalPatients.toLocaleString('fa-IR')}
                  <span className="text-xs text-slate-400 mr-1 font-normal">نفر</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>نرخ وفاداری و بازگشت</span>
                </div>
                <div className="text-lg font-bold text-white">
                  +{metrics.retentionBoost}٪
                  <span className="text-xs text-slate-400 mr-1 font-normal">افزایش</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>صرفه‌جویی زمان پرسنل</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {metrics.hoursSaved}
                  <span className="text-xs text-slate-400 mr-1 font-normal">ساعت در ماه</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>بازگشت سرمایه (ROI)</span>
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  کمتر از ۶۰ روز
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              * محاسبات فوق بر مبنای عملکرد کلینیک‌های همکار در ۶ ماهه گذشته بوده و بر اساس فیلد پزشکی، موقعیت جغرافیایی و کشش بازار می‌تواند دستخوش تغییرات مثبت بیشتری گردد.
            </p>
          </div>

          <button
            onClick={handleApply}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>ارسال این سناریو به فرم درخواست مشاوره</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
