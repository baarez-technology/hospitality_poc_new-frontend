/**
 * AI Command Router
 * Routes commands to appropriate handlers and executes actions (simulated)
 */

import { AI_INTENTS } from '@/data/aiIntents';

/**
 * Simulate room data (in production, this would come from state management)
 */
const MOCK_ROOMS = [
  { roomNumber: '101', status: 'dirty', type: 'Standard', assignedStaff: null },
  { roomNumber: '102', status: 'clean', type: 'Standard', assignedStaff: null },
  { roomNumber: '103', status: 'dirty', type: 'Deluxe', assignedStaff: null },
  { roomNumber: '201', status: 'in_progress', type: 'Suite', assignedStaff: 'Maria' },
  { roomNumber: '202', status: 'clean', type: 'Suite', assignedStaff: null },
  { roomNumber: '204', status: 'dirty', type: 'Deluxe', assignedStaff: null },
  { roomNumber: '301', status: 'clean', type: 'Standard', assignedStaff: null },
  { roomNumber: '305', status: 'dirty', type: 'Suite', assignedStaff: null },
  { roomNumber: '310', status: 'dirty', type: 'Deluxe', assignedStaff: null },
  { roomNumber: '118', status: 'blocked', type: 'Standard', assignedStaff: null }
];

/**
 * Simulate guest data
 */
const MOCK_GUESTS = [
  { name: 'John Carter', totalSpend: 5200, totalStays: 12, sentimentScore: 0.92, daysSinceLastVisit: 15, segment: 'vip' },
  { name: 'Sarah Kim', totalSpend: 4800, totalStays: 10, sentimentScore: 0.88, daysSinceLastVisit: 22, segment: 'vip' },
  { name: 'Michael Torres', totalSpend: 3200, totalStays: 8, sentimentScore: 0.35, daysSinceLastVisit: 210, segment: 'at-risk' },
  { name: 'Emma Davis', totalSpend: 2800, totalStays: 9, sentimentScore: 0.25, daysSinceLastVisit: 195, segment: 'at-risk' },
  { name: 'Raj Patel', totalSpend: 6100, totalStays: 15, sentimentScore: 0.95, daysSinceLastVisit: 8, segment: 'vip' },
  { name: 'Lisa Wong', totalSpend: 1200, totalStays: 3, sentimentScore: 0.72, daysSinceLastVisit: 45, segment: 'new' }
];

/**
 * Simulate reviews data
 */
const MOCK_REVIEWS = [
  { platform: 'Google', rating: 2, guestName: 'Anonymous', comment: 'WiFi was very slow, breakfast quality poor', sentiment: 'negative' },
  { platform: 'Booking.com', rating: 3, guestName: 'John D.', comment: 'Room was okay but check-in took too long', sentiment: 'negative' },
  { platform: 'TripAdvisor', rating: 5, guestName: 'Sarah M.', comment: 'Excellent service, beautiful rooms!', sentiment: 'positive' }
];

/**
 * Main command router
 * Routes intent + entities to appropriate handler
 */
