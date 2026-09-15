import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Eye, 
  ExternalLink, 
  Palette, 
  Search, 
  Sliders, 
  Save, 
  Check, 
  Building2, 
  Stethoscope, 
  HelpCircle, 
  Camera, 
  Plus, 
  Trash2, 
  Award, 
  ShieldCheck,
  AlertCircle,
  ShieldAlert,
  Copy,
  CheckCheck,
  Home,
  Link2
} from 'lucide-react';
import { Doctor, DoctorWebsiteConfig, DoctorWebsiteTheme, DoctorOffice, DoctorFAQ, DoctorServiceMeta, DoctorGalleryItem, DoctorWebsiteStatus } from '../../types';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { canManageDoctorWebsite } from '../../utils/authUtils';
import { 
  resolveDoctorWebsiteStatus, 
  getWebsiteStatusMeta, 
  syncWebsiteStatusBooleans,
  getDoctorSubdomain,
  getDoctorSubdomainUrl,
  HAMRAH_MAIN_DOMAIN,
  HAMRAH_MAIN_URL,
  getDoctorSubdomainPrefix
} from '../../utils/doctorWebsiteUtils';
import { THEME_CONFIGS } from '../doctorSite/themeConfig';

interface Props {
  doctor: Doctor;
  onDoctorUpdated: (updated: Doctor) => void;
}

