import { forwardRef, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';

/**
 * Select Component
 * Custom dropdown select with consistent styling
 */
const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  wrapperClassName = '',
  ...props
}, ref) => {

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const selectRef = useRef(null);
  const buttonRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange?.(option.value);
    setIsOpen(false);
  };

  const dropdown = isOpen && createPortal(
    <div
      style={dropdownStyle}
      className="z-[9999] bg-white rounded-lg border border-neutral-200 py-1 animate-fadeIn max-h-60 overflow-auto shadow-lg"
    >
      {options.length === 0 ? (
        <div className="px-3 py-2 text-[13px] text-neutral-500">No options available</div>
      ) : (
        options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option)}
            className={`
              w-full text-left px-3 py-2 text-[14px] flex items-center justify-between
              transition-colors duration-100
              ${option.value === value
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-700 hover:bg-neutral-50'
              }
            `}
          >
            <span>{option.label}</span>
            {option.value === value && <Check className="w-4 h-4" />}
          </button>
        ))
      )}
    </div>,
    document.body
  );

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`} ref={selectRef}>
      {label && (
        <label className="block text-[13px] font-medium text-neutral-700">
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={(el) => {
            buttonRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full h-10 rounded-lg border text-[14px] text-left
            flex items-center justify-between px-3
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
            ${error
              ? 'border-error-300 focus:border-error-500 focus:ring-error-500/20'
              : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20'
            }
            ${isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}
            ${className}
          `}
          {...props}
        >
          <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdown}
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

Select.displayName = 'Select';

export default Select;
