import React from 'react';

interface MedicalPulseDividerProps {
  className?: string;
  label?: string;
  variant?: 'subtle' | 'gradient' | 'cardiac';
}

export const MedicalPulseDivider: React.FC<MedicalPulseDividerProps> = ({
  className = '',
  label,
  variant = 'cardiac'
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center my-6 sm:my-10 w-full select-none overflow-hidden ${className}`}
      dir="rtl"
    >
      {/* Right Gradient Line */}
      <div className="flex-1 h-[1px] bg-gradient-to-l from-sky-400/40 via-sky-200/50 to-transparent" />

      {/* Center Medical ECG Pulse Emblem */}
      <div className="relative flex items-center gap-2 px-3 sm:px-4 shrink-0">
        
        {/* Subtle Ambient Pulse Glow */}
        <div className="absolute inset-0 bg-sky-400/10 blur-md rounded-full pointer-events-none" />

        {/* Left Swiss Cross Accent */}
        <span className="text-[10px] text-sky-400/60 font-mono select-none">+</span>

        {/* ECG Heartbeat Path SVG */}
        <div className="relative w-16 sm:w-24 h-5 flex items-center justify-center">
          <svg
            viewBox="0 0 100 20"
            className="w-full h-full text-sky-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M 0 10 L 25 10 L 32 3 L 38 17 L 45 1 L 52 14 L 57 10 L 100 10"
              className="opacity-75"
            />
          </svg>

          {/* Glowing Pulse Node */}
          <div className="absolute right-[45%] top-[8px] w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping opacity-60" />
          <div className="absolute right-[45%] top-[8px] w-1.5 h-1.5 rounded-full bg-sky-500 shadow-xs shadow-sky-400" />
        </div>

        {/* Optional Label */}
        {label && (
          <span className="text-[11px] font-bold text-sky-800/80 bg-sky-50/90 border border-sky-200/70 px-2.5 py-0.5 rounded-full shadow-2xs">
            {label}
          </span>
        )}

        {/* Right Swiss Cross Accent */}
        <span className="text-[10px] text-sky-400/60 font-mono select-none">+</span>
      </div>

      {/* Left Gradient Line */}
      <div className="flex-1 h-[1px] bg-gradient-to-r from-sky-400/40 via-sky-200/50 to-transparent" />
    </div>
  );
};
