/**
 * Sample Rate Overrides Data
 * OTA-specific rate adjustments
 */

const today = new Date();
const formatDate = (daysOffset) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const sampleRateOverrides = [
  {
    id: 'rate-001',
    roomType: 'Minimalist Studio',
    otaCode: 'BOOKING',
    dateRange: {
      start: formatDate(0),
      end: formatDate(7)
    },
    rateType: 'percentage',
    adjustment: 5,
    reason: 'Booking.com premium visibility',
    isActive: true,
    createdAt: formatDate(-5)
  },
  {
    id: 'rate-002',
    roomType: 'Coastal Retreat',
    otaCode: 'EXPEDIA',
    dateRange: {
      start: formatDate(0),
      end: formatDate(14)
    },
    rateType: 'fixed',
    adjustment: 10,
    reason: 'Expedia commission offset',
    isActive: true,
    createdAt: formatDate(-3)
  },
  {
    id: 'rate-003',
    roomType: 'Urban Oasis',
    otaCode: 'AGODA',
    dateRange: {
      start: formatDate(10),
      end: formatDate(20)
    },
    rateType: 'percentage',
    adjustment: -8,
    reason: 'Flash sale campaign',
    isActive: true,
    createdAt: formatDate(-2)
  },
  {
    id: 'rate-004',
    roomType: 'Sunset Vista',
    otaCode: 'ALL',
    dateRange: {
      start: formatDate(20),
      end: formatDate(30)
    },
    rateType: 'percentage',
    adjustment: 15,
    reason: 'Peak season premium',
    isActive: true,
    createdAt: formatDate(-7)
  },
  {
    id: 'rate-005',
    roomType: 'Pacific Suite',
    otaCode: 'GOOGLE',
    dateRange: {
      start: formatDate(5),
      end: formatDate(15)
    },
    rateType: 'fixed',
    adjustment: -25,
    reason: 'Google Hotel Ads promotion',
    isActive: true,
    createdAt: formatDate(-1)
  },
  {
    id: 'rate-006',
    roomType: 'Wellness Suite',
    otaCode: 'BOOKING',
    dateRange: {
      start: formatDate(3),
      end: formatDate(12)
    },
    rateType: 'percentage',
    adjustment: 8,
    reason: 'Wellness package premium',
    isActive: true,
    createdAt: formatDate(-4)
  },
  {
    id: 'rate-007',
    roomType: 'Family Sanctuary',
    otaCode: 'ALL',
    dateRange: {
      start: formatDate(15),
      end: formatDate(25)
    },
    rateType: 'percentage',
    adjustment: 10,
    reason: 'School holiday premium',
    isActive: true,
    createdAt: formatDate(-6)
  },
  {
    id: 'rate-008',
    roomType: 'Oceanfront Penthouse',
    otaCode: 'EXPEDIA',
    dateRange: {
      start: formatDate(0),
      end: formatDate(30)
    },
    rateType: 'percentage',
    adjustment: -5,
    reason: 'Luxury suite promotional rate',
    isActive: true,
    createdAt: formatDate(-8)
  }
];

// Generate 30-day rate calendar data
export function generateRateCalendar(baseRates, rateOverrides) {
  const calendar = {};
  const roomTypes = [
    'Minimalist Studio',
    'Coastal Retreat',
    'Urban Oasis',
    'Sunset Vista',
    'Pacific Suite',
    'Wellness Suite',
    'Family Sanctuary',
    'Oceanfront Penthouse'
  ];
  const ratePlans = ['BAR', 'Corporate', 'OTA'];

  for (let i = 0; i < 30; i++) {
    const date = formatDate(i);
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

    calendar[date] = {};

    roomTypes.forEach(roomType => {
      const base = baseRates[roomType] || 100;
      let weekendMultiplier = isWeekend ? 1.15 : 1;

      calendar[date][roomType] = {
        date,
        roomType,
        rates: {
          BAR: Math.round(base * weekendMultiplier),
          Corporate: Math.round(base * 0.9 * weekendMultiplier),
          OTA: Math.round(base * 0.9 * weekendMultiplier)
        },
        otaRates: {},
        availability: Math.floor(Math.random() * 6) + 2,
        stopSell: false,
        cta: false,
        ctd: false,
        minStay: 1,
        maxStay: 30
      };

      // Apply OTA-specific rates
      ['BOOKING', 'EXPEDIA', 'AGODA', 'MMT', 'GOOGLE'].forEach(ota => {
        let otaRate = calendar[date][roomType].rates.OTA;

        // Apply overrides
        rateOverrides.forEach(override => {
          if (
            override.isActive &&
            (override.roomType === roomType || override.roomType === 'ALL') &&
            (override.otaCode === ota || override.otaCode === 'ALL') &&
            date >= override.dateRange.start &&
            date <= override.dateRange.end
          ) {
            if (override.rateType === 'percentage') {
              otaRate = Math.round(otaRate * (1 + override.adjustment / 100));
            } else {
              otaRate = otaRate + override.adjustment;
            }
          }
        });

        calendar[date][roomType].otaRates[ota] = otaRate;
      });
    });
  }

  return calendar;
}

export const baseRates = {
  'Minimalist Studio': 150,
  'Coastal Retreat': 199,
  'Urban Oasis': 245,
  'Sunset Vista': 315,
  'Pacific Suite': 385,
  'Wellness Suite': 425,
  'Family Sanctuary': 485,
  'Oceanfront Penthouse': 750
};

export default sampleRateOverrides;
