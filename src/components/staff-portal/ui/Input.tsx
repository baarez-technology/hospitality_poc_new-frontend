import { forwardRef, ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  wrapperClassName?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    hint,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    wrapperClassName = '',
    type = 'text',
    ...props
  }, ref) => {
    const hasIcon = !!Icon;

    return (
      <div className={wrapperClassName}>
        {label && (
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
            {label}
            {props.required && <span className="text-rose-600 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {hasIcon && iconPosition === 'left' && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`
              w-full px-4 py-3 rounded-[var(--brand-radius-md)] border transition-all duration-200
              text-[13px] text-neutral-800 placeholder:text-neutral-400
              focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)]
              disabled:bg-neutral-50 disabled:cursor-not-allowed
              ${error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : 'border-neutral-200'}
              ${hasIcon && iconPosition === 'left' ? 'pl-11' : ''}
              ${hasIcon && iconPosition === 'right' ? 'pr-11' : ''}
              ${className}
            `}
            {...props}
          />
          {hasIcon && iconPosition === 'right' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-[11px] text-rose-600 mt-1.5 font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-[11px] text-neutral-400 mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  wrapperClassName?: string;
  rows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({
    label,
    error,
    hint,
    className = '',
    wrapperClassName = '',
    rows = 4,
    ...props
  }, ref) => {
    return (
      <div className={wrapperClassName}>
        {label && (
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
            {label}
            {props.required && <span className="text-rose-600 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full px-4 py-3 rounded-[var(--brand-radius-md)] border transition-all duration-200
            text-[13px] text-neutral-800 placeholder:text-neutral-400 resize-none
            focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)]
            disabled:bg-neutral-50 disabled:cursor-not-allowed
            ${error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : 'border-neutral-200'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-[11px] text-rose-600 mt-1.5 font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-[11px] text-neutral-400 mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectOption {
  value: string;
  label: string;
}

export const Select = forwardRef<HTMLSelectElement, {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({
    label,
    error,
    hint,
    options = [],
    placeholder = 'Select an option',
    className = '',
    wrapperClassName = '',
    ...props
  }, ref) => {
    return (
      <div className={wrapperClassName}>
        {label && (
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
            {label}
            {props.required && <span className="text-rose-600 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-[var(--brand-radius-md)] border transition-all duration-200
            text-[13px] text-neutral-800 bg-white
            focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)]
            disabled:bg-neutral-50 disabled:cursor-not-allowed
            ${error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : 'border-neutral-200'}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-[11px] text-rose-600 mt-1.5 font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-[11px] text-neutral-400 mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export const Checkbox = forwardRef<HTMLInputElement, {
  label?: string;
  description?: string;
  error?: string;
  className?: string;
  wrapperClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>>(
  ({
    label,
    description,
    error,
    className = '',
    wrapperClassName = '',
    ...props
  }, ref) => {
    return (
      <div className={`flex items-start gap-3 ${wrapperClassName}`}>
        <input
          ref={ref}
          type="checkbox"
          className={`
            w-4 h-4 mt-0.5 rounded border-neutral-200 text-[var(--brand-primary)]
            focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        <div className="flex-1">
          {label && (
            <label className="text-[13px] font-medium text-neutral-800 cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-[11px] text-neutral-400 mt-0.5">{description}</p>
          )}
          {error && (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export const SearchInput = forwardRef<HTMLInputElement, {
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  onClear?: () => void;
  value?: string;
} & React.InputHTMLAttributes<HTMLInputElement>>(
  ({
    placeholder = 'Search...',
    className = '',
    wrapperClassName = '',
    onClear,
    value,
    ...props
  }, ref) => {
    return (
      <div className={`relative ${wrapperClassName}`}>
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          className={`
            w-full pl-11 pr-10 py-3 rounded-[var(--brand-radius-md)] border border-neutral-200
            text-[13px] text-neutral-800 placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)]
            transition-all duration-200
            ${className}
          `}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default Input;




