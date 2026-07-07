import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, CreditCard, AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { bookingService } from '@/api/services/booking.service';
import { useGSTCalculator } from '@/hooks/useGSTCalculator';
import toast from 'react-hot-toast';

interface BookingDetails {
  id: string;
  bookingNumber: string;
  room: {
    id: string;
    name: string;
    slug: string;
    price: number;
  };
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  basePrice: number;
  taxes: number;
  serviceFee: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  nights: number;
}

export function ModifyBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { calculateGST } = useGSTCalculator();

  // Form state for modifications
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [newAdults, setNewAdults] = useState(1);
  const [newChildren, setNewChildren] = useState(0);

  // Calculate prices
  const calculatePrices = (checkIn: string, checkOut: string, pricePerNight: number) => {
    if (!checkIn || !checkOut) return { nights: 0, subtotal: 0, taxes: 0, serviceFee: 0, total: 0, taxRate: 0 };
    const nights = differenceInDays(parseISO(checkOut), parseISO(checkIn));
    if (nights <= 0) return { nights: 0, subtotal: 0, taxes: 0, serviceFee: 0, total: 0, taxRate: 0 };
    const subtotal = pricePerNight * nights;
    const gst = calculateGST(pricePerNight, nights);
    return { nights, subtotal, taxes: gst.taxAmount, serviceFee: gst.serviceFee, total: gst.total, taxRate: gst.taxRate };
  };

  // Load booking details
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        toast.error('No booking ID provided');
        navigate('/dashboard?tab=bookings');
        return;
      }

      try {
        const data = await bookingService.getBookingById(bookingId);
        setBooking(data);
        setNewCheckIn(data.checkIn);
        setNewCheckOut(data.checkOut);
        setNewAdults(data.guests?.adults || 1);
        setNewChildren(data.guests?.children || 0);
      } catch (error) {
        console.error('Failed to load booking:', error);
        toast.error('Failed to load booking details');
        navigate('/dashboard?tab=bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  // Check if there are changes
  const hasChanges = booking && (
    newCheckIn !== booking.checkIn ||
    newCheckOut !== booking.checkOut ||
    newAdults !== booking.guests?.adults ||
    newChildren !== booking.guests?.children
  );

  // Calculate new and original prices
  const originalPrices = booking ? {
    nights: booking.nights,
    subtotal: booking.basePrice,
    taxes: booking.taxes,
    serviceFee: booking.serviceFee,
    total: booking.totalPrice
  } : { nights: 0, subtotal: 0, taxes: 0, serviceFee: 0, total: 0 };

  const newPrices = booking?.room?.price
    ? calculatePrices(newCheckIn, newCheckOut, booking.room.price)
    : { nights: 0, subtotal: 0, taxes: 0, serviceFee: 0, total: 0 };

  // Calculate balance (positive means guest owes more, negative means refund)
  const balanceAmount = newPrices.total - originalPrices.total;
  const isPaid = booking?.paymentStatus === 'paid';

  // Handle save modifications
  const handleSaveModifications = async () => {
    if (!booking || !hasChanges) return;

    setSaving(true);
    try {
      await bookingService.updateBooking(booking.id, {
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        guests: {
          adults: newAdults,
          children: newChildren,
          infants: 0
        }
      });

      toast.success('Booking modified successfully!');
      navigate('/dashboard?tab=bookings');
    } catch (error: any) {
      console.error('Failed to modify booking:', error);
      toast.error(error.response?.data?.detail || 'Failed to modify booking');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancellation
  const handleCancelBooking = async () => {
    if (!booking) return;

    setCancelling(true);
    try {
      await bookingService.cancelBooking(booking.id, cancelReason || 'Guest requested cancellation');
      toast.success('Booking cancelled successfully.');
      navigate('/dashboard?tab=bookings');
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      toast.error(error.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-neutral-600">Booking not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard?tab=bookings')}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Bookings
            </button>
            <h1 className="text-xl font-bold text-neutral-900">Modify Booking</h1>
            <div className="w-32" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Booking Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-neutral-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-neutral-500">Booking Number</p>
              <p className="text-lg font-bold text-neutral-900">{booking.bookingNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-neutral-100 text-neutral-700'
              }`}>
                {booking.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {booking.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
              </span>
            </div>
          </div>
          <p className="text-neutral-600">
            <span className="font-medium">{booking.room?.name || 'Room'}</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Modification Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-neutral-200 p-6"
          >
            <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Modify Dates & Guests
            </h2>

            <div className="space-y-4">
              {/* Check-in Date */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={newCheckIn}
                  onChange={(e) => setNewCheckIn(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Check-out Date */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={newCheckOut}
                  onChange={(e) => setNewCheckOut(e.target.value)}
                  min={newCheckIn || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Guests */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Adults
                  </label>
                  <select
                    value={newAdults}
                    onChange={(e) => setNewAdults(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Children
                  </label>
                  <select
                    value={newChildren}
                    onChange={(e) => setNewChildren(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {[0, 1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveModifications}
              disabled={!hasChanges || saving || newPrices.nights <= 0}
              className={`w-full mt-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                hasChanges && newPrices.nights > 0
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </motion.div>

          {/* Price Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Original Price */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-sm font-medium text-neutral-500 mb-3">Original Booking</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">{originalPrices.nights} night(s)</span>
                  <span className="text-neutral-900">₹{originalPrices.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">GST</span>
                  <span className="text-neutral-900">₹{originalPrices.taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Service Fee (5%)</span>
                  <span className="text-neutral-900">₹{originalPrices.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 font-semibold">
                  <span>Total Paid</span>
                  <span className="text-green-600">₹{originalPrices.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* New Price (if changed) */}
            {hasChanges && newPrices.nights > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="text-sm font-medium text-neutral-500 mb-3">New Booking</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">{newPrices.nights} night(s)</span>
                    <span className="text-neutral-900">₹{newPrices.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">GST ({newPrices.taxRate}%)</span>
                    <span className="text-neutral-900">₹{newPrices.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Service Fee (5%)</span>
                    <span className="text-neutral-900">₹{newPrices.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-200 font-semibold">
                    <span>New Total</span>
                    <span>₹{newPrices.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Balance Amount */}
            {hasChanges && isPaid && newPrices.nights > 0 && (
              <div className={`rounded-xl border-2 p-6 ${
                balanceAmount > 0
                  ? 'bg-amber-50 border-amber-300'
                  : balanceAmount < 0
                    ? 'bg-green-50 border-green-300'
                    : 'bg-neutral-50 border-neutral-300'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className={`w-5 h-5 ${
                    balanceAmount > 0 ? 'text-amber-600' : balanceAmount < 0 ? 'text-green-600' : 'text-neutral-600'
                  }`} />
                  <h3 className="font-semibold text-neutral-900">
                    {balanceAmount > 0 ? 'Balance Due' : balanceAmount < 0 ? 'Refund Amount' : 'No Change'}
                  </h3>
                </div>
                <p className={`text-2xl font-bold ${
                  balanceAmount > 0 ? 'text-amber-700' : balanceAmount < 0 ? 'text-green-700' : 'text-neutral-700'
                }`}>
                  {balanceAmount > 0 ? '+' : ''}{balanceAmount !== 0 ? `₹${Math.abs(balanceAmount).toFixed(2)}` : '₹0.00'}
                </p>
                <p className="text-sm text-neutral-600 mt-2">
                  {balanceAmount > 0
                    ? 'Additional payment required for the extended stay.'
                    : balanceAmount < 0
                      ? 'This amount will be refunded to your original payment method.'
                      : 'Your booking total remains the same.'
                  }
                </p>
              </div>
            )}

            {/* Cancellation Section */}
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Cancel Booking
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                If you need to cancel this booking, you can do so here.
                {isPaid && ' A refund will be processed according to our cancellation policy.'}
              </p>
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel Booking
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Cancel Booking?</h3>
                <p className="text-sm text-neutral-600">This action cannot be undone.</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please let us know why you're cancelling..."
                rows={3}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {isPaid && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Refund Policy:</strong> A refund of up to 50% may be processed depending on how close to the check-in date the cancellation is made.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
