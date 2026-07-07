/**
 * RequestCleaningModal Component
 * Quick cleaning request drawer for occupied rooms
 * Supports optional staff assignment with notes/priority
 * Glimmora Design System v5.0
 */

import { useState, useEffect } from 'react';
import { SprayCan, ChevronDown, Check, User } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { housekeepingService } from '../../api/services/housekeeping.service';
import { staffService } from '../../api/services/staff.service';

interface RequestCleaningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomId: number;
  roomNumber: string;
  guestName?: string;
}

interface StaffOption {
  id: number;
  name: string;
  status: string;
}

const TASK_TYPES = [
  { value: 'cleaning', label: 'Regular Cleaning' },
  { value: 'turndown', label: 'Turndown Service' },
  { value: 'mid_stay', label: 'Mid-Stay Cleaning' },
  { value: 'deep_clean', label: 'Deep Clean' },
];

const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

// Inline dropdown matching AddCleaningTaskModal pattern
function StaffSelect({ value, onChange, options, isLoading }: {
  value: number | null;
  onChange: (id: number | null) => void;
  options: StaffOption[];
  isLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(s => s.id === value);

  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
        Assign to Staff <span className="text-neutral-400 normal-case font-normal">(optional)</span>
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
          <span className={selected ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>
            {isLoading ? 'Loading staff...' : selected ? selected.name : 'No assignment (unassigned task)'}
          </span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <div className="absolute z-[70] w-full mt-1.5 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {/* Unassigned option */}
              <button
                type="button"
                onClick={() => { onChange(null); setIsOpen(false); }}
                className={`w-full px-4 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                  value === null ? 'bg-terra-50 text-terra-700' : 'text-neutral-500'
                }`}
              >
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  No assignment (create task only)
                </span>
                {value === null && <Check className="w-4 h-4 text-terra-500" />}
              </button>

              {options.length === 0 && !isLoading ? (
                <div className="px-4 py-3 text-[13px] text-neutral-500">No housekeeping staff found</div>
              ) : (
                options.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { onChange(s.id); setIsOpen(false); }}
                    className={`w-full px-4 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                      value === s.id ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                        s.status === 'active' || s.status === 'on_shift' ? 'bg-sage-500' : 'bg-neutral-400'
                      }`}>
                        {s.name.charAt(0)}
                      </div>
                      {s.name}
                      {s.status !== 'active' && s.status !== 'on_shift' && (
                        <span className="text-[10px] text-neutral-400 ml-1">({s.status})</span>
                      )}
                    </span>
                    {value === s.id && <Check className="w-4 h-4 text-terra-500" />}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RequestCleaningModal({
  isOpen,
  onClose,
  onSuccess,
  roomId,
  roomNumber,
  guestName,
}: RequestCleaningModalProps) {
  const [taskType, setTaskType] = useState('cleaning');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [staffId, setStaffId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Staff list (fetched when modal opens)
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // Fetch housekeeping staff when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setStaffLoading(true);

    const fetchStaff = async () => {
      try {
        let data = await staffService.list({ department: 'housekeeping' });
        if (!Array.isArray(data) || data.length === 0) {
          const all = await staffService.list();
          if (Array.isArray(all)) {
            const hkRoles = ['housekeeping', 'housekeeper', 'room_attendant', 'laundry_attendant'];
            data = all.filter((s: any) =>
              hkRoles.includes(s.role?.toLowerCase()) ||
              s.department?.toLowerCase() === 'housekeeping'
            );
          }
        }
        if (!cancelled) {
          setStaffList(
            (Array.isArray(data) ? data : []).map((s: any) => ({
              id: s.id,
              name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
              status: s.status || 'active',
            }))
          );
        }
      } catch {
        if (!cancelled) setStaffList([]);
      } finally {
        if (!cancelled) setStaffLoading(false);
      }
    };

    fetchStaff();
    return () => { cancelled = true; };
  }, [isOpen]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setTaskType('cleaning');
      setPriority('normal');
      setNotes('');
      setStaffId(null);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      // Step 1: Create the housekeeping task
      const result = await housekeepingService.createTask({
        room_id: roomId,
        task_type: taskType,
        priority,
        notes: notes.trim() || undefined,
      });

      // Step 2: Assign to staff if selected
      if (staffId && result?.id) {
        try {
          await housekeepingService.assignTask(result.id, {
            staff_id: staffId,
            priority,
            notes: notes.trim() || undefined,
          });
        } catch {
          // Task was created but assignment failed - still count as partial success
          onSuccess();
          onClose();
          return;
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create cleaning request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
        <SprayCan className="w-5 h-5 text-sage-600" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">Request Cleaning</h2>
        <p className="text-[13px] text-neutral-500 mt-0.5">
          Room {roomNumber}{guestName ? ` — ${guestName}` : ''}
        </p>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button variant="outline-neutral" size="md" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button variant="primary" size="md" onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
        {staffId ? 'Create & Assign' : 'Submit Request'}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      header={renderHeader()}
      footer={renderFooter()}
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
            {error}
          </div>
        )}

        {/* Task Type */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Task Type
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {TASK_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setTaskType(type.value)}
                className={`px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all text-center ${
                  taskType === type.value
                    ? 'bg-terra-500 text-white'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Priority
          </h4>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`flex-1 h-10 px-3 rounded-lg text-[13px] font-semibold transition-all ${
                  priority === p.value
                    ? p.value === 'urgent'
                      ? 'bg-rose-600 text-white'
                      : p.value === 'high'
                        ? 'bg-rose-500 text-white'
                        : 'bg-neutral-700 text-white'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assign to Staff */}
        <StaffSelect
          value={staffId}
          onChange={setStaffId}
          options={staffList}
          isLoading={staffLoading}
        />

        {/* Notes */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Notes <span className="text-neutral-400 normal-case font-normal">(optional)</span>
          </h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Guest in Room 305 requested cleaning today..."
            rows={3}
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all resize-none hover:border-neutral-300"
          />
        </div>
      </div>
    </Drawer>
  );
}
