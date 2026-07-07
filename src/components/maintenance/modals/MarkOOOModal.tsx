/**
 * MarkOOOModal Component
 * Modal for marking a work order as Out of Order - Glimmora Design System v5.0
 * Includes affected bookings warning and estimated completion
 */

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Check,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Loader2,
} from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';
import { Badge } from '../../ui2/Badge';
import DatePicker from '../../ui2/DatePicker';

// OOO Categories
const OOO_CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing', defaultDays: 2 },
  { value: 'electrical', label: 'Electrical', defaultDays: 1 },
  { value: 'hvac', label: 'HVAC', defaultDays: 3 },
  { value: 'renovation', label: 'Renovation', defaultDays: 14 },
  { value: 'damage', label: 'Damage Repair', defaultDays: 5 },
  { value: 'pest_control', label: 'Pest Control', defaultDays: 2 },
  { value: 'safety', label: 'Safety Issue', defaultDays: 1 },
  { value: 'other', label: 'Other', defaultDays: 3 },
];

interface AffectedBooking {
  booking_id: number;
  confirmation_code: string;
  guest_name: string;
  arrival_date: string;
  departure_date: string;
  room_type: string;
  status: string;
}

interface MarkOOOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OOOFormData) => Promise<{ success: boolean; affected_bookings?: AffectedBooking[] }>;
  workOrder: {
    id: string | number;
    roomNumber: string;
    issue: string;
    isOOO?: boolean;
  } | null;
}

interface OOOFormData {
  is_out_of_order: boolean;
  estimated_completion: string;
  ooo_category: string;
  notes: string;
}

// Custom Select Component
function DrawerSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
        {label} {required && <span className="text-rose-500">*</span>}
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

export default function MarkOOOModal({ isOpen, onClose, onSubmit, workOrder }: MarkOOOModalProps) {
  const [formData, setFormData] = useState<OOOFormData>({
    is_out_of_order: true,
    estimated_completion: '',
    ooo_category: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [affectedBookings, setAffectedBookings] = useState<AffectedBooking[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        is_out_of_order: true,
        estimated_completion: '',
        ooo_category: '',
        notes: '',
      });
      setShowConfirmation(false);
      setAffectedBookings([]);
    }
  }, [isOpen]);

  // Auto-set estimated completion when category changes
  useEffect(() => {
    if (formData.ooo_category) {
      const category = OOO_CATEGORIES.find(c => c.value === formData.ooo_category);
      if (category) {
        const date = new Date();
        date.setDate(date.getDate() + category.defaultDays);
        setFormData(prev => ({
          ...prev,
          estimated_completion: date.toISOString().split('T')[0],
        }));
      }
    }
  }, [formData.ooo_category]);

  const handleSubmit = async () => {
    if (!formData.ooo_category || !formData.estimated_completion) return;

    setIsSubmitting(true);
    try {
      const result = await onSubmit(formData);
      if (result.success) {
        if (result.affected_bookings && result.affected_bookings.length > 0) {
          setAffectedBookings(result.affected_bookings);
          setShowConfirmation(true);
        } else {
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to mark OOO:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmWithAffected = () => {
    onClose();
  };

  if (!workOrder) return null;

  // Confirmation view with affected bookings
  if (showConfirmation && affectedBookings.length > 0) {
    return (
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="OOO Block Created"
        subtitle={`Room ${workOrder.roomNumber}`}
        footer={
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={handleConfirmWithAffected}>
              Acknowledge & Close
            </Button>
          </div>
        }
      >
        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-emerald-900">Room Block Created</h3>
                <p className="text-[12px] text-emerald-700 mt-1">
                  Room {workOrder.roomNumber} has been marked as Out of Order until{' '}
                  {new Date(formData.estimated_completion).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </div>

          {/* Affected Bookings Warning */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-amber-900">
                  {affectedBookings.length} Affected Booking{affectedBookings.length > 1 ? 's' : ''}
                </h3>
                <p className="text-[12px] text-amber-700 mt-1">
                  The following reservations may need room reassignment or guest notification.
                </p>
              </div>
            </div>
          </div>

          {/* Affected Bookings List */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
              Affected Reservations
            </h4>
            <div className="rounded-lg border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
              {affectedBookings.map((booking) => (
                <div key={booking.booking_id} className="p-4 bg-white hover:bg-neutral-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-neutral-900">
                          {booking.guest_name}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {booking.confirmation_code}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-neutral-500 mt-1">
                        {new Date(booking.arrival_date).toLocaleDateString()} -{' '}
                        {new Date(booking.departure_date).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {booking.room_type}
                      </p>
                    </div>
                    <Badge
                      variant={booking.status === 'confirmed' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Reminder */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-[12px] text-blue-700">
                <p className="font-medium">Recommended Actions:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Review affected bookings in the Reservations module</li>
                  <li>Contact guests if room reassignment is needed</li>
                  <li>Consider upgrades for affected guests</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    );
  }

  // Main form view
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={workOrder.isOOO ? 'Update OOO Status' : 'Mark as Out of Order'}
      subtitle={`Room ${workOrder.roomNumber} - ${workOrder.issue}`}
      footer={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.ooo_category || !formData.estimated_completion || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Mark as OOO'
            )}
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-amber-900">Out of Order Notice</h3>
              <p className="text-[12px] text-amber-700 mt-1">
                Marking this room as OOO will automatically create a room block,
                preventing new bookings for this room until the estimated completion date.
                Any existing overlapping bookings will be flagged for review.
              </p>
            </div>
          </div>
        </div>

        {/* OOO Category */}
        <DrawerSelect
          label="Issue Category"
          value={formData.ooo_category}
          onChange={(value) => setFormData(prev => ({ ...prev, ooo_category: value }))}
          options={OOO_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
          placeholder="Select category..."
          required
        />

        {/* Estimated Completion */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Estimated Completion <span className="text-rose-500">*</span>
          </h4>
          <DatePicker
            value={formData.estimated_completion}
            onChange={(date) => setFormData(prev => ({ ...prev, estimated_completion: date }))}
            minDate={new Date().toISOString().split('T')[0]}
          />
          {formData.ooo_category && (
            <p className="text-[11px] text-neutral-500 mt-2">
              Default duration for {OOO_CATEGORIES.find(c => c.value === formData.ooo_category)?.label}:{' '}
              {OOO_CATEGORIES.find(c => c.value === formData.ooo_category)?.defaultDays} days
            </p>
          )}
        </div>

        {/* Additional Notes */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Notes
          </h4>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes about the OOO status..."
            className="w-full h-24 px-4 py-3 rounded-lg border border-neutral-200 text-[13px] resize-none focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
          />
        </div>

        {/* Summary */}
        {formData.ooo_category && formData.estimated_completion && (
          <div className="bg-neutral-50 rounded-lg p-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Summary
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-500">Room</span>
                <span className="text-[12px] font-medium text-neutral-900">{workOrder.roomNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-500">Category</span>
                <span className="text-[12px] font-medium text-neutral-900">
                  {OOO_CATEGORIES.find(c => c.value === formData.ooo_category)?.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-500">Block Period</span>
                <span className="text-[12px] font-medium text-neutral-900">
                  Today - {new Date(formData.estimated_completion).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-500">Duration</span>
                <span className="text-[12px] font-medium text-neutral-900">
                  {Math.ceil((new Date(formData.estimated_completion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
