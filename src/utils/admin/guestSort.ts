/**
 * Sorting utility for guest data
 * Supports: name, country, lastStay, totalStays, emotion, status
 */
export function sortGuests(guests, sortField, sortDirection) {
  if (!sortField) return guests;

  const sorted = [...guests].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'name':
      case 'country':
        aValue = a[sortField].toLowerCase();
        bValue = b[sortField].toLowerCase();
        break;

      case 'lastStay':
        aValue = new Date(a.lastStay).getTime();
        bValue = new Date(b.lastStay).getTime();
        break;

      case 'totalStays':
        aValue = a.totalStays;
        bValue = b.totalStays;
        break;

      case 'emotion':
        const emotionOrder = { positive: 3, neutral: 2, negative: 1 };
        aValue = emotionOrder[a.emotion] || 0;
        bValue = emotionOrder[b.emotion] || 0;
        break;

      case 'status':
        const statusOrder = { vip: 4, normal: 3, review: 2, blacklisted: 1 };
        aValue = statusOrder[a.status] || 0;
        bValue = statusOrder[b.status] || 0;
        break;

      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return sorted;
}
