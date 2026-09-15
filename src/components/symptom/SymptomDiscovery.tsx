import React, { useState } from 'react';
import { Search, AlertTriangle, ArrowLeft, CheckCircle2, Stethoscope, Sparkles } from 'lucide-react';
import { SymptomGuide, Doctor } from '../../types';
import { apiService } from '../../services/apiService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Rating } from '../common/Rating';
import { MedicalVectorPattern } from '../common/medicalPattern/MedicalVectorPattern';

interface SymptomDiscoveryProps {
  onSelectDoctor: (doctorSlug: string) => void;
}

export const SymptomDiscovery: React.FC<SymptomDiscoveryProps> = ({ onSelectDoctor }) => {
  const [symptomInput, setSymptomInput] = useState('');
  const [matchedGuide, setMatchedGuide] = useState<SymptomGuide | null>(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const quickSymptoms = [
    { label: 'معده درد و سوزش', query: 'معده' },
    { label: 'درد قفسه سینه / تپش', query: 'درد قفسه سینه' },
    { label: 'ریزش موی شدید', query: 'ریزش مو' },
    { label: 'درد زانو و مفاصل', query: 'زانو' },
    { label: 'سردرد مداوم و میگرن', query: 'سردرد' }
  ];

  const handleSearch = async (queryToSearch?: string) => {
    const q = queryToSearch || symptomInput;
    if (!q.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const matched = await apiService.matchSymptom(q);
      if (matched) {
        setMatchedGuide(matched);
        const docs = await apiService.getDoctors({ specialtyId: matched.suggestedSpecialtyId });
        setRecommendedDoctors(docs);
      } else {
        setMatchedGuide(null);
        setRecommendedDoctors([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-4 sm:p-10 shadow-xl border border-blue-600/20 my-6 sm:my-10 relative overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Matte Medical Vectors Pattern */}
      <MedicalVectorPattern opacity={0.05} variant="light" patternId="symptom-med-pattern" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Title */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 text-xs font-semibold border border-blue-600/30">
            <Sparkles className="w-3.5 h-3.5" />
            مسیریاب هوشمند درمان
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white">
            نمی‌دانی باید به چه پزشکی مراجعه کنی؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            علامت یا مشکل سلامت خود را بنویسید تا تخصص مرتبط و بهترین پزشکان به شما پیشنهاد شوند.
          </p>
        </div>

        {/* Input & Quick Chips */}
        <div className="space-y-3 sm:space-y-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white/10 backdrop-blur-md rounded-2xl p-1.5 sm:p-2 border border-white/20 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/30 transition-all gap-2 sm:gap-0 shadow-inner"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 absolute right-3 pointer-events-none" />
              <input
                type="text"
                value={symptomInput}
                onChange={e => setSymptomInput(e.target.value)}
                placeholder="مثلاً معده درد، میگرن، ریزش مو یا درد زانو..."
                className="w-full bg-transparent pr-9 sm:pr-10 pl-8 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none font-medium"
              />
              {symptomInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSymptomInput('');
                    setMatchedGuide(null);
                    setHasSearched(false);
                  }}
                  className="absolute left-2.5 p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <span className="sr-only">پاک کردن</span>
                  ✕
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSearching}
              icon={<Sparkles className="w-4 h-4" />}
              className="sm:w-auto w-full font-bold shadow-md shadow-blue-600/30 justify-center shrink-0 text-xs sm:text-sm"
            >
              تشخیص هوشمند تخصص
            </Button>
          </form>

          {/* Quick Symptoms Chips */}
          <div className="space-y-1.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-center gap-1.5 sm:gap-2 text-xs">
              <span className="text-slate-300 font-medium text-[10px] sm:text-xs shrink-0">
                علائم شایع:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto">
                {quickSymptoms.map((qs, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSymptomInput(qs.label);
                      handleSearch(qs.query);
                    }}
                    className="px-2.5 sm:px-3 py-1 bg-white/10 hover:bg-blue-600/30 hover:border-blue-400/50 text-blue-100 rounded-xl border border-white/15 transition-all text-[11px] sm:text-xs font-medium cursor-pointer active:scale-95 shrink-0 whitespace-nowrap hover:text-white"
                  >
                    {qs.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Box */}
        {hasSearched && (
          <div className="pt-4 border-t border-white/10 animate-in fade-in duration-300">
            {matchedGuide ? (
              <div className="space-y-6">
                {/* Result Header */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs text-blue-300 font-medium">تخصص پیشنهادی کلینیک:</div>
                        <div className="text-xl font-bold text-white">{matchedGuide.suggestedSpecialtyName}</div>
                      </div>
                    </div>

                    <Badge variant={matchedGuide.urgencyLevel === 'high' ? 'rose' : 'blue'}>
                      سطح نیاز: {matchedGuide.urgencyLevel === 'high' ? 'بررسی عاجل' : 'ویزیت عمومی یا تخصصی'}
                    </Badge>
                  </div>

                  {matchedGuide.emergencyWarning && (
                    <div className="bg-rose-500/20 border border-rose-500/40 rounded-xl p-3 flex items-start gap-2.5 text-rose-200 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{matchedGuide.emergencyWarning}</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-slate-200">علل شایع و احتمالی:</div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {matchedGuide.commonCauses.map((cause, cIdx) => (
                        <span key={cIdx} className="bg-white/10 px-2.5 py-1 rounded-lg text-slate-300">
                          • {cause}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended Doctors List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    پزشکان پیشنهادی تخصص {matchedGuide.suggestedSpecialtyName}:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendedDoctors.map(doc => (
                      <div
                        key={doc.id}
                        className="bg-white text-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={doc.avatar}
                            alt={doc.name}
                            className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200"
                          />
                          <div className="space-y-1 min-w-0">
                            <h5 className="font-bold text-sm text-slate-900 truncate">{doc.name}</h5>
                            <p className="text-xs text-slate-500 truncate">{doc.title}</p>
                            <Rating value={doc.rating} count={doc.reviewCount} size="sm" />
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onSelectDoctor(doc.slug)}
                          icon={<ArrowLeft className="w-3.5 h-3.5" />}
                          iconPosition="left"
                          className="w-full sm:w-auto shrink-0 font-bold whitespace-nowrap justify-center"
                        >
                          دریافت نوبت
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-2xl p-6 text-center space-y-2">
                <p className="text-sm text-slate-300">
                  راهنمای دقیقی برای عبارت واردشده پیدا نشد، اما می‌توانید کلیه پزشکان همرا کلینیک را جستجو بفرمایید.
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-400 text-center pt-4 border-t border-white/5">
              ⚠️ این ابزار راهنمای اولیه جهت ارجاع به تخصص مناسب است و جایگزین تشخیص مستقیم پزشک نمی‌باشد.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
