import { useState, useMemo, useEffect } from 'react';
import { staffData as initialStaffData } from '../data/staffData';
import { filterByDepartment, filterStaff } from '../utils/staffFilter';
import { searchStaff } from '../utils/staffSearch';
import { sortStaff } from '../utils/staffSort';

const STAFF_STORAGE_KEY = 'glimmora_staff_data';

/**
 * Load staff from localStorage or return initial data
 */
function loadStaffFromStorage() {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load staff from localStorage:', e);
  }
  return initialStaffData;
}

/**
 * Save staff to localStorage
 */
function saveStaffToStorage(staff) {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
  } catch (e) {
    console.warn('Failed to save staff to localStorage:', e);
  }
}

/**
 * Master hook for staff state management
 * Implements complete data pipeline: rawData → department → filter → search → sort → paginate
 * Includes localStorage persistence
 *
 * Provides CRUD operations:
 * - updateStatus(id, newStatus)
 * - assignShift(id, shiftData)
 * - markLeave(id, leaveData)
 * - sendMessage(id, messageData)
 * - addStaff(newStaff)
 * - editStaff(id, updates)
 * - disableStaff(id)
 */
export function useStaff() {
  // Raw data state - load from localStorage
  const [staff, setStaff] = useState(loadStaffFromStorage);

  // Department/Tab state
  const [activeDepartment, setActiveDepartment] = useState('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    shift: 'all'
  });

  // Sort state
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter management functions
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      role: 'all',
      status: 'all',
      shift: 'all'
    });
  };

  const hasActiveFilters = () => {
    return filters.role !== 'all'
      || filters.status !== 'all'
      || filters.shift !== 'all';
  };

  // Sort management
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // CRUD Operations

  /**
   * Update staff status (active, off-duty, sick, leave)
   */
  const updateStatus = (id, newStatus) => {
    setStaff(prev => prev.map(member =>
      member.id === id
        ? { ...member, status: newStatus }
        : member
    ));
  };

  /**
   * Assign shift to staff member
   * @param {string} id - Staff ID
   * @param {object} shiftData - { date, shift, startTime, endTime }
   */
  const assignShift = (id, shiftData) => {
    setStaff(prev => prev.map(member => {
      if (member.id === id) {
        // Update the default shift
        const updatedMember = { ...member, shift: shiftData.shift };

        // Add to schedule
        const newScheduleEntry = {
          date: shiftData.date,
          shift: shiftData.shift
        };

        // Check if date already exists in schedule
        const existingIndex = member.schedule.findIndex(s => s.date === shiftData.date);
        const updatedSchedule = existingIndex >= 0
          ? member.schedule.map((s, i) => i === existingIndex ? newScheduleEntry : s)
          : [...member.schedule, newScheduleEntry];

        updatedMember.schedule = updatedSchedule.sort((a, b) =>
          new Date(a.date) - new Date(b.date)
        );

        return updatedMember;
      }
      return member;
    }));
  };

  /**
   * Mark leave for staff member
   * @param {string} id - Staff ID
   * @param {object} leaveData - { startDate, endDate, type, notes }
   */
  const markLeave = (id, leaveData) => {
    setStaff(prev => prev.map(member => {
      if (member.id === id) {
        const updatedMember = {
          ...member,
          status: 'leave',
          leaveHistory: [
            ...member.leaveHistory,
            {
              startDate: leaveData.startDate,
              endDate: leaveData.endDate,
              type: leaveData.type,
              notes: leaveData.notes || ''
            }
          ]
        };
        return updatedMember;
      }
      return member;
    }));
  };

  /**
   * Send message to staff member (simulated)
   * @param {string} id - Staff ID
   * @param {object} messageData - { subject, message }
   */
  const sendMessage = (id, messageData) => {
    // In a real app, this would call an API
    // For now, we just return success
    console.log(`Message sent to staff ${id}:`, messageData);
    return { success: true };
  };

  /**
   * Add new staff member
   */
  const addStaff = (newStaffData) => {
    const newId = `S-${String(staff.length + 1).padStart(3, '0')}`;
    const newStaff = {
      id: newId,
      name: newStaffData.name,
      role: newStaffData.role,
      department: newStaffData.department,
      status: newStaffData.status || 'active',
      phone: newStaffData.phone,
      email: newStaffData.email,
      avatar: newStaffData.avatar || newStaffData.name.split(' ').filter(n => n).map(n => n[0]).join('') || 'G'.toUpperCase(),
      shift: newStaffData.shift || 'morning',
      floorAssignment: newStaffData.floorAssignment || null,
      joinDate: new Date().toISOString().split('T')[0],
      tasksToday: 0,
      completedToday: 0,
      efficiency: 0,
      rating: 0,
      performance: {
        tasksCompleted: 0,
        avgResponseTime: '0 min',
        customerRating: 0,
        punctuality: 100
      },
      schedule: [],
      leaveHistory: [],
      aiInsights: ['New staff member', 'Training in progress']
    };

    setStaff(prev => [...prev, newStaff]);
    return newStaff;
  };

  /**
   * Edit staff member details
   */
  const editStaff = (id, updates) => {
    setStaff(prev => prev.map(member =>
      member.id === id
        ? { ...member, ...updates }
        : member
    ));
  };

  /**
   * Disable staff member
   */
  const disableStaff = (id) => {
    setStaff(prev => prev.map(member =>
      member.id === id
        ? { ...member, status: 'disabled' }
        : member
    ));
  };

  /**
   * Delete staff member
   */
  const deleteStaff = (id) => {
    setStaff(prev => prev.filter(member => member.id !== id));
  };

  /**
   * Record check-in
   */
  const recordCheckIn = (id) => {
    const now = new Date().toISOString();
    setStaff(prev => prev.map(member => {
      if (member.id === id) {
        return { ...member, status: 'active', lastCheckIn: now };
      }
      return member;
    }));
  };

  /**
   * Record check-out
   */
  const recordCheckOut = (id) => {
    const now = new Date().toISOString();
    setStaff(prev => prev.map(member => {
      if (member.id === id) {
        return { ...member, status: 'off-duty', lastCheckOut: now };
      }
      return member;
    }));
  };

  // Persist to localStorage whenever staff changes
  useEffect(() => {
    saveStaffToStorage(staff);
  }, [staff]);

  // Data processing pipeline
  const processedStaff = useMemo(() => {
    let result = filterByDepartment(staff, activeDepartment);
    result = filterStaff(result, filters);
    result = searchStaff(result, searchQuery);
    if (sortField) {
      result = sortStaff(result, sortField, sortDirection);
    }
    return result;
  }, [staff, activeDepartment, filters, searchQuery, sortField, sortDirection]);

  // Calculate department counts
  const departmentCounts = useMemo(() => {
    return {
      all: staff.length,
      frontdesk: staff.filter(s => s.department === 'frontdesk').length,
      housekeeping: staff.filter(s => s.department === 'housekeeping').length,
      management: staff.filter(s => s.department === 'management').length,
      maintenance: staff.filter(s => s.department === 'maintenance').length
    };
  }, [staff]);

  return {
    // Data
    staff: processedStaff,
    rawStaff: staff,

    // Department/Tab
    activeDepartment,
    setActiveDepartment,
    departmentCounts,

    // Search
    searchQuery,
    setSearchQuery,

    // Filters
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),

    // Sort
    sortField,
    sortDirection,
    handleSort,

    // CRUD Operations
    updateStatus,
    assignShift,
    markLeave,
    sendMessage,
    addStaff,
    editStaff,
    disableStaff,
    deleteStaff,
    recordCheckIn,
    recordCheckOut
  };
}
