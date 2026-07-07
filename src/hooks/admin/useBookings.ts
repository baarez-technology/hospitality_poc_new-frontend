import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { bookingService, type CheckInData, type CheckOutData } from '@/api/services/booking.service';
import { roomsService } from '@/api/services/rooms.service';
import { clearApiCache } from '@/api/client';
import {
  bookingBillingService,
  type BillingCalculation,
} from '@/services/bookingBilling.service';
import { bookingNotificationsService } from '@/services/bookingNotifications.service';

// Interface for frontend booking representation
export interface AdminBooking {
  id: string;
  bookingNumber: string;
  guestId?: string | number | null;
  guest: string;
  guestEmail?: string;
  guestPhone?: string;
  guestAddress?: string;
  room: string;
  roomType: string;
  roomId?: number;
  roomTypeId?: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  adults: number;
  children?: number;
  status: string;
  source: string;
  total: number;
  amount: number;  // Alias for total for backward compatibility
  totalAmount?: number;
  // Pricing breakdown fields
  basePrice?: number;
  taxes?: number;
  serviceFee?: number;
  totalPrice?: number;
  deposit?: number;
  balance?: number;
  balanceDue?: number;
  specialRequests?: string;
  createdAt?: string;
  cancellationReason?: string;
  cancellationNotes?: string;
  vip?: boolean;
  email?: string;
  phone?: string;
  bookedOn?: string;
  // Payment fields
  paymentStatus?: string;
  payment_status?: string;
  paymentMethod?: string;
  payment_method?: string;
  amountPaid?: number;
  amount_paid?: number;
  depositAmount?: number;
  paymentNotes?: string;
  eta?: string;
  etd?: string;
  // Sprint 6 fields
  vipLevel?: number | null;
  guestProfileNumber?: string | null;
  accompanyingGuests?: any[] | null;
  arrivalDate?: string;
  departureDate?: string;
  // Corporate account
  corporateAccountId?: number | null;
  corporateAccountName?: string | null;
  gstNumber?: string | null;
  companyName?: string | null;
  companyAddress?: string | null;
  stayPurpose?: string | null;
  // Rate per night for billing calculations
  ratePerNight?: number;
  // Group booking
  isGroupBooking?: boolean;
  groupBookingId?: number | null;
  parentBookingId?: number | null;
  numberOfRooms?: number | null;
}

