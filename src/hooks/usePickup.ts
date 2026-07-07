import { useMemo } from 'react';
import {
  calculateDailyPickup,
  calculatePickupVariance,
  analyzePickupTrend,
  projectPickup,
  calculatePaceIndicator,
  detectPickupAnomalies,
  calculateOnTheBooks
} from '../utils/pickupMath';

/**
 * Pickup Analysis Hook
 * Analyzes booking pace and on-the-books metrics
 */
export function usePickup(revenueData, forecastData) {
  // Calculate booking pace by window
  const pickupByWindow = useMemo(() => {
    if (!revenueData || revenueData.length === 0) {
      return [];
    }

    // Generate pickup data for different booking windows
    const windows = [
      { label: '0-7 Days', start: 0, end: 7 },
      { label: '8-14 Days', start: 8, end: 14 },
      { label: '15-21 Days', start: 15, end: 21 },
      { label: '22-30 Days', start: 22, end: 30 },
      { label: '31-60 Days', start: 31, end: 60 },
      { label: '61-90 Days', start: 61, end: 90 }
    ];

    return windows.map(window => {
      // Simulate current year pickup
      const currentYearBase = 180 - (window.start * 1.2);
      const currentYear = Math.round(currentYearBase + (Math.random() * 20 - 10));

      // Simulate last year pickup (slightly lower)
      const lastYearBase = currentYearBase * 0.92;
      const lastYear = Math.round(lastYearBase + (Math.random() * 15 - 7));

      const variance = ((currentYear - lastYear) / lastYear) * 100;

      return {
        label: window.label,
        currentYear,
        lastYear,
        variance: Math.round(variance * 10) / 10,
        trend: variance > 0 ? 'up' : variance < 0 ? 'down' : 'stable'
      };
    });
  }, [revenueData]);

  // Calculate on-the-books metrics
  const onTheBooks = useMemo(() => {
    if (!forecastData || forecastData.length === 0) {
      // Return default/mock data
      return {
        next7Days: {
          rooms: 420,
          revenue: 73500,
          occupancy: 75,
          adr: 175
        },
        next14Days: {
          rooms: 812,
          revenue: 142100,
          occupancy: 73,
          adr: 175
        },
        next30Days: {
          rooms: 1680,
          revenue: 294000,
          occupancy: 70,
          adr: 175
        }
      };
    }

    const next7Days = calculateOnTheBooks(forecastData, 7);
    const next14Days = calculateOnTheBooks(forecastData, 14);
    const next30Days = calculateOnTheBooks(forecastData, 30);

    return {
      next7Days,
      next14Days,
      next30Days
    };
  }, [forecastData]);

  // Calculate pace indicators (ahead/behind/on-pace)
  const paceIndicators = useMemo(() => {
    if (pickupByWindow.length === 0) {
      return {
        overall: { status: 'on-pace', percentage: 0, description: 'Tracking at expected pace' },
        shortTerm: { status: 'on-pace', percentage: 0, description: 'Short-term pace steady' },
        longTerm: { status: 'on-pace', percentage: 0, description: 'Long-term pace steady' }
      };
    }

    // Overall pace (all windows)
    const overallVariance = pickupByWindow.reduce((sum, w) => sum + w.variance, 0) / pickupByWindow.length;
    const overallStatus = overallVariance > 2 ? 'ahead' : overallVariance < -2 ? 'behind' : 'on-pace';
    const overallDescription =
      overallStatus === 'ahead'
        ? 'Booking pace ahead of last year'
        : overallStatus === 'behind'
        ? 'Booking pace behind last year'
        : 'Tracking at expected pace';

    // Short-term pace (0-30 days)
    const shortTermWindows = pickupByWindow.slice(0, 4);
    const shortTermVariance = shortTermWindows.reduce((sum, w) => sum + w.variance, 0) / shortTermWindows.length;
    const shortTermStatus = shortTermVariance > 2 ? 'ahead' : shortTermVariance < -2 ? 'behind' : 'on-pace';
    const shortTermDescription =
      shortTermStatus === 'ahead'
        ? 'Near-term bookings strong'
        : shortTermStatus === 'behind'
        ? 'Near-term bookings soft'
        : 'Short-term pace steady';

    // Long-term pace (31+ days)
    const longTermWindows = pickupByWindow.slice(4);
    const longTermVariance =
      longTermWindows.length > 0
        ? longTermWindows.reduce((sum, w) => sum + w.variance, 0) / longTermWindows.length
        : 0;
    const longTermStatus = longTermVariance > 2 ? 'ahead' : longTermVariance < -2 ? 'behind' : 'on-pace';
    const longTermDescription =
      longTermStatus === 'ahead'
        ? 'Future bookings trending up'
        : longTermStatus === 'behind'
        ? 'Future bookings trending down'
        : 'Long-term pace steady';

    return {
      overall: {
        status: overallStatus,
        percentage: Math.round(overallVariance),
        description: overallDescription
      },
      shortTerm: {
        status: shortTermStatus,
        percentage: Math.round(shortTermVariance),
        description: shortTermDescription
      },
      longTerm: {
        status: longTermStatus,
        percentage: Math.round(longTermVariance),
        description: longTermDescription
      }
    };
  }, [pickupByWindow]);

  // Analyze pickup trends
  const pickupTrends = useMemo(() => {
    if (pickupByWindow.length === 0) {
      return { overall: 'stable', nearTerm: 'stable', farTerm: 'stable' };
    }

    // Overall trend
    const positiveWindows = pickupByWindow.filter(w => w.variance > 0).length;
    const negativeWindows = pickupByWindow.filter(w => w.variance < 0).length;

    let overall = 'stable';
    if (positiveWindows > negativeWindows + 1) overall = 'accelerating';
    else if (negativeWindows > positiveWindows + 1) overall = 'decelerating';

    // Near-term trend (0-30 days)
    const nearTermWindows = pickupByWindow.slice(0, 4);
    const nearTermPositive = nearTermWindows.filter(w => w.variance > 0).length;
    const nearTermNegative = nearTermWindows.filter(w => w.variance < 0).length;

    let nearTerm = 'stable';
    if (nearTermPositive > nearTermNegative) nearTerm = 'accelerating';
    else if (nearTermNegative > nearTermPositive) nearTerm = 'decelerating';

    // Far-term trend (31+ days)
    const farTermWindows = pickupByWindow.slice(4);
    const farTermPositive = farTermWindows.filter(w => w.variance > 0).length;
    const farTermNegative = farTermWindows.filter(w => w.variance < 0).length;

    let farTerm = 'stable';
    if (farTermPositive > farTermNegative) farTerm = 'accelerating';
    else if (farTermNegative > farTermPositive) farTerm = 'decelerating';

    return {
      overall,
      nearTerm,
      farTerm
    };
  }, [pickupByWindow]);

  // Detect pickup anomalies
  const anomalies = useMemo(() => {
    if (pickupByWindow.length === 0) {
      return [];
    }

    const detectedAnomalies = [];

    // Check for sudden drops (variance < -15%)
    pickupByWindow.forEach(window => {
      if (window.variance < -15) {
        detectedAnomalies.push({
          window: window.label,
          type: 'drop',
          severity: 'high',
          message: `Significant booking drop in ${window.label} window (${window.variance.toFixed(1)}% vs LY)`,
          value: window.variance
        });
      }
    });

    // Check for unexpected surges (variance > 25%)
    pickupByWindow.forEach(window => {
      if (window.variance > 25) {
        detectedAnomalies.push({
          window: window.label,
          type: 'surge',
          severity: 'medium',
          message: `Unusual booking surge in ${window.label} window (+${window.variance.toFixed(1)}% vs LY)`,
          value: window.variance
        });
      }
    });

    return detectedAnomalies;
  }, [pickupByWindow]);

  // Summary metrics
  const summary = useMemo(() => {
    return {
      totalOnTheBooks: onTheBooks.next30Days.rooms,
      totalRevenue: onTheBooks.next30Days.revenue,
      avgPace: paceIndicators.overall.percentage,
      paceStatus: paceIndicators.overall.status,
      trend: pickupTrends.overall,
      anomalyCount: anomalies.length
    };
  }, [onTheBooks, paceIndicators, pickupTrends, anomalies]);

  return {
    pickupByWindow,
    onTheBooks,
    paceIndicators,
    pickupTrends,
    anomalies,
    summary
  };
}
