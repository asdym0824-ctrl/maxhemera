import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, 
  CheckCircle2, 
  ThumbsUp, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  ShieldCheck, 
  Stethoscope, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface PatientReview {
  id: string;
  name: string;
  doctor: string;
  specialty: string;
  visitType: string;
  service?: string;
  comment: string;
  rating: number;
  date: string;
  helpfulCount?: number;
  recommended?: boolean;
  initial?: string;
}

interface MobileDoctoretoReviewsProps {
  reviews: PatientReview[];
  onNavigateDoctors?: () => void;
}

export const MobileDoctoretoReviews: React.FC<MobileDoctoretoReviewsProps> = ({
  reviews,
  onNavigateDoctors,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const DURATION = 4500; // ms per slide

  // Reset progress and timer on index change
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Handle Progress Bar Animation & Slide Transition
  useEffect(() => {
    if (!isPlaying) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const stepMs = 50;
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (stepMs / DURATION) * 100;
      });
    }, stepMs);

    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % reviews.length);
    }, DURATION);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, reviews.length, currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + reviews.length) % reviews.length);
  };

  // Touch gestures for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    // In RTL, swipe left (diff > 0) means next, swipe right (diff < 0) means prev
    if (diff > minSwipeDistance) {
      handleNext();
    } else if (diff < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentReview = reviews[currentIndex] || reviews[0];

  return (
    <div 
      className="block sm:hidden space-y-3 font-sans" 
      dir="rtl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Doctoreto Style Satisfaction Summary Strip */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            ۴.۹
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs font-black text-slate-900">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <span className="text-emerald-700 font-bold mr-1">۹۸٪ رضایت مراجعین</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              ثبت‌شده توسط مراجعین تایید شده کلینیک
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs active:scale-95"
            title={isPlaying ? 'توقف حرکت خودکار' : 'شروع حرکت خودکار'}
            aria-label={isPlaying ? 'توقف حرکت خودکار' : 'شروع حرکت خودکار'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-slate-700" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Main Animated Review Card with Doctoreto Layout */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-md p-4 space-y-3 overflow-hidden">
        {/* Progress Bar (Autoplay Countdown Indicator) */}
        <div className="absolute top-0 inset-x-0 h-1 bg-slate-100">
          <div 
            className="h-full bg-emerald-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentReview.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="space-y-3 pt-1"
          >
            {/* Top Patient Header & Verified Badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Patient Initial Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {currentReview.initial || currentReview.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900 truncate">
                      {currentReview.name}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      بیمار تایید شده
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    ثبت نوبت اینترنتی • {currentReview.date}
                  </div>
                </div>
              </div>

              {/* Stars & Recommend Badge */}
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(currentReview.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                {currentReview.recommended !== false && (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1 flex items-center gap-1 border border-emerald-100">
                    <ThumbsUp className="w-2.5 h-2.5 text-emerald-600" />
                    پیشنهاد می‌کنم
                  </span>
                )}
              </div>
            </div>

            {/* Doctor Info Box (Doctoreto Signature Style) */}
            <div className="p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 block leading-tight">پزشک معالج:</span>
                  <span className="font-black text-xs text-slate-900 truncate block">
                    {currentReview.doctor}
                  </span>
                  <span className="text-[10px] text-blue-600 block truncate">
                    {currentReview.specialty}
                  </span>
                </div>
              </div>

              <span className="text-[9px] bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg font-medium whitespace-nowrap shrink-0 shadow-2xs">
                {currentReview.visitType}
              </span>
            </div>

            {/* Patient Review Text */}
            <div className="relative">
              <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/60 p-3 rounded-xl border border-slate-100 text-justify">
                «{currentReview.comment}»
              </p>
            </div>

            {/* Review Footer & Helpful Counter */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1 text-[10px]">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span className="text-slate-500">ویزیت ثبت‌شده در سامانه</span>
              </div>

              {currentReview.helpfulCount && (
                <div className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                  <ThumbsUp className="w-2.5 h-2.5 text-slate-500" />
                  <span>{currentReview.helpfulCount} نفر این نظر را مفید دانستند</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile Navigation Controls & Dots */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer active:scale-90"
              aria-label="دیدگاه قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer active:scale-90"
              aria-label="دیدگاه بعدی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex 
                    ? 'w-5 bg-emerald-600' 
                    : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`دیدگاه ${idx + 1}`}
              />
            ))}
          </div>

          {/* Index Counter */}
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {currentIndex + 1} از {reviews.length}
          </span>
        </div>
      </div>

      {/* Swipe Hint */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
        <span>← برای دیدن نظرات دیگر به چپ یا راست بکشید</span>
      </div>
    </div>
  );
};
