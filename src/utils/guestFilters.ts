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
      return guests.filter(g => g.totalStays > 1);
    case 'vip':
      return guests.filter(g => g.status === 'vip');
    case 'blacklisted':
      return guests.filter(g => g.status === 'blacklisted');
    default:
      return guests;
  }
}
