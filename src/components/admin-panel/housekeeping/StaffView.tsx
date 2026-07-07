import { UserCircle } from 'lucide-react';
import RoomCard from './RoomCard';

export default function StaffView({ rooms, housekeepers, onRoomClick }) {
  // Group rooms by assigned housekeeper
  const groupRoomsByStaff = () => {
    const grouped = {};
    const unassigned = [];

    rooms.forEach(room => {
      if (room.assignedStaff) {
        const staffId = room.assignedStaff.id;
        if (!grouped[staffId]) {
          grouped[staffId] = [];
        }
        grouped[staffId].push(room);
      } else {
        unassigned.push(room);
      }
    });

    return { grouped, unassigned };
  };

  const { grouped, unassigned } = groupRoomsByStaff();

  // Get housekeeper details
  const getHousekeeperById = (id) => {
    return housekeepers.find(hk => hk.id === id);
  };

  return (
    <div className="space-y-8">
      {/* Housekeepers with Assigned Rooms */}
      {housekeepers.map(housekeeper => {
        const assignedRooms = grouped[housekeeper.id] || [];

        if (assignedRooms.length === 0) return null;

        return (
          <div key={housekeeper.id} className="space-y-4">
            {/* Housekeeper Header */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                {housekeeper.avatar || housekeeper.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {housekeeper.name}
                  </h3>
                  <span className="px-2.5 py-1 bg-[#A57865]/10 text-[#A57865] border border-[#A57865]/30 rounded-lg text-xs font-semibold">
                    {assignedRooms.length} {assignedRooms.length === 1 ? 'room' : 'rooms'}
                  </span>
                </div>
                {housekeeper.efficiency && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-2 bg-neutral-200 rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${housekeeper.efficiency}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-600">
                      {housekeeper.efficiency}% efficiency
                    </span>
                  </div>
                )}
              </div>

              {/* Status */}
              {housekeeper.status && (
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  housekeeper.status === 'active'
                    ? 'bg-green-100 text-[#4E5840] border-[#4E5840]/30'
                    : housekeeper.status === 'break'
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}>
                  {housekeeper.status === 'active' ? 'Active' : housekeeper.status === 'break' ? 'On Break' : 'Off Duty'}
                </span>
              )}
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {assignedRooms.map(room => (
                <RoomCard key={room.id} room={room} onClick={onRoomClick} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Unassigned Rooms Section */}
      {unassigned.length > 0 && (
        <div className="space-y-4">
          {/* Unassigned Header */}
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Unassigned Rooms
                </h3>
                <span className="px-2.5 py-1 bg-amber-200 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold">
                  {unassigned.length} {unassigned.length === 1 ? 'room' : 'rooms'}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                These rooms need to be assigned to a housekeeper
              </p>
            </div>
          </div>

          {/* Unassigned Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unassigned.map(room => (
              <RoomCard key={room.id} room={room} onClick={onRoomClick} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {housekeepers.length === 0 && unassigned.length === 0 && (
        <div className="text-center py-12">
          <UserCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 text-lg">No rooms or housekeepers found</p>
        </div>
      )}
    </div>
  );
}
