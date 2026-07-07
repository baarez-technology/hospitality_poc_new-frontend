/**
 * GuestsFilters Component
 * Dropdown filters for guests - Glimmora Design System v5.0
 * Matches CMS SearchFiltersBar pattern
 */

import { useState, useRef, useEffect } from 'react';
import { X, Globe, Heart, UserCheck, Crown } from 'lucide-react';

// Custom Filter Select Component matching CMS pattern
function FilterSelect({ value, onChange, options, placeholder, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = value === 'all' ? placeholder : selectedOption?.label;

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-2.5 sm:px-3.5 rounded-[8px] text-xs sm:text-[13px] bg-white border transition-all duration-150 flex items-center gap-1.5 sm:gap-2 focus:outline-none w-full sm:min-w-[140px] ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : value !== 'all'
            ? 'border-terra-300 bg-terra-50'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        {Icon && <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${value !== 'all' ? 'text-terra-500' : 'text-neutral-400'}`} />}
        <span className={`truncate ${value !== 'all' ? 'text-terra-700 font-medium' : 'text-neutral-600'}`}>
          {displayLabel}
        </span>
        <svg className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''} ${value !== 'all' ? 'text-terra-500' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1.5 bg-white rounded-[8px] border border-neutral-200 shadow-lg overflow-hidden min-w-[160px] max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                  value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
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

export default function GuestsFilters({ filters, onFilterChange, onClearFilters, countries, hasActiveFilters }) {
  const emotionOptions = [
    { value: 'all', label: 'All Emotions' },
    { value: 'positive', label: 'Positive' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negative', label: 'Negative' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'vip', label: 'VIP' },
    { value: 'normal', label: 'Normal' },
    { value: 'review', label: 'Needs Review' },
    { value: 'blacklisted', label: 'Blacklisted' }
  ];

  const countryOptions = [
    { value: 'all', label: 'All Countries' },
    ...countries.map(country => ({ value: country, label: country }))
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
      {/* Country Filter */}
      <div className="w-[calc(50%-4px)] sm:w-auto">
        <FilterSelect
          value={filters.country}
          onChange={(value) => onFilterChange('country', value)}
          options={countryOptions}
          placeholder="All Countries"
          icon={Globe}
        />
      </div>

      {/* Emotion Filter */}
      <div className="w-[calc(50%-4px)] sm:w-auto">
        <FilterSelect
          value={filters.emotion}
          onChange={(value) => onFilterChange('emotion', value)}
          options={emotionOptions}
          placeholder="All Emotions"
          icon={Heart}
        />
      </div>

      {/* Status Filter */}
      <div className="w-[calc(50%-4px)] sm:w-auto">
        <FilterSelect
          value={filters.status}
          onChange={(value) => onFilterChange('status', value)}
          options={statusOptions}
          placeholder="All Statuses"
          icon={UserCheck}
        />
      </div>

      {/* VIP Level Filter */}
      <div className="w-[calc(50%-4px)] sm:w-auto">
        <FilterSelect
          value={filters.vipLevel}
          onChange={(value) => onFilterChange('vipLevel', value)}
          options={[
            { value: 'all', label: 'All VIP Levels' },
            { value: 'VIP1', label: '⭐ VIP 1' },
            { value: 'VIP2', label: '⭐ VIP 2' },
            { value: 'VIP3', label: '🌟 VIP 3' },
            { value: 'VIP4', label: '🌟 VIP 4' },
            { value: 'VIP5', label: '💎 VIP 5' },
          ]}
          placeholder="All VIP Levels"
          icon={Crown}
        />
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="h-9 px-2 sm:px-3 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[13px] font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-[8px] transition-colors"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Clear</span>
          <span className="hidden sm:inline">All</span>
        </button>
      )}
    </div>
  );
}
