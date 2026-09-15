import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Send, 
  Instagram, 
  Linkedin, 
  Globe, 
  AlertTriangle,
  HeartHandshake,
  Home
} from 'lucide-react';
import { Doctor } from '../../types';
import { ThemeStyles } from './themeConfig';
import { getDoctorSubdomain, HAMRAH_MAIN_DOMAIN } from '../../utils/doctorWebsiteUtils';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
}

export const DoctorSiteFooter: React.FC<Props> = ({ doctor, theme }) => {
  const location = useLocation();
  const config = doctor.websiteConfig;
  const socials = config?.socialLinks;

  const basePath = location.pathname.startsWith('/dr/') 
    ? `/dr/${doctor.slug}`
    : location.pathname.startsWith('/doctor-site/')
    ? `/doctor-site/${doctor.slug}`
    : `/site/${doctor.slug}`;

  return (
    <footer className={`${theme.footerBg} pt-16 pb-12 text-right border-t border-slate-800`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Col 1: Doctor Identity & Summary */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-600/40"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-lg font-black text-white">{doctor.name}</h3>
                <p className="text-xs text-blue-400 font-medium">{doctor.title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {config?.shortIntroduction || doctor.bio}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>شماره نظام پزشکی: <span className="font-mono text-slate-200">{doctor.medicalCouncilNumber}</span></span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white">دسترسی سریع</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to={`${basePath}/about`} className="hover:text-white transition-colors">درباره پزشک و سوابق</Link></li>
              <li><Link to={`${basePath}/services`} className="hover:text-white transition-colors">خدمات و اقدامات تخصصی</Link></li>
              <li><Link to={`${basePath}/conditions`} className="hover:text-white transition-colors">بیماری‌ها و حوزه‌های درمان</Link></li>
              <li><Link to={`${basePath}/achievements`} className="hover:text-white transition-colors">افتخارات و مدارک</Link></li>
              <li><Link to={`${basePath}/articles`} className="hover:text-white transition-colors">مقالات و آموزش سلامت</Link></li>
              <li><Link to={`${basePath}/reviews`} className="hover:text-white transition-colors">نظرات بیماران</Link></li>
              <li><Link to={`${basePath}/offices`} className="hover:text-white transition-colors">آدرس مطب و ساعات حضور</Link></li>
              <li><Link to={`${basePath}/faq`} className="hover:text-white transition-colors">پرسش‌های متداول</Link></li>
              <li><Link to={`${basePath}/contact`} className="hover:text-white transition-colors">تماس با مطب</Link></li>
            </ul>
          </div>

          {/* Col 3: Social & Communication */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-sm font-bold text-white">ارتباط در شبکه‌های اجتماعی</h4>
            <p className="text-xs text-slate-400">
              جهت اطلاع از آخرین اخبار مطب و ویدیوهای آموزشی می‌توانید صفحات رسمی پزشک را دنبال فرمایید:
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              {socials?.instagram && (
                <a
                  href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socials?.telegram && (
                <a
                  href={`https://t.me/${socials.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-sky-900/50 text-slate-300 hover:text-sky-300 border border-slate-700 transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
              {socials?.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-blue-900/50 text-slate-300 hover:text-blue-300 border border-slate-700 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {socials?.website && (
                <a
                  href={socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-blue-900/50 text-slate-300 hover:text-blue-300 border border-slate-700 transition-colors"
                  aria-label="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="pt-2">
              <Link
                to={`/doctors/${doctor.slug}`}
                className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>مشاهده پروفایل در پلتفرم جامع همرا کلینیک</span>
                <HeartHandshake className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Emergency Medical Warning Notice */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-300/90 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>توجه پزشکی مهم:</strong> اطلاعات مندرج در این وبسایت صرفاً جنبه آموزشی و اطلاع‌رسانی دارد و هرگز جایگزین تشخیص و توصیه پزشک معالج در شرایط اورژانسی نمی‌باشد. در صورت بروز هرگونه علائم حیاتی حاد یا اورژانس پزشکی، فوراً با اورژانس ۱۱۵ تماس حاصل فرمایید.
          </p>
        </div>

        {/* Bottom Platform Credit */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <span>وبسایت رسمی {doctor.name} • کلیه حقوق محفوظ است © {new Date().toLocaleDateString('fa-IR')}</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="inline-flex items-center gap-1.5 text-blue-400 font-mono" dir="ltr">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{getDoctorSubdomain(doctor)}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">شبکه وبسایت‌های پزشکی</span>
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white font-bold transition-colors"
              title="ورود به سایت اصلی همرا"
            >
              <Home className="w-3.5 h-3.5" />
              <span>سایت اصلی همرا</span>
              <span className="text-blue-200 font-mono text-[11px]" dir="ltr">({HAMRAH_MAIN_DOMAIN})</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
