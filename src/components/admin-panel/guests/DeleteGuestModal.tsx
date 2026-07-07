import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Trash2, User } from 'lucide-react';
import { formatCurrency, calculateLoyaltyTier, LOYALTY_TIERS } from '@/utils/admin/guests';
import { Button } from '../../ui2/Button';

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
    if (confirmText.toLowerCase() !== 'delete') return;
    onConfirm(guest?.id);
  };

  const isFormValid = confirmText.toLowerCase() === 'delete';

  if (!isOpen || !guest) return null;

  const loyaltyTier = calculateLoyaltyTier(guest.totalStays, guest.totalSpent);
  const tierConfig = LOYALTY_TIERS[loyaltyTier];

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
                Delete Guest
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
          {/* Guest Summary */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#A57865]/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-[#A57865]" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">{guest.name}</p>
                <p className="text-sm text-neutral-500">{guest.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200">
              <div>
                <span className="text-xs font-medium text-neutral-500 block">Guest ID</span>
                <span className="text-sm font-mono text-neutral-700">{guest.id}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-neutral-500 block">Loyalty Tier</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tierConfig.bgColor} ${tierConfig.textColor}`}>
                  {tierConfig.icon} {loyaltyTier}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-neutral-500 block">Total Stays</span>
                <span className="text-sm font-semibold text-neutral-900">{guest.totalStays}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-neutral-500 block">Total Spent</span>
                <span className="text-sm font-semibold text-neutral-900">{formatCurrency(guest.totalSpent)}</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">You are about to delete this guest permanently.</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>All guest data will be removed</li>
                <li>Stay history will be lost</li>
                <li>Notes and preferences will be deleted</li>
              </ul>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Type <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-red-600">delete</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type 'delete' to confirm"
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:bg-white transition-all duration-200"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" type="submit" disabled={!isFormValid || isDeleting} icon={Trash2} loading={isDeleting} className="flex-1">
              {isDeleting ? 'Deleting...' : 'Delete Guest'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
