import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Building2, 
  Stethoscope, 
  Calculator, 
  Sparkles, 
  FileText, 
  Info,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  Percent,
  MapPin,
  Clock,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { Doctor, ClinicBranch, Specialty, InsuranceCompany } from '../types';
import { apiService } from '../services/apiService';
import { MOCK_INSURANCES } from '../data/mockData';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ModalPortal } from '../components/common/ModalPortal';
import { MODAL_Z_INDEX } from '../utils/modalManager';
import { AppointmentWizard } from '../components/appointments/AppointmentWizard';
import {
  calculateDemoCoverage,
  matchesDoctorInsuranceSelection,
  matchesBranchInsuranceSelection,
  supportsInsurance,
  PRESET_DEMO_SERVICES,
  DEMO_DISCLAIMER_TEXT
} from '../services/insuranceCoverageEngine';

export const InsuranceCoveragePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [insurances, setInsurances] = useState<InsuranceCompany[]>(MOCK_INSURANCES);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<ClinicBranch[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  // Selected State initialized from URL params if available
  const urlBasic = searchParams.get('basic');
  const urlSupp = searchParams.get('supp');

  const [selectedBasicInsurance, setSelectedBasicInsurance] = useState<string>(urlBasic || 'تأمین اجتماعی');
  const [selectedSuppInsurance, setSelectedSuppInsurance] = useState<string>(urlSupp || 'بیمه ایران');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Service for calculator
  const [selectedPresetService, setSelectedPresetService] = useState<string>('visit_specialist');
  const [customFee, setCustomFee] = useState<number>(350000);

  // Booking Wizard Modal State
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    apiService.getDoctors().then(setDoctors);
    apiService.getBranches().then(setBranches);
    apiService.getSpecialties().then(setSpecialties);
    apiService.getInsurances().then(setInsurances);
  }, []);

  // Update URL params when selection changes to keep shareable URLs
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBasicInsurance) params.set('basic', selectedBasicInsurance);
    if (selectedSuppInsurance) params.set('supp', selectedSuppInsurance);
    setSearchParams(params, { replace: true });
  }, [selectedBasicInsurance, selectedSuppInsurance, setSearchParams]);

  const basicInsurances = useMemo(() => insurances.filter(i => i.type === 'basic'), [insurances]);
  const suppInsurances = useMemo(() => insurances.filter(i => i.type === 'supplementary' || i.type === 'specialized'), [insurances]);

  // Filtered Doctors using insurance coverage engine
  const matchedDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchesInsurance = matchesDoctorInsuranceSelection(
        doc,
        selectedBasicInsurance === 'بدون بیمه پایه' ? undefined : selectedBasicInsurance,
        selectedSuppInsurance === 'فاقد بیمه تکمیلی' ? undefined : selectedSuppInsurance
      );

      const matchesSpecialty = selectedSpecialtyId ? doc.specialtyId === selectedSpecialtyId : true;
      const matchesSearch = searchQuery.trim() === '' || 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialtyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesInsurance && matchesSpecialty && matchesSearch;
    });
  }, [doctors, selectedBasicInsurance, selectedSuppInsurance, selectedSpecialtyId, searchQuery]);

  // Filtered Branches using insurance coverage engine
  const matchedBranches = useMemo(() => {
    return branches.filter(branch => {
      return matchesBranchInsuranceSelection(
        branch,
        selectedBasicInsurance === 'بدون بیمه پایه' ? undefined : selectedBasicInsurance,
        selectedSuppInsurance === 'فاقد بیمه تکمیلی' ? undefined : selectedSuppInsurance
      );
    });
  }, [branches, selectedBasicInsurance, selectedSuppInsurance]);

  const coverageResult = useMemo(() => {
    return calculateDemoCoverage(
      customFee,
      selectedBasicInsurance === 'بدون بیمه پایه' ? undefined : selectedBasicInsurance,
      selectedSuppInsurance === 'فاقد بیمه تکمیلی' ? undefined : selectedSuppInsurance
    );
  }, [customFee, selectedBasicInsurance, selectedSuppInsurance]);

  const presetServices = [
    ...PRESET_DEMO_SERVICES,
    { id: 'custom', label: 'مبلغ دلخواه شما', fee: customFee }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 space-y-10" dir="rtl">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-12 sm:py-16 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 border border-blue-400/30 px-3.5 py-1 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>راهنمای جامع پوشش بیمه‌ها و فرایند پذیرش آنلاین</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            استعلام بیمه: پزشکان طرف قرارداد، شعب سازگار و برآورد نمایشی سهم بیمه
          </h1>

          <p className="text-xs sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            بیمه پایه و تکمیلی خود را در بخش زیر انتخاب فرمایید تا پزشکان همکار، شعب پذیرنده و محاسبه تخمینی فرانشیز به تفکیک به شما نمایش داده شوند.
          </p>

          {/* Mandatory Demo Helper Banner */}
          <div className="bg-amber-500/20 border border-amber-400/40 text-amber-200 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 mt-4">
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{DEMO_DISCLAIMER_TEXT}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Insurance Selection Controls Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>انتخاب پوشش‌های بیمه‌ای فعال شما</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              تعرفه ویزیت و برآورد فرانشیز با تغییر این گزینه‌ها به صورت آنی در تمام بخش‌ها به‌روزرسانی می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basic Insurance */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>۱. نوع بیمه پایه شما:</span>
              </label>
              <select
                value={selectedBasicInsurance}
                onChange={e => setSelectedBasicInsurance(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs sm:text-sm font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="بدون بیمه پایه">بدون بیمه پایه (آزاد)</option>
                {basicInsurances.map(ins => (
                  <option key={ins.id} value={ins.name}>
                    {ins.name} ({ins.coverageCoPayPercent}٪ پوشش پایه)
                  </option>
                ))}
              </select>
            </div>

            {/* Supplementary Insurance */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>۲. بیمه تکمیلی / سازمانی شما:</span>
              </label>
              <select
                value={selectedSuppInsurance}
                onChange={e => setSelectedSuppInsurance(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs sm:text-sm font-bold text-slate-800 outline-hidden focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="فاقد بیمه تکمیلی">فاقد بیمه تکمیلی (فقط بیمه پایه)</option>
                {suppInsurances.map(ins => (
                  <option key={ins.id} value={ins.name}>
                    {ins.name} ({ins.coverageCoPayPercent}٪ جبران هزینه آنلاین)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Status Card */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-blue-700 shrink-0" />
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-blue-950">
                  وضعیت پوشش انتخابی: {selectedBasicInsurance} + {selectedSuppInsurance}
                </div>
                <div className="text-xs text-blue-800 mt-0.5">
                  پذیرش الکترونیک بدون نیاز به معرفی‌نامه کاغذی در باجه‌های اختصاصی شعب همرا کلینیک
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="bg-white text-blue-900 border border-blue-300 px-3 py-1.5 rounded-xl shadow-2xs">
                {matchedDoctors.length} پزشک سازگار
              </span>
              <span className="bg-white text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl shadow-2xs">
                {matchedBranches.length} شعبه فعال
              </span>
            </div>
          </div>
        </div>

        {/* Live Tariff Calculator */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-blue-400">برآورد نمایشی هزینه و سهم بیمه</span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                محاسبه هزینه نهایی خدمت با کسر سهم بیمه‌های انتخابی شما
              </h3>
            </div>
            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto">
              <Percent className="w-4 h-4" />
              <span>{coverageResult.savingsPercentage}٪ صرفه‌جویی بیمه‌ای</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {presetServices.map(srv => (
              <button
                key={srv.id}
                onClick={() => {
                  setSelectedPresetService(srv.id);
                  if (srv.id !== 'custom') setCustomFee(srv.fee);
                }}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer text-xs ${
                  selectedPresetService === srv.id
                    ? 'bg-blue-600 text-slate-950 font-black border-blue-400 shadow-md'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="truncate">{srv.label}</div>
                {srv.id !== 'custom' && (
                  <div className="text-[11px] mt-1 opacity-80">
                    {srv.fee.toLocaleString('fa-IR')} تومان
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">تعرفه آزاد خدمت:</span>
              <div className="text-lg font-bold font-mono text-white">
                {coverageResult.baseFee.toLocaleString('fa-IR')} تومان
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">سهم بیمه پایه ({selectedBasicInsurance}):</span>
              <div className="text-lg font-bold font-mono text-blue-300">
                - {coverageResult.basicInsuranceDiscount.toLocaleString('fa-IR')} تومان
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">سهم بیمه تکمیلی ({selectedSuppInsurance}):</span>
              <div className="text-lg font-bold font-mono text-sky-300">
                - {coverageResult.supplementaryInsuranceDiscount.toLocaleString('fa-IR')} تومان
              </div>
            </div>

            <div className="bg-blue-600/20 p-4 rounded-2xl border border-blue-400/40 space-y-1">
              <span className="text-blue-200 font-bold">مبلغ نهایی پرداختی بیمار (برآورد):</span>
              <div className="text-xl font-black font-mono text-emerald-400">
                {coverageResult.patientPayable.toLocaleString('fa-IR')} تومان
              </div>
            </div>
          </div>
        </section>

        {/* Doctors Grid Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Badge variant="blue">پزشکان تحت پوشش</Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                پزشکان متخصص و فوق‌تخصص پذیرنده {selectedBasicInsurance} و {selectedSuppInsurance}
              </h2>
            </div>

            {/* Quick search input */}
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="جستجوی نام یا تخصص پزشک..."
                  className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <select
                value={selectedSpecialtyId}
                onChange={e => setSelectedSpecialtyId(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-hidden"
              >
                <option value="">همه تخصص‌ها</option>
                {specialties.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedDoctors.map(doctor => {
              const fee = calculateDemoCoverage(
                doctor.consultationFee,
                selectedBasicInsurance === 'بدون بیمه پایه' ? undefined : selectedBasicInsurance,
                selectedSuppInsurance === 'فاقد بیمه تکمیلی' ? undefined : selectedSuppInsurance
              );

              return (
                <div
                  key={doctor.id}
                  className="bg-white border border-slate-200/80 rounded-3xl p-5 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">{doctor.name}</h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{doctor.title}</p>
                        <span className="inline-block text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md mt-1.5">
                          {doctor.specialtyName}
                        </span>
                      </div>
                    </div>

                    {/* Insurances list */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {doctor.supportedInsurances && doctor.supportedInsurances.length > 0 ? (
                        doctor.supportedInsurances.map((ins, idx) => {
                          const isMatch = 
                            (selectedBasicInsurance !== 'بدون بیمه پایه' && supportsInsurance([ins], selectedBasicInsurance)) ||
                            (selectedSuppInsurance !== 'فاقد بیمه تکمیلی' && supportsInsurance([ins], selectedSuppInsurance));

                          return (
                            <span
                              key={idx}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                isMatch
                                  ? 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {isMatch && '✓ '}
                              {ins}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          اطلاعات بیمه برای این پزشک/مرکز ثبت نشده است.
                        </span>
                      )}
                    </div>

                    {/* Fee Calculation card */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>تعرفه آزاد ویزیت:</span>
                        <span className="line-through">{doctor.consultationFee.toLocaleString('fa-IR')} تومان</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-emerald-800 text-sm">
                        <span>برآورد پرداختی با بیمه (نمایشی):</span>
                        <span className="font-black font-mono">{fee.patientPayable.toLocaleString('fa-IR')} تومان</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 cursor-pointer"
                      onClick={() => setBookingDoctor(doctor)}
                      icon={<Calendar className="w-3.5 h-3.5" />}
                    >
                      دریافت نوبت با این بیمه
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => navigate(`/doctors/${doctor.slug || doctor.id}`)}
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      مشاهده پزشک
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Accepted Branches Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="blue">شعب سازگار با بیمه</Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                شعب دارای باجه فعال پذیرش {selectedBasicInsurance} و {selectedSuppInsurance}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/branches')}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              مشاهده همه شعب بر روی نقشه
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedBranches.map(branch => (
              <div
                key={branch.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{branch.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{branch.district}</p>
                  </div>
                  {branch.isMain && (
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      شعبه اصلی
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  📍 {branch.address}
                </p>

                {/* Branch supported insurances */}
                <div className="flex flex-wrap gap-1">
                  {(branch.supportedInsurances || []).map((ins, idx) => {
                    const isMatch = 
                      (selectedBasicInsurance !== 'بدون بیمه پایه' && supportsInsurance([ins], selectedBasicInsurance)) ||
                      (selectedSuppInsurance !== 'فاقد بیمه تکمیلی' && supportsInsurance([ins], selectedSuppInsurance));

                    return (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          isMatch ? 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-300' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isMatch && '✓ '}
                        {ins}
                      </span>
                    );
                  })}
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-600" /> ساعات پذیرش بیمه:</span>
                    <span className="font-bold text-slate-800">{branch.workingHours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-blue-600" /> تلفن باجه بیمه:</span>
                    <span className="font-bold text-slate-800 font-mono" dir="ltr">{branch.phone}</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full cursor-pointer"
                  onClick={() => navigate('/branches')}
                  icon={<Building2 className="w-3.5 h-3.5" />}
                >
                  اطلاعات و ساعات حضور پزشکان این شعبه
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Paperless & Electronic Process Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-blue-700 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>فرایند بدون کاغذ (Paperless)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              راهنمای فرایند پذیرش و صدور معرفی‌نامه الکترونیک در همرا کلینیک
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              تمامی شعب همرا کلینیک به درگاه استعلام آنلاین سازمان‌های بیمه‌گر متصل می‌باشند. کافی است هنگام مراجعه کدملی بیمار را به باجه پذیرش ارائه فرمایید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">۱</div>
              <h3 className="font-bold text-sm text-slate-900">استعلام برخط کدملی</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                استعلام همزمان اعتبار دفترچه بیمه پایه و سقف تعهدات بیمه تکمیلی در لحظه ورود به کلینیک.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">۲</div>
              <h3 className="font-bold text-sm text-slate-900">ثبت الکترونیک خدمات</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                تجویز داروها، آزمایشگاه و تصویربرداری در سیستم یکپارچه با ارسال پیامک کد رهگیری نسخه.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">۳</div>
              <h3 className="font-bold text-sm text-slate-900">کسر مستقیم فرانشیز</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                پرداخت صرفاً مابه‌التفاوت سهم بیمار بدون نیاز به پرینت فاکتور یا مراجعه حضوری به شعب بیمه.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Appointment Wizard Integration for Direct Booking */}
      {bookingDoctor && (
        <ModalPortal isOpen={!!bookingDoctor} onClose={() => setBookingDoctor(null)} zIndexClass={MODAL_Z_INDEX.BASE_MODAL}>
          <div className="fixed inset-0 min-h-[100dvh] w-screen flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-2rem)] flex flex-col">
              <AppointmentWizard
                doctor={bookingDoctor}
                onComplete={() => {
                  setBookingDoctor(null);
                }}
                onCancel={() => setBookingDoctor(null)}
              />
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};
