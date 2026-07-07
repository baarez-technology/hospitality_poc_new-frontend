/**
 * Staff Portal API Hooks
 * Provides data fetching hooks for staff portal that connect to real backend APIs
 */
import { useState, useEffect, useCallback } from 'react';
import { staffService, StaffFullProfile, Task, PerformanceMetrics } from '../../api/services/staff.service';
import { housekeepingService, HousekeepingTask, HousekeepingDashboard } from '../../api/services/housekeeping.service';
import { maintenanceService, WorkOrder, EquipmentIssue, MaintenanceDashboard } from '../../api/services/maintenance.service';
import { runnerService, PickupRequest, Delivery, RunnerDashboard } from '../../api/services/runner.service';
import { notificationsService, StaffNotification, NotificationStats } from '../../api/services/notifications.service';
import { useAuth } from '../useAuth';

// ============== GENERIC DATA FETCHING HOOK ==============

interface UseApiDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useApiData<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ============== STAFF PROFILE HOOKS ==============

export function useStaffProfile(staffId?: number | string) {
  const { user } = useAuth();
  const id = staffId || user?.id;

  return useApiData<StaffFullProfile>(
    () => id ? (staffId ? staffService.get(id as number) : staffService.getMyProfile()) : Promise.reject('No user ID'),
    [id]
  );
}

export function useStaffTasks(staffId?: number | string, status?: string) {
  const { user } = useAuth();
  const id = staffId || user?.id;

  return useApiData<Task[]>(
    () => id ? staffService.getTasks(id as number, status) : Promise.reject('No staff ID'),
    [id, status]
  );
}

export function useStaffPerformance(
  staffId?: number | string,
  period: 'week' | 'month' | 'quarter' | 'year' = 'month'
) {
  const { user } = useAuth();
  const id = staffId || user?.id;

  return useApiData<PerformanceMetrics>(
    () => id ? staffService.getPerformance(id as number, period) : Promise.reject('No staff ID'),
    [id, period]
  );
}

// ============== HOUSEKEEPING HOOKS ==============

export function useHousekeepingDashboard() {
  return useApiData<HousekeepingDashboard>(
    () => housekeepingService.getDashboard(),
    []
  );
}

export function useHousekeepingRooms(status?: string) {
  return useApiData(
    () => housekeepingService.getRooms(status),
    [status]
  );
}

export function useMyHousekeepingRooms(status?: string) {
  return useApiData(
    () => housekeepingService.getMyRooms(status),
    [status]
  );
}

export function useHousekeepingTasks(status?: string, assignedTo?: number) {
  return useApiData<HousekeepingTask[]>(
    () => housekeepingService.getTasks(status, assignedTo),
    [status, assignedTo]
  );
}

export function useMyHousekeepingTasks(status?: string) {
  return useApiData<HousekeepingTask[]>(
    async () => {
      // Use my-tasks endpoint which resolves staff from the auth token
      return housekeepingService.getMyTasks(status);
    },
    [status]
  );
}

// ============== MAINTENANCE HOOKS ==============

export function useMaintenanceDashboard() {
  return useApiData<MaintenanceDashboard>(
    () => maintenanceService.getDashboard(),
    []
  );
}

export function useMyMaintenanceDashboard() {
  return useApiData<MaintenanceDashboard>(
    () => maintenanceService.getMyDashboard(),
    []
  );
}

export function useWorkOrders(filters?: {
  status?: string;
  priority?: string;
  issue_type?: string;
  assigned_to?: number;
}) {
  return useApiData<WorkOrder[]>(
    () => maintenanceService.getWorkOrders(filters),
    [JSON.stringify(filters)]
  );
}

export function useMyWorkOrders(status?: string) {
  return useApiData<WorkOrder[]>(
    () => maintenanceService.getMyWorkOrders(status),
    [status]
  );
}

export function useEquipmentIssues(filters?: {
  status?: string;
  severity?: string;
  category?: string;
}) {
  return useApiData<EquipmentIssue[]>(
    () => maintenanceService.getEquipmentIssues(filters),
    [JSON.stringify(filters)]
  );
}

// ============== RUNNER HOOKS ==============

export function useRunnerDashboard() {
  return useApiData<RunnerDashboard>(
    () => runnerService.getDashboard(),
    []
  );
}

export function useMyRunnerDashboard() {
  return useApiData<RunnerDashboard>(
    () => runnerService.getMyDashboard(),
    []
  );
}

