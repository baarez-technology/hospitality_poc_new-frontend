import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Badge Component - Glimmora Design System v2
 */
const Badge = React.forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  dotPulse = false,
  className = '',
  ...props
}, ref) => {
  // Variant styles - Glimmora V2 Design System (Clean & Minimal)
  const variants = {
    default: 'bg-neutral-100 text-neutral-700',
    primary: 'bg-terra-100 text-terra-700',
    secondary: 'bg-neutral-100 text-neutral-600',
    success: 'bg-sage-100 text-sage-700',
    // AA normal: gold-700 on gold-100 is < 4.5; use a darker text shade
    warning: 'bg-gold-100 text-gold-800',
    danger: 'bg-rose-100 text-rose-700',
    info: 'bg-ocean-100 text-ocean-700',
    outline: 'border border-neutral-200 text-neutral-700 bg-white',
    // Status badges
    confirmed: 'bg-sage-100 text-sage-700',
    checkedIn: 'bg-sage-100 text-sage-700',
    pending: 'bg-gold-100 text-gold-800',
    cancelled: 'bg-rose-100 text-rose-700',
    checkedOut: 'bg-neutral-100 text-neutral-600',
    // Dot variants with status colors
    online: 'bg-sage-100 text-sage-700',
    offline: 'bg-rose-100 text-rose-700',
    processing: 'bg-gold-100 text-gold-800',
  }

  // Dot colors
  const dotColors = {
    online: 'bg-sage-500',
    offline: 'bg-rose-500',
    processing: 'bg-gold-500',
    default: 'bg-current',
  }

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  }

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColors[variant] || dotColors.default,
            dotPulse && 'pulse-dot'
          )}
        />
      )}
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'

export { Badge }

/**
 * Status Badge - Pre-configured status badges
 */
export const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    'CONFIRMED': { variant: 'confirmed', label: 'Confirmed' },
    'PENDING': { variant: 'pending', label: 'Pending' },
    'CHECKED-IN': { variant: 'checkedIn', label: 'Checked-in' },
    'CHECKED-OUT': { variant: 'checkedOut', label: 'Checked-out' },
    'CANCELLED': { variant: 'cancelled', label: 'Cancelled' },
  }

  const config = statusConfig[status] || { variant: 'default', label: status }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

/**
 * Source Badge - Booking source badges
 * Colors matching Glimmora luxury design reference
 */
export const SourceBadge = ({ source, className = '' }) => {
  const sourceConfig = {
    'Walk-in': 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    'Booking.com': 'bg-terra-50 text-terra-700 border border-terra-200',
    'Expedia': 'bg-copper-50 text-copper-700 border border-copper-200',
    'Direct': 'bg-sage-50 text-sage-700 border border-sage-200',
    'Hotels.com': 'bg-ocean-50 text-ocean-700 border border-ocean-200',
    'Airbnb': 'bg-rose-50 text-rose-700 border border-rose-200',
    'Corporate Portal': 'bg-gold-50 text-gold-700 border border-gold-200',
    'OTA': 'bg-neutral-50 text-neutral-600 border border-neutral-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap',
        sourceConfig[source] || 'bg-neutral-50 text-neutral-600 border border-neutral-200',
        className
      )}
    >
      {source}
    </span>
  )
}

/**
 * Room Type Badge
 */
export const RoomTypeBadge = ({ type, className = '' }) => {
  const typeConfig = {
    'Standard': 'bg-neutral-100 text-neutral-700',
    'Deluxe': 'bg-copper-100 text-copper-700',
    'Premium': 'bg-gold-100 text-gold-700',
    'Suite': 'bg-terra-100 text-terra-700',
    'Presidential': 'bg-neutral-900 text-white',
  }

  return (
    <span
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-semibold',
        typeConfig[type] || 'bg-neutral-100 text-neutral-700',
        className
      )}
    >
      {type}
    </span>
  )
}

/**
 * Notification Badge - Count badge for notifications
 */
export const NotificationBadge = ({ count, className = '' }) => {
  if (!count || count <= 0) return null

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default Badge
