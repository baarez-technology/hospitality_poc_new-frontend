import { UserCircle, TrendingUp } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Housekeepers with Assigned Rooms */}
      {housekeepers.map(housekeeper => {
        const assignedRooms = grouped[housekeeper.id] || [];

        if (assignedRooms.length === 0) return null;

        return (
          <div key={housekeeper.id} className="space-y-4">
            {/* Housekeeper Header */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-[10px]">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-lg bg-terra-100 flex items-center justify-center text-terra-600 font-semibold text-[13px]">
                {housekeeper.avatar || housekeeper.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-semibold text-neutral-900">
                    {housekeeper.name}
                  </h3>
                  <span className="px-2 py-0.5 bg-terra-50 text-terra-600 rounded text-[11px] font-semibold">
                    {assignedRooms.length} {assignedRooms.length === 1 ? 'room' : 'rooms'}
                  </span>
                </div>
                {housekeeper.efficiency && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-20 h-1.5 bg-neutral-100 rounded-full">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          housekeeper.efficiency >= 90 ? 'bg-sage-500' :
                          housekeeper.efficiency >= 75 ? 'bg-gold-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${housekeeper.efficiency}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {housekeeper.efficiency}%
                    </span>
                  </div>
                )}
              </div>

              {/* Status */}
              {housekeeper.status && (
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                  housekeeper.status === 'active'
                    ? 'bg-sage-50 text-sage-700'
                    : housekeeper.status === 'break'
                    ? 'bg-gold-50 text-gold-700'
                    : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {housekeeper.status === 'active' ? 'Active' : housekeeper.status === 'break' ? 'On Break' : 'Off Duty'}
                </span>
              )}
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="flex items-center gap-4 p-4 bg-white rounded-[10px]">
            <div className="w-12 h-12 rounded-lg bg-gold-100 flex items-center justify-center text-gold-600">
              <UserCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-[15px] font-semibold text-neutral-900">
                  Unassigned Rooms
                </h3>
                <span className="px-2 py-0.5 bg-gold-50 text-gold-700 rounded text-[11px] font-semibold">
                  {unassigned.length} {unassigned.length === 1 ? 'room' : 'rooms'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                These rooms need to be assigned to a housekeeper
              </p>
            </div>
          </div>

          {/* Unassigned Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unassigned.map(room => (
              <RoomCard key={room.id} room={room} onClick={onRoomClick} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {housekeepers.length === 0 && unassigned.length === 0 && (
        <div className="text-center py-12 bg-white rounded-[10px]">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No rooms or housekeepers found</h3>
          <p className="text-sm text-neutral-600">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
