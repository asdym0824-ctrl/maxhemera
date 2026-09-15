import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Calendar, 
  LocateFixed, 
  CheckCircle2, 
  ExternalLink, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Car, 
  Train, 
  Users, 
  Ticket, 
  Layers
} from 'lucide-react';
import { ClinicBranch, Doctor } from '../types';
import { apiService, calculateDistanceKm } from '../services/apiService';
import { InPersonBookingModal } from '../components/branches/InPersonBookingModal';
import { NearestBranchBanner } from '../components/branches/NearestBranchBanner';

interface Props {
  doctors: Doctor[];
}

export const BranchesPage: React.FC<Props> = ({ doctors }) => {
  const [branches, setBranches] = useState<ClinicBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [bookingBranch, setBookingBranch] = useState<ClinicBranch | null>(null);

  useEffect(() => {
    document.title = 'شعب و مراکز درمانی همرا کلینیک | مراجعه حضوری و نزدیک‌ترین شعبه';
    apiService.getBranches().then(list => {
      setBranches(list);
      setLoading(false);
    });

    // Gentle GPS detection
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setUserLocation({ lat: 35.7500, lng: 51.3800 });
        },
        { timeout: 6000 }
      );
    }
  }, []);

  const handleLocateMe = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setUserLocation({ lat: 35.7500, lng: 51.3800 });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const branchesWithDistance = branches.map(b => {
    const bLat = b.coordinates?.lat || 35.7832;
    const bLng = b.coordinates?.lng || 51.3745;
    const uLat = userLocation?.lat || 35.7500;
    const uLng = userLocation?.lng || 51.3800;
    const dist = calculateDistanceKm(uLat, uLng, bLat, bLng);
    return {
      ...b,
      distanceKm: dist
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const departmentsList = [
    'all',
    'قلب و عروق',
    'ارتوپدی',
    'پوست و لیزر',
    'اطفال و نوزادان',
    'گوارش و آندوسکوپی',
    'زنان و زایمان',
    'پزشک عمومی'
  ];

  const filteredBranches = branchesWithDistance.filter(b => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.district && b.district.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFacility = 
      selectedFacility === 'all' || 
      (selectedFacility === 'parking' && b.parkingInfo) ||
      (selectedFacility === 'metro' && b.metroAccess) ||
      (selectedFacility === 'main' && b.isMain);

    const matchesDept = 
      selectedDepartment === 'all' ||
      (b.departments && b.departments.some(d => d.includes(selectedDepartment)));

    return matchesSearch && matchesFacility && matchesDept;
  });

  const getNavigationUrls = (b: ClinicBranch) => {
    const lat = b.coordinates?.lat || 35.7832;
    const lng = b.coordinates?.lng || 51.3745;
    return {
      neshan: `https://neshan.org/maps/@${lat},${lng},17z`,
      balad: `https://balad.ir/location?latitude=${lat}&longitude=${lng}`,
      google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    };
  };

  return (
    <div className="space-y-8 pb-16" dir="rtl">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-slate-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-600/20 text-blue-300 border border-blue-600/30">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>شبکه شعب یکپارچه سلامت همرا کلینیک</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            مراجعه حضوری به نزدیک‌ترین شعبه همرا کلینیک
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            با استفاده از موقعیت مکانی هوشمند، نزدیک‌ترین مرکز درمانی را بیابید، زمان معطلی صف را به صورت زنده مشاهده کنید و با برنامه‌های نشان، بلد یا گوگل مپ تا درب کلینیک مسیریابی فرمایید.
          </p>

          {/* Quick GPS button */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={handleLocateMe}
              disabled={locating}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-400 text-slate-950 font-black transition-all shadow-md cursor-pointer"
            >
              <LocateFixed className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'در حال برقراری ارتباط با GPS...' : 'یافتن خودکار نزدیک‌ترین شعبه به من'}</span>
            </button>

            {userLocation && (
              <span className="text-emerald-300 font-bold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>موقعیت مکانی شما شناسایی شد</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Spotlight: Nearest Branch with Instant Routing & Booking */}
      <NearestBranchBanner 
        doctors={doctors}
        onExploreBranches={() => {
          const el = document.getElementById('all-branches-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="جستجوی منطقه یا نام شعبه (مثلاً سعادت‌آباد، ونک، صادقیه...)"
              className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-hidden"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-hidden bg-white"
            >
              <option value="all">همه دپارتمان‌ها و تخصص‌ها</option>
              {departmentsList.slice(1).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Facility Filter */}
          <div className="relative">
            <select
              value={selectedFacility}
              onChange={e => setSelectedFacility(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-hidden bg-white"
            >
              <option value="all">همه امکانات و دسترسی‌ها</option>
              <option value="parking">دارای پارکینگ اختصاصی مراجعین</option>
              <option value="metro">دسترسی سریع به مترو و BRT</option>
              <option value="main">شعبه مرکزی و شبانه‌روزی</option>
            </select>
          </div>
        </div>
      </div>

      {/* Branches List */}
      <div id="all-branches-section" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>لیست شعب فعال همرا کلینیک</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            مرتب‌شده بر اساس نزدیک‌ترین فاصله به شما
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBranches.map((branch, idx) => {
            const nav = getNavigationUrls(branch);
            const isClosest = idx === 0;

            return (
              <div
                key={branch.id}
                className={`rounded-3xl bg-white border ${
                  isClosest ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200/90'
                } shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between`}
              >
                {/* Branch Top Image / Banner */}
                {branch.image && (
                  <div className="relative h-44 w-full overflow-hidden">
                    <img 
                      src={branch.image} 
                      alt={branch.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {isClosest && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-slate-950 flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>نزدیک‌ترین شعبه</span>
                        </span>
                      )}
                      {branch.isMain && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950">
                          شعبه مرکزی
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                      <span className="font-bold text-sm text-white drop-shadow-sm">{branch.district}</span>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-xs font-bold text-blue-300 border border-white/20">
                        {branch.distanceKm} کیلومتر فاصله
                      </span>
                    </div>
                  </div>
                )}

                {/* Branch Body Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">{branch.name}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">{branch.floorAndUnit}</div>
                    </div>

                    {/* Address & Hours */}
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-medium text-slate-800">{branch.address}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-medium text-slate-700">{branch.workingHours}</span>
                      </div>

                      <div className="flex items-center gap-2 text-blue-700 font-bold">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>پذیرش مستقیم:</span>
                        <a href={`tel:${branch.phone.replace(/[^0-9]/g, '')}`} className="font-mono text-slate-900 hover:text-blue-600" dir="ltr">
                          {branch.phone}
                        </a>
                      </div>

                      {branch.metroAccess && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Train className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>{branch.metroAccess}</span>
                        </div>
                      )}

                      {branch.parkingInfo && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Car className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{branch.parkingInfo}</span>
                        </div>
                      )}
                    </div>

                    {/* Departments list tags */}
                    {branch.departments && branch.departments.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 block">دپارتمان‌های فعال این شعبه:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {branch.departments.map((dept, dIdx) => (
                            <span key={dIdx} className="px-2.5 py-1 rounded-xl bg-slate-50 text-slate-700 border border-slate-200/60 text-[11px] font-medium">
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {branch.note && (
                      <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                        💡 {branch.note}
                      </div>
                    )}
                  </div>

                  {/* Actions Box */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <button
                      onClick={() => setBookingBranch(branch)}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>ثبت نوبت مراجعه حضوری در {branch.name}</span>
                    </button>

                    {/* Map Navigation Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={nav.neshan}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-colors"
                      >
                        <span>مسیریابی با نشان</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={nav.balad}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors"
                      >
                        <span>مسیریابی با بلد</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={nav.google}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-colors"
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* In-Person Booking Modal */}
      <InPersonBookingModal
        isOpen={!!bookingBranch}
        onClose={() => setBookingBranch(null)}
        branch={bookingBranch}
        doctors={doctors}
      />
    </div>
  );
};
