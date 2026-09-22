import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  MapPin, 
  CalendarCheck, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronDown, 
  Star, 
  Users, 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  X, 
  Search, 
  Sun, 
  Moon, 
  ArrowUpLeft, 
  ArrowDownLeft, 
  MessageSquare, 
  ShieldCheck, 
  Award, 
  CreditCard, 
  Instagram, 
  Send,
  Building,
  Navigation,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Doctor, DetailedService } from '../../../types';

interface DrSahandTaeiSiteProps {
  doctor: Doctor;
  onOpenBookingModal?: (serviceTitle?: string, officeTitle?: string) => void;
}

export const DrSahandTaeiSite: React.FC<DrSahandTaeiSiteProps> = ({ 
  doctor,
  onOpenBookingModal 
}) => {
  // Dark mode state - synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taei_theme');
      if (saved) return saved === 'dark';
    }
    return true; // Default dark luxury as per reference
  });

  useEffect(() => {
    localStorage.setItem('taei_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Service detail modal
  const [selectedService, setSelectedService] = useState<DetailedService | null>(null);

  // Booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingBranch, setBookingBranch] = useState<'isfahan' | 'baharestan'>('isfahan');
  const [bookingService, setBookingService] = useState('تزریق فول‌فیس');
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('فردا ساعت ۱۷:۰۰');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Ask Question modal
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionName, setQuestionName] = useState('');
  const [questionPhone, setQuestionPhone] = useState('');
  const [questionTrackingCode, setQuestionTrackingCode] = useState<string | null>(null);

  // Installment Terms modal
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);

  // Review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewService, setNewReviewService] = useState('تزریق فول‌فیس');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Video 1 Player states
  const [video1Playing, setVideo1Playing] = useState(false);
  const [video1Muted, setVideo1Muted] = useState(false);
  const video1Ref = useRef<HTMLVideoElement>(null);

  // Video 2 Player states
  const [video2Playing, setVideo2Playing] = useState(false);
  const [video2Muted, setVideo2Muted] = useState(false);
  const video2Ref = useRef<HTMLVideoElement>(null);

  // Before/After interactive slider position (0 to 100)
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Active gallery tab
  const [activeGalleryTab, setActiveGalleryTab] = useState<'all' | 'blepharo' | 'fullface' | 'botox'>('all');

  // Handle Video 1 toggle
  const toggleVideo1 = () => {
    if (!video1Ref.current) return;
    if (video1Playing) {
      video1Ref.current.pause();
      setVideo1Playing(false);
    } else {
      video1Ref.current.play();
      setVideo1Playing(true);
    }
  };

  // Handle Video 2 toggle
  const toggleVideo2 = () => {
    if (!video2Ref.current) return;
    if (video2Playing) {
      video2Ref.current.pause();
      setVideo2Playing(false);
    } else {
      video2Ref.current.play();
      setVideo2Playing(true);
    }
  };

  // Handle Before/After slider dragging
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingSlider) return;
    handleSliderMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSlider) return;
    handleSliderMove(e.clientX);
  };

  // Mock patient reviews
  const [patientReviews, setPatientReviews] = useState([
    {
      id: 'rev-1',
      author: 'مریم احمدی',
      service: 'تزریق فول‌فیس و کانتورینگ',
      rating: 5,
      date: '۲ روز پیش',
      verified: true,
      comment: 'بهترین تجربه‌ای بود که از تزریق ژل داشتم. فرم صورتم کاملاً طبیعی و نچرال شد بدون اینکه اغراق‌آمیز باشه. برخورد خود دکتر طائی و پرسنل کلینیک فوق‌العاده حرفه‌ای و محترمانه بود.',
      doctorReply: 'مریم عزیز، سپاس از لطف و اعتماد شما. هدف ما همواره حفظ تعادل و فرم طبیعی چهره است.'
    },
    {
      id: 'rev-2',
      author: 'علیرضا حسینی',
      service: 'بلفاروپلاستی پلک بالا',
      rating: 5,
      date: 'هفته گذشته',
      verified: true,
      comment: 'پلک‌های من افتادگی شدیدی داشت که دیدم رو هم کم کرده بود. دکتر طائی با ظرافت تمام عمل رو انجام دادن. جای هیچ برشی نمونده و دوران نقاهتم خیلی سریع گذشت. ممنونم ازشون.',
      doctorReply: 'سلام جناب حسینی، خوشحالم که از نتیجه جراحی رضایت کامل دارید. سلامت باشید.'
    },
    {
      id: 'rev-3',
      author: 'نگار صادقی',
      service: 'لیزر موهای زائد و بوتاکس',
      rating: 5,
      date: '۲ هفته پیش',
      verified: true,
      comment: 'دستگاه‌های لیزر کلینیک واقعاً بدون درد و کولینگ بسیار قوی دارند. بعد از ۳ جلسه نتیجه فوق‌العاده دیدم. تزریق بوتاکس خط اخمم هم بدون هیچ افتادگی پلک عالی شد.',
      doctorReply: 'سلام نگار عزیز، رعایت دقیق جلسات توسط خود شما تأثیر چشمگیری در این نتیجه درخشان داشت.'
    }
  ]);

  // Gallery items with real before/after imagery
  const galleryItems = [
    {
      id: 'gal-1',
      title: 'بلفاروپلاستی پلک بالا',
      category: 'blepharo',
      categoryName: 'بلفاروپلاستی',
      before: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
      after: 'https://media.drsahandtaei.com/services/drtaei-bel.png',
      desc: 'برش ظریف در چین طبیعی پلک، رفع پف و پوست اضافه با دوره نقاهت کوتاه'
    },
    {
      id: 'gal-2',
      title: 'کانتورینگ و تزریق فول‌فیس',
      category: 'fullface',
      categoryName: 'تزریق فول‌فیس',
      before: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
      after: 'https://media.drsahandtaei.com/services/IMG_8780.JPG',
      desc: 'فرم‌دهی گونه، زاویه فک و چانه هماهنگ با آناتومی اختصاصی چهره'
    },
    {
      id: 'gal-3',
      title: 'تزریق بوتاکس و رفع خطوط پیشانی',
      category: 'botox',
      categoryName: 'بوتاکس',
      before: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
      after: 'https://media.drsahandtaei.com/services/IMG_8778.JPG',
      desc: 'رفع خطوط اخم و پنجه کلاغی چشم با بوتاکس معتبر بدون ایجاد چهره یخ‌زده'
    },
    {
      id: 'gal-4',
      title: 'لیزر موهای زائد و جوانسازی',
      category: 'laser',
      categoryName: 'لیزر',
      before: 'https://images.unsplash.com/photo-1512290900672-1f4144365780?auto=format&fit=crop&q=80&w=600',
      after: 'https://media.drsahandtaei.com/services/IMG_8779.JPG',
      desc: 'تکنولوژی پیشرفته ۲۰۲۶ با سیستم کولینگ قوی و پوشش انواع تایپ‌های پوستی'
    }
  ];

  const filteredGallery = activeGalleryTab === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeGalleryTab);

  // Search results
  const searchResults = doctor.detailedServices?.filter(s => 
    s.title.includes(searchQuery) || 
    s.description?.includes(searchQuery) ||
    s.category?.includes(searchQuery)
  ) || [];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone) return;
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setIsBookingModalOpen(false);
      setBookingName('');
      setBookingPhone('');
    }, 2500);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText || !questionPhone) return;
    const code = 'TAEI-' + Math.floor(100000 + Math.random() * 900000);
    setQuestionTrackingCode(code);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewComment) return;
    const newRev = {
      id: 'rev-' + Date.now(),
      author: newReviewAuthor,
      service: newReviewService,
      rating: newReviewRating,
      date: 'هم‌اکنون',
      verified: true,
      comment: newReviewComment,
      doctorReply: 'با تشکر از ثبت نظر ارزشمند شما، دیدگاه شما پس از بازبینی ثبت گردید.'
    };
    setPatientReviews([newRev, ...patientReviews]);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setIsReviewModalOpen(false);
      setNewReviewAuthor('');
      setNewReviewComment('');
    }, 2000);
  };

  return (
    <div className={`w-full min-h-screen font-sans ${isDarkMode ? 'dark bg-[#04070f] text-white' : 'bg-[#faf9f6] text-gray-900'} transition-colors duration-300 antialiased selection:bg-[#c9a227] selection:text-[#04070f]`} dir="rtl">
      
      {/* 1. TOP BAR */}
      <div className="w-full bg-[#04070f] text-white border-b border-white/10 text-[11px] py-2 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Address */}
          <div className="flex items-center gap-2 text-white/70 overflow-hidden text-ellipsis whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5 text-[#c9a227] shrink-0" />
            <span className="truncate">
              اصفهان، خیابان توحید میانی، کوچه ۲۵ شهیدان کاظمی، مجتمع گلدیس، طبقه ۵، واحد ۱۹
            </span>
          </div>

          {/* Contact & Free Consultation */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-medium">پذیرش همه‌روزه ۹ تا ۱۹</span>
            </div>

            <div className="hidden sm:block w-px h-3.5 bg-white/20"></div>

            <a 
              href="tel:09135115237" 
              className="flex items-center gap-1.5 text-white/90 hover:text-[#c9a227] transition-colors font-mono tracking-wider" 
              dir="ltr"
            >
              <Phone className="w-3 h-3 text-[#c9a227]" />
              <span>۰۹۱۳۵۱۱۵۲۳۷</span>
            </a>

            <div className="w-px h-3.5 bg-white/20"></div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="text-[#c9a227] hover:text-[#e0ba3d] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>درخواست نوبت رایگان</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STICKY MAIN HEADER */}
      <header className="sticky top-0 z-40 w-full bg-gradient-to-l from-[#0a1428] via-[#10234a] to-[#0a1428] text-white border-b border-white/10 shadow-xl backdrop-blur-md">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/3 w-96 h-40 bg-[#c9a227]/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between relative">
          
          {/* Brand Logo & Doctor Name */}
          <div className="flex items-center gap-3">
            <a href="#hero" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 p-1.5 flex items-center justify-center shadow-inner group-hover:border-[#c9a227]/60 transition-colors">
                <img 
                  src="https://media.drsahandtaei.com/settings/1000034367.png" 
                  alt="لوگوی کلینیک دکتر سهند طائی" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="border-r-2 border-[#c9a227] pr-3">
                <div className="text-lg font-black tracking-tight text-white group-hover:text-[#c9a227] transition-colors flex items-center gap-1.5">
                  <span>دکتر سهند طائی</span>
                  <CheckCircle2 className="w-4 h-4 text-[#c9a227] fill-[#c9a227]/20" />
                </div>
                <div className="text-[11px] text-white/60 font-medium">
                  متخصص پوست، مو و زیبایی
                </div>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-white/80">
            <a href="#hero" className="text-white hover:text-[#c9a227] transition-colors">صفحه اصلی</a>
            <a href="#about-doctor" className="hover:text-[#c9a227] transition-colors">درباره دکتر</a>
            
            {/* Services Dropdown */}
            <div className="relative group py-2">
              <a href="#services" className="hover:text-[#c9a227] transition-colors flex items-center gap-1">
                <span>خدمات کلینیک</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform" />
              </a>
              <div className="absolute top-full right-0 w-60 bg-[#0a1428] border border-white/15 rounded-2xl shadow-2xl p-2 hidden group-hover:flex flex-col gap-1 z-50 backdrop-blur-xl">
                {doctor.detailedServices?.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    className="text-right px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>{s.title}</span>
                    <ArrowUpLeft className="w-3.5 h-3.5 text-[#c9a227] opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setIsInstallmentModalOpen(true)}
              className="hover:text-[#c9a227] transition-colors flex items-center gap-1.5"
            >
              <span>شرایط اقساطی</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#c9a227] text-[#0f2350] rounded-md shadow-xs animate-pulse">
                ویژه
              </span>
            </button>

            <a href="#gallery" className="hover:text-[#c9a227] transition-colors">گالری نتایج</a>
            <a href="#videos" className="hover:text-[#c9a227] transition-colors">ویدیوها</a>
            <a href="#reviews" className="hover:text-[#c9a227] transition-colors">نظرات</a>
            <a href="#contact" className="hover:text-[#c9a227] transition-colors">تماس و شعب</a>
          </nav>

          {/* Header Action Tools */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
              title="جستجو در خدمات"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-[#c9a227] transition-all cursor-pointer"
              title={isDarkMode ? 'حالت روشن' : 'حالت تاریک'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Main Booking CTA */}
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c9a227] hover:bg-[#e0ba3d] text-[#0f2350] text-xs font-black shadow-lg shadow-[#c9a227]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>نوبت‌دهی آنلاین</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white cursor-pointer"
              aria-label="Open mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : (
                <div className="space-y-1 w-5">
                  <span className="block w-5 h-0.5 bg-white"></span>
                  <span className="block w-4 h-0.5 bg-[#c9a227] mr-auto"></span>
                  <span className="block w-5 h-0.5 bg-white"></span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#0a1428] px-4 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <a 
                href="#hero" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-white/5 text-white/90 hover:bg-white/10 text-center"
              >
                صفحه اصلی
              </a>
              <a 
                href="#about-doctor" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-white/5 text-white/90 hover:bg-white/10 text-center"
              >
                درباره دکتر
              </a>
              <a 
                href="#services" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-white/5 text-white/90 hover:bg-white/10 text-center"
              >
                خدمات کلینیک
              </a>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsInstallmentModalOpen(true);
                }}
                className="p-3 rounded-xl bg-[#c9a227]/20 border border-[#c9a227]/30 text-[#c9a227] font-bold text-center"
              >
                شرایط اقساطی
              </button>
              <a 
                href="#gallery" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-white/5 text-white/90 hover:bg-white/10 text-center"
              >
                گالری نتایج
              </a>
              <a 
                href="#videos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-white/5 text-white/90 hover:bg-white/10 text-center"
              >
                ویدیوها
              </a>
              <a 
                href="#reviews" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-white/5 text-white/90 hover:bg-white/10 text-center"
              >
                نظرات مراجعین
              </a>
              <a 
                href="#contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-white/5 text-white/90 hover:bg-white/10 text-center"
              >
                تماس و شعب
              </a>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsBookingModalOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-[#c9a227] text-[#0f2350] font-black text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                <span>رزرو نوبت آنلاین</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-20 md:py-24 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#c9a227_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.06] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Right Column: Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-right">
              {/* Eyebrow Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c9a227]/15 border border-[#c9a227]/30 text-[#c9a227] text-xs font-black shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>کلینیک تخصصی پوست، مو و لیزر</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.25] tracking-tight">
                زیبایی طبیعی، با <span className="text-[#c9a227] underline decoration-[#c9a227]/30 underline-offset-8">دانش و تجربه</span> پزشکی
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl font-normal">
                ارائه خدمات تخصصی پوست، مو و زیبایی با جدیدترین تکنولوژی‌های روز دنیا توسط دکتر سهند طائی در محیطی آرام، استاندارد و با رعایت دقیق اصول آناتومیک چهره.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-7 py-4 rounded-full bg-[#c9a227] hover:bg-[#e0ba3d] text-[#0f2350] font-black text-sm shadow-xl shadow-[#c9a227]/25 flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span>رزرو نوبت آنلاین</span>
                </button>

                <a
                  href="#services"
                  className="px-7 py-4 rounded-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/15 text-gray-800 dark:text-white font-bold text-sm hover:border-[#c9a227] hover:text-[#c9a227] transition-all flex items-center gap-2"
                >
                  <span>مشاهده خدمات کلینیک</span>
                  <ArrowDownLeft className="w-4 h-4 text-[#c9a227]" />
                </a>
              </div>

              {/* Social Proof */}
              <div className="pt-4 flex items-center gap-4 border-t border-gray-200 dark:border-white/10 max-w-md">
                <div className="flex -space-x-2 space-x-reverse">
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#04070f] bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    م
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#04070f] bg-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    س
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#04070f] bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    ن
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#04070f] bg-[#c9a227] flex items-center justify-center text-[#0f2350] text-xs font-black shadow-md">
                    +۵۰۰
                  </div>
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1 text-[#c9a227]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#c9a227]" />
                    ))}
                    <span className="font-bold text-gray-900 dark:text-white mr-1">۴.۹ از ۵</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                    بیش از ۵۰۰ درمان موفق و رضایت‌بخش
                  </div>
                </div>
              </div>
            </div>

            {/* Left Column: Doctor Portrait Arch */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-[340px] sm:max-w-[400px]">
                
                {/* Glowing ambient ring */}
                <div className="absolute inset-0 bg-[#c9a227]/20 blur-3xl rounded-full transform -translate-y-4 pointer-events-none"></div>

                {/* Offset Decorative Golden Border Frame */}
                <div className="absolute -inset-3 rounded-t-full rounded-b-[2.5rem] border-2 border-[#c9a227]/30 transform translate-x-3 translate-y-3 pointer-events-none"></div>

                {/* Main Arched Image Card */}
                <div className="relative rounded-t-full rounded-b-[2.5rem] overflow-hidden border-2 border-[#c9a227] bg-[#0a1428] shadow-2xl aspect-[3/4]">
                  <img
                    src="https://media.drsahandtaei.com/doctors/sahand.JPG"
                    alt="دکتر سهند طائی"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Bottom Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04070f] via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Floating Badge 1: Rating */}
                <div className="absolute -top-3 -right-3 bg-white dark:bg-[#0a1428] border border-gray-200 dark:border-white/15 rounded-2xl p-3 shadow-xl backdrop-blur-md flex items-center gap-2.5 animate-bounce-slow">
                  <div className="w-9 h-9 rounded-xl bg-[#c9a227]/20 flex items-center justify-center text-[#c9a227]">
                    <Star className="w-5 h-5 fill-[#c9a227]" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900 dark:text-white">۴.۹ ★</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">رضایت بیماران</div>
                  </div>
                </div>

                {/* Floating Badge 2: Experience */}
                <div className="absolute -bottom-4 -left-3 bg-white dark:bg-[#0a1428] border border-gray-200 dark:border-white/15 rounded-2xl p-3 shadow-xl backdrop-blur-md flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900 dark:text-white">۱۱+ سال</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">سابقه استاتیک</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. MOVING TRUST MARQUEE */}
      <div className="w-full bg-[#04070f] text-white py-3.5 border-y-2 border-[#c9a227]/60 overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-marquee gap-8 text-xs sm:text-sm font-bold tracking-wide">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-8 shrink-0">
              <span className="flex items-center gap-2">
                <span className="text-[#c9a227]">✦</span>
                <span>بورد تخصصی پوست و مو</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#c9a227]">✦</span>
                <span>۱۱ سال تجربه بالینی</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#c9a227]">✦</span>
                <span>تجهیزات روز دنیا ۲۰۲۶</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#c9a227]">✦</span>
                <span>پیگیری دقیق پس از درمان</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#c9a227]">✦</span>
                <span>تشخیص و مشاوره صادقانه</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. SERVICES SECTION */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-black tracking-widest text-[#c9a227] uppercase mb-2">
              ۰۱ · خدمات تخصصی
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
              خدمات متمایز و پیشرفته کلینیک
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl">
              پروسیجرهای تشخیصی، زیبایی و جوانسازی بر پایه علم روز، متناسب با هارمونی چهره و سلامت پوست شما
            </p>
          </div>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="self-start md:self-auto px-5 py-2.5 rounded-full border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-[#0f2350] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>دریافت نوبت معاینه</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Distinct Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {doctor.detailedServices?.map((service, index) => {
            // Mapping service photos
            const serviceImages: Record<string, string> = {
              'srv-laser': 'https://media.drsahandtaei.com/services/IMG_8779.JPG',
              'srv-fullface': 'https://media.drsahandtaei.com/services/IMG_8780.JPG',
              'srv-weightloss': 'https://media.drsahandtaei.com/services/IMG_8777.JPG',
              'srv-blepharo': 'https://media.drsahandtaei.com/services/drtaei-bel.png',
              'srv-botox': 'https://media.drsahandtaei.com/services/IMG_8778.JPG'
            };
            const imgUrl = serviceImages[service.id] || 'https://media.drsahandtaei.com/services/IMG_8780.JPG';

            return (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                className="group relative rounded-3xl overflow-hidden bg-white dark:bg-[#0a1428] border border-gray-200 dark:border-white/10 shadow-lg hover:shadow-2xl hover:border-[#c9a227]/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Image Container with Aspect Ratio */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                  <img
                    src={imgUrl}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04070f] via-black/20 to-transparent"></div>

                  {/* Ghost Index Number */}
                  <div className="absolute top-3 left-4 text-3xl font-black text-white/30 font-mono">
                    ۰{index + 1}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-bold text-[#c9a227] border border-white/10">
                    {service.category || 'تخصصی'}
                  </div>

                  {/* Arrow Action Icon */}
                  <div className="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-[#c9a227] text-[#0f2350] flex items-center justify-center shadow-lg group-hover:rotate-45 transition-transform duration-300">
                    <ArrowUpLeft className="w-4 h-4 font-bold" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 text-right space-y-2">
                  <h3 className="text-base font-black text-gray-900 dark:text-white group-hover:text-[#c9a227] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. EDITORIAL ABOUT DOCTOR SECTION */}
      <section id="about-doctor" className="py-24 bg-[#04070f] text-white relative overflow-hidden">
        {/* Giant Watermark */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[140px] sm:text-[220px] font-black text-white/[0.02] tracking-widest select-none pointer-events-none">
          TAEI
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Image Column */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[360px]">
                <div className="absolute -inset-2 rounded-3xl border border-[#c9a227]/40 translate-x-2 translate-y-2 pointer-events-none"></div>
                <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl aspect-[4/5] bg-gray-900">
                  <img
                    src="https://media.drsahandtaei.com/doctors/sahand.JPG"
                    alt="دکتر سهند طائی"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04070f] via-transparent to-transparent"></div>
                  
                  {/* Floating Doctor Credentials Box */}
                  <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-[#0a1428]/90 border border-white/10 backdrop-blur-md text-right">
                    <div className="text-sm font-black text-[#c9a227] flex items-center gap-1.5">
                      <span>دکتر سهند طائی</span>
                      <CheckCircle2 className="w-4 h-4 text-[#c9a227]" />
                    </div>
                    <div className="text-[11px] text-white/70 mt-0.5">
                      شماره نظام پزشکی: ۲۱۹۲۰۱ | متخصص استاتیک
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Column */}
            <div className="lg:col-span-7 space-y-6 text-right">
              <div className="text-xs font-black tracking-widest text-[#c9a227] uppercase">
                ۰۲ · درباره پزشک
              </div>

              <h2 className="text-3xl sm:text-4xl font-black">
                آشنایی با دکتر سهند طائی
              </h2>

              <p className="text-sm sm:text-base leading-relaxed text-gray-300 font-normal">
                دکتر سهند طائی پزشک استاتیک پوست و مو با سابقه کاری ۱۱ ساله در حوزه استاتیک، عضو انجمن پزشکان زیبایی کانادا تورنتو، صاحب سبک در تزریقات فول فیس و جراحی‌های سرپایی، مدرس حوزه استاتیک و تخصصی پی‌آرپی و مزوتراپی، دارای مقالات رسمی در معتبرترین ژورنال‌ها و سایت‌های پزشکی هستند.
              </p>

              {/* Timeline Credentials */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#c9a227]/20 border border-[#c9a227] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a227]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">عضو انجمن پزشکان زیبایی کانادا (تورنتو - CAM)</div>
                    <div className="text-[11px] text-gray-400">دارنده سرتیفیکیت بین‌المللی کانتورینگ و تزریقات زیبایی</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#c9a227]/20 border border-[#c9a227] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a227]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">مدرس دوره‌های تخصصی استاتیک و PRP</div>
                    <div className="text-[11px] text-gray-400">آموزش صدها پزشک در زمینه تکنیک‌های نوین مزوتراپی و اصلاح فرم چهره</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#c9a227]/20 border border-[#c9a227] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a227]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">پژوهشگر درماتولوژی و مقالات معتبر پزشکی</div>
                    <div className="text-[11px] text-gray-400">تحقیقات بالینی پیرامون ایمنی پروسیجرها و نتایج ارگانیک</div>
                  </div>
                </div>
              </div>

              {/* Counter Statistics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-[#c9a227]">۱۱+</div>
                  <div className="text-[11px] text-gray-400 mt-1">سال سابقه تخصصی</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-[#c9a227]">۵۰۰+</div>
                  <div className="text-[11px] text-gray-400 mt-1">درمان موفق</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-[#c9a227]">۲۰+</div>
                  <div className="text-[11px] text-gray-400 mt-1">روش درمانی پیشرفته</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE BEFORE & AFTER RESULTS GALLERY */}
      <section id="gallery" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-black tracking-widest text-[#c9a227] uppercase mb-2">
            ۰۳ · نتایج واقعی
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
            تحول چهره با درمان‌های تخصصی
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            اسلایدر تعاملی مقایسه قبل و بعد بدون هیچ‌گونه رتوش و دستکاری تصویری
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setActiveGalleryTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeGalleryTab === 'all'
                  ? 'bg-[#c9a227] text-[#0f2350] shadow-md'
                  : 'bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/10'
              }`}
            >
              همه نمونه‌ها
            </button>
            <button
              onClick={() => setActiveGalleryTab('blepharo')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeGalleryTab === 'blepharo'
                  ? 'bg-[#c9a227] text-[#0f2350] shadow-md'
                  : 'bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/10'
              }`}
            >
              بلفاروپلاستی
            </button>
            <button
              onClick={() => setActiveGalleryTab('fullface')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeGalleryTab === 'fullface'
                  ? 'bg-[#c9a227] text-[#0f2350] shadow-md'
                  : 'bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/10'
              }`}
            >
              کانتورینگ و فول‌فیس
            </button>
            <button
              onClick={() => setActiveGalleryTab('botox')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeGalleryTab === 'botox'
                  ? 'bg-[#c9a227] text-[#0f2350] shadow-md'
                  : 'bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/10'
              }`}
            >
              بوتاکس و جوانسازی
            </button>
          </div>
        </div>

        {/* Featured Draggable Split Slider */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white dark:bg-[#0a1428] rounded-3xl p-4 sm:p-6 border border-gray-200 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-[#c9a227]/20 text-[#c9a227] text-xs font-bold">
                اسلایدر مقایسه زنده
              </span>
              <span className="text-xs text-gray-400">
                دستگیره را به چپ و راست بکشید
              </span>
            </div>

            <div
              ref={sliderContainerRef}
              onMouseDown={() => setIsDraggingSlider(true)}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsDraggingSlider(true)}
              onTouchEnd={() => setIsDraggingSlider(false)}
              onTouchMove={handleTouchMove}
              className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden cursor-ew-resize select-none bg-black"
            >
              {/* After Image (Background) */}
              <img
                src="https://media.drsahandtaei.com/services/drtaei-bel.png"
                alt="بعد از عمل بلفاروپلاستی"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-emerald-600/90 text-white text-xs font-black px-3 py-1 rounded-full backdrop-blur-md shadow-md">
                بعد از درمان
              </div>

              {/* Before Image (Clipped Overlay) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000"
                  alt="قبل از درمان"
                  className="absolute inset-0 w-full h-full object-cover filter saturate-75"
                />
                <div className="absolute top-4 right-4 bg-gray-900/90 text-white text-xs font-black px-3 py-1 rounded-full backdrop-blur-md shadow-md">
                  قبل از درمان
                </div>
              </div>

              {/* Vertical Drag Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-[#c9a227] shadow-[0_0_10px_#c9a227]"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#c9a227] text-[#0f2350] border-2 border-white shadow-xl flex items-center justify-center">
                  <div className="flex gap-0.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                بلفاروپلاستی پلک بالا و جوانسازی نگاه توسط دکتر سهند طائی
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                برش در شیار پلکی با بخیه میکروسکوپی بدون برجا ماندن اسکار
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGallery.map(item => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden bg-white dark:bg-[#0a1428] border border-gray-200 dark:border-white/10 shadow-md hover:shadow-xl transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
                <img
                  src={item.after}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-[#c9a227]">
                  {item.categoryName}
                </div>
              </div>
              <div className="p-4 space-y-1.5 text-right">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. VIDEO SHOWCASE (CINEMATIC) */}
      <section id="videos" className="py-20 bg-[#0a1428] text-white border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-black tracking-widest text-[#c9a227] uppercase mb-2">
              ۰۴ · ویدیوهای آموزشی و توضیحات
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
              کلام مستقیم دکتر طائی با مراجعین
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              توضیحات تخصصی درباره فلسفه زیبایی طبیعی، انتخاب متریال اصیل و راهکارهای درمانی
            </p>
          </div>

          {/* VIDEO 1: «مثل قهوه اصیل باشید !» */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#04070f] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            {/* Player Container */}
            <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-[16/9] bg-black shadow-inner">
              <video
                ref={video1Ref}
                src="https://media.drsahandtaei.com/videos/%D8%A7%D8%B5%DB%8C%D9%84_%D9%85%D8%AB%D9%84_%D9%82%D9%87%D9%88%D9%87_.mp4"
                poster="https://media.drsahandtaei.com/videos/thumbnails/Screenshot_2026-09-18_015605.png"
                className="w-full h-full object-cover"
                playsInline
                muted={video1Muted}
                onEnded={() => setVideo1Playing(false)}
              />

              {/* Play/Pause Overlay Button */}
              <button
                onClick={toggleVideo1}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors group cursor-pointer"
                aria-label={video1Playing ? 'توقف ویدیو' : 'پخش ویدیو'}
              >
                {!video1Playing && (
                  <div className="w-16 h-16 rounded-full bg-[#c9a227] text-[#0f2350] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-[#0f2350] translate-x-0.5" />
                  </div>
                )}
              </button>

              {/* Bottom Video Controls Bar */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md text-xs">
                <button
                  onClick={toggleVideo1}
                  className="flex items-center gap-1.5 text-white hover:text-[#c9a227] cursor-pointer"
                >
                  {video1Playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{video1Playing ? 'توقف' : 'پخش ویدیو'}</span>
                </button>

                <button
                  onClick={() => {
                    if (video1Ref.current) {
                      video1Ref.current.muted = !video1Muted;
                      setVideo1Muted(!video1Muted);
                    }
                  }}
                  className="text-white hover:text-[#c9a227] cursor-pointer"
                >
                  {video1Muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Video 1 Narrative Card */}
            <div className="lg:col-span-5 text-right space-y-4">
              <span className="px-3 py-1 rounded-full bg-[#c9a227]/20 text-[#c9a227] text-xs font-bold">
                اصالت در زیبایی
              </span>
              <h3 className="text-xl sm:text-2xl font-black leading-snug">
                مثل قهوه اصیل باشید !
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                «برای چهرتون مثل قهوه اصیل باشید... زیبایی تقلبی و تغییرات اغراق‌آمیز، هویت شما را می‌گیرد. رویکرد ما در کلینیک دکتر طائی تقویت ویژگی‌های منحصر‌به‌فرد چهره خود شماست، نه شبیه‌سازی با الگوهای تکراری.»
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-6 py-3 rounded-full bg-[#c9a227] text-[#0f2350] font-black text-xs hover:bg-[#e0ba3d] shadow-lg transition-all cursor-pointer"
                >
                  رزرو جلسه مشاوره با دکتر
                </button>
              </div>
            </div>
          </div>

          {/* VIDEO 2: «برای هر ناحیه، یک راهکار تخصصی» */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0f2350] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            {/* Video 2 Narrative Card */}
            <div className="lg:col-span-5 text-right space-y-4 order-2 lg:order-1">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                تکنیک‌های ناحیه‌ای
              </span>
              <h3 className="text-xl sm:text-2xl font-black leading-snug">
                برای هر ناحیه، یک راهکار تخصصی
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                بررسی انتخاب‌های درمانی متناسب با ویژگی‌های بافت صورت، عمق تزریق فیلر در گونه و خط خنده، تکنیک‌های تزریق چربی و تفاوت فیلرهای هیالورونیک برای نتیجه پایدار و ایمن.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-6 py-3 rounded-full bg-white text-[#0f2350] font-black text-xs hover:bg-gray-100 shadow-lg transition-all cursor-pointer"
                >
                  مشاوره آناتومی رایگان
                </button>
              </div>
            </div>

            {/* Video 2 Player Container */}
            <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-[16/9] bg-black shadow-inner order-1 lg:order-2">
              <video
                ref={video2Ref}
                src="https://media.drsahandtaei.com/videos/%D8%A7%D8%B5%D9%84%D8%A7%D8%AD%DB%8C%D9%87_%D8%AA%D8%AC%D9%88%DB%8C%D8%B2__1.mp4"
                poster="https://media.drsahandtaei.com/videos/thumbnails/Screenshot_2026-09-22_044934.png"
                className="w-full h-full object-cover"
                playsInline
                muted={video2Muted}
                onEnded={() => setVideo2Playing(false)}
              />

              <button
                onClick={toggleVideo2}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors group cursor-pointer"
                aria-label={video2Playing ? 'توقف ویدیو' : 'پخش ویدیو'}
              >
                {!video2Playing && (
                  <div className="w-16 h-16 rounded-full bg-[#c9a227] text-[#0f2350] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-[#0f2350] translate-x-0.5" />
                  </div>
                )}
              </button>

              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md text-xs">
                <button
                  onClick={toggleVideo2}
                  className="flex items-center gap-1.5 text-white hover:text-[#c9a227] cursor-pointer"
                >
                  {video2Playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{video2Playing ? 'توقف' : 'پخش ویدیو'}</span>
                </button>

                <button
                  onClick={() => {
                    if (video2Ref.current) {
                      video2Ref.current.muted = !video2Muted;
                      setVideo2Muted(!video2Muted);
                    }
                  }}
                  className="text-white hover:text-[#c9a227] cursor-pointer"
                >
                  {video2Muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 9. INSTALLMENT TERMS (طرح پرداخت اقساطی) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#0a1428] via-[#10234a] to-[#04070f] text-white p-8 sm:p-12 border-2 border-[#c9a227]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#c9a227]/10 blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            <div className="lg:col-span-8 space-y-4 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a227]/20 border border-[#c9a227]/40 text-[#c9a227] text-xs font-bold">
                <CreditCard className="w-3.5 h-3.5" />
                <span>طرح ویژه رفاه مراجعین محترم</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
                شرایط و تسهیلات پرداخت اقساطی خدمات زیبایی
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
                به منظور رفاه حال مراجعین عزیز، امکان پرداخت اقساطی برای مبالغ بین <strong className="text-[#c9a227]">۳۰ میلیون تا ۱۰۰ میلیون تومان</strong> با بازپرداخت <strong className="text-[#c9a227]">۴ الی ۱۲ ماه</strong> فراهم گردیده است. خدمات مشاوره حضوری و تحلیل آناتومی توسط جناب دکتر رایگان می‌باشد.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="text-[#c9a227] font-bold">سقف تسهیلات</div>
                  <div className="font-black text-white mt-1">تا ۱۰۰ میلیون تومان</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="text-[#c9a227] font-bold">مدت بازپرداخت</div>
                  <div className="font-black text-white mt-1">۴ الی ۱۲ ماهه</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="text-[#c9a227] font-bold">مشاوره آناتومی</div>
                  <div className="font-black text-emerald-400 mt-1">کاملاً رایگان</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <button
                onClick={() => setIsInstallmentModalOpen(true)}
                className="w-full py-4 rounded-full bg-[#c9a227] hover:bg-[#e0ba3d] text-[#0f2350] font-black text-sm shadow-xl shadow-[#c9a227]/30 transition-all text-center cursor-pointer"
              >
                مشاهده کامل جزئیات طرح اقساطی
              </button>

              <a
                href="tel:09135115237"
                className="w-full py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all text-center flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#c9a227]" />
                <span>تماس جهت استعلام اقساط: ۰۹۱۳۵۱۱۵۲۳۷</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 10. PATIENT REVIEWS & TESTIMONIALS */}
      <section id="reviews" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-black tracking-widest text-[#c9a227] uppercase mb-2">
              ۰۵ · نظرات مراجعین
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
              آنچه بیماران ما می‌گویند
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              تجربه‌های واقعی بیماران — بدون سانسور، با پاسخ رسمی کلینیک
            </p>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="self-start md:self-auto px-5 py-2.5 rounded-full bg-[#c9a227] text-[#0f2350] font-black text-xs hover:bg-[#e0ba3d] shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>ثبت نظر شما</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {patientReviews.map(review => (
            <div
              key={review.id}
              className="rounded-3xl p-6 bg-white dark:bg-[#0a1428] border border-gray-200 dark:border-white/10 shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#c9a227]/20 text-[#c9a227] font-black flex items-center justify-center text-sm">
                      {review.author[0]}
                    </div>
                    <div>
                      <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1">
                        <span>{review.author}</span>
                        {review.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">{review.date}</div>
                    </div>
                  </div>
                  <div className="flex text-[#c9a227]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#c9a227]" />
                    ))}
                  </div>
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                  {review.service}
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  «{review.comment}»
                </p>
              </div>

              {/* Doctor's personal answer */}
              {review.doctorReply && (
                <div className="pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.02] p-2.5 rounded-xl">
                  <span className="font-bold text-[#c9a227]">پاسخ کلینیک دکتر طائی: </span>
                  {review.doctorReply}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 11. CONSULTATION CTA BANNER */}
      <section className="py-16 bg-[#0f2350] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a227]/20 border border-[#c9a227]/40 text-[#c9a227] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مشاوره و ارزیابی رایگان</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
            برای مشاوره و رزرو نوبت با ما در تماس باشید
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
            پاسخگویی هر روز هفته از ساعت ۹ تا ۱۹. کارشناسان ما مناسب‌ترین زمان و خدمت را متناسب با نیاز شما هماهنگ می‌کنند.
          </p>

          {/* Big Phone Number */}
          <div className="py-2">
            <a
              href="tel:09135115237"
              className="inline-flex items-center gap-3 text-2xl sm:text-3xl md:text-4xl font-black text-[#c9a227] hover:text-[#e0ba3d] font-mono tracking-wider transition-colors"
              dir="ltr"
            >
              <Phone className="w-7 h-7 sm:w-8 sm:h-8" />
              <span>۰۹۱۳۵۱۱۵۲۳۷</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-8 py-4 rounded-full bg-[#c9a227] hover:bg-[#e0ba3d] text-[#0f2350] font-black text-sm shadow-2xl transition-all cursor-pointer"
            >
              فرم درخواست نوبت اینترنتی
            </button>
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all cursor-pointer"
            >
              طرح سوال از دکتر طائی
            </button>
          </div>
        </div>
      </section>

      {/* 12. CLINIC BRANCHES & CONTACT SECTION */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-black tracking-widest text-[#c9a227] uppercase mb-2">
            ۰۶ · شعب کلینیک
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
            شعب کلینیک دکتر سهند طائی
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            شعبه مورد نظر خود را جهت ویزیت حضوری انتخاب نمایید
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Branch 1: Isfahan */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0a1428] border-2 border-[#c9a227]/40 shadow-xl space-y-5 text-right relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#c9a227]/20 text-[#c9a227] text-xs font-bold">
                شعبه اصلی (اصفهان)
              </span>
              <Building className="w-5 h-5 text-[#c9a227]" />
            </div>

            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                مطب خیابان توحید میانی
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                اصفهان، خیابان توحید میانی، کوچه ۲۵ شهیدان کاظمی، مجتمع گلدیس، طبقه پنجم، واحد نوزده (واحد ۱۹)
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/10 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#c9a227]" />
                <span>ساعات حضور: شنبه تا پنجشنبه از ساعت ۹ الی ۱۹</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#c9a227]" />
                <span dir="ltr" className="font-mono font-bold text-gray-900 dark:text-white">۰۹۱۳۵۱۱۵۲۳۷</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setBookingBranch('isfahan');
                  setIsBookingModalOpen(true);
                }}
                className="flex-1 py-3 rounded-xl bg-[#c9a227] hover:bg-[#e0ba3d] text-[#0f2350] font-black text-xs transition-colors cursor-pointer text-center"
              >
                رزرو نوبت در شعبه اصفهان
              </button>
              <a
                href="https://nshn.ir"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white text-xs font-bold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>مسیریابی</span>
              </a>
            </div>
          </div>

          {/* Branch 2: Baharestan */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0a1428] border border-gray-200 dark:border-white/10 shadow-xl space-y-5 text-right relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                شعبه بهارستان
              </span>
              <Building className="w-5 h-5 text-blue-400" />
            </div>

            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                کلینیک بهارستان (مجتمع وستا)
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                اصفهان، شهر بهارستان، خیابان الفت غربی، بین میدان عرفان و میدان ولیعصر، مجتمع وستا (چهارراه فرشته)
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/10 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>ساعات کاری: شنبه تا پنجشنبه از ساعت ۹ الی ۱۳ و ۱۶ الی ۲۰</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span dir="ltr" className="font-mono font-bold text-gray-900 dark:text-white">۰۳۱-۳۶۸۱۴۵۱۰ / ۰۹۲۰۵۱۰۵۲۳۷</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setBookingBranch('baharestan');
                  setIsBookingModalOpen(true);
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-colors cursor-pointer text-center"
              >
                رزرو نوبت در شعبه بهارستان
              </button>
              <a
                href="https://nshn.ir"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white text-xs font-bold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>مسیریابی</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 13. FOOTER */}
      <footer className="w-full bg-[#04070f] text-white border-t border-white/10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-right">
            
            {/* Col 1: Brand & Bio */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 p-1.5 flex items-center justify-center">
                  <img
                    src="https://media.drsahandtaei.com/settings/1000034367.png"
                    alt="دکتر طائی"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="font-black text-base text-white">دکتر سهند طائی</div>
                  <div className="text-xs text-[#c9a227]">متخصص پوست، مو و زیبایی</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                کلینیک پوست، مو و لیزر با مدیریت دکتر سهند طائی، مجهز به آخرین فناوری‌های جوانسازی، کانتورینگ چهره و لیزر موهای زائد در اصفهان.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://instagram.com/dr.taeiclinic"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#c9a227] hover:text-[#0f2350] border border-white/10 flex items-center justify-center text-white/80 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="tel:09135115237"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#c9a227] hover:text-[#0f2350] border border-white/10 flex items-center justify-center text-white/80 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <div className="font-bold text-sm text-[#c9a227]">دسترسی سریع</div>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#hero" className="hover:text-white transition-colors">صفحه اصلی</a></li>
                <li><a href="#about-doctor" className="hover:text-white transition-colors">بیوگرافی و افتخارات</a></li>
                <li><a href="#gallery" className="hover:text-white transition-colors">گالری نتایج واقعی</a></li>
                <li><a href="#videos" className="hover:text-white transition-colors">ویدیوهای تخصصی</a></li>
                <li><button onClick={() => setIsInstallmentModalOpen(true)} className="hover:text-white transition-colors">شرایط اقساطی</button></li>
                <li><button onClick={() => setIsAskModalOpen(true)} className="hover:text-white transition-colors">پرسش و پاسخ پزشکی</button></li>
              </ul>
            </div>

            {/* Col 3: Services */}
            <div className="space-y-3">
              <div className="font-bold text-sm text-[#c9a227]">خدمات کلینیک</div>
              <ul className="space-y-2 text-xs text-gray-400">
                {doctor.detailedServices?.map(s => (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedService(s)}
                      className="hover:text-white transition-colors text-right"
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Contact & Phone Numbers */}
            <div className="space-y-3">
              <div className="font-bold text-sm text-[#c9a227]">شماره‌های تماس</div>
              <div className="space-y-2 text-xs text-gray-400">
                <div>
                  <div className="text-white font-bold">شعبه اصفهان:</div>
                  <a href="tel:09135115237" dir="ltr" className="block text-[#c9a227] font-mono font-bold mt-0.5">
                    ۰۹۱۳۵۱۱۵۲۳۷
                  </a>
                </div>
                <div>
                  <div className="text-white font-bold">شعبه بهارستان:</div>
                  <a href="tel:09205105237" dir="ltr" className="block text-[#c9a227] font-mono font-bold mt-0.5">
                    ۰۹۲۰۵۱۰۵۲۳۷ / ۰۳۱-۳۶۸۱۴۵۱۰
                  </a>
                </div>
                <div className="text-[11px] text-gray-400 pt-1">
                  ساعت کاری: شنبه تا پنجشنبه از ۹ الی ۱۹
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & EEMAWEB Attribution */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div>
              کلیه حقوق مادی و معنوی متعلق به وبسایت رسمی کلینیک دکتر سهند طائی می‌باشد.
            </div>
            <div className="flex items-center gap-1.5">
              <span>طراحی و پیاده‌سازی اختصاصی توسط</span>
              <a
                href="https://eemaweb.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#c9a227] font-bold hover:underline"
              >
                EEMAWEB
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* MODALS */}
      {/* ============================================================ */}

      {/* A. BOOKING WIZARD MODAL (کدام شعبه؟) */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0a1428] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-2xl space-y-6 text-right relative">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  درخواست نوبت شما با موفقیت ثبت شد
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  همکاران ما در کلینیک دکتر طائی جهت هماهنگی نهایی ساعت و ارسال پیامک تأیید با شماره <strong>{bookingPhone}</strong> تماس خواهند گرفت.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    کدام شعبه؟
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    شعبه مورد نظر خود را برای ویزیت حضوری انتخاب نمایید
                  </p>
                </div>

                {/* Branch Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingBranch('isfahan')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      bookingBranch === 'isfahan'
                        ? 'border-[#c9a227] bg-[#c9a227]/10 text-gray-900 dark:text-white font-bold'
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500'
                    }`}
                  >
                    <div className="text-xs font-black">شعبه ۱ (اصفهان)</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">خیابان توحید میانی</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingBranch('baharestan')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                      bookingBranch === 'baharestan'
                        ? 'border-[#c9a227] bg-[#c9a227]/10 text-gray-900 dark:text-white font-bold'
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500'
                    }`}
                  >
                    <div className="text-xs font-black">شعبه ۲ (بهارستان)</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">مجتمع وستا (فرشته)</div>
                  </button>
                </div>

                {/* Service Selection */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 dark:text-gray-300">خدمت درخواستی:</label>
                  <select
                    value={bookingService}
                    onChange={e => setBookingService(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs outline-none"
                  >
                    {doctor.detailedServices?.map(s => (
                      <option key={s.id} value={s.title} className="text-gray-900 bg-white">
                        {s.title}
                      </option>
                    ))}
                    <option value="مشاوره عمومی زیبایی" className="text-gray-900 bg-white">
                      مشاوره عمومی زیبایی
                    </option>
                  </select>
                </div>

                {/* Patient Name */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 dark:text-gray-300">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مریم سعادتی"
                    value={bookingName}
                    onChange={e => setBookingName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs outline-none focus:border-[#c9a227]"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 dark:text-gray-300">شماره موبایل جهت پیامک تأیید:</label>
                  <input
                    type="tel"
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={bookingPhone}
                    onChange={e => setBookingPhone(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs outline-none focus:border-[#c9a227] font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-[#c9a227] hover:bg-[#e0ba3d] text-[#0f2350] font-black text-sm shadow-xl transition-all cursor-pointer mt-4"
                >
                  ثبت نهایی درخواست ویزیت
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* B. SERVICE DETAIL MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-[#0a1428] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-2xl space-y-6 text-right relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#c9a227]/20 text-[#c9a227] text-xs font-bold">
                {selectedService.category || 'خدمات کلینیک'}
              </span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                {selectedService.title}
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {selectedService.description}
            </p>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <span className="text-gray-400">مدت زمان تقریبی:</span>
                <div className="font-bold text-gray-900 dark:text-white mt-1">
                  {selectedService.durationMinutes} دقیقه
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <span className="text-gray-400">مشاوره حضوری:</span>
                <div className="font-bold text-emerald-500 mt-1">
                  رایگان با شخص دکتر
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  setBookingService(selectedService.title);
                  setSelectedService(null);
                  setIsBookingModalOpen(true);
                }}
                className="flex-1 py-3.5 rounded-xl bg-[#c9a227] hover:bg-[#e0ba3d] text-[#0f2350] font-black text-xs shadow-lg transition-all cursor-pointer text-center"
              >
                رزرو نوبت برای این خدمت
              </button>
              <button
                onClick={() => setSelectedService(null)}
                className="px-5 py-3.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white text-xs font-bold transition-all cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. INSTALLMENT TERMS MODAL (شرایط اقساطی) */}
      {isInstallmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0a1428] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-2xl space-y-6 text-right relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsInstallmentModalOpen(false)}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#c9a227]/20 text-[#c9a227] text-xs font-bold">
                تسهیلات ویژه
              </span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                شرایط و تعرفه‌های پرداخت اقساطی خدمات زیبایی
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>با سلام و احترام و آرزوی لحظاتی خوش برای شما مراجعین محترم؛</strong>
              </p>
              <p>
                به اطلاع می‌رساند به منظور رفاه حال شما عزیزان و با توجه به ایجاد امکانات جدید، شرایط پرداخت اقساطی برای خدمات کلینیک فراهم گردیده است.
              </p>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                <div className="font-bold text-[#c9a227] text-sm">جزئیات و شرایط خدمات اقساطی:</div>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>محدوده مبلغ تسهیلات:</strong> شامل پرداخت‌های مابین ۳۰ میلیون تا ۱۰۰ میلیون تومان.</li>
                  <li><strong>مدت زمان بازپرداخت:</strong> از ۴ ماه الی ۱۲ ماه (انجام مراحل اداری و بانکی از طریق شرکت واسطه تأمین مالی).</li>
                  <li><strong>نحوه اقدام:</strong> پس از برآورد دقیق هزینه‌ها و معرفی مراجع به شرکت مربوطه، اعتبار وام فعال شده و فرآیند درمان یا پروسیجر زیبایی شما آغاز می‌گردد.</li>
                  <li><strong>پوشش خدمات سالانه:</strong> این شرایط برای افرادی که حداقل هزینه پروسیجر درمانی و زیبایی آن‌ها از ۲۰ میلیون تومان شروع شود تعلق می‌گیرد و شما می‌توانید تمامی خدمات زیبایی مورد نیاز خود در طول سال را در قالب این طرح پوشش دهید.</li>
                  <li><strong>مشاوره تخصصی:</strong> خدمات مشاوره حضوری پیش از انجام هرگونه تزریق، به‌منظور بررسی آناتومی و تحلیل دقیق صورت شما توسط شخص جناب دکتر رایگان می‌باشد.</li>
                </ul>
              </div>

              <p className="font-bold text-gray-900 dark:text-white">
                جهت بررسی جزئیات بیشتر، دریافت مشاوره و اطلاع از قیمت دقیق خدمات، با شماره‌های زیر در ارتباط باشید:
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href="tel:09135115237"
                  className="p-3 rounded-xl bg-[#c9a227]/15 border border-[#c9a227]/40 text-center font-mono font-bold text-[#c9a227]"
                  dir="ltr"
                >
                  ۰۹۱۳۵۱۱۵۲۳۷
                </a>
                <a
                  href="tel:09205105237"
                  className="p-3 rounded-xl bg-[#c9a227]/15 border border-[#c9a227]/40 text-center font-mono font-bold text-[#c9a227]"
                  dir="ltr"
                >
                  ۰۹۲۰۵۱۰۵۲۳۷
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsInstallmentModalOpen(false);
                  setIsBookingModalOpen(true);
                }}
                className="w-full py-4 rounded-xl bg-[#c9a227] hover:bg-[#e0ba3d] text-[#0f2350] font-black text-sm shadow-xl transition-all cursor-pointer"
              >
                رزرو نوبت مشاوره اقساطی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D. ASK QUESTION MODAL */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0a1428] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-2xl space-y-6 text-right relative">
            <button
              onClick={() => {
                setIsAskModalOpen(false);
                setQuestionTrackingCode(null);
              }}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {questionTrackingCode ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  سوال شما با موفقیت ارسال شد
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  کد رهگیری اختصاصی سوال شما:
                </p>
                <div className="text-2xl font-black font-mono text-[#c9a227] tracking-widest bg-gray-100 dark:bg-white/5 p-3 rounded-2xl border border-[#c9a227]/40">
                  {questionTrackingCode}
                </div>
                <p className="text-[11px] text-gray-400">
                  پاسخ دکتر طائی ظرف حداکثر ۲۴ ساعت کاری به صورت پیامک برای شما ارسال خواهد شد.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    پرسش مستقیم از دکتر طائی
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    سوالات پزشکی خود در زمینه پوست، مو، لیزر و جراحی‌های زیبایی را مطرح نمایید
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 dark:text-gray-300">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سارا محمدی"
                    value={questionName}
                    onChange={e => setQuestionName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 dark:text-gray-300">شماره موبایل جهت دریافت پاسخ:</label>
                  <input
                    type="tel"
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={questionPhone}
                    onChange={e => setQuestionPhone(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 dark:text-gray-300">متن پرسش:</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="سوال خود را با جزئیات بنویسید..."
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-[#c9a227] hover:bg-[#e0ba3d] text-[#0f2350] font-black text-sm shadow-xl transition-all cursor-pointer"
                >
                  ارسال سوال به دکتر طائی
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* E. NEW REVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0a1428] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-2xl space-y-6 text-right relative">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {reviewSubmitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  سپاس از نظر ارزشمند شما!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  دیدگاه شما پس از تأیید در سایت نمایش داده خواهد شد.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    ثبت دیدگاه پیرامون خدمات دکتر طائی
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    تجربه خود را با سایر مراجعین به اشتراک بگذارید
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 dark:text-gray-300">نام شما:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الهام کریمی"
                    value={newReviewAuthor}
                    onChange={e => setNewReviewAuthor(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 dark:text-gray-300">خدمتی که دریافت نموده‌اید:</label>
                  <select
                    value={newReviewService}
                    onChange={e => setNewReviewService(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs outline-none"
                  >
                    <option value="تزریق فول‌فیس و کانتورینگ" className="text-gray-900 bg-white">تزریق فول‌فیس و کانتورینگ</option>
                    <option value="بلفاروپلاستی پلک" className="text-gray-900 bg-white">بلفاروپلاستی پلک</option>
                    <option value="تزریق بوتاکس" className="text-gray-900 bg-white">تزریق بوتاکس</option>
                    <option value="لیزر موهای زائد" className="text-gray-900 bg-white">لیزر موهای زائد</option>
                    <option value="کاهش وزن و لاغری" className="text-gray-900 bg-white">کاهش وزن و لاغری</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 dark:text-gray-300">امتیاز شما:</label>
                  <div className="flex gap-2 text-[#c9a227]">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${star <= newReviewRating ? 'fill-[#c9a227]' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 dark:text-gray-300">متن نظر:</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="نظرتان را درباره کیفیت درمان، برخورد پرسنل و نتیجه بیان فرمایید..."
                    value={newReviewComment}
                    onChange={e => setNewReviewComment(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-[#c9a227] hover:bg-[#e0ba3d] text-[#0f2350] font-black text-sm shadow-xl transition-all cursor-pointer"
                >
                  ثبت نظر
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* F. SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-[#0a1428] rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl space-y-4 text-right relative">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="جستجو در خدمات، جراحی‌ها، بوتاکس، لیزر..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white"
              />
            </div>

            {searchQuery && (
              <div className="max-h-60 overflow-y-auto space-y-2 pt-2">
                {searchResults.length > 0 ? (
                  searchResults.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedService(s);
                        setIsSearchOpen(false);
                      }}
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-right flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{s.title}</div>
                        <div className="text-gray-400 text-[10px] truncate max-w-md">{s.description}</div>
                      </div>
                      <ArrowUpLeft className="w-4 h-4 text-[#c9a227]" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-gray-400">
                    موردی یافت نشد.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
