/**
 * Step 1 — Room Block. Card-per-room layout with proper field spacing.
 */
import { Plus, Trash2 } from 'lucide-react';
import type { RoomBlock } from '../../../utils/events';
import { formatCurrency } from '../../../utils/formatters';
import { Input } from '../../ui2/Input';
import { SearchableSelect } from '../../ui2/SearchableSelect';

const fmt = (v: number) => formatCurrency(v, 'INR');

const ROOM_TYPE_OPTIONS = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Deluxe', label: 'Deluxe' },
  { value: 'Premium', label: 'Premium' },
  { value: 'Suite', label: 'Suite' },
  { value: 'Presidential Suite', label: 'Presidential Suite' },
];

interface Props {
  rooms: RoomBlock[];
  onAdd: () => void;
  onUpdate: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
}

export default function RoomBlockStep({ rooms, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div>
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-neutral-900">Room Block</h3>
        <p className="text-[11px] text-neutral-400 mt-0.5">Allocate room types, quantities, and rates for the event</p>
      </div>

      <div className="space-y-4">
        {rooms.map((room, idx) => {
          const nights = room.checkIn && room.checkOut
            ? Math.max(0, Math.ceil((new Date(room.checkOut).getTime() - new Date(room.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
            : 0;
          const subtotal = room.quantity * room.ratePerNight * nights;

          return (
            <div key={room.id} className="rounded-[10px] border border-neutral-200 bg-white p-5">
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Room {idx + 1}</span>
                <div className="flex items-center gap-3">
                  {subtotal > 0 && (
                    <span className="text-[14px] font-semibold text-neutral-900 tabular-nums">{fmt(subtotal)}</span>
                  )}
                  {nights > 0 && (
                    <span className="text-[11px] text-neutral-400">{nights} night{nights > 1 ? 's' : ''}</span>
                  )}
                  {rooms.length > 1 && (
                    <button onClick={() => onRemove(room.id)}
                      className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Fields — 2 rows for proper spacing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">Room Type</label>
                  <SearchableSelect
                    options={ROOM_TYPE_OPTIONS}
                    value={room.roomType}
                    onChange={val => onUpdate(room.id, 'roomType', val)}
                    placeholder="Select type"
                    searchable={false}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">Quantity</label>
                  <Input type="number" min={1} value={String(room.quantity)}
                    onChange={e => onUpdate(room.id, 'quantity', parseInt(e.target.value) || 1)} size="md" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">Rate / Night (₹)</label>
                  <Input type="number" min={0} value={String(room.ratePerNight)}
                    onChange={e => onUpdate(room.id, 'ratePerNight', parseFloat(e.target.value) || 0)} size="md" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">Check-in</label>
                  <Input type="date" value={room.checkIn}
                    onChange={e => onUpdate(room.id, 'checkIn', e.target.value)} size="md" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">Check-out</label>
                  <Input type="date" value={room.checkOut}
                    onChange={e => onUpdate(room.id, 'checkOut', e.target.value)} size="md" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onAdd}
        className="mt-4 h-10 px-4 rounded-[10px] border border-dashed border-neutral-300 text-[12px] font-medium text-neutral-500 hover:border-terra-400 hover:text-terra-600 hover:bg-terra-50/30 flex items-center gap-1.5 transition-colors w-full justify-center">
        <Plus className="w-4 h-4" /> Add Another Room Type
      </button>
    </div>
  );
}
