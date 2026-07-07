import { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

export default function HousekeepingFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  housekeepers = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const floors = ['All', '1', '2', '3', '4', '5'];
  const statuses = ['All', 'Clean', 'Dirty', 'In Progress', 'Out of Service', 'Out of Order', 'Maintenance'];
  const roomTypes = ['All', 'Minimalist Studio', 'Coastal Retreat', 'Urban Oasis', 'Sunset Vista', 'Pacific Suite', 'Wellness Suite', 'Family Sanctuary', 'Oceanfront Penthouse'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border shadow-sm
          ${hasActiveFilters
            ? 'bg-[#A57865]/5 text-[#A57865] border-[#A57865]/30 hover:bg-[#A57865]/10'
            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
          }
        `}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-[#A57865] rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 z-50 animate-scaleIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-900">Filter Rooms</h3>
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
            {/* Floor Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-2">
                Floor
              </label>
              <select
                value={filters.floor || 'All'}
                onChange={(e) => onFilterChange('floor', e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
              >
                {floors.map(floor => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-2">
                Status
              </label>
              <select
                value={filters.status || 'All'}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Room Type Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-2">
                Room Type
              </label>
              <select
                value={filters.roomType || 'All'}
                onChange={(e) => onFilterChange('roomType', e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
              >
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Assigned Staff Filter */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-2">
                Assigned Staff
              </label>
              <select
                value={filters.assignedStaff || 'All'}
                onChange={(e) => onFilterChange('assignedStaff', e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
              >
                <option value="All">All Staff</option>
                {housekeepers.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
