/**
 * Popup Component - Glimmora Design System v2
 * Reusable modal popup with glass-card effect
 *
 * Usage:
 * <Popup
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Modal Title"
 *   subtitle="Optional subtitle"
 *   size="md"
 *   primaryAction={{ label: 'Save', onClick: handleSave }}
 *   secondaryAction={{ label: 'Cancel', onClick: handleClose }}
 * >
 *   {children}
 * </Popup>
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Popup = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  primaryAction,
  secondaryAction,
  showFooter = true,
  showHeader = true,
  className = '',
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={cn(
          'relative flex flex-col w-full max-h-[90vh] rounded-[10px] overflow-hidden shadow-xl border border-white/70',
          sizeClasses[size],
          className
        )}
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(40px) saturate(180%)',
          animation: 'popupFadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex-shrink-0 px-6 py-5 border-b border-neutral-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {showFooter && (primaryAction || secondaryAction) && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-neutral-200/50 bg-neutral-50">
            <div className="flex items-center justify-end gap-3">
              {secondaryAction && (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  disabled={secondaryAction.disabled}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  {secondaryAction.label}
                </button>
              )}

              {primaryAction && (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 h-10 px-5 text-sm rounded-xl font-semibold text-white transition-all',
                    'bg-gradient-to-r from-terra-500 to-terra-600',
                    'hover:shadow-lg hover:shadow-terra-500/25 hover:-translate-y-0.5',
                    'active:translate-y-0',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none'
                  )}
                >
                  {primaryAction.loading && (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {primaryAction.label}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes popupFadeIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

/**
 * Popup Header - For custom headers
 */
export const PopupHeader = ({ children, className = '' }) => (
  <div className={cn('flex-shrink-0 px-6 py-5 border-b border-neutral-200/50', className)}>
    {children}
  </div>
);

/**
 * Popup Content - For content with default padding
 */
export const PopupContent = ({ children, className = '' }) => (
  <div className={cn('p-6', className)}>
    {children}
  </div>
);

/**
 * Popup Footer - For custom footers
 */
export const PopupFooter = ({ children, className = '' }) => (
  <div className={cn('flex-shrink-0 px-6 py-4 border-t border-neutral-200/50 bg-neutral-50', className)}>
    {children}
  </div>
);

/**
 * Popup Section Header - For section labels
 */
export const PopupSectionHeader = ({ children, className = '' }) => (
  <div className={cn('mb-3', className)}>
    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {children}
    </span>
  </div>
);

export default Popup;