export function routeCommand(intent, entities) {
  try {
    switch (intent) {
      // Housekeeping Commands
      case AI_INTENTS.LIST_DIRTY_ROOMS:
        return handleListDirtyRooms();

      case AI_INTENTS.LIST_CLEAN_ROOMS:
        return handleListCleanRooms();

      case AI_INTENTS.LIST_BLOCKED_ROOMS:
        return handleListBlockedRooms();

      case AI_INTENTS.LIST_IN_PROGRESS_ROOMS:
        return handleListInProgressRooms();

      case AI_INTENTS.CLEAN_ROOM:
        return handleCleanRoom(entities);

      case AI_INTENTS.ASSIGN_STAFF:
        return handleAssignStaff(entities);

      case AI_INTENTS.BLOCK_ROOM:
        return handleBlockRoom(entities);

      case AI_INTENTS.SUMMARIZE_HOUSEKEEPING:
        return handleSummarizeHousekeeping();

      // CRM Commands
      case AI_INTENTS.LIST_VIP_GUESTS:
        return handleListVIPGuests();

      case AI_INTENTS.LIST_AT_RISK_GUESTS:
        return handleListAtRiskGuests();

      case AI_INTENTS.SHOW_GUESTS:
        return handleShowGuests(entities);

      case AI_INTENTS.SUMMARIZE_CRM:
        return handleSummarizeCRM();

      // Revenue Commands
      case AI_INTENTS.SHOW_REVENUE:
      case AI_INTENTS.REVENUE_TODAY:
        return handleShowRevenue(entities);

      case AI_INTENTS.SHOW_OCCUPANCY:
        return handleShowOccupancy();

      case AI_INTENTS.PREDICT_OCCUPANCY:
        return handlePredictOccupancy(entities);

      // Reputation Commands
      case AI_INTENTS.SHOW_REVIEWS:
        return handleShowReviews();

      case AI_INTENTS.NEGATIVE_REVIEWS:
        return handleShowNegativeReviews();

      case AI_INTENTS.SUMMARIZE_REVIEWS:
        return handleSummarizeReviews();

      // General
      case AI_INTENTS.HELP:
        return { success: true, data: null };

      case AI_INTENTS.GREETING:
        return { success: true, data: null };

      case AI_INTENTS.UNKNOWN:
        return { success: false, message: "Unknown command" };

      default:
        return { success: false, message: "Command not implemented" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Housekeeping Handlers
 */

function handleListDirtyRooms() {
  const dirtyRooms = MOCK_ROOMS.filter(r => r.status === 'dirty');
  return {
    success: true,
    data: dirtyRooms,
    action: 'list_dirty_rooms'
  };
}

function handleListCleanRooms() {
  const cleanRooms = MOCK_ROOMS.filter(r => r.status === 'clean');
  return {
    success: true,
    data: cleanRooms,
    action: 'list_clean_rooms'
  };
}

function handleListBlockedRooms() {
  const blockedRooms = MOCK_ROOMS.filter(r => r.status === 'blocked');
  return {
    success: true,
    data: blockedRooms,
    action: 'list_blocked_rooms'
  };
}

function handleListInProgressRooms() {
  const inProgressRooms = MOCK_ROOMS.filter(r => r.status === 'in_progress');
  return {
    success: true,
    data: inProgressRooms,
    action: 'list_in_progress_rooms'
  };
}

function handleCleanRoom(entities) {
  const roomNumber = entities.roomNumbers?.[0];

  if (!roomNumber) {
    return { success: false, message: "Please specify a room number" };
  }

  // Simulate marking room as clean
  const room = MOCK_ROOMS.find(r => r.roomNumber === roomNumber);

  if (!room) {
    return { success: false, message: `Room ${roomNumber} not found` };
  }

  // In real app, would update state here
  room.status = 'clean';

  return {
    success: true,
    data: { roomNumber, previousStatus: room.status },
    action: 'clean_room'
  };
}

function handleAssignStaff(entities) {
  const roomNumber = entities.roomNumbers?.[0];
  const staffName = entities.staffNames?.[0];

  if (!roomNumber) {
    return { success: false, message: "Please specify a room number" };
  }

  if (!staffName) {
    return { success: false, message: "Please specify a staff member" };
  }

  const room = MOCK_ROOMS.find(r => r.roomNumber === roomNumber);

  if (!room) {
    return { success: false, message: `Room ${roomNumber} not found` };
  }

  // In real app, would update state
  room.assignedStaff = staffName;
  room.status = 'in_progress';

  return {
    success: true,
    data: { roomNumber, staffName },
    action: 'assign_staff'
  };
}

function handleBlockRoom(entities) {
  const roomNumber = entities.roomNumbers?.[0];

  if (!roomNumber) {
    return { success: false, message: "Please specify a room number" };
  }

  const room = MOCK_ROOMS.find(r => r.roomNumber === roomNumber);

  if (!room) {
    return { success: false, message: `Room ${roomNumber} not found` };
  }

  // In real app, would update state
  room.status = 'blocked';

  return {
    success: true,
    data: { roomNumber },
    action: 'block_room'
  };
}

function handleSummarizeHousekeeping() {
  const dirty = MOCK_ROOMS.filter(r => r.status === 'dirty').length;
  const clean = MOCK_ROOMS.filter(r => r.status === 'clean').length;
  const inProgress = MOCK_ROOMS.filter(r => r.status === 'in_progress').length;
  const blocked = MOCK_ROOMS.filter(r => r.status === 'blocked').length;
  const totalRooms = MOCK_ROOMS.length;

  return {
    success: true,
    data: {
      dirty,
      clean,
      inProgress,
      blocked,
      totalRooms
    },
    action: 'summarize_housekeeping'
  };
}

/**
 * CRM Handlers
 */

function handleListVIPGuests() {
  const vipGuests = MOCK_GUESTS.filter(g => g.segment === 'vip');

  return {
    success: true,
    data: vipGuests,
    action: 'list_vip_guests'
  };
}

function handleListAtRiskGuests() {
  const atRiskGuests = MOCK_GUESTS.filter(g => g.segment === 'at-risk');

  return {
    success: true,
    data: atRiskGuests,
    action: 'list_at_risk_guests'
  };
}

function handleShowGuests(entities) {
  let guests = [...MOCK_GUESTS];

  // Filter by segment if specified
  if (entities.segments && entities.segments.length > 0) {
    const segment = entities.segments[0].type.toLowerCase();
    guests = guests.filter(g => g.segment === segment);
  }

  return {
    success: true,
    data: guests,
    action: 'show_guests'
  };
}

function handleSummarizeCRM() {
  const totalGuests = MOCK_GUESTS.length;
  const vipGuests = MOCK_GUESTS.filter(g => g.segment === 'vip').length;
  const atRiskGuests = MOCK_GUESTS.filter(g => g.segment === 'at-risk').length;
  const newGuests = MOCK_GUESTS.filter(g => g.segment === 'new').length;
  const avgLTV = Math.round(MOCK_GUESTS.reduce((sum, g) => sum + g.totalSpend, 0) / totalGuests);

  return {
    success: true,
    data: {
      totalGuests,
      vipGuests,
      atRiskGuests,
      newGuests,
      avgLTV
    },
    action: 'summarize_crm'
  };
}

/**
 * Revenue Handlers
 */

function handleShowRevenue(entities) {
  // Simulate revenue data
  const revenue = 24850;
  const occupancy = 87;

  let period = 'Today';
  if (entities.timePeriods && entities.timePeriods.length > 0) {
    period = entities.timePeriods[0].value;
  }

  return {
    success: true,
    data: {
      revenue,
      occupancy,
      period
    },
    action: 'show_revenue'
  };
}

function handleShowOccupancy() {
  const total = 85;
  const occupied = 74;
  const available = total - occupied;
  const current = Math.round((occupied / total) * 100);

  return {
    success: true,
    data: {
      current,
      available,
      total,
      occupied
    },
    action: 'show_occupancy'
  };
}

function handlePredictOccupancy(entities) {
  let period = 'this weekend';
  if (entities.timePeriods && entities.timePeriods.length > 0) {
    period = entities.timePeriods[0].value;
  }

  const predicted = 78 + Math.floor(Math.random() * 15); // Simulate 78-93%

  return {
    success: true,
    data: {
      predicted,
      period,
      confidence: 'high'
    },
    action: 'predict_occupancy'
  };
}

/**
 * Reputation Handlers
 */

function handleShowReviews() {
  return {
    success: true,
    data: MOCK_REVIEWS,
    action: 'show_reviews'
  };
}

function handleShowNegativeReviews() {
  const negativeReviews = MOCK_REVIEWS.filter(r => r.sentiment === 'negative');

  const commonIssues = ['WiFi speed', 'Breakfast quality', 'Check-in time'];

  return {
    success: true,
    data: negativeReviews,
    commonIssues,
    action: 'show_negative_reviews'
  };
}

function handleSummarizeReviews() {
  const totalReviews = MOCK_REVIEWS.length;
  const avgRating = (MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1);
  const positiveCount = MOCK_REVIEWS.filter(r => r.sentiment === 'positive').length;
  const positivePercent = Math.round((positiveCount / totalReviews) * 100);
  const topKeywords = ['service', 'cleanliness', 'location'];

  return {
    success: true,
    data: {
      totalReviews,
      avgRating,
      positivePercent,
      topKeywords
    },
    action: 'summarize_reviews'
  };
}
