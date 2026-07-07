import { useMemo } from 'react';
import { aggregateBySegment, aggregateByChannel, sum, average } from '../utils/revenueAggregation';
import { calculateADR, calculateRevPAR, calculateOccupancy } from '../utils/forecastMath';

/**
 * Master Revenue Hook
 * Manages revenue state and provides aggregated metrics
 */
export function useRevenue(revenueData, filteredData) {
  // Calculate overall KPIs from filtered data
  const metrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        totalRevenue: 0,
        totalRooms: 0,
        avgADR: 0,
        avgOccupancy: 0,
        avgRevPAR: 0,
        totalDays: 0
      };
    }

    const totalRevenue = sum(filteredData, 'revenue');
    const totalRooms = sum(filteredData, 'rooms');
    const avgADR = Math.round(average(filteredData, 'adr'));
    const avgOccupancy = Math.round(average(filteredData, 'occupancy'));
    const avgRevPAR = Math.round(average(filteredData, 'revpar'));

    return {
      totalRevenue,
      totalRooms,
      avgADR,
      avgOccupancy,
      avgRevPAR,
      totalDays: filteredData.length
    };
  }, [filteredData]);

  // Calculate YoY comparison
  const yoyComparison = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        revenueGrowth: 0,
        adrGrowth: 0,
        occupancyGrowth: 0,
        revparGrowth: 0
      };
    }

    // Calculate growth rates
    const currentMetrics = metrics;
    const avgYoYRevenue = average(filteredData.map(d => d.yoyRevenue || d.revenue * 0.95));
    const avgYoYADR = average(filteredData.map(d => d.yoyADR || d.adr * 0.97));
    const avgYoYOccupancy = average(filteredData.map(d => d.yoyOccupancy || d.occupancy * 0.96));
    const avgYoYRevPAR = average(filteredData.map(d => d.yoyRevPAR || d.revpar * 0.94));

    const revenueGrowth = avgYoYRevenue > 0
      ? ((currentMetrics.avgADR * currentMetrics.avgOccupancy / 100 * 80 - avgYoYRevenue) / avgYoYRevenue) * 100
      : 0;
    const adrGrowth = avgYoYADR > 0 ? ((currentMetrics.avgADR - avgYoYADR) / avgYoYADR) * 100 : 0;
    const occupancyGrowth = avgYoYOccupancy > 0 ? ((currentMetrics.avgOccupancy - avgYoYOccupancy) / avgYoYOccupancy) * 100 : 0;
    const revparGrowth = avgYoYRevPAR > 0 ? ((currentMetrics.avgRevPAR - avgYoYRevPAR) / avgYoYRevPAR) * 100 : 0;

    return {
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      adrGrowth: Math.round(adrGrowth * 10) / 10,
      occupancyGrowth: Math.round(occupancyGrowth * 10) / 10,
      revparGrowth: Math.round(revparGrowth * 10) / 10
    };
  }, [filteredData, metrics]);

  // Segment performance aggregation
  const segmentPerformance = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {};
    }

    // If data has segment field, aggregate by it
    const hasSegmentData = filteredData.some(d => d.segment);

    if (hasSegmentData) {
      return aggregateBySegment(filteredData, 'segment');
    }

    // Otherwise create synthetic segment data
    const totalRevenue = sum(filteredData, 'revenue');

    return {
      'Corporate': {
        revenue: Math.round(totalRevenue * 0.42),
        rooms: Math.round(sum(filteredData, 'rooms') * 0.40),
        count: Math.round(filteredData.length * 0.40),
        adr: Math.round(average(filteredData, 'adr') * 1.05),
        avgRevenue: Math.round(totalRevenue * 0.42 / (filteredData.length * 0.40))
      },
      'Leisure': {
        revenue: Math.round(totalRevenue * 0.32),
        rooms: Math.round(sum(filteredData, 'rooms') * 0.35),
        count: Math.round(filteredData.length * 0.35),
        adr: Math.round(average(filteredData, 'adr') * 0.98),
        avgRevenue: Math.round(totalRevenue * 0.32 / (filteredData.length * 0.35))
      },
      'Group': {
        revenue: Math.round(totalRevenue * 0.18),
        rooms: Math.round(sum(filteredData, 'rooms') * 0.18),
        count: Math.round(filteredData.length * 0.18),
        adr: Math.round(average(filteredData, 'adr') * 0.92),
        avgRevenue: Math.round(totalRevenue * 0.18 / (filteredData.length * 0.18))
      },
      'Other': {
        revenue: Math.round(totalRevenue * 0.08),
        rooms: Math.round(sum(filteredData, 'rooms') * 0.07),
        count: Math.round(filteredData.length * 0.07),
        adr: Math.round(average(filteredData, 'adr') * 0.95),
        avgRevenue: Math.round(totalRevenue * 0.08 / (filteredData.length * 0.07))
      }
    };
  }, [filteredData]);

  // Channel performance aggregation
  const channelPerformance = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {};
    }

    // If data has channel field, aggregate by it
    const hasChannelData = filteredData.some(d => d.channel);

    if (hasChannelData) {
      return aggregateByChannel(filteredData, 'channel');
    }

    // Otherwise create synthetic channel data
    const totalRevenue = sum(filteredData, 'revenue');

    return {
      'Direct Booking': {
        revenue: Math.round(totalRevenue * 0.35),
        rooms: Math.round(sum(filteredData, 'rooms') * 0.30),
        count: Math.round(filteredData.length * 0.30),
        adr: Math.round(average(filteredData, 'adr') * 1.08),
        commission: 0,
        netRevenue: Math.round(totalRevenue * 0.35)
      },
      'OTA': {
        revenue: Math.round(totalRevenue * 0.28),
        rooms: Math.round(sum(filteredData, 'rooms') * 0.32),
        count: Math.round(filteredData.length * 0.32),
        adr: Math.round(average(filteredData, 'adr') * 0.95),
        commission: 15,
        netRevenue: Math.round(totalRevenue * 0.28 * 0.85)
      },
      'GDS': {
        revenue: Math.round(totalRevenue * 0.20),
        rooms: Math.round(sum(filteredData, 'rooms') * 0.22),
        count: Math.round(filteredData.length * 0.22),
        adr: Math.round(average(filteredData, 'adr') * 1.02),
        commission: 12,
        netRevenue: Math.round(totalRevenue * 0.20 * 0.88)
      },
      'Corporate': {
        revenue: Math.round(totalRevenue * 0.12),
        rooms: Math.round(sum(filteredData, 'rooms') * 0.11),
        count: Math.round(filteredData.length * 0.11),
        adr: Math.round(average(filteredData, 'adr') * 1.05),
        commission: 5,
        netRevenue: Math.round(totalRevenue * 0.12 * 0.95)
      },
      'Wholesale': {
        revenue: Math.round(totalRevenue * 0.05),
        rooms: Math.round(sum(filteredData, 'rooms') * 0.05),
        count: Math.round(filteredData.length * 0.05),
        adr: Math.round(average(filteredData, 'adr') * 0.88),
        commission: 18,
        netRevenue: Math.round(totalRevenue * 0.05 * 0.82)
      }
    };
  }, [filteredData]);

  // Calculate daily trend
  const dailyTrend = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { trend: 'stable', percentage: 0 };
    }

    // Compare first half vs second half
    const midpoint = Math.floor(filteredData.length / 2);
    const firstHalf = filteredData.slice(0, midpoint);
    const secondHalf = filteredData.slice(midpoint);

    const firstHalfRevenue = average(firstHalf, 'revenue');
    const secondHalfRevenue = average(secondHalf, 'revenue');

    if (firstHalfRevenue === 0) {
      return { trend: 'stable', percentage: 0 };
    }

    const changePercent = ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100;

    let trend = 'stable';
    if (changePercent > 5) trend = 'up';
    else if (changePercent < -5) trend = 'down';

    return {
      trend,
      percentage: Math.round(changePercent * 10) / 10
    };
  }, [filteredData]);

  // Revenue summary for current period
  const summary = useMemo(() => {
    return {
      ...metrics,
      ...yoyComparison,
      trend: dailyTrend,
      segmentCount: Object.keys(segmentPerformance).length,
      channelCount: Object.keys(channelPerformance).length
    };
  }, [metrics, yoyComparison, dailyTrend, segmentPerformance, channelPerformance]);

  return {
    metrics,
    yoyComparison,
    segmentPerformance,
    channelPerformance,
    dailyTrend,
    summary
  };
}
