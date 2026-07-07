import { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Eye,
  Wrench,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2
} from 'lucide-react';
import { useReputation } from '@/context/ReputationContext';
import type { Alert } from '@/api/services/reputation.service';
import { Button } from '../ui2/Button';
import { Drawer } from '../ui2/Drawer';
import { Textarea, Input, SelectDropdown } from '../ui2/Input';

interface AlertDetailDrawerProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (id: number) => Promise<void>;
  onResolve: (id: number, notes: string) => Promise<void>;
  onDismiss: (id: number) => Promise<void>;
  onCreateWorkOrder: (id: number, data: any) => Promise<void>;
}

function AlertDetailDrawer({
  alert,
  isOpen,
  onClose,
  onAcknowledge,
  onResolve,
  onDismiss,
  onCreateWorkOrder
}: AlertDetailDrawerProps) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [workOrderData, setWorkOrderData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    department: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!alert) return null;

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) return;
    setIsSubmitting(true);
    try {
      await onResolve(alert.id, resolutionNotes);
      setResolutionNotes('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateWorkOrder = async () => {
    if (!workOrderData.title.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateWorkOrder(alert.id, workOrderData);
      setWorkOrderData({ title: '', description: '', priority: 'medium', department: '' });
      setShowWorkOrderForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (score: number) => {
    if (score >= 8) return 'text-red-600 bg-red-100';
    if (score >= 5) return 'text-amber-600 bg-amber-100';
    return 'text-blue-600 bg-blue-100';
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <Button variant="ghost" onClick={onClose}>
        Close
      </Button>
      <div className="flex items-center gap-2">
        {alert.status === 'new' && (
          <Button
            variant="outline"
            icon={Eye}
            onClick={() => onAcknowledge(alert.id)}
          >
            Acknowledge
          </Button>
        )}
        {alert.status !== 'resolved' && alert.status !== 'dismissed' && (
          <Button
            variant="outline"
            icon={X}
            onClick={() => onDismiss(alert.id)}
          >
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Alert Details"
      subtitle={`${alert.alert_type} - ${alert.category_name || 'Unknown Category'}`}
      maxWidth="max-w-xl"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Alert Overview */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getSeverityColor(alert.severity_score)}`}>
              Severity: {alert.severity_score}/10
            </span>
            <span className="text-xs text-neutral-500">
              {new Date(alert.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Issue Count</p>
              <p className="text-lg font-semibold text-neutral-900">{alert.issue_count}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Status</p>
              <p className="text-lg font-semibold text-neutral-900 capitalize">{alert.status}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Period</p>
              <p className="text-sm text-neutral-700">
                {new Date(alert.start_date).toLocaleDateString()} - {new Date(alert.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* RCA Analysis */}
        {alert.rca_analysis && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Root Cause Analysis</h4>
            <div className="bg-amber-50 rounded-lg p-4 space-y-3">
              {alert.rca_analysis.root_cause && (
                <div>
                  <p className="text-xs font-medium text-amber-700 mb-1">Root Cause</p>
                  <p className="text-sm text-neutral-700">{alert.rca_analysis.root_cause}</p>
                </div>
              )}
              {alert.rca_analysis.recommendations && alert.rca_analysis.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-700 mb-1">Recommendations</p>
                  <ul className="text-sm text-neutral-700 space-y-1">
                    {alert.rca_analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-1">-</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resolution Form */}
        {(alert.status === 'acknowledged' || alert.status === 'new') && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Resolution</h4>
            <div className="space-y-3">
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter resolution notes..."
                rows={3}
              />
              <Button
                variant="primary"
                icon={isSubmitting ? Loader2 : CheckCircle}
                onClick={handleResolve}
                disabled={!resolutionNotes.trim() || isSubmitting}
                className={isSubmitting ? '[&>svg]:animate-spin' : ''}
              >
                Mark as Resolved
              </Button>
            </div>
          </div>
        )}

        {/* Work Order Form */}
        {alert.status !== 'resolved' && alert.status !== 'dismissed' && (
          <div>
            <button
              onClick={() => setShowWorkOrderForm(!showWorkOrderForm)}
              className="flex items-center justify-between w-full text-sm font-semibold text-neutral-900 mb-3"
            >
              <span className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Create Work Order
              </span>
              {showWorkOrderForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showWorkOrderForm && (
              <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                <Input
                  value={workOrderData.title}
                  onChange={(e) => setWorkOrderData({ ...workOrderData, title: e.target.value })}
                  placeholder="Work order title..."
                />
                <Textarea
                  value={workOrderData.description}
                  onChange={(e) => setWorkOrderData({ ...workOrderData, description: e.target.value })}
                  placeholder="Description..."
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-3">
                  <SelectDropdown
                    value={workOrderData.priority}
                    onChange={(value) => setWorkOrderData({ ...workOrderData, priority: value })}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                      { value: 'urgent', label: 'Urgent' }
                    ]}
                    size="sm"
                  />
                  <SelectDropdown
                    value={workOrderData.department}
                    onChange={(value) => setWorkOrderData({ ...workOrderData, department: value })}
                    options={[
                      { value: '', label: 'Select Department' },
                      { value: 'housekeeping', label: 'Housekeeping' },
                      { value: 'maintenance', label: 'Maintenance' },
                      { value: 'front_desk', label: 'Front Desk' },
                      { value: 'f_and_b', label: 'F&B' },
                      { value: 'management', label: 'Management' }
                    ]}
                    size="sm"
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={isSubmitting ? Loader2 : Wrench}
                  onClick={handleCreateWorkOrder}
                  disabled={!workOrderData.title.trim() || isSubmitting}
                  className={isSubmitting ? '[&>svg]:animate-spin' : ''}
                >
                  Create Work Order
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Resolution Notes (if resolved) */}
        {alert.status === 'resolved' && alert.resolution_notes && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Resolution Notes</h4>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-neutral-700">{alert.resolution_notes}</p>
              {alert.resolved_at && (
                <p className="text-xs text-green-600 mt-2">
                  Resolved on {new Date(alert.resolved_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default function AlertsPanel() {
  const {
    alerts,
    loadAlerts,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    createWorkOrderFromAlert,
    runAlertDetection,
    isLoading
  } = useReputation();

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isRunningDetection, setIsRunningDetection] = useState(false);

  useEffect(() => {
    loadAlerts(
      statusFilter !== 'all' ? statusFilter : undefined,
      typeFilter !== 'all' ? typeFilter : undefined
    );
  }, [loadAlerts, statusFilter, typeFilter]);

  const handleRunDetection = async () => {
    setIsRunningDetection(true);
    try {
      const result = await runAlertDetection();
      console.log('Alert detection result:', result);
    } finally {
      setIsRunningDetection(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Bell className="w-4 h-4 text-red-500" />;
      case 'acknowledged':
        return <Eye className="w-4 h-4 text-amber-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed':
        return <X className="w-4 h-4 text-neutral-400" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-700';
      case 'acknowledged':
        return 'bg-amber-100 text-amber-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'dismissed':
        return 'bg-neutral-100 text-neutral-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getSeverityBadge = (score: number) => {
    if (score >= 8) return { label: 'Critical', color: 'bg-red-500 text-white' };
    if (score >= 5) return { label: 'High', color: 'bg-amber-500 text-white' };
    if (score >= 3) return { label: 'Medium', color: 'bg-blue-500 text-white' };
    return { label: 'Low', color: 'bg-neutral-400 text-white' };
  };

  // Get unique alert types for filter
  const alertTypes = [...new Set(alerts.map(a => a.alert_type))];

  // Stats
  const newCount = alerts.filter(a => a.status === 'new').length;
  const acknowledgedCount = alerts.filter(a => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-[10px] p-6 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/4 mb-6" />
        <div className="space-y-3">
          <div className="h-20 bg-neutral-100 rounded-lg" />
          <div className="h-20 bg-neutral-100 rounded-lg" />
          <div className="h-20 bg-neutral-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-[10px] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{newCount}</p>
              <p className="text-xs text-neutral-500">New Alerts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{acknowledgedCount}</p>
              <p className="text-xs text-neutral-500">Acknowledged</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{resolvedCount}</p>
              <p className="text-xs text-neutral-500">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-neutral-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{alerts.length}</p>
              <p className="text-xs text-neutral-500">Total Alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-[10px] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[15px] font-semibold text-neutral-900">Alert Management</h3>
            <p className="text-[13px] text-neutral-500 mt-0.5">Monitor and respond to reputation alerts</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SelectDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'new', label: 'New' },
                  { value: 'acknowledged', label: 'Acknowledged' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'dismissed', label: 'Dismissed' }
                ]}
                size="sm"
              />
              <SelectDropdown
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: 'all', label: 'All Types' },
                  ...alertTypes.map(t => ({ value: t, label: t }))
                ]}
                size="sm"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={isRunningDetection ? Loader2 : RefreshCw}
              onClick={handleRunDetection}
              disabled={isRunningDetection}
              className={isRunningDetection ? '[&>svg]:animate-spin' : ''}
            >
              Run Detection
            </Button>
          </div>
        </div>

        {/* Alerts List */}
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const severity = getSeverityBadge(alert.severity_score);
              return (
                <div
                  key={alert.id}
                  className="bg-neutral-50 rounded-lg p-4 hover:bg-neutral-100/80 transition-colors cursor-pointer"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(alert.status)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[14px] font-semibold text-neutral-900">
                            {alert.alert_type}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${severity.color}`}>
                            {severity.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-[12px] text-neutral-600 mb-1">
                          {alert.category_name || 'Unknown Category'} - {alert.issue_count} issues detected
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {new Date(alert.start_date).toLocaleDateString()} - {new Date(alert.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.status === 'new' && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            acknowledgeAlert(alert.id);
                          }}
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlert(alert);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-[14px] font-medium text-neutral-500">No alerts found</p>
            <p className="text-[12px]">Run detection to scan for new issues</p>
          </div>
        )}
      </div>

      {/* Alert Detail Drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={acknowledgeAlert}
        onResolve={resolveAlert}
        onDismiss={dismissAlert}
        onCreateWorkOrder={createWorkOrderFromAlert}
      />
    </div>
  );
}
