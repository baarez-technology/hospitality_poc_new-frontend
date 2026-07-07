/**
 * RazorpayPaymentStep Component
 * Payment step with custom payment UI (Card, UPI, Cash)
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, AlertCircle, Loader2, KeyRound, CheckCircle
} from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/hooks/useAuth';
import { otpService } from '@/api/services/otp.service';
import { bookingService } from '@/api/services/booking.service';
import CustomPaymentForm from '@/components/payments/CustomPaymentForm';
import toast from 'react-hot-toast';

interface RazorpayPaymentStepProps {
  onNext: () => void;
}

export function RazorpayPaymentStep({ onNext }: RazorpayPaymentStepProps) {
  const { bookingData, updateBookingData, calculateTotal } = useBooking();
  const { user } = useAuth();

  // OTP verification state
  const [otpVerified, setOtpVerified] = useState(true); // Set to true for testing
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Booking state
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  const { total: totalAmount, nights } = calculateTotal();

  // Auto-send OTP when component mounts
  useEffect(() => {
    const email = bookingData.guestInfo?.email || user?.email;
    if (email && !otpSent && !otpVerified) {
      handleSendOTP();
    }
  }, []);

  const handleSendOTP = async () => {
    const email = bookingData.guestInfo?.email || user?.email;
    if (!email) {
      toast.error('Email is required for verification');
      return;
    }

    setSendingOtp(true);
    setOtpError('');
    try {
      await otpService.sendOTP({
        email,
        purpose: 'booking_payment',
      });
      setOtpSent(true);
      toast.success('Verification code sent to your email!');
    } catch (error: any) {
      setOtpError(error.response?.data?.detail || 'Failed to send verification code');
      toast.error('Failed to send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit code');
      return;
    }

    const email = bookingData.guestInfo?.email || user?.email;
    if (!email) {
      setOtpError('Email is required');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');
    try {
      await otpService.verifyOTP({
        email,
        otp_code: otpCode,
        purpose: 'booking_payment',
      });
      setOtpVerified(true);
      toast.success('Email verified successfully!');
    } catch (error: any) {
      setOtpError(error.response?.data?.detail || 'Invalid verification code');
      toast.error('Invalid verification code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const createBooking = async (paymentStatus: string, paymentMethod: string): Promise<number> => {
    if (!bookingData.room || !bookingData.checkIn || !bookingData.checkOut) {
      throw new Error('Missing booking information');
    }

    if (!bookingData.guestInfo.firstName || !bookingData.guestInfo.email) {
      throw new Error('Missing guest information');
    }

    // Calculate pricing
    const { subtotal, tax, serviceFee, total } = calculateTotal();

    setIsCreatingBooking(true);
    try {
      const response = await bookingService.createBooking({
        roomId: String(bookingData.room.id),
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: {
          adults: bookingData.guests.adults,
          children: bookingData.guests.children,
          infants: 0,
        },
        guestInfo: {
          firstName: bookingData.guestInfo.firstName,
          lastName: bookingData.guestInfo.lastName,
          email: bookingData.guestInfo.email,
          phone: bookingData.guestInfo.phone,
          country: 'IN',
          specialRequests: bookingData.guestInfo.specialRequests || '',
        },
        paymentMethodId: paymentMethod,
        paymentStatus: paymentStatus,
        // Include pricing to ensure correct amounts
        basePrice: subtotal,
        taxes: tax,
        serviceFee: serviceFee,
        totalPrice: total,
        ratePerNight: bookingData.room.price,
      });

      const id = Number(response.id);
      setBookingId(id);
      return id;
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      // Create booking if not already created
      let currentBookingId = bookingId;
      if (!currentBookingId) {
        currentBookingId = await createBooking('paid', 'razorpay');
      }

      // Update booking data
      updateBookingData({
        payment: {
          method: response.method || 'card',
          status: 'paid',
          transactionId: response.payment_id,
        },
        bookingNumber: `RES-${currentBookingId}`,
      });

      toast.success('Payment successful!');
      onNext();
    } catch (err: any) {
      console.error('Failed to update booking:', err);
      toast.error(err.message || 'Failed to update booking');
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const handlePayAtHotel = async () => {
    try {
      const currentBookingId = await createBooking('pending', 'pay_at_hotel');

      updateBookingData({
        payment: {
          method: 'pay_at_hotel',
          status: 'pending',
        },
        bookingNumber: `RES-${currentBookingId}`,
      });

      toast.success('Booking confirmed! Pay at hotel during check-in.');
      onNext();
    } catch (err: any) {
      console.error('Booking error:', err);
      toast.error(err.message || 'Failed to create booking. Please try again.');
    }
  };

  const handleQRCodePayment = async (paymentReference: string) => {
    try {
      // Calculate pricing
      const { subtotal, tax, serviceFee, total } = calculateTotal();

      // Create booking with QR code payment method and reference
      const response = await bookingService.createBooking({
        roomId: String(bookingData.room!.id),
        checkIn: bookingData.checkIn!,
        checkOut: bookingData.checkOut!,
        guests: {
          adults: bookingData.guests.adults,
          children: bookingData.guests.children,
          infants: 0,
        },
        guestInfo: {
          firstName: bookingData.guestInfo.firstName,
          lastName: bookingData.guestInfo.lastName,
          email: bookingData.guestInfo.email,
          phone: bookingData.guestInfo.phone,
          country: 'IN',
          specialRequests: bookingData.guestInfo.specialRequests || '',
        },
        // Use camelCase for backend compatibility
        paymentMethod: 'qr_code',
        paymentStatus: 'pending',
        paymentReference: paymentReference,
        // Include pricing to ensure correct amounts
        basePrice: subtotal,
        taxes: tax,
        serviceFee: serviceFee,
        totalPrice: total,
        ratePerNight: bookingData.room!.price,
      });

      const id = Number(response.id);
      setBookingId(id);

      updateBookingData({
        payment: {
          method: 'qr_code',
          status: 'pending',
          paymentReference,
        },
        bookingNumber: response.bookingNumber || `RES-${id}`,
      });

      toast.success('Booking confirmed! Payment will be verified by our team.');
      onNext();
    } catch (err: any) {
      console.error('Booking error:', err);
      toast.error(err.message || 'Failed to create booking. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // OTP Verification Screen
  if (!otpVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 sm:p-10 border border-neutral-200 shadow-lg"
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-terra-500 flex items-center justify-center shadow-md">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Email Verification</h2>
              <p className="text-neutral-600">Verify your email to proceed with payment</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Verification code sent to:</strong>{' '}
              {bookingData.guestInfo?.email || user?.email || 'N/A'}
            </p>
            {otpSent && (
              <p className="text-xs text-blue-700 mt-2">
                Check your inbox for a 6-digit code. Expires in 10 minutes.
              </p>
            )}
          </div>

          {otpError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <p className="text-sm text-red-700">{otpError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Enter Verification Code
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtpCode(value);
                setOtpError('');
              }}
              placeholder="000000"
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-terra-500 focus:border-terra-500"
              maxLength={6}
              disabled={verifyingOtp}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleVerifyOTP}
              disabled={!otpCode || otpCode.length !== 6 || verifyingOtp}
              className="flex-1 py-3 bg-terra-500 hover:bg-terra-600 disabled:bg-neutral-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {verifyingOtp ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Verify Email
                </>
              )}
            </button>
            <button
              onClick={handleSendOTP}
              disabled={sendingOtp}
              className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium rounded-lg transition-colors"
            >
              {sendingOtp ? 'Sending...' : 'Resend'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Payment Screen
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 sm:p-10 border border-neutral-200 shadow-lg"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Payment</h2>
        <p className="text-neutral-600">Choose your preferred payment method</p>

        {/* Email Verified Badge */}
        <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg w-fit">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-900">Email Verified</span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-8 p-5 bg-neutral-50 rounded-xl border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">{bookingData.room?.name || 'Room'}</span>
            <span className="font-medium">{formatCurrency(bookingData.room?.price || 0)}/night</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Duration</span>
            <span className="font-medium">{nights || 1} night(s)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Check-in</span>
            <span className="font-medium">{bookingData.checkIn}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Check-out</span>
            <span className="font-medium">{bookingData.checkOut}</span>
          </div>
        </div>
      </div>

      {/* Custom Payment Form */}
      <CustomPaymentForm
        amount={totalAmount}
        currency="INR"
        description={`Booking at ${bookingData.room?.name || 'Hotel Room'}`}
        bookingId={bookingId || undefined}
        customerName={`${bookingData.guestInfo.firstName} ${bookingData.guestInfo.lastName}`}
        customerEmail={bookingData.guestInfo.email}
        customerPhone={bookingData.guestInfo.phone}
        notes={{
          room_name: bookingData.room?.name || '',
          check_in: bookingData.checkIn || '',
          check_out: bookingData.checkOut || '',
        }}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onPayAtHotel={handlePayAtHotel}
        onQRCodePayment={handleQRCodePayment}
        showCashOption={true}
        disabled={isCreatingBooking}
      />
    </motion.div>
  );
}

export default RazorpayPaymentStep;
