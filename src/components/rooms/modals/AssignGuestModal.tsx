/**
 * AssignGuestModal Component
 * Assign guest to room - Glimmora Design System v5.0
 * Side Drawer pattern using ui2/Drawer
 *
 * Fixes applied:
 * - BUG-012: Validates if guest already has a room assigned (shows warning popup)
 * - BUG-013: Persists assignment to backend via booking update
 * - BUG-016: Requires check-in/check-out dates for proper date-based assignment
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Bed, UsersRound, ChevronDown, Check, Search, Calendar, AlertTriangle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { DatePicker } from '../../ui2/DatePicker';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';
import { guestsService } from '../../../api/services/guests.service';
import { bookingService } from '../../../api/services/booking.service';
import { useToast } from '../../../contexts/ToastContext';

// Custom Select Dropdown Component with React Portal and Search
function GuestSelectDropdown({ value, onChange, options, placeholder, isLoading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const displayLabel = selectedOption?.label || placeholder;

  // Filter options based on search query
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Estimate dropdown height
  const estimatedDropdownHeight = Math.min(filteredOptions.length * 44 + 56, 320);

  const calculatePosition = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openAbove = spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow;

    return {
      top: openAbove ? rect.top - estimatedDropdownHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openAbove
    };
  };

  const handleToggle = () => {
    if (isLoading) return;
    if (isOpen) {
      setIsOpen(false);
      setPosition(null);
      setSearchQuery('');
    } else {
      setPosition(calculatePosition());
      setIsOpen(true);
      // Focus search input after opening
      setTimeout(() => searchInputRef.current?.focus(), 10);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setPosition(null);
    setSearchQuery('');
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (!triggerRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setIsOpen(false);
        setPosition(null);
        setSearchQuery('');
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setPosition(null);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      setPosition(calculatePosition());
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all flex items-center justify-between focus:outline-none ${
          isLoading
            ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed'
            : isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={`truncate ${value ? 'text-neutral-900' : 'text-neutral-400'}`}>
          {isLoading ? 'Loading guests...' : displayLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            maxHeight: `${estimatedDropdownHeight}px`,
            zIndex: 99999
          }}
          className={`bg-white rounded-lg border border-neutral-200 shadow-lg shadow-neutral-900/10 overflow-hidden animate-in fade-in-0 duration-100 ${
            position.openAbove ? 'origin-bottom' : 'origin-top'
          }`}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-neutral-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guests..."
                className="w-full h-8 pl-9 pr-3 rounded-md text-[13px] bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-terra-400 focus:ring-1 focus:ring-terra-500/10 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="py-1 max-h-52 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3.5 py-3 text-[13px] text-neutral-400 text-center">
                No guests found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                    String(value) === String(option.value) ? 'bg-terra-50 text-terra-700 font-medium' : 'text-neutral-700'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{option.label}</span>
                      {option.hasReservation && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-sage-100 text-sage-700 rounded">
                          Has Reservation
                        </span>
                      )}
                    </div>
                    {option.email && (
                      <span className="text-[11px] text-neutral-400 truncate">{option.email}</span>
                    )}
                  </div>
                  {String(value) === String(option.value) && <Check className="w-4 h-4 text-terra-500 flex-shrink-0 ml-2" />}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function AssignGuestModal({ room, isOpen, onClose, onAssign, allBookings = [] }) {
  const { symbol, formatCurrency } = useCurrency();
  const [selectedGuest, setSelectedGuest] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [availableGuests, setAvailableGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingAssignment, setExistingAssignment] = useState<any>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [reassignConfirmed, setReassignConfirmed] = useState(false);
  const [isCheckingGuest, setIsCheckingGuest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomTypeMismatch, setRoomTypeMismatch] = useState<{ bookedType: string; roomType: string } | null>(null);
  const [mismatchConfirmed, setMismatchConfirmed] = useState(false);
  const [checkedOutWarning, setCheckedOutWarning] = useState(false);
  const [autoFilledFromBooking, setAutoFilledFromBooking] = useState(false);
  const toast = useToast();

  // Restrict dates before current month (May 1st onwards allowed)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      setSelectedGuest('');
      // Use prefilled check-in date from calendar click, or default to today
      const prefilled = room?._prefilledCheckIn;
      const checkIn = prefilled || new Date().toISOString().split('T')[0];
      const nextDay = new Date(checkIn + 'T00:00:00');
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckInDate(checkIn);
      setCheckOutDate(nextDay.toISOString().split('T')[0]);
      setExistingAssignment(null);
      setShowDuplicateWarning(false);
      setReassignConfirmed(false);
      setRoomTypeMismatch(null);
      setMismatchConfirmed(false);
      setCheckedOutWarning(false);
      setAutoFilledFromBooking(false);
      fetchGuests();
    }
  }, [isOpen]);

  // BUG-012: Check if the selected guest already has an active room assignment
  useEffect(() => {
    if (!selectedGuest || !checkInDate || !checkOutDate) {
      setExistingAssignment(null);
      setShowDuplicateWarning(false);
      setReassignConfirmed(false);
      setRoomTypeMismatch(null);
      setMismatchConfirmed(false);
      setCheckedOutWarning(false);
      return;
    }
    checkGuestExistingAssignment();
  }, [selectedGuest, checkInDate, checkOutDate]);

  // Auto-fill dates from guest's active booking
  useEffect(() => {
    if (!selectedGuest || !allBookings?.length) {
      setAutoFilledFromBooking(false);
      return;
    }
    const guest = availableGuests.find(g => String(g.id) === String(selectedGuest));
    if (!guest) return;

    const guestId = guest.id;
    const guestName = `${guest.first_name} ${guest.last_name}`.toLowerCase().trim();
    const guestEmail = (guest.email || '').toLowerCase().trim();

    // Find an active booking for this guest
    const activeBooking = allBookings.find((b: any) => {
      const matchById = b.guestId && Number(b.guestId) === Number(guestId);
      const bName = ((b.guestInfo?.firstName || '') + ' ' + (b.guestInfo?.lastName || '')).toLowerCase().trim();
      const bEmail = (b.guestInfo?.email || '').toLowerCase().trim();
      const matchByName = bName && bName === guestName;
      const matchByEmail = guestEmail && bEmail && bEmail === guestEmail;
      const isMatch = matchById || matchByName || matchByEmail;

      const status = (b.status || '').toLowerCase().replace('-', '_');
      const isActive = ['confirmed', 'booked', 'checked_in'].includes(status);
      return isMatch && isActive;
    });

    if (activeBooking) {
      const bCheckIn = activeBooking.checkIn || activeBooking.arrival_date;
      const bCheckOut = activeBooking.checkOut || activeBooking.departure_date;
      if (bCheckIn && bCheckOut) {
        setCheckInDate(bCheckIn.split('T')[0]);
        setCheckOutDate(bCheckOut.split('T')[0]);
        setAutoFilledFromBooking(true);
        return;
      }
    }
    setAutoFilledFromBooking(false);
  }, [selectedGuest, availableGuests, allBookings]);

  const checkGuestExistingAssignment = async () => {
    if (!selectedGuest) return;

    setIsCheckingGuest(true);
    setReassignConfirmed(false);
    try {
      // Fetch all bookings and check if this guest already has an active room for the date range
      const response = await bookingService.getBookings(1, 100);
      const bookings = response.items || (Array.isArray(response) ? response : []);

      const guest = availableGuests.find(g => String(g.id) === String(selectedGuest));
      if (!guest) return;

      const guestId = guest.id;
      const guestName = `${guest.first_name} ${guest.last_name}`.toLowerCase().trim();
      const guestEmail = (guest.email || '').toLowerCase().trim();

      // Find active bookings for this guest that overlap with selected dates
      const conflicting = bookings.find((b: any) => {
        // Primary match: use guestId if available in booking response
        const matchById = b.guestId && Number(b.guestId) === Number(guestId);

        // Fallback match: name or email
        const bookingGuestName = ((b.guestInfo?.firstName || '') + ' ' + (b.guestInfo?.lastName || '')).toLowerCase().trim();
        const bookingEmail = (b.guestInfo?.email || '').toLowerCase().trim();
        const matchByName = bookingGuestName && bookingGuestName === guestName;
        const matchByEmail = guestEmail && bookingEmail && bookingEmail === guestEmail;

        const isMatchingGuest = matchById || matchByName || matchByEmail;

        // Handle both hyphen and underscore status formats from API
        const status = (b.status || '').toLowerCase().replace('-', '_');
        const isActive = status !== 'cancelled' && status !== 'checked_out';
        const hasRoom = b.room && b.room.number;

        // Check date overlap
        const bCheckIn = new Date(b.checkIn);
        const bCheckOut = new Date(b.checkOut);
        const selCheckIn = new Date(checkInDate);
        const selCheckOut = new Date(checkOutDate);
        const datesOverlap = bCheckIn < selCheckOut && bCheckOut > selCheckIn;

        return isMatchingGuest && isActive && hasRoom && datesOverlap;
      });

      if (conflicting) {
        setExistingAssignment(conflicting);
        setShowDuplicateWarning(true);
      } else {
        setExistingAssignment(null);
        setShowDuplicateWarning(false);
      }

      // Room type mismatch check: find any active/upcoming booking for this guest
      // and compare the booked room type with the room being assigned
      const guestBooking = bookings.find((b: any) => {
        const matchById = b.guestId && Number(b.guestId) === Number(guestId);
        const bookingGuestName = ((b.guestInfo?.firstName || '') + ' ' + (b.guestInfo?.lastName || '')).toLowerCase().trim();
        const bookingEmail = (b.guestInfo?.email || '').toLowerCase().trim();
        const matchByName = bookingGuestName && bookingGuestName === guestName;
        const matchByEmail = guestEmail && bookingEmail && bookingEmail === guestEmail;
        const isMatchingGuest = matchById || matchByName || matchByEmail;

        const status = (b.status || '').toLowerCase().replace('-', '_');
        const isActive = status !== 'cancelled' && status !== 'checked_out' && status !== 'no_show';

        // Check date overlap
        const bCheckIn = new Date(b.checkIn);
        const bCheckOut = new Date(b.checkOut);
        const selCheckIn = new Date(checkInDate);
        const selCheckOut = new Date(checkOutDate);
        const datesOverlap = bCheckIn < selCheckOut && bCheckOut > selCheckIn;

        return isMatchingGuest && isActive && datesOverlap;
      });

      if (guestBooking && room) {
        // Extract booked room type from booking
        const bookedType = (
          guestBooking.roomType ||
          guestBooking.room_type_name ||
          (typeof guestBooking.room_type === 'object' ? guestBooking.room_type?.name : guestBooking.room_type) ||
          ''
        ).toLowerCase().trim();

        const assignedRoomType = (room.type || '').toLowerCase().trim();

        // Compare: check both strict and partial match (e.g. "standard" vs "standard room")
        if (bookedType && assignedRoomType && bookedType !== assignedRoomType && !assignedRoomType.includes(bookedType) && !bookedType.includes(assignedRoomType)) {
          setRoomTypeMismatch({
            bookedType: guestBooking.roomType || guestBooking.room_type_name || guestBooking.room_type || 'Unknown',
            roomType: room.type || 'Unknown',
          });
        } else {
          setRoomTypeMismatch(null);
        }
      } else {
        setRoomTypeMismatch(null);
      }

      // Check if ALL of guest's bookings are checked_out/cancelled/no_show (no active bookings at all)
      const allGuestBookings = bookings.filter((b: any) => {
        const matchById = b.guestId && Number(b.guestId) === Number(guestId);
        const bookingGuestName = ((b.guestInfo?.firstName || '') + ' ' + (b.guestInfo?.lastName || '')).toLowerCase().trim();
        const bookingEmail = (b.guestInfo?.email || '').toLowerCase().trim();
        const matchByName = bookingGuestName && bookingGuestName === guestName;
        const matchByEmail = guestEmail && bookingEmail && bookingEmail === guestEmail;
        return matchById || matchByName || matchByEmail;
      });

      if (allGuestBookings.length > 0) {
        const hasActiveBooking = allGuestBookings.some((b: any) => {
          const bStatus = (b.status || '').toLowerCase().replace('-', '_');
          return !['checked_out', 'cancelled', 'no_show'].includes(bStatus);
        });
        setCheckedOutWarning(!hasActiveBooking);
      } else {
        setCheckedOutWarning(false);
      }
    } catch (error) {
      console.error('[AssignGuestModal] Error checking guest assignment:', error);
    } finally {
      setIsCheckingGuest(false);
    }
  };

  const fetchGuests = async () => {
    try {
      setIsLoading(true);
      const guests = await guestsService.list({ pageSize: 100 });
      setAvailableGuests(guests || []);
    } catch (error) {
      console.error('[AssignGuestModal] Failed to fetch guests:', error);
      toast.error('Failed to load guests');
    } finally {
      setIsLoading(false);
    }
  };

  // Cross-reference guests with bookings for this room type
  const guestOptionsWithReservation = useMemo(() => {
    if (!availableGuests.length || !room) return [];

    const roomType = (room.type || '').toLowerCase().trim();

    // Build a set of guest identifiers (name/email) that have bookings for this room type
    const matchingGuestKeys = new Set<string>();

    (allBookings || []).forEach((b: any) => {
      const bookingRoomType = (
        b.roomType || b.room_type_name ||
        (typeof b.room_type === 'object' ? b.room_type?.name : b.room_type) || ''
      ).toLowerCase().trim();

      if (!bookingRoomType || !roomType) return;

      // Match room type (exact or partial)
      const typesMatch = bookingRoomType === roomType ||
        roomType.includes(bookingRoomType) ||
        bookingRoomType.includes(roomType);

      if (!typesMatch) return;

      // Status check — only active/upcoming bookings
      const status = (b.status || '').toLowerCase().replace('-', '_');
      if (status === 'cancelled' || status === 'checked_out' || status === 'no_show') return;

      // Extract guest identifier from booking
      const guestName = ((b.guestInfo?.firstName || '') + ' ' + (b.guestInfo?.lastName || '')).toLowerCase().trim();
      const guestEmail = (b.guestInfo?.email || '').toLowerCase().trim();
      const guestId = b.guestId ? String(b.guestId) : null;

      if (guestId) matchingGuestKeys.add(`id:${guestId}`);
      if (guestName) matchingGuestKeys.add(`name:${guestName}`);
      if (guestEmail) matchingGuestKeys.add(`email:${guestEmail}`);
    });

    // Tag each guest with whether they have a matching reservation
    return availableGuests.map(guest => {
      const guestName = `${guest.first_name} ${guest.last_name}`.toLowerCase().trim();
      const guestEmail = (guest.email || '').toLowerCase().trim();
      const guestId = String(guest.id);

      const hasReservation =
        matchingGuestKeys.has(`id:${guestId}`) ||
        matchingGuestKeys.has(`name:${guestName}`) ||
        matchingGuestKeys.has(`email:${guestEmail}`);

      return { ...guest, hasReservation };
    })
    // Sort: guests with reservations first
    .sort((a, b) => (b.hasReservation ? 1 : 0) - (a.hasReservation ? 1 : 0));
  }, [availableGuests, allBookings, room]);

  if (!room) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGuest) {
      toast.warning('Please select a guest');
      return;
    }

    // BUG-016: Validate dates
    if (!checkInDate || !checkOutDate) {
      toast.warning('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      toast.warning('Check-out date must be after check-in date');
      return;
    }

    // BUG-012: If duplicate warning shown and user hasn't confirmed reassign, block
    if (showDuplicateWarning && existingAssignment && !reassignConfirmed) {
      toast.warning('Please confirm reassignment or select a different guest.');
      return;
    }

    // Block if room type mismatch exists and user hasn't confirmed override
    if (roomTypeMismatch && !mismatchConfirmed) {
      toast.warning('Room type does not match the booking. Please confirm the override or choose a matching room.');
      return;
    }

    const guest = availableGuests.find(g => String(g.id) === String(selectedGuest));
    if (guest) {
      setIsSubmitting(true);
      try {
        await onAssign(room.id, {
          id: guest.id,
          name: `${guest.first_name} ${guest.last_name}`,
          email: guest.email,
          phone: guest.phone,
          checkIn: checkInDate,
          checkOut: checkOutDate,
        });
        onClose();
        setSelectedGuest('');
      } catch (err) {
        // Error toast is handled by parent's handleAssign
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Calculate nights
  const nights = checkInDate && checkOutDate
    ? Math.max(0, Math.floor((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button type="button" variant="ghost" onClick={onClose} className="px-5 py-2 text-[13px] font-semibold">
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        form="assign-guest-form"
        disabled={isSubmitting || checkedOutWarning || (showDuplicateWarning && !reassignConfirmed) || (roomTypeMismatch && !mismatchConfirmed) || !checkInDate || !checkOutDate || nights <= 0}
        className="px-5 py-2 text-[13px] font-semibold"
      >
        {isSubmitting
          ? 'Assigning...'
          : showDuplicateWarning && reassignConfirmed
          ? 'Reassign Guest'
          : 'Assign Guest'}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Guest"
      subtitle={`Room ${room.roomNumber} • ${room.type}`}
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <form id="assign-guest-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Guest Selection */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Guest Selection
          </h4>
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
              Select Guest
            </label>
            <GuestSelectDropdown
              value={selectedGuest}
              onChange={setSelectedGuest}
              options={guestOptionsWithReservation.map((guest) => ({
                value: guest.id,
                label: `${guest.first_name} ${guest.last_name}`,
                email: guest.email,
                hasReservation: guest.hasReservation
              }))}
              placeholder="Select a guest"
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* BUG-012: Duplicate Assignment Warning with Reassign Option */}
        {showDuplicateWarning && existingAssignment && (
          <div className={`p-4 rounded-lg border ${reassignConfirmed ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${reassignConfirmed ? 'text-amber-600' : 'text-rose-600'}`} />
              <div className="flex-1">
                <p className={`text-[13px] font-semibold ${reassignConfirmed ? 'text-amber-800' : 'text-rose-800'}`}>
                  This guest already has a room assigned
                </p>
                <p className={`text-[12px] mt-1 ${reassignConfirmed ? 'text-amber-700' : 'text-rose-700'}`}>
                  Currently assigned to <span className="font-semibold">Room {existingAssignment.room?.number || existingAssignment.room?.name || 'N/A'}</span>
                  {' '}(Booking: {existingAssignment.bookingNumber || existingAssignment.id})
                  {' '}from {existingAssignment.checkIn} to {existingAssignment.checkOut}.
                </p>
                {!reassignConfirmed ? (
                  <div className="mt-3 flex items-center gap-2">
                    <p className="text-[12px] text-rose-600">Do you want to reassign this guest?</p>
                    <button
                      type="button"
                      onClick={() => setReassignConfirmed(true)}
                      className="px-3 py-1 text-[12px] font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors"
                    >
                      Yes, Reassign
                    </button>
                  </div>
                ) : (
                  <p className="text-[12px] text-amber-600 mt-1 font-medium">
                    Reassignment confirmed. Click "Reassign Guest" to proceed.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Room Type Mismatch Warning - blocks assignment until confirmed */}
        {roomTypeMismatch && (
          <div className={`p-4 rounded-lg border ${mismatchConfirmed ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${mismatchConfirmed ? 'text-amber-600' : 'text-rose-600'}`} />
              <div className="flex-1">
                <p className={`text-[13px] font-semibold ${mismatchConfirmed ? 'text-amber-800' : 'text-rose-800'}`}>
                  Room Type Mismatch
                </p>
                <p className={`text-[12px] mt-1 ${mismatchConfirmed ? 'text-amber-700' : 'text-rose-700'}`}>
                  Guest booked <span className="font-semibold">{roomTypeMismatch.bookedType}</span> but
                  this room is <span className="font-semibold">{roomTypeMismatch.roomType}</span>.
                  This assignment will be blocked by the system unless the room types match.
                </p>
                {!mismatchConfirmed ? (
                  <div className="mt-3 flex items-center gap-2">
                    <p className="text-[12px] text-rose-600">Override and assign anyway (e.g., upgrade)?</p>
                    <button
                      type="button"
                      onClick={() => setMismatchConfirmed(true)}
                      className="px-3 py-1 text-[12px] font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors"
                    >
                      Yes, Override
                    </button>
                  </div>
                ) : (
                  <p className="text-[12px] text-amber-600 mt-1 font-medium">
                    Override confirmed. Note: the backend may still reject if strict validation is enforced.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checked-out guest warning */}
        {checkedOutWarning && (
          <div className="p-4 rounded-lg border bg-rose-50 border-rose-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-rose-800">
                  Guest has already checked out
                </p>
                <p className="text-[12px] mt-1 text-rose-700">
                  This guest has no active bookings. Please create a new booking from the Bookings page first.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BUG-016: Check-in / Check-out Dates */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Stay Dates
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                <Calendar className="w-3 h-3 inline mr-1" />
                Check-in Date
              </label>
              <DatePicker
                value={checkInDate}
                onChange={(val) => setCheckInDate(val)}
                placeholder="Select check-in"
                minDate={monthStart}
                className="w-full"
                disabled={autoFilledFromBooking}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                <Calendar className="w-3 h-3 inline mr-1" />
                Check-out Date
              </label>
              <DatePicker
                value={checkOutDate}
                onChange={(val) => setCheckOutDate(val)}
                placeholder="Select check-out"
                minDate={checkInDate || monthStart}
                className="w-full"
                disabled={autoFilledFromBooking}
              />
            </div>
          </div>
          {nights > 0 && (
            <p className="text-[11px] text-neutral-500 mt-2">
              {nights} night{nights !== 1 ? 's' : ''}
              {autoFilledFromBooking && (
                <span className="ml-2 text-sage-600 font-medium">— Dates auto-filled from booking</span>
              )}
            </p>
          )}
          {checkInDate && checkOutDate && nights <= 0 && (
            <p className="text-[11px] text-rose-500 mt-2">
              Check-out date must be after check-in date
            </p>
          )}
        </div>

        {/* Room Details */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Room Details
          </h4>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                <Bed className="w-4 h-4 text-neutral-400" />
                <span className="text-[11px] font-medium text-neutral-500">Bed Type</span>
              </div>
              <p className="text-[13px] font-semibold text-neutral-900">{room.bedType}</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                <UsersRound className="w-4 h-4 text-neutral-400" />
                <span className="text-[11px] font-medium text-neutral-500">Capacity</span>
              </div>
              <p className="text-[13px] font-semibold text-neutral-900">{room.capacity} guests</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-neutral-400">{symbol}</span>
                <span className="text-[11px] font-medium text-neutral-500">Price</span>
              </div>
              <p className="text-[13px] font-semibold text-neutral-900">{formatCurrency(room.price)}/night</p>
            </div>
          </div>
        </div>

        {/* Warning if room is not available */}
        {room.status !== 'available' && (
          <div className="p-4 bg-gold-50 rounded-lg border border-gold-100">
            <p className="text-[11px] font-semibold text-gold-700 mb-1">Warning</p>
            <p className="text-[13px] text-gold-600">
              This room is currently marked as "{room.status}". Assigning a guest will change the status to "occupied".
            </p>
          </div>
        )}
      </form>
    </Drawer>
  );
}
