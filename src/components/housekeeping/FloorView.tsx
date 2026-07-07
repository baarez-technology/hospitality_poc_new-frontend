import { Building } from 'lucide-react';
import RoomCard from './RoomCard';

export default function FloorView({ rooms, onRoomClick }) {
  // Group rooms by floor
  const groupRoomsByFloor = () => {
    const grouped = {};

    rooms.forEach(room => {
      const floor = room.floor;
      if (!grouped[floor]) {
        grouped[floor] = [];
      }
      grouped[floor].push(room);
    });

    return grouped;
  };

  const groupedRooms = groupRoomsByFloor();
  const floors = [1, 2, 3, 4, 5];

  // Get status counts for a floor
  const getFloorStats = (floorRooms) => {
    const stats = {
      clean: 0,
      dirty: 0,
      in_progress: 0,
      out_of_service: 0
    };

    floorRooms.forEach(room => {
      if (stats[room.status] !== undefined) {
        stats[room.status]++;
      }
    });

    return stats;
  };

  return (
    <div className="space-y-6">
      {floors.map(floor => {
        const floorRooms = groupedRooms[floor] || [];

        // Skip empty floors
        if (floorRooms.length === 0) return null;

        const stats = getFloorStats(floorRooms);

        return (
          <div key={floor} className="space-y-4">
            {/* Floor Header */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-[10px]">
              {/* Floor Icon */}
              <div className="w-12 h-12 rounded-lg bg-terra-100 flex items-center justify-center">
                <Building className="w-6 h-6 text-terra-600" />
              </div>

              {/* Floor Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-semibold text-neutral-900">
                    Floor {floor}
                  </h3>
                  <span className="px-2 py-0.5 bg-terra-50 text-terra-600 rounded text-[11px] font-semibold">
                    {floorRooms.length} {floorRooms.length === 1 ? 'room' : 'rooms'}
                  </span>
                </div>

                {/* Floor Stats */}
                <div className="flex items-center gap-3 mt-1.5">
                  {stats.clean > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                      <span className="text-neutral-600">
                        <span className="font-semibold text-sage-700">{stats.clean}</span> clean
                      </span>
                    </div>
                  )}
                  {stats.dirty > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                      <span className="text-neutral-600">
                        <span className="font-semibold text-gold-700">{stats.dirty}</span> dirty
                      </span>
                    </div>
                  )}
                  {stats.in_progress > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-terra-500" />
                      <span className="text-neutral-600">
                        <span className="font-semibold text-terra-600">{stats.in_progress}</span> cleaning
                      </span>
                    </div>
                  )}
                  {stats.out_of_service > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-neutral-600">
                        <span className="font-semibold text-rose-600">{stats.out_of_service}</span> blocked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {floorRooms.map(room => (
                <RoomCard key={room.id} room={room} onClick={onRoomClick} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {Object.keys(groupedRooms).length === 0 && (
        <div className="text-center py-12 bg-white rounded-[10px]">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No rooms found</h3>
          <p className="text-sm text-neutral-600">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
