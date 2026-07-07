import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Bed, Users, Wifi, Tv, Wind, Coffee, Search, Loader2, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '@/utils/admin/bookings';
import { roomsService } from '@/api/services/rooms.service';
import { bookingService } from '@/api/services/booking.service';
import { SimpleDropdown } from '@/components/ui/Select';
import { Button } from '../../ui2/Button';
import { useAuth } from '@/hooks/useAuth';

// Feature icons mapping
const FEATURE_ICONS = {
  'WiFi': Wifi,
  'TV': Tv,
  'AC': Wind,
  'Coffee': Coffee,
};

export default function AssignRoomModal({ isOpen, onClose, onAssign, booking, isAssigning, bookings = [] }) {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all');
  const [roomsData, setRoomsData] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [dnmEnabled, setDnmEnabled] = useState(false);

  // Role-based access
  const userRole = (user?.role || '').toLowerCase();
  const isAdminOrManager = ['admin', 'manager', 'general_manager'].includes(userRole) || user?.isSuperuser;

  // Determine if this is a room move (checked-in guest)
  const isRoomMove = (() => {
    const status = (booking?.status || '').toUpperCase().replace(/[\s_]/g, '-');
    return status === 'IN-HOUSE' || status === 'CHECKED-IN' || status === 'IN_HOUSE';
  })();

  // Checked-in bookings: only admin/manager can reassign
  const isCheckedInLocked = isRoomMove && booking?.room && !isAdminOrManager;

  // Fetch rooms from database when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRoom(null);
      setSearchQuery('');
      setFilterType('all');
      setFilterFloor('all');
      setDnmEnabled(booking?.doNotMove || false);
      fetchRooms();
    }
  }, [isOpen]);

  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      // Pass booking dates to filter rooms available for the stay period
      // Fetch ALL room types to support upgrades/overbooking scenarios
      const searchParams: any = {};
      if (booking?.checkIn) searchParams.checkIn = booking.checkIn;
      if (booking?.checkOut) searchParams.checkOut = booking.checkOut;
      const rooms = await roomsService.getRooms(searchParams);
      console.log('[AssignRoomModal] Fetched rooms:', rooms);

      // Handle both array and items wrapper
      const roomsArray = Array.isArray(rooms) ? rooms : (rooms?.items || []);

      // Transform API response to match expected format
      const transformedRooms = roomsArray.map((room: any) => ({
        id: room.id,
        roomNumber: room.number || room.roomNumber || String(room.id),
        type: room.category || room.roomType?.name || room.room_type?.name || room.name?.split(' ').slice(0, -1).join(' ') || 'Standard',
        floor: room.floor || 1,
        status: room.status || 'available',
        price: room.price || room.roomType?.base_price || 0,
        maxOccupancy: room.maxGuests || room.max_occupancy || room.maxOccupancy || 2,
        features: room.amenities || room.features || [],
        bedType: room.bedType || room.bed_type || 'King',
        view: room.view || room.view_type || 'Standard',
        available: room.available,
      }));

      console.log('[AssignRoomModal] Transformed rooms:', transformedRooms);
      setRoomsData(transformedRooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      setRoomsData([]);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Get available rooms
  const availableRooms = useMemo(() => {
    if (!roomsData || roomsData.length === 0) return [];

    return roomsData.filter(room => {
      // Use backend-computed availability (date-range based) when present
      if (typeof room.available === 'boolean') {
        if (!room.available) return false;
      } else {
        // Fallback: exclude only truly unavailable statuses
        const roomStatus = (room.status || '').toLowerCase();
        if (['occupied', 'maintenance', 'out_of_service'].includes(roomStatus)) return false;
      }

      // Check for date conflicts if booking has dates
      if (booking?.checkIn && booking?.checkOut && bookings.length > 0) {
        const hasConflict = bookings.some(b =>
          b.room === room.roomNumber &&
          b.status !== 'CANCELLED' &&
          b.status !== 'CHECKED-OUT' &&
          b.status !== 'cancelled' &&
          b.status !== 'checked_out' &&
          new Date(b.checkIn) < new Date(booking.checkOut) &&
          new Date(b.checkOut) > new Date(booking.checkIn)
        );
        if (hasConflict) return false;
      }

      return true;
    });
  }, [roomsData, booking, bookings]);

  // Filter and search rooms
  const filteredRooms = useMemo(() => {
    let rooms = [...availableRooms];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      rooms = rooms.filter(room =>
        room.roomNumber?.toLowerCase().includes(query) ||
        room.type?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      rooms = rooms.filter(room => room.type === filterType);
    }

    // Apply floor filter
    if (filterFloor !== 'all') {
      rooms = rooms.filter(room => room.floor === parseInt(filterFloor));
    }

    return rooms;
  }, [availableRooms, searchQuery, filterType, filterFloor]);

  // Get unique room types
  const roomTypes = useMemo(() => {
    const types = new Set(availableRooms.map(r => r.type));
    return Array.from(types).sort();
  }, [availableRooms]);

  // Get unique floors
  const floors = useMemo(() => {
    const floorSet = new Set(availableRooms.map(r => r.floor));
    return Array.from(floorSet).sort((a, b) => a - b);
  }, [availableRooms]);

  const handleSubmit = async () => {
    if (selectedRoom) {
      // If DNM was on and user unchecked it, disable DNM BEFORE the room move
      if (booking?.id && !dnmEnabled && (booking?.doNotMove || false)) {
        try {
          await bookingService.toggleDNM(booking.id, false);
        } catch (err) {
          console.error('[AssignRoomModal] Failed to disable DNM:', err);
        }
      }

      await onAssign({
        id: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        number: selectedRoom.roomNumber,
        type: selectedRoom.type,
        roomType: selectedRoom.type,
        floor: selectedRoom.floor,
        price: selectedRoom.price,
      });

      // If user explicitly enabled DNM, toggle it after assignment
      if (booking?.id && dnmEnabled && !(booking?.doNotMove || false)) {
        try {
          await bookingService.toggleDNM(booking.id, true);
        } catch (err) {
          console.error('[AssignRoomModal] Failed to enable DNM:', err);
        }
      }

      setSelectedRoom(null);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div
        className={`fixed top-0 bottom-0 right-0 h-screen w-full max-w-[700px] bg-white shadow-xl border-l border-neutral-200 z-[70] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900">Assign Room</h2>
            <p className="text-sm text-neutral-600 mt-1">
              {booking ? `Select a room for ${booking.guest}` : 'Select an available room'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A57865]"
          >
            <X className="w-5 h-5 text-neutral-600 hover:text-neutral-900 transition-colors" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div className="p-6 space-y-6">
            {/* Booking Info */}
            {booking && (
              <div className="p-4 bg-[#FAF8F6] rounded-xl border border-neutral-200">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 mb-3">
                  <div className="w-1 h-5 bg-[#A57865] rounded-full"></div>
                  <h3 className="text-sm font-bold text-neutral-900">Booking Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-medium text-neutral-500 block">Guest</span>
                    <span className="text-sm font-semibold text-neutral-900">{booking.guest}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-neutral-500 block">Booking ID</span>
                    <span className="text-sm font-mono text-neutral-700">{booking.id}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-neutral-500 block">Check-in</span>
                    <span className="text-sm text-neutral-700">{booking.checkIn}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-neutral-500 block">Check-out</span>
                    <span className="text-sm text-neutral-700">{booking.checkOut}</span>
                  </div>
                  {booking.roomType && (
                    <div className="col-span-2 pt-2 border-t border-neutral-200">
                      <span className="text-xs font-medium text-neutral-500 block">Requested Type</span>
                      <span className="text-sm font-semibold text-[#A57865]">{booking.roomType}</span>
                    </div>
                  )}

                  {/* DNM indicator if already locked */}
                  {booking.doNotMove && (
                    <div className="col-span-2 pt-2 border-t border-neutral-200">
                      <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-xs font-medium">DNM — Room assignment is locked</span>
                          {booking.dnmSetByName && (
                            <span className="text-[10px] text-amber-600 block mt-0.5">
                              Locked by {booking.dnmSetByName}
                              {booking.dnmSetAt && ` on ${new Date(booking.dnmSetAt).toLocaleDateString()}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Checked-in lock notice for non-admin */}
                  {isCheckedInLocked && (
                    <div className="col-span-2 pt-2 border-t border-neutral-200">
                      <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2.5 py-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs font-medium">
                          Checked-in rooms can only be reassigned by Admin or Manager
                        </span>
                      </div>
                    </div>
                  )}

                  {/* DNM toggle */}
                  <div className="col-span-2 pt-2 border-t border-neutral-200">
                    <label className={`flex items-center gap-2 group ${
                      booking.doNotMove && !isAdminOrManager && booking.dnmSetBy !== user?.id
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }`}>
                      <input
                        type="checkbox"
                        checked={dnmEnabled}
                        onChange={(e) => setDnmEnabled(e.target.checked)}
                        disabled={booking.doNotMove && !isAdminOrManager && booking.dnmSetBy !== user?.id}
                        className="w-3.5 h-3.5 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865] disabled:opacity-50"
                      />
                      <span className="flex items-center gap-1 text-xs text-neutral-600 group-hover:text-neutral-800">
                        {dnmEnabled ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        Do Not Move (DNM)
                      </span>
                      <span className="text-[10px] text-neutral-400 ml-auto">
                        {booking.doNotMove && !isAdminOrManager && booking.dnmSetBy !== user?.id
                          ? 'Only setter or manager can unlock'
                          : 'Lock room assignment'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by room number or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:bg-white transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <SimpleDropdown
                  value={filterType}
                  onChange={setFilterType}
                  options={[
                    { value: 'all', label: 'All Types' },
                    ...roomTypes.map(type => ({ value: type, label: type }))
                  ]}
                  placeholder="All Types"
                  className="flex-1"
                />
                <SimpleDropdown
                  value={filterFloor}
                  onChange={setFilterFloor}
                  options={[
                    { value: 'all', label: 'All Floors' },
                    ...floors.map(floor => ({ value: String(floor), label: `Floor ${floor}` }))
                  ]}
                  placeholder="All Floors"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Available Rooms */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#A57865] rounded-full"></div>
                  <h3 className="text-sm font-bold text-neutral-900">Available Rooms</h3>
                </div>
                <span className="text-xs text-neutral-500">{filteredRooms.length} rooms available</span>
              </div>

              {isLoadingRooms ? (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 text-[#A57865] mx-auto mb-3 animate-spin" />
                  <p className="text-sm text-neutral-500">Loading available rooms...</p>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center py-8">
                  <Bed className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">No rooms available</p>
                  <p className="text-xs text-neutral-400 mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredRooms.map((room) => (
                    <button
                      key={room.roomNumber}
                      onClick={() => !isCheckedInLocked && setSelectedRoom(room)}
                      disabled={isCheckedInLocked}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedRoom?.roomNumber === room.roomNumber
                          ? 'border-[#A57865] bg-[#A57865]/5 shadow-sm'
                          : 'border-neutral-200 hover:border-[#A57865]/50 hover:bg-neutral-50 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                            selectedRoom?.roomNumber === room.roomNumber
                              ? 'bg-[#A57865] text-white'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            <span className="font-bold text-lg leading-tight">{room.roomNumber}</span>
                            <span className="text-[10px] opacity-70">Floor {room.floor}</span>
                          </div>
                          <div>
                            <p className="font-bold text-base text-neutral-900">{room.type}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs text-neutral-500">
                                <Users className="w-3 h-3" />
                                <span>{room.maxOccupancy || 2} guests</span>
                              </div>
                              <span className="text-neutral-300">|</span>
                              <span className="text-sm font-semibold text-[#A57865]">
                                {formatCurrency(room.price)}/night
                              </span>
                            </div>
                          </div>
                        </div>

                        {selectedRoom?.roomNumber === room.roomNumber && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#A57865]">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Room Features */}
                      {room.features && room.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-neutral-200">
                          {room.features.slice(0, 4).map((feature, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                          {room.features.length > 4 && (
                            <span className="px-2 py-1 text-xs text-neutral-400">
                              +{room.features.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Footer - Sticky */}
        <div className="flex-shrink-0 bg-white border-t border-neutral-200 px-6 py-4 shadow-lg">
          {selectedRoom && (
            <div className="mb-3 p-3 bg-[#A57865]/5 border border-[#A57865]/20 rounded-lg">
              <p className="text-sm text-neutral-700">
                <span className="font-medium">Selected:</span>{' '}
                Room {selectedRoom.roomNumber} - {selectedRoom.type}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!selectedRoom || isAssigning || isCheckedInLocked} icon={Check} loading={isAssigning} className="flex-1">
              {isAssigning ? 'Assigning...' : isRoomMove ? 'Move Room' : 'Assign Room'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
