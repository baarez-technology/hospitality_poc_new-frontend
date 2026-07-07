/**
 * AI Sample Commands
 * Example commands users can use with Glimmora AI
 */

export const AI_SAMPLE_COMMANDS = {
  // Housekeeping Commands
  housekeeping: [
    "Show me all dirty rooms",
    "List rooms that need cleaning",
    "Which rooms are clean?",
    "Clean room 305",
    "Mark room 204 as clean",
    "Assign Maria to room 310",
    "Block room 118",
    "Show me rooms in progress",
    "Summarize housekeeping status"
  ],

  // CRM Commands
  crm: [
    "List all VIP guests",
    "Show me at-risk guests",
    "Who are our top guests?",
    "Show guest profile for John Carter",
    "List corporate guests",
    "How many VIP guests visited last month?",
    "Summarize CRM data"
  ],

  // Revenue Commands
  revenue: [
    "Show me today's revenue",
    "What's the revenue this week?",
    "Revenue for this month",
    "Predict occupancy for this weekend",
    "Forecast revenue for next month",
    "What's our current occupancy rate?"
  ],

  // Reputation Commands
  reputation: [
    "Show me recent reviews",
    "List negative reviews",
    "Summarize all reviews this week",
    "What are our platform ratings?",
    "Show sentiment analysis",
    "Which platforms have bad reviews?"
  ],

  // Booking Commands
  bookings: [
    "Show today's check-ins",
    "List upcoming arrivals",
    "Who's checking out today?",
    "Create a booking for Sarah on Dec 15",
    "Show me all bookings this week"
  ],

  // General Commands
  general: [
    "Help",
    "What can you do?",
    "Show me today's summary",
    "Generate daily report"
  ]
};

/**
 * Quick action commands
 */
export const QUICK_ACTION_COMMANDS = {
  'Generate Report': 'Generate a comprehensive daily operations report with key metrics',
  'Draft Email': 'Help me draft a professional email to welcome new guests',
  'Analyze Data': 'Analyze today\'s revenue and occupancy data with insights',
  'Get Insights': 'Show me key insights and AI-powered recommendations for today',
  'Schedule Task': 'What are the priority tasks I should focus on today?',
  'Set Goal': 'Help me set performance goals and targets for this month'
};

/**
 * Contextual suggestions by page
 */
export const CONTEXTUAL_COMMANDS = {
  dashboard: [
    "Show me today's summary",
    "What are the key metrics?",
    "Generate daily report",
    "Show me today's alerts"
  ],

  housekeeping: [
    "List all dirty rooms",
    "Show rooms in progress",
    "Summarize housekeeping status",
    "Which rooms need urgent attention?"
  ],

  crm: [
    "List VIP guests",
    "Show at-risk guests",
    "Summarize guest segments",
    "Who are our top spenders?"
  ],

  revenue: [
    "Show today's revenue",
    "Predict occupancy",
    "What's our forecast?",
    "Compare revenue vs last month"
  ],

  reputation: [
    "Show recent reviews",
    "List negative feedback",
    "Sentiment analysis",
    "Platform ratings summary"
  ],

  bookings: [
    "Show today's arrivals",
    "List upcoming check-ins",
    "Who's checking out?",
    "Show occupancy rate"
  ]
};
