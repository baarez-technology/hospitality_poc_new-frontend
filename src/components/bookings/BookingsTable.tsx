import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { MouseEvent } from 'react';
import { Crown, Eye, Pencil, MoreHorizontal, Bed, XCircle, CalendarX, ChevronUp, ChevronDown, ChevronsUpDown, CreditCard, LogIn, LogOut, ArrowRightLeft, Undo2, UserX, SprayCan, RotateCcw, Receipt, Users, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { statusConfig, sourceConfig, paymentStatusConfig } from '../../data/bookingsData';
import { IconButton } from '../ui2/Button';
import { StatusBadge } from '../ui2/Badge';
import { useCurrency } from '@/hooks/useCurrency';
import { PreCheckInBadge } from '../shared/PreCheckInBadge';
import { usePrecheckinStatus } from '@/hooks/admin/usePrecheckinStatus';
import { apiClient } from '@/api/client';

type BookingLike = any;
type SortConfigLike = { field?: string; direction?: 'asc' | 'desc' } | any;

export default function BookingsTable({
  activeTab = 'all',
  bookings,
  isLoading = false,
  sortConfig,
  onSort,
  onViewBooking,
  onEditBooking,
  onAssignRoom,
  onCancelBooking,
  onManagePayment,
  onCheckIn,
  onCheckOut,
  onCancelCheckIn,
  onMarkNoShow,
  onRequestCleaning,
  onReinstate,
  onViewBill,
  onDeleteBooking,
}: {
  activeTab?: string;
  bookings: BookingLike[];
  /** True while the bookings list is being fetched — shows skeleton rows. */
  isLoading?: boolean;
  sortConfig: SortConfigLike;
  onSort: (field: string) => void;
  onViewBooking?: (booking: BookingLike) => void;
  onEditBooking?: (booking: BookingLike) => void;
  onAssignRoom?: (booking: BookingLike) => void;
  onCancelBooking?: (booking: BookingLike) => void;
  onManagePayment?: (booking: BookingLike) => void;
  onCheckIn?: (booking: BookingLike) => void;
  onCheckOut?: (booking: BookingLike) => void;
  onCancelCheckIn?: (booking: BookingLike) => void;
  onMarkNoShow?: (booking: BookingLike) => void;
  onRequestCleaning?: (booking: BookingLike) => void;
  onReinstate?: (booking: BookingLike) => void;
  onViewBill?: (booking: BookingLike) => void;
  /** Devmaster only: permanently delete the booking */
  onDeleteBooking?: (booking: BookingLike) => void;
}) {
  const { formatCurrency } = useCurrency();
  const { getStatus } = usePrecheckinStatus();

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    // Append T12:00:00 to date-only strings to prevent UTC midnight timezone shift
    const safe = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
    const date = new Date(safe);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeDisplay = (timeStr: string | undefined) => {
    if (!timeStr || !String(timeStr).trim()) return '—';
    const parts = String(timeStr).trim().split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1] ? parseInt(parts[1], 10) : 0;
    if (isNaN(h)) return timeStr;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${period}`;
  };

  const showEta = activeTab === 'arrivals';
  const showEtd = activeTab === 'departures';
  const showEtaEtdColumn = showEta || showEtd;
  const showEtaOnly = activeTab === 'arrivals';
  const showEtdOnly = activeTab === 'departures';

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; openAbove: boolean } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Group booking expansion state
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [childBookings, setChildBookings] = useState<Record<string, any[]>>({});
  const [loadingGroups, setLoadingGroups] = useState<Set<string>>(new Set());

  // Clear child bookings cache when main bookings list changes (e.g., after room assignment)
  useEffect(() => {
    setChildBookings({});
  }, [bookings]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if click is on any of the trigger buttons
        const isButtonClick = Object.values(buttonRefs.current).some(
          btn => btn && btn.contains(event.target)
        );
        if (!isButtonClick) {
          setOpenDropdownId(null);
          setDropdownPos(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on scroll
  useEffect(() => {
    if (!openDropdownId) return;
    const handleScroll = () => {
      setOpenDropdownId(null);
      setDropdownPos(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [openDropdownId]);

  // Toggle group booking expansion
  const toggleGroupExpansion = useCallback(async (booking: BookingLike, e: any) => {
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

  // Check if booking is a group parent (has group_booking_id but no parent_booking_id)
  const isGroupParent = (booking: BookingLike) => {
    const hasGroupId = booking.groupBookingId || booking.group_booking_id;
    const parentId = booking.parentBookingId || booking.parent_booking_id;
    const isGroupFlag = booking.isGroupBooking || booking.is_group_booking;
    const bookingId = Number(booking.id);
    // Parent: has group flag/ID AND (no parent ID OR parent ID equals own ID)
    const noParent = !parentId || parentId === 0 || parentId === null || parentId === undefined;
    const selfRef = parentId && Number(parentId) === bookingId;
    return (isGroupFlag || hasGroupId) && (noParent || selfRef);
  };

  // Check if booking is a child of a group
  const isGroupChild = (booking: BookingLike) => {
    const parentId = booking.parentBookingId || booking.parent_booking_id;
    const bookingId = Number(booking.id);
    // Child: has parent ID that's different from own ID (and not 0/null)
    return parentId && Number(parentId) !== 0 && Number(parentId) !== bookingId;
  };

  const handleViewClick = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);

    if (onViewBooking) {
      onViewBooking(booking);
    }
  };

  const handleEditClick = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);

    if (onEditBooking) {
      onEditBooking(booking);
    }
  };

  const handleMoreClick = (e: any, bookingId: any) => {
    e.stopPropagation();
    if (openDropdownId === bookingId) {
      setOpenDropdownId(null);
      setDropdownPos(null);
    } else {
      const btn = buttonRefs.current[bookingId];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const dropdownHeight = 300; // estimated max height
        const openAbove = rect.bottom + dropdownHeight > window.innerHeight;
        setDropdownPos({
          top: openAbove ? rect.top : rect.bottom + 4,
          left: rect.right - 160, // 160 = dropdown width (w-40)
          openAbove,
        });
      }
      setOpenDropdownId(bookingId);
    }
  };

  const handleAssignRoom = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onAssignRoom) {
      onAssignRoom(booking);
    }
  };

  const handleCancel = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onCancelBooking) {
      onCancelBooking(booking);
    }
  };

  const handleManagePayment = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onManagePayment) {
      onManagePayment(booking);
    }
  };

  const handleCheckIn = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onCheckIn) {
      onCheckIn(booking);
    }
  };

  const handleCheckOut = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onCheckOut) {
      onCheckOut(booking);
    }
  };

  const handleCancelCheckIn = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onCancelCheckIn) {
      onCancelCheckIn(booking);
    }
  };

  const handleMarkNoShow = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onMarkNoShow) {
      onMarkNoShow(booking);
    }
  };

  const handleRequestCleaning = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onRequestCleaning) {
      onRequestCleaning(booking);
    }
  };

  const handleReinstate = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onReinstate) {
      onReinstate(booking);
    }
  };

  const handleViewBill = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onViewBill) {
      onViewBill(booking);
    }
  };

  const handleDeleteClick = (e: any, booking: BookingLike) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (onDeleteBooking) {
      onDeleteBooking(booking);
    }
  };

  // Date guard helpers
  const isExpired = (_booking: BookingLike) => {
    // Never hide checkout actions for in-house guests — staff must always be able to check out
    // a guest regardless of whether departure date has passed (late checkout, overstay, etc.)
    return false;
  };

  // Past-arrival bookings that haven't checked in should not allow room assignment
  const isPastArrivalNotCheckedIn = (booking: BookingLike) => {
    const arrivalDate = booking.checkIn || booking.arrival_date;
    if (!arrivalDate) return false;
    const today = new Date().toISOString().split('T')[0];
    const status = (booking.status || '').toUpperCase().replace(/[\s_-]/g, '_');
    return arrivalDate < today && status !== 'CHECKED_IN' && status !== 'IN_HOUSE';
  };

  const isNoShow = (booking: BookingLike) => {
    const status = (booking.status || '').toUpperCase().replace(/[\s_-]/g, '_');
    return status === 'NO_SHOW';
  };

  const canMarkNoShow = (booking: BookingLike) => {
    const status = (booking.status || '').toUpperCase().replace(/[\s_]/g, '-');
    const isConfirmedLike = status === 'CONFIRMED' || status === 'PENDING' || status === 'BOOKED';
    const arrivalDate = booking.checkIn || booking.arrival_date;
    const today = new Date().toISOString().split('T')[0];
    // Guest never showed up: arrival date has passed and status is still confirmed/pending
    return isConfirmedLike && arrivalDate && arrivalDate < today;
  };

  // Helper to check booking status
  const isCheckedIn = (booking: BookingLike) => {
    const status = (booking.status || '').toUpperCase().replace(/[\s_]/g, '-');
    return status === 'IN-HOUSE' || status === 'CHECKED-IN' || status === 'IN_HOUSE';
  };

  const isCancelled = (booking: BookingLike) => {
    return (booking.status || '').toUpperCase() === 'CANCELLED';
  };

  const isCompleted = (booking: BookingLike) => {
    const status = (booking.status || '').toUpperCase().replace(/[\s_]/g, '-');
    return status === 'COMPLETED' || status === 'CHECKED-OUT';
  };

  const canCheckIn = (booking: BookingLike) => {
    const status = (booking.status || '').toUpperCase().replace(/[\s_]/g, '-');
    return (status === 'CONFIRMED' || status === 'PENDING' || status === 'BOOKED') && booking.room;
  };

  const SortIndicator = ({ field }: { field: string }) => {
    const sorted = sortConfig?.field === field ? sortConfig?.direction : null;
    const Icon = sorted === 'asc' ? ChevronUp : sorted === 'desc' ? ChevronDown : ChevronsUpDown;
    return <Icon className={`w-3.5 h-3.5 ${sorted ? 'text-terra-500' : 'text-neutral-300'}`} />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1320px] border-collapse table-fixed">
        <colgroup>
          <col style={{ width: showEtaEtdColumn ? '11%' : '12%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '4%' }} />
          {showEtaEtdColumn && <col style={{ width: '5%' }} />}
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '4%' }} />
        </colgroup>
        <thead>
          <tr className="bg-neutral-50/30 border-b border-neutral-100">
            <th
              onClick={() => onSort('guest')}
              className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5">
                Guest Name <SortIndicator field="guest" />
              </span>
            </th>
            <th
              onClick={() => onSort('id')}
              className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5">
                Booking ID <SortIndicator field="id" />
              </span>
            </th>
            <th
              onClick={() => onSort('checkIn')}
              className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5">
                Check-in <SortIndicator field="checkIn" />
              </span>
            </th>
            <th
              onClick={() => onSort('nights')}
              className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5">
                Nights <SortIndicator field="nights" />
              </span>
            </th>
            {showEtaEtdColumn && (
              <th className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                {showEtaOnly ? 'ETA' : 'ETD'}
              </th>
            )}
            <th className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
              Room
            </th>
            <th
              onClick={() => onSort('corporateAccountName')}
              className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5">
                Company <SortIndicator field="corporateAccountName" />
              </span>
            </th>
            <th
              onClick={() => onSort('gstNumber')}
              className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5">
                GST <SortIndicator field="gstNumber" />
              </span>
            </th>
            <th
              onClick={() => onSort('status')}
              className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5">
                Status <SortIndicator field="status" />
              </span>
            </th>
            <th
              onClick={() => onSort('source')}
              className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5">
                Source <SortIndicator field="source" />
              </span>
            </th>
            <th
              onClick={() => onSort('paymentStatus')}
              className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5">
                Payment <SortIndicator field="paymentStatus" />
              </span>
            </th>
            <th className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
              Pre Check-In
            </th>
            <th
              onClick={() => onSort('amount')}
              className="text-left px-6 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-neutral-600 whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5">
                Amount <SortIndicator field="amount" />
              </span>
            </th>
            <th className="px-2 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap sticky right-0 bg-neutral-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-neutral-100">
          {isLoading && bookings.length === 0 ? (
            // Loading: show skeleton rows until data renders, instead of the
            // "No bookings found" empty state which is misleading mid-fetch.
            Array.from({ length: 8 }).map((_, rowIdx) => (
              <tr key={`skeleton-${rowIdx}`} className="bg-white">
                {Array.from({ length: showEtaEtdColumn ? 14 : 13 }).map((__, colIdx) => (
                  <td
                    key={colIdx}
                    className={colIdx === (showEtaEtdColumn ? 13 : 12)
                      ? 'px-2 py-4 sticky right-0 bg-white'
                      : 'px-6 py-4'}
                  >
                    <div className="h-3.5 rounded bg-neutral-100 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : bookings.length === 0 ? (
            <tr>
              <td colSpan={showEtaEtdColumn ? 14 : 13} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-terra-50 flex items-center justify-center mb-4">
                    <CalendarX className="w-5 h-5 text-terra-500" />
                  </div>
                  <p className="text-[13px] font-semibold text-neutral-800 mb-1">
                    No bookings found
                  </p>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Try adjusting your filters or search query
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            bookings
            // Filter out child bookings - they'll only show when parent is expanded
            .filter((booking: BookingLike) => !isGroupChild(booking))
            .map((booking: BookingLike) => {
            // Normalize status to match config keys (e.g., 'Checked In' -> 'CHECKED-IN')
            const normalizedStatus = booking.status?.toUpperCase?.()?.replace(/[\s_]/g, '-') || 'CONFIRMED';
            // A guest who is checked in stays "In House" until they are actually checked
            // out. A planned checkout date passing must NOT relabel them as "Checked Out" —
            // the authoritative booking.status drives the badge.
            const displayStatusKey = normalizedStatus;
            const status = (statusConfig as any)[displayStatusKey] || (statusConfig as any)[booking.status] || {
              color: 'bg-neutral-100 text-neutral-700 border-neutral-200',
              label: booking.status || 'Unknown'
            };
            // Normalize source with fallback - preserve original source if not in config
            const source = booking.source && (sourceConfig as any)[booking.source]
              ? (sourceConfig as any)[booking.source]
              : (booking.source ? {
                  color: 'bg-[#7B68EE]/10 text-[#7B68EE]',
                  icon: '💻'
                } : {
                  color: 'bg-neutral-100 text-neutral-700',
                  icon: '📋'
                });

            return (
                <React.Fragment key={booking.id}>
                <tr
                  className="group bg-white hover:bg-neutral-50/30 transition-all duration-500 cursor-pointer"
                  onClick={(e) => {
                    // Don't trigger if clicking on a button or the actions column
                    const target = e.target as HTMLElement;
                    if (target.closest('button') || target.closest('td:last-child')) return;
                    handleMoreClick(e, booking.id);
                  }}
                >
                  {/* Guest Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900 group-hover:text-terra-600 transition-colors">
                        {booking.guest}
                      </span>
                      {booking.vip && <Crown className="w-4 h-4 text-gold-500 flex-shrink-0" />}
                      {isGroupParent(booking) && (
                        <button
                          onClick={(e) => toggleGroupExpansion(booking, e)}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium text-terra-600 bg-terra-50 border border-terra-200/60 hover:bg-terra-100 transition-colors cursor-pointer"
                          title={expandedGroups.has(String(booking.id)) ? 'Collapse group' : 'Expand group'}
                        >
                          <Users className="w-2.5 h-2.5" />
                          Group
                          {loadingGroups.has(String(booking.id)) ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin ml-0.5" />
                          ) : (
                            <ChevronRight className={`w-2.5 h-2.5 ml-0.5 transition-transform ${expandedGroups.has(String(booking.id)) ? 'rotate-90' : ''}`} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Booking ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500 font-mono">{booking.bookingNumber || booking.id}</span>
                      {booking.bookingNumber && booking.bookingNumber !== booking.id && booking.bookingNumber !== `BK-${booking.id}` && (
                        <span className="text-[10px] text-neutral-400 font-mono">#{booking.id}</span>
                      )}
                    </div>
                  </td>

                  {/* Check-in Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-700 font-medium">
                      {booking.checkedInAt ? formatDate(new Date(booking.checkedInAt).toISOString().split('T')[0]) : formatDate(booking.checkIn)}
                    </span>
                    {booking.checkedInAt && (
                      <div className="text-[11px] text-emerald-600 mt-0.5">
                        Checked in: {new Date(booking.checkedInAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                      </div>
                    )}
                  </td>

                  {/* Nights */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-600">{booking.nights}n</span>
                  </td>

                  {/* Arrivals Today: ETA only. Departures Today: ETD only. */}
                  {showEtaEtdColumn && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-700 font-medium">
                        {showEtaOnly ? formatTimeDisplay(booking.eta) : formatTimeDisplay(booking.etd)}
                      </span>
                    </td>
                  )}

                  {/* Room — fixed-width column: keep the room number on one line
                      and truncate a long room type so it can't spill into Company. */}
                  <td className="px-6 py-4 overflow-hidden">
                    {booking.room && booking.room !== 'Unassigned' ? (
                      <div className="flex items-baseline min-w-0">
                        <span className="font-semibold text-neutral-900 text-sm whitespace-nowrap flex-shrink-0">Room {booking.room}</span>
                        <span className="text-neutral-400 text-xs ml-1.5 truncate" title={booking.roomType}>• {booking.roomType}</span>
                      </div>
                    ) : (
                      <span className="inline-flex max-w-full items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 truncate" title="Pending Assignment">Pending Assignment</span>
                    )}
                  </td>

                  {/* Company Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-700 font-medium">
                      {booking.corporateAccountName || '—'}
                    </span>
                  </td>

                  {/* GST */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs text-neutral-500 font-mono">
                      {booking.gstNumber || '—'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={status.label} className="" />
                  </td>

                  {/* Source */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${source.color}`}>
                      <span className="mr-1">{source.icon}</span>
                      {booking.source}
                    </span>
                  </td>

                  {/* Payment Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const paymentStatus = booking.paymentStatus || booking.payment_status || 'pending';
                      const payment = (paymentStatusConfig as any)[paymentStatus] || (paymentStatusConfig as any)['pending'];
                      const paymentMethod = booking.paymentMethod || booking.payment_method;
                      const paymentRef = booking.paymentReference || booking.payment_reference;
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${payment.color}`}>
                            <span className="mr-1.5">{payment.icon}</span>
                            {payment.label}
                          </span>
                          {paymentMethod === 'qr_code' && paymentRef && (
                            <span className="text-[10px] text-violet-600 font-medium">
                              QR Ref: ****{paymentRef}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Pre Check-In */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PreCheckInBadge status={getStatus(Number(booking.id))} />
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isGroupChild(booking) ? (
                      <span className="text-sm font-medium text-neutral-400" title="Payment collected at main booking">
                        {formatCurrency(0)}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-neutral-900">
                        {formatCurrency(booking.totalPrice || booking.amount)}
                      </span>
                    )}
                  </td>

                  {/* Actions - Sticky column (small) */}
                  <td className="px-2 py-4 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-neutral-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                    <div className="relative inline-block">
                      <button
                        ref={(el) => { buttonRefs.current[booking.id] = el; }}
                        onClick={(e) => handleMoreClick(e, booking.id)}
                        className={`p-1.5 rounded-md hover:bg-neutral-100 transition-colors ${openDropdownId === booking.id ? 'bg-neutral-100' : ''}`}
                      >
                        <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                      </button>

                      {/* Dropdown Menu — rendered via portal to escape overflow clipping */}
                      {openDropdownId === booking.id && dropdownPos && createPortal(
                        <div
                          ref={dropdownRef}
                          className="fixed w-40 bg-white rounded-lg shadow-lg shadow-neutral-900/10 border border-neutral-200 py-1 z-[9999] animate-in fade-in-0 zoom-in-95 duration-100"
                          style={{
                            top: dropdownPos.openAbove ? undefined : dropdownPos.top,
                            bottom: dropdownPos.openAbove ? (window.innerHeight - dropdownPos.top + 4) : undefined,
                            left: dropdownPos.left,
                          }}
                        >
                          <button
                            onClick={(e) => handleViewClick(e, booking)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                          >
                            <Eye className="w-3.5 h-3.5 text-neutral-500" />
                            View
                          </button>

                          {/* Post check-in: show Edit, Room Move, Payment, Check Out, Cancel Check-in */}
                          {isCheckedIn(booking) && !isExpired(booking) ? (
                            <>
                              <button
                                onClick={(e) => handleEditClick(e, booking)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                              >
                                <Pencil className="w-3.5 h-3.5 text-neutral-500" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => handleAssignRoom(e, booking)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-500" />
                                Room Move
                              </button>
                              <button
                                onClick={(e) => handleManagePayment(e, booking)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                                Payment
                              </button>
                              <button
                                onClick={(e) => handleViewBill(e, booking)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                              >
                                <Receipt className="w-3.5 h-3.5 text-neutral-500" />
                                Guest Bill
                              </button>
                              <button
                                onClick={(e) => handleRequestCleaning(e, booking)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-sage-700 hover:bg-sage-50"
                              >
                                <SprayCan className="w-3.5 h-3.5" />
                                Request Cleaning
                              </button>
                              <button
                                onClick={(e) => handleCheckOut(e, booking)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-terra-700 hover:bg-terra-50"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                Check Out
                              </button>
                              <div className="border-t border-neutral-100 my-1" />
                              <button
                                onClick={(e) => handleCancelCheckIn(e, booking)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-amber-700 hover:bg-amber-50"
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                                Cancel Check-in
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => handleEditClick(e, booking)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                              >
                                <Pencil className="w-3.5 h-3.5 text-neutral-500" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => handleManagePayment(e, booking)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                                Payment
                              </button>

                              {/* Check In - only for confirmed bookings with a room, NOT expired */}
                              {canCheckIn(booking) && !isExpired(booking) && (
                                <button
                                  onClick={(e) => handleCheckIn(e, booking)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-emerald-700 hover:bg-emerald-50"
                                >
                                  <LogIn className="w-3.5 h-3.5" />
                                  Check In
                                </button>
                              )}

                              {/* Assign Room - NOT expired, NOT past-arrival unless checked in */}
                              {!isCompleted(booking) && !isCancelled(booking) && !isNoShow(booking) && !isExpired(booking) && !isPastArrivalNotCheckedIn(booking) && (
                                <button
                                  onClick={(e) => handleAssignRoom(e, booking)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                                >
                                  <Bed className="w-3.5 h-3.5 text-neutral-500" />
                                  Assign Room
                                </button>
                              )}

                              {/* Mark No Show - for confirmed/booked bookings where arrival date has passed */}
                              {canMarkNoShow(booking) && (
                                <button
                                  onClick={(e) => handleMarkNoShow(e, booking)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-orange-700 hover:bg-orange-50"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  Mark No Show
                                </button>
                              )}

                              {/* Guest Bill — for completed/checked-out bookings */}
                              {isCompleted(booking) && (
                                <button
                                  onClick={(e) => handleViewBill(e, booking)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                                >
                                  <Receipt className="w-3.5 h-3.5 text-neutral-500" />
                                  Guest Bill
                                </button>
                              )}

                              {/* Reinstate - for no-show or cancelled bookings */}
                              {(isNoShow(booking) || isCancelled(booking)) && (
                                <button
                                  onClick={(e) => handleReinstate(e, booking)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-blue-700 hover:bg-blue-50"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  Reinstate
                                </button>
                              )}

                              <div className="border-t border-neutral-100 my-1" />

                              {/* Cancel (for pre-check-in) */}
                              <button
                                onClick={(e) => handleCancel(e, booking)}
                                disabled={isCancelled(booking) || isCompleted(booking) || isNoShow(booking)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel
                              </button>

                              {/* Devmaster-only: Permanent Delete */}
                              {onDeleteBooking && (
                                <>
                                  <div className="border-t-2 border-red-100 my-1" />
                                  <button
                                    onClick={(e) => handleDeleteClick(e, booking)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-700 bg-red-50 hover:bg-red-100 font-semibold"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Entry
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>,
                        document.body
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Child Bookings */}
                {isGroupParent(booking) && expandedGroups.has(String(booking.id)) && (
                  <>
                    {loadingGroups.has(String(booking.id)) ? (
                      <tr className="bg-terra-50/30">
                        <td colSpan={showEtaEtdColumn ? 14 : 13} className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-neutral-500 pl-8">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading rooms in group...
                          </div>
                        </td>
                      </tr>
                    ) : (childBookings[String(booking.id)] || []).length === 0 ? (
                      <tr className="bg-terra-50/30">
                        <td colSpan={showEtaEtdColumn ? 14 : 13} className="px-6 py-4">
                          <div className="text-sm text-neutral-500 pl-8">
                            No additional rooms in this group
                          </div>
                        </td>
                      </tr>
                    ) : (
                      (childBookings[String(booking.id)] || []).map((child: any) => {
                        const childNormalizedStatus = child.status?.toUpperCase?.()?.replace(/[\s_]/g, '-') || 'CONFIRMED';
                        // Keep the authoritative status — don't relabel an in-house guest as
                        // "Checked Out" just because a planned checkout date has passed.
                        const childDisplayKey = childNormalizedStatus;
                        const childStatus = (statusConfig as any)[childDisplayKey] || (statusConfig as any)[child.status] || {
                          color: 'bg-neutral-100 text-neutral-700 border-neutral-200',
                          label: child.status || 'Unknown'
                        };
                        return (
                          <tr
                            key={child.id}
                            className="bg-terra-50/30 hover:bg-terra-50/50 border-l-4 border-l-terra-300 cursor-pointer"
                            onClick={() => onAssignRoom?.(child)}
                          >
                            {/* Guest Name - indented */}
                            <td className="px-6 py-3 whitespace-nowrap pl-14">
                              <div className="flex items-center gap-2">
                                <Bed className="w-4 h-4 text-terra-400" />
                                <span className="text-sm font-medium text-neutral-700">
                                  {child.roomType || child.room_type || 'Room'}
                                </span>
                              </div>
                            </td>

                            {/* Booking ID */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="text-xs text-neutral-500 font-mono">
                                {child.bookingNumber || child.booking_number || child.id}
                              </span>
                            </td>

                            {/* Check-in Date */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="text-sm text-neutral-600">
                                {formatDate(child.checkIn || child.arrival_date)}
                              </span>
                            </td>

                            {/* Nights */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="text-sm text-neutral-500">{child.nights}n</span>
                            </td>

                            {/* ETA/ETD column */}
                            {showEtaEtdColumn && (
                              <td className="px-6 py-3 whitespace-nowrap">
                                <span className="text-sm text-neutral-500">—</span>
                              </td>
                            )}

                            {/* Room */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              {(() => {
                                const roomNum = child.roomNumber || child.room_number ||
                                  (typeof child.room === 'object' ? child.room?.number : null) ||
                                  (typeof child.room === 'string' ? child.room : null);
                                return roomNum ? (
                                  <span className="font-medium text-neutral-700 text-sm">
                                    Room {roomNum}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                    Unassigned
                                  </span>
                                );
                              })()}
                            </td>

                            {/* Company Name - child */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="text-neutral-400 text-xs">—</span>
                            </td>

                            {/* GST - child */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="text-neutral-400 text-xs">—</span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <StatusBadge status={childStatus.label} className="" />
                            </td>

                            {/* Source - empty for child */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="text-neutral-400 text-xs">—</span>
                            </td>

                            {/* Payment - show as collected at parent */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="text-[11px] text-neutral-400">On parent</span>
                            </td>

                            {/* Pre Check-In - empty for child */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="text-neutral-400 text-xs">—</span>
                            </td>

                            {/* Amount - show 0 for child */}
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="text-sm text-neutral-400">{formatCurrency(0)}</span>
                            </td>

                            {/* Actions - Same dropdown as parent */}
                            <td className="px-2 py-3 text-center whitespace-nowrap sticky right-0 bg-terra-50/30 group-hover:bg-terra-50/50">
                              <div className="relative inline-block">
                                <button
                                  ref={(el) => { buttonRefs.current[`child-${child.id}`] = el; }}
                                  onClick={(e) => handleMoreClick(e, `child-${child.id}`)}
                                  className={`p-1.5 rounded-md hover:bg-terra-100 transition-colors ${openDropdownId === `child-${child.id}` ? 'bg-terra-100' : ''}`}
                                >
                                  <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                                </button>

                                {/* Child Dropdown Menu */}
                                {openDropdownId === `child-${child.id}` && dropdownPos && createPortal(
                                  <div
                                    ref={dropdownRef}
                                    className="fixed w-40 bg-white rounded-lg shadow-lg shadow-neutral-900/10 border border-neutral-200 py-1 z-[9999] animate-in fade-in-0 zoom-in-95 duration-100"
                                    style={{
                                      top: dropdownPos.openAbove ? undefined : dropdownPos.top,
                                      bottom: dropdownPos.openAbove ? (window.innerHeight - dropdownPos.top + 4) : undefined,
                                      left: dropdownPos.left,
                                    }}
                                  >
                                    <button
                                      onClick={(e) => handleViewClick(e, child)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-neutral-500" />
                                      View
                                    </button>
                                    <button
                                      onClick={(e) => handleAssignRoom(e, child)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                                    >
                                      <Bed className="w-3.5 h-3.5 text-neutral-500" />
                                      {(child.room || child.room_id || child.roomId) ? 'Change Room' : 'Assign Room'}
                                    </button>
                                  </div>,
                                  document.body
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </>
                )}
                </React.Fragment>
            );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
