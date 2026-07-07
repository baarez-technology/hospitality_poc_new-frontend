import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Glimmora Design System v5.0 - Badge
 * Status indicators with dynamic branding
 */

const VARIANT = {
  // Semantic variants
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  primary: 'bg-[var(--brand-primary-50)] text-[var(--brand-primary)] border-[var(--brand-primary-light)]',
  secondary: 'bg-[var(--brand-accent-50)] text-[var(--brand-accent)] border-[var(--brand-accent-light)]',
  success: 'bg-sage-50 text-sage-700 border-sage-200',
  warning: 'bg-gold-50 text-gold-800 border-gold-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-ocean-50 text-ocean-700 border-ocean-200',

  // Solid variants (more emphasis)
  'primary-solid': 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary-hover)]',
  'secondary-solid': 'bg-[var(--brand-accent)] text-white border-[var(--brand-accent-hover)]',
  'success-solid': 'bg-sage-500 text-white border-sage-600',
  'warning-solid': 'bg-gold-500 text-gold-900 border-gold-600',
  'danger-solid': 'bg-rose-500 text-white border-rose-600',

  // Outline variants
  'primary-outline': 'bg-transparent text-[var(--brand-primary)] border-[var(--brand-primary)]/40',
  'secondary-outline': 'bg-transparent text-[var(--brand-accent)] border-[var(--brand-accent)]/40',
  'success-outline': 'bg-transparent text-sage-600 border-sage-300',
  'danger-outline': 'bg-transparent text-rose-600 border-rose-300',
};

const SIZE = {
  xs: 'px-1.5 py-0.5 text-[10px] rounded',
  sm: 'px-2 py-0.5 text-[11px] rounded-md',
  md: 'px-2.5 py-1 text-xs rounded-lg',
  lg: 'px-3 py-1.5 text-sm rounded-lg',
};

export function Badge({
  className,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  dotColor,
  icon: Icon,
  children,
  ...props
}) {
  const dotColors = {
    neutral: 'bg-neutral-400',
    primary: 'bg-[var(--brand-primary)]',
    secondary: 'bg-[var(--brand-accent)]',
    success: 'bg-sage-500',
    warning: 'bg-gold-500',
    danger: 'bg-rose-500',
    info: 'bg-ocean-500',
    live: 'bg-emerald-500 animate-pulse',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap font-semibold border',
        VARIANT[variant] ?? VARIANT.neutral,
        SIZE[size] ?? SIZE.sm,
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[dotColor || variant.split('-')[0]] || dotColors.neutral)} />
      )}
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      {children}
    </span>
  );
}

// Status Badge - Pre-configured for common booking/room statuses
export function StatusBadge({ status, className, ...props }) {
  const statusConfig = {
    // Booking statuses
    confirmed: { variant: 'success', label: 'Confirmed', dot: true },
    pending: { variant: 'warning', label: 'Pending', dot: true },
    'checked-in': { variant: 'info', label: 'Checked In', dot: true },
    'checked-out': { variant: 'neutral', label: 'Checked Out' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    'no-show': { variant: 'danger', label: 'No Show' },

    // Room statuses
    available: { variant: 'success', label: 'Available', dot: true },
    occupied: { variant: 'primary', label: 'Occupied', dot: true },
    reserved: { variant: 'info', label: 'Reserved' },
    maintenance: { variant: 'warning', label: 'Maintenance' },
    'out-of-order': { variant: 'danger', label: 'Out of Order' },

    // Housekeeping statuses
    clean: { variant: 'success', label: 'Clean', dot: true },
    dirty: { variant: 'danger', label: 'Dirty', dot: true },
    cleaning: { variant: 'warning', label: 'Cleaning', dot: true, dotColor: 'live' },
    inspected: { variant: 'info', label: 'Inspected' },

    // Task/action statuses
    active: { variant: 'success-solid', label: 'Active' },
    inactive: { variant: 'neutral', label: 'Inactive' },
    draft: { variant: 'neutral', label: 'Draft' },
    published: { variant: 'success', label: 'Published' },
    expired: { variant: 'danger', label: 'Expired' },

    // Priority levels
    high: { variant: 'danger-solid', label: 'High' },
    medium: { variant: 'warning-solid', label: 'Medium' },
    low: { variant: 'success', label: 'Low' },
    urgent: { variant: 'danger-solid', label: 'Urgent', dot: true, dotColor: 'live' },
  };

  const normalizedStatus = status?.toLowerCase().replace(/[_\s]/g, '-');
  const config = statusConfig[normalizedStatus] || { variant: 'neutral', label: status };

  return (
    <Badge
      variant={config.variant}
      dot={config.dot}
      dotColor={config.dotColor}
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
}

// Count Badge - For notification counts
export function CountBadge({ count, max = 99, className, ...props }) {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5',
        'text-[10px] font-bold text-white rounded-full',
        'bg-rose-500',
        count === 0 && 'opacity-0',
        className
      )}
      {...props}
    >
      {displayCount}
    </span>
  );
}

// Live Indicator - Animated live status
export function LiveIndicator({ className, label = 'Live', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full',
        'text-[10px] font-bold uppercase tracking-wider',
        'bg-emerald-50 text-emerald-700 border border-emerald-200',
        className
      )}
      {...props}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      {label}
    </span>
  );
}

export default Badge;





