import { useState, useCallback } from 'react';

/**
 * Custom hook for updating booking status
 * @param {Array} bookings - Current bookings array
 * @param {Function} setBookings - Function to update bookings
 * @returns {Object} Status update functions
 */
export function useStatusUpdate(bookings, setBookings) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Update booking status
   * @param {string} bookingId - Booking ID to update
   * @param {string} newStatus - New status value
   * @returns {Promise<boolean>} Success status
   */
  const updateStatus = useCallback(
    async (bookingId, newStatus) => {
      setIsUpdating(true);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Update the booking in the array
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );

        setLastUpdated({
          bookingId,
          newStatus,
          timestamp: new Date(),
        });

        setIsUpdating(false);
        return true;
      } catch (error) {
        console.error('Failed to update status:', error);
        setIsUpdating(false);
        return false;
      }
    },
    [setBookings]
  );

  /**
   * Batch update multiple bookings
   * @param {Array} updates - Array of {bookingId, newStatus} objects
   * @returns {Promise<boolean>} Success status
   */
  const batchUpdateStatus = useCallback(
    async (updates) => {
      setIsUpdating(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        setBookings((prevBookings) => {
          const updatesMap = new Map(updates.map((u) => [u.bookingId, u.newStatus]));

          return prevBookings.map((booking) => {
            const newStatus = updatesMap.get(booking.id);
            return newStatus ? { ...booking, status: newStatus } : booking;
          });
        });

        setIsUpdating(false);
        return true;
      } catch (error) {
        console.error('Failed to batch update status:', error);
        setIsUpdating(false);
        return false;
      }
    },
    [setBookings]
  );

  return {
    updateStatus,
    batchUpdateStatus,
    isUpdating,
    lastUpdated,
  };
}
