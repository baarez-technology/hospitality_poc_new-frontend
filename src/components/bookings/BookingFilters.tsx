import { useState, useRef, useEffect } from 'react';
import {
  Search, ChevronDown, X, Calendar,
  Hotel, Globe, Tag, LayoutGrid, List, Sliders
} from 'lucide-react';

/**
 * Premium Booking Filters Panel
 * Refined filtering with date presets and modern styling
 */
export default function BookingFilters({
  filters,
  onFilterChange,
  onClearFilters,
  searchQuery,
  onSearchChange,
  viewDensity = 'comfortable',
  onViewDensityChange
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const dropdownRef = useRef(null);

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
    { value: 'all', label: 'All Status', count: null },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-ocean-500' },
    { value: 'PENDING', label: 'Pending', color: 'bg-gold-500' },
    { value: 'CHECKED-IN', label: 'Checked In', color: 'bg-sage-500' },
    { value: 'CHECKED-OUT', label: 'Checked Out', color: 'bg-neutral-400' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-rose-500' }
  ];

  const sourceOptions = [
    { value: 'all', label: 'All Channels', icon: '🌐' },
    { value: 'Website', label: 'Direct Website', icon: '🏠' },
    { value: 'Dummy Channel Manager', label: 'Dummy Channel Manager', icon: '💻' },
    { value: 'CRS', label: 'CRS', icon: '💻' },
    { value: 'Booking.com', label: 'Booking.com', icon: '🅱️' },
    { value: 'Expedia', label: 'Expedia', icon: '✈️' },
    { value: 'Walk-in', label: 'Walk-in', icon: '🚶' }
  ];

  const roomTypeOptions = [
    { value: 'all', label: 'All Room Types' },
    { value: 'Minimalist Studio', label: 'Minimalist Studio' },
    { value: 'Coastal Retreat', label: 'Coastal Retreat' },
    { value: 'Urban Oasis', label: 'Urban Oasis' },
    { value: 'Sunset Vista', label: 'Sunset Vista' },
    { value: 'Pacific Suite', label: 'Pacific Suite' },
    { value: 'Wellness Suite', label: 'Wellness Suite' },
    { value: 'Family Sanctuary', label: 'Family Sanctuary' },
    { value: 'Oceanfront Penthouse', label: 'Oceanfront Penthouse' }
  ];

  const datePresets = [
    { id: 'today', label: 'Today', getRange: () => {
      const today = new Date().toISOString().split('T')[0];
      return { from: today, to: today };
    }},
    { id: 'tomorrow', label: 'Tomorrow', getRange: () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      return { from: tomorrow, to: tomorrow };
    }},
    { id: 'thisWeek', label: 'This Week', getRange: () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0] };
    }},
    { id: 'nextWeek', label: 'Next Week', getRange: () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() + (7 - today.getDay()));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0] };
    }},
    { id: 'thisMonth', label: 'This Month', getRange: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0] };
    }},
    { id: 'next30', label: 'Next 30 Days', getRange: () => {
      const today = new Date();
      const end = new Date(Date.now() + 30 * 86400000);
      return { from: today.toISOString().split('T')[0], to: end.toISOString().split('T')[0] };
    }}
  ];

  const hasActiveFilters = filters.status !== 'all' ||
    filters.source !== 'all' ||
    filters.roomType !== 'all' ||
    filters.dateFrom ||
    filters.dateTo;

  const activeFilterCount = [
    filters.status !== 'all',
    filters.source !== 'all',
    filters.roomType !== 'all',
    filters.dateFrom || filters.dateTo
  ].filter(Boolean).length;

  const applyDatePreset = (preset) => {
    const range = preset.getRange();
    onFilterChange('dateFrom', range.from);
    onFilterChange('dateTo', range.to);
    setActiveDropdown(null);
  };

  const FilterDropdown = ({ type, options, icon: Icon, label, valueKey = 'value', labelKey = 'label' }) => {
    const currentValue = filters[type] || 'all';
    const currentOption = options.find(o => o[valueKey] === currentValue);
    const isActive = currentValue !== 'all';

    return (
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === type ? null : type)}
          className={`
            group h-9 px-3.5 rounded-[8px] border text-[13px] font-medium
            transition-all duration-200 flex items-center gap-2 whitespace-nowrap
            ${isActive
              ? 'bg-terra-50 border-terra-300 text-terra-700'
              : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }
          `}
        >
          <Icon className={`w-4 h-4 ${isActive ? 'text-terra-500' : 'text-neutral-400'} transition-colors`} />
          <span>{currentOption?.[labelKey] || label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === type ? 'rotate-180' : ''} ${isActive ? 'text-terra-500' : 'text-neutral-400'}`} />
        </button>

        {activeDropdown === type && (
          <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-[8px] shadow-lg border border-neutral-200 py-1.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3.5 pb-2 mb-1.5 border-b border-neutral-100">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{label}</span>
            </div>
            {options.map((option) => (
              <button
                key={option[valueKey]}
                onClick={() => {
                  onFilterChange(type, option[valueKey]);
                  setActiveDropdown(null);
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 text-[13px] transition-colors
                  ${currentValue === option[valueKey]
                    ? 'bg-terra-50 text-terra-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                  }
                `}
              >
                {option.color && (
                  <span className={`w-2 h-2 rounded-full ${option.color}`} />
                )}
                {option.icon && (
                  <span className="text-base">{option.icon}</span>
                )}
                <span className="flex-1 text-left">{option[labelKey]}</span>
                {currentValue === option[valueKey] && (
                  <svg className="w-4 h-4 text-terra-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {/* Main Filter Row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search guest name, booking ID, room..."
            className="
              w-full h-9 pl-10 pr-4 rounded-[8px]
              bg-white border border-neutral-200
              text-[13px] text-neutral-900 placeholder:text-neutral-400
              focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400
              hover:border-neutral-300 transition-all duration-200
            "
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-neutral-100 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <FilterDropdown type="status" options={statusOptions} icon={Tag} label="Status" />
        <FilterDropdown type="source" options={sourceOptions} icon={Globe} label="Channel" />

        {/* Date Range Dropdown */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
            className={`
              group h-9 px-3.5 rounded-[8px] border text-[13px] font-medium
              transition-all duration-200 flex items-center gap-2 whitespace-nowrap
              ${filters.dateFrom || filters.dateTo
                ? 'bg-terra-50 border-terra-300 text-terra-700'
                : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }
            `}
          >
            <Calendar className={`w-4 h-4 ${filters.dateFrom || filters.dateTo ? 'text-terra-500' : 'text-neutral-400'} transition-colors`} />
            <span>
              {filters.dateFrom && filters.dateTo
                ? `${filters.dateFrom} - ${filters.dateTo}`
                : filters.dateFrom
                ? `From ${filters.dateFrom}`
                : filters.dateTo
                ? `Until ${filters.dateTo}`
                : 'Date Range'
              }
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'date' ? 'rotate-180' : ''} ${filters.dateFrom || filters.dateTo ? 'text-terra-500' : 'text-neutral-400'}`} />
          </button>

          {activeDropdown === 'date' && (
            <div className="absolute top-full right-0 mt-1.5 w-80 bg-white rounded-[10px] shadow-xl border border-neutral-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Quick Presets */}
              <div className="p-4 border-b border-neutral-100">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Quick Select</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {datePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyDatePreset(preset)}
                      className="px-3 py-1.5 rounded-[6px] text-[11px] font-medium bg-neutral-100 text-neutral-600 hover:bg-terra-100 hover:text-terra-700 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="p-4 space-y-3">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Custom Range</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">From</label>
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">To</label>
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => onFilterChange('dateTo', e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-neutral-200 rounded-[8px] text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    onFilterChange('dateFrom', '');
                    onFilterChange('dateTo', '');
                    setActiveDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-[11px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  Clear dates
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`
            h-9 px-3.5 rounded-[8px] border text-[13px] font-medium
            transition-all duration-200 flex items-center gap-2
            ${showAdvanced
              ? 'bg-terra-50 border-terra-300 text-terra-700'
              : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }
          `}
        >
          <Sliders className="w-4 h-4" />
          More
        </button>

        {/* View Density Controls */}
        <div className="flex items-center gap-1 bg-neutral-100 rounded-[8px] p-1 ml-auto">
          <button
            onClick={() => onViewDensityChange?.('compact')}
            className={`p-2 rounded-[6px] transition-colors ${viewDensity === 'compact' ? 'bg-white shadow-sm text-terra-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            title="Compact view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewDensityChange?.('comfortable')}
            className={`p-2 rounded-[6px] transition-colors ${viewDensity === 'comfortable' ? 'bg-white shadow-sm text-terra-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            title="Comfortable view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="h-9 px-3.5 rounded-[8px] bg-rose-50 hover:bg-rose-100 text-rose-600 text-[13px] font-medium transition-all duration-200 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Advanced Filters Row */}
      {showAdvanced && (
        <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 animate-in slide-in-from-top-2 duration-200">
          <FilterDropdown type="roomType" options={roomTypeOptions} icon={Hotel} label="Room Type" />

          {/* VIP Filter */}
          <button
            onClick={() => onFilterChange('vipOnly', !filters.vipOnly)}
            className={`
              h-9 px-3.5 rounded-[8px] border text-[13px] font-medium
              transition-all duration-200 flex items-center gap-2
              ${filters.vipOnly
                ? 'bg-gold-50 border-gold-300 text-gold-700'
                : 'bg-white border-neutral-200 text-neutral-600 hover:border-gold-200'
              }
            `}
          >
            <span className="text-sm">👑</span>
            VIP Only
          </button>

          {/* Has Special Requests */}
          <button
            onClick={() => onFilterChange('hasRequests', !filters.hasRequests)}
            className={`
              h-9 px-3.5 rounded-[8px] border text-[13px] font-medium
              transition-all duration-200 flex items-center gap-2
              ${filters.hasRequests
                ? 'bg-ocean-50 border-ocean-300 text-ocean-700'
                : 'bg-white border-neutral-200 text-neutral-600 hover:border-ocean-200'
              }
            `}
          >
            <span className="text-sm">📝</span>
            Special Requests
          </button>
        </div>
      )}
    </div>
  );
}
