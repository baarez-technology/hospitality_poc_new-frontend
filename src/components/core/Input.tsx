import { forwardRef } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

/**
 * Input Component
 * Clean form input with label and error state
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  type = 'text',
  required = false,
  disabled = false,
  className = '',
  wrapperClassName = '',
  ...props
}, ref) => {

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && (
        <label className="block text-[13px] font-medium text-neutral-700">
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        )}

        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          className={`
            w-full h-10 rounded-lg border text-[14px] text-neutral-900
            placeholder:text-neutral-400
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
            ${Icon && iconPosition === 'left' ? 'pl-10' : 'pl-3'}
            ${isPassword || (Icon && iconPosition === 'right') ? 'pr-10' : 'pr-3'}
            ${error
              ? 'border-error-300 focus:border-error-500 focus:ring-error-500/20'
              : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20'
            }
            ${className}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {Icon && iconPosition === 'right' && !isPassword && (
          <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        )}
      </div>

      {(error || helperText) && (
        <p className={`text-[12px] flex items-center gap-1 ${error ? 'text-error-600' : 'text-neutral-500'}`}>
          {error && <AlertCircle className="w-3 h-3" />}
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Textarea Component
 */
const Textarea = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  wrapperClassName = '',
  ...props
}, ref) => {

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && (
        <label className="block text-[13px] font-medium text-neutral-700">
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={`
          w-full rounded-lg border px-3 py-2.5 text-[14px] text-neutral-900
          placeholder:text-neutral-400
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
          resize-none
          ${error
            ? 'border-error-300 focus:border-error-500 focus:ring-error-500/20'
            : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20'
          }
          ${className}
        `}
        {...props}
      />

      {(error || helperText) && (
        <p className={`text-[12px] flex items-center gap-1 ${error ? 'text-error-600' : 'text-neutral-500'}`}>
          {error && <AlertCircle className="w-3 h-3" />}
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Input, Textarea };
export default Input;
