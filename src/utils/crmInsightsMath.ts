// CRM AI Insights Engine
// Generate actionable insights from guest data patterns

import { segmentGuests } from './crmSegmentationMath';
import { batchForecastLTV } from './crmLTVMath';

/**
 * Generate all AI insights from guest data
 */
export function generateInsights(guests) {
  if (!guests || guests.length === 0) {
    return [];
  }

  const insights = [];
  const segments = segmentGuests(guests);

  // 1. At-Risk Guest Insight
  if (segments.atRisk.length > 0) {
    const atRiskPercent = (segments.atRisk.length / guests.length * 100).toFixed(1);
    const lostRevenue = segments.atRisk.reduce((sum, g) => sum + g.averageSpend, 0);

    insights.push({
      id: 'at-risk-guests',
      type: 'alert',
      priority: segments.atRisk.length > guests.length * 0.2 ? 'high' : 'medium',
      title: `${segments.atRisk.length} At-Risk Guests Identified`,
      message: `${segments.atRisk.length} guests (${atRiskPercent}%) are at risk of churning due to low satisfaction, long gaps, or negative reviews. Immediate re-engagement needed to prevent revenue loss.`,
      metric: `${segments.atRisk.length} guests`,
      confidence: 92,
      severity: 'high',
      suggestedAction: 'Launch targeted win-back campaign with personalized offers',
      actionItems: [
        'Send personalized re-engagement emails',
        'Offer special comeback discount (15-20%)',
        'Conduct satisfaction surveys'
      ],
      estimatedLoss: `-₹${Math.round(lostRevenue).toLocaleString()}`,
      impact: 'High'
    });
  }

  // 2. VIP Segment Growth
  if (segments.vip.length > 0) {
    const vipPercent = (segments.vip.length / guests.length * 100).toFixed(1);
    const vipRevenue = segments.vip.reduce((sum, g) => sum + g.totalSpend, 0);
    const avgVIPLTV = Math.round(vipRevenue / segments.vip.length);

    insights.push({
      id: 'vip-opportunity',
      type: 'opportunity',
      priority: 'high',
      title: 'VIP Segment High-Value Opportunity',
      message: `Your ${segments.vip.length} VIP guests (${vipPercent}%) contribute ${((vipRevenue / guests.reduce((sum, g) => sum + g.totalSpend, 0)) * 100).toFixed(1)}% of total revenue. Average VIP LTV is ₹${avgVIPLTV}. Prioritize VIP retention and upsell programs.`,
      metric: `${segments.vip.length} VIP guests`,
      confidence: 95,
      severity: 'medium',
      suggestedAction: 'Implement VIP rewards program and exclusive benefits',
      actionItems: [
        'Create exclusive VIP tier benefits',
        'Offer room upgrades and late checkout',
        'Send birthday/anniversary perks'
      ],
      estimatedRevenue: `+₹${Math.round(vipRevenue * 0.15).toLocaleString()}`,
      impact: 'High'
    });
  }

  // 3. OTA vs Direct Booking Insight
  const otaGuests = segments.ota;
  const directGuests = guests.filter(g => g.source === 'direct');

  if (otaGuests.length > directGuests.length) {
    const otaPercent = (otaGuests.length / guests.length * 100).toFixed(1);
    const directPercent = (directGuests.length / guests.length * 100).toFixed(1);

    const avgOTALTV = otaGuests.length > 0 ? otaGuests.reduce((sum, g) => sum + g.totalSpend, 0) / otaGuests.length : 0;
    const avgDirectLTV = directGuests.length > 0 ? directGuests.reduce((sum, g) => sum + g.totalSpend, 0) / directGuests.length : 0;

    insights.push({
      id: 'ota-dependency',
      type: 'recommendation',
      priority: 'medium',
      title: 'High OTA Dependency Detected',
      message: `${otaPercent}% of guests book via OTAs vs ${directPercent}% direct. Direct bookers have ${((avgDirectLTV - avgOTALTV) / avgOTALTV * 100).toFixed(0)}% higher LTV. Shift channel mix toward direct bookings to increase profitability.`,
      metric: `${otaPercent}% OTA bookings`,
      confidence: 88,
      severity: 'medium',
      suggestedAction: 'Launch "Book Direct" incentive campaign',
      actionItems: [
        'Offer exclusive member-only rates',
        'Increase loyalty points for direct bookings',
        'Create retargeting ads for direct bookings'
      ],
      estimatedRevenue: `+₹${Math.round((avgDirectLTV - avgOTALTV) * otaGuests.length * 0.2).toLocaleString()}`,
      impact: 'Medium'
    });
  }

  // 4. Corporate Segment Growth
  if (segments.corporate.length > 0) {
    const corpPercent = (segments.corporate.length / guests.length * 100).toFixed(1);
    const corpRevenue = segments.corporate.reduce((sum, g) => sum + g.totalSpend, 0);

    insights.push({
      id: 'corporate-expansion',
      type: 'opportunity',
      priority: 'medium',
      title: 'Corporate Segment Expansion Potential',
      message: `Corporate guests represent ${corpPercent}% of bookings and generate steady revenue. Target similar businesses for new corporate partnerships to grow this segment.`,
      metric: `${segments.corporate.length} corporate guests`,
      confidence: 78,
      severity: 'low',
      suggestedAction: 'Develop corporate partnership program',
      actionItems: [
        'Create corporate benefits package',
        'Reach out to local tech/finance companies',
        'Offer volume-based discounts'
      ],
      estimatedRevenue: `+₹${Math.round(corpRevenue * 0.3).toLocaleString()}`,
      impact: 'Medium'
    });
  }

  // 5. New Guest Retention
  const newGuests = segments.new;
  if (newGuests.length > 0) {
    const newPercent = (newGuests.length / guests.length * 100).toFixed(1);
    const conversionPotential = Math.round(newGuests.length * 0.4);

    insights.push({
      id: 'new-guest-retention',
      type: 'recommendation',
      priority: 'medium',
      title: 'New Guest Retention Opportunity',
      message: `${newGuests.length} guests (${newPercent}%) have only stayed once. Converting 40% to repeat guests would add significant LTV. Implement first-stay follow-up campaign.`,
      metric: `${newGuests.length} first-time guests`,
      confidence: 82,
      severity: 'medium',
      suggestedAction: 'Create automated post-stay nurture sequence',
      actionItems: [
        'Send thank-you email after first stay',
        'Offer second-stay discount (10-15%)',
        'Request feedback and reviews'
      ],
      estimatedRevenue: `+₹${Math.round(conversionPotential * 800).toLocaleString()}`,
      impact: 'Medium'
    });
  }

  // 6. Sentiment Trend Alert
  const lowSentimentGuests = guests.filter(g => g.sentimentScore < 0.5);
  if (lowSentimentGuests.length > guests.length * 0.15) {
    const lowSentPercent = (lowSentimentGuests.length / guests.length * 100).toFixed(1);

    // Analyze complaint keywords
    const complaints = lowSentimentGuests.flatMap(g => g.complaints);
    const issueCount = {};
    complaints.forEach(c => {
      issueCount[c.issue] = (issueCount[c.issue] || 0) + 1;
    });
    const topIssue = Object.keys(issueCount).sort((a, b) => issueCount[b] - issueCount[a])[0];

    insights.push({
      id: 'sentiment-alert',
      type: 'alert',
      priority: 'high',
      title: 'Negative Sentiment Trend Detected',
      message: `${lowSentPercent}% of guests show low satisfaction scores. Top complaint: "${topIssue}". Address service quality issues immediately to prevent further damage.`,
      metric: `${lowSentimentGuests.length} dissatisfied guests`,
      confidence: 91,
      severity: 'high',
      suggestedAction: 'Investigate and resolve top complaint issues',
      actionItems: [
        `Address ${topIssue} complaints with operations team`,
        'Implement service recovery for affected guests',
        'Monitor satisfaction scores weekly'
      ],
      estimatedLoss: `-₹${Math.round(lowSentimentGuests.length * 600).toLocaleString()}`,
      impact: 'High'
    });
  }

  // 7. Loyal Guest Insight
  if (segments.loyal.length > 0) {
    const loyalPercent = (segments.loyal.length / guests.length * 100).toFixed(1);
    const loyalRevenue = segments.loyal.reduce((sum, g) => sum + g.totalSpend, 0);

    insights.push({
      id: 'loyal-guests',
      type: 'insight',
      priority: 'low',
      title: 'Strong Loyal Guest Base',
      message: `${segments.loyal.length} guests (${loyalPercent}%) are highly loyal with consistent visits and high satisfaction. These guests drive ${((loyalRevenue / guests.reduce((sum, g) => sum + g.totalSpend, 0)) * 100).toFixed(1)}% of revenue. Continue nurturing this segment.`,
      metric: `${loyalPercent}% loyal guests`,
      confidence: 96,
      severity: 'low',
      suggestedAction: 'Maintain loyalty program benefits',
      actionItems: [
        'Send quarterly appreciation messages',
        'Offer exclusive events or experiences',
        'Request referrals from loyal guests'
      ],
      estimatedRevenue: `+₹${Math.round(loyalRevenue * 0.1).toLocaleString()}`,
      impact: 'Low'
    });
  }

  // 8. Dormant Guest Recovery
  if (segments.dormant.length > 0) {
    const dormantPercent = (segments.dormant.length / guests.length * 100).toFixed(1);
    const recoveryPotential = Math.round(segments.dormant.length * 0.25);

    insights.push({
      id: 'dormant-recovery',
      type: 'opportunity',
      priority: 'medium',
      title: 'Dormant Guest Reactivation Opportunity',
      message: `${segments.dormant.length} guests (${dormantPercent}%) haven't visited in 6-12 months. Reactivating 25% would add substantial revenue. Launch win-back campaign.`,
      metric: `${segments.dormant.length} dormant guests`,
      confidence: 73,
      severity: 'medium',
      suggestedAction: 'Create dormant guest reactivation campaign',
      actionItems: [
        'Send "We miss you" emails with offers',
        'Provide exclusive comeback incentive',
        'Survey to understand absence reasons'
      ],
      estimatedRevenue: `+₹${Math.round(recoveryPotential * 700).toLocaleString()}`,
      impact: 'Medium'
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return insights;
}

/**
 * Get insight summary statistics
 */
export function getInsightsSummary(insights) {
  return {
    total: insights.length,
    high: insights.filter(i => i.priority === 'high').length,
    medium: insights.filter(i => i.priority === 'medium').length,
    low: insights.filter(i => i.priority === 'low').length,
    avgConfidence: Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length),
    totalEstimatedRevenue: insights
      .filter(i => i.estimatedRevenue)
      .reduce((sum, i) => {
        const match = i.estimatedRevenue.match(/[\d,]+/);
        return sum + (match ? parseInt(match[0].replace(/,/g, '')) : 0);
      }, 0),
    totalEstimatedLoss: insights
      .filter(i => i.estimatedLoss)
      .reduce((sum, i) => {
        const match = i.estimatedLoss.match(/[\d,]+/);
        return sum + (match ? parseInt(match[0].replace(/,/g, '')) : 0);
      }, 0)
  };
}
