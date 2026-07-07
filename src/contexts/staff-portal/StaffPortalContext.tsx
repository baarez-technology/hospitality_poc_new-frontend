import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useRef } from 'react';
import { seedDemoData, generateId } from '../../data/staff-portal/seedDemo';
import { useAuth } from '../../hooks/useAuth';
import { notificationsService, StaffNotification as APINotification } from '../../api/services/notifications.service';

const STORAGE_KEY = 'glimmora_staff_portal';

export const StaffPortalContext = createContext<any>(null);

interface StaffPortalState {
  profile: any;
  notifications: any[];
  housekeeping: {
    rooms: any[];
    tasks: any[];
  };
  maintenance: {
    workOrders: any[];
    tasks: any[];
    equipmentIssues: any[];
  };
  runner: {
    pickupRequests: any[];
    deliveries: any[];
  };
  ui: {
    sidebarOpen: boolean;
    notificationDrawerOpen: boolean;
    activeModal: string | null;
    modalData: any;
    loading: boolean;
  };
}

const initialState: StaffPortalState = {
  profile: null,
  notifications: [],
  housekeeping: {
    rooms: [],
    tasks: []
  },
  maintenance: {
    workOrders: [],
    tasks: [],
    equipmentIssues: []
  },
  runner: {
    pickupRequests: [],
    deliveries: []
  },
  ui: {
    sidebarOpen: false,
    notificationDrawerOpen: false,
    activeModal: null,
    modalData: null,
    loading: false
  }
};

const actionTypes = {
  LOAD_STATE: 'LOAD_STATE',
  SET_PROFILE: 'SET_PROFILE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLOCK_IN: 'CLOCK_IN',
  CLOCK_OUT: 'CLOCK_OUT',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  SET_MAINTENANCE_DATA: 'SET_MAINTENANCE_DATA',
  SET_HOUSEKEEPING_DATA: 'SET_HOUSEKEEPING_DATA',
  SET_RUNNER_DATA: 'SET_RUNNER_DATA',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  MARK_ALL_NOTIFICATIONS_READ: 'MARK_ALL_NOTIFICATIONS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  SET_LOADING: 'SET_LOADING',
  UPDATE_ROOM: 'UPDATE_ROOM',
  UPDATE_ROOM_CHECKLIST: 'UPDATE_ROOM_CHECKLIST',
  ADD_ROOM_NOTE: 'ADD_ROOM_NOTE',
  UPDATE_ROOM_STATUS: 'UPDATE_ROOM_STATUS',
  ADD_HK_TASK: 'ADD_HK_TASK',
  UPDATE_HK_TASK: 'UPDATE_HK_TASK',
  DELETE_HK_TASK: 'DELETE_HK_TASK',
  UPDATE_HK_TASK_STATUS: 'UPDATE_HK_TASK_STATUS',
  ADD_WORK_ORDER: 'ADD_WORK_ORDER',
  UPDATE_WORK_ORDER: 'UPDATE_WORK_ORDER',
  DELETE_WORK_ORDER: 'DELETE_WORK_ORDER',
  ADD_WORK_ORDER_COMMENT: 'ADD_WORK_ORDER_COMMENT',
  UPDATE_WORK_ORDER_STATUS: 'UPDATE_WORK_ORDER_STATUS',
  ADD_MT_TASK: 'ADD_MT_TASK',
  UPDATE_MT_TASK: 'UPDATE_MT_TASK',
  DELETE_MT_TASK: 'DELETE_MT_TASK',
  UPDATE_MT_TASK_STATUS: 'UPDATE_MT_TASK_STATUS',
  UPDATE_MT_TASK_CHECKLIST: 'UPDATE_MT_TASK_CHECKLIST',
  ADD_EQUIPMENT_ISSUE: 'ADD_EQUIPMENT_ISSUE',
  UPDATE_EQUIPMENT_ISSUE: 'UPDATE_EQUIPMENT_ISSUE',
  DELETE_EQUIPMENT_ISSUE: 'DELETE_EQUIPMENT_ISSUE',
  ADD_PICKUP_REQUEST: 'ADD_PICKUP_REQUEST',
  UPDATE_PICKUP_REQUEST: 'UPDATE_PICKUP_REQUEST',
  DELETE_PICKUP_REQUEST: 'DELETE_PICKUP_REQUEST',
  UPDATE_PICKUP_STATUS: 'UPDATE_PICKUP_STATUS',
  ACCEPT_PICKUP: 'ACCEPT_PICKUP',
  COMPLETE_PICKUP: 'COMPLETE_PICKUP',
  ADD_DELIVERY: 'ADD_DELIVERY',
  UPDATE_DELIVERY: 'UPDATE_DELIVERY',
  DELETE_DELIVERY: 'DELETE_DELIVERY',
  UPDATE_DELIVERY_STATUS: 'UPDATE_DELIVERY_STATUS',
  ACCEPT_DELIVERY: 'ACCEPT_DELIVERY',
  COMPLETE_DELIVERY: 'COMPLETE_DELIVERY',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  TOGGLE_NOTIFICATION_DRAWER: 'TOGGLE_NOTIFICATION_DRAWER',
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  RESET_ALL: 'RESET_ALL',
  SEED_DEMO_DATA: 'SEED_DEMO_DATA'
};

type Action = {
  type: string;
  payload?: any;
};

