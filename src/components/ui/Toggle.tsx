import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Toggle/Switch Component - Glimmora Design System v2
 */
const Toggle = React.forwardRef(({
  checked = false,
  onChange,
  size = 'md',
  disabled = false,
  label,
  className = '',
  ...props
}, ref) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      track: 'w-8 h-4',
      dot: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      dot: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      dot: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  }

  const config = sizeConfig[size] || sizeConfig.md

  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <label
      className={cn(
        'inline-flex items-center gap-3',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            'rounded-full transition-colors duration-200',
            config.track,
            checked
              ? 'bg-gradient-to-r from-terra-500 to-terra-600'
              : 'bg-gray-200'
          )}
        />
        <div
          className={cn(
            'absolute left-0.5 top-0.5 bg-white rounded-full shadow transition-transform duration-200',
            config.dot,
            checked && config.translate
          )}
        />
      </div>
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
    </label>
  )
})

Toggle.displayName = 'Toggle'

/**
 * Checkbox Component - Glimmora Design System v2
 */
export const Checkbox = React.forwardRef(({
  checked = false,
  onChange,
  disabled = false,
  label,
  className = '',
  ...props
}, ref) => {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-3',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className={cn(
            'w-5 h-5 rounded border-gray-300 transition-colors',
            'focus:ring-2 focus:ring-terra-500/20 focus:ring-offset-0',
            checked
              ? 'bg-gradient-to-r from-terra-500 to-terra-600 border-terra-500 text-white'
              : 'bg-white'
          )}
          {...props}
        />
      </div>
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

/**
 * Radio Component - Glimmora Design System v2
 */
export const Radio = React.forwardRef(({
  checked = false,
  onChange,
  disabled = false,
  label,
  name,
  value,
  className = '',
  ...props
}, ref) => {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-3',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <input
        ref={ref}
        type="radio"
        checked={checked}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        name={name}
        value={value}
        className={cn(
          'w-5 h-5 border-gray-300 text-terra-500',
          'focus:ring-2 focus:ring-terra-500/20 focus:ring-offset-0'
        )}
        {...props}
      />
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
    </label>
  )
})

Radio.displayName = 'Radio'

/**
 * RadioGroup Component
 */
export const RadioGroup = ({
  options = [],
  value,
  onChange,
  name,
  direction = 'vertical',
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex gap-3',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={onChange}
          label={option.label}
          disabled={option.disabled}
        />
      ))}
    </div>
  )
}

export default Toggle
