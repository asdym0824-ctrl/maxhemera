import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  LocateFixed, 
  Building2, 
  Calendar, 
  Clock, 
  Phone, 
  ExternalLink, 
  Sparkles,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { ClinicBranch, Doctor } from '../../types';
import { apiService, calculateDistanceKm } from '../../services/apiService';
import { NearestBranchModal } from './NearestBranchModal';
import { InPersonBookingModal } from './InPersonBookingModal';

interface Props {
  doctors: Doctor[];
  onExploreBranches?: () => void;
}

export const NearestBranchBanner: React.FC<Props> = ({ doctors, onExploreBranches }) => {
  const [branches, setBranches] = useState<ClinicBranch[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestBranch, setNearestBranch] = useState<(ClinicBranch & { distanceKm: number }) | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    apiService.getBranches().then(list => {
      setBranches(list);
      // Auto-detect or default to central Saadat Abad
      calculateNearest(list, { lat: 35.7832, lng: 51.3745 });
    });

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          if (branches.length > 0) {
            calculateNearest(branches, loc);
          }
        },
        () => {
          // fallback
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const calculateNearest = (list: ClinicBranch[], loc: { lat: number; lng: number }) => {
    if (!list || list.length === 0) return;
    const withDist = list.map(b => {
      const bLat = b.coordinates?.lat || 35.7832;
      const bLng = b.coordinates?.lng || 51.3745;
      return {
        ...b,
        distanceKm: calculateDistanceKm(loc.lat, loc.lng, bLat, bLng)
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    setNearestBranch(withDist[0]);
  };

  const branch = nearestBranch || (branches[0] ? { ...branches[0], distanceKm: 2.4 } : null);
  if (!branch) return null;

  const lat = branch.coordinates?.lat || 35.7832;
  const lng = branch.coordinates?.lng || 51.3745;
  const neshanUrl = `https://neshan.org/maps/@${lat},${lng},17z`;
  const baladUrl = `https://balad.ir/location?latitude=${lat}&longitude=${lng}`;

  return (
    <>
      <div className="relative rounded-3xl bg-gradient-to-l from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-600/30 overflow-hidden" dir="rtl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Text Info */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white flex items-center gap-1.5 shadow-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>مراجعه حضوری به نزدیک‌ترین شعبه</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>پذیرش فعال و فوری امروز</span>
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                نزدیک‌ترین همرا کلینیک به شما: {branch.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {branch.address} ({branch.floorAndUnit || 'واحد پذیرش'}) • فاصله تخمینی: <span className="font-bold text-blue-300">{branch.distanceKm} کیلومتر</span>
              </p>
            </div>

            {/* Micro Details */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1 text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                <span>{branch.workingHours}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{branch.parkingInfo || 'دارای پارکینگ مراجعین'}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-300 font-bold">
                <Phone className="w-3.5 h-3.5" />
                <span dir="ltr">{branch.phone}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto lg:w-72">
            <button
              onClick={() => setShowBookingModal(true)}
              className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>دریافت نوبت حضوری در این شعبه</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={neshanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <span>مسیریابی نشان</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={baladUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <span>مسیریابی بلد</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <button
              onClick={() => {
                if (onExploreBranches) {
                  onExploreBranches();
                } else {
                  setShowAllModal(true);
                }
              }}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>مشاهده و بررسی همه شعب ({branches.length || 5} شعبه)</span>
              <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NearestBranchModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        doctors={doctors}
      />

      <InPersonBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        branch={branch}
        doctors={doctors}
      />
    </>
  );
};
