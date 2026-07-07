/**
 * Sample Inventory Data for Unified Inventory Engine
 * Generates 30 days of realistic inventory data
 */

// Room type definitions
export const roomTypes = [
  {
    id: 'standard',
    name: 'Standard Room',
    code: 'STD',
    totalRooms: 15,
    baseOccupancy: 2,
    maxOccupancy: 3,
    baseRate: 1000000, // in paisa (₹10,000)
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar']
  },
  {
    id: 'deluxe',
    name: 'Deluxe Room',
    code: 'DLX',
    totalRooms: 10,
    baseOccupancy: 2,
    maxOccupancy: 4,
    baseRate: 1500000, // ₹15,000
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Ocean View', 'Balcony']
  },
  {
    id: 'suite',
    name: 'Executive Suite',
    code: 'STE',
    totalRooms: 5,
    baseOccupancy: 2,
    maxOccupancy: 4,
    baseRate: 2900000, // ₹29,000
    amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Ocean View', 'Balcony', 'Living Room', 'Jacuzzi']
  }
];

// Rate plans
export const ratePlans = [
  {
    id: 'bar',
    name: 'Best Available Rate',
    code: 'BAR',
    description: 'Standard rate with full flexibility',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
    modifier: 1.0, // Base rate
    isDefault: true
  },
  {
    id: 'corporate',
    name: 'Corporate Rate',
    code: 'CORP',
    description: 'Discounted rate for business travelers',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
    modifier: 0.85, // 15% discount
    requiresCode: true
  },
  {
    id: 'ota',
    name: 'OTA Rate',
    code: 'OTA',
    description: 'Rate for online travel agencies',
    cancellationPolicy: 'As per OTA policy',
    modifier: 0.90, // 10% discount from BAR
    isOTA: true
  },
  {
    id: 'advance',
    name: 'Advance Purchase',
    code: 'ADV',
    description: 'Non-refundable rate with 20% discount',
    cancellationPolicy: 'Non-refundable',
    modifier: 0.80, // 20% discount
    nonRefundable: true,
    minAdvanceDays: 14
  }
];

// Promotions
export const samplePromotions = [
  {
    id: 'winter10',
    code: 'WINTER10',
    title: 'Winter Wonderland Special',
    description: 'Enjoy 10% off during the winter season',
    discountType: 'percentage',
    discountValue: 10,
    validFrom: formatDate(0),
    validTo: formatDate(45),
    eligibleRoomTypes: ['deluxe', 'suite'],
    eligibleRatePlans: ['bar', 'corporate'],
    minStay: 2,
    maxUsage: 100,
    currentUsage: 23,
    stackable: false,
    isActive: true
  },
  {
    id: 'earlybird',
    code: 'EARLYBIRD',
    title: 'Early Bird 15% Off',
    description: 'Book 21 days in advance and save 15%',
    discountType: 'percentage',
    discountValue: 15,
    validFrom: formatDate(0),
    validTo: formatDate(90),
    eligibleRoomTypes: ['standard', 'deluxe', 'suite'],
    eligibleRatePlans: ['bar'],
    minAdvanceDays: 21,
    maxUsage: 50,
    currentUsage: 12,
    stackable: false,
    isActive: true
  },
  {
    id: 'weekend50',
    code: 'WEEKEND50',
    title: 'Weekend Flat \u20B94,000 Off',
    description: '\u20B94,000 off for weekend stays',
    discountType: 'fixed',
    discountValue: 400000, // \u20B94,000 in paisa
    validFrom: formatDate(0),
    validTo: formatDate(60),
    eligibleRoomTypes: ['standard', 'deluxe'],
    eligibleRatePlans: ['bar', 'ota'],
    applicableDays: [5, 6, 0], // Fri, Sat, Sun
    maxUsage: 200,
    currentUsage: 67,
    stackable: true,
    isActive: true
  }
];

