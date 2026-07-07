import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Plus, Minus, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from '@/components/ui/DatePicker';

interface SearchWidgetProps {
  onSearch: (data: SearchData) => void;
}

export interface SearchData {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

export function RoomsSearchWidget({ onSearch }: SearchWidgetProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const guestsDropdownRef = useRef<HTMLDivElement>(null);

  const [searchData, setSearchData] = useState<SearchData>({
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    adults: parseInt(searchParams.get('adults') || '1'),
    children: parseInt(searchParams.get('children') || '0'),
  });

  useEffect(() => {
    // Trigger search when component mounts if dates are present
    if (searchData.checkIn && searchData.checkOut) {
      onSearch(searchData);
    }
  }, []);

  const handleSearch = () => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchData.checkIn) params.set('checkIn', searchData.checkIn);
    if (searchData.checkOut) params.set('checkOut', searchData.checkOut);
    params.set('adults', searchData.adults.toString());
    params.set('children', searchData.children.toString());

    navigate(`/rooms?${params.toString()}`, { replace: true });
    onSearch(searchData);
  };

  const updateGuests = (type: 'adults' | 'children', change: number) => {
    setSearchData(prev => ({
      ...prev,
      [type]: Math.max(type === 'adults' ? 1 : 0, prev[type] + change),
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        guestsDropdownRef.current &&
        !guestsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowGuestsDropdown(false);
      }
    };

    if (showGuestsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGuestsDropdown]);

  const totalGuests = searchData.adults + searchData.children;
  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = searchData.checkIn || today;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-visible"
    >
      {/* Search Form */}
      <div className="space-y-4">
        {/* Check-in Date */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Check-In Date
          </label>
          <DatePicker
            value={searchData.checkIn}
            onChange={(value) => setSearchData({ ...searchData, checkIn: value })}
            placeholder="Select check-in"
            minDate={today}
            className="w-full"
          />
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Check-Out Date
          </label>
          <DatePicker
            value={searchData.checkOut}
            onChange={(value) => setSearchData({ ...searchData, checkOut: value })}
            placeholder="Select check-out"
            minDate={minCheckOut}
            className="w-full"
          />
        </div>

        {/* Guests Dropdown */}
        <div className="relative" ref={guestsDropdownRef}>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Guests
          </label>
          <button
            type="button"
            onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
            className={`w-full px-4 py-3 text-left bg-white rounded-xl border-2 transition-all duration-200 ${
              showGuestsDropdown
                ? 'border-primary-500 ring-4 ring-primary-500/10'
                : 'border-neutral-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-900">
                {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}
              </span>
              <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${showGuestsDropdown ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Guests Dropdown Menu */}
          {showGuestsDropdown && (
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 border-neutral-200 shadow-xl z-50"
          >
            <div className="p-4">
              {/* Adults */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
                <div>
                  <div className="font-semibold text-neutral-900 text-sm">Adults</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Age 13+</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateGuests('adults', -1)}
                    disabled={searchData.adults <= 1}
                    className="w-9 h-9 rounded-full border-2 border-neutral-200 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Minus className="w-4 h-4 text-neutral-700" />
                  </button>
                  <span className="w-8 text-center font-bold text-neutral-900">
                    {searchData.adults}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateGuests('adults', 1)}
                    className="w-9 h-9 rounded-full border-2 border-neutral-200 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <Plus className="w-4 h-4 text-neutral-700" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-neutral-900 text-sm">Children</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Age 0-12</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateGuests('children', -1)}
                    disabled={searchData.children <= 0}
                    className="w-9 h-9 rounded-full border-2 border-neutral-200 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Minus className="w-4 h-4 text-neutral-700" />
                  </button>
                  <span className="w-8 text-center font-bold text-neutral-900">
                    {searchData.children}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateGuests('children', 1)}
                    className="w-9 h-9 rounded-full border-2 border-neutral-200 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <Plus className="w-4 h-4 text-neutral-700" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowGuestsDropdown(false)}
                className="w-full py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all"
              >
                Done
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!searchData.checkIn || !searchData.checkOut}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <Search className="w-4 h-4" />
          <span>Search Availability</span>
        </button>
      </div>

      {/* Active Search Info */}
      {searchData.checkIn && searchData.checkOut && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-4 mt-4 border-t border-neutral-200"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="text-xs text-neutral-600 flex-1">
              <div className="font-medium text-neutral-900 mb-1">
                {new Date(searchData.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {' - '}
                {new Date(searchData.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div>
                {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
              </div>
            </div>
            <button
              onClick={() => {
                setSearchData({ checkIn: '', checkOut: '', adults: 1, children: 0 });
                navigate('/rooms', { replace: true });
                onSearch({ checkIn: '', checkOut: '', adults: 1, children: 0 });
              }}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 hover:bg-primary-50 px-2 py-1 rounded transition-all"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
