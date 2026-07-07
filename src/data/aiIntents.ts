/**
 * AI Intent Definitions
 * Defines all possible intents that Glimmora AI can understand
 */

export const AI_INTENTS = {
  // Data Display Intents
  SHOW_ROOMS: 'show_rooms',
  SHOW_GUESTS: 'show_guests',
  SHOW_BOOKINGS: 'show_bookings',
  BOOKINGS_TODAY: 'bookings_today',
  CHECKOUTS_TODAY: 'checkouts_today',
  SHOW_REVENUE: 'show_revenue',
  SHOW_REVIEWS: 'show_reviews',
  SHOW_STAFF: 'show_staff',
  SHOW_OCCUPANCY: 'show_occupancy',
  SHOW_FORECAST: 'show_forecast',

  // Action Intents
  CLEAN_ROOM: 'clean_room',
  ASSIGN_STAFF: 'assign_staff',
  BLOCK_ROOM: 'block_room',
  UNBLOCK_ROOM: 'unblock_room',
  CREATE_BOOKING: 'create_booking',
  CANCEL_BOOKING: 'cancel_booking',

  // Summary Intents
  SUMMARIZE_HOUSEKEEPING: 'summarize_housekeeping',
  SUMMARIZE_REVENUE: 'summarize_revenue',
  SUMMARIZE_REVIEWS: 'summarize_reviews',
  SUMMARIZE_CRM: 'summarize_crm',
  SUMMARIZE_DAILY: 'summarize_daily',

  // CRM Intents
  LIST_VIP_GUESTS: 'list_vip_guests',
  LIST_AT_RISK_GUESTS: 'list_at_risk_guests',
  GUEST_PROFILE: 'guest_profile',
  GUEST_HISTORY: 'guest_history',

  // Housekeeping Intents
  LIST_DIRTY_ROOMS: 'list_dirty_rooms',
  LIST_CLEAN_ROOMS: 'list_clean_rooms',
  LIST_BLOCKED_ROOMS: 'list_blocked_rooms',
  LIST_IN_PROGRESS_ROOMS: 'list_in_progress_rooms',

  // Revenue Intents
  REVENUE_TODAY: 'revenue_today',
  REVENUE_WEEK: 'revenue_week',
  REVENUE_MONTH: 'revenue_month',
  PREDICT_OCCUPANCY: 'predict_occupancy',
  PREDICT_REVENUE: 'predict_revenue',

  // Reputation Intents
  NEGATIVE_REVIEWS: 'negative_reviews',
  POSITIVE_REVIEWS: 'positive_reviews',
  PLATFORM_RATINGS: 'platform_ratings',
  SENTIMENT_ANALYSIS: 'sentiment_analysis',

  // General Intents
  HELP: 'help',
  GREETING: 'greeting',
  UNKNOWN: 'unknown'
};

/**
 * Intent patterns for matching user input
 */
