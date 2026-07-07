// Lifetime Value (LTV) Trend Data
export const ltvTrendData = [
  { month: 'Jan', avgLTV: 240000, vipLTV: 598000, frequentLTV: 315500, occasionalLTV: 133000 },
  { month: 'Feb', avgLTV: 244500, vipLTV: 610000, frequentLTV: 324000, occasionalLTV: 137000 },
  { month: 'Mar', avgLTV: 250000, vipLTV: 622500, frequentLTV: 332000, occasionalLTV: 139500 },
  { month: 'Apr', avgLTV: 256000, vipLTV: 635000, frequentLTV: 340500, occasionalLTV: 142000 },
  { month: 'May', avgLTV: 261000, vipLTV: 647500, frequentLTV: 344500, occasionalLTV: 144500 },
  { month: 'Jun', avgLTV: 265500, vipLTV: 660000, frequentLTV: 348500, occasionalLTV: 146000 },
  { month: 'Jul', avgLTV: 270000, vipLTV: 672500, frequentLTV: 353000, occasionalLTV: 148000 },
  { month: 'Aug', avgLTV: 275000, vipLTV: 685000, frequentLTV: 357000, occasionalLTV: 149000 },
  { month: 'Sep', avgLTV: 279500, vipLTV: 697000, frequentLTV: 361000, occasionalLTV: 150000 },
  { month: 'Oct', avgLTV: 282000, vipLTV: 701500, frequentLTV: 363500, occasionalLTV: 151500 },
  { month: 'Nov', avgLTV: 284000, vipLTV: 705500, frequentLTV: 348500, occasionalLTV: 149500 },
  { month: 'Dec', avgLTV: 284000, vipLTV: 705500, frequentLTV: 348500, occasionalLTV: 149500 }
];

export const ltvMetrics = {
  averageLTV: 284000,
  highestLTV: 3785000,
  lowestLTV: 23000,
  medianLTV: 236500,

  vipSegmentLTV: 705500,
  frequentSegmentLTV: 348500,
  occasionalSegmentLTV: 149500,
  corporateSegmentLTV: 432000,

  ltvGrowthYoY: '+18.3%',
  ltvGrowthMoM: '+1.2%',

  top10PercentLTV: 1029000,
  bottom10PercentLTV: 35000
};

export const ltvByBookingSource = [
  { source: 'Direct Website', avgLTV: 348500, guestCount: 847 },
  { source: 'Booking.com', avgLTV: 232500, guestCount: 623 },
  { source: 'Expedia', avgLTV: 245000, guestCount: 412 },
  { source: 'Corporate Portal', avgLTV: 432000, guestCount: 198 },
  { source: 'Referral Program', avgLTV: 324000, guestCount: 423 },
  { source: 'Google Hotel Ads', avgLTV: 216000, guestCount: 210 },
  { source: 'TripAdvisor', avgLTV: 199000, guestCount: 134 }
];

export const ltvProjections = {
  next3Months: 297000,
  next6Months: 310000,
  next12Months: 342000,
  projectedGrowth: '+20.5%'
};
