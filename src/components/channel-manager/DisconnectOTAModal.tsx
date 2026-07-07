/**
 * DisconnectOTAModal Component
 * Confirmation popup for disconnecting an OTA - Glimmora Design System v5.0
 * Centered modal for quick confirmations
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui2/Modal';
import { Button } from '../ui2/Button';

export default function DisconnectOTAModal({
  isOpen,
  onClose,
  ota,
  onConfirm
}) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await onConfirm(ota?.id);
      onClose();
    } catch (err) {
      // Error handled in context
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (!ota) return null;

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
          Disconnect {ota?.name}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-neutral-500 leading-relaxed mb-4">
          Remove connection to stop all sync operations
        </p>

        {/* Warning Card */}
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
          <p className="text-sm font-medium text-rose-700 mb-1">
            Warning: This action will stop all sync operations
          </p>
          <p className="text-[13px] text-rose-600">
            Rates and availability will no longer be updated on {ota?.name}. You can reconnect anytime.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isDisconnecting}
          className="px-5 py-2 text-[13px] font-semibold"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDisconnect}
          loading={isDisconnecting}
          className="px-5 py-2 text-[13px] font-semibold"
        >
          Disconnect
        </Button>
      </div>
    </Modal>
  );
}