export const INTENT_PATTERNS = [
  // Bookings Today (most specific - check first)
  {
    intent: AI_INTENTS.BOOKINGS_TODAY,
    patterns: [
      /bookings?\s+today/i,
      /today'?s?\s+bookings?/i,
      /(how\s+many|show|list|get|what|any).*(booking|reservation|arrival|guest).*(today|tonight)/i,
      /today.*(booking|arrival|reservation|coming|checking\s*in)/i,
      /(arrival|check.?in|arr?iving|coming).*(today|tonight)/i,
      /who.*(arr?iving|coming|checking\s*in).*(today)?/i,
      /(any|are\s+there|do\s+we\s+have).*(guest|booking|arrival).*(today|expected)/i,
      /guests?\s+(has\s+)?booked.*(today|with\s+us\s+today)/i,
      /how\s+many\s+guests?\s+(has\s+)?booked/i,
      /how\s+many\s+(guests?|people|bookings?).*(arr?iving|coming|expected|checking\s*in)\s*(today)?/i,
      /guests?\s+(arr?iving|coming|expected|checking\s*in)\s*today/i,
      /(arrivals?|check.?ins?)\s*today/i,
      /expected\s+(arrivals?|guests?|bookings?)/i,
      /how\s+many\s+(are\s+)?(arr?iving|coming|expected)\s*today/i,
      /guest.*(arr?iv|com).*(today)/i
    ],
    keywords: ['bookings', 'today', 'arrivals', 'arriving', 'ariving', 'booked', 'reservation', 'expected', 'coming', 'check-in']
  },

  // Checkouts Today
  {
    intent: AI_INTENTS.CHECKOUTS_TODAY,
    patterns: [
      /(checkout|check.?out|departure|leaving|departing).*(today)/i,
      /who.*(checking\s*out|leaving|departing)/i,
      /today.*(checkout|departure|leaving)/i,
      /(any|how\s+many).*(checkout|departure).*(today)?/i
    ],
    keywords: ['checkout', 'checkouts', 'departing', 'leaving', 'departure']
  },

  // Show Bookings (general)
  {
    intent: AI_INTENTS.SHOW_BOOKINGS,
    patterns: [
      /show\s+(me\s+)?(all\s+)?bookings?/i,
      /list\s+(all\s+)?bookings?/i,
      /(how\s+many|show|list|get|find|display|view).*(booking|reservation)/i,
      /(booking|reservation).*(list|show|count|all|total)/i,
      /all\s*(the\s*)?(booking|reservation)/i
    ],
    keywords: ['bookings', 'reservations', 'show', 'list']
  },

  // Show Rooms
  {
    intent: AI_INTENTS.SHOW_ROOMS,
    patterns: [
      /show\s+(me\s+)?(all\s+)?rooms/i,
      /list\s+(all\s+)?rooms/i,
      /which\s+rooms/i,
      /room\s+status/i,
      /available\s+rooms/i,
      /(how\s+many|total|number\s+of|count).*(room)/i,
      /rooms?\s+(we\s+have|do\s+we\s+have|are\s+there)/i,
      /how\s+many\s+rooms?\s+(we\s+have|do\s+we\s+have|are\s+there|in\s+total)/i,
      /total\s+rooms?/i,
      /all\s+(the\s+)?rooms?/i
    ],
    keywords: ['show', 'list', 'rooms', 'available', 'status', 'how many', 'total', 'count']
  },

  // Show Guests
  {
    intent: AI_INTENTS.SHOW_GUESTS,
    patterns: [
      /show\s+(me\s+)?(all\s+)?guests/i,
      /list\s+(all\s+)?guests/i,
      /who\s+are\s+the\s+guests/i,
      /guest\s+list/i,
      /(how\s+many|total|number\s+of|count).*(guest|customer)/i,
      /(guest|customer).*(count|total|number|how\s+many)/i,
      /guests?\s+(with\s+us|staying|in\s+house|checked\s*in|currently)/i,
      /how\s+many\s+(people|guests?)\s+(are\s+)?(there\s+)?(with\s+us|staying|here)/i,
      /how\s+many\s+guests?\s+(are\s+there|do\s+we\s+have|we\s+have)/i,
      /current\s+guests?/i,
      /all\s+(the\s+)?guests/i,
      /guests?\s+(we\s+have|do\s+we\s+have)/i
    ],
    keywords: ['show', 'list', 'guests', 'visitors', 'customers', 'how many', 'total', 'count', 'with us']
  },

  // List VIP Guests
  {
    intent: AI_INTENTS.LIST_VIP_GUESTS,
    patterns: [
      /show\s+(me\s+)?vip\s+guests/i,
      /list\s+vip\s+guests/i,
      /who\s+are\s+(the\s+)?vips/i,
      /vip\s+list/i,
      /high\s+value\s+guests/i
    ],
    keywords: ['vip', 'high value', 'premium', 'top guests']
  },

  // List At-Risk Guests
  {
    intent: AI_INTENTS.LIST_AT_RISK_GUESTS,
    patterns: [
      /show\s+(me\s+)?at[\s-]?risk\s+guests/i,
      /list\s+at[\s-]?risk/i,
      /which\s+guests\s+are\s+at\s+risk/i,
      /unhappy\s+guests/i
    ],
    keywords: ['at-risk', 'at risk', 'unhappy', 'dissatisfied']
  },

  // List Dirty Rooms
  {
    intent: AI_INTENTS.LIST_DIRTY_ROOMS,
    patterns: [
      /show\s+(me\s+)?dirty\s+rooms/i,
      /list\s+dirty\s+rooms/i,
      /which\s+rooms\s+are\s+dirty/i,
      /rooms\s+that\s+need\s+cleaning/i,
      /unclean\s+rooms/i
    ],
    keywords: ['dirty', 'unclean', 'need cleaning']
  },

  // List Clean Rooms
  {
    intent: AI_INTENTS.LIST_CLEAN_ROOMS,
    patterns: [
      /show\s+(me\s+)?clean\s+rooms/i,
      /list\s+clean\s+rooms/i,
      /which\s+rooms\s+are\s+clean/i,
      /cleaned\s+rooms/i
    ],
    keywords: ['clean', 'cleaned', 'ready']
  },

  // Clean Room Action
  {
    intent: AI_INTENTS.CLEAN_ROOM,
    patterns: [
      /clean\s+room\s+(\d+)/i,
      /mark\s+room\s+(\d+)\s+as\s+clean/i,
      /set\s+room\s+(\d+)\s+to\s+clean/i
    ],
    keywords: ['clean', 'mark', 'set']
  },

  // Assign Staff
  {
    intent: AI_INTENTS.ASSIGN_STAFF,
    patterns: [
      /assign\s+(\w+)\s+to\s+room\s+(\d+)/i,
      /give\s+room\s+(\d+)\s+to\s+(\w+)/i,
      /(\w+)\s+should\s+clean\s+room\s+(\d+)/i
    ],
    keywords: ['assign', 'give', 'allocate']
  },

  // Block Room
  {
    intent: AI_INTENTS.BLOCK_ROOM,
    patterns: [
      /block\s+room\s+(\d+)/i,
      /disable\s+room\s+(\d+)/i,
      /mark\s+room\s+(\d+)\s+as\s+blocked/i,
      /out\s+of\s+service\s+room\s+(\d+)/i
    ],
    keywords: ['block', 'disable', 'out of service']
  },

  // Show Revenue
  {
    intent: AI_INTENTS.SHOW_REVENUE,
    patterns: [
      /show\s+(me\s+)?revenue/i,
      /what'?s\s+(the\s+)?revenue/i,
      /how\s+much\s+revenue/i,
      /total\s+revenue/i,
      /income/i,
      /earnings/i
    ],
    keywords: ['revenue', 'income', 'earnings', 'sales']
  },

  // Revenue Today
  {
    intent: AI_INTENTS.REVENUE_TODAY,
    patterns: [
      /revenue\s+today/i,
      /today'?s\s+revenue/i,
      /how\s+much\s+did\s+we\s+make\s+today/i
    ],
    keywords: ['revenue', 'today']
  },

  // Predict Occupancy
  {
    intent: AI_INTENTS.PREDICT_OCCUPANCY,
    patterns: [
      /predict\s+occupancy/i,
      /forecast\s+occupancy/i,
      /expected\s+occupancy/i,
      /occupancy\s+prediction/i,
      /occupancy\s+forecast/i
    ],
    keywords: ['predict', 'forecast', 'occupancy', 'expected']
  },

  // Show Reviews
  {
    intent: AI_INTENTS.SHOW_REVIEWS,
    patterns: [
      /show\s+(me\s+)?reviews/i,
      /list\s+reviews/i,
      /what\s+are\s+the\s+reviews/i,
      /recent\s+reviews/i,
      /latest\s+reviews/i
    ],
    keywords: ['reviews', 'feedback', 'ratings']
  },

  // Negative Reviews
  {
    intent: AI_INTENTS.NEGATIVE_REVIEWS,
    patterns: [
      /negative\s+reviews/i,
      /bad\s+reviews/i,
      /poor\s+reviews/i,
      /low\s+ratings/i,
      /complaints/i
    ],
    keywords: ['negative', 'bad', 'poor', 'complaints']
  },

  // Summarize Housekeeping
  {
    intent: AI_INTENTS.SUMMARIZE_HOUSEKEEPING,
    patterns: [
      /summarize\s+housekeeping/i,
      /housekeeping\s+summary/i,
      /housekeeping\s+status/i,
      /cleaning\s+status/i,
      /housekeeping\s+overview/i
    ],
    keywords: ['summarize', 'summary', 'housekeeping', 'cleaning', 'overview']
  },

  // Summarize CRM
  {
    intent: AI_INTENTS.SUMMARIZE_CRM,
    patterns: [
      /summarize\s+crm/i,
      /crm\s+summary/i,
      /guest\s+summary/i,
      /customer\s+overview/i
    ],
    keywords: ['crm', 'guests', 'customers', 'summary']
  },

  // Show Occupancy
  {
    intent: AI_INTENTS.SHOW_OCCUPANCY,
    patterns: [
      /show\s+(me\s+)?occupancy/i,
      /what'?s\s+(the\s+)?occupancy/i,
      /occupancy\s+rate/i,
      /how\s+full\s+are\s+we/i
    ],
    keywords: ['occupancy', 'full', 'capacity']
  },

  // Help
  {
    intent: AI_INTENTS.HELP,
    patterns: [
      /help/i,
      /what\s+can\s+you\s+do/i,
      /how\s+do\s+i/i,
      /commands/i,
      /capabilities/i
    ],
    keywords: ['help', 'how', 'what can you do', 'commands']
  },

  // Greeting
  {
    intent: AI_INTENTS.GREETING,
    patterns: [
      /^(hi|hello|hey|greetings)/i,
      /good\s+(morning|afternoon|evening)/i
    ],
    keywords: ['hi', 'hello', 'hey', 'good morning']
  }
];

