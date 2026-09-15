import React from 'react';

interface DnaHelixWatermarkProps {
  className?: string;
  opacity?: string;
}

export const DnaHelixWatermark: React.FC<DnaHelixWatermarkProps> = ({
  className = '',
  opacity = 'opacity-10'
}) => {
  return (
    <div 
      className={`absolute pointer-events-none select-none overflow-hidden ${opacity} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 240 600"
        className="w-full h-full text-sky-400 stroke-current"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Double Helix Strands */}
        <path
          d="M 60 20 C 180 80, 180 140, 60 200 C -60 260, -60 320, 60 380 C 180 440, 180 500, 60 560"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 180 20 C 60 80, 60 140, 180 200 C 300 260, 300 320, 180 380 C 60 440, 60 500, 180 560"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="4 8"
          fill="none"
        />

        {/* Base Pairs (Hydrogen Bonds Connecting the Strands) */}
        {[50, 110, 170, 230, 290, 350, 410, 470, 530].map((y, idx) => {
          const x1 = 60 + Math.sin(idx * 0.8) * 45;
          const x2 = 180 - Math.sin(idx * 0.8) * 45;
          return (
            <g key={idx}>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                strokeWidth="1.5"
                strokeDasharray="2 3"
              />
              <circle cx={x1} cy={y} r="2.5" fill="currentColor" />
              <circle cx={x2} cy={y} r="2.5" fill="currentColor" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
