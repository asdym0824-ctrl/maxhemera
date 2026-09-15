import React from 'react';
import { motion } from 'motion/react';
import minimalMedicalIcon from '../../assets/images/minimal_medical_icon_1789469634951.jpg';

interface MedicalLoadingIndicatorProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export const MedicalLoadingIndicator: React.FC<MedicalLoadingIndicatorProps> = ({
  message = 'همرا کلینیک',
  subMessage = 'در حال برقراری ارتباط با سامانه سلامت...',
  fullScreen = true
}) => {
  const content = (
    <div 
      className="flex flex-col items-center justify-center select-none"
      dir="rtl"
      id="medical-minimal-loading"
    >
      {/* Central Medical Object Container */}
      <div className="relative flex items-center justify-center mb-6">
        
        {/* Subtle Ambient Light-Blue Glow Halo */}
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.35, 0.65, 0.35]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-sky-200/50 via-blue-100/40 to-cyan-200/50 blur-2xl pointer-events-none"
        />

        {/* Outer Precision Pulse Ring */}
        <motion.div
          animate={{
            scale: [0.95, 1.1, 0.95],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-sky-300/40 pointer-events-none"
        />

        {/* Rotating Subtle Tech Scanner Arc */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-dashed border-sky-400/30 pointer-events-none"
        />

        {/* Central 3D Minimal Medical Object (Stethoscope & Medical Cross) */}
        <motion.div
          animate={{
            y: [-4, 4, -4],
            scale: [0.99, 1.01, 0.99]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-1.5 shadow-xl shadow-sky-900/5 border border-sky-100/80 flex items-center justify-center overflow-hidden"
        >
          <img
            src={minimalMedicalIcon}
            alt="نماد پزشکی و سلامت همرا"
            className="w-full h-full object-cover rounded-2xl"
            referrerPolicy="no-referrer"
          />

          {/* Minimal Glass Sheen Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
        </motion.div>

        {/* Small Floating Precision Heartbeat Node */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1 -right-1 z-20 w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-md flex items-center justify-center"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        </motion.div>
      </div>

      {/* Minimal Medical ECG Heartbeat Pulse Line */}
      <div className="relative w-40 sm:w-48 h-6 mb-4 flex items-center justify-center overflow-hidden">
        {/* Static Base Guide Line */}
        <div className="absolute inset-x-0 h-[1.5px] bg-sky-100 rounded-full" />

        {/* Dynamic Animated Pulse Wave SVG */}
        <svg 
          viewBox="0 0 160 24" 
          className="w-full h-full text-sky-500 overflow-visible"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Animated Heartbeat Path */}
          <motion.path
            d="M 0 12 L 45 12 L 52 4 L 58 20 L 65 2 L 72 17 L 78 12 L 160 12"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1, 0],
              opacity: [0, 1, 1, 0],
              pathOffset: [0, 0, 1, 1]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
      </div>

      {/* Minimal, Refined Typography */}
      <div className="text-center space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
          {message}
        </h3>
        {subMessage && (
          <p className="text-xs text-sky-700/80 font-medium">
            {subMessage}
          </p>
        )}
      </div>

      {/* Minimal Clinical Progress Bar */}
      <div className="w-28 sm:w-32 h-1 bg-sky-100 rounded-full mt-4 overflow-hidden">
        <motion.div
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-1/2 h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
        />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        id="medical-fullscreen-loader"
        className="fixed inset-0 z-50 bg-slate-50/90 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300"
      >
        <div className="bg-white/95 border border-sky-100 shadow-xl shadow-sky-900/5 rounded-3xl p-8 sm:p-10 max-w-sm w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
