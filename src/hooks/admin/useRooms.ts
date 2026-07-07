import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { filterByTab, filterRooms, searchRooms } from '@/utils/admin/roomFilters';
import { roomsService } from '@/api/services/rooms.service';
import { bookingService } from '@/api/services/booking.service';
import { clearApiCache } from '@/api/client';

/**
 * Transform API room to admin panel format
 */
function transformApiRoom(apiRoom: any): any {
  // Extract room number from API response
  const roomNumber = apiRoom.number || apiRoom.name?.split(' ').pop() || String(apiRoom.id);

  // Extract room type - check room_type first (from API), then category, then fallback
  const roomType = apiRoom.room_type
    ? apiRoom.room_type.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : apiRoom.category
      ? apiRoom.category.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : apiRoom.type || apiRoom.name?.replace(/\s+\d+$/, '') || 'Standard Room';

  return {
    id: apiRoom.id,
    roomNumber: roomNumber,
    type: roomType,
    floor: apiRoom.floor || 1,
    status: mapRoomStatus(apiRoom.status),
    cleaning: apiRoom.cleaningStatus || apiRoom.cleaning_status ||
      (apiRoom.status === 'available' || apiRoom.status === 'clean' || apiRoom.status === 'inspected' ? 'clean' : 'dirty'),
    bedType: apiRoom.bedType || apiRoom.bed_type || 'King',
    viewType: apiRoom.view || apiRoom.view_type || apiRoom.viewType || 'Standard',
    capacity: apiRoom.maxGuests || apiRoom.capacity || 2,
    maxOccupancy: apiRoom.maxGuests || apiRoom.max_occupancy || apiRoom.maxOccupancy || 2,
    price: apiRoom.price_per_night || apiRoom.price || 150,
    amenities: Array.isArray(apiRoom.amenities) ? apiRoom.amenities : [],
    images: Array.isArray(apiRoom.images) ? apiRoom.images : [],
    guests: null,
    blockedReason: null,
    blockedUntil: null,
    lastCleaned: apiRoom.last_cleaned,
  };
}

/**
 * Map backend status to admin panel status
 * Note: out_of_service (OOS) and out_of_order (OOO) are distinct statuses:
 * - OOS: Minor issues, room can be sold in emergency
 * - OOO: Major issues (plumbing, electrical, renovation), room CANNOT be sold
 */
function mapRoomStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'clean': 'clean',
    'inspected': 'inspected',
    'available': 'available',
    'occupied': 'occupied',
    'dirty': 'dirty',
    'cleaning': 'in_progress',
    'in_progress': 'in_progress',
    'maintenance': 'maintenance',
    'out_of_service': 'out_of_service',
    'out_of_order': 'out_of_order',
  };
  return statusMap[status?.toLowerCase()] || 'available';
}

/**
 * Master hook for room state management
 * Implements complete data pipeline and all room operations
 * Fetches data from backend API
 */
