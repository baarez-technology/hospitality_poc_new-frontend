/**
 * Booking Utility Functions
 * Handles filtering, sorting, CSV export, and booking calculations
 */

// Status configurations
export const STATUS_CONFIG = {
  'PENDING': {
    label: 'Pending',
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]',
    borderColor: 'border-[#CDB261]/30',
  },
  'CONFIRMED': {
    label: 'Confirmed',
    bgColor: 'bg-[#4E5840]/15',
    textColor: 'text-[#4E5840]',
    borderColor: 'border-[#4E5840]/30',
  },
  'CHECKED-IN': {
    label: 'Checked-in',
    bgColor: 'bg-[#5C9BA4]/15',
    textColor: 'text-[#5C9BA4]',
    borderColor: 'border-[#5C9BA4]/30',
  },
  'CHECKED-OUT': {
    label: 'Completed',
    bgColor: 'bg-[#A57865]/15',
    textColor: 'text-[#A57865]',
    borderColor: 'border-[#A57865]/30',
  },
  'CANCELLED': {
    label: 'Cancelled',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
};

// Source configurations
export const SOURCE_CONFIG = {
  'OTA': {
    label: 'OTA',
    bgColor: 'bg-[#A57865]/10',
    textColor: 'text-[#A57865]',
  },
  'Booking.com': {
    label: 'Booking.com',
    bgColor: 'bg-[#A57865]/10',
    textColor: 'text-[#A57865]',
  },
  'Expedia': {
    label: 'Expedia',
    bgColor: 'bg-[#A57865]/10',
    textColor: 'text-[#A57865]',
  },
  'Direct': {
    label: 'Direct',
    bgColor: 'bg-[#5C9BA4]/10',
    textColor: 'text-[#5C9BA4]',
  },
  'Corporate': {
    label: 'Corporate',
    bgColor: 'bg-[#4E5840]/10',
    textColor: 'text-[#4E5840]',
  },
  'Website': {
    label: 'Website',
    bgColor: 'bg-[#CDB261]/10',
    textColor: 'text-[#CDB261]',
  },
  'CRS': {
    label: 'CRS',
    bgColor: 'bg-[#7B68EE]/10',
    textColor: 'text-[#7B68EE]',
  },
  'Dummy Channel Manager': {
    label: 'Dummy Channel Manager',
    bgColor: 'bg-[#7B68EE]/10',
    textColor: 'text-[#7B68EE]',
  },
  'Walk-in': {
    label: 'Walk-in',
    bgColor: 'bg-[#C8B29D]/10',
    textColor: 'text-[#C8B29D]',
  },
};

// Room type options - matches database room types
export const ROOM_TYPES = [
  { value: 'Minimalist Studio', label: 'Minimalist Studio', price: 150 },
  { value: 'Coastal Retreat', label: 'Coastal Retreat', price: 199 },
  { value: 'Urban Oasis', label: 'Urban Oasis', price: 245 },
  { value: 'Sunset Vista', label: 'Sunset Vista', price: 315 },
  { value: 'Pacific Suite', label: 'Pacific Suite', price: 385 },
  { value: 'Wellness Suite', label: 'Wellness Suite', price: 425 },
  { value: 'Family Sanctuary', label: 'Family Sanctuary', price: 485 },
  { value: 'Oceanfront Penthouse', label: 'Oceanfront Penthouse', price: 750 },
];

// Source options
export const SOURCE_OPTIONS = ['Website', 'Dummy Channel Manager', 'CRS', 'Booking.com', 'Expedia', 'Walk-in', 'Direct', 'Corporate', 'OTA'];

// Cancellation reasons
export const CANCELLATION_REASONS = [
  { value: 'guest_request', label: 'Guest Request' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'overbooking', label: 'Overbooking' },
  { value: 'no_show', label: 'No-show' },
  { value: 'other', label: 'Other' },
];

