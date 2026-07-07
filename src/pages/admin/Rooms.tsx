import { useState, useMemo } from 'react';
import { useRooms } from '../../hooks/admin/useRooms';
import { usePagination } from '../../hooks/usePagination';
import { useDrawer } from '../../hooks/useDrawer';
import { useModal } from '../../hooks/useModal';
import { useToast } from '../../contexts/ToastContext';
import { Download, Plus, Grid3X3, Calendar } from 'lucide-react';

import RoomsTabs from '../../components/rooms/RoomsTabs';
import RoomsSearch from '../../components/rooms/RoomsSearch';
import RoomsFilters from '../../components/rooms/RoomsFilters';
import RoomsGrid from '../../components/rooms/RoomsGrid';
import RoomCalendar from '../../components/rooms/RoomCalendar';
import Pagination from '../../components/bookings/Pagination';
import RoomDrawer from '../../components/rooms/RoomDrawer';
import AddRoomModal from '../../components/rooms/modals/AddRoomModal';
import EditRoomModal from '../../components/rooms/modals/EditRoomModal';
import ChangeStatusModal from '../../components/rooms/modals/ChangeStatusModal';
import AssignGuestModal from '../../components/rooms/modals/AssignGuestModal';
import BlockRoomModal from '../../components/rooms/modals/BlockRoomModal';
import { ConfirmModal } from '../../components/ui2/Modal';
import { Button, ButtonGroup } from '../../components/ui2/Button';
import RequestCleaningModal from '../../components/modals/RequestCleaningModal';

