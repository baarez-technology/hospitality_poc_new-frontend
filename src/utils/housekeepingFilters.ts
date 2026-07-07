/**
 * Housekeeping Filtering Utility
 * Multi-filter chaining for rooms
 */

export function filterByFloor(rooms, floor) {
  if (!floor || floor === 'all') return rooms;
  return rooms.filter(room => room.floor === parseInt(floor));
}

export function filterByStatus(rooms, status) {
  if (!status || status === 'all') return rooms;
  return rooms.filter(room => room.status === status);
}

export function filterByCleaningStatus(rooms, cleaningStatus) {
  if (!cleaningStatus || cleaningStatus === 'all') return rooms;
  return rooms.filter(room => room.cleaningStatus === cleaningStatus);
}

export function filterByType(rooms, type) {
  if (!type || type === 'all') return rooms;
  return rooms.filter(room => room.type === type);
}

export function filterByStaff(rooms, staffId) {
  if (!staffId || staffId === 'all') return rooms;
  if (staffId === 'unassigned') {
    return rooms.filter(room => !room.assignedTo);
  }
  return rooms.filter(room => room.assignedTo === staffId);
}

export function filterByPriority(rooms, priority) {
  if (!priority || priority === 'all') return rooms;
  return rooms.filter(room => room.priority === priority);
}

/**
 * Apply all filters in sequence
 */
export function applyFilters(rooms, filters) {
  let result = rooms;

  if (filters.floor) {
    result = filterByFloor(result, filters.floor);
  }

  if (filters.status) {
    result = filterByStatus(result, filters.status);
  }

  if (filters.cleaningStatus) {
    result = filterByCleaningStatus(result, filters.cleaningStatus);
  }

  if (filters.type) {
    result = filterByType(result, filters.type);
  }

  if (filters.staff) {
    result = filterByStaff(result, filters.staff);
  }

  if (filters.priority) {
    result = filterByPriority(result, filters.priority);
  }

  return result;
}
