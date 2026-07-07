import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function GuestsFilters({ filters, onFilterChange, onClearFilters, countries, hasActiveFilters }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const emotionOptions = [
    { value: 'all', label: 'All Emotions' },
    { value: 'positive', label: '😊 Positive' },
    { value: 'neutral', label: '😐 Neutral' },
    { value: 'negative', label: '😞 Negative' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'vip', label: '⭐ VIP' },
    { value: 'normal', label: 'Normal' },
    { value: 'review', label: '⚠️ Needs Review' },
    { value: 'blacklisted', label: '🚫 Blacklisted' }
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
      {/* Country Filter */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('country')}
          className={`h-11 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
            filters.country !== 'all'
              ? 'bg-[#A57865]/10 border-[#A57865] text-[#A57865]'
              : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#A57865]/30'
          }`}
        >
          Country
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              openDropdown === 'country' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openDropdown === 'country' && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
              <button
                onClick={() => handleSelect('country', 'all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  filters.country === 'all'
                    ? 'bg-[#A57865]/5 text-[#A57865] font-medium'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                All Countries
              </button>
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => handleSelect('country', country)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    filters.country === country
                      ? 'bg-[#A57865]/5 text-[#A57865] font-medium'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Emotion Filter */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('emotion')}
          className={`h-11 px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
            filters.emotion !== 'all'
              ? 'bg-[#A57865]/10 border-[#A57865] text-[#A57865]'
              : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#A57865]/30'
          }`}
        >
          Emotion
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              openDropdown === 'emotion' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openDropdown === 'emotion' && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-2">
              {emotionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect('emotion', option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    filters.emotion === option.value
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
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
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
