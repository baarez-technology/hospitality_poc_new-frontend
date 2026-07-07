import { Filter, Calendar, Star, Activity, Hash, X } from 'lucide-react';

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'booking.com', label: 'Booking.com' },
  { value: 'google', label: 'Google' },
  { value: 'expedia', label: 'Expedia' },
  { value: 'tripadvisor', label: 'Tripadvisor' },
  { value: 'agoda', label: 'Agoda' }
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
  { value: 'all', label: 'All Sentiment' },
  { value: 'positive', label: 'Positive (>70)' },
  { value: 'neutral', label: 'Neutral (40-70)' },
  { value: 'negative', label: 'Negative (<40)' }
];

const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' }
];

export default function FiltersBar({ filters, onFilterChange }) {
  const hasActiveFilters = filters.source !== 'all' ||
    filters.rating !== 'all' ||
    filters.sentimentRange !== 'all' ||
    filters.keyword;

  const handleClearFilters = () => {
    onFilterChange({
      source: 'all',
      rating: 'all',
      sentimentRange: 'all',
      dateRange: '30d',
      keyword: ''
    });
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left - Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Source Filter */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F4] rounded-lg border border-neutral-200">
              <Filter className="w-4 h-4 text-neutral-500" />
              <select
                value={filters.source}
                onChange={(e) => onFilterChange({ ...filters, source: e.target.value })}
                className="bg-transparent text-sm font-medium text-neutral-700 focus:outline-none cursor-pointer pr-6 appearance-none"
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F4] rounded-lg border border-neutral-200">
              <Star className="w-4 h-4 text-[#CDB261]" />
              <select
                value={filters.rating}
                onChange={(e) => onFilterChange({ ...filters, rating: e.target.value })}
                className="bg-transparent text-sm font-medium text-neutral-700 focus:outline-none cursor-pointer pr-6 appearance-none"
              >
                {RATING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sentiment Filter */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F4] rounded-lg border border-neutral-200">
              <Activity className="w-4 h-4 text-neutral-500" />
              <select
                value={filters.sentimentRange}
                onChange={(e) => onFilterChange({ ...filters, sentimentRange: e.target.value })}
                className="bg-transparent text-sm font-medium text-neutral-700 focus:outline-none cursor-pointer pr-6 appearance-none"
              >
                {SENTIMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F4] rounded-lg border border-neutral-200">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <select
                value={filters.dateRange}
                onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value })}
                className="bg-transparent text-sm font-medium text-neutral-700 focus:outline-none cursor-pointer pr-6 appearance-none"
              >
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Keyword Search */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F4] rounded-lg border border-neutral-200">
              <Hash className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => onFilterChange({ ...filters, keyword: e.target.value })}
                placeholder="Search keywords..."
                className="bg-transparent text-sm font-medium text-neutral-700 focus:outline-none w-32"
              />
            </div>
          </div>
        </div>

        {/* Right - Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#A57865] hover:bg-[#A57865]/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-neutral-500">Active:</span>
          {filters.source !== 'all' && (
            <span className="px-2 py-0.5 bg-[#A57865]/10 text-[#A57865] text-xs font-medium rounded-full">
              {SOURCE_OPTIONS.find(o => o.value === filters.source)?.label}
            </span>
          )}
          {filters.rating !== 'all' && (
            <span className="px-2 py-0.5 bg-[#CDB261]/10 text-[#CDB261] text-xs font-medium rounded-full">
              {RATING_OPTIONS.find(o => o.value === filters.rating)?.label}
            </span>
          )}
          {filters.sentimentRange !== 'all' && (
            <span className="px-2 py-0.5 bg-[#4E5840]/10 text-[#4E5840] text-xs font-medium rounded-full">
              {SENTIMENT_OPTIONS.find(o => o.value === filters.sentimentRange)?.label}
            </span>
          )}
          {filters.keyword && (
            <span className="px-2 py-0.5 bg-[#5C9BA4]/10 text-[#5C9BA4] text-xs font-medium rounded-full">
              Keyword: "{filters.keyword}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}
