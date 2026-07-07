import { useState, useEffect } from 'react';
import { X, AlertTriangle, User, CheckCircle } from 'lucide-react';
import { Button } from '../ui2/Button';
import { Badge } from '../ui2/Badge';

interface StaffMember {
  id: number;
  name: string;
  specialty?: string;
  active_tasks?: number;
  is_available?: boolean;
}

interface ForceAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForceAssign: (staffId: number, reason: string, requireAcceptance: boolean) => void;
  taskType: 'housekeeping' | 'maintenance';
  taskId: number | string;
  taskDescription?: string;
  busyStaff: StaffMember[];
  availableStaff?: StaffMember[];
}

export function ForceAssignModal({
  isOpen,
  onClose,
  onForceAssign,
  taskType,
  taskId,
  taskDescription,
  busyStaff,
  availableStaff = []
}: ForceAssignModalProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [requireAcceptance, setRequireAcceptance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedStaffId(null);
      setReason('');
      setRequireAcceptance(true);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allStaff = [...availableStaff, ...busyStaff];
  const selectedStaff = allStaff.find(s => s.id === selectedStaffId);
  const isSelectedBusy = busyStaff.some(s => s.id === selectedStaffId);

  const handleSubmit = async () => {
    if (!selectedStaffId || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onForceAssign(selectedStaffId, reason, requireAcceptance);
      onClose();
    } catch (err) {
      console.error('Force assign failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const predefinedReasons = [
    'Emergency repair required',
    'VIP guest request - urgent',
    'Health & safety issue',
    'Guest complaint - immediate attention',
    'Management directive',
    'Time-sensitive checkout/check-in'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-200 bg-gold-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Force Assign Task</h2>
              <p className="text-sm text-neutral-500">Override availability limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Task Info */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
              {taskType === 'housekeeping' ? 'Housekeeping Task' : 'Work Order'}
            </p>
            <p className="font-semibold text-neutral-900">#{taskId}</p>
            {taskDescription && (
              <p className="text-sm text-neutral-600 mt-1">{taskDescription}</p>
            )}
          </div>

          {/* All Staff Busy Warning */}
          {availableStaff.length === 0 && busyStaff.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-medium text-rose-900">All Staff Currently Busy</p>
                  <p className="text-sm text-rose-700 mt-1">
                    All {busyStaff.length} {taskType === 'housekeeping' ? 'housekeepers' : 'technicians'} are occupied.
                    Force-assigning will add to their workload.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Select Staff Member *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-xl p-2">
              {allStaff.map(staff => {
                const isBusy = busyStaff.some(s => s.id === staff.id);
                const isSelected = selectedStaffId === staff.id;

                return (
                  <button
                    key={staff.id}
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-terra-50 border-2 border-terra-400'
                        : 'bg-white border border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                        isBusy ? 'bg-gold-100 text-gold-700' : 'bg-sage-100 text-sage-700'
                      }`}>
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-neutral-900">{staff.name}</p>
                        {staff.specialty && (
                          <p className="text-xs text-neutral-500">{staff.specialty}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isBusy ? (
                        <Badge variant="warning" size="sm">
                          {staff.active_tasks || 0} tasks
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">Available</Badge>
                      )}
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-terra-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Reason for Force Assignment *
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {predefinedReasons.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    reason === r
                      ? 'bg-terra-50 border-terra-300 text-terra-700'
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
              rows={2}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
            />
          </div>

          {/* Require Acceptance */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={requireAcceptance}
              onChange={(e) => setRequireAcceptance(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-terra-600 focus:ring-terra-500"
            />
            <div>
              <p className="font-medium text-neutral-900">Require staff acceptance</p>
              <p className="text-sm text-neutral-500">
                Staff must accept or decline the assignment. If unchecked, task is auto-accepted.
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-3 flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedStaffId || !reason.trim() || isSubmitting}
            className="bg-gold-600 hover:bg-gold-700"
          >
            {isSubmitting ? 'Assigning...' : 'Force Assign'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ForceAssignModal;
