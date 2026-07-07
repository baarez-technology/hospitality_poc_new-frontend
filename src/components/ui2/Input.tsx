import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { Search, Eye, EyeOff, X, ChevronDown, Check } from 'lucide-react';

/**
 * Glimmora Design System v5.0 - Input Components
 * Form inputs with dynamic branding and consistent styling
 */

const SIZE = {
  sm: 'h-8 px-3 text-xs rounded-[var(--brand-radius-sm)]',
  md: 'h-9 px-3.5 text-sm rounded-[var(--brand-radius-md)]',
  lg: 'h-10 px-4 text-sm rounded-[var(--brand-radius-lg)]',
  xl: 'h-12 px-4 text-base rounded-[var(--brand-radius-xl)]',
};

const baseStyles = `
  w-full bg-white border border-neutral-200
  text-neutral-900 placeholder:text-neutral-400
  transition-all duration-150
  focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10
  disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
  hover:border-neutral-300
`;

// Basic Input
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  error?: string;
  icon?: any;
  iconRight?: any;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  className,
  size = 'md',
  error,
  icon: Icon,
  iconRight: IconRight,
  onClear,
  ...props
}, ref) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          baseStyles,
          SIZE[size],
          Icon && 'pl-9',
          (IconRight || onClear) && 'pr-9',
          error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10',
          className
        )}
        {...props}
      />
      {IconRight && !onClear && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          <IconRight className="w-4 h-4" />
        </div>
      )}
      {onClear && props.value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

// Password Input with toggle
export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(function PasswordInput({
  className,
  size = 'md',
  error,
  ...props
}, ref) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={show ? 'text' : 'password'}
        className={cn(
          baseStyles,
          SIZE[size],
          'pr-10',
          error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10',
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
});

// Search Input
export interface SearchInputProps extends Omit<InputProps, 'icon'> {
  // additional props if needed
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput({
  className,
  size = 'md',
  onClear,
  placeholder = 'Search...',
  ...props
}, ref) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className={cn(
          baseStyles,
          SIZE[size],
          'pl-9',
          props.value && 'pr-9',
          className
        )}
        {...props}
      />
      {props.value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

// Select Input
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({
  className,
  size = 'md',
  error,
  placeholder,
  children,
  ...props
}, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          baseStyles,
          SIZE[size],
          'pr-10 appearance-none cursor-pointer',
          error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10',
          !props.value && 'text-neutral-400',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
    </div>
  );
});

// Textarea
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  className,
  error,
  rows = 4,
  ...props
}, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full bg-white border border-neutral-200 rounded-[var(--brand-radius-card)] px-3.5 py-2.5',
        'text-sm text-neutral-900 placeholder:text-neutral-400',
        'transition-all duration-150 resize-none',
        'focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10',
        'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed',
        'hover:border-neutral-300',
        error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10',
        className
      )}
      {...props}
    />
  );
});

