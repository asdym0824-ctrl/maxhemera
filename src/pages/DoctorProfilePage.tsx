import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Doctor, Review, Appointment } from '../types';
import { apiService } from '../services/apiService';
import { setSeoMetaData } from '../utils/seoUtils';
import { 
  CheckCircle2, 
  Calendar,
  Globe,
  ExternalLink
} from 'lucide-react';
import { Rating } from '../components/common/Rating';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { AppointmentWizard } from '../components/appointments/AppointmentWizard';
import { MedicalVectorPattern } from '../components/common/medicalPattern/MedicalVectorPattern';
import { useAuth } from '../context/AuthContext';
import { bookingIntentService } from '../services/bookingIntentService';
import { isWebsitePubliclyVisible, canPreviewDoctorWebsite, resolveDoctorWebsiteStatus, getDoctorSubdomain } from '../utils/doctorWebsiteUtils';

interface DoctorProfilePageProps {
  doctorSlug?: string;
  onAppointmentCreated?: (app: Appointment) => void;
  onBack?: () => void;
}

export const DoctorProfilePage: React.FC<DoctorProfilePageProps> = ({
  doctorSlug: propSlug,
  onAppointmentCreated,
  onBack
}) => {
  const { currentUser } = useAuth();
  const params = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = propSlug || params.slug || '';
  const isDirectBookingRequest = searchParams.get('book') === 'true' || searchParams.get('booking') === 'true';

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'insurances' | 'reviews'>('about');
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  // Ensure view is scrolled to top on mount or when doctor slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    if (slug) {
      apiService.getDoctorBySlug(slug).then(doc => {
        if (doc) {
          setDoctor(doc);
          setSeoMetaData(
            `${doc.name} - ${doc.specialtyName} | دریافت نوبت و مشاوره همرا کلینیک`,
            `رزرو اینترنتی نوبت حضوری و ویزیت آنلاین تصویری با ${doc.name} (${doc.specialtyName}). مشاهده نظرات بیماران، آدرس مطب و بیمه‌های طرف قرارداد.`
          );
          apiService.getDoctorReviews(doc.id).then(setReviews);

          const pending = bookingIntentService.get();
          if ((pending && (pending.doctorId === doc.id || pending.doctorSlug === doc.slug)) || isDirectBookingRequest) {
            setShowWizardModal(true);
          }
        }
      });
    }

    if (currentUser?.id) {
      apiService.getFamilyMembers(currentUser.id).then(setFamilyMembers);
    } else {
      setFamilyMembers([]);
    }
  }, [slug, currentUser?.id, isDirectBookingRequest]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/doctors');
    }
  };

  const handleCreated = (app: Appointment) => {
    if (onAppointmentCreated) {
      onAppointmentCreated(app);
    }
    navigate('/patient');
  };

  if (!doctor) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-slate-500">در حال دریافت اطلاعات پروفایل پزشک...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <div>
          <span>پزشکان</span> / <span className="text-slate-800 font-bold">{doctor.name}</span>
        </div>
        <button onClick={handleBack} className="text-blue-600 font-bold hover:underline cursor-pointer">
          ← بازگشت به جستجو
        </button>
      </div>

      {/* Doctor Hero Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
        <MedicalVectorPattern opacity={0.045} variant="light" patternId="doctor-profile-med-pattern" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-2 border-blue-400/30 shadow-lg"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{doctor.name}</h1>
                <Badge variant="blue">تاییدیه نظام پزشکی</Badge>
              </div>

              <p className="text-sm text-blue-300 font-semibold">{doctor.title}</p>
              <p className="text-xs text-slate-400">کد نظام پزشکی: {doctor.medicalCouncilNumber}</p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <Rating value={doctor.rating} count={doctor.reviewCount} size="md" />
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">{doctor.experienceYears} سال سابقه درمان</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">شهر: {doctor.city}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {(isWebsitePubliclyVisible(doctor.websiteConfig) || canPreviewDoctorWebsite(currentUser, doctor.id)) && (
              <Link
                to={`/site/${doctor.slug}`}
                className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-600/40 text-xs font-bold transition-all shadow-xs"
                title={`ساب‌دامنه اختصاصی همرا: ${getDoctorSubdomain(doctor)}`}
              >
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="flex flex-col text-right">
                  <span>
                    {isWebsitePubliclyVisible(doctor.websiteConfig)
                      ? 'وبسایت اختصاصی پزشک'
                      : 'پیش‌نمایش وبسایت (مخصوص پزشک/مدیر)'}
                  </span>
                  <span className="text-[10px] text-blue-300/80 font-mono" dir="ltr">
                    {getDoctorSubdomain(doctor)}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 mr-0.5 text-blue-400" />
              </Link>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowWizardModal(true)}
              icon={<Calendar className="w-5 h-5" />}
            >
              رزرو سریع نوبت
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-sm font-medium">
            {[
              { id: 'about', label: 'بیوگرافی و مدارک' },
              { id: 'services', label: 'خدمات تخصصی' },
              { id: 'insurances', label: 'بیمه‌های طرف قرارداد' },
              { id: 'reviews', label: `نظرات بیماران (${reviews.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: About */}
          {activeTab === 'about' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs text-xs text-slate-800">
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-900">بیوگرافی و سوابق بالینی:</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{doctor.bio}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-900">سوابق تحصیلی و دانشگاهی:</h3>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                  {doctor.education.map((edu, idx) => (
                    <li key={idx}>{edu}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-900">زبان‌های پاسخگویی:</h3>
                <div className="flex gap-2">
                  {doctor.languages.map((lang, idx) => (
                    <Badge key={idx} variant="slate">{lang}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Services */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3 shadow-xs text-xs">
              <h3 className="font-bold text-sm text-slate-900">خدمات قابل ارائه در مطب:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {doctor.services.map((srv, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center gap-2 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Insurances */}
          {activeTab === 'insurances' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs text-xs">
              <h3 className="font-bold text-sm text-slate-900">بیمه‌های پایه و تکمیلی ثبت‌شده طرف قرارداد:</h3>
              {doctor.supportedInsurances && doctor.supportedInsurances.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {doctor.supportedInsurances.map((ins, idx) => (
                    <Badge key={idx} variant="emerald" size="md">{ins}</Badge>
                  ))}
                </div>
              ) : (
                <div className="text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  اطلاعات بیمه برای این پزشک/مرکز ثبت نشده است.
                </div>
              )}
              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                ⚠️ اطلاعات و محاسبات بیمه در نسخه فعلی نمایشی هستند و به سامانه آنلاین بیمه متصل نیستند.
              </div>
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-2xl font-black text-slate-900">{doctor.rating.toFixed(1)} / ۵</div>
                  <div className="text-slate-500 text-xs">بر اساس {doctor.reviewCount} نظر بیماران</div>
                </div>
                <div className="space-y-1 text-slate-600">
                  <div>رفتار پزشک: ۵.۰ ★</div>
                  <div>زمان انتظار: ۴.۸ ★</div>
                  <div>توضیحات و درمان: ۴.۹ ★</div>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map(rev => (
                  <div key={rev.id} className="p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{rev.patientName}</span>
                      <span className="text-slate-400 font-normal text-[11px]">{rev.date}</span>
                    </div>
                    <Rating value={rev.rating} size="sm" showValue={false} />
                    <p className="text-slate-700 leading-relaxed font-medium">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-200 p-6 shadow-lg space-y-5 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <div className="font-extrabold text-base text-slate-900">دریافت نوبت از {doctor.name}</div>
              <div className="text-blue-600 font-semibold mt-0.5">نزدیک‌ترین زمان: {doctor.nextAvailableSlot}</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ویزیت حضوری:</span>
                <span className="font-bold text-slate-900">{doctor.consultationFee.toLocaleString('fa-IR')} تومان</span>
              </div>
              {doctor.hasOnlineConsultation && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">مشاوره آنلاین تصویری:</span>
                  <span className="font-bold text-sky-700">
                    {(doctor.onlineConsultationFee || 280000).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200/80 p-3 rounded-xl text-blue-900 space-y-1">
              <span className="font-bold block">مکان مطب:</span>
              <p className="text-slate-700 leading-relaxed">{doctor.address}</p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full cursor-pointer"
              onClick={() => setShowWizardModal(true)}
              icon={<Calendar className="w-4 h-4" />}
            >
              شروع فرایند رزرو نوبت
            </Button>
          </div>
        </div>
      </div>

      {/* Appointment Wizard Overlay Modal */}
      {showWizardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[96vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl">
            <AppointmentWizard
              doctor={doctor}
              familyMembers={familyMembers}
              onComplete={app => {
                handleCreated(app);
                setShowWizardModal(false);
              }}
              onCancel={() => {
                bookingIntentService.clear();
                setShowWizardModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
