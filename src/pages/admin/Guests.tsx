import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGuests } from '../../hooks/admin/useGuests';
import { useDrawer } from '../../hooks/useDrawer';
import { useModal } from '../../hooks/useModal';
import { useAdminSafe } from '../../contexts/AdminContext';
import GuestsTabs from '../../components/guests/GuestsTabs';
import GuestsSearch from '../../components/guests/GuestsSearch';
import GuestsFilters from '../../components/guests/GuestsFilters';
import GuestsActions from '../../components/guests/GuestsActions';
import GuestsTable from '../../components/guests/GuestsTable';
import Pagination from '../../components/bookings/Pagination';
import GuestDrawer from '../../components/guests/GuestDrawer';
import AddGuestModal from '../../components/guests/AddGuestModal';
import EditGuestModal from '../../components/guests/EditGuestModal';
import MessageGuestModal from '../../components/admin-panel/guests/MessageGuestModal';
import DeleteGuestModal from '../../components/guests/DeleteGuestModal';
import { ConfirmModal } from '../../components/ui2/Modal';
import {
  exportGuestsToCSV,
  calculateLoyaltyTier,
} from '../../utils/guests';
import { guestsService } from '../../api/services/guests.service';

export default function Guests() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminContext = useAdminSafe();

  // Master state management with server-side pagination
  const {
    guests,
    rawGuests,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    sortField,
    sortDirection,
    handleSort,
    updateGuest,
    addGuest,
    deleteGuest,
    // Server-side pagination
    pagination,
    goToPage,
    nextPage,
    prevPage,
  } = useGuests(10); // 10 items per page

  // Drawer for guest profile
  const drawer = useDrawer();

  // Modals
  const addModal = useModal();
  const editModal = useModal();
  const messageModal = useModal();
  const deleteModal = useModal();

  // Loading states
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blacklistConfirm, setBlacklistConfirm] = useState({ isOpen: false, guest: null });

  // Auto-open guest drawer when navigating from a notification with guestId
  useEffect(() => {
    const state = location.state as { guestId?: string } | null;
    if (state?.guestId && rawGuests.length > 0) {
      const guest = rawGuests.find(g => String(g.id) === state.guestId);
      if (guest) {
        drawer.openDrawer(guest);
      }
      // Clear navigation state so it doesn't re-trigger on re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, rawGuests]);

  // Event Handlers
  const handleGuestClick = (guest) => {
    drawer.openDrawer(guest);
  };

  const handleEditGuest = (guest) => {
    drawer.closeDrawer();
    editModal.openModal(guest);
  };

  const handleMessageGuest = (guest) => {
    drawer.closeDrawer();
    messageModal.openModal(guest);
  };

  const handleBlacklistGuest = (guestOrId) => {
    const guest = typeof guestOrId === 'object' ? guestOrId : { id: guestOrId };
    setBlacklistConfirm({ isOpen: true, guest });
  };

  const confirmBlacklist = () => {
    if (blacklistConfirm.guest) {
      updateGuest(blacklistConfirm.guest.id, { status: 'Blacklisted' });
      drawer.closeDrawer();
    }
    setBlacklistConfirm({ isOpen: false, guest: null });
  };

  const handleDeleteGuest = (guest) => {
    drawer.closeDrawer();
    deleteModal.openModal(guest);
  };

  const handleConfirmDelete = async (guestId) => {
    setIsDeleting(true);
    try {
      if (deleteGuest) {
        deleteGuest(guestId);
      }
      deleteModal.closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveGuestEdit = async (guestId, updates) => {
    setIsSaving(true);
    try {
      await updateGuest(guestId, updates);
      toast.success('Guest updated successfully');
      editModal.closeModal();
    } catch (error: any) {
      console.error('Failed to update guest:', error);
      toast.error(error?.response?.data?.detail || 'Failed to update guest. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = (guestId, messageData) => {
    console.log('Sending message to guest:', guestId, messageData);
    alert(`Message sent to ${messageModal.data.name}!`);
    messageModal.closeModal();
  };

  const handleAddGuest = () => {
    addModal.openModal();
  };

  const handleSaveNewGuest = async (guestData) => {
    setIsAdding(true);
    try {
      if (addGuest) {
        await addGuest(guestData);
        toast.success(`Guest "${guestData.firstName} ${guestData.lastName}" added successfully`);
      }
      addModal.closeModal();
    } catch (error: any) {
      console.error('Failed to add guest:', error);
      toast.error(error?.response?.data?.detail || 'Failed to add guest. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleExportGuests = () => {
    exportGuestsToCSV(guests, `guests_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleViewProfile = (guest) => {
    drawer.closeDrawer();
    navigate(`/admin/guests/${guest.id}`);
  };

  const handleAddNote = async (guestId, noteText) => {
    try {
      const result = await guestsService.addNote(guestId, { text: noteText });
      // Refresh drawer with updated notes from API
      const notesData = await guestsService.getNotes(guestId);
      const notes = notesData?.notes || notesData || [];
      if (drawer.data?.id === guestId) {
        drawer.openDrawer({ ...drawer.data, notes });
      }
      toast.success('Note saved successfully');
    } catch (err) {
      console.error('Failed to add note:', err);
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = async (guestId, noteId) => {
    try {
      await guestsService.deleteNote(guestId, noteId);
      // Refresh drawer with updated notes from API
      const notesData = await guestsService.getNotes(guestId);
      const notes = notesData?.notes || notesData || [];
      if (drawer.data?.id === guestId) {
        drawer.openDrawer({ ...drawer.data, notes });
      }
      toast.success('Note deleted');
    } catch (err) {
      console.error('Failed to delete note:', err);
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Guests</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              Manage your guest database and communication.
            </p>
          </div>
          <GuestsActions onAddGuest={handleAddGuest} onExport={handleExportGuests} />
        </header>

        {/* Main Guests Card (CMS-consistent) */}
        <div className="bg-white rounded-[10px] overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-neutral-100">
            <div className="px-3 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between overflow-x-auto">
              <GuestsTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={{
                  all: rawGuests.length,
                  returning: rawGuests.filter(g => g.totalStays > 1).length,
                  vip: rawGuests.filter(g => g.status === 'vip').length,
                  blacklisted: rawGuests.filter(g => g.status === 'blacklisted').length,
                }}
              />
            </div>
          </div>

          {/* Search & Filters Row */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-full sm:flex-1 sm:max-w-md">
                <GuestsSearch value={searchQuery} onChange={setSearchQuery} />
              </div>
              <div className="hidden sm:block sm:flex-1" />
              <GuestsFilters
                filters={filters}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                countries={Array.from(new Set(rawGuests.map(g => g.country))).sort()}
              />
            </div>
          </div>

          {/* Guests Table */}
          <GuestsTable
            guests={guests}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onGuestClick={handleGuestClick}
            onEditGuest={handleEditGuest}
            onMessageGuest={handleMessageGuest}
            onDeleteGuest={handleDeleteGuest}
          />

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                startIndex={(pagination.page - 1) * pagination.pageSize + 1}
                endIndex={Math.min(pagination.page * pagination.pageSize, pagination.total)}
                totalItems={pagination.total}
                canGoPrev={pagination.page > 1}
                canGoNext={pagination.page < pagination.totalPages}
                onPrevPage={() => prevPage()}
                onNextPage={() => nextPage()}
                onGoToPage={(page) => goToPage(page)}
              />
            </div>
          )}
        </div>

      {/* Guest Drawer */}
      <GuestDrawer
        guest={drawer.data}
        isOpen={drawer.isOpen}
        onClose={drawer.closeDrawer}
        onEdit={() => handleEditGuest(drawer.data)}
        onMessage={() => handleMessageGuest(drawer.data)}
        onBlacklist={() => handleBlacklistGuest(drawer.data)}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        onViewProfile={handleViewProfile}
      />

      {/* Add Guest Modal */}
      <AddGuestModal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        onSubmit={handleSaveNewGuest}
        isAdding={isAdding}
      />

      {/* Edit Guest Modal */}
      <EditGuestModal
        guest={editModal.data}
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSave={handleSaveGuestEdit}
        isSaving={isSaving}
      />

      {/* Delete Guest Modal */}
      <DeleteGuestModal
        guest={deleteModal.data}
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Message Guest Modal */}
      <MessageGuestModal
        guest={messageModal.data}
        isOpen={messageModal.isOpen}
        onClose={messageModal.closeModal}
        onSend={handleSendMessage}
      />

        {/* Blacklist Confirmation Modal */}
        <ConfirmModal
          open={blacklistConfirm.isOpen}
          onClose={() => setBlacklistConfirm({ isOpen: false, guest: null })}
          onConfirm={confirmBlacklist}
          title="Blacklist Guest"
          description={`Are you sure you want to blacklist ${blacklistConfirm.guest?.name || 'this guest'}? This action can be undone later.`}
          variant="warning"
          confirmText="Blacklist"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
}
