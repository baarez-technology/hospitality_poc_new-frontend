import { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Flame, Snowflake, RefreshCw, Sparkles, AlertCircle, Calendar, Target, Zap } from 'lucide-react';
import {
  revenueIntelligenceService,
  ForecastItem,
  Event,
  ScenarioResponse
} from '../../../api/services/revenue-intelligence.service';
import { useToast } from '../../../contexts/ToastContext';
import DemandChart, { DemandLevelBadge, ForecastSummaryCards } from '../../../components/revenue-management/DemandChart';
import { Button } from '../../../components/ui2/Button';
import { useBookingsSSE } from '../../../hooks/useBookingsSSE';

interface ForecastInsight {
  type: 'compression' | 'weak_demand' | 'opportunity';
  title: string;
  message: string;
  potentialRevenue?: number;
  date?: string;
}

interface HighImpactDay {
  date: string;
  demandLevel: string;
  demandIndex: number;
  event?: { name: string };
  forecast: {
    occupancy: number;
    adr: number;
  };
  priceRecommendation: {
    message: string;
  };
}

interface OpportunityDay {
  date: string;
  demandLevel: string;
  demandIndex: number;
  forecast: {
    occupancy: number;
    adr: number;
  };
  priceRecommendation: {
    message: string;
  };
}

