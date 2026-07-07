// CRM Activity Feed Generator
// Generate dynamic activity events from guest data

/**
 * Activity event types
 */
const ACTIVITY_TYPES = {
  CHECK_IN: 'check-in',
  CHECK_OUT: 'check-out',
  NEW_BOOKING: 'new-booking',
  LEFT_REVIEW: 'left-review',
  REDEEMED_REWARD: 'redeemed-reward',
  JOINED_LOYALTY: 'joined-loyalty',
  UPSELL_PURCHASED: 'upsell-purchased',
  COMPLAINT_LOGGED: 'complaint-logged',
  PROFILE_UPDATED: 'profile-updated',
  TIER_UPGRADED: 'tier-upgraded',
  CANCELED_BOOKING: 'canceled-booking',
  MODIFIED_BOOKING: 'modified-booking',
  SPECIAL_REQUEST: 'special-request'
};

/**
 * Generate activity events from guest data
 */
export function generateActivityFeed(guests, limit = 20) {
  const activities = [];
  const now = new Date();

  guests.forEach(guest => {
    // Recent check-in (if visited recently)
    if (guest.daysSinceLastVisit < 30) {
      const checkInDate = new Date(guest.lastVisit);
      activities.push({
        id: `checkin-${guest.id}`,
        guestId: guest.id,
        guestName: guest.name,
        segment: guest.tags[0] || 'standard',
        activity: 'Check-In',
        description: `Checked in to ${guest.preferredRoom}`,
        timestamp: checkInDate.toISOString(),
        totalSpend: guest.averageSpend,
        platform: guest.source === 'direct' ? 'Front Desk' : guest.source,
        status: 'completed'
      });
    }

    // New booking (if has upcoming)
    if (guest.upcomingBookings && guest.upcomingBookings.length > 0) {
      const booking = guest.upcomingBookings[0];
      const bookingDate = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days

      activities.push({
        id: `booking-${guest.id}`,
        guestId: guest.id,
        guestName: guest.name,
        segment: guest.tags[0] || 'standard',
        activity: 'New Booking',
        description: `Booked ${booking.roomType}`,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        timestamp: bookingDate.toISOString(),
        totalSpend: booking.amount,
        platform: guest.source === 'direct' ? 'Direct Website' : guest.source,
        status: 'confirmed'
      });
    }

    // Left review (for high sentiment guests)
    if (guest.sentimentScore > 0.7 && guest.positiveReviews > 0) {
      const reviewDate = new Date(guest.lastVisit);
      reviewDate.setDate(reviewDate.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 days after visit

      activities.push({
        id: `review-${guest.id}`,
        guestId: guest.id,
        guestName: guest.name,
        segment: guest.tags[0] || 'standard',
        activity: 'Review Submitted',
        description: `Left a ${guest.sentimentScore > 0.9 ? '5-star' : '4-star'} review`,
        rating: guest.sentimentScore > 0.9 ? 5 : 4,
        timestamp: reviewDate.toISOString(),
        totalSpend: 0,
        platform: guest.source === 'booking.com' ? 'Booking.com' : 'Google',
        status: 'active'
      });
    }

    // Redeemed reward (for VIP/loyal guests)
    if (guest.loyaltyPoints > 3000 && guest.totalStays > 5) {
      const redeemDate = new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000); // Last 14 days

      activities.push({
        id: `redeem-${guest.id}`,
        guestId: guest.id,
        guestName: guest.name,
        segment: 'vip',
        activity: 'Loyalty Points Redeemed',
        description: `Redeemed ${Math.floor(Math.random() * 3000) + 2000} points for spa credit`,
        pointsRedeemed: Math.floor(Math.random() * 3000) + 2000,
        timestamp: redeemDate.toISOString(),
        totalSpend: 0,
        platform: 'Mobile App',
        status: 'active'
      });
    }

    // Complaint logged (for low sentiment guests)
    if (guest.complaints && guest.complaints.length > 0) {
      const complaint = guest.complaints[0];
      activities.push({
        id: `complaint-${guest.id}`,
        guestId: guest.id,
        guestName: guest.name,
        segment: 'at-risk',
        activity: 'Complaint Logged',
        description: `Issue reported: ${complaint.issue}`,
        timestamp: complaint.date.toISOString(),
        totalSpend: 0,
        platform: 'Phone',
        status: 'pending'
      });
    }

    // Tier upgraded (for recent VIP conversions)
    if (guest.loyaltyTier === 'Gold' && guest.totalSpend > 4000) {
      const upgradeDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days

      activities.push({
        id: `upgrade-${guest.id}`,
        guestId: guest.id,
        guestName: guest.name,
        segment: 'vip',
        activity: 'Loyalty Tier Upgraded',
        description: `Promoted to ${guest.loyaltyTier} tier`,
        newTier: guest.loyaltyTier,
        timestamp: upgradeDate.toISOString(),
        totalSpend: 0,
        platform: 'System',
        status: 'active'
      });
    }
  });

  // Sort by timestamp (most recent first)
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Return limited set
  return activities.slice(0, limit);
}

/**
 * Format timestamp for display
 */
export function formatActivityTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Get activity summary statistics
 */
export function getActivitySummary(activities) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const activitiesToday = activities.filter(a => new Date(a.timestamp) >= todayStart);
  const bookingsToday = activitiesToday.filter(a => a.activity === 'New Booking');
  const checkInsToday = activitiesToday.filter(a => a.activity === 'Check-In');

  return {
    totalActivitiesToday: activitiesToday.length,
    bookingsToday: bookingsToday.length,
    checkInsToday: checkInsToday.length,
    reviewsToday: activitiesToday.filter(a => a.activity === 'Review Submitted').length,
    complaintsToday: activitiesToday.filter(a => a.activity === 'Complaint Logged').length
  };
}

/**
 * Filter activities by type
 */
export function filterActivitiesByType(activities, types) {
  if (!types || types.length === 0) return activities;
  return activities.filter(a => types.includes(a.activity));
}

/**
 * Filter activities by segment
 */
export function filterActivitiesBySegment(activities, segments) {
  if (!segments || segments.length === 0) return activities;
  return activities.filter(a => segments.includes(a.segment));
}

/**
 * Filter activities by date range
 */
export function filterActivitiesByDateRange(activities, startDate, endDate) {
  return activities.filter(a => {
    const timestamp = new Date(a.timestamp);
    return timestamp >= startDate && timestamp <= endDate;
  });
}
