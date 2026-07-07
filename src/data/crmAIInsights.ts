// CRM AI Insights Data
export const crmAIInsights = [
  {
    id: 1,
    type: 'opportunity',
    priority: 'high',
    title: 'VIP Segment Growth Opportunity',
    message: 'Your VIP segment has grown 8.5% this quarter. 23 Frequent Travelers are close to VIP criteria (1-2 bookings away). Implement a targeted upgrade campaign to convert them.',
    metric: '23 potential VIP upgrades',
    impact: 'High',
    actionItems: [
      'Send personalized upgrade offers to 23 guests',
      'Offer bonus points for next booking',
      'Highlight VIP tier benefits'
    ],
    estimatedRevenue: '+\u20B939,42,500',
    confidence: 87
  },
  {
    id: 2,
    type: 'alert',
    priority: 'high',
    title: 'Churn Risk Detected',
    message: '34 previously active guests have not booked in 6+ months. Average LTV of this group is \u20B92,65,600. Implement win-back campaign immediately to prevent permanent churn.',
    metric: '34 guests at risk',
    impact: 'High',
    actionItems: [
      'Send personalized re-engagement emails',
      'Offer special comeback discount (15-20%)',
      'Survey reasons for absence'
    ],
    estimatedLoss: '-\u20B990,30,400',
    confidence: 92
  },
  {
    id: 3,
    type: 'recommendation',
    priority: 'medium',
    title: 'Corporate Account Expansion',
    message: 'Corporate segment shows strongest growth (+15.2%) and highest average LTV (\u20B94,32,000). TechCorp and DataSystems are your top corporate clients. Target 5 similar companies for new partnerships.',
    metric: '+15.2% growth',
    impact: 'Medium',
    actionItems: [
      'Create corporate benefits package',
      'Reach out to similar tech companies',
      'Offer volume-based discounts'
    ],
    estimatedRevenue: '+\u20B953,95,000/year',
    confidence: 78
  },
  {
    id: 4,
    type: 'insight',
    priority: 'medium',
    title: 'Booking Pattern Analysis',
    message: 'Guests who book directly through your website have 38% higher LTV (\u20B93,48,600 vs \u20B92,53,150) compared to OTA bookings. Increase direct booking incentives to shift channel mix.',
    metric: '38% higher LTV',
    impact: 'Medium',
    actionItems: [
      'Enhance member-exclusive rates',
      'Increase loyalty points for direct bookings',
      'Launch "Book Direct" campaign'
    ],
    estimatedRevenue: '+\u20B973,87,000/year',
    confidence: 94
  },
  {
    id: 5,
    type: 'opportunity',
    priority: 'medium',
    title: 'Birthday & Anniversary Campaigns',
    message: '23 guests have birthdays this month and 15 have stay anniversaries. Personalized celebration offers have 67% conversion rate. Automated campaigns could generate significant repeat bookings.',
    metric: '38 celebration opportunities',
    impact: 'Medium',
    actionItems: [
      'Send birthday/anniversary emails',
      'Offer celebration package discount',
      'Include complimentary amenity'
    ],
    estimatedRevenue: '+\u20B915,35,500',
    confidence: 82
  },
  {
    id: 6,
    type: 'insight',
    priority: 'low',
    title: 'Seasonal Booking Trends',
    message: 'Guest acquisition peaks in October (+195 new guests) and dips in February (-45%). Plan marketing budget allocation accordingly. Early-bird campaigns for low seasons show 23% higher conversion.',
    metric: 'Oct: +195 | Feb: -45',
    impact: 'Low',
    actionItems: [
      'Increase winter season promotions',
      'Launch early-bird campaigns in November',
      'Adjust marketing spend seasonally'
    ],
    estimatedRevenue: '+\u20B928,22,000',
    confidence: 71
  },
  {
    id: 7,
    type: 'recommendation',
    priority: 'medium',
    title: 'Loyalty Program Optimization',
    message: 'Guests in loyalty tiers book 3.2x more frequently than non-members. However, 847 active guests are not enrolled. Auto-enrollment could increase repeat bookings by 18-25%.',
    metric: '847 non-enrolled guests',
    impact: 'Medium',
    actionItems: [
      'Auto-enroll active guests in loyalty program',
      'Send welcome package to new members',
      'Highlight tier upgrade paths'
    ],
    estimatedRevenue: '+\u20B91,03,75,000/year',
    confidence: 85
  },
  {
    id: 8,
    type: 'alert',
    priority: 'high',
    title: 'Review Response Rate Low',
    message: '12 VIP guests left reviews in the past 30 days, but only 5 received responses. VIP guests expect acknowledgment within 24 hours. Low response rate may impact retention and satisfaction scores.',
    metric: '58% response rate',
    impact: 'High',
    actionItems: [
      'Respond to all pending VIP reviews',
      'Set up auto-alerts for VIP reviews',
      'Create response templates for efficiency'
    ],
    estimatedImpact: 'Retention +5-8%',
    confidence: 91
  }
];

export const insightsSummary = {
  totalInsights: 8,
  highPriority: 3,
  mediumPriority: 4,
  lowPriority: 1,

  totalEstimatedRevenue: 31499000,
  totalEstimatedLoss: 9030000,
  netOpportunity: 22468000,

  avgConfidence: 85,
  actionItemsTotal: 24
};

export const insightCategories = [
  { category: 'Growth Opportunities', count: 3 },
  { category: 'Risk Mitigation', count: 2 },
  { category: 'Optimization', count: 2 },
  { category: 'Trends Analysis', count: 1 }
];

export const previousInsights = {
  implemented: 12,
  inProgress: 5,
  pending: 3,
  successRate: 87,
  avgROI: '245%'
};
