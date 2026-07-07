import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function FiltersBar({ filters, onFilterChange, onClearFilters }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_HOUSE', label: 'Checked In' },
    { value: 'COMPLETED', label: 'Checked Out' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO-SHOW', label: 'No Show' },
  ];

  const sourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'Website', label: 'Website' },
    { value: 'Dummy Channel Manager', label: 'Dummy Channel Manager' },
    { value: 'CRS', label: 'CRS' },
    { value: 'Booking.com', label: 'Booking.com' },
    { value: 'Expedia', label: 'Expedia' },
    { value: 'Walk-in', label: 'Walk-in' },
  ];

  const hasActiveFilters = filters.status !== 'all' || filters.source !== 'all' || filters.dateFrom || filters.dateTo;

  const getSelectedLabel = (type) => {
    if (type === 'status') {
      const option = statusOptions.find((opt) => opt.value === filters.status);
      return option?.label || 'Status';
    }
    if (type === 'source') {
      const option = sourceOptions.find((opt) => opt.value === filters.source);
      return option?.label || 'Source';
    }
    if (type === 'date') {
      if (filters.dateFrom && filters.dateTo) {
        return `${filters.dateFrom} to ${filters.dateTo}`;
      }
      if (filters.dateFrom) {
        return `From ${filters.dateFrom}`;
      }
      if (filters.dateTo) {
        return `To ${filters.dateTo}`;
      }
      return 'Date Range';
    }
    return '';
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('status')}
            className={`h-11 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              filters.status !== 'all'
                ? 'bg-[#A57865]/10 border-[#A57865] text-[#A57865]'
                : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#A57865]/30'
            }`}
          >
            {getSelectedLabel('status')}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'status' ? 'rotate-180' : ''}`} />
          </button>

        {activeDropdown === 'status' && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onFilterChange('status', option.value);
                  setActiveDropdown(null);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  filters.status === option.value
                    ? 'bg-[#A57865]/10 text-[#A57865] font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Source Filter */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('source')}
          className={`h-11 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
            filters.source !== 'all'
              ? 'bg-[#A57865]/10 border-[#A57865] text-[#A57865]'
              : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#A57865]/30'
          }`}
        >
          {getSelectedLabel('source')}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'source' ? 'rotate-180' : ''}`} />
        </button>

        {activeDropdown === 'source' && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
            {sourceOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onFilterChange('source', option.value);
                  setActiveDropdown(null);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  filters.source === option.value
                    ? 'bg-[#A57865]/10 text-[#A57865] font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('date')}
          className={`h-11 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
            filters.dateFrom || filters.dateTo
              ? 'bg-[#A57865]/10 border-[#A57865] text-[#A57865]'
              : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#A57865]/30'
          }`}
        >
          {getSelectedLabel('date')}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'date' ? 'rotate-180' : ''}`} />
        </button>

        {activeDropdown === 'date' && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 p-4 z-50">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F6] border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F6] border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
                />
              </div>
              <button
                onClick={() => setActiveDropdown(null)}
                className="w-full px-4 py-2 bg-[#A57865] hover:bg-[#8E6554] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="h-11 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition-all duration-200 flex items-center gap-2 group whitespace-nowrap"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
