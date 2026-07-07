/**
 * Glimmora Design System v5.0 - Base Drawer Component
 * Reusable drawer/modal component with dynamic branding
 */

import { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IconButton, Button } from './Button';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  noPadding?: boolean;
  hideBackdrop?: boolean;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  header,
  footer,
  maxWidth = 'max-w-2xl',
  className,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  noPadding = false,
  hideBackdrop = false
}: DrawerProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when open
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

  const drawerContent = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur */}
      {!hideBackdrop && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={closeOnBackdropClick ? onClose : undefined}
        />
      )}

      {/* Side Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 w-full flex flex-col",
          maxWidth,
          "bg-white",
          "border-l border-neutral-200",
          "shadow-2xl",
          "animate-in slide-in-from-right duration-300",
          "h-[100dvh]", // Use dvh for proper mobile viewport handling
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Always on right */}
        {showCloseButton && (
          <IconButton
            icon={X}
            variant="ghost"
            size="sm"
            label="Close"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30 hover:bg-neutral-100 rounded-[var(--brand-radius-md)] transition-all duration-200"
          />
        )}

        {/* Header - title/subtitle or custom header */}
        {(title || subtitle) && !header && (
          <div className="relative px-4 sm:px-6 py-4 sm:py-5 pr-12 sm:pr-14 border-b border-neutral-100 bg-white flex-shrink-0 z-10">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5 sm:mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Custom Header */}
        {header && (
          <div className="relative px-4 sm:px-6 py-4 sm:py-5 pr-12 sm:pr-14 border-b border-neutral-100 bg-white flex-shrink-0 z-20 overflow-visible">
            {header}
          </div>
        )}

        {/* Content — min-h-0 lets this flex child shrink below its content
            height so overflow-y-auto actually scrolls (and keeps the footer
            pinned) instead of growing past the viewport with no scrollbar. */}
        <div className={cn("flex-1 min-h-0 overflow-y-auto bg-white z-10", noPadding ? "" : "px-4 sm:px-6 py-4 sm:py-6")}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-neutral-100 bg-neutral-50/50 flex-shrink-0 z-10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}

/**
 * ConfirmDrawer - Confirmation dialog as a drawer for consistency
 * Use this instead of ConfirmModal for a consistent drawer-based UI
 */
export function ConfirmDrawer({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  icon: Icon
}) {
  const variantConfig = {
    danger: {
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      buttonVariant: 'danger'
    },
    warning: {
      iconBg: 'bg-gold-50',
      iconColor: 'text-gold-600',
      buttonVariant: 'primary'
    },
    primary: {
      iconBg: 'bg-[var(--brand-primary-50)]',
      iconColor: 'text-[var(--brand-primary)]',
      buttonVariant: 'primary'
    },
    secondary: {
      iconBg: 'bg-[var(--brand-accent-50)]',
      iconColor: 'text-[var(--brand-accent)]',
      buttonVariant: 'secondary'
    }
  };

  const config = variantConfig[variant] || variantConfig.danger;
  const IconComponent = Icon || AlertTriangle;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      showCloseButton={false}
    >
      <div className="flex flex-col h-full">
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          {/* Icon */}
          <div className={cn('w-16 h-16 rounded-[var(--brand-radius-card)] flex items-center justify-center mb-6', config.iconBg)}>
            <IconComponent className={cn('w-8 h-8', config.iconColor)} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-neutral-900 tracking-tight mb-3">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-[14px] text-neutral-500 leading-relaxed max-w-[280px]">
              {description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-neutral-100 bg-neutral-50/50 space-y-3 flex-shrink-0">
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            loading={loading}
            className="w-full"
          >
            {confirmText}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

