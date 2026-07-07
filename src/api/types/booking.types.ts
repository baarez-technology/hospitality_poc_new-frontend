export interface Room {
  id: string;
  name: string;
  slug: string;
  number?: string; // Room number
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number; // Non-null when dynamic pricing applied a discount
  images: string[];
  amenities: string[];
  maxGuests: number;
  bedType: string;
  size: number;
  view: string;
  floor?: number; // Floor number
  status?: string; // Room status (clean, dirty, etc.)
  category?: 'standard' | 'deluxe' | 'suite' | 'presidential';
  features?: string[];
  rating?: number;
  reviewCount?: number;
  available?: boolean;
}

export interface BookingDraft {
  roomId: string;
  room?: Room;
  checkIn: Date;
  checkOut: Date;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  nights: number;
  basePrice: number;
  taxes: number;
  serviceFee: number;
  totalPrice: number;
}

export interface GuestInformation {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  address?: string;
  specialRequests?: string;
}

export interface PaymentInformation {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  guestInfo: GuestInformation;
  nights: number;
  basePrice: number;
  taxes: number;
  serviceFee: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  /** Non-blocking advisory when multiple guest profiles share the booking email */
  guestEmailDuplicateMessage?: string | null;
  // Group booking fields
  isGroupBooking?: boolean;
  groupBookingId?: number | null;
  parentBookingId?: number | null;
  numberOfRooms?: number | null;
  roomType?: string | null;
  roomTypeId?: number | null;
  roomNumber?: string | null;
  // QR Code payment reference (last 4 digits of UTR)
  paymentReference?: string | null;
}

export interface CreateBookingRequest {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  guestInfo: GuestInformation;
  paymentToken: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  paymentIntent?: {
    clientSecret: string;
  };
}

export interface CreateBookingData {
  roomId?: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  guestInfo: GuestInformation;
  paymentMethodId?: string;
  saveCard?: boolean;
  paymentMethod?: string;  // "card", "upi", "qr_code", "pay_at_hotel"
  paymentStatus?: string;  // "pending", "paid"
  // Pricing fields to ensure rate consistency
  basePrice?: number;
  taxes?: number;
  serviceFee?: number;
  totalPrice?: number;
  ratePerNight?: number;
  // QR Code payment reference (last 4 digits of UTR)
  paymentReference?: string;
  // Multi-room booking: array of room selections (snake_case to match backend)
  rooms?: Array<{
    room_type_id: number;
    adults?: number;
    children?: number;
    special_requests?: string;
    // Pricing fields for each room (backend uses for folio creation)
    rate_per_night?: number;
    subtotal?: number;
    taxes?: number;
    total?: number;
  }>;
}
