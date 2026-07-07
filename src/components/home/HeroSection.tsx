import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Minus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from '@/components/ui/DatePicker';

export function HeroSection() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
  });
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const guestsDropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <section className="relative overflow-visible pb-24 sm:pb-32 lg:pb-40">
      {/* Background - Ends at middle of search card */}
      <div className="absolute inset-x-0 top-0 h-[60vh] sm:h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop)'
          }}
        />

        {/* Black Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" />

        {/* Additional subtle gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24">
        {/* Hero Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center pt-8 sm:pt-12 pb-8 sm:pb-16">
          {/* Left Column - Headline */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6">
              Discover Your Perfect Stay. One Search.
            </h1>
          </motion.div>

          {/* Right Column - Promotional Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/90 text-base sm:text-lg leading-relaxed"
          >
            <p>
              Experience luxury accommodations with AI-powered recommendations. Book now and save 15% or more when you reserve by January 2025. Not sure where to go? Use our intelligent search to find the perfect hotel for your needs.
            </p>
          </motion.div>
        </div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl overflow-visible max-w-7xl mx-auto"
        >
          {/* Search Form */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Check-in Date */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-neutral-900 mb-1.5 sm:mb-2">
                  Check-In Date
                </label>
                <DatePicker
                  value={searchData.checkIn}
                  onChange={(value) => setSearchData({ ...searchData, checkIn: value })}
                  placeholder="Select check-in"
                  minDate={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>

              {/* Check-out Date */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-neutral-900 mb-1.5 sm:mb-2">
                  Check-Out Date
                </label>
                <DatePicker
                  value={searchData.checkOut}
                  onChange={(value) => setSearchData({ ...searchData, checkOut: value })}
                  placeholder="Select check-out"
                  minDate={searchData.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>

              {/* Guests Dropdown */}
              <div className="relative" ref={guestsDropdownRef}>
                <label className="block text-xs sm:text-sm font-semibold text-neutral-900 mb-1.5 sm:mb-2">
                  Travelers & Class
                </label>
                <button
                  type="button"
                  onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-4 text-sm sm:text-base text-left bg-white rounded-xl border-2 transition-all duration-200 ${
                    showGuestsDropdown
                      ? 'border-primary-500 ring-4 ring-primary-500/10'
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-900 font-medium">
                      {searchData.adults + searchData.children} {searchData.adults + searchData.children === 1 ? 'Guest' : 'Guests'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${showGuestsDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Guests Dropdown Menu */}
                {showGuestsDropdown && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 border-neutral-200 shadow-xl z-50"
                >
                  <div className="p-4 sm:p-6">
                    {/* Adults */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
                      <div>
                        <div className="font-semibold text-neutral-900 text-sm sm:text-base">Adults</div>
                        <div className="text-xs sm:text-sm text-neutral-500 mt-0.5">Age 13+</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSearchData({ ...searchData, adults: Math.max(1, searchData.adults - 1) })}
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
                          onClick={() => setSearchData({ ...searchData, adults: searchData.adults + 1 })}
                          className="w-9 h-9 rounded-full border-2 border-neutral-200 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-all"
                        >
                          <Plus className="w-4 h-4 text-neutral-700" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold text-neutral-900 text-sm sm:text-base">Children</div>
                        <div className="text-xs sm:text-sm text-neutral-500 mt-0.5">Age 0-12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSearchData({ ...searchData, children: Math.max(0, searchData.children - 1) })}
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
                          onClick={() => setSearchData({ ...searchData, children: searchData.children + 1 })}
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
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <button
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (searchData.checkIn) params.set('checkIn', searchData.checkIn);
                    if (searchData.checkOut) params.set('checkOut', searchData.checkOut);
                    params.set('adults', searchData.adults.toString());
                    params.set('children', searchData.children.toString());
                    navigate(`/rooms?${params.toString()}`);
                  }}
                  className="w-full px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4 lg:py-5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm sm:text-base lg:text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  Search Hotels
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
