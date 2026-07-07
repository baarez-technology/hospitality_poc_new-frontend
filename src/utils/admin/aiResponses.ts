/**
 * AI Response Generator
 * Generates natural, friendly AI responses for different intents
 */

import { AI_INTENTS } from '@/data/aiIntents';

/**
 * Intent to response generator mapping
 * This ensures we handle both constant and string values for intents
 */
const RESPONSE_HANDLERS = {
  // Housekeeping
  [AI_INTENTS.LIST_DIRTY_ROOMS]: 'dirty_rooms',
  'list_dirty_rooms': 'dirty_rooms',
  [AI_INTENTS.LIST_CLEAN_ROOMS]: 'clean_rooms',
  'list_clean_rooms': 'clean_rooms',
  [AI_INTENTS.LIST_BLOCKED_ROOMS]: 'blocked_rooms',
  'list_blocked_rooms': 'blocked_rooms',
  [AI_INTENTS.CLEAN_ROOM]: 'clean_room_action',
  'clean_room': 'clean_room_action',
  [AI_INTENTS.ASSIGN_STAFF]: 'assign_staff',
  'assign_staff': 'assign_staff',
  [AI_INTENTS.BLOCK_ROOM]: 'block_room',
  'block_room': 'block_room',
  [AI_INTENTS.SUMMARIZE_HOUSEKEEPING]: 'housekeeping_summary',
  'summarize_housekeeping': 'housekeeping_summary',

  // CRM
  [AI_INTENTS.LIST_VIP_GUESTS]: 'vip_guests',
  'list_vip_guests': 'vip_guests',
  [AI_INTENTS.LIST_AT_RISK_GUESTS]: 'at_risk_guests',
  'list_at_risk_guests': 'at_risk_guests',
  [AI_INTENTS.SHOW_GUESTS]: 'show_guests',
  'show_guests': 'show_guests',
  [AI_INTENTS.SUMMARIZE_CRM]: 'crm_summary',
  'summarize_crm': 'crm_summary',

  // Revenue
  [AI_INTENTS.SHOW_REVENUE]: 'revenue',
  'show_revenue': 'revenue',
  [AI_INTENTS.REVENUE_TODAY]: 'revenue',
  'revenue_today': 'revenue',
  [AI_INTENTS.SHOW_OCCUPANCY]: 'occupancy',
  'show_occupancy': 'occupancy',
  [AI_INTENTS.PREDICT_OCCUPANCY]: 'occupancy_forecast',
  'predict_occupancy': 'occupancy_forecast',

  // Reviews
  [AI_INTENTS.SHOW_REVIEWS]: 'reviews',
  'show_reviews': 'reviews',
  [AI_INTENTS.NEGATIVE_REVIEWS]: 'negative_reviews',
  'negative_reviews': 'negative_reviews',
  [AI_INTENTS.SUMMARIZE_REVIEWS]: 'reviews_summary',
  'summarize_reviews': 'reviews_summary',

  // Bookings
  [AI_INTENTS.BOOKINGS_TODAY]: 'bookings_today',
  'bookings_today': 'bookings_today',
  [AI_INTENTS.CHECKOUTS_TODAY]: 'checkouts_today',
  'checkouts_today': 'checkouts_today',
  [AI_INTENTS.SHOW_BOOKINGS]: 'show_bookings',
  'show_bookings': 'show_bookings',

  // Rooms
  [AI_INTENTS.SHOW_ROOMS]: 'show_rooms',
  'show_rooms': 'show_rooms',

  // Staff
  [AI_INTENTS.SHOW_STAFF]: 'show_staff',
  'show_staff': 'show_staff',

  // General
  [AI_INTENTS.HELP]: 'help',
  'help': 'help',
  [AI_INTENTS.GREETING]: 'greeting',
  'greeting': 'greeting',
  [AI_INTENTS.UNKNOWN]: 'unknown',
  'unknown': 'unknown',
};

/**
 * Generate response based on intent and result data
 */
