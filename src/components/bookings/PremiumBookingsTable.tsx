import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crown, Eye, Pencil, MoreHorizontal, Bed, XCircle,
  CalendarX, ChevronUp, ChevronDown, ChevronsUpDown,
  Mail, Phone, Clock, ArrowRight, Sparkles, User,
  ChevronRight, Users, Loader2
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { apiClient } from '@/api/client';

/**
 * Premium Bookings Table
 * Luxury styling with enhanced spacing, soft shadows, and inline status indicators
 */
export default function PremiumBookingsTable({
  bookings,
  sortConfig,
  onSort,
  onViewBooking,
  onEditBooking,
  onAssignRoom,
  onCancelBooking,
  selectedBookings = [],
  onSelectBooking,
  onSelectAll,
  viewDensity = 'comfortable'
}) {
  const { formatCurrency } = useCurrency();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const dropdownRef = useRef(null);

  // Group booking expansion state
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [childBookings, setChildBookings] = useState<Record<string, any[]>>({});
  const [loadingGroups, setLoadingGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle group booking expansion and fetch child bookings
  const toggleGroupExpansion = useCallback(async (booking: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const bookingId = String(booking.id);
    const groupId = booking.groupBookingId || booking.group_booking_id;

    if (expandedGroups.has(bookingId)) {
      // Collapse
      setExpandedGroups(prev => {
        const next = new Set(prev);
        next.delete(bookingId);
        return next;
      });
      return;
    }

    // Expand and fetch child bookings if not already loaded
    setExpandedGroups(prev => new Set(prev).add(bookingId));

    if (!childBookings[bookingId] && groupId) {
      setLoadingGroups(prev => new Set(prev).add(bookingId));
      try {
        const res = await apiClient.get('/api/v1/bookings', {
          params: { group_booking_id: groupId, page_size: 20 }
        });
        const data = res.data?.data || res.data;
        const allBookings = data?.items || data?.bookings || (Array.isArray(data) ? data : []);
        // Filter out the parent booking to show only children
        const children = allBookings.filter((b: any) =>
          String(b.id) !== bookingId && (b.parentBookingId || b.parent_booking_id)
        );
        setChildBookings(prev => ({ ...prev, [bookingId]: children }));
      } catch (err) {
        console.error('Failed to fetch child bookings:', err);
        setChildBookings(prev => ({ ...prev, [bookingId]: [] }));
      } finally {
        setLoadingGroups(prev => {
          const next = new Set(prev);
          next.delete(bookingId);
          return next;
        });
      }
    }
  }, [expandedGroups, childBookings]);

  // Check if booking is a group parent
  const isGroupParent = (booking: any) => {
    return booking.isGroupBooking || booking.is_group_booking ||
           (booking.groupBookingId || booking.group_booking_id) && !(booking.parentBookingId || booking.parent_booking_id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusConfig = (status) => {
    const configs = {
      'CONFIRMED': {
        bg: 'bg-ocean-50',
        text: 'text-ocean-700',
        dot: 'bg-ocean-500',
        border: 'border-ocean-200',
        label: 'Confirmed'
      },
      'PENDING': {
        bg: 'bg-gold-50',
        text: 'text-gold-700',
        dot: 'bg-gold-500',
        border: 'border-gold-200',
        label: 'Pending'
      },
      'CHECKED-IN': {
        bg: 'bg-sage-50',
        text: 'text-sage-700',
        dot: 'bg-sage-500 animate-pulse',
        border: 'border-sage-200',
        label: 'Checked In'
      },
      'CHECKED-OUT': {
        bg: 'bg-neutral-100',
        text: 'text-neutral-600',
        dot: 'bg-neutral-400',
        border: 'border-neutral-200',
        label: 'Checked Out'
      },
      'CANCELLED': {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        dot: 'bg-rose-500',
        border: 'border-rose-200',
        label: 'Cancelled'
      },
      'NO_SHOW': {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        dot: 'bg-rose-500',
        border: 'border-rose-200',
        label: 'No Show'
      }
    };
    return configs[status] || configs['PENDING'];
  };

  const getSourceConfig = (source) => {
    const configs = {
      'Website': { bg: 'bg-terra-50', text: 'text-terra-700', icon: '🌐' },
      'Booking.com': { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🅱️' },
      'Expedia': { bg: 'bg-gold-50', text: 'text-gold-700', icon: '✈️' },
      'Walk-in': { bg: 'bg-neutral-100', text: 'text-neutral-700', icon: '🚶' }
    };
    return configs[source] || { bg: 'bg-neutral-100', text: 'text-neutral-700', icon: '📋' };
  };

  const SortIcon = ({ field }) => {
    if (sortConfig.field !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-neutral-300" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-terra-500" />
      : <ChevronDown className="w-3.5 h-3.5 text-terra-500" />;
  };

  const densityStyles = {
    compact: 'py-2.5',
    comfortable: 'py-4'
  };

  const isAllSelected = bookings.length > 0 && selectedBookings.length === bookings.length;
  const isSomeSelected = selectedBookings.length > 0 && selectedBookings.length < bookings.length;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100/50 border-b border-neutral-200">
              {/* Checkbox */}
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={el => el && (el.indeterminate = isSomeSelected)}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500/20 cursor-pointer"
                />
              </th>

              {/* Guest */}
              <th
                className="text-left px-4 py-3 cursor-pointer group"
                onClick={() => onSort('guest')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider group-hover:text-terra-600 transition-colors">
                    Guest
                  </span>
                  <SortIcon field="guest" />
                </div>
              </th>

              {/* Booking Info */}
              <th
                className="text-left px-4 py-3 cursor-pointer group"
                onClick={() => onSort('id')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider group-hover:text-terra-600 transition-colors">
                    Booking
                  </span>
                  <SortIcon field="id" />
                </div>
              </th>

              {/* Stay Period */}
              <th
                className="text-left px-4 py-3 cursor-pointer group"
                onClick={() => onSort('checkIn')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider group-hover:text-terra-600 transition-colors">
                    Stay Period
                  </span>
                  <SortIcon field="checkIn" />
                </div>
              </th>

              {/* Room */}
              <th className="text-left px-4 py-3">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Room
                </span>
              </th>

              {/* Status */}
              <th
                className="text-left px-4 py-3 cursor-pointer group"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider group-hover:text-terra-600 transition-colors">
                    Status
                  </span>
                  <SortIcon field="status" />
                </div>
              </th>

              {/* Channel */}
              <th className="text-left px-4 py-3">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Channel
                </span>
              </th>

              {/* Amount */}
              <th
                className="text-right px-4 py-3 cursor-pointer group"
                onClick={() => onSort('amount')}
              >
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider group-hover:text-terra-600 transition-colors">
                    Amount
                  </span>
                  <SortIcon field="amount" />
                </div>
              </th>

              {/* Actions */}
              <th className="w-32 px-4 py-3 text-right">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-neutral-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                      <CalendarX className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-base font-semibold text-neutral-900 mb-1">No bookings found</p>
                    <p className="text-sm text-neutral-500">Try adjusting your filters or search query</p>
                  </div>
                </td>
              </tr>
            ) : (
              bookings.map((booking, index) => {
                const status = getStatusConfig(booking.status);
                const source = getSourceConfig(booking.source);
                const isSelected = selectedBookings.includes(booking.id);
                const isHovered = hoveredRow === booking.id;
                const isGroup = isGroupParent(booking);
                const bookingId = String(booking.id);
                const isExpanded = expandedGroups.has(bookingId);
                const isLoading = loadingGroups.has(bookingId);
                const children = childBookings[bookingId] || [];

                return (
                  <>
                  <tr
                    key={booking.id}
                    className={`
                      group relative transition-all duration-200
                      ${isSelected ? 'bg-terra-50/50' : isHovered ? 'bg-neutral-50/80' : 'bg-white'}
                      hover:bg-neutral-50/80 cursor-pointer
                      ${isGroup && isExpanded ? 'border-b-0' : ''}
                    `}
                    onClick={() => onViewBooking?.(booking)}
                    onMouseEnter={() => setHoveredRow(booking.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Selection indicator */}
                    <td className="absolute left-0 top-0 bottom-0 w-1">
                      <div className={`h-full transition-all duration-200 ${isSelected ? 'bg-terra-500' : isGroup ? 'bg-blue-400' : 'bg-transparent group-hover:bg-terra-200'}`} />
                    </td>

                    {/* Checkbox */}
                    <td className={`px-4 ${densityStyles[viewDensity]}`} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {/* Group expand button */}
                        {isGroup && (
                          <button
                            onClick={(e) => toggleGroupExpansion(booking, e)}
                            className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                            title={isExpanded ? 'Collapse group' : 'Expand group'}
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            )}
                          </button>
                        )}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectBooking?.(booking.id, e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500/20 cursor-pointer"
                        />
                      </div>
                    </td>

                    {/* Guest */}
                    <td className={`px-4 ${densityStyles[viewDensity]}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isGroup
                            ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                            : 'bg-gradient-to-br from-terra-100 to-terra-200'
                        }`}>
                          {isGroup ? (
                            <Users className="w-5 h-5 text-blue-700" />
                          ) : (
                            <span className="text-sm font-bold text-terra-700">
                              {booking.guest?.split(' ').filter(n => n).map(n => n[0]).join('') || 'G'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900 truncate group-hover:text-terra-700 transition-colors">
                              {booking.guest}
                            </span>
                            {booking.vip && (
                              <Crown className="w-4 h-4 text-gold-500 flex-shrink-0" />
                            )}
                            {isGroup && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                <Users className="w-3 h-3" />
                                Group
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-neutral-500 truncate">{booking.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Booking Info */}
                    <td className={`px-4 ${densityStyles[viewDensity]}`}>
                      <div>
                        <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                          {booking.id}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-neutral-500">
                          <User className="w-3 h-3" />
                          <span>
                            {booking.adults || booking.guests} adult{(booking.adults || booking.guests) !== 1 ? 's' : ''}
                            {(booking.children || 0) > 0 && `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Stay Period */}
                    <td className={`px-4 ${densityStyles[viewDensity]}`}>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          <span className="font-semibold text-neutral-900">{formatDate(booking.checkIn)}</span>
                          <ArrowRight className="w-3 h-3 text-neutral-400 inline mx-1.5" />
                          <span className="font-semibold text-neutral-900">{formatDate(booking.checkOut)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500">
                        <Clock className="w-3 h-3" />
                        <span>{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                        {booking.checkedOutAt && (booking.status === 'COMPLETED' || booking.status === 'CHECKED-OUT') && (
                          <span className="text-sage-600 ml-1">
                            (out: {new Date(booking.checkedOutAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Room */}
                    <td className={`px-4 ${densityStyles[viewDensity]}`}>
                      <div>
                        <span className="font-bold text-neutral-900">
                          {booking.room ? `#${booking.room}` : '—'}
                        </span>
                        <p className="text-xs text-neutral-500 mt-0.5">{booking.roomType}</p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className={`px-4 ${densityStyles[viewDensity]}`}>
                      <span className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold
                        ${status.bg} ${status.text} border ${status.border}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>

                    {/* Channel */}
                    <td className={`px-4 ${densityStyles[viewDensity]}`}>
                      <span className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                        ${source.bg} ${source.text}
                      `}>
                        <span>{source.icon}</span>
                        {booking.source}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className={`px-4 ${densityStyles[viewDensity]} text-right`}>
                      <span className="text-base font-bold text-neutral-900">
                        {formatCurrency(booking.totalPrice || booking.amount)}
                      </span>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {formatCurrency(booking.ratePerNight || Math.round((booking.totalPrice || booking.amount) / booking.nights))}/night
                      </p>
                    </td>

                    {/* Actions */}
                    <td className={`px-4 ${densityStyles[viewDensity]} text-right`} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewBooking?.(booking);
                          }}
                          className="p-2 rounded-lg text-neutral-500 hover:text-terra-600 hover:bg-terra-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditBooking?.(booking);
                          }}
                          className="p-2 rounded-lg text-neutral-500 hover:text-terra-600 hover:bg-terra-50 transition-colors"
                          title="Edit Booking"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <div className="relative" ref={openDropdownId === booking.id ? dropdownRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === booking.id ? null : booking.id);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              openDropdownId === booking.id
                                ? 'bg-neutral-100 text-neutral-700'
                                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
                            }`}
                            title="More Options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {openDropdownId === booking.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  onAssignRoom?.(booking);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                              >
                                <Bed className="w-4 h-4 text-ocean-500" />
                                Assign Room
                              </button>
                              <div className="my-1 border-t border-neutral-100" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  onCancelBooking?.(booking);
                                }}
                                disabled={booking.status === 'CANCELLED'}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Child Bookings Row */}
                  {isGroup && isExpanded && (
                    <tr className="bg-blue-50/30">
                      <td colSpan={10} className="px-0 py-0">
                        <div className="border-l-4 border-blue-400 ml-4 my-2">
                          {isLoading ? (
                            <div className="flex items-center gap-2 px-6 py-4 text-sm text-neutral-500">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading rooms in group...
                            </div>
                          ) : children.length === 0 ? (
                            <div className="px-6 py-4 text-sm text-neutral-500">
                              No additional rooms in this group
                            </div>
                          ) : (
                            <div className="divide-y divide-blue-100">
                              <div className="px-6 py-2 bg-blue-50/50">
                                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                                  {children.length} Additional Room{children.length > 1 ? 's' : ''} in Group
                                </span>
                              </div>
                              {children.map((child: any) => {
                                const childStatus = getStatusConfig(child.status);
                                return (
                                  <div
                                    key={child.id}
                                    className="px-6 py-3 flex items-center gap-6 hover:bg-blue-50/50 cursor-pointer transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onViewBooking?.(child);
                                    }}
                                  >
                                    {/* Child booking indicator */}
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                      <Bed className="w-3.5 h-3.5 text-blue-600" />
                                    </div>

                                    {/* Booking ID */}
                                    <div className="w-24">
                                      <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                                        {child.bookingNumber || child.booking_number || child.id}
                                      </span>
                                    </div>

                                    {/* Room Type */}
                                    <div className="w-32">
                                      <p className="text-sm font-medium text-neutral-700">
                                        {child.roomType || child.room_type || 'Standard'}
                                      </p>
                                      <p className="text-xs text-neutral-500">
                                        {child.adults || 1} adult{(child.adults || 1) > 1 ? 's' : ''}
                                        {(child.children || 0) > 0 && `, ${child.children} child`}
                                      </p>
                                    </div>

                                    {/* Assigned Room */}
                                    <div className="w-28">
                                      {child.room || child.room_id ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold bg-sage-50 text-sage-700 border border-sage-200">
                                          <Bed className="w-3 h-3" />
                                          Room {child.room || child.room_number || '#' + child.room_id}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                          Unassigned
                                        </span>
                                      )}
                                    </div>

                                    {/* Status */}
                                    <div className="w-28">
                                      <span className={`
                                        inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold
                                        ${childStatus.bg} ${childStatus.text} border ${childStatus.border}
                                      `}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${childStatus.dot}`} />
                                        {childStatus.label}
                                      </span>
                                    </div>

                                    {/* View action */}
                                    <div className="ml-auto">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onViewBooking?.(child);
                                        }}
                                        className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                                        title="View Details"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
