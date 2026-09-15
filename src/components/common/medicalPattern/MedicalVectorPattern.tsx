import React from 'react';

interface MedicalVectorPatternProps {
  className?: string;
  opacity?: number; // 0.01 to 0.2
  variant?: 'light' | 'dark' | 'colored';
  patternId?: string;
}

export const MedicalVectorPattern: React.FC<MedicalVectorPatternProps> = ({
  className = '',
  opacity = 0.045,
  variant = 'dark',
  patternId = 'med-pattern-base'
}) => {
  const strokeColor = 
    variant === 'light' 
      ? '#ffffff' 
      : variant === 'colored' 
        ? '#0284c7' 
        : '#0f172a';

  return (
    <div 
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{ opacity }}
      >
        <defs>
          <pattern
            id={patternId}
            width="220"
            height="220"
            patternUnits="userSpaceOnUse"
          >
            {/* ======================================================== */}
            {/* 1. STETHOSCOPE (گوشی پزشکی) - Top Left (35, 35) */}
            {/* ======================================================== */}
            <g transform="translate(20, 15) scale(0.9)" stroke={strokeColor} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Headset & Eartubes */}
              <path d="M 12 10 L 12 18 C 12 28, 28 28, 28 18 L 28 10" />
              <circle cx="12" cy="8" r="2" fill={strokeColor} />
              <circle cx="28" cy="8" r="2" fill={strokeColor} />
              {/* Center Tube */}
              <path d="M 20 28 L 20 38 C 20 48, 38 48, 38 38 L 38 32" />
              {/* Chestpiece / Bell */}
              <circle cx="38" cy="28" r="5" />
              <circle cx="38" cy="28" r="2" fill={strokeColor} />
            </g>

            {/* ======================================================== */}
            {/* 2. MEDICAL CROSS (صلیب بالینی) - Top Right (140, 25) */}
            {/* ======================================================== */}
            <g transform="translate(135, 20)" stroke={strokeColor} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 14 6 L 14 26 M 4 16 L 24 16" strokeWidth="2.2" />
              <circle cx="14" cy="16" r="13" strokeDasharray="3 3" strokeWidth="1.2" />
            </g>

            {/* ======================================================== */}
            {/* 3. CAPSULE & TABLET (کپسول و قرص دارو) - Mid Right (145, 90) */}
            {/* ======================================================== */}
            <g transform="translate(140, 85)" stroke={strokeColor} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Capsule with 45deg rotation */}
              <g transform="rotate(35, 16, 16)">
                <rect x="8" y="2" width="16" height="28" rx="8" />
                <line x1="8" y1="16" x2="24" y2="16" />
                <path d="M 8 16 L 8 22 C 8 26.5, 11.5 30, 16 30 C 20.5 30, 24 26.5, 24 22 L 24 16 Z" fill={strokeColor} opacity="0.25" />
              </g>
              {/* Round Tablet next to it */}
              <circle cx="38" cy="28" r="7" />
              <line x1="33" y1="28" x2="43" y2="28" />
            </g>

            {/* ======================================================== */}
            {/* 4. HEART WITH ECG PULSE (قلب و ضربان حیاتی) - Center (80, 80) */}
            {/* ======================================================== */}
            <g transform="translate(75, 75) scale(0.95)" stroke={strokeColor} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Heart Silhouette */}
              <path d="M 24 8 C 19 2, 8 2, 5 12 C 1 24, 24 38, 24 38 C 24 38, 47 24, 43 12 C 40 2, 29 2, 24 8 Z" />
              {/* ECG Pulse inside */}
              <path d="M 8 20 L 16 20 L 20 14 L 24 27 L 28 11 L 32 24 L 35 20 L 40 20" strokeWidth="1.8" />
            </g>

            {/* ======================================================== */}
            {/* 5. SYRINGE (سرنگ و تزریقات پزشکی) - Bottom Left (20, 135) */}
            {/* ======================================================== */}
            <g transform="translate(20, 135) rotate(-30, 20, 20)" stroke={strokeColor} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Syringe Barrel */}
              <rect x="12" y="8" width="16" height="26" rx="2" />
              {/* Measurement Ticks */}
              <line x1="16" y1="14" x2="21" y2="14" />
              <line x1="16" y1="20" x2="23" y2="20" />
              <line x1="16" y1="26" x2="21" y2="26" />
              {/* Plunger */}
              <line x1="20" y1="34" x2="20" y2="44" strokeWidth="2" />
              <line x1="14" y1="44" x2="26" y2="44" strokeWidth="2" />
              {/* Needle Hub & Needle */}
              <rect x="17" y="5" width="6" height="3" />
              <line x1="20" y1="5" x2="20" y2="-4" strokeWidth="1.2" />
            </g>

            {/* ======================================================== */}
            {/* 6. MEDICAL CLIPBOARD & CHART (پرونده سلامت) - Bottom Center (85, 145) */}
            {/* ======================================================== */}
            <g transform="translate(85, 145)" stroke={strokeColor} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Clipboard Body */}
              <rect x="6" y="8" width="26" height="32" rx="3" />
              {/* Top Clip */}
              <path d="M 13 8 L 13 4 C 13 3, 15 2, 19 2 C 23 2, 25 3, 25 4 L 25 8 Z" fill={strokeColor} opacity="0.2" />
              {/* Checklist Lines */}
              <line x1="12" y1="16" x2="26" y2="16" />
              <line x1="12" y1="22" x2="26" y2="22" />
              <line x1="12" y1="28" x2="20" y2="28" />
              {/* Checkmark */}
              <path d="M 23 27 L 25 29 L 29 25" strokeWidth="1.8" />
            </g>

            {/* ======================================================== */}
            {/* 7. THERMOMETER (دماسنج پزشکی) - Mid Left (10, 85) */}
            {/* ======================================================== */}
            <g transform="translate(15, 80) rotate(15, 12, 20)" stroke={strokeColor} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Glass Tube & Bulb */}
              <path d="M 10 4 C 10 2, 14 2, 14 4 L 14 26 C 17 28, 17 33, 14 36 C 11 38, 7 35, 7 32 C 7 28, 10 26, 10 26 Z" />
              {/* Mercury Column */}
              <circle cx="12" cy="32" r="3" fill={strokeColor} />
              <line x1="12" y1="32" x2="12" y2="16" strokeWidth="1.8" />
              {/* Degree Marks */}
              <line x1="14" y1="12" x2="17" y2="12" strokeWidth="1" />
              <line x1="14" y1="17" x2="18" y2="17" strokeWidth="1" />
              <line x1="14" y1="22" x2="17" y2="22" strokeWidth="1" />
            </g>

            {/* ======================================================== */}
            {/* 8. FIRST-AID KIT / MEDICAL BAG (کیف امداد) - Bottom Right (150, 155) */}
            {/* ======================================================== */}
            <g transform="translate(150, 150)" stroke={strokeColor} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Bag Body */}
              <rect x="4" y="10" width="32" height="24" rx="4" />
              {/* Top Handle */}
              <path d="M 14 10 L 14 5 C 14 4, 16 3, 20 3 C 24 3, 26 4, 26 5 L 26 10" />
              {/* Center Cross on Bag */}
              <path d="M 20 16 L 20 28 M 14 22 L 26 22" strokeWidth="2" />
            </g>

            {/* ======================================================== */}
            {/* 9. ADHESIVE BANDAGE (چسب زخم) - Top Center (80, 15) */}
            {/* ======================================================== */}
            <g transform="translate(75, 15) rotate(-20, 18, 10)" stroke={strokeColor} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Strip */}
              <rect x="4" y="6" width="30" height="12" rx="6" />
              {/* Center Gauze Pad */}
              <rect x="13" y="6" width="12" height="12" fill={strokeColor} opacity="0.15" />
              {/* Pores */}
              <circle cx="8" cy="12" r="0.8" fill={strokeColor} />
              <circle cx="29" cy="12" r="0.8" fill={strokeColor} />
            </g>

            {/* Micro Precision Grid Dots */}
            <circle cx="110" cy="50" r="0.9" fill={strokeColor} opacity="0.6" />
            <circle cx="50" cy="110" r="0.9" fill={strokeColor} opacity="0.6" />
            <circle cx="180" cy="130" r="0.9" fill={strokeColor} opacity="0.6" />
            <circle cx="110" cy="200" r="0.9" fill={strokeColor} opacity="0.6" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};