export function generateResponse(intent, result, entities = {}) {
  // Look up handler by intent (handles both constant and string values)
  const handlerKey = RESPONSE_HANDLERS[intent];

  if (handlerKey) {
    switch (handlerKey) {
      case 'dirty_rooms': return generateDirtyRoomsResponse(result);
      case 'clean_rooms': return generateCleanRoomsResponse(result);
      case 'blocked_rooms': return generateBlockedRoomsResponse(result);
      case 'clean_room_action': return generateCleanRoomActionResponse(result, entities);
      case 'assign_staff': return generateAssignStaffResponse(result, entities);
      case 'block_room': return generateBlockRoomResponse(result, entities);
      case 'housekeeping_summary': return generateHousekeepingSummaryResponse(result);
      case 'vip_guests': return generateVIPGuestsResponse(result);
      case 'at_risk_guests': return generateAtRiskGuestsResponse(result);
      case 'show_guests': return generateShowGuestsResponse(result);
      case 'crm_summary': return generateCRMSummaryResponse(result);
      case 'revenue': return generateRevenueResponse(result);
      case 'occupancy': return generateOccupancyResponse(result);
      case 'occupancy_forecast': return generateOccupancyForecastResponse(result);
      case 'reviews': return generateShowReviewsResponse(result);
      case 'negative_reviews': return generateNegativeReviewsResponse(result);
      case 'reviews_summary': return generateReviewsSummaryResponse(result);
      case 'bookings_today': return generateBookingsTodayResponse(result);
      case 'checkouts_today': return generateCheckoutsTodayResponse(result);
      case 'show_bookings': return generateShowBookingsResponse(result);
      case 'show_rooms': return generateShowRoomsResponse(result);
      case 'show_staff': return generateShowStaffResponse(result);
      case 'help': return generateHelpResponse();
      case 'greeting': return generateGreetingResponse();
      case 'unknown': return generateUnknownResponse();
    }
  }

  // Fallback: Try to match by switch (legacy support)
  switch (intent) {
    case AI_INTENTS.LIST_DIRTY_ROOMS:
      return generateDirtyRoomsResponse(result);

    case AI_INTENTS.LIST_CLEAN_ROOMS:
      return generateCleanRoomsResponse(result);

    case AI_INTENTS.LIST_BLOCKED_ROOMS:
      return generateBlockedRoomsResponse(result);

    case AI_INTENTS.CLEAN_ROOM:
      return generateCleanRoomActionResponse(result, entities);

    case AI_INTENTS.ASSIGN_STAFF:
      return generateAssignStaffResponse(result, entities);

    case AI_INTENTS.BLOCK_ROOM:
      return generateBlockRoomResponse(result, entities);

    case AI_INTENTS.LIST_VIP_GUESTS:
      return generateVIPGuestsResponse(result);

    case AI_INTENTS.LIST_AT_RISK_GUESTS:
      return generateAtRiskGuestsResponse(result);

    case AI_INTENTS.SHOW_REVENUE:
    case AI_INTENTS.REVENUE_TODAY:
      return generateRevenueResponse(result);

    case AI_INTENTS.PREDICT_OCCUPANCY:
      return generateOccupancyForecastResponse(result);

    case AI_INTENTS.SHOW_OCCUPANCY:
      return generateOccupancyResponse(result);

    case AI_INTENTS.NEGATIVE_REVIEWS:
      return generateNegativeReviewsResponse(result);

    case AI_INTENTS.SUMMARIZE_HOUSEKEEPING:
      return generateHousekeepingSummaryResponse(result);

    case AI_INTENTS.SUMMARIZE_CRM:
      return generateCRMSummaryResponse(result);

    case AI_INTENTS.SUMMARIZE_REVIEWS:
      return generateReviewsSummaryResponse(result);

    case AI_INTENTS.BOOKINGS_TODAY:
      return generateBookingsTodayResponse(result);

    case AI_INTENTS.CHECKOUTS_TODAY:
      return generateCheckoutsTodayResponse(result);

    case AI_INTENTS.SHOW_BOOKINGS:
      return generateShowBookingsResponse(result);

    case AI_INTENTS.SHOW_GUESTS:
      return generateShowGuestsResponse(result);

    case AI_INTENTS.SHOW_ROOMS:
      return generateShowRoomsResponse(result);

    case AI_INTENTS.SHOW_STAFF:
      return generateShowStaffResponse(result);

    case AI_INTENTS.HELP:
      return generateHelpResponse();

    case AI_INTENTS.GREETING:
      return generateGreetingResponse();

    case AI_INTENTS.UNKNOWN:
      return generateUnknownResponse();

    default:
      return generateGenericResponse(intent, result);
  }
}

/**
 * Response generators for specific intents
 */

function generateDirtyRoomsResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "Great news! All rooms are currently clean. No rooms need attention right now.";
  }

  const rooms = result.data;
  const roomNumbers = rooms.map(r => r.roomNumber || r).join(', ');

  return `Currently, ${rooms.length} room${rooms.length > 1 ? 's are' : ' is'} marked as dirty and need${rooms.length === 1 ? 's' : ''} cleaning:\n\n${roomNumbers}\n\nWould you like me to assign staff or create a cleaning schedule?`;
}

function generateCleanRoomsResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "No rooms are currently marked as clean.";
  }

  const rooms = result.data;
  return `${rooms.length} room${rooms.length > 1 ? 's are' : ' is'} clean and ready for guests.`;
}

function generateBlockedRoomsResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "No rooms are currently blocked.";
  }

  const rooms = result.data;
  const roomNumbers = rooms.map(r => r.roomNumber || r).join(', ');

  return `${rooms.length} room${rooms.length > 1 ? 's are' : ' is'} currently blocked:\n\n${roomNumbers}`;
}

function generateCleanRoomActionResponse(result, entities) {
  if (!result.success) {
    return result.message || "I couldn't mark that room as clean. Please check the room number.";
  }

  const roomNumber = entities.roomNumbers?.[0] || 'the room';
  return `✓ Room ${roomNumber} has been marked as clean and is now ready for guests.`;
}

function generateAssignStaffResponse(result, entities) {
  if (!result.success) {
    return result.message || "I couldn't assign staff to that room.";
  }

  const staffName = entities.staffNames?.[0] || 'staff';
  const roomNumber = entities.roomNumbers?.[0] || 'the room';

  return `✓ Room ${roomNumber} has been assigned to ${staffName} for cleaning. They've been notified.`;
}

function generateBlockRoomResponse(result, entities) {
  if (!result.success) {
    return result.message || "I couldn't block that room.";
  }

  const roomNumber = entities.roomNumbers?.[0] || 'the room';
  return `✓ Room ${roomNumber} has been blocked and marked as out of service.`;
}

function generateVIPGuestsResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "No VIP guests found in your database.";
  }

  const guests = result.data;
  const guestList = guests.slice(0, 10).map((g, i) =>
    `${i + 1}. ${g.name} - LTV: ₹${g.totalSpend?.toLocaleString() || 0} (${g.totalStays || 0} stays)`
  ).join('\n');

  return `Here are your top VIP guests (${guests.length} total):\n\n${guestList}\n\n${guests.length > 10 ? `...and ${guests.length - 10} more. ` : ''}Would you like details on any specific guest?`;
}

function generateAtRiskGuestsResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "Great news! No guests are currently flagged as at-risk.";
  }

  const guests = result.data;
  const guestList = guests.slice(0, 5).map((g, i) =>
    `${i + 1}. ${g.name} - Last visit: ${g.daysSinceLastVisit || '?'} days ago, Sentiment: ${(g.sentimentScore * 100).toFixed(0)}%`
  ).join('\n');

  return `⚠️ ${guests.length} guest${guests.length > 1 ? 's are' : ' is'} currently at-risk:\n\n${guestList}\n\n${guests.length > 5 ? `...and ${guests.length - 5} more.\n\n` : ''}I recommend launching a re-engagement campaign to win them back.`;
}

function generateRevenueResponse(result) {
  if (!result.success || !result.data) {
    return "I couldn't retrieve revenue data at the moment.";
  }

  const { revenue, occupancy, period } = result.data;
  return `${period || 'Today'}'s revenue: ₹${revenue?.toLocaleString() || '0'} with ${occupancy || '0'}% occupancy.\n\nYour top revenue source is direct bookings. Would you like a detailed breakdown?`;
}

function generateOccupancyResponse(result) {
  if (!result.success || !result.data) {
    return "I couldn't retrieve occupancy data.";
  }

  const { current, available, total } = result.data;
  return `Current occupancy is ${current}% (${total - available} of ${total} rooms occupied).\n\n${available} rooms are available for tonight.`;
}

function generateOccupancyForecastResponse(result) {
  if (!result.success || !result.data) {
    return "I couldn't generate an occupancy forecast.";
  }

  const { predicted, period, confidence } = result.data;
  return `Expected occupancy for ${period || 'this weekend'} is ${predicted}% (${confidence || 'high'} confidence).\n\nPeak demand is predicted for Friday and Saturday.`;
}

function generateShowReviewsResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "No reviews found in the system.";
  }

  const reviews = result.data;
  const avgRating = reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length;
  const positive = reviews.filter(r => r.rating >= 4).length;
  const negative = reviews.filter(r => r.rating <= 2).length;
  const neutral = reviews.length - positive - negative;

  return `**Reviews Overview:**\n\nTotal Reviews: ${reviews.length}\n- Positive (4-5★): ${positive}\n- Neutral (3★): ${neutral}\n- Negative (1-2★): ${negative}\n\nAverage Rating: ${avgRating.toFixed(1)}/5\n\nWould you like to see negative reviews or a sentiment analysis?`;
}

function generateNegativeReviewsResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "Great news! No negative reviews found recently.";
  }

  const reviews = result.data;
  const reviewList = reviews.slice(0, 3).map((r, i) =>
    `${i + 1}. ${r.platform || 'Unknown'} - ${r.rating}/5 by ${r.guestName || 'Guest'}\n   "${r.comment?.substring(0, 80) || 'No comment'}..."`
  ).join('\n\n');

  return `Found ${reviews.length} negative review${reviews.length > 1 ? 's' : ''}:\n\n${reviewList}\n\n${reviews.length > 3 ? `...and ${reviews.length - 3} more.\n\n` : ''}Common issues: ${result.commonIssues?.join(', ') || 'None identified'}`;
}

function generateHousekeepingSummaryResponse(result) {
  if (!result.success || !result.data) {
    return "I couldn't generate a housekeeping summary.";
  }

  const { dirty, clean, inProgress, blocked, totalRooms } = result.data;

  return `**Housekeeping Status Overview:**\n\n✓ Clean & Ready: ${clean} rooms\n⏳ In Progress: ${inProgress} rooms\n🧹 Need Cleaning: ${dirty} rooms\n🚫 Blocked: ${blocked} rooms\n\nTotal: ${totalRooms} rooms\n\n${dirty > 10 ? '⚠️ High number of dirty rooms. Consider adding staff.' : 'Status is good!'}`;
}

function generateCRMSummaryResponse(result) {
  if (!result.success || !result.data) {
    return "I couldn't generate a CRM summary.";
  }

  const { totalGuests, vipGuests, atRiskGuests, newGuests, avgLTV } = result.data;

  return `**CRM Overview:**\n\n👥 Total Guests: ${totalGuests}\n💎 VIP Guests: ${vipGuests}\n⚠️ At-Risk: ${atRiskGuests}\n🆕 New This Month: ${newGuests}\n💰 Avg LTV: ₹${avgLTV?.toLocaleString() || '0'}\n\n${atRiskGuests > 20 ? '⚠️ Consider launching a win-back campaign.' : 'Guest retention looks strong!'}`;
}

function generateReviewsSummaryResponse(result) {
  if (!result.success || !result.data) {
    return "I couldn't summarize reviews.";
  }

  const { totalReviews, avgRating, positivePercent, topKeywords } = result.data;

  return `**Reviews Summary:**\n\n⭐ Average Rating: ${avgRating}/5\n📊 Total Reviews: ${totalReviews}\n😊 Positive: ${positivePercent}%\n\nTop Mentioned:\n${topKeywords?.map(k => `• ${k}`).join('\n') || 'No keywords'}\n\nOverall sentiment is ${positivePercent > 80 ? 'excellent!' : positivePercent > 60 ? 'good.' : 'needs improvement.'}`;
}

function generateHelpResponse() {
  return `I'm Glimmora, your AI hotel management assistant. Here's what I can help you with:\n\n**Bookings & Arrivals:**\n• "How many guests arriving today?"\n• "Show today's checkouts"\n• "Show all bookings"\n\n**Guests:**\n• "How many guests are with us?"\n• "List VIP guests"\n• "Show at-risk guests"\n\n**Housekeeping:**\n• "Show me dirty rooms"\n• "Assign Maria to room 305"\n• "Block room 118"\n\n**Revenue & Forecasting:**\n• "Show today's revenue"\n• "What's the occupancy?"\n• "Predict occupancy this weekend"\n\n**Reviews & Reputation:**\n• "Show negative reviews"\n• "Summarize reviews"\n\n**Staff:**\n• "Who's on shift?"\n• "Show staff"\n\nJust ask me anything in natural language!`;
}

function generateGreetingResponse() {
  const greetings = [
    "Hello! I'm Glimmora, your AI assistant. How can I help you manage your hotel today?",
    "Hi there! Ready to help with your hotel operations. What would you like to know?",
    "Good to see you! What can I assist you with today?",
    "Hello! I'm here to help with housekeeping, CRM, revenue, reviews, and more. What do you need?"
  ];

  return greetings[Math.floor(Math.random() * greetings.length)];
}

function generateUnknownResponse() {
  return "I'm not sure I understood that. Try asking:\n\n• \"Show me dirty rooms\"\n• \"List VIP guests\"\n• \"What's today's revenue?\"\n• \"Show negative reviews\"\n\nOr type \"help\" to see all commands.";
}

