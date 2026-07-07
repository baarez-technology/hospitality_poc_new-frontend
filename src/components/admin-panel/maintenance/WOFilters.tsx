import { Search, Filter, X } from 'lucide-react';
import { WO_CATEGORIES, PRIORITY_CONFIG, STATUS_CONFIG } from '@/utils/admin/maintenance';

export default function WOFilters({
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
  technicians,
  onClearFilters
}) {
  const hasActiveFilters =
    filters.priority !== 'all' ||
    filters.status !== 'all' ||
    filters.category !== 'all' ||
    filters.technician !== 'all' ||
    filters.oooOnly ||
    searchQuery;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search WO ID, room, issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600 whitespace-nowrap">Priority:</label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
          >
            <option value="all">All</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600 whitespace-nowrap">Status:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
          >
            <option value="all">All</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600 whitespace-nowrap">Category:</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
          >
            <option value="all">All</option>
            {WO_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Technician Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600 whitespace-nowrap">Tech:</label>
          <select
            value={filters.technician}
            onChange={(e) => setFilters(prev => ({ ...prev, technician: e.target.value }))}
            className="px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
          >
            <option value="all">All</option>
            <option value="unassigned">Unassigned</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>{tech.name}</option>
            ))}
          </select>
        </div>

        {/* OOO Only Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.oooOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, oooOnly: e.target.checked }))}
            className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]/20"
          />
          <span className="text-sm text-neutral-700 whitespace-nowrap">OOO Only</span>
        </label>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Date Range Filter (collapsible) */}
      <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600">From:</label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600">To:</label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
          />
        </div>

        {/* Quick Date Presets */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFilters(prev => ({ ...prev, dateFrom: today, dateTo: today }));
            }}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              setFilters(prev => ({
                ...prev,
                dateFrom: weekAgo.toISOString().split('T')[0],
                dateTo: today.toISOString().split('T')[0]
              }));
            }}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const monthAgo = new Date(today);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              setFilters(prev => ({
                ...prev,
                dateFrom: monthAgo.toISOString().split('T')[0],
                dateTo: today.toISOString().split('T')[0]
              }));
            }}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
          >
            Last 30 Days
          </button>
        </div>
      </div>
    </div>
  );
}
