/**
 * Chat Action Renderer
 *
 * Renders interactive UI components based on action data from the AI.
 * This enables the chat to show rich, interactive elements like:
 * - Room selection cards
 * - Pre-check-in preferences form
 * - Payment integration
 * - Booking details cards
 * - Digital key display
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatAction,
  RoomTypeOption,
  BookingSummary,
  PrecheckinRoom,
  GuestInfo,
} from '@/api/services/guest-chat.service';

// ============================================================================
// Types
// ============================================================================

interface ChatActionRendererProps {
  action: ChatAction;
  onSelection: (actionType: string, selection: Record<string, unknown>) => void;
}

// ============================================================================
// Main Component
// ============================================================================

export const ChatActionRenderer: React.FC<ChatActionRendererProps> = ({
  action,
  onSelection,
}) => {
  if (!action) return null;

  switch (action.type) {
    case 'show_room_selection':
    case 'show_available_rooms':
      return (
        <RoomSelectionCards
          roomTypes={(action.data.room_types as RoomTypeOption[]) || []}
          checkIn={action.data.check_in as string}
          checkOut={action.data.check_out as string}
          nights={action.data.nights as number}
          onSelect={(roomType) =>
            onSelection('select_room_type', {
              room_type_id: roomType.id,
              room_type_name: roomType.name,
              check_in: action.data.check_in,
              check_out: action.data.check_out,
            })
          }
        />
      );

    case 'show_payment':
      const bookingSummary = action.data.booking_summary as BookingSummary;
      return (
        <PaymentSummaryCard
          bookingSummary={bookingSummary}
          guestInfo={action.data.guest_info as GuestInfo}
          onProceed={() =>
            onSelection('payment_complete', {
              room_type_id: bookingSummary?.room_type_id,
              room_type_name: bookingSummary?.room_type_name,
              check_in: bookingSummary?.check_in,
              check_out: bookingSummary?.check_out,
              adults: bookingSummary?.adults || 1,
              children: bookingSummary?.children || 0,
              special_requests: bookingSummary?.special_requests,
            })
          }
        />
      );

    case 'show_booking_details':
      return (
        <BookingDetailsCard
          booking={action.data.booking as Record<string, unknown>}
          onAction={(actionType) => onSelection(actionType, action.data.booking as Record<string, unknown>)}
        />
      );

    case 'show_bookings_list':
      return (
        <BookingsListCard
          bookings={(action.data.bookings as Array<Record<string, unknown>>) || []}
          onSelect={(booking) => onSelection('view_booking', booking)}
        />
      );

    case 'show_precheckin_preferences':
      return (
        <PrecheckinPreferencesForm
          precheckinId={action.data.precheckin_id as number}
          bookingInfo={action.data.booking_info as Record<string, unknown>}
          onSubmit={(preferences) =>
            onSelection('submit_preferences', {
              precheckin_id: action.data.precheckin_id,
              ...preferences,
            })
          }
        />
      );

    case 'show_precheckin_rooms':
      return (
        <PrecheckinRoomCards
          rooms={(action.data.rooms as PrecheckinRoom[]) || []}
          precheckinId={action.data.precheckin_id as number}
          onSelect={(room) =>
            onSelection('select_precheckin_room', {
              precheckin_id: action.data.precheckin_id,
              room_id: room.id,
              room_number: room.number,
            })
          }
        />
      );

    case 'show_room_selected':
      return (
        <RoomSelectedCard
          selectedRoom={action.data.selected_room as Record<string, unknown>}
          precheckinId={action.data.precheckin_id as number}
          onComplete={() =>
            onSelection('complete_precheckin', {
              precheckin_id: action.data.precheckin_id,
            })
          }
        />
      );

    case 'show_digital_key':
      return (
        <DigitalKeyCard
          digitalKey={action.data.digital_key as string}
          roomNumber={action.data.room_number as string}
          checkInTime={action.data.check_in_time as string}
        />
      );

    case 'show_modification_success':
      return (
        <SuccessCard
          title="Booking Modified"
          message={action.data.message as string}
          icon="✓"
        />
      );

    case 'show_cancellation_success':
      return (
        <SuccessCard
          title="Booking Cancelled"
          message={`Booking ${action.data.confirmation_code} has been cancelled.`}
          icon="✓"
        />
      );

    case 'show_service_request_created':
      return (
        <ServiceRequestCard
          taskId={action.data.task_id as number}
          serviceType={action.data.service_type as string}
          title={action.data.title as string}
          estimatedResponse={action.data.estimated_response as string}
        />
      );

    case 'show_profile':
      return (
        <ProfileCard
          profile={action.data.profile as Record<string, unknown>}
        />
      );

    case 'show_profile_updated':
      return (
        <SuccessCard
          title="Profile Updated"
          message={action.data.message as string || 'Your profile has been updated successfully.'}
          icon="✓"
        />
      );

    case 'show_room_types_info':
      return (
        <RoomTypesInfoCards
          roomTypes={(action.data.room_types as RoomTypeOption[]) || []}
          onSelectForBooking={(room) =>
            onSelection('start_booking_with_room', {
              room_type_id: room.id,
              room_type_name: room.name,
            })
          }
        />
      );

    case 'show_error':
      return (
        <ErrorCard
          message={action.data.message as string || 'An error occurred.'}
          details={action.data.details as string}
        />
      );

    case 'show_booking_confirmation':
      return (
        <BookingConfirmationCard
          booking={action.data.booking as Record<string, unknown>}
          onStartPrecheckin={() =>
            onSelection('start_precheckin', {
              confirmation_code: (action.data.booking as Record<string, unknown>)?.confirmation_code,
            })
          }
        />
      );

    default:
      return null;
  }
};

// ============================================================================
// Room Selection Cards
// ============================================================================

interface RoomSelectionCardsProps {
  roomTypes: RoomTypeOption[];
  checkIn: string;
  checkOut: string;
  nights: number;
  onSelect: (room: RoomTypeOption) => void;
}

const RoomSelectionCards: React.FC<RoomSelectionCardsProps> = ({
  roomTypes,
  checkIn,
  checkOut,
  nights,
  onSelect,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className="mt-3 space-y-3">
      <div className="text-xs text-neutral-500 mb-2">
        {checkIn} → {checkOut} • {nights} night{nights !== 1 ? 's' : ''}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {roomTypes.map((room) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedId === room.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300 bg-white'
            }`}
            onClick={() => setSelectedId(room.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900">{room.name}</h4>
                {room.description && (
                  <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                    {room.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {room.max_occupancy && (
                    <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded">
                      Up to {room.max_occupancy} guests
                    </span>
                  )}
                  {room.available_count !== undefined && room.available_count <= 3 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                      Only {room.available_count} left
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right ml-3">
                <div className="text-lg font-semibold text-primary-600">
                  ${room.base_price}
                </div>
                <div className="text-xs text-neutral-500">/night</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            onClick={() => {
              const selected = roomTypes.find((r) => r.id === selectedId);
              if (selected) onSelect(selected);
            }}
          >
            Select {roomTypes.find((r) => r.id === selectedId)?.name}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Payment Summary Card
// ============================================================================

interface PaymentSummaryCardProps {
  bookingSummary: BookingSummary;
  guestInfo: GuestInfo;
  onProceed: () => void;
}

const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  bookingSummary,
  guestInfo,
  onProceed,
}) => {
  const [processing, setProcessing] = useState(false);
  const [payLaterProcessing, setPayLaterProcessing] = useState(false);

  const handleProceed = async () => {
    setProcessing(true);
    // Redirect to booking payment page with pre-filled data
    setTimeout(() => {
      const params = new URLSearchParams({
        room_type_id: String(bookingSummary.room_type_id),
        check_in: bookingSummary.check_in,
        check_out: bookingSummary.check_out,
        adults: String(bookingSummary.adults),
        children: String(bookingSummary.children || 0),
        from_chat: 'true',
      });
      window.location.href = `/booking?${params.toString()}`;
    }, 500);
  };

  const handlePayLater = async () => {
    setPayLaterProcessing(true);
    // Tell the AI to create the booking with pay-at-hotel option
    onProceed();
  };

  return (
    <div className="mt-3 bg-white border border-neutral-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary-600 text-white px-4 py-3">
        <h4 className="font-medium">Booking Summary</h4>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-neutral-600">Room</span>
          <span className="font-medium">{bookingSummary.room_type_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Check-in</span>
          <span>{bookingSummary.check_in}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Check-out</span>
          <span>{bookingSummary.check_out}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Guests</span>
          <span>
            {bookingSummary.adults} adult{bookingSummary.adults !== 1 ? 's' : ''}
            {bookingSummary.children ? `, ${bookingSummary.children} child` : ''}
          </span>
        </div>

        {/* Pricing */}
        {bookingSummary.pricing && (
          <>
            <hr className="my-2" />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">
                  ${bookingSummary.pricing.nightly_rate} × {bookingSummary.nights} nights
                </span>
                <span>${bookingSummary.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Taxes (12%)</span>
                <span>${bookingSummary.pricing.tax.toFixed(2)}</span>
              </div>
              {bookingSummary.pricing.service_fee !== undefined && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Service fee (5%)</span>
                  <span>${bookingSummary.pricing.service_fee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                <span>Total</span>
                <span className="text-primary-600">
                  ${bookingSummary.pricing.total.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Guest Info */}
        <div className="bg-neutral-50 rounded-lg p-3 mt-3">
          <div className="text-xs text-neutral-500 mb-1">Guest</div>
          <div className="text-sm font-medium">
            {guestInfo.first_name} {guestInfo.last_name}
          </div>
          <div className="text-xs text-neutral-600">{guestInfo.email}</div>
        </div>

        {/* Payment Options */}
        <div className="space-y-2 mt-4">
          <button
            onClick={handleProceed}
            disabled={processing || payLaterProcessing}
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <span className="animate-spin">⟳</span>
                Processing...
              </>
            ) : (
              <>
                Pay Now
                <span>→</span>
              </>
            )}
          </button>

          <button
            onClick={handlePayLater}
            disabled={processing || payLaterProcessing}
            className="w-full py-2.5 border border-primary-300 text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {payLaterProcessing ? (
              <>
                <span className="animate-spin">⟳</span>
                Reserving...
              </>
            ) : (
              <>
                Reserve Now, Pay at Hotel
              </>
            )}
          </button>

          <p className="text-xs text-neutral-500 text-center mt-2">
            Pay at hotel option holds your room with no upfront payment
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Booking Details Card
// ============================================================================

interface BookingDetailsCardProps {
  booking: Record<string, unknown>;
  onAction: (actionType: string) => void;
}

const BookingDetailsCard: React.FC<BookingDetailsCardProps> = ({ booking, onAction }) => {
  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
    checked_in: 'bg-blue-100 text-blue-700',
  };

  const status = booking.status as string || 'confirmed';

  return (
    <div className="mt-3 bg-white border border-neutral-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs text-neutral-500">Confirmation</div>
          <div className="font-mono font-semibold text-primary-600">
            {booking.confirmation_code as string}
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status] || statusColors.confirmed}`}>
          {status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-neutral-500">Check-in</div>
          <div>{booking.check_in as string}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Check-out</div>
          <div>{booking.check_out as string}</div>
        </div>
        {booking.room_type && (
          <div className="col-span-2">
            <div className="text-xs text-neutral-500">Room Type</div>
            <div>{booking.room_type as string}</div>
          </div>
        )}
      </div>

      {status !== 'cancelled' && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onAction('start_precheckin')}
            className="flex-1 py-2 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700"
          >
            Pre-Check-in
          </button>
          <button
            onClick={() => onAction('modify_booking')}
            className="flex-1 py-2 border border-neutral-300 rounded text-sm hover:bg-neutral-50"
          >
            Modify
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Bookings List Card
// ============================================================================

interface BookingsListCardProps {
  bookings: Array<Record<string, unknown>>;
  onSelect: (booking: Record<string, unknown>) => void;
}

const BookingsListCard: React.FC<BookingsListCardProps> = ({ bookings, onSelect }) => {
  if (bookings.length === 0) {
    return (
      <div className="mt-3 bg-neutral-50 rounded-lg p-4 text-center text-neutral-600">
        No bookings found
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
      {bookings.map((booking, idx) => (
        <div
          key={booking.id ?? booking.confirmation_code ?? idx}
          onClick={() => onSelect(booking)}
          className="bg-white border border-neutral-200 rounded-lg p-3 cursor-pointer hover:border-primary-300 transition-colors"
        >
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm font-medium text-primary-600">
              {booking.confirmation_code as string}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {(booking.status as string || '').replace('_', ' ')}
            </span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {booking.check_in as string} → {booking.check_out as string}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Pre-check-in Preferences Form
// ============================================================================

interface PrecheckinPreferencesFormProps {
  precheckinId: number;
  bookingInfo: Record<string, unknown>;
  onSubmit: (preferences: Record<string, string | boolean>) => void;
}

const PrecheckinPreferencesForm: React.FC<PrecheckinPreferencesFormProps> = ({
  precheckinId,
  bookingInfo,
  onSubmit,
}) => {
  const [floor, setFloor] = useState('any');
  const [view, setView] = useState('any');
  const [bed, setBed] = useState('any');
  const [arrivalTime, setArrivalTime] = useState('');
  const [earlyCheckin, setEarlyCheckin] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      floor_preference: floor,
      view_preference: view,
      bed_type_preference: bed,
      arrival_time: arrivalTime,
      early_check_in: earlyCheckin,
    });
  };

  return (
    <div className="mt-3 bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <div className="bg-primary-600 text-white px-4 py-3">
        <h4 className="font-medium">Room Preferences</h4>
        <p className="text-xs text-primary-100 mt-1">
          {bookingInfo?.room_type as string} • {bookingInfo?.arrival_date as string}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Floor Preference */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Floor Preference
          </label>
          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="any">No preference</option>
            <option value="low">Lower floors (1-3)</option>
            <option value="mid">Middle floors (4-7)</option>
            <option value="high">Higher floors (8+)</option>
          </select>
        </div>

        {/* View Preference */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            View Preference
          </label>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="any">No preference</option>
            <option value="ocean">Ocean view</option>
            <option value="city">City view</option>
            <option value="garden">Garden view</option>
            <option value="pool">Pool view</option>
          </select>
        </div>

        {/* Bed Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Bed Type
          </label>
          <select
            value={bed}
            onChange={(e) => setBed(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="any">No preference</option>
            <option value="king">King bed</option>
            <option value="queen">Queen bed</option>
            <option value="twin">Twin beds</option>
          </select>
        </div>

        {/* Arrival Time */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Expected Arrival Time
          </label>
          <input
            type="time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Early Check-in */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={earlyCheckin}
            onChange={(e) => setEarlyCheckin(e.target.checked)}
            className="rounded border-neutral-300"
          />
          <span className="text-sm text-neutral-700">
            Request early check-in (subject to availability)
          </span>
        </label>

        <button
          onClick={handleSubmit}
          className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Find My Perfect Room
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Pre-check-in Room Cards
// ============================================================================

interface PrecheckinRoomCardsProps {
  rooms: PrecheckinRoom[];
  precheckinId: number;
  onSelect: (room: PrecheckinRoom) => void;
}

const PrecheckinRoomCards: React.FC<PrecheckinRoomCardsProps> = ({
  rooms,
  precheckinId,
  onSelect,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (rooms.length === 0) {
    return (
      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
        No rooms currently available matching your preferences. Our staff will assign the best available room at check-in.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs text-neutral-500 mb-2">
        AI-recommended rooms based on your preferences:
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto">
        {rooms.map((room, idx) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedId === room.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300 bg-white'
            }`}
            onClick={() => setSelectedId(room.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Room {room.number}</span>
                  {idx === 0 && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                      Best Match
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  Floor {room.floor}
                  {room.view && ` • ${room.view} view`}
                  {room.bed_type && ` • ${room.bed_type}`}
                </div>
              </div>
              {room.ai_score && (
                <div className="text-right">
                  <div className="text-lg font-semibold text-primary-600">
                    {room.ai_score}%
                  </div>
                  <div className="text-xs text-neutral-500">match</div>
                </div>
              )}
            </div>

            {room.ai_reasoning && room.ai_reasoning.length > 0 && (
              <div className="mt-2 space-y-1">
                {room.ai_reasoning.slice(0, 2).map((reason, i) => (
                  <div key={i} className="text-xs text-green-600 flex items-center gap-1">
                    <span>✓</span> {reason}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            onClick={() => {
              const selected = rooms.find((r) => r.id === selectedId);
              if (selected) onSelect(selected);
            }}
          >
            Select Room {rooms.find((r) => r.id === selectedId)?.number}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Room Selected Card
// ============================================================================

interface RoomSelectedCardProps {
  selectedRoom: Record<string, unknown>;
  precheckinId: number;
  onComplete: () => void;
}

const RoomSelectedCard: React.FC<RoomSelectedCardProps> = ({
  selectedRoom,
  precheckinId,
  onComplete,
}) => {
  return (
    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-green-700 mb-2">
        <span className="text-xl">✓</span>
        <span className="font-medium">Room Selected</span>
      </div>
      <p className="text-sm text-green-600 mb-3">
        Room {selectedRoom.number as string} on floor {selectedRoom.floor as number} has been reserved for you.
      </p>
      <button
        onClick={onComplete}
        className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        Complete Pre-Check-in
      </button>
    </div>
  );
};

// ============================================================================
// Digital Key Card
// ============================================================================

interface DigitalKeyCardProps {
  digitalKey: string;
  roomNumber: string;
  checkInTime?: string;
}

const DigitalKeyCard: React.FC<DigitalKeyCardProps> = ({
  digitalKey,
  roomNumber,
  checkInTime,
}) => {
  return (
    <div className="mt-3 bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="text-center mb-4">
          <div className="text-sm opacity-80">Your Digital Key</div>
          <div className="text-3xl font-bold mt-1">Room {roomNumber}</div>
        </div>

        {/* QR Code Placeholder */}
        <div className="bg-white rounded-lg p-4 mx-auto w-32 h-32 flex items-center justify-center">
          <div className="text-center text-neutral-800">
            <div className="text-4xl mb-1">🔑</div>
            <div className="text-xs font-mono">{digitalKey}</div>
          </div>
        </div>

        <div className="text-center mt-4 text-sm">
          <div className="opacity-80">Pre-Check-in Complete!</div>
          {checkInTime && (
            <div className="mt-1">Check-in available from: {checkInTime}</div>
          )}
        </div>
      </div>

      <div className="bg-black/20 px-4 py-3 text-center text-xs">
        Show this at the front desk for express check-in
      </div>
    </div>
  );
};

// ============================================================================
// Success Card
// ============================================================================

interface SuccessCardProps {
  title: string;
  message: string;
  icon?: string;
}

const SuccessCard: React.FC<SuccessCardProps> = ({ title, message, icon = '✓' }) => {
  return (
    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
      <div className="text-3xl text-green-600 mb-2">{icon}</div>
      <div className="font-medium text-green-800">{title}</div>
      <div className="text-sm text-green-600 mt-1">{message}</div>
    </div>
  );
};

// ============================================================================
// Service Request Card
// ============================================================================

interface ServiceRequestCardProps {
  taskId: number;
  serviceType: string;
  title: string;
  estimatedResponse: string;
}

const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({
  taskId,
  serviceType,
  title,
  estimatedResponse,
}) => {
  const icons: Record<string, string> = {
    housekeeping: '🧹',
    maintenance: '🔧',
    room_service: '🍽️',
    concierge: '🛎️',
    laundry: '👔',
    spa: '💆',
    transport: '🚗',
  };

  return (
    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icons[serviceType] || '📋'}</div>
        <div className="flex-1">
          <div className="font-medium text-blue-800">{title}</div>
          <div className="text-sm text-blue-600 mt-1">
            Request #{taskId} submitted
          </div>
          <div className="text-xs text-blue-500 mt-2">
            Estimated response: {estimatedResponse}
          </div>
        </div>
        <div className="text-green-600 text-xl">✓</div>
      </div>
    </div>
  );
};

// ============================================================================
// Profile Card
// ============================================================================

interface ProfileCardProps {
  profile: Record<string, unknown>;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="mt-3 bg-white border border-neutral-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl">
          👤
        </div>
        <div>
          <div className="font-medium">{profile.full_name as string}</div>
          <div className="text-xs text-neutral-500">{profile.email as string}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {profile.phone && (
          <div>
            <span className="text-neutral-500">Phone:</span> {profile.phone as string}
          </div>
        )}
        {profile.loyalty_tier && (
          <div>
            <span className="text-neutral-500">Tier:</span>{' '}
            <span className="capitalize">{profile.loyalty_tier as string}</span>
          </div>
        )}
        {profile.loyalty_points !== undefined && (
          <div>
            <span className="text-neutral-500">Points:</span> {profile.loyalty_points as number}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Room Types Info Cards (informational, for browsing)
// ============================================================================

interface RoomTypesInfoCardsProps {
  roomTypes: RoomTypeOption[];
  onSelectForBooking: (room: RoomTypeOption) => void;
}

const RoomTypesInfoCards: React.FC<RoomTypesInfoCardsProps> = ({
  roomTypes,
  onSelectForBooking,
}) => {
  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs text-neutral-500 mb-2">
        Available room types at our hotel:
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {roomTypes.map((room) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg border border-neutral-200 bg-white"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900">{room.name}</h4>
                {room.description && (
                  <p className="text-xs text-neutral-600 mt-1 line-clamp-3">
                    {room.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {room.max_occupancy && (
                    <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded">
                      Up to {room.max_occupancy} guests
                    </span>
                  )}
                  {room.amenities && room.amenities.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right ml-3">
                <div className="text-lg font-semibold text-primary-600">
                  ${room.base_price}
                </div>
                <div className="text-xs text-neutral-500">/night</div>
              </div>
            </div>
            <button
              onClick={() => onSelectForBooking(room)}
              className="mt-3 w-full py-2 text-sm font-medium text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Book This Room
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Error Card
// ============================================================================

interface ErrorCardProps {
  message: string;
  details?: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ message, details }) => {
  return (
    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <span className="text-xl text-red-500">⚠️</span>
        <div>
          <div className="font-medium text-red-800">{message}</div>
          {details && (
            <div className="text-sm text-red-600 mt-1">{details}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Booking Confirmation Card
// ============================================================================

interface BookingConfirmationCardProps {
  booking: Record<string, unknown>;
  onStartPrecheckin: () => void;
}

const BookingConfirmationCard: React.FC<BookingConfirmationCardProps> = ({
  booking,
  onStartPrecheckin,
}) => {
  const pricing = booking.pricing as Record<string, number> | undefined;
  const guests = booking.guests as Record<string, number> | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-3 bg-white border border-green-200 rounded-lg overflow-hidden"
    >
      {/* Success Header */}
      <div className="bg-green-600 text-white px-4 py-3 text-center">
        <div className="text-2xl mb-1">✓</div>
        <h4 className="font-semibold text-lg">Booking Confirmed!</h4>
        <p className="text-sm text-green-100">Your reservation is complete</p>
      </div>

      {/* Confirmation Code */}
      <div className="bg-green-50 px-4 py-3 text-center border-b border-green-200">
        <div className="text-xs text-green-600 font-medium">CONFIRMATION CODE</div>
        <div className="font-mono text-2xl font-bold text-green-800 tracking-wider">
          {booking.confirmation_code as string}
        </div>
      </div>

      {/* Booking Details */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-neutral-600">Room</span>
          <span className="font-medium">{booking.room_type as string}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Check-in</span>
          <span>{booking.check_in as string}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Check-out</span>
          <span>{booking.check_out as string}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Duration</span>
          <span>{booking.nights as number} night{(booking.nights as number) !== 1 ? 's' : ''}</span>
        </div>
        {guests && (
          <div className="flex justify-between">
            <span className="text-neutral-600">Guests</span>
            <span>
              {guests.adults} adult{guests.adults !== 1 ? 's' : ''}
              {guests.children ? `, ${guests.children} child${guests.children !== 1 ? 'ren' : ''}` : ''}
            </span>
          </div>
        )}

        {/* Payment Status */}
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Payment</span>
          <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded text-sm font-medium">
            Pay at Hotel
          </span>
        </div>

        {/* Pricing */}
        {pricing && (
          <>
            <hr className="my-2" />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">
                  ${pricing.per_night} × {booking.nights as number} nights
                </span>
                <span>${pricing.base_total?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Taxes & fees</span>
                <span>${((pricing.taxes || 0) + (pricing.service_fee || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                <span>Total Due at Check-in</span>
                <span className="text-primary-600">
                  ${pricing.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Guest Info */}
        <div className="bg-neutral-50 rounded-lg p-3 mt-3">
          <div className="text-xs text-neutral-500 mb-1">Confirmation sent to</div>
          <div className="text-sm font-medium">{booking.guest_email as string}</div>
        </div>

        {/* Actions */}
        <div className="space-y-2 mt-4">
          <button
            onClick={onStartPrecheckin}
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>✈️</span>
            Start Pre-Check-in
          </button>
          <p className="text-xs text-neutral-500 text-center">
            Complete pre-check-in to select your room and skip the front desk
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatActionRenderer;
