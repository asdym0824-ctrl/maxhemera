import React from 'react';
import { 
  Calendar, 
  Video, 
  Star, 
  Award, 
  MapPin, 
  Clock, 
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { Doctor } from '../../types';
import { ThemeStyles } from './themeConfig';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
  onBookInPerson: () => void;
  onBookOnline: () => void;
}

export const DoctorSiteHero: React.FC<Props> = ({
  doctor,
  theme,
  onBookInPerson,
  onBookOnline
}) => {
  const config = doctor.websiteConfig;
  const isDarkHero = theme.id === 'modern-specialist' || theme.id === 'tech-innovative';

  return (
    <section id="hero" className={`relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 ${theme.heroBg}`}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-sky-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Right Column (Text Content & Actions) in RTL */}
          <div className="lg:col-span-7 space-y-6 text-right">
            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${theme.heroBadgeBg || theme.badgeBg}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>کد نظام پزشکی: {doctor.medicalCouncilNumber}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>{doctor.experienceYears} سال تجربه بالینی</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{doctor.rating}</span>
                <span className="text-amber-700 font-normal">({doctor.reviewCount} نظر)</span>
              </span>
            </div>

            {/* Doctor Name & Titles */}
            <div className="space-y-3">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight ${theme.heroText}`}>
                {doctor.name}
              </h1>
              <p className={`text-lg sm:text-xl font-semibold ${isDarkHero ? 'text-blue-300' : 'text-blue-800'}`}>
                {config?.heroTitle || doctor.title}
              </p>
            </div>

            {/* Subtitle / Introduction */}
            <p className={`text-base sm:text-lg leading-relaxed ${isDarkHero ? 'text-slate-300' : 'text-slate-600'}`}>
              {config?.heroSubtitle || config?.shortIntroduction || doctor.bio}
            </p>

            {/* Highlight Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className={`flex items-start gap-2.5 p-3 rounded-xl ${isDarkHero ? 'bg-white/5 border border-white/10' : 'bg-slate-50/80 border border-slate-200/60'}`}>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <div className={`font-bold ${isDarkHero ? 'text-white' : 'text-slate-900'}`}>اولین نوبت خالی</div>
                  <div className={isDarkHero ? 'text-slate-400' : 'text-slate-500'}>{doctor.nextAvailableSlot}</div>
                </div>
              </div>

              <div className={`flex items-start gap-2.5 p-3 rounded-xl ${isDarkHero ? 'bg-white/5 border border-white/10' : 'bg-slate-50/80 border border-slate-200/60'}`}>
                <Clock className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <div className={`font-bold ${isDarkHero ? 'text-white' : 'text-slate-900'}`}>بیمه‌های طرف قرارداد</div>
                  <div className={`${isDarkHero ? 'text-slate-400' : 'text-slate-500'} line-clamp-1`}>
                    {doctor.supportedInsurances.slice(0, 3).join('، ')} و ...
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <button
                onClick={onBookInPerson}
                className={`flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-base font-black ${theme.primaryButton}`}
              >
                <Calendar className="w-5 h-5" />
                <span>دریافت نوبت ویزیت حضوری</span>
              </button>

              {doctor.hasOnlineConsultation && (
                <button
                  onClick={onBookOnline}
                  className={`flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-bold ${theme.secondaryButton}`}
                >
                  <Video className="w-5 h-5 text-blue-400" />
                  <span>مشاوره آنلاین تصویری</span>
                </button>
              )}
            </div>

            {/* Quick jump anchor */}
            <div className="pt-2">
              <a 
                href="#about" 
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${isDarkHero ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'} transition-colors`}
              >
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                <span>مشاهده سوابق علمی، خدمات و آدرس مطب‌ها</span>
              </a>
            </div>
          </div>

          {/* Left Column (Doctor Visual Card) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Glow backdrop */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-sky-500 rounded-3xl blur-md opacity-30 group-hover:opacity-100 transition duration-1000" />

              {/* Main Card Container */}
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
                {/* Doctor Portrait Image */}
                <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-slate-100">
                  <img
                    src={config?.heroImage || doctor.avatar}
                    alt={doctor.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Floating Doctor Details on Image */}
                  <div className="absolute bottom-4 right-4 left-4 text-white">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{doctor.specialtyName}</span>
                    </div>
                    <div className="text-xl font-bold">{doctor.name}</div>
                    <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{doctor.city} • {doctor.offices?.[0]?.title || 'مطب مرکزی'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Quick Info Strip */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-3 divide-x divide-x-reverse divide-slate-200 text-center">
                  <div className="px-2">
                    <div className="text-xs text-slate-500">رضایت مراجعین</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{Math.round((doctor.rating / 5) * 100)}٪</div>
                  </div>
                  <div className="px-2">
                    <div className="text-xs text-slate-500">سابقه کار</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{doctor.experienceYears} سال</div>
                  </div>
                  <div className="px-2">
                    <div className="text-xs text-slate-500">نوبت‌های آنلاین</div>
                    <div className="text-sm font-black text-emerald-600 mt-0.5">فعال و فوری</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
