/**
 * SearchFiltersBar Component
 * Clean, minimal search and filter bar matching modern design
 */

import { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, Plus, X, Calendar, Crown, Clock, AlertCircle, ChevronDown } from 'lucide-react';

const quickFilters = [
  { id: 'vip', label: 'VIP', icon: Crown },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'unassigned', label: 'Unassigned', icon: AlertCircle },
  { id: 'balance', label: 'Has Balance', icon: AlertCircle },
];

const dateFilters = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

export default function SearchFiltersBar({
  title = "Reservations",
  subtitle = "Manage bookings and guest information",
  searchPlaceholder = "Search",
  searchQuery,
  onSearchChange,
  onNewBooking,
  activeFilters = [],
  onFilterChange,
  dateFilter = 'all',
  onDateFilterChange,
  isDark = false
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterCount = activeFilters.length + (dateFilter !== 'all' ? 1 : 0);

  const toggleFilter = (filterId) => {
    if (activeFilters.includes(filterId)) {
      onFilterChange(activeFilters.filter(f => f !== filterId));
    } else {
      onFilterChange([...activeFilters, filterId]);
    }
  };

  const clearAllFilters = () => {
    onFilterChange([]);
    onDateFilterChange('all');
    setIsFilterOpen(false);
  };

  return (
    <div className={`rounded-[10px] p-6 transition-all duration-300 ${
      isDark
        ? 'bg-white/[0.03] border border-white/[0.08]'
        : 'bg-white border border-neutral-200/80 shadow-sm'
    }`}>
      <div className="flex items-center justify-between gap-6">
        {/* Left side - Title and subtitle */}
        <div className="flex-shrink-0">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            {title}
          </h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
            {subtitle}
          </p>
        </div>

        {/* Right side - Search, Filter, Add button */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-white/40' : 'text-neutral-400'
            }`} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-[280px] h-11 pl-12 pr-4 rounded-[8px] text-sm font-medium transition-all duration-200 ${
                isDark
                  ? 'bg-white/[0.05] border border-white/[0.1] text-white placeholder-white/40 focus:border-white/[0.2] focus:bg-white/[0.08]'
                  : 'bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100'
              } focus:outline-none`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-neutral-100 text-neutral-400'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`relative flex items-center gap-2 h-11 px-4 rounded-[8px] text-sm font-medium transition-all duration-200 ${
                isFilterOpen || activeFilterCount > 0
                  ? isDark
                    ? 'bg-white/[0.1] border border-white/[0.2] text-white'
                    : 'bg-neutral-100 border border-neutral-300 text-neutral-900'
                  : isDark
                    ? 'bg-white/[0.05] border border-white/[0.1] text-white/70 hover:text-white hover:border-white/[0.2]'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className={`ml-1 w-5 h-5 rounded-[4px] flex items-center justify-center text-xs font-bold ${
                  isDark ? 'bg-[#A57865] text-white' : 'bg-[#A57865] text-white'
                }`}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className={`absolute right-0 top-full mt-2 w-72 rounded-[10px] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                isDark
                  ? 'bg-[#1a1a1a] border border-white/[0.1] shadow-2xl'
                  : 'bg-white border border-neutral-200 shadow-xl shadow-neutral-200/50'
              }`}>
                {/* Date Filter Section */}
                <div className={`p-4 ${isDark ? 'border-b border-white/[0.06]' : 'border-b border-neutral-100'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className={`w-4 h-4 ${isDark ? 'text-white/50' : 'text-neutral-400'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                      Date Range
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dateFilters.map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => onDateFilterChange(filter.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all duration-200 ${
                          dateFilter === filter.id
                            ? isDark
                              ? 'bg-[#A57865] text-white'
                              : 'bg-[#A57865] text-white'
                            : isDark
                              ? 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Filters Section */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <SlidersHorizontal className={`w-4 h-4 ${isDark ? 'text-white/50' : 'text-neutral-400'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                      Quick Filters
                    </span>
                  </div>
                  <div className="space-y-2">
                    {quickFilters.map(filter => {
                      const Icon = filter.icon;
                      const isActive = activeFilters.includes(filter.id);
                      return (
                        <button
                          key={filter.id}
                          onClick={() => toggleFilter(filter.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? isDark
                                ? 'bg-[#A57865]/20 text-[#A57865] border border-[#A57865]/30'
                                : 'bg-[#A57865]/10 text-[#A57865] border border-[#A57865]/30'
                              : isDark
                                ? 'text-white/70 hover:bg-white/[0.05] border border-transparent'
                                : 'text-neutral-600 hover:bg-neutral-50 border border-transparent'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{filter.label}</span>
                          {isActive && (
                            <X className="w-4 h-4 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear All */}
                {activeFilterCount > 0 && (
                  <div className={`p-3 ${isDark ? 'bg-white/[0.02] border-t border-white/[0.06]' : 'bg-neutral-50 border-t border-neutral-100'}`}>
                    <button
                      onClick={clearAllFilters}
                      className={`w-full py-2 text-sm font-medium rounded-[8px] transition-colors ${
                        isDark
                          ? 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                          : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add New Booking Button */}
          <button
            onClick={onNewBooking}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-semibold rounded-xl bg-gradient-to-r from-terra-500 to-terra-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Active Filters Pills - shown below when filters are active */}
      {activeFilterCount > 0 && (
        <div className={`flex items-center gap-2 mt-4 pt-4 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-neutral-100'}`}>
          <span className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>Active:</span>

          {dateFilter !== 'all' && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium ${
              isDark ? 'bg-[#A57865]/20 text-[#A57865]' : 'bg-[#A57865]/10 text-[#A57865]'
            }`}>
              <Calendar className="w-3 h-3" />
              {dateFilters.find(f => f.id === dateFilter)?.label}
              <button onClick={() => onDateFilterChange('all')} className="ml-1 hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFilters.map(filterId => {
            const filter = quickFilters.find(f => f.id === filterId);
            if (!filter) return null;
            const Icon = filter.icon;
            return (
              <span
                key={filterId}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium ${
                  isDark ? 'bg-[#A57865]/20 text-[#A57865]' : 'bg-[#A57865]/10 text-[#A57865]'
                }`}
              >
                <Icon className="w-3 h-3" />
                {filter.label}
                <button onClick={() => toggleFilter(filterId)} className="ml-1 hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          <button
            onClick={clearAllFilters}
            className={`text-xs font-medium ml-2 ${isDark ? 'text-white/50 hover:text-white' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
