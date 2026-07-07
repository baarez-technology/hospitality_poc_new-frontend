/**
 * Housekeeping Search Utility
 * Fuzzy, case-insensitive search across multiple fields
 */

export function searchRooms(rooms, query) {
  if (!query || query.trim() === '') return rooms;

  const searchTerm = query.toLowerCase().trim();

  return rooms.filter((room) => {
    // Search room number
    const roomNumber = (room.roomNumber || room.number)?.toString().toLowerCase() || '';
    if (roomNumber.includes(searchTerm)) return true;

    // Search floor
    const floor = room.floor?.toString() || '';
    if (floor.includes(searchTerm)) return true;

    // Search room type
    const type = (room.type || room.roomType)?.toLowerCase() || '';
    if (type.includes(searchTerm)) return true;

    // Search status
    const status = room.status?.toLowerCase() || '';
    if (status.includes(searchTerm)) return true;

    // Search cleaning status
    const cleaningStatus = room.cleaningStatus?.toLowerCase() || '';
    if (cleaningStatus.includes(searchTerm)) return true;

    // Search notes
    const notes = room.notes?.toLowerCase() || '';
    if (notes.includes(searchTerm)) return true;

    // Search assigned staff name (comes from API)
    if (room.assignedStaffName) {
      const staffName = room.assignedStaffName.toLowerCase();
      if (staffName.includes(searchTerm)) return true;
    }

    return false;
  });
}
