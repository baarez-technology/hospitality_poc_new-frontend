// AI Suggestion Cards
export const aiSuggestions = [
  {
    id: 1,
    icon: '📊',
    title: 'Revenue Insights',
    description: 'Show me today\'s revenue breakdown',
    prompt: 'What is today\'s revenue breakdown by source?'
  },
  {
    id: 2,
    icon: '🏨',
    title: 'Occupancy Status',
    description: 'Check current occupancy rate',
    prompt: 'What is the current occupancy rate and available rooms?'
  },
  {
    id: 3,
    icon: '⭐',
    title: 'Recent Reviews',
    description: 'Summarize latest guest reviews',
    prompt: 'Summarize the most recent guest reviews and sentiment'
  },
  {
    id: 4,
    icon: '👥',
    title: 'Guest Analytics',
    description: 'Show VIP and at-risk guests',
    prompt: 'Show me VIP guests and guests at risk of churning'
  },
  {
    id: 5,
    icon: '📈',
    title: 'Performance Trends',
    description: 'Analyze this month\'s performance',
    prompt: 'How is our performance trending this month compared to last month?'
  },
  {
    id: 6,
    icon: '🔔',
    title: 'Action Items',
    description: 'List pending tasks and alerts',
    prompt: 'What are my pending tasks and important alerts today?'
  },
  {
    id: 7,
    icon: '💰',
    title: 'Forecast Revenue',
    description: 'Predict next month\'s revenue',
    prompt: 'What is the revenue forecast for next month?'
  },
  {
    id: 8,
    icon: '🎯',
    title: 'Goal Progress',
    description: 'Check goal completion status',
    prompt: 'Show my progress towards monthly goals'
  }
];

export const contextualSuggestions = {
  dashboard: [
    'Summarize today\'s key metrics',
    'Show me any unusual trends or anomalies',
    'What needs my immediate attention?'
  ],
  bookings: [
    'Show upcoming check-ins for today',
    'List cancelled bookings this week',
    'What is the average booking lead time?'
  ],
  housekeeping: [
    'Which rooms need immediate attention?',
    'Show housekeeping efficiency metrics',
    'List overdue maintenance tasks'
  ],
  revenue: [
    'Compare revenue to last month',
    'Show top revenue sources',
    'Analyze pricing optimization opportunities'
  ],
  reputation: [
    'Summarize sentiment from recent reviews',
    'Which issues are mentioned most frequently?',
    'Show top performing review platforms'
  ],
  crm: [
    'List guests with upcoming birthdays',
    'Show high-value guests due for engagement',
    'Identify retention opportunities'
  ]
};
