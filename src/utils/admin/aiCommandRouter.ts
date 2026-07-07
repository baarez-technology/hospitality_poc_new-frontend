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
 * Intent to handler mapping for robust routing
 * Handles both string values and constant references
 */
const COMMAND_HANDLERS = {
  // Housekeeping
  [AI_INTENTS.LIST_DIRTY_ROOMS]: (entities) => handleListDirtyRooms(),
  'list_dirty_rooms': (entities) => handleListDirtyRooms(),
  [AI_INTENTS.LIST_CLEAN_ROOMS]: (entities) => handleListCleanRooms(),
  'list_clean_rooms': (entities) => handleListCleanRooms(),
  [AI_INTENTS.LIST_BLOCKED_ROOMS]: (entities) => handleListBlockedRooms(),
  'list_blocked_rooms': (entities) => handleListBlockedRooms(),
  [AI_INTENTS.LIST_IN_PROGRESS_ROOMS]: (entities) => handleListInProgressRooms(),
  'list_in_progress_rooms': (entities) => handleListInProgressRooms(),
  [AI_INTENTS.CLEAN_ROOM]: (entities) => handleCleanRoom(entities),
  'clean_room': (entities) => handleCleanRoom(entities),
  [AI_INTENTS.ASSIGN_STAFF]: (entities) => handleAssignStaff(entities),
  'assign_staff': (entities) => handleAssignStaff(entities),
  [AI_INTENTS.BLOCK_ROOM]: (entities) => handleBlockRoom(entities),
  'block_room': (entities) => handleBlockRoom(entities),
  [AI_INTENTS.SUMMARIZE_HOUSEKEEPING]: (entities) => handleSummarizeHousekeeping(),
  'summarize_housekeeping': (entities) => handleSummarizeHousekeeping(),

  // CRM
  [AI_INTENTS.LIST_VIP_GUESTS]: (entities) => handleListVIPGuests(),
  'list_vip_guests': (entities) => handleListVIPGuests(),
  [AI_INTENTS.LIST_AT_RISK_GUESTS]: (entities) => handleListAtRiskGuests(),
  'list_at_risk_guests': (entities) => handleListAtRiskGuests(),
  [AI_INTENTS.SHOW_GUESTS]: (entities) => handleShowAllGuests(entities),
  'show_guests': (entities) => handleShowAllGuests(entities),
  [AI_INTENTS.SUMMARIZE_CRM]: (entities) => handleSummarizeCRM(),
  'summarize_crm': (entities) => handleSummarizeCRM(),

  // Revenue
  [AI_INTENTS.SHOW_REVENUE]: (entities) => handleShowRevenue(entities),
  'show_revenue': (entities) => handleShowRevenue(entities),
  [AI_INTENTS.REVENUE_TODAY]: (entities) => handleShowRevenue(entities),
  'revenue_today': (entities) => handleShowRevenue(entities),
  [AI_INTENTS.SHOW_OCCUPANCY]: (entities) => handleShowOccupancy(),
  'show_occupancy': (entities) => handleShowOccupancy(),
  [AI_INTENTS.PREDICT_OCCUPANCY]: (entities) => handlePredictOccupancy(entities),
  'predict_occupancy': (entities) => handlePredictOccupancy(entities),

  // Reputation
  [AI_INTENTS.SHOW_REVIEWS]: (entities) => handleShowReviews(),
  'show_reviews': (entities) => handleShowReviews(),
  [AI_INTENTS.NEGATIVE_REVIEWS]: (entities) => handleShowNegativeReviews(),
  'negative_reviews': (entities) => handleShowNegativeReviews(),
  [AI_INTENTS.SUMMARIZE_REVIEWS]: (entities) => handleSummarizeReviews(),
  'summarize_reviews': (entities) => handleSummarizeReviews(),

  // Bookings
  [AI_INTENTS.BOOKINGS_TODAY]: (entities) => handleBookingsToday(),
  'bookings_today': (entities) => handleBookingsToday(),
  [AI_INTENTS.CHECKOUTS_TODAY]: (entities) => handleCheckoutsToday(),
  'checkouts_today': (entities) => handleCheckoutsToday(),
  [AI_INTENTS.SHOW_BOOKINGS]: (entities) => handleShowBookings(entities),
  'show_bookings': (entities) => handleShowBookings(entities),

  // Rooms
  [AI_INTENTS.SHOW_ROOMS]: (entities) => handleShowRooms(),
  'show_rooms': (entities) => handleShowRooms(),

  // Staff
  [AI_INTENTS.SHOW_STAFF]: (entities) => handleShowStaff(),
  'show_staff': (entities) => handleShowStaff(),

  // General
  [AI_INTENTS.HELP]: (entities) => ({ success: true, data: null }),
  'help': (entities) => ({ success: true, data: null }),
  [AI_INTENTS.GREETING]: (entities) => ({ success: true, data: null }),
  'greeting': (entities) => ({ success: true, data: null }),
  [AI_INTENTS.UNKNOWN]: (entities) => ({ success: false, message: "I'm not sure what you're asking. Try 'help' to see what I can do." }),
  'unknown': (entities) => ({ success: false, message: "I'm not sure what you're asking. Try 'help' to see what I can do." }),
};

