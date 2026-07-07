import { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { getRoles } from '@/data/staffData';

export default function StaffFilters({ filters, onFilterChange, onClearFilters, hasActiveFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roles = getRoles();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-11 flex items-center gap-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
          hasActiveFilters
            ? 'bg-[#A57865]/10 text-[#A57865] border-[#A57865] hover:bg-[#A57865]/10'
            : 'bg-white text-neutral-700 border-neutral-200 hover:border-[#A57865]/30'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-[#A57865] rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-neutral-200 p-4 z-50 animate-scaleIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-900">Filter Staff</h3>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onClearFilters();
                  setIsOpen(false);
                }}
                className="text-xs text-[#A57865] hover:text-[#A57865] font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Role Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => onFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="off-duty">Off Duty</option>
                <option value="sick">Sick</option>
                <option value="leave">On Leave</option>
              </select>
            </div>

            {/* Shift Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-2">
                Shift
              </label>
              <select
                value={filters.shift}
                onChange={(e) => onFilterChange('shift', e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
              >
                <option value="all">All Shifts</option>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
