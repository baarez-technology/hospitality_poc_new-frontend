// RMS Segments — hardcoded samples removed; data now comes from API.

export const segments: any[] = [];

export function generateSegmentPerformance(_startDate: any = new Date()): any[] {
  return [];
}

// Returns the shape the Segmentation page expects, with zeros/empty arrays.
// Using a proper object (not an empty array) prevents crashes like
// `segmentComparison.totals.revenue` when there's no real segment data.
export function getSegmentComparison(_performance: any) {
  return {
    totals: {
      revenue: 0,
      roomNights: 0,
      bookings: 0,
      cancellations: 0,
    },
    overallADR: 0,
    overallCancelRate: 0,
    topPerformer: null,
    fastestGrowing: null,
    needsAttention: [] as any[],
    byRevenue: [] as any[],
    byGrowth: [] as any[],
    byADR: [] as any[],
  };
}

export const sampleSegmentPerformance: any[] = [];
export const segmentComparison = getSegmentComparison(sampleSegmentPerformance);

export default sampleSegmentPerformance;
