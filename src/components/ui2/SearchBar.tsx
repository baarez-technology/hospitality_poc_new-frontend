import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Search, X, Filter, ChevronDown, Calendar, SlidersHorizontal } from 'lucide-react';
import { Button } from './Button';

/**
 * Glimmora Design System v4.0 - Search Bar
 * Advanced search with filters and quick actions
 */

// Basic Search Bar
export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className,
  size = 'md',
  autoFocus,
}) {
  const inputRef = useRef(null);

  const sizes = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-sm',
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'appearance-none w-full pl-9 pr-9 bg-white border border-neutral-200 rounded-lg ',
          'text-neutral-900 placeholder:text-neutral-400',
          'transition-all duration-150',
          'focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10',
          'hover:border-neutral-300 ',
          sizes[size]
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onClear?.();
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Advanced Search with Filters
export function AdvancedSearch({
  value,
  onChange,
  onClear,
  filters,
  onFilterChange,
  placeholder = 'Search...',
  className,
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Input with Filter Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'w-full h-9 pl-9 pr-9 bg-white border border-neutral-200 rounded-lg',
              'text-sm text-neutral-900 placeholder:text-neutral-400',
              'transition-all duration-150',
              'focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10',
              'hover:border-neutral-300'
            )}
          />
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant={showFilters ? 'outline' : 'subtle'}
          size="md"
          icon={SlidersHorizontal}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
          {filters && Object.values(filters).some(v => v) && (
            <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Filters</span>
            <button
              onClick={() => onFilterChange?.({})}
              className="text-xs font-medium text-terra-600 hover:text-terra-700 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Filter controls would go here - passed as children or config */}
          </div>
        </div>
      )}
    </div>
  );
}

// Filter Chip
export function FilterChip({
  label,
  value,
  onRemove,
  className,
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg',
      'bg-terra-50 text-terra-700 border border-terra-200',
      'text-xs font-medium',
      className
    )}>
      <span className="text-neutral-500">{label}:</span>
      {value}
      <button
        onClick={onRemove}
        className="hover:bg-terra-100 rounded-full p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// Active Filters Display
export function ActiveFilters({
  filters, // { key: { label, value } }
  onRemove,
  onClearAll,
  className,
}) {
  const activeFilters = Object.entries(filters).filter(([_, v]) => v?.value);

  if (activeFilters.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {activeFilters.map(([key, { label, value }]) => (
        <FilterChip
          key={key}
          label={label}
          value={value}
          onRemove={() => onRemove(key)}
        />
      ))}
      <button
        onClick={onClearAll}
        className="text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

// Quick Filter Buttons
export function QuickFilters({
  options, // { value, label, count }
  value,
  onChange,
  className,
}) {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-1', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap',
            'transition-all duration-150 border',
            value === option.value
              ? 'bg-terra-500 text-white border-terra-500'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-bold',
              value === option.value ? 'bg-white/20' : 'bg-neutral-100'
            )}>
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// Date Range Quick Select
export function DateRangeQuickSelect({
  value,
  onChange,
  className,
}) {
  const ranges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className={cn('inline-flex items-center border border-neutral-200 rounded-lg overflow-hidden', className)}>
      {ranges.map((range, index) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium transition-colors',
            index > 0 && 'border-l border-neutral-200',
            value === range.value
              ? 'bg-terra-500 text-white'
              : 'bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
