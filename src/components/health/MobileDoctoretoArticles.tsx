import React, { useState, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Stethoscope, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { HealthArticle } from '../../types';

interface MobileDoctoretoArticlesProps {
  articles: HealthArticle[];
  onSelectArticle: (article: HealthArticle) => void;
  onViewAll: () => void;
}

export const MobileDoctoretoArticles: React.FC<MobileDoctoretoArticlesProps> = ({
  articles,
  onSelectArticle,
  onViewAll,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extract unique categories from articles
  const categories = useMemo(() => {
    const cats = new Set<string>();
    articles.forEach(a => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [articles]);

  // Filter articles by category
  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'all') {
      return articles;
    }
    return articles.filter(a => a.category === selectedCategory);
  }, [articles, selectedCategory]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    // In RTL, scrolling left requires negative offset on standard browsers
    const cardWidth = scrollContainerRef.current.clientWidth > 768 ? 360 : 280;
    const offset = direction === 'left' ? -cardWidth : cardWidth;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-4 font-sans" dir="rtl">
      {/* 1. Topics / Categories Filter Bar (چند موضوع مختلف - واکنش‌گرا برای موبایل، تبلت و دسکتاپ) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-blue-500/20 ring-2 ring-blue-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/90'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>همه موضوعات</span>
            <span className={`text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full font-mono ${
              selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {articles.length}
            </span>
          </button>

          {categories.map(cat => {
            const count = articles.filter(a => a.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-blue-500/20 ring-2 ring-blue-600/30'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/90'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop / Tablet Quick Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
            title="مشاهده مقالات قبلی"
            aria-label="مشاهده مقالات قبلی"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
            title="مشاهده مقالات بعدی"
            aria-label="مشاهده مقالات بعدی"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Horizontal Snap Scrolling Articles Track (کشیدن افقی به سبک دکترتو در تمام حالت‌ها) */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3.5 sm:gap-5 pb-3 pt-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 scroll-smooth"
        >
          {filteredArticles.map(art => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="w-[78vw] max-w-[285px] sm:w-[310px] md:w-[325px] lg:w-[340px] shrink-0 snap-start bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group/card"
            >
              {/* Card Cover Image with Overlays */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src={art.coverImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Category Badge */}
                <span className="absolute top-2.5 right-2.5 bg-slate-900/85 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg border border-white/15 shadow-2xs">
                  {art.category}
                </span>

                {/* Read Time Badge */}
                <span className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                  <span>{art.readTimeMinutes} دقیقه مطالعه</span>
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                <div className="space-y-1.5">
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover/card:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                {/* Author & Reviewer Info */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium truncate">
                      {art.authorDoctorName}
                    </span>
                  </div>

                  <span className="text-[11px] text-blue-600 font-bold flex items-center gap-0.5 shrink-0 group-hover/card:translate-x-[-2px] transition-transform">
                    <span>مطالعه مقاله</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Horizontal Scroll Navigation & Hint Footer */}
      <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 px-1 pt-0.5">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="block sm:hidden">👈 برای دیدن مقالات بیشتر، به چپ بکشید</span>
          <span className="hidden sm:block">👈 برای مشاهده سایر مقالات، به چپ و راست اسکرول کنید یا از کلیدهای ناوبری استفاده کنید</span>
        </div>

        {/* Mobile Mini Arrows */}
        <div className="flex sm:hidden items-center gap-1">
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-90 transition-all cursor-pointer"
            aria-label="مقاله قبلی"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-90 transition-all cursor-pointer"
            aria-label="مقاله بعدی"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
