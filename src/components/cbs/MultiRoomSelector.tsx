/**
 * MultiRoomSelector Component
 * Allows selecting multiple rooms for group bookings
 * Reuses RoomRequest type from multi-room.service.ts
 */

import { Plus, Trash2, Users, Bed, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select } from '../ui2/Input';
import { useCurrency } from '@/hooks/useCurrency';
import type { RoomRequest } from '@/api/services/multi-room.service';

export interface RoomType {
  id: number;
  name: string;
  slug?: string;
  basePrice: number;
  maxGuests: number;
  description?: string;
  available?: number;
}

interface Props {
  rooms: RoomRequest[];
  onChange: (rooms: RoomRequest[]) => void;
  roomTypes: RoomType[];
  nights: number;
  disabled?: boolean;
  maxRooms?: number;
}

export default function MultiRoomSelector({
  rooms,
  onChange,
  roomTypes,
  nights,
  disabled = false,
  maxRooms = 10,
}: Props) {
  const { formatCurrency } = useCurrency();

  const calculateRoomPrice = (roomTypeId: number): number => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    if (!roomType || nights <= 0) return 0;
    return roomType.basePrice * nights;
  };

  const totalPrice = rooms.reduce((sum, room) => {
    return sum + calculateRoomPrice(room.room_type_id);
  }, 0);

  const addRoom = () => {
    if (rooms.length >= maxRooms) return;
    const defaultRoomType = roomTypes[0];
    if (!defaultRoomType) return;

    onChange([
      ...rooms,
      {
        room_type_id: defaultRoomType.id,
        adults: 1,
        children: 0,
        special_requests: '',
      },
    ]);
  };

  const removeRoom = (index: number) => {
    if (rooms.length <= 1) return;
    onChange(rooms.filter((_, i) => i !== index));
  };

  const updateRoom = (index: number, updates: Partial<RoomRequest>) => {
    const newRooms = [...rooms];
    newRooms[index] = { ...newRooms[index], ...updates };
    onChange(newRooms);
  };

  const getRoomType = (roomTypeId: number) => roomTypes.find(rt => rt.id === roomTypeId);

  return (
    <div className="space-y-4">
      {/* Room List */}
      <div className="space-y-3">
        {rooms.map((room, index) => {
          const roomType = getRoomType(room.room_type_id);
          const roomPrice = calculateRoomPrice(room.room_type_id);
          const maxGuests = roomType?.maxGuests || 4;

          return (
            <div
              key={index}
              className={cn(
                'relative p-4 rounded-[10px] border-2 transition-all',
                'border-neutral-200 bg-white hover:border-neutral-300'
              )}
            >
              {/* Room Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-terra-100 flex items-center justify-center">
                    <Bed className="w-4 h-4 text-terra-600" />
                  </div>
                  <span className="text-[13px] font-semibold text-neutral-900">
                    Room {index + 1}
                  </span>
                </div>
                {rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRoom(index)}
                    disabled={disabled}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    title="Remove room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Room Type Selection */}
              <div className="mb-3">
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Room Type
                </label>
                <Select
                  value={room.room_type_id}
                  onChange={(e) => updateRoom(index, { room_type_id: Number(e.target.value) })}
                  disabled={disabled}
                  className="text-[13px]"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} - {formatCurrency(rt.basePrice)}/night
                      {rt.available !== undefined && ` (${rt.available} avail)`}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Guest Count */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Adults */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                    Adults
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateRoom(index, { adults: Math.max(1, (room.adults || 1) - 1) })}
                      disabled={disabled || (room.adults || 1) <= 1}
                      className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-all"
                    >
                      <span className="text-sm font-medium">-</span>
                    </button>
                    <span className="w-8 text-center text-[13px] font-semibold text-neutral-900 tabular-nums">
                      {room.adults || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateRoom(index, { adults: Math.min(maxGuests, (room.adults || 1) + 1) })}
                      disabled={disabled || (room.adults || 1) >= maxGuests}
                      className="w-7 h-7 rounded-lg border border-terra-500 bg-terra-500 text-white flex items-center justify-center hover:bg-terra-600 disabled:opacity-40 transition-all"
                    >
                      <span className="text-sm font-medium">+</span>
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                    Children
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateRoom(index, { children: Math.max(0, (room.children || 0) - 1) })}
                      disabled={disabled || (room.children || 0) <= 0}
                      className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-all"
                    >
                      <span className="text-sm font-medium">-</span>
                    </button>
                    <span className="w-8 text-center text-[13px] font-semibold text-neutral-900 tabular-nums">
                      {room.children || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateRoom(index, { children: Math.min(4, (room.children || 0) + 1) })}
                      disabled={disabled || (room.children || 0) >= 4}
                      className="w-7 h-7 rounded-lg border border-terra-500 bg-terra-500 text-white flex items-center justify-center hover:bg-terra-600 disabled:opacity-40 transition-all"
                    >
                      <span className="text-sm font-medium">+</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Room Price */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {room.adults || 1} adult{(room.adults || 1) !== 1 ? 's' : ''}
                    {(room.children || 0) > 0 && `, ${room.children} child${(room.children || 0) !== 1 ? 'ren' : ''}`}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-neutral-900">
                    {formatCurrency(roomPrice)}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {nights} night{nights !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Capacity Warning */}
              {(room.adults || 1) > maxGuests && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 px-2 py-1.5 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Exceeds room capacity ({maxGuests} max)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Room Button */}
      {rooms.length < maxRooms && (
        <button
          type="button"
          onClick={addRoom}
          disabled={disabled || roomTypes.length === 0}
          className={cn(
            'w-full p-3 rounded-[10px] border-2 border-dashed',
            'border-neutral-300 hover:border-terra-400 hover:bg-terra-50',
            'flex items-center justify-center gap-2',
            'text-[13px] font-medium text-neutral-500 hover:text-terra-600',
            'transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Plus className="w-4 h-4" />
          Add Another Room
        </button>
      )}

      {/* Total Summary */}
      {rooms.length > 1 && (
        <div className="p-4 rounded-[10px] bg-terra-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-terra-200 font-medium">
                Group Total ({rooms.length} rooms)
              </p>
              <p className="text-2xl font-bold">{formatCurrency(totalPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-terra-200">
                {nights} night{nights !== 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-terra-200">
                {rooms.reduce((sum, r) => sum + (r.adults || 1), 0)} adults,{' '}
                {rooms.reduce((sum, r) => sum + (r.children || 0), 0)} children
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info message */}
      {rooms.length === 1 && (
        <p className="text-[11px] text-neutral-400 text-center">
          Add another room to create a group booking
        </p>
      )}
    </div>
  );
}
