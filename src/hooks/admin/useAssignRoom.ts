import { useState, useCallback } from 'react';
import { bookingService } from '@/api/services/booking.service';

/**
 * Hook to assign a room to a booking via the backend API.
 */
export function useAssignRoom(bookings, setBookings) {
  const [isAssigning, setIsAssigning] = useState(false);

  const assignRoom = useCallback(
    async (updatedBooking) => {
      setIsAssigning(true);
      try {
        const bookingExists = bookings.some((booking) => booking.id === updatedBooking.id);
        if (!bookingExists) {
          setIsAssigning(false);
          return false;
        }

        // Call backend API to persist room assignment
        await bookingService.updateBooking(String(updatedBooking.id), {
          room_id: updatedBooking.roomId || updatedBooking.room_id,
          room_number: updatedBooking.room || updatedBooking.roomNumber,
        });

        // Update local state after successful API call
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === updatedBooking.id ? { ...booking, ...updatedBooking } : booking
          )
        );

        setIsAssigning(false);
        return true;
      } catch (error) {
        console.error('Failed to assign room', error);
        setIsAssigning(false);
        return false;
      }
    },
    [setBookings, bookings]
  );

  return { assignRoom, isAssigning };
}
