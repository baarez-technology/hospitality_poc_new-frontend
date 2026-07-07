import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef((
  {
    type = 'text',
    label,
    name,
    value,
    placeholder,
    error,
    helperText,
    required = false,
    disabled = false,
    fullWidth = true,
    icon,
    iconPosition = 'left',
    rows = 4,
    onChange,
    onBlur,
    onFocus,
    className = '',
    ...props
  },
  ref
) => {
  const isTextarea = type === 'textarea'
  const hasIcon = Boolean(icon)

  // Base input classes - Glimmora V2 Design System (Clean & Minimal)
  const baseInputClasses = cn(
    'w-full px-4 py-2.5 rounded-lg text-sm transition-colors duration-200',
    // AA: placeholder-neutral-400 on white fails; use neutral-500 for placeholder
    'bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-500',
    'hover:border-neutral-300',
    'focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500',
    'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60',
    error && 'border-rose-500 bg-rose-50 focus:ring-rose-500/20 focus:border-rose-500',
    hasIcon && iconPosition === 'left' && 'pl-10',
    hasIcon && iconPosition === 'right' && 'pr-10',
    isTextarea && 'resize-none',
    className
  )

  // Input element props
  const inputProps = {
    ref,
    id: name,
    name,
    value,
    placeholder,
    required,
    disabled,
    onChange,
    onBlur,
    onFocus,
    className: baseInputClasses,
    ...props,
  }

  // Render input or textarea
  const InputElement = isTextarea ? (
    <textarea {...inputProps} rows={rows} />
  ) : (
    <input {...inputProps} type={type} />
  )

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full')}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium mb-2 text-neutral-700',
            required && "after:content-['*'] after:ml-0.5 after:text-rose-500"
          )}
        >
          {label}
        </label>
      )}

      {/* Input Container with Icon */}
      <div className="relative">
        {/* Left Icon */}
        {hasIcon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input/Textarea Element */}
        {InputElement}

        {/* Right Icon */}
        {hasIcon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }
export default Input
