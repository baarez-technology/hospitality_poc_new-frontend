import React, { useState } from 'react'
import { cn } from '@/lib/utils'

const Tabs = React.forwardRef(({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className = '',
  children,
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <div ref={ref} className={cn('w-full', className)}>
      {React.Children.map(children, child => {
        if (!child) return null
        return React.cloneElement(child, {
          value,
          onValueChange: handleValueChange,
        })
      })}
    </div>
  )
})

Tabs.displayName = 'Tabs'

const TabsList = React.forwardRef(({ children, className = '' }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center border-b border-neutral-200 gap-1',
      className
    )}
    role="tablist"
  >
    {children}
  </div>
))

TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef(({
  value: triggerValue,
  children,
  disabled = false,
  className = '',
  value,
  onValueChange,
  ...props
}, ref) => {
  const isActive = value === triggerValue
  const handleClick = () => {
    if (!disabled && onValueChange) {
      onValueChange(triggerValue)
    }
  }

  return (
    <button
      ref={ref}
      role="tab"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'px-4 py-3 text-sm font-medium border-b-2 transition-all',
        isActive
          ? 'border-[#A57865] text-[#A57865]'
          : 'border-transparent text-neutral-600 hover:text-neutral-900',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef(({
  value: contentValue,
  children,
  className = '',
  value,
  ...props
}, ref) => {
  if (value !== contentValue) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn('mt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
})

TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
export default Tabs
