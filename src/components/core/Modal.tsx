import { forwardRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * Modal Component
 * Centered modal with clean styling
 */
const Modal = forwardRef(({
  children,
  isOpen,
  onClose,
  size = 'md',
  title,
  description,
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  className = '',
  ...props
}, ref) => {

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-[90vw]',
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px] animate-fadeIn"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal */}
      <div
        ref={ref}
        className={`
          relative w-full bg-white rounded-xl
          animate-scaleIn
          flex flex-col
          max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {/* Header */}
        {(title || showClose) && (
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
        )}

        {/* Content */}
        {children}
      </div>
    </div>,
    document.body
  );
});

Modal.displayName = 'Modal';

// Modal Body
const ModalBody = forwardRef(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`px-4 sm:px-6 py-4 sm:py-5 flex-1 overflow-y-auto ${className}`}
    {...props}
  >
    {children}
  </div>
));

ModalBody.displayName = 'ModalBody';

// Modal Footer
const ModalFooter = forwardRef(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 flex-shrink-0 ${className}`}
    {...props}
  >
    {children}
  </div>
));

ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalBody, ModalFooter };
export default Modal;
