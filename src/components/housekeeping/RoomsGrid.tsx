import { Bed } from 'lucide-react';
import RoomCard from './RoomCard';

export default function RoomsGrid({ rooms, onRoomClick, onMarkClean }) {
  if (rooms.length === 0) {
    return (
      <div className="bg-white rounded-[10px] p-12 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bed className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">No rooms found</h3>
        <p className="text-sm text-neutral-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onClick={onRoomClick}
          onMarkClean={onMarkClean}
        />
      ))}
    </div>
  );
}
