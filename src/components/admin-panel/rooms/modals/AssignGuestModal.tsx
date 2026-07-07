import { useState, useEffect } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { guestsService, Guest } from '@/api/services/guests.service';
import { Button } from '../../../ui2/Button';

export default function AssignGuestModal({ room, isOpen, onClose, onAssign }) {
  const [selectedGuest, setSelectedGuest] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch guests from API when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedGuest(''); // Reset selection when opening

      // Fetch guests
      const fetchGuests = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const guestList = await guestsService.list({ pageSize: 50 });
          setGuests(guestList);
        } catch (err: any) {
          console.error('[AssignGuestModal] Failed to fetch guests:', err);
          setError('Failed to load guests');
        } finally {
          setIsLoading(false);
        }
      };
      fetchGuests();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !room) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedGuest) {
      alert('Please select a guest');
      return;
    }

    const guest = guests.find(g => String(g.id) === selectedGuest);
    if (guest) {
      const guestName = `${guest.first_name} ${guest.last_name}`;
      onAssign(room.id, { id: guest.id, name: guestName });
      onClose();
      setSelectedGuest('');
    }
  };

  // Filter to active guests only
  const availableGuests = guests.filter(g => g.status !== 'blacklisted');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-neutral-900">Assign Guest</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Room {room.roomNumber} • {room.type}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Select Guest *
            </label>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#A57865]" />
                <span className="ml-2 text-sm text-neutral-600">Loading guests...</span>
              </div>
            ) : error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            ) : (
              <select
                value={selectedGuest}
                onChange={(e) => setSelectedGuest(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
              >
                <option value="">-- Select a guest --</option>
                {availableGuests.map(guest => (
                  <option key={guest.id} value={String(guest.id)}>
                    {guest.first_name} {guest.last_name} {guest.email ? `(${guest.email})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Room Info */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-medium text-blue-900 mb-2">Room Details</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Bed Type:</span>
                <span className="font-medium text-blue-900">{room.bedType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Capacity:</span>
                <span className="font-medium text-blue-900">{room.capacity} guests</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">Price:</span>
                <span className="font-medium text-blue-900">₹{room.price}/night</span>
              </div>
            </div>
          </div>

          {/* Warning if room is not available */}
          {room.status !== 'available' && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs font-medium text-amber-900 mb-1">Warning</p>
              <p className="text-xs text-amber-700">
                This room is currently marked as "{room.status}". Assigning a guest will change the status to "occupied".
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} icon={UserPlus}>
            Assign Guest
          </Button>
        </div>
      </div>
    </div>
  );
}
