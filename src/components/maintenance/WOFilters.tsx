/**
 * WOFilters Component
 * Filter button that opens a drawer with all filters - Glimmora Design System v5.0
 * Matches HousekeepingFilters pattern
 */

import { useState } from 'react';
import { Filter, Search, X, ChevronDown, Check } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import DatePicker from '../ui2/DatePicker';
import { WO_CATEGORIES, PRIORITY_CONFIG, STATUS_CONFIG } from '../../utils/maintenance';

// Filter Select for Drawer
function DrawerFilterSelect({ label, value, onChange, options }) {
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

export default function WOFilters({
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
  technicians,
  onClearFilters
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Count active filters (excluding search)
  const activeFilterCount = [
    filters.priority !== 'all',
    filters.status !== 'all',
    filters.category !== 'all',
    filters.technician !== 'all',
    filters.oooOnly,
    filters.dateFrom,
    filters.dateTo
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0 || searchQuery;

  // Prepare dropdown options
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    ...Object.entries(PRIORITY_CONFIG).map(([key, config]) => ({
      value: key,
      label: config.label
    }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
      value: key,
      label: config.label
    }))
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...WO_CATEGORIES.map(cat => ({
      value: cat.value,
      label: cat.label
    }))
  ];

  const technicianOptions = [
    { value: 'all', label: 'All Technicians' },
    { value: 'unassigned', label: 'Unassigned' },
    ...technicians.map(tech => ({
      value: tech.id,
      label: tech.name
    }))
  ];

  const handleApplyFilters = () => {
    setIsDrawerOpen(false);
  };

  const handleClearAll = () => {
    onClearFilters();
  };

  // Custom header for drawer
  const renderHeader = () => (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">Filters</h2>
      <p className="text-[13px] text-neutral-500 mt-1">Filter work orders by priority, status, category, and technician</p>
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
      <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
        <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search WO ID, room..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 sm:h-9 pl-8 sm:pl-10 pr-3 sm:pr-4 border border-neutral-200 rounded-lg text-[12px] sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 hover:border-neutral-300 bg-white transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
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
          {/* Priority Filter */}
          <DrawerFilterSelect
            label="Priority"
            value={filters.priority || 'all'}
            onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            options={priorityOptions}
          />

          {/* Status Filter */}
          <DrawerFilterSelect
            label="Status"
            value={filters.status || 'all'}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            options={statusOptions}
          />

          {/* Category Filter */}
          <DrawerFilterSelect
            label="Category"
            value={filters.category || 'all'}
            onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            options={categoryOptions}
          />

          {/* Technician Filter */}
          <DrawerFilterSelect
            label="Technician"
            value={filters.technician || 'all'}
            onChange={(value) => setFilters(prev => ({ ...prev, technician: value }))}
            options={technicianOptions}
          />

          {/* OOO Only Toggle */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
              Options
            </label>
            <label className="flex items-center gap-3 cursor-pointer h-10 px-4 rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 transition-colors">
              <input
                type="checkbox"
                checked={filters.oooOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, oooOnly: e.target.checked }))}
                className="w-4 h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500/20"
              />
              <span className="text-[13px] text-neutral-700">Show OOS/OOO rooms only</span>
            </label>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
              Date Range
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-500 mb-1.5 block">From</label>
                <DatePicker
                  value={filters.dateFrom || ''}
                  onChange={(value) => setFilters(prev => ({ ...prev, dateFrom: value }))}
                  placeholder="Select start date"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-500 mb-1.5 block">To</label>
                <DatePicker
                  value={filters.dateTo || ''}
                  onChange={(value) => setFilters(prev => ({ ...prev, dateTo: value }))}
                  placeholder="Select end date"
                  className="w-full"
                />
              </div>
            </div>

            {/* Quick Date Presets */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setFilters(prev => ({ ...prev, dateFrom: today, dateTo: today }));
                }}
                className="px-3 py-1.5 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
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
                className="px-3 py-1.5 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
              >
                Last 7 Days
              </button>
              <button
                type="button"
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
                className="px-3 py-1.5 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
              >
                Last 30 Days
              </button>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
