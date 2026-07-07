import { Home } from 'lucide-react';
import RoomCard from './RoomCard';

/** Skeleton card shown while rooms are loading */
function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-[10px] p-5 animate-pulse border border-neutral-100">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-100" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-16 bg-neutral-100 rounded" />
            <div className="h-3 w-24 bg-neutral-100 rounded" />
          </div>
        </div>
        <div className="h-5 w-20 bg-neutral-100 rounded-full" />
      </div>

      {/* Details row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="h-10 bg-neutral-100 rounded-lg" />
        <div className="h-10 bg-neutral-100 rounded-lg" />
        <div className="h-10 bg-neutral-100 rounded-lg" />
      </div>

      {/* Amenities row */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-14 bg-neutral-100 rounded-full" />
        <div className="h-6 w-14 bg-neutral-100 rounded-full" />
        <div className="h-6 w-14 bg-neutral-100 rounded-full" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="h-4 w-20 bg-neutral-100 rounded" />
        <div className="h-8 w-24 bg-neutral-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function RoomsGrid({ rooms, onRoomClick, isLoading = false }) {
  // While data is loading, show skeleton cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <RoomCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Data loaded but no rooms match filters/search
  if (rooms.length === 0) {
    return (
      <div className="bg-white rounded-[10px] p-8 sm:p-12 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg mx-auto mb-4 sm:mb-5 flex items-center justify-center bg-neutral-50">
          <Home className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-300" />
        </div>
        <p className="text-[13px] font-semibold text-neutral-800 mb-1">No rooms found</p>
        <p className="text-[11px] text-neutral-400 font-medium">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onClick={onRoomClick} />
      ))}
    </div>
  );
}