// Transform API booking to admin format
function transformBooking(apiBooking: any): AdminBooking {
  const checkInDate = new Date(apiBooking.arrival_date || apiBooking.checkIn);
  const checkOutDate = new Date(apiBooking.departure_date || apiBooking.checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  // Handle room which can be a string, number, or object from the API
  let roomNumber = 'Unassigned';
  let roomType = 'Standard';
  let roomId = apiBooking.room_id;

  if (apiBooking.room) {
    if (typeof apiBooking.room === 'object' && apiBooking.room !== null) {
      // Room is an object with properties like {id, name, number, slug, type, ...}
      // Only use room.number for the display number — room.name is often the type name (e.g., "Standard Single")
      roomNumber = apiBooking.room.number || 'Unassigned';
      roomId = roomId || apiBooking.room.id;
      // BUG-008 FIX: Extract room TYPE (not room name which includes number).
      // Prefer room.type field (direct from API), then strip room number from name as fallback.
      if (apiBooking.room.type) {
        // Use the type field directly from API (e.g., "Deluxe Room")
        roomType = apiBooking.room.type;
      } else if (apiBooking.room.name && apiBooking.room.number) {
        // Strip room number from name: "Wellness Suite 201" -> "Wellness Suite"
        roomType = apiBooking.room.name.replace(new RegExp(`\\s*${apiBooking.room.number}\\s*$`), '').trim() || apiBooking.room.name;
      } else {
        roomType = apiBooking.room.name || apiBooking.room_type_name || 'Standard';
      }
    } else {
      // Room is a string or number
      roomNumber = String(apiBooking.room);
    }
  } else if (apiBooking.room_number) {
    roomNumber = String(apiBooking.room_number);
  }

  // Handle room_type which can also be an object
  if (apiBooking.room_type) {
    if (typeof apiBooking.room_type === 'object' && apiBooking.room_type !== null) {
      roomType = apiBooking.room_type.name || apiBooking.room_type.slug || roomType;
    } else {
      roomType = String(apiBooking.room_type);
    }
  } else if (apiBooking.room_type_name) {
    roomType = apiBooking.room_type_name;
  } else if (apiBooking.roomType) {
    roomType = typeof apiBooking.roomType === 'object'
      ? apiBooking.roomType.name || 'Standard'
      : String(apiBooking.roomType);
  }

  // Extract guest name - handle both flat and nested guestInfo structure
  let guestName = 'Unknown Guest';
  let guestEmail = '';
  let guestPhone = '';

  if (apiBooking.guestInfo && typeof apiBooking.guestInfo === 'object') {
    // API returns guestInfo object with firstName, lastName
    const firstName = apiBooking.guestInfo.firstName || '';
    const lastName = apiBooking.guestInfo.lastName || '';
    guestName = `${firstName} ${lastName}`.trim() || 'Unknown Guest';
    guestEmail = apiBooking.guestInfo.email || '';
    guestPhone = apiBooking.guestInfo.phone || '';
  } else if (apiBooking.guest_name) {
    guestName = apiBooking.guest_name;
    guestEmail = apiBooking.guest_email || '';
    guestPhone = apiBooking.guest_phone || '';
  } else if (apiBooking.guest && typeof apiBooking.guest === 'string') {
    guestName = apiBooking.guest;
    guestEmail = apiBooking.guestEmail || '';
    guestPhone = apiBooking.guestPhone || '';
  }

  // Extract guests count - handle both flat and nested structure
  let adults = 1;
  let children = 0;
  if (apiBooking.guests && typeof apiBooking.guests === 'object') {
    adults = apiBooking.guests.adults || 1;
    children = apiBooking.guests.children || 0;
  } else {
    adults = apiBooking.adults || 1;
    children = apiBooking.children || 0;
  }

  // Extract total amount - API returns totalPrice
  const totalAmount = apiBooking.totalPrice || apiBooking.total_amount || apiBooking.total || 0;

  // Extract booking source - API returns bookingSource
  // Map source to normalized format (e.g., "crs" -> "CRS")
  const sourceMap: Record<string, string> = {
    'Website': 'Website',
    'direct': 'Website',
    'Dummy Channel Manager': 'Dummy Channel Manager',
    'dummy channel manager': 'Dummy Channel Manager',
    'DUMMY': 'Dummy Channel Manager',
    'dummy': 'Dummy Channel Manager',
    'CRS': 'Dummy Channel Manager',
    'crs': 'Dummy Channel Manager',
    'Booking.com': 'Booking.com',
    'booking.com': 'Booking.com',
    'Expedia': 'Expedia',
    'expedia': 'Expedia',
    'Walk-in': 'Walk-in',
    'walk_in': 'Walk-in',
    'walk-in': 'Walk-in',
    'OTA': 'OTA',  // Do NOT map to Booking.com - Dummy CM bookings use OTA; keep generic
  };
  const rawSource = apiBooking.bookingSource || apiBooking.booking_source || apiBooking.source || '';
  // If ota_code/channel/metadata indicates Dummy CM, use that (backend may wrongly return Booking.com for CM bookings)
  const otaCode = (apiBooking.ota_code || apiBooking.otaCode || apiBooking.channel_code || apiBooking.metadata?.ota || '').toString().toUpperCase();
  const channel = (apiBooking.channel || apiBooking.source_channel || apiBooking.metadata?.channel || '').toString().toLowerCase();
  const isDummyCM = otaCode === 'DUMMY' || otaCode === 'CRS' || channel.includes('dummy') || channel.includes('crs');
  const source = isDummyCM ? 'Dummy Channel Manager' : (rawSource ? (sourceMap[rawSource] || rawSource) : 'Website');

  // Extract special requests - check guestInfo first
  const specialRequests = apiBooking.guestInfo?.specialRequests ||
    apiBooking.special_requests ||
    apiBooking.specialRequests || '';

  return {
    id: String(apiBooking.id),
    bookingNumber: apiBooking.bookingNumber || apiBooking.booking_number || `BK-${apiBooking.id}`,
    guestId: apiBooking.guest_id || apiBooking.guestId || null,
    guest: guestName,
    guestEmail: guestEmail || apiBooking.guest_email || apiBooking.guestEmail || '',
    guestPhone: guestPhone || apiBooking.guest_phone || apiBooking.guestPhone || '',
    guestAddress: apiBooking.guestInfo?.address || apiBooking.guest_address || apiBooking.address || '',
    email: guestEmail || apiBooking.guest_email || apiBooking.guestEmail || '',
    phone: guestPhone || apiBooking.guest_phone || apiBooking.guestPhone || '',
    room: roomNumber,
    roomType: roomType,
    roomId: roomId,
    roomTypeId: apiBooking.roomTypeId || apiBooking.room_type_id || null,
    checkIn: apiBooking.checkIn || apiBooking.arrival_date,
    checkOut: apiBooking.checkOut || apiBooking.departure_date,
    nights,
    guests: adults + children,
    adults: adults,
    children: children,
    status: mapApiStatus(apiBooking.status),
    source: source,
    total: totalAmount,
    amount: totalAmount,  // Alias for backward compatibility
    totalAmount: totalAmount,
    totalPrice: totalAmount,
    // Pricing breakdown - API returns basePrice, taxes, serviceFee
    basePrice: apiBooking.basePrice || apiBooking.base_price || 0,
    taxes: apiBooking.taxes || 0,
    // Manual discount applied to the booking (₹ off the room subtotal)
    discountAmount: apiBooking.discountAmount ?? apiBooking.discount_amount ?? 0,
    discountCode: apiBooking.discountCode ?? apiBooking.discount_code ?? null,
    // Stored per-night rate (already reflects any rate-plan discount)
    nightly_rate: apiBooking.nightly_rate ?? apiBooking.ratePerNight ?? apiBooking.rate_per_night ?? null,
    serviceFee: apiBooking.serviceFee || apiBooking.service_fee || 0,
    deposit: apiBooking.deposit_amount || apiBooking.depositAmount || apiBooking.deposit || 0,
    depositAmount: apiBooking.deposit_amount || apiBooking.depositAmount || apiBooking.deposit || 0,
    balance: apiBooking.balance_due || apiBooking.balanceDue || apiBooking.balance,
    balanceDue: apiBooking.balance_due || apiBooking.balanceDue || apiBooking.balance,
    specialRequests: specialRequests,
    createdAt: apiBooking.createdAt || apiBooking.created_at,
    bookedOn: apiBooking.createdAt || apiBooking.created_at,
    vip: apiBooking.vipStatus || apiBooking.vip || false,
    // Payment fields - API returns amountPaid, backend stores as deposit_amount
    paymentStatus: apiBooking.paymentStatus || apiBooking.payment_status || 'pending',
    paymentMethod: apiBooking.paymentMethod || apiBooking.payment_method || '',
    amountPaid: apiBooking.amountPaid || apiBooking.amount_paid || apiBooking.deposit_amount || 0,
    paymentNotes: apiBooking.paymentNotes || apiBooking.payment_notes || '',
    doNotMove: apiBooking.doNotMove || apiBooking.do_not_move || false,
    dnmSetBy: apiBooking.dnmSetBy || apiBooking.dnm_set_by || null,
    dnmSetByName: apiBooking.dnmSetByName || apiBooking.dnm_set_by_name || null,
    dnmSetAt: apiBooking.dnmSetAt || apiBooking.dnm_set_at || null,
    checkedInAt: apiBooking.checkedInAt || apiBooking.checked_in_at || null,
    checkedOutAt: apiBooking.checkedOutAt || apiBooking.checked_out_at || null,
    eta: apiBooking.expectedArrivalTime || apiBooking.eta || apiBooking.arrival_time || '',
    etd: apiBooking.expectedDepartureTime || apiBooking.etd || apiBooking.departure_time || '',
    // Sprint 6
    vipLevel: apiBooking.vipLevel || apiBooking.vip_level || null,
    guestProfileNumber: apiBooking.guestProfileNumber || apiBooking.guest_profile_number || null,
    accompanyingGuests: apiBooking.accompanyingGuests || apiBooking.accompanying_guests || null,
    arrivalDate: apiBooking.arrivalDate || apiBooking.arrival_date || apiBooking.checkIn || '',
    departureDate: apiBooking.departureDate || apiBooking.departure_date || apiBooking.checkOut || '',
    // Corporate account
    corporateAccountId: apiBooking.corporateAccountId || apiBooking.corporate_account_id || null,
    corporateAccountName: apiBooking.corporateAccountName || apiBooking.corporate_account_name ||
      (apiBooking.corporateAccount?.company_name) || (apiBooking.corporate_account?.company_name) || null,
    gstNumber: apiBooking.gstNumber || apiBooking.gst_number || null,
    companyName: apiBooking.companyName || apiBooking.company_name || null,
    companyAddress: apiBooking.companyAddress || apiBooking.company_address || null,
    stayPurpose: apiBooking.stayPurpose || apiBooking.stay_purpose || null,
    // Rate per night - calculate from total/nights or use direct value
    ratePerNight: apiBooking.ratePerNight || apiBooking.rate_per_night ||
      (nights > 0 && totalAmount > 0 ? Math.round(totalAmount / nights) : 0),
    // Group booking — detect via API field or GRP- booking number prefix as fallback
    isGroupBooking: apiBooking.is_group_booking || apiBooking.isGroupBooking ||
      (apiBooking.booking_number || apiBooking.bookingNumber || '').startsWith('GRP-') || false,
    groupBookingId: apiBooking.group_booking_id || apiBooking.groupBookingId || null,
    parentBookingId: apiBooking.parent_booking_id || apiBooking.parentBookingId || null,
    numberOfRooms: apiBooking.number_of_rooms || apiBooking.numberOfRooms || null,
  };
}

// Map API status to frontend display status
function mapApiStatus(status: string): string {
  const statusMap: Record<string, string> = {
    booked: 'CONFIRMED',
    confirmed: 'CONFIRMED',
    checked_in: 'IN_HOUSE',
    'checked-in': 'IN_HOUSE',  // Handle hyphenated format from backend
    checked_out: 'COMPLETED',
    'checked-out': 'COMPLETED',  // Handle hyphenated format from backend
    cancelled: 'CANCELLED',
    no_show: 'NO_SHOW',
    'no-show': 'NO_SHOW',  // Handle hyphenated format from backend
  };
  return statusMap[status?.toLowerCase()] || status?.toUpperCase() || 'PENDING';
}

// Map frontend status back to API status
// Backend accepts: booked, checked_in, checked_out, cancelled, no_show
function mapFrontendStatus(status: string): string {
  const statusMap: Record<string, string> = {
    CONFIRMED: 'booked',      // Backend uses 'booked' not 'confirmed'
    PENDING: 'booked',
    IN_HOUSE: 'checked_in',
    'CHECKED-IN': 'checked_in',  // Handle legacy format
    COMPLETED: 'checked_out',
    'CHECKED-OUT': 'checked_out',  // Handle legacy format
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
  };
  return statusMap[status] || status.toLowerCase().replace('-', '_');
}

// Extract error message from FastAPI error response
function extractErrorMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;

  if (Array.isArray(detail)) {
    // FastAPI validation errors: [{type, loc, msg, input}, ...]
    return detail.map((e: any) => e.msg || e.message || String(e)).join(', ');
  } else if (typeof detail === 'string') {
    return detail;
  } else if (typeof detail === 'object' && detail.msg) {
    return detail.msg;
  }
  return fallback;
}

