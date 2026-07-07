import { useState } from 'react';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';

const PRESET_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'Custom', value: 'custom' }
];

export default function FiltersBar({
  dateRange,
  onDateRangeChange,
  filters = [],
  onFilterChange,
  onExport,
  onRefresh,
  showExport = true,
  showRefresh = true
}) {
  const [selectedPreset, setSelectedPreset] = useState('30days');
  const [showFilters, setShowFilters] = useState(false);

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    const today = new Date();
    let start, end;

    switch (preset) {
      case 'today':
        start = end = today;
        break;
      case 'yesterday':
        start = end = new Date(today.setDate(today.getDate() - 1));
        break;
      case '7days':
        start = new Date(today.setDate(today.getDate() - 7));
        end = new Date();
        break;
      case '30days':
        start = new Date(today.setDate(today.getDate() - 30));
        end = new Date();
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    onDateRangeChange?.({ start, end });
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range Presets */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
          >
            {PRESET_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Inputs */}
        {selectedPreset === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange?.start?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                onDateRangeChange?.({
                  ...dateRange,
                  start: new Date(e.target.value)
                })
              }
              className="text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
            />
            <span className="text-neutral-400">to</span>
            <input
              type="date"
              value={dateRange?.end?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                onDateRangeChange?.({
                  ...dateRange,
                  end: new Date(e.target.value)
                })
              }
              className="text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
            />
          </div>
        )}

        {/* Additional Filters Toggle */}
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showFilters
                ? 'bg-[#A57865] text-white'
                : 'bg-[#FAF7F4] text-neutral-600 hover:bg-[#A57865]/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {filters.some((f) => f.value) && (
              <span className="w-2 h-2 rounded-full bg-[#CDB261]" />
            )}
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#FAF7F4] text-neutral-600 hover:bg-[#A57865]/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
          {showExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[#4E5840] text-white hover:bg-[#4E5840]/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && filters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex flex-wrap gap-4">
          {filters.map((filter, index) => (
            <div key={index} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500">
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  value={filter.value || ''}
                  onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                  className="text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] min-w-[150px]"
                >
                  <option value="">All</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === 'multiselect' ? (
                <div className="flex flex-wrap gap-1">
                  {filter.options?.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        const current = filter.value || [];
                        const updated = current.includes(opt.value)
                          ? current.filter((v) => v !== opt.value)
                          : [...current, opt.value];
                        onFilterChange?.(filter.key, updated);
                      }}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        (filter.value || []).includes(opt.value)
                          ? 'bg-[#A57865] text-white'
                          : 'bg-[#FAF7F4] text-neutral-600 hover:bg-[#A57865]/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={filter.value || ''}
                  onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                  placeholder={filter.placeholder || ''}
                  className="text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
