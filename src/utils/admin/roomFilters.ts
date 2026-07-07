/**
 * Room filtering utilities
 */

/**
 * Filter by tab — supports all room statuses
 * Note: out_of_service (OOS) and out_of_order (OOO) are distinct:
 * - OOS: Minor issues, room can be sold in emergency
 * - OOO: Major issues (plumbing, electrical, renovation), room CANNOT be sold
 */
export function filterByTab(rooms, tab) {
  if (tab === 'all') return rooms;
  if (tab === 'available') {
    return rooms.filter(r => r.status === 'available' || r.status === 'clean' || r.status === 'inspected');
  }
  if (tab === 'dirty') {
    return rooms.filter(r => r.status === 'dirty' || r.cleaning === 'dirty');
  }
  if (tab === 'in_progress') {
    return rooms.filter(r => r.status === 'in_progress' || r.cleaning === 'in_progress');
  }
  if (tab === 'clean') {
    return rooms.filter(r => r.status === 'clean' || r.cleaning === 'clean');
  }
  if (tab === 'inspected') {
    return rooms.filter(r => r.status === 'inspected' || r.cleaning === 'inspected');
  }
  return rooms.filter(r => r.status === tab);
}

/**
 * Apply advanced filters to room list
 */
export function filterRooms(rooms, filters) {
  let filtered = [...rooms];

  // Room type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(r => r.type === filters.type);
  }

  // Floor filter
  if (filters.floor && filters.floor !== 'all') {
    const floorNum = parseInt(filters.floor, 10);
    if (!isNaN(floorNum)) {
      filtered = filtered.filter(r => r.floor === floorNum);
    }
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(r => r.status === filters.status);
  }

  // Cleaning filter
  if (filters.cleaning && filters.cleaning !== 'all') {
    filtered = filtered.filter(r => r.cleaning === filters.cleaning);
  }

  return filtered;
}

/**
 * Search rooms by room number, type, or guest name
 */
export function searchRooms(rooms, query) {
  if (!query || query.trim() === '') return rooms;

  const lowerQuery = query.toLowerCase().trim();

  return rooms.filter(room => {
    const roomNumberMatch = (room.roomNumber || '').toLowerCase().includes(lowerQuery);
    const typeMatch = (room.type || '').toLowerCase().includes(lowerQuery);
    const guestMatch = room.guests && (room.guests.name || '').toLowerCase().includes(lowerQuery);
    const bedTypeMatch = (room.bedType || '').toLowerCase().includes(lowerQuery);

    return roomNumberMatch || typeMatch || guestMatch || bedTypeMatch;
  });
}