/**
 * Hook for managing admin bookings with real API integration
 */
export function useBookings(initialPageSize = 20) {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isCreatingRef = useRef(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 1,
  });

  /**
   * Fetch bookings from API with server-side pagination
   */
  const fetchBookings = useCallback(async (page = 1, pageSize = initialPageSize, status?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      clearApiCache('/api/v1/bookings');

      const response = await bookingService.getBookings(page, pageSize, status);

      // Handle both paginated and array responses
      let bookingsData: any[] = [];
      let total = 0;
      let totalPages = 1;

      console.log('[useBookings.fetchBookings] Raw API response:', response);

      if (Array.isArray(response)) {
        bookingsData = response;
        total = response.length;
        totalPages = 1;
      } else if (response && typeof response === 'object') {
        // Try common paginated response keys
        const list = response.items ?? response.results ?? response.bookings ?? response.data;
        if (Array.isArray(list)) {
          bookingsData = list;
          total = response.total ?? response.count ?? response.totalCount ?? list.length;
          totalPages = response.totalPages ?? response.total_pages ?? Math.ceil(total / pageSize);
        } else if (Array.isArray(response.data?.items)) {
          // Nested: { data: { items: [...], total: N } }
          bookingsData = response.data.items;
          total = response.data.total ?? response.data.count ?? bookingsData.length;
          totalPages = response.data.totalPages ?? Math.ceil(total / pageSize);
        }
      }

      const transformedBookings = bookingsData.map(transformBooking);

      setBookings(transformedBookings);
      setPagination({ page, pageSize, total, totalPages });
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /**
   * Create a new booking
   */
  const createBooking = useCallback(async (bookingData: any) => {
    // Prevent duplicate API calls at the hook level
    if (isCreatingRef.current) {
      console.warn('[useBookings.createBooking] Already creating a booking, ignoring duplicate call');
      return null;
    }
    isCreatingRef.current = true;
    try {
      // Parse guest name into first/last name
      let firstName = '';
      let lastName = '';
      if (bookingData.guest) {
        const nameParts = bookingData.guest.trim().split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      } else {
        firstName = bookingData.firstName || '';
        lastName = bookingData.lastName || '';
      }

      // Convert room type name to slug format (e.g., "Standard" -> "standard", "Wellness Suite" -> "wellness-suite")
      const roomTypeSlug = (bookingData.roomType || 'standard').toLowerCase().replace(/\s+/g, '-');

      // Transform frontend data to API format matching CreateBookingRequest schema
      const apiData: any = {
        roomId: roomTypeSlug,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: {
          adults: bookingData.adults || 1,
          children: bookingData.children || 0,
          infants: bookingData.infants || 0,
        },
        guestInfo: {
          firstName: firstName,
          lastName: lastName,
          email: bookingData.email || '',
          phone: bookingData.phone || '',
          country: bookingData.nationality || bookingData.country || 'Unknown',
          specialRequests: bookingData.specialRequests || '',
        },
        paymentMethod: bookingData.paymentMethod || 'card',
      };

      // Optional arrival/departure times (ETA/ETD) for operational planning
      if (bookingData.eta) {
        apiData.expectedArrivalTime = bookingData.eta;
      }
      if (bookingData.etd) {
        apiData.expectedDepartureTime = bookingData.etd;
      }
      // Sprint 6: accompanying guests
      if (bookingData.accompanyingGuests) {
        apiData.accompanyingGuests = bookingData.accompanyingGuests;
      }

      // Include booking source if provided
      if (bookingData.source) {
        apiData.source = bookingData.source;
      }

      // Corporate account linkage
      if (bookingData.corporateAccountId) {
        apiData.corporateAccountId = bookingData.corporateAccountId;
      }

      // GST number linkage
      if (bookingData.gstNumber) {
        apiData.gstNumber = bookingData.gstNumber;
      }

      // Company details for GST invoicing
      if (bookingData.companyName) {
        apiData.companyName = bookingData.companyName;
      }
      if (bookingData.companyAddress) {
        apiData.companyAddress = bookingData.companyAddress;
      }

      // VIP flag
      if (bookingData.isVip || bookingData.vip) {
        apiData.vipStatus = true;
      }

      // Rate plan name (for backend rate lookup)
      if (bookingData.ratePlan) {
        apiData.ratePlan = bookingData.ratePlan;
      }

      // Include pricing breakdown from frontend calculation
      if (bookingData.basePrice && bookingData.basePrice > 0) {
        apiData.basePrice = bookingData.basePrice;
      }
      if (bookingData.taxes && bookingData.taxes > 0) {
        apiData.taxes = bookingData.taxes;
      }
      if (bookingData.serviceFee && bookingData.serviceFee > 0) {
        apiData.serviceFee = bookingData.serviceFee;
      }
      if (bookingData.totalPrice && bookingData.totalPrice > 0) {
        apiData.totalPrice = bookingData.totalPrice;
      }
      if (bookingData.ratePerNight && bookingData.ratePerNight > 0) {
        apiData.ratePerNight = bookingData.ratePerNight;
      }
      // Manual discount applied by staff at booking time
      if (bookingData.discountAmount && bookingData.discountAmount > 0) {
        apiData.discountAmount = bookingData.discountAmount;
      }

      // Multi-room booking: include rooms array (uses snake_case to match backend)
      if (bookingData.rooms && Array.isArray(bookingData.rooms) && bookingData.rooms.length > 1) {
        apiData.rooms = bookingData.rooms;
      }

      const result = await bookingService.createBooking(apiData);
      const newBooking = transformBooking(result);

      // Don't optimistically add to local state — SSE will trigger fetchBookings()
      // which replaces the array. Adding here causes duplicates due to race condition.
      // Instead, explicitly re-fetch to ensure single source of truth.
      await fetchBookings(pagination.page, pagination.pageSize);

      toast.success('Booking created successfully');
      return newBooking;
    } catch (err: any) {
      console.error('Error creating booking:', err);
      toast.error(extractErrorMessage(err, 'Failed to create booking'));
      throw err;
    } finally {
      isCreatingRef.current = false;
    }
  }, [fetchBookings, pagination.page, pagination.pageSize]);

  /**
   * Update an existing booking
   * Handles billing recalculation and email notifications when dates change
   */
  const updateBooking = useCallback(async (bookingId: string, updates: Partial<AdminBooking> & { guestInfo?: any, guests?: any }) => {
    // Find current booking to detect date changes
    const currentBooking = bookings.find(b => b.id === bookingId);
    const oldDates = currentBooking ? {
      checkIn: currentBooking.checkIn,
      checkOut: currentBooking.checkOut,
    } : null;

    // Extract local updates to apply immediately (optimistic update)
    const localUpdates: Partial<AdminBooking> = {};
    if (updates.paymentStatus !== undefined) localUpdates.paymentStatus = updates.paymentStatus;
    if (updates.paymentMethod !== undefined) localUpdates.paymentMethod = updates.paymentMethod;
    if (updates.amountPaid !== undefined) localUpdates.amountPaid = updates.amountPaid;
    if (updates.paymentNotes !== undefined) localUpdates.paymentNotes = updates.paymentNotes;
    if (updates.status !== undefined) localUpdates.status = updates.status;
    if (updates.specialRequests !== undefined) localUpdates.specialRequests = updates.specialRequests;
    if (updates.eta !== undefined) localUpdates.eta = updates.eta;
    if (updates.etd !== undefined) localUpdates.etd = updates.etd;

    // Apply optimistic update immediately for better UX
    if (Object.keys(localUpdates).length > 0) {
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, ...localUpdates } : b
      ));
    }

    try {
      // Transform frontend updates to API format
      const apiUpdates: any = {};

      // Handle dates
      if (updates.checkIn) apiUpdates.checkIn = updates.checkIn;
      if (updates.checkOut) apiUpdates.checkOut = updates.checkOut;

      // Handle guest counts - accept both flat and nested format
      if (updates.guests && typeof updates.guests === 'object') {
        apiUpdates.guests = {
          adults: updates.guests.adults || 1,
          children: updates.guests.children || 0,
        };
      } else if (updates.adults !== undefined || updates.children !== undefined) {
        apiUpdates.guests = {
          adults: updates.adults || 1,
          children: updates.children || 0,
        };
      }

      // Handle guest info - accept both flat and nested format
      if (updates.guestInfo && typeof updates.guestInfo === 'object') {
        apiUpdates.guestInfo = {
          firstName: updates.guestInfo.firstName || '',
          lastName: updates.guestInfo.lastName || '',
          email: updates.guestInfo.email || '',
          phone: updates.guestInfo.phone || '',
          country: updates.guestInfo.country || '',
          specialRequests: updates.guestInfo.specialRequests || updates.specialRequests || '',
        };
      } else if (updates.guest) {
        // Parse guest name from flat format
        const nameParts = updates.guest.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        apiUpdates.guestInfo = {
          firstName,
          lastName,
          email: updates.guestEmail || updates.email || '',
          phone: updates.guestPhone || updates.phone || '',
          country: '',
          specialRequests: updates.specialRequests || '',
        };
      }

      // Handle special requests
      if (updates.specialRequests && !apiUpdates.guestInfo) {
        apiUpdates.specialRequests = updates.specialRequests;
      }

      // Handle room assignment
      if (updates.roomId) apiUpdates.roomId = String(updates.roomId);

      // Handle status
      if (updates.status) apiUpdates.status = mapFrontendStatus(updates.status);

      // Handle booking source
      if (updates.source) apiUpdates.source = updates.source;

      // Handle payment fields
      if (updates.paymentStatus) apiUpdates.paymentStatus = updates.paymentStatus;
      if (updates.paymentMethod) apiUpdates.paymentMethod = updates.paymentMethod;
      if (updates.amountPaid !== undefined) apiUpdates.amountPaid = updates.amountPaid;
      if (updates.paymentNotes !== undefined) apiUpdates.paymentNotes = updates.paymentNotes;

      if (updates.eta !== undefined) apiUpdates.expectedArrivalTime = updates.eta;
      if (updates.etd !== undefined) apiUpdates.expectedDepartureTime = updates.etd;
      if ((updates as any).vipLevel !== undefined) apiUpdates.vipLevel = (updates as any).vipLevel;
      if ((updates as any).accompanyingGuests !== undefined) apiUpdates.accompanyingGuests = (updates as any).accompanyingGuests;
      if ((updates as any).corporateAccountId !== undefined) apiUpdates.corporateAccountId = (updates as any).corporateAccountId;
      if ((updates as any).gstNumber !== undefined) apiUpdates.gstNumber = (updates as any).gstNumber;
      if ((updates as any).companyName !== undefined) apiUpdates.companyName = (updates as any).companyName;
      if ((updates as any).companyAddress !== undefined) apiUpdates.companyAddress = (updates as any).companyAddress;
      if ((updates as any).stayPurpose !== undefined) apiUpdates.stayPurpose = (updates as any).stayPurpose;

      // Include billing fields if provided (for recalculation scenarios)
      if ((updates as any).basePrice !== undefined) apiUpdates.basePrice = (updates as any).basePrice;
      if ((updates as any).taxes !== undefined) apiUpdates.taxes = (updates as any).taxes;
      if ((updates as any).serviceFee !== undefined) apiUpdates.serviceFee = (updates as any).serviceFee;
      if ((updates as any).totalPrice !== undefined) apiUpdates.totalPrice = (updates as any).totalPrice;
      if ((updates as any).ratePerNight !== undefined) apiUpdates.ratePerNight = (updates as any).ratePerNight;
      // Manual discount (₹ off the room subtotal) — applied/edited post-booking
      if ((updates as any).discountAmount !== undefined) apiUpdates.discountAmount = (updates as any).discountAmount;
      if ((updates as any).discountCode !== undefined) apiUpdates.discountCode = (updates as any).discountCode;

      const result = await bookingService.updateBooking(bookingId, apiUpdates);
      const updatedBooking = transformBooking(result);

      // Merge API result with local updates (local updates take precedence for payment fields)
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, ...updatedBooking, ...localUpdates } : b
      ));

      // Clear folio cache so folio data is refreshed when folio drawer opens
      clearApiCache('/folios');
      clearApiCache(`/bookings/${bookingId}/folios`);

      // Check if dates changed - sync folio and send notification
      const newDates = {
        checkIn: updates.checkIn || oldDates?.checkIn || '',
        checkOut: updates.checkOut || oldDates?.checkOut || '',
      };

      if (oldDates && (updates.checkIn || updates.checkOut)) {
        const dateChange = bookingBillingService.haveDatesChanged(oldDates, newDates);

        if (dateChange.anyChanged) {
          // NOTE: Folio sync is now handled by backend in update_booking endpoint
          // via _sync_folio_on_date_change function. No need to call syncFolioCharges here.
          console.log('[updateBooking] Dates changed - folio sync handled by backend');

          // Send email notification for date change (runs in background)
          if (currentBooking?.guestId) {
            const oldNights = bookingBillingService.calculateNights(oldDates.checkIn, oldDates.checkOut);
            const newNights = bookingBillingService.calculateNights(newDates.checkIn, newDates.checkOut);

            bookingNotificationsService.sendDateChangeNotification(
              {
                id: bookingId,
                bookingNumber: updatedBooking.bookingNumber,
                guestId: currentBooking.guestId,
                guestName: updatedBooking.guest,
                guestEmail: updatedBooking.email,
                checkIn: newDates.checkIn,
                checkOut: newDates.checkOut,
                roomType: updatedBooking.roomType,
                room: updatedBooking.room,
                nights: newNights,
                totalPrice: updatedBooking.totalPrice || updatedBooking.total,
              },
              {
                oldCheckIn: oldDates.checkIn,
                oldCheckOut: oldDates.checkOut,
                newCheckIn: newDates.checkIn,
                newCheckOut: newDates.checkOut,
                oldNights,
                newNights,
              }
            ).then(notifResult => {
              if (notifResult.emailSent) {
                toast.success('Guest notified of date change via email');
              }
            }).catch(err => {
              console.warn('[updateBooking] Email notification failed:', err);
            });
          }
        }
      }

      toast.success('Booking updated successfully');
      return { ...updatedBooking, ...localUpdates };
    } catch (err: any) {
      console.error('Error updating booking:', err);
      toast.error(extractErrorMessage(err, 'Failed to sync with server. Changes saved locally.'));
      return localUpdates;
    }
  }, [bookings]);

  /**
   * Update booking status
   */
  const updateStatus = useCallback(async (bookingId: string, newStatus: string) => {
    try {
      const apiStatus = mapFrontendStatus(newStatus);
      console.log('[useBookings.updateStatus] Updating status:', { bookingId, newStatus, apiStatus });

      // Use specific endpoints for check-in/check-out
      if (newStatus === 'IN_HOUSE' || newStatus === 'CHECKED-IN' || apiStatus === 'checked_in') {
        await bookingService.checkIn(bookingId);
      } else if (newStatus === 'COMPLETED' || newStatus === 'CHECKED-OUT' || apiStatus === 'checked_out') {
        await bookingService.checkOut(bookingId);
      } else {
        await bookingService.updateBooking(bookingId, { status: apiStatus });
      }

      // Normalize status for frontend display
      const displayStatus = newStatus === 'CHECKED-IN' ? 'IN_HOUSE' :
                           newStatus === 'CHECKED-OUT' ? 'COMPLETED' : newStatus;

      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: displayStatus } : b
      ));

      toast.success('Status updated successfully');
      return true;
    } catch (err: any) {
      console.error('[useBookings.updateStatus] Error:', err);
      toast.error(extractErrorMessage(err, 'Failed to update status'));
      return false;
    }
  }, []);

  /**
   * Cancel a booking with reason and notes
   */
  const cancelBooking = useCallback(async (bookingId: string, reason?: string, notes?: string) => {
    try {
      // Pass reason and notes to the API
      await bookingService.cancelBooking(bookingId, reason, notes);

      setBookings(prev => prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: 'CANCELLED',
              cancellationReason: reason,
              cancellationNotes: notes,
            }
          : b
      ));

      toast.success('Booking cancelled successfully.');
      return true;
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      toast.error(extractErrorMessage(err, 'Failed to cancel booking'));
      return false;
    }
  }, []);

  /**
   * Assign room to booking
   */
  const assignRoom = useCallback(async (bookingId: string, roomId: number | string, roomNumber: string, checkIn?: string) => {
    try {
      console.log('[useBookings.assignRoom] Assigning room:', { bookingId, roomId, roomNumber, checkIn });

      // Find the booking to check current state
      const currentBooking = bookings.find(b => b.id === bookingId);
      const previousRoomId = currentBooking?.roomId;

      // Send both camelCase and snake_case — backend may accept either
      const result = await bookingService.updateBooking(bookingId, { roomId: String(roomId), room_id: Number(roomId) } as any);
      console.log('[useBookings.assignRoom] Update result:', result);
      console.log('[useBookings.assignRoom] API response:', result);

      // Sync room status so Room module reflects the assignment
      try {
        await roomsService.updateRoomStatus(roomId, 'occupied');
        console.log('[useBookings.assignRoom] New room status synced to occupied');
      } catch (roomErr) {
        console.warn('[useBookings.assignRoom] Could not sync room status:', roomErr);
      }

      // If reassigning (guest had a previous room), free the old room
      if (previousRoomId && String(previousRoomId) !== String(roomId)) {
        try {
          await roomsService.updateRoomStatus(previousRoomId, 'dirty');
          console.log('[useBookings.assignRoom] Previous room set to dirty:', previousRoomId);
        } catch (roomErr) {
          console.warn('[useBookings.assignRoom] Could not free previous room:', roomErr);
        }
      }

      // Update local state immediately for instant UI feedback
      setBookings(prev => prev.map(b =>
        b.id === bookingId
          ? { ...b, roomId: Number(roomId), room: roomNumber }
          : b
      ));

      // Clear all caches so Rooms + Housekeeping modules pick up the assignment
      clearApiCache('/api/v1/rooms');
      clearApiCache('/rooms');
      clearApiCache('/api/v1/housekeeping');
      clearApiCache('/api/v1/bookings');
      clearApiCache('/bookings');

      // Re-fetch bookings from backend to ensure full sync
      await fetchBookings(pagination.page, pagination.pageSize);

      toast.success(`Room ${roomNumber} assigned successfully`);
      return true;
    } catch (err: any) {
      console.error('[useBookings.assignRoom] Error:', err);
      toast.error(extractErrorMessage(err, 'Failed to assign room'));
      return false;
    }
  }, [bookings, fetchBookings, pagination.page, pagination.pageSize]);

  /**
   * Check-in guest
   */
  const checkInGuest = useCallback(async (bookingId: string, data?: CheckInData) => {
    try {
      const updatedBooking = await bookingService.checkIn(bookingId, data);

      // Transform and update the booking with full data from API response
      const transformed = transformBooking(updatedBooking);
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? transformed : b
      ));

      // Clear rooms cache so Rooms page reflects updated occupancy status
      clearApiCache('/api/v1/rooms');
      clearApiCache('/rooms');

      toast.success('Guest checked in successfully');
      return true;
    } catch (err: any) {
      console.error('Error checking in:', err);
      toast.error(extractErrorMessage(err, 'Failed to check in'));
      return false;
    }
  }, []);

  /**
   * Check-out guest
   */
  const checkOutGuest = useCallback(async (bookingId: string, data?: CheckOutData) => {
    try {
      const updatedBooking = await bookingService.checkOut(bookingId, data);

      // Transform and update the booking with full data from API response
      const transformed = transformBooking(updatedBooking);
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? transformed : b
      ));

      // Clear caches so Rooms and Bookings pages reflect updated status
      clearApiCache('/api/v1/rooms');
      clearApiCache('/rooms');
      clearApiCache('/api/v1/bookings');
      clearApiCache('/bookings');

      toast.success('Guest checked out successfully');
      return transformed;
    } catch (err: any) {
      console.error('Error checking out:', err);
      toast.error(extractErrorMessage(err, 'Failed to check out'));
      return null;
    }
  }, []);

  /**
   * Cancel check-in (revert checked-in guest back to confirmed/arrival status)
   */
  const cancelCheckIn = useCallback(async (bookingId: string) => {
    try {
      const updatedBooking = await bookingService.cancelCheckIn(bookingId);

      // Transform and update the booking with full data from API response
      const transformed = transformBooking(updatedBooking);
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? transformed : b
      ));

      // Clear rooms cache so Rooms page reflects freed room
      clearApiCache('/api/v1/rooms');
      clearApiCache('/rooms');

      toast.success('Check-in cancelled. Booking reverted to confirmed status.');
      return true;
    } catch (err: any) {
      console.error('Error cancelling check-in:', err);
      toast.error(extractErrorMessage(err, 'Failed to cancel check-in'));
      return false;
    }
  }, []);

  /**
   * Room move for checked-in guest (uses room-change endpoint)
   */
  const moveRoom = useCallback(async (bookingId: string, newRoomId: number, reason?: string) => {
    try {
      const result = await bookingService.changeRoom(bookingId, {
        new_room_id: newRoomId,
        reason: reason || 'Room move requested by staff',
      });

      // Refresh bookings to get updated data
      await fetchBookings(pagination.page, pagination.pageSize);

      // Clear rooms cache so Room module reflects the move
      clearApiCache('/api/v1/rooms');
      clearApiCache('/rooms');

      toast.success(`Room moved to ${result.new_room} successfully`);
      return result;
    } catch (err: any) {
      console.error('Error moving room:', err);
      toast.error(extractErrorMessage(err, 'Failed to move room'));
      return null;
    }
  }, [fetchBookings, pagination.page, pagination.pageSize]);

  /**
   * Mark booking as No Show
   */
  const markNoShow = useCallback(async (bookingId: string) => {
    try {
      await bookingService.markNoShow(bookingId);

      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'NO_SHOW' } : b
      ));

      // Clear rooms cache so Rooms page reflects freed room
      clearApiCache('/api/v1/rooms');
      clearApiCache('/rooms');

      toast.success('Booking marked as No Show');
      return true;
    } catch (err: any) {
      console.error('Error marking no-show:', err);
      toast.error(extractErrorMessage(err, 'Failed to mark as no-show'));
      return false;
    }
  }, []);

  const reinstate = useCallback(async (bookingId: string) => {
    try {
      await bookingService.reinstate(bookingId);

      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b
      ));

      toast.success('Booking reinstated');
      return true;
    } catch (err: any) {
      console.error('Error reinstating booking:', err);
      toast.error(extractErrorMessage(err, 'Failed to reinstate booking'));
      return false;
    }
  }, []);

  /**
   * Refresh bookings data
   */
  const refreshBookings = useCallback(async () => {
    await fetchBookings(pagination.page, pagination.pageSize);
  }, [fetchBookings, pagination.page, pagination.pageSize]);

  /**
   * Go to a specific page (server-side pagination)
   */
  const goToPage = useCallback(async (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    await fetchBookings(page, pagination.pageSize);
  }, [fetchBookings, pagination.pageSize, pagination.totalPages]);

  /**
   * Go to next page
   */
  const nextPage = useCallback(async () => {
    if (pagination.page < pagination.totalPages) {
      await fetchBookings(pagination.page + 1, pagination.pageSize);
    }
  }, [fetchBookings, pagination.page, pagination.pageSize, pagination.totalPages]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(async () => {
    if (pagination.page > 1) {
      await fetchBookings(pagination.page - 1, pagination.pageSize);
    }
  }, [fetchBookings, pagination.page, pagination.pageSize]);

  /**
   * Change page size
   */
  const setPageSize = useCallback(async (newPageSize: number) => {
    await fetchBookings(1, newPageSize);
  }, [fetchBookings]);

  /**
   * Get today's date in local timezone (YYYY-MM-DD format)
   */
  const getLocalToday = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  /**
   * Get arrivals for today (using local timezone)
   */
  const getArrivalsToday = useCallback(() => {
    const today = getLocalToday();
    return bookings.filter(b => b.checkIn === today);
  }, [bookings, getLocalToday]);

  /**
   * Get departures for today (using local timezone)
   */
  const getDeparturesToday = useCallback(() => {
    const today = getLocalToday();
    return bookings.filter(b => b.checkOut === today);
  }, [bookings, getLocalToday]);

  /**
   * Permanently delete a booking (devmaster only).
   * Removes the row from local state immediately, then calls the API.
   */
  const deleteBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    try {
      await bookingService.deleteBooking(bookingId);
      // Remove from local state immediately
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      toast.success('Booking permanently deleted.');
      return true;
    } catch (err: any) {
      console.error('[useBookings.deleteBooking] Error:', err);
      toast.error(extractErrorMessage(err, 'Failed to delete booking'));
      return false;
    }
  }, []);

  return {
    bookings,
    isLoading,
    error,
    pagination,
    // Data fetching
    fetchBookings,
    refreshBookings,
    // Pagination controls (server-side)
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    // CRUD operations
    createBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    // Status operations
    updateStatus,
    assignRoom,
    checkInGuest,
    checkOutGuest,
    cancelCheckIn,
    moveRoom,
    markNoShow,
    reinstate,
    // Helpers
    getArrivalsToday,
    getDeparturesToday,
  };
}
