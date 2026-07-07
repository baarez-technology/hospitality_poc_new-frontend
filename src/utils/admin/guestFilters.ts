/**
 * Filtering utilities for guests
 */

/**
 * Apply advanced filters to guest list
 */
export function filterGuests(guests, filters) {
  let filtered = [...guests];

  // Country filter
  if (filters.country && filters.country !== 'all') {
    filtered = filtered.filter(g => g.country === filters.country);
  }

  // Emotion filter
  if (filters.emotion && filters.emotion !== 'all') {
    filtered = filtered.filter(g => g.emotion === filters.emotion);
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(g => g.status === filters.status);
  }

  // VIP Level filter
  if (filters.vipLevel && filters.vipLevel !== 'all') {
    filtered = filtered.filter(g => g.vipLevel === filters.vipLevel);
  }

  // Date range filter
  if (filters.lastStayFrom || filters.lastStayTo) {
    filtered = filtered.filter(g => {
      const guestDate = new Date(g.lastStay);

      if (filters.lastStayFrom && filters.lastStayTo) {
        const fromDate = new Date(filters.lastStayFrom);
        const toDate = new Date(filters.lastStayTo);
        return guestDate >= fromDate && guestDate <= toDate;
      } else if (filters.lastStayFrom) {
        const fromDate = new Date(filters.lastStayFrom);
        return guestDate >= fromDate;
      } else if (filters.lastStayTo) {
        const toDate = new Date(filters.lastStayTo);
        return guestDate <= toDate;
      }

      return true;
    });
  }

  return filtered;
}

/**
 * Filter by tab (all, returning, vip, blacklisted)
 */
export function filterByTab(guests, tab) {
  switch (tab) {
    case 'all':
      return guests;
    case 'returning':
      // Returning guests have more than 1 booking/stay
      return guests.filter(g => (g.totalStays > 1) || (g.totalBookings > 1));
    case 'vip':
      // VIP guests can be identified by status='vip' or vipStatus=true
      return guests.filter(g => g.status === 'vip' || g.vipStatus === true);
    case 'blacklisted':
      // Blacklisted guests have status='blacklisted' (case-insensitive)
      return guests.filter(g => g.status?.toLowerCase() === 'blacklisted');
    default:
      return guests;
  }
}