function reducer(state: StaffPortalState, action: Action): StaffPortalState {
  switch (action.type) {
    case actionTypes.LOAD_STATE:
      return { ...state, ...action.payload };

    case actionTypes.SET_PROFILE:
      return { ...state, profile: action.payload };

    case actionTypes.UPDATE_PROFILE:
      return {
        ...state,
        profile: { ...state.profile, ...action.payload }
      };

    case actionTypes.CLOCK_IN: {
      const clockInTimestamp = new Date().toISOString();
      const clockInHistory = state.profile?.clockHistory || [];
      return {
        ...state,
        profile: {
          ...state.profile,
          clockedIn: true,
          clockInTime: clockInTimestamp,
          clockHistory: [
            { action: 'clock_in', timestamp: clockInTimestamp },
            ...clockInHistory
          ].slice(0, 50) // keep last 50 entries
        }
      };
    }

    case actionTypes.CLOCK_OUT: {
      const clockOutTimestamp = action.payload?.clockOutTime || new Date().toISOString();
      const clockOutHistory = state.profile?.clockHistory || [];
      return {
        ...state,
        profile: {
          ...state.profile,
          clockedIn: false,
          clockOutTime: clockOutTimestamp,
          lastClockInTime: state.profile?.clockInTime,
          clockInTime: null,
          clockHistory: [
            { action: 'clock_out', timestamp: clockOutTimestamp },
            ...clockOutHistory
          ].slice(0, 50)
        }
      };
    }

    case actionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload
      };

    case actionTypes.SET_MAINTENANCE_DATA:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          tasks: action.payload.tasks || state.maintenance.tasks,
          equipmentIssues: action.payload.equipmentIssues || state.maintenance.equipmentIssues,
          workOrders: action.payload.workOrders || state.maintenance.workOrders
        }
      };

    case actionTypes.SET_HOUSEKEEPING_DATA:
      return {
        ...state,
        housekeeping: {
          ...state.housekeeping,
          rooms: action.payload.rooms || state.housekeeping.rooms,
          tasks: action.payload.tasks || state.housekeeping.tasks
        }
      };

    case actionTypes.SET_RUNNER_DATA:
      return {
        ...state,
        runner: {
          ...state.runner,
          pickupRequests: action.payload.pickupRequests || state.runner.pickupRequests,
          deliveries: action.payload.deliveries || state.runner.deliveries
        }
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload }
      };

    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };

    case actionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      };

    case actionTypes.MARK_ALL_NOTIFICATIONS_READ:
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      };

    case actionTypes.DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case actionTypes.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };

    case actionTypes.UPDATE_ROOM:
      return {
        ...state,
        housekeeping: {
          ...state.housekeeping,
          rooms: state.housekeeping.rooms.map(r =>
            r.id === action.payload.id ? { ...r, ...action.payload } : r
          )
        }
      };

    case actionTypes.UPDATE_ROOM_CHECKLIST:
      return {
        ...state,
        housekeeping: {
          ...state.housekeeping,
          rooms: state.housekeeping.rooms.map(r =>
            r.id === action.payload.roomId
              ? {
                  ...r,
                  checklist: (Array.isArray(r.checklist) ? r.checklist : []).map((c: any) =>
                    c.id === action.payload.checklistId
                      ? { ...c, completed: action.payload.completed }
                      : c
                  )
                }
              : r
          )
        }
      };

    case actionTypes.ADD_ROOM_NOTE:
      return {
        ...state,
        housekeeping: {
          ...state.housekeeping,
          rooms: state.housekeeping.rooms.map(r =>
            r.id === action.payload.roomId
              ? { ...r, notes: action.payload.note }
              : r
          )
        }
      };

    case actionTypes.UPDATE_ROOM_STATUS:
      return {
        ...state,
        housekeeping: {
          ...state.housekeeping,
          rooms: state.housekeeping.rooms.map(r =>
            r.id === action.payload.roomId
              ? { ...r, status: action.payload.status }
              : r
          )
        }
      };

    case actionTypes.ADD_HK_TASK:
      return {
        ...state,
        housekeeping: {
          ...state.housekeeping,
          tasks: [...state.housekeeping.tasks, { ...action.payload, id: generateId() }]
        }
      };

    case actionTypes.UPDATE_HK_TASK:
      return {
        ...state,
        housekeeping: {
          ...state.housekeeping,
          tasks: state.housekeeping.tasks.map(t =>
            t.id === action.payload.id ? { ...t, ...action.payload } : t
          )
        }
      };

    case actionTypes.DELETE_HK_TASK:
      return {
        ...state,
        housekeeping: {
          ...state.housekeeping,
          tasks: state.housekeeping.tasks.filter(t => t.id !== action.payload)
        }
      };

    case actionTypes.UPDATE_HK_TASK_STATUS:
      return {
        ...state,
        housekeeping: {
          ...state.housekeeping,
          tasks: state.housekeeping.tasks.map(t =>
            t.id === action.payload.taskId
              ? {
                  ...t,
                  status: action.payload.status,
                  ...(action.payload.status === 'completed' && { completedAt: new Date().toISOString() })
                }
              : t
          )
        }
      };

    case actionTypes.ADD_WORK_ORDER:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          workOrders: [...state.maintenance.workOrders, { ...action.payload, id: generateId() }]
        }
      };

    case actionTypes.UPDATE_WORK_ORDER:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          workOrders: state.maintenance.workOrders.map(wo =>
            wo.id === action.payload.id ? { ...wo, ...action.payload } : wo
          )
        }
      };

    case actionTypes.DELETE_WORK_ORDER:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          workOrders: state.maintenance.workOrders.filter(wo => wo.id !== action.payload)
        }
      };

    case actionTypes.ADD_WORK_ORDER_COMMENT:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          workOrders: state.maintenance.workOrders.map(wo =>
            wo.id === action.payload.workOrderId
              ? {
                  ...wo,
                  comments: [...(wo.comments || []), {
                    id: generateId(),
                    ...action.payload.comment,
                    timestamp: new Date().toISOString()
                  }]
                }
              : wo
          )
        }
      };

    case actionTypes.UPDATE_WORK_ORDER_STATUS:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          workOrders: state.maintenance.workOrders.map(wo =>
            wo.id === action.payload.workOrderId
              ? {
                  ...wo,
                  status: action.payload.status,
                  updatedAt: new Date().toISOString()
                }
              : wo
          )
        }
      };

    case actionTypes.ADD_MT_TASK:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          tasks: [...state.maintenance.tasks, { ...action.payload, id: generateId() }]
        }
      };

    case actionTypes.UPDATE_MT_TASK:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          tasks: state.maintenance.tasks.map(t =>
            t.id === action.payload.id ? { ...t, ...action.payload } : t
          )
        }
      };

    case actionTypes.DELETE_MT_TASK:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          tasks: state.maintenance.tasks.filter(t => t.id !== action.payload)
        }
      };

    case actionTypes.UPDATE_MT_TASK_STATUS:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          tasks: state.maintenance.tasks.map(t =>
            t.id === action.payload.taskId
              ? { ...t, status: action.payload.status }
              : t
          )
        }
      };

    case actionTypes.UPDATE_MT_TASK_CHECKLIST:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          tasks: state.maintenance.tasks.map(t =>
            t.id === action.payload.taskId
              ? {
                  ...t,
                  checklist: (t.checklist || []).map((c: any) =>
                    c.id === action.payload.checklistId
                      ? { ...c, completed: action.payload.completed }
                      : c
                  )
                }
              : t
          )
        }
      };

    case actionTypes.ADD_EQUIPMENT_ISSUE:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          equipmentIssues: [...state.maintenance.equipmentIssues, { ...action.payload, id: generateId() }]
        }
      };

    case actionTypes.UPDATE_EQUIPMENT_ISSUE:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          equipmentIssues: state.maintenance.equipmentIssues.map(ei =>
            ei.id === action.payload.id ? { ...ei, ...action.payload } : ei
          )
        }
      };

    case actionTypes.DELETE_EQUIPMENT_ISSUE:
      return {
        ...state,
        maintenance: {
          ...state.maintenance,
          equipmentIssues: state.maintenance.equipmentIssues.filter(ei => ei.id !== action.payload)
        }
      };

    case actionTypes.ADD_PICKUP_REQUEST:
      return {
        ...state,
        runner: {
          ...state.runner,
          pickupRequests: [...state.runner.pickupRequests, { ...action.payload, id: generateId() }]
        }
      };

    case actionTypes.UPDATE_PICKUP_REQUEST:
      return {
        ...state,
        runner: {
          ...state.runner,
          pickupRequests: state.runner.pickupRequests.map(pr =>
            pr.id === action.payload.id ? { ...pr, ...action.payload } : pr
          )
        }
      };

    case actionTypes.DELETE_PICKUP_REQUEST:
      return {
        ...state,
        runner: {
          ...state.runner,
          pickupRequests: state.runner.pickupRequests.filter(pr => pr.id !== action.payload)
        }
      };

    case actionTypes.UPDATE_PICKUP_STATUS:
      return {
        ...state,
        runner: {
          ...state.runner,
          pickupRequests: state.runner.pickupRequests.map(pr =>
            pr.id === action.payload.pickupId
              ? { ...pr, status: action.payload.status }
              : pr
          )
        }
      };

    case actionTypes.ACCEPT_PICKUP:
      return {
        ...state,
        runner: {
          ...state.runner,
          pickupRequests: state.runner.pickupRequests.map(pr =>
            pr.id === action.payload.pickupId
              ? {
                  ...pr,
                  status: 'in_progress',
                  assignedTo: state.profile?.name || 'Staff'
                }
              : pr
          )
        }
      };

    case actionTypes.COMPLETE_PICKUP:
      return {
        ...state,
        runner: {
          ...state.runner,
          pickupRequests: state.runner.pickupRequests.map(pr =>
            pr.id === action.payload.pickupId
              ? {
                  ...pr,
                  status: 'completed',
                  completedAt: new Date().toISOString()
                }
              : pr
          )
        }
      };

    case actionTypes.ADD_DELIVERY:
      return {
        ...state,
        runner: {
          ...state.runner,
          deliveries: [...state.runner.deliveries, { ...action.payload, id: generateId() }]
        }
      };

    case actionTypes.UPDATE_DELIVERY:
      return {
        ...state,
        runner: {
          ...state.runner,
          deliveries: state.runner.deliveries.map(d =>
            d.id === action.payload.id ? { ...d, ...action.payload } : d
          )
        }
      };

    case actionTypes.DELETE_DELIVERY:
      return {
        ...state,
        runner: {
          ...state.runner,
          deliveries: state.runner.deliveries.filter(d => d.id !== action.payload)
        }
      };

    case actionTypes.UPDATE_DELIVERY_STATUS:
      return {
        ...state,
        runner: {
          ...state.runner,
          deliveries: state.runner.deliveries.map(d =>
            d.id === action.payload.deliveryId
              ? { ...d, status: action.payload.status }
              : d
          )
        }
      };

    case actionTypes.ACCEPT_DELIVERY:
      return {
        ...state,
        runner: {
          ...state.runner,
          deliveries: state.runner.deliveries.map(d =>
            d.id === action.payload.deliveryId
              ? {
                  ...d,
                  status: 'in_transit',
                  assignedTo: state.profile?.name || 'Staff'
                }
              : d
          )
        }
      };

    case actionTypes.COMPLETE_DELIVERY:
      return {
        ...state,
        runner: {
          ...state.runner,
          deliveries: state.runner.deliveries.map(d =>
            d.id === action.payload.deliveryId
              ? {
                  ...d,
                  status: 'delivered',
                  deliveredAt: new Date().toISOString()
                }
              : d
          )
        }
      };

    case actionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      };

    case actionTypes.TOGGLE_NOTIFICATION_DRAWER:
      return {
        ...state,
        ui: { ...state.ui, notificationDrawerOpen: !state.ui.notificationDrawerOpen }
      };

    case actionTypes.OPEN_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          activeModal: action.payload.modal,
          modalData: action.payload.data || null
        }
      };

    case actionTypes.CLOSE_MODAL:
      return {
        ...state,
        ui: { ...state.ui, activeModal: null, modalData: null }
      };

    case actionTypes.RESET_ALL:
      return initialState;

    case actionTypes.SEED_DEMO_DATA:
      const demoData = seedDemoData(action.payload);
      return {
        ...state,
        profile: demoData.profile,
        notifications: demoData.notifications,
        housekeeping: demoData.housekeeping,
        maintenance: demoData.maintenance,
        runner: demoData.runner
      };

    default:
      return state;
  }
}

