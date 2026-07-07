import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, MapPin, CreditCard, Download, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { bookingService } from '@/api/services/booking.service';
import toast from 'react-hot-toast';

interface BookingDetailsPanelProps {
  bookingId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onModify?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
}

export function BookingDetailsPanel({ 
  bookingId, 
  isOpen, 
  onClose, 
  onModify, 
  onCancel 
}: BookingDetailsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails();
    }
  }, [isOpen, bookingId]);

  const fetchBookingDetails = async () => {
    if (!bookingId) return;

    setLoading(true);
    setBooking(null); // Reset booking state before fetching
    try {
      const data = await bookingService.getBookingById(bookingId);
      if (data) {
        setBooking(data);
      } else {
        console.error('Empty booking data received');
        toast.error('Booking details not available');
      }
    } catch (error: any) {
      console.error('Failed to fetch booking details:', error);
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      if (status === 403) {
        toast.error('You are not authorized to view this booking');
      } else if (status === 404) {
        toast.error(detail || 'Booking not found');
      } else {
        toast.error('Failed to load booking details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!bookingId || !onCancel) return;
    
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelling(true);
    try {
      await bookingService.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      onCancel(bookingId);
      onClose();
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      toast.error(error.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleModify = () => {
    if (bookingId && onModify) {
      onModify(bookingId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Booking Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-neutral-500">Loading booking details...</div>
                </div>
              ) : booking ? (
                <div className="space-y-6">
                  {/* Booking Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-neutral-500 mb-1">Booking Number</div>
                      <div className="text-lg font-semibold text-neutral-900">{booking.bookingNumber}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {booking.status?.toUpperCase()}
                    </span>
                  </div>

                  {/* Room Details */}
                  <div className="border border-neutral-200 rounded-xl p-4">
                    <h3 className="font-semibold text-neutral-900 mb-3">Room Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-900">{booking.room?.name || booking.roomType}</span>
                      </div>
                      {booking.room?.description && (
                        <p className="text-sm text-neutral-600">{booking.room.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Dates & Guests */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-neutral-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm font-medium text-neutral-700">Check-in</span>
                      </div>
                      <div className="text-sm text-neutral-900">
                        {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="border border-neutral-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm font-medium text-neutral-700">Check-out</span>
                      </div>
                      <div className="text-sm text-neutral-900">
                        {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="border border-neutral-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm font-medium text-neutral-700">Guests</span>
                    </div>
                    <div className="text-sm text-neutral-900">
                      {booking.guests?.adults || 0} Adults
                      {booking.guests?.children ? `, ${booking.guests.children} Children` : ''}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {booking.nights || 0} night{booking.nights !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Guest Information */}
                  {booking.guestInfo && (
                    <div className="border border-neutral-200 rounded-xl p-4">
                      <h3 className="font-semibold text-neutral-900 mb-3">Guest Information</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-neutral-500">Name: </span>
                          <span className="text-neutral-900">
                            {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Email: </span>
                          <span className="text-neutral-900">{booking.guestInfo.email}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Phone: </span>
                          <span className="text-neutral-900">{booking.guestInfo.phone}</span>
                        </div>
                        {booking.guestInfo.country && (
                          <div>
                            <span className="text-neutral-500">Country: </span>
                            <span className="text-neutral-900">{booking.guestInfo.country}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="border border-neutral-200 rounded-xl p-4">
                    <h3 className="font-semibold text-neutral-900 mb-3">Pricing</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Base Price</span>
                        <span className="text-neutral-900">₹{booking.basePrice?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Taxes</span>
                        <span className="text-neutral-900">₹{booking.taxes?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Service Fee</span>
                        <span className="text-neutral-900">₹{booking.serviceFee?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="pt-2 border-t border-neutral-200 flex justify-between font-semibold">
                        <span className="text-neutral-900">Total</span>
                        <span className="text-neutral-900">₹{booking.totalPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  {booking.paymentStatus && (
                    <div className="border border-neutral-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm font-medium text-neutral-700">Payment Status</span>
                      </div>
                      <div className="text-sm text-neutral-900 capitalize">{booking.paymentStatus}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  No booking details found
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {booking && (
              <div className="border-t border-neutral-200 p-6 flex gap-3">
                {booking.status === 'confirmed' && (
                  <>
                    <button
                      onClick={handleModify}
                      className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Modify
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="px-4 py-2.5 bg-red-50 hover:bg-red-100 disabled:bg-neutral-100 text-red-600 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      {cancelling ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </>
                )}
                <button className="px-4 py-2.5 bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

