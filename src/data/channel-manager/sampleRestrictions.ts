/**
 * Sample Restrictions Data
 * CTA, CTD, Stop Sell, Min/Max Stay restrictions
 */

const today = new Date();
const formatDate = (daysOffset) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const sampleRestrictions = [
  {
    id: 'rest-001',
    roomType: 'ALL',
    otaCode: 'ALL',
    dateRange: {
      start: formatDate(14),
      end: formatDate(16)
    },
    restriction: {
      minStay: 2,
      maxStay: null,
      cta: false,
      ctd: false,
      stopSell: false
    },
    reason: 'Valentine\'s Day weekend - minimum 2 nights',
    isActive: true,
    createdAt: formatDate(-10),
    createdBy: 'Revenue Manager'
  },
  {
    id: 'rest-002',
    roomType: 'Oceanfront Penthouse',
    otaCode: 'ALL',
    dateRange: {
      start: formatDate(20),
      end: formatDate(25)
    },
    restriction: {
      minStay: 3,
      maxStay: null,
      cta: false,
      ctd: false,
      stopSell: false
    },
    reason: 'High demand period - Suite minimum 3 nights',
    isActive: true,
    createdAt: formatDate(-7),
    createdBy: 'Revenue Manager'
  },
  {
    id: 'rest-003',
    roomType: 'Minimalist Studio',
    otaCode: 'BOOKING',
    dateRange: {
      start: formatDate(5),
      end: formatDate(7)
    },
    restriction: {
      minStay: 1,
      maxStay: null,
      cta: true,
      ctd: false,
      stopSell: false
    },
    reason: 'CTA for Booking.com during conference',
    isActive: true,
    createdAt: formatDate(-3),
    createdBy: 'Channel Manager'
  },
  {
    id: 'rest-004',
    roomType: 'Sunset Vista',
    otaCode: 'EXPEDIA',
    dateRange: {
      start: formatDate(8),
      end: formatDate(10)
    },
    restriction: {
      minStay: 1,
      maxStay: null,
      cta: false,
      ctd: true,
      stopSell: false
    },
    reason: 'CTD for Expedia - inventory management',
    isActive: true,
    createdAt: formatDate(-2),
    createdBy: 'Channel Manager'
  },
  {
    id: 'rest-005',
    roomType: 'Pacific Suite',
    otaCode: 'AGODA',
    dateRange: {
      start: formatDate(12),
      end: formatDate(14)
    },
    restriction: {
      minStay: 1,
      maxStay: null,
      cta: false,
      ctd: false,
      stopSell: true
    },
    reason: 'Stop sell for Agoda - rate parity correction',
    isActive: true,
    createdAt: formatDate(-1),
    createdBy: 'Revenue Manager'
  },
  {
    id: 'rest-006',
    roomType: 'ALL',
    otaCode: 'ALL',
    dateRange: {
      start: formatDate(25),
      end: formatDate(30)
    },
    restriction: {
      minStay: 1,
      maxStay: 7,
      cta: false,
      ctd: false,
      stopSell: false
    },
    reason: 'Maximum 7-night stay during peak season',
    isActive: true,
    createdAt: formatDate(-5),
    createdBy: 'Revenue Manager'
  }
];

export const restrictionTypes = [
  { id: 'minStay', label: 'Minimum Stay', description: 'Minimum number of nights required' },
  { id: 'maxStay', label: 'Maximum Stay', description: 'Maximum number of nights allowed' },
  { id: 'cta', label: 'Closed to Arrival', description: 'No check-ins allowed on these dates' },
  { id: 'ctd', label: 'Closed to Departure', description: 'No check-outs allowed on these dates' },
  { id: 'stopSell', label: 'Stop Sell', description: 'No bookings accepted on these dates' }
];

export default sampleRestrictions;
