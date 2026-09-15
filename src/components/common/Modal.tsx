import React from 'react';
import { X } from 'lucide-react';
import { ModalPortal } from './ModalPortal';
import { MODAL_Z_INDEX } from '../../utils/modalManager';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  zIndexClass?: string;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
  zIndexClass = MODAL_Z_INDEX.BASE_MODAL,
  className = ''
}) => {
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} zIndexClass={zIndexClass}>
      <div
        className="fixed inset-0 min-h-[100dvh] w-screen flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        dir="rtl"
      >
        <div
          className={`relative w-full ${widthClasses[maxWidth]} bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] text-slate-800 my-auto ${className}`}
          onClick={e => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div className="font-bold text-base sm:text-lg text-slate-800">{title}</div>
              <button
                onClick={onClose}
                aria-label="بستن پنجره"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0">{children}</div>
        </div>
      </div>
    </ModalPortal>
  );
};
