import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'luxuryPrimary' | 'secondary' | 'tertiary' | 'ghost' | 'ghostNeutral' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'outlineTerra' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}, ref) => {
  // Variant classes - Glimmora V2 Design System
  const variantClasses = {
    // Primary - Terra gradient
    primary: 'bg-gradient-to-r from-terra-500 to-terra-600 text-white',
    // Luxury solid primary (closer to design comps)
    // AA normal: use a darker base so white text meets 4.5:1
    luxuryPrimary: 'bg-terra-600 text-white hover:bg-terra-700 active:bg-terra-800',
    // Secondary - White with border
    secondary: 'bg-white border border-neutral-200 text-neutral-700',
    // Tertiary - Subtle neutral fill
    tertiary: 'bg-neutral-100 text-neutral-700',
    // Ghost variants
    ghost: 'text-terra-600 bg-transparent',
    ghostNeutral: 'text-neutral-600 bg-transparent',
    // Status variants
    success: 'bg-gradient-to-r from-sage-500 to-sage-600 text-white',
    warning: 'bg-gradient-to-r from-gold-500 to-gold-600 text-white',
    danger: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white',
    info: 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white',
    // Outline variants
    outline: 'border border-neutral-200 text-neutral-700 bg-transparent',
    outlineTerra: 'border border-terra-300 text-terra-600 bg-transparent',
    // Link
    link: 'text-terra-600 underline-offset-2',
  }

  // Size classes - Glimmora Design System v2
  const sizeClasses = {
    xs: 'h-7 px-3 text-xs rounded-lg',
    sm: 'h-8 px-4 text-sm rounded-lg',
    md: 'h-10 px-5 text-sm rounded-lg',
    lg: 'h-11 px-6 text-base rounded-lg',
    xl: 'h-12 px-8 text-base rounded-lg',
  }

  // Loading spinner
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra-500/40 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }
export default Button