export function usePickupRequests(filters?: {
  status?: string;
  priority?: string;
  pickup_type?: string;
}) {
  return useApiData<PickupRequest[]>(
    () => runnerService.getPickups(filters),
    [JSON.stringify(filters)]
  );
}

export function useMyPickupRequests(status?: string) {
  return useApiData<PickupRequest[]>(
    () => runnerService.getMyPickups(status),
    [status]
  );
}

export function useDeliveries(filters?: {
  status?: string;
  priority?: string;
  delivery_type?: string;
}) {
  return useApiData<Delivery[]>(
    () => runnerService.getDeliveries(filters),
    [JSON.stringify(filters)]
  );
}

export function useMyDeliveries(status?: string) {
  return useApiData<Delivery[]>(
    () => runnerService.getMyDeliveries(status),
    [status]
  );
}

// ============== NOTIFICATION HOOKS ==============

export function useNotifications(filters?: {
  is_read?: boolean;
  notification_type?: string;
  limit?: number;
}) {
  return useApiData<StaffNotification[]>(
    () => notificationsService.getNotifications(filters),
    [JSON.stringify(filters)]
  );
}

export function useUnreadNotificationCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const result = await notificationsService.getUnreadCount();
      setCount(result.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { count, loading, refetch: fetch };
}

export function useNotificationStats() {
  return useApiData<NotificationStats>(
    () => notificationsService.getStats(),
    []
  );
}

// ============== ACTION HOOKS ==============

export function useHousekeepingActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRoomStatus = useCallback(async (roomId: number, status: string, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await housekeepingService.updateRoomStatus(roomId, { status, notes });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const startTask = useCallback(async (taskId: number) => {
    setLoading(true);
    setError(null);
    try {
      await housekeepingService.startTask(taskId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeTask = useCallback(async (taskId: number, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await housekeepingService.completeTask(taskId, { notes });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelTask = useCallback(async (taskId: number) => {
    setLoading(true);
    setError(null);
    try {
      await housekeepingService.cancelTask(taskId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateRoomStatus, startTask, completeTask, cancelTask, loading, error };
}

export function useMaintenanceActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptWorkOrder = useCallback(async (workOrderId: number) => {
    setLoading(true);
    setError(null);
    try {
      await maintenanceService.acceptWorkOrder(workOrderId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeWorkOrder = useCallback(async (workOrderId: number, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await maintenanceService.completeWorkOrder(workOrderId, notes);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptEquipmentIssue = useCallback(async (issueId: number) => {
    setLoading(true);
    setError(null);
    try {
      await maintenanceService.acceptEquipmentIssue(issueId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveEquipmentIssue = useCallback(async (issueId: number, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await maintenanceService.resolveEquipmentIssue(issueId, notes);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { acceptWorkOrder, completeWorkOrder, acceptEquipmentIssue, resolveEquipmentIssue, loading, error };
}

export function useRunnerActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptPickup = useCallback(async (pickupId: number) => {
    setLoading(true);
    setError(null);
    try {
      await runnerService.acceptPickup(pickupId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const completePickup = useCallback(async (pickupId: number, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await runnerService.completePickup(pickupId, notes);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptDelivery = useCallback(async (deliveryId: number) => {
    setLoading(true);
    setError(null);
    try {
      await runnerService.acceptDelivery(deliveryId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeDelivery = useCallback(async (deliveryId: number, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await runnerService.completeDelivery(deliveryId, notes);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { acceptPickup, completePickup, acceptDelivery, completeDelivery, loading, error };
}

export function useNotificationActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = useCallback(async (notificationId: number) => {
    setLoading(true);
    setError(null);
    try {
      await notificationsService.markAsRead(notificationId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await notificationsService.markAllAsRead();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: number) => {
    setLoading(true);
    setError(null);
    try {
      await notificationsService.deleteNotification(notificationId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAllNotifications = useCallback(async (onlyRead?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await notificationsService.deleteAllNotifications(onlyRead);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, loading, error };
}

export function useClockInOut() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clockIn = useCallback(async (location?: string, notes?: string) => {
    if (!user?.id) return false;
    setLoading(true);
    setError(null);
    try {
      await staffService.clockInOut(user.id, { action: 'clock_in', location, notes });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const clockOut = useCallback(async (location?: string, notes?: string) => {
    if (!user?.id) return false;
    setLoading(true);
    setError(null);
    try {
      await staffService.clockInOut(user.id, { action: 'clock_out', location, notes });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return { clockIn, clockOut, loading, error };
}
