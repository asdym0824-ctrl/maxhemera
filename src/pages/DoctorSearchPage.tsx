import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Doctor, Specialty } from '../types';
import { apiService } from '../services/apiService';
import { setSeoMetaData } from '../utils/seoUtils';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { DoctorCompactCard } from '../components/doctors/DoctorCompactCard';
import { DoctorFilterSidebar } from '../components/doctors/DoctorFilterSidebar';
import { MobileSpecialtiesModal } from '../components/specialties/MobileSpecialtiesModal';
import { 
  Search, 
  SlidersHorizontal, 
  UserX, 
  LayoutGrid, 
  List, 
  Sparkles, 
  ChevronDown, 
  CheckCircle2, 
  X,
  Stethoscope
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { MedicalLoadingIndicator } from '../components/common/MedicalLoadingIndicator';
import { MedicalVectorPattern } from '../components/common/medicalPattern/MedicalVectorPattern';

interface DoctorSearchPageProps {
  initialSearchQuery?: string;
  initialSpecialtyId?: string;
  onSelectDoctor?: (slug: string) => void;
}

export const DoctorSearchPage: React.FC<DoctorSearchPageProps> = ({
  initialSearchQuery = '',
  initialSpecialtyId = '',
  onSelectDoctor
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParamSearch = searchParams.get('search') || initialSearchQuery;
  const queryParamSpecialty = searchParams.get('specialtyId') || initialSpecialtyId;
  const queryParamInsurance = searchParams.get('insurance') || '';
  const queryParamBranch = searchParams.get('branchId') || '';
  const queryParamHasOnline = searchParams.get('hasOnline') === 'true';
  const queryParamGender = (searchParams.get('gender') as 'all' | 'male' | 'female') || 'all';
  const queryParamSortBy = (searchParams.get('sortBy') as 'recommended' | 'rating' | 'experience') || 'recommended';
  const queryParamTiming = (searchParams.get('timing') as 'all' | 'today' | 'tomorrow' | '3days' | 'evening') || 'all';
  const queryParamSeniority = (searchParams.get('seniority') as 'all' | 'fellowship' | 'specialist' | 'experience10') || 'all';

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(queryParamSearch);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(queryParamSpecialty);
  const [hasOnlineConsultation, setHasOnlineConsultation] = useState(queryParamHasOnline);
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>(queryParamGender);
  const [selectedInsurance, setSelectedInsurance] = useState(queryParamInsurance);
  const [selectedBranchId, setSelectedBranchId] = useState(queryParamBranch);
  const [selectedTiming, setSelectedTiming] = useState(queryParamTiming);
  const [selectedSeniority, setSelectedSeniority] = useState(queryParamSeniority);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'experience'>(queryParamSortBy);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [isSpecialtiesModalOpen, setIsSpecialtiesModalOpen] = useState(false);
  const [doctorViewMode, setDoctorViewMode] = useState<'grid' | 'compact'>('grid');
  const [visibleDoctorsCount, setVisibleDoctorsCount] = useState(6);

  const displayedDoctors = useMemo(() => {
    return doctors.slice(0, visibleDoctorsCount);
  }, [doctors, visibleDoctorsCount]);

  useEffect(() => {
    setVisibleDoctorsCount(6);
  }, [
    selectedSpecialtyId,
    searchQuery,
    hasOnlineConsultation,
    selectedGender,
    selectedInsurance,
    selectedBranchId,
    selectedTiming,
    selectedSeniority,
    sortBy
  ]);

  useEffect(() => {
    setSeoMetaData(
      'جستجو و رزرو آنلاین نوبت پزشکان متخصص | همرا کلینیک',
      'جستجوی پزشکان متخصص و فوق‌تخصص بر اساس تخصص، بیمه، مشاوره آنلاین تصویری و اولین نوبت آزاد در همرا کلینیک.'
    );
  }, []);

  useEffect(() => {
    if (queryParamSearch) setSearchQuery(queryParamSearch);
    if (queryParamSpecialty) setSelectedSpecialtyId(queryParamSpecialty);
    if (queryParamInsurance) setSelectedInsurance(queryParamInsurance);
    if (queryParamBranch) setSelectedBranchId(queryParamBranch);
    if (queryParamHasOnline) setHasOnlineConsultation(true);
    if (queryParamGender) setSelectedGender(queryParamGender);
    if (queryParamSortBy) setSortBy(queryParamSortBy);
    if (queryParamTiming) setSelectedTiming(queryParamTiming);
    if (queryParamSeniority) setSelectedSeniority(queryParamSeniority);
  }, [
    queryParamSearch,
    queryParamSpecialty,
    queryParamInsurance,
    queryParamBranch,
    queryParamHasOnline,
    queryParamGender,
    queryParamSortBy,
    queryParamTiming,
    queryParamSeniority
  ]);

  useEffect(() => {
    apiService.getSpecialties().then(setSpecialties);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    apiService
      .getDoctors({
        specialtyId: selectedSpecialtyId || undefined,
        searchQuery: searchQuery || undefined,
        hasOnlineConsultation: hasOnlineConsultation || undefined,
        gender: selectedGender === 'all' ? undefined : selectedGender,
        insurance: selectedInsurance || undefined,
        branchId: selectedBranchId || undefined,
        timing: selectedTiming,
        seniority: selectedSeniority,
        sortBy: sortBy === 'recommended' ? undefined : sortBy
      })
      .then(res => {
        setDoctors(res);
        setIsLoading(false);
      });
  }, [
    selectedSpecialtyId,
    searchQuery,
    hasOnlineConsultation,
    selectedGender,
    selectedInsurance,
    selectedBranchId,
    selectedTiming,
    selectedSeniority,
    sortBy
  ]);

  const handleSelectDoctor = (slug: string) => {
    if (onSelectDoctor) {
      onSelectDoctor(slug);
    }
    navigate(`/doctors/${slug}`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialtyId('');
    setHasOnlineConsultation(false);
    setSelectedGender('all');
    setSelectedInsurance('');
    setSortBy('recommended');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search Header */}
      <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <MedicalVectorPattern opacity={0.05} variant="light" patternId="doctor-search-med-pattern" />
        <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold text-white">جستجو و رزرو آنلاین نوبت پزشکان</h1>
        <p className="relative z-10 text-xs sm:text-sm text-slate-300">
          جستجو بر اساس نام پزشک، تخصص، درمان، بیمارستان یا کلمات کلیدی
        </p>

        <div className="relative z-10 flex items-center bg-white rounded-2xl p-2 text-slate-900 max-w-3xl">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="نام پزشک، فوق تخصص یا خدمت مورد نظر..."
            className="flex-1 text-xs sm:text-sm bg-transparent outline-hidden font-medium text-slate-900 placeholder-slate-400"
          />
          <button
            onClick={() => setIsSpecialtiesModalOpen(true)}
            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl mr-2 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="فهرست کامل تخصص‌ها"
          >
            <Stethoscope className="w-4 h-4" />
            <span className="hidden sm:inline">تخصص‌ها</span>
          </button>
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className={`lg:hidden p-2 rounded-xl mr-1 cursor-pointer flex items-center gap-1 text-xs font-bold transition-colors ${
              showMobileFilter || selectedSpecialtyId || hasOnlineConsultation || selectedGender !== 'all' || selectedInsurance
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>فیلتر</span>
          </button>
        </div>

        {/* Mobile Swipeable Specialty Quick-Filter Chips */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar -mx-2 px-2">
          <button
            onClick={() => setSelectedSpecialtyId('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              !selectedSpecialtyId
                ? 'bg-white text-slate-900 shadow-sm'
                : 'bg-white/10 text-white/90 hover:bg-white/20'
            }`}
          >
            همه تخصص‌ها
          </button>
          {specialties.slice(0, 8).map(spec => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialtyId(spec.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                selectedSpecialtyId === spec.id
                  ? 'bg-blue-500 text-white shadow-sm ring-2 ring-white/50'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              <span>{spec.name.replace('متخصص ', '').replace('فوق تخصص ', '')}</span>
              <span className="text-[10px] opacity-75">({spec.doctorCount})</span>
            </button>
          ))}
          <button
            onClick={() => setIsSpecialtiesModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 bg-blue-600/60 hover:bg-blue-600 text-white flex items-center gap-1 cursor-pointer transition-colors border border-blue-400/40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>سایر ({specialties.length - 8})...</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <DoctorFilterSidebar
            specialties={specialties}
            selectedSpecialtyId={selectedSpecialtyId}
            setSelectedSpecialtyId={setSelectedSpecialtyId}
            hasOnlineConsultation={hasOnlineConsultation}
            setHasOnlineConsultation={setHasOnlineConsultation}
            selectedGender={selectedGender}
            setSelectedGender={setSelectedGender}
            selectedInsurance={selectedInsurance}
            setSelectedInsurance={setSelectedInsurance}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilter && (
          <div className="lg:hidden col-span-1 bg-white p-4 rounded-2xl border border-slate-200">
            <DoctorFilterSidebar
              specialties={specialties}
              selectedSpecialtyId={selectedSpecialtyId}
              setSelectedSpecialtyId={setSelectedSpecialtyId}
              hasOnlineConsultation={hasOnlineConsultation}
              setHasOnlineConsultation={setHasOnlineConsultation}
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
              selectedInsurance={selectedInsurance}
              setSelectedInsurance={setSelectedInsurance}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Doctor Grid Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span>
                نمایش <strong className="text-slate-900 font-bold">{displayedDoctors.length}</strong> از <strong className="text-slate-900 font-bold">{doctors.length}</strong> پزشک متخصص
              </span>
              {selectedSpecialtyId && (
                <button
                  onClick={() => setSelectedSpecialtyId('')}
                  className="text-blue-600 hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  <X className="w-3 h-3" />
                  <span>تخصص انتخابی</span>
                </button>
              )}
            </div>

            {/* View Mode Switcher: Card vs Compact List */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
              <button
                onClick={() => setDoctorViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  doctorViewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="نمای کارتی"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDoctorViewMode('compact')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  doctorViewMode === 'compact'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="نمای فشرده (مخصوص موبایل)"
              >
                <List className="w-4 h-4" />
                <span className="text-[10px] hidden xs:inline">فشرده</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex items-center justify-center min-h-[300px]">
              <MedicalLoadingIndicator
                fullScreen={false}
                message="در حال جستجوی پزشکان و تقویم نوبت‌ها..."
                subMessage="سامانه نوبت‌دهی متمرکز همرا کلینیک"
              />
            </div>
          ) : displayedDoctors.length > 0 ? (
            <>
              {doctorViewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {displayedDoctors.map(doc => (
                    <DoctorCard
                      key={doc.id}
                      doctor={doc}
                      onSelect={handleSelectDoctor}
                      onQuickBook={() => handleSelectDoctor(doc.slug)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                  {displayedDoctors.map(doc => (
                    <DoctorCompactCard
                      key={doc.id}
                      doctor={doc}
                      onSelect={handleSelectDoctor}
                      onQuickBook={() => handleSelectDoctor(doc.slug)}
                    />
                  ))}
                </div>
              )}

              {/* Progressive Batch Loading */}
              {doctors.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <div className="w-full sm:w-1/2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>پیشرفت نمایش پزشکان</span>
                      <span>{displayedDoctors.length} از {doctors.length}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((displayedDoctors.length / Math.max(doctors.length, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {displayedDoctors.length < doctors.length ? (
                    <button
                      onClick={() => setVisibleDoctorsCount(prev => prev + 6)}
                      className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs px-5 py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <ChevronDown className="w-4 h-4" />
                      <span>نمایش ۶ پزشک بیشتر (+۶)</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>همه {doctors.length} پزشک متخصص نمایش داده شدند</span>
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <UserX className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">پزشکی با این مشخصات یافت نشد</h3>
              <p className="text-xs text-slate-500">لطفاً عبارات جستجو یا فیلترهای انتخابی را تغییر دهید.</p>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                پاک‌سازی همه فیلترها
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Full Specialties Mobile Modal */}
      <MobileSpecialtiesModal
        isOpen={isSpecialtiesModalOpen}
        onClose={() => setIsSpecialtiesModalOpen(false)}
        specialties={specialties}
        selectedSpecialtyId={selectedSpecialtyId}
        onSelectSpecialty={(spec) => {
          setSelectedSpecialtyId(spec.id);
          setVisibleDoctorsCount(6);
        }}
      />
    </div>
  );
};
