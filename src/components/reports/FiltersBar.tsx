import { useState } from 'react';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import { Button } from '../ui2/Button';

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
    <div className="rounded-[10px] bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Presets */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="h-9 text-sm border border-neutral-200 rounded-lg px-3 bg-white text-neutral-700 hover:border-neutral-300 focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 transition-all duration-150"
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
              className="h-9 text-sm border border-neutral-200 rounded-lg px-3 bg-white text-neutral-700 hover:border-neutral-300 focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 transition-all duration-150"
            />
            <span className="text-neutral-400 text-sm">to</span>
            <input
              type="date"
              value={dateRange?.end?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                onDateRangeChange?.({
                  ...dateRange,
                  end: new Date(e.target.value)
                })
              }
              className="h-9 text-sm border border-neutral-200 rounded-lg px-3 bg-white text-neutral-700 hover:border-neutral-300 focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 transition-all duration-150"
            />
          </div>
        )}

        {/* Additional Filters Toggle */}
        {filters.length > 0 && (
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'primary' : 'subtle'}
            size="sm"
            icon={Filter}
          >
            Filters
            {filters.some((f) => f.value) && (
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 ml-1" />
            )}
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showRefresh && (
            <Button
              onClick={onRefresh}
              variant="ghost"
              size="sm"
              icon={RefreshCw}
            >
              Refresh
            </Button>
          )}
          {showExport && (
            <Button
              onClick={onExport}
              variant="primary"
              size="sm"
              icon={Download}
            >
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && filters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap gap-4">
          {filters.map((filter, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  value={filter.value || ''}
                  onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                  className="h-9 text-sm border border-neutral-200 rounded-lg px-3 bg-white text-neutral-700 hover:border-neutral-300 focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 transition-all duration-150 min-w-[150px]"
                >
                  <option value="">All</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === 'multiselect' ? (
                <div className="flex flex-wrap gap-1.5">
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
                      className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
                        (filter.value || []).includes(opt.value)
                          ? 'bg-terra-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
                  className="h-9 text-sm border border-neutral-200 rounded-lg px-3 bg-white text-neutral-700 placeholder-neutral-400 hover:border-neutral-300 focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 transition-all duration-150"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
