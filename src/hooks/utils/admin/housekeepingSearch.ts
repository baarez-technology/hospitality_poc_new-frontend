/**
 * Housekeeping Search Utility
 * Fuzzy, case-insensitive search across multiple fields
 */

import { housekeepersData } from '@/data/housekeepersData';

export function searchRooms(rooms, query) {
  if (!query || query.trim() === '') return rooms;

  const searchTerm = query.toLowerCase().trim();

  return rooms.filter((room) => {
    // Search room number
    const roomNumber = room.roomNumber?.toLowerCase() || '';
    if (roomNumber.includes(searchTerm)) return true;

    // Search floor
    const floor = room.floor?.toString() || '';
    if (floor.includes(searchTerm)) return true;

    // Search room type
    const type = room.type?.toLowerCase() || '';
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

    // Search assigned staff name
    if (room.assignedTo) {
      const housekeeper = housekeepersData.find(hk => hk.id === room.assignedTo);
      if (housekeeper) {
        const staffName = housekeeper.name.toLowerCase();
        if (staffName.includes(searchTerm)) return true;
      }
    }

    return false;
  });
}
