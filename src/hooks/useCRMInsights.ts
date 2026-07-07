import { useMemo } from 'react';
import { generateInsights, getInsightsSummary } from '../utils/crmInsightsMath';

/**
 * CRM AI Insights Hook
 * Generates actionable insights from guest data patterns
 */
export function useCRMInsights(guests) {
  const insights = useMemo(() => {
    if (!guests || guests.length === 0) return [];
    return generateInsights(guests);
  }, [guests]);

  const insightsSummary = useMemo(() => {
    if (insights.length === 0) {
      return {
        total: 0,
        high: 0,
        medium: 0,
        low: 0,
        avgConfidence: 0,
        totalEstimatedRevenue: 0,
        totalEstimatedLoss: 0
      };
    }

    return getInsightsSummary(insights);
  }, [insights]);

  // Get high priority insights for quick view
  const highPriorityInsights = useMemo(() => {
    return insights.filter(i => i.priority === 'high');
  }, [insights]);

  // Get actionable insights (those requiring immediate action)
  const actionableInsights = useMemo(() => {
    return insights.filter(i => i.actionItems && i.actionItems.length > 0);
  }, [insights]);

  return {
    insights,
    insightsSummary,
    highPriorityInsights,
    actionableInsights
  };
}
