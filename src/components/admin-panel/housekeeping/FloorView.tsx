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
      out_of_service: 0,
      out_of_order: 0,
      maintenance: 0
    };

    floorRooms.forEach(room => {
      if (stats[room.status] !== undefined) {
        stats[room.status]++;
      }
    });

    return stats;
  };

  return (
    <div className="space-y-8">
      {floors.map(floor => {
        const floorRooms = groupedRooms[floor] || [];

        // Skip empty floors
        if (floorRooms.length === 0) return null;

        const stats = getFloorStats(floorRooms);

        return (
          <div key={floor} className="space-y-4">
            {/* Floor Header */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200">
              {/* Floor Icon */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                <Building className="w-6 h-6" />
              </div>

              {/* Floor Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Floor {floor}
                  </h3>
                  <span className="px-2.5 py-1 bg-[#A57865]/10 text-[#A57865] border border-[#A57865]/30 rounded-lg text-xs font-semibold">
                    {floorRooms.length} {floorRooms.length === 1 ? 'room' : 'rooms'}
                  </span>
                </div>

                {/* Floor Stats */}
                <div className="flex items-center gap-3 mt-2">
                  {stats.clean > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-neutral-600">
                        <span className="font-semibold text-[#4E5840]">{stats.clean}</span> clean
                      </span>
                    </div>
                  )}
                  {stats.dirty > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-neutral-600">
                        <span className="font-semibold text-red-700">{stats.dirty}</span> dirty
                      </span>
                    </div>
                  )}
                  {stats.in_progress > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-neutral-600">
                        <span className="font-semibold text-blue-700">{stats.in_progress}</span> in progress
                      </span>
                    </div>
                  )}
                  {stats.out_of_service > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-neutral-600">
                        <span className="font-semibold text-amber-700">{stats.out_of_service}</span> out of service
                      </span>
                    </div>
                  )}
                  {stats.out_of_order > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-neutral-600">
                        <span className="font-semibold text-rose-700">{stats.out_of_order}</span> out of order
                      </span>
                    </div>
                  )}
                  {stats.maintenance > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-neutral-600">
                        <span className="font-semibold text-orange-700">{stats.maintenance}</span> maintenance
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {floorRooms.map(room => (
                <RoomCard key={room.id} room={room} onClick={onRoomClick} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {Object.keys(groupedRooms).length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 text-lg">No rooms found</p>
        </div>
      )}
    </div>
  );
}
