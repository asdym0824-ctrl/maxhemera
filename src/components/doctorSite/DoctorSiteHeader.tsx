import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Phone, 
  Menu, 
  X, 
  ExternalLink,
  ShieldCheck, 
  Video, 
  User, 
  ChevronDown,
  Home,
  Globe
} from 'lucide-react';
import { Doctor } from '../../types';
import { ThemeStyles } from './themeConfig';
import { useAuth } from '../../context/AuthContext';
import { getDoctorSubdomain } from '../../utils/doctorWebsiteUtils';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
  onBookClick: () => void;
  onOpenAccountModal?: () => void;
  activeSubpage?: string;
  onNavigateSubpage?: (targetSubpage: string) => void;
  hasArticles?: boolean;
}

export const DoctorSiteHeader: React.FC<Props> = ({ 
  doctor, 
  theme, 
  onBookClick, 
  onOpenAccountModal,
  activeSubpage = 'home',
  onNavigateSubpage,
  hasArticles = true
}) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const basePath = location.pathname.startsWith('/dr/') 
    ? `/dr/${doctor.slug}`
    : location.pathname.startsWith('/doctor-site/')
    ? `/doctor-site/${doctor.slug}`
    : `/site/${doctor.slug}`;

  const config = doctor.websiteConfig;
  const visibility = config?.sectionVisibility;

  // Build list of valid navigation links based on doctor's actual content
  const allNavLinks = [
    { id: 'home', label: 'صفحه اصلی', href: basePath, show: true },
    { id: 'about', label: 'درباره پزشک', href: `${basePath}/about`, show: visibility?.about !== false },
    { 
      id: 'services', 
      label: 'خدمات تخصصی', 
      href: `${basePath}/services`, 
      show: visibility?.services !== false && ((doctor.detailedServices && doctor.detailedServices.length > 0) || (doctor.services && doctor.services.length > 0))
    },
    { id: 'conditions', label: 'حوزه‌های درمان', href: `${basePath}/conditions`, show: true },
    { 
      id: 'articles', 
      label: 'مقالات آموزشی', 
      href: `${basePath}/articles`, 
      show: visibility?.articles !== false && hasArticles 
    },
    { 
      id: 'videos', 
      label: 'ویدئوها و مدیا', 
      href: `${basePath}/videos`, 
      show: true
    },
    { 
      id: 'achievements', 
      label: 'افتخارات و مدارک', 
      href: `${basePath}/achievements`, 
      show: visibility?.achievements !== false && ((doctor.achievements && doctor.achievements.length > 0) || (doctor.education && doctor.education.length > 0))
    },
    { 
      id: 'reviews', 
      label: 'نظرات بیماران', 
      href: `${basePath}/reviews`, 
      show: visibility?.reviews !== false && ((doctor.reviewCount && doctor.reviewCount > 0) || doctor.rating > 0)
    },
    { 
      id: 'offices', 
      label: 'مطب‌ها و ساعات', 
      href: `${basePath}/offices`, 
      show: visibility?.offices !== false && ((doctor.offices && doctor.offices.length > 0) || !!doctor.address)
    },
    { 
      id: 'faq', 
      label: 'پرسش‌های متداول', 
      href: `${basePath}/faq`, 
      show: visibility?.faq !== false && ((doctor.faqs && doctor.faqs.length > 0) || (config?.faqs && config.faqs.length > 0))
    },
    { id: 'contact', label: 'تماس با مطب', href: `${basePath}/contact`, show: true }
  ];

  const navLinks = allNavLinks.filter(l => l.show);
  const primaryPhone = config?.phone || doctor.offices?.[0]?.phone;
  const isPatientLoggedIn = !!currentUser && currentUser.id;

  const isLinkActive = (id: string) => {
    if (id === 'home') {
      return activeSubpage === 'home' || activeSubpage === '';
    }
    if (id === 'services') {
      return activeSubpage === 'services' || activeSubpage === 'service-detail';
    }
    if (id === 'conditions') {
      return activeSubpage === 'conditions' || activeSubpage === 'condition-detail';
    }
    if (id === 'articles') {
      return activeSubpage === 'articles' || activeSubpage === 'article-detail';
    }
    return activeSubpage === id;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all font-sans" dir="rtl">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>پزشک تأیید شده همرا کلینیک • کد نظام پزشکی: {doctor.medicalCouncilNumber}</span>
            </span>
            {doctor.hasOnlineConsultation && (
              <span className="hidden sm:inline-flex items-center gap-1 text-blue-300">
                <Video className="w-3 h-3" />
                <span>ویزیت آنلاین تصویری فعال</span>
              </span>
            )}
            <span 
              className="hidden md:inline-flex items-center gap-1.5 bg-slate-800 text-blue-300 px-2 py-0.5 rounded-md border border-slate-700/80 text-[11px] font-mono" 
              dir="ltr"
              title="نشانی ساب‌دامنه رسمی در سامانه همرا"
            >
              <Globe className="w-3 h-3 text-blue-400" />
              <span>{getDoctorSubdomain(doctor)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Direct Link to Main Site (Hamrah) */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
              title="انتقال به سایت اصلی همرا"
            >
              <Home className="w-3.5 h-3.5 text-white" />
              <span>سایت اصلی همرا</span>
              <span className="text-[10px] text-blue-100 font-mono hidden sm:inline" dir="ltr">(hamrah.ir)</span>
            </Link>
            
            <Link 
              to={`/doctors/${doctor.slug}`}
              className="hover:text-white inline-flex items-center gap-1 text-slate-400 transition-colors text-xs"
            >
              <span className="hidden sm:inline">پروفایل در مارکت‌پلیس</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Doctor Brand Identity */}
          <Link 
            to={basePath}
            className="flex items-center gap-3.5 group text-right cursor-pointer"
          >
            <div className="relative">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-600 transition-all shadow-xs"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                {doctor.name}
              </div>
              <div className="text-xs text-slate-500 font-medium line-clamp-1 max-w-[200px] sm:max-w-[280px]">
                {doctor.title}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-4 text-xs font-semibold text-slate-600">
            {navLinks.slice(0, 8).map(link => {
              const active = isLinkActive(link.id);
              return (
                <Link
                  key={link.id}
                  to={link.href}
                  className={`py-2 px-1 transition-colors cursor-pointer relative ${
                    active
                      ? 'text-blue-700 font-bold border-b-2 border-blue-600'
                      : 'hover:text-blue-700'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Patient Account */}
          <div className="hidden md:flex items-center gap-3">
            {primaryPhone && (
              <a
                href={`tel:${primaryPhone.replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span dir="ltr">{primaryPhone}</span>
              </a>
            )}

            {/* Patient Auth Button */}
            {isPatientLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => onOpenAccountModal ? onOpenAccountModal() : setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-blue-700" />
                  <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-blue-600" />
                </button>
              </div>
            ) : (
              <Link
                to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>ورود / عضویت</span>
              </Link>
            )}

            {/* Appointment CTA */}
            <button
              onClick={onBookClick}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer ${theme.primaryButton}`}
            >
              <Calendar className="w-4 h-4" />
              <span>دریافت نوبت ویزیت</span>
            </button>
          </div>

          {/* Mobile Menu & Quick Book Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onBookClick}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${theme.primaryButton}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>نوبت‌دهی</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto">
          {/* Patient Account Section in Mobile */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            {isPatientLoggedIn ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono" dir="ltr">{currentUser.phone}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAccountModal) onOpenAccountModal();
                  }}
                  className="text-xs text-blue-700 font-bold hover:underline"
                >
                  پنل نوبت‌ها
                </button>
              </div>
            ) : (
              <Link
                to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>ورود به حساب بیمار همرا کلینیک</span>
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navLinks.map(link => {
              const active = isLinkActive(link.id);
              return (
                <Link
                  key={link.id}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-right p-2.5 rounded-xl font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Direct Phone */}
          {primaryPhone && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">شماره مستقیم مطب:</span>
              <a href={`tel:${primaryPhone.replace(/[^0-9]/g, '')}`} className="font-mono font-bold text-slate-900" dir="ltr">
                {primaryPhone}
              </a>
            </div>
          )}

          {/* Subdomain & Main Site Navigation */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>ساب‌دامنه رسمی:</span>
              </span>
              <span className="font-mono font-bold text-blue-700 text-[11px]" dir="ltr">
                {getDoctorSubdomain(doctor)}
              </span>
            </div>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-between transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-400" />
                <span>بازگشت به سایت اصلی همرا</span>
              </div>
              <span className="text-[11px] text-slate-300 font-mono" dir="ltr">hamrah.ir</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
