import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Specialty, Doctor } from '../types';
import { apiService } from '../services/apiService';
import { setSeoMetaData } from '../utils/seoUtils';
import { Stethoscope, ArrowRight, UserCheck, Calendar, Star, Search, Sparkles, X } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const SpecialtyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getSpecialties().then(specs => {
      setSpecialties(specs);
      if (slug) {
        const current = specs.find(s => s.slug === slug);
        if (current) {
          setSelectedSpecialty(current);
          setSeoMetaData(
            `متخصصین ${current.name} | نوبت‌دهی همرا کلینیک`,
            `رزرو اینترنتی نوبت بهترین پزشکان و متخصصین ${current.name} در همرا کلینیک. ${current.description}`
          );
          apiService.getDoctors({ specialtyId: current.id }).then(setDoctors);
        }
      } else {
        setSelectedSpecialty(null);
        setSeoMetaData(
          'تخصص‌های پزشکی همرا کلینیک | فهرست کامل دپارتمان‌ها',
          'مشاهده و نوبت‌دهی آنلاین کلیه دپارتمان‌های تخصصی همرا کلینیک شامل قلب، گوارش، پوست، زنان، ارتوپدی و مغز و اعصاب.'
        );
      }
      setLoading(false);
    });
  }, [slug]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredSpecialties = useMemo(() => {
    return specialties.filter(spec => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        spec.name.toLowerCase().includes(q) ||
        spec.englishName.toLowerCase().includes(q) ||
        spec.description.toLowerCase().includes(q) ||
        (spec.popularSymptoms && spec.popularSymptoms.some(s => s.toLowerCase().includes(q)));

      const matchesCategory = selectedCategory === 'all' || 
        (selectedCategory === 'internal' && (spec.name.includes('داخلی') || spec.name.includes('قلب') || spec.name.includes('گوارش') || spec.name.includes('ریه') || spec.name.includes('غدد') || spec.name.includes('روماتولوژی'))) ||
        (selectedCategory === 'surgery' && (spec.name.includes('جراحی') || spec.name.includes('ارتوپدی') || spec.name.includes('اورولوژی') || spec.name.includes('چشم'))) ||
        (selectedCategory === 'women-children' && (spec.name.includes('زنان') || spec.name.includes('کودکان') || spec.name.includes('اطفال'))) ||
        (selectedCategory === 'neuro' && (spec.name.includes('مغز') || spec.name.includes('روانپزشکی') || spec.name.includes('اعصاب'))) ||
        (selectedCategory === 'skin-dental' && (spec.name.includes('پوست') || spec.name.includes('دندانپزشکی')));

      return matchesQuery && matchesCategory;
    });
  }, [specialties, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-slate-500">در حال دریافت فهرست تخصص‌های پزشکی همرا کلینیک...</p>
      </div>
    );
  }

  // If a specific specialty is requested
  if (slug && selectedSpecialty) {
    return (
      <div className="space-y-8 pb-16">
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:underline">صفحه اصلی</Link> /
            <Link to="/specialties" className="hover:underline">تخصص‌ها</Link> /
            <span className="text-slate-800 font-bold">{selectedSpecialty.name}</span>
          </div>
          <button onClick={() => navigate('/specialties')} className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            همه تخصص‌ها
          </button>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 space-y-4">
          <Badge variant="blue">{selectedSpecialty.englishName}</Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold">{selectedSpecialty.name}</h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {selectedSpecialty.description}
          </p>

          <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 font-bold">علائم شایع مرتبط:</span>
            {selectedSpecialty.popularSymptoms.map((sym, idx) => (
              <span key={idx} className="bg-slate-800 text-blue-300 px-2.5 py-1 rounded-lg">
                {sym}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            پزشکان متخصص {selectedSpecialty.name} ({doctors.length} پزشک)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 justify-between"
              >
                <div className="flex gap-4">
                  <img src={doc.avatar} alt={doc.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-900">{doc.name}</h3>
                    <p className="text-xs text-blue-700 font-medium">{doc.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                      <span className="text-amber-500 font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {doc.rating}
                      </span>
                      <span>•</span>
                      <span>{doc.experienceYears} سال سابقه</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <button
                    onClick={() => navigate(`/doctors/${doc.slug}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    رزرو نوبت
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Listing all specialties
  return (
    <div className="space-y-6 pb-16">
      <div className="space-y-2 text-center max-w-2xl mx-auto pt-4 px-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">تخصص‌های همرا کلینیک (HEMERA CLINIC)</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          دسترسی به بیش از {specialties.length} دپارتمان تخصصی و فوق‌تخصصی با مجرب‌ترین اساتید پزشکی کشور
        </p>
      </div>

      {/* Search & Category Filter Header for Mobile & Desktop */}
      <div className="space-y-3 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام تخصص، ارگان یا علائم بیماری..."
            className="w-full bg-white border border-slate-200/80 rounded-2xl pr-11 pl-10 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          {[
            { id: 'all', label: 'همه تخصص‌ها' },
            { id: 'internal', label: 'قلب و داخلی' },
            { id: 'surgery', label: 'جراحی و ارتوپدی' },
            { id: 'women-children', label: 'زنان و اطفال' },
            { id: 'neuro', label: 'مغز و روان' },
            { id: 'skin-dental', label: 'پوست و دندان' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span>نمایش {filteredSpecialties.length} دپارتمان تخصصی</span>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              پاک‌سازی فیلترها
            </button>
          )}
        </div>
      </div>

      {filteredSpecialties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {filteredSpecialties.map(spec => (
            <div
              key={spec.id}
              onClick={() => navigate(`/specialties/${spec.slug}`)}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 hover:border-blue-400/80 hover:shadow-md transition-all cursor-pointer space-y-3 sm:space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-2xs">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <Badge variant="blue">{spec.doctorCount} پزشک فعال</Badge>
              </div>

              <div>
                <h2 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                  {spec.name}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">{spec.englishName}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {spec.description}
              </p>

              {spec.popularSymptoms && spec.popularSymptoms.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {spec.popularSymptoms.slice(0, 3).map((sym, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100">
                      {sym}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
                <span>مشاهده پزشکان و دریافت نوبت</span>
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3 max-w-md mx-auto">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">تخصصی با این مشخصات یافت نشد</h3>
          <p className="text-xs text-slate-500">لطفاً عبارت جستجو یا دسته‌بندی را تغییر دهید.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            مشاهده همه تخصص‌ها
          </button>
        </div>
      )}
    </div>
  );
};
