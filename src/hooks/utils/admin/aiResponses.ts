/**
 * AI Response Generator
 * Generates natural, friendly AI responses for different intents
 */

import { AI_INTENTS } from '@/data/aiIntents';

/**
 * Generate response based on intent and result data
 */
export function generateResponse(intent, result, entities = {}) {
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
  return `I'm Baarez, your AI hotel management assistant. Here's what I can help you with:\n\n**Housekeeping:**\n• "Show me dirty rooms"\n• "Assign Maria to room 305"\n• "Block room 118"\n\n**CRM & Guests:**\n• "List VIP guests"\n• "Show at-risk guests"\n• "Guest profile for John Carter"\n\n**Revenue & Forecasting:**\n• "Show today's revenue"\n• "Predict occupancy this weekend"\n\n**Reviews & Reputation:**\n• "Show negative reviews"\n• "Platform ratings summary"\n\nJust ask me anything in natural language!`;
}

function generateGreetingResponse() {
  const greetings = [
    "Hello! I'm Baarez, your AI assistant. How can I help you manage your hotel today?",
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

  return result.message || "I've processed your request. How else can I help you?";
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
