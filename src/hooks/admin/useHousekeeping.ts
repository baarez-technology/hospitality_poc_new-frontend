import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { housekeepingService, HousekeepingTask } from '@/api/services/housekeeping.service';
import { roomsService } from '@/api/services/rooms.service';
import { staffService, Staff } from '@/api/services/staff.service';

// Interface for frontend room representation
export interface HousekeepingRoom {
  id: number;
  number: string;
  roomType: string;
  floor: number;
  status: 'clean' | 'dirty' | 'in_progress' | 'inspected' | 'out_of_service';
  cleaningStatus: 'not_started' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: number | null;
  assignedStaffName?: string;
  lastCleaned?: string;
  cleaningStartedAt?: string;
  cleaningCompletedAt?: string;
  timeSinceDirtyMinutes?: number;
  notes?: string;
  taskId?: number; // Associated housekeeping task ID
  checklist: ChecklistItem[];
  bedType?: string;
  viewType?: string;
  maxOccupancy?: number;
}

export interface ChecklistItem {
  id: number;
  task: string;
  completed: boolean;
}

export interface HousekeepingStaff {
  id: number;
  name: string;
  status: 'available' | 'busy' | 'on_break' | 'off_duty';
  shift: string;
  tasksAssigned: number;
  tasksCompleted: number;
  efficiency: number;
  currentRoom?: string;
  avatar?: string;
}

// Default checklist for rooms
const defaultChecklist: ChecklistItem[] = [
  { id: 1, task: 'Make beds', completed: false },
  { id: 2, task: 'Clean bathroom', completed: false },
  { id: 3, task: 'Vacuum floors', completed: false },
  { id: 4, task: 'Dust surfaces', completed: false },
  { id: 5, task: 'Restock amenities', completed: false },
  { id: 6, task: 'Empty trash', completed: false },
  { id: 7, task: 'Check minibar', completed: false },
  { id: 8, task: 'Replace towels', completed: false },
];

/**
 * BUG-020 FIX: Normalize UTC datetime strings from backend.
 * Backend uses datetime.utcnow() but returns ISO strings without Z suffix.
 * Without Z, JavaScript treats the string as local time, causing timezone offset errors.
 */
function normalizeUtcDateTime(dt: string | null | undefined): string | null {
  if (!dt) return null;
  // If it already has timezone info (Z or +/-offset), return as-is
  if (dt.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dt)) return dt;
  // Append Z to indicate UTC
  return dt + 'Z';
}

/**
 * Master Housekeeping Hook - Manages all housekeeping operations
 * Connected to backend APIs for real data
 */
