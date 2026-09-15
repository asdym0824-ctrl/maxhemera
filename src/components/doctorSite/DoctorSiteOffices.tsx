import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  Navigation, 
  Building2,
  CheckCircle,
  ExternalLink,
  LocateFixed,
  Sparkles
} from 'lucide-react';
import { Doctor, DoctorOffice } from '../../types';
import { ThemeStyles } from './themeConfig';
import { calculateDistanceKm } from '../../services/apiService';

interface Props {
  doctor: Doctor;
  theme: ThemeStyles;
  onBookOffice: (officeTitle?: string, officeId?: string) => void;
}

export const DoctorSiteOffices: React.FC<Props> = ({ doctor, theme, onBookOffice }) => {
  const config = doctor.websiteConfig;
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  if (config?.sectionVisibility?.offices === false) return null;

  const fallbackOffice: DoctorOffice = {
    id: 'default-office',
    title: 'مطب اصلی',
    address: doctor.address,
    city: doctor.city,
    phone: doctor.websiteConfig?.phone || '021-22000000',
    workingHours: 'شنبه تا چهارشنبه از ساعت ۱۶:۰۰ الی ۲۰:۳۰',
    isPrimary: true,
    note: 'پذیرش با تعیین وقت قبلی الزامی است.',
    coordinates: { lat: 35.7832, lng: 51.3745 }
  };

  const offices = (doctor.offices && doctor.offices.length > 0) ? doctor.offices : [fallbackOffice];

  const officesWithDistance = offices.map(office => {
    const lat = office.coordinates?.lat || (office.isPrimary ? 35.7832 : 35.7500);
    const lng = office.coordinates?.lng || (office.isPrimary ? 51.3745 : 51.4100);
    const uLat = userLocation?.lat || 35.7500;
    const uLng = userLocation?.lng || 51.3800;
    const dist = calculateDistanceKm(uLat, uLng, lat, lng);
    return {
      ...office,
      lat,
      lng,
      distanceKm: dist
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <section id="offices" className="py-16 md:py-20 bg-white border-b border-slate-200/80" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg}`}>
            <MapPin className="w-3.5 h-3.5" />
            <span>مراجعه حضوری و مطب‌ها</span>
          </span>
          <h2 className={`text-2xl sm:text-3xl ${theme.sectionHeadingClass}`}>
            مطب‌ها و مراکز درمانی ویزیت حضوری {doctor.name}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            جهت مراجعه حضوری، نزدیک‌ترین شعبه یا مطب را انتخاب فرموده و با یک کلیک نوبت خود را رزرو و مسیریابی نمایید.
          </p>
        </div>

        {/* Offices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {officesWithDistance.map((office, idx) => {
            const isNearest = idx === 0;
            const neshanUrl = `https://neshan.org/maps/@${office.lat},${office.lng},17z`;
            const baladUrl = `https://balad.ir/location?latitude=${office.lat}&longitude=${office.lng}`;
            const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}`;

            return (
              <div
                key={office.id}
                className={`p-6 sm:p-8 rounded-3xl ${theme.cardBg} ${
                  isNearest ? 'ring-2 ring-blue-600/50 border-blue-600 shadow-md' : theme.cardBorder
                } space-y-6 flex flex-col justify-between text-right`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {office.title}
                        </h3>
                        <div className="text-xs text-slate-400">{office.city}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isNearest && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-600 text-slate-950 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>نزدیک‌ترین مطب</span>
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {office.distanceKm} ک‌م
                      </span>
                    </div>
                  </div>

                  {/* Office Details */}
                  <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-600">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium text-slate-800">{office.address}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-slate-500">تلفن پذیرش:</span>
                      <a
                        href={`tel:${office.phone.replace(/[^0-9]/g, '')}`}
                        className="font-bold text-slate-900 hover:text-blue-700 font-mono text-sm"
                        dir="ltr"
                      >
                        {office.phone}
                      </a>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500">ساعات حضور: </span>
                        <span className="font-semibold text-slate-800">{office.workingHours}</span>
                      </div>
                    </div>

                    {office.note && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 leading-relaxed">
                        💡 {office.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Office Action CTAs */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <button
                    onClick={() => onBookOffice(office.title, office.id)}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold ${theme.primaryButton} cursor-pointer`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>دریافت نوبت حضوری در {office.title}</span>
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={neshanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                    >
                      <span>نشان</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={baladUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                    >
                      <span>بلد</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={googleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <span>Google Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

