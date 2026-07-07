import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, AlertTriangle, X, CreditCard } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { useGSTCalculator } from '@/hooks/useGSTCalculator';
import { roomTypesService } from '@/api/services/roomTypes.service';
import { bookingService } from '@/api/services/booking.service';
import { DatesStep } from './steps/DatesStep';
import { GuestInfoStep } from './steps/GuestInfoStep';
import { RazorpayPaymentStep } from './steps/RazorpayPaymentStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { BookingSummary } from './components/BookingSummary';
import toast from 'react-hot-toast';
import { differenceInDays, parseISO } from 'date-fns';

const steps = [
  { id: 1, name: 'Dates & Guests', component: DatesStep },
  { id: 2, name: 'Your Information', component: GuestInfoStep },
  { id: 3, name: 'Payment', component: RazorpayPaymentStep },
  { id: 4, name: 'Confirmation', component: ConfirmationStep },
];

interface OriginalBooking {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  paymentStatus: string;
  nights: number;
}

// Session storage key for booking step persistence
const BOOKING_STEP_KEY = 'glimmora_booking_step';
const BOOKING_SESSION_KEY = 'glimmora_booking_session';

export function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { bookingData, updateBookingData, resetBooking } = useBooking();
  const { calculateGST } = useGSTCalculator();
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  // Restore step from sessionStorage if same booking session
  const getInitialStep = (): number => {
    try {
      const savedStep = sessionStorage.getItem(BOOKING_STEP_KEY);
      const savedSession = sessionStorage.getItem(BOOKING_SESSION_KEY);
      const currentRoom = searchParams.get('room');

      // Also check persisted booking data for room slug
      let persistedRoomSlug: string | null = null;
      try {
        const persistedData = sessionStorage.getItem('glimmora_booking_data');
        if (persistedData) {
          const parsed = JSON.parse(persistedData);
          persistedRoomSlug = parsed?.room?.slug || null;
        }
      } catch {}

      const roomToCheck = currentRoom || persistedRoomSlug;

      // Only restore if we're in the same booking session (same room)
      if (savedStep && savedSession && roomToCheck && savedSession === roomToCheck) {
        const step = parseInt(savedStep, 10);
        // Don't restore confirmation step (4) as that means booking is complete
        if (step >= 1 && step <= 3) {
          return step;
        }
      }
    } catch (e) {
      console.error('Failed to restore booking step:', e);
    }
    return 1;
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep);

  // Save step to sessionStorage whenever it changes
  useEffect(() => {
    const roomSlug = searchParams.get('room') || bookingData.room?.slug;
    if (roomSlug && currentStep >= 1 && currentStep <= 3) {
      try {
        sessionStorage.setItem(BOOKING_STEP_KEY, currentStep.toString());
        sessionStorage.setItem(BOOKING_SESSION_KEY, roomSlug);
      } catch (e) {
        console.error('Failed to save booking step:', e);
      }
    }
    // Clear session storage when reaching confirmation
    if (currentStep === 4) {
      sessionStorage.removeItem(BOOKING_STEP_KEY);
      sessionStorage.removeItem(BOOKING_SESSION_KEY);
    }
  }, [currentStep, searchParams, bookingData.room?.slug]);

  // Modification mode state (from context for PaymentStep access)
  const isModifyMode = bookingData.isModifyMode || false;
  const originalBooking = bookingData.originalBooking || null;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Prevent browser back button from going back to payment after confirmation
  useEffect(() => {
    if (currentStep === 4 && bookingData.bookingNumber) {
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [currentStep, bookingData.bookingNumber]);

  // Get room and search params from URL
  useEffect(() => {
    const roomSlug = searchParams.get('room');
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';
    const adults = parseInt(searchParams.get('adults') || '1');
    const children = parseInt(searchParams.get('children') || '0');
    const modify = searchParams.get('modify') === 'true';
    const bookingId = searchParams.get('bookingId');

    // Check if this is a new room (different from current booking)
    // Preserve existing data if we have valid booking data for the same room (handles page refresh)
    const isSameRoomWithData = Boolean(
      bookingData.room?.slug &&
      bookingData.room?.slug === roomSlug &&
      bookingData.checkIn &&
      bookingData.checkOut
    );
    // Reset if: different room slug OR (first load without valid existing data)
    const isDifferentRoom = bookingData.room?.slug && bookingData.room.slug !== roomSlug;
    const isNewRoom = isDifferentRoom || (!hasInitialized.current && !isSameRoomWithData);

    if (!roomSlug && !(modify && bookingId)) {
      navigate('/rooms');
      return;
    }

    // Fetch room and original booking if in modify mode
    const fetchRoomAndBooking = async () => {
      try {
        // If no room slug but in modify mode, fetch booking first to get the room
        let effectiveRoomSlug = roomSlug;
        if (!effectiveRoomSlug && modify && bookingId) {
          try {
            const existingBooking = await bookingService.getBookingById(bookingId);
            if (existingBooking?.room?.slug) {
              effectiveRoomSlug = existingBooking.room.slug;
            } else if (existingBooking?.roomType) {
              // Try to find room type by name
              effectiveRoomSlug = existingBooking.roomType.toLowerCase().replace(/\s+/g, '-');
            }
          } catch (err) {
            console.error('[BookingPage] Failed to fetch booking for modify mode:', err);
            navigate('/rooms');
            return;
          }
        }
        if (!effectiveRoomSlug) {
          navigate('/rooms');
          return;
        }
        const room = await roomTypesService.getRoomTypeBySlug(effectiveRoomSlug);
        if (room) {
          // Fetch modification data first if in modify mode
          let modificationData: {
            isModifyMode: boolean;
            originalBooking: {
              id: string;
              bookingNumber: string;
              checkIn: string;
              checkOut: string;
              totalPrice: number;
              paymentStatus: string;
              nights: number;
            } | null;
          } = { isModifyMode: false, originalBooking: null };

          // Store original booking details including guest info for modification mode
          let originalBookingDetails: any = null;

          if (modify && bookingId) {
            console.log('[BookingPage] Modification mode detected:', { modify, bookingId });
            try {
              const booking = await bookingService.getBookingById(bookingId);
              console.log('[BookingPage] Fetched original booking:', booking);
              if (booking) {
                originalBookingDetails = booking;
                modificationData = {
                  isModifyMode: true,
                  originalBooking: {
                    id: booking.id,
                    bookingNumber: booking.bookingNumber,
                    checkIn: booking.checkIn,
                    checkOut: booking.checkOut,
                    totalPrice: booking.totalPrice,
                    paymentStatus: booking.paymentStatus,
                    nights: booking.nights,
                  },
                };
                console.log('[BookingPage] Set modification data:', modificationData);
              }
            } catch (error) {
              console.error('Failed to fetch original booking:', error);
            }
          }

          // Only reset and update if this is a new room or first load
          if (isNewRoom) {
            // Reset booking data first to clear any previous booking state
            resetBooking();

            // Check if dates are actually provided in URL
            const hasDatesInUrl = Boolean(checkIn.trim() && checkOut.trim());

            // Use setTimeout to ensure reset completes before setting new data
            // Include modification data here so it's not lost after reset
            setTimeout(() => {
              let guestInfoToSet = undefined;

              // If in modification mode, pre-fill guest info from original booking
              if (modificationData.isModifyMode && originalBookingDetails?.guestInfo) {
                guestInfoToSet = {
                  firstName: originalBookingDetails.guestInfo.firstName || '',
                  lastName: originalBookingDetails.guestInfo.lastName || '',
                  email: originalBookingDetails.guestInfo.email || '',
                  phone: originalBookingDetails.guestInfo.phone || '',
                  specialRequests: originalBookingDetails.guestInfo.specialRequests || '',
                };
                console.log('[BookingPage] Pre-filling guest info from original booking:', guestInfoToSet);
              }

              const dataToSet = {
                room,
                checkIn: checkIn.trim(),
                checkOut: checkOut.trim(),
                guests: { adults, children },
                datesFromUrl: hasDatesInUrl, // Set flag if dates came from URL
                ...modificationData, // Include modification data
                ...(guestInfoToSet && { guestInfo: guestInfoToSet }),
              };
              console.log('[BookingPage] Updating booking data with:', dataToSet);
              updateBookingData(dataToSet);
            }, 0);

            hasInitialized.current = true;
          } else if (modificationData.isModifyMode) {
            // If not a new room but we're in modify mode, update the modification data
            updateBookingData(modificationData);
          }
          setIsLoading(false);
        } else {
          navigate('/rooms');
        }
      } catch (error) {
        console.error('Failed to fetch room:', error);
        navigate('/rooms');
      }
    };

    fetchRoomAndBooking();
  }, [searchParams, navigate, updateBookingData, resetBooking, bookingData.room?.slug]);

  // Calculate balance for modification mode
  const calculateNewTotal = () => {
    if (!bookingData.room?.price || !bookingData.checkIn || !bookingData.checkOut) return 0;
    const nights = differenceInDays(parseISO(bookingData.checkOut), parseISO(bookingData.checkIn));
    if (nights <= 0) return 0;
    const gst = calculateGST(bookingData.room.price, nights);
    return gst.total;
  };

  const newTotal = calculateNewTotal();
  const balanceAmount = originalBooking ? newTotal - originalBooking.totalPrice : 0;
  const isPaid = originalBooking?.paymentStatus === 'paid';

  // Handle cancellation
  const handleCancelBooking = async () => {
    if (!originalBooking) return;

    setIsCancelling(true);
    try {
      await bookingService.cancelBooking(originalBooking.id, cancelReason || 'Guest requested cancellation');
      toast.success('Booking cancelled successfully');
      navigate('/dashboard?tab=bookings');
    } catch (error: any) {
      console.error('Failed to cancel booking:', error);
      toast.error(error.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  const CurrentStepComponent = steps.find(s => s.id === currentStep)?.component;

  // Compute back URL
  const getBackUrl = () => {
    if (currentStep > 1) return null; // Will use setCurrentStep instead

    if (bookingData.room?.slug) {
      const params = new URLSearchParams();
      if (bookingData.checkIn) params.set('checkIn', bookingData.checkIn);
      if (bookingData.checkOut) params.set('checkOut', bookingData.checkOut);
      params.set('adults', bookingData.guests.adults.toString());
      params.set('children', bookingData.guests.children.toString());
      return `/rooms/${bookingData.room.slug}?${params.toString()}`;
    }
    return '/rooms';
  };

  const backUrl = getBackUrl();

  if (isLoading || !bookingData.room) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-lg text-neutral-700 font-semibold">Loading your booking...</p>
          <p className="text-sm text-neutral-500 mt-2">Please wait while we prepare everything</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            {currentStep === 1 && backUrl ? (
              <Link
                to={backUrl}
                onClick={() => {
                  // Clear booking session when going back to room
                  sessionStorage.removeItem(BOOKING_STEP_KEY);
                  sessionStorage.removeItem(BOOKING_SESSION_KEY);
                }}
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-semibold transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Back to Room</span>
                <span className="sm:hidden">Back</span>
              </Link>
            ) : currentStep === 4 ? (
              /* After confirmation: no back navigation — prevents duplicate reservations */
              <div className="w-24" />
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (currentStep > 1) {
                    setCurrentStep(currentStep - 1);
                  }
                }}
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-semibold transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Previous Step</span>
                <span className="sm:hidden">Back</span>
              </button>
            )}

            {/* Progress Steps */}
            <div className="hidden md:flex items-center gap-3">
              {steps.slice(0, 3).map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        currentStep > step.id
                          ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                          : currentStep === step.id
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/40 scale-110'
                            : 'bg-white text-neutral-400 border-2 border-neutral-300'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" strokeWidth={3} />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div>
                      <span className={`text-sm font-bold whitespace-nowrap transition-colors ${
                        currentStep >= step.id ? 'text-neutral-900' : 'text-neutral-500'
                      }`}>
                        {step.name}
                      </span>
                      {currentStep === step.id && (
                        <div className="h-0.5 bg-primary-600 rounded-full mt-1" />
                      )}
                    </div>
                  </div>
                  {index < 2 && (
                    <div className="relative w-20 h-1 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500 ${
                          currentStep > step.id ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="w-24 hidden md:block" /> {/* Spacer for balance */}
          </div>

          {/* Pre-filled Info Banner */}
          {currentStep === 1 && bookingData.datesFromUrl && bookingData.checkIn?.trim() && bookingData.checkOut?.trim() && !isModifyMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-start gap-3"
            >
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <div>
                <p className="text-sm text-green-800 font-semibold">Dates Pre-filled!</p>
                <p className="text-sm text-green-700 mt-0.5">Your selected dates are ready. You can modify them below if needed.</p>
              </div>
            </motion.div>
          )}

          {/* Modification Mode Banner */}
          {isModifyMode && originalBooking && currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 space-y-4"
            >
              {/* Modify Info Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 font-semibold">Modifying Booking #{originalBooking.bookingNumber}</p>
                    <p className="text-sm text-blue-700 mt-0.5">
                      Original: {originalBooking.nights} night(s) - ₹{originalBooking.totalPrice.toFixed(2)}
                      {isPaid && <span className="ml-2 text-green-600 font-medium">(Paid)</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Balance Calculation */}
              {isPaid && newTotal > 0 && (
                <div className={`p-4 rounded-xl border-2 ${
                  balanceAmount > 0
                    ? 'bg-amber-50 border-amber-300'
                    : balanceAmount < 0
                      ? 'bg-green-50 border-green-300'
                      : 'bg-neutral-50 border-neutral-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">New Total: ₹{newTotal.toFixed(2)}</p>
                      <p className={`text-lg font-bold ${
                        balanceAmount > 0 ? 'text-amber-700' : balanceAmount < 0 ? 'text-green-700' : 'text-neutral-700'
                      }`}>
                        {balanceAmount > 0
                          ? `Balance Due: +₹${balanceAmount.toFixed(2)}`
                          : balanceAmount < 0
                            ? `Refund: ₹${Math.abs(balanceAmount).toFixed(2)}`
                            : 'No Balance Change'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Option */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-700">Need to cancel instead?</span>
                  </div>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Steps Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {CurrentStepComponent && (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrentStepComponent onNext={() => setCurrentStep(currentStep + 1)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Booking Summary Sidebar */}
          {currentStep < 4 && (
            <div className="lg:col-span-1">
              <BookingSummary />
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
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
                  <strong>Refund Policy:</strong> A refund may be processed depending on how close to the check-in date the cancellation is made.
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
                disabled={isCancelling}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
