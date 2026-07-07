/**
 * CancelBookingModal Component
 * Cancel booking confirmation - Glimmora Design System v5.0
 * Center modal for confirmation actions
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { CANCELLATION_REASONS } from '../../utils/bookings';
import { bookingService } from '../../api/services/booking.service';
import { Modal } from '../ui2/Modal';
import { Button } from '../ui2/Button';

// Custom Select Component matching CMS pattern
function CustomSelect({ value, onChange, options, placeholder = 'Select...', required = false, label = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[13px] font-medium text-neutral-700">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 text-left flex items-center justify-between focus:outline-none ${
            isOpen
              ? 'border-rose-400 ring-2 ring-rose-500/10'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <svg className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[80]" onClick={() => setIsOpen(false)} />
            <div className="absolute z-[90] w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors ${
                    value === option.value ? 'bg-rose-50 text-rose-700' : 'text-neutral-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isCancelling,
}) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [aiContext, setAiContext] = useState('');
  const [aiTone, setAiTone] = useState<'professional' | 'friendly' | 'formal' | 'casual'>('professional');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setNotes('');
      setAiContext('');
      setDraftError(null);
    }
  }, [isOpen]);

  // Handle AI Draft generation
  const handleAIDraft = async () => {
    if (!booking?.id || !reason) {
      setDraftError('Please select a cancellation reason first');
      return;
    }

    setIsDrafting(true);
    setDraftError(null);

    try {
      const selectedReason = CANCELLATION_REASONS.find(r => r.value === reason);
      const response = await bookingService.draftCancellation(booking.id, {
        reason: selectedReason?.label || reason,
        context: aiContext || undefined,
        tone: aiTone,
      });

      if (response.success && response.notes) {
        setNotes(response.notes);
      }
    } catch (error: any) {
      console.error('AI draft error:', error);
      setDraftError('Failed to generate AI draft. Please try again.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!reason) return;
    onConfirm({
      bookingId: booking?.id,
      reason,
      notes: notes.trim(),
    });
  };

  const isFormValid = reason !== '';

  if (!booking) return null;

  const reasonOptions = CANCELLATION_REASONS.map(r => ({
    value: r.value,
    label: r.label,
  }));

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      showClose={true}
    >
      {/* Header */}
      <div className="bg-rose-50 border-b border-rose-100 px-6 py-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
              Cancel Booking
            </h2>
            <p className="text-[13px] text-neutral-500">
              This action cannot be undone
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto min-h-0">
        {/* Booking Summary */}
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-neutral-500">Booking ID</span>
            <span className="text-[13px] font-mono font-semibold text-neutral-900">{booking.id}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-neutral-500">Guest</span>
            <span className="text-[13px] font-medium text-neutral-900">{booking.guest}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-500">Room</span>
            <span className="text-[13px] text-neutral-700">{booking.room || 'Not assigned'}</span>
          </div>
        </div>

        {/* Cancellation Reason */}
        <CustomSelect
          label="Cancellation Reason"
          required
          options={reasonOptions}
          value={reason}
          onChange={setReason}
          placeholder="Select a reason"
        />

        {/* AI Draft Section */}
        <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-lg p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <h3 className="font-semibold text-[13px] text-neutral-900">AI Draft Assistant</h3>
          </div>
          <div className="space-y-3">
            <textarea
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              placeholder="Describe any additional context..."
              rows={2}
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-400 text-[13px] resize-none"
            />
            <div className="flex items-center gap-3">
              <div className="w-[150px] flex-shrink-0">
                <CustomSelect
                  value={aiTone}
                  onChange={(val) => setAiTone(val as typeof aiTone)}
                  options={[
                    { value: 'professional', label: 'Professional' },
                    { value: 'friendly', label: 'Friendly' },
                    { value: 'formal', label: 'Formal' },
                    { value: 'casual', label: 'Casual' },
                  ]}
                  placeholder="Tone"
                />
              </div>
              <button
                type="button"
                onClick={handleAIDraft}
                disabled={isDrafting || !reason}
                className="h-9 px-4 text-[13px] font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {isDrafting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Drafting...
                  </>
                ) : (
                  'Generate Notes'
                )}
              </button>
            </div>
            {draftError && (
              <p className="text-[11px] text-rose-600">{draftError}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-[13px] font-medium text-neutral-700">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any additional details about the cancellation..."
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-400 transition-all duration-200 resize-none text-[13px]"
          />
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-amber-800">
            Cancelling this booking will release the room assignment and notify the guest.
          </p>
        </div>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex-shrink-0">
        <Button variant="outline" onClick={onClose}>
          Keep Booking
        </Button>
        <Button
          variant="danger"
          onClick={handleSubmit}
          disabled={!isFormValid}
          loading={isCancelling}
        >
          Cancel Booking
        </Button>
      </div>
    </Modal>
  );
}
