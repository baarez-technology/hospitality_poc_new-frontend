import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, Users, Sparkles, Ban, Edit, UserPlus, Trash2, Check, AlertTriangle, Bed, UsersRound, DollarSign } from 'lucide-react';
import { Button } from '../../ui2/Button';

export default function RoomDrawer({ room, isOpen, onClose, onUpdateStatus, onAssignGuest, onMarkClean, onMarkDirty, onBlockRoom, onUnassignGuest, onUnblockRoom }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // Store current scroll positions
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const mainContent = document.querySelector('main');

    // Prevent body scrolling
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Prevent scrolling on main content
    if (mainContent) {
      mainContent.style.overflow = 'hidden';
    }

    document.addEventListener('keydown', handleEsc);

    return () => {
      // Restore body scrolling
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      // Restore main content scrolling
      if (mainContent) {
        mainContent.style.overflow = '';
      }

      // Restore scroll position
      window.scrollTo(scrollX, scrollY);

      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !room) return null;

  // Status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-[#4E5840]/10 text-[#4E5840] border-[#4E5840]/30',
      occupied: 'bg-[#A57865]/10 text-[#A57865] border-[#A57865]/30',
      dirty: 'bg-orange-50 text-orange-700 border-orange-200',
      out_of_service: 'bg-red-50 text-red-700 border-red-200'
    };

    const labels = {
      available: 'Available',
      occupied: 'Occupied',
      dirty: 'Dirty',
      out_of_service: 'Out of Service'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const drawerContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 bottom-0 right-0 h-[100dvh] w-full max-w-md bg-white shadow-xl border-l border-neutral-200 z-50 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 flex-shrink-0">
          <div className="p-4 sm:p-6 pb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-2xl font-serif font-bold text-neutral-900">
                  Room {room.roomNumber}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">{room.type} • Floor {room.floor}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-150 active:scale-95"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2">
              {getStatusBadge(room.status)}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border ${
                room.cleaning === 'clean' || room.guests?.isCheckedIn
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                {room.cleaning === 'clean' || room.guests?.isCheckedIn ? 'Clean' : 'Needs Cleaning'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          {/* Guest Info */}
          {room.guests && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#A57865] rounded-full"></div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Current Guest
                </h3>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-[#A57865]/10 rounded-xl border border-[#A57865]/30">
                <div className="w-8 h-8 rounded-lg bg-[#A57865]/20 border border-[#A57865]/30 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#A57865]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#A57865] mb-0.5">Guest Name</p>
                  <p className="text-sm font-semibold text-neutral-900">{room.guests.name}</p>
                </div>
              </div>
            </section>
          )}

          {/* Blocked Info */}
          {room.status === 'out_of_service' && room.blockedReason && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-red-600 rounded-full"></div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Blocked Information
                </h3>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-xs font-bold text-red-900 mb-2 uppercase tracking-wider">Reason</p>
                <p className="text-sm text-red-700 mb-1">{room.blockedReason}</p>
                {room.blockedUntil && (
                  <p className="text-xs text-red-600 font-medium mt-2">Until: {room.blockedUntil}</p>
                )}
              </div>
            </section>
          )}

          {/* Room Details */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#A57865] rounded-full"></div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Room Details
              </h3>
            </div>
            <div className="space-y-3 bg-[#FAF8F6] rounded-xl p-4 border border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-[#A57865]" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-600">Room Type</span>
                  <span className="text-sm font-semibold text-neutral-900">{room.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                  <Bed className="w-4 h-4 text-[#A57865]" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-600">Bed Type</span>
                  <span className="text-sm font-semibold text-neutral-900">{room.bedType}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                  <UsersRound className="w-4 h-4 text-[#A57865]" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-600">Capacity</span>
                  <span className="text-sm font-semibold text-neutral-900">{room.capacity} guests</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-[#4E5840]" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-600">Price</span>
                  <span className="text-sm font-bold text-[#4E5840]">₹{room.price}/night</span>
                </div>
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#A57865] rounded-full"></div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Amenities
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 hover:border-[#A57865]/30 transition-all duration-150"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </section>

          {/* Actions */}
          <section className="space-y-3 pt-6 border-t border-neutral-200">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#A57865] rounded-full"></div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Actions
              </h3>
            </div>
            <div className="space-y-2">
              {/* Update Status */}
              <Button variant="primary" onClick={() => onUpdateStatus(room)} icon={Edit} fullWidth className="justify-start">
                Update Status
              </Button>

              {/* Assign Guest (only if available) */}
              {room.status === 'available' && (
                <Button variant="outline-neutral" onClick={() => onAssignGuest(room)} icon={UserPlus} fullWidth className="justify-start">
                  Assign Guest
                </Button>
              )}

              {/* Unassign Guest (only if occupied) */}
              {room.status === 'occupied' && (
                <Button variant="outline-neutral" onClick={() => onUnassignGuest(room)} icon={Trash2} fullWidth className="justify-start">
                  Unassign Guest
                </Button>
              )}

              {/* Mark Clean/Dirty */}
              {room.cleaning === 'dirty' ? (
                <Button variant="success" onClick={() => onMarkClean(room)} icon={Check} fullWidth className="justify-start">
                  Mark as Clean
                </Button>
              ) : (
                <Button variant="warning" onClick={() => onMarkDirty(room)} icon={AlertTriangle} fullWidth className="justify-start">
                  Mark as Dirty
                </Button>
              )}

              {/* Block/Unblock Room */}
              {room.status === 'out_of_service' ? (
                <Button variant="success" onClick={() => onUnblockRoom(room)} icon={Check} fullWidth className="justify-start">
                  Unblock Room
                </Button>
              ) : room.status === 'occupied' ? (
                <Button variant="danger" disabled icon={Ban} fullWidth className="justify-start opacity-50 cursor-not-allowed" title="Cannot block occupied room">
                  Block Room (Guest Checked In)
                </Button>
              ) : (
                <Button variant="danger" onClick={() => onBlockRoom(room)} icon={Ban} fullWidth className="justify-start">
                  Block Room
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}
