import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '../../../ui2/Button';

export default function AssignHousekeeperModal({
  room,
  isOpen,
  onClose,
  onAssign,
  housekeepers
}) {
  const [selectedHousekeeper, setSelectedHousekeeper] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // Store current scroll positions
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const mainContent = document.querySelector('main');

    // Prevent body scrolling
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Prevent scrolling on main content
    if (mainContent) {
      mainContent.style.overflow = 'hidden';
    }

    // Pre-select current housekeeper if assigned
    setSelectedHousekeeper(room?.assignedTo || null);

    document.addEventListener('keydown', handleEsc);

    return () => {
      // Restore body scrolling
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      // Restore main content scrolling
      if (mainContent) {
        mainContent.style.overflow = '';
      }

      // Restore scroll position
      window.scrollTo(scrollX, scrollY);

      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, room]);

  if (!isOpen || !room) return null;

  const handleAssign = () => {
    if (selectedHousekeeper && onAssign) {
      onAssign(room.id, selectedHousekeeper);
      onClose();
    }
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-neutral-900">
              Assign Housekeeper
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Select a housekeeper for Room {room.roomNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-150"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Room Info */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white font-bold text-2xl shadow-md">
              {room.roomNumber}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900">
                Room {room.roomNumber}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded text-xs font-medium">
                  {room.type}
                </span>
                <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded text-xs font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Floor {room.floor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Housekeepers List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          <h3 className="text-sm font-semibold text-neutral-700 mb-4">
            Available Housekeepers ({housekeepers.length})
          </h3>
          <div className="space-y-3">
            {housekeepers.map(housekeeper => {
              const taskCount = housekeeper.tasksAssigned || 0;
              const isSelected = selectedHousekeeper === housekeeper.id;
              const isHighLoad = taskCount > 8;

              return (
                <div
                  key={housekeeper.id}
                  onClick={() => setSelectedHousekeeper(housekeeper.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#A57865]/5 border-[#A57865] shadow-md'
                      : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
                  }`}
                >
                  {/* Radio Button */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'border-[#A57865] bg-[#8E6554]'
                      : 'border-neutral-300 bg-white'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 shadow-md">
                    {housekeeper.avatar || housekeeper.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-neutral-900 truncate">
                        {housekeeper.name}
                      </h4>
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      {housekeeper.efficiency && (
                        <div className="flex items-center gap-1 text-[#4E5840]">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-medium">{housekeeper.efficiency}% efficiency</span>
                        </div>
                      )}
                      <span className="text-neutral-600">
                        {taskCount} {taskCount === 1 ? 'room' : 'rooms'} assigned
                      </span>
                      {isHighLoad && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
                          High load
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {housekeepers.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No housekeepers available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssign} disabled={!selectedHousekeeper} icon={UserPlus}>
            Assign Housekeeper
          </Button>
        </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
