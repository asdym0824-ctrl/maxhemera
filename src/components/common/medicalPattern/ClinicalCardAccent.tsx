import React from 'react';

interface ClinicalCornerAccentsProps {
  className?: string;
  variant?: 'cross' | 'bracket';
}

export const ClinicalCornerAccents: React.FC<ClinicalCornerAccentsProps> = ({
  className = '',
  variant = 'cross'
}) => {
  if (variant === 'bracket') {
    return (
      <>
        <span className={`absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-sky-400/40 rounded-tr-xs pointer-events-none ${className}`} />
        <span className={`absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-sky-400/40 rounded-bl-xs pointer-events-none ${className}`} />
      </>
    );
  }

  return (
    <>
      <span className={`absolute top-2 right-2 text-[9px] text-sky-400/50 font-mono pointer-events-none select-none ${className}`}>+</span>
      <span className={`absolute bottom-2 left-2 text-[9px] text-sky-400/50 font-mono pointer-events-none select-none ${className}`}>+</span>
    </>
  );
};