interface StaffPortalProviderProps {
  children: ReactNode;
}

export function StaffPortalProvider({ children }: StaffPortalProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, isAuthenticated } = useAuth();
  const notificationPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notifications from the backend API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const apiNotifications = await notificationsService.getNotifications({ limit: 50 });
      // Transform API notifications to local format
      // Fallback routes for notifications without a task
      const staffRouteMap: Record<string, string> = {
        housekeeping: '/staff/housekeeping',
        maintenance: '/staff/maintenance',
        task: '/staff/tasks',
        system: '/staff/dashboard',
        alert: '/staff/dashboard',
      };
      const transformedNotifications = apiNotifications.map((n: APINotification) => ({
        id: n.id.toString(),
        type: n.notification_type,
        title: n.title,
        message: n.message,
        timestamp: n.created_at,
        read: n.is_read,
        readAt: n.read_at,
        priority: n.task?.priority || 'normal',
        actionUrl: n.task
          ? `/staff/${n.task.task_type}/tasks/${n.task.id}`
          : (staffRouteMap[n.notification_type] || '/staff/dashboard'),
        taskId: n.task_id
      }));
      dispatch({ type: actionTypes.SET_NOTIFICATIONS, payload: transformedNotifications });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Fallback to demo data if API fails
    }
  }, [isAuthenticated]);

  // Fetch maintenance data from the backend API
  const fetchMaintenanceData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const { maintenanceService } = await import('../../api/services/maintenance.service');
      const [workOrders, equipmentIssues] = await Promise.all([
        maintenanceService.getMyWorkOrders(),
        maintenanceService.getEquipmentIssues()
      ]);

      // Transform work orders to local format
      const transformedTasks = workOrders.map((wo: any) => ({
        id: wo.id.toString(),
        title: wo.title,
        description: wo.description,
        location: wo.location,
        category: wo.issue_type,
        priority: wo.priority,
        status: wo.status === 'pending' ? 'todo' : wo.status,
        assignedTo: wo.assigned_to_name,
        createdAt: wo.reported_at,
        dueDate: wo.scheduled_date,
        completedAt: wo.completed_at,
        notes: wo.notes,
        checklist: []
      }));

      // Transform equipment issues to local format
      const transformedIssues = equipmentIssues.map((issue: any) => ({
        id: issue.id.toString(),
        equipment: issue.equipment_name,
        title: issue.equipment_name,
        type: issue.issue_type,
        description: issue.issue_description,
        location: issue.location,
        category: issue.equipment_category,
        severity: issue.severity,
        status: issue.status,
        reportedBy: issue.reported_by_name,
        reportedAt: issue.reported_at,
        assignedTo: issue.assigned_to_name,
        resolvedAt: issue.resolved_at,
        resolutionNotes: issue.resolution_notes
      }));

      dispatch({
        type: actionTypes.SET_MAINTENANCE_DATA,
        payload: { tasks: transformedTasks, equipmentIssues: transformedIssues }
      });
    } catch (error) {
      console.error('Failed to fetch maintenance data:', error);
    }
  }, [isAuthenticated]);

  // Fetch housekeeping data from the backend API
  const fetchHousekeepingData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const { housekeepingService } = await import('../../api/services/housekeeping.service');
      const [rooms, tasks] = await Promise.all([
        housekeepingService.getRooms(),
        housekeepingService.getMyTasks()
      ]);

      // Transform rooms to local format
      const transformedRooms = rooms.map((room: any) => ({
        id: room.id.toString(),
        number: room.number,
        type: room.room_type,
        floor: room.floor,
        status: room.status,
        priority: room.priority || 'normal',
        lastCleaned: room.last_cleaned,
        guestName: room.current_guest_name,
        checkoutTime: room.checkout_time,
        notes: room.notes || '',
        bedType: room.bed_type,
        viewType: room.view_type,
        checklist: []
      }));

      // Transform tasks to local format
      const transformedTasks = tasks.map((task: any) => ({
        id: task.id.toString(),
        roomId: task.room_id?.toString(),
        roomNumber: task.room_number,
        type: task.task_type,
        status: task.status === 'pending' ? 'todo' : task.status,
        priority: task.priority,
        assignedTo: task.assigned_to_name,
        createdAt: task.created_at,
        scheduledFor: task.scheduled_for,
        completedAt: task.completed_at,
        notes: task.notes
      }));

      dispatch({
        type: actionTypes.SET_HOUSEKEEPING_DATA,
        payload: { rooms: transformedRooms, tasks: transformedTasks }
      });
    } catch (error) {
      console.error('Failed to fetch housekeeping data:', error);
    }
  }, [isAuthenticated]);

  // Fetch runner data from the backend API
  const fetchRunnerData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const { runnerService } = await import('../../api/services/runner.service');
      const [pickups, deliveries] = await Promise.all([
        runnerService.getMyPickups(),
        runnerService.getMyDeliveries()
      ]);

      // Transform pickups to local format
      const transformedPickups = pickups.map((pickup: any) => ({
        id: pickup.id.toString(),
        requestNumber: pickup.request_number,
        roomNumber: pickup.room_number,
        guestName: pickup.guest_name,
        pickupType: pickup.pickup_type,
        itemsDescription: pickup.items_description,
        itemCount: pickup.item_count,
        pickupLocation: pickup.pickup_location,
        destination: pickup.destination,
        scheduledTime: pickup.scheduled_time,
        priority: pickup.priority,
        status: pickup.status,
        assignedTo: pickup.assigned_to_name,
        requestedAt: pickup.requested_at,
        acceptedAt: pickup.accepted_at,
        completedAt: pickup.completed_at,
        specialInstructions: pickup.special_instructions,
        signatureRequired: pickup.signature_required
      }));

      // Transform deliveries to local format
      const transformedDeliveries = deliveries.map((delivery: any) => ({
        id: delivery.id.toString(),
        deliveryNumber: delivery.delivery_number,
        deliveryType: delivery.delivery_type,
        roomNumber: delivery.room_number,
        guestName: delivery.guest_name,
        itemsDescription: delivery.items_description,
        itemCount: delivery.item_count,
        originLocation: delivery.origin_location,
        destinationLocation: delivery.destination_location,
        priority: delivery.priority,
        status: delivery.status,
        assignedTo: delivery.assigned_to_name,
        orderedAt: delivery.ordered_at,
        acceptedAt: delivery.accepted_at,
        pickedUpAt: delivery.picked_up_at,
        deliveredAt: delivery.delivered_at,
        specialInstructions: delivery.special_instructions,
        signatureRequired: delivery.signature_required,
        temperatureSensitive: delivery.temperature_sensitive,
        fragile: delivery.fragile
      }));

      dispatch({
        type: actionTypes.SET_RUNNER_DATA,
        payload: { pickupRequests: transformedPickups, deliveries: transformedDeliveries }
      });
    } catch (error) {
      console.error('Failed to fetch runner data:', error);
    }
  }, [isAuthenticated]);

  // Fetch staff profile from the backend API
  const fetchStaffProfile = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const { staffService } = await import('../../api/services/staff.service');
      const profileData = await staffService.getMyProfile();

      // Transform to local format
      const transformedProfile = {
        id: profileData.id.toString(),
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        role: profileData.role,
        department: profileData.department,
        specialty: profileData.specialty,
        status: profileData.status,
        shift: profileData.shift,
        shiftStart: profileData.shift_start,
        shiftEnd: profileData.shift_end,
        clockedIn: profileData.clocked_in,
        clockInTime: profileData.clock_in_time,
        supervisorId: profileData.supervisor_id,
        supervisorName: profileData.supervisor_name,
        floorAssignment: profileData.floor_assignment,
        hireDate: profileData.hire_date,
        emergencyContact: {
          name: profileData.emergency_contact_name,
          phone: profileData.emergency_contact_phone,
          relationship: profileData.emergency_contact_relationship
        },
        address: profileData.address,
        salary: profileData.salary,
        hourlyRate: profileData.hourly_rate,
        avatar: profileData.avatar,
        performanceRating: profileData.performance_rating,
        certifications: profileData.certifications,
        skills: profileData.skills,
        languages: profileData.languages_spoken,
        schedule: profileData.schedule,
        attendanceStats: profileData.attendance_stats
      };

      // Filter out null/undefined values so they don't overwrite seeded data (e.g. shift times)
      const filteredProfile = Object.fromEntries(
        Object.entries(transformedProfile).filter(([_, v]) => v != null)
      );
      // Merge with existing profile to preserve locally-set values (shift times from seed, clock state, etc.)
      dispatch({ type: actionTypes.UPDATE_PROFILE, payload: filteredProfile });
    } catch (error) {
      console.error('Failed to fetch staff profile:', error);
      // Fallback to demo data if API fails - the seeded data will remain
    }
  }, [isAuthenticated]);

  // Sync portal data with authenticated user
  useEffect(() => {
    if (isAuthenticated && user) {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedRole = stored ? JSON.parse(stored)?.profile?.role : null;

      // If role changed or no stored data, seed fresh data for the user's role
      if (!stored || storedRole !== user.role) {
        dispatch({ type: actionTypes.SEED_DEMO_DATA, payload: user.role });
      } else {
        try {
          const parsed = JSON.parse(stored);
          dispatch({ type: actionTypes.LOAD_STATE, payload: parsed });
        } catch (e) {
          console.error('Failed to parse stored state:', e);
          dispatch({ type: actionTypes.SEED_DEMO_DATA, payload: user.role });
        }
      }

      // Fetch real data from backend after seeding/loading local state
      fetchNotifications();
      fetchStaffProfile();

      // Fetch role-specific data from backend
      if (user.role === 'maintenance' || user.role === 'admin' || user.role === 'superuser') {
        fetchMaintenanceData();
      }
      if (user.role === 'housekeeping' || user.role === 'admin' || user.role === 'superuser') {
        fetchHousekeepingData();
      }
      if (user.role === 'runner' || user.role === 'admin' || user.role === 'superuser') {
        fetchRunnerData();
      }

      // Set up polling for notifications (every 30 seconds)
      notificationPollingRef.current = setInterval(() => {
        fetchNotifications();
        // Also refresh role-specific data periodically
        if (user.role === 'maintenance' || user.role === 'admin' || user.role === 'superuser') {
          fetchMaintenanceData();
        }
        if (user.role === 'housekeeping' || user.role === 'admin' || user.role === 'superuser') {
          fetchHousekeepingData();
        }
        if (user.role === 'runner' || user.role === 'admin' || user.role === 'superuser') {
          fetchRunnerData();
        }
      }, 30000);
    } else if (!isAuthenticated) {
      // Reset state when user logs out
      dispatch({ type: actionTypes.RESET_ALL });

      // Clear polling interval
      if (notificationPollingRef.current) {
        clearInterval(notificationPollingRef.current);
        notificationPollingRef.current = null;
      }
    }

    return () => {
      if (notificationPollingRef.current) {
        clearInterval(notificationPollingRef.current);
      }
    };
  }, [isAuthenticated, user, fetchNotifications, fetchMaintenanceData, fetchHousekeepingData, fetchRunnerData, fetchStaffProfile]);

  useEffect(() => {
    if (state.profile) {
      const { ui, notifications, ...dataToStore } = state;
      // Don't store notifications in localStorage - always fetch from API
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    }
  }, [state]);

  const setRole = useCallback((role: string) => {
    dispatch({ type: actionTypes.SEED_DEMO_DATA, payload: role });
  }, []);

  const clockIn = useCallback(async () => {
    try {
      const { staffService } = await import('../../api/services/staff.service');
      const staffId = state.profile?.id || user?.id;
      if (staffId) {
        await staffService.clockInOut(staffId, { action: 'clock_in' });
      }
      dispatch({ type: actionTypes.CLOCK_IN });
      // Refresh profile from backend to sync state
      fetchStaffProfile();
    } catch (err) {
      console.error('Clock in API call failed:', err);
    }
  }, [state.profile?.id, user?.id, fetchStaffProfile]);

  const clockOut = useCallback(async () => {
    const clockOutTime = new Date().toISOString();
    try {
      const { staffService } = await import('../../api/services/staff.service');
      const staffId = state.profile?.id || user?.id;
      if (staffId) {
        await staffService.clockInOut(staffId, { action: 'clock_out' });
      }
      dispatch({ type: actionTypes.CLOCK_OUT, payload: { clockOutTime } });
      // Refresh profile from backend to sync state
      fetchStaffProfile();
    } catch (err) {
      console.error('Clock out API call failed:', err);
    }
  }, [state.profile?.id, user?.id, fetchStaffProfile]);

  const updateProfile = useCallback((updates: any) => {
    dispatch({ type: actionTypes.UPDATE_PROFILE, payload: updates });
  }, []);

  const addNotification = useCallback((notification: any) => {
    dispatch({
      type: actionTypes.ADD_NOTIFICATION,
      payload: {
        id: generateId(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notification
      }
    });
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    dispatch({ type: actionTypes.MARK_NOTIFICATION_READ, payload: id });
    // Sync with backend
    try {
      await notificationsService.markAsRead(parseInt(id, 10));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    dispatch({ type: actionTypes.MARK_ALL_NOTIFICATIONS_READ });
    // Sync with backend
    try {
      await notificationsService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    dispatch({ type: actionTypes.DELETE_NOTIFICATION, payload: id });
    // Sync with backend
    try {
      await notificationsService.deleteNotification(parseInt(id, 10));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  const clearNotifications = useCallback(async () => {
    dispatch({ type: actionTypes.CLEAR_NOTIFICATIONS });
    // Sync with backend
    try {
      await notificationsService.deleteAllNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, []);

  const updateRoom = useCallback(async (roomData: any) => {
    dispatch({ type: actionTypes.UPDATE_ROOM, payload: roomData });
    // Sync with backend if room has an ID
    if (roomData.id && !isNaN(parseInt(roomData.id))) {
      try {
        const { housekeepingService } = await import('../../api/services/housekeeping.service');
        if (roomData.status) {
          await housekeepingService.updateRoomStatus(parseInt(roomData.id), {
            status: roomData.status,
            notes: roomData.notes
          });
        }
      } catch (error) {
        console.error('Failed to sync room update to backend:', error);
      }
    }
  }, []);

  const updateRoomChecklist = useCallback((roomId: string, checklistId: string, completed: boolean) => {
    dispatch({
      type: actionTypes.UPDATE_ROOM_CHECKLIST,
      payload: { roomId, checklistId, completed }
    });
  }, []);

  const updateRoomStatus = useCallback(async (roomId: string, status: string) => {
    dispatch({ type: actionTypes.UPDATE_ROOM_STATUS, payload: { roomId, status } });
    // Sync with backend
    if (roomId && !isNaN(parseInt(roomId))) {
      try {
        const { housekeepingService } = await import('../../api/services/housekeeping.service');
        await housekeepingService.updateRoomStatus(parseInt(roomId), { status });
      } catch (error) {
        console.error('Failed to sync room status to backend:', error);
      }
    }
  }, []);

  const addRoomNote = useCallback((roomId: string, note: string) => {
    dispatch({ type: actionTypes.ADD_ROOM_NOTE, payload: { roomId, note } });
  }, []);

  const addHKTask = useCallback((task: any) => {
    dispatch({ type: actionTypes.ADD_HK_TASK, payload: task });
  }, []);

  const updateHKTask = useCallback((task: any) => {
    dispatch({ type: actionTypes.UPDATE_HK_TASK, payload: task });
  }, []);

  const deleteHKTask = useCallback((taskId: string) => {
    dispatch({ type: actionTypes.DELETE_HK_TASK, payload: taskId });
  }, []);

  const updateHKTaskStatus = useCallback((taskId: string, status: string) => {
    dispatch({ type: actionTypes.UPDATE_HK_TASK_STATUS, payload: { taskId, status } });
  }, []);

  const addWorkOrder = useCallback((workOrder: any) => {
    dispatch({ type: actionTypes.ADD_WORK_ORDER, payload: workOrder });
  }, []);

  const updateWorkOrder = useCallback((workOrder: any) => {
    dispatch({ type: actionTypes.UPDATE_WORK_ORDER, payload: workOrder });
  }, []);

  const deleteWorkOrder = useCallback((workOrderId: string) => {
    dispatch({ type: actionTypes.DELETE_WORK_ORDER, payload: workOrderId });
  }, []);

  const addWorkOrderComment = useCallback((workOrderId: string, comment: any) => {
    dispatch({ type: actionTypes.ADD_WORK_ORDER_COMMENT, payload: { workOrderId, comment } });
  }, []);

  const updateWorkOrderStatus = useCallback((workOrderId: string, status: string) => {
    dispatch({ type: actionTypes.UPDATE_WORK_ORDER_STATUS, payload: { workOrderId, status } });
  }, []);

  const addMTTask = useCallback(async (task: any) => {
    dispatch({ type: actionTypes.ADD_MT_TASK, payload: task });
    // Sync with backend
    try {
      const { maintenanceService } = await import('../../api/services/maintenance.service');
      await maintenanceService.createWorkOrder({
        title: task.title,
        description: task.description || '',
        location: task.location || '',
        issue_type: task.category || 'general',
        priority: task.priority || 'normal',
      });
    } catch (error) {
      console.error('Failed to sync maintenance task to backend:', error);
    }
  }, []);

  const updateMTTask = useCallback(async (task: any) => {
    dispatch({ type: actionTypes.UPDATE_MT_TASK, payload: task });
    // Sync with backend if task has an ID
    if (task.id && !isNaN(parseInt(task.id))) {
      try {
        const { maintenanceService } = await import('../../api/services/maintenance.service');
        await maintenanceService.updateWorkOrder(parseInt(task.id), {
          title: task.title,
          description: task.description,
          priority: task.priority,
        });
      } catch (error) {
        console.error('Failed to sync maintenance task update to backend:', error);
      }
    }
  }, []);

  const deleteMTTask = useCallback((taskId: string) => {
    dispatch({ type: actionTypes.DELETE_MT_TASK, payload: taskId });
    // Note: Backend doesn't have delete endpoint for work orders
  }, []);

  const updateMTTaskStatus = useCallback(async (taskId: string, status: string) => {
    dispatch({ type: actionTypes.UPDATE_MT_TASK_STATUS, payload: { taskId, status } });
    // Sync with backend
    if (taskId && !isNaN(parseInt(taskId))) {
      try {
        const { maintenanceService } = await import('../../api/services/maintenance.service');
        // Map frontend status to backend status
        const backendStatus = status === 'todo' ? 'pending' : status;

        if (status === 'completed') {
          await maintenanceService.completeWorkOrder(parseInt(taskId));
        } else if (status === 'in_progress') {
          await maintenanceService.acceptWorkOrder(parseInt(taskId));
        } else {
          await maintenanceService.updateWorkOrder(parseInt(taskId), { status: backendStatus });
        }
      } catch (error) {
        console.error('Failed to sync maintenance task status to backend:', error);
      }
    }
  }, []);

  const updateMTTaskChecklist = useCallback((taskId: string, checklistId: string, completed: boolean) => {
    dispatch({
      type: actionTypes.UPDATE_MT_TASK_CHECKLIST,
      payload: { taskId, checklistId, completed }
    });
  }, []);

  const addEquipmentIssue = useCallback(async (issue: any) => {
    dispatch({ type: actionTypes.ADD_EQUIPMENT_ISSUE, payload: issue });
    // Sync with backend
    try {
      const { maintenanceService } = await import('../../api/services/maintenance.service');
      await maintenanceService.createEquipmentIssue({
        equipment_name: issue.equipment || issue.title,
        equipment_category: issue.category,
        location: issue.location || '',
        issue_type: issue.type || 'general',
        issue_description: issue.description || '',
        severity: issue.severity || 'normal',
        affects_operations: issue.affectsOperations || false,
      });
    } catch (error) {
      console.error('Failed to sync equipment issue to backend:', error);
    }
  }, []);

  const updateEquipmentIssue = useCallback(async (issue: any) => {
    dispatch({ type: actionTypes.UPDATE_EQUIPMENT_ISSUE, payload: issue });
    // Sync with backend
    if (issue.id && !isNaN(parseInt(issue.id))) {
      try {
        const { maintenanceService } = await import('../../api/services/maintenance.service');
        const updateData: any = {};
        if (issue.status) updateData.status = issue.status;
        if (issue.severity) updateData.severity = issue.severity;
        if (issue.resolutionNotes) updateData.resolution_notes = issue.resolutionNotes;
        await maintenanceService.updateEquipmentIssue(parseInt(issue.id), updateData);
      } catch (error) {
        console.error('Failed to sync equipment issue update to backend:', error);
      }
    }
  }, []);

  const deleteEquipmentIssue = useCallback((issueId: string) => {
    dispatch({ type: actionTypes.DELETE_EQUIPMENT_ISSUE, payload: issueId });
    // Note: Backend doesn't have delete endpoint for equipment issues
  }, []);

  const addPickupRequest = useCallback((request: any) => {
    dispatch({ type: actionTypes.ADD_PICKUP_REQUEST, payload: request });
  }, []);

  const updatePickupRequest = useCallback((request: any) => {
    dispatch({ type: actionTypes.UPDATE_PICKUP_REQUEST, payload: request });
  }, []);

  const deletePickupRequest = useCallback((requestId: string) => {
    dispatch({ type: actionTypes.DELETE_PICKUP_REQUEST, payload: requestId });
  }, []);

  const acceptPickup = useCallback((pickupId: string) => {
    dispatch({ type: actionTypes.ACCEPT_PICKUP, payload: { pickupId } });
  }, []);

  const completePickup = useCallback((pickupId: string) => {
    dispatch({ type: actionTypes.COMPLETE_PICKUP, payload: { pickupId } });
  }, []);

  const addDelivery = useCallback((delivery: any) => {
    dispatch({ type: actionTypes.ADD_DELIVERY, payload: delivery });
  }, []);

  const updateDelivery = useCallback((delivery: any) => {
    dispatch({ type: actionTypes.UPDATE_DELIVERY, payload: delivery });
  }, []);

  const deleteDelivery = useCallback((deliveryId: string) => {
    dispatch({ type: actionTypes.DELETE_DELIVERY, payload: deliveryId });
  }, []);

  const acceptDelivery = useCallback((deliveryId: string) => {
    dispatch({ type: actionTypes.ACCEPT_DELIVERY, payload: { deliveryId } });
  }, []);

  const completeDelivery = useCallback((deliveryId: string) => {
    dispatch({ type: actionTypes.COMPLETE_DELIVERY, payload: { deliveryId } });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: actionTypes.TOGGLE_SIDEBAR });
  }, []);

  const toggleNotificationDrawer = useCallback(() => {
    dispatch({ type: actionTypes.TOGGLE_NOTIFICATION_DRAWER });
  }, []);

  const openModal = useCallback((modal: string, data: any = null) => {
    dispatch({ type: actionTypes.OPEN_MODAL, payload: { modal, data } });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: actionTypes.CLOSE_MODAL });
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: actionTypes.RESET_ALL });
  }, []);

  const seedDemoDataAction = useCallback((role: string = 'housekeeping') => {
    dispatch({ type: actionTypes.SEED_DEMO_DATA, payload: role });
  }, []);

  const value = {
    ...state,
    setRole,
    clockIn,
    clockOut,
    updateProfile,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
    refreshNotifications: fetchNotifications,
    refreshMaintenanceData: fetchMaintenanceData,
    refreshHousekeepingData: fetchHousekeepingData,
    refreshProfile: fetchStaffProfile,
    refreshRunnerData: fetchRunnerData,
    updateRoom,
    updateRoomChecklist,
    updateRoomStatus,
    addRoomNote,
    addHKTask,
    updateHKTask,
    deleteHKTask,
    updateHKTaskStatus,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    addWorkOrderComment,
    updateWorkOrderStatus,
    addMTTask,
    updateMTTask,
    deleteMTTask,
    updateMTTaskStatus,
    updateMTTaskChecklist,
    addEquipmentIssue,
    updateEquipmentIssue,
    deleteEquipmentIssue,
    addPickupRequest,
    updatePickupRequest,
    deletePickupRequest,
    acceptPickup,
    completePickup,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    acceptDelivery,
    completeDelivery,
    toggleSidebar,
    toggleNotificationDrawer,
    openModal,
    closeModal,
    resetAll,
    seedDemoData: seedDemoDataAction
  };

  return (
    <StaffPortalContext.Provider value={value}>
      {children}
    </StaffPortalContext.Provider>
  );
}

export function useStaffPortalContext() {
  const context = useContext(StaffPortalContext);
  if (!context) {
    throw new Error('useStaffPortalContext must be used within a StaffPortalProvider');
  }
  return context;
}

export default StaffPortalProvider;


