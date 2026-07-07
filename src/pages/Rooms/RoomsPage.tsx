import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Maximize2,
  Star,
  Grid3x3,
  List,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  Home,
  Loader2,
  ArrowUpDown,
  Heart,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/utils/helpers/format';
import type { Room } from '@/api/types/booking.types';
import { RoomsSearchWidget, SearchData } from '@/components/rooms/RoomsSearchWidget';
import { roomTypesService } from '@/api/services/roomTypes.service';
import { SearchableSelect } from '@/components/ui2/SearchableSelect';
import { useWishlist } from '@/contexts/WishlistContext';

type ViewMode = 'grid' | 'list';
type SortOption = 'price-low' | 'price-high' | 'rating' | 'popularity';

export const RoomsPage = () => {
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [searchParams] = useSearchParams();

  // Rooms state - loaded from API (prices come directly from database)
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'price' | 'suite' | 'amenities'>('price');

  // Search data from widget
  const [searchData, setSearchData] = useState<SearchData>({
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    adults: parseInt(searchParams.get('adults') || '1'),
    children: parseInt(searchParams.get('children') || '0'),
  });

  // Fetch rooms from API - prices come directly from the database (RoomType.base_price)
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params: any = {};
        if (searchData.checkIn) params.checkIn = searchData.checkIn;
        if (searchData.checkOut) params.checkOut = searchData.checkOut;
        if (searchData.adults + searchData.children > 0) {
          params.guests = searchData.adults + searchData.children;
        }

        const apiRooms = await roomTypesService.getRoomTypes(params);
        console.log('[RoomsPage] API returned:', apiRooms);
        console.log('[RoomsPage] Is array:', Array.isArray(apiRooms), 'Length:', apiRooms?.length);
        if (Array.isArray(apiRooms) && apiRooms.length > 0) {
          console.log('[RoomsPage] Using API data, first room slug:', apiRooms[0]?.slug, 'price:', apiRooms[0]?.price);
          setRooms(apiRooms);
          // Clear stale filter selections that may not exist in API data
          setSelectedAmenities([]);
          setSelectedCategories([]);
        } else {
          console.log('[RoomsPage] API returned empty');
          setRooms([]);
        }
      } catch (err) {
        console.error('Failed to fetch rooms from API:', err);
        setError('Failed to load rooms');
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [searchData.checkIn, searchData.checkOut, searchData.adults, searchData.children]);

  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 80000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showFilters &&
        filtersRef.current &&
        !filtersRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  // Get unique amenities and categories from all rooms
  const allAmenities = useMemo(() => {
    const amenitiesSet = new Set<string>();
    rooms.forEach(room => {
      room.amenities?.forEach(amenity => amenitiesSet.add(amenity));
    });
    return Array.from(amenitiesSet).sort();
  }, [rooms]);

  // Clear selected amenities that no longer exist after data refresh
  useEffect(() => {
    if (allAmenities.length > 0 && selectedAmenities.length > 0) {
      const validAmenities = selectedAmenities.filter(a => allAmenities.includes(a));
      if (validAmenities.length !== selectedAmenities.length) {
        setSelectedAmenities(validAmenities);
      }
    }
  }, [allAmenities]);

  const categories = ['standard', 'deluxe', 'suite', 'presidential'];

  const sortOptions = useMemo(() => [
    { label: 'Popular', value: 'popularity' },
    { label: 'Top Rated', value: 'rating' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
  ], []);

  // Calculate nights for availability check
  const nights = useMemo(() => {
    if (!searchData.checkIn || !searchData.checkOut) return 0;
    const checkIn = new Date(searchData.checkIn);
    const checkOut = new Date(searchData.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }, [searchData.checkIn, searchData.checkOut]);

  // Check if room is available using real API data
  const isRoomAvailable = (room: Room) => {
    // If no dates selected, show all rooms
    if (!searchData.checkIn || !searchData.checkOut) return true;

    // Use real availability from API response
    if (room.available === false) return false;
    return true;
  };

  // Filter and sort rooms
  const filteredAndSortedRooms = useMemo(() => {
    let filtered = rooms.filter((room) => {
      // Availability filter (most important!)
      if (!isRoomAvailable(room)) return false;

      // Price range filter
      if (room.price < priceRange[0] || room.price > priceRange[1]) return false;

      // Category filter (case-insensitive)
      if (selectedCategories.length > 0) {
        const roomCategory = (room.category || '').toLowerCase();
        if (!roomCategory || !selectedCategories.includes(roomCategory)) return false;
      }

      // Guest count filter
      const totalGuests = searchData.adults + searchData.children;
      if (room.maxGuests < totalGuests) return false;

      // Amenities filter (case-insensitive)
      if (selectedAmenities.length > 0) {
        const roomAmenities = (room.amenities || []).map(a => a.toLowerCase());
        const hasAllAmenities = selectedAmenities.every(amenity =>
          roomAmenities.includes(amenity.toLowerCase())
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });

    // Sort rooms
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popularity':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [rooms, priceRange, selectedCategories, selectedAmenities, searchData, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRooms = filteredAndSortedRooms.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [priceRange, selectedCategories, selectedAmenities, searchData, sortBy, itemsPerPage]);

  // Scroll to results when page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearch = (data: SearchData) => {
    setSearchData(data);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 80000]);
    setSelectedCategories([]);
    setSelectedAmenities([]);
  };

  const getCategoryBadgeColor = (category?: string) => {
    switch (category) {
      case 'standard':
        return 'bg-blue-100 text-blue-700';
      case 'deluxe':
        return 'bg-purple-100 text-purple-700';
      case 'suite':
        return 'bg-amber-100 text-amber-700';
      case 'presidential':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const hasSearchDates = searchData.checkIn && searchData.checkOut;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Fixed Breadcrumb */}
      <nav className="fixed top-20 left-0 right-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-3">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-neutral-600 hover:text-primary-600 transition-colors font-medium"
              >
                <Home size={16} strokeWidth={1.5} />
                <span>Home</span>
              </button>
            </li>
            <ChevronRight size={16} className="text-neutral-400" strokeWidth={1.5} />
            <li className="text-neutral-900 font-semibold">
              Available Suites
            </li>
          </ol>
        </div>
      </nav>

      {/* Content with top spacing for fixed breadcrumb */}
      <div className="pt-24 pb-20 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border-2 border-neutral-200 hover:border-primary-300 transition-all"
          >
            <SlidersHorizontal size={20} className="text-primary-600" />
            <span className="font-semibold text-neutral-900">
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </span>
            {(selectedCategories.length + selectedAmenities.length > 0) && (
              <span className="px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full font-bold">
                {selectedCategories.length + selectedAmenities.length}
              </span>
            )}
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* LEFT SIDEBAR - Filters & Search (Desktop: Sticky, Mobile: Collapsible) */}
          <aside className={`w-full lg:w-[360px] flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-32 space-y-6">

              {/* Search Widget Card */}
              <div className="bg-gradient-to-br from-white to-neutral-50 rounded-2xl border-2 border-primary-200 p-5 sm:p-6 shadow-lg overflow-visible">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <SlidersHorizontal size={20} className="text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900">Search & Filter</h2>
                </div>
                <RoomsSearchWidget onSearch={handleSearch} />
              </div>

              {/* Filters Card */}
              <div ref={filtersRef} className="bg-white rounded-2xl border-2 border-neutral-200 shadow-md overflow-hidden">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-primary-50 to-beige-50 px-6 py-5 border-b-2 border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-neutral-900">
                        Refine Results
                      </h3>
                      {(selectedCategories.length + selectedAmenities.length > 0) && (
                        <span className="px-2.5 py-1 bg-primary-600 text-white text-xs rounded-full font-bold">
                          {selectedCategories.length + selectedAmenities.length}
                        </span>
                      )}
                    </div>
                    {(selectedCategories.length + selectedAmenities.length > 0) && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-primary-600 hover:text-primary-700 font-bold transition-colors underline decoration-2 underline-offset-2"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Content */}
                <div className="p-6">
                  {/* Price Filter */}
                  <div className="mb-6 pb-6 border-b-2 border-neutral-100">
                    <label className="block text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <span className="text-primary-600">₹</span>
                      Price per night
                    </label>
                    <div className="flex items-center justify-between mb-4 px-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-neutral-600 font-medium mb-1">Min</span>
                        <span className="text-lg font-bold text-neutral-900">{formatCurrency(priceRange[0])}</span>
                      </div>
                      <div className="h-px flex-1 mx-3 bg-neutral-200" />
                      <div className="flex flex-col text-right">
                        <span className="text-xs text-neutral-600 font-medium mb-1">Max</span>
                        <span className="text-lg font-bold text-neutral-900">{formatCurrency(priceRange[1])}</span>
                      </div>
                    </div>
                    <div className="space-y-3 px-1">
                      <input
                        type="range"
                        min="0"
                        max="80000"
                        step="1000"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full h-2 accent-primary-600 cursor-pointer"
                      />
                      <input
                        type="range"
                        min="0"
                        max="80000"
                        step="1000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full h-2 accent-primary-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Suite Category Filter */}
                  <div className="mb-6 pb-6 border-b-2 border-neutral-100">
                    <label className="block text-base font-bold text-neutral-900 mb-4">
                      Room Type
                    </label>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold capitalize transition-all text-left flex items-center justify-between group ${
                            selectedCategories.includes(category)
                              ? 'bg-primary-600 text-white shadow-md scale-[1.02]'
                              : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-2 border-neutral-200 hover:border-primary-300'
                          }`}
                        >
                          <span>{category}</span>
                          {selectedCategories.includes(category) && (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Filter */}
                  <div>
                    <label className="block text-base font-bold text-neutral-900 mb-4">
                      Amenities
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allAmenities.slice(0, 12).map(amenity => (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                            selectedAmenities.includes(amenity)
                              ? 'bg-primary-600 text-white border-primary-700 shadow-md scale-105'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
                          }`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 min-w-0">

            {/* Header with Controls */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900 mb-1">Available Suites</h1>
                  <p className="text-sm text-neutral-600">
                    {filteredAndSortedRooms.length} {filteredAndSortedRooms.length === 1 ? 'suite' : 'suites'} available
                    {hasSearchDates && nights > 0 && ` • ${nights} ${nights === 1 ? 'night' : 'nights'}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Sort Dropdown - Tailwind Styled */}
                  <div className="w-48">
                    <SearchableSelect
                      options={sortOptions}
                      value={sortBy}
                      onChange={(value) => setSortBy(value as SortOption)}
                      placeholder="Sort by"
                      icon={ArrowUpDown}
                    />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                      title="Grid view"
                    >
                      <Grid3x3 size={18} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === 'list'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                      title="List view"
                    >
                      <List size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>

            {/* Active Filters Tags */}
            {(selectedCategories.length > 0 || selectedAmenities.length > 0) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {selectedCategories.map(category => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-200"
                  >
                    <span className="capitalize">{category}</span>
                    <button onClick={() => toggleCategory(category)} className="hover:bg-primary-100 rounded-full p-0.5 transition-colors">
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </span>
                ))}
                {selectedAmenities.map(amenity => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-200"
                  >
                    {amenity}
                    <button onClick={() => toggleAmenity(amenity)} className="hover:bg-primary-100 rounded-full p-0.5 transition-colors">
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            </div>

            {/* Pagination Info */}
            {filteredAndSortedRooms.length > 0 && (
              <div className="mb-6 text-sm text-neutral-600">
                Showing <span className="font-semibold text-neutral-900">{startIndex + 1}-{Math.min(endIndex, filteredAndSortedRooms.length)}</span> of <span className="font-semibold text-neutral-900">{filteredAndSortedRooms.length}</span> suites
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-20 px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                <p className="text-neutral-900 text-xl font-semibold mb-2">Unable to Load Rooms</p>
                <p className="text-neutral-600 mb-8">{error}</p>
                <Button
                  variant="primary"
                  onClick={() => setSearchData({ ...searchData })}
                  className="font-semibold px-8 py-4 inline-flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State (API returned no rooms) */}
            {rooms.length === 0 && !isLoading && !error && (
              <div className="text-center py-20 px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-6">
                  <Home size={32} className="text-neutral-400" />
                </div>
                <p className="text-neutral-900 text-xl font-semibold mb-2">No Rooms Available</p>
                <p className="text-neutral-600">There are currently no rooms configured. Please check back later.</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-20 px-6">
                <Loader2 size={40} className="animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-neutral-600 font-medium">Loading available suites...</p>
              </div>
            )}

            {/* Room Grid/List */}
            {!isLoading && !error && rooms.length > 0 && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6' : 'space-y-4 sm:space-y-6'}>
              {paginatedRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  viewMode={viewMode}
                  searchData={searchData}
                  nights={nights}
                  navigate={navigate}
                  getCategoryBadgeColor={getCategoryBadgeColor}
                />
              ))}
            </div>
            )}

            {/* No Results (filters narrowed to zero) */}
            {filteredAndSortedRooms.length === 0 && rooms.length > 0 && !isLoading && !error && (
              <div className="text-center py-24 px-6">
                <p className="text-neutral-600 text-xl mb-8 font-medium">
                  No suites found matching your criteria
                </p>
                <Button variant="primary" onClick={clearFilters} className="font-semibold px-8 py-4">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-neutral-200">
                {/* Page info */}
                <div className="text-sm text-neutral-600">
                  Page <span className="font-semibold text-neutral-900">{currentPage}</span> of <span className="font-semibold text-neutral-900">{totalPages}</span>
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-1.5">
                  {/* First page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="First page"
                  >
                    <ChevronsLeft size={16} className="text-neutral-600" />
                  </button>

                  {/* Previous page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} className="text-neutral-600" />
                  </button>

                  {/* Page numbers */}
                  <div className="hidden sm:flex items-center gap-1 mx-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
                          ···
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Next page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} className="text-neutral-600" />
                  </button>

                  {/* Last page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Last page"
                  >
                    <ChevronsRight size={16} className="text-neutral-600" />
                  </button>
                </div>

                {/* Results info */}
                <div className="hidden sm:block text-sm text-neutral-600">
                  <span className="font-semibold text-neutral-900">
                    {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAndSortedRooms.length)}
                  </span>
                  <span className="font-medium"> of </span>
                  <span className="font-semibold text-neutral-900">{filteredAndSortedRooms.length}</span>
                  <span className="font-medium"> suites</span>
                </div>
              </div>
            )}

          </div>
          {/* END MAIN CONTENT AREA */}

        </div>
        {/* END Two Column Layout */}

        </div>
      </div>
    </div>
  );
};

// Separate RoomCard component for cleaner code
interface RoomCardProps {
  room: Room;
  viewMode: ViewMode;
  searchData: SearchData;
  nights: number;
  navigate: (path: string) => void;
  getCategoryBadgeColor: (category?: string) => string;
}

const RoomCard = ({ room, viewMode, searchData, nights, navigate, getCategoryBadgeColor }: RoomCardProps) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const totalPrice = nights > 0 ? room.price * nights : room.price;
  const hasSearchDates = searchData.checkIn && searchData.checkOut;

  const handleClick = () => {
    // Pass search params to room detail
    const params = new URLSearchParams();
    if (searchData.checkIn) params.set('checkIn', searchData.checkIn);
    if (searchData.checkOut) params.set('checkOut', searchData.checkOut);
    params.set('adults', searchData.adults.toString());
    params.set('children', searchData.children.toString());
    navigate(`/rooms/${room.slug || room.id}?${params.toString()}`);
  };

  if (viewMode === 'list') {
    return (
      <div className="group">
        <Card
          padding="none"
        className="overflow-hidden transition-all duration-300 cursor-pointer border-2 border-neutral-200 hover:border-primary-300 bg-white hover:-translate-y-1"
          onClick={handleClick}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
          <div className="relative sm:w-96 h-72 sm:h-auto overflow-hidden flex-shrink-0 bg-neutral-100">
              <img
                src={(room.images && room.images[0]) || '/placeholder-room.jpg'}
                alt={room.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-room.jpg';
                }}
              />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Category Badge */}
              {room.category && (
              <div className={`absolute top-3 left-3 px-3.5 py-2 rounded-lg text-xs font-bold capitalize border-2 ${getCategoryBadgeColor(room.category)}`}>
                  {room.category}
                </div>
              )}

            {/* Available Badge */}
              {hasSearchDates && room.available !== false && (
              <div className="absolute top-3 right-3 px-3.5 py-2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center gap-1.5 border-2 border-green-400">
                <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-xs font-bold">Available</span>
                </div>
              )}

            {/* Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(room.id);
              }}
              className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-2 border-white hover:scale-110 transition-all shadow-md z-10 flex items-center justify-center"
            >
              <Heart
                size={20}
                className={isInWishlist(room.id) ? 'fill-red-500 text-red-500' : 'text-neutral-600'}
              />
            </button>
            </div>

            {/* Content */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {room.name}
                  </h3>
                  {room.rating && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                      <Star size={16} fill="currentColor" strokeWidth={0} className="text-amber-500" />
                      <span className="font-bold text-neutral-900 text-sm">{room.rating.toFixed(1)}</span>
                      </div>
                      {room.reviewCount && (
                      <span className="text-xs text-neutral-600 font-medium">({room.reviewCount} reviews)</span>
                      )}
                    </div>
                  )}
                </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="flex sm:flex-col items-baseline sm:items-end gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold text-neutral-900">
                    {formatCurrency(room.price)}
                  </span>
                  <span className="text-sm text-neutral-600 font-medium">/night</span>
                  </div>
                </div>
              </div>

            <p className="text-neutral-600 text-sm sm:text-base mb-5 leading-relaxed line-clamp-2">
              {room.shortDescription || room.description.substring(0, 180) + '...'}
              </p>

              {/* Room Features */}
            <div className="flex items-center gap-6 mb-5 pb-5 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-neutral-700">
                <Users size={18} strokeWidth={1.5} className="text-primary-600" />
                <span className="text-sm font-semibold">{room.maxGuests} Guests</span>
                </div>
              <div className="w-1 h-1 rounded-full bg-neutral-300" />
              <div className="flex items-center gap-2 text-neutral-700">
                <Maximize2 size={18} strokeWidth={1.5} className="text-primary-600" />
                <span className="text-sm font-semibold">{room.size} ft²</span>
                </div>
              </div>

              {/* Total Price Info */}
              {hasSearchDates && nights > 0 && (
              <div className="mb-5 p-4 bg-gradient-to-br from-primary-50 via-primary-100/70 to-primary-50 rounded-xl border-2 border-primary-300">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-primary-700 font-semibold">
                    Total for {nights} {nights === 1 ? 'night' : 'nights'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-primary-900">
                    ${totalPrice.toFixed(0)}
                  </span>
                  </div>
                </div>
              )}

            {/* Features/Amenities Preview */}
            <div className="flex flex-wrap gap-2 mb-5">
              {(room.features || room.amenities.slice(0, 5)).slice(0, 5).map((item) => (
                    <span
                  key={item}
                  className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md font-medium border border-neutral-200"
                    >
                  {item}
                    </span>
                  ))}
              {room.amenities.length > 5 && (
                <span className="text-xs px-2.5 py-1 bg-primary-100 text-primary-700 rounded-md font-bold border border-primary-200">
                  +{room.amenities.length - 5}
                </span>
              )}
            </div>

            {/* View Details Button */}
            <Button
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="font-semibold text-sm sm:text-base py-3.5 group-hover:scale-105 transition-all sm:w-auto w-full"
            >
              View Details
            </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group">
      <Card
        padding="none"
        className="overflow-hidden transition-all duration-300 cursor-pointer h-full flex flex-col border-2 border-neutral-200 hover:border-primary-300 bg-white hover:-translate-y-2"
        onClick={handleClick}
      >
        {/* Room Image */}
        <div className="relative h-64 overflow-hidden bg-neutral-100">
          <img
            src={(room.images && room.images[0]) || '/placeholder-room.jpg'}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-room.jpg';
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Price Badge */}
          <div className="absolute top-3 right-3 bg-white px-3.5 py-2 rounded-lg border-2 border-neutral-200">
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-neutral-900 leading-none">
                {formatCurrency(room.price)}
            </span>
              <span className="text-xs text-neutral-600 font-medium">/night</span>
          </div>
          </div>
          
          {/* Category Badge */}
          {room.category && (
            <div className={`absolute top-3 left-3 px-3.5 py-2 rounded-lg text-xs font-bold capitalize border-2 ${getCategoryBadgeColor(room.category)}`}>
              {room.category}
            </div>
          )}

          {/* Available Badge */}
          {hasSearchDates && room.available !== false && (
            <div className="absolute bottom-3 right-3 px-3.5 py-2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center gap-1.5 border-2 border-green-400">
              <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="text-xs font-bold">Available</span>
            </div>
          )}

          {/* Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(room.id);
            }}
            className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-2 border-white hover:scale-110 transition-all shadow-md z-10 flex items-center justify-center"
          >
            <Heart
              size={20}
              className={isInWishlist(room.id) ? 'fill-red-500 text-red-500' : 'text-neutral-600'}
            />
          </button>
        </div>

        {/* Room Details */}
        <div className="p-5 flex flex-col flex-1">
          {/* Title and Rating */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {room.name}
            </h3>
            <div className="flex items-center gap-3">
            {room.rating && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                    <Star size={14} fill="currentColor" strokeWidth={0} className="text-amber-500" />
                    <span className="font-bold text-neutral-900 text-sm">{room.rating.toFixed(1)}</span>
                </div>
                {room.reviewCount && (
                    <span className="text-xs text-neutral-600 font-medium">({room.reviewCount})</span>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Description */}
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
            {room.shortDescription || room.description}
          </p>

          {/* Room Features */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-700">
              <Users size={16} strokeWidth={1.5} className="text-primary-600" />
              <span className="text-sm font-semibold">{room.maxGuests}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-neutral-300" />
            <div className="flex items-center gap-1.5 text-neutral-700">
              <Maximize2 size={16} strokeWidth={1.5} className="text-primary-600" />
              <span className="text-sm font-semibold">{room.size} ft²</span>
            </div>
          </div>

          {/* Total Price Info */}
          {hasSearchDates && nights > 0 && (
            <div className="mb-4 p-3 bg-gradient-to-br from-primary-50 via-primary-100/70 to-primary-50 rounded-xl border-2 border-primary-300">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-primary-700 font-semibold">
                  {nights} {nights === 1 ? 'night' : 'nights'} total
                </span>
                <span className="text-xl font-bold text-primary-900">
                ${totalPrice.toFixed(0)}
                </span>
              </div>
            </div>
          )}

          {/* Features/Amenities Preview */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(room.features || room.amenities.slice(0, 3)).slice(0, 3).map((item) => (
              <span
                key={item}
                className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md font-medium border border-neutral-200"
              >
                {item}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-xs px-2.5 py-1 bg-primary-100 text-primary-700 rounded-md font-bold border border-primary-200">
                +{room.amenities.length - 3}
              </span>
            )}
          </div>

          {/* View Details Button */}
          <Button
            variant="primary"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="font-semibold text-sm py-3.5 group-hover:scale-105 transition-all"
          >
            View Details
          </Button>
        </div>
      </Card>
    </div>
  );
};