/**
 * Main command router
 * Routes intent + entities to appropriate handler
 */
export function routeCommand(intent, entities) {
  try {
    // Look up handler by intent (handles both constant and string values)
    const handler = COMMAND_HANDLERS[intent];

    if (handler) {
      return handler(entities);
    }

    // If no handler found, return helpful message
    console.warn('No handler found for intent:', intent);
    return {
      success: false,
      message: `I understood "${intent}" but don't have a handler for it yet. Try asking: "Show me dirty rooms" or "How many guests today?"`
    };
  } catch (error) {
    console.error('Command router error:', error);
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

/**
 * Booking Handlers
 */

// Mock bookings data
const MOCK_BOOKINGS = [
  { id: 1, guestName: 'John Carter', roomNumber: '301', roomType: 'Suite', checkIn: 'today', checkOut: '2024-12-29', status: 'confirmed', adults: 2, children: 0 },
  { id: 2, guestName: 'Sarah Kim', roomNumber: '205', roomType: 'Deluxe', checkIn: 'today', checkOut: '2024-12-28', status: 'confirmed', adults: 1, children: 0 },
  { id: 3, guestName: 'Michael Torres', roomNumber: '118', roomType: 'Standard', checkIn: 'today', checkOut: '2024-12-27', status: 'pending', adults: 2, children: 1 },
  { id: 4, guestName: 'Emma Davis', roomNumber: '402', roomType: 'Suite', checkIn: '2024-12-27', checkOut: '2024-12-30', status: 'confirmed', adults: 2, children: 0 },
  { id: 5, guestName: 'Raj Patel', roomNumber: '103', roomType: 'Standard', checkIn: 'today', checkOut: 'today', status: 'checkout', adults: 1, children: 0 },
  { id: 6, guestName: 'Lisa Wong', roomNumber: '210', roomType: 'Deluxe', checkIn: 'yesterday', checkOut: 'today', status: 'checkout', adults: 2, children: 0 }
];

// Mock staff data
const MOCK_STAFF = [
  { id: 1, name: 'Maria Garcia', role: 'Housekeeping Supervisor', department: 'Housekeeping', status: 'on_shift', phone: '555-0101' },
  { id: 2, name: 'James Wilson', role: 'Front Desk Agent', department: 'Front Office', status: 'on_shift', phone: '555-0102' },
  { id: 3, name: 'Ana Martinez', role: 'Housekeeper', department: 'Housekeeping', status: 'on_shift', phone: '555-0103' },
  { id: 4, name: 'David Chen', role: 'Maintenance Tech', department: 'Maintenance', status: 'on_shift', phone: '555-0104' },
  { id: 5, name: 'Rachel Brown', role: 'Concierge', department: 'Front Office', status: 'off_shift', phone: '555-0105' }
];

function handleBookingsToday() {
  const todayBookings = MOCK_BOOKINGS.filter(b => b.checkIn === 'today' && b.status !== 'checkout');

  return {
    success: true,
    data: todayBookings,
    count: todayBookings.length,
    action: 'bookings_today'
  };
}

function handleCheckoutsToday() {
  const checkouts = MOCK_BOOKINGS.filter(b => b.checkOut === 'today' || b.status === 'checkout');

  return {
    success: true,
    data: checkouts,
    count: checkouts.length,
    action: 'checkouts_today'
  };
}

function handleShowBookings(entities) {
  let bookings = [...MOCK_BOOKINGS];

  // Filter by status if specified
  if (entities?.status) {
    bookings = bookings.filter(b => b.status === entities.status);
  }

  return {
    success: true,
    data: bookings,
    count: bookings.length,
    action: 'show_bookings'
  };
}

function handleShowAllGuests(entities) {
  // Return all guests with enhanced data
  const allGuests = [...MOCK_GUESTS];
  const totalCount = allGuests.length;

  // Group by segment
  const vipCount = allGuests.filter(g => g.segment === 'vip').length;
  const atRiskCount = allGuests.filter(g => g.segment === 'at-risk').length;
  const newCount = allGuests.filter(g => g.segment === 'new').length;

  return {
    success: true,
    data: allGuests,
    count: totalCount,
    summary: {
      total: totalCount,
      vip: vipCount,
      atRisk: atRiskCount,
      new: newCount
    },
    action: 'show_guests'
  };
}

function handleShowRooms() {
  const allRooms = [...MOCK_ROOMS];
  const totalRooms = allRooms.length;

  // Group by status
  const clean = allRooms.filter(r => r.status === 'clean').length;
  const dirty = allRooms.filter(r => r.status === 'dirty').length;
  const inProgress = allRooms.filter(r => r.status === 'in_progress').length;
  const blocked = allRooms.filter(r => r.status === 'blocked').length;

  return {
    success: true,
    data: allRooms,
    count: totalRooms,
    summary: {
      total: totalRooms,
      clean,
      dirty,
      inProgress,
      blocked
    },
    action: 'show_rooms'
  };
}

function handleShowStaff() {
  const onShift = MOCK_STAFF.filter(s => s.status === 'on_shift');

  return {
    success: true,
    data: onShift,
    count: onShift.length,
    totalStaff: MOCK_STAFF.length,
    action: 'show_staff'
  };
}
