import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { roomsData } from '../../data/roomsData';

const statusBadge = {
  Available: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  Occupied: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  'Out of Service': 'bg-[#CDB261]/20 text-[#CDB261] border border-[#CDB261]/30',
};

export default function AssignRoomModal({
  isOpen,
  booking,
  onClose,
  onAssign,
  isAssigning,
}) {
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedRoom(null);
    }
  }, [isOpen]);

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

  if (!isOpen || !booking) return null;

  const handleAssign = () => {
    if (!selectedRoom) return;
    onAssign(selectedRoom);
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Right Side Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[70] w-[680px] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div
          className="bg-white shadow-2xl w-full h-full flex flex-col"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-neutral-900 tracking-tight">
                Assign Room
              </h2>
              <p className="text-[13px] text-neutral-600 mt-0.5">
                Pick a room for {booking.guest}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-terra-500"
            >
              <X className="w-5 h-5 text-neutral-600 hover:text-neutral-900 transition-colors" />
            </button>
          </div>

          {/* Booking Summary */}
          <div className="flex-shrink-0 px-6 pt-4">
            <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-neutral-200">
                <div className="px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 block mb-1">Booking ID</span>
                  <span className="text-[13px] font-mono font-semibold text-neutral-900">{booking.id}</span>
                </div>
                <div className="px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 block mb-1">Stay Period</span>
                  <span className="text-[13px] font-semibold text-neutral-900">{booking.checkIn} - {booking.checkOut}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 px-6 py-4">
            <div className="space-y-3">
              {roomsData.map((room) => {
                const isDisabled = room.status !== 'Available';
                const isSelected = selectedRoom?.roomNumber === room.roomNumber;
                return (
                  <button
                    key={room.roomNumber}
                    type="button"
                    onClick={() => !isDisabled && setSelectedRoom(room)}
                    disabled={isDisabled}
                    className={`w-full text-left bg-white border rounded-[10px] p-4 transition-all duration-200 ${
                      isSelected
                        ? 'border-terra-500 bg-terra-50/50 shadow-sm'
                        : 'border-neutral-200'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-neutral-300 hover:shadow-sm'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[15px] font-semibold text-neutral-900">
                          Room {room.roomNumber}
                        </p>
                        <p className="text-[13px] text-neutral-500 mt-0.5">
                          {room.type} • Floor {room.floor}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadge[room.status]}`}
                      >
                        {room.status}
                      </span>
                    </div>
                    <div className="mt-2 text-[13px] text-neutral-600 flex items-center gap-3">
                      <span>Occupancy: {room.occupancy === 1 ? 'Occupied' : '0'}</span>
                      <span className="text-neutral-300">•</span>
                      <span>Type: {room.type}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex-shrink-0 bg-white border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-[10px] transition-all duration-200 font-semibold text-[13px] focus:outline-none focus:ring-2 focus:ring-neutral-400/20"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedRoom || isAssigning}
              className="px-5 py-2.5 bg-terra-500 hover:bg-terra-600 text-white disabled:bg-neutral-300 disabled:cursor-not-allowed rounded-[10px] transition-all duration-200 font-semibold text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20"
            >
              {isAssigning ? 'Assigning...' : 'Assign Room'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
