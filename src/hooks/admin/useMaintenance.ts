import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  createWorkOrder,
  createPreventiveTask,
  addActivityLog,
  calculateNextDueDate,
  generateInventoryId
} from '@/utils/admin/maintenance';
import { housekeepingService } from '@/api/services/housekeeping.service';
import { staffService } from '@/api/services/staff.service';
import { maintenanceService } from '@/api/services/maintenance.service';

/**
 * Transform API maintenance request to work order format
 */
function transformApiMaintenanceToWorkOrder(apiMaint: any) {
  return {
    id: apiMaint.work_order_id || `WO-${apiMaint.id}`,
    roomNumber: apiMaint.location?.replace('Room ', '') || apiMaint.room_id?.toString() || 'N/A',
    roomId: apiMaint.room_id,
    roomType: apiMaint.room_type || 'Standard',
    category: apiMaint.category || 'general',
    priority: apiMaint.priority || 'medium',
    status: apiMaint.status || 'open',
    issue: apiMaint.issue || 'Maintenance Required',
    description: apiMaint.description || '',
    assignedTo: apiMaint.assigned_to ? String(apiMaint.assigned_to) : null,
    technicianName: apiMaint.assigned_to_name || null,
    estimatedCost: apiMaint.estimated_cost,
    actualCost: apiMaint.actual_cost,
    estimatedDuration: apiMaint.estimated_duration || 60,
    actualDuration: apiMaint.actual_duration,
    isOOO: apiMaint.is_out_of_order || false,
    notes: apiMaint.notes || '',
    createdAt: apiMaint.reported_at || new Date().toISOString(),
    updatedAt: apiMaint.updated_at || new Date().toISOString(),
    completedAt: apiMaint.completed_at,
    activityLog: []
  };
}

/**
 * Transform API staff to technician format
 */
function transformApiStaffToTechnician(apiStaff: any) {
  return {
    id: apiStaff.id?.toString() || `TECH-${Date.now()}`,
    name: apiStaff.name || apiStaff.full_name || 'Unknown',
    specialty: apiStaff.specialty || 'General',
    status: apiStaff.clocked_in ? 'on_duty' : (apiStaff.status || 'off_duty'),
    phone: apiStaff.phone || '',
    avatar: apiStaff.avatar || (apiStaff.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()) || 'T',
    assignedTasks: 0,
    rating: apiStaff.performance_rating || 0,
  };
}

/**
 * Master Maintenance Hook - Manages all maintenance operations
 * Includes: Work Orders, Preventive Maintenance, Technicians, Inventory, Room OOO
 * Fetches data from API
 */
