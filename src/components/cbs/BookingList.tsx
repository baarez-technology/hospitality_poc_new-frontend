/**
 * BookingList Component v5.0
 * Modern Enterprise Design - Stripe/Linear Inspired
 * Glimmora Hotel Management
 */

import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  Calendar,
  X,
  Mail,
  ArrowUpDown,
  LogIn,
  LogOut,
  Home,
  CalendarDays,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import BookingRow from './BookingRow';
import { Button } from '../ui2/Button';
import { SearchBar } from '../ui2/SearchBar';
import { usePrecheckinStatus } from '@/hooks/admin/usePrecheckinStatus';

export default function BookingList({
  bookings,
  onBookingClick,
  onStatusChange,
  onNewBooking,
  onAssignRoom,
  onCheckIn,
  onCheckOut,
  onCancel,
  onSendEmail = null,
  isDark = false,
  initialTab = 'all',
  showCreateButton = true,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortField, setSortField] = useState('checkIn');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 10;
  const { getStatus: getPrecheckinStatus } = usePrecheckinStatus();

  // Filter panel state
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterPanelRef = useRef(null);

  // Filter states (applied filters)
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Temporary filter states (for panel)
  const [tempStatusFilter, setTempStatusFilter] = useState('all');
  const [tempSourceFilter, setTempSourceFilter] = useState('all');

  // Sync temp filters when panel opens
  useEffect(() => {
    if (filterPanelOpen) {
      setTempStatusFilter(statusFilter);
      setTempSourceFilter(sourceFilter);
    }
  }, [filterPanelOpen, statusFilter, sourceFilter]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        setFilterPanelOpen(false);
      }
    };
    if (filterPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterPanelOpen]);

  // Apply filters
  const applyFilters = () => {
    setStatusFilter(tempStatusFilter);
    setSourceFilter(tempSourceFilter);
    setCurrentPage(1);
    setFilterPanelOpen(false);
  };

  // Clear temp filters
  const clearTempFilters = () => {
    setTempStatusFilter('all');
    setTempSourceFilter('all');
  };

  // Get unique sources from bookings
  const uniqueSources = useMemo(() => {
    const sources = [...new Set(bookings.map(b => b.source).filter(Boolean))];
    return sources.sort();
  }, [bookings]);

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'all' || sourceFilter !== 'all';

  // Count active filters
  const activeFilterCount = [
    statusFilter !== 'all' ? 1 : 0,
    sourceFilter !== 'all' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setSourceFilter('all');
    setCurrentPage(1);
  };

  const today = new Date().toISOString().split('T')[0];

  // Calculate stats
  const stats = useMemo(() => ({
    total: bookings.length,
    arrivals: bookings.filter(b => b.checkIn === today && b.status !== 'CANCELLED').length,
    departures: bookings.filter(b => b.checkOut === today && b.status !== 'CANCELLED').length,
    inHouse: bookings.filter(b => b.status === 'CHECKED-IN').length
  }), [bookings, today]);

  // Calculate counts for tabs
  const counts = useMemo(() => ({
    all: bookings.length,
    today: bookings.filter(b => b.checkIn === today || (new Date(b.checkIn) <= new Date(today) && new Date(b.checkOut) > new Date(today))).length,
    arrivals: stats.arrivals,
    departures: stats.departures,
    inHouse: stats.inHouse
  }), [bookings, today, stats]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.guestName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.roomNumber && b.roomNumber.includes(q))
      );
    }

    // Tab filters
    if (activeTab === 'today') {
      result = result.filter(b => b.checkIn === today || (new Date(b.checkIn) <= new Date(today) && new Date(b.checkOut) > new Date(today)));
    } else if (activeTab === 'arrivals') {
      result = result.filter(b => b.checkIn === today && b.status !== 'CANCELLED');
    } else if (activeTab === 'departures') {
      result = result.filter(b => b.checkOut === today && b.status !== 'CANCELLED');
    } else if (activeTab === 'inHouse') {
      result = result.filter(b => b.status === 'CHECKED-IN');
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      result = result.filter(b => b.source === sourceFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal, bVal;
      if (sortField === 'checkIn' || sortField === 'checkOut') {
        aVal = new Date(a[sortField]);
        bVal = new Date(b[sortField]);
      } else if (sortField === 'amount') {
        aVal = a.amount;
        bVal = b.amount;
      } else if (sortField === 'guestName') {
        aVal = a.guestName.toLowerCase();
        bVal = b.guestName.toLowerCase();
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    return result;
  }, [bookings, searchQuery, activeTab, today, sortField, sortDirection, statusFilter, sourceFilter]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedBookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedBookings.map(b => b.id)));
    }
  };

  // Handle individual selection
  const handleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Sort indicator component
  const SortIndicator = ({ field }) => {
    const isActive = sortField === field;
    return (
      <span className={`inline-flex ml-1 transition-all duration-150 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
        {isActive ? (
          sortDirection === 'asc' ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3" />
        )}
      </span>
    );
  };

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Avoid setState during render
  useEffect(() => {
    setCurrentPage((p) => {
      if (totalPages <= 0) return 1;
      return Math.min(p, totalPages);
    });
  }, [totalPages]);

  const tabs = [
    { id: 'all', label: 'All Bookings', shortLabel: 'All', count: counts.all, icon: CalendarDays },
    { id: 'arrivals', label: 'Arrivals', shortLabel: 'Arrivals', count: counts.arrivals, icon: LogIn },
    { id: 'departures', label: 'Departures', shortLabel: 'Departs', count: counts.departures, icon: LogOut },
    { id: 'inHouse', label: 'In-House', shortLabel: 'In-House', count: counts.inHouse, icon: Home }
  ];

  // Clear selection when changing tabs
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Container */}
      <div className="bg-white rounded-[10px]">
        {/* Header Section */}
        <div className="border-b border-neutral-100">
          {/* Tab Navigation - Underline style */}
          <div className="px-4 sm:px-6 pt-3 sm:pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-0.5 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                  className={`relative px-2.5 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold transition-all duration-150 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold tabular-nums ${
                      activeTab === tab.id
                        ? 'bg-terra-500 text-white'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {tab.count}
                    </span>
                  </span>
                  {/* Active indicator */}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-terra-500 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            {showCreateButton && (
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={onNewBooking}
                className="text-[12px] sm:text-[13px]"
              >
                <span className="hidden sm:inline">New Booking</span>
                <span className="sm:hidden">New</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="flex-1 min-w-0 sm:max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                onClear={() => setSearchQuery('')}
                placeholder="Search guest, ID, room..."
                size="md"
              />
            </div>

            {/* Spacer to push filters to right - hidden on mobile */}
            <div className="hidden sm:block flex-1" />

            {/* Active Filter Chips - hidden on mobile, visible on desktop */}
            {hasActiveFilters && (
              <div className="hidden sm:flex items-center gap-2">
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-ocean-100 text-ocean-700 rounded-full text-xs font-medium">
                    {statusFilter}
                    <button onClick={() => setStatusFilter('all')} className="hover:bg-ocean-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {sourceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-medium">
                    {sourceFilter}
                    <button onClick={() => setSourceFilter('all')} className="hover:bg-sage-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Filter Button & Panel */}
            <div className="relative flex-shrink-0" ref={filterPanelRef}>
              <button
                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                className={`h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-lg text-[12px] sm:text-[13px] font-medium flex items-center gap-1.5 sm:gap-2 transition-all duration-150 ${
                  hasActiveFilters
                    ? 'bg-terra-500 text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 rounded-full bg-white text-terra-600 text-[10px] sm:text-[11px] font-semibold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter Panel */}
              {filterPanelOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[10px] border border-neutral-200 shadow-lg z-50 overflow-hidden">
                  {/* Panel Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <h3 className="text-[13px] font-semibold text-neutral-800">Filters</h3>
                    <button
                      onClick={() => setFilterPanelOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-neutral-50 text-neutral-500 hover:text-neutral-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Panel Content */}
                  <div className="px-6 py-5 space-y-5 max-h-[400px] overflow-y-auto">
                    {/* Status Section */}
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3 block">
                        Status
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'all', label: 'All' },
                          { value: 'CONFIRMED', label: 'Confirmed' },
                          { value: 'CHECKED-IN', label: 'Checked In' },
                          { value: 'CHECKED-OUT', label: 'Checked Out' },
                          { value: 'PENDING', label: 'Pending' },
                          { value: 'CANCELLED', label: 'Cancelled' }
                        ].map(status => (
                          <button
                            key={status.value}
                            onClick={() => setTempStatusFilter(status.value)}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-150 ${
                              tempStatusFilter === status.value
                                ? 'bg-terra-500 text-white border-terra-500'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-terra-300 hover:text-terra-600'
                            }`}
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Source Section */}
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3 block">
                        Source
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setTempSourceFilter('all')}
                          className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-150 ${
                            tempSourceFilter === 'all'
                              ? 'bg-terra-500 text-white border-terra-500'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-terra-300 hover:text-terra-600'
                          }`}
                        >
                          All
                        </button>
                        {uniqueSources.map(source => (
                          <button
                            key={source}
                            onClick={() => setTempSourceFilter(source)}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-150 ${
                              tempSourceFilter === source
                                ? 'bg-terra-500 text-white border-terra-500'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-terra-300 hover:text-terra-600'
                            }`}
                          >
                            {source}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Panel Footer */}
                  <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100 bg-neutral-50/50">
                    <button
                      onClick={clearTempFilters}
                      className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-100"
                    >
                      Clear
                    </button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={applyFilters}
                      className="font-semibold"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-terra-500 flex items-center justify-between border-b border-terra-600/20">
            <div className="flex items-center gap-2 sm:gap-3 text-white">
              <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-white/20 rounded-lg text-[12px] sm:text-[13px] font-semibold">
                {selectedIds.size}
              </span>
              <span className="text-[12px] sm:text-[13px] font-semibold">
                <span className="hidden sm:inline">{selectedIds.size === 1 ? 'booking' : 'bookings'} selected</span>
                <span className="sm:hidden">selected</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={Mail}
                onClick={() => {
                  if (onSendEmail) {
                    onSendEmail(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  }
                }}
                className="text-white hover:bg-white/20 hover:text-white text-[11px] sm:text-[12px] font-semibold px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Send Email</span>
                <span className="sm:hidden">Email</span>
              </Button>
              <Button variant="ghost" size="sm" icon={X} onClick={() => setSelectedIds(new Set())} className="text-white hover:bg-white/20 hover:text-white text-[11px] sm:text-[12px] font-semibold px-2 sm:px-3">
                <span className="hidden sm:inline">Deselect</span>
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto overflow-y-hidden rounded-b-[10px]">
          <table className="w-full min-w-[1420px] border-collapse">
            <colgroup>
              <col style={{ width: '48px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '200px' }} />
              <col style={{ width: '200px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '110px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '48px' }} />
            </colgroup>
            <thead>
              <tr className="bg-neutral-50/30 border-b border-neutral-100">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginatedBookings.length && paginatedBookings.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500 focus:ring-offset-0"
                  />
                </th>
                <th
                  onClick={() => handleSort('guestName')}
                  className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer group hover:text-neutral-600"
                >
                  <span className="flex items-center">
                    Guest
                    <SortIndicator field="guestName" />
                  </span>
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Room
                </th>
                <th
                  onClick={() => handleSort('checkIn')}
                  className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer group hover:text-neutral-600"
                >
                  <span className="flex items-center">
                    Check-in
                    <SortIndicator field="checkIn" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('checkOut')}
                  className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer group hover:text-neutral-600"
                >
                  <span className="flex items-center">
                    Check-out
                    <SortIndicator field="checkOut" />
                  </span>
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Source
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Pre Check-In
                </th>
                <th
                  onClick={() => handleSort('amount')}
                  className="text-right px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer group hover:text-neutral-600"
                >
                  <span className="flex items-center justify-end">
                    Amount
                    <SortIndicator field="amount" />
                  </span>
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>

            <tbody>
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-lg bg-terra-50 flex items-center justify-center mb-4">
                        <Search className="w-5 h-5 text-terra-500" />
                      </div>
                      <p className="text-[13px] font-semibold text-neutral-800 mb-1">
                        No bookings found
                      </p>
                      <p className="text-[11px] text-neutral-500 font-medium">
                        Try adjusting your search or filter criteria
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="mt-4 px-3 py-1.5 text-[12px] font-semibold text-terra-600 hover:text-terra-700 hover:bg-terra-50 rounded-lg transition-colors"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking, index) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    onClick={onBookingClick}
                    onStatusChange={onStatusChange}
                    onAssignRoom={onAssignRoom}
                    onCheckIn={onCheckIn}
                    onCheckOut={onCheckOut}
                    onCancel={onCancel}
                    isDark={isDark}
                    searchQuery={searchQuery}
                    isSelected={selectedIds.has(booking.id)}
                    onSelect={handleSelect}
                    animationDelay={index * 30}
                    precheckinStatus={getPrecheckinStatus(Number(booking.dbId || booking.id))}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 bg-neutral-50/30">
            <p className="text-[12px] sm:text-[13px] text-neutral-500 order-2 sm:order-1">
              <span className="hidden sm:inline">Showing </span>
              <span className="font-semibold text-neutral-700">{(currentPage - 1) * itemsPerPage + 1}</span>
              <span className="hidden sm:inline">{' '}to{' '}</span>
              <span className="sm:hidden">-</span>
              <span className="font-semibold text-neutral-700">{Math.min(currentPage * itemsPerPage, filteredBookings.length)}</span>
              {' '}of{' '}
              <span className="font-semibold text-neutral-700">{filteredBookings.length}</span>
            </p>

            <div className="flex items-center gap-0.5 sm:gap-1 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'text-neutral-300 cursor-not-allowed'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <div className="flex items-center gap-0.5 mx-0.5 sm:mx-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[12px] sm:text-[13px] font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-terra-500 text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'text-neutral-300 cursor-not-allowed'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
