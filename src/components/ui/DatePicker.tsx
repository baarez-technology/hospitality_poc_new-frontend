import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { Calendar } from './Calendar';

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * DatePicker Component - Glimmora Design System
 * Premium enterprise date picker with warm luxury aesthetics,
 * glassmorphism popover, and refined micro-interactions.
 */
const DatePicker = ({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  className = '',
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);

  const parseISODate = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const formatYYYYMMDD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Format display value
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const date = parseISODate(dateStr) || new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const selectedDate = useMemo(() => parseISODate(value), [value]);
  const min = useMemo(() => parseISODate(minDate), [minDate]);
  const max = useMemo(() => parseISODate(maxDate), [maxDate]);

  // Auto-show next month when near month end (28th+) and no value selected
  const defaultMonth = useMemo(() => {
    if (selectedDate) return selectedDate;
    const today = new Date();
    if (today.getDate() >= 28) {
      return new Date(today.getFullYear(), today.getMonth() + 1, 1);
    }
    return today;
  }, [selectedDate]);

  const disabledMatchers = useMemo(() => {
    const matchers = [];
    if (min) matchers.push({ before: min });
    if (max) matchers.push({ after: max });
    return matchers.length ? matchers : undefined;
  }, [min, max]);

  return (
    <div className={cn('inline-block', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              // Premium trigger with refined styling
              'group relative w-full h-9 flex items-center gap-2 px-3.5',
              'rounded-lg bg-white text-[13px] cursor-pointer',
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
              // Open state
              open && [
                'border-terra-400/60 bg-gradient-to-r from-white to-terra-50/30',
                'ring-2 ring-terra-500/10 ring-offset-1',
              ],
              // Disabled state
              disabled && 'bg-neutral-50 cursor-not-allowed opacity-60 border-neutral-200'
            )}
          >
            {/* Calendar icon with animation */}
            <CalendarIcon
              className={cn(
                'w-4 h-4 flex-shrink-0 transition-all duration-200',
                value ? 'text-terra-500' : 'text-neutral-400',
                'group-hover:text-terra-600 group-hover:scale-105'
              )}
            />

            {/* Date text */}
            <span
              className={cn(
                'flex-1 text-[13px] truncate text-left transition-colors duration-200',
                value ? 'text-neutral-800 font-medium' : 'text-neutral-500'
              )}
            >
              {formatDisplayDate(value) || placeholder}
            </span>

            {/* Clear button (only when value exists) */}
            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.('');
                }}
                className={cn(
                  'p-1 -mr-1 rounded-md transition-all duration-150',
                  'text-neutral-400 hover:text-neutral-600',
                  'hover:bg-neutral-100 active:scale-90'
                )}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-3" align="start" sideOffset={6}>
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            defaultMonth={defaultMonth}
            onSelect={(date) => {
              if (!date) return;
              onChange?.(formatYYYYMMDD(date));
              setOpen(false);
            }}
            disabled={disabledMatchers}
            initialFocus
          />

          {/* Premium footer with actions */}
          <div
            className={cn(
              'flex items-center justify-between gap-3 mt-3 pt-3',
              'border-t border-gradient-to-r from-transparent via-terra-200/50 to-transparent'
            )}
          >
            <button
              type="button"
              onClick={() => {
                onChange?.('');
                setOpen(false);
              }}
              className={cn(
                'relative px-3 py-1.5 text-xs font-medium rounded-lg',
                'text-neutral-500 transition-all duration-200',
                'hover:text-neutral-700 hover:bg-neutral-100',
                'active:scale-95'
              )}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => {
                onChange?.(formatYYYYMMDD(new Date()));
                setOpen(false);
              }}
              className={cn(
                'group relative px-3 py-1.5 text-xs font-semibold rounded-lg',
                'text-terra-600 transition-all duration-200',
                'hover:text-terra-700 hover:bg-terra-50',
                'active:scale-95',
                // Underline animation on hover
                'after:absolute after:bottom-1 after:left-3 after:right-3',
                'after:h-px after:bg-terra-400/50',
                'after:scale-x-0 after:origin-left',
                'after:transition-transform after:duration-200',
                'hover:after:scale-x-100'
              )}
            >
              Today
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
