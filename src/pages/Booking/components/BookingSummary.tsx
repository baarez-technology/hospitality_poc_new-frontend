import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Clock, Sparkles, BedDouble } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { apiClient } from '@/api/client';

export function BookingSummary() {
  const { bookingData, calculateTotal } = useBooking();
  const { subtotal, tax, serviceFee, total, nights, taxRate, cgst, sgst, cgstRate, sgstRate } = calculateTotal();
  const [lastStaySummary, setLastStaySummary] = useState<string | null>(null);
  const email = bookingData.guestInfo?.email?.trim() || '';

  if (!bookingData.room) return null;

  const totalGuests = bookingData.guests.adults + bookingData.guests.children;
  const hasValidDates = bookingData.checkIn && bookingData.checkOut && nights > 0;

  useEffect(() => {
    const t = window.setTimeout(async () => {
      const raw = email.trim();
      if (!raw.includes('@') || raw.length < 5) {
        setLastStaySummary(null);
        return;
      }
      try {
        const res = await apiClient.get<{ summary?: string | null; hasStay?: boolean }>(
          '/api/v1/bookings/guest-last-stay-summary',
          { params: { email: raw } }
        );
        const body = (res.data as { data?: any })?.data ?? res.data;
        const summary = typeof body === 'object' && body ? (body.summary as string | null | undefined) : null;
        const hasStay = typeof body === 'object' && body ? Boolean(body.hasStay) : false;
        setLastStaySummary(hasStay ? summary || null : null);
      } catch {
        setLastStaySummary(null);
      }
    }, 450);
    return () => window.clearTimeout(t);
  }, [email]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-lg sticky top-24 space-y-6"
    >
      {/* Header */}
      <div className="pb-6 border-b border-neutral-200">
        <div className="mb-2">
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">Your Reservation</h3>
        </div>
        <p className="text-sm text-neutral-600 font-medium">Review your booking details</p>
      </div>

      {/* Room Preview */}
      <div className="relative">
        <div className="relative rounded-xl overflow-hidden border border-neutral-200 mb-4 group">
          <img
            src={bookingData.room.images?.[0] || '/placeholder-room.jpg'}
            alt={bookingData.room.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div>
          <h4 className="font-bold text-base sm:text-lg text-neutral-900 mb-3 leading-tight">
            {bookingData.room.name}
          </h4>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg border border-primary-200 uppercase tracking-wider">
              {bookingData.room.category}
            </span>
            <div className="flex items-center gap-1.5 text-neutral-600">
              <BedDouble className="w-4 h-4" strokeWidth={2} />
              <span className="text-xs font-medium">Up to {bookingData.room.maxGuests} guests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dates & Guests */}
      <AnimatePresence mode="wait">
        {hasValidDates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              {lastStaySummary && (
                <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs sm:text-sm font-semibold text-amber-900 truncate">
                    {lastStaySummary}
                  </p>
                </div>
              )}
              {/* Check-in */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
                <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary-600" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Check-in</p>
                  <p className="font-bold text-neutral-900 text-sm">
                    {format(new Date(bookingData.checkIn), 'EEE, MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {/* Check-out */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
                <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary-600" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Check-out</p>
                  <p className="font-bold text-neutral-900 text-sm">
                    {format(new Date(bookingData.checkOut), 'EEE, MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {/* Guests & Nights */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Guests</p>
                    <p className="font-bold text-neutral-900 text-sm">
                      {bookingData.guests.adults} Adult{bookingData.guests.adults !== 1 ? 's' : ''}
                      {bookingData.guests.children > 0 && ` | ${bookingData.guests.children} Child${bookingData.guests.children !== 1 ? 'ren' : ''}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg border border-primary-200">
                  <Clock className="w-4 h-4 text-primary-600" strokeWidth={2} />
                  <span className="font-bold text-primary-700 text-sm">
                    {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price Breakdown */}
      <AnimatePresence mode="wait">
        {hasValidDates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="overflow-hidden space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-neutral-900">Price Details</h4>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <div>
                  <p className="text-sm font-semibold text-neutral-700">Room Rate</p>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    ₹{bookingData.room.price} × {nights} {nights === 1 ? 'night' : 'nights'}
                  </p>
                </div>
                <span className="font-bold text-neutral-900 text-lg">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <div>
                  <p className="text-sm font-semibold text-neutral-700">GST ({taxRate}%)</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    CGST {cgstRate}%: ₹{cgst.toFixed(2)} + SGST {sgstRate}%: ₹{sgst.toFixed(2)}
                  </p>
                </div>
                <span className="font-bold text-neutral-900 text-base">₹{tax.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t-2 border-neutral-200">
              <div className="p-5 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xs font-bold text-primary-100 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="font-bold text-white text-3xl">₹{total.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-primary-100 mb-1">Per night</p>
                    <p className="text-lg font-bold text-white">₹{(total / nights).toFixed(2)}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-primary-500/30">
                  <p className="text-xs text-primary-50 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Best available rate</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting for Dates Message */}
      <AnimatePresence mode="wait">
        {!hasValidDates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-center">
              <Calendar className="w-8 h-8 text-neutral-400 mx-auto mb-2" strokeWidth={2} />
              <p className="text-sm font-semibold text-neutral-700 mb-1">Select your dates</p>
              <p className="text-xs text-neutral-500">Price details will appear once you choose your travel dates</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Additional Info */}
      <div className="pt-5 border-t border-neutral-200">
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-green-900 text-sm mb-1">Free Cancellation</p>
            <p className="text-xs text-green-700 leading-relaxed">
              Cancel up to 24 hours before check-in for a full refund
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}