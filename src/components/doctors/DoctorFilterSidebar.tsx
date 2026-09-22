import React, { useState, useMemo } from 'react';
import { Specialty } from '../../types';
import { Filter, RotateCcw, Check, ShieldCheck, Sparkles, MapPin, X, Stethoscope } from 'lucide-react';
import { MOCK_INSURANCES } from '../../data/mockData';
import { IRAN_PROVINCES } from '../../data/provinces';
import { InsuranceFinderModal } from '../insurance/InsuranceFinderModal';
import { MultiSelectDropdown, MultiSelectOption } from '../search/MultiSelectDropdown';

interface DoctorFilterSidebarProps {
  specialties: Specialty[];
  selectedSpecialtyId: string;
  setSelectedSpecialtyId: (id: string) => void;
  selectedProvince: string;
  setSelectedProvince: (province: string) => void;
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
  selectedProvince,
  setSelectedProvince,
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

  // Multi-select option definitions
  const provinceOptions: MultiSelectOption[] = useMemo(() => {
    return IRAN_PROVINCES.map(p => ({
      value: p,
      label: p
    }));
  }, []);

  const specialtyOptions: MultiSelectOption[] = useMemo(() => {
    return specialties.map(s => ({
      value: s.id,
      label: s.name,
      badge: `${s.doctorCount} پزشک`
    }));
  }, [specialties]);

  const insuranceOptions: MultiSelectOption[] = useMemo(() => {
    return [
      ...basicInsurances.map(i => ({
        value: i.name,
        label: i.name,
        group: 'بیمه‌های پایه درمانی'
      })),
      ...suppInsurances.map(i => ({
        value: i.name,
        label: i.name,
        group: 'بیمه‌های تکمیلی و درمانی'
      }))
    ];
  }, [basicInsurances, suppInsurances]);

  // Parse comma-separated strings to arrays
  const provinceValues = useMemo(() => {
    return selectedProvince ? selectedProvince.split(',').map(p => p.trim()).filter(Boolean) : [];
  }, [selectedProvince]);

  const specialtyValues = useMemo(() => {
    return selectedSpecialtyId ? selectedSpecialtyId.split(',').map(s => s.trim()).filter(Boolean) : [];
  }, [selectedSpecialtyId]);

  const insuranceValues = useMemo(() => {
    return selectedInsurance ? selectedInsurance.split(',').map(i => i.trim()).filter(Boolean) : [];
  }, [selectedInsurance]);

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

        {/* Province Filter */}
        <div className="space-y-2">
          <MultiSelectDropdown
            id="sidebar-province-multi-select"
            label="استان‌های محل طبابت:"
            icon={<MapPin className="w-3.5 h-3.5 text-blue-600" />}
            options={provinceOptions}
            selectedValues={provinceValues}
            onChange={vals => setSelectedProvince(vals.join(','))}
            placeholder="انتخاب استان‌ها (امکان انتخاب همزمان)"
            searchPlaceholder="جستجوی استان..."
            unitLabel="استان"
            variant="light"
          />

          {/* Quick province chips (Multi-select enabled) */}
          <div className="flex flex-wrap gap-1 pt-1">
            {['استان تهران', 'استان البرز', 'استان اصفهان', 'استان خراسان رضوی', 'استان فارس', 'استان آذربایجان شرقی'].map(prov => {
              const isSelected = provinceValues.includes(prov);
              return (
                <button
                  key={prov}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      const next = provinceValues.filter(p => p !== prov);
                      setSelectedProvince(next.join(','));
                    } else {
                      setSelectedProvince([...provinceValues, prov].join(','));
                    }
                  }}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{prov.replace('استان ', '')}</span>
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Specialty Filter */}
        <div className="space-y-2">
          <MultiSelectDropdown
            id="sidebar-specialty-multi-select"
            label="تخصص‌های پزشکی:"
            icon={<Stethoscope className="w-3.5 h-3.5 text-blue-600" />}
            options={specialtyOptions}
            selectedValues={specialtyValues}
            onChange={vals => setSelectedSpecialtyId(vals.join(','))}
            placeholder="انتخاب تخصص‌ها (امکان انتخاب همزمان)"
            searchPlaceholder="جستجوی تخصص..."
            unitLabel="تخصص"
            variant="light"
          />

          {/* Quick top specialties chips */}
          <div className="flex flex-wrap gap-1 pt-1">
            {specialties.slice(0, 4).map(spec => {
              const isSelected = specialtyValues.includes(spec.id);
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      const next = specialtyValues.filter(id => id !== spec.id);
                      setSelectedSpecialtyId(next.join(','));
                    } else {
                      setSelectedSpecialtyId([...specialtyValues, spec.id].join(','));
                    }
                  }}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{spec.name.replace('متخصص ', '').replace('فوق تخصص ', '')}</span>
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
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
          <MultiSelectDropdown
            id="sidebar-insurance-multi-select"
            label="بیمه‌های طرف قرارداد:"
            icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
            options={insuranceOptions}
            selectedValues={insuranceValues}
            onChange={vals => setSelectedInsurance(vals.join(','))}
            placeholder="انتخاب بیمه‌ها (امکان انتخاب همزمان)"
            searchPlaceholder="جستجوی بیمه پایه یا تکمیلی..."
            unitLabel="بیمه"
            variant="light"
          />
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
