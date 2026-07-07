/**
 * FiltersBar Component
 * Filter button that opens a drawer with all filters - Glimmora Design System v5.0
 * Matches WOFilters/HousekeepingFilters pattern
 */

import { useState } from 'react';
import { Filter, Search, X, ChevronDown, Check } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'booking_com', label: 'Booking.com' },
  { value: 'google', label: 'Google' },
  { value: 'expedia', label: 'Expedia' },
  { value: 'tripadvisor', label: 'Tripadvisor' },
  { value: 'agoda', label: 'Agoda' },
  { value: 'direct', label: 'Direct' }
];

const RATING_OPTIONS = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' }
];

const SENTIMENT_OPTIONS = [
  { value: 'all', label: 'All Sentiments' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' }
];

// Filter Select for Drawer
function DrawerFilterSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = value === 'all' ? 'All' : selectedOption?.label;

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-10 px-4 rounded-lg text-[13px] bg-white border transition-all flex items-center justify-between ${
            isOpen
              ? 'border-terra-400 ring-2 ring-terra-500/10'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <span className="text-neutral-900">{displayLabel}</span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <div className="absolute z-[70] w-full mt-1.5 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                    value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                  }`}
                >
                  {option.label}
                  {value === option.value && (
                    <Check className="w-4 h-4 text-terra-500" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface FiltersBarProps {
  filters: {
    source: string;
    rating: string;
    sentimentRange: string;
    dateRange: string;
    keyword: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function FiltersBar({ filters, onFilterChange }: FiltersBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Count active filters (excluding search)
  const activeFilterCount = [
    filters.source !== 'all',
    filters.rating !== 'all',
    filters.sentimentRange !== 'all'
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0 || filters.keyword;

  const handleClearAll = () => {
    onFilterChange({
      source: 'all',
      rating: 'all',
      sentimentRange: 'all',
      dateRange: '30d',
      keyword: ''
    });
  };

  const handleApplyFilters = () => {
    setIsDrawerOpen(false);
  };

  // Custom header for drawer
  const renderHeader = () => (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">Filters</h2>
      <p className="text-[13px] text-neutral-500 mt-1">Filter reviews by source, rating, and sentiment</p>
    </div>
  );

  // Footer for drawer
  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="outline"
        onClick={handleClearAll}
        disabled={!hasActiveFilters}
        className="px-5 py-2 text-[13px] font-semibold text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
      >
        Clear All
      </Button>
      <Button
        variant="primary"
        onClick={handleApplyFilters}
        className="px-5 py-2 text-[13px] font-semibold"
      >
        Apply Filters
      </Button>
    </div>
  );

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-md">
        <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search reviews..."
          value={filters.keyword}
          onChange={(e) => onFilterChange({ ...filters, keyword: e.target.value })}
          className="w-full h-8 sm:h-9 pl-8 sm:pl-10 pr-3 sm:pr-4 border border-neutral-200 rounded-lg text-[12px] sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 hover:border-neutral-300 bg-white transition-all"
        />
        {filters.keyword && (
          <button
            onClick={() => onFilterChange({ ...filters, keyword: '' })}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" />
          </button>
        )}
      </div>

      {/* Filter Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={`h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-lg text-[12px] sm:text-[13px] font-medium flex items-center gap-1.5 sm:gap-2 transition-all duration-150 flex-shrink-0 ${
          activeFilterCount > 0
            ? 'bg-terra-50 border border-terra-300 text-terra-700'
            : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
        }`}
      >
        <Filter className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeFilterCount > 0 ? 'text-terra-500' : ''}`} />
        <span className="hidden sm:inline">Filters</span>
        {activeFilterCount > 0 && (
          <span className="min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 rounded-full bg-terra-500 text-white text-[10px] sm:text-[11px] font-semibold flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filters Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        header={renderHeader()}
        footer={renderFooter()}
        maxWidth="max-w-sm"
      >
        <div className="space-y-5">
          {/* Source Filter */}
          <DrawerFilterSelect
            label="Source"
            value={filters.source || 'all'}
            onChange={(value) => onFilterChange({ ...filters, source: value })}
            options={SOURCE_OPTIONS}
          />

          {/* Rating Filter */}
          <DrawerFilterSelect
            label="Rating"
            value={filters.rating || 'all'}
            onChange={(value) => onFilterChange({ ...filters, rating: value })}
            options={RATING_OPTIONS}
          />

          {/* Sentiment Filter */}
          <DrawerFilterSelect
            label="Sentiment"
            value={filters.sentimentRange || 'all'}
            onChange={(value) => onFilterChange({ ...filters, sentimentRange: value })}
            options={SENTIMENT_OPTIONS}
          />
        </div>
      </Drawer>
    </div>
  );
}