// OTA Mappings
export const otaMappings = [
  {
    id: 'ota-booking',
    otaCode: 'BOOKING',
    otaName: 'Booking.com',
    roomTypeMappings: {
      standard: { otaRoomType: 'Standard Double Room', syncEnabled: true },
      deluxe: { otaRoomType: 'Deluxe Ocean View', syncEnabled: true },
      suite: { otaRoomType: 'Executive Suite', syncEnabled: true }
    },
    rateMarkup: 5, // 5% markup for commission offset
    syncRates: true,
    syncAvailability: true,
    syncRestrictions: true,
    lastSync: new Date().toISOString()
  },
  {
    id: 'ota-expedia',
    otaCode: 'EXPEDIA',
    otaName: 'Expedia',
    roomTypeMappings: {
      standard: { otaRoomType: 'Standard Room', syncEnabled: true },
      deluxe: { otaRoomType: 'Deluxe Room', syncEnabled: true },
      suite: { otaRoomType: 'Premium Suite', syncEnabled: true }
    },
    rateMarkup: 8, // 8% markup
    syncRates: true,
    syncAvailability: true,
    syncRestrictions: true,
    lastSync: new Date().toISOString()
  },
  {
    id: 'ota-agoda',
    otaCode: 'AGODA',
    otaName: 'Agoda',
    roomTypeMappings: {
      standard: { otaRoomType: 'Standard Double', syncEnabled: true },
      deluxe: { otaRoomType: 'Deluxe View Room', syncEnabled: true },
      suite: { otaRoomType: 'Luxury Suite', syncEnabled: false }
    },
    rateMarkup: 6,
    syncRates: true,
    syncAvailability: true,
    syncRestrictions: false,
    lastSync: new Date().toISOString()
  }
];

