/**
 * RoomDrawer Component
 * Room details drawer - Glimmora Design System v5.0
 * Matches Channel Manager drawer pattern
 */

import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { Users, Sparkles, Bed, UsersRound, SprayCan } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function RoomDrawer({ room, isOpen, onClose, onUpdateStatus, onAssignGuest, onMarkClean, onMarkDirty, onBlockRoom, onUnassignGuest, onUnblockRoom, onRequestCleaning }) {
  const { symbol, formatCurrency } = useCurrency();
  if (!room) return null;

  // Status config
  const statusConfig = {
    available: { label: 'Available', dot: 'bg-sage-500', text: 'text-sage-700', bg: 'bg-sage-50' },
    occupied: { label: 'Occupied', dot: 'bg-terra-500', text: 'text-terra-700', bg: 'bg-terra-50' },
    dirty: { label: 'Dirty', dot: 'bg-gold-500', text: 'text-gold-700', bg: 'bg-gold-50' },
    out_of_service: { label: 'Out of Service', dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
    out_of_order: { label: 'Out of Order', dot: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' }
  };

  const status = statusConfig[room.status] || statusConfig.available;

  const renderFooter = () => (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <Button variant="ghost" onClick={onClose} className="px-4 sm:px-5 py-2 text-[12px] sm:text-[13px] font-semibold">
        Close
      </Button>
      <Button variant="primary" onClick={() => onUpdateStatus(room)} className="px-4 sm:px-5 py-2 text-[12px] sm:text-[13px] font-semibold">
        Update Status
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Room ${room.roomNumber}`}
      subtitle={`${room.type} • Floor ${room.floor}`}
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <div className="space-y-6">
        {/* Status Section */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Current Status
          </h4>
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${status.text}`}>
                  <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                  {status.label}
                </span>
              </div>
              {room.cleaning === 'clean' || room.guests?.isCheckedIn ? (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-sage-600">
                  <Sparkles className="w-4 h-4" />
                  Clean
                </span>
              ) : (
                <span className="text-[13px] font-medium text-gold-600">Needs Cleaning</span>
              )}
            </div>
          </div>
        </div>

        {/* Guest Info — only show for occupied rooms */}
        {room.status === 'occupied' && room.guests && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Current Guest
            </h4>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-terra-50 border border-terra-100">
              <div className="w-10 h-10 rounded-lg bg-terra-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-neutral-900">{room.guests.name}</p>
                {room.guests.checkIn && room.guests.checkOut ? (
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {new Date(room.guests.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(room.guests.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                ) : (
                  <p className="text-[11px] text-neutral-500 mt-0.5">Currently staying</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Blocked Info - shown for out_of_service and out_of_order */}
        {(room.status === 'out_of_service' || room.status === 'out_of_order') && room.blockedReason && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              {room.status === 'out_of_order' ? 'Out of Order Info' : 'Out of Service Info'}
            </h4>
            <div className={`p-4 rounded-lg border ${room.status === 'out_of_order' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
              <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${room.status === 'out_of_order' ? 'text-rose-500' : 'text-amber-500'}`}>
                {room.status === 'out_of_order' ? 'Out of Order' : 'Out of Service'}
              </p>
              <p className={`text-[13px] font-semibold mb-1 ${room.status === 'out_of_order' ? 'text-rose-700' : 'text-amber-700'}`}>{room.blockedReason}</p>
              {room.blockedUntil && (
                <p className={`text-[11px] ${room.status === 'out_of_order' ? 'text-rose-500' : 'text-amber-500'}`}>Until: {room.blockedUntil}</p>
              )}
            </div>
          </div>
        )}

        {/* Room Details */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Room Details
          </h4>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                <Bed className="w-4 h-4 text-neutral-400" />
                <span className="text-[11px] font-medium text-neutral-500">Bed Type</span>
              </div>
              <p className="text-[13px] font-semibold text-neutral-900">{room.bedType}</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                <UsersRound className="w-4 h-4 text-neutral-400" />
                <span className="text-[11px] font-medium text-neutral-500">Capacity</span>
              </div>
              <p className="text-[13px] font-semibold text-neutral-900">{room.capacity} guests</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold text-neutral-400">{symbol}</span>
                <span className="text-[11px] font-medium text-neutral-500">Price</span>
              </div>
              <p className="text-[13px] font-semibold text-neutral-900">{formatCurrency(room.price)}/night</p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Amenities
            </h4>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-neutral-600 bg-neutral-100"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2">
            {/* Clean/Dirty Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div>
                <p className="text-[13px] font-semibold text-neutral-900">Cleaning Status</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {room.cleaning === 'clean' || room.guests?.isCheckedIn ? 'Room is clean and ready' : 'Room needs cleaning'}
                </p>
              </div>
              {room.cleaning === 'dirty' ? (
                <Button variant="outline" size="sm" onClick={() => onMarkClean(room)}>
                  Mark Clean
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => onMarkDirty(room)}>
                  Mark Dirty
                </Button>
              )}
            </div>

            {/* Block/Unblock */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div>
                <p className="text-[13px] font-semibold text-neutral-900">Room Access</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {room.status === 'out_of_order' ? 'Room is Out of Order (major issue)' :
                   room.status === 'out_of_service' ? 'Room is Out of Service (minor issue)' :
                   (room.status === 'occupied' || room.guests) ? 'Room is occupied - check out guest first to block' : 'Room is accessible'}
                </p>
              </div>
              {(room.status === 'out_of_service' || room.status === 'out_of_order') ? (
                <Button variant="outline" size="sm" onClick={() => onUnblockRoom(room)}>
                  Unblock
                </Button>
              ) : room.status === 'occupied' ? (
                <Button variant="outline" size="sm" disabled className="text-neutral-400 border-neutral-200 cursor-not-allowed" title="Cannot block occupied room">
                  Block
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBlockRoom(room)}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={room.status === 'occupied' || !!room.guests}
                  title={room.status === 'occupied' || room.guests ? 'Check out guest first to block room' : 'Block this room'}
                >
                  Block
                </Button>
              )}
            </div>

            {/* Request Cleaning — occupied rooms only */}
            {room.status === 'occupied' && onRequestCleaning && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-sage-50 border border-sage-100">
                <div>
                  <p className="text-[13px] font-semibold text-neutral-900">Request Cleaning</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Submit a housekeeping task for this room
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onRequestCleaning(room)} className="text-sage-700 border-sage-200 hover:bg-sage-100">
                  <SprayCan className="w-3.5 h-3.5 mr-1.5" />
                  Request
                </Button>
              </div>
            )}

            {/* Assign/Unassign Guest */}
            {(room.status === 'available' || room.status === 'occupied' || room.status === 'dirty') && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                <div>
                  <p className="text-[13px] font-semibold text-neutral-900">Guest Assignment</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {room.guests ? `Assigned to ${room.guests.name}` : 'No guest assigned'}
                  </p>
                </div>
                {room.guests ? (
                  <Button variant="outline" size="sm" onClick={() => onUnassignGuest(room)}>
                    Unassign
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => onAssignGuest(room)}>
                    Assign Guest
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
