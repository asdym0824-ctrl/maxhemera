import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { lockBodyScroll, unlockBodyScroll, registerEscapeHandler, MODAL_Z_INDEX } from '../../utils/modalManager';

export interface ModalPortalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndexClass?: string;
  className?: string;
}

/**
 * ModalPortal mounts modal overlays directly into document.body using createPortal.
 * This completely isolates the dialog from any parent stacking contexts (sticky headers,
 * backdrop-filter blur, CSS transforms, or overflow-hidden containers).
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({
  isOpen,
  onClose,
  children,
  zIndexClass = MODAL_Z_INDEX.BASE_MODAL,
  className = ''
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    lockBodyScroll();
    const unregisterEscape = registerEscapeHandler(onClose);

    return () => {
      unregisterEscape();
      unlockBodyScroll();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} overflow-hidden pointer-events-auto ${className}`}
      data-modal-portal="true"
    >
      {children}
    </div>,
    document.body
  );
};
