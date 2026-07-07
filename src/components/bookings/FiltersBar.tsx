/**
 * FiltersBar Component
 * Dropdown filters for bookings - Glimmora Design System v5.0
 */

import { useState, useRef, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import DatePicker from '../ui2/DatePicker';

// Custom Select Component matching CMS pattern
function FilterSelect({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = value === 'all' ? placeholder : selectedOption?.label;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-2.5 sm:px-3.5 rounded-lg text-xs sm:text-[13px] bg-white border transition-all duration-150 flex items-center gap-1.5 sm:gap-2 focus:outline-none w-full sm:min-w-[140px] ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : value !== 'all'
              ? 'border-terra-300 bg-terra-50'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
      >
        <span className={value !== 'all' ? 'text-terra-700 font-medium' : 'text-neutral-500'}>
          {displayLabel}
        </span>
        <svg className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''} ${value !== 'all' ? 'text-terra-500' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden min-w-[160px]">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                  }`}
              >
                {option.label}
                {value === option.value && (
                  <svg className="w-4 h-4 text-terra-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Date Range Dropdown Component with Tailwind Calendar
function DateRangeFilter({ dateFrom, dateTo, onDateFromChange, onDateToChange, dateType = 'checkin', onDateTypeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const hasValue = dateFrom || dateTo;

  // Format display label
  const getDisplayLabel = () => {
    if (!dateFrom && !dateTo) return 'Date Range';
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const to = new Date(dateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${from} - ${to}`;
    }
    if (dateFrom) {
      const from = new Date(dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `From ${from}`;
    }
    const to = new Date(dateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `To ${to}`;
  };

  // Close on outside click - but ignore clicks on Radix popovers (DatePicker calendar)
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if click is inside a Radix popover portal (DatePicker calendar)
      const radixPopover = document.querySelector('[data-radix-popper-content-wrapper]');
      if (radixPopover && radixPopover.contains(event.target)) {
        return; // Don't close if clicking inside DatePicker calendar
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = (e) => {
    e.stopPropagation();
    onDateFromChange('');
    onDateToChange('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-2.5 sm:px-3.5 rounded-lg text-xs sm:text-[13px] bg-white border transition-all duration-150 flex items-center gap-1.5 sm:gap-2 focus:outline-none w-full sm:w-auto ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : hasValue
              ? 'border-terra-300 bg-terra-50'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
      >
        <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${hasValue ? 'text-terra-500' : 'text-neutral-400'}`} />
        <span className={`truncate ${hasValue ? 'text-terra-700 font-medium' : 'text-neutral-500'}`}>
          {getDisplayLabel()}
        </span>
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-1 p-0.5 rounded hover:bg-terra-200 text-terra-500"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        {!hasValue && (
          <svg className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''} text-neutral-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-1 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden w-[320px]"
        >
          <div className="p-4 space-y-4">
            {/* Date Type Toggle */}
            <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-lg">
              <button
                type="button"
                onClick={() => onDateTypeChange?.('checkin')}
                className={`flex-1 px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                  dateType === 'checkin'
                    ? 'bg-white text-terra-700 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Check-in
              </button>
              <button
                type="button"
                onClick={() => onDateTypeChange?.('checkout')}
                className={`flex-1 px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                  dateType === 'checkout'
                    ? 'bg-white text-terra-700 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Check-out
              </button>
            </div>

            <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              {dateType === 'checkout' ? 'Check-out Date Range' : 'Check-in Date Range'}
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-[12px] font-medium text-neutral-600">From</label>
                <DatePicker
                  value={dateFrom || ''}
                  onChange={onDateFromChange}
                  placeholder="Select start date"
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12px] font-medium text-neutral-600">To</label>
                <DatePicker
                  value={dateTo || ''}
                  onChange={onDateToChange}
                  placeholder="Select end date"
                  minDate={dateFrom || undefined}
                  className="w-full"
                />
              </div>
            </div>

            {/* Quick presets */}
            <div className="pt-3 border-t border-neutral-100">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                Quick Select
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Today', days: 0 },
                  { label: 'This Week', days: 7 },
                  { label: 'This Month', days: 30 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const from = today.toISOString().split('T')[0];
                      const to = new Date(today.getTime() + preset.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      onDateFromChange(from);
                      onDateToChange(to);
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-neutral-100 bg-neutral-50/50">
            <button
              type="button"
              onClick={() => {
                onDateFromChange('');
                onDateToChange('');
              }}
              className="px-3 py-1.5 text-[12px] font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-[12px] font-medium text-white bg-terra-500 hover:bg-terra-600 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FiltersBar({ filters, onFilterChange, onClearFilters, dateFilterType = 'checkin', onDateFilterTypeChange }) {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'IN_HOUSE', label: 'Checked In' },
    { value: 'COMPLETED', label: 'Checked Out' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' },
  ];

  const sourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'Direct', label: 'Direct' },
    { value: 'Website', label: 'Website' },
    { value: 'Booking.com', label: 'Booking.com' },
    { value: 'Expedia', label: 'Expedia' },
    { value: 'Hotels.com', label: 'Hotels.com' },
    { value: 'Corporate Portal', label: 'Corporate' },
  ];

  const hasActiveFilters = filters.status !== 'all' || filters.source !== 'all' || filters.dateFrom || filters.dateTo;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
      {/* Status Filter */}
      <div className="w-[calc(50%-4px)] sm:w-auto">
        <FilterSelect
          value={filters.status}
          onChange={(value) => onFilterChange('status', value)}
          options={statusOptions}
          placeholder="Status"
        />
      </div>

      {/* Source Filter */}
      <div className="w-[calc(50%-4px)] sm:w-auto">
        <FilterSelect
          value={filters.source}
          onChange={(value) => onFilterChange('source', value)}
          options={sourceOptions}
          placeholder="Source"
        />
      </div>

      {/* Date Range Filter */}
      <div className="w-full sm:w-auto">
        <DateRangeFilter
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateFromChange={(value) => onFilterChange('dateFrom', value)}
          onDateToChange={(value) => onFilterChange('dateTo', value)}
          dateType={dateFilterType}
          onDateTypeChange={onDateFilterTypeChange}
        />
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="h-9 px-2 sm:px-3 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[13px] font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Clear</span>
          <span className="hidden sm:inline">All</span>
        </button>
      )}
    </div>
  );
}
