import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui2/Button';

export default function ChangeStatusModal({ room, isOpen, onClose, onSave }) {
  const [selectedStatus, setSelectedStatus] = useState('available');
  const [error, setError] = useState('');

  // Check if room is occupied
  const isOccupied = room?.status === 'occupied' || room?.guests;

  useEffect(() => {
    if (room) {
      setSelectedStatus(room.status);
      setError('');
    }
  }, [room]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !room) return null;

  const handleStatusChange = (status) => {
    if (isOccupied && status === 'out_of_service') {
      setError('Cannot mark room as Out of Service while guest is checked in. Please check out the guest first.');
      return;
    }
    setError('');
    setSelectedStatus(status);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isOccupied && selectedStatus === 'out_of_service') {
      setError('Cannot mark room as Out of Service while guest is checked in. Please check out the guest first.');
      return;
    }
    onSave(room.id, selectedStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-neutral-900">Update Room Status</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Room {room.roomNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-150"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Select New Status
            </label>
            <div className="space-y-2">
              {/* Available */}
              <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-neutral-50
                ${selectedStatus === 'available' ? 'border-green-500 bg-[#4E5840]/10' : 'border-neutral-200'}">
                <input
                  type="radio"
                  name="status"
                  value="available"
                  checked={selectedStatus === 'available'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-4 h-4 text-[#4E5840] focus:ring-green-500"
                />
                <div className="ml-3">
                  <p className="text-sm font-semibold text-neutral-900">Available</p>
                  <p className="text-xs text-neutral-600">Room is ready for new guests</p>
                </div>
              </label>

              {/* Occupied */}
              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-neutral-50
                ${selectedStatus === 'occupied' ? 'border-blue-500 bg-blue-50' : 'border-neutral-200'}`}>
                <input
                  type="radio"
                  name="status"
                  value="occupied"
                  checked={selectedStatus === 'occupied'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="text-sm font-semibold text-neutral-900">Occupied</p>
                  <p className="text-xs text-neutral-600">Room has current guests</p>
                </div>
              </label>

              {/* Dirty */}
              <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-neutral-50
                ${selectedStatus === 'dirty' ? 'border-orange-500 bg-orange-50' : 'border-neutral-200'}`}>
                <input
                  type="radio"
                  name="status"
                  value="dirty"
                  checked={selectedStatus === 'dirty'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <div className="ml-3">
                  <p className="text-sm font-semibold text-neutral-900">Dirty</p>
                  <p className="text-xs text-neutral-600">Room needs cleaning</p>
                </div>
              </label>

              {/* Out of Service */}
              <label className={`flex items-center p-4 border-2 rounded-xl transition-all duration-200
                ${isOccupied ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-neutral-50'}
                ${selectedStatus === 'out_of_service' && !isOccupied ? 'border-red-500 bg-red-50' : 'border-neutral-200'}`}>
                <input
                  type="radio"
                  name="status"
                  value="out_of_service"
                  checked={selectedStatus === 'out_of_service'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isOccupied}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 disabled:opacity-50"
                />
                <div className="ml-3">
                  <p className="text-sm font-semibold text-neutral-900">
                    Out of Service
                    {isOccupied && <span className="ml-2 text-xs text-red-500 font-normal">(Guest must check out first)</span>}
                  </p>
                  <p className="text-xs text-neutral-600">Room is blocked/unavailable</p>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} icon={Save}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