function generateGenericResponse(intent, result) {
  if (!result.success) {
    return result.message || "I couldn't complete that action. Please try again.";
  }

  // If we have data, try to generate a meaningful response
  if (result.data) {
    const data = result.data;
    if (Array.isArray(data) && data.length > 0) {
      return `Found ${data.length} result${data.length > 1 ? 's' : ''}. Would you like more details?`;
    }
    if (data.count !== undefined) {
      return `Found ${data.count} result${data.count !== 1 ? 's' : ''}.`;
    }
    if (data.summary) {
      return `Here's the summary: ${JSON.stringify(data.summary, null, 2)}`;
    }
  }

  return result.message || "I've processed your request. How else can I help you?";
}

/**
 * Booking Response Generators
 */

function generateBookingsTodayResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "No arrivals scheduled for today. It's going to be a quiet day!";
  }

  const bookings = result.data;
  const bookingList = bookings.slice(0, 5).map((b, i) =>
    `${i + 1}. ${b.guestName} - Room ${b.roomNumber} (${b.roomType}) - ${b.status}`
  ).join('\n');

  return `**Today's Arrivals (${bookings.length} total):**\n\n${bookingList}${bookings.length > 5 ? `\n\n...and ${bookings.length - 5} more arrivals.` : ''}\n\nWould you like me to prepare room assignments or send welcome messages?`;
}

function generateCheckoutsTodayResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "No checkouts scheduled for today.";
  }

  const checkouts = result.data;
  const checkoutList = checkouts.slice(0, 5).map((b, i) =>
    `${i + 1}. ${b.guestName} - Room ${b.roomNumber}`
  ).join('\n');

  return `**Today's Checkouts (${checkouts.length} total):**\n\n${checkoutList}${checkouts.length > 5 ? `\n\n...and ${checkouts.length - 5} more.` : ''}\n\nThese rooms will need housekeeping attention after checkout.`;
}

function generateShowBookingsResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "No bookings found in the system.";
  }

  const bookings = result.data;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const pending = bookings.filter(b => b.status === 'pending').length;

  return `**Booking Overview:**\n\nTotal: ${bookings.length} bookings\n- Confirmed: ${confirmed}\n- Pending: ${pending}\n\nWould you like to see today's arrivals, checkouts, or filter by status?`;
}

function generateShowGuestsResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "No guests found in the system.";
  }

  const guests = result.data;
  const summary = result.summary;

  if (summary) {
    return `**Guest Overview:**\n\nTotal Guests: ${summary.total}\n- VIP Guests: ${summary.vip}\n- At-Risk: ${summary.atRisk}\n- New Guests: ${summary.new}\n\nWould you like to see VIP guests, at-risk guests, or guest details?`;
  }

  return `You have ${guests.length} guest${guests.length > 1 ? 's' : ''} in the system. Would you like to see VIP guests or at-risk guests?`;
}

function generateShowRoomsResponse(result) {
  if (!result.success || !result.data) {
    return "I couldn't retrieve room data.";
  }

  const summary = result.summary;

  if (summary) {
    return `**Room Status Overview:**\n\nTotal Rooms: ${summary.total}\n- Clean & Ready: ${summary.clean}\n- Dirty: ${summary.dirty}\n- In Progress: ${summary.inProgress}\n- Blocked: ${summary.blocked}\n\n${summary.dirty > 5 ? '⚠️ Several rooms need cleaning attention.' : 'Room status looks good!'}`;
  }

  return `${result.count || result.data.length} rooms in the system.`;
}

function generateShowStaffResponse(result) {
  if (!result.success || !result.data || result.data.length === 0) {
    return "No staff currently on shift.";
  }

  const staff = result.data;
  const staffList = staff.slice(0, 5).map((s, i) =>
    `${i + 1}. ${s.name} - ${s.role} (${s.department})`
  ).join('\n');

  return `**Staff Currently On Shift (${staff.length}/${result.totalStaff || staff.length}):**\n\n${staffList}\n\nWould you like to assign any tasks or view staff schedules?`;
}

/**
 * Generate error response
 */
export function generateErrorResponse(error) {
  return `I encountered an error: ${error.message || 'Unknown error'}. Please try again.`;
}

/**
 * Generate confirmation message for actions
 */
export function generateConfirmation(action, details) {
  return `✓ ${action} completed${details ? `: ${details}` : ''}.`;
}
