import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Download, Eye, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { bookingService } from '@/api/services/booking.service';
import toast from 'react-hot-toast';
import { BookingDetailsPanel } from '@/components/booking/BookingDetailsPanel';
import { useBookingsSSE } from '@/hooks/useBookingsSSE';

type BookingStatus = 'all' | 'upcoming' | 'past' | 'cancelled';

interface Booking {
  id: string;
  bookingNumber: string;
  roomType: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
}

export function BookingsTab() {
  const [filter, setFilter] = useState<BookingStatus>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const statusMap: Record<BookingStatus, string | undefined> = {
        all: undefined,
        upcoming: 'upcoming',
        past: 'past',
        cancelled: 'cancelled',
      };
      
      const response = await bookingService.getBookings(1, 100, statusMap[filter]);
      const bookingList = response?.items || [];
      
      setBookings((bookingList || []).map((b: any) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        roomType: b.room?.name || b.roomType || 'Unknown Room',
        checkIn: new Date(b.checkIn),
        checkOut: new Date(b.checkOut),
        adults: b.guests?.adults || 0,
        children: b.guests?.children || 0,
        status: b.status === 'confirmed' ? 'confirmed' : 
               b.status === 'checked-out' || b.status === 'completed' ? 'completed' : 
               b.status === 'cancelled' ? 'cancelled' : 'confirmed',
        totalAmount: b.totalPrice || 0,
      })));
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // SSE Integration for real-time booking updates
  useBookingsSSE({
    onBookingCreated: (bookingData) => {
      console.log('[Dashboard BookingsTab] 🎉 New booking received via SSE:', bookingData);
      fetchBookings();
    },
    onBookingModified: (bookingId, changes) => {
      console.log('[Dashboard BookingsTab] 🔄 Booking modified via SSE:', bookingId, changes);
      fetchBookings();
    },
    onBookingCancelled: (bookingId) => {
      console.log('[Dashboard BookingsTab] 🚫 Booking cancelled via SSE:', bookingId);
      fetchBookings();
    },
    refetchBookings: fetchBookings,
  });

  const handleViewDetails = (booking: Booking) => {
    setSelectedBookingId(booking.id);
    setIsPanelOpen(true);
  };

  const handleModifyBooking = async (bookingId: string) => {
    // Fetch booking details to get the room information
    try {
      const bookingDetails = await bookingService.getBookingById(bookingId);
      if (!bookingDetails) {
        toast.error('Unable to load booking details');
        return;
      }

      // Check if room data exists and has valid info (slug or name)
      // Note: Backend may return empty room object {} when no room is assigned yet
      const hasValidRoomInfo = bookingDetails.room &&
        (bookingDetails.room.slug || bookingDetails.room.name);

      if (hasValidRoomInfo) {
        // Navigate to booking page with room slug and booking details
        const roomSlug = bookingDetails.room.slug ||
          bookingDetails.room.name?.toLowerCase().replace(/\s+/g, '-');
        const params = new URLSearchParams({
          room: roomSlug,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          adults: String(bookingDetails.guests?.adults || 1),
          children: String(bookingDetails.guests?.children || 0),
          modify: 'true',
          bookingId: bookingId,
        });
        window.location.href = `/booking?${params.toString()}`;
      } else {
        // No room assigned yet - use roomType from the booking list
        // Find the booking in our local state to get the room type name
        const localBooking = bookings.find(b => b.id === bookingId);
        if (localBooking && localBooking.roomType) {
          // Convert room type name to slug (e.g., "Wellness Suite" -> "wellness-suite")
          const roomSlug = localBooking.roomType.toLowerCase().replace(/\s+/g, '-');
          const params = new URLSearchParams({
            room: roomSlug,
            checkIn: bookingDetails.checkIn,
            checkOut: bookingDetails.checkOut,
            adults: String(bookingDetails.guests?.adults || 1),
            children: String(bookingDetails.guests?.children || 0),
            modify: 'true',
            bookingId: bookingId,
          });
          window.location.href = `/booking?${params.toString()}`;
        } else {
          toast.error('Unable to modify booking: Room information not found');
        }
      }
    } catch (error) {
      console.error('Failed to fetch booking details for modification:', error);
      toast.error('Failed to load booking details for modification');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    // Refresh bookings after cancel
    const response = await bookingService.getBookings(1, 100);
    const bookingList = response?.items || [];
    setBookings((bookingList || []).map((b: any) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      roomType: b.room?.name || b.roomType || 'Unknown Room',
      checkIn: new Date(b.checkIn),
      checkOut: new Date(b.checkOut),
      guests: (b.guests?.adults || 0) + (b.guests?.children || 0),
      status: b.status === 'confirmed' ? 'confirmed' : 
             b.status === 'checked-out' || b.status === 'completed' ? 'completed' : 
             b.status === 'cancelled' ? 'cancelled' : 'confirmed',
      totalAmount: b.totalPrice || 0,
    })));
  };

  const filteredBookings = bookings || [];

  const statusColors = {
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 flex-wrap"
      >
        {(['all', 'upcoming', 'past', 'cancelled'] as BookingStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-400'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-neutral-200 rounded-xl p-12 bg-white text-center"
          >
            <div className="text-neutral-500">Loading bookings...</div>
          </motion.div>
        ) : !filteredBookings || filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-neutral-200 rounded-xl p-12 bg-white text-center"
          >
            <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No bookings found</h3>
            <p className="text-sm text-neutral-500">No bookings match your current filter.</p>
          </motion.div>
        ) : (
          (filteredBookings || []).map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.1 }}
              className="border border-neutral-200 rounded-xl p-6 bg-white"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-neutral-100">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Booking Number</div>
                  <div className="font-semibold text-neutral-900">{booking.bookingNumber}</div>
                </div>
                <span className={`px-2.5 py-1 ${statusColors[booking.status]} text-xs font-medium rounded-lg capitalize`}>
                  {booking.status}
                </span>
              </div>

              {/* Room Info */}
              <div className="mb-4">
                <div className="text-sm font-semibold text-neutral-900">{booking.roomType}</div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Check-in</div>
                  <div className="text-sm font-medium text-neutral-900">
                    {format(booking.checkIn, 'MMM dd, yyyy')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Check-out</div>
                  <div className="text-sm font-medium text-neutral-900">
                    {format(booking.checkOut, 'MMM dd, yyyy')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Guests</div>
                  <div className="text-sm font-medium text-neutral-900">
                    {booking.adults} Adult{booking.adults !== 1 ? 's' : ''}
                    {booking.children > 0 && ` | ${booking.children} Child${booking.children !== 1 ? 'ren' : ''}`}
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="mb-4 pb-4 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Total Amount</span>
                  <span className="text-lg font-bold text-neutral-900">
                    ${booking.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => handleViewDetails(booking)}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button onClick={() => toast.success('Booking confirmation downloaded')} className="px-4 py-2.5 bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Booking Details Panel */}
      <BookingDetailsPanel
        bookingId={selectedBookingId}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedBookingId(null);
        }}
        onModify={handleModifyBooking}
        onCancel={handleCancelBooking}
      />
    </div>
  );
}