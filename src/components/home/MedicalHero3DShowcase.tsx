import React from 'react';
import { motion } from 'motion/react';
import { Activity, Sparkles, Stethoscope, Heart, Calendar, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import medicalDoctorImg from '../../assets/images/medical_3d_doctor_1789467835416.jpg';
import medicalStethImg from '../../assets/images/medical_3d_steth_1789467857911.jpg';
import { useNavigate } from 'react-router-dom';

interface MedicalHero3DShowcaseProps {
  onOpenConsultation?: () => void;
  onOpenBooking?: () => void;
}

export const MedicalHero3DShowcase: React.FC<MedicalHero3DShowcaseProps> = ({
  onOpenConsultation,
  onOpenBooking
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-4xl mx-auto my-2 select-none" dir="rtl">
      {/* Container with Glassmorphism and Medical Atmosphere */}
      <div className="relative bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-blue-500/30 rounded-3xl p-3.5 sm:p-5 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Glow Highlights */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          
          {/* Right Side: 3D Doctor Character with Floating Medical Widgets */}
          <div className="flex items-center gap-3.5 sm:gap-5 w-full md:w-auto">
            {/* 3D Character Avatar with Pulse Aura */}
            <div className="relative shrink-0">
              {/* Outer Pulse Glow */}
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-2.5 rounded-3xl bg-gradient-to-tr from-blue-500 to-cyan-400 blur-md pointer-events-none"
              />

              {/* 3D Doctor Frame */}
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-lg shadow-blue-500/30 bg-slate-950"
              >
                <img
                  src={medicalDoctorImg}
                  alt="دستیار پزشک ۳ بعدی همرا کلینیک"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Online Status Dot */}
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-slate-900/85 px-1.5 py-0.5 rounded-full border border-emerald-500/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-bold text-emerald-300">آنلاین</span>
                </div>
              </motion.div>

              {/* 3D Stethoscope Mini Overlay Badge */}
              <motion.div
                animate={{ rotate: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-2 -left-2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-white shadow-md bg-white cursor-pointer hover:scale-110 transition-transform"
                title="تجهیزات پزشکی تشخیصی"
              >
                <img
                  src={medicalStethImg}
                  alt="گوشی پزشکی و پایش سلامت ۳ بعدی"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>

            {/* Doctor Info & Vibe */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold">
                  <Stethoscope className="w-3 h-3 text-cyan-300" />
                  <span>کلینیک تخصصی و فوق‌تخصصی همرا</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold bg-amber-500/10 border border-amber-400/30 px-1.5 py-0.5 rounded-md">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>پزشکی هوشمند</span>
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
                <span>همراه درمان شما در تمام مراحل سلامت</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </h2>

              <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed">
                از تشخیص اولیه و مشاوره آنلاین تا نوبت‌دهی فوری با تجهیزات روز پزشکی و پوشش کامل بیمه‌ها.
              </p>
            </div>
          </div>

          {/* Left Side: Real-time Medical Stat Pills & Fast CTA */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/60">
            
            {/* Live Health Monitor Chip */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs text-slate-200 shadow-2xs">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Heart className="w-3.5 h-3.5 fill-rose-400/30" />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-medium">پایش سلامت</div>
                <div className="text-[11px] font-bold text-white flex items-center gap-1">
                  <span>ضربان نرمال</span>
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Quick Consultation / Book Button */}
            <button
              onClick={() => {
                if (onOpenBooking) {
                  onOpenBooking();
                } else {
                  navigate('/doctors');
                }
              }}
              className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>نوبت فوری پزشک</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
