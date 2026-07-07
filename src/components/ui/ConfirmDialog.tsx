/**
 * ConfirmDialog Component - Glimmora Design System
 * Premium confirmation dialog with warm luxury aesthetics
 * Consistent with NewBookingModal and BookingDrawer
 */

import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ConfirmDialog = React.forwardRef(({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  className = '',
}, ref) => {
  if (!isOpen) return null;

  // Variant configurations
  const variantConfig = {
    danger: {
      icon: AlertCircle,
      iconBg: 'bg-gradient-to-br from-rose-500 to-rose-600',
      iconColor: 'text-white',
      ringColor: 'ring-rose-500/20',
      buttonBg: 'bg-rose-500 hover:bg-rose-600',
      accentColor: 'rose',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-gradient-to-br from-gold-500 to-gold-600',
      iconColor: 'text-white',
      ringColor: 'ring-gold-500/20',
      buttonBg: 'bg-gold-500 hover:bg-gold-600',
      accentColor: 'gold',
    },
    info: {
      icon: Info,
      iconBg: 'bg-gradient-to-br from-ocean-500 to-ocean-600',
      iconColor: 'text-white',
      ringColor: 'ring-ocean-500/20',
      buttonBg: 'bg-ocean-500 hover:bg-ocean-600',
      accentColor: 'ocean',
    },
  };

  const config = variantConfig[variant] || variantConfig.danger;
  const Icon = icon || config.icon;

  return (
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center"
      onClick={() => onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className={cn(
          'relative w-full max-w-md mx-4',
          'bg-white rounded-2xl border border-neutral-200',
          'overflow-hidden',
          'animate-in fade-in-0 zoom-in-95 duration-300',
          className
        )}
        onClick={(e) => e.stopPropagation()}
        ref={ref}
      >
        {/* Header with gradient background */}
        <div className="relative px-6 pt-6 pb-5">
          {/* Background decoration */}
          <div className={cn(
            'absolute inset-0',
            variant === 'danger' && 'bg-gradient-to-br from-rose-50/80 via-white to-rose-50/40',
            variant === 'warning' && 'bg-gradient-to-br from-gold-50/80 via-white to-gold-50/40',
            variant === 'info' && 'bg-gradient-to-br from-ocean-50/80 via-white to-ocean-50/40'
          )} />
          <div className={cn(
            'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2',
            variant === 'danger' && 'bg-gradient-to-bl from-rose-100/40 to-transparent',
            variant === 'warning' && 'bg-gradient-to-bl from-gold-100/40 to-transparent',
            variant === 'info' && 'bg-gradient-to-bl from-ocean-100/40 to-transparent'
          )} />

          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => onClose()}
              className="absolute -top-1 -right-1 p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="mb-4">
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                'ring-4',
                config.iconBg,
                config.ringColor
              )}>
                <Icon className={cn('w-7 h-7', config.iconColor)} strokeWidth={2} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">
              {title}
            </h2>

            {/* Message */}
            <p className="text-sm text-neutral-600 leading-relaxed pr-6">
              {message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onClose()}
              className={cn(
                'h-10 px-5 text-sm font-medium rounded-xl',
                'bg-white border border-neutral-200 text-neutral-700',
                'hover:bg-neutral-50 hover:border-neutral-300',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-neutral-200'
              )}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                'h-10 px-5 text-sm font-semibold rounded-xl text-white',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.buttonBg,
                variant === 'danger' && 'focus:ring-rose-500/40',
                variant === 'warning' && 'focus:ring-gold-500/40',
                variant === 'info' && 'focus:ring-ocean-500/40'
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

export default ConfirmDialog;
