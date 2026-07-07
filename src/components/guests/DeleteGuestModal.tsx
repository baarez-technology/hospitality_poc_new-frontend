/**
 * DeleteGuestModal Component
 * Delete guest confirmation - Glimmora Design System v5.0
 * Center modal for confirmation actions
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, User } from 'lucide-react';
import { formatCurrency, calculateLoyaltyTier, LOYALTY_TIERS } from '../../utils/guests';
import { Modal } from '../ui2/Modal';
import { Button } from '../ui2/Button';

export default function DeleteGuestModal({
  isOpen,
  onClose,
  onConfirm,
  guest,
  isDeleting,
}) {
  const [confirmText, setConfirmText] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (confirmText.toLowerCase() !== 'delete') return;
    onConfirm(guest?.id);
  };

  const isFormValid = confirmText.toLowerCase() === 'delete';

  if (!guest) return null;

  const loyaltyTier = calculateLoyaltyTier(guest.totalStays, guest.totalSpent);
  const tierConfig = LOYALTY_TIERS[loyaltyTier];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      showClose={true}
    >
      {/* Header */}
      <div className="bg-rose-50 border-b border-rose-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
              Delete Guest
            </h2>
            <p className="text-[13px] text-neutral-500">
              This action cannot be undone
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Guest Summary */}
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-terra-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-terra-600" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{guest.name}</p>
              <p className="text-[13px] text-neutral-500">{guest.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200">
            <div>
              <span className="text-[11px] font-medium text-neutral-500 block">Guest ID</span>
              <span className="text-[13px] font-mono text-neutral-700">{guest.id}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-neutral-500 block">Loyalty Tier</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${tierConfig.bgColor} ${tierConfig.textColor}`}>
                {tierConfig.icon} {loyaltyTier}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-neutral-500 block">Total Stays</span>
              <span className="text-[13px] font-semibold text-neutral-900">{guest.totalStays}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-neutral-500 block">Total Spent</span>
              <span className="text-[13px] font-semibold text-neutral-900">{formatCurrency(guest.totalSpent)}</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-[13px] text-amber-800">
            <p className="font-medium mb-1">You are about to delete this guest permanently.</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>All guest data will be removed</li>
              <li>Stay history will be lost</li>
              <li>Notes and preferences will be deleted</li>
            </ul>
          </div>
        </div>

        {/* Confirmation Input */}
        <div className="space-y-2">
          <label className="block text-[13px] font-medium text-neutral-700">
            Type <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-rose-600">delete</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type 'delete' to confirm"
            autoFocus
            className="w-full h-9 px-3.5 bg-white border border-neutral-200 rounded-lg text-[13px] hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-400 transition-all duration-200"
          />
        </div>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleSubmit}
          disabled={!isFormValid}
          loading={isDeleting}
        >
          Delete Guest
        </Button>
      </div>
    </Modal>
  );
}
