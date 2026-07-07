import { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';

/**
 * Checkbox Component
 * Clean checkbox with label support
 */
const Checkbox = forwardRef(({
  label,
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  className = '',
  ...props
}, ref) => {

  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked, e)}
          className="sr-only peer"
          {...props}
        />
        <div className={`
          w-[18px] h-[18px] rounded-md border-2 transition-all duration-150
          flex items-center justify-center
          ${checked || indeterminate
            ? 'bg-primary-500 border-primary-500'
            : 'bg-white border-neutral-300 peer-hover:border-neutral-400'
          }
          peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2
        `}>
          {indeterminate ? (
            <Minus className="w-3 h-3 text-white" strokeWidth={3} />
          ) : checked ? (
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          ) : null}
        </div>
      </div>
      {label && (
        <span className="text-[14px] text-neutral-700 select-none">{label}</span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

/**
 * Radio Component
 */
const Radio = forwardRef(({
  label,
  checked = false,
  disabled = false,
  onChange,
  name,
  value,
  className = '',
  ...props
}, ref) => {

  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value, e)}
          className="sr-only peer"
          {...props}
        />
        <div className={`
          w-[18px] h-[18px] rounded-full border-2 transition-all duration-150
          flex items-center justify-center
          ${checked
            ? 'border-primary-500'
            : 'border-neutral-300 peer-hover:border-neutral-400'
          }
          peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2
        `}>
          {checked && (
            <div className="w-2 h-2 rounded-full bg-primary-500" />
          )}
        </div>
      </div>
      {label && (
        <span className="text-[14px] text-neutral-700 select-none">{label}</span>
      )}
    </label>
  );
});

Radio.displayName = 'Radio';

/**
 * Toggle/Switch Component
 */
const Toggle = forwardRef(({
  label,
  checked = false,
  disabled = false,
  onChange,
  size = 'md',
  className = '',
  ...props
}, ref) => {

  const sizes = {
    sm: { track: 'w-8 h-5', thumb: 'w-3 h-3', translate: 'translate-x-3.5' },
    md: { track: 'w-10 h-6', thumb: 'w-4 h-4', translate: 'translate-x-4' },
    lg: { track: 'w-12 h-7', thumb: 'w-5 h-5', translate: 'translate-x-5' },
  };

  const s = sizes[size];

  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked, e)}
          className="sr-only peer"
          {...props}
        />
        <div className={`
          ${s.track} rounded-full transition-colors duration-200
          ${checked ? 'bg-primary-500' : 'bg-neutral-200'}
          peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2
        `}>
          <div className={`
            ${s.thumb} rounded-full bg-white
            transform transition-transform duration-200
            absolute top-1 left-1
            ${checked ? s.translate : 'translate-x-0'}
          `} />
        </div>
      </div>
      {label && (
        <span className="text-[14px] text-neutral-700 select-none">{label}</span>
      )}
    </label>
  );
});

Toggle.displayName = 'Toggle';

export { Checkbox, Radio, Toggle };
export default Checkbox;
