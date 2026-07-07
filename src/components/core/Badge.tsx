import { forwardRef } from 'react';

/**
 * Badge Component
 * Status indicators and labels
 */
const Badge = forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}, ref) => {

  const variants = {
    default: 'bg-neutral-100 text-neutral-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    info: 'bg-info-100 text-info-700',
    // Status variants
    confirmed: 'bg-success-100 text-success-700',
    pending: 'bg-warning-100 text-warning-700',
    checkedIn: 'bg-info-100 text-info-700',
    checkedOut: 'bg-neutral-100 text-neutral-600',
    cancelled: 'bg-error-100 text-error-700',
    noShow: 'bg-purple-100 text-purple-700',
    available: 'bg-success-100 text-success-700',
    occupied: 'bg-info-100 text-info-700',
    dirty: 'bg-warning-100 text-warning-700',
    clean: 'bg-success-100 text-success-700',
    maintenance: 'bg-orange-100 text-orange-700',
  };

  const dotColors = {
    default: 'bg-neutral-500',
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-info-500',
    confirmed: 'bg-success-500',
    pending: 'bg-warning-500',
    checkedIn: 'bg-info-500',
    checkedOut: 'bg-neutral-400',
    cancelled: 'bg-error-500',
    noShow: 'bg-purple-500',
    available: 'bg-success-500',
    occupied: 'bg-info-500',
    dirty: 'bg-warning-500',
    clean: 'bg-success-500',
    maintenance: 'bg-orange-500',
  };

  const sizes = {
    sm: 'h-5 px-1.5 text-[11px]',
    md: 'h-6 px-2 text-[12px]',
    lg: 'h-7 px-2.5 text-[13px]',
  };

  return (
    <span
      ref={ref}
      className={`
        inline-flex items-center gap-1.5 rounded-md font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
