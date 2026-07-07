/**
 * DisableStaffModal Component
 * Confirmation modal for disabling staff - Glimmora Design System v5.0
 * Uses center Modal pattern for confirmations
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, UserX } from 'lucide-react';
import { Modal } from '../../ui2/Modal';
import { Button } from '../../ui2/Button';

export default function DisableStaffModal({ staff, isOpen, onClose, onDisable }) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  if (!staff) return null;

  const handleDisable = () => {
    if (confirmText.toLowerCase() === 'disable') {
      onDisable(staff.id);
      onClose();
    }
  };

  const isConfirmValid = confirmText.toLowerCase() === 'disable';

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="sm"
      showClose={true}
    >
      <div className="p-6">
        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
          <UserX className="w-6 h-6 text-rose-600" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Disable Staff Member
        </h3>

        {/* Description */}
        <p className="text-[13px] text-neutral-500 leading-relaxed mb-4">
          This action can be reversed. The staff member will no longer appear in assignments and cannot log in.
        </p>

        {/* Staff Info */}
        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-terra-100 flex items-center justify-center text-terra-600 font-bold text-sm">
              {staff.avatar}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-neutral-900">{staff.name}</p>
              <p className="text-[11px] text-neutral-500">{staff.role}</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-3 bg-gold-50 border border-gold-100 rounded-lg mb-4">
          <AlertTriangle className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-gold-700">
            They will no longer appear in staff assignments and cannot log in.
          </p>
        </div>

        {/* Confirmation Input */}
        <div>
          <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
            Type "disable" to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="disable"
            className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
        <Button
          variant="ghost"
          onClick={onClose}
          className="px-5 py-2 text-[13px] font-semibold"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDisable}
          disabled={!isConfirmValid}
          className="px-5 py-2 text-[13px] font-semibold"
        >
          Disable Staff
        </Button>
      </div>
    </Modal>
  );
}
