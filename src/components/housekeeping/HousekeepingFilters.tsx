/**
 * HousekeepingFilters Component
 * Filter button that opens a drawer with all filters - Glimmora Design System v5.0
 */

import { useState } from 'react';
import { Filter, X, ChevronDown, Check } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';

// Filter Select for Drawer
function DrawerFilterSelect({ label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = value === 'All' || value === 'all' ? 'All' : selectedOption?.label;

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

export default function HousekeepingFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  housekeepers = []
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'All' && value !== 'all'
  ).length;

  // Options for filters
  const floorOptions = [
    { value: 'all', label: 'All Floors' },
    { value: '1', label: 'Floor 1' },
    { value: '2', label: 'Floor 2' },
    { value: '3', label: 'Floor 3' },
    { value: '4', label: 'Floor 4' },
    { value: '5', label: 'Floor 5' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'clean', label: 'Clean' },
    { value: 'dirty', label: 'Dirty' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'inspected', label: 'Inspected' },
    { value: 'out_of_service', label: 'Out of Service' },
    { value: 'out_of_order', label: 'Out of Order' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  const roomTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Minimalist Studio', label: 'Minimalist Studio' },
    { value: 'Coastal Retreat', label: 'Coastal Retreat' },
    { value: 'Urban Oasis', label: 'Urban Oasis' },
    { value: 'Sunset Vista', label: 'Sunset Vista' },
    { value: 'Pacific Suite', label: 'Pacific Suite' },
    { value: 'Wellness Suite', label: 'Wellness Suite' },
    { value: 'Family Sanctuary', label: 'Family Sanctuary' },
    { value: 'Oceanfront Penthouse', label: 'Oceanfront Penthouse' }
  ];

  const staffOptions = [
    { value: 'all', label: 'All Staff' },
    { value: 'unassigned', label: 'Unassigned' },
    ...housekeepers.map(staff => ({ value: staff.id, label: staff.name }))
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
      <p className="text-[13px] text-neutral-500 mt-1">Filter rooms by status, floor, type, and staff</p>
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
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={`h-9 px-3.5 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all duration-150 ${
          activeFilterCount > 0
            ? 'bg-terra-50 border border-terra-300 text-terra-700'
            : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
        }`}
      >
        <Filter className={`w-4 h-4 ${activeFilterCount > 0 ? 'text-terra-500' : ''}`} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-terra-500 text-white text-[11px] font-semibold flex items-center justify-center">
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
          {/* Status Filter */}
          <DrawerFilterSelect
            label="Status"
            value={filters.status || 'all'}
            onChange={(value) => onFilterChange('status', value)}
            options={statusOptions}
          />

          {/* Floor Filter */}
          <DrawerFilterSelect
            label="Floor"
            value={filters.floor || 'all'}
            onChange={(value) => onFilterChange('floor', value)}
            options={floorOptions}
          />

          {/* Room Type Filter */}
          <DrawerFilterSelect
            label="Room Type"
            value={filters.type || 'all'}
            onChange={(value) => onFilterChange('type', value)}
            options={roomTypeOptions}
          />

          {/* Assigned Staff Filter */}
          <DrawerFilterSelect
            label="Assigned Staff"
            value={filters.staff || 'all'}
            onChange={(value) => onFilterChange('staff', value)}
            options={staffOptions}
          />
        </div>
      </Drawer>
    </>
  );
}
