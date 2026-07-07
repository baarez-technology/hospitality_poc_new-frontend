import { useMemo } from 'react';
import { segmentGuests, getPrimarySegment } from '@/utils/admin/crmSegmentationMath';

/**
 * CRM Segmentation Hook
 * Segments guests into categories based on behavior and value
 */
export function useCRMSegments(guests) {
  const segments = useMemo(() => {
    if (!guests || guests.length === 0) {
      return {
        vip: [],
        atRisk: [],
        highSpenders: [],
        returning: [],
        new: [],
        corporate: [],
        ota: [],
        walkIn: [],
        active: [],
        dormant: [],
        loyal: [],
        breakdown: {},
        averageLTV: 0
      };
    }

    return segmentGuests(guests);
  }, [guests]);

  // Enrich guests with primary segment
  const guestsWithSegments = useMemo(() => {
    if (!guests || guests.length === 0) return [];

    return guests.map(guest => ({
      ...guest,
      primarySegment: getPrimarySegment(guest, segments.averageLTV)
    }));
  }, [guests, segments.averageLTV]);

  // Calculate segment chart data for visualization
  const segmentChartData = useMemo(() => {
    return [
      {
        name: 'VIP Guests',
        value: segments.vip.length,
        percentage: parseFloat(segments.breakdown.vip?.percentage || 0),
        color: '#8B5CF6'
      },
      {
        name: 'Returning Guests',
        value: segments.returning.length,
        percentage: parseFloat(segments.breakdown.returning?.percentage || 0),
        color: '#3B82F6'
      },
      {
        name: 'Corporate',
        value: segments.corporate.length,
        percentage: parseFloat(segments.breakdown.corporate?.percentage || 0),
        color: '#10B981'
      },
      {
        name: 'New Guests',
        value: segments.new.length,
        percentage: parseFloat(segments.breakdown.new?.percentage || 0),
        color: '#F59E0B'
      },
      {
        name: 'At Risk',
        value: segments.atRisk.length,
        percentage: parseFloat(segments.breakdown.atRisk?.percentage || 0),
        color: '#EF4444'
      }
    ].filter(s => s.value > 0);
  }, [segments]);

  return {
    segments,
    guestsWithSegments,
    segmentChartData,
    averageLTV: segments.averageLTV
  };
}
