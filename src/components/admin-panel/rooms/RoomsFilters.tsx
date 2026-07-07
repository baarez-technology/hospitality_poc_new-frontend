import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface RoomsFiltersProps {
  filters: { type: string; floor: string; status: string; cleaning: string };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  roomTypes?: string[];
  floors?: number[];
}

export default function RoomsFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  roomTypes = [],
  floors = []
}: RoomsFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'dirty', label: 'Dirty' },
    { value: 'out_of_service', label: 'Out of Service' }
  ];

  const cleaningOptions = [
    { value: 'all', label: 'All' },
    { value: 'clean', label: 'Clean' },
    { value: 'dirty', label: 'Dirty' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleSelect = (key, value) => {
    onFilterChange(key, value);
    setOpenDropdown(null);
  };

  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      {/* Room Type Filter */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('type')}
          className={`h-11 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
            filters.type !== 'all'
              ? 'bg-[#A57865]/10 border-[#A57865] text-[#A57865]'
              : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#A57865]/30'
          }`}
        >
          Room Type
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              openDropdown === 'type' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openDropdown === 'type' && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-2">
              <button
                onClick={() => handleSelect('type', 'all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  filters.type === 'all'
                    ? 'bg-[#A57865]/5 text-[#A57865] font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                All Types
              </button>
              {roomTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleSelect('type', type)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    filters.type === type
                      ? 'bg-[#A57865]/5 text-[#A57865] font-medium'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floor Filter */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('floor')}
          className={`h-11 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
            filters.floor !== 'all'
              ? 'bg-[#A57865]/10 border-[#A57865] text-[#A57865]'
              : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#A57865]/30'
          }`}
        >
          Floor
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              openDropdown === 'floor' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openDropdown === 'floor' && (
          <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-2">
              <button
                onClick={() => handleSelect('floor', 'all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  filters.floor === 'all'
                    ? 'bg-[#A57865]/5 text-[#A57865] font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                All Floors
              </button>
              {floors.map((floor) => (
                <button
                  key={floor}
                  onClick={() => handleSelect('floor', floor)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    filters.floor === floor
                      ? 'bg-[#A57865]/5 text-[#A57865] font-medium'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Floor {floor}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('status')}
          className={`h-11 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
            filters.status !== 'all'
              ? 'bg-[#A57865]/10 border-[#A57865] text-[#A57865]'
              : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#A57865]/30'
          }`}
        >
          Status
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              openDropdown === 'status' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openDropdown === 'status' && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect('status', option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    filters.status === option.value
                      ? 'bg-[#A57865]/5 text-[#A57865] font-medium'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cleaning Filter */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('cleaning')}
          className={`h-11 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
            filters.cleaning !== 'all'
              ? 'bg-[#A57865]/10 border-[#A57865] text-[#A57865]'
              : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#A57865]/30'
          }`}
        >
          Cleaning
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              openDropdown === 'cleaning' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openDropdown === 'cleaning' && (
          <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-2">
              {cleaningOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect('cleaning', option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    filters.cleaning === option.value
                      ? 'bg-[#A57865]/5 text-[#A57865] font-medium'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="h-11 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium transition-all duration-200 flex items-center gap-2 group whitespace-nowrap"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          Clear Filters
        </button>
      )}
    </div>
  );
}
