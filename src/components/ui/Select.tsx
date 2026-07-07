import React, { useState, useRef, useEffect, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// Context for Select state
interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled: boolean
  triggerRef: React.RefObject<HTMLButtonElement>
  contentRef: React.RefObject<HTMLDivElement>
}

const SelectContext = createContext<SelectContextValue | null>(null)

const useSelectContext = () => {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error('Select components must be used within a Select provider')
  }
  return context
}

// Main Select Component
interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

const Select: React.FC<SelectProps> = ({
  value: controlledValue,
  onValueChange,
  defaultValue = '',
  children,
  disabled = false,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  // Close on click outside (check both the select container and the portal content)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const isInsideSelect = selectRef.current?.contains(target)
      const isInsideContent = contentRef.current?.contains(target)
      if (!isInsideSelect && !isInsideContent) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen, disabled, triggerRef, contentRef }}>
      <div ref={selectRef} className={cn('relative w-full', className)}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

Select.displayName = 'Select'

// Trigger Component
interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
  placeholder?: string
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = '', placeholder }) => {
  const { open, setOpen, disabled, triggerRef } = useSelectContext()

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => !disabled && setOpen(!open)}
      className={cn(
        'flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm',
        'bg-white border border-neutral-200',
        'hover:border-neutral-300 hover:bg-neutral-50',
        'focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]',
        'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60',
        'transition-all duration-200',
        open && 'ring-2 ring-[#A57865]/20 border-[#A57865]',
        className
      )}
      disabled={disabled}
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      <span className="truncate">{children}</span>
      <ChevronDown
        className={cn(
          'w-4 h-4 text-neutral-400 flex-shrink-0 ml-2 transition-transform duration-200',
          open && 'rotate-180'
        )}
      />
    </button>
  )
}

SelectTrigger.displayName = 'SelectTrigger'

// Content Component (dropdown)
interface SelectContentProps {
  children: React.ReactNode
  className?: string
  position?: 'top' | 'bottom'
}

const SelectContent: React.FC<SelectContentProps> = ({ children, className = '', position = 'bottom' }) => {
  const { open, triggerRef, contentRef } = useSelectContext()
  const [style, setStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        top: position === 'bottom' ? rect.bottom + 4 : undefined,
        bottom: position === 'top' ? window.innerHeight - rect.top + 4 : undefined,
      })
    }
  }, [open, position, triggerRef])

  if (!open) return null

  return createPortal(
    <div
      ref={contentRef}
      style={style}
      className={cn(
        'z-[9999] bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
      role="listbox"
    >
      <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
        {children}
      </div>
    </div>,
    document.body
  )
}

SelectContent.displayName = 'SelectContent'

// Item Component
interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const SelectItem: React.FC<SelectItemProps> = ({ value: itemValue, children, className = '', disabled = false }) => {
  const { value, onValueChange } = useSelectContext()
  const isSelected = value === itemValue

  return (
    <div
      onClick={() => !disabled && onValueChange(itemValue)}
      className={cn(
        'flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors',
        'hover:bg-neutral-50 active:bg-neutral-100',
        isSelected && 'bg-[#A57865]/5 text-[#A57865] font-medium',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
    >
      <span className="truncate">{children}</span>
      {isSelected && (
        <Check className="w-4 h-4 text-[#A57865] flex-shrink-0 ml-2" />
      )}
    </div>
  )
}

SelectItem.displayName = 'SelectItem'

// Value Component (displays selected value or placeholder)
interface SelectValueProps {
  placeholder?: string
  className?: string
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder = 'Select...', className = '' }) => {
  const { value } = useSelectContext()

  return (
    <span className={cn(value ? 'text-neutral-900' : 'text-neutral-500', className)}>
      {value || placeholder}
    </span>
  )
}

SelectValue.displayName = 'SelectValue'

// Simple Dropdown Component - Easy to use replacement for native select
interface DropdownOption {
  value: string
  label: string
  disabled?: boolean
}

interface SimpleDropdownProps {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  triggerClassName = '',
}) => {
  const selectedOption = options.find(opt => opt.value === value)

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled} className={className}>
      <SelectTrigger className={triggerClassName}>
        {selectedOption?.label || placeholder}
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

SimpleDropdown.displayName = 'SimpleDropdown'

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SimpleDropdown,
}

export type { DropdownOption }

export default Select
