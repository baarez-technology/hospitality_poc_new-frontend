import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Users, Mail, Phone, Download, Home, Star, Sparkles, BedDouble, Clock, CreditCard, User } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { generateBookingPDF } from '@/utils/pdf/generateBookingPDF';
import { useHotelInfo } from '@/hooks/useHotelInfo';

export function ConfirmationStep() {
  const navigate = useNavigate();
  const { bookingData, calculateTotal } = useBooking();
  const { subtotal, tax, serviceFee, total, nights, taxRate, cgst, sgst, cgstRate, sgstRate } = calculateTotal();
  const hotel = useHotelInfo();
  const [downloading, setDownloading] = useState(false);

  // Check if this was a modification
  const isModification = bookingData.isModifyMode;

  useEffect(() => {
    // Confetti animation or celebration effect could go here
    console.log(isModification ? 'Booking modified!' : 'Booking confirmed!', bookingData);
  }, [bookingData, isModification]);

  if (!bookingData.room || !bookingData.bookingNumber) {
    return null;
  }

  const handleDownload = () => {
    setDownloading(true);
    try {
      generateBookingPDF({
        bookingNumber: bookingData.bookingNumber!,
        room: bookingData.room!,
        checkIn: bookingData.checkIn!,
        checkOut: bookingData.checkOut!,
        guests: bookingData.guests!,
        guestInfo: bookingData.guestInfo!,
        payment: bookingData.payment!,
        subtotal,
        tax,
        serviceFee,
        total,
        nights,
        taxRate,
        cgst,
        sgst,
        cgstRate,
        sgstRate,
        hotel: {
          name: hotel.name,
          address: hotel.address,
          phone: hotel.phone,
          email: hotel.email,
          gstin: hotel.gstin,
        },
      });
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-8 min-h-screen">
      <div className="max-w-3xl w-full px-4 mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150, damping: 12 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-3"
        >
          {isModification ? 'Booking Updated!' : 'Booking Confirmed!'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-neutral-600 mb-6"
        >
          {isModification
            ? 'Your reservation has been successfully modified'
            : 'Your reservation has been successfully processed'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="inline-flex flex-col sm:flex-row items-center gap-3 px-8 py-4 bg-neutral-50 border-2 border-neutral-300 rounded-xl"
        >
          <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Confirmation</span>
          <span className="text-2xl font-bold text-neutral-900">{bookingData.bookingNumber}</span>
        </motion.div>
      </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden mb-8"
        >
        {/* Room Image */}
        <div className="relative h-64">
          <img
            src={bookingData.room.images?.[0] || '/placeholder-room.jpg'}
            alt={bookingData.room.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />

          {/* Room Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{bookingData.room.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-neutral-900 text-xs font-bold rounded uppercase">
                {bookingData.room.category}
              </span>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded">
                <BedDouble className="w-4 h-4 text-neutral-700" strokeWidth={2} />
                <span className="text-xs font-semibold text-neutral-700">Up to {bookingData.room.maxGuests} guests</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 sm:p-8">
          {/* Section Header */}
          <div className="mb-6 pb-4 border-b border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900">Reservation Details</h3>
          </div>

          <div className="space-y-2 mb-8">
            {/* Check-in/out */}
            <div className="flex gap-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Check-in & Check-out</div>
                <div className="font-bold text-neutral-900 text-base">
                  {format(new Date(bookingData.checkIn), 'MMM dd, yyyy')}
                </div>
                <div className="font-bold text-neutral-900 text-base mb-1">
                  {format(new Date(bookingData.checkOut), 'MMM dd, yyyy')}
                </div>
                <div className="text-sm text-neutral-600">{nights} {nights === 1 ? 'night' : 'nights'}</div>
              </div>
            </div>

            {/* Expected Arrival / Departure Times */}
            {(bookingData.guestInfo.eta || bookingData.guestInfo.etd) && (
              <div className="flex gap-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Arrival & Departure Times</div>
                  {bookingData.guestInfo.eta && (
                    <div className="font-bold text-neutral-900 text-base">
                      ETA: {bookingData.guestInfo.eta}
                    </div>
                  )}
                  {bookingData.guestInfo.etd && (
                    <div className="font-bold text-neutral-900 text-base">
                      ETD: {bookingData.guestInfo.etd}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Guests */}
            <div className="flex gap-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Guests</div>
                <div className="font-bold text-neutral-900 text-base">
                  {bookingData.guests.adults} {bookingData.guests.adults === 1 ? 'Adult' : 'Adults'}
                </div>
                {bookingData.guests.children > 0 && (
                  <div className="font-bold text-neutral-900 text-base">
                    {bookingData.guests.children} {bookingData.guests.children === 1 ? 'Child' : 'Children'}
                  </div>
                )}
              </div>
            </div>

            {/* Guest Name */}
            <div className="flex gap-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Guest Name</div>
                <div className="font-bold text-neutral-900 text-base">
                  {bookingData.guestInfo.firstName} {bookingData.guestInfo.lastName}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Email</div>
                <div className="font-bold text-neutral-900 text-sm truncate">{bookingData.guestInfo.email}</div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Phone</div>
                <div className="font-bold text-neutral-900 text-base">{bookingData.guestInfo.phone}</div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex gap-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">Payment Method</div>
                {bookingData.payment.method === 'qr_code' ? (
                  <>
                    <div className="font-bold text-neutral-900 text-base">QR Code Payment</div>
                    <div className="text-sm text-neutral-600 mt-0.5">
                      {bookingData.payment.status === 'pending' ? 'Verification pending' : 'Verified'}
                      {bookingData.payment.paymentReference && ` (Ref: ****${bookingData.payment.paymentReference})`}
                    </div>
                  </>
                ) : bookingData.payment.method === 'pay_at_hotel' ? (
                  <>
                    <div className="font-bold text-neutral-900 text-base">Pay at Hotel</div>
                    <div className="text-sm text-neutral-600 mt-0.5">Payment due at check-in</div>
                  </>
                ) : bookingData.payment.cardNumber ? (
                  <>
                    <div className="font-bold text-neutral-900 text-base">
                      •••• {bookingData.payment.cardNumber.slice(-4)}
                    </div>
                    <div className="text-sm text-neutral-600 mt-0.5">{bookingData.payment.cardName}</div>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-neutral-900 text-base capitalize">
                      {bookingData.payment.method || 'Online Payment'}
                    </div>
                    <div className="text-sm text-neutral-600 mt-0.5">
                      {bookingData.payment.status === 'paid' ? 'Paid' : 'Pending'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="font-bold text-neutral-900 mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                <div>
                  <span className="font-semibold text-neutral-900 text-sm">Room Rate</span>
                  <p className="text-xs text-neutral-600">₹{bookingData.room.price} × {nights} {nights === 1 ? 'night' : 'nights'}</p>
                </div>
                <span className="font-bold text-neutral-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                <div>
                  <span className="font-semibold text-neutral-900 text-sm">GST ({taxRate}%)</span>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    CGST {cgstRate}%: ₹{cgst.toFixed(2)} + SGST {sgstRate}%: ₹{sgst.toFixed(2)}
                  </p>
                </div>
                <span className="font-bold text-neutral-900">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-500 text-white rounded-lg mt-2">
                <span className="font-bold">Total Paid</span>
                <span className="font-bold text-xl">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 mb-6">
        <h3 className="font-bold text-neutral-900 text-xl mb-4">What's Next?</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <span className="text-sm text-neutral-700">Confirmation email sent to <span className="font-semibold text-neutral-900">{bookingData.guestInfo.email}</span></span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <span className="text-sm text-neutral-700">You'll receive a pre-check-in link 24 hours before arrival</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <span className="text-sm text-neutral-700">Complete pre-check-in online to skip the front desk</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <span className="text-sm text-neutral-700">Your digital room key will be activated upon pre-check-in</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`flex-1 py-4 bg-white border-2 border-neutral-300 hover:border-primary-600 text-neutral-900 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            downloading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50'
          }`}
        >
          {downloading ? (
            <>
              <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" strokeWidth={2} />
              <span>Download Confirmation</span>
            </>
          )}
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" strokeWidth={2} />
          <span>Return to Home</span>
        </button>
      </div>
      </div>
    </div>
  );
}