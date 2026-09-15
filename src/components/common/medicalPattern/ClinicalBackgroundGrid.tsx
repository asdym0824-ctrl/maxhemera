import React from 'react';
import { MedicalVectorPattern } from './MedicalVectorPattern';

interface ClinicalBackgroundGridProps {
  className?: string;
  showAura?: boolean;
}

export const ClinicalBackgroundGrid: React.FC<ClinicalBackgroundGridProps> = ({
  className = '',
  showAura = true
}) => {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`} 
      aria-hidden="true"
    >
      {/* 1. Unified Matte Medical Vectors Pattern (Stethoscope, Syringe, Heart-ECG, Capsule, Clipboard, etc.) */}
      <MedicalVectorPattern 
        opacity={0.038} 
        variant="colored" 
        patternId="global-med-pattern" 
      />

      {/* 2. Ambient Clinical Glow Lights (Soft Cyan, Sky Blue and Sterile White) */}
      {showAura && (
        <>
          <div className="absolute top-1/4 -right-48 w-96 h-96 bg-sky-400/[0.04] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-2/3 -left-48 w-96 h-96 bg-blue-500/[0.035] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-400/[0.025] rounded-full blur-3xl pointer-events-none" />
        </>
      )}
    </div>
  );
};
