import { useState, useCallback, useMemo } from 'react';
import { forecastWithTrend } from '../utils/regression';
import { smoothAndProject } from '../utils/smoothing';
import { projectRevenue, calculateConfidenceInterval, calculateScenarios } from '../utils/forecastMath';
import { forecastDemand, detectAnomalies } from '../utils/demandModel';

/**
 * AI Forecast Engine Hook
 * Simulates ML-based forecasting with regression, smoothing, and demand modeling
 */
export function useForecastEngine(historicalData) {
  const [forecastHorizon, setForecastHorizon] = useState(30); // days ahead
  const [confidenceLevel, setConfidenceLevel] = useState(0.90); // 90% confidence

  // Generate forecast using multiple methods
  const forecast = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return {
        projections: [],
        confidence: 0,
        model: null
      };
    }

    // Method 1: Linear regression forecast
    const regressionForecast = forecastWithTrend(
      historicalData,
      forecastHorizon,
      'revenue'
    );

    // Method 2: Smoothing-based projection
    const smoothingForecast = smoothAndProject(
      historicalData,
      forecastHorizon,
      'revenue'
    );

    // Calculate average ADR and occupancy from historical data
    const avgADR = Math.round(
      historicalData.reduce((sum, d) => sum + d.adr, 0) / historicalData.length
    );
    const avgOccupancy = Math.round(
      historicalData.reduce((sum, d) => sum + d.occupancy, 0) / historicalData.length
    );

    // Method 3: ADR/Occupancy projection
    const growthRate = smoothingForecast.growthRate / 100;
    const adrOccupancyForecast = projectRevenue(
      avgADR,
      avgOccupancy,
      forecastHorizon,
      growthRate
    );

    // Method 4: Demand-based forecast
    const historicalOccupancy = historicalData.map(d => d.occupancy);
    const demandForecast = forecastDemand(historicalOccupancy, forecastHorizon);

    // Combine forecasts (ensemble method)
    const combinedProjections = [];
    const today = new Date();

    for (let i = 0; i < forecastHorizon; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i + 1);

      // Weight the different forecast methods
      const regressionValue = regressionForecast.forecasts[i]?.forecast || 0;
      const smoothingValue = smoothingForecast.projections[i] || 0;
      const adrOccValue = adrOccupancyForecast[i]?.revenue || 0;

      // Ensemble: weighted average
      const forecastRevenue = Math.round(
        regressionValue * 0.4 +
        smoothingValue * 0.3 +
        adrOccValue * 0.3
      );

      // Confidence interval
      const interval = calculateConfidenceInterval(forecastRevenue, confidenceLevel);

      // Get demand metrics
      const demand = demandForecast[i];

      combinedProjections.push({
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        forecastRevenue: interval.forecast,
        lowerBound: interval.lower,
        upperBound: interval.upper,
        forecastADR: adrOccupancyForecast[i]?.adr || avgADR,
        forecastOccupancy: demand?.occupancy || avgOccupancy,
        forecastRooms: adrOccupancyForecast[i]?.roomsSold || 0,
        forecastRevPAR: adrOccupancyForecast[i]?.revpar || 0,
        demandScore: demand?.demandScore || 50,
        demandLevel: demand?.demandLevel || 'Medium',
        confidence: demand?.confidence || 90
      });
    }

    // Detect anomalies
    const anomalies = detectAnomalies(demandForecast);

    // Calculate scenarios
    const totalForecastRevenue = combinedProjections.reduce(
      (sum, p) => sum + p.forecastRevenue,
      0
    );
    const scenarios = calculateScenarios(totalForecastRevenue);

    return {
      projections: combinedProjections,
      confidence: Math.round((regressionForecast.confidence + 90) / 2),
      scenarios,
      anomalies,
      model: {
        method: 'ensemble',
        components: ['regression', 'smoothing', 'adr-occupancy', 'demand'],
        growthRate: smoothingForecast.growthRate
      }
    };
  }, [historicalData, forecastHorizon, confidenceLevel]);

  // Recompute forecast with new parameters
  const recomputeForecast = useCallback((newHorizon, newConfidence) => {
    if (newHorizon) setForecastHorizon(newHorizon);
    if (newConfidence) setConfidenceLevel(newConfidence);
  }, []);

  // Get forecast summary
  const summary = useMemo(() => {
    if (forecast.projections.length === 0) {
      return {
        totalRevenue: 0,
        avgADR: 0,
        avgOccupancy: 0,
        avgConfidence: 0
      };
    }

    return {
      totalRevenue: forecast.projections.reduce((sum, p) => sum + p.forecastRevenue, 0),
      avgADR: Math.round(
        forecast.projections.reduce((sum, p) => sum + p.forecastADR, 0) /
        forecast.projections.length
      ),
      avgOccupancy: Math.round(
        forecast.projections.reduce((sum, p) => sum + p.forecastOccupancy, 0) /
        forecast.projections.length
      ),
      avgConfidence: Math.round(
        forecast.projections.reduce((sum, p) => sum + p.confidence, 0) /
        forecast.projections.length
      )
    };
  }, [forecast]);

  return {
    forecast: forecast.projections,
    confidence: forecast.confidence,
    scenarios: forecast.scenarios,
    anomalies: forecast.anomalies,
    model: forecast.model,
    summary,
    forecastHorizon,
    recomputeForecast
  };
}
