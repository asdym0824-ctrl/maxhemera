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
  FileText, 
  Info,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  Percent,
  Wallet,
  Phone,
  Clock,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Doctor, ClinicBranch, Specialty, InsuranceCompany } from '../../types';
import { apiService } from '../../services/apiService';
import { MOCK_INSURANCES } from '../../data/mockData';
import { ModalPortal } from '../common/ModalPortal';
import { MODAL_Z_INDEX } from '../../utils/modalManager';
import {
  calculateDemoCoverage,
  matchesDoctorInsuranceSelection,
  matchesBranchInsuranceSelection,
  supportsInsurance,
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

  // Selected State
  const [selectedBasicInsurance, setSelectedBasicInsurance] = useState<string>('تأمین اجتماعی');
  const [selectedSuppInsurance, setSelectedSuppInsurance] = useState<string>('بیمه ایران');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');
  const [searchDoctorQuery, setSearchDoctorQuery] = useState<string>('');

  // Active Result Tab
  const [activeTab, setActiveTab] = useState<'doctors' | 'branches' | 'calculator' | 'guide'>('doctors');

  // Booking Wizard Modal State
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  // Calculator custom fee state
  const [calcServiceType, setCalcServiceType] = useState<string>('visit_specialist');
  const [customFeeAmount, setCustomFeeAmount] = useState<number>(350000);

  useEffect(() => {
    if (initialInsuranceName) {
      const found = MOCK_INSURANCES.find(i => i.name.toLowerCase().includes(initialInsuranceName.toLowerCase()));
      if (found) {
        if (found.type === 'basic') {
          setSelectedBasicInsurance(found.name);
        } else {
          setSelectedSuppInsurance(found.name);
        }
      }
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

  // Filtered Doctors based on selected insurances & specialty
  const matchedDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchesInsurance = matchesDoctorInsuranceSelection(
        doc,
        selectedBasicInsurance === 'بدون بیمه پایه' ? undefined : selectedBasicInsurance,
        selectedSuppInsurance === 'فاقد بیمه تکمیلی' ? undefined : selectedSuppInsurance
      );

      const matchesSpecialty = selectedSpecialtyId ? doc.specialtyId === selectedSpecialtyId : true;

      const matchesSearch = searchDoctorQuery.trim() === '' || 
        doc.name.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
        doc.specialtyName.toLowerCase().includes(searchDoctorQuery.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchDoctorQuery.toLowerCase());

      return matchesInsurance && matchesSpecialty && matchesSearch;
    });
  }, [doctors, selectedBasicInsurance, selectedSuppInsurance, selectedSpecialtyId, searchDoctorQuery]);

  // Filtered Branches based on selected insurances
  const matchedBranches = useMemo(() => {
    return branches.filter(branch => {
      return matchesBranchInsuranceSelection(
        branch,
        selectedBasicInsurance === 'بدون بیمه پایه' ? undefined : selectedBasicInsurance,
        selectedSuppInsurance === 'فاقد بیمه تکمیلی' ? undefined : selectedSuppInsurance
      );
    });
  }, [branches, selectedBasicInsurance, selectedSuppInsurance]);

  // Calculation for current selected sample fee
  const coverageCalculation = useMemo(() => {
    return calculateDemoCoverage(
      customFeeAmount,
      selectedBasicInsurance === 'بدون بیمه پایه' ? undefined : selectedBasicInsurance,
      selectedSuppInsurance === 'فاقد بیمه تکمیلی' ? undefined : selectedSuppInsurance
    );
  }, [customFeeAmount, selectedBasicInsurance, selectedSuppInsurance]);

  const presetServices = [
    ...PRESET_DEMO_SERVICES,
    { id: 'custom', label: 'مبلغ دلخواه شما', fee: customFeeAmount }
  ];

  if (!isOpen) return null;

  return (
    <>
      <ModalPortal isOpen={isOpen} onClose={onClose} zIndexClass={MODAL_Z_INDEX.BASE_MODAL}>
        <div 
          className="fixed inset-0 min-h-[100dvh] w-screen flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200" 
          dir="rtl"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="insurance-finder-modal-title"
        >
          <div 
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] text-slate-800 my-auto"
            onClick={e => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
              <button
                onClick={onClose}
                aria-label="بستن پنجره"
                className="absolute left-5 top-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-blue-400/20 text-blue-300 px-2.5 py-0.5 rounded-full">
                      راهنمای پوشش بیمه‌ها
                    </span>
                    <h3 id="insurance-finder-modal-title" className="text-lg sm:text-xl font-black">پزشکان طرف قرارداد و برآورد نمایشی بیمه</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    بیمه پایه و تکمیلی خود را مشخص فرمایید تا پزشکان و شعب سازگار به همراه محاسبه نمایشی فرانشیز نمایش داده شوند
                  </p>
                </div>
              </div>

              {/* Demo Helper Banner */}
              <div className="mt-3.5 bg-amber-500/20 border border-amber-400/30 rounded-xl p-2.5 px-3 flex items-center gap-2 text-[11px] text-amber-200">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{DEMO_DISCLAIMER_TEXT}</span>
              </div>
            </div>

            {/* Insurance Selector Bar */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Basic Insurance */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>۱. بیمه پایه درمانی:</span>
                    <span className="text-[11px] font-semibold text-blue-600">
                      {selectedBasicInsurance || 'انتخاب نشده'}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {basicInsurances.map(ins => (
                      <button
                        key={ins.id}
                        onClick={() => setSelectedBasicInsurance(ins.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedBasicInsurance === ins.name
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {selectedBasicInsurance === ins.name && <Check className="w-3.5 h-3.5" />}
                        <span>{ins.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedBasicInsurance('بدون بیمه پایه')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedBasicInsurance === 'بدون بیمه پایه'
                          ? 'bg-slate-800 text-white'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      آزاد (فاقد بیمه پایه)
                    </button>
                  </div>
                </div>

                {/* Supplementary Insurance */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>۲. بیمه تکمیلی (اختیاری):</span>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      {selectedSuppInsurance || 'انتخاب نشده'}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {suppInsurances.slice(0, 6).map(ins => (
                      <button
                        key={ins.id}
                        onClick={() => setSelectedSuppInsurance(ins.name)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          selectedSuppInsurance === ins.name
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {selectedSuppInsurance === ins.name && <Check className="w-3 h-3" />}
                        <span>{ins.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedSuppInsurance('فاقد بیمه تکمیلی')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSuppInsurance === 'فاقد بیمه تکمیلی'
                          ? 'bg-slate-800 text-white'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      فاقد بیمه تکمیلی
                    </button>
                  </div>
                </div>

              </div>

              {/* Quick Summary Strip */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">پوشش انتخابی شما:</span>
                  <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {selectedBasicInsurance} + {selectedSuppInsurance}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold border border-emerald-200">
                    تخمین پوشش سهم بیمه: تا {coverageCalculation.savingsPercentage}٪
                  </span>
                  <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg font-bold border border-blue-200">
                    {matchedDoctors.length} پزشک سازگار
                  </span>
                  <span className="text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg font-bold border border-purple-200">
                    {matchedBranches.length} شعبه سازگار
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6 gap-2 shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('doctors')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'doctors'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>پزشکان تحت پوشش ({matchedDoctors.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'calculator'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>برآورد نمایشی هزینه و سهم بیمه</span>
              </button>

              <button
                onClick={() => setActiveTab('branches')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'branches'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>شعب سازگار با بیمه ({matchedBranches.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'guide'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>راهنمای فرایند بیمه الکترونیک</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
              
              {/* TAB 1: DOCTORS LIST */}
              {activeTab === 'doctors' && (
                <div className="space-y-4">
                  
                  {/* Search & Specialty Filter */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchDoctorQuery}
                        onChange={e => setSearchDoctorQuery(e.target.value)}
                        placeholder="جستجوی نام پزشک یا تخصص در میان پزشکان این بیمه..."
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>

                    <select
                      value={selectedSpecialtyId}
                      onChange={e => setSelectedSpecialtyId(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">همه تخصص‌ها</option>
                      {specialties.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor Cards */}
                  {matchedDoctors.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="font-bold text-slate-700 text-sm">پزشکی با فیلترهای انتخابی یافت نشد</h4>
                      <p className="text-xs text-slate-500">می‌توانید تخصص انتخابی را تغییر داده یا از بخش آزاد نوبت دریافت فرمایید.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {matchedDoctors.map(doc => {
                        const doctorFeeEstimate = calculateDemoCoverage(
                          doc.consultationFee,
                          selectedBasicInsurance === 'بدون بیمه پایه' ? undefined : selectedBasicInsurance,
                          selectedSuppInsurance === 'فاقد بیمه تکمیلی' ? undefined : selectedSuppInsurance
                        );

                        return (
                          <div 
                            key={doc.id}
                            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <img 
                                  src={doc.avatar} 
                                  alt={doc.name} 
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" 
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-slate-900 text-sm truncate">{doc.name}</h5>
                                  <p className="text-xs text-slate-500 truncate">{doc.title} - {doc.specialtyName}</p>
                                  <span className="inline-block mt-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                    شعبه: {doc.clinicName || 'شعبه مرکزی سعادت‌آباد'}
                                  </span>
                                </div>
                              </div>

                              {/* Insurance tags accepted by doctor */}
                              <div className="flex flex-wrap gap-1">
                                {doc.supportedInsurances.map((insName, idx) => {
                                  const isMatched = 
                                    (selectedBasicInsurance !== 'بدون بیمه پایه' && supportsInsurance([insName], selectedBasicInsurance)) ||
                                    (selectedSuppInsurance !== 'فاقد بیمه تکمیلی' && supportsInsurance([insName], selectedSuppInsurance));

                                  return (
                                    <span 
                                      key={idx}
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        isMatched 
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {isMatched && '✓ '}
                                      {insName}
                                    </span>
                                  );
                                })}
                              </div>

                              {/* Fee estimation box */}
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                                <div className="flex items-center justify-between text-slate-400">
                                  <span>تعرفه مصوب آزاد:</span>
                                  <span className="line-through">{doc.consultationFee.toLocaleString('fa-IR')} ت</span>
                                </div>
                                <div className="flex items-center justify-between text-emerald-800 font-bold">
                                  <span>برآورد پرداختی با بیمه:</span>
                                  <span className="font-black font-mono text-sm">{doctorFeeEstimate.patientPayable.toLocaleString('fa-IR')} ت</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                onClick={() => {
                                  onClose();
                                  navigate(`/doctors/${doc.slug || doc.id}`);
                                }}
                                className="text-xs font-bold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>مشاهده پزشک</span>
                              </button>

                              <button
                                onClick={() => setBookingDoctor(doc)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>دریافت نوبت</span>
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

              {/* TAB 2: CALCULATOR */}
              {activeTab === 'calculator' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-2xl shadow-md border border-slate-800">
                    <h4 className="font-bold text-base flex items-center gap-2 mb-2">
                      <Calculator className="w-5 h-5 text-blue-400" />
                      <span>برآورد نمایشی هزینه و سهم بیمه</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      این محاسبه بر اساس داده‌های نمایشی انجام می‌شود و مبلغ واقعی ممکن است با توجه به قرارداد، تعرفه و شرایط بیمه متفاوت باشد.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Service selector */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-800">انتخاب خدمت پزشکی نمونه:</label>
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
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <h5 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2 flex items-center justify-between">
                        <span>خلاصه سهم‌های مالی نمایشی</span>
                        <span className="text-xs font-normal text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                          {coverageCalculation.savingsPercentage}٪ صرفه‌جویی بیمه‌ای
                        </span>
                      </h5>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>هزینه پایه آزاد خدمت:</span>
                          <span className="font-bold text-slate-800">{customFeeAmount.toLocaleString('fa-IR')} تومان</span>
                        </div>

                        <div className="flex items-center justify-between text-blue-700 bg-blue-50/80 p-2 rounded-lg">
                          <span>کسر سهم بیمه پایه ({selectedBasicInsurance}):</span>
                          <span className="font-bold">- {coverageCalculation.basicInsuranceDiscount.toLocaleString('fa-IR')} تومان</span>
                        </div>

                        <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/80 p-2 rounded-lg">
                          <span>کسر سهم بیمه تکمیلی ({selectedSuppInsurance}):</span>
                          <span className="font-bold">- {coverageCalculation.supplementaryInsuranceDiscount.toLocaleString('fa-IR')} تومان</span>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                          <span className="font-black text-slate-900">مبلغ پرداختی نهایی بیمار (برآورد):</span>
                          <span className="font-black text-blue-900 text-base">{coverageCalculation.patientPayable.toLocaleString('fa-IR')} تومان</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>این محاسبه صرفاً جهت راهنمایی و تخمین هزینه بیمار است و صورتحساب رسمی در زمان پذیرش با استعلام وب‌سرویس محاسبه می‌شود.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BRANCHES */}
              {activeTab === 'branches' && (
                <div className="space-y-4">
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-blue-900 flex items-center justify-between">
                    <span>نمایش شعب دارای باجه فعال پذیرش بیمه {selectedBasicInsurance} و {selectedSuppInsurance}</span>
                    <span className="font-bold bg-white px-2.5 py-1 rounded-lg border border-blue-200">{matchedBranches.length} شعبه فعال</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchedBranches.map(br => (
                      <div key={br.id} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900 text-sm">{br.name}</h5>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            پذیرش آنلاین بیمه
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{br.address}</span>
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {(br.supportedInsurances || []).slice(0, 5).map((ins, idx) => {
                            const isMatch = (selectedBasicInsurance !== 'بدون بیمه پایه' && supportsInsurance([ins], selectedBasicInsurance)) ||
                              (selectedSuppInsurance !== 'فاقد بیمه تکمیلی' && supportsInsurance([ins], selectedSuppInsurance));

                            return (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                  isMatch ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'bg-slate-100 text-slate-600'
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
                          <span>مشاهده نقشه و جزئیات شعبه</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: GUIDE */}
              {activeTab === 'guide' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 text-blue-950 space-y-3">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>فرایند بدون کاغذ (Paperless) در همرا کلینیک</span>
                    </h4>
                    <p className="text-xs leading-relaxed">
                      با توجه به اتصال سراسری کلینیک همراه به درگاه وب‌سرویس سازمان‌های بیمه‌گر، ثبت نسخه الکترونیک و دریافت معرفی‌نامه آنلاین در چند ثانیه انجام می‌شود:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">۱</div>
                        <h6 className="font-bold text-xs text-slate-900">استعلام کدملی</h6>
                        <p className="text-[11px] text-slate-500">پزشک با وارد کردن کدملی، وضعیت بیمه پایه و تکمیلی را بررسی می‌کند.</p>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">۲</div>
                        <h6 className="font-bold text-xs text-slate-900">ثبت نسخه آنلاین</h6>
                        <p className="text-[11px] text-slate-500">داروها، آزمایش‌ها و تصویربرداری در سامانه یکپارچه ثبت و کدرهگیری پیامک می‌شود.</p>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">۳</div>
                        <h6 className="font-bold text-xs text-slate-900">کسر مستقیم فرانشیز</h6>
                        <p className="text-[11px] text-slate-500">سهم بیمه در فاکتور نهایی کسر شده و بیمار صرفاً مابه‌التفاوت را می‌پردازد.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>طرف قرارداد با تمامی شرکت‌های بیمه اصلی</span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        بیمه ایران، آسیا، البرز، دانا، آتیه‌سازان حافظ، کارآفرین، معلم، سامان، سرمد، ما، سینا، نوین و بانک‌ها.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>دریافت فاکتور رسمی و گواهی پزشک</span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        برای سایر بیمه‌های تکمیلی، فاکتور ممهور به مهر نظام پزشکی و کد شناسه ملی کلینیک جهت ارائه به نماینده بیمه تقدیم می‌گردد.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>پوشش خدمات پاراکلینیک و جراحی سرپایی</span>
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        اکوکاردیوگرافی، تست ورزش، نوار مغز، آندوسکوپی، کولونوسکوپی و فیزیوتراپی مشمول کسر فرانشیز و تعرفه مصوب می‌باشند.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between shrink-0">
              <button
                onClick={onClose}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                بستن پنجره
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/insurance?basic=${encodeURIComponent(selectedBasicInsurance)}&supp=${encodeURIComponent(selectedSuppInsurance)}`);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>صفحه کامل راهنمای بیمه</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    const insuranceFilterParam = selectedBasicInsurance !== 'بدون بیمه پایه' ? selectedBasicInsurance : (selectedSuppInsurance !== 'فاقد بیمه تکمیلی' ? selectedSuppInsurance : '');
                    navigate(insuranceFilterParam ? `/doctors?insurance=${encodeURIComponent(insuranceFilterParam)}` : '/doctors');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>مشاهده پزشکان در لیست جستجو</span>
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
