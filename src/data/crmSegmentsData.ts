// Guest Segmentation Data
export const guestSegments = [
  {
    name: 'VIP Guests',
    value: 127,
    percentage: 12.3,
    color: '#8B5CF6',
    description: 'High-value repeat guests with premium bookings',
    avgLTV: 8500,
    avgBookings: 6.2,
    totalRevenue: 1079500
  },
  {
    name: 'Frequent Travelers',
    value: 342,
    percentage: 33.1,
    color: '#EC4899',
    description: 'Regular guests with 3+ bookings per year',
    avgLTV: 4200,
    avgBookings: 4.8,
    totalRevenue: 1436400
  },
  {
    name: 'Occasional Guests',
    value: 456,
    percentage: 44.2,
    color: '#3B82F6',
    description: 'Guests with 1-2 bookings per year',
    avgLTV: 1800,
    avgBookings: 1.5,
    totalRevenue: 820800
  },
  {
    name: 'Corporate',
    value: 108,
    percentage: 10.4,
    color: '#10B981',
    description: 'Business travelers and corporate accounts',
    avgLTV: 5200,
    avgBookings: 8.3,
    totalRevenue: 561600
  }
];

export const segmentTrends = {
  vipGrowth: '+8.5%',
  frequentGrowth: '+12.3%',
  occasionalGrowth: '+5.7%',
  corporateGrowth: '+15.2%'
};

export const segmentMetrics = {
  totalSegments: 4,
  mostValuableSegment: 'VIP Guests',
  fastestGrowingSegment: 'Corporate',
  largestSegment: 'Occasional Guests'
};
