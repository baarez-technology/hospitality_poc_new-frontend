import { useState, useMemo, useEffect } from 'react';
import { roomsData as initialRoomsData } from '../data/roomsData';
import { filterByTab, filterRooms, searchRooms } from '../utils/roomFilters';

const ROOMS_STORAGE_KEY = 'glimmora_rooms_data';

/**
 * Load rooms from localStorage or return initial data
 */
function loadRoomsFromStorage() {
  try {
    const stored = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load rooms from localStorage:', e);
  }
  return initialRoomsData;
}

/**
 * Save rooms to localStorage
 */
function saveRoomsToStorage(rooms) {
  try {
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  } catch (e) {
    console.warn('Failed to save rooms to localStorage:', e);
  }
}

/**
 * Master hook for room state management
 * Implements complete data pipeline and all room operations
 * Includes localStorage persistence
 */
export function useRooms() {
  // Raw data state - load from localStorage
  const [rooms, setRooms] = useState(loadRoomsFromStorage);

  // Tab state
  const [activeTab, setActiveTab] = useState('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    type: 'all',
    floor: 'all',
    status: 'all',
    cleaning: 'all'
  });

  // Filter management functions
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      floor: 'all',
      status: 'all',
      cleaning: 'all'
    });
  };

  const hasActiveFilters = () => {
    return filters.type !== 'all'
      || filters.floor !== 'all'
      || filters.status !== 'all'
      || filters.cleaning !== 'all';
  };

  // Room update function
  const updateRoom = (id, updates) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  // Update room status
  const updateStatus = (roomId, newStatus) => {
    setRooms(prev => prev.map(r =>
      r.id === roomId ? { ...r, status: newStatus } : r
    ));
  };

  // Set cleaning state
  const setCleaningState = (roomId, cleaningState) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        // If marking clean and room was dirty, set status to available
        if (cleaningState === 'clean' && r.status === 'dirty') {
          return { ...r, cleaning: cleaningState, status: 'available' };
        }
        // If marking dirty and room was available, set status to dirty
        if (cleaningState === 'dirty' && r.status === 'available') {
          return { ...r, cleaning: cleaningState, status: 'dirty' };
        }
        // Otherwise just update cleaning state
        return { ...r, cleaning: cleaningState };
      }
      return r;
    }));
  };

  // Assign guest to room
  const assignGuestToRoom = (roomId, guest) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        // Only assign if room is available and not out of service
        if (r.status === 'available' && r.status !== 'out_of_service') {
          return {
            ...r,
            status: 'occupied',
            guests: guest
          };
        }
      }
      return r;
    }));
  };

  // Unassign guest from room
  const unassignGuest = (roomId) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId && r.status === 'occupied') {
        return {
          ...r,
          status: 'available',
          guests: null
        };
      }
      return r;
    }));
  };

  // Block room
  const blockRoom = (roomId, reason, until) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          status: 'out_of_service',
          guests: null,
          blockedReason: reason,
          blockedUntil: until
        };
      }
      return r;
    }));
  };

  // Unblock room
  const unblockRoom = (roomId) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId && r.status === 'out_of_service') {
        return {
          ...r,
          status: 'available',
          blockedReason: null,
          blockedUntil: null
        };
      }
      return r;
    }));
  };

  // Add new room
  const addRoom = (roomData) => {
    const newRoom = {
      id: `R-${Date.now()}`,
      ...roomData,
      status: roomData.status || 'available',
      cleaning: roomData.cleaning || 'clean',
      guests: null,
      blockedReason: null,
      blockedUntil: null
    };
    setRooms(prev => [newRoom, ...prev]);
  };

  // Delete room
  const deleteRoom = (roomId) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  // Persist to localStorage whenever rooms change
  useEffect(() => {
    saveRoomsToStorage(rooms);
  }, [rooms]);

  // Data processing pipeline
  const processedRooms = useMemo(() => {
    let result = filterByTab(rooms, activeTab);
    result = filterRooms(result, filters);
    result = searchRooms(result, searchQuery);
    return result;
  }, [rooms, activeTab, filters, searchQuery]);

  return {
    rooms: processedRooms,
    rawRooms: rooms,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
    updateRoom,
    updateStatus,
    setCleaningState,
    assignGuestToRoom,
    unassignGuest,
    blockRoom,
    unblockRoom,
    addRoom,
    deleteRoom
  };
}
