import { useMemo } from 'react';
import { calculateDemandScore, getOptimalPriceAdjustment } from '../utils/demandModel';

/**
 * Pricing Optimizer Hook
 * AI-powered dynamic pricing suggestions based on demand
 */
export function usePricingOptimizer(forecastData, currentPricing) {
  const pricingSuggestions = useMemo(() => {
    if (!forecastData || forecastData.length === 0 || !currentPricing) {
      return [];
    }

    const roomTypes = ['Standard', 'Premium', 'Deluxe', 'Suite'];
    const suggestions = [];

    roomTypes.forEach(roomType => {
      const basePriceMap = {
        'Standard': 149,
        'Premium': 189,
        'Deluxe': 249,
        'Suite': 349
      };

      const currentPrice = currentPricing[roomType] || basePriceMap[roomType];

      // Get next 7 days average demand
      const next7Days = forecastData.slice(0, 7);
      const avgOccupancy = next7Days.reduce((sum, d) => sum + (d.forecastOccupancy || d.occupancy || 0), 0) / next7Days.length;
      const avgDemandScore = next7Days.reduce((sum, d) => sum + (d.demandScore || 50), 0) / next7Days.length;

      // Calculate optimal adjustment
      const adjustment = getOptimalPriceAdjustment(avgDemandScore, avgOccupancy);

      const adjustmentPercent = adjustment.adjustment;
      const suggestedPrice = Math.round(currentPrice * (1 + adjustmentPercent / 100));
      const priceDiff = suggestedPrice - currentPrice;

      // Revenue impact estimation
      const estimatedRevenue = suggestedPrice * (avgOccupancy * 0.01 * 80); // 80 total rooms
      const currentRevenue = currentPrice * (avgOccupancy * 0.01 * 80);
      const revenueImpact = Math.round(((estimatedRevenue - currentRevenue) / currentRevenue) * 100);

      suggestions.push({
        roomType,
        currentPrice,
        suggestedPrice,
        adjustment: adjustmentPercent,
        priceDiff,
        reason: adjustment.reason,
        confidence: avgDemandScore > 70 ? 'High' : avgDemandScore > 50 ? 'Medium' : 'Low',
        demandScore: Math.round(avgDemandScore),
        avgOccupancy: Math.round(avgOccupancy),
        revenueImpact,
        action: adjustmentPercent > 0 ? 'increase' : adjustmentPercent < 0 ? 'decrease' : 'maintain'
      });
    });

    return suggestions;
  }, [forecastData, currentPricing]);

  // Get overall pricing strategy recommendation
  const strategy = useMemo(() => {
    if (pricingSuggestions.length === 0) return null;

    const avgAdjustment = pricingSuggestions.reduce((sum, s) => sum + s.adjustment, 0) / pricingSuggestions.length;
    const totalImpact = pricingSuggestions.reduce((sum, s) => sum + (s.priceDiff * s.avgOccupancy), 0);

    if (avgAdjustment > 5) {
      return {
        recommendation: 'Aggressive Pricing',
        description: 'Strong demand detected. Increase rates across all room types to maximize revenue.',
        expectedImpact: `+$${Math.round(totalImpact)}K/week`,
        confidence: 'High'
      };
    } else if (avgAdjustment > 0) {
      return {
        recommendation: 'Moderate Increase',
        description: 'Good demand levels. Consider modest rate increases to optimize revenue.',
        expectedImpact: `+$${Math.round(totalImpact)}K/week`,
        confidence: 'Medium'
      };
    } else if (avgAdjustment < -5) {
      return {
        recommendation: 'Promotional Pricing',
        description: 'Softer demand. Lower rates to stimulate bookings and maintain occupancy.',
        expectedImpact: `${Math.round(totalImpact)}K/week`,
        confidence: 'Medium'
      };
    } else {
      return {
        recommendation: 'Maintain Current Rates',
        description: 'Demand is balanced. Current pricing strategy appears optimal.',
        expectedImpact: 'Neutral',
        confidence: 'High'
      };
    }
  }, [pricingSuggestions]);

  return {
    pricingSuggestions,
    strategy
  };
}
