/**
 * AssignHousekeeperDrawer Component
 * Side drawer for assigning housekeeper - Glimmora Design System v5.0
 * Pattern matching Staff/Channel Manager drawers
 */

import { useState, useEffect } from 'react';
import { UserPlus, MapPin, TrendingUp, Bed } from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';

export default function AssignHousekeeperModal({
  room,
  isOpen,
  onClose,
  onAssign,
  housekeepers
}) {
  const [selectedHousekeeper, setSelectedHousekeeper] = useState(null);

  useEffect(() => {
    if (isOpen && room) {
      setSelectedHousekeeper(room?.assignedTo || null);
    }
  }, [isOpen, room]);

  if (!room) return null;

  const handleAssign = () => {
    if (selectedHousekeeper && onAssign) {
      onAssign(room.id, selectedHousekeeper);
    }
  };

  // Custom header
  const renderHeader = () => (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
        Assign Housekeeper
      </h2>
      <p className="text-[13px] text-neutral-500 mt-1">Room {room.roomNumber}</p>
    </div>
  );

  // Footer
  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button variant="outline-neutral" size="md" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" size="md" onClick={handleAssign} disabled={!selectedHousekeeper}>
        Assign
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      header={renderHeader()}
      footer={renderFooter()}
      maxWidth="max-w-2xl"
      hideBackdrop={true}
    >
      <div className="space-y-6">
        {/* Room Info */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Room Details
          </h4>
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-terra-100 flex items-center justify-center text-terra-600 font-bold text-base sm:text-lg">
                {room.roomNumber}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-neutral-900">Room {room.roomNumber}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="px-2 py-0.5 bg-white border border-neutral-200 text-neutral-600 rounded text-[10px] sm:text-[11px] font-medium">
                    {room.type}
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-neutral-200 text-neutral-600 rounded text-[10px] sm:text-[11px] font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Floor {room.floor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Housekeepers List */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Available Housekeepers ({housekeepers.length})
          </h4>
          <div className="space-y-2">
            {housekeepers.map(housekeeper => {
              const taskCount = housekeeper.tasksAssigned || 0;
              const isSelected = selectedHousekeeper === housekeeper.id;
              const isHighLoad = taskCount > 8;

              return (
                <div
                  key={housekeeper.id}
                  onClick={() => setSelectedHousekeeper(housekeeper.id)}
                  className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-terra-50 border-2 border-terra-300'
                      : 'bg-neutral-50 border border-neutral-100 hover:border-neutral-200'
                  }`}
                >
                  {/* Radio Button */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-terra-500 bg-terra-500' : 'border-neutral-300 bg-white'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-terra-100 flex items-center justify-center text-terra-600 font-semibold text-[12px] sm:text-[13px] flex-shrink-0">
                    {housekeeper.avatar || housekeeper.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-neutral-900 text-[12px] sm:text-[13px] truncate">{housekeeper.name}</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-sage-500 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-[11px] flex-wrap">
                      {housekeeper.efficiency && (
                        <div className="flex items-center gap-1 text-sage-600 font-medium">
                          <TrendingUp className="w-3 h-3" />
                          <span>{housekeeper.efficiency}%</span>
                        </div>
                      )}
                      <span className="text-neutral-500 font-medium">
                        {taskCount} {taskCount === 1 ? 'room' : 'rooms'}
                      </span>
                      {isHighLoad && (
                        <span className="px-1.5 py-0.5 bg-gold-50 text-gold-700 rounded text-[10px] font-semibold border border-gold-200">
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
            <div className="p-6 sm:p-8 rounded-lg bg-neutral-50 border border-neutral-100 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-neutral-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
              </div>
              <p className="text-[12px] sm:text-[13px] font-semibold text-neutral-900">No housekeepers available</p>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-1">All staff are currently assigned</p>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
