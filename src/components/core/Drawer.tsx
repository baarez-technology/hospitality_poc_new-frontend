import { forwardRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * Drawer Component
 * Slide-in panel from right
 */
const Drawer = forwardRef(({
  children,
  isOpen,
  onClose,
  size = 'md',
  title,
  description,
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  footer,
  className = '',
  ...props
}, ref) => {

  const sizes = {
    sm: 'w-full sm:w-[320px]',
    md: 'w-full sm:w-[420px]',
    lg: 'w-full sm:w-[560px]',
    xl: 'w-full sm:w-[720px]',
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-neutral-900/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Drawer */}
      <div
        ref={ref}
        className={`
          absolute right-0 top-0 h-[100dvh] bg-white flex flex-col
          animate-slideInRight
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100 flex-shrink-0">
          <div>
            {title && (
              <h2 className="text-[16px] font-semibold text-neutral-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[13px] text-neutral-500 mt-1">
                {description}
              </p>
            )}
          </div>
          {showClose && (
            <button
              onClick={onClose}
              className="p-1.5 -m-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
});

Drawer.displayName = 'Drawer';

export default Drawer;
