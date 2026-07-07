/**
 * BlockRoomModal Component
 * Block room form with OOS/OOO/Other status selection
 * Glimmora Design System v5.0
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, Wrench, HardHat, MessageSquare } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../../ui2/Modal';
import { Button } from '../../ui2/Button';
import { SimpleDropdown } from '../../ui/Select';
import { DatePicker } from '../../ui2/DatePicker';
import { useToast } from '../../../contexts/ToastContext';

const STATUS_TYPES = [
  {
    key: 'out_of_service',
    label: 'Out of Service',
    shortLabel: 'OOS',
    description: 'Minor issue, temporary. Housekeeping.',
    icon: Wrench,
    color: 'rose',
    dotClass: 'bg-rose-500',
    activeClass: 'border-rose-300 bg-rose-50',
  },
  {
    key: 'out_of_order',
    label: 'Out of Order',
    shortLabel: 'OOO',
    description: 'Major issue, long term. Engineering.',
    icon: HardHat,
    color: 'gray',
    dotClass: 'bg-gray-500',
    activeClass: 'border-gray-400 bg-gray-50',
  },
  {
    key: 'other',
    label: 'Other',
    shortLabel: 'Other',
    description: 'Custom reason required.',
    icon: MessageSquare,
    color: 'amber',
    dotClass: 'bg-amber-500',
    activeClass: 'border-amber-300 bg-amber-50',
  },
] as const;

const OOS_REASONS = [
  'Deep cleaning',
  'Minor maintenance',
  'Painting touch-up',
  'Pest control',
  'Waiting for inspection',
];

const OOO_REASONS = [
  'AC not working',
  'Plumbing leakage',
  'Electrical failure',
  'Major repair work',
  'Furniture replacement',
  'Safety issue',
];

export default function BlockRoomModal({ room, isOpen, onClose, onBlock }) {
  const [statusType, setStatusType] = useState<string>('out_of_service');
  const [reason, setReason] = useState('');
  const [until, setUntil] = useState('');
  const [comment, setComment] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setStatusType('out_of_service');
      setReason('');
      setUntil('');
      setComment('');
    }
  }, [isOpen]);

  if (!room) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (statusType === 'other') {
      if (!comment.trim()) {
        toast.warning('Please provide a reason when selecting "Other"');
        return;
      }
      // For "Other", use comment as the reason and default to OOS status
      onBlock(room.id, comment.trim(), until, 'out_of_service');
    } else {
      if (!reason) {
        toast.warning('Please select a reason');
        return;
      }
      const fullReason = comment.trim() ? `${reason} — ${comment.trim()}` : reason;
      onBlock(room.id, fullReason, until, statusType);
    }
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];
  const reasons = statusType === 'out_of_order' ? OOO_REASONS : OOS_REASONS;
  const isOther = statusType === 'other';

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>Block Room</ModalTitle>
        <ModalDescription>Room {room.roomNumber} • {room.type}</ModalDescription>
      </ModalHeader>

      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Type Selector */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Block Type
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = statusType === type.key;
                return (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => {
                      setStatusType(type.key);
                      setReason('');
                    }}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      isActive
                        ? type.activeClass
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1.5 ${isActive ? 'text-neutral-700' : 'text-neutral-400'}`} />
                    <span className="block text-[12px] font-semibold text-neutral-800">{type.shortLabel}</span>
                    <span className="block text-[10px] text-neutral-500 mt-0.5 leading-tight">{type.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason Selection (not shown for "Other") */}
          {!isOther && (
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Reason
              </label>
              <SimpleDropdown
                value={reason}
                onChange={(val) => setReason(val)}
                options={reasons.map((r) => ({ value: r, label: r }))}
                placeholder="Select a reason"
              />
            </div>
          )}

          {/* Comment / Notes */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
              {isOther ? (
                <>Reason <span className="text-rose-500">*</span></>
              ) : (
                <>Additional Notes <span className="text-neutral-400">(optional)</span></>
              )}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isOther ? 'Please provide a reason for blocking this room...' : 'Any additional notes...'}
              rows={2}
              required={isOther}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#FAF8F6] border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-[#A57865] focus:ring-2 focus:ring-[#A57865]/20 focus:outline-none transition-all resize-none"
            />
            {isOther && (
              <p className="text-[11px] text-amber-600 mt-1.5 font-medium">
                A reason is required when selecting "Other"
              </p>
            )}
          </div>

          {/* Blocked Until */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
              Blocked Until <span className="text-neutral-400">(optional)</span>
            </label>
            <DatePicker
              value={until}
              onChange={(val) => setUntil(val)}
              placeholder="Select date"
              minDate={today}
              className="w-full"
            />
            <p className="text-[11px] text-neutral-400 mt-1.5">
              Leave blank if duration is unknown
            </p>
          </div>

          {/* Warning */}
          <div className={`p-4 rounded-lg border ${
            statusType === 'out_of_order'
              ? 'bg-gray-50 border-gray-200'
              : 'bg-rose-50 border-rose-100'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                statusType === 'out_of_order' ? 'text-gray-500' : 'text-rose-500'
              }`} />
              <div>
                <p className={`text-[13px] font-semibold mb-2 ${
                  statusType === 'out_of_order' ? 'text-gray-700' : 'text-rose-700'
                }`}>Important</p>
                <p className={`text-[13px] mb-2 ${
                  statusType === 'out_of_order' ? 'text-gray-600' : 'text-rose-600'
                }`}>
                  Blocking this room will:
                </p>
                <ul className={`text-[13px] ml-4 list-disc space-y-1 ${
                  statusType === 'out_of_order' ? 'text-gray-500' : 'text-rose-500'
                }`}>
                  <li>Set status to "{statusType === 'out_of_order' ? 'Out of Order' : 'Out of Service'}"</li>
                  <li>Remove any assigned guests</li>
                  <li>Make room unavailable for bookings</li>
                  {statusType === 'out_of_order' && (
                    <li className="font-medium">Significantly impact room inventory</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </form>
      </ModalContent>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} className="px-5 py-2 text-[13px] font-semibold">
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleSubmit}
          className="px-5 py-2 text-[13px] font-semibold"
        >
          Block Room
        </Button>
      </ModalFooter>
    </Modal>
  );
}
