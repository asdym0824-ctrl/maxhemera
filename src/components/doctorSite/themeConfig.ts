import { DoctorWebsiteTheme } from '../../types';

export interface ThemeStyles {
  id: DoctorWebsiteTheme;
  name: string;
  description: string;
  heroBg: string;
  heroText: string;
  heroBadgeBg: string;
  badgeBg: string;
  badgeText: string;
  primaryButton: string;
  secondaryButton: string;
  cardBg: string;
  cardBorder: string;
  accentIconColor: string;
  sectionHeadingClass: string;
  footerBg: string;
}

export const THEME_CONFIGS: Record<DoctorWebsiteTheme, ThemeStyles> = {
  'clinical-minimal': {
    id: 'clinical-minimal',
    name: 'مینی‌مال بالینی (Clinical Minimal)',
    description: 'طراحی سفید، خلوت، خطوط دقیق و تمرکز بالا بر رزرو و اطلاعات علمی مطب',
    heroBg: 'bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200/80',
    heroText: 'text-slate-900',
    heroBadgeBg: 'bg-emerald-50 border border-emerald-200/90 text-emerald-900 shadow-2xs font-bold',
    badgeBg: 'bg-emerald-50 border border-emerald-200/90 text-emerald-900 shadow-2xs font-bold',
    badgeText: 'text-emerald-800',
    primaryButton: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all',
    secondaryButton: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all',
    cardBg: 'bg-white hover:border-slate-300 transition-all',
    cardBorder: 'border border-slate-200/80',
    accentIconColor: 'text-emerald-600',
    sectionHeadingClass: 'text-slate-900 font-black',
    footerBg: 'bg-slate-900 text-slate-300'
  },
  'modern-specialist': {
    id: 'modern-specialist',
    name: 'متخصص مدرن (Modern Specialist)',
    description: 'تم حرفه‌ای با ترکیبی از سرمه‌ای تیره، بنفش و فیروزه‌ای مناسب فوق تخصص‌ها و کلینیک‌های پیشرفته',
    heroBg: 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border-b border-blue-800/40',
    heroText: 'text-white',
    heroBadgeBg: 'bg-blue-600/20 border border-blue-400/40 text-blue-200 font-bold',
    badgeBg: 'bg-blue-50 border border-blue-200/90 text-blue-900 shadow-2xs font-bold',
    badgeText: 'text-blue-800',
    primaryButton: 'bg-blue-600 hover:bg-blue-600 text-white shadow-md hover:shadow-blue-600/20 transition-all',
    secondaryButton: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all',
    cardBg: 'bg-white hover:border-blue-300 hover:shadow-md transition-all',
    cardBorder: 'border border-slate-200/80',
    accentIconColor: 'text-blue-600',
    sectionHeadingClass: 'text-slate-900 font-black',
    footerBg: 'bg-slate-950 text-slate-300'
  },
  'warm-care': {
    id: 'warm-care',
    name: 'مراقبت گرم و خانوادگی (Warm Care)',
    description: 'رنگ‌های گرم و آرامش‌بخش، انحناهای نرم، مناسب اطفال، پوست، زنان و روانپزشکی',
    heroBg: 'bg-gradient-to-b from-amber-50/60 via-blue-50/40 to-white border-b border-amber-100',
    heroText: 'text-slate-900',
    heroBadgeBg: 'bg-amber-100/90 border border-amber-200 text-amber-950 shadow-2xs font-bold',
    badgeBg: 'bg-amber-50 border border-amber-200/90 text-amber-950 shadow-2xs font-bold',
    badgeText: 'text-amber-800',
    primaryButton: 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm hover:shadow-md transition-all',
    secondaryButton: 'bg-white hover:bg-amber-50/50 text-slate-700 border border-amber-200/80 transition-all',
    cardBg: 'bg-white hover:border-amber-200 hover:shadow-sm transition-all rounded-2xl',
    cardBorder: 'border border-amber-100/90',
    accentIconColor: 'text-blue-700',
    sectionHeadingClass: 'text-slate-900 font-black',
    footerBg: 'bg-stone-900 text-stone-300'
  },
  'tech-innovative': {
    id: 'tech-innovative',
    name: 'فناوری و جراحی پیشرفته (Tech Innovative)',
    description: 'تم آبی فیوچرستیک و مدرن مناسب جراحان، ارتوپدی و متخصصین تجهیزات پیشرفته',
    heroBg: 'bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white border-b border-sky-800/30',
    heroText: 'text-white',
    heroBadgeBg: 'bg-sky-500/20 border border-sky-400/40 text-sky-200 font-bold',
    badgeBg: 'bg-sky-50 border border-sky-200/90 text-sky-950 shadow-2xs font-bold',
    badgeText: 'text-sky-800',
    primaryButton: 'bg-sky-600 hover:bg-sky-500 text-white shadow-md hover:shadow-sky-500/20 transition-all',
    secondaryButton: 'bg-slate-800/80 hover:bg-slate-800 text-sky-100 border border-sky-700/50 transition-all',
    cardBg: 'bg-white hover:border-sky-300 hover:shadow-md transition-all',
    cardBorder: 'border border-slate-200/80',
    accentIconColor: 'text-sky-600',
    sectionHeadingClass: 'text-slate-900 font-black',
    footerBg: 'bg-slate-950 text-slate-300'
  }
};

export function getThemeConfig(themeName?: DoctorWebsiteTheme): ThemeStyles {
  if (themeName && THEME_CONFIGS[themeName]) {
    return THEME_CONFIGS[themeName];
  }
  return THEME_CONFIGS['modern-specialist'];
}
