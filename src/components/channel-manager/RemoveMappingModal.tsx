/**
 * RemoveMappingModal Component
 * Confirmation popup for removing room mappings - Glimmora Design System v5.0
 * Centered modal for quick confirmations
 */

import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui2/Modal';
import { Button } from '../ui2/Button';

export default function RemoveMappingModal({
  isOpen,
  onClose,
  onConfirm,
  roomName,
  otaName,
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="sm"
      showClose={false}
    >
      <div className="p-6">
        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-rose-600" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Remove Mapping
        </h3>

        {/* Description */}
        <p className="text-[13px] text-neutral-500 leading-relaxed mb-4">
          Confirm removal of room mapping
        </p>

        {/* Warning Card */}
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
          <p className="text-sm text-neutral-700">
            Are you sure you want to remove the mapping for{' '}
            <span className="font-semibold text-neutral-900">
              {roomName}
            </span>
            {otaName && (
              <>
                {' '}from{' '}
                <span className="font-semibold text-neutral-900">
                  {otaName}
                </span>
              </>
            )}
            ?
          </p>
          <p className="text-[13px] mt-2 text-rose-600">
            This room will no longer sync rates and availability to this OTA channel.
          </p>
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
          onClick={handleConfirm}
          className="px-5 py-2 text-[13px] font-semibold"
        >
          Remove Mapping
        </Button>
      </div>
    </Modal>
  );
}
