/**
 * Hamrah Clinic - Global Modal & Stacking Context Manager
 * 
 * Provides:
 * 1. Reference-counted body scroll locking with scrollbar width compensation to avoid layout shifts.
 * 2. Stack-based Escape key listener ensuring nested modals close top-down in LIFO order.
 * 3. Centralized modal z-index constants.
 */

export const MODAL_Z_INDEX = {
  HEADER: 'z-40',
  DROPDOWN: 'z-50',
  BASE_MODAL: 'z-[100]',
  NESTED_MODAL: 'z-[120]',
  NOTIFICATION: 'z-[150]'
} as const;

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;

  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow || '';
    originalPaddingRight = document.body.style.paddingRight || '';

    // Calculate vertical scrollbar width to prevent horizontal layout jump
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount++;
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  }
}

// Global stack of active modal escape handlers (LIFO)
const escapeHandlersStack: Array<() => void> = [];
let isKeydownListenerAttached = false;

function handleGlobalEscape(e: KeyboardEvent): void {
  if (e.key === 'Escape' && escapeHandlersStack.length > 0) {
    e.preventDefault();
    e.stopPropagation();
    // Execute topmost handler only
    const topHandler = escapeHandlersStack[escapeHandlersStack.length - 1];
    if (topHandler) {
      topHandler();
    }
  }
}

export function registerEscapeHandler(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  escapeHandlersStack.push(handler);

  if (!isKeydownListenerAttached) {
    window.addEventListener('keydown', handleGlobalEscape, true);
    isKeydownListenerAttached = true;
  }

  return () => {
    const index = escapeHandlersStack.lastIndexOf(handler);
    if (index !== -1) {
      escapeHandlersStack.splice(index, 1);
    }
    if (escapeHandlersStack.length === 0 && isKeydownListenerAttached) {
      window.removeEventListener('keydown', handleGlobalEscape, true);
      isKeydownListenerAttached = false;
    }
  };
}

// Utility to reset modal manager state for testing environments
export function _resetModalManagerState(): void {
  lockCount = 0;
  escapeHandlersStack.length = 0;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
  if (isKeydownListenerAttached && typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalEscape, true);
    isKeydownListenerAttached = false;
  }
}
