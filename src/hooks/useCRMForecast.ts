import { useMemo } from 'react';
import { batchForecastLTV, projectGuestGrowth } from '../utils/crmLTVMath';
import { calculateGuestGrowthTrend, calculateLTVTrend, calculateRetentionTrend } from '../utils/crmTrendMath';

/**
 * CRM Forecasting Hook
 * Predicts LTV, retention, growth, and trends
 */
export function useCRMForecast(guests, timeframeMonths = 12) {
  // LTV Forecast for all guests
  const ltvForecast = useMemo(() => {
    if (!guests || guests.length === 0) {
      return {
        forecasts: [],
        summary: {
          totalCurrentLTV: 0,
          totalForecastedLTV: 0,
          totalProjectedRevenue: 0,
          averageProjectedRevenue: 0,
          growthRate: '0.0'
        }
      };
    }

    return batchForecastLTV(guests, timeframeMonths);
  }, [guests, timeframeMonths]);

  // Guest growth projection
  const guestGrowth = useMemo(() => {
    if (!guests || guests.length === 0) {
      return {
        currentTotal: 0,
        projectedTotal: 0,
        projectedNewGuests: 0,
        monthlyGrowthRate: '0.0',
        growthPercentage: '0.0'
      };
    }

    return projectGuestGrowth(guests, timeframeMonths);
  }, [guests, timeframeMonths]);

  // Guest growth trend (historical + forecast)
  const growthTrend = useMemo(() => {
    if (!guests || guests.length === 0) return [];
    return calculateGuestGrowthTrend(guests, 12);
  }, [guests]);

  // LTV trend (historical)
  const ltvTrend = useMemo(() => {
    if (!guests || guests.length === 0) return [];
    return calculateLTVTrend(guests, 12);
  }, [guests]);

  // Retention trend
  const retentionTrend = useMemo(() => {
    if (!guests || guests.length === 0) return [];
    return calculateRetentionTrend(guests, 12);
  }, [guests]);

  // Calculate average retention rate
  const averageRetentionRate = useMemo(() => {
    if (retentionTrend.length === 0) return 0;
    const sum = retentionTrend.reduce((acc, t) => acc + t.retentionRate, 0);
    return (sum / retentionTrend.length).toFixed(1);
  }, [retentionTrend]);

  // Top forecasted guests (highest projected revenue)
  const topForecastedGuests = useMemo(() => {
    return ltvForecast.forecasts
      .sort((a, b) => b.forecastedAdditionalSpend - a.forecastedAdditionalSpend)
      .slice(0, 10);
  }, [ltvForecast]);

  return {
    ltvForecast,
    guestGrowth,
    growthTrend,
    ltvTrend,
    retentionTrend,
    averageRetentionRate,
    topForecastedGuests
  };
}