const DemandForecast = () => {
  const { showToast } = useToast();

  // State for API data
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<{ date: string; type: string; result?: ScenarioResponse } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch forecast data from API
  const fetchForecastData = useCallback(async () => {
    try {
      setError(null);
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + dateRange);

      const [forecastData, eventsData] = await Promise.all([
        revenueIntelligenceService.getForecast({
          start_date: today.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        }),
        revenueIntelligenceService.getEvents(
          today.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ),
      ]);

      setForecast(forecastData.forecasts || []);
      setEvents(eventsData || []);
    } catch (err) {
      console.error('Failed to fetch forecast data:', err);
      setError('Failed to load forecast data');
      showToast('Failed to load forecast data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, showToast]);

  useEffect(() => {
    fetchForecastData();
  }, [fetchForecastData]);

  // Re-fetch forecast + events when a booking changes so this page reflects
  // new bookings in real time (same pattern as the other revenue pages).
  useBookingsSSE({
    onBookingCreated: () => { fetchForecastData(); },
    onBookingCancelled: () => { fetchForecastData(); },
    refetchBookings: () => { fetchForecastData(); },
  });

  // Generate insights from forecast data
  const forecastInsights = useMemo<ForecastInsight[]>(() => {
    if (!forecast.length) return [];

    const insights: ForecastInsight[] = [];

    // Find compression periods (high demand consecutive days)
    const highDemandDays = forecast.filter(f => f.demand_level === 'critical' || f.demand_level === 'high');
    if (highDemandDays.length >= 3) {
      const avgOccupancy = highDemandDays.reduce((sum, f) => sum + f.forecasted_occupancy, 0) / highDemandDays.length;
      insights.push({
        type: 'compression',
        title: 'Compression Period Detected',
        message: `${highDemandDays.length} high-demand days identified with avg ${Math.round(avgOccupancy)}% occupancy. Consider rate increases.`,
        potentialRevenue: Math.round(highDemandDays.length * 450),
      });
    }

    // Find weak demand periods
    const lowDemandDays = forecast.filter(f => f.demand_level === 'low' || f.demand_level === 'very_low');
    if (lowDemandDays.length >= 5) {
      const avgOccupancy = lowDemandDays.reduce((sum, f) => sum + f.forecasted_occupancy, 0) / lowDemandDays.length;
      insights.push({
        type: 'weak_demand',
        title: 'Soft Demand Period',
        message: `${lowDemandDays.length} days with below-average demand (${Math.round(avgOccupancy)}% occupancy). Consider promotions.`,
      });
    }

    // Find opportunity days (moderate demand with room to grow)
    const moderateDays = forecast.filter(f => f.demand_level === 'moderate' && f.forecasted_occupancy < 75);
    if (moderateDays.length >= 3) {
      insights.push({
        type: 'opportunity',
        title: 'Revenue Opportunity',
        message: `${moderateDays.length} moderate-demand days could benefit from targeted marketing to boost occupancy.`,
        potentialRevenue: Math.round(moderateDays.length * 280),
      });
    }

    return insights;
  }, [forecast]);

  // Calculate high impact days
  const highImpactDays = useMemo<HighImpactDay[]>(() => {
    return forecast
      .filter(f => f.demand_level === 'critical' || f.demand_level === 'high')
      .sort((a, b) => b.forecasted_demand - a.forecasted_demand)
      .slice(0, 10)
      .map(f => {
        const event = events.find(e =>
          new Date(e.startDate) <= new Date(f.date) &&
          new Date(e.endDate) >= new Date(f.date)
        );
        const baseADR = 189;
        const multiplier = f.demand_level === 'critical' ? 1.35 : 1.2;

        return {
          date: f.date,
          demandLevel: f.demand_level,
          demandIndex: f.forecasted_demand / 100,
          event: event ? { name: event.name } : undefined,
          forecast: {
            occupancy: f.forecasted_occupancy,
            adr: Math.round(baseADR * multiplier),
          },
          priceRecommendation: {
            message: f.demand_level === 'critical'
              ? `Increase rates by ${Math.round((multiplier - 1) * 100)}%`
              : `Consider moderate rate increase`,
          },
        };
      });
  }, [forecast, events]);

  // Calculate opportunity days (low demand)
  const opportunityDays = useMemo<OpportunityDay[]>(() => {
    return forecast
      .filter(f => f.demand_level === 'low' || f.demand_level === 'very_low')
      .sort((a, b) => a.forecasted_demand - b.forecasted_demand)
      .slice(0, 10)
      .map(f => {
        const baseADR = 189;
        const multiplier = f.demand_level === 'very_low' ? 0.75 : 0.85;

        return {
          date: f.date,
          demandLevel: f.demand_level,
          demandIndex: f.forecasted_demand / 100,
          forecast: {
            occupancy: f.forecasted_occupancy,
            adr: Math.round(baseADR * multiplier),
          },
          priceRecommendation: {
            message: f.demand_level === 'very_low'
              ? 'Consider promotional rates or packages'
              : 'Offer length-of-stay discounts',
          },
        };
      });
  }, [forecast]);

  // Calculate forecast summary
  const forecastSummary = useMemo(() => {
    if (!forecast.length) {
      return {
        avgOccupancy: 0,
        avgConfidence: 0,
        highDemandDays: 0,
        lowDemandDays: 0,
      };
    }

    const avgOccupancy = forecast.reduce((sum, f) => sum + f.forecasted_occupancy, 0) / forecast.length;
    const avgConfidence = forecast.reduce((sum, f) => sum + f.confidence_level, 0) / forecast.length;
    const highDemandDays = forecast.filter(f => f.demand_level === 'critical' || f.demand_level === 'high').length;
    const lowDemandDays = forecast.filter(f => f.demand_level === 'low' || f.demand_level === 'very_low').length;

    return {
      avgOccupancy: Math.round(avgOccupancy),
      avgConfidence: Math.round(avgConfidence * 100),
      highDemandDays,
      lowDemandDays,
    };
  }, [forecast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchForecastData();
      showToast('Forecast regenerated successfully', 'success');
    } catch (err) {
      console.error('Failed to refresh forecast:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSimulateSurge = async (date: string) => {
    setIsSimulating(true);
    setSelectedSimulation({ date, type: 'surge' });
    try {
      const result = await revenueIntelligenceService.simulateScenario({
        scenario_type: 'rate_increase',
        parameters: {
          percentage: 15,
        },
      });
      setSelectedSimulation({ date, type: 'surge', result });
      showToast('Surge simulation completed', 'success');
    } catch (err) {
      console.error('Failed to simulate surge:', err);
      showToast('Failed to run simulation', 'error');
      setSelectedSimulation(null);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateDrop = async (date: string) => {
    setIsSimulating(true);
    setSelectedSimulation({ date, type: 'drop' });
    try {
      const result = await revenueIntelligenceService.simulateScenario({
        scenario_type: 'promotion',
        parameters: {
          discount: 15,
          demand_lift: 20,
        },
      });
      setSelectedSimulation({ date, type: 'drop', result });
      showToast('Promotion simulation completed', 'success');
    } catch (err) {
      console.error('Failed to simulate drop:', err);
      showToast('Failed to run simulation', 'error');
      setSelectedSimulation(null);
    } finally {
      setIsSimulating(false);
    }
  };

  if (error && forecast.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">Failed to Load Forecast</h2>
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <Button onClick={fetchForecastData} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Demand Forecast
            </h1>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-1">
              AI-powered demand predictions and pricing recommendations
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100">
              {[14, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setDateRange(days)}
                  className={`px-2 sm:px-4 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold transition-all duration-200 ${
                    dateRange === days
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
            <Button
              onClick={handleRefresh}
              loading={isRefreshing}
              icon={RefreshCw}
              variant="primary"
            >
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
          </div>
        </header>

        {/* Summary Cards */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-[10px] bg-white p-3 sm:p-5 animate-pulse">
                  <div className="h-4 bg-neutral-100 rounded w-24 mb-2" />
                  <div className="h-8 bg-neutral-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-[10px] bg-white p-3 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-ocean-100 flex items-center justify-center flex-shrink-0">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ocean-600" />
                  </div>
                  <span className="text-[9px] sm:text-[11px] text-neutral-500 font-medium uppercase tracking-wide">
                    Avg Occupancy
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">{forecastSummary.avgOccupancy}%</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-1">Next {dateRange} days</p>
              </div>
              <div className="rounded-[10px] bg-white p-3 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />
                  </div>
                  <span className="text-[9px] sm:text-[11px] text-neutral-500 font-medium uppercase tracking-wide">
                    Confidence
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">{forecastSummary.avgConfidence}%</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-1">Model accuracy</p>
              </div>
              <div className="rounded-[10px] bg-white p-3 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                  </div>
                  <span className="text-[9px] sm:text-[11px] text-neutral-500 font-medium uppercase tracking-wide">
                    High Demand
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">{forecastSummary.highDemandDays}</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-1">Peak days ahead</p>
              </div>
              <div className="rounded-[10px] bg-white p-3 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
                  </div>
                  <span className="text-[9px] sm:text-[11px] text-neutral-500 font-medium uppercase tracking-wide">
                    Low Demand
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-neutral-900">{forecastSummary.lowDemandDays}</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-1">Opportunity days</p>
              </div>
            </div>
          )}
        </section>

        {/* AI Insights */}
        {!isLoading && forecastInsights.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {forecastInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 sm:p-5 rounded-[10px] border transition-colors ${
                  insight.type === 'compression'
                    ? 'bg-rose-50 border-rose-200'
                    : insight.type === 'weak_demand'
                      ? 'bg-gold-50 border-gold-200'
                      : 'bg-ocean-50 border-ocean-200'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    insight.type === 'compression'
                      ? 'bg-rose-100'
                      : insight.type === 'weak_demand'
                        ? 'bg-gold-100'
                        : 'bg-ocean-100'
                  }`}>
                    {insight.type === 'compression' ? (
                      <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                    ) : insight.type === 'weak_demand' ? (
                      <Snowflake className="w-4 h-4 sm:w-5 sm:h-5 text-gold-600" />
                    ) : (
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-ocean-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs sm:text-sm font-semibold mb-1 ${
                      insight.type === 'compression'
                        ? 'text-rose-800'
                        : insight.type === 'weak_demand'
                          ? 'text-gold-800'
                          : 'text-ocean-800'
                    }`}>
                      {insight.title}
                    </h4>
                    <p className="text-[11px] sm:text-[13px] text-neutral-600 leading-relaxed">
                      {insight.message}
                    </p>
                    {insight.potentialRevenue && (
                      <p className="text-[11px] sm:text-[13px] font-semibold text-sage-600 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        +${insight.potentialRevenue.toLocaleString()} potential
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Simulation Result Banner */}
        {selectedSimulation?.result && (
          <section className="rounded-[10px] bg-terra-50 border border-terra-200 p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-terra-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-terra-600" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-terra-800">
                    Simulation Result: {selectedSimulation.type === 'surge' ? 'Rate Increase' : 'Promotion'}
                  </h4>
                  <p className="text-[11px] sm:text-[13px] text-terra-600">
                    {selectedSimulation.result.recommendation}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right pl-11 sm:pl-0">
                <p className="text-xl sm:text-2xl font-bold text-terra-700">
                  {selectedSimulation.result.projected.revenue_change_percent > 0 ? '+' : ''}
                  {selectedSimulation.result.projected.revenue_change_percent.toFixed(1)}%
                </p>
                <p className="text-[10px] sm:text-[11px] text-terra-500">
                  ${selectedSimulation.result.projected.revenue.toLocaleString()} projected
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-terra-200 flex items-center justify-between">
              <p className="text-[10px] sm:text-[11px] text-terra-500">
                Confidence: {Math.round(selectedSimulation.result.confidence * 100)}%
              </p>
              <button
                onClick={() => setSelectedSimulation(null)}
                className="text-[10px] sm:text-[11px] font-medium text-terra-600 hover:text-terra-800"
              >
                Dismiss
              </button>
            </div>
          </section>
        )}

        {/* Chart */}
        <section className="rounded-[10px] bg-white overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">Demand Forecast Chart</h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
                Predicted demand trends and occupancy levels with confidence intervals
              </p>
            </div>
            {events.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] text-neutral-500">{events.length} events in range</span>
              </div>
            )}
          </div>
          <div className="px-2 sm:px-6 pb-4 sm:pb-6">
            {isLoading ? (
              <div className="h-64 sm:h-80 bg-neutral-50 rounded-lg animate-pulse" />
            ) : (
              <DemandChart dateRange={dateRange} />
            )}
          </div>
        </section>

        {/* High Impact & Opportunity Days */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* High Impact Days */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">High Impact Days</h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
                Peak demand periods requiring attention
              </p>
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 sm:p-4 rounded-lg border border-neutral-100 animate-pulse">
                    <div className="h-5 bg-neutral-100 rounded w-32 mb-2" />
                    <div className="h-4 bg-neutral-100 rounded w-48" />
                  </div>
                ))
              ) : highImpactDays.length === 0 ? (
                <div className="p-4 sm:p-6 text-center text-neutral-500 text-xs sm:text-sm">
                  No high impact days in the selected range
                </div>
              ) : (
                highImpactDays.slice(0, 5).map((day) => (
                  <div
                    key={day.date}
                    className="p-3 sm:p-4 rounded-lg border border-neutral-100 bg-neutral-50/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] sm:text-[13px] font-medium text-neutral-900">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <DemandLevelBadge level={day.demandLevel as 'critical' | 'high' | 'moderate' | 'low' | 'very_low'} />
                      </div>
                      <span className="text-[13px] sm:text-[15px] font-bold text-rose-600">
                        {Math.round(day.demandIndex * 100)}%
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-[10px] sm:text-[11px]">
                      <span className="text-neutral-500">
                        {day.event ? day.event.name : 'High demand expected'}
                      </span>
                      <span className="text-neutral-600 font-medium">
                        {day.forecast.occupancy}% occ | ${day.forecast.adr} ADR
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-dashed border-neutral-200 flex items-center justify-between gap-2">
                      <span className="text-[10px] sm:text-[11px] font-medium text-sage-600">
                        {day.priceRecommendation.message}
                      </span>
                      <button
                        onClick={() => handleSimulateSurge(day.date)}
                        disabled={isSimulating}
                        className="px-2 py-1 text-[10px] sm:text-[11px] font-medium text-terra-600 hover:bg-terra-50 rounded transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {isSimulating && selectedSimulation?.date === day.date ? 'Simulating...' : 'Simulate'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Opportunity Days */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">Opportunity Days</h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
                Low demand periods needing promotional strategies
              </p>
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 sm:p-4 rounded-lg border border-neutral-100 animate-pulse">
                    <div className="h-5 bg-neutral-100 rounded w-32 mb-2" />
                    <div className="h-4 bg-neutral-100 rounded w-48" />
                  </div>
                ))
              ) : opportunityDays.length === 0 ? (
                <div className="p-4 sm:p-6 text-center text-neutral-500 text-xs sm:text-sm">
                  No low demand days in the selected range
                </div>
              ) : (
                opportunityDays.slice(0, 5).map((day) => (
                  <div
                    key={day.date}
                    className="p-3 sm:p-4 rounded-lg border border-neutral-100 bg-neutral-50/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] sm:text-[13px] font-medium text-neutral-900">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <DemandLevelBadge level={day.demandLevel as 'critical' | 'high' | 'moderate' | 'low' | 'very_low'} />
                      </div>
                      <span className="text-[13px] sm:text-[15px] font-bold text-gold-600">
                        {Math.round(day.demandIndex * 100)}%
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-[10px] sm:text-[11px]">
                      <span className="text-neutral-500">
                        Low demand expected
                      </span>
                      <span className="text-neutral-600 font-medium">
                        {day.forecast.occupancy}% occ | ${day.forecast.adr} ADR
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-dashed border-neutral-200 flex items-center justify-between gap-2">
                      <span className="text-[10px] sm:text-[11px] font-medium text-gold-600">
                        {day.priceRecommendation.message}
                      </span>
                      <button
                        onClick={() => handleSimulateDrop(day.date)}
                        disabled={isSimulating}
                        className="px-2 py-1 text-[10px] sm:text-[11px] font-medium text-terra-600 hover:bg-terra-50 rounded transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {isSimulating && selectedSimulation?.date === day.date ? 'Simulating...' : 'Simulate'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DemandForecast;
