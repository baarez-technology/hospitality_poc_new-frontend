import { useState, useCallback, useEffect } from 'react';
import { workOrdersData, preventiveMaintenanceData, techniciansData, inventoryData } from '../data/maintenanceData';
import {
  createWorkOrder,
  createPreventiveTask,
  addActivityLog,
  calculateNextDueDate,
  generateInventoryId
} from '../utils/maintenance';

const WO_STORAGE_KEY = 'glimmora_work_orders';
const PM_STORAGE_KEY = 'glimmora_preventive_maintenance';
const TECH_STORAGE_KEY = 'glimmora_technicians';
const INV_STORAGE_KEY = 'glimmora_inventory';

/**
 * Load work orders from localStorage or return initial data
 */
function loadWorkOrdersFromStorage() {
  try {
    const stored = localStorage.getItem(WO_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load work orders from localStorage:', e);
  }
  return workOrdersData;
}

/**
 * Load preventive maintenance from localStorage or return initial data
 */
function loadPMFromStorage() {
  try {
    const stored = localStorage.getItem(PM_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load PM tasks from localStorage:', e);
  }
  return preventiveMaintenanceData;
}

/**
 * Load technicians from localStorage or return initial data
 */
function loadTechniciansFromStorage() {
  try {
    const stored = localStorage.getItem(TECH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load technicians from localStorage:', e);
  }
  return techniciansData;
}

/**
 * Load inventory from localStorage or return initial data
 */
function loadInventoryFromStorage() {
  try {
    const stored = localStorage.getItem(INV_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load inventory from localStorage:', e);
  }
  return inventoryData;
}

/**
 * Save to localStorage helpers
 */
function saveWorkOrdersToStorage(data) {
  try {
    localStorage.setItem(WO_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save work orders to localStorage:', e);
  }
}

function savePMToStorage(data) {
  try {
    localStorage.setItem(PM_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save PM tasks to localStorage:', e);
  }
}

function saveTechniciansToStorage(data) {
  try {
    localStorage.setItem(TECH_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save technicians to localStorage:', e);
  }
}

function saveInventoryToStorage(data) {
  try {
    localStorage.setItem(INV_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save inventory to localStorage:', e);
  }
}

/**
 * Master Maintenance Hook - Manages all maintenance operations
 * Includes: Work Orders, Preventive Maintenance, Technicians, Inventory, Room OOO
 * With localStorage persistence
 */
export function useMaintenance() {
  const [workOrders, setWorkOrders] = useState(loadWorkOrdersFromStorage);
  const [pmTasks, setPMTasks] = useState(loadPMFromStorage);
  const [technicians, setTechnicians] = useState(loadTechniciansFromStorage);
  const [inventory, setInventory] = useState(loadInventoryFromStorage);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    saveWorkOrdersToStorage(workOrders);
  }, [workOrders]);

  useEffect(() => {
    savePMToStorage(pmTasks);
  }, [pmTasks]);

  useEffect(() => {
    saveTechniciansToStorage(technicians);
  }, [technicians]);

  useEffect(() => {
    saveInventoryToStorage(inventory);
  }, [inventory]);

  // =========================================
  // WORK ORDER CRUD OPERATIONS
  // =========================================

  /**
   * Add new work order
   */
  const addWorkOrder = useCallback((data) => {
    const newWO = createWorkOrder(data);

    // Update technician assigned tasks if assigned
    if (data.assignedTo) {
      setTechnicians(prev => prev.map(t => {
        if (t.id === data.assignedTo) {
          return { ...t, assignedTasks: t.assignedTasks + 1 };
        }
        return t;
      }));
    }

    setWorkOrders(prev => [newWO, ...prev]);
    return newWO;
  }, []);

  /**
   * Update existing work order
   */
  const updateWorkOrder = useCallback((woId, updates, actionLog = null) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId) {
        const now = new Date().toISOString();
        let updatedLog = wo.activityLog;

        if (actionLog) {
          updatedLog = addActivityLog(wo.activityLog, actionLog);
        }

        return {
          ...wo,
          ...updates,
          activityLog: updatedLog,
          updatedAt: now
        };
      }
      return wo;
    }));
  }, []);

  /**
   * Delete work order
   */
  const deleteWorkOrder = useCallback((woId) => {
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
  }, []);

  // =========================================
  // WORK ORDER STATUS MANAGEMENT
  // =========================================

  /**
   * Start work on a work order
   */
  const startWorkOrder = useCallback((woId, user = 'System') => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId && wo.status === 'open') {
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
  }, []);

  /**
   * Complete work order
   */
  const completeWorkOrder = useCallback((woId, user = 'System') => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId && wo.status !== 'completed') {
        const now = new Date().toISOString();
        return {
          ...wo,
          status: 'completed',
          completedAt: now,
          activityLog: addActivityLog(wo.activityLog, 'Work order completed', user),
          updatedAt: now
        };
      }
      return wo;
    }));
  }, []);

  /**
   * Put work order on hold
   */
  const holdWorkOrder = useCallback((woId, reason = '', user = 'System') => {
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
  }, []);

  /**
   * Reopen work order
   */
  const reopenWorkOrder = useCallback((woId, user = 'System') => {
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
  }, []);

  // =========================================
  // TECHNICIAN ASSIGNMENT
  // =========================================

  /**
   * Assign technician to work order
   */
  const assignTechnician = useCallback((woId, techId, user = 'System') => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId) {
        const previousTechId = wo.assignedTo;
        const tech = technicians.find(t => t.id === techId);
        const techName = tech?.name || null;

        // Update technician task counts
        setTechnicians(prevTech => prevTech.map(t => {
          if (t.id === previousTechId) {
            return { ...t, assignedTasks: Math.max(0, t.assignedTasks - 1) };
          }
          if (t.id === techId) {
            return { ...t, assignedTasks: t.assignedTasks + 1 };
          }
          return t;
        }));

        const now = new Date().toISOString();
        const action = techName ? `Assigned to ${techName}` : 'Technician unassigned';

        return {
          ...wo,
          assignedTo: techId,
          technicianName: techName,
          activityLog: addActivityLog(wo.activityLog, action, user),
          updatedAt: now
        };
      }
      return wo;
    }));
  }, [technicians]);

  /**
   * Unassign technician from work order
   */
  const unassignTechnician = useCallback((woId, user = 'System') => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId && wo.assignedTo) {
        const previousTechId = wo.assignedTo;

        // Decrement technician task count
        setTechnicians(prevTech => prevTech.map(t => {
          if (t.id === previousTechId) {
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
  }, []);

  // =========================================
  // ROOM OOO WORKFLOW
  // =========================================

  /**
   * Mark room as OOO and create work order
   * Returns the created work order
   */
  const markRoomOOO = useCallback((roomData, issueData, user = 'System') => {
    const newWO = createWorkOrder({
      roomNumber: roomData.roomNumber,
      roomId: roomData.roomId,
      roomType: roomData.roomType,
      category: issueData.category || 'general',
      priority: issueData.priority || 'high',
      issue: issueData.issue,
      description: issueData.description || '',
      assignedTo: issueData.assignedTo || null,
      technicianName: issueData.technicianName || null,
      isOOO: true,
      notes: issueData.notes || ''
    });

    // Add OOO activity
    newWO.activityLog = addActivityLog(newWO.activityLog, 'Room marked as Out of Order', user);

    // Update technician assigned tasks if assigned
    if (issueData.assignedTo) {
      setTechnicians(prev => prev.map(t => {
        if (t.id === issueData.assignedTo) {
          return { ...t, assignedTasks: t.assignedTasks + 1 };
        }
        return t;
      }));
    }

    setWorkOrders(prev => [newWO, ...prev]);
    return newWO;
  }, []);

  /**
   * Clear room OOO status
   * Closes all related work orders and marks room as available
   */
  const clearRoomOOO = useCallback((roomNumber, user = 'System') => {
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

    // Return room numbers that were cleared (for external room status update)
    return roomNumber;
  }, []);

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
   * Add new PM task
   */
  const addPMTask = useCallback((data) => {
    const newPM = createPreventiveTask(data);
    setPMTasks(prev => [newPM, ...prev]);
    return newPM;
  }, []);

  /**
   * Update PM task
   */
  const updatePMTask = useCallback((pmId, updates) => {
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
  }, []);

  /**
   * Delete PM task
   */
  const deletePMTask = useCallback((pmId) => {
    setPMTasks(prev => prev.filter(pm => pm.id !== pmId));
  }, []);

  /**
   * Complete PM task and schedule next
   */
  const completePMTask = useCallback((pmId) => {
    setPMTasks(prev => prev.map(pm => {
      if (pm.id === pmId) {
        const now = new Date().toISOString().split('T')[0];
        const nextDue = calculateNextDueDate(now, pm.frequency);
        return {
          ...pm,
          lastCompleted: now,
          nextDueDate: nextDue,
          updatedAt: new Date().toISOString()
        };
      }
      return pm;
    }));
  }, []);

  /**
   * Toggle PM task active status
   */
  const togglePMActive = useCallback((pmId) => {
    setPMTasks(prev => prev.map(pm => {
      if (pm.id === pmId) {
        return {
          ...pm,
          isActive: !pm.isActive,
          updatedAt: new Date().toISOString()
        };
      }
      return pm;
    }));
  }, []);

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
   * Add inventory item
   */
  const addInventoryItem = useCallback((data) => {
    const newItem = {
      id: generateInventoryId(),
      name: data.name,
      category: data.category,
      stockLevel: data.stockLevel || 0,
      minStock: data.minStock || 0,
      unitCost: data.unitCost || 0,
      location: data.location || '',
      lastRestocked: data.lastRestocked || new Date().toISOString().split('T')[0]
    };
    setInventory(prev => [newItem, ...prev]);
    return newItem;
  }, []);

  /**
   * Update inventory item
   */
  const updateInventoryItem = useCallback((itemId, updates) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      return item;
    }));
  }, []);

  /**
   * Delete inventory item
   */
  const deleteInventoryItem = useCallback((itemId) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  }, []);

  /**
   * Update stock level
   */
  const updateStock = useCallback((itemId, quantity, isAddition = true) => {
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
  }, []);

  /**
   * Get low stock items
   */
  const getLowStockItems = useCallback(() => {
    return inventory.filter(item => item.stockLevel <= item.minStock);
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
   * Reset all data to initial state
   */
  const resetToInitialData = useCallback(() => {
    setWorkOrders(workOrdersData);
    setPMTasks(preventiveMaintenanceData);
    setTechnicians(techniciansData);
    setInventory(inventoryData);
  }, []);

  return {
    // Data
    workOrders,
    pmTasks,
    technicians,
    inventory,

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
    resetToInitialData
  };
}
