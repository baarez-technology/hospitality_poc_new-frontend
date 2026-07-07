/**
 * RoomsFilters Component
 * Dropdown filters for rooms - Glimmora Design System v5.0
 * Matches CMS SearchFiltersBar pattern
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Building, Home, CheckCircle, Sparkles, Check, ChevronDown } from 'lucide-react';

// Custom Filter Select Component with React Portal for proper z-index
function FilterSelect({ value, onChange, options, placeholder, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = value === 'all' ? placeholder : selectedOption?.label;
  const isActive = value !== 'all';

  // Estimate dropdown height (each option ~40px + padding)
  const estimatedDropdownHeight = Math.min(options.length * 40 + 8, 248);

  const calculatePosition = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Open above if not enough space below and more space above
    const openAbove = spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow;

    return {
      top: openAbove ? rect.top - estimatedDropdownHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 160),
      openAbove
    };
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setPosition(null);
    } else {
      setPosition(calculatePosition());
      setIsOpen(true);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setPosition(null);
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (!triggerRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setIsOpen(false);
        setPosition(null);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      setPosition(calculatePosition());
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`h-9 px-3.5 rounded-[8px] text-[13px] bg-white border transition-all duration-150 flex items-center gap-2 focus:outline-none min-w-[140px] ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : isActive
            ? 'border-terra-300 bg-terra-50'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-terra-500' : 'text-neutral-400'}`} />}
        <span className={isActive ? 'text-terra-700 font-medium' : 'text-neutral-600'}>
          {displayLabel}
        </span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''} ${isActive ? 'text-terra-500' : 'text-neutral-400'}`} />
      </button>

      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            maxHeight: `${estimatedDropdownHeight}px`,
            zIndex: 9999
          }}
          className={`bg-white rounded-lg border border-neutral-200 shadow-lg shadow-neutral-900/10 overflow-hidden animate-in fade-in-0 duration-100 ${
            position.openAbove ? 'origin-bottom' : 'origin-top'
          }`}
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                  value === option.value ? 'bg-terra-50 text-terra-700 font-medium' : 'text-neutral-700'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-terra-500" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function RoomsFilters({ filters, onFilterChange, onClearFilters, hasActiveFilters, roomTypes = [], floors = [] }) {
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...roomTypes.map(type => ({ value: type, label: type }))
  ];

  const floorOptions = [
    { value: 'all', label: 'All Floors' },
    ...floors.map(floor => ({ value: String(floor), label: `Floor ${floor}` }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'dirty', label: 'Dirty' },
    { value: 'out_of_service', label: 'Out of Service' }
  ];

  const cleaningOptions = [
    { value: 'all', label: 'All Cleaning' },
    { value: 'clean', label: 'Clean' },
    { value: 'dirty', label: 'Dirty' }
  ];

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-2 sm:pb-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:flex-wrap">
        {/* Room Type Filter */}
        <FilterSelect
          value={filters.type}
          onChange={(value) => onFilterChange('type', value)}
          options={typeOptions}
          placeholder="All Types"
          icon={Home}
        />

        {/* Floor Filter */}
        <FilterSelect
          value={filters.floor}
          onChange={(value) => onFilterChange('floor', value)}
          options={floorOptions}
          placeholder="All Floors"
          icon={Building}
        />

        {/* Status Filter */}
        <FilterSelect
          value={filters.status}
          onChange={(value) => onFilterChange('status', value)}
          options={statusOptions}
          placeholder="All Statuses"
          icon={CheckCircle}
        />

        {/* Cleaning Filter */}
        <FilterSelect
          value={filters.cleaning}
          onChange={(value) => onFilterChange('cleaning', value)}
          options={cleaningOptions}
          placeholder="All Cleaning"
          icon={Sparkles}
        />

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="h-9 px-2 sm:px-3 flex items-center gap-1 sm:gap-1.5 text-[12px] sm:text-[13px] font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-[8px] transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Clear All</span>
            <span className="sm:hidden">Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
