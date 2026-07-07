/**
 * WODrawer Component
 * Side drawer for viewing work order details - Glimmora Design System v5.0
 * Pattern matching Housekeeping/Staff detail drawers
 */

import {
  Play,
  CheckCircle,
  Pause,
  RotateCcw,
  Edit2,
  Trash2,
  Clock,
  User,
  MapPin,
  Tag,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';
import { Badge, StatusBadge } from '../../ui2/Badge';
import { PRIORITY_CONFIG, STATUS_CONFIG, WO_CATEGORIES, formatDateTime } from '@/utils/admin/maintenance';

// Drawer Select for technician assignment
function DrawerSelect({ label, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
        {label}
      </h4>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-10 px-4 rounded-lg text-[13px] bg-white border transition-all flex items-center justify-between ${
            isOpen
              ? 'border-terra-400 ring-2 ring-terra-500/10'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <span className={selectedOption ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <div className="absolute z-[70] w-full mt-1.5 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                    value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                  }`}
                >
                  {option.label}
                  {value === option.value && <Check className="w-4 h-4 text-terra-500" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function WODrawer({
  workOrder,
  technicians,
  onClose,
  onEdit,
  onDelete,
  onStartWO,
  onCompleteWO,
  onHoldWO,
  onReopenWO,
  onAssignTech,
  onClearOOO
}) {
  if (!workOrder) return null;

  const priorityConfig = PRIORITY_CONFIG[workOrder.priority] || PRIORITY_CONFIG.low;
  const statusConfig = STATUS_CONFIG[workOrder.status] || STATUS_CONFIG.open;
  const categoryLabel = WO_CATEGORIES.find(c => c.value === workOrder.category)?.label || workOrder.category;

  // Map priority to Badge variant
  const getPriorityVariant = (priority) => {
    const variantMap = {
      'high': 'danger',
      'medium': 'warning',
      'low': 'success'
    };
    return variantMap[priority] || 'neutral';
  };

  // Map status to StatusBadge status
  const getStatusBadgeStatus = (status) => {
    const statusMap = {
      'open': 'pending',
      'in_progress': 'cleaning',
      'on_hold': 'maintenance',
      'completed': 'inspected',
      'cancelled': 'cancelled'
    };
    return statusMap[status] || status;
  };

  const techOptions = [
    { value: '', label: 'Select technician...' },
    ...technicians
      .filter(t => t.status === 'active' || t.status === 'on_duty')
      .map(tech => ({
        value: tech.id,
        label: `${tech.name} (${tech.specialty})`
      }))
  ];

  // Custom header
  const renderHeader = () => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">{workOrder.id}</h2>
        {workOrder.isOOO && (
          <Badge variant="danger-solid" size="sm">OOO</Badge>
        )}
      </div>
      <p className="text-[13px] text-neutral-500 mt-1">Work Order Details</p>
    </div>
  );

  // Footer with action buttons
  const renderFooter = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status Actions */}
      {workOrder.status === 'open' && (
        <Button
          variant="primary"
          onClick={() => onStartWO(workOrder.id)}
          className="flex-1 min-w-[100px] h-9 px-3 text-[13px] font-semibold flex items-center justify-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5" />
          Start
        </Button>
      )}

      {(workOrder.status === 'open' || workOrder.status === 'in_progress') && (
        <Button
          variant="primary"
          onClick={() => onCompleteWO(workOrder.id)}
          className="flex-1 min-w-[100px] h-9 px-3 text-[13px] font-semibold flex items-center justify-center gap-1.5 bg-sage-500 hover:bg-sage-600"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Complete
        </Button>
      )}

      {workOrder.status === 'in_progress' && (
        <Button
          variant="outline"
          onClick={() => onHoldWO(workOrder.id)}
          className="flex-1 min-w-[100px] h-9 px-3 text-[13px] font-semibold flex items-center justify-center gap-1.5 text-gold-600 border-gold-300 hover:bg-gold-50"
        >
          <Pause className="w-3.5 h-3.5" />
          Hold
        </Button>
      )}

      {(workOrder.status === 'on_hold' || workOrder.status === 'completed') && (
        <Button
          variant="outline"
          onClick={() => onReopenWO(workOrder.id)}
          className="flex-1 min-w-[100px] h-9 px-3 text-[13px] font-semibold flex items-center justify-center gap-1.5 text-terra-600 border-terra-300 hover:bg-terra-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reopen
        </Button>
      )}

      {workOrder.isOOO && workOrder.status !== 'completed' && (
        <Button
          variant="outline"
          onClick={() => onClearOOO(workOrder.roomNumber)}
          className="flex-1 min-w-[100px] h-9 px-3 text-[13px] font-semibold flex items-center justify-center gap-1.5 text-rose-600 border-rose-300 hover:bg-rose-50"
        >
          <XCircle className="w-3.5 h-3.5" />
          Clear OOO
        </Button>
      )}

      <Button
        variant="outline"
        onClick={() => onEdit(workOrder)}
        className="h-9 px-3 text-[13px] font-semibold flex items-center justify-center gap-1.5"
      >
        <Edit2 className="w-3.5 h-3.5" />
        Edit
      </Button>

      <Button
        variant="outline"
        onClick={() => onDelete(workOrder.id)}
        className="h-9 px-3 text-[13px] font-semibold flex items-center justify-center gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={!!workOrder}
      onClose={onClose}
      header={renderHeader()}
      footer={renderFooter()}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={getPriorityVariant(workOrder.priority)}
            size="sm"
            icon={workOrder.priority === 'high' ? AlertTriangle : undefined}
          >
            {priorityConfig.label} Priority
          </Badge>
          <StatusBadge status={getStatusBadgeStatus(workOrder.status)} size="sm" />
        </div>

        {/* Issue Details */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Issue Details
          </h4>
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
            <p className="text-[14px] font-semibold text-neutral-900">{workOrder.issue}</p>
            {workOrder.description && (
              <p className="text-[13px] text-neutral-600 mt-2 leading-relaxed">{workOrder.description}</p>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-terra-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-terra-600" />
              </div>
              <div>
                <p className="text-[11px] text-neutral-500 uppercase tracking-wide">Room</p>
                <p className="text-[13px] font-semibold text-neutral-900">
                  {workOrder.roomNumber || 'Common Area'}
                </p>
                {workOrder.roomType && (
                  <p className="text-[11px] text-neutral-400">{workOrder.roomType}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
                <Tag className="w-4 h-4 text-sage-600" />
              </div>
              <div>
                <p className="text-[11px] text-neutral-500 uppercase tracking-wide">Category</p>
                <p className="text-[13px] font-semibold text-neutral-900">{categoryLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-terra-100 flex items-center justify-center">
                <User className="w-4 h-4 text-terra-600" />
              </div>
              <div>
                <p className="text-[11px] text-neutral-500 uppercase tracking-wide">Assigned To</p>
                {workOrder.technicianName ? (
                  <p className="text-[13px] font-semibold text-neutral-900">{workOrder.technicianName}</p>
                ) : (
                  <p className="text-[13px] text-neutral-400 italic">Unassigned</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-neutral-500 uppercase tracking-wide">Created</p>
                <p className="text-[13px] font-semibold text-neutral-900">{formatDateTime(workOrder.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {(workOrder.estimatedCompletion || workOrder.completedAt) && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Timeline
            </h4>
            <div className="space-y-2">
              {workOrder.estimatedCompletion && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-blue-600 font-medium uppercase tracking-wide">Est. Completion</p>
                    <p className="text-[13px] font-semibold text-neutral-900">{formatDateTime(workOrder.estimatedCompletion)}</p>
                  </div>
                </div>
              )}

              {workOrder.completedAt && (
                <div className="flex items-center gap-3 p-3 bg-sage-50 rounded-lg border border-sage-100">
                  <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-[11px] text-sage-600 font-medium uppercase tracking-wide">Completed</p>
                    <p className="text-[13px] font-semibold text-neutral-900">{formatDateTime(workOrder.completedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {workOrder.notes && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Notes
            </h4>
            <div className="p-4 bg-gold-50 rounded-lg border border-gold-100">
              <p className="text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">{workOrder.notes}</p>
            </div>
          </div>
        )}

        {/* Activity Log */}
        {workOrder.activityLog && workOrder.activityLog.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Activity Log
            </h4>
            <div className="bg-neutral-50 rounded-lg border border-neutral-100 p-4 space-y-3">
              {workOrder.activityLog.slice().reverse().map((log, index) => (
                <div
                  key={log.id || index}
                  className="relative pl-4 border-l-2 border-neutral-200"
                >
                  <div className="absolute -left-1 top-1.5 w-2 h-2 rounded-full bg-terra-400" />
                  <p className="text-[13px] text-neutral-900">{log.action}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-neutral-500">{formatDateTime(log.timestamp)}</span>
                    <span className="text-[11px] text-neutral-300">•</span>
                    <span className="text-[11px] text-neutral-500">{log.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assign Technician */}
        {!workOrder.technicianName && (
          <DrawerSelect
            label="Assign Technician"
            value=""
            onChange={(techId) => {
              if (techId) {
                onAssignTech(workOrder.id, techId);
              }
            }}
            options={techOptions}
            placeholder="Select technician..."
          />
        )}
      </div>
    </Drawer>
  );
}
