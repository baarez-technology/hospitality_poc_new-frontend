import { useState, useCallback, useEffect } from 'react';
import { housekeepingRoomsData } from '../data/housekeepingRoomsData';
import { housekeepersData } from '../data/housekeepersData';
import { autoAssignRooms, addNoteWithTimestamp } from '../utils/housekeeping';

const HK_ROOMS_STORAGE_KEY = 'glimmora_hk_rooms';
const HK_STAFF_STORAGE_KEY = 'glimmora_hk_staff';

/**
 * Load rooms from localStorage or return initial data
 */
function loadRoomsFromStorage() {
  try {
    const stored = localStorage.getItem(HK_ROOMS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load HK rooms from localStorage:', e);
  }
  return housekeepingRoomsData;
}

/**
 * Load staff from localStorage or return initial data
 */
function loadStaffFromStorage() {
  try {
    const stored = localStorage.getItem(HK_STAFF_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load HK staff from localStorage:', e);
  }
  return housekeepersData;
}

/**
 * Save rooms to localStorage
 */
function saveRoomsToStorage(rooms) {
  try {
    localStorage.setItem(HK_ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  } catch (e) {
    console.warn('Failed to save HK rooms to localStorage:', e);
  }
}

/**
 * Save staff to localStorage
 */
function saveStaffToStorage(staff) {
  try {
    localStorage.setItem(HK_STAFF_STORAGE_KEY, JSON.stringify(staff));
  } catch (e) {
    console.warn('Failed to save HK staff to localStorage:', e);
  }
}

/**
 * Master Housekeeping Hook - Manages all housekeeping operations
 * Includes: cleaning workflow, status engine, staff assignment, checklist management
 * With localStorage persistence
 */
export function useHousekeeping() {
  const [rooms, setRooms] = useState(loadRoomsFromStorage);
  const [staff, setStaff] = useState(loadStaffFromStorage);

  // Persist to localStorage whenever rooms or staff change
  useEffect(() => {
    saveRoomsToStorage(rooms);
  }, [rooms]);

  useEffect(() => {
    saveStaffToStorage(staff);
  }, [staff]);

  /**
   * STAFF ASSIGNMENT SYSTEM
   */
  const assignStaffToRoom = useCallback((roomId, staffId) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const previousStaffId = room.assignedTo;

        // Update staff task counts
        setStaff(prevStaff => prevStaff.map(s => {
          if (s.id === previousStaffId) {
            // Decrement previous staff
            return {
              ...s,
              tasksAssigned: Math.max(0, s.tasksAssigned - 1)
            };
          }
          if (s.id === staffId) {
            // Increment new staff
            return {
              ...s,
              tasksAssigned: s.tasksAssigned + 1
            };
          }
          return s;
        }));

        return { ...room, assignedTo: staffId };
      }
      return room;
    }));
  }, []);

  /**
   * BULK ASSIGNMENT
   */
  const bulkAssignRooms = useCallback((roomIds, staffId) => {
    setRooms(prev => prev.map(room => {
      if (roomIds.includes(room.id)) {
        return { ...room, assignedTo: staffId };
      }
      return room;
    }));

    // Update staff task count
    setStaff(prevStaff => prevStaff.map(s => {
      if (s.id === staffId) {
        return {
          ...s,
          tasksAssigned: s.tasksAssigned + roomIds.length
        };
      }
      return s;
    }));
  }, []);

  /**
   * CLEANING WORKFLOW ENGINE
   * Allowed states: not_started → in_progress → done
   */
  const startCleaning = useCallback((roomId) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          cleaningStatus: 'in_progress',
          status: 'in_progress',
          cleaningStartedAt: new Date().toISOString()
        };
      }
      return room;
    }));
  }, []);

  const markRoomCleaned = useCallback((roomId) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const completedAt = new Date().toISOString();

        // Update staff completed tasks
        if (room.assignedTo) {
          setStaff(prevStaff => prevStaff.map(s => {
            if (s.id === room.assignedTo) {
              const newCompleted = s.tasksCompleted + 1;
              return {
                ...s,
                tasksCompleted: newCompleted,
                efficiency: Math.round((newCompleted / s.tasksAssigned) * 100)
              };
            }
            return s;
          }));
        }

        return {
          ...room,
          cleaningStatus: 'done',
          status: 'clean',
          cleaningCompletedAt: completedAt,
          lastCleaned: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          timeSinceDirtyMinutes: 0
        };
      }
      return room;
    }));
  }, []);

  /**
   * ROOM STATUS ENGINE
   */
  const markRoomDirty = useCallback((roomId) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        // Reset checklist
        const resetChecklist = room.checklist.map(item => ({
          ...item,
          completed: false
        }));

        return {
          ...room,
          status: 'dirty',
          cleaningStatus: 'not_started',
          cleaningStartedAt: null,
          cleaningCompletedAt: null,
          timeSinceDirtyMinutes: 0,
          checklist: resetChecklist
        };
      }
      return room;
    }));
  }, []);

  const updateRoomStatus = useCallback((roomId, newStatus) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return { ...room, status: newStatus };
      }
      return room;
    }));
  }, []);

  const blockRoom = useCallback((roomId, reason) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const previousStaffId = room.assignedTo;

        // Decrement staff task count if assigned
        if (previousStaffId) {
          setStaff(prevStaff => prevStaff.map(s => {
            if (s.id === previousStaffId) {
              return {
                ...s,
                tasksAssigned: Math.max(0, s.tasksAssigned - 1)
              };
            }
            return s;
          }));
        }

        return {
          ...room,
          status: 'out_of_service',
          assignedTo: null,
          notes: reason || 'Room blocked for maintenance'
        };
      }
      return room;
    }));
  }, []);

  const unblockRoom = useCallback((roomId) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        // Determine status based on cleaning state
        const newStatus = room.cleaningStatus === 'done' ? 'clean' : 'dirty';
        return {
          ...room,
          status: newStatus,
          notes: ''
        };
      }
      return room;
    }));
  }, []);

  /**
   * CHECKLIST MANAGEMENT
   */
  const toggleChecklistItem = useCallback((roomId, taskId) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const updatedChecklist = room.checklist.map(item => {
          if (item.id === taskId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        });

        // Check if all tasks are completed
        const allCompleted = updatedChecklist.every(item => item.completed);

        // Auto-mark room as clean if all tasks completed
        if (allCompleted && room.status !== 'clean') {
          const completedAt = new Date().toISOString();

          // Update staff stats
          if (room.assignedTo) {
            setStaff(prevStaff => prevStaff.map(s => {
              if (s.id === room.assignedTo) {
                const newCompleted = s.tasksCompleted + 1;
                return {
                  ...s,
                  tasksCompleted: newCompleted,
                  efficiency: Math.round((newCompleted / s.tasksAssigned) * 100)
                };
              }
              return s;
            }));
          }

          return {
            ...room,
            checklist: updatedChecklist,
            cleaningStatus: 'done',
            status: 'clean',
            cleaningCompletedAt: completedAt,
            lastCleaned: new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          };
        }

        return {
          ...room,
          checklist: updatedChecklist
        };
      }
      return room;
    }));
  }, []);

  const editChecklist = useCallback((roomId, newChecklist) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          checklist: newChecklist
        };
      }
      return room;
    }));
  }, []);

  const addChecklistItem = useCallback((roomId, taskName) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const maxId = Math.max(...room.checklist.map(item => item.id), 0);
        const newItem = {
          id: maxId + 1,
          task: taskName,
          completed: false
        };
        return {
          ...room,
          checklist: [...room.checklist, newItem]
        };
      }
      return room;
    }));
  }, []);

  const removeChecklistItem = useCallback((roomId, taskId) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          checklist: (Array.isArray(room.checklist) ? room.checklist : []).filter(item => item.id !== taskId)
        };
      }
      return room;
    }));
  }, []);

  /**
   * PRIORITY MANAGEMENT
   */
  const updatePriority = useCallback((roomId, priority) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return { ...room, priority };
      }
      return room;
    }));
  }, []);

  /**
   * NOTES MANAGEMENT
   */
  const updateNotes = useCallback((roomId, notes) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return { ...room, notes };
      }
      return room;
    }));
  }, []);

  /**
   * Add note with timestamp
   */
  const addNote = useCallback((roomId, newNote) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const updatedNotes = addNoteWithTimestamp(room.notes, newNote);
        return { ...room, notes: updatedNotes };
      }
      return room;
    }));
  }, []);

  /**
   * INSPECTION / VERIFY SYSTEM
   */
  const inspectRoom = useCallback((roomId) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId && room.status === 'clean') {
        return {
          ...room,
          status: 'inspected',
          inspectedAt: new Date().toISOString(),
          inspectedBy: 'Manager' // In real app, would use actual user
        };
      }
      return room;
    }));
  }, []);

  /**
   * AUTO-ASSIGN ALGORITHM
   */
  const runAutoAssign = useCallback(() => {
    const result = autoAssignRooms(rooms, staff);

    if (result.assignments.length === 0) {
      return result;
    }

    // Apply assignments
    setRooms(prev => prev.map(room => {
      const assignment = result.assignments.find(a => a.roomId === room.id);
      if (assignment) {
        return { ...room, assignedTo: assignment.staffId };
      }
      return room;
    }));

    // Update staff task counts
    const staffUpdates = {};
    result.assignments.forEach(a => {
      if (!staffUpdates[a.staffId]) {
        staffUpdates[a.staffId] = 0;
      }
      staffUpdates[a.staffId]++;
    });

    setStaff(prev => prev.map(s => {
      if (staffUpdates[s.id]) {
        return {
          ...s,
          tasksAssigned: s.tasksAssigned + staffUpdates[s.id]
        };
      }
      return s;
    }));

    return result;
  }, [rooms, staff]);

  /**
   * ADD CLEANING TASK
   */
  const addCleaningTask = useCallback((taskData) => {
    const { roomId, staffId, priority, notes, estimatedTime } = taskData;

    // Update room
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const updatedNotes = notes ? addNoteWithTimestamp(room.notes, notes) : room.notes;
        return {
          ...room,
          assignedTo: staffId,
          priority: priority,
          notes: updatedNotes,
          estimatedCleaningTime: estimatedTime
        };
      }
      return room;
    }));

    // Update staff task count
    setStaff(prev => prev.map(s => {
      if (s.id === staffId) {
        return {
          ...s,
          tasksAssigned: s.tasksAssigned + 1
        };
      }
      return s;
    }));
  }, []);

  /**
   * UNASSIGN STAFF FROM ROOM
   */
  const unassignStaff = useCallback((roomId) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const previousStaffId = room.assignedTo;

        // Decrement staff task count
        if (previousStaffId) {
          setStaff(prevStaff => prevStaff.map(s => {
            if (s.id === previousStaffId) {
              return {
                ...s,
                tasksAssigned: Math.max(0, s.tasksAssigned - 1)
              };
            }
            return s;
          }));
        }

        return { ...room, assignedTo: null };
      }
      return room;
    }));
  }, []);

  return {
    rooms,
    setRooms,
    staff,
    setStaff,
    // Staff assignment
    assignStaffToRoom,
    bulkAssignRooms,
    unassignStaff,
    // Cleaning workflow
    startCleaning,
    markRoomCleaned,
    markRoomDirty,
    // Status engine
    updateRoomStatus,
    blockRoom,
    unblockRoom,
    // Checklist management
    toggleChecklistItem,
    editChecklist,
    addChecklistItem,
    removeChecklistItem,
    // Priority and notes
    updatePriority,
    updateNotes,
    addNote,
    // Inspection
    inspectRoom,
    // Auto-assign
    runAutoAssign,
    // Add cleaning task
    addCleaningTask
  };
}
