import { useState, useCallback } from 'react';

/**
 * Hook to handle editing bookings locally.
 */
export function useEditBooking(bookings, setBookings) {
  const [isEditing, setIsEditing] = useState(false);

  const editBooking = useCallback(
    async (updatedBooking) => {
      setIsEditing(true);
      try {
        const bookingExists = bookings.some((booking) => booking.id === updatedBooking.id);
        if (!bookingExists) {
          setIsEditing(false);
          return false;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === updatedBooking.id ? { ...booking, ...updatedBooking } : booking
          )
        );
        setIsEditing(false);
        return true;
      } catch (error) {
        console.error('Failed to edit booking', error);
        setIsEditing(false);
        return false;
      }
    },
    [setBookings, bookings]
  );

  return { editBooking, isEditing };
}