// Helper functions
function formatDate(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

function isWeekend(date) {
  const d = new Date(date);
  return d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6;
}

function isPeakDay(date) {
  const d = new Date(date);
  const month = d.getMonth();
  const day = d.getDate();
  // Peak: December holidays, weekends
  return month === 11 || isWeekend(date);
}

// Generate 30-day availability grid
export function generateAvailabilityGrid() {
  const grid = {};

  for (let i = 0; i < 30; i++) {
    const date = formatDate(i);
    grid[date] = {};

    roomTypes.forEach(roomType => {
      // Simulate varying availability
      const baseBooked = Math.floor(Math.random() * (roomType.totalRooms * 0.6));
      const weekend = isWeekend(date);
      const peak = isPeakDay(date);

      let bookedRooms = baseBooked;
      if (weekend) bookedRooms = Math.min(bookedRooms + 2, roomType.totalRooms - 1);
      if (peak) bookedRooms = Math.min(bookedRooms + 1, roomType.totalRooms - 1);

      const outOfOrder = i % 10 === 0 ? 1 : 0; // 1 OOO room every 10 days
      const available = Math.max(0, roomType.totalRooms - bookedRooms - outOfOrder);

      grid[date][roomType.id] = {
        date,
        roomTypeId: roomType.id,
        roomType: roomType.name,
        totalRooms: roomType.totalRooms,
        available,
        booked: bookedRooms,
        outOfOrder,
        blocked: 0,
        oversold: 0,
        lastUpdated: new Date().toISOString()
      };
    });
  }

  return grid;
}

// Generate 30-day rate grid
export function generateRateGrid() {
  const grid = {};

  for (let i = 0; i < 30; i++) {
    const date = formatDate(i);
    grid[date] = {};

    const weekend = isWeekend(date);
    const peak = isPeakDay(date);

    roomTypes.forEach(roomType => {
      let baseRate = roomType.baseRate;
      let overrideRate = null;
      let seasonalMultiplier = 1.0;
      let appliedPromotion = null;

      // Apply seasonal/weekend multiplier
      if (weekend) seasonalMultiplier = 1.15;
      if (peak) seasonalMultiplier = Math.max(seasonalMultiplier, 1.20);

      const seasonalRate = Math.round(baseRate * seasonalMultiplier);

      // Check for applicable promotions
      samplePromotions.forEach(promo => {
        if (promo.isActive &&
            date >= promo.validFrom &&
            date <= promo.validTo &&
            promo.eligibleRoomTypes.includes(roomType.id)) {
          // Check day restrictions
          if (promo.applicableDays) {
            const dayOfWeek = new Date(date).getDay();
            if (!promo.applicableDays.includes(dayOfWeek)) return;
          }
          appliedPromotion = promo.id;
        }
      });

      // Generate rate plans
      const rates = {};
      ratePlans.forEach(plan => {
        const planRate = Math.round(seasonalRate * plan.modifier);
        rates[plan.id] = {
          baseRate: planRate,
          overrideRate: null,
          finalRate: planRate
        };
      });

      // Generate OTA rates with markup
      const otaRates = {};
      otaMappings.forEach(ota => {
        if (ota.roomTypeMappings[roomType.id]?.syncEnabled) {
          const markup = 1 + (ota.rateMarkup / 100);
          otaRates[ota.otaCode] = Math.round(rates.ota.finalRate * markup);
        }
      });

      grid[date][roomType.id] = {
        date,
        roomTypeId: roomType.id,
        roomType: roomType.name,
        baseRate,
        seasonalMultiplier,
        seasonalRate,
        rates,
        otaRates,
        appliedPromotion,
        lastUpdated: new Date().toISOString()
      };
    });
  }

  return grid;
}

// Generate 30-day restriction grid
export function generateRestrictionGrid() {
  const grid = {};

  for (let i = 0; i < 30; i++) {
    const date = formatDate(i);
    grid[date] = {};

    const weekend = isWeekend(date);
    const peak = isPeakDay(date);

    roomTypes.forEach(roomType => {
      // Default restrictions
      let minStay = 1;
      let maxStay = 30;
      let cta = false; // Closed to Arrival
      let ctd = false; // Closed to Departure
      let stopSell = false;

      // Apply weekend minimum stay for suites
      if (weekend && roomType.id === 'suite') {
        minStay = 2;
      }

      // Peak periods have minimum stay
      if (peak && roomType.id !== 'standard') {
        minStay = Math.max(minStay, 2);
      }

      // Simulate some CTA/CTD days
      if (i === 15 || i === 16) { // Conference days
        if (roomType.id === 'standard') {
          cta = true;
        }
      }

      // Simulate stop sell for maintenance
      if (i === 20 && roomType.id === 'suite') {
        stopSell = true;
      }

      grid[date][roomType.id] = {
        date,
        roomTypeId: roomType.id,
        roomType: roomType.name,
        minStay,
        maxStay,
        cta,
        ctd,
        stopSell,
        ctaOTAs: [], // Specific OTAs with CTA
        ctdOTAs: [],
        stopSellOTAs: [],
        lastUpdated: new Date().toISOString()
      };
    });
  }

  return grid;
}

// Sample individual rooms for housekeeping
export const sampleRooms = [
  // Standard Rooms (101-115)
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `${101 + i}`,
    number: `${101 + i}`,
    roomTypeId: 'standard',
    floor: 1,
    status: i < 12 ? 'ready' : i < 14 ? 'cleaning' : 'dirty',
    cleaningTimeMinutes: 30,
    lastCleaned: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    currentBookingId: i < 8 ? `booking-${100 + i}` : null,
    checkoutDate: i < 8 ? formatDate(Math.floor(Math.random() * 5) + 1) : null,
    maintenanceNotes: i === 10 ? 'AC needs servicing' : null
  })),
  // Deluxe Rooms (201-210)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `${201 + i}`,
    number: `${201 + i}`,
    roomTypeId: 'deluxe',
    floor: 2,
    status: i < 8 ? 'ready' : i < 9 ? 'cleaning' : 'dirty',
    cleaningTimeMinutes: 45,
    lastCleaned: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    currentBookingId: i < 6 ? `booking-${200 + i}` : null,
    checkoutDate: i < 6 ? formatDate(Math.floor(Math.random() * 5) + 1) : null,
    maintenanceNotes: null
  })),
  // Suites (301-305)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${301 + i}`,
    number: `${301 + i}`,
    roomTypeId: 'suite',
    floor: 3,
    status: i < 4 ? 'ready' : 'cleaning',
    cleaningTimeMinutes: 60,
    lastCleaned: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    currentBookingId: i < 3 ? `booking-${300 + i}` : null,
    checkoutDate: i < 3 ? formatDate(Math.floor(Math.random() * 5) + 1) : null,
    maintenanceNotes: i === 4 ? 'Jacuzzi pump maintenance scheduled' : null
  }))
];