// Checkbox
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({
  className,
  label,
  description,
  error,
  ...props
}, ref) {
  return (
    <label className={cn('flex items-start gap-3 cursor-pointer group', className)}>
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          ref={ref}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div className={cn(
          'w-4 h-4 rounded border-2 border-neutral-300 bg-white',
          'transition-all duration-150',
          'peer-hover:border-[var(--brand-primary)]',
          'peer-focus:ring-2 peer-focus:ring-[var(--brand-primary)]/20',
          'peer-checked:bg-[var(--brand-primary)] peer-checked:border-[var(--brand-primary)]',
          'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
          error && 'border-rose-300'
        )} />
        <Check className="absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
      </div>
      {(label || description) && (
        <div className="flex-1">
          {label && <p className="text-[13px] font-medium text-neutral-900 group-hover:text-neutral-700">{label}</p>}
          {description && <p className="text-[11px] text-neutral-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
});

// Radio Button
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({
  className,
  label,
  description,
  ...props
}, ref) {
  return (
    <label className={cn('flex items-start gap-3 cursor-pointer group', className)}>
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          ref={ref}
          type="radio"
          className="peer sr-only"
          {...props}
        />
        <div className={cn(
          'w-4 h-4 rounded-full border-2 border-neutral-300 bg-white',
          'transition-all duration-150',
          'peer-hover:border-[var(--brand-primary)]',
          'peer-focus:ring-2 peer-focus:ring-[var(--brand-primary)]/20',
          'peer-checked:border-[var(--brand-primary)]',
          'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed'
        )} />
        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-[var(--brand-primary)] scale-0 peer-checked:scale-100 transition-transform" />
      </div>
      {(label || description) && (
        <div className="flex-1">
          {label && <p className="text-[13px] font-medium text-neutral-900 group-hover:text-neutral-700">{label}</p>}
          {description && <p className="text-[11px] text-neutral-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
});

// Form Field Wrapper with label and error
interface FormFieldProps {
  className?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  className,
  label,
  description,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-[13px] font-medium text-neutral-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {description && (
        <p className="text-[11px] text-neutral-400 font-medium -mt-1">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1">{error}</p>
      )}
    </div>
  );
}

// Input Group
interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function InputGroup({ children, className }: InputGroupProps) {
  return (
    <div
      className={cn(
        'flex items-center',
        '[&>*]:rounded-none',
        '[&>*:first-child]:rounded-l-lg',
        '[&>*:last-child]:rounded-r-lg',
        '[&>*:not(:last-child)]:border-r-0',
        className
      )}
    >
      {children}
    </div>
  );
}

// Input Addon (prefix/suffix for input group)
interface InputAddonProps {
  children: React.ReactNode;
  className?: string;
  position?: 'left' | 'right';
}

export function InputAddon({ children, className, position = 'left' }: InputAddonProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center px-3 h-9',
        'bg-neutral-100 border border-neutral-200',
        'text-sm text-neutral-500',
        position === 'left' ? 'border-r-0 rounded-l-lg' : 'border-l-0 rounded-r-lg',
        className
      )}
    >
      {children}
    </div>
  );
}

// Custom Select Dropdown with styled options
interface SelectOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function SelectDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  size = 'md',
  disabled = false,
  className,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const calculatePosition = (triggerRect: DOMRect, menuHeight = 240) => {
    const padding = 4;
    const spaceBelow = window.innerHeight - triggerRect.bottom - padding;
    const spaceAbove = triggerRect.top - padding;

    let top;
    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      top = triggerRect.top - Math.min(menuHeight, spaceAbove) - padding;
    } else {
      top = triggerRect.bottom + padding;
    }

    return {
      top,
      left: triggerRect.left,
      width: triggerRect.width,
    };
  };

  const handleToggle = () => {
    if (disabled) return;
    if (open) {
      setOpen(false);
      setPosition(null);
    } else {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition(calculatePosition(rect));
        setOpen(true);
      }
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
    setPosition(null);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setPosition(null);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setPosition(null);
      }
    };

    const handleScroll = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition(calculatePosition(rect));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-3.5 text-sm',
    lg: 'h-10 px-4 text-sm',
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'w-full bg-white border border-neutral-200 rounded-[var(--brand-radius-md)]',
          'flex items-center justify-between gap-2',
          'transition-all duration-150',
          'focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10',
          'hover:border-neutral-300',
          'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed',
          open && 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/10',
          sizeClasses[size],
          className
        )}
      >
        <span className={cn(
          'truncate',
          selectedOption ? 'text-neutral-900' : 'text-neutral-400'
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200',
          open && 'rotate-180'
        )} />
      </button>

      {open && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            zIndex: 9999,
          }}
          className={cn(
            'bg-white rounded-[var(--brand-radius-md)]',
            'border border-neutral-200',
            'shadow-lg shadow-neutral-900/10',
            'overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 duration-100'
          )}
        >
          <div className="max-h-[240px] overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2',
                  'text-[13px] font-medium text-left',
                  'transition-colors duration-100',
                  'hover:bg-neutral-100',
                  value === option.value && 'bg-neutral-100 text-neutral-900'
                )}
              >
                <span className="flex-1">{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-neutral-600" />
                )}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}





