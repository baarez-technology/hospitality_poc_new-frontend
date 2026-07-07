/**
 * MonthYearPicker Component
 * Popover with year navigator + 3x4 month grid for quick date jumping
 * Glimmora Design System v5.0
 */

import { useState, useCallback, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/Popover';
import { cn } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthYearPickerProps {
  /** Currently displayed month (0-11) */
  currentMonth: number;
  /** Currently displayed year */
  currentYear: number;
  /** Called when user selects a month/year */
  onSelect: (month: number, year: number) => void;
  /** Popover alignment */
  align?: 'start' | 'center' | 'end';
  /** Trigger element */
  children: ReactNode;
}

export function MonthYearPicker({
  currentMonth,
  currentYear,
  onSelect,
  align = 'center',
  children,
}: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const [browseYear, setBrowseYear] = useState(currentYear);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen) setBrowseYear(currentYear);
    setOpen(isOpen);
  }, [currentYear]);

  const handleMonthSelect = (monthIndex: number) => {
    onSelect(monthIndex, browseYear);
    setOpen(false);
  };

  const isCurrentSelection = (monthIndex: number) =>
    monthIndex === currentMonth && browseYear === currentYear;

  const now = new Date();
  const isCurrentMonth = (monthIndex: number) =>
    monthIndex === now.getMonth() && browseYear === now.getFullYear();

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-3" align={align} sideOffset={6}>
        {/* Year Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setBrowseYear(y => y - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:bg-terra-50 hover:text-terra-700 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-neutral-800 select-none">
            {browseYear}
          </span>
          <button
            type="button"
            onClick={() => setBrowseYear(y => y + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-500 hover:bg-terra-50 hover:text-terra-700 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3x4 Month Grid */}
        <div className="grid grid-cols-3 gap-1">
          {MONTHS.map((name, idx) => {
            const selected = isCurrentSelection(idx);
            const today = isCurrentMonth(idx);

            return (
              <button
                key={name}
                type="button"
                onClick={() => handleMonthSelect(idx)}
                className={cn(
                  'px-2 py-2 text-[13px] font-medium rounded-lg transition-all',
                  !selected && !today && 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900',
                  !selected && today && 'text-terra-600 border border-terra-200 hover:bg-terra-50',
                  selected && 'bg-terra-500 text-white font-semibold shadow-sm',
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