// Sample housekeeping schedule
export function generateHousekeepingSchedule() {
  const schedule = {};

  for (let i = 0; i < 7; i++) {
    const date = formatDate(i);
    schedule[date] = {
      date,
      departures: [],
      stayovers: [],
      arrivals: []
    };

    // Simulate departures
    const departureCount = 3 + Math.floor(Math.random() * 5);
    for (let j = 0; j < departureCount; j++) {
      const roomIndex = Math.floor(Math.random() * sampleRooms.length);
      schedule[date].departures.push({
        roomId: sampleRooms[roomIndex].id,
        roomNumber: sampleRooms[roomIndex].number,
        roomType: sampleRooms[roomIndex].roomTypeId,
        expectedCheckout: '11:00',
        priority: j < 2 ? 'high' : 'normal',
        nextArrival: j < 2 ? '14:00' : null
      });
    }

    // Simulate stayovers
    const stayoverCount = 5 + Math.floor(Math.random() * 8);
    for (let j = 0; j < stayoverCount; j++) {
      const roomIndex = Math.floor(Math.random() * sampleRooms.length);
      schedule[date].stayovers.push({
        roomId: sampleRooms[roomIndex].id,
        roomNumber: sampleRooms[roomIndex].number,
        roomType: sampleRooms[roomIndex].roomTypeId,
        guestPreferences: j % 3 === 0 ? 'DND until 2pm' : null
      });
    }
  }

  return schedule;
}

// Overbooking alerts sample
export const sampleOverbookingAlerts = [
  {
    id: 'ob-001',
    date: formatDate(5),
    roomTypeId: 'standard',
    roomType: 'Standard Room',
    oversoldBy: 1,
    source: 'OTA_BOOKING',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    affectedBookings: ['booking-150', 'booking-151'],
    resolutionOptions: ['upgrade', 'walk', 'waitlist']
  }
];

// AI Rate Suggestions
export const aiRateSuggestions = [
  {
    id: 'ai-001',
    date: formatDate(7),
    roomTypeId: 'deluxe',
    currentRate: 1500000,
    suggestedRate: 1750000,
    reason: 'High demand detected - only 2 rooms remaining',
    confidence: 0.85,
    potentialRevenue: 500000
  },
  {
    id: 'ai-002',
    date: formatDate(14),
    roomTypeId: 'suite',
    currentRate: 2900000,
    suggestedRate: 3500000,
    reason: 'Local event driving demand - 95% occupancy projected',
    confidence: 0.92,
    potentialRevenue: 2900000
  },
  {
    id: 'ai-003',
    date: formatDate(21),
    roomTypeId: 'standard',
    currentRate: 1000000,
    suggestedRate: 900000,
    reason: 'Low occupancy forecast - consider 10% discount to drive bookings',
    confidence: 0.78,
    potentialRevenue: -300000
  }
];

export default {
  roomTypes,
  ratePlans,
  samplePromotions,
  otaMappings,
  sampleRooms,
  sampleOverbookingAlerts,
  aiRateSuggestions,
  generateAvailabilityGrid,
  generateRateGrid,
  generateRestrictionGrid,
  generateHousekeepingSchedule
};