/**
 * Entity types that can be extracted
 */
export const ENTITY_TYPES = {
  ROOM_NUMBER: 'room_number',
  GUEST_NAME: 'guest_name',
  STAFF_NAME: 'staff_name',
  DATE: 'date',
  DATE_RANGE: 'date_range',
  TIME_PERIOD: 'time_period',
  AMOUNT: 'amount',
  STATUS: 'status',
  SEGMENT: 'segment',
  PLATFORM: 'platform',
  SENTIMENT: 'sentiment'
};

/**
 * Status keywords
 */
export const STATUS_KEYWORDS = {
  DIRTY: ['dirty', 'unclean', 'messy'],
  CLEAN: ['clean', 'cleaned', 'ready'],
  BLOCKED: ['blocked', 'disabled', 'out of service'],
  IN_PROGRESS: ['in progress', 'cleaning', 'being cleaned']
};

/**
 * Segment keywords
 */
export const SEGMENT_KEYWORDS = {
  VIP: ['vip', 'premium', 'high value', 'platinum'],
  AT_RISK: ['at-risk', 'at risk', 'unhappy', 'dissatisfied'],
  NEW: ['new', 'first time', 'first-time'],
  RETURNING: ['returning', 'repeat', 'loyal'],
  CORPORATE: ['corporate', 'business']
};

/**
 * Time period keywords
 */
export const TIME_PERIOD_KEYWORDS = {
  TODAY: ['today', 'this day'],
  YESTERDAY: ['yesterday'],
  THIS_WEEK: ['this week', 'current week'],
  LAST_WEEK: ['last week', 'previous week'],
  THIS_MONTH: ['this month', 'current month'],
  LAST_MONTH: ['last month', 'previous month'],
  THIS_WEEKEND: ['this weekend', 'weekend'],
  NEXT_WEEK: ['next week'],
  NEXT_MONTH: ['next month']
};

