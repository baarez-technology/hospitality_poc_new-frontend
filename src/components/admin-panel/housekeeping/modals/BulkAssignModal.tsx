import { useState, useEffect } from 'react';
import { X, Users, CheckSquare, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../../../ui2/Button';

export default function BulkAssignModal({
  rooms,
  isOpen,
  onClose,
  onBulkAssign,
  housekeepers,
  isLoading = false
}) {
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [selectedHousekeeper, setSelectedHousekeeper] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('normal');
  const [bulkNotes, setBulkNotes] = useState('');
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateRooms, setDuplicateRooms] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedRooms([]);
      setSelectedHousekeeper('');
      setSelectedPriority('normal');
      setBulkNotes('');
      setShowDuplicateWarning(false);
      setDuplicateRooms([]);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleRoom = (roomId) => {
    setSelectedRooms(prev =>
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRooms.length === rooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(rooms.map(room => room.id));
    }
  };

  // Check for rooms already assigned to the selected housekeeper
  const checkForDuplicates = (): { hasDuplicates: boolean; duplicates: string[]; newRooms: number[] } => {
    if (!selectedHousekeeper || selectedRooms.length === 0) {
      return { hasDuplicates: false, duplicates: [], newRooms: selectedRooms };
    }

    const duplicates: string[] = [];
    const newRooms: number[] = [];

    selectedRooms.forEach(roomId => {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        // Check if room is already assigned to the selected housekeeper
        if (room.assignedTo?.toString() === selectedHousekeeper?.toString()) {
          duplicates.push(room.roomNumber || room.number || `Room ${roomId}`);
        } else {
          newRooms.push(roomId);
        }
      }
    });

    return { hasDuplicates: duplicates.length > 0, duplicates, newRooms };
  };

  const handleAssign = () => {
    if (selectedRooms.length > 0 && selectedHousekeeper && onBulkAssign) {
      // Check for duplicates (unless user already confirmed)
      if (!showDuplicateWarning) {
        const { hasDuplicates, duplicates } = checkForDuplicates();

        if (hasDuplicates) {
          setDuplicateRooms(duplicates);
          setShowDuplicateWarning(true);
          return;
        }
      }

      // Proceed with assignment
      onBulkAssign(selectedRooms, selectedHousekeeper, selectedPriority, bulkNotes);
      onClose();
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateWarning(false);
    setDuplicateRooms([]);
  };

  const handleAssignNewOnly = () => {
    // Only assign rooms that aren't already assigned to this housekeeper
    const { newRooms } = checkForDuplicates();
    if (newRooms.length > 0 && onBulkAssign) {
      onBulkAssign(newRooms, selectedHousekeeper, selectedPriority, bulkNotes);
    }
    onClose();
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      clean: 'bg-green-100 text-[#4E5840] border-[#4E5840]/30',
      dirty: 'bg-red-100 text-red-700 border-red-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      out_of_service: 'bg-amber-100 text-amber-700 border-amber-200',
      out_of_order: 'bg-rose-100 text-rose-700 border-rose-200',
      maintenance: 'bg-orange-100 text-orange-700 border-orange-200'
    };

    const labels = {
      clean: 'Clean',
      dirty: 'Dirty',
      in_progress: 'In Progress',
      out_of_service: 'Out of Service',
      out_of_order: 'Out of Order',
      maintenance: 'Maintenance'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-neutral-900">
              Bulk Assign Housekeeper
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Select multiple rooms and assign them to a housekeeper
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-150"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Select Housekeeper */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Select Housekeeper
            </label>
            {isLoading ? (
              <div className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading staff...
              </div>
            ) : housekeepers.length === 0 ? (
              <div className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-500 text-center">
                No housekeeping staff available
              </div>
            ) : (
              <select
                value={selectedHousekeeper}
                onChange={(e) => setSelectedHousekeeper(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
              >
                <option value="">Choose a housekeeper...</option>
                {housekeepers.map(hk => (
                  <option key={hk.id} value={hk.id}>
                    {hk.name} {hk.efficiency ? `(${hk.efficiency}% efficiency)` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Priority Selection — placed above room list for visibility */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Priority Level
            </label>
            <div className="flex gap-2">
              {[
                { value: 'low', label: 'Low', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
                { value: 'normal', label: 'Normal', color: 'bg-blue-50 text-blue-600 border-blue-200' },
                { value: 'high', label: 'High', color: 'bg-amber-50 text-amber-600 border-amber-200' },
                { value: 'urgent', label: 'Urgent', color: 'bg-red-50 text-red-600 border-red-200' },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setSelectedPriority(p.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                    selectedPriority === p.value
                      ? 'border-[#A57865] bg-[#A57865]/5 text-[#A57865] ring-1 ring-[#A57865]/20'
                      : `${p.color} hover:opacity-80`
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes/Instructions */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Notes / Instructions
            </label>
            <textarea
              value={bulkNotes}
              onChange={(e) => setBulkNotes(e.target.value)}
              rows={3}
              placeholder="Add any special instructions for the housekeeper..."
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 resize-none"
            />
          </div>

          {/* Room Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-neutral-700">
                Select Rooms ({selectedRooms.length}/{rooms.length})
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm text-[#A57865] hover:text-[#A57865] font-medium"
              >
                {selectedRooms.length === rooms.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Rooms List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {rooms.map(room => {
                const isSelected = selectedRooms.includes(room.id);

                return (
                  <div
                    key={room.id}
                    onClick={() => handleToggleRoom(room.id)}
                    className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#A57865]/5 border-[#A57865]'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'border-[#A57865] bg-[#8E6554]'
                        : 'border-neutral-300 bg-white'
                    }`}>
                      {isSelected && (
                        <CheckSquare className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Room Number */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {room.roomNumber}
                    </div>

                    {/* Room Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-neutral-900">
                          Room {room.roomNumber}
                        </h4>
                        {getStatusBadge(room.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-600">
                        <span>{room.type}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Floor {room.floor}
                        </span>
                        {room.assignedTo && (
                          <span className="text-amber-600">
                            Currently assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {rooms.length === 0 && (
              <div className="text-center py-12 bg-[#FAF8F6] rounded-xl">
                <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">No rooms available</p>
              </div>
            )}
          </div>

          {/* Duplicate Warning */}
          {showDuplicateWarning && duplicateRooms.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-800 mb-1">
                    Duplicate Assignment Detected
                  </h4>
                  <p className="text-sm text-amber-700 mb-2">
                    The following rooms are already assigned to this housekeeper:
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {duplicateRooms.map((roomNum, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-medium"
                      >
                        {roomNum}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="xs" onClick={handleCancelDuplicate}>
                      Cancel
                    </Button>
                    {checkForDuplicates().newRooms.length > 0 && (
                      <Button variant="outline-warning" size="xs" onClick={handleAssignNewOnly}>
                        Assign New Rooms Only ({checkForDuplicates().newRooms.length})
                      </Button>
                    )}
                    <Button variant="warning" size="xs" onClick={handleAssign}>
                      Assign Anyway
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {selectedRooms.length > 0 && selectedHousekeeper && !showDuplicateWarning && (
            <div className="p-4 bg-[#A57865]/5 rounded-xl border border-[#A57865]/30">
              <div className="flex items-center gap-2 text-sm">
                <CheckSquare className="w-4 h-4 text-[#A57865]" />
                <span className="text-neutral-900">
                  <span className="font-bold">{selectedRooms.length}</span> {selectedRooms.length === 1 ? 'room' : 'rooms'} will be assigned to{' '}
                  <span className="font-bold">
                    {housekeepers.find(hk => hk.id === selectedHousekeeper)?.name}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-neutral-200 flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssign} disabled={selectedRooms.length === 0 || !selectedHousekeeper} icon={Users}>
            Assign All ({selectedRooms.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
