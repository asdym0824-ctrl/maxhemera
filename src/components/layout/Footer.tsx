import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Heart, Phone, MapPin, Mail, ShieldCheck, Clock, ChevronLeft, Activity, Lock, Cpu, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MedicalVectorPattern } from '../common/medicalPattern/MedicalVectorPattern';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isLoggedIn } = useAuth();

  const isStaffWorkspace = 
    location.pathname.startsWith('/doctor') ||
    location.pathname.startsWith('/secretary') ||
    location.pathname.startsWith('/clinic') ||
    location.pathname.startsWith('/admin');

  // Minimal professional status footer for staff workspaces
  if (isStaffWorkspace && isLoggedIn && currentUser.role !== 'patient') {
    return (
      <footer className="bg-slate-950 text-slate-400 py-4 border-t border-slate-800/80 mt-12 text-xs font-sans" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Activity className="w-4 h-4 text-blue-400" />
              سامانه سلامت همرا کلینیک (HEMERA CLINIC)
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              محیط کاربری پرسنل درمانی و اداری • توسعه‌یافته توسط هلدینگ HEMERA
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" />
              ارتباط EMR رمزنگاری شده ۲۵۶ بیتی
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-blue-400" />
              موتور پردازش ابری HEMERA
            </span>
          </div>
        </div>
      </footer>
    );
  }

  // Rich public footer for patients and visitors
  return (
    <footer className="relative overflow-hidden bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 mt-20 font-sans" dir="rtl">
      {/* Subtle Matte Medical Vector Pattern */}
      <MedicalVectorPattern opacity={0.032} variant="light" patternId="footer-med-pattern" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-600/20">
                <Heart className="w-5 h-5 fill-white/20" />
              </div>
              <div>
                <span className="font-bold text-2xl text-white tracking-tight">همرا کلینیک</span>
                <span className="text-[10px] font-black bg-blue-500/30 text-blue-300 border border-blue-400/40 px-2 py-0.5 rounded-md mr-2">HEMERA CLINIC</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              پلتفرم یکپارچه مدیریت هوشمند سلامت و مراکز درمانی همرا کلینیک (پروژه سلامت هلدینگ HEMERA). ارائه‌دهنده خدمات تخصصی نوبت‌دهی، پرونده سلامت EMR و وب‌سایت اختصاصی پزشکان.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>پزشکان دارای تاییدیه نظام پزشکی</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>پذیرش ۲۴ ساعته آنلاین</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">دسترسی سریع</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('/doctors')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-blue-500" />
                  جستجوی پزشکان متخصص
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/specialties')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-blue-500" />
                  تخصص‌های پزشکی
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/services')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-blue-500" />
                  خدمات و چکاپ‌های سلامت
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/telemedicine')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-blue-500" />
                  مشاوره تلفنی و آنلاین
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/health')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-blue-500" />
                  مجله و دانشنامه سلامت
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/clinic-branding')}
                  className="text-purple-300 hover:text-purple-200 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-purple-400" />
                  برندینگ و توسعه کلینیک
                </button>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">سامانه‌ها و پرتال‌ها</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('/patient')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-sky-500" />
                  پرونده الکترونیک بیمار
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/doctor')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-sky-500" />
                  پنل بالینی پزشکان
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/secretary')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-sky-500" />
                  میزکار پذیرش و تریاژ
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/clinic')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-sky-500" />
                  مدیریت عملیات کلینیک
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-sky-500" />
                  کنسول ارشد مدیریت سیستم
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm">ارتباط با کلینیک</h4>
            <div className="flex items-start gap-2.5 text-slate-400">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>تهران، سعادت‌آباد، خیابان سرو غربی، پلاک ۴۴، همرا کلینیک</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-400">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>پشتیبانی: ۰۲۱-۸۸۹۹۰۰۰۰</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-400">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>info@hamrahclinic.ir</span>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© ۲۰۲۶ کلیه حقوق مادی و معنوی متعلق به پلتفرم هوشمند سلامت همرا کلینیک می‌باشد.</p>
          <p className="text-slate-500 max-w-xl text-center md:text-left leading-relaxed">
            اطلاعات ارائه‌شده در این پلتفرم جنبه آگاهی‌بخشی داشته و نباید جایگزین توصیه، تشخیص یا درمان مستقیم پزشکی گردد.
          </p>
        </div>
      </div>
    </footer>
  );
};
