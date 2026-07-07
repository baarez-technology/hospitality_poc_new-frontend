/**
 * useCMSBookings Hook
 * Manages booking data for the CMS
 */

import { useState, useCallback } from 'react';

interface Booking {
  id: string;
  guestName: string;
  roomType: string;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  status: string;
  amount: number;
  source: string;
  createdAt: string;
}

export default function useCMSBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const addBooking = useCallback((bookingData: Partial<Booking>) => {
    const newBooking: Booking = {
      id: `BK-${Date.now()}`,
      guestName: bookingData.guestName || 'Guest',
      roomType: bookingData.roomType || 'Standard',
      roomNumber: bookingData.roomNumber,
      checkIn: bookingData.checkIn || new Date().toISOString().split('T')[0],
      checkOut: bookingData.checkOut || new Date().toISOString().split('T')[0],
      status: bookingData.status || 'CONFIRMED',
      amount: bookingData.amount || 0,
      source: bookingData.source || 'Direct',
      createdAt: new Date().toISOString(),
    };
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  }, []);

  const updateBooking = useCallback((id: string, updates: Partial<Booking>) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === id ? { ...booking, ...updates } : booking
      )
    );
  }, []);

  const deleteBooking = useCallback((id: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== id));
  }, []);

  const getBookingById = useCallback((id: string) => {
    return bookings.find(booking => booking.id === id);
  }, [bookings]);

  return {
    bookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
    getBookingById,
  };
}
