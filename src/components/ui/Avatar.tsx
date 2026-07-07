import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Avatar Component - Glimmora Design System v2
 */
const Avatar = React.forwardRef(({
  src,
  alt = '',
  initials,
  size = 'md',
  variant = 'default',
  status,
  className = '',
  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] rounded-md',
    sm: 'w-8 h-8 text-xs rounded-lg',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-xl',
    xl: 'w-14 h-14 text-lg rounded-2xl',
    '2xl': 'w-16 h-16 text-xl rounded-2xl',
  }

  // Gradient variants for initials - Glimmora V2 Design System
  const gradientVariants = {
    default: 'bg-gradient-to-br from-terra-500 to-terra-600',
    aurora: 'bg-gradient-to-br from-aurora-500 to-aurora-600',
    gold: 'bg-gradient-to-br from-gold-500 to-gold-600',
    deepGreen: 'bg-gradient-to-br from-deepGreen-500 to-deepGreen-600',
    gray: 'bg-gradient-to-br from-gray-500 to-gray-600',
  }

  // Status indicator colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  }

  // Status dot sizes
  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-4 h-4',
  }

  return (
    <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            'object-cover',
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center text-white font-semibold shadow-md',
            sizeClasses[size],
            gradientVariants[variant]
          )}
        >
          {initials || alt?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}

      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  )
})

Avatar.displayName = 'Avatar'

/**
 * Avatar Group - Stack multiple avatars
 */
export const AvatarGroup = ({
  children,
  max = 4,
  size = 'md',
  className = '',
}) => {
  const childArray = React.Children.toArray(children)
  const visibleAvatars = childArray.slice(0, max)
  const remainingCount = childArray.length - max

  // Overlap sizes
  const overlapClasses = {
    xs: '-space-x-1.5',
    sm: '-space-x-2',
    md: '-space-x-3',
    lg: '-space-x-3',
    xl: '-space-x-4',
    '2xl': '-space-x-4',
  }

  // Size classes for the +N indicator
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] rounded-md',
    sm: 'w-8 h-8 text-xs rounded-lg',
    md: 'w-10 h-10 text-xs rounded-xl',
    lg: 'w-12 h-12 text-sm rounded-xl',
    xl: 'w-14 h-14 text-base rounded-2xl',
    '2xl': 'w-16 h-16 text-lg rounded-2xl',
  }

  return (
    <div className={cn('flex items-center', overlapClasses[size], className)}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className="ring-2 ring-white">
          {React.cloneElement(child, { size })}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center bg-terra-100 text-terra-600 font-semibold ring-2 ring-white',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Get a consistent variant based on string (for consistent colors per user)
 */
export const getAvatarVariant = (str) => {
  const variants = ['default', 'aurora', 'gold', 'deepGreen', 'gray']
  const hash = str?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0
  return variants[hash % variants.length]
}

export default Avatar