export function useHousekeeping() {
  const [rooms, setRooms] = useState<HousekeepingRoom[]>([]);
  const [staff, setStaff] = useState<HousekeepingStaff[]>([]);
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch rooms and tasks from API
   */
  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch rooms and tasks in parallel
      const [roomsData, tasksData] = await Promise.all([
        housekeepingService.getRooms(),
        housekeepingService.getTasks()
      ]);

      // Store tasks for reference
      const tasksList = Array.isArray(tasksData) ? tasksData : [];
      setTasks(tasksList);

      // Create a map of room_id to task (newest per room, in_progress wins)
      const tasksByRoomId = new Map<number, HousekeepingTask>();
      tasksList.forEach((task: HousekeepingTask) => {
        const existing = tasksByRoomId.get(task.room_id);
        if (!existing) {
          tasksByRoomId.set(task.room_id, task);
        } else if (task.status === 'in_progress' && existing.status !== 'in_progress') {
          // In-progress always wins — cleaning is happening now
          tasksByRoomId.set(task.room_id, task);
        }
      });

      // Transform API rooms to frontend format
      const transformedRooms: HousekeepingRoom[] = (Array.isArray(roomsData) ? roomsData : []).map((room: any) => {
        // Room-embedded task data is the authoritative source (backend selects the correct task).
        // Only override with tasks-list data if it has an active (in_progress/assigned) task.
        const taskFromRoom = room.task_id ? room : null;
        const taskFromList = tasksByRoomId.get(room.id);
        const activeTask = (taskFromList?.status === 'in_progress' || taskFromList?.status === 'assigned')
          ? taskFromList
          : null;

        const taskId = activeTask?.id || taskFromRoom?.task_id || null;
        const assignedTo = activeTask?.assigned_to ?? taskFromRoom?.assigned_to ?? null;
        const assignedStaffName = activeTask?.assigned_staff_name || taskFromRoom?.assigned_staff_name || null;
        const taskPriority = activeTask?.priority || taskFromRoom?.task_priority || 'medium';
        const startedAt = normalizeUtcDateTime(activeTask?.started_at || taskFromRoom?.started_at || null);
        const completedAt = normalizeUtcDateTime(activeTask?.completed_at || taskFromRoom?.completed_at || null);
        const taskNotes = activeTask?.notes || taskFromRoom?.notes || '';

        // Determine cleaning status from task or room status
        let cleaningStatus: 'not_started' | 'in_progress' | 'done' = 'not_started';
        if (room.status === 'clean' || room.status === 'inspected') {
          cleaningStatus = 'done';
        } else if (room.status === 'in_progress' || activeTask?.status === 'in_progress') {
          cleaningStatus = 'in_progress';
        }

        // Extract floor from room number if not provided by API
        const extractFloorFromNumber = (roomNum: string): number => {
          if (!roomNum || roomNum.length < 2) return 1;
          const floorPart = roomNum.slice(0, -2);
          const parsed = parseInt(floorPart, 10);
          return isNaN(parsed) || parsed < 1 ? 1 : parsed;
        };

        // BUG-003/BUG-022 FIX: For clean/inspected rooms, mark checklist as all completed
        const roomChecklist = (room.status === 'clean' || room.status === 'inspected')
          ? defaultChecklist.map(item => ({ ...item, completed: true }))
          : [...defaultChecklist];

        return {
          id: room.id,
          number: room.number,
          roomNumber: room.number,
          type: room.room_type || 'Standard',
          roomType: room.room_type || 'Standard',
          floor: room.floor || extractFloorFromNumber(room.number),
          status: room.status || 'dirty',
          cleaningStatus,
          priority: taskPriority,
          assignedTo,
          assignedStaffName,
          // Build assignedStaff object for StaffView and RoomCard components
          assignedStaff: assignedTo ? {
            id: assignedTo,
            name: assignedStaffName || 'Unknown',
            avatar: assignedStaffName?.charAt(0) || 'U'
          } : null,
          lastCleaned: room.last_cleaned,
          cleaningStartedAt: startedAt,
          cleaningCompletedAt: completedAt,
          notes: taskNotes,
          taskId,
          checklist: roomChecklist,
          bedType: room.bed_type,
          viewType: room.view_type,
          maxOccupancy: room.max_occupancy,
        };
      });

      setRooms(transformedRooms);
    } catch (err: any) {
      console.error('Error fetching housekeeping rooms:', err);
      setError(err.message || 'Failed to fetch rooms');
      toast.error('Failed to load housekeeping data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch housekeeping staff from API
   */
  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    try {
      let staffData = await staffService.list({ department: 'housekeeping' });

      // If no results, try fetching all and filter by housekeeping roles
      if (!Array.isArray(staffData) || staffData.length === 0) {
        const allStaff = await staffService.list();
        if (Array.isArray(allStaff)) {
          const housekeepingRoles = ['housekeeping', 'housekeeper', 'room_attendant', 'laundry_attendant'];
          staffData = allStaff.filter((s: any) =>
            housekeepingRoles.includes(s.role?.toLowerCase()) ||
            s.department?.toLowerCase() === 'housekeeping'
          );
        }
      }

      // Transform to frontend format with task counts
      const transformedStaff: HousekeepingStaff[] = (Array.isArray(staffData) ? staffData : []).map((s: Staff) => {
        // Count tasks assigned to this staff member
        const assignedTasks = tasks.filter(t => t.assigned_to === s.id);
        const completedTasks = assignedTasks.filter(t => t.status === 'completed');
        const inProgressTask = assignedTasks.find(t => t.status === 'in_progress');

        return {
          id: s.id,
          name: s.name,
          status: s.clocked_in ? (inProgressTask ? 'busy' : 'available') : 'off_duty',
          shift: s.shift || 'Morning',
          tasksAssigned: assignedTasks.length,
          tasksCompleted: completedTasks.length,
          efficiency: assignedTasks.length > 0
            ? Math.round((completedTasks.length / assignedTasks.length) * 100)
            : 100,
          currentRoom: inProgressTask?.room_number,
          avatar: s.avatar,
        };
      });

      setStaff(transformedStaff);
    } catch (err: any) {
      console.error('Error fetching housekeeping staff:', err);
      toast.error('Failed to load housekeeping staff');
      setStaff([]);
    } finally {
      setStaffLoading(false);
    }
  }, [tasks]);

  // Initial data fetch - fetch rooms and staff on mount
  useEffect(() => {
    fetchRooms();
    fetchStaff();
  }, []);

  // Re-fetch staff when tasks change to update task counts
  useEffect(() => {
    if (tasks.length > 0) {
      fetchStaff();
    }
  }, [tasks]);

  /**
   * STAFF ASSIGNMENT SYSTEM
   */
  const assignStaffToRoom = useCallback(async (roomId: number, staffId: number) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        toast.error('Room not found');
        return;
      }

      let taskId = room.taskId;

      // Create a task if one doesn't exist
      if (!taskId) {
        const newTask = await housekeepingService.createTask({
          room_id: roomId,
          task_type: 'cleaning',
          priority: room.priority || 'medium',
        });
        taskId = newTask.id;
      }

      // Assign staff to the task
      await housekeepingService.assignTask(taskId, {
        staff_id: staffId,
        priority: room.priority,
      });

      // Update local state
      const staffMember = staff.find(s => s.id === staffId);
      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            assignedTo: staffId,
            assignedStaffName: staffMember?.name,
            assignedStaff: staffMember ? {
              id: staffId,
              name: staffMember.name,
              avatar: staffMember.avatar || staffMember.name?.charAt(0) || 'U'
            } : null,
            taskId,
          };
        }
        return r;
      }));

      // Update staff task counts
      setStaff(prev => prev.map(s => {
        if (s.id === staffId) {
          return { ...s, tasksAssigned: s.tasksAssigned + 1, status: 'busy' };
        }
        return s;
      }));

      toast.success(`Room ${room.number} assigned to ${staffMember?.name || 'staff'}`);
    } catch (err: any) {
      console.error('Error assigning staff:', err);
      toast.error(err.response?.data?.detail || 'Failed to assign staff');
    }
  }, [rooms, staff]);

  /**
   * BULK ASSIGNMENT (BUG-023 FIX: now supports priority and notes)
   */
  const bulkAssignRooms = useCallback(async (roomIds: number[], staffId: number, priority?: string, notes?: string) => {
    try {
      for (const roomId of roomIds) {
        const room = rooms.find(r => r.id === roomId);
        if (!room) continue;

        let taskId = room.taskId;

        // Create task if one doesn't exist
        if (!taskId) {
          const newTask = await housekeepingService.createTask({
            room_id: roomId,
            task_type: 'cleaning',
            priority: priority || room.priority || 'medium',
            notes: notes,
          });
          taskId = newTask.id;
        }

        // Assign staff with priority and notes
        await housekeepingService.assignTask(taskId, {
          staff_id: staffId,
          priority: priority || room.priority,
          notes: notes,
        });

        // Update local state
        const staffMember = staff.find(s => s.id === staffId);
        setRooms(prev => prev.map(r => {
          if (r.id === roomId) {
            return {
              ...r,
              assignedTo: staffId,
              assignedStaffName: staffMember?.name,
              assignedStaff: staffMember ? {
                id: staffId,
                name: staffMember.name,
                avatar: staffMember.avatar || staffMember.name?.charAt(0) || 'U'
              } : null,
              taskId,
              priority: (priority as any) || r.priority,
              notes: notes || r.notes,
            };
          }
          return r;
        }));
      }
      toast.success(`${roomIds.length} rooms assigned`);
    } catch (err: any) {
      console.error('Error bulk assigning rooms:', err);
      toast.error('Failed to assign some rooms');
    }
  }, [rooms, staff]);

  /**
   * CLEANING WORKFLOW ENGINE
   */
  const startCleaning = useCallback(async (roomId: number) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        toast.error('Room not found');
        return;
      }

      let taskId = room.taskId;

      // Create task if doesn't exist
      if (!taskId) {
        const newTask = await housekeepingService.createTask({
          room_id: roomId,
          task_type: 'cleaning',
          priority: room.priority || 'medium',
        });
        taskId = newTask.id;
      }

      // Start the task (backend also updates room status to in_progress)
      const result = await housekeepingService.startTask(taskId);

      // BUG-020 FIX: Use server-returned started_at (normalized to UTC) for consistency
      const serverStartedAt = normalizeUtcDateTime(result?.started_at) || new Date().toISOString();

      // Update local state
      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            cleaningStatus: 'in_progress',
            status: 'in_progress',
            cleaningStartedAt: serverStartedAt,
            taskId,
          };
        }
        return r;
      }));

      toast.success(`Started cleaning room ${room.number}`);
    } catch (err: any) {
      console.error('Error starting cleaning:', err);
      toast.error(err.response?.data?.detail || 'Failed to start cleaning');
    }
  }, [rooms]);

  const markRoomCleaned = useCallback(async (roomId: number) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        toast.error('Room not found');
        return;
      }

      // Complete the task if exists (backend also sets room to clean)
      let serverCompletedAt: string | undefined;
      if (room.taskId) {
        const result = await housekeepingService.completeTask(room.taskId);
        serverCompletedAt = result?.completed_at;
      } else {
        // No task - just update room status
        await housekeepingService.updateRoomStatus(roomId, { status: 'clean' });
      }

      // Update local state - BUG-003/BUG-021 FIX: preserve task details and mark checklist completed
      const completedAt = serverCompletedAt || new Date().toISOString();
      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
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
            timeSinceDirtyMinutes: 0,
            // BUG-003/BUG-022 FIX: Mark all checklist items as completed
            checklist: r.checklist.map(item => ({ ...item, completed: true })),
          };
        }
        return r;
      }));

      // Update staff completed tasks
      if (room.assignedTo) {
        setStaff(prev => prev.map(s => {
          if (s.id === room.assignedTo) {
            const newCompleted = s.tasksCompleted + 1;
            return {
              ...s,
              tasksCompleted: newCompleted,
              efficiency: Math.round((newCompleted / s.tasksAssigned) * 100),
              status: 'available',
            };
          }
          return s;
        }));
      }

      toast.success(`Room ${room.number} marked as clean`);
    } catch (err: any) {
      console.error('Error marking room cleaned:', err);
      toast.error(err.response?.data?.detail || 'Failed to mark room as cleaned');
    }
  }, [rooms]);

  /**
   * ROOM STATUS ENGINE
   */
  const markRoomDirty = useCallback(async (roomId: number) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        toast.error('Room not found');
        return;
      }

      // Update room status via API
      await housekeepingService.updateRoomStatus(roomId, { status: 'dirty' });

      // Update local state
      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            status: 'dirty',
            cleaningStatus: 'not_started',
            cleaningStartedAt: undefined,
            cleaningCompletedAt: undefined,
            timeSinceDirtyMinutes: 0,
            checklist: defaultChecklist.map(item => ({ ...item, completed: false })),
          };
        }
        return r;
      }));

      toast.success(`Room ${room.number} marked as dirty`);
    } catch (err: any) {
      console.error('Error marking room dirty:', err);
      toast.error(err.response?.data?.detail || 'Failed to mark room as dirty');
    }
  }, [rooms]);

  const updateRoomStatus = useCallback(async (roomId: number, newStatus: string) => {
    try {
      await housekeepingService.updateRoomStatus(roomId, { status: newStatus });

      setRooms(prev => prev.map(room => {
        if (room.id === roomId) {
          return { ...room, status: newStatus as any };
        }
        return room;
      }));
    } catch (err: any) {
      console.error('Error updating room status:', err);
      toast.error(err.response?.data?.detail || 'Failed to update room status');
    }
  }, []);

  const blockRoom = useCallback(async (roomId: number, reason?: string) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        toast.error('Room not found');
        return;
      }

      await housekeepingService.updateRoomStatus(roomId, {
        status: 'out_of_service',
        notes: reason || 'Room blocked for maintenance'
      });

      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            status: 'out_of_service',
            assignedTo: null,
            notes: reason || 'Room blocked for maintenance',
          };
        }
        return r;
      }));

      // Update staff task count if was assigned
      if (room.assignedTo) {
        setStaff(prev => prev.map(s => {
          if (s.id === room.assignedTo) {
            return { ...s, tasksAssigned: Math.max(0, s.tasksAssigned - 1) };
          }
          return s;
        }));
      }

      toast.success(`Room ${room.number} blocked`);
    } catch (err: any) {
      console.error('Error blocking room:', err);
      toast.error(err.response?.data?.detail || 'Failed to block room');
    }
  }, [rooms]);

  const unblockRoom = useCallback(async (roomId: number) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        toast.error('Room not found');
        return;
      }

      const newStatus = room.cleaningStatus === 'done' ? 'clean' : 'dirty';
      await housekeepingService.updateRoomStatus(roomId, { status: newStatus });

      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return { ...r, status: newStatus, notes: '' };
        }
        return r;
      }));

      toast.success(`Room ${room.number} unblocked`);
    } catch (err: any) {
      console.error('Error unblocking room:', err);
      toast.error(err.response?.data?.detail || 'Failed to unblock room');
    }
  }, [rooms]);

  /**
   * CHECKLIST MANAGEMENT (local only - checklists are not stored in backend)
   */
  const toggleChecklistItem = useCallback((roomId: number, taskId: number) => {
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
          // Trigger API call to mark room clean
          markRoomCleaned(roomId);
        }

        return { ...room, checklist: updatedChecklist };
      }
      return room;
    }));
  }, [markRoomCleaned]);

  const editChecklist = useCallback((roomId: number, newChecklist: ChecklistItem[]) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return { ...room, checklist: newChecklist };
      }
      return room;
    }));
  }, []);

  const addChecklistItem = useCallback((roomId: number, taskName: string) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const maxId = Math.max(...room.checklist.map(item => item.id), 0);
        const newItem: ChecklistItem = {
          id: maxId + 1,
          task: taskName,
          completed: false,
        };
        return { ...room, checklist: [...room.checklist, newItem] };
      }
      return room;
    }));
  }, []);

  const removeChecklistItem = useCallback((roomId: number, taskId: number) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          checklist: (Array.isArray(room.checklist) ? room.checklist : []).filter(item => item.id !== taskId),
        };
      }
      return room;
    }));
  }, []);

  /**
   * PRIORITY MANAGEMENT
   */
  const updatePriority = useCallback(async (roomId: number, priority: string) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (room?.taskId) {
        await housekeepingService.updateTask(room.taskId, { notes: `Priority: ${priority}` });
      }

      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return { ...r, priority: priority as any };
        }
        return r;
      }));
    } catch (err: any) {
      console.error('Error updating priority:', err);
      // Update locally even if API fails
      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return { ...r, priority: priority as any };
        }
        return r;
      }));
    }
  }, [rooms]);

  /**
   * NOTES MANAGEMENT
   */
  const updateNotes = useCallback(async (roomId: number, notes: string) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (room?.taskId) {
        await housekeepingService.updateTask(room.taskId, { notes });
      }

      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return { ...r, notes };
        }
        return r;
      }));
    } catch (err: any) {
      console.error('Error updating notes:', err);
      // Update locally even if API fails
      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return { ...r, notes };
        }
        return r;
      }));
    }
  }, [rooms]);

  /**
   * Add note with timestamp - persists to Room.notes via dedicated API endpoint
   */
  const addNote = useCallback(async (roomId: number, newNote: string) => {
    const room = rooms.find(r => r.id === roomId);
    try {
      // Persist to Room.notes via dedicated endpoint (always works, regardless of taskId)
      const result = await roomsService.addRoomNote(roomId, newNote);

      // Update local state with the full notes from the API response
      const updatedNotes = result.notes;
      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return { ...r, notes: updatedNotes };
        }
        return r;
      }));

      // Also update task notes if a task exists (so maintenance staff see it too)
      if (room?.taskId) {
        try {
          await housekeepingService.updateTask(room.taskId, { notes: newNote });
        } catch {
          // Task update failure is non-critical — room note is already saved
        }
      }

      toast.success(`Note saved for Room ${room?.number || roomId}`);
    } catch (err: any) {
      console.error('Error saving note:', err);
      toast.error(`Failed to save note for Room ${room?.number || roomId}`);
      throw err;
    }
  }, [rooms]);

  /**
   * INSPECTION / VERIFY SYSTEM
   */
  const inspectRoom = useCallback(async (roomId: number) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room || room.status !== 'clean') {
        toast.error('Room must be clean before inspection');
        return;
      }

      await housekeepingService.inspectRoom(roomId, { passed: true });

      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            status: 'inspected',
          };
        }
        return r;
      }));

      toast.success(`Room ${room.number} inspected and approved`);
    } catch (err: any) {
      console.error('Error inspecting room:', err);
      toast.error(err.response?.data?.detail || 'Failed to inspect room');
    }
  }, [rooms]);

  /**
   * AUTO-ASSIGN ALGORITHM - Uses backend multi-factor scoring
   * Factors: Workload (30%), Skills (25%), Availability (20%), Performance (15%), Proximity (10%)
   */
  const runAutoAssign = useCallback(async () => {
    try {
      // Call the intelligent auto-assign API
      const result = await housekeepingService.autoAssignAllTasks();

      if (result.total_assigned > 0) {
        // Refresh data to get updated assignments
        await fetchRooms();

        const summary = `Assigned ${result.total_assigned} task(s) using intelligent matching`;
        toast.success(summary);

        return {
          assignments: result.results.filter(r => r.success).map(r => ({
            roomId: r.task_id,
            staffId: r.assigned_to,
            staffName: r.assigned_to_name,
            score: r.score,
          })),
          summary,
          message: summary,
        };
      } else {
        // BUG-017 FIX: Do not create tasks from the frontend when the backend reports
        // nothing to assign. The backend is the single source of truth for task creation
        // and validates room status (dirty check). Creating tasks here bypasses that
        // validation and generates phantom tasks for rooms that don't need cleaning.
        toast('No unassigned tasks to process');
        return { assignments: [], summary: 'No tasks to assign', message: 'No tasks to assign' };
      }
    } catch (err: any) {
      console.error('Error in auto-assign:', err);
      toast.error('Failed to auto-assign tasks. Please try again.');
      return { assignments: [], message: 'Auto-assign failed' };
    }
  }, [fetchRooms]);

  /**
   * ADD CLEANING TASK
   */
  const addCleaningTask = useCallback(async (taskData: {
    roomId: number;
    staffId?: number;
    taskType?: string;
    priority?: string;
    notes?: string;
    estimatedTime?: number;
  }) => {
    try {
      const { roomId, staffId, taskType, priority, notes, estimatedTime } = taskData;

      // Create task via API - use the selected task type, default to 'cleaning'
      const newTask = await housekeepingService.createTask({
        room_id: roomId,
        task_type: taskType || 'cleaning',
        priority: priority || 'medium',
        notes,
        estimated_duration: estimatedTime,
      });

      // Assign staff if provided
      if (staffId && newTask.id) {
        await housekeepingService.assignTask(newTask.id, { staff_id: staffId });
      }

      // Update local state
      const staffMember = staffId ? staff.find(s => s.id === staffId) : null;
      setRooms(prev => prev.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            assignedTo: staffId || null,
            assignedStaffName: staffMember?.name,
            priority: (priority as any) || room.priority,
            notes: notes || room.notes,
            taskId: newTask.id,
          };
        }
        return room;
      }));

      // Update staff task count
      if (staffId) {
        setStaff(prev => prev.map(s => {
          if (s.id === staffId) {
            return { ...s, tasksAssigned: s.tasksAssigned + 1 };
          }
          return s;
        }));
      }

      toast.success('Task created successfully');
    } catch (err: any) {
      console.error('Error adding cleaning task:', err);
      toast.error(err.response?.data?.detail || 'Failed to create task');
    }
  }, [staff]);

  /**
   * UNASSIGN STAFF FROM ROOM
   */
  const unassignStaff = useCallback(async (roomId: number) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        toast.error('Room not found');
        return;
      }

      // Update task to remove assignment
      if (room.taskId) {
        await housekeepingService.updateTask(room.taskId, { assigned_to: undefined });
      }

      // Decrement staff task count
      if (room.assignedTo) {
        setStaff(prev => prev.map(s => {
          if (s.id === room.assignedTo) {
            return { ...s, tasksAssigned: Math.max(0, s.tasksAssigned - 1) };
          }
          return s;
        }));
      }

      setRooms(prev => prev.map(r => {
        if (r.id === roomId) {
          return { ...r, assignedTo: null, assignedStaffName: undefined, assignedStaff: null };
        }
        return r;
      }));

      toast.success(`Staff unassigned from room ${room.number}`);
    } catch (err: any) {
      console.error('Error unassigning staff:', err);
      toast.error(err.response?.data?.detail || 'Failed to unassign staff');
    }
  }, [rooms]);

  /**
   * REFRESH DATA
   */
  const refreshData = useCallback(async () => {
    await fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    setRooms,
    staff,
    setStaff,
    isLoading,
    staffLoading,
    error,
    // Data fetching
    refreshData,
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
    addCleaningTask,
  };
}
