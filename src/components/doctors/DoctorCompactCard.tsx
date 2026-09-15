import React from 'react';
import { Doctor } from '../../types';
import { Clock, Star, Calendar, Video, MapPin, ChevronLeft } from 'lucide-react';

interface DoctorCompactCardProps {
  doctor: Doctor;
  onSelect: (doctorSlug: string) => void;
  onQuickBook?: (doctor: Doctor) => void;
}

export const DoctorCompactCard: React.FC<DoctorCompactCardProps> = ({
  doctor,
  onSelect,
  onQuickBook
}) => {
  return (
    <div 
      onClick={() => onSelect(doctor.slug)}
      className="bg-white rounded-2xl border border-slate-200/85 p-3 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3 group"
      dir="rtl"
    >
      {/* Left: Avatar and Bio */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-13 h-13 rounded-2xl object-cover border border-slate-100 shadow-2xs group-hover:scale-105 transition-transform"
          />
          {doctor.hasOnlineConsultation && (
            <span 
              className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-0.5 rounded-full shadow-2xs" 
              title="ویزیت تصویری فعال"
            >
              <Video className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {doctor.name}
            </h4>
            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.2 rounded-md shrink-0">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{doctor.rating}</span>
            </span>
          </div>

          <p className="text-[11px] font-bold text-blue-700 truncate">
            {doctor.specialtyName}
          </p>

          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md font-medium shrink-0">
              <Clock className="w-2.5 h-2.5 text-emerald-600" />
              <span>نوبت: {doctor.nextAvailableSlot}</span>
            </span>
            <span className="hidden sm:inline truncate text-slate-400">
              {doctor.city}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Button */}
      <div className="shrink-0 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onQuickBook) {
              onQuickBook(doctor);
            } else {
              onSelect(doctor.slug);
            }
          }}
          className="bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1 border border-blue-200/60 shadow-2xs cursor-pointer active:scale-95"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">رزرو</span>
        </button>
        <div className="p-1 text-slate-300 group-hover:text-blue-600 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
