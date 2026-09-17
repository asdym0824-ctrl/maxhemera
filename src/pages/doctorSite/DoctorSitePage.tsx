import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  ShieldAlert, 
  Sparkles,
  X,
  FileQuestion,
  ArrowLeft
} from 'lucide-react';
import { Doctor, FamilyMember, Appointment, DetailedService, HealthArticle, DiseaseCondition } from '../../types';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { canManageDoctorWebsite } from '../../utils/authUtils';
import { resolveDoctorWebsiteStatus, canPreviewDoctorWebsite, getWebsiteStatusMeta, detectSubdomainSlug } from '../../utils/doctorWebsiteUtils';
import { getThemeConfig } from '../../components/doctorSite/themeConfig';
import { DoctorSiteStructuredData } from '../../components/doctorSite/DoctorSiteStructuredData';
import { DoctorSiteHeader } from '../../components/doctorSite/DoctorSiteHeader';
import { DoctorSiteHero } from '../../components/doctorSite/DoctorSiteHero';
import { DoctorSiteAbout } from '../../components/doctorSite/DoctorSiteAbout';
import { DoctorSiteServices } from '../../components/doctorSite/DoctorSiteServices';
import { DoctorSiteServiceDetail } from '../../components/doctorSite/DoctorSiteServiceDetail';
import { DoctorSiteConditions } from '../../components/doctorSite/DoctorSiteConditions';
import { DoctorSiteConditionDetail } from '../../components/doctorSite/DoctorSiteConditionDetail';
import { DoctorSiteAchievements } from '../../components/doctorSite/DoctorSiteAchievements';
import { DoctorSiteArticles } from '../../components/doctorSite/DoctorSiteArticles';
import { DoctorSiteArticleDetail } from '../../components/doctorSite/DoctorSiteArticleDetail';
import { DoctorSiteVideos } from '../../components/doctorSite/DoctorSiteVideos';
import { DoctorSiteReviews } from '../../components/doctorSite/DoctorSiteReviews';
import { DoctorSiteGallery } from '../../components/doctorSite/DoctorSiteGallery';
import { DoctorSiteFAQ } from '../../components/doctorSite/DoctorSiteFAQ';
import { DoctorSiteOffices } from '../../components/doctorSite/DoctorSiteOffices';
import { DoctorSiteContact } from '../../components/doctorSite/DoctorSiteContact';
import { DoctorSiteFooter } from '../../components/doctorSite/DoctorSiteFooter';
import { DoctorSiteFloatingAssistant } from '../../components/doctorSite/DoctorSiteFloatingAssistant';
import { DoctorSiteMiniAccountModal } from '../../components/doctorSite/DoctorSiteMiniAccountModal';
import { MobileDoctorSiteView } from '../../components/doctorSite/MobileDoctorSiteView';
import { AppointmentWizard } from '../../components/appointments/AppointmentWizard';
import { MOCK_DISEASES } from '../../data/mockData';
import { bookingIntentService } from '../../services/bookingIntentService';
import { setSeoMetaData } from '../../utils/seoUtils';

