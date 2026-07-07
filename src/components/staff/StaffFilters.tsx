/**
 * StaffFilters Component
 * Inline dropdown filters for staff - Glimmora Design System v5.0
 * Matches CMS inline filter pattern
 */

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

// Custom Filter Select Component
function FilterSelect({ value, onChange, options, placeholder, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = value === 'all' ? placeholder : selectedOption?.label;
  const isActive = value !== 'all';

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-3.5 rounded-[8px] text-[13px] bg-white border transition-all duration-150 flex items-center gap-2 focus:outline-none min-w-[120px] ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : isActive
            ? 'border-terra-300 bg-terra-50'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-terra-500' : 'text-neutral-400'}`} />}
        <span className={`flex-1 text-left ${isActive ? 'text-terra-700 font-medium' : 'text-neutral-600'}`}>
          {displayLabel}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isActive ? 'text-terra-500' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1.5 bg-white rounded-[8px] border border-neutral-200 shadow-lg overflow-hidden min-w-[160px] max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                  value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                }`}
              >
                {option.label}
                {value === option.value && (
                  <svg className="w-4 h-4 text-terra-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Default roles organized by department
const DEFAULT_ROLES = [
  // Front Desk
  'Front Desk Agent',
  'Receptionist',
  'Night Auditor',
  'Concierge',
  // Housekeeping
  'Housekeeper',
  'Room Attendant',
  'Laundry Attendant',
  'Housekeeping Supervisor',
  // Management
  'General Manager',
  'Assistant Manager',
  'Duty Manager',
  'HR Manager',
  // Maintenance
  'Maintenance Technician',
  'Engineer',
  'Groundskeeper',
  // Runner
  'Bellhop',
  'Porter',
  'Valet',
  'Room Service Attendant'
];

// Department names that should not be used as roles
const DEPARTMENT_NAMES = ['frontdesk', 'front_desk', 'housekeeping', 'management', 'maintenance', 'runner', 'general'];

export default function StaffFilters({ filters, onFilterChange, onClearFilters, hasActiveFilters, availableRoles = [] }) {
  // Filter out department names from availableRoles and use defaults if only departments are present
  const validRoles = availableRoles.filter(role =>
    !DEPARTMENT_NAMES.includes(role.toLowerCase())
  );

  // Use valid roles from API if available, otherwise use default roles
  const roles = validRoles.length > 0 ? validRoles : DEFAULT_ROLES;

  // Options for filters
  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    ...roles.map(role => ({ value: role, label: role }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'off-duty', label: 'Off Duty' },
    { value: 'sick', label: 'Sick' },
    { value: 'leave', label: 'On Leave' }
  ];

  const shiftOptions = [
    { value: 'all', label: 'All Shifts' },
    { value: 'morning', label: 'Morning' },
    { value: 'evening', label: 'Evening' },
    { value: 'night', label: 'Night' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Role Filter */}
      <FilterSelect
        value={filters.role}
        onChange={(value) => onFilterChange('role', value)}
        options={roleOptions}
        placeholder="Role"
      />

      {/* Status Filter */}
      <FilterSelect
        value={filters.status}
        onChange={(value) => onFilterChange('status', value)}
        options={statusOptions}
        placeholder="Status"
      />

      {/* Shift Filter */}
      <FilterSelect
        value={filters.shift}
        onChange={(value) => onFilterChange('shift', value)}
        options={shiftOptions}
        placeholder="Shift"
      />

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="h-9 px-2 sm:px-3 flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-[8px] transition-colors"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Clear All</span>
          <span className="sm:hidden">Clear</span>
        </button>
      )}
    </div>
  );
}
