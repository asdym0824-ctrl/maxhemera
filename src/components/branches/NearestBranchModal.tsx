import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Car, 
  LocateFixed, 
  Compass, 
  CheckCircle2, 
  ExternalLink, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  ChevronLeft,
  Sparkles,
  Search,
  Filter,
  Layers
} from 'lucide-react';
import { ClinicBranch, Doctor } from '../../types';
import { apiService, calculateDistanceKm } from '../../services/apiService';
import { InPersonBookingModal } from './InPersonBookingModal';
import { ModalPortal } from '../common/ModalPortal';
import { MODAL_Z_INDEX } from '../../utils/modalManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onSelectBranch?: (branch: ClinicBranch) => void;
}

export const NearestBranchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  doctors,
  onSelectBranch
}) => {
  const [branches, setBranches] = useState<ClinicBranch[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('همه مناطق تهران');
  const [bookingBranch, setBookingBranch] = useState<ClinicBranch | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      apiService.getBranches().then(list => {
        setBranches(list);
        if (list.length > 0 && !selectedBranchId) {
          setSelectedBranchId(list[0].id);
        }
      });
      // Try to auto detect GPS location gently
      detectUserGpsLocation(false);
    }
  }, [isOpen]);

  const detectUserGpsLocation = (showErrors = true) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      if (showErrors) setLocationError('مرورگر شما از قابلیت مکان‌یابی پشتیبانی نمی‌کند.');
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocating(false);
      },
      err => {
        setLocating(false);
        // Default to Tehran center if user denies or on dev container
        setUserLocation({ lat: 35.7219, lng: 51.3347 });
        if (showErrors) {
          setLocationError('دسترسی به GPS برقرار نشد؛ موقعیت تقریبی در مرکز تهران محاسبه شد.');
        }
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  if (!isOpen) return null;

  // Calculate distance for all branches
  const branchesWithDistance = branches.map(b => {
    const bLat = b.coordinates?.lat || 35.7832;
    const bLng = b.coordinates?.lng || 51.3745;
    const userLat = userLocation?.lat || 35.7500;
    const userLng = userLocation?.lng || 51.3800;
    const dist = calculateDistanceKm(userLat, userLng, bLat, bLng);
    return {
      ...b,
      distanceKm: dist
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const nearestBranch = branchesWithDistance[0];
  const activeBranch = branchesWithDistance.find(b => b.id === selectedBranchId) || nearestBranch;

  const neighborhoods = [
    'همه مناطق تهران',
    'سعادت‌آباد و شهرک غرب',
    'ونک و ملاصدرا',
    'پاسداران و هروی',
    'صادقیه و غرب',
    'پیروزی و شرق'
  ];

  const filteredBranches = branchesWithDistance.filter(b => {
    if (selectedNeighborhood === 'همه مناطق تهران') return true;
    if (selectedNeighborhood.includes('سعادت') && b.district?.includes('سعادت')) return true;
    if (selectedNeighborhood.includes('ونک') && b.district?.includes('ونک')) return true;
    if (selectedNeighborhood.includes('پاسداران') && b.district?.includes('پاسداران')) return true;
    if (selectedNeighborhood.includes('صادقیه') && b.district?.includes('صادقیه')) return true;
    if (selectedNeighborhood.includes('پیروزی') && b.district?.includes('پیروزی')) return true;
    return true;
  });

  const getNavigationLinks = (branch: ClinicBranch) => {
    const lat = branch.coordinates?.lat || 35.7832;
    const lng = branch.coordinates?.lng || 51.3745;
    return {
      neshan: `https://neshan.org/maps/@${lat},${lng},17z`,
      balad: `https://balad.ir/location?latitude=${lat}&longitude=${lng}`,
      google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    };
  };

  return (
    <>
      <ModalPortal isOpen={isOpen} onClose={onClose} zIndexClass={MODAL_Z_INDEX.BASE_MODAL}>
        <div 
          className="fixed inset-0 min-h-[100dvh] w-screen flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200" 
          dir="rtl"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="nearest-branch-modal-title"
        >
          <div 
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] text-slate-800 my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-600/30 flex items-center justify-center font-bold">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 id="nearest-branch-modal-title" className="text-lg sm:text-xl font-black">مراجعه حضوری به شعب همرا کلینیک</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600/20 text-blue-300 border border-blue-600/30">
                      ۵ شعبه فعال
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    شناسایی نزدیک‌ترین مرکز درمانی با قابلیت مسیریابی هوشمند (نشان/بلد/گوگل مپ) و نوبت‌دهی حضوری
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="بستن پنجره"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subheader / GPS Controls */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => detectUserGpsLocation(true)}
                  disabled={locating}
                  className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                  <span>{locating ? 'در حال دریافت موقعیت شما...' : 'یافتن با GPS خودکار'}</span>
                </button>

                {userLocation && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>موقعیت مکانی شما فعال است</span>
                  </span>
                )}
              </div>

              {/* Neighborhood select */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">فیلتر منطقه:</span>
                <select
                  value={selectedNeighborhood}
                  onChange={e => setSelectedNeighborhood(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {neighborhoods.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {locationError && (
              <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-6 shrink-0">
                ⚠️ {locationError}
              </div>
            )}

            {/* Body Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
              
              {/* Highlight Nearest Branch Card */}
              {nearestBranch && (
                <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-blue-800 relative overflow-hidden">
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500 text-slate-950 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        نزدیک‌ترین شعبه به شما
                      </span>
                      <span className="text-xs font-bold text-blue-200">
                        فاصله تقریبی: حدود {nearestBranch.distanceKm.toFixed(1)} کیلومتر
                      </span>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 bg-white/10 rounded-xl">
                      {nearestBranch.district}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <h4 className="text-xl font-black text-white">{nearestBranch.name}</h4>
                      <p className="text-xs text-blue-100 mt-1 flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{nearestBranch.address}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-blue-200">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-blue-400" />
                          <span dir="ltr">{nearestBranch.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>{nearestBranch.workingHours || '۸:۰۰ الی ۲۱:۰۰'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 md:justify-end">
                      <button
                        onClick={() => setBookingBranch(nearestBranch)}
                        className="py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>ثبت نوبت حضوری در این شعبه</span>
                      </button>

                      <div className="flex gap-1.5">
                        <a
                          href={getNavigationLinks(nearestBranch).neshan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial py-3 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                          title="مسیریابی با نشان"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>نشان</span>
                        </a>
                        <a
                          href={getNavigationLinks(nearestBranch).balad}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial py-3 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                          title="مسیریابی با بلد"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>بلد</span>
                        </a>
                        <a
                          href={getNavigationLinks(nearestBranch).google}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial py-3 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                          title="گوگل مپ"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>گوگل مپ</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* All Branches Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>فهرست کامل شعب درمانی همرا کلینیک ({filteredBranches.length} شعبه)</span>
                  </h4>
                  <span className="text-xs text-slate-500">مرتب‌سازی بر اساس فاصله</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredBranches.map(branch => {
                    const links = getNavigationLinks(branch);
                    const isSelected = branch.id === nearestBranch?.id;

                    return (
                      <div 
                        key={branch.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900 text-sm">{branch.name}</h5>
                                {isSelected && (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold">
                                    نزدیک‌ترین
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 font-medium">{branch.district}</span>
                            </div>

                            <span className="text-xs font-extrabold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg">
                              {branch.distanceKm.toFixed(1)} کیلومتر
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{branch.address}</span>
                          </p>

                          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span dir="ltr">{branch.phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{branch.workingHours || '۸ الی ۲۱'}</span>
                            </div>
                          </div>

                          {/* Facilities tags */}
                          {branch.facilities && branch.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {branch.facilities.slice(0, 3).map((f, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-medium">
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* CTAs */}
                        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2 mt-2">
                          <button
                            onClick={() => setBookingBranch(branch)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>نوبت‌دهی این شعبه</span>
                          </button>

                          <a
                            href={links.neshan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5 text-slate-500" />
                            <span>مسیریابی نشان/مپ</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer Note */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 shrink-0">
              تمامی شعب همرا کلینیک مجهز به سیستم نوبت‌دهی یکپارچه، تریاژ فوری و پرونده الکترونیک مرکزی می‌باشند.
            </div>
          </div>
        </div>
      </ModalPortal>

      {/* In-Person Booking Modal (Nested Modal Layer) */}
      <InPersonBookingModal
        isOpen={!!bookingBranch}
        onClose={() => setBookingBranch(null)}
        branch={bookingBranch}
        doctors={doctors}
      />
    </>
  );
};
