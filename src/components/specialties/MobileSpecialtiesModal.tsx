import React, { useState, useMemo } from 'react';
import { Specialty } from '../../types';
import {
  Search,
  X,
  Stethoscope,
  ChevronLeft,
  Sparkles,
  Users,
  CheckCircle2,
  Heart,
  Activity,
  Baby,
  Brain,
  Smile,
  Eye,
  Bone,
  User
} from 'lucide-react';
import { MedicalVectorPattern } from '../common/medicalPattern/MedicalVectorPattern';

interface MobileSpecialtiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialties: Specialty[];
  selectedSpecialtyId?: string;
  onSelectSpecialty: (specialty: Specialty) => void;
  title?: string;
}

// Map Lucide icons based on specialty icon name or category
const getSpecialtyIcon = (iconName: string, className = "w-5 h-5") => {
  switch (iconName?.toLowerCase()) {
    case 'heart':
      return <Heart className={className} />;
    case 'activity':
      return <Activity className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'user':
      return <User className={className} />;
    case 'baby':
      return <Baby className={className} />;
    case 'bone':
      return <Bone className={className} />;
    case 'brain':
      return <Brain className={className} />;
    case 'smile':
      return <Smile className={className} />;
    case 'eye':
      return <Eye className={className} />;
    default:
      return <Stethoscope className={className} />;
  }
};

const CATEGORIES = [
  { id: 'all', label: 'همه تخصص‌ها' },
  { id: 'internal', label: 'داخلی و قلب', keywords: ['قلب', 'گوارش', 'ریه', 'غدد', 'روماتولوژی'] },
  { id: 'surgery', label: 'جراحی و استخوان', keywords: ['ارتوپدی', 'جراحی', 'ارولوژی', 'چشم'] },
  { id: 'family', label: 'کودکان و زنان', keywords: ['اطفال', 'زنان', 'نوزاد'] },
  { id: 'derma_ent', label: 'پوست و حواس', keywords: ['پوست', 'گوش', 'چشم', 'دندان'] },
  { id: 'neuro_mind', label: 'مغز، اعصاب و روان', keywords: ['مغز', 'روانپزشکی', 'نورولوژی'] }
];

export const MobileSpecialtiesModal: React.FC<MobileSpecialtiesModalProps> = ({
  isOpen,
  onClose,
  specialties,
  selectedSpecialtyId,
  onSelectSpecialty,
  title = 'فهرست جامع تخصص‌های همرا کلینیک'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredSpecialties = useMemo(() => {
    let list = specialties;

    // Filter by Category
    if (activeCategory !== 'all') {
      const cat = CATEGORIES.find(c => c.id === activeCategory);
      if (cat && cat.keywords) {
        list = list.filter(spec => 
          cat.keywords.some(k => spec.name.includes(k) || spec.description.includes(k))
        );
      }
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(spec => 
        spec.name.toLowerCase().includes(q) ||
        spec.englishName.toLowerCase().includes(q) ||
        spec.description.toLowerCase().includes(q) ||
        spec.popularSymptoms.some(sym => sym.toLowerCase().includes(q))
      );
    }

    return list;
  }, [specialties, activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn" dir="rtl">
      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[82vh] overflow-hidden animate-slideUp">
        {/* Matte Medical Vectors Pattern */}
        <MedicalVectorPattern opacity={0.035} variant="colored" patternId="specialties-modal-med-pattern" />

        {/* Mobile Pull Bar Indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>{title}</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {filteredSpecialties.length} تخصص در دسترس برای نوبت‌دهی و مشاوره
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 pb-2 bg-slate-50/70 border-b border-slate-100 shrink-0 space-y-2.5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="جستجوی سریع: مثلاً قلب، ریزش مو، زانو، اطفال..."
              className="w-full bg-white pr-9 pl-8 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Department Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Specialties Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2 divide-y divide-slate-100/80">
          {filteredSpecialties.length > 0 ? (
            filteredSpecialties.map(spec => {
              const isSelected = selectedSpecialtyId === spec.id;
              return (
                <div
                  key={spec.id}
                  onClick={() => {
                    onSelectSpecialty(spec);
                    onClose();
                  }}
                  className={`pt-2 first:pt-0 p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-blue-50/70 active:scale-[0.99] ${
                    isSelected ? 'bg-blue-50/90 border border-blue-200' : 'hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {getSpecialtyIcon(spec.icon)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-xs sm:text-sm truncate ${
                          isSelected ? 'text-blue-900' : 'text-slate-900'
                        }`}>
                          {spec.name}
                        </h4>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                        {spec.englishName}
                      </p>
                      {/* Popular Symptoms Chips */}
                      {spec.popularSymptoms && spec.popularSymptoms.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 overflow-hidden">
                          <span className="text-[9px] text-slate-400 shrink-0">علائم:</span>
                          <span className="text-[9px] text-slate-500 truncate bg-slate-100/90 px-1.5 py-0.2 rounded-md">
                            {spec.popularSymptoms.slice(0, 3).join('، ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{spec.doctorCount} پزشک</span>
                    </span>
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-2">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">تخصصی با عبارت "{searchQuery}" یافت نشد</p>
              <p className="text-[11px] text-slate-400">می‌توانید از نام بیماری، علامت یا دسته‌بندی دیگری استفاده کنید.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-2 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                نمایش همه تخصص‌ها
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>انتخاب تخصص برای نوبت‌دهی فوری</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors text-xs"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