export function useRooms() {
  // Raw data state - start empty and fetch from API
  const [rooms, setRooms] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms from API on mount, then cross-reference with bookings for guest data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('[useRooms] Fetching rooms from API...');
        clearApiCache('/api/v1/rooms');
        clearApiCache('/rooms');
        const apiRooms = await roomsService.getRooms({ pageSize: 100 });
        console.log('[useRooms] API response:', apiRooms);
        if (Array.isArray(apiRooms) && apiRooms.length > 0) {
          const transformedRooms = apiRooms.map(transformApiRoom);

          // BUG-013 FIX: Fetch active bookings to populate guest data for ALL rooms (not just occupied)
          // This ensures rooms assigned from the Bookings module also show guest data
          try {
            clearApiCache('/api/v1/bookings');
            clearApiCache('/bookings');
            const bookingsResponse = await bookingService.getBookings(1, 1000);
            const bookings = bookingsResponse.items || (Array.isArray(bookingsResponse) ? bookingsResponse : []);
            setAllBookings(bookings);
            const today = new Date().toISOString().split('T')[0];

            for (const room of transformedRooms) {
              // Check ALL rooms against active bookings (not just occupied ones)
              const activeBooking = bookings.find((b: any) => {
                // CRITICAL: When a booking has no physical room assigned, b.room.id is the
                // ROOM TYPE ID (not a room ID). Only match bookings that have an actual
                // room number assigned — b.room.number will be null/undefined for unassigned bookings.
                const bookingRoomNumber = b.room?.number;
                if (!bookingRoomNumber) return false; // No physical room assigned, skip

                const bookingRoomId = b.room?.id;
                const matchesRoom =
                  String(bookingRoomId) === String(room.id) ||
                  String(bookingRoomNumber) === String(room.roomNumber);
                const isActive = ['checked_in', 'checked-in', 'confirmed', 'booked'].includes(b.status);
                const checkIn = b.checkIn || b.arrival_date;
                const checkOut = b.checkOut || b.departure_date;
                // Same-day departure still counts as in-house (guest has all of checkout
                // day to leave). Matches the rule used by the Bookings table.
                const overlapsToday = checkIn && checkOut && checkIn <= today && checkOut >= today;
                // Also match upcoming bookings (next 7 days) with room already assigned
                const sevenDays = new Date();
                sevenDays.setDate(sevenDays.getDate() + 7);
                const futureLimit = sevenDays.toISOString().split('T')[0];
                const isUpcoming = checkIn && checkIn > today && checkIn <= futureLimit;
                return matchesRoom && isActive && (overlapsToday || isUpcoming);
              });

              if (activeBooking) {
                const firstName = activeBooking.guestInfo?.firstName || '';
                const lastName = activeBooking.guestInfo?.lastName || '';
                const isCheckedInStatus = ['checked_in', 'checked-in', 'IN_HOUSE'].includes(activeBooking.status);
                const bCheckInDate = activeBooking.checkIn || activeBooking.arrival_date;
                const bCheckOutDate = activeBooking.checkOut || activeBooking.departure_date;
                const overlapsTodayInclusive = bCheckInDate && bCheckOutDate && bCheckInDate <= today && bCheckOutDate >= today;
                room.guests = {
                  name: `${firstName} ${lastName}`.trim(),
                  email: activeBooking.guestInfo?.email || '',
                  checkIn: bCheckInDate,
                  checkOut: bCheckOutDate,
                  adults: activeBooking.guests?.adults || 1,
                  children: activeBooking.guests?.children || 0,
                  bookingId: activeBooking.id,
                  bookingStatus: activeBooking.status,
                  isCheckedIn: isCheckedInStatus,
                  isUpcoming: !overlapsTodayInclusive,
                };

                // Override room.cleaning to clean if guest is currently checked in
                if (isCheckedInStatus) {
                  room.cleaning = 'clean';
                }

                // Self-heal: sync room status based on booking state
                const isCheckedIn = ['checked_in', 'checked-in'].includes(activeBooking.status);
                const isConfirmedOrBooked = ['confirmed', 'booked'].includes(activeBooking.status);
                const bCheckIn = activeBooking.checkIn || activeBooking.arrival_date;
                const bCheckOut = activeBooking.checkOut || activeBooking.departure_date;
                const bOverlapsToday = bCheckIn && bCheckOut && bCheckIn <= today && bCheckOut >= today;

                if (isCheckedIn && room.status !== 'occupied') {
                  room.status = 'occupied';
                  roomsService.updateRoomStatus(room.id, 'occupied').catch((err: any) =>
                    console.warn('[useRooms] Self-heal: failed to sync room status:', err)
                  );
                } else if (isConfirmedOrBooked && bOverlapsToday && room.status === 'available') {
                  room.status = 'occupied';
                  roomsService.updateRoomStatus(room.id, 'occupied').catch((err: any) =>
                    console.warn('[useRooms] Self-heal: confirmed booking room sync:', err)
                  );
                }
                // For upcoming bookings (future check-in), do NOT change status — room is available until check-in
              } else if (room.status === 'occupied' && !room.guests) {
                // Self-heal: room is marked "occupied" but NO active booking found for it.
                // This is a zombie state — reset to "dirty" (needs cleaning after unknown occupancy).
                console.warn(`[useRooms] Self-heal: Room ${room.roomNumber} is occupied but has no active booking. Resetting to dirty.`);
                room.status = 'dirty';
                room.cleaning = 'dirty';
                // Fire-and-forget API call to sync backend
                roomsService.updateRoomStatus(room.id, 'dirty').catch((err: any) =>
                  console.warn('[useRooms] Self-heal: failed to reset zombie room status:', err)
                );
              }
            }
            console.log('[useRooms] Guest data populated from bookings (all rooms checked)');
          } catch (bookingErr) {
            console.warn('[useRooms] Could not fetch bookings for guest data:', bookingErr);
          }

          // Sort rooms by room number
          transformedRooms.sort((a, b) => {
            const numA = parseInt(a.roomNumber, 10);
            const numB = parseInt(b.roomNumber, 10);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return String(a.roomNumber).localeCompare(String(b.roomNumber), undefined, { numeric: true });
          });
          console.log('[useRooms] Transformed rooms:', transformedRooms.length);
          setRooms(transformedRooms);
        } else {
          console.log('[useRooms] No rooms returned or empty array');
          setError('No rooms found. Please check your authentication.');
        }
      } catch (err: any) {
        console.error('[useRooms] Failed to fetch rooms from API:', err);
        console.error('[useRooms] Error details:', err.response?.status, err.response?.data);
        setError(`Failed to load rooms: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Refresh just bookings data (for calendar updates after assign/unassign)
  const refetchBookings = useCallback(async () => {
    try {
      // Clear bookings cache to ensure fresh data
      clearApiCache('/bookings');
      const resp = await bookingService.getBookings(1, 1000);
      const bookings = resp.items || (Array.isArray(resp) ? resp : []);
      setAllBookings(bookings);
    } catch (err) {
      console.warn('[useRooms] Could not refetch bookings:', err);
    }
  }, []);

  // Tab state
  const [activeTab, setActiveTab] = useState('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    type: 'all',
    floor: 'all',
    status: 'all',
    cleaning: 'all'
  });

  // Filter management functions
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      floor: 'all',
      status: 'all',
      cleaning: 'all'
    });
  };

  const hasActiveFilters = () => {
    return filters.type !== 'all'
      || filters.floor !== 'all'
      || filters.status !== 'all'
      || filters.cleaning !== 'all';
  };

  // Room update function
  const updateRoom = async (id: number | string, updates: any) => {
    try {
      // Map frontend fields to API fields (same pattern as addRoom)
      const apiData: any = {};
      if (updates.roomNumber !== undefined) apiData.number = updates.roomNumber;
      if (updates.type !== undefined) apiData.room_type = updates.type;
      if (updates.floor !== undefined) apiData.floor = updates.floor;
      if (updates.bedType !== undefined) apiData.bed_type = updates.bedType;
      if (updates.capacity !== undefined) {
        apiData.capacity = updates.capacity;
        apiData.max_occupancy = updates.capacity;
      }
      if (updates.price !== undefined) apiData.price_per_night = updates.price;
      if (updates.amenities !== undefined) {
        apiData.amenities = Array.isArray(updates.amenities) ? updates.amenities.join(', ') : updates.amenities;
      }
      if (updates.description !== undefined) apiData.description = updates.description || null;
      if (updates.viewType !== undefined) apiData.view_type = updates.viewType || null;

      await roomsService.updateRoom(id, apiData);
    } catch (err) {
      console.error('[useRooms] Failed to update room via API:', err);
    }
    // Update local state regardless
    setRooms(prev => prev.map(r => r.id === id || String(r.id) === String(id) ? { ...r, ...updates } : r));
  };

  // Update room status
  const updateStatus = async (roomId: number | string, newStatus: string) => {
    // Map frontend status to backend status
    // Backend supports: available, occupied, clean, dirty, inspected, cleaning, maintenance, out_of_service, out_of_order
    const backendStatusMap: Record<string, string> = {
      'available': 'available',
      'occupied': 'occupied',
      'dirty': 'dirty',
      'out_of_service': 'out_of_service',
      'out_of_order': 'out_of_order',
    };
    const backendStatus = backendStatusMap[newStatus] || newStatus;

    try {
      await roomsService.updateRoomStatus(roomId, backendStatus);
      console.log('[useRooms] Room status updated via API');
    } catch (err) {
      console.error('[useRooms] Failed to update room status via API:', err);
    }
    // Update local state
    setRooms(prev => prev.map(r =>
      r.id === roomId || String(r.id) === String(roomId) ? { ...r, status: newStatus } : r
    ));
  };

  // Set cleaning state (mark clean or dirty)
  const setCleaningState = async (roomId: number | string, cleaningState: string) => {
    try {
      if (cleaningState === 'clean') {
        await roomsService.markClean(roomId);
      } else {
        await roomsService.markDirty(roomId);
      }
      console.log('[useRooms] Cleaning state updated via API');
    } catch (err) {
      console.error('[useRooms] Failed to update cleaning state via API:', err);
    }
    // Update local state
    setRooms(prev => prev.map(r => {
      if (r.id === roomId || String(r.id) === String(roomId)) {
        // If marking clean and room was dirty, set status to available
        if (cleaningState === 'clean' && r.status === 'dirty') {
          return { ...r, cleaning: cleaningState, status: 'available' };
        }
        // If marking dirty and room was available, set status to dirty
        if (cleaningState === 'dirty' && r.status === 'available') {
          return { ...r, cleaning: cleaningState, status: 'dirty' };
        }
        // Otherwise just update cleaning state
        return { ...r, cleaning: cleaningState };
      }
      return r;
    }));
  };

  // Assign guest to room
  // BUG-013: Persist assignment via booking system so it survives refresh
  // BUG-016 FIX: Validate room availability by date BEFORE assigning; prevent double booking
  const assignGuestToRoom = async (roomId: number | string, guest: any) => {
    // BUG-016 FIX: Server-side availability check before assigning
    if (guest.checkIn && guest.checkOut) {
      try {
        const availability = await roomsService.checkAvailability(
          String(roomId),
          guest.checkIn,
          guest.checkOut
        );
        if (!availability.available) {
          throw new Error(
            `Room is not available for ${guest.checkIn} to ${guest.checkOut}. It may already be booked for overlapping dates.`
          );
        }
      } catch (err: any) {
        if (err.message?.includes('not available')) throw err;
        console.warn('[useRooms] Could not verify room availability:', err);
      }
    }

    try {
      let bookingLinked = false;

      // BUG-016 FIX: Check bookings for date conflicts BEFORE marking room occupied
      if (guest.checkIn && guest.checkOut) {
        try {
          const response = await bookingService.getBookings(1, 100);
          const bookings = response.items || (Array.isArray(response) ? response : []);

          // Double-booking prevention: check if another booking (different guest) has this room
          const roomIdStr = String(roomId);
          const guestId = guest.id;
          const guestName = (guest.name || '').toLowerCase().trim();
          const guestEmail = (guest.email || '').toLowerCase().trim();

          const roomConflict = bookings.find((b: any) => {
            const bRoomId = b.room?.id || b.roomId;
            const bRoomNum = b.room?.number;
            const isSameRoom = String(bRoomId) === roomIdStr || bRoomNum === roomIdStr;
            const status = (b.status || '').toLowerCase().replace('-', '_');
            const isActive = status !== 'cancelled' && status !== 'checked_out' && status !== 'no_show';
            if (!isSameRoom || !isActive) return false;

            // Exclude the current guest's own booking (allow reassignment to same room)
            const bGuestId = b.guestId;
            const bName = ((b.guestInfo?.firstName || '') + ' ' + (b.guestInfo?.lastName || '')).toLowerCase().trim();
            const bEmail = (b.guestInfo?.email || '').toLowerCase().trim();
            const isSameGuest = (guestId && bGuestId && Number(bGuestId) === Number(guestId)) ||
              (guestName && bName === guestName) ||
              (guestEmail && bEmail && bEmail === guestEmail);
            if (isSameGuest) return false;

            const bCheckIn = new Date(b.checkIn);
            const bCheckOut = new Date(b.checkOut);
            const selCheckIn = new Date(guest.checkIn);
            const selCheckOut = new Date(guest.checkOut);
            return bCheckIn < selCheckOut && bCheckOut > selCheckIn;
          });

          if (roomConflict) {
            const conflictGuest = roomConflict.guestInfo
              ? `${roomConflict.guestInfo.firstName || ''} ${roomConflict.guestInfo.lastName || ''}`.trim()
              : 'another guest';
            throw new Error(
              `Double booking prevented: This room is already assigned to ${conflictGuest} ` +
              `(${roomConflict.checkIn} to ${roomConflict.checkOut}). ` +
              `Please choose a different room or adjust the dates.`
            );
          }

          // Find existing booking for this guest to link the room
          // Check both unassigned bookings AND bookings with a different room (reassignment)
          const existingBooking = bookings.find((b: any) => {
            const matchById = b.guestId && guestId && Number(b.guestId) === Number(guestId);
            const bookingGuest = (
              (b.guestInfo?.firstName || '') + ' ' + (b.guestInfo?.lastName || '')
            ).toLowerCase().trim();
            const bookingEmail = (b.guestInfo?.email || '').toLowerCase().trim();
            const matchByName = bookingGuest && bookingGuest === guestName;
            const matchByEmail = guestEmail && bookingEmail && bookingEmail === guestEmail;
            const isMatchingGuest = matchById || matchByName || matchByEmail;

            const status = (b.status || '').toLowerCase().replace('-', '_');
            const isActive = status !== 'cancelled' && status !== 'checked_out' && status !== 'no_show';

            const bCheckIn = new Date(b.checkIn);
            const bCheckOut = new Date(b.checkOut);
            const selCheckIn = new Date(guest.checkIn);
            const selCheckOut = new Date(guest.checkOut);
            const datesOverlap = bCheckIn < selCheckOut && bCheckOut > selCheckIn;

            return isMatchingGuest && isActive && datesOverlap;
          });

          if (existingBooking) {
            // Free the old room if guest is being reassigned
            const oldRoomId = existingBooking.room?.id;
            if (oldRoomId && String(oldRoomId) !== String(roomId)) {
              try {
                await roomsService.updateRoomStatus(oldRoomId, 'dirty');
                console.log('[useRooms] Previous room freed:', oldRoomId);
              } catch (freeErr) {
                console.warn('[useRooms] Could not free previous room:', freeErr);
              }
            }

            await bookingService.updateBooking(String(existingBooking.id), {
              roomId: String(roomId),
            });
            bookingLinked = true;
            console.log('[useRooms] Room assignment persisted to booking:', existingBooking.id);
          }

          // If no existing booking found, create a walk-in booking so it persists across refresh
          if (!bookingLinked) {
            try {
              const nameParts = (guest.name || '').split(' ');
              await bookingService.createBooking({
                roomId: String(roomId),
                checkIn: guest.checkIn,
                checkOut: guest.checkOut,
                guests: { adults: 1, children: 0, infants: 0 },
                guestInfo: {
                  firstName: nameParts[0] || '',
                  lastName: nameParts.slice(1).join(' ') || '',
                  email: guest.email || '',
                  phone: guest.phone || '',
                },
                paymentMethodId: 'walk_in',
              } as any);
              bookingLinked = true;
              console.log('[useRooms] Walk-in booking created for room assignment');
            } catch (createErr) {
              console.warn('[useRooms] Could not create walk-in booking (assignment still applied locally):', createErr);
            }
          }
        } catch (bookingErr: any) {
          if (bookingErr.message?.includes('Double booking') || bookingErr.message?.includes('not available')) {
            throw bookingErr;
          }
          console.error('[useRooms] Failed to persist room-booking link:', bookingErr);
          throw new Error(
            `Room assignment could not be saved to the booking system. Please try again or assign from the Bookings page.`
          );
        }
      }

      // Only physically mark room as occupied if check-in is today or already past.
      // For future bookings the room stays clean/available until the guest actually arrives.
      const checkInDate = guest.checkIn;
      const todayStr = new Date().toISOString().split('T')[0];
      const isCheckInTodayOrEarlier = !checkInDate || checkInDate <= todayStr;

      if (isCheckInTodayOrEarlier) {
        await roomsService.updateRoomStatus(roomId, 'occupied');
        console.log('[useRooms] Room status updated to occupied via API');
      } else {
        console.log('[useRooms] Future booking — room status left unchanged until check-in');
      }

      // Clear caches so both modules pick up the change
      clearApiCache('/api/v1/rooms');
      clearApiCache('/rooms');
      clearApiCache('/api/v1/bookings');
      clearApiCache('/bookings');
    } catch (err: any) {
      console.error('[useRooms] Failed to assign guest:', err);
      throw err;
    }

    // Determine if this is a same-day/past check-in to decide local status
    const checkInDate = guest.checkIn;
    const todayStr = new Date().toISOString().split('T')[0];
    const isCheckInTodayOrEarlier = !checkInDate || checkInDate <= todayStr;

    // Update local state only after successful assignment
    setRooms(prev => prev.map(r => {
      if (r.id === roomId || String(r.id) === String(roomId)) {
        return {
          ...r,
          // Only show occupied for today/past check-ins; future bookings stay at current status
          status: isCheckInTodayOrEarlier ? 'occupied' : r.status,
          guests: guest
        };
      }
      return r;
    }));

    // Refresh bookings so calendar view updates immediately
    await refetchBookings();
  };

  // Unassign guest from room
  // BUG-013 FIX: Also clear room_id from the associated booking
  const unassignGuest = async (roomId: number | string) => {
    // Find the room to get booking info before clearing
    const room = rooms.find(r => r.id === roomId || String(r.id) === String(roomId));
    const bookingId = room?.guests?.bookingId;
    const guestName = room?.guests?.name || 'Guest';

    try {
      // Clear room assignment from the booking first
      if (bookingId) {
        try {
          // Send "null" as string to explicitly unassign room (backend handles this)
          await bookingService.updateBooking(String(bookingId), { roomId: "null" } as any);
          console.log('[useRooms] Booking room assignment cleared:', bookingId);
        } catch (bookingErr: any) {
          console.warn('[useRooms] Could not clear booking room assignment:', bookingErr);
          // Still continue - we'll try to update room status
        }
      }

      // Update room status to dirty (checkout = room needs cleaning)
      await roomsService.updateRoomStatus(roomId, 'dirty');
      console.log('[useRooms] Guest unassigned via API');
      toast.success('Room unassigned successfully');
    } catch (err) {
      console.error('[useRooms] Failed to unassign guest via API:', err);
      toast.error('Failed to unassign room');
    }
    // Update local state
    setRooms(prev => prev.map(r => {
      if ((r.id === roomId || String(r.id) === String(roomId)) && r.status === 'occupied') {
        return {
          ...r,
          status: 'dirty',
          cleaning: 'dirty',
          guests: null
        };
      }
      return r;
    }));

    // Refresh bookings so calendar view updates immediately
    await refetchBookings();
  };

  // Block room (OOS or OOO)
  const blockRoom = async (roomId: number | string, reason: string, until?: string, statusType: 'out_of_service' | 'out_of_order' = 'out_of_service') => {
    try {
      if (statusType === 'out_of_order') {
        await roomsService.blockRoomOOO(roomId, reason);
      } else {
        await roomsService.blockRoom(roomId, reason);
      }
      // Only update local state after API succeeds
      setRooms(prev => prev.map(r => {
        if (r.id === roomId || String(r.id) === String(roomId)) {
          return {
            ...r,
            status: statusType,
            guests: null,
            blockedReason: reason,
            blockedUntil: until || null
          };
        }
        return r;
      }));
    } catch (err) {
      console.error('[useRooms] Failed to block room via API:', err);
      toast.error('Failed to block room. Please try again.');
    }
  };

  // Unblock room (handles both OOS and OOO)
  const unblockRoom = async (roomId: number | string) => {
    try {
      await roomsService.unblockRoom(roomId);
      // Only update local state after API succeeds
      setRooms(prev => prev.map(r => {
        if ((r.id === roomId || String(r.id) === String(roomId)) && (r.status === 'out_of_service' || r.status === 'out_of_order' || r.status === 'maintenance')) {
          return {
            ...r,
            status: 'available',
            blockedReason: null,
            blockedUntil: null
          };
        }
        return r;
      }));
    } catch (err) {
      console.error('[useRooms] Failed to unblock room via API:', err);
      toast.error('Failed to unblock room. Please try again.');
    }
  };

  // Add new room via API
  const addRoom = async (roomData: any) => {
    try {
      // Map frontend fields to API fields
      const apiData = {
        number: roomData.roomNumber,
        room_type: roomData.type,
        floor: roomData.floor,
        status: roomData.status || 'available',
        capacity: roomData.capacity,
        max_occupancy: roomData.maxOccupancy || roomData.capacity,
        bed_type: roomData.bedType,
        view_type: roomData.viewType,
        amenities: Array.isArray(roomData.amenities) ? roomData.amenities.join(', ') : roomData.amenities,
        price_per_night: roomData.price,  // Send room-specific price to API
        description: roomData.description,
      };

      const createdRoom = await roomsService.createRoom(apiData);
      console.log('[useRooms] Room created via API:', createdRoom);

      // Transform and add to local state, then sort by room number
      const transformedRoom = transformApiRoom(createdRoom);
      setRooms(prev => {
        const updated = [transformedRoom, ...prev];
        // Sort rooms by room number (numerically if possible, otherwise alphabetically)
        return updated.sort((a, b) => {
          const numA = parseInt(a.roomNumber, 10);
          const numB = parseInt(b.roomNumber, 10);
          // If both are valid numbers, sort numerically
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          // Otherwise sort alphabetically
          return String(a.roomNumber).localeCompare(String(b.roomNumber), undefined, { numeric: true });
        });
      });

      return createdRoom;
    } catch (err: any) {
      console.error('[useRooms] Failed to create room via API:', err);
      throw err;
    }
  };

  // Delete room via API
  const deleteRoom = async (roomId: number | string) => {
    try {
      await roomsService.deleteRoom(roomId);
      console.log('[useRooms] Room deleted via API');
    } catch (err) {
      console.error('[useRooms] Failed to delete room via API:', err);
    }
    // Update local state
    setRooms(prev => prev.filter(r => r.id !== roomId && String(r.id) !== String(roomId)));
  };

  // Data processing pipeline
  const processedRooms = useMemo(() => {
    let result = filterByTab(rooms, activeTab);
    result = filterRooms(result, filters);
    result = searchRooms(result, searchQuery);
    return result;
  }, [rooms, activeTab, filters, searchQuery]);

  return {
    rooms: processedRooms,
    rawRooms: rooms,
    allBookings,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
    updateRoom,
    updateStatus,
    setCleaningState,
    assignGuestToRoom,
    unassignGuest,
    blockRoom,
    unblockRoom,
    addRoom,
    deleteRoom
  };
}
