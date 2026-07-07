import React from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './DropdownMenu';

/**
 * Dropdown Component - Glimmora Design System
 * Premium enterprise dropdown with warm luxury aesthetics,
 * refined trigger styling, and smooth micro-interactions.
 */
const Dropdown = ({
  trigger,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  position = 'bottom-left',
  disabled = false,
  showCheckmark = true,
  width = 'auto',
  className = '',
}) => {
  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;
  const hasValue = selectedOption && selectedOption.value !== 'all';

  const positionMap = {
    'bottom-left': { side: 'bottom', align: 'start' },
    'bottom-right': { side: 'bottom', align: 'end' },
    'top-left': { side: 'top', align: 'start' },
    'top-right': { side: 'top', align: 'end' },
  };
  const { side, align } = positionMap[position] || positionMap['bottom-left'];

  // Width classes
  const widthClasses = {
    auto: 'min-w-[200px] max-w-[280px]',
    full: 'w-full',
    small: 'w-48',
    medium: 'w-[200px]',
    large: 'w-80',
  };

  return (
    <div className={cn('relative inline-block', widthClasses[width], className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          {trigger ? (
            <span className={disabled ? 'opacity-50 pointer-events-none' : ''}>
              {trigger}
            </span>
          ) : (
            <button
              type="button"
              disabled={disabled}
              className={cn(
                // Premium trigger matching DatePicker
                'group relative w-full h-11 flex items-center justify-between gap-2 px-3.5',
                'rounded-xl bg-white text-sm cursor-pointer',
                'transition-all duration-200 ease-out',
                // Refined border with warm inner glow
                'border border-neutral-200/80',
                'shadow-[inset_0_1px_2px_rgba(165,120,101,0.04),0_1px_2px_rgba(0,0,0,0.02)]',
                // Hover state
                'hover:border-terra-300/60 hover:bg-gradient-to-r hover:from-white hover:to-terra-50/30',
                'hover:shadow-[inset_0_1px_2px_rgba(165,120,101,0.06),0_2px_4px_rgba(165,120,101,0.08)]',
                // Focus state
                'focus:outline-none focus:border-terra-400/60',
                'focus:ring-2 focus:ring-terra-500/10 focus:ring-offset-1',
                // Open state styling via data attribute
                'data-[state=open]:border-terra-400/60 data-[state=open]:bg-gradient-to-r data-[state=open]:from-white data-[state=open]:to-terra-50/30',
                'data-[state=open]:ring-2 data-[state=open]:ring-terra-500/10 data-[state=open]:ring-offset-1',
                // Disabled state
                disabled && 'bg-neutral-50 cursor-not-allowed opacity-60 border-neutral-200'
              )}
            >
              <span
                className={cn(
                  'flex-1 text-[13px] truncate text-left transition-colors duration-200',
                  hasValue ? 'text-neutral-800 font-medium' : 'text-neutral-500'
                )}
              >
                {displayValue}
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-all duration-200',
                  hasValue ? 'text-terra-500' : 'text-neutral-400',
                  'group-hover:text-terra-600',
                  'group-data-[state=open]:rotate-180 group-data-[state=open]:text-terra-600'
                )}
              />
            </button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={side}
          align={align}
          sideOffset={6}
          className={widthClasses[width]}
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-500 text-center">
              No options available
            </div>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === value;
              const isDisabled = option.disabled;

              if (option.divider) {
                return <DropdownMenuSeparator key={`divider-${String(option.value)}`} />;
              }

              return (
                <DropdownMenuItem
                  key={String(option.value)}
                  disabled={isDisabled}
                  onSelect={(e) => {
                    if (!isDisabled) onChange?.(option.value);
                  }}
                  className={cn(
                    'group/option',
                    isSelected && [
                      'bg-gradient-to-r from-terra-50/80 to-copper-50/40',
                      'before:h-5 before:bg-terra-500',
                    ]
                  )}
                  style={{
                    animationDelay: `${index * 20}ms`,
                  }}
                >
                  {option.icon && (
                    <span
                      className={cn(
                        'flex-shrink-0 transition-all duration-200',
                        isSelected
                          ? 'text-terra-600'
                          : 'text-neutral-400 group-hover/option:text-terra-500 group-hover/option:scale-110'
                      )}
                    >
                      {option.icon}
                    </span>
                  )}

                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        'text-[13px] transition-colors duration-200',
                        isSelected
                          ? 'font-semibold text-terra-700'
                          : 'text-neutral-700 group-hover/option:text-neutral-900'
                      )}
                    >
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-xs text-neutral-400 mt-0.5 truncate">
                        {option.description}
                      </div>
                    )}
                  </div>

                  {showCheckmark && isSelected && (
                    <Check
                      className="w-4 h-4 text-terra-600 flex-shrink-0"
                      strokeWidth={2.5}
                    />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

Dropdown.propTypes = {
  trigger: PropTypes.node,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
      description: PropTypes.string,
      icon: PropTypes.node,
      disabled: PropTypes.bool,
      divider: PropTypes.bool,
    })
  ),
  value: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  position: PropTypes.oneOf(['bottom-left', 'bottom-right', 'top-left', 'top-right']),
  disabled: PropTypes.bool,
  showCheckmark: PropTypes.bool,
  width: PropTypes.oneOf(['auto', 'full', 'small', 'medium', 'large']),
  className: PropTypes.string,
};

export default Dropdown;