export function useMaintenance() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [pmTasks, setPMTasks] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [blockedRoomsCount, setBlockedRoomsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch maintenance data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch work orders and OOS/OOO rooms in parallel
        const [workOrdersData, oosOooRooms] = await Promise.all([
          maintenanceService.getWorkOrders(),
          maintenanceService.getOosOooRooms().catch((err) => {
            console.error('[useMaintenance] Failed to fetch OOS/OOO rooms:', err);
            return [];
          }),
        ]);

        const transformedWO: any[] = [];
        if (Array.isArray(workOrdersData)) {
          for (const wo of workOrdersData) {
            transformedWO.push({
              id: wo.id, // Use numeric ID directly for API calls
              displayId: wo.work_order_number || `WO-${wo.id}`,
              roomNumber: wo.room_number || wo.location?.replace('Room ', '') || 'N/A',
              roomId: wo.room_id,
              roomType: 'Standard',
              category: wo.issue_type || 'general',
              priority: wo.priority || 'medium',
              status: wo.status || 'pending',
              issue: wo.title || 'Maintenance Required',
              description: wo.description || '',
              assignedTo: wo.assigned_to ? String(wo.assigned_to) : null,
              technicianName: wo.assigned_to_name || null,
              estimatedCost: wo.estimated_cost,
              actualCost: wo.actual_cost,
              estimatedDuration: wo.estimated_hours ? wo.estimated_hours * 60 : 60,
              actualDuration: wo.actual_hours ? wo.actual_hours * 60 : null,
              isOOO: wo.is_out_of_order || false,
              isOOS: false,
              notes: wo.notes || '',
              resolutionNotes: wo.resolution_notes || '',
              scheduledDate: wo.scheduled_date || null,
              estimatedCompletion: wo.estimated_completion || wo.scheduled_date || null,
              oooCategory: wo.ooo_category || null,
              createdAt: wo.reported_at || new Date().toISOString(),
              updatedAt: wo.updated_at || new Date().toISOString(),
              completedAt: wo.completed_at,
              activityLog: []
            });
          }
        }

        // Merge OOS/OOO rooms that don't have active work orders
        if (Array.isArray(oosOooRooms)) {
          const woRoomIds = new Set(transformedWO.map(wo => wo.roomId).filter(Boolean));
          for (const room of oosOooRooms) {
            if (room.hasWorkOrder || woRoomIds.has(room.id)) continue;
            transformedWO.push({
              id: `room-${room.id}`,
              displayId: `${room.status === 'out_of_order' ? 'OOO' : room.status === 'out_of_service' ? 'OOS' : 'MNT'}-${room.number}`,
              roomNumber: room.number,
              roomId: room.id,
              roomType: room.roomType || 'Standard',
              category: room.status === 'out_of_order' ? 'structural' : 'general',
              priority: room.status === 'out_of_order' ? 'high' : 'medium',
              status: 'open',
              issue: room.statusLabel,
              description: room.notes || `Room ${room.number} is ${room.statusLabel}`,
              assignedTo: null,
              technicianName: null,
              estimatedCost: null,
              actualCost: null,
              estimatedDuration: null,
              actualDuration: null,
              isOOO: room.status === 'out_of_order',
              isOOS: room.status === 'out_of_service',
              notes: room.notes || '',
              resolutionNotes: '',
              scheduledDate: null,
              estimatedCompletion: null,
              oooCategory: null,
              createdAt: room.lastMaintenance || new Date().toISOString(),
              updatedAt: room.lastMaintenance || new Date().toISOString(),
              completedAt: null,
              activityLog: [],
              isRoomEntry: true, // Flag to distinguish from real work orders
            });
          }
        }

        setWorkOrders(transformedWO);

        // Set blocked rooms count from the OOS/OOO endpoint data
        setBlockedRoomsCount(
          Array.isArray(oosOooRooms) ? oosOooRooms.length : 0
        );

        // Fetch maintenance staff (technicians) - try multiple approaches
        // First try by department, then by role if needed
        let staffData = await staffService.list({ department: 'maintenance' });

        // If no results, also try fetching by various maintenance roles
        if (!Array.isArray(staffData) || staffData.length === 0) {
          // Fetch all staff and filter client-side for maintenance roles
          const allStaff = await staffService.list();
          if (Array.isArray(allStaff)) {
            const maintenanceRoles = ['maintenance', 'technician', 'electrician', 'plumber', 'hvac_technician', 'hvac'];
            staffData = allStaff.filter((s: any) =>
              maintenanceRoles.includes(s.role?.toLowerCase()) ||
              s.department?.toLowerCase() === 'maintenance'
            );
          }
        }

        if (Array.isArray(staffData) && staffData.length > 0) {
          const transformedTech = staffData.map(transformApiStaffToTechnician);
          setTechnicians(transformedTech);
        } else {
          // Set empty array if no technicians found
          setTechnicians([]);
        }

        // Fetch preventive maintenance schedules from API
        try {
          const pmData = await maintenanceService.getPreventiveSchedules();
          if (Array.isArray(pmData) && pmData.length > 0) {
            const transformedPM = pmData.map((pm: any) => ({
              id: pm.id,
              equipment: pm.name || '',
              roomNumber: pm.location?.replace('Room ', '') || null,
              roomId: null,
              category: pm.maintenance_type || 'general',
              frequency: pm.frequency || 'monthly',
              nextDueDate: pm.next_due_date || null,
              lastCompleted: pm.last_performed || null,
              assignedTo: pm.assigned_to || null,
              technicianName: pm.assigned_to_name || null,
              notes: pm.description || '',
              isActive: pm.active !== false,
              createdAt: pm.created_at || new Date().toISOString(),
              updatedAt: pm.updated_at || new Date().toISOString()
            }));
            setPMTasks(transformedPM);
          }
        } catch (pmErr) {
          console.error('Failed to fetch PM schedules (may not exist yet):', pmErr);
        }

        // Fetch maintenance inventory from backend
        try {
          const invData = await maintenanceService.getInventory();
          if (Array.isArray(invData) && invData.length > 0) {
            const transformedInv = invData.map((item: any) => ({
              id: item.id,
              name: item.name,
              category: item.category || 'general',
              stockLevel: item.stock_level || 0,
              minStock: item.min_stock ?? 0,
              unitCost: item.unit_cost || 0,
              location: item.location || '',
              lastRestocked: item.last_restocked || null
            }));
            setInventory(transformedInv);
          } else {
            // Fallback: fetch linen inventory
            const linenData = await housekeepingService.getLinenInventory();
            if (Array.isArray(linenData)) {
              const transformedInv = linenData.map((item: any, idx: number) => ({
                id: `INV-${item.id || idx}`,
                name: item.item_type || item.name,
                category: 'linen',
                stockLevel: item.quantity || 0,
                minStock: item.min_stock ?? 0,
                unitCost: 0,
                location: item.location || 'Storage',
                lastRestocked: item.last_updated?.split('T')[0] || new Date().toISOString().split('T')[0]
              }));
              setInventory(transformedInv);
            }
          }
        } catch (invErr) {
          console.error('Failed to fetch maintenance inventory, trying linen fallback:', invErr);
          try {
            const linenData = await housekeepingService.getLinenInventory();
            if (Array.isArray(linenData)) {
              const transformedInv = linenData.map((item: any, idx: number) => ({
                id: `INV-${item.id || idx}`,
                name: item.item_type || item.name,
                category: 'linen',
                stockLevel: item.quantity || 0,
                minStock: item.min_stock ?? 0,
                unitCost: 0,
                location: item.location || 'Storage',
                lastRestocked: item.last_updated?.split('T')[0] || new Date().toISOString().split('T')[0]
              }));
              setInventory(transformedInv);
            }
          } catch (linenErr) {
            console.error('Failed to fetch linen inventory too:', linenErr);
          }
        }

      } catch (err) {
        console.error('Failed to fetch maintenance data from API:', err);
        setError('Failed to load maintenance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // =========================================
  // WORK ORDER CRUD OPERATIONS
  // =========================================

  /**
   * Add new work order - calls backend API
   */
  const addWorkOrder = useCallback(async (data: any) => {
    try {
      // Call backend API to create work order
      const apiResponse = await maintenanceService.createWorkOrder({
        title: data.issue || data.title || 'Maintenance Required',
        description: data.description || '',
        location: data.roomNumber ? `Room ${data.roomNumber}` : data.location || 'Unknown',
        room_id: data.roomId,
        room_number: data.roomNumber,
        issue_type: data.category || 'general',
        priority: data.priority || 'medium',
        notes: data.notes,
        scheduled_date: data.estimatedCompletion || null,
        assigned_to: data.assignedTo ? Number(data.assignedTo) : null
      });

      // Transform API response to local format
      const newWO = {
        id: apiResponse.id,
        displayId: apiResponse.work_order_number || `WO-${apiResponse.id}`,
        roomNumber: apiResponse.room_number || data.roomNumber || 'N/A',
        roomId: apiResponse.room_id,
        roomType: data.roomType || 'Standard',
        category: apiResponse.issue_type || 'general',
        priority: apiResponse.priority || 'medium',
        status: apiResponse.status || 'pending',
        issue: apiResponse.title,
        description: apiResponse.description || '',
        assignedTo: (apiResponse.assigned_to || data.assignedTo) ? String(apiResponse.assigned_to || data.assignedTo) : null,
        technicianName: apiResponse.assigned_to_name || data.technicianName || null,
        estimatedCost: null,
        actualCost: null,
        estimatedDuration: 60,
        actualDuration: null,
        isOOO: data.isOOO || false,
        notes: apiResponse.notes || '',
        scheduledDate: apiResponse.scheduled_date || data.estimatedCompletion || null,
        estimatedCompletion: apiResponse.scheduled_date || data.estimatedCompletion || null,
        createdAt: apiResponse.reported_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        activityLog: []
      };

      // Update local state
      setWorkOrders(prev => [newWO, ...prev]);
      toast.success('Work order created successfully');
      return newWO;
    } catch (err: any) {
      console.error('Error creating work order:', err);
      toast.error(err.response?.data?.detail || 'Failed to create work order');
      throw err;
    }
  }, []);

  /**
   * Update existing work order - calls backend API
   */
  const updateWorkOrder = useCallback(async (woId: number, updates: any, actionLog = null) => {
    try {
      // Prepare API payload
      const apiPayload: any = {};
      if (updates.issue || updates.title) apiPayload.title = updates.issue || updates.title;
      if (updates.description !== undefined) apiPayload.description = updates.description;
      if (updates.status) apiPayload.status = updates.status;
      if (updates.priority) apiPayload.priority = updates.priority;
      if (updates.assignedTo !== undefined) apiPayload.assigned_to = updates.assignedTo ? Number(updates.assignedTo) : null;
      if (updates.notes) apiPayload.notes = updates.notes;
      if (updates.resolutionNotes) apiPayload.resolution_notes = updates.resolutionNotes;
      if (updates.estimatedCompletion !== undefined) apiPayload.scheduled_date = updates.estimatedCompletion || null;

      // Call backend API
      await maintenanceService.updateWorkOrder(woId, apiPayload);

      // Update local state
      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === woId) {
          const now = new Date().toISOString();
          let updatedLog = wo.activityLog;

          if (actionLog) {
            updatedLog = addActivityLog(wo.activityLog, actionLog);
          }

          // Sync scheduledDate and estimatedCompletion fields
          const dateValue = updates.estimatedCompletion !== undefined
            ? updates.estimatedCompletion
            : wo.estimatedCompletion;

          // Normalize assignedTo to string for consistency with technician option values
          const normalizedAssignedTo = updates.assignedTo !== undefined
            ? (updates.assignedTo ? String(updates.assignedTo) : null)
            : wo.assignedTo;

          // Resolve technician name from local state when assignedTo changes
          let techName = updates.technicianName !== undefined ? updates.technicianName : wo.technicianName;
          if (updates.assignedTo !== undefined && String(updates.assignedTo) !== String(wo.assignedTo)) {
            if (updates.assignedTo) {
              const tech = technicians.find(t =>
                String(t.id) === String(updates.assignedTo)
              );
              techName = tech?.name || updates.technicianName || wo.technicianName;
            } else {
              techName = null;
            }
          }

          return {
            ...wo,
            ...updates,
            assignedTo: normalizedAssignedTo,
            technicianName: techName,
            scheduledDate: dateValue,
            estimatedCompletion: dateValue,
            activityLog: updatedLog,
            updatedAt: now
          };
        }
        return wo;
      }));

      toast.success('Work order updated');
    } catch (err: any) {
      console.error('Error updating work order:', err);
      toast.error(err.response?.data?.detail || 'Failed to update work order');
    }
  }, [technicians]);

  /**
   * Delete work order - cancels via backend API then removes from local state
   * BUG-027 FIX: Previously local-only — deleted WOs reappeared after refresh
   */
  const deleteWorkOrder = useCallback(async (woId: number) => {
    try {
      // No DELETE endpoint exists — soft-delete by setting status to 'cancelled'
      await maintenanceService.updateWorkOrder(woId, { status: 'cancelled' });

      setWorkOrders(prev => {
        const wo = prev.find(w => w.id === woId);

        // Decrement technician assigned tasks if assigned
        if (wo?.assignedTo) {
          setTechnicians(prevTech => prevTech.map(t => {
            if (t.id === wo.assignedTo) {
              return { ...t, assignedTasks: Math.max(0, t.assignedTasks - 1) };
            }
            return t;
          }));
        }

        return prev.filter(w => w.id !== woId);
      });
      toast.success('Work order cancelled');
    } catch (err: any) {
      console.error('Error deleting work order:', err);
      toast.error(err.response?.data?.detail || 'Failed to delete work order');
    }
  }, []);

  // =========================================
  // WORK ORDER STATUS MANAGEMENT
  // =========================================

  /**
   * Start work on a work order - calls backend API
   */
  const startWorkOrder = useCallback(async (woId: number, user = 'System') => {
    try {
      await maintenanceService.updateWorkOrder(woId, { status: 'in_progress' });

      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === woId) {
          const now = new Date().toISOString();
          return {
            ...wo,
            status: 'in_progress',
            activityLog: addActivityLog(wo.activityLog, 'Status changed to In Progress', user),
            updatedAt: now
          };
        }
        return wo;
      }));

      toast.success('Work order started');
    } catch (err: any) {
      console.error('Error starting work order:', err);
      toast.error(err.response?.data?.detail || 'Failed to start work order');
    }
  }, []);

  /**
   * Complete work order - calls backend API
   */
  const completeWorkOrder = useCallback(async (woId: number, resolutionNotes?: string, user = 'System') => {
    try {
      await maintenanceService.completeWorkOrder(woId, resolutionNotes);

      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === woId) {
          const now = new Date().toISOString();
          return {
            ...wo,
            status: 'completed',
            completedAt: now,
            resolutionNotes: resolutionNotes || wo.resolutionNotes,
            activityLog: addActivityLog(wo.activityLog, 'Work order completed', user),
            updatedAt: now
          };
        }
        return wo;
      }));

      toast.success('Work order completed');
    } catch (err: any) {
      console.error('Error completing work order:', err);
      toast.error(err.response?.data?.detail || 'Failed to complete work order');
    }
  }, []);

  /**
   * Put work order on hold - calls backend API
   */
  const holdWorkOrder = useCallback(async (woId: number, reason = '', user = 'System') => {
    try {
      await maintenanceService.updateWorkOrder(woId, {
        status: 'on_hold',
        notes: reason || undefined
      });

      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === woId) {
          const now = new Date().toISOString();
          const action = reason ? `Status changed to On Hold - ${reason}` : 'Status changed to On Hold';
          return {
            ...wo,
            status: 'on_hold',
            activityLog: addActivityLog(wo.activityLog, action, user),
            updatedAt: now
          };
        }
        return wo;
      }));

      toast.success('Work order put on hold');
    } catch (err: any) {
      console.error('Error holding work order:', err);
      toast.error(err.response?.data?.detail || 'Failed to hold work order');
    }
  }, []);

  /**
   * Reopen work order - calls backend API
   */
  const reopenWorkOrder = useCallback(async (woId: number, user = 'System') => {
    try {
      await maintenanceService.updateWorkOrder(woId, { status: 'pending' });

      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === woId) {
          const now = new Date().toISOString();
          return {
            ...wo,
            status: 'open',
            completedAt: null,
            activityLog: addActivityLog(wo.activityLog, 'Work order reopened', user),
            updatedAt: now
          };
        }
        return wo;
      }));

      toast.success('Work order reopened');
    } catch (err: any) {
      console.error('Error reopening work order:', err);
      toast.error(err.response?.data?.detail || 'Failed to reopen work order');
    }
  }, []);

  // =========================================
  // TECHNICIAN ASSIGNMENT
  // =========================================

  /**
   * Assign technician to work order
   */
  const assignTechnician = useCallback(async (woId: string | number, techId: string | number, user = 'System') => {
    try {
      // Ensure numeric IDs
      const numericWoId = typeof woId === 'number' ? woId : parseInt(woId.toString().replace('WO-', ''));
      const numericTechId = typeof techId === 'number' ? techId : parseInt(techId.toString());

      if (isNaN(numericWoId) || isNaN(numericTechId)) {
        throw new Error('Invalid work order or technician ID');
      }

      // Call backend API to update assignment
      await maintenanceService.updateWorkOrder(numericWoId, {
        assigned_to: numericTechId
      });

      // Update local state after successful API call
      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === numericWoId) {
          const previousTechId = wo.assignedTo;
          const tech = technicians.find(t =>
            t.id === numericTechId ||
            t.id === numericTechId.toString() ||
            t.id === techId
          );
          const techName = tech?.name || null;

          // Update technician task counts
          setTechnicians(prevTech => prevTech.map(t => {
            const tId = typeof t.id === 'number' ? t.id : parseInt(t.id);
            if (tId === previousTechId) {
              return { ...t, assignedTasks: Math.max(0, t.assignedTasks - 1) };
            }
            if (tId === numericTechId) {
              return { ...t, assignedTasks: t.assignedTasks + 1 };
            }
            return t;
          }));

          const now = new Date().toISOString();
          const action = techName ? `Assigned to ${techName}` : 'Technician unassigned';

          return {
            ...wo,
            assignedTo: String(numericTechId),
            technicianName: techName,
            activityLog: addActivityLog(wo.activityLog, action, user),
            updatedAt: now
          };
        }
        return wo;
      }));

      toast.success('Technician assigned successfully');
    } catch (err: any) {
      console.error('Error assigning technician:', err);
      toast.error(err.response?.data?.detail || err.message || 'Failed to assign technician');
    }
  }, [technicians]);

  /**
   * Unassign technician from work order - calls backend API
   */
  const unassignTechnician = useCallback(async (woId: number, user = 'System') => {
    try {
      // Call backend API to clear assignment (pass null or 0)
      await maintenanceService.updateWorkOrder(woId, { assigned_to: 0 });

      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === woId && wo.assignedTo) {
          const previousTechId = wo.assignedTo;

          // Decrement technician task count
          setTechnicians(prevTech => prevTech.map(t => {
            if (t.id === previousTechId || t.id === previousTechId.toString()) {
              return { ...t, assignedTasks: Math.max(0, t.assignedTasks - 1) };
            }
            return t;
          }));

          const now = new Date().toISOString();

          return {
            ...wo,
            assignedTo: null,
            technicianName: null,
            activityLog: addActivityLog(wo.activityLog, 'Technician unassigned', user),
            updatedAt: now
          };
        }
        return wo;
      }));

      toast.success('Technician unassigned');
    } catch (err: any) {
      console.error('Error unassigning technician:', err);
      toast.error(err.response?.data?.detail || 'Failed to unassign technician');
    }
  }, []);

  // =========================================
  // ROOM OOO WORKFLOW
  // =========================================

  /**
   * Mark room as OOO and create work order - calls backend API
   * Returns the created work order
   */
  const markRoomOOO = useCallback(async (roomData: any, issueData: any, user = 'System') => {
    try {
      // Create work order via API
      const apiResponse = await maintenanceService.createWorkOrder({
        title: issueData.issue || 'Room Out of Order',
        description: issueData.description || '',
        location: `Room ${roomData.roomNumber}`,
        room_id: roomData.roomId,
        room_number: roomData.roomNumber,
        issue_type: issueData.category || 'general',
        priority: issueData.priority || 'high',
        notes: issueData.notes
      });

      const newWO = {
        id: apiResponse.id,
        displayId: apiResponse.work_order_number || `WO-${apiResponse.id}`,
        roomNumber: roomData.roomNumber,
        roomId: roomData.roomId,
        roomType: roomData.roomType || 'Standard',
        category: apiResponse.issue_type || 'general',
        priority: apiResponse.priority || 'high',
        status: apiResponse.status || 'pending',
        issue: apiResponse.title,
        description: apiResponse.description || '',
        assignedTo: issueData.assignedTo || null,
        technicianName: issueData.technicianName || null,
        isOOO: true,
        notes: apiResponse.notes || '',
        createdAt: apiResponse.reported_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        activityLog: [{ action: 'Room marked as Out of Order', by: user, at: new Date().toISOString() }]
      };

      // If technician assigned, update via API
      if (issueData.assignedTo) {
        await maintenanceService.updateWorkOrder(apiResponse.id, { assigned_to: issueData.assignedTo });
        setTechnicians(prev => prev.map(t => {
          if (t.id === issueData.assignedTo || t.id === issueData.assignedTo.toString()) {
            return { ...t, assignedTasks: t.assignedTasks + 1 };
          }
          return t;
        }));
      }

      setWorkOrders(prev => [newWO, ...prev]);
      toast.success('Room marked as Out of Order');
      return newWO;
    } catch (err: any) {
      console.error('Error marking room OOO:', err);
      toast.error(err.response?.data?.detail || 'Failed to mark room as out of order');
      throw err;
    }
  }, []);

  /**
   * Clear room OOO status - calls backend API
   * Closes all related work orders and marks room as available
   */
  const clearRoomOOO = useCallback(async (roomNumber: string, user = 'System') => {
    try {
      // Find OOO work orders for this room
      const oooWorkOrders = workOrders.filter(
        wo => wo.roomNumber === roomNumber && wo.isOOO && wo.status !== 'completed'
      );

      // Complete each work order via API
      for (const wo of oooWorkOrders) {
        await maintenanceService.completeWorkOrder(wo.id, 'Room OOO cleared');
      }

      // Update local state
      setWorkOrders(prev => prev.map(wo => {
        if (wo.roomNumber === roomNumber && wo.isOOO && wo.status !== 'completed') {
          const now = new Date().toISOString();
          return {
            ...wo,
            isOOO: false,
            status: 'completed',
            completedAt: now,
            activityLog: addActivityLog(wo.activityLog, 'Room OOO cleared - work order completed', user),
            updatedAt: now
          };
        }
        return wo;
      }));

      toast.success('Room OOO status cleared');
      return roomNumber;
    } catch (err: any) {
      console.error('Error clearing room OOO:', err);
      toast.error(err.response?.data?.detail || 'Failed to clear room OOO status');
      throw err;
    }
  }, [workOrders]);

  /**
   * Get all OOO rooms
   */
  const getOOORooms = useCallback(() => {
    return workOrders
      .filter(wo => wo.isOOO && wo.status !== 'completed')
      .map(wo => ({
        roomNumber: wo.roomNumber,
        roomId: wo.roomId,
        workOrderId: wo.id,
        issue: wo.issue,
        priority: wo.priority,
        assignedTo: wo.technicianName
      }));
  }, [workOrders]);

  // =========================================
  // PREVENTIVE MAINTENANCE
  // =========================================

  /**
   * Add new PM task - calls backend API
   */
  const addPMTask = useCallback(async (data) => {
    try {
      const apiResponse = await maintenanceService.createPreventiveSchedule({
        name: data.equipment || data.name || '',
        description: data.notes || '',
        location: data.roomNumber ? `Room ${data.roomNumber}` : '',
        maintenance_type: data.category || 'general',
        frequency: data.frequency || 'monthly',
        assigned_to: data.assignedTo ? parseInt(data.assignedTo) : undefined,
        priority: 'normal',
        next_due_date: data.nextDueDate || undefined,
      });

      const newPM = {
        id: apiResponse.id,
        equipment: apiResponse.name || '',
        roomNumber: data.roomNumber || null,
        roomId: data.roomId || null,
        category: apiResponse.maintenance_type || 'general',
        frequency: apiResponse.frequency || 'monthly',
        nextDueDate: apiResponse.next_due_date || null,
        lastCompleted: apiResponse.last_performed || null,
        assignedTo: apiResponse.assigned_to || null,
        technicianName: apiResponse.assigned_to_name || data.technicianName || null,
        notes: apiResponse.description || '',
        isActive: apiResponse.active !== false,
        createdAt: apiResponse.created_at || new Date().toISOString(),
        updatedAt: apiResponse.updated_at || new Date().toISOString()
      };

      setPMTasks(prev => [newPM, ...prev]);
      toast.success('PM Task created successfully');
      return newPM;
    } catch (err: any) {
      console.error('Error creating PM task:', err);
      // BUG-027 FIX: Don't create local-only tasks — they disappear on refresh
      toast.error('Failed to create PM task. Please try again.');
      throw err;
    }
  }, []);

  /**
   * Update PM task - calls backend API
   */
  const updatePMTask = useCallback(async (pmId, updates) => {
    try {
      // Only call API for numeric IDs (backend-persisted tasks)
      if (typeof pmId === 'number') {
        await maintenanceService.updatePreventiveSchedule(pmId, {
          name: updates.equipment || undefined,
          description: updates.notes || undefined,
          location: updates.roomNumber ? `Room ${updates.roomNumber}` : undefined,
          maintenance_type: updates.category || undefined,
          frequency: updates.frequency || undefined,
          assigned_to: updates.assignedTo ? parseInt(updates.assignedTo) : undefined,
          active: updates.isActive,
          next_due_date: updates.nextDueDate || undefined,
        });
      }

      setPMTasks(prev => prev.map(pm => {
        if (pm.id === pmId) {
          return {
            ...pm,
            ...updates,
            updatedAt: new Date().toISOString()
          };
        }
        return pm;
      }));
      toast.success('PM Task updated');
    } catch (err: any) {
      console.error('Error updating PM task:', err);
      // BUG-027 FIX: Don't update local state on failure — causes data inconsistency on refresh
      toast.error(err.response?.data?.detail || 'Failed to save PM task to server');
    }
  }, []);

  /**
   * Delete PM task - calls backend API
   */
  const deletePMTask = useCallback(async (pmId) => {
    try {
      if (typeof pmId === 'number') {
        await maintenanceService.deletePreventiveSchedule(pmId);
      }
      setPMTasks(prev => prev.filter(pm => pm.id !== pmId));
      toast.success('PM Task deleted');
    } catch (err: any) {
      console.error('Error deleting PM task:', err);
      // BUG-027 FIX: Don't remove from local state on failure — task still exists in backend
      toast.error(err.response?.data?.detail || 'Failed to delete PM task from server');
    }
  }, []);

  /**
   * Complete PM task and schedule next - calls backend API
   */
  const completePMTask = useCallback(async (pmId) => {
    try {
      if (typeof pmId === 'number') {
        const apiResponse = await maintenanceService.completePreventiveSchedule(pmId);
        setPMTasks(prev => prev.map(pm => {
          if (pm.id === pmId) {
            return {
              ...pm,
              lastCompleted: apiResponse.last_performed || new Date().toISOString().split('T')[0],
              nextDueDate: apiResponse.next_due_date || calculateNextDueDate(new Date().toISOString().split('T')[0], pm.frequency),
              updatedAt: new Date().toISOString()
            };
          }
          return pm;
        }));
      }
      toast.success('PM Task completed, next scheduled');
    } catch (err: any) {
      console.error('Error completing PM task:', err);
      // BUG-027 FIX: Don't update local state on failure — causes data inconsistency on refresh
      toast.error(err.response?.data?.detail || 'Failed to complete PM task');
    }
  }, []);

  /**
   * Toggle PM task active status - calls backend API
   */
  const togglePMActive = useCallback(async (pmId) => {
    const pm = pmTasks.find(p => p.id === pmId);
    const newActive = pm ? !pm.isActive : true;

    try {
      if (typeof pmId === 'number') {
        await maintenanceService.updatePreventiveSchedule(pmId, { active: newActive });
      }
      // Only update local state after successful API call
      setPMTasks(prev => prev.map(p => {
        if (p.id === pmId) {
          return { ...p, isActive: newActive, updatedAt: new Date().toISOString() };
        }
        return p;
      }));
    } catch (err: any) {
      console.error('Error toggling PM active:', err);
      // BUG-027 FIX: Don't update local state on failure — causes data inconsistency on refresh
      toast.error(err.response?.data?.detail || 'Failed to update PM task status');
    }
  }, [pmTasks]);

  /**
   * Get overdue PM tasks
   */
  const getOverduePMTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return pmTasks.filter(pm => pm.isActive && pm.nextDueDate && pm.nextDueDate < today);
  }, [pmTasks]);

  /**
   * Get upcoming PM tasks (next 7 days)
   */
  const getUpcomingPMTasks = useCallback((days = 7) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const futureStr = futureDate.toISOString().split('T')[0];

    return pmTasks.filter(pm =>
      pm.isActive &&
      pm.nextDueDate &&
      pm.nextDueDate >= todayStr &&
      pm.nextDueDate <= futureStr
    );
  }, [pmTasks]);

  // =========================================
  // INVENTORY MANAGEMENT
  // =========================================

  /**
   * Add inventory item - calls backend API
   */
  const addInventoryItem = useCallback(async (data) => {
    try {
      const apiResponse = await maintenanceService.createInventoryItem({
        name: data.name,
        category: data.category || 'general',
        stock_level: data.stockLevel || 0,
        min_stock: data.minStock ?? 0,
        unit_cost: data.unitCost || 0,
        location: data.location || '',
      });

      const newItem = {
        id: apiResponse.id,
        name: apiResponse.name,
        category: apiResponse.category,
        stockLevel: apiResponse.stock_level || 0,
        minStock: apiResponse.min_stock ?? 0,
        unitCost: apiResponse.unit_cost || 0,
        location: apiResponse.location || '',
        lastRestocked: apiResponse.last_restocked || null
      };
      setInventory(prev => [newItem, ...prev]);
      toast.success('Inventory item added');
      return newItem;
    } catch (err: any) {
      console.error('Error creating inventory item:', err);
      toast.error(err?.response?.data?.detail || 'Failed to create inventory item');
      throw err;
    }
  }, []);

  /**
   * Update inventory item - calls backend API
   */
  const updateInventoryItem = useCallback(async (itemId, updates) => {
    try {
      // Extract numeric ID for API call
      let numericId: number | null = null;
      if (typeof itemId === 'number') {
        numericId = itemId;
      } else if (typeof itemId === 'string') {
        const match = itemId.match(/\d+/);
        if (match) numericId = parseInt(match[0], 10);
      }

      if (numericId !== null) {
        await maintenanceService.updateInventoryItem(numericId, {
          name: updates.name,
          category: updates.category,
          stock_level: updates.stockLevel,
          min_stock: updates.minStock,
          unit_cost: updates.unitCost,
          location: updates.location,
        });
      } else {
        toast.error('Cannot update: invalid item ID');
        return;
      }

      // Only update local state after successful API call
      setInventory(prev => prev.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates };
        }
        return item;
      }));
      toast.success('Inventory item updated');
    } catch (err: any) {
      console.error('Error updating inventory item:', err);
      toast.error(err?.response?.data?.detail || 'Failed to update inventory item');
    }
  }, []);

  /**
   * Delete inventory item - calls backend API
   */
  const deleteInventoryItem = useCallback(async (itemId) => {
    try {
      let numericId: number | null = null;
      if (typeof itemId === 'number') {
        numericId = itemId;
      } else if (typeof itemId === 'string') {
        const match = itemId.match(/\d+/);
        if (match) numericId = parseInt(match[0], 10);
      }

      if (numericId !== null) {
        await maintenanceService.deleteInventoryItem(numericId);
      } else {
        toast.error('Cannot delete: invalid item ID');
        return;
      }

      // Only remove from local state after successful API call
      setInventory(prev => prev.filter(item => item.id !== itemId));
      toast.success('Inventory item deleted');
    } catch (err: any) {
      console.error('Error deleting inventory item:', err);
      toast.error(err?.response?.data?.detail || 'Failed to delete inventory item');
    }
  }, []);

  /**
   * Update stock level - calls backend API
   */
  const updateStock = useCallback(async (itemId, quantity, isAddition = true) => {
    try {
      // BUG-029 FIX: Extract numeric ID from string IDs like "INV-5"
      let numericId: number | null = null;
      if (typeof itemId === 'number') {
        numericId = itemId;
      } else if (typeof itemId === 'string') {
        const match = itemId.match(/\d+/);
        if (match) {
          numericId = parseInt(match[0], 10);
        }
      }

      if (numericId === null) {
        toast.error('Cannot adjust stock: invalid item ID');
        return;
      }

      await maintenanceService.adjustInventoryStock(numericId, quantity, isAddition);

      // Only update local state after successful API call
      setInventory(prev => prev.map(item => {
        if (item.id === itemId) {
          const newLevel = isAddition
            ? item.stockLevel + quantity
            : Math.max(0, item.stockLevel - quantity);
          return {
            ...item,
            stockLevel: newLevel,
            lastRestocked: isAddition ? new Date().toISOString().split('T')[0] : item.lastRestocked
          };
        }
        return item;
      }));
      toast.success(`Stock ${isAddition ? 'added' : 'removed'}: ${quantity}`);
    } catch (err: any) {
      console.error('Error adjusting stock:', err);
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to adjust stock');
    }
  }, []);

  /**
   * Get low stock items
   */
  const getLowStockItems = useCallback(() => {
    return inventory.filter(item => item.stockLevel === 0 || (item.minStock > 0 && item.stockLevel <= item.minStock));
  }, [inventory]);

  // =========================================
  // TECHNICIAN MANAGEMENT
  // =========================================

  /**
   * Update technician status
   */
  const updateTechnicianStatus = useCallback((techId, status) => {
    setTechnicians(prev => prev.map(t => {
      if (t.id === techId) {
        return { ...t, status };
      }
      return t;
    }));
  }, []);

  /**
   * Get available technicians
   */
  const getAvailableTechnicians = useCallback(() => {
    return technicians.filter(t => t.status === 'active' || t.status === 'on_duty');
  }, [technicians]);

  /**
   * Get technician workload
   */
  const getTechnicianWorkload = useCallback((techId) => {
    return workOrders.filter(wo =>
      wo.assignedTo === techId &&
      wo.status !== 'completed'
    );
  }, [workOrders]);

  // =========================================
  // UTILITY FUNCTIONS
  // =========================================

  /**
   * Get work orders by room
   */
  const getWorkOrdersByRoom = useCallback((roomNumber) => {
    return workOrders.filter(wo => wo.roomNumber === roomNumber);
  }, [workOrders]);

  /**
   * Get active work orders by room
   */
  const getActiveWorkOrdersByRoom = useCallback((roomNumber) => {
    return workOrders.filter(wo =>
      wo.roomNumber === roomNumber &&
      wo.status !== 'completed'
    );
  }, [workOrders]);

  /**
   * Get work order by ID
   */
  const getWorkOrderById = useCallback((woId) => {
    return workOrders.find(wo => wo.id === woId);
  }, [workOrders]);

  /**
   * Refresh data from API
   */
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const workOrdersData = await maintenanceService.getWorkOrders();
      if (Array.isArray(workOrdersData)) {
        const transformedWO = workOrdersData.map((wo: any) => ({
          id: wo.id,
          displayId: wo.work_order_number || `WO-${wo.id}`,
          roomNumber: wo.room_number || wo.location?.replace('Room ', '') || 'N/A',
          roomId: wo.room_id,
          roomType: 'Standard',
          category: wo.issue_type || 'general',
          priority: wo.priority || 'medium',
          status: wo.status || 'pending',
          issue: wo.title || 'Maintenance Required',
          description: wo.description || '',
          assignedTo: wo.assigned_to ? String(wo.assigned_to) : null,
          technicianName: wo.assigned_to_name || null,
          estimatedCost: wo.estimated_cost,
          actualCost: wo.actual_cost,
          estimatedDuration: wo.estimated_hours ? wo.estimated_hours * 60 : 60,
          actualDuration: wo.actual_hours ? wo.actual_hours * 60 : null,
          isOOO: wo.is_out_of_order || false,
          notes: wo.notes || '',
          resolutionNotes: wo.resolution_notes || '',
          scheduledDate: wo.scheduled_date || null,
          estimatedCompletion: wo.scheduled_date || null,
          createdAt: wo.reported_at || new Date().toISOString(),
          updatedAt: wo.updated_at || new Date().toISOString(),
          completedAt: wo.completed_at,
          activityLog: []
        }));
        setWorkOrders(transformedWO);
      }

      // Refresh blocked rooms count
      try {
        const oosOooRooms = await maintenanceService.getOosOooRooms();
        setBlockedRoomsCount(Array.isArray(oosOooRooms) ? oosOooRooms.length : 0);
      } catch (oosErr) {
        console.error('Failed to refresh OOS/OOO rooms:', oosErr);
      }

      // BUG-027 FIX: Also refresh PM tasks (previously only work orders were refreshed)
      try {
        const pmData = await maintenanceService.getPreventiveSchedules();
        if (Array.isArray(pmData) && pmData.length > 0) {
          const transformedPM = pmData.map((pm: any) => ({
            id: pm.id,
            equipment: pm.name || '',
            roomNumber: pm.location?.replace('Room ', '') || null,
            roomId: null,
            category: pm.maintenance_type || 'general',
            frequency: pm.frequency || 'monthly',
            nextDueDate: pm.next_due_date || null,
            lastCompleted: pm.last_performed || null,
            assignedTo: pm.assigned_to || null,
            technicianName: pm.assigned_to_name || null,
            notes: pm.description || '',
            isActive: pm.active !== false,
            createdAt: pm.created_at || new Date().toISOString(),
            updatedAt: pm.updated_at || new Date().toISOString()
          }));
          setPMTasks(transformedPM);
        }
      } catch (pmErr) {
        console.error('Failed to refresh PM schedules:', pmErr);
      }

      // Also refresh inventory
      try {
        const invData = await maintenanceService.getInventory();
        if (Array.isArray(invData) && invData.length > 0) {
          const transformedInv = invData.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category || 'general',
            stockLevel: item.stock_level || 0,
            minStock: item.min_stock ?? 0,
            unitCost: item.unit_cost || 0,
            location: item.location || '',
            lastRestocked: item.last_restocked || null
          }));
          setInventory(transformedInv);
        }
      } catch (invErr) {
        console.error('Failed to refresh inventory:', invErr);
      }
    } catch (err) {
      console.error('Failed to refresh maintenance data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Data
    workOrders,
    pmTasks,
    technicians,
    inventory,
    blockedRoomsCount,
    isLoading,
    error,

    // Work Order CRUD
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,

    // Work Order Status
    startWorkOrder,
    completeWorkOrder,
    holdWorkOrder,
    reopenWorkOrder,

    // Technician Assignment
    assignTechnician,
    unassignTechnician,

    // Room OOO Workflow
    markRoomOOO,
    clearRoomOOO,
    getOOORooms,

    // Preventive Maintenance
    addPMTask,
    updatePMTask,
    deletePMTask,
    completePMTask,
    togglePMActive,
    getOverduePMTasks,
    getUpcomingPMTasks,

    // Inventory
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStock,
    getLowStockItems,

    // Technicians
    updateTechnicianStatus,
    getAvailableTechnicians,
    getTechnicianWorkload,

    // Utility
    getWorkOrdersByRoom,
    getActiveWorkOrdersByRoom,
    getWorkOrderById,
    refreshData
  };
}
