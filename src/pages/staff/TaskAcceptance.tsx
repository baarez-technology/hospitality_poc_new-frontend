import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Wrench,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui2/Button';
import { Badge } from '../../components/ui2/Badge';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';

interface PendingTask {
  id: number;
  task_type?: string;      // housekeeping
  work_order_id?: string;  // maintenance
  category?: string;       // maintenance
  room_number?: string;
  priority: string;
  force_assigned: boolean;
  force_assign_reason?: string;
  issue?: string;
}

interface DeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  taskId: number | string;
}

function DeclineModal({ isOpen, onClose, onConfirm, taskId }: DeclineModalProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  const predefinedReasons = [
    'Already at maximum capacity',
    'Not my specialty/training',
    'Equipment not available',
    'Already assigned to urgent task',
    'Health/safety concern',
    'Need supervisor approval'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Decline Task #{taskId}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Reason for declining *
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {predefinedReasons.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    reason === r
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter or customize the reason..."
              rows={3}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => onConfirm(reason)}
              disabled={!reason.trim()}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Decline Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TaskAcceptance() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [housekeepingTasks, setHousekeepingTasks] = useState<PendingTask[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<PendingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [declineModal, setDeclineModal] = useState<{ isOpen: boolean; task: PendingTask | null; type: 'housekeeping' | 'maintenance' }>({
    isOpen: false,
    task: null,
    type: 'housekeeping'
  });

  const fetchPendingTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch both housekeeping and maintenance pending tasks
      const [hkRes, mtRes] = await Promise.all([
        api.get('/api/v1/housekeeping/tasks/pending-acceptance').catch(() => ({ data: { tasks: [] } })),
        api.get('/api/v1/maintenance/work-orders/pending-acceptance').catch(() => ({ data: { work_orders: [] } }))
      ]);

      setHousekeepingTasks(hkRes.data.tasks || []);
      setMaintenanceTasks(mtRes.data.work_orders || []);
    } catch (err) {
      console.error('Failed to fetch pending tasks:', err);
      showToast('Failed to load pending tasks', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTasks();
  }, []);

  const handleAcceptHK = async (taskId: number) => {
    try {
      await api.post(`/api/v1/housekeeping/tasks/${taskId}/accept`);
      showToast('Task accepted! You can now start working.', 'success');
      setHousekeepingTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to accept task:', err);
      showToast('Failed to accept task', 'error');
    }
  };

  const handleDeclineHK = async (taskId: number, reason: string) => {
    try {
      await api.post(`/api/v1/housekeeping/tasks/${taskId}/decline`, { reason });
      showToast('Task declined. Manager has been notified.', 'info');
      setHousekeepingTasks(prev => prev.filter(t => t.id !== taskId));
      setDeclineModal({ isOpen: false, task: null, type: 'housekeeping' });
    } catch (err) {
      console.error('Failed to decline task:', err);
      showToast('Failed to decline task', 'error');
    }
  };

  const handleAcceptMT = async (taskId: number) => {
    try {
      await api.post(`/api/v1/maintenance/work-orders/${taskId}/accept-assignment`);
      showToast('Work order accepted! You can now start working.', 'success');
      setMaintenanceTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to accept work order:', err);
      showToast('Failed to accept work order', 'error');
    }
  };

  const handleDeclineMT = async (taskId: number, reason: string) => {
    try {
      await api.post(`/api/v1/maintenance/work-orders/${taskId}/decline-assignment`, { reason });
      showToast('Work order declined. Manager has been notified.', 'info');
      setMaintenanceTasks(prev => prev.filter(t => t.id !== taskId));
      setDeclineModal({ isOpen: false, task: null, type: 'maintenance' });
    } catch (err) {
      console.error('Failed to decline work order:', err);
      showToast('Failed to decline work order', 'error');
    }
  };

  const totalPending = housekeepingTasks.length + maintenanceTasks.length;
  const forcedAssignments = [...housekeepingTasks, ...maintenanceTasks].filter(t => t.force_assigned).length;

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'emergency':
      case 'high':
        return 'danger';
      case 'medium':
      case 'normal':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const renderTaskCard = (task: PendingTask, type: 'housekeeping' | 'maintenance') => {
    const isHK = type === 'housekeeping';
    const taskLabel = isHK ? task.task_type : task.category;
    const taskIdLabel = isHK ? `#${task.id}` : task.work_order_id || `#${task.id}`;

    return (
      <div
        key={`${type}-${task.id}`}
        className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md ${
          task.force_assigned ? 'border-gold-300 bg-gold-50/30' : 'border-neutral-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isHK ? 'bg-sage-100' : 'bg-terra-100'
            }`}>
              {isHK
                ? <Sparkles className="w-5 h-5 text-sage-600" />
                : <Wrench className="w-5 h-5 text-terra-600" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900">{taskIdLabel}</span>
                {task.force_assigned && (
                  <Badge variant="warning" size="sm">Force Assigned</Badge>
                )}
              </div>
              <p className="text-sm text-neutral-500 capitalize">{taskLabel || (isHK ? 'Cleaning' : 'Repair')}</p>
            </div>
          </div>
          <Badge variant={getPriorityColor(task.priority)} size="sm">
            {task.priority}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {task.room_number && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="w-4 h-4 text-neutral-400" />
              Room {task.room_number}
            </div>
          )}
          {task.issue && (
            <p className="text-sm text-neutral-600 line-clamp-2">{task.issue}</p>
          )}
          {task.force_assign_reason && (
            <div className="bg-gold-50 rounded-lg p-3 mt-2">
              <p className="text-xs text-gold-700">
                <strong>Reason:</strong> {task.force_assign_reason}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle}
            onClick={() => isHK ? handleAcceptHK(task.id) : handleAcceptMT(task.id)}
            className="flex-1"
          >
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={XCircle}
            onClick={() => setDeclineModal({ isOpen: true, task, type })}
            className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            Decline
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Pending Task Assignments</h1>
            <p className="text-neutral-600 mt-1">
              Review and accept or decline your assigned tasks
            </p>
          </div>
          <Button variant="outline" icon={RefreshCw} onClick={fetchPendingTasks}>
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ocean-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-ocean-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{totalPending}</p>
                <p className="text-sm text-neutral-500">Pending Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-sage-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{housekeepingTasks.length}</p>
                <p className="text-sm text-neutral-500">Housekeeping</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-terra-100 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-terra-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{maintenanceTasks.length}</p>
                <p className="text-sm text-neutral-500">Maintenance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Force Assigned Alert */}
        {forcedAssignments > 0 && (
          <div className="bg-gold-50 border border-gold-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-gold-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gold-900">
                  {forcedAssignments} Force-Assigned Task{forcedAssignments > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-gold-700 mt-1">
                  These tasks were assigned by management due to urgency. Please review the reason and respond promptly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-neutral-400 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && totalPending === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-sage-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">All Caught Up!</h3>
            <p className="text-neutral-600">
              You have no pending task assignments at the moment.
            </p>
          </div>
        )}

        {/* Task Lists */}
        {!isLoading && totalPending > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {housekeepingTasks.map(task => renderTaskCard(task, 'housekeeping'))}
            {maintenanceTasks.map(task => renderTaskCard(task, 'maintenance'))}
          </div>
        )}
      </div>

      {/* Decline Modal */}
      <DeclineModal
        isOpen={declineModal.isOpen}
        onClose={() => setDeclineModal({ isOpen: false, task: null, type: 'housekeeping' })}
        onConfirm={(reason) => {
          if (declineModal.task) {
            if (declineModal.type === 'housekeeping') {
              handleDeclineHK(declineModal.task.id, reason);
            } else {
              handleDeclineMT(declineModal.task.id, reason);
            }
          }
        }}
        taskId={declineModal.task?.work_order_id || declineModal.task?.id || ''}
      />
    </div>
  );
}
