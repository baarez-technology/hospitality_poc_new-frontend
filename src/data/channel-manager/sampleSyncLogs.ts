/**
 * Sample Sync Logs Data
 * Channel manager sync activity logs
 */

const today = new Date();
const formatDateTime = (minutesOffset) => {
  const d = new Date(today);
  d.setMinutes(d.getMinutes() - minutesOffset);
  return d.toISOString();
};

export const sampleSyncLogs = [
  {
    id: 'log-001',
    timestamp: formatDateTime(1),
    otaCode: 'BOOKING',
    otaName: 'Booking.com',
    action: 'rate_update',
    status: 'success',
    message: 'Rates synced successfully for all room types',
    details: {
      roomTypes: ['Minimalist Studio', 'Coastal Retreat', 'Urban Oasis', 'Sunset Vista', 'Pacific Suite', 'Wellness Suite', 'Family Sanctuary', 'Oceanfront Penthouse'],
      dateRange: '30 days',
      changesCount: 120
    }
  },
  {
    id: 'log-002',
    timestamp: formatDateTime(3),
    otaCode: 'EXPEDIA',
    otaName: 'Expedia',
    action: 'availability_update',
    status: 'success',
    message: 'Inventory updated for next 14 days',
    details: {
      roomTypes: ['Minimalist Studio', 'Coastal Retreat'],
      dateRange: '14 days',
      changesCount: 28
    }
  },
  {
    id: 'log-003',
    timestamp: formatDateTime(5),
    otaCode: 'AGODA',
    otaName: 'Agoda',
    action: 'restriction_update',
    status: 'success',
    message: 'Stop sell activated for Pacific Suite rooms',
    details: {
      roomType: 'Pacific Suite',
      restriction: 'Stop Sell',
      dateRange: 'Dec 12-14'
    }
  },
  {
    id: 'log-004',
    timestamp: formatDateTime(8),
    otaCode: 'TRIP',
    otaName: 'Trip.com',
    action: 'connection',
    status: 'error',
    message: 'API authentication failed - invalid credentials',
    details: {
      errorCode: 'AUTH_401',
      retryCount: 3,
      lastAttempt: formatDateTime(8)
    }
  },
  {
    id: 'log-005',
    timestamp: formatDateTime(12),
    otaCode: 'GOOGLE',
    otaName: 'Google Hotel Ads',
    action: 'rate_update',
    status: 'success',
    message: 'Price feed updated successfully',
    details: {
      roomTypes: ['Minimalist Studio', 'Coastal Retreat', 'Urban Oasis', 'Sunset Vista', 'Pacific Suite', 'Wellness Suite', 'Family Sanctuary', 'Oceanfront Penthouse'],
      dateRange: '30 days',
      changesCount: 120
    }
  },
  {
    id: 'log-006',
    timestamp: formatDateTime(15),
    otaCode: 'BOOKING',
    otaName: 'Booking.com',
    action: 'promotion_sync',
    status: 'success',
    message: 'Winter promotion synced to Booking.com',
    details: {
      promotionName: 'Winter Wonderland Special',
      discount: '20%',
      validUntil: '2025-02-28'
    }
  },
  {
    id: 'log-007',
    timestamp: formatDateTime(20),
    otaCode: 'MMT',
    otaName: 'MakeMyTrip',
    action: 'availability_update',
    status: 'warning',
    message: 'Partial sync completed - some dates skipped',
    details: {
      syncedDates: 25,
      skippedDates: 5,
      reason: 'Rate parity validation required'
    }
  },
  {
    id: 'log-008',
    timestamp: formatDateTime(30),
    otaCode: 'EXPEDIA',
    otaName: 'Expedia',
    action: 'booking_import',
    status: 'success',
    message: 'New booking imported from Expedia',
    details: {
      bookingId: 'EXP-789456',
      guestName: 'John Smith',
      roomType: 'Sunset Vista',
      checkIn: '2025-01-15'
    }
  },
  {
    id: 'log-009',
    timestamp: formatDateTime(45),
    otaCode: 'AGODA',
    otaName: 'Agoda',
    action: 'rate_update',
    status: 'error',
    message: 'Rate sync failed - API timeout',
    details: {
      errorCode: 'TIMEOUT_504',
      retryScheduled: formatDateTime(-5)
    }
  },
  {
    id: 'log-010',
    timestamp: formatDateTime(60),
    otaCode: 'BOOKING',
    otaName: 'Booking.com',
    action: 'availability_update',
    status: 'success',
    message: 'Inventory synchronized successfully',
    details: {
      roomTypes: ['Minimalist Studio', 'Coastal Retreat', 'Urban Oasis', 'Sunset Vista', 'Pacific Suite', 'Wellness Suite', 'Family Sanctuary', 'Oceanfront Penthouse'],
      dateRange: '30 days',
      changesCount: 45
    }
  },
  {
    id: 'log-011',
    timestamp: formatDateTime(90),
    otaCode: 'GOOGLE',
    otaName: 'Google Hotel Ads',
    action: 'connection',
    status: 'success',
    message: 'Connection established successfully',
    details: {
      connectionTime: '245ms',
      apiVersion: 'v3.2'
    }
  },
  {
    id: 'log-012',
    timestamp: formatDateTime(120),
    otaCode: 'ALL',
    otaName: 'All OTAs',
    action: 'bulk_sync',
    status: 'success',
    message: 'Scheduled bulk sync completed',
    details: {
      otasUpdated: 5,
      totalChanges: 340,
      duration: '12.5s'
    }
  }
];

export const actionTypes = {
  rate_update: { label: 'Rate Update', icon: 'dollar-sign', color: 'text-emerald-600' },
  availability_update: { label: 'Availability Update', icon: 'calendar', color: 'text-blue-600' },
  restriction_update: { label: 'Restriction Update', icon: 'ban', color: 'text-amber-600' },
  promotion_sync: { label: 'Promotion Sync', icon: 'gift', color: 'text-purple-600' },
  booking_import: { label: 'Booking Import', icon: 'download', color: 'text-teal-600' },
  connection: { label: 'Connection', icon: 'wifi', color: 'text-indigo-600' },
  bulk_sync: { label: 'Bulk Sync', icon: 'refresh-cw', color: 'text-neutral-600' }
};

export const statusTypes = {
  success: { label: 'Success', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  error: { label: 'Error', color: 'text-rose-600', bg: 'bg-rose-100' },
  warning: { label: 'Warning', color: 'text-amber-600', bg: 'bg-amber-100' },
  pending: { label: 'Pending', color: 'text-blue-600', bg: 'bg-blue-100' }
};

export default sampleSyncLogs;
