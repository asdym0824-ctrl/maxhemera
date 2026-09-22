import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  X, 
  Search, 
  Check, 
  Building2, 
  Stethoscope, 
  Calculator, 
  Sparkles, 
  ArrowLeft, 
  Info, 
  Calendar, 
  CheckCircle2, 
  ChevronLeft, 
  Phone, 
  Clock, 
  MapPin, 
  Video, 
  SlidersHorizontal, 
  RotateCcw,
  Star,
  CheckSquare,
  Square
} from 'lucide-react';
import { Doctor, ClinicBranch, Specialty, InsuranceCompany } from '../../types';
import { apiService } from '../../services/apiService';
import { MOCK_INSURANCES } from '../../data/mockData';
import { IRAN_PROVINCES, isDoctorInProvince, getShortProvinceName } from '../../data/provinces';
import { ModalPortal } from '../common/ModalPortal';
import { MODAL_Z_INDEX } from '../../utils/modalManager';
import {
  calculateMultiInsuranceCoverage,
  supportsInsurance,
  supportsAnyInsurance,
  supportsAllInsurances,
  getMatchingInsurances,
  PRESET_DEMO_SERVICES,
  DEMO_DISCLAIMER_TEXT
} from '../../services/insuranceCoverageEngine';
import { AppointmentWizard } from '../appointments/AppointmentWizard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialInsuranceName?: string;
  doctors?: Doctor[];
  branches?: ClinicBranch[];
  specialties?: Specialty[];
}

