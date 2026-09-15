import React from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types';
import { MapPin, Clock, Video, Shield, Calendar, ArrowLeft, Globe, ExternalLink } from 'lucide-react';
import { Rating } from '../common/Rating';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ClinicalCornerAccents } from '../common/medicalPattern/ClinicalCardAccent';

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (doctorSlug: string) => void;
  onQuickBook?: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelect, onQuickBook }) => {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between gap-3 sm:gap-4 group">
      {/* Swiss Clinical Corner Crosses */}
      <ClinicalCornerAccents variant="cross" className="opacity-30 group-hover:opacity-75 group-hover:text-blue-500 transition-all" />

      {/* Upper Info */}
      <div className="space-y-3 sm:space-y-4">
        {/* Profile Header */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shadow-2xs group-hover:scale-102 transition-transform"
            />
            {doctor.hasOnlineConsultation && (
              <span className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-1 rounded-full shadow-xs" title="ویزیت تصویری آنلاین">
                <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h3 
                onClick={() => onSelect(doctor.slug)}
                className="font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition-colors cursor-pointer truncate"
              >
                {doctor.name}
              </h3>
              <Badge variant="blue" size="sm" className="shrink-0 text-[10px] sm:text-xs">
                {doctor.experienceYears} سال
              </Badge>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 font-medium">{doctor.title}</p>
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <p className="text-xs text-blue-700 font-bold truncate">{doctor.specialtyName}</p>
              <Link
                to={`/site/${doctor.slug}`}
                className="text-[10px] sm:text-[11px] text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 font-bold shrink-0"
                title="مشاهده وبسایت رسمی پزشک"
              >
                <Globe className="w-3 h-3 text-blue-600" />
                <span>سایت شخصی</span>
              </Link>
            </div>

            <div className="pt-0.5 sm:pt-1">
              <Rating value={doctor.rating} count={doctor.reviewCount} size="sm" />
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="bg-slate-50/90 rounded-xl p-2.5 sm:p-3 text-[11px] sm:text-xs space-y-1.5 sm:space-y-2 border border-slate-100">
          <div className="flex items-center justify-between text-slate-600 gap-2">
            <span className="flex items-center gap-1 text-slate-500 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              مکان:
            </span>
            <span className="font-medium text-slate-800 truncate text-left">{doctor.city} - {doctor.address.split('،')[0]}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600 gap-2">
            <span className="flex items-center gap-1 text-slate-500 shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              نزدیک‌ترین نوبت:
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 shrink-0">
              {doctor.nextAvailableSlot}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600 gap-2">
            <span className="flex items-center gap-1 text-slate-500 shrink-0">
              <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              بیمه‌ها:
            </span>
            <div className="flex items-center gap-1 overflow-hidden">
              <span className="text-slate-700 font-bold truncate text-[10px] sm:text-[11px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-100">
                {doctor.supportedInsurances.slice(0, 2).join('، ')}
                {doctor.supportedInsurances.length > 2 && (
                  <span className="text-[10px] text-blue-600 font-normal mr-1">
                    +{doctor.supportedInsurances.length - 2}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions with Apple/Android Min Touch Target */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onSelect(doctor.slug)}
          className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer"
        >
          رزومه و نظرات
        </button>
        <button
          type="button"
          onClick={() => {
            if (onQuickBook) onQuickBook(doctor);
            else onSelect(doctor.slug);
          }}
          className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>دریافت نوبت</span>
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>
    </div>
  );
};