export default function Rooms() {
  // View mode state (grid, calendar)
  const [viewMode, setViewMode] = useState('grid');

  // Toast notifications
  const toast = useToast();

  // Master state management
  const {
    rooms,
    rawRooms,
    allBookings,
    isLoading: isLoadingRooms,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    updateRoom,
    updateStatus,
    setCleaningState,
    assignGuestToRoom,
    unassignGuest,
    blockRoom,
    unblockRoom,
    addRoom,
    deleteRoom
  } = useRooms();

  // Pagination
  const pagination = usePagination(rooms, 12);

  // Drawer for room details
  const drawer = useDrawer();

  // Modals
  const addRoomModal = useModal();
  const editRoomModal = useModal();
  const changeStatusModal = useModal();
  const assignGuestModal = useModal();
  const blockRoomModal = useModal();

  // Transform bookings from useRooms for calendar consumption (no extra API call)
  const calendarBookings = useMemo(() => {
    return allBookings.map((b: any) => {
      // Resolve room number — must match room.roomNumber used by RoomCalendar
      let room = '';
      const roomId = b.room_id || (b.room && typeof b.room === 'object' ? b.room.id : null);

      // Try direct number field first
      if (b.room && typeof b.room === 'object') {
        room = b.room.number || '';
      } else if (b.room_number) {
        room = String(b.room_number);
      }

      // If no room number yet, cross-reference by ID against rawRooms
      if (!room && roomId) {
        const matched = rawRooms.find(r => String(r.id) === String(roomId));
        if (matched) room = matched.roomNumber;
      }

      // Last resort: if b.room is a raw value (string/number), check if it's an ID
      if (!room && b.room && typeof b.room !== 'object') {
        const asStr = String(b.room);
        // Check if it matches a roomNumber directly
        const directMatch = rawRooms.find(r => r.roomNumber === asStr);
        if (directMatch) {
          room = asStr;
        } else {
          // Try as room ID
          const idMatch = rawRooms.find(r => String(r.id) === asStr);
          if (idMatch) room = idMatch.roomNumber;
        }
      }

      // Extract guest name
      let guest = 'Guest';
      if (b.guestInfo) {
        guest = `${b.guestInfo.firstName || ''} ${b.guestInfo.lastName || ''}`.trim() || 'Guest';
      } else if (b.guest_name) {
        guest = b.guest_name;
      } else if (b.guest && typeof b.guest === 'object') {
        guest = `${b.guest.first_name || ''} ${b.guest.last_name || ''}`.trim() || 'Guest';
      } else if (b.guest) {
        guest = String(b.guest);
      }

      return {
        id: b.id,
        room,
        checkIn: b.arrival_date || b.checkIn,
        checkOut: b.departure_date || b.checkOut,
        guest,
        status: b.status,
      };
    });
  }, [allBookings, rawRooms]);

  // Request cleaning state
  const [cleaningRoom, setCleaningRoom] = useState<any>(null);

  // Confirmation states
  const [unassignConfirm, setUnassignConfirm] = useState({ isOpen: false, room: null });
  const [unblockConfirm, setUnblockConfirm] = useState({ isOpen: false, room: null });

  // Calculate tab counts
  const tabCounts = {
    all: rawRooms.length,
    available: rawRooms.filter(r => r.status === 'available' || r.status === 'clean' || r.status === 'inspected').length,
    occupied: rawRooms.filter(r => r.status === 'occupied').length,
    dirty: rawRooms.filter(r => r.status === 'dirty' || r.cleaning === 'dirty').length,
    in_progress: rawRooms.filter(r => r.status === 'in_progress' || r.cleaning === 'in_progress').length,
    clean: rawRooms.filter(r => r.status === 'clean' || r.cleaning === 'clean').length,
    inspected: rawRooms.filter(r => r.status === 'inspected' || r.cleaning === 'inspected').length,
    maintenance: rawRooms.filter(r => r.status === 'maintenance').length,
    out_of_service: rawRooms.filter(r => r.status === 'out_of_service').length,
    out_of_order: rawRooms.filter(r => r.status === 'out_of_order').length
  };

  // Extract unique room types and floors from actual API data
  const roomTypes = [...new Set(rawRooms.map(r => r.type).filter(Boolean))].sort();
  const floorsList = [...new Set(rawRooms.map(r => r.floor).filter(f => f !== undefined && f !== null))].sort((a, b) => a - b);

  // Event Handlers
  const handleRoomClick = (room) => {
    drawer.openDrawer(room);
  };

  const handleUpdateStatus = (room) => {
    drawer.closeDrawer();
    changeStatusModal.openModal(room);
  };

  const handleSaveStatus = (roomId, newStatus) => {
    updateStatus(roomId, newStatus);
    // Update drawer data if it's the same room
    if (drawer.data && drawer.data.id === roomId) {
      const updatedRoom = rawRooms.find(r => r.id === roomId);
      if (updatedRoom) {
        drawer.openDrawer({ ...updatedRoom, status: newStatus });
      }
    }
    toast.success('Room status updated successfully!');
  };

  const handleAssignGuest = (room, prefilledCheckIn?: string) => {
    drawer.closeDrawer();
    assignGuestModal.openModal({ ...room, _prefilledCheckIn: prefilledCheckIn });
  };

  // BUG-013 / BUG-016: Pass full guest data (including checkIn/checkOut) to assignGuestToRoom
  const handleAssign = async (roomId, guest) => {
    try {
      await assignGuestToRoom(roomId, guest);
      // Close drawer and show success
      drawer.closeDrawer();
      toast.success(`Guest ${guest.name} assigned to room successfully!`);
    } catch (err) {
      console.error('[Rooms] handleAssign error:', err);
      toast.error('Failed to assign guest to room');
    }
  };

  const handleUnassignGuest = (room) => {
    setUnassignConfirm({ isOpen: true, room });
  };

  const confirmUnassign = () => {
    if (unassignConfirm.room) {
      unassignGuest(unassignConfirm.room.id);
      drawer.closeDrawer();
      toast.success('Guest unassigned successfully!');
    }
    setUnassignConfirm({ isOpen: false, room: null });
  };

  const handleMarkClean = (room) => {
    setCleaningState(room.id, 'clean');
    // Update drawer data
    const updatedRoom = rawRooms.find(r => r.id === room.id);
    if (updatedRoom) {
      drawer.openDrawer({ ...updatedRoom, cleaning: 'clean' });
    }
    toast.success('Room marked as clean!');
  };

  const handleMarkDirty = (room) => {
    setCleaningState(room.id, 'dirty');
    // Update drawer data
    const updatedRoom = rawRooms.find(r => r.id === room.id);
    if (updatedRoom) {
      drawer.openDrawer({ ...updatedRoom, cleaning: 'dirty' });
    }
    toast.warning('Room marked as dirty');
  };

  const handleBlockRoom = (room) => {
    drawer.closeDrawer();
    blockRoomModal.openModal(room);
  };

  const handleBlock = (roomId, reason, until, statusType = 'out_of_service') => {
    blockRoom(roomId, reason, until, statusType);
    drawer.closeDrawer();
    toast.success(statusType === 'out_of_order' ? 'Room set to Out of Order!' : 'Room blocked successfully!');
  };

  const handleUnblockRoom = (room) => {
    setUnblockConfirm({ isOpen: true, room });
  };

  const confirmUnblock = () => {
    if (unblockConfirm.room) {
      unblockRoom(unblockConfirm.room.id);
      drawer.closeDrawer();
      toast.success('Room unblocked successfully!');
    }
    setUnblockConfirm({ isOpen: false, room: null });
  };

  const handleRequestCleaning = (room) => {
    setCleaningRoom(room);
  };

  const handleAddRoom = () => {
    addRoomModal.openModal();
  };

  const handleSaveNewRoom = async (roomData) => {
    if (addRoom) {
      await addRoom(roomData);
      toast.success('New room added successfully!');
    }
  };

  const handleEditRoom = (room) => {
    editRoomModal.openModal(room);
  };

  const handleSaveEditRoom = (roomId, updatedRoom) => {
    updateRoom(roomId, updatedRoom);
    // Update drawer data if it's the same room
    if (drawer.data && drawer.data.id === roomId) {
      drawer.openDrawer({ ...drawer.data, ...updatedRoom });
    }
    toast.success('Room updated successfully!');
  };

  const handleExportRooms = () => {
    if (!rooms || rooms.length === 0) {
      toast.warning('No rooms to export');
      return;
    }

    const headers = [
      'Room Number',
      'Type',
      'Floor',
      'Status',
      'Cleaning',
      'Bed Type',
      'Capacity',
      'Price',
      'Amenities',
      'Current Guest'
    ];

    const rows = rooms.map(room => [
      room.roomNumber || '',
      room.type || '',
      room.floor || '',
      room.status || '',
      room.cleaning || '',
      room.bedType || '',
      room.capacity || '',
      room.price || '',
      (room.amenities || []).join('; '),
      room.guests?.name || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `rooms_export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Rooms exported successfully!');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Rooms
            </h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              Manage room inventory and availability
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle */}
            <ButtonGroup>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                icon={Grid3X3}
                onClick={() => setViewMode('grid')}
                size="md"
                className={viewMode !== 'grid' ? 'bg-white' : ''}
              />
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'outline'}
                icon={Calendar}
                onClick={() => setViewMode('calendar')}
                size="md"
                className={viewMode !== 'calendar' ? 'bg-white' : ''}
              />
            </ButtonGroup>

            <Button variant="outline" icon={Download} onClick={handleExportRooms} className="hidden sm:flex">
              Export
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex items-center gap-1 p-1.5 bg-white rounded-lg w-fit">
            <RoomsTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={tabCounts}
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-[400px]">
            <RoomsSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
          <RoomsFilters
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            roomTypes={roomTypes}
            floors={floorsList}
          />
        </div>

        {/* Content based on view mode */}
        {viewMode === 'grid' ? (
          <>
            {/* Rooms Grid */}
            <RoomsGrid rooms={pagination.currentPageData} onRoomClick={handleRoomClick} isLoading={isLoadingRooms} />

            {/* Pagination */}
            {rooms.length > 0 && (
              <div className="bg-white rounded-[10px] px-4 sm:px-6 py-3 sm:py-4">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  startIndex={pagination.startIndex}
                  endIndex={pagination.endIndex}
                  totalItems={pagination.totalItems}
                  canGoPrev={pagination.canGoPrev}
                  canGoNext={pagination.canGoNext}
                  onPrevPage={pagination.prevPage}
                  onNextPage={pagination.nextPage}
                  onGoToPage={pagination.goToPage}
                />
              </div>
            )}
          </>
        ) : (
          /* Calendar View */
          <RoomCalendar
            rooms={rooms}
            bookings={calendarBookings}
            isLoading={isLoadingRooms}
            onRoomClick={handleRoomClick}
            onDateClick={(room, day, status) => {
              if (status.status === 'available') {
                handleAssignGuest(room, day.dateStr);
              } else if (status.status === 'booked') {
                handleRoomClick(room);
              }
            }}
          />
        )}

        {/* Room Drawer */}
        <RoomDrawer
          room={drawer.data}
          isOpen={drawer.isOpen}
          onClose={drawer.closeDrawer}
          onUpdateStatus={handleUpdateStatus}
          onAssignGuest={handleAssignGuest}
          onMarkClean={handleMarkClean}
          onMarkDirty={handleMarkDirty}
          onBlockRoom={handleBlockRoom}
          onUnassignGuest={handleUnassignGuest}
          onUnblockRoom={handleUnblockRoom}
          onRequestCleaning={handleRequestCleaning}
        />

        {/* Add Room Modal */}
        <AddRoomModal
          isOpen={addRoomModal.isOpen}
          onClose={addRoomModal.closeModal}
          onAdd={handleSaveNewRoom}
        />

        {/* Edit Room Modal */}
        <EditRoomModal
          room={editRoomModal.data}
          isOpen={editRoomModal.isOpen}
          onClose={editRoomModal.closeModal}
          onSave={handleSaveEditRoom}
        />

        {/* Change Status Modal */}
        <ChangeStatusModal
          room={changeStatusModal.data}
          isOpen={changeStatusModal.isOpen}
          onClose={changeStatusModal.closeModal}
          onSave={handleSaveStatus}
        />

        {/* Assign Guest Modal */}
        <AssignGuestModal
          room={assignGuestModal.data}
          isOpen={assignGuestModal.isOpen}
          onClose={assignGuestModal.closeModal}
          onAssign={handleAssign}
          allBookings={allBookings}
        />

        {/* Block Room Modal */}
        <BlockRoomModal
          room={blockRoomModal.data}
          isOpen={blockRoomModal.isOpen}
          onClose={blockRoomModal.closeModal}
          onBlock={handleBlock}
        />

        {/* Request Cleaning Modal */}
        <RequestCleaningModal
          isOpen={!!cleaningRoom}
          onClose={() => setCleaningRoom(null)}
          onSuccess={() => {
            toast.success('Cleaning request submitted');
            setCleaningRoom(null);
          }}
          roomId={cleaningRoom?.id || 0}
          roomNumber={cleaningRoom?.roomNumber || ''}
          guestName={cleaningRoom?.guests?.name}
        />

        {/* Unassign Guest Confirmation Modal */}
        <ConfirmModal
          open={unassignConfirm.isOpen}
          onClose={() => setUnassignConfirm({ isOpen: false, room: null })}
          onConfirm={confirmUnassign}
          title="Unassign Guest"
          description={`Are you sure you want to unassign ${unassignConfirm.room?.guests?.name || 'the guest'} from room ${unassignConfirm.room?.roomNumber}?`}
          variant="warning"
          confirmText="Unassign"
          cancelText="Cancel"
        />

        {/* Unblock Room Confirmation Modal */}
        <ConfirmModal
          open={unblockConfirm.isOpen}
          onClose={() => setUnblockConfirm({ isOpen: false, room: null })}
          onConfirm={confirmUnblock}
          title="Unblock Room"
          description={`Are you sure you want to unblock room ${unblockConfirm.room?.roomNumber}?`}
          variant="primary"
          confirmText="Unblock"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
}
