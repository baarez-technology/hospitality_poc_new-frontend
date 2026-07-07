import React from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuLabel,
} from './DropdownMenu'

/**
 * CustomDropdown Component - Glimmora Design System
 * Supports two modes:
 * 1. Action Menu Mode: Use `items` prop for action buttons with onClick handlers
 * 2. Form Select Mode: Use `options`, `value`, `onChange` props for form selection
 */
const CustomDropdown = React.forwardRef(({
  // Action menu mode props
  trigger,
  triggerLabel = 'Options',
  items = [],
  header,
  // Form select mode props
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  required = false,
  // Common props
  position = 'bottom-left',
  width = 'auto',
  disabled = false,
  className = '',
}, ref) => {
  // Determine mode based on props
  const isFormSelectMode = options !== undefined;
  const positionMap = {
    'bottom-left': { side: 'bottom', align: 'start' },
    'bottom-right': { side: 'bottom', align: 'end' },
    'top-left': { side: 'top', align: 'start' },
    'top-right': { side: 'top', align: 'end' },
  }
  const { side, align } = positionMap[position] || positionMap['bottom-left']

  const widthClasses = {
    auto: 'min-w-[200px] max-w-[280px]',
    full: 'w-full',
    small: 'w-48',
    medium: 'w-[220px]',
    large: 'w-80',
  }

  // Get display value for form select mode
  const selectedOption = isFormSelectMode && options ? options.find(opt => opt.value === value) : null;
  const displayValue = selectedOption?.label || placeholder;

  return (
    <div ref={ref} className={cn('relative', isFormSelectMode ? 'block' : 'inline-block', className)}>
      {/* Label for form select mode */}
      {isFormSelectMode && label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          {trigger ? (
            <span className={cn(
              'cursor-pointer inline-flex',
              'transition-transform duration-200',
              'hover:scale-105 active:scale-95',
              disabled && 'opacity-50 pointer-events-none'
            )}>
              {trigger}
            </span>
          ) : isFormSelectMode ? (
            /* Form select trigger - shows selected value */
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'w-full group inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl',
                'border border-neutral-200 bg-white text-sm text-neutral-700',
                'transition-all duration-200 ease-out',
                'hover:border-[#A57865]/50 hover:bg-white',
                'focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]',
                'active:scale-[0.99]',
                'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:border-neutral-200',
                !selectedOption && 'text-neutral-400'
              )}
            >
              <span className="truncate">{displayValue}</span>
              <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </button>
          ) : (
            /* Action menu trigger */
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl',
                'border border-terra-200/80 bg-white/80 backdrop-blur-sm text-sm font-medium text-neutral-700',
                'transition-all duration-200 ease-out',
                'hover:border-terra-300 hover:bg-white hover:shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-400',
                'active:scale-[0.98]',
                'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:border-neutral-200'
              )}
            >
              {triggerLabel}
              <ChevronDown className="w-4 h-4 text-neutral-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={side}
          align={align}
          sideOffset={8}
          className={widthClasses[width]}
        >
          {/* Optional header */}
          {header && (
            <>
              <DropdownMenuLabel>{header}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Form Select Mode - render selectable options */}
          {isFormSelectMode ? (
            options && options.length > 0 ? (
              options.map((option, idx) => {
                const isSelected = value === option.value;
                return (
                  <DropdownMenuItem
                    key={option.value || idx}
                    onSelect={() => onChange?.(option.value)}
                    className={cn(
                      'group/item',
                      isSelected && 'bg-terra-50'
                    )}
                  >
                    <span className={cn(
                      'flex-1 font-medium',
                      isSelected ? 'text-terra-700' : 'text-neutral-700 group-hover/item:text-neutral-900',
                    )}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-terra-600 flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                );
              })
            ) : (
              <div className="px-4 py-6 text-sm text-neutral-400 text-center">
                No options available
              </div>
            )
          ) : (
            /* Action Menu Mode - render action items */
            items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-400 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-neutral-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                  </svg>
                </div>
                No actions available
              </div>
            ) : (
              items.map((item, idx) => {
                if (item.divider) {
                  return <DropdownMenuSeparator key={`divider-${idx}`} />
                }

                if (item.label && item.isHeader) {
                  return <DropdownMenuLabel key={`header-${idx}`}>{item.label}</DropdownMenuLabel>
                }

                const isItemDisabled = item.disabled
                const isDanger = item.variant === 'danger'

                return (
                  <DropdownMenuItem
                    key={idx}
                    disabled={isItemDisabled}
                    onSelect={(e) => {
                      if (!isItemDisabled) item.onClick?.()
                    }}
                    className={cn(
                      'group/item',
                      // Danger variant styling
                      isDanger && [
                        'text-rose-600',
                        'hover:bg-gradient-to-r hover:from-rose-50 hover:to-rose-100/50',
                        'focus:bg-gradient-to-r focus:from-rose-50 focus:to-rose-100/50',
                        'before:bg-rose-500',
                      ],
                    )}
                    style={{
                      // Staggered animation delay for each item
                      animationDelay: `${idx * 30}ms`,
                    }}
                  >
                    {/* Icon with hover animation */}
                    {item.icon && (
                      <span className={cn(
                        'flex-shrink-0 transition-all duration-200',
                        isDanger
                          ? 'text-rose-500 group-hover/item:text-rose-600 group-hover/item:scale-110'
                          : 'text-neutral-400 group-hover/item:text-terra-600 group-hover/item:scale-110 group-focus/item:text-terra-600',
                      )}>
                        {item.icon}
                      </span>
                    )}

                    {/* Label */}
                    <span className={cn(
                      'flex-1 font-medium',
                      isDanger ? 'text-rose-700' : 'text-neutral-700 group-hover/item:text-neutral-900',
                    )}>
                      {item.label}
                    </span>

                    {/* Description (optional) */}
                    {item.description && (
                      <span className="text-xs text-neutral-400 ml-auto max-w-[100px] truncate">
                        {item.description}
                      </span>
                    )}

                    {/* Shortcut */}
                    {item.shortcut && (
                      <DropdownMenuShortcut className={cn(
                        'opacity-60 group-hover/item:opacity-100',
                        isDanger && 'text-rose-400'
                      )}>
                        {item.shortcut}
                      </DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                )
              })
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
})

CustomDropdown.displayName = 'CustomDropdown'

export default CustomDropdown
