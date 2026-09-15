import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  MessageCircleQuestion,
  Info
} from 'lucide-react';
import { Doctor, DoctorFAQ } from '../../types';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
}

export const DoctorSiteFAQ: React.FC<Props> = ({ doctor, theme }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const config = doctor.websiteConfig;
  if (config?.sectionVisibility?.faq === false) return null;

  const defaultFaqs: DoctorFAQ[] = [
    {
      id: 'df-1',
      question: `چگونه برای اولین ویزیت نزد ${doctor.name} نوبت بگیرم؟`,
      answer: `می‌توانید به سادگی از طریق دکمه «دریافت نوبت ویزیت» در بالای همین صفحه، روز و ساعت مدنظر خود را انتخاب کرده و کد پیگیری آنلاین دریافت کنید. همچنین امکان رزرو نوبت تلفنی نیز برقرار است.`,
      category: 'نوبت‌دهی'
    },
    {
      id: 'df-2',
      question: 'آیا امکان دریافت نسخه الکترونیک در ویزیت آنلاین وجود دارد؟',
      answer: 'بله، در پایان مشاوره آنلاین تصویری یا متنی، پزشک نسخه الکترونیک (شامل داروها، آزمایش‌ها و تصویربرداری) را مستقیماً در سامانه تأمین اجتماعی یا بیمه سلامت ثبت می‌نماید که در تمام داروخانه‌های کشور با ارائه کد ملی قابل دریافت است.',
      category: 'مشاوره آنلاین'
    },
    {
      id: 'df-3',
      question: 'چه مدارک پزشکی را در جلسه ویزیت به همراه داشته باشم؟',
      answer: 'لطفاً آخرین آزمایش‌های خون، تصاویر رادیولوژی یا سونوگرافی قبلی و فهرست دقیق داروهایی که در حال حاضر مصرف می‌کنید را همراه داشته باشید.',
      category: 'آمادگی ویزیت'
    }
  ];

  const faqs = (doctor.faqs && doctor.faqs.length > 0) ? doctor.faqs : defaultFaqs;

  return (
    <section id="faq" className="py-16 md:py-20 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
            <MessageCircleQuestion className="w-3.5 h-3.5" />
            <span>پاسخ به سوالات رایج</span>
          </span>
          <h2 className={`text-2xl sm:text-3xl ${theme.sectionHeadingClass}`}>
            پرسش‌های متداول بیماران
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            پاسخ به سوالات پرتکرار پیرامون نحوه ویزیت، آمادگی قبل از مراجعه و مشاوره‌های آنلاین
          </p>
        </div>

        {/* Accordion FAQ Items */}
        <div className="space-y-4 text-right">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id || idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-right flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className={`w-5 h-5 shrink-0 ${isOpen ? theme.accentIconColor : 'text-slate-400'}`} />
                    <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                    <p className="pt-2">{faq.answer}</p>
                    {faq.category && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                        <Info className="w-3 h-3" />
                        <span>دسته‌بندی: {faq.category}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
