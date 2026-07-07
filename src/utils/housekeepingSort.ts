/**
 * Housekeeping Sorting Utility
 * Sort rooms by various fields with ASC/DESC support
 */

export function sortRooms(rooms, field, direction = 'asc') {
  if (!field) return rooms;

  const sorted = [...rooms].sort((a, b) => {
    let aValue, bValue;

    switch (field) {
      case 'roomNumber':
        // Extract numeric part for proper sorting (e.g., "101" vs "102")
        aValue = parseInt(a.roomNumber);
        bValue = parseInt(b.roomNumber);
        break;

      case 'floor':
        aValue = a.floor;
        bValue = b.floor;
        break;

      case 'type':
        aValue = a.type?.toLowerCase() || '';
        bValue = b.type?.toLowerCase() || '';
        break;

      case 'status':
        // Custom order: dirty > in_progress > clean > out_of_service
        const statusOrder = { dirty: 1, in_progress: 2, clean: 3, out_of_service: 4 };
        aValue = statusOrder[a.status] || 999;
        bValue = statusOrder[b.status] || 999;
        break;

      case 'cleaningStatus':
        // Custom order: not_started > in_progress > done
        const cleaningOrder = { not_started: 1, in_progress: 2, done: 3 };
        aValue = cleaningOrder[a.cleaningStatus] || 999;
        bValue = cleaningOrder[b.cleaningStatus] || 999;
        break;

      case 'priority':
        // Custom order: high > medium > low
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        aValue = priorityOrder[a.priority] || 999;
        bValue = priorityOrder[b.priority] || 999;
        break;

      case 'timeSinceDirty':
        aValue = a.timeSinceDirtyMinutes || 0;
        bValue = b.timeSinceDirtyMinutes || 0;
        break;

      case 'assignedTo':
        aValue = a.assignedTo || '';
        bValue = b.assignedTo || '';
        break;

      default:
        return 0;
    }

    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Handle numeric comparison
    if (direction === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  return sorted;
}

export const SORTABLE_FIELDS = [
  { value: 'roomNumber', label: 'Room Number' },
  { value: 'floor', label: 'Floor' },
  { value: 'status', label: 'Status' },
  { value: 'cleaningStatus', label: 'Cleaning Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'timeSinceDirty', label: 'Time Since Dirty' },
  { value: 'type', label: 'Room Type' }
];
