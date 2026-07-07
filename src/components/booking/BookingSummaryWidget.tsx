import { format } from 'date-fns';
import { Calendar, Users, MapPin, Edit2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCurrency } from '@/hooks/useCurrency';
import { useGSTCalculator } from '@/hooks/useGSTCalculator';
import type { BookingDraft, Booking } from '@/api/types/booking.types';

interface BookingSummaryWidgetProps {
  booking: BookingDraft | Booking;
  editable?: boolean;
  compact?: boolean;
  showCancellationPolicy?: boolean;
  onEdit?: () => void;
}

export const BookingSummaryWidget = ({
  booking,
  editable = false,
  compact = false,
  showCancellationPolicy = true,
  onEdit,
}: BookingSummaryWidgetProps) => {
  const { formatCurrency } = useCurrency();
  const { calculateGSTPerNight } = useGSTCalculator();
  const isDraft = 'checkIn' in booking && booking.checkIn instanceof Date;
  const room = 'room' in booking ? booking.room : null;

  if (!room) return null;

  const checkIn = isDraft
    ? (booking as BookingDraft).checkIn
    : new Date((booking as Booking).checkIn);
  const checkOut = isDraft
    ? (booking as BookingDraft).checkOut
    : new Date((booking as Booking).checkOut);

  const totalGuests = booking.guests.adults + booking.guests.children + booking.guests.infants;

  return (
    <Card variant="elevated" padding={compact ? 'md' : 'lg'} className="sticky top-24">
      {/* Room Image */}
      {!compact && room.images && room.images.length > 0 && (
        <div className="relative h-48 -mx-6 -mt-6 mb-6 rounded-t-lg overflow-hidden">
          <img
            src={room.images[0]}
            alt={room.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Room Name & Edit */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900">{room.name}</h3>
          {!compact && (
            <p className="text-sm text-neutral-600 mt-1">{room.bedType}</p>
          )}
        </div>
        {editable && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit} leftIcon={<Edit2 size={16} />}>
            Edit
          </Button>
        )}
      </div>

      {/* Booking Details */}
      <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
        {/* Check-in */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-neutral-600">Check-in</p>
            <p className="font-medium text-neutral-900">
              {format(checkIn, 'EEE, MMM d, yyyy')}
            </p>
            <p className="text-xs text-neutral-500">After 3:00 PM</p>
          </div>
        </div>

        {/* Check-out */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-neutral-600">Check-out</p>
            <p className="font-medium text-neutral-900">
              {format(checkOut, 'EEE, MMM d, yyyy')}
            </p>
            <p className="text-xs text-neutral-500">Before 11:00 AM</p>
          </div>
        </div>

        {/* Guests */}
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-neutral-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-neutral-600">Guests</p>
            <p className="font-medium text-neutral-900">
              {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}
            </p>
            <p className="text-xs text-neutral-500">
              {booking.guests.adults} Adults
              {booking.guests.children > 0 && `, ${booking.guests.children} Children`}
              {booking.guests.infants > 0 && `, ${booking.guests.infants} Infants`}
            </p>
          </div>
        </div>

        {/* Nights */}
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-neutral-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-neutral-600">Duration</p>
            <p className="font-medium text-neutral-900">
              {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}
            </p>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      {(() => {
        const gst = calculateGSTPerNight(room.price);
        return (
          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-neutral-900">Price Details</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">
                  {formatCurrency(room.price)} × {booking.nights} nights
                </span>
                <span className="text-neutral-900">{formatCurrency(booking.basePrice)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-600">GST ({gst.taxRate}%)</span>
                <span className="text-neutral-900">{formatCurrency(booking.taxes)}</span>
              </div>

              <div className="flex justify-between text-xs pl-2">
                <span className="text-neutral-500">CGST ({gst.cgstRate}%) + SGST ({gst.sgstRate}%)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-600">Service Fee</span>
                <span className="text-neutral-900">{formatCurrency(booking.serviceFee)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Cancellation Policy */}
      {showCancellationPolicy && (
        <div className="bg-neutral-50 rounded-lg p-4">
          <h5 className="font-medium text-neutral-900 mb-2">Cancellation Policy</h5>
          <p className="text-sm text-neutral-600">
            Free cancellation until 24 hours before check-in. After that, the first night will be charged.
          </p>
        </div>
      )}
    </Card>
  );
};
