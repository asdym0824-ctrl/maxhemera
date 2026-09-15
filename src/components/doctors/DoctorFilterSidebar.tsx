import React, { useState } from 'react';
import { Specialty } from '../../types';
import { Filter, RotateCcw, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { MOCK_INSURANCES } from '../../data/mockData';
import { InsuranceFinderModal } from '../insurance/InsuranceFinderModal';

interface DoctorFilterSidebarProps {
  specialties: Specialty[];
  selectedSpecialtyId: string;
  setSelectedSpecialtyId: (id: string) => void;
  hasOnlineConsultation: boolean;
  setHasOnlineConsultation: (val: boolean) => void;
  selectedGender: 'all' | 'male' | 'female';
  setSelectedGender: (val: 'all' | 'male' | 'female') => void;
  selectedInsurance: string;
  setSelectedInsurance: (val: string) => void;
  sortBy: 'recommended' | 'rating' | 'experience';
  setSortBy: (val: 'recommended' | 'rating' | 'experience') => void;
  onReset: () => void;
}

export const DoctorFilterSidebar: React.FC<DoctorFilterSidebarProps> = ({
  specialties,
  selectedSpecialtyId,
  setSelectedSpecialtyId,
  hasOnlineConsultation,
  setHasOnlineConsultation,
  selectedGender,
  setSelectedGender,
  selectedInsurance,
  setSelectedInsurance,
  sortBy,
  setSortBy,
  onReset
}) => {
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);

  const basicInsurances = MOCK_INSURANCES.filter(i => i.type === 'basic');
  const suppInsurances = MOCK_INSURANCES.filter(i => i.type === 'supplementary' || i.type === 'specialized');

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-xs" dir="rtl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="font-bold text-base text-slate-800 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>فیلترهای پیشرفته</span>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>پاک‌سازی</span>
          </button>
        </div>

        {/* Insurance Finder Highlight Box */}
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-200/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>کدام دکتر بیمه مرا قبول می‌کند؟</span>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            محاسبه تخمینی سهم بیمه پایه و تکمیلی با تعرفه‌های ثبت‌شده.
          </p>
          <button
            onClick={() => setIsInsuranceModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>راهنمای جامع پوشش بیمه‌ها</span>
          </button>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">مرتب‌سازی نتایج:</label>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            {[
              { id: 'recommended', label: 'پیشنهادی همرا کلینیک' },
              { id: 'rating', label: 'بالاترین امتیاز بیماران' },
              { id: 'experience', label: 'بیشترین سابقه بالینی' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSortBy(item.id as any)}
                className={`w-full text-right px-3 py-2 rounded-xl border transition-colors flex items-center justify-between cursor-pointer ${
                  sortBy === item.id
                    ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                    : 'bg-slate-50/50 border-slate-200/80 text-slate-600 hover:bg-slate-100/60'
                }`}
              >
                <span>{item.label}</span>
                {sortBy === item.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Specialty Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">تخصص پزشکی:</label>
          <select
            value={selectedSpecialtyId}
            onChange={e => setSelectedSpecialtyId(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-600/30"
          >
            <option value="">همه تخصص‌ها ({specialties.length})</option>
            {specialties.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.doctorCount} پزشک)
              </option>
            ))}
          </select>
        </div>

        {/* Online Consultation Toggle */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">فقط مشاوره آنلاین تصویری</span>
          <button
            onClick={() => setHasOnlineConsultation(!hasOnlineConsultation)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              hasOnlineConsultation ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                hasOnlineConsultation ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">جنسیت پزشک:</label>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {[
              { id: 'all', label: 'همه' },
              { id: 'female', label: 'خانم' },
              { id: 'male', label: 'آقا' }
            ].map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGender(g.id as any)}
                className={`py-1.5 rounded-xl border text-center transition-colors cursor-pointer ${
                  selectedGender === g.id
                    ? 'bg-slate-900 text-white font-bold border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Insurance */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">بیمه طرف قرارداد:</label>
          <select
            value={selectedInsurance}
            onChange={e => setSelectedInsurance(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-600/30"
          >
            <option value="">همه بیمه‌ها (بدون فیلتر)</option>
            <optgroup label="بیمه‌های پایه درمانی">
              {basicInsurances.map(ins => (
                <option key={ins.id} value={ins.name}>
                  {ins.name} ({ins.coverageCoPayPercent}٪ پوشش)
                </option>
              ))}
            </optgroup>
            <optgroup label="بیمه‌های تکمیلی و درمانی">
              {suppInsurances.map(ins => (
                <option key={ins.id} value={ins.name}>
                  {ins.name} ({ins.coverageCoPayPercent}٪ کسر آنلاین)
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <InsuranceFinderModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        initialInsuranceName={selectedInsurance}
        specialties={specialties}
      />
    </>
  );
};
