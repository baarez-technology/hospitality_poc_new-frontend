import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, XCircle } from 'lucide-react';
import { CANCELLATION_REASONS } from '@/utils/admin/bookings';
import { Button } from '../../ui2/Button';

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isCancelling,
}) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setNotes('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) return;
    onConfirm({
      bookingId: booking?.id,
      reason,
      notes: notes.trim(),
    });
  };

  const isFormValid = reason !== '';

  if (!isOpen || !booking) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[70] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Cancel Booking
              </h2>
              <p className="text-sm text-neutral-600">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Booking Summary */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-500">Booking ID</span>
              <span className="text-sm font-mono font-semibold text-neutral-900">{booking.id}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-500">Guest</span>
              <span className="text-sm font-medium text-neutral-900">{booking.guest}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Room</span>
              <span className="text-sm text-neutral-700">{booking.room || 'Not assigned'}</span>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Cancellation Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:bg-white transition-all duration-200 cursor-pointer"
              required
            >
              <option value="">Select a reason</option>
              {CANCELLATION_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any additional details about the cancellation..."
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:bg-white transition-all duration-200 resize-none"
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Cancelling this booking will release the room assignment and notify the guest.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Keep Booking
            </Button>
            <Button variant="danger" type="submit" disabled={!isFormValid || isCancelling} icon={XCircle} loading={isCancelling} className="flex-1">
              {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
