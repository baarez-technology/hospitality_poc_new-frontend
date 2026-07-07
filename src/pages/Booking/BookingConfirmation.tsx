import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle, Download, Printer, Calendar, Mail, ArrowRight } from 'lucide-react';
import { BookingProgressStepper } from '@/components/booking/BookingProgressStepper';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { bookingApi } from '@/api/services/booking.service';
import { formatCurrency } from '@/utils/helpers/format';

export const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingId = location.state?.bookingId as string | undefined;

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingApi.getBooking(bookingId!),
    enabled: !!bookingId,
  });

  // Redirect if no booking ID
  useEffect(() => {
    if (!bookingId) {
      navigate('/rooms');
    }
  }, [bookingId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <div className="text-red-600 mb-4">
            <CheckCircle size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Booking Not Found
          </h2>
          <p className="text-neutral-600 mb-6">
            We couldn't find your booking. Please check your email for confirmation.
          </p>
          <Button variant="primary" onClick={() => navigate('/rooms')}>
            Back to Rooms
          </Button>
        </Card>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // In production, this would call an API endpoint to generate PDF
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('PDF download functionality will be implemented with backend integration');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setIsPrinting(false);
  };

  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const totalGuests = booking.guests.adults + booking.guests.children + booking.guests.infants;

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Stepper */}
        <BookingProgressStepper currentStep={3} />

        {/* Success Message */}
        <Card className="text-center mb-8" padding="lg">
          <div className="text-green-600 mb-4">
            <CheckCircle size={64} className="mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-neutral-600 mb-4">
            Your reservation has been successfully confirmed
          </p>
          <div className="flex items-center justify-center gap-2 text-neutral-700">
            <Mail className="w-5 h-5 text-primary-600" />
            <span className="text-sm">
              Confirmation email sent to <strong>{booking.guestInfo.email}</strong>
            </span>
          </div>
        </Card>

        {/* Booking Details */}
        <Card className="mb-8" padding="lg">
          <div className="border-b border-neutral-200 pb-4 mb-6">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Booking Details
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">Confirmation Number:</span>
              <span className="text-lg font-mono font-bold text-primary-600">
                {booking.bookingNumber}
              </span>
            </div>
          </div>

          {/* Room Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Room Information</h3>
            <div className="flex gap-4">
              {booking.room.images && booking.room.images.length > 0 && (
                <img
                  src={booking.room.images?.[0] || '/placeholder-room.jpg'}
                  alt={booking.room.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-neutral-900">
                  {booking.room.name}
                </h4>
                <p className="text-sm text-neutral-600 mb-2">{booking.room.bedType}</p>
                <div className="flex flex-wrap gap-2">
                  {booking.room.amenities.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Check-in</h3>
              <div className="flex items-center gap-2 text-neutral-700">
                <Calendar className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="font-medium">{format(checkInDate, 'EEE, MMM d, yyyy')}</p>
                  <p className="text-sm text-neutral-500">After 3:00 PM</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Check-out</h3>
              <div className="flex items-center gap-2 text-neutral-700">
                <Calendar className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="font-medium">{format(checkOutDate, 'EEE, MMM d, yyyy')}</p>
                  <p className="text-sm text-neutral-500">Before 11:00 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Guest Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-600">Name:</span>{' '}
                <span className="text-neutral-900 font-medium">
                  {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                </span>
              </div>
              <div>
                <span className="text-neutral-600">Email:</span>{' '}
                <span className="text-neutral-900 font-medium">{booking.guestInfo.email}</span>
              </div>
              <div>
                <span className="text-neutral-600">Phone:</span>{' '}
                <span className="text-neutral-900 font-medium">{booking.guestInfo.phone}</span>
              </div>
              <div>
                <span className="text-neutral-600">Guests:</span>{' '}
                <span className="text-neutral-900 font-medium">
                  {booking.guests.adults} Adult{booking.guests.adults !== 1 ? 's' : ''}
                  {booking.guests.children > 0 && ` | ${booking.guests.children} Child${booking.guests.children !== 1 ? 'ren' : ''}`}
                  {booking.guests.infants > 0 && ` | ${booking.guests.infants} Infant${booking.guests.infants !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-neutral-600">
                  {formatCurrency(booking.room.price)} × {booking.nights} nights
                </span>
                <span className="text-neutral-900">{formatCurrency(booking.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Taxes (12%)</span>
                <span className="text-neutral-900">{formatCurrency(booking.taxes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Service Fee (5%)</span>
                <span className="text-neutral-900">{formatCurrency(booking.serviceFee)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
              <span className="font-semibold text-neutral-900">Total Paid</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(booking.totalPrice)}
              </span>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8" padding="lg">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">What's Next?</h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-neutral-900">Check your email</p>
                <p className="text-neutral-600">
                  We've sent a confirmation email with all the details of your booking
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-neutral-900">Prepare for check-in</p>
                <p className="text-neutral-600">
                  Bring a valid ID and your confirmation number when you arrive
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-neutral-900">Manage your booking</p>
                <p className="text-neutral-600">
                  View, modify, or cancel your booking anytime from your account
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant="secondary"
            leftIcon={<Download size={20} />}
            onClick={handleDownloadPDF}
            isLoading={isDownloading}
          >
            Download PDF
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Printer size={20} />}
            onClick={handlePrint}
            isLoading={isPrinting}
          >
            Print Confirmation
          </Button>
          <Button
            variant="primary"
            rightIcon={<ArrowRight size={20} />}
            onClick={() => navigate('/account/bookings')}
          >
            View My Bookings
          </Button>
        </div>
      </div>
    </div>
  );
};