export const DoctorSitePage: React.FC = () => {
  const params = useParams<{ doctorSlug: string; '*'?: string }>();
  const detectedSubdomain = detectSubdomainSlug();
  const doctorSlug = params.doctorSlug ? decodeURIComponent(params.doctorSlug).trim() : (detectedSubdomain || '');
  const splat = params['*'];
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctorArticles, setDoctorArticles] = useState<HealthArticle[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingPrefillNote, setBookingPrefillNote] = useState<string | undefined>();
  const [selectedBookingOfficeTitle, setSelectedBookingOfficeTitle] = useState<string | undefined>();
  const [selectedBookingOfficeId, setSelectedBookingOfficeId] = useState<string | undefined>();
  const [bookingSuccessModal, setBookingSuccessModal] = useState<Appointment | null>(null);

  // Patient Mini Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Parse path segments to identify active subpage and parameter
  const { subpage, detailSlug } = useMemo(() => {
    let sub = 'home';
    let slug: string | undefined = undefined;

    if (splat) {
      const parts = splat.split('/').filter(Boolean);
      if (parts.length > 0) {
        sub = parts[0];
        if (parts.length > 1) {
          slug = decodeURIComponent(parts[1]);
        }
      }
    } else {
      // Check full pathname if splat wasn't populated directly
      const pathParts = location.pathname.split('/').filter(Boolean);
      // Format: /site/:doctorSlug/:subpage/:detailSlug
      const slugIndex = pathParts.findIndex(p => p === doctorSlug);
      if (slugIndex !== -1 && pathParts.length > slugIndex + 1) {
        sub = pathParts[slugIndex + 1];
        if (pathParts.length > slugIndex + 2) {
          slug = decodeURIComponent(pathParts[slugIndex + 2]);
        }
      }
    }
    return { subpage: sub, detailSlug: slug };
  }, [splat, location.pathname, doctorSlug]);

  // Load Doctor Data
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // Fetch all doctors for fallback switcher
    apiService.getDoctors().then(docs => {
      if (mounted) setAvailableDoctors(docs);
    });

    if (!doctorSlug) {
      setError('شناسه یا نشانی پزشک مشخص نشده است.');
      setLoading(false);
      return;
    }

    apiService.getDoctorBySlug(doctorSlug)
      .then(doc => {
        if (!mounted) return;
        if (!doc) {
          setError(`پزشکی با شناسه یا نشانی "${doctorSlug}" یافت نشد.`);
        } else {
          setDoctor(doc);

          // Fetch articles for this doctor (Single source of truth)
          apiService.getArticlesByDoctor(doc.id).then(arts => {
            if (mounted) setDoctorArticles(arts);
          });

          // Check for pending booking intent for this doctor
          const pending = bookingIntentService.get();
          if (pending && (pending.doctorId === doc.id || pending.doctorSlug === doc.slug)) {
            setIsBookingOpen(true);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        console.error(err);
        setError('خطا در بارگذاری اطلاعات وبسایت پزشک.');
        setLoading(false);
      });

    // Load family members for appointment wizard
    if (currentUser?.id) {
      apiService.getFamilyMembers(currentUser.id).then(fams => {
        if (mounted) setFamilyMembers(fams);
      });
    } else {
      setFamilyMembers([]);
    }

    return () => {
      mounted = false;
    };
  }, [doctorSlug, currentUser?.id]);

  // Identify specific items for detail routes
  const selectedService = useMemo<DetailedService | null>(() => {
    if (subpage === 'services' && detailSlug && doctor) {
      const detailed = doctor.detailedServices || [];
      return detailed.find(s => s.id === detailSlug || s.title.toLowerCase() === detailSlug.toLowerCase()) || null;
    }
    return null;
  }, [subpage, detailSlug, doctor]);

  const selectedCondition = useMemo<DiseaseCondition | null>(() => {
    if (subpage === 'conditions' && detailSlug) {
      return MOCK_DISEASES.find(d => d.slug === detailSlug || d.id === detailSlug) || null;
    }
    return null;
  }, [subpage, detailSlug]);

  const selectedArticle = useMemo<HealthArticle | null>(() => {
    if (subpage === 'articles' && detailSlug) {
      return doctorArticles.find(a => a.slug === detailSlug || a.id === detailSlug) || null;
    }
    return null;
  }, [subpage, detailSlug, doctorArticles]);

  // Dynamic SEO & Document Meta updates per nested route
  useEffect(() => {
    if (!doctor) return;

    const baseCanonical = `${window.location.origin}/site/${doctor.slug}`;
    let pageTitle = `وبسایت رسمی ${doctor.name} - ${doctor.title}`;
    let metaDesc = doctor.bio || `وبسایت رسمی ${doctor.name}، متخصص ${doctor.specialtyName}. دریافت نوبت ویزیت حضوری و مشاوره آنلاین تصویری.`;
    let canonicalUrl = baseCanonical;
    let ogType: 'profile' | 'article' | 'website' = 'profile';

    if (subpage === 'about') {
      pageTitle = `درباره و بیوگرافی ${doctor.name} - سوابق تحصیلی و تجربیات بالینی`;
      metaDesc = `آشنایی با پیشینه علمی، مدارک تحصیلی، جوایز و سوابق فعالیت ${doctor.name}.`;
      canonicalUrl = `${baseCanonical}/about`;
    } else if (subpage === 'services') {
      if (selectedService) {
        pageTitle = `${selectedService.title} - ${doctor.name} | همرا کلینیک`;
        metaDesc = selectedService.description || `جزئیات، تعرفه و رزرو نوبت ${selectedService.title} نزد ${doctor.name}.`;
        canonicalUrl = `${baseCanonical}/services/${selectedService.id}`;
      } else {
        pageTitle = `خدمات تخصصی و اقدامات درمانی ${doctor.name}`;
        metaDesc = `فهرست کامل خدمات تشخیصی، درمانی و مشاوره‌های تخصصی ارائه شده توسط ${doctor.name}.`;
        canonicalUrl = `${baseCanonical}/services`;
      }
    } else if (subpage === 'conditions') {
      if (selectedCondition) {
        pageTitle = `راهنمای جامع ${selectedCondition.persianTitle} (${selectedCondition.title}) - ${doctor.name}`;
        metaDesc = selectedCondition.overview || `علائم، روش‌های تشخیص و درمان بیماری ${selectedCondition.persianTitle} با نظارت ${doctor.name}.`;
        canonicalUrl = `${baseCanonical}/conditions/${selectedCondition.slug}`;
      } else {
        pageTitle = `بیماری‌ها و حوزه‌های تحت درمان ${doctor.name}`;
        metaDesc = `راهنمای بالینی بیماری‌های شایع و تخصص‌های درمانی ${doctor.name}.`;
        canonicalUrl = `${baseCanonical}/conditions`;
      }
    } else if (subpage === 'articles') {
      if (selectedArticle) {
        pageTitle = `${selectedArticle.title} - دکتر ${doctor.name}`;
        metaDesc = selectedArticle.summary || `مقاله تخصصی پیرامون ${selectedArticle.title} به قلم ${doctor.name}.`;
        canonicalUrl = `${baseCanonical}/articles/${selectedArticle.slug}`;
        ogType = 'article';
      } else {
        pageTitle = `مقالات و یادداشت‌های آموزشی ${doctor.name}`;
        metaDesc = `مجموعه مطالب و مقالات علمی و سبک زندگی به قلم ${doctor.name}.`;
        canonicalUrl = `${baseCanonical}/articles`;
      }
    } else if (subpage === 'achievements') {
      pageTitle = `افتخارات، رتبه‌ها و گواهینامه‌های ${doctor.name}`;
      metaDesc = `مدارک بورد، عضویت در مجامع بین‌المللی و دستاوردهای علمی ${doctor.name}.`;
      canonicalUrl = `${baseCanonical}/achievements`;
    } else if (subpage === 'reviews') {
      pageTitle = `نظرات و تجربیات بیماران ${doctor.name}`;
      metaDesc = `دیدگاه‌ها و میزان رضایت‌مندی مراجعین از ویزیت و خدمات ${doctor.name}.`;
      canonicalUrl = `${baseCanonical}/reviews`;
    } else if (subpage === 'offices') {
      pageTitle = `آدرس مطب‌ها و ساعات حضور ${doctor.name}`;
      metaDesc = `اطلاعات تماس، نشانی مطب‌ها و بیمارستان‌های محل فعالیت ${doctor.name}.`;
      canonicalUrl = `${baseCanonical}/offices`;
    } else if (subpage === 'faq') {
      pageTitle = `پرسش‌های متداول پیرامون نوبت‌دهی و ویزیت ${doctor.name}`;
      metaDesc = `پاسخ به سوالات پرتکرار مراجعین در مورد نوبت‌دهی، بیمه‌ها و خدمات مطب ${doctor.name}.`;
      canonicalUrl = `${baseCanonical}/faq`;
    } else if (subpage === 'contact') {
      pageTitle = `تماس با مطب و راه‌های ارتباطی ${doctor.name}`;
      metaDesc = `شماره تلفن‌ها، نقشه مسیریابی و ارتباط با مطب ${doctor.name}.`;
      canonicalUrl = `${baseCanonical}/contact`;
    }

    setSeoMetaData({
      title: pageTitle,
      description: metaDesc,
      canonicalUrl,
      ogType,
      ogImage: selectedArticle?.coverImage || doctor.avatar
    });
  }, [doctor, subpage, selectedService, selectedCondition, selectedArticle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-600" dir="rtl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div>
            <p className="text-base font-bold text-slate-900">در حال بارگذاری وبسایت اختصاصی پزشک...</p>
            <p className="text-xs text-slate-500 mt-1">ارتباط با هسته سلامت همرا کلینیک</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-right font-sans" dir="rtl">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">وبسایت پزشک در دسترس نیست</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {error || 'نشانی وارد شده یافت نشد. می‌توانید از میان وبسایت‌های فعال پزشکان زیر یکی را انتخاب نمایید:'}
            </p>
          </div>

          {availableDoctors.length > 0 && (
            <div className="space-y-2 text-right">
              <span className="text-xs font-bold text-slate-700 block">وبسایت‌های فعال پزشکان همرا کلینیک:</span>
              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                {availableDoctors.map(d => (
                  <Link
                    key={d.id}
                    to={`/site/${d.slug}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 transition-all text-xs group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={d.avatar} alt={d.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-700">{d.name}</div>
                        <div className="text-[11px] text-slate-500">{d.specialtyName}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-blue-600 group-hover:underline">ورود به وبسایت ←</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Link
              to="/doctors"
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors text-center"
            >
              جستجوی تمامی پزشکان
            </Link>
            <Link
              to="/"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors text-center"
            >
              صفحه اصلی سامانه
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const websiteStatus = resolveDoctorWebsiteStatus(doctor.websiteConfig);
  const isPublished = websiteStatus === 'published';
  const hasPreviewAccess = canPreviewDoctorWebsite(currentUser, doctor.id);

  if (!isPublished && !hasPreviewAccess) {
    const statusMeta = getWebsiteStatusMeta(websiteStatus);

    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-right font-sans" dir="rtl">
        <div className="max-w-lg w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl space-y-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            websiteStatus === 'suspended'
              ? 'bg-rose-500/20 text-rose-400'
              : websiteStatus === 'disabled'
              ? 'bg-slate-700/60 text-slate-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}>
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              websiteStatus === 'suspended'
                ? 'bg-rose-500/20 text-rose-300'
                : websiteStatus === 'disabled'
                ? 'bg-slate-700 text-slate-300'
                : 'bg-amber-500/20 text-amber-300'
            }`}>
              وضعیت وبسایت: {statusMeta.label}
            </span>
            <h2 className="text-xl font-bold text-white">
              وبسایت اختصاصی {doctor.name} موقتاً در دسترس نیست
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {statusMeta.description}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Link
              to={`/doctor/${doctor.slug}`}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors text-center"
            >
              مشاهده پروفایل در همرا کلینیک
            </Link>
            <Link
              to="/doctors"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition-colors text-center"
            >
              فهرست سایر پزشکان
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const theme = getThemeConfig(doctor.websiteConfig?.websiteTheme);
  const basePath = `/site/${doctor.slug}`;

  const handleOpenBooking = (note?: string, officeTitle?: string, officeId?: string) => {
    setBookingPrefillNote(note);
    setSelectedBookingOfficeTitle(officeTitle);
    setSelectedBookingOfficeId(officeId);
    setIsBookingOpen(true);
  };

  const handleNavigateSubpage = (targetSubpage: string) => {
    if (targetSubpage === 'home') {
      navigate(basePath);
    } else {
      navigate(`${basePath}/${targetSubpage}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased font-sans flex flex-col justify-between" dir="rtl">
      {/* Dynamic Structured Data for SEO */}
      <DoctorSiteStructuredData 
        doctor={doctor} 
        subpage={subpage}
        service={selectedService || undefined}
        condition={selectedCondition || undefined}
        article={selectedArticle || undefined}
      />

      <div>
        {/* Preview Mode Banner for Authorized Users */}
        {!isPublished && hasPreviewAccess && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                حالت پیش‌نمایش اختصاصی: این وبسایت در وضعیت «{getWebsiteStatusMeta(websiteStatus).label}» قرار دارد و برای عموم پنهان است.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {(currentUser?.role === 'doctor' && currentUser.doctorId === doctor.id) && (
                <Link
                  to="/doctor"
                  className="px-3 py-1 bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 rounded-lg text-[11px] font-bold transition-colors"
                >
                  ویرایش در پرتال پزشک
                </Link>
              )}
              {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || (currentUser?.role === 'doctor' && currentUser.doctorId === doctor.id)) && (
                <button
                  onClick={() => {
                    apiService.updateDoctorWebsiteConfig(doctor.id, {
                      websiteStatus: 'published',
                      websitePublished: true,
                      websiteEnabled: true
                    }).then(updated => {
                      if (updated) setDoctor(updated);
                    });
                  }}
                  className="px-3 py-1 bg-slate-950 text-white rounded-lg hover:bg-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  انتشار فوری وبسایت
                </button>
              )}
            </div>
          </div>
        )}

        {/* Header & Navigation Bar (On mobile home, MobileDoctorSiteView provides its own specialized mobile header) */}
        <div className={subpage === 'home' || subpage === '' ? 'hidden lg:block' : 'block'}>
          <DoctorSiteHeader
            doctor={doctor}
            theme={theme}
            activeSubpage={subpage}
            onNavigateSubpage={handleNavigateSubpage}
            onBookClick={() => handleOpenBooking()}
            onOpenAccountModal={() => setIsAccountModalOpen(true)}
            hasArticles={doctorArticles.length > 0}
          />
        </div>

        {/* Dynamic Main View */}
        <main>
          {/* Service Detail Route */}
          {subpage === 'services' && detailSlug ? (
            selectedService ? (
              <DoctorSiteServiceDetail
                doctor={doctor}
                service={selectedService}
                theme={theme}
                onBookService={(title) => handleOpenBooking(`درخواست خدمت: ${title}`)}
                onBackToServices={() => navigate(`${basePath}/services`)}
              />
            ) : (
              <div className="py-20 bg-slate-50 min-h-[60vh] flex items-center justify-center p-6 text-center" dir="rtl">
                <div className="max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                    <FileQuestion className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">خدمت درمانی مورد نظر یافت نشد</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ممکن است این خدمت ویرایش یا حذف شده باشد. جهت مشاهده کلیه خدمات فعال روی لینک زیر کلیک کنید.
                  </p>
                  <Link
                    to={`${basePath}/services`}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${theme.primaryButton}`}
                  >
                    <span>مشاهده فهرست خدمات {doctor.name}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          ) : subpage === 'conditions' && detailSlug ? (
            selectedCondition ? (
              <DoctorSiteConditionDetail
                doctor={doctor}
                condition={selectedCondition}
                theme={theme}
                onBookCondition={(title) => handleOpenBooking(`ویزیت برای بیماری: ${title}`)}
                onBackToConditions={() => navigate(`${basePath}/conditions`)}
              />
            ) : (
              <div className="py-20 bg-slate-50 min-h-[60vh] flex items-center justify-center p-6 text-center" dir="rtl">
                <div className="max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                    <FileQuestion className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">راهنمای بیماری مورد نظر یافت نشد</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    جهت مشاهده کلیه مباحث درمانی و بیماری‌های تحت پوشش این پزشک از بخش زیر استفاده کنید.
                  </p>
                  <Link
                    to={`${basePath}/conditions`}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${theme.primaryButton}`}
                  >
                    <span>مشاهده همه حوزه‌های درمانی</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          ) : subpage === 'articles' && detailSlug ? (
            selectedArticle ? (
              <DoctorSiteArticleDetail
                doctor={doctor}
                article={selectedArticle}
                theme={theme}
                onBookClick={(note) => handleOpenBooking(note)}
                onBackToArticles={() => navigate(`${basePath}/articles`)}
              />
            ) : (
              <div className="py-20 bg-slate-50 min-h-[60vh] flex items-center justify-center p-6 text-center" dir="rtl">
                <div className="max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                    <FileQuestion className="w-6 h-6" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">مقاله آموزشی مورد نظر یافت نشد</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ممکن است نشانی مقاله تغییر یافته باشد یا توسط نویسنده بازبینی شود.
                  </p>
                  <Link
                    to={`${basePath}/articles`}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${theme.primaryButton}`}
                  >
                    <span>مشاهده همه مقالات {doctor.name}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          ) : subpage === 'services' ? (
            <div className="space-y-12">
              <DoctorSiteServices
                doctor={doctor}
                theme={theme}
                onBookService={(srv) => handleOpenBooking(srv ? `درخواست خدمت: ${srv}` : undefined)}
                isStandalonePage={true}
              />
              <DoctorSiteFAQ doctor={doctor} theme={theme} />
            </div>
          ) : subpage === 'conditions' ? (
            <DoctorSiteConditions
              doctor={doctor}
              theme={theme}
              onBookCondition={(name) => handleOpenBooking(`درخواست ویزیت: ${name}`)}
              isStandalonePage={true}
            />
          ) : subpage === 'articles' ? (
            <DoctorSiteArticles
              doctor={doctor}
              theme={theme}
              isStandalonePage={true}
            />
          ) : subpage === 'videos' ? (
            <DoctorSiteVideos
              doctor={doctor}
              theme={theme}
              onBookClick={(note) => handleOpenBooking(note)}
            />
          ) : subpage === 'about' ? (
            <div className="space-y-12">
              <DoctorSiteAbout doctor={doctor} theme={theme} />
              <DoctorSiteAchievements doctor={doctor} theme={theme} isStandalonePage={true} />
            </div>
          ) : subpage === 'achievements' ? (
            <DoctorSiteAchievements doctor={doctor} theme={theme} isStandalonePage={true} />
          ) : subpage === 'reviews' ? (
            <DoctorSiteReviews doctor={doctor} theme={theme} isStandalonePage={true} />
          ) : subpage === 'offices' ? (
            <DoctorSiteOffices
              doctor={doctor}
              theme={theme}
              onBookOffice={(office, offId) => handleOpenBooking(office ? `مطب: ${office}` : undefined, office, offId)}
            />
          ) : subpage === 'faq' ? (
            <DoctorSiteFAQ doctor={doctor} theme={theme} />
          ) : subpage === 'contact' ? (
            <DoctorSiteContact
              doctor={doctor}
              theme={theme}
              onBookOffice={(office, offId) => handleOpenBooking(office ? `مطب: ${office}` : undefined, office, offId)}
            />
          ) : subpage === 'gallery' ? (
            <DoctorSiteGallery doctor={doctor} theme={theme} />
          ) : subpage === 'home' || subpage === '' ? (
            /* Home / Full Multi-Section Page */
            <div>
              {/* 1. MOBILE ONLY: Highly Specialized Need-Fulfilling Doctor Portal */}
              <MobileDoctorSiteView
                doctor={doctor}
                theme={theme}
                articles={doctorArticles}
                availableDoctors={availableDoctors}
                onBookInPerson={(note, officeTitle, officeId) => handleOpenBooking(note, officeTitle, officeId)}
                onBookOnline={(note) => handleOpenBooking(note || 'مشاوره آنلاین تصویری')}
                onNavigateDoctor={(slug) => {
                  navigate(`/site/${slug}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              {/* 2. DESKTOP ONLY: Multi-Section Layout */}
              <div className="hidden lg:block">
                <DoctorSiteHero
                  doctor={doctor}
                  theme={theme}
                  onBookInPerson={() => handleOpenBooking('ویزیت حضوری مطب')}
                  onBookOnline={() => handleOpenBooking('مشاوره آنلاین تصویری')}
                />

                <DoctorSiteAbout doctor={doctor} theme={theme} />

                <DoctorSiteServices
                  doctor={doctor}
                  theme={theme}
                  onBookService={(srv) => handleOpenBooking(srv ? `درخواست خدمت: ${srv}` : undefined)}
                />

                <DoctorSiteConditions
                  doctor={doctor}
                  theme={theme}
                  onBookCondition={(name) => handleOpenBooking(`درخواست ویزیت: ${name}`)}
                />

                <DoctorSiteAchievements doctor={doctor} theme={theme} />

                <DoctorSiteArticles
                  doctor={doctor}
                  theme={theme}
                />

                <DoctorSiteVideos
                  doctor={doctor}
                  theme={theme}
                  onBookClick={(note) => handleOpenBooking(note)}
                />

                <DoctorSiteReviews doctor={doctor} theme={theme} />

                <DoctorSiteGallery doctor={doctor} theme={theme} />

                <DoctorSiteFAQ doctor={doctor} theme={theme} />

                <DoctorSiteOffices
                  doctor={doctor}
                  theme={theme}
                  onBookOffice={(office, offId) => handleOpenBooking(office ? `مطب: ${office}` : undefined, office, offId)}
                />
              </div>
            </div>
          ) : (
            /* 404 for unrecognized subpage */
            <div className="py-20 bg-slate-50 min-h-[60vh] flex items-center justify-center p-6 text-center" dir="rtl">
              <div className="max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900">صفحه مورد نظر در وبسایت پزشک یافت نشد</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  نشانی اینترنتی وارد شده صحیح نمی‌باشد. برای بازگشت به صفحه اصلی وبسایت دکمه زیر را انتخاب کنید.
                </p>
                <Link
                  to={basePath}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${theme.primaryButton}`}
                >
                  <span>صفحه اصلی وبسایت {doctor.name}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <div className={subpage === 'home' || subpage === '' ? 'hidden lg:block' : 'block'}>
        <DoctorSiteFooter doctor={doctor} theme={theme} />
      </div>

      {/* Doctor-Specific Floating AI Assistant */}
      <DoctorSiteFloatingAssistant
        doctor={doctor}
        theme={theme}
        onOpenBooking={(note) => handleOpenBooking(note)}
        onNavigateSection={(sec) => handleNavigateSubpage(sec)}
      />

      {/* Patient Mini Account Modal (Upcoming Appointments, Medical Records) */}
      {currentUser && (
        <DoctorSiteMiniAccountModal
          doctor={doctor}
          currentUser={currentUser}
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onBookNewAppointment={() => handleOpenBooking()}
        />
      )}

      {/* Appointment Wizard Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 relative text-right" dir="rtl">
            <button
              onClick={() => {
                bookingIntentService.clear();
                setIsBookingOpen(false);
              }}
              className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors z-10 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 space-y-1">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                سامانه نوبت‌دهی آنلاین
              </span>
              <h3 className="text-xl font-black text-slate-900">
                دریافت نوبت ویزیت با {doctor.name}
              </h3>
              {bookingPrefillNote && (
                <p className="text-xs text-slate-500">{bookingPrefillNote}</p>
              )}
            </div>

            <AppointmentWizard
              doctor={doctor}
              familyMembers={familyMembers}
              officeTitle={selectedBookingOfficeTitle}
              officeId={selectedBookingOfficeId}
              onComplete={(app) => {
                setIsBookingOpen(false);
                setBookingSuccessModal(app);
              }}
              onCancel={() => {
                bookingIntentService.clear();
                setIsBookingOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Booking Confirmation Dialog */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in text-right font-sans" dir="rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-black text-slate-900">نوبت شما با موفقیت ثبت شد</h3>
              <p className="text-xs text-slate-500">
                پیام یادآوری در نسخه نمایشی ثبت شد.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">کد پیگیری نوبت:</span>
                <span className="font-bold font-mono text-blue-700 text-sm">{bookingSuccessModal.trackingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">پزشک معالج:</span>
                <span className="font-bold text-slate-900">{doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">تاریخ و ساعت:</span>
                <span className="font-bold text-slate-900">{bookingSuccessModal.date} - ساعت {bookingSuccessModal.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">نوع ویزیت:</span>
                <span className="font-bold text-slate-900">
                  {bookingSuccessModal.visitType === 'online_video' ? 'ویزیت آنلاین تصویری' : 'ویزیت حضوری در مطب'}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-amber-800 font-bold">
                <span>وضعیت مالی:</span>
                <span>پرداخت نمایشی (در انتظار تسویه)</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setBookingSuccessModal(null);
                  navigate('/patient');
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                مشاهده نوبت در پرتال سراسری بیمار
              </button>
              <button
                onClick={() => setBookingSuccessModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                بازگشت به وبسایت پزشک
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