export const InsuranceFinderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialInsuranceName,
  doctors: propDoctors,
  branches: propBranches,
  specialties: propSpecialties
}) => {
  const navigate = useNavigate();

  const [insurances, setInsurances] = useState<InsuranceCompany[]>(MOCK_INSURANCES);
  const [doctors, setDoctors] = useState<Doctor[]>(propDoctors || []);
  const [branches, setBranches] = useState<ClinicBranch[]>(propBranches || []);
  const [specialties, setSpecialties] = useState<Specialty[]>(propSpecialties || []);

  // Selected Insurances State (Multi-Select)
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>(() => {
    if (initialInsuranceName) return [initialInsuranceName];
    return ['تأمین اجتماعی', 'بیمه ایران'];
  });

  // Match Mode: 'any' (OR) vs 'all' (AND)
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any');

  // Advanced Filters State (matching the site data)
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [hasOnlineOnly, setHasOnlineOnly] = useState<boolean>(false);
  const [searchDoctorQuery, setSearchDoctorQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'most_matched' | 'rating' | 'experience' | 'fee_asc'>('most_matched');

  // Active Result Tab
  const [activeTab, setActiveTab] = useState<'doctors' | 'branches' | 'calculator' | 'guide'>('doctors');

  // Booking Wizard Modal State
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  // Calculator custom fee state
  const [calcServiceType, setCalcServiceType] = useState<string>('visit_specialist');
  const [customFeeAmount, setCustomFeeAmount] = useState<number>(350000);

  useEffect(() => {
    if (initialInsuranceName) {
      setSelectedInsurances(prev => {
        if (!prev.includes(initialInsuranceName)) {
          return [...prev, initialInsuranceName];
        }
        return prev;
      });
    }
  }, [initialInsuranceName]);

  useEffect(() => {
    if (!propDoctors || propDoctors.length === 0) {
      apiService.getDoctors().then(setDoctors);
    }
    if (!propBranches || propBranches.length === 0) {
      apiService.getBranches().then(setBranches);
    }
    if (!propSpecialties || propSpecialties.length === 0) {
      apiService.getSpecialties().then(setSpecialties);
    }
    apiService.getInsurances().then(setInsurances);
  }, [propDoctors, propBranches, propSpecialties]);

  // Basic vs Supplementary Lists
  const basicInsurances = useMemo(() => insurances.filter(i => i.type === 'basic'), [insurances]);
  const suppInsurances = useMemo(() => insurances.filter(i => i.type === 'supplementary' || i.type === 'specialized'), [insurances]);

  // Insurance Toggling Handlers
  const toggleInsurance = (insName: string) => {
    setSelectedInsurances(prev => {
      if (prev.includes(insName)) {
        return prev.filter(x => x !== insName);
      } else {
        return [...prev, insName];
      }
    });
  };

  const handleSelectAllBasic = () => {
    const basicNames = basicInsurances.map(b => b.name);
    setSelectedInsurances(prev => Array.from(new Set([...prev, ...basicNames])));
  };

  const handleSelectPopularSupp = () => {
    const popularSupp = ['بیمه ایران', 'بیمه دانا', 'بیمه البرز', 'بیمه آسیا', 'بیمه سامان'];
    setSelectedInsurances(prev => Array.from(new Set([...prev, ...popularSupp])));
  };

  const handleSelectAllInsurances = () => {
    setSelectedInsurances(insurances.map(i => i.name));
  };

  const handleClearAllInsurances = () => {
    setSelectedInsurances([]);
  };

  const handleResetFilters = () => {
    setSelectedSpecialtyId('');
    setSelectedProvince('');
    setSelectedBranchId('');
    setHasOnlineOnly(false);
    setSearchDoctorQuery('');
    setSortBy('most_matched');
  };

  // Filtered Doctors based on selected insurances & all advanced criteria
  const matchedDoctors = useMemo(() => {
    return doctors.filter(doc => {
      // 1. Insurance multi-match
      let matchesInsurance = true;
      if (selectedInsurances.length > 0) {
        if (matchMode === 'all') {
          matchesInsurance = supportsAllInsurances(doc.supportedInsurances, selectedInsurances);
        } else {
          matchesInsurance = supportsAnyInsurance(doc.supportedInsurances, selectedInsurances);
        }
      }

      // 2. Specialty match
      const matchesSpecialty = selectedSpecialtyId ? doc.specialtyId === selectedSpecialtyId : true;

      // 3. Province match
      const matchesProvince = selectedProvince ? isDoctorInProvince(doc, selectedProvince) : true;

      // 4. Branch match
      const matchesBranch = selectedBranchId
        ? (doc.branchId === selectedBranchId || Boolean(doc.offices?.some(o => o.branchId === selectedBranchId)))
        : true;

      // 5. Online consultation match
      const matchesOnline = hasOnlineOnly ? Boolean(doc.hasOnlineConsultation) : true;

      // 6. Search query
      const matchesSearch = searchDoctorQuery.trim() === '' || 
        doc.name.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
        doc.specialtyName.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchDoctorQuery.toLowerCase());

      return matchesInsurance && matchesSpecialty && matchesProvince && matchesBranch && matchesOnline && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'most_matched' && selectedInsurances.length > 0) {
        const countA = getMatchingInsurances(a.supportedInsurances, selectedInsurances).length;
        const countB = getMatchingInsurances(b.supportedInsurances, selectedInsurances).length;
        if (countB !== countA) return countB - countA;
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'fee_asc') return a.consultationFee - b.consultationFee;
      return (b.experienceYears || 0) - (a.experienceYears || 0);
    });
  }, [doctors, selectedInsurances, matchMode, selectedSpecialtyId, selectedProvince, selectedBranchId, hasOnlineOnly, searchDoctorQuery, sortBy]);

  // Filtered Branches based on selected insurances & province
  const matchedBranches = useMemo(() => {
    return branches.filter(branch => {
      let matchesInsurance = true;
      if (selectedInsurances.length > 0) {
        if (matchMode === 'all') {
          matchesInsurance = supportsAllInsurances(branch.supportedInsurances, selectedInsurances);
        } else {
          matchesInsurance = supportsAnyInsurance(branch.supportedInsurances, selectedInsurances);
        }
      }

      const matchesProvince = selectedProvince 
        ? (branch.city?.includes(getShortProvinceName(selectedProvince)) || branch.address?.includes(getShortProvinceName(selectedProvince)))
        : true;

      return matchesInsurance && matchesProvince;
    });
  }, [branches, selectedInsurances, matchMode, selectedProvince]);

  // Multi-Insurance Coverage Calculation for custom fee
  const coverageCalculation = useMemo(() => {
    return calculateMultiInsuranceCoverage(customFeeAmount, selectedInsurances);
  }, [customFeeAmount, selectedInsurances]);

  const presetServices = [
    ...PRESET_DEMO_SERVICES,
    { id: 'custom', label: 'مبلغ دلخواه شما', fee: customFeeAmount }
  ];

  if (!isOpen) return null;

  return (
    <>
      <ModalPortal isOpen={isOpen} onClose={onClose} zIndexClass={MODAL_Z_INDEX.BASE_MODAL}>
        <div 
          className="fixed inset-0 min-h-[100dvh] w-screen flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" 
          dir="rtl"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="insurance-finder-modal-title"
        >
          <div 
            className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] text-slate-800 my-auto"
            onClick={e => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 relative shrink-0">
              <button
                onClick={onClose}
                aria-label="بستن پنجره"
                className="absolute left-4 top-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      پشتیبانی از انتخاب همزمان چند بیمه
                    </span>
                    <h3 id="insurance-finder-modal-title" className="text-base sm:text-lg font-black">
                      راهنمای بیمه‌های طرف قرارداد و برآورد هوشمند پوشش
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    بیمه‌های پایه و تکمیلی خود را انتخاب نمایید تا پزشکان و شعب سازگار با تعرفه بیمه‌ای نمایش داده شوند
                  </p>
                </div>
              </div>

              {/* Demo Helper Banner */}
              <div className="mt-2.5 bg-amber-500/15 border border-amber-400/30 rounded-xl p-2 px-3 flex items-center gap-2 text-[11px] text-amber-200">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{DEMO_DISCLAIMER_TEXT}</span>
              </div>
            </div>

            {/* Multi-Insurance Selection Section */}
            <div className="bg-slate-50/90 border-b border-slate-200 p-3.5 sm:p-4 shrink-0 space-y-3">
              {/* Presets and Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-700">بیمه‌های انتخابی:</span>
                  <span className="text-xs font-black bg-emerald-600 text-white px-2 py-0.5 rounded-lg shadow-2xs">
                    {selectedInsurances.length} بیمه فعال
                  </span>

                  {/* Match Mode Switch */}
                  <div className="inline-flex items-center bg-white p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setMatchMode('any')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        matchMode === 'any'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="نمایش پزشکانی که حداقل یکی از بیمه‌های انتخابی را قبول دارند"
                    >
                      حداقل یکی (تطبیق جامع)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchMode('all')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        matchMode === 'all'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="نمایش پزشکانی که تمام بیمه‌های انتخابی را همزمان قبول دارند"
                    >
                      پوشش همه (تطبیق کامل)
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllBasic}
                    className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold transition-colors cursor-pointer text-[11px]"
                  >
                    + همه پایه‌ها
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectPopularSupp}
                    className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold transition-colors cursor-pointer text-[11px]"
                  >
                    + تکمیلی‌های پرکاربرد
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllInsurances}
                    className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold transition-colors cursor-pointer text-[11px]"
                  >
                    انتخاب همه
                  </button>
                  {selectedInsurances.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllInsurances}
                      className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>حذف همه</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Insurances Chip Rows */}
              <div className="space-y-2">
                {/* 1. Basic Insurances */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">بیمه‌های پایه:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {basicInsurances.map(ins => {
                      const isSelected = selectedInsurances.includes(ins.name);
                      return (
                        <button
                          key={ins.id}
                          type="button"
                          onClick={() => toggleInsurance(ins.name)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{ins.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Supplementary Insurances */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">بیمه‌های تکمیلی:</span>
                  <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto pr-1">
                    {suppInsurances.map(ins => {
                      const isSelected = selectedInsurances.includes(ins.name);
                      return (
                        <button
                          key={ins.id}
                          type="button"
                          onClick={() => toggleInsurance(ins.name)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{ins.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active Selected Tags Strip */}
              {selectedInsurances.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">بیمه‌های فعال شما:</span>
                    {selectedInsurances.map((name, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] font-bold bg-white text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs"
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => toggleInsurance(name)}
                          className="hover:text-rose-600 transition-colors cursor-pointer text-slate-400"
                          title="حذف"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg font-bold border border-emerald-200">
                      پوشش تخمینی سهم بیمه: تا {coverageCalculation.savingsPercentage}٪
                    </span>
                    <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg font-bold border border-blue-200">
                      {matchedDoctors.length} پزشک طرف قرارداد
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 gap-2 shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('doctors')}
                className={`py-2.5 px-3.5 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'doctors'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>پزشکان سازگار ({matchedDoctors.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('branches')}
                className={`py-2.5 px-3.5 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'branches'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>شعب دارای باجه بیمه ({matchedBranches.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className={`py-2.5 px-3.5 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'calculator'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>محاسبه‌گر فرانشیز بیمه</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`py-2.5 px-3.5 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'guide'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>راهنمای نسخه الکترونیک</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 min-h-0 bg-slate-50/50">
              
              {/* TAB 1: DOCTORS LIST */}
              {activeTab === 'doctors' && (
                <div className="space-y-4">
                  
                  {/* Advanced Filters Toolbar (matching site data) */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {/* 1. Search Query */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchDoctorQuery}
                          onChange={e => setSearchDoctorQuery(e.target.value)}
                          placeholder="جستجوی نام یا تخصص پزشک..."
                          className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                        />
                      </div>

                      {/* 2. Specialty Filter */}
                      <select
                        value={selectedSpecialtyId}
                        onChange={e => setSelectedSpecialtyId(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="">همه تخصص‌ها ({specialties.length})</option>
                        {specialties.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.doctorCount})
                          </option>
                        ))}
                      </select>

                      {/* 3. Province Filter */}
                      <select
                        value={selectedProvince}
                        onChange={e => setSelectedProvince(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="">همه استان‌ها ({IRAN_PROVINCES.length})</option>
                        {IRAN_PROVINCES.map(p => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>

                      {/* 4. Branch Filter */}
                      <select
                        value={selectedBranchId}
                        onChange={e => setSelectedBranchId(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="">همه شعب ({branches.length})</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Secondary Filters Row: Online consultation toggle, sorting, and reset */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setHasOnlineOnly(!hasOnlineOnly)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                            hasOnlineOnly
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>فقط ویزیت آنلاین تصویری</span>
                        </button>

                        {(selectedSpecialtyId || selectedProvince || selectedBranchId || hasOnlineOnly || searchDoctorQuery) && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="text-xs text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>پاک‌سازی فیلترهای فرعی</span>
                          </button>
                        )}
                      </div>

                      {/* Sort Selector */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                        <span>مرتب‌سازی:</span>
                        <select
                          value={sortBy}
                          onChange={e => setSortBy(e.target.value as any)}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 cursor-pointer"
                        >
                          <option value="most_matched">بیشترین بیمه‌های منطبق</option>
                          <option value="rating">بیشترین امتیاز بیماران</option>
                          <option value="experience">بیشترین سابقه طبابت</option>
                          <option value="fee_asc">کمترین تعرفه آزاد</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Cards Grid */}
                  {matchedDoctors.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
                      <h4 className="font-bold text-slate-800 text-sm">پزشکی با فیلترهای انتخابی یافت نشد</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        می‌توانید حالت تطبیق را روی «حداقل یکی (تطبیق جامع)» قرار دهید، بیمه‌های بیشتری را انتخاب کنید یا فیلتر تخصص و استان را تغییر دهید.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setMatchMode('any');
                          handleResetFilters();
                        }}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        تغییر به تطبیق جامع و بازنشانی فیلترها
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {matchedDoctors.map(doc => {
                        const doctorFeeEstimate = calculateMultiInsuranceCoverage(doc.consultationFee, selectedInsurances);
                        const matchedInsurancesList = getMatchingInsurances(doc.supportedInsurances, selectedInsurances);

                        return (
                          <div 
                            key={doc.id}
                            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              {/* Doctor Header */}
                              <div className="flex items-start gap-3">
                                <img 
                                  src={doc.avatar} 
                                  alt={doc.name} 
                                  className="w-13 h-13 rounded-2xl object-cover border border-slate-100 shrink-0 shadow-2xs" 
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h5 className="font-bold text-slate-900 text-sm truncate">{doc.name}</h5>
                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-md text-[10px] font-black shrink-0">
                                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                      <span>{doc.rating}</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 truncate mt-0.5">{doc.title} - {doc.specialtyName}</p>
                                  
                                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      <span>{doc.clinicName || 'شعبه مرکزی سعادت‌آباد'}</span>
                                    </span>
                                    {doc.province && (
                                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                        <span>{doc.province.replace('استان ', '')}</span>
                                      </span>
                                    )}
                                    {doc.hasOnlineConsultation && (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                        <Video className="w-3 h-3" />
                                        <span>ویزیت آنلاین فعال</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Insurance Matching Badge & Tags */}
                              <div className="space-y-1.5 pt-1">
                                {selectedInsurances.length > 0 && (
                                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 bg-emerald-50/90 px-2.5 py-1 rounded-xl border border-emerald-200">
                                    <span className="flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>منطبق با {matchedInsurancesList.length} از {selectedInsurances.length} بیمه انتخابی شما</span>
                                    </span>
                                    <span className="text-[10px] text-emerald-700 font-extrabold">پذیرش آنلاین</span>
                                  </div>
                                )}

                                {/* Insurance Pills */}
                                <div className="flex flex-wrap gap-1">
                                  {doc.supportedInsurances.map((insName, idx) => {
                                    const isMatched = selectedInsurances.length > 0 && supportsInsurance([insName], selectedInsurances.find(s => supportsInsurance([insName], s)) || '');

                                    return (
                                      <span 
                                        key={idx}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                          isMatched 
                                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black shadow-2xs' 
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {isMatched && '✓ '}
                                        {insName}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Fee estimation box */}
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                                <div className="flex items-center justify-between text-slate-500">
                                  <span>تعرفه مصوب آزاد:</span>
                                  <span className="line-through">{doc.consultationFee.toLocaleString('fa-IR')} تومان</span>
                                </div>
                                <div className="flex items-center justify-between text-emerald-900 font-bold">
                                  <span className="flex items-center gap-1">
                                    <span>برآورد پرداختی با بیمه‌های شما:</span>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-black">
                                      {doctorFeeEstimate.savingsPercentage}٪ کسر
                                    </span>
                                  </span>
                                  <span className="font-black font-mono text-sm text-blue-900">
                                    {doctorFeeEstimate.patientPayable.toLocaleString('fa-IR')} تومان
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                onClick={() => {
                                  onClose();
                                  navigate(`/doctors/${doc.slug || doc.id}`);
                                }}
                                className="text-xs font-bold text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>پروفایل و برنامه حضور</span>
                              </button>

                              <button
                                onClick={() => setBookingDoctor(doc)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>دریافت نوبت اینترنتی</span>
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: BRANCHES */}
              {activeTab === 'branches' && (
                <div className="space-y-4">
                  <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-950 flex items-center justify-between flex-wrap gap-2">
                    <span>
                      نمایش شعب دارای باجه فعال پذیرش بیمه‌های انتخابی شما ({selectedInsurances.join('، ') || 'همه بیمه‌ها'})
                    </span>
                    <span className="font-bold bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                      {matchedBranches.length} شعبه فعال
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedBranches.map(br => (
                      <div key={br.id} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900 text-sm">{br.name}</h5>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            باجه پذیرش آنلاین بیمه
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{br.address}</span>
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {(br.supportedInsurances || []).map((ins, idx) => {
                            const isMatch = selectedInsurances.length > 0 && supportsInsurance([ins], selectedInsurances.find(s => supportsInsurance([ins], s)) || '');

                            return (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                  isMatch ? 'bg-emerald-100 text-emerald-900 font-black border border-emerald-300' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {isMatch && '✓ '}
                                {ins}
                              </span>
                            );
                          })}
                        </div>

                        <div className="text-xs text-slate-500 flex flex-col gap-1 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> تلفن پذیرش:</span>
                            <span className="font-bold text-slate-700" dir="ltr">{br.phone}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> ساعت کاری:</span>
                            <span className="font-bold text-slate-700">{br.workingHours || '۸:۰۰ الی ۲۱:۰۰'}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onClose();
                            navigate('/branches');
                          }}
                          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold py-2 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>مشاهده اطلاعات کامل و نوبت‌دهی این شعبه</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CALCULATOR */}
              {activeTab === 'calculator' && (
                <div className="space-y-5">
                  <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-2xl shadow-md border border-slate-800">
                    <h4 className="font-bold text-base flex items-center gap-2 mb-2">
                      <Calculator className="w-5 h-5 text-emerald-400" />
                      <span>محاسبه‌گر هوشمند سهم بیمه و پرداختی بیمار</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      این سیستم با اعمال همزمان بیشترین پوشش از میان بیمه‌های انتخابی شما ({selectedInsurances.length} بیمه فعال)، میزان پرداختی نهایی را شبیه‌سازی می‌کند.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Service selector */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-800">انتخاب خدمت پزشکی نمونه برای محاسبه:</label>
                      <div className="space-y-2">
                        {presetServices.map(srv => (
                          <button
                            key={srv.id}
                            onClick={() => {
                              setCalcServiceType(srv.id);
                              if (srv.id !== 'custom') setCustomFeeAmount(srv.fee);
                            }}
                            className={`w-full text-right p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              calcServiceType === srv.id
                                ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{srv.label}</span>
                            <span className="text-slate-500 font-extrabold">{srv.fee.toLocaleString('fa-IR')} تومان</span>
                          </button>
                        ))}
                      </div>

                      {calcServiceType === 'custom' && (
                        <div className="pt-2">
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">مبلغ تعرفه آزاد مد نظر (تومان):</label>
                          <input
                            type="number"
                            value={customFeeAmount}
                            onChange={e => setCustomFeeAmount(Number(e.target.value))}
                            step="10000"
                            min="50000"
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Result breakdown card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                      <h5 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 flex items-center justify-between">
                        <span>خلاصه سهم‌های مالی نمایشی</span>
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                          {coverageCalculation.savingsPercentage}٪ صرفه‌جویی بیمه‌ای
                        </span>
                      </h5>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>تعرفه پایه آزاد خدمت:</span>
                          <span className="font-bold text-slate-800">{customFeeAmount.toLocaleString('fa-IR')} تومان</span>
                        </div>

                        {coverageCalculation.appliedBasicInsurance && (
                          <div className="flex items-center justify-between text-blue-800 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100">
                            <span>کسر سهم بیمه پایه ({coverageCalculation.appliedBasicInsurance}):</span>
                            <span className="font-bold font-mono">- {coverageCalculation.basicInsuranceDiscount.toLocaleString('fa-IR')} تومان</span>
                          </div>
                        )}

                        {coverageCalculation.appliedSupplementaryInsurance && (
                          <div className="flex items-center justify-between text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100">
                            <span>کسر سهم بیمه تکمیلی ({coverageCalculation.appliedSupplementaryInsurance}):</span>
                            <span className="font-bold font-mono">- {coverageCalculation.supplementaryInsuranceDiscount.toLocaleString('fa-IR')} تومان</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                          <span className="font-black text-slate-900">مبلغ پرداختی نهایی بیمار (برآورد):</span>
                          <span className="font-black text-blue-900 text-base">{coverageCalculation.patientPayable.toLocaleString('fa-IR')} تومان</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>این محاسبه صرفاً جهت راهنمایی و تخمین هزینه بیمار است و صورتحساب رسمی در زمان پذیرش با استعلام وب‌سرویس محاسبه می‌شود.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GUIDE */}
              {activeTab === 'guide' && (
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-slate-800 space-y-3">
                    <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>فرایند بدون کاغذ (Paperless) در کلیه شعب همرا کلینیک</span>
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-600">
                      با توجه به اتصال سراسری کلینیک همراه به درگاه وب‌سرویس سازمان‌های بیمه‌گر، ثبت نسخه الکترونیک و دریافت معرفی‌نامه آنلاین در چند ثانیه انجام می‌شود:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">۱</div>
                        <h6 className="font-bold text-xs text-slate-900">استعلام کدملی</h6>
                        <p className="text-[11px] text-slate-500">پزشک با وارد کردن کدملی، وضعیت بیمه پایه و تکمیلی را بررسی می‌کند.</p>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">۲</div>
                        <h6 className="font-bold text-xs text-slate-900">ثبت نسخه آنلاین</h6>
                        <p className="text-[11px] text-slate-500">داروها، آزمایش‌ها و تصویربرداری در سامانه یکپارچه ثبت و کدرهگیری پیامک می‌شود.</p>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">۳</div>
                        <h6 className="font-bold text-xs text-slate-900">دریافت با تخفیف بیمه</h6>
                        <p className="text-[11px] text-slate-500">در داروخانه یا آزمایشگاه طرف قرارداد، سهم بیمه بدون نیاز به برگه فیزیکی کسر می‌گردد.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">
                  {matchedDoctors.length} پزشک و {matchedBranches.length} شعبه با بیمه‌های انتخابی شما سازگار هستند.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  بستن
                </button>

                <button
                  onClick={() => {
                    onClose();
                    const insuranceFilterParam = selectedInsurances.join(',');
                    navigate(insuranceFilterParam ? `/doctors?insurance=${encodeURIComponent(insuranceFilterParam)}` : '/doctors');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>مشاهده پزشکان در صفحه اصلی جستجو</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </ModalPortal>

      {/* Appointment Wizard Integration for Direct Booking */}
      {bookingDoctor && (
        <ModalPortal isOpen={!!bookingDoctor} onClose={() => setBookingDoctor(null)} zIndexClass={MODAL_Z_INDEX.NESTED_MODAL}>
          <div className="fixed inset-0 min-h-[100dvh] w-screen flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-2rem)] flex flex-col">
              <AppointmentWizard
                doctor={bookingDoctor}
                onComplete={() => {
                  setBookingDoctor(null);
                  onClose();
                }}
                onCancel={() => setBookingDoctor(null)}
              />
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
};
