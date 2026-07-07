// Guest Growth Trend Data
export const guestGrowthData = [
  { month: 'Jan', totalGuests: 2420, newGuests: 124, activeGuests: 1156 },
  { month: 'Feb', totalGuests: 2489, newGuests: 142, activeGuests: 1189 },
  { month: 'Mar', totalGuests: 2567, newGuests: 158, activeGuests: 1224 },
  { month: 'Apr', totalGuests: 2631, newGuests: 145, activeGuests: 1258 },
  { month: 'May', totalGuests: 2698, newGuests: 167, activeGuests: 1289 },
  { month: 'Jun', totalGuests: 2754, newGuests: 152, activeGuests: 1312 },
  { month: 'Jul', totalGuests: 2812, newGuests: 178, activeGuests: 1345 },
  { month: 'Aug', totalGuests: 2876, newGuests: 183, activeGuests: 1378 },
  { month: 'Sep', totalGuests: 2943, newGuests: 171, activeGuests: 1402 },
  { month: 'Oct', totalGuests: 3018, newGuests: 195, activeGuests: 1441 },
  { month: 'Nov', totalGuests: 2847, newGuests: 186, activeGuests: 1423 },
  { month: 'Dec', totalGuests: 2847, newGuests: 0, activeGuests: 1423 }
];

export const growthMetrics = {
  yearOverYearGrowth: '+18.7%',
  monthOverMonthGrowth: '+3.2%',
  avgMonthlyNewGuests: 164,
  peakGrowthMonth: 'October',
  totalGuestsAdded: 1807,
  projectedEndOfYear: 3200
};

export const acquisitionChannels = [
  { channel: 'Direct Booking', guests: 847, percentage: 29.8 },
  { channel: 'OTA Partners', guests: 1245, percentage: 43.7 },
  { channel: 'Referrals', guests: 423, percentage: 14.9 },
  { channel: 'Corporate', guests: 198, percentage: 7.0 },
  { channel: 'Events', guests: 134, percentage: 4.6 }
];
