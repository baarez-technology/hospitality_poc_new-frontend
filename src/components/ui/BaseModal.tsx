import React, { useEffect, useRef } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * BaseModal - Glimmora Design System
 * Luxury modal with warm aesthetic and refined details
 */
export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  topContent,
  size = 'md',
  showIcon = true,
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
}) {
  const modalRef = useRef(null)

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    full: 'max-w-5xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div className="absolute right-0 bottom-0 left-auto top-auto w-full h-full bg-black/30 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full overflow-hidden rounded-3xl shadow-2xl bg-white flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh]',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || Icon) && (
          <div className="relative flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-4">
              {showIcon && (
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#A57865]/10">
                  {Icon ? (
                    <Icon className="w-6 h-6 text-[#A57865]" />
                  ) : (
                    <Plus className="w-6 h-6 text-[#A57865]" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Top Content (fixed, non-scrolling) */}
        {topContent && (
          <div className="flex-shrink-0">
            {topContent}
          </div>
        )}

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-end gap-3 bg-gray-50/50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Sub-components for structured modal content

export const ModalContent = ({ children, className = '' }) => (
  <div className={cn('space-y-5', className)}>
    {children}
  </div>
)

export const ModalSectionHeader = ({ children, icon: Icon, className = '' }) => (
  <div className={cn('flex items-center gap-2.5 pb-1', className)}>
    {Icon && <Icon className="w-4 h-4 text-[#A57865]" />}
    <h3 className="text-sm font-semibold text-gray-900">
      {children}
    </h3>
  </div>
)

export const ModalLabel = ({ htmlFor, required, children, className = '' }) => (
  <label
    htmlFor={htmlFor}
    className={cn(
      'block text-sm font-medium mb-2 text-gray-700',
      required && "after:content-['*'] after:ml-0.5 after:text-red-500",
      className
    )}
  >
    {children}
  </label>
)

export const ModalInput = React.forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="space-y-1">
    {label && <ModalLabel htmlFor={props.id}>{label}</ModalLabel>}
    <input
      ref={ref}
      className={cn(
        'w-full px-4 py-3 rounded-xl text-sm transition-all duration-200',
        'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400',
        'hover:border-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] focus:bg-white',
        error && '!border-red-400 !bg-red-50 focus:!border-red-500 focus:!ring-red-200',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
  </div>
))

export const ModalTextarea = React.forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="space-y-1">
    {label && <ModalLabel htmlFor={props.id}>{label}</ModalLabel>}
    <textarea
      ref={ref}
      className={cn(
        'w-full px-4 py-3 rounded-xl text-sm resize-none transition-all duration-200',
        'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400',
        'hover:border-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] focus:bg-white',
        error && '!border-red-400 !bg-red-50 focus:!border-red-500 focus:!ring-red-200',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
  </div>
))

export const ModalSelect = React.forwardRef(({ label, error, options = [], className, ...props }, ref) => (
  <div className="space-y-1">
    {label && <ModalLabel htmlFor={props.id}>{label}</ModalLabel>}
    <select
      ref={ref}
      className={cn(
        'w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 appearance-none cursor-pointer',
        'bg-gray-50 border border-gray-200 text-gray-900',
        'hover:border-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] focus:bg-white',
        error && 'border-red-300 bg-red-50/50',
        className
      )}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
))

export const ModalSelectionCard = ({ selected, onClick, icon: Icon, title, description, children, variant = 'default', showIconAlways = false, className = '' }) => {
  const getVariantStyles = () => {
    if (selected) {
      switch (variant) {
        case 'gold':
          return 'border-[#CFA54D] bg-[#CFA54D]/10'
        case 'success':
          return 'border-[#5F7260] bg-[#5F7260]/10'
        default:
          return 'border-[#A57865] bg-[#FDF8F6]'
      }
    }
    return 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
  }

  const getIconColor = () => {
    if (!selected) return 'text-gray-400'
    switch (variant) {
      case 'gold':
        return 'text-[#CFA54D]'
      case 'success':
        return 'text-[#5F7260]'
      default:
        return 'text-[#A57865]'
    }
  }

  const shouldShowIcon = Icon && (selected || showIconAlways)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 text-left w-full',
        getVariantStyles(),
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        {shouldShowIcon && <Icon className={cn('w-4 h-4 flex-shrink-0', getIconColor())} />}
        <span className="text-sm font-medium text-gray-900 flex-1">{children || title}</span>
      </div>
      {description && (
        <p className="text-xs mt-1.5 text-gray-500">{description}</p>
      )}
    </button>
  )
}

export const ModalPrimaryButton = ({ children, ...props }) => (
  <button
    className="px-6 py-2.5 bg-gradient-to-r from-[#A57865] to-[#8B6355] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
    {...props}
  >
    {children}
  </button>
)

export const ModalSecondaryButton = ({ children, ...props }) => (
  <button
    className="px-6 py-2.5 font-semibold rounded-xl transition-all duration-200 bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
    {...props}
  >
    {children}
  </button>
)

export const ModalError = ({ message, children, icon: Icon, className = '' }) => {
  const content = message || children
  if (!content) return null

  return (
    <div className={cn('flex items-center gap-2 mt-1.5', className)}>
      {Icon && <Icon className="w-3.5 h-3.5 text-red-500" />}
      <p className="text-xs text-red-500">{content}</p>
    </div>
  )
}

export const ModalInfoCard = ({ message, children, className = '' }) => (
  <div className={cn(
    'p-5 rounded-2xl bg-gray-50 border border-gray-100',
    className
  )}>
    {message ? <p className="text-sm text-gray-700">{message}</p> : children}
  </div>
)

export const ModalHighlightCard = ({ message, children, className = '' }) => (
  <div className={cn(
    'p-5 rounded-2xl bg-gradient-to-r from-[#A57865] to-[#8B6355] text-white',
    className
  )}>
    {message ? <p className="text-sm font-medium">{message}</p> : children}
  </div>
)

export const ModalCounter = ({ label, value, onChange, min = 0, max = 99, className = '' }) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1)
  }

  const handleIncrement = () => {
    if (value < max) onChange(value + 1)
  }

  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200',
      className
    )}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-200 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 disabled:opacity-30 active:scale-95"
      >
        −
      </button>
      <span className="text-2xl font-bold min-w-[4rem] text-center tabular-nums text-gray-900">
        {value}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-200 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 disabled:opacity-30 active:scale-95"
      >
        +
      </button>
    </div>
  )
}

export const ModalBadge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    primary: 'bg-[#FDF8F6] text-[#A57865] border border-[#A57865]/20',
    success: 'bg-[#5F7260]/10 text-[#5F7260] border border-[#5F7260]/20',
    gold: 'bg-[#CFA54D]/10 text-[#CFA54D] border border-[#CFA54D]/20',
    danger: 'bg-red-50 text-red-600 border border-red-200',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold',
      variants[variant] || variants.default,
      className
    )}>
      {children}
    </span>
  )
}
