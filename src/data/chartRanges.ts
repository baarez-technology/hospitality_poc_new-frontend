// Chart data for different date ranges
export const chartDataRanges = {
  '7d': [
    { date: 'Nov 11', occupancy: 75, revenue: 17200 },
    { date: 'Nov 12', occupancy: 78, revenue: 18200 },
    { date: 'Nov 13', occupancy: 82, revenue: 19800 },
    { date: 'Nov 14', occupancy: 85, revenue: 21400 },
    { date: 'Nov 15', occupancy: 88, revenue: 23100 },
    { date: 'Nov 16', occupancy: 84, revenue: 20900 },
    { date: 'Nov 17', occupancy: 87, revenue: 24200 },
    { date: 'Nov 18', occupancy: 87.5, revenue: 24680 },
  ],
  '14d': [
    { date: 'Nov 4', occupancy: 72, revenue: 16800 },
    { date: 'Nov 5', occupancy: 74, revenue: 17200 },
    { date: 'Nov 6', occupancy: 76, revenue: 17600 },
    { date: 'Nov 7', occupancy: 79, revenue: 18900 },
    { date: 'Nov 8', occupancy: 81, revenue: 19400 },
    { date: 'Nov 9', occupancy: 77, revenue: 18100 },
    { date: 'Nov 10', occupancy: 73, revenue: 17000 },
    { date: 'Nov 11', occupancy: 75, revenue: 17200 },
    { date: 'Nov 12', occupancy: 78, revenue: 18200 },
    { date: 'Nov 13', occupancy: 82, revenue: 19800 },
    { date: 'Nov 14', occupancy: 85, revenue: 21400 },
    { date: 'Nov 15', occupancy: 88, revenue: 23100 },
    { date: 'Nov 16', occupancy: 84, revenue: 20900 },
    { date: 'Nov 17', occupancy: 87, revenue: 24200 },
    { date: 'Nov 18', occupancy: 87.5, revenue: 24680 },
  ],
  '30d': [
    { date: 'Oct 19', occupancy: 68, revenue: 15400 },
    { date: 'Oct 22', occupancy: 70, revenue: 15900 },
    { date: 'Oct 25', occupancy: 73, revenue: 16800 },
    { date: 'Oct 28', occupancy: 76, revenue: 17500 },
    { date: 'Oct 31', occupancy: 80, revenue: 19200 },
    { date: 'Nov 3', occupancy: 71, revenue: 16500 },
    { date: 'Nov 6', occupancy: 76, revenue: 17600 },
    { date: 'Nov 9', occupancy: 77, revenue: 18100 },
    { date: 'Nov 12', occupancy: 78, revenue: 18200 },
    { date: 'Nov 15', occupancy: 88, revenue: 23100 },
    { date: 'Nov 18', occupancy: 87.5, revenue: 24680 },
  ],
  '90d': [
    { date: 'Aug 20', occupancy: 82, revenue: 20100 },
    { date: 'Sep 3', occupancy: 79, revenue: 18900 },
    { date: 'Sep 17', occupancy: 75, revenue: 17300 },
    { date: 'Oct 1', occupancy: 72, revenue: 16400 },
    { date: 'Oct 15', occupancy: 68, revenue: 15200 },
    { date: 'Oct 29', occupancy: 77, revenue: 17800 },
    { date: 'Nov 12', occupancy: 78, revenue: 18200 },
    { date: 'Nov 18', occupancy: 87.5, revenue: 24680 },
  ],
};

export function getChartDataForRange(range) {
  return chartDataRanges[range] || chartDataRanges['7d'];
}

export function getKPIsForRange(range) {
  const data = chartDataRanges[range];
  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];

  const occupancyChange = ((latestData.occupancy - previousData.occupancy) / previousData.occupancy * 100).toFixed(1);
  const revenueChange = ((latestData.revenue - previousData.revenue) / previousData.revenue * 100).toFixed(1);

  return {
    occupancy: latestData.occupancy,
    occupancyChange: occupancyChange > 0 ? `+${occupancyChange}%` : `${occupancyChange}%`,
    revenue: latestData.revenue,
    revenueChange: revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`,
  };
}
