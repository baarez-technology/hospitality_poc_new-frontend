import { useState, useEffect } from 'react';
import { X, Ban, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui2/Button';

export default function BlockRoomModal({ room, isOpen, onClose, onBlock }) {
  const [formData, setFormData] = useState({
    reason: '',
    until: ''
  });

  // Check if room is occupied
  const isOccupied = room?.status === 'occupied' || room?.guests;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFormData({ reason: '', until: '' }); // Reset form
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !room) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent blocking occupied rooms
    if (isOccupied) {
      alert('Cannot block an occupied room. Please check out the guest first.');
      return;
    }

    if (!formData.reason.trim()) {
      alert('Please provide a reason for blocking the room');
      return;
    }

    onBlock(room.id, formData.reason, formData.until);
    onClose();
    setFormData({ reason: '', until: '' });
  };

  // Get today's date for min date input
  const today = new Date().toISOString().split('T')[0];

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
            <h2 className="text-2xl font-serif font-semibold text-neutral-900">Block Room</h2>
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
          {/* Occupied Room Warning */}
          {isOccupied && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Cannot Block Occupied Room</p>
                <p className="text-xs mt-1 text-red-700">
                  This room is currently occupied by a guest. Please check out the guest before blocking the room.
                </p>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className={isOccupied ? 'opacity-50 pointer-events-none' : ''}>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Reason *
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
            >
              <option value="">-- Select a reason --</option>
              <option value="Maintenance - Plumbing">Maintenance - Plumbing</option>
              <option value="Maintenance - Electrical">Maintenance - Electrical</option>
              <option value="Maintenance - AC/Heating">Maintenance - AC/Heating</option>
              <option value="Maintenance - General">Maintenance - General</option>
              <option value="Renovation - Bathroom">Renovation - Bathroom</option>
              <option value="Renovation - Bedroom">Renovation - Bedroom</option>
              <option value="Renovation - Complete">Renovation - Complete</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Safety Issue">Safety Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Until Date */}
          <div className={isOccupied ? 'opacity-50 pointer-events-none' : ''}>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Blocked Until (Optional)
            </label>
            <input
              type="date"
              name="until"
              value={formData.until}
              onChange={handleChange}
              min={today}
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
            />
            <p className="text-xs text-neutral-500 mt-2">
              Leave blank if duration is unknown
            </p>
          </div>

          {/* Warning */}
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-xs font-medium text-red-900 mb-1">Important</p>
            <p className="text-xs text-red-700">
              Blocking this room will:
            </p>
            <ul className="text-xs text-red-700 mt-2 ml-4 list-disc space-y-1">
              <li>Set status to "Out of Service"</li>
              <li>Remove any assigned guests</li>
              <li>Make room unavailable for bookings</li>
            </ul>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            icon={Ban}
            disabled={isOccupied}
            className={isOccupied ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Block Room
          </Button>
        </div>
      </div>
    </div>
  );
}