// Generate unique booking ID
export function generateBookingId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BK-${year}-${randomNum}`;
}

// Calculate nights between dates
export function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
  return diff;
}

// SST: Import centralized pricing
import { calculateRoomPrice } from '@/utils/pricing-sst';

// Calculate booking amount - DELEGATES TO SST
export function calculateBookingAmount(roomType, nights, taxRate?: number) {
  const roomTypeConfig = ROOM_TYPES.find(r => r.value === roomType);
  const baseRate = roomTypeConfig?.price || 150;

  // SST: Use centralized pricing function
  const pricing = calculateRoomPrice(baseRate, nights);

  return {
    baseRate,
    subtotal: pricing.baseAmount,
    taxes: pricing.taxAmount,
    total: pricing.totalAmount,
  };
}

// Format currency - prefer using useCurrency hook in components for dynamic currency
export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format date for display
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format date short
export function formatDateShort(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Filter bookings by status
export function filterByStatus(bookings, status) {
  if (!status || status === 'all') return bookings;
  return bookings.filter(b => b.status === status);
}

// Filter bookings by source
export function filterBySource(bookings, source) {
  if (!source || source === 'all') return bookings;
  return bookings.filter(b => b.source === source);
}

// Filter bookings by room type
export function filterByRoomType(bookings, roomType) {
  if (!roomType || roomType === 'all') return bookings;
  return bookings.filter(b => b.roomType === roomType);
}

// Filter bookings by date range
export function filterByDateRange(bookings, startDate, endDate) {
  if (!startDate && !endDate) return bookings;

  return bookings.filter(booking => {
    const checkIn = new Date(booking.checkIn);
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');
    return checkIn >= start && checkIn <= end;
  });
}

// Search bookings by guest name or booking ID
export function searchBookings(bookings, query) {
  if (!query || query.trim() === '') return bookings;

  const searchTerm = query.toLowerCase().trim();
  return bookings.filter(booking => {
    const guest = (booking.guest || '').toLowerCase();
    const id = (booking.id || '').toLowerCase();
    const email = (booking.email || '').toLowerCase();
    const room = (booking.room || '').toLowerCase();

    return (
      guest.includes(searchTerm) ||
      id.includes(searchTerm) ||
      email.includes(searchTerm) ||
      room.includes(searchTerm)
    );
  });
}

// Sort bookings
export function sortBookings(bookings, sortKey, sortDirection = 'asc') {
  return [...bookings].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    // Handle date sorting
    if (sortKey === 'checkIn' || sortKey === 'checkOut' || sortKey === 'bookedOn') {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    }

    // Handle numeric sorting
    if (sortKey === 'amount' || sortKey === 'nights') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    }

    // Handle string sorting
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

// Get arrivals for today
export function getArrivalsToday(bookings) {
  const today = new Date().toISOString().split('T')[0];
  return bookings.filter(b => b.checkIn === today);
}

// Get departures for today
export function getDeparturesToday(bookings) {
  const today = new Date().toISOString().split('T')[0];
  return bookings.filter(b => b.checkOut === today);
}

// Export bookings to CSV
export function exportToCSV(bookings, filename = 'bookings_export.csv') {
  if (!bookings || bookings.length === 0) {
    alert('No bookings to export');
    return;
  }

  // CSV headers
  const headers = [
    'Booking ID',
    'Guest Name',
    'Email',
    'Phone',
    'Check-in',
    'Check-out',
    'Nights',
    'Room',
    'Room Type',
    'Amount',
    'Source',
    'Status',
    'Special Requests',
    'Booked On',
  ];

  // Convert bookings to CSV rows
  const rows = bookings.map(booking => [
    booking.id || '',
    booking.guest || '',
    booking.email || '',
    booking.phone || '',
    booking.checkIn || '',
    booking.checkOut || '',
    booking.nights || '',
    booking.room || '',
    booking.roomType || '',
    booking.amount || '',
    booking.source || '',
    booking.status || '',
    (booking.specialRequests || '').replace(/,/g, ';'),
    booking.bookedOn || '',
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Calculate booking statistics
export function calculateBookingStats(bookings) {
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const avgRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const sourceCounts = bookings.reduce((acc, b) => {
    acc[b.source] = (acc[b.source] || 0) + 1;
    return acc;
  }, {});

  return {
    totalBookings,
    totalRevenue,
    avgRevenue,
    statusCounts,
    sourceCounts,
    pendingCount: statusCounts['PENDING'] || 0,
    confirmedCount: statusCounts['CONFIRMED'] || 0,
    checkedInCount: statusCounts['CHECKED-IN'] || 0,
    completedCount: statusCounts['CHECKED-OUT'] || 0,
    cancelledCount: statusCounts['CANCELLED'] || 0,
  };
}

// Create new booking object
export function createBookingObject(formData, existingBookings = []) {
  const nights = calculateNights(formData.checkIn, formData.checkOut);
  const { total } = calculateBookingAmount(formData.roomType, nights);

  return {
    id: generateBookingId(),
    guest: formData.guestName || formData.guest,
    email: formData.email,
    phone: formData.phone || '',
    checkIn: formData.checkIn,
    checkOut: formData.checkOut,
    nights,
    room: formData.room || '',
    roomType: formData.roomType || 'Standard',
    status: 'PENDING',
    source: formData.source || 'Website',
    amount: formData.amount || total,
    bookedOn: new Date().toISOString().split('T')[0],
    guests: formData.guests || 1,
    specialRequests: formData.specialRequests || '',
    upsells: formData.upsells || [],
    vip: formData.vip || false,
    cancellationReason: null,
    cancellationNotes: null,
  };
}

// Get available rooms for assignment
export function getAvailableRooms(rooms, bookings, checkIn, checkOut) {
  if (!rooms || rooms.length === 0) return [];

  // Get rooms that are currently available
  const availableRooms = rooms.filter(room => {
    // Check if room is available or clean
    if (room.status === 'out_of_service') return false;
    if (room.status === 'occupied') {
      // Check if the occupation conflicts with requested dates
      const conflictingBooking = bookings.find(b =>
        b.room === room.roomNumber &&
        b.status !== 'CANCELLED' &&
        b.status !== 'CHECKED-OUT' &&
        new Date(b.checkIn) < new Date(checkOut) &&
        new Date(b.checkOut) > new Date(checkIn)
      );
      return !conflictingBooking;
    }
    return true;
  });

  return availableRooms;
}
