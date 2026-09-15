import React, { useState } from 'react';
import { ShieldCheck, ChevronLeft, Sparkles, CheckCircle2, Calculator, ArrowLeft } from 'lucide-react';
import { InsuranceFinderModal } from './InsuranceFinderModal';

interface Props {
  className?: string;
  compact?: boolean;
}

export const InsuranceBanner: React.FC<Props> = ({ className = '', compact = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInsuranceTag, setSelectedInsuranceTag] = useState<string | undefined>();

  const quickInsurances = [
    'تأمین اجتماعی',
    'بیمه ایران',
    'بیمه سلامت',
    'نیروهای مسلح (ساتا)',
    'بیمه دانا',
    'بیمه البرز',
    'بیمه پاسارگاد'
  ];

  const handleOpenWithInsurance = (insuranceName: string) => {
    setSelectedInsuranceTag(insuranceName);
    setIsModalOpen(true);
  };

  const handleOpenGeneral = () => {
    setSelectedInsuranceTag(undefined);
    setIsModalOpen(true);
  };

  if (compact) {
    return (
      <>
        <div 
          onClick={handleOpenGeneral}
          className={`bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg transition-all border border-blue-600/20 ${className}`}
          dir="rtl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">
              راهنمای بیمه: کدام پزشکان و شعب اطلاعات بیمه مرا ثبت کرده‌اند؟
            </h4>
            <p className="text-[11px] text-blue-200 mt-0.5">
              محاسبه تخمینی فرانشیز ویزیت و بررسی لیست پزشکان (نمایشی)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl shrink-0 transition-colors">
          <span>راهنمای بیمه</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </div>
      </div>

      <InsuranceFinderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialInsuranceName={selectedInsuranceTag}
      />
    </>
  );
}

return (
  <>
    <div 
      className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 border border-blue-600/20 shadow-xl ${className}`}
      dir="rtl"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Text Information */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-400/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>راهنمای بیمه‌ها و تعرفه‌ها (نسخه نمایشی)</span>
            </span>
            <span className="text-xs text-slate-300">محاسبات بر اساس تعرفه‌های ثبت‌شده</span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
            با بیمه درمانی خود، به کدام پزشک یا کلینیک مراجعه کنید؟
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            بررسی فهرست پزشکان و خدمات پشتیبانی‌شده بر اساس تعرفه ثبت‌شده. توجه: اطلاعات بیمه در نسخه فعلی نمایشی است و به سامانه آنلاین بیمه متصل نیست.
          </p>

            {/* Quick Insurance Tags */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">بیمه خود را انتخاب کنید:</span>
              {quickInsurances.map((insName, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOpenWithInsurance(insName)}
                  className="text-xs font-semibold bg-white/10 hover:bg-blue-600/40 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:border-blue-400 transition-all cursor-pointer"
                >
                  {insName}
                </button>
              ))}
            </div>
          </div>

          {/* Action Card Button */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={handleOpenGeneral}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Calculator className="w-4 h-4 text-white" />
              <span>مشاهده و محاسبه تخمینی پوشش بیمه</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-amber-300 font-medium bg-white/5 py-2 px-3 rounded-xl border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>محاسبات بیمه در نسخه فعلی نمایشی است</span>
            </div>
          </div>

        </div>
      </div>

      <InsuranceFinderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialInsuranceName={selectedInsuranceTag}
      />
    </>
  );
};