export const DoctorWebsiteManager: React.FC<Props> = ({ doctor, onDoctorUpdated }) => {
  const { currentUser } = useAuth();
  const hasAccess = canManageDoctorWebsite(currentUser, doctor.id);

  const initialStatus = resolveDoctorWebsiteStatus(doctor.websiteConfig);
  const initialConfig: DoctorWebsiteConfig = doctor.websiteConfig || {
    websiteStatus: initialStatus,
    websiteEnabled: initialStatus === 'published' || initialStatus === 'draft',
    websitePublished: initialStatus === 'published',
    websiteTheme: 'modern-specialist',
    heroTitle: doctor.title,
    heroSubtitle: doctor.bio,
    shortIntroduction: doctor.bio,
    detailedBiography: doctor.bio,
    phone: doctor.offices?.[0]?.phone || '021-22000000',
    seoTitle: `${doctor.name} | ${doctor.title} | وبسایت رسمی`,
    seoDescription: doctor.bio,
    sectionVisibility: {
      about: true,
      services: true,
      achievements: true,
      articles: true,
      gallery: true,
      faq: true,
      reviews: true,
      offices: true
    }
  };

  const [config, setConfig] = useState<DoctorWebsiteConfig>(initialConfig);
  const [offices, setOffices] = useState<DoctorOffice[]>(doctor.offices || []);
  const [detailedServices, setDetailedServices] = useState<DoctorServiceMeta[]>(doctor.detailedServices || []);
  const [faqs, setFaqs] = useState<DoctorFAQ[]>(doctor.faqs || []);
  const [gallery, setGallery] = useState<DoctorGalleryItem[]>(doctor.gallery || []);

  const [activeSectionTab, setActiveSectionTab] = useState<'theme' | 'general' | 'sections' | 'offices' | 'services' | 'faq' | 'gallery'>('theme');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSubdomain, setCopiedSubdomain] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  const doctorSubdomain = getDoctorSubdomain({ slug: doctor.slug, websiteConfig: config });
  const doctorSubdomainUrl = getDoctorSubdomainUrl({ slug: doctor.slug, websiteConfig: config });

  const handleCopySubdomain = () => {
    navigator.clipboard.writeText(doctorSubdomainUrl);
    setCopiedSubdomain(true);
    setTimeout(() => setCopiedSubdomain(false), 2000);
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(`${window.location.origin}/site/${doctor.slug}`);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const currentStatus = resolveDoctorWebsiteStatus(config);
  const statusMeta = getWebsiteStatusMeta(currentStatus);

  const handleStatusChange = async (newStatus: DoctorWebsiteStatus) => {
    const synced = syncWebsiteStatusBooleans(newStatus);
    const updatedConfig = { ...config, ...synced };
    setConfig(updatedConfig);
    const updated = await apiService.updateDoctorWebsiteConfig(doctor.id, synced);
    if (updated) onDoctorUpdated(updated);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // 1. Update doctor website config with synced booleans
      const synced = syncWebsiteStatusBooleans(resolveDoctorWebsiteStatus(config));
      const configToSave = { ...config, ...synced };
      const updated = await apiService.updateDoctor(doctor.id, {
        websiteConfig: configToSave,
        offices,
        detailedServices,
        faqs,
        gallery
      });

      if (updated) {
        onDoctorUpdated(updated);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save website config', err);
    } finally {
      setIsSaving(false);
    }
  };

  const themesList = Object.values(THEME_CONFIGS);

  if (!hasAccess) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-xs text-center space-y-4 font-sans" dir="rtl">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">عدم دسترسی به مدیریت این وبسایت</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          شما مجوز دسترسی به پیکربندی وبسایت <span className="font-bold text-slate-900">{doctor.name}</span> را ندارید. هر پزشک فقط مجاز به مدیریت وبسایت شخصی اختصاص‌یافته به خود می‌باشد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-right font-sans" dir="rtl">
      
      {/* Top Banner & Canonical Status Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Globe className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">مدیریت وبسایت اختصاصی پزشک</h2>
              <p className="text-xs text-slate-500">
                شخصی‌سازی ظاهر، تم گرافیکی، وضعیت انتشار، خدمات و متن‌های وبسایت رسمی
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            {/* Hamrah Subdomain Display */}
            <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-600 font-medium">ساب‌دامنه همرا:</span>
              <span className="font-mono font-bold text-blue-800 text-[11px]" dir="ltr">
                {doctorSubdomain}
              </span>
              <button
                type="button"
                onClick={handleCopySubdomain}
                className="p-1 text-blue-600 hover:text-blue-800 rounded transition-colors"
                title="کپی لینک ساب‌دامنه همرا"
              >
                {copiedSubdomain ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* In-app Path */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Link2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-medium">لینک درون‌سامانه‌ای:</span>
              <span className="font-mono font-bold text-slate-700 text-[11px]" dir="ltr">
                /site/{doctor.slug}
              </span>
              <button
                type="button"
                onClick={handleCopyPath}
                className="p-1 text-slate-500 hover:text-slate-700 rounded transition-colors"
                title="کپی نشانی درون‌سامانه‌ای"
              >
                {copiedPath ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <span className="text-slate-300">•</span>
            
            {/* Status Indicator Badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              currentStatus === 'published'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : currentStatus === 'draft'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : currentStatus === 'suspended'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-700 border border-slate-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                currentStatus === 'published' ? 'bg-emerald-500 animate-pulse' :
                currentStatus === 'draft' ? 'bg-amber-500' :
                currentStatus === 'suspended' ? 'bg-rose-500' : 'bg-slate-400'
              }`} />
              <span>وضعیت: {statusMeta.label}</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-500 max-w-xl">
            {statusMeta.description}
          </p>
        </div>

        {/* Action Buttons & Status Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Status Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 px-2">تغییر وضعیت:</span>
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value as DoctorWebsiteStatus)}
              className="bg-white text-slate-800 text-xs font-bold rounded-xl px-3 py-2 border border-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="published">🟢 انتشار عمومی (Published)</option>
              <option value="draft">🟡 پیش‌نویس خصوصی (Draft)</option>
              <option value="disabled">⚪ غیرفعال (Disabled)</option>
              {(currentUser.role === 'super_admin' || currentUser.role === 'admin') && (
                <option value="suspended">🔴 تعلیق نظارتی (Suspended)</option>
              )}
            </select>
          </div>

          <Link
            to={`/site/${doctor.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors shadow-xs"
          >
            <Eye className="w-4 h-4" />
            <span>{currentStatus === 'published' ? 'مشاهده وبسایت' : 'پیش‌نمایش اختصاصی'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        {[
          { id: 'theme', label: 'قالب و تم بصری', icon: <Palette className="w-4 h-4" /> },
          { id: 'general', label: 'اطلاعات اصلی و سئو', icon: <Search className="w-4 h-4" /> },
          { id: 'sections', label: 'مدیریت بخش‌ها', icon: <Sliders className="w-4 h-4" /> },
          { id: 'offices', label: `مطب‌ها و نشانی (${offices.length})`, icon: <Building2 className="w-4 h-4" /> },
          { id: 'services', label: `خدمات تخصصی (${detailedServices.length})`, icon: <Stethoscope className="w-4 h-4" /> },
          { id: 'faq', label: `پرسش‌های متداول (${faqs.length})`, icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'gallery', label: `گالری تصاویر (${gallery.length})`, icon: <Camera className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSectionTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              activeSectionTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Theme Selector */}
      {activeSectionTab === 'theme' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">انتخاب قالب و هویت بصری (Theme Engine)</h3>
            <p className="text-xs text-slate-500">
              تم متناسب با تخصص خود را انتخاب کنید. کلیه رنگ‌ها، هدر، دکمه‌ها و سایه‌ها به‌صورت هوشمند منطبق خواهند شد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {themesList.map(t => {
              const isSelected = config.websiteTheme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setConfig(prev => ({ ...prev, websiteTheme: t.id }))}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all space-y-4 text-right ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{t.name}</span>
                    </div>
                    {isSelected ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>فعال</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">انتخاب تم</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t.description}
                  </p>

                  {/* Visual Preview Swatch */}
                  <div className="h-16 rounded-xl overflow-hidden border border-slate-200/80 flex items-center justify-between px-4 bg-slate-900 text-white">
                    <div className="text-xs font-bold">{doctor.name}</div>
                    <div className={`px-3 py-1 rounded-lg text-[11px] font-bold ${t.primaryButton}`}>
                      نوبت‌دهی
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: General & SEO */}
      {activeSectionTab === 'general' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">اطلاعات اصلی و تنظیمات سئو (SEO)</h3>
            <p className="text-xs text-slate-500">
              عنوان‌ها، پیش‌نمایش در موتورهای جستجو (Google) و بیوگرافی تفصیلی پزشک
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">عنوان بخش هدر (Hero Title):</label>
              <input
                type="text"
                value={config.heroTitle || ''}
                onChange={e => setConfig(prev => ({ ...prev, heroTitle: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                placeholder="مثال: فوق تخصص آنژیوپلاستی و اکوکاردیوگرافی"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">شماره تلفن اصلی تماس مطب:</label>
              <input
                type="text"
                value={config.phone || ''}
                onChange={e => setConfig(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                dir="ltr"
                placeholder="021-22000000"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">زیرعنوان و شعار درمانی (Hero Subtitle):</label>
              <textarea
                rows={2}
                value={config.heroSubtitle || ''}
                onChange={e => setConfig(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden leading-relaxed"
                placeholder="مقدمه کوتاه معرفی و رویکرد تشخیصی..."
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">بیوگرافی تفصیلی و رویکرد بالینی:</label>
              <textarea
                rows={4}
                value={config.detailedBiography || ''}
                onChange={e => setConfig(prev => ({ ...prev, detailedBiography: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden leading-relaxed"
                placeholder="توضیحات جامع پیرامون سوابق کاری، بیمارستان‌های همکار و متدهای درمانی..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">عنوان سئو (Page Title):</label>
              <input
                type="text"
                value={config.seoTitle || ''}
                onChange={e => setConfig(prev => ({ ...prev, seoTitle: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                placeholder="دکتر ... | متخصص ... | وبسایت رسمی"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">توضیحات سئو (Meta Description):</label>
              <input
                type="text"
                value={config.seoDescription || ''}
                onChange={e => setConfig(prev => ({ ...prev, seoDescription: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                placeholder="رزرو اینترنتی نوبت، آدرس مطب و خدمات..."
              />
            </div>

            {/* Hamrah Domain & Subdomain Architecture */}
            <div className="md:col-span-2 pt-5 border-t border-slate-200 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>ساختار دامنه اصلی و ساب‌دامنه در شبکه همرا</span>
                </h4>
                <p className="text-xs text-slate-500 pt-0.5">
                  سایت اصلی همرا با لینک اصلی <span className="font-mono text-blue-600 font-bold" dir="ltr">hamrah.ir</span> در دسترس است و وبسایت رسمی پزشکان با ساب‌دامنه‌های اختصاصی همرا (<span className="font-mono text-blue-600 font-bold" dir="ltr">*.hamrah.ir</span>) راه‌اندازی می‌شود.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subdomain Input */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      ساب‌دامنه اختصاصی پزشک:
                    </label>
                    <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                      زیردامنه رسمی همرا
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" dir="ltr">
                    <span className="text-xs font-mono text-slate-500 font-bold">https://</span>
                    <input
                      type="text"
                      value={getDoctorSubdomainPrefix({ slug: doctor.slug, websiteConfig: config })}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        setConfig(prev => ({
                          ...prev,
                          websiteSubdomain: val ? `${val}.${HAMRAH_MAIN_DOMAIN}` : ''
                        }));
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-blue-300 bg-white font-mono text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      placeholder="dr-slug"
                    />
                    <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 px-2.5 py-2 rounded-xl border border-blue-200">
                      .{HAMRAH_MAIN_DOMAIN}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-slate-600">
                      نشانی کامل: <strong className="font-mono text-blue-800" dir="ltr">{doctorSubdomainUrl}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySubdomain}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                    >
                      {copiedSubdomain ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSubdomain ? 'کپی شد' : 'کپی لینک'}</span>
                    </button>
                  </div>
                </div>

                {/* Main Site Integration Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      سایت اصلی با لینک همرا:
                    </label>
                    <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      پلتفرم مادر
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-700">سامانه مرکزی نوبت‌دهی:</span>
                    </div>
                    <span className="font-mono font-bold text-blue-700" dir="ltr">{HAMRAH_MAIN_URL}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>لینک سایت اصلی در تمامی صفحات وبسایت پزشک تعبیه شده است.</span>
                    <Link
                      to="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                    >
                      <span>مشاهده سایت اصلی</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Section Visibility Toggles */}
      {activeSectionTab === 'sections' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">کنترل نمایش بخش‌های وبسایت (Section Visibility)</h3>
            <p className="text-xs text-slate-500">
              هر بخشی را که تمایل ندارید در وبسایت عمومی نمایش داده شود، غیرفعال کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'about', label: 'درباره پزشک و مدارک', desc: 'بیوگرافی، تحصیلات و زبان‌ها' },
              { key: 'services', label: 'خدمات و تعرفه‌ها', desc: 'لیست اقدامات و قیمت‌ها' },
              { key: 'achievements', label: 'افتخارات و دستاوردها', desc: 'مدارک و عضویت‌های علمی' },
              { key: 'articles', label: 'مقالات و آموزش', desc: 'مطالب علمی پزشک' },
              { key: 'reviews', label: 'نظرات مراجعین', desc: 'امتیازات و فیدبک‌های بیماران' },
              { key: 'gallery', label: 'گالری و محیط مطب', desc: 'عکس‌های کلینیک و تجهیزات' },
              { key: 'faq', label: 'پرسش‌های متداول', desc: 'پاسخ به سوالات رایج' },
              { key: 'offices', label: 'مطب‌ها و نشانی', desc: 'آدرس، تلفن و ساعات حضور' }
            ].map(sec => {
              const isVisible = config.sectionVisibility?.[sec.key as keyof typeof config.sectionVisibility] !== false;
              return (
                <div
                  key={sec.key}
                  onClick={() => {
                    setConfig(prev => ({
                      ...prev,
                      sectionVisibility: {
                        ...prev.sectionVisibility,
                        [sec.key]: !isVisible
                      }
                    }));
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isVisible
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-900">{sec.label}</span>
                      <span className={`w-3.5 h-3.5 rounded-full ${isVisible ? 'bg-blue-600' : 'bg-slate-300'}`} />
                    </div>
                    <p className="text-[11px] text-slate-500">{sec.desc}</p>
                  </div>
                  <div className="pt-3 text-[11px] font-bold text-blue-700">
                    {isVisible ? 'نمایش در سایت ✓' : 'مخفی شده ✕'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Offices Management */}
      {activeSectionTab === 'offices' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">مطب‌ها و اطلاعات تماس</h3>
              <p className="text-xs text-slate-500">تعریف نشانی دقیق، تلفن رزرو نوبت و ساعات حضور در هر شعبه</p>
            </div>
            <button
              onClick={() => {
                const newOff: DoctorOffice = {
                  id: `off-${Date.now()}`,
                  title: 'مطب جدید',
                  address: 'تهران، خیابان ولیعصر',
                  city: 'تهران',
                  phone: '021-88000000',
                  workingHours: 'روزهای زوج ۱۶:۰۰ الی ۲۰:۰۰'
                };
                setOffices([...offices, newOff]);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن مطب جدید</span>
            </button>
          </div>

          <div className="space-y-4">
            {offices.map((off, idx) => (
              <div key={off.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">مطب شماره {idx + 1}</span>
                  <button
                    onClick={() => setOffices(offices.filter(o => o.id !== off.id))}
                    className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">عنوان مطب:</label>
                    <input
                      type="text"
                      value={off.title}
                      onChange={e => {
                        const updated = [...offices];
                        updated[idx].title = e.target.value;
                        setOffices(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">تلفن پذیرش:</label>
                    <input
                      type="text"
                      value={off.phone}
                      onChange={e => {
                        const updated = [...offices];
                        updated[idx].phone = e.target.value;
                        setOffices(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ساعات حضور:</label>
                    <input
                      type="text"
                      value={off.workingHours}
                      onChange={e => {
                        const updated = [...offices];
                        updated[idx].workingHours = e.target.value;
                        setOffices(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">نشانی کامل:</label>
                    <input
                      type="text"
                      value={off.address}
                      onChange={e => {
                        const updated = [...offices];
                        updated[idx].address = e.target.value;
                        setOffices(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Services Management */}
      {activeSectionTab === 'services' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">خدمات و اقدامات تخصصی مطب</h3>
              <p className="text-xs text-slate-500">تعریف خدمات، مدت زمان تقریبی و تعرفه مصوب</p>
            </div>
            <button
              onClick={() => {
                const newSrv: DoctorServiceMeta = {
                  id: `srv-${Date.now()}`,
                  title: 'خدمت تخصصی جدید',
                  description: 'شرح خدمت و نتایج تشخیصی...',
                  durationMinutes: 30,
                  price: 450000
                };
                setDetailedServices([...detailedServices, newSrv]);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن خدمت جدید</span>
            </button>
          </div>

          <div className="space-y-4">
            {detailedServices.map((srv, idx) => (
              <div key={srv.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">خدمت #{idx + 1}</span>
                  <button
                    onClick={() => setDetailedServices(detailedServices.filter(s => s.id !== srv.id))}
                    className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">نام خدمت:</label>
                    <input
                      type="text"
                      value={srv.title}
                      onChange={e => {
                        const updated = [...detailedServices];
                        updated[idx].title = e.target.value;
                        setDetailedServices(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">تعرفه (تومان):</label>
                    <input
                      type="number"
                      value={srv.price || 0}
                      onChange={e => {
                        const updated = [...detailedServices];
                        updated[idx].price = Number(e.target.value);
                        setDetailedServices(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">مدت زمان (دقیقه):</label>
                    <input
                      type="number"
                      value={srv.durationMinutes || 30}
                      onChange={e => {
                        const updated = [...detailedServices];
                        updated[idx].durationMinutes = Number(e.target.value);
                        setDetailedServices(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">توضیحات تکمیلی:</label>
                    <input
                      type="text"
                      value={srv.description || ''}
                      onChange={e => {
                        const updated = [...detailedServices];
                        updated[idx].description = e.target.value;
                        setDetailedServices(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: FAQs Management */}
      {activeSectionTab === 'faq' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">پرسش‌های متداول بیماران (FAQ)</h3>
              <p className="text-xs text-slate-500">پاسخ به سوالات متداول در وبسایت جهت کاهش تماس‌های تکراری</p>
            </div>
            <button
              onClick={() => {
                const newFaq: DoctorFAQ = {
                  id: `faq-${Date.now()}`,
                  question: 'عنوان سوال متداول جدید؟',
                  answer: 'پاسخ دقیق و راهنمای مراجعین محترم...',
                  category: 'راهنما'
                };
                setFaqs([...faqs, newFaq]);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن سوال جدید</span>
            </button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={faq.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">پرسش #{idx + 1}</span>
                  <button
                    onClick={() => setFaqs(faqs.filter(f => f.id !== faq.id))}
                    className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">متن سوال:</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={e => {
                        const updated = [...faqs];
                        updated[idx].question = e.target.value;
                        setFaqs(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">پاسخ تشریحی:</label>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={e => {
                        const updated = [...faqs];
                        updated[idx].answer = e.target.value;
                        setFaqs(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Gallery Management */}
      {activeSectionTab === 'gallery' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">گالری و محیط مطب</h3>
              <p className="text-xs text-slate-500">تصاویر باکیفیت از سالن انتظار، یونیت‌ها و دستگاه‌های تشخیصی کلینیک</p>
            </div>
            <button
              onClick={() => {
                const newPhoto: DoctorGalleryItem = {
                  id: `gal-${Date.now()}`,
                  title: 'تصویر محیط مطب',
                  category: 'محیط درمانی',
                  imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800'
                };
                setGallery([...gallery, newPhoto]);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن عکس جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((photo, idx) => (
              <div key={photo.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="relative h-36 rounded-xl overflow-hidden bg-slate-200">
                  <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    onClick={() => setGallery(gallery.filter(g => g.id !== photo.id))}
                    className="absolute top-2 left-2 p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={photo.title}
                    onChange={e => {
                      const updated = [...gallery];
                      updated[idx].title = e.target.value;
                      setGallery(updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium"
                    placeholder="عنوان عکس"
                  />
                  <input
                    type="text"
                    value={photo.imageUrl}
                    onChange={e => {
                      const updated = [...gallery];
                      updated[idx].imageUrl = e.target.value;
                      setGallery(updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-[11px]"
                    dir="ltr"
                    placeholder="آدرس عکس (URL)"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Sticky Save Bar */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium text-slate-300">
            تغییرات شما بلافاصله در وبسایت اختصاصی پزشک اعمال و ذخیره خواهند شد.
          </span>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>تنظیمات ذخیره شد!</span>
            </span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'در حال ذخیره‌سازی...' : 'ذخیره کلیه تغییرات وبسایت'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
