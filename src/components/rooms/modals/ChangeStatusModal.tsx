/**
 * ChangeStatusModal Component
 * Change room status - Glimmora Design System v5.0
 * Center Modal pattern using ui2/Modal
 */

import { useState, useEffect } from 'react';
import { Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../../ui2/Modal';
import { Button } from '../../ui2/Button';

export default function ChangeStatusModal({ room, isOpen, onClose, onSave }) {
  const [selectedStatus, setSelectedStatus] = useState('available');
  const [error, setError] = useState('');

  useEffect(() => {
    if (room) {
      setSelectedStatus(room.status);
      setError('');
    }
  }, [room]);

  if (!room) return null;

  // Check if room is occupied (has guests)
  const isOccupied = room.status === 'occupied' || room.guests;

  const handleStatusSelect = (status) => {
    // Validate: Cannot set occupied room to OOS or OOO
    if (isOccupied && (status === 'out_of_service' || status === 'out_of_order')) {
      setError(`Cannot mark room as "${status === 'out_of_order' ? 'Out of Order' : 'Out of Service'}" while guest is checked in. Please check out the guest first.`);
      return;
    }
    setError('');
    setSelectedStatus(status);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Final validation before save
    if (isOccupied && (selectedStatus === 'out_of_service' || selectedStatus === 'out_of_order')) {
      setError('Cannot mark room as Out of Service or Out of Order while guest is checked in. Please check out the guest first.');
      return;
    }
    onSave(room.id, selectedStatus);
    onClose();
  };

  const statusOptions = [
    { value: 'available', label: 'Available', description: 'Room is ready for new guests', dot: 'bg-sage-500', activeBg: 'bg-sage-50', activeBorder: 'border-sage-200' },
    { value: 'occupied', label: 'Occupied', description: 'Room has current guests', dot: 'bg-terra-500', activeBg: 'bg-terra-50', activeBorder: 'border-terra-200' },
    { value: 'dirty', label: 'Dirty', description: 'Room needs cleaning', dot: 'bg-gold-500', activeBg: 'bg-gold-50', activeBorder: 'border-gold-200' },
    { value: 'out_of_service', label: 'Out of Service', description: 'Minor issues, can be sold in emergency', dot: 'bg-orange-500', activeBg: 'bg-orange-50', activeBorder: 'border-orange-200' },
    { value: 'out_of_order', label: 'Out of Order', description: 'Major issues (plumbing, electrical), cannot be sold', dot: 'bg-rose-500', activeBg: 'bg-rose-50', activeBorder: 'border-rose-200' }
  ];

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>Update Room Status</ModalTitle>
        <ModalDescription>Room {room.roomNumber} • {room.type}</ModalDescription>
      </ModalHeader>

      <ModalContent>
        <form onSubmit={handleSubmit}>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Select New Status
            </h4>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              {statusOptions.map((option) => {
                const isSelected = selectedStatus === option.value;
                // Disable OOS and OOO for occupied rooms
                const isDisabled = isOccupied && (option.value === 'out_of_service' || option.value === 'out_of_order');

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleStatusSelect(option.value)}
                    disabled={isDisabled}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      isDisabled
                        ? 'border-neutral-100 bg-neutral-50 cursor-not-allowed opacity-50'
                        : isSelected
                          ? `${option.activeBorder} ${option.activeBg}`
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${option.dot}`}></span>
                      <div className="text-left">
                        <p className={`text-[13px] font-semibold ${isDisabled ? 'text-neutral-400' : 'text-neutral-900'}`}>
                          {option.label}
                          {isDisabled && <span className="ml-2 text-[10px] text-red-500 font-normal">(Guest must check out first)</span>}
                        </p>
                        <p className={`text-[11px] mt-0.5 ${isDisabled ? 'text-neutral-300' : 'text-neutral-500'}`}>{option.description}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected && !isDisabled ? 'bg-terra-500' : 'border border-neutral-300 bg-white'
                    }`}>
                      {isSelected && !isDisabled && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Warning: changing from occupied to non-occupied with guest assigned */}
            {room.status === 'occupied' && room.guests && selectedStatus !== 'occupied' && (
              <div className="mt-4 p-4 rounded-lg border bg-amber-50 border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="text-[13px] font-semibold text-amber-800">
                      Guest Currently Assigned
                    </p>
                    <p className="text-[12px] mt-1 text-amber-700">
                      <span className="font-semibold">{room.guests.name}</span> is currently assigned to this room.
                      Changing status will not automatically unassign the guest. Please unassign the guest first from the room drawer.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </ModalContent>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} className="px-5 py-2 text-[13px] font-semibold">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} className="px-5 py-2 text-[13px] font-semibold">
          Save Changes
        </Button>
      </ModalFooter>
    </Modal>
  );
}
