import { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, Plus, Wand2, Download, RefreshCw, Loader2, QrCode, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui2/Button';
import { Select } from '../../components/ui2/Input';
import { useHousekeeping } from '../../hooks/admin/useHousekeeping';
import { useHKFilters } from '../../hooks/useHKFilters';
import { useHKSorting } from '../../hooks/useHKSorting';
import { useHKSearch } from '../../hooks/useHKSearch';
import { useToast } from '../../hooks/useToast';
import { usePagination } from '../../hooks/usePagination';
import { exportHKToCSV, exportHKToPDF } from '../../utils/housekeeping';
import HKKPI from '../../components/housekeeping/HKKPI';
import HousekeepingTabs from '../../components/housekeeping/HousekeepingTabs';
import HousekeepingSearch from '../../components/housekeeping/HousekeepingSearch';
import HousekeepingFilters from '../../components/housekeeping/HousekeepingFilters';
import HKRoomTable from '../../components/housekeeping/HKRoomTable';
import StaffView from '../../components/housekeeping/StaffView';
import FloorView from '../../components/housekeeping/FloorView';
import HKStaffPerformance from '../../components/housekeeping/HKStaffPerformance';
import RoomDrawer from '../../components/housekeeping/RoomDrawer';
import AssignHousekeeperModal from '../../components/housekeeping/modals/AssignHousekeeperModal';
import BulkAssignModal from '../../components/housekeeping/modals/BulkAssignModal';
import EditChecklistModal from '../../components/housekeeping/modals/EditChecklistModal';
import AddCleaningTaskModal from '../../components/housekeeping/modals/AddCleaningTaskModal';
import { ScanDigitalKeyModal } from '../../components/housekeeping/modals/ScanDigitalKeyModal';
import { ForceAssignModal } from '../../components/common/ForceAssignModal';
import { StaffAvailabilityAlert } from '../../components/common/StaffAvailabilityAlert';
import Toast from '../../components/common/Toast';
import RequestCleaningModal from '../../components/modals/RequestCleaningModal';
import AutoAssignResultsModal from '../../components/housekeeping/modals/AutoAssignResultsModal';
import ExportOptionsModal from '../../components/housekeeping/modals/ExportOptionsModal';
import Pagination from '../../components/bookings/Pagination';
import { SORTABLE_FIELDS } from '../../utils/housekeepingSort';
import { api } from '../../lib/api';

export default function Housekeeping() {
  // Main housekeeping hook with all CRUD operations
  const {
    rooms,
    staff,
    staffLoading,
    refreshData,
    assignStaffToRoom,
    bulkAssignRooms,
    unassignStaff,
    startCleaning,
    markRoomCleaned,
    markRoomDirty,
    blockRoom,
    unblockRoom,
    toggleChecklistItem,
    editChecklist,
    inspectRoom,
    runAutoAssign,
    addCleaningTask,
    addNote
  } = useHousekeeping();

  // Tab state
  const [activeTab, setActiveTab] = useState('all');

  // Filtering
  const { filters, filteredRooms, updateFilter, clearFilters, hasActiveFilters } = useHKFilters(rooms);

  // Tab filtering (apply before other filters)
  const tabFilteredRooms = useMemo(() => {
    if (activeTab === 'all' || activeTab === 'by-staff' || activeTab === 'by-floor') {
      return filteredRooms;
    }
    return filteredRooms.filter(room => room.status === activeTab);
  }, [activeTab, filteredRooms]);

  // Search
  const { searchQuery, setSearchQuery, searchedRooms } = useHKSearch(tabFilteredRooms);

  // Sorting
  const { sortField, sortDirection, sortedRooms, handleSort } = useHKSorting(searchedRooms);

  // Pagination
  const {
    currentPageData,
    currentPage,
    totalPages,
    rowsPerPage,
    canGoPrev,
    canGoNext,
    startIndex,
    endIndex,
    totalItems,
    nextPage,
    prevPage,
    goToPage,
    setRowsPerPage
  } = usePagination(sortedRooms, 10);

  // Final rooms list
  const displayRooms = currentPageData;

  // Toast
  const { toast, showToast, hideToast } = useToast();

  // Drawer state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isEditChecklistModalOpen, setIsEditChecklistModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isScanKeyModalOpen, setIsScanKeyModalOpen] = useState(false);
  const [isForceAssignModalOpen, setIsForceAssignModalOpen] = useState(false);
  const [isAutoAssignResultsOpen, setIsAutoAssignResultsOpen] = useState(false);
  const [autoAssignResults, setAutoAssignResults] = useState<{
    assignments: Array<{ roomId: number; roomNumber?: string; staffId: number; staffName: string; score?: number }>;
    summary: string;
    totalAssigned: number;
    failed?: number;
  } | null>(null);
  const [taskForForceAssign, setTaskForForceAssign] = useState(null);
  const [roomForAction, setRoomForAction] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [cleaningRoom, setCleaningRoom] = useState<any>(null);

  // Staff availability state
  const [staffAvailability, setStaffAvailability] = useState({
    totalStaff: 0,
    availableCount: 0,
    busyCount: 0,
    pendingTasks: 0,
    urgentPending: 0,
    allStaffBusy: false,
    availableStaff: [],
    busyStaff: []
  });

  // Fetch staff availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await api.get('/housekeeping/staff/availability-status');
        setStaffAvailability({
          totalStaff: res.data.total_staff || 0,
          availableCount: res.data.available_count || 0,
          busyCount: res.data.busy_count || 0,
          pendingTasks: res.data.pending_tasks || 0,
          urgentPending: res.data.urgent_pending || 0,
          allStaffBusy: res.data.all_staff_busy || false,
          availableStaff: res.data.available_staff || [],
          busyStaff: res.data.busy_staff || []
        });
      } catch (err) {
        console.log('Staff availability check skipped');
      }
    };
    fetchAvailability();
    const interval = setInterval(fetchAvailability, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Calculate counts
  const counts = useMemo(() => {
    return {
      total: rooms.length,
      clean: rooms.filter(r => r.status === 'clean').length,
      dirty: rooms.filter(r => r.status === 'dirty').length,
      in_progress: rooms.filter(r => r.status === 'in_progress').length,
      inspected: rooms.filter(r => r.status === 'inspected').length,
      out_of_service: rooms.filter(r => r.status === 'out_of_service').length,
      out_of_order: rooms.filter(r => r.status === 'out_of_order').length,
      maintenance: rooms.filter(r => r.status === 'maintenance').length
    };
  }, [rooms]);

  // Drawer event handlers
  const handleRoomClick = (room) => {
    const latestRoom = rooms.find(r => r.id === room.id);
    setSelectedRoom(latestRoom || room);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedRoom(null), 300);
  };

  // Staff assignment
  const handleAssignClick = (room) => {
    setRoomForAction(room || selectedRoom);
    setIsAssignModalOpen(true);
  };

  const handleAssign = (roomId, staffId) => {
    assignStaffToRoom(roomId, staffId);
    showToast('Housekeeper assigned successfully', 'success');

    if (selectedRoom && selectedRoom.id === roomId) {
      const updatedRoom = rooms.find(r => r.id === roomId);
      setSelectedRoom(updatedRoom);
    }
  };

  // Bulk assign (BUG-023 FIX: pass priority and notes)
  const handleBulkAssign = (roomIds: number[], staffId: number, priority?: string, notes?: string) => {
    bulkAssignRooms(roomIds, staffId, priority, notes);
    showToast(`${roomIds.length} rooms assigned successfully`, 'success');
  };

  // Auto-assign with intelligent matching
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  const handleAutoAssign = async () => {
    setIsAutoAssigning(true);
    try {
      const result = await runAutoAssign();
      // Toast is already shown by runAutoAssign

      // Show detailed results modal if there are assignments
      if (result && result.assignments && result.assignments.length > 0) {
        // Enrich assignments with room numbers
        const enrichedAssignments = result.assignments.map((a: { roomId: number; staffId: number; staffName: string; score?: number }) => ({
          ...a,
          roomNumber: rooms.find(r => r.id === a.roomId)?.number
        }));

        setAutoAssignResults({
          assignments: enrichedAssignments,
          summary: result.summary || `${result.assignments.length} rooms assigned`,
          totalAssigned: result.assignments.length,
          failed: 0
        });
        setIsAutoAssignResultsOpen(true);
      }
    } catch (err) {
      showToast('Failed to auto-assign tasks', 'error');
    } finally {
      setIsAutoAssigning(false);
    }
  };

  // Add cleaning task
  const handleAddTask = (taskData) => {
    addCleaningTask(taskData);
    showToast('Cleaning task added successfully', 'success');
  };

  // Cleaning workflow
  const handleStartCleaning = (roomId) => {
    startCleaning(roomId);
    showToast('Cleaning started', 'info');

    if (selectedRoom && selectedRoom.id === roomId) {
      const updatedRoom = rooms.find(r => r.id === roomId);
      setSelectedRoom(updatedRoom);
    }
  };

  const handleMarkCleaned = (roomId) => {
    markRoomCleaned(roomId);
    showToast('Room marked as cleaned', 'success');

    if (selectedRoom && selectedRoom.id === roomId) {
      const updatedRoom = rooms.find(r => r.id === roomId);
      setSelectedRoom(updatedRoom);
    }
  };

  const handleMarkDirty = (roomId) => {
    markRoomDirty(roomId);
    showToast('Room marked as dirty', 'info');

    if (selectedRoom && selectedRoom.id === roomId) {
      const updatedRoom = rooms.find(r => r.id === roomId);
      setSelectedRoom(updatedRoom);
    }
  };

  // Inspection
  const handleInspect = (roomId) => {
    inspectRoom(roomId);
    showToast('Room inspected and verified', 'success');

    if (selectedRoom && selectedRoom.id === roomId) {
      const updatedRoom = rooms.find(r => r.id === roomId);
      setSelectedRoom(updatedRoom);
    }
  };

  // Block/unblock
  const handleBlockRoom = (roomId, reason) => {
    blockRoom(roomId, reason);
    showToast('Room blocked', 'info');

    if (selectedRoom && selectedRoom.id === roomId) {
      const updatedRoom = rooms.find(r => r.id === roomId);
      setSelectedRoom(updatedRoom);
    }
  };

  const handleUnblockRoom = (roomId) => {
    unblockRoom(roomId);
    showToast('Room unblocked', 'success');

    if (selectedRoom && selectedRoom.id === roomId) {
      const updatedRoom = rooms.find(r => r.id === roomId);
      setSelectedRoom(updatedRoom);
    }
  };

  // Checklist
  const handleToggleChecklistItem = (roomId, taskId) => {
    toggleChecklistItem(roomId, taskId);

    if (selectedRoom && selectedRoom.id === roomId) {
      const updatedRoom = rooms.find(r => r.id === roomId);
      setSelectedRoom(updatedRoom);

      const allCompleted = updatedRoom.checklist.every(item => item.completed);
      if (allCompleted) {
        showToast('All tasks completed! Room marked as clean', 'success');
      }
    }
  };

  const handleEditChecklistClick = () => {
    setRoomForAction(selectedRoom);
    setIsEditChecklistModalOpen(true);
  };

  const handleSaveChecklist = (roomId, newChecklist) => {
    editChecklist(roomId, newChecklist);
    showToast('Checklist updated', 'success');

    if (selectedRoom && selectedRoom.id === roomId) {
      const updatedRoom = rooms.find(r => r.id === roomId);
      setSelectedRoom(updatedRoom);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const result = exportHKToCSV(rooms, staff);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleExportPDF = () => {
    const result = exportHKToPDF(rooms, staff);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  // Refresh
  const handleRefresh = async () => {
    try {
      await refreshData();
      showToast('Data refreshed', 'success');
    } catch (err) {
      showToast('Failed to refresh data', 'error');
    }
  };

  // Render view based on active tab
  const renderView = () => {
    if (activeTab === 'by-staff') {
      return (
        <StaffView
          rooms={displayRooms}
          housekeepers={staff}
          onRoomClick={handleRoomClick}
        />
      );
    }

    if (activeTab === 'by-floor') {
      return (
        <FloorView
          rooms={displayRooms}
          onRoomClick={handleRoomClick}
        />
      );
    }

    // Table view
    return (
      <HKRoomTable
        rooms={displayRooms}
        staff={staff}
        onRoomClick={handleRoomClick}
        onAssign={handleAssignClick}
        onStartCleaning={handleStartCleaning}
        onMarkClean={handleMarkCleaned}
        onInspect={handleInspect}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Housekeeping
            </h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              Monitor room cleanliness, assign tasks, and verify inspections
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button variant="outline" icon={Download} onClick={() => setIsExportModalOpen(true)} className="hidden sm:flex">
              Export
            </Button>
            <Button variant="outline" icon={ArrowUpDown} onClick={() => setIsBulkAssignModalOpen(true)} className="hidden sm:flex">
              Bulk Assign
            </Button>
            <Button
              variant="secondary"
              icon={isAutoAssigning ? Loader2 : Wand2}
              onClick={handleAutoAssign}
              disabled={isAutoAssigning}
              className={isAutoAssigning ? '[&>svg]:animate-spin' : ''}
            >
              <span className="hidden sm:inline">{isAutoAssigning ? 'Assigning...' : 'Auto-Assign'}</span>
              <span className="sm:hidden">{isAutoAssigning ? '...' : 'Auto'}</span>
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setIsAddTaskModalOpen(true)}>
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </header>

        {/* KPI Summary Cards */}
        <HKKPI rooms={rooms} staff={staff} />

        {/* Main Housekeeping Card (CMS-consistent) */}
        <div className="bg-white rounded-[10px] overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-neutral-100">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-6 pt-4">
              <HousekeepingTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={counts}
              />
            </div>
          </div>

          {/* Search & Filters Row */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-full sm:flex-1 sm:max-w-md">
                <HousekeepingSearch value={searchQuery} onChange={setSearchQuery} />
              </div>
              <div className="hidden sm:block sm:flex-1" />
              <HousekeepingFilters
                filters={filters}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                housekeepers={staff}
              />
            </div>
          </div>

          {/* Main Content - Table View */}
          {renderView()}

          {/* Pagination */}
          {sortedRooms.length > 0 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={totalItems}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                onPrevPage={prevPage}
                onNextPage={nextPage}
                onGoToPage={goToPage}
              />
            </div>
          )}
        </div>

        {/* Staff Performance Panel - Hidden temporarily (no backend support yet) */}
        {/* <HKStaffPerformance staff={staff} rooms={rooms} /> */}
      </div>

      {/* Room Drawer */}
      <RoomDrawer
        room={selectedRoom}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onAssignHousekeeper={() => handleAssignClick(selectedRoom)}
        onEditChecklist={handleEditChecklistClick}
        onStartCleaning={handleStartCleaning}
        onMarkCleaned={handleMarkCleaned}
        onMarkDirty={handleMarkDirty}
        onBlockRoom={handleBlockRoom}
        onUnblockRoom={handleUnblockRoom}
        onToggleChecklistItem={handleToggleChecklistItem}
        onAddNote={addNote}
        onRequestCleaning={() => {
          if (selectedRoom) setCleaningRoom(selectedRoom);
        }}
      />

      {/* Assign Housekeeper Modal */}
      <AssignHousekeeperModal
        room={roomForAction}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setRoomForAction(null);
        }}
        onAssign={(roomId, staffId) => {
          handleAssign(roomId, staffId);
          setIsAssignModalOpen(false);
          setRoomForAction(null);
          handleCloseDrawer();
        }}
        housekeepers={staff}
      />

      {/* Bulk Assign Modal */}
      <BulkAssignModal
        rooms={displayRooms}
        isOpen={isBulkAssignModalOpen}
        onClose={() => setIsBulkAssignModalOpen(false)}
        onBulkAssign={handleBulkAssign}
        housekeepers={staff}
        isLoading={staffLoading}
      />

      {/* Edit Checklist Modal */}
      <EditChecklistModal
        room={roomForAction}
        isOpen={isEditChecklistModalOpen}
        onClose={() => {
          setIsEditChecklistModalOpen(false);
          setRoomForAction(null);
        }}
        onSave={(roomId, newChecklist) => {
          handleSaveChecklist(roomId, newChecklist);
          setIsEditChecklistModalOpen(false);
          setRoomForAction(null);
          handleCloseDrawer();
        }}
      />

      {/* Add Cleaning Task Modal */}
      <AddCleaningTaskModal
        rooms={rooms}
        staff={staff}
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />

      {/* Scan Digital Key Modal */}
      <ScanDigitalKeyModal
        open={isScanKeyModalOpen}
        onClose={() => setIsScanKeyModalOpen(false)}
        roomNumber={selectedRoom?.number}
      />

      {/* Force Assign Modal */}
      <ForceAssignModal
        isOpen={isForceAssignModalOpen}
        onClose={() => {
          setIsForceAssignModalOpen(false);
          setTaskForForceAssign(null);
        }}
        onForceAssign={async (staffId, reason, requireAcceptance) => {
          try {
            if (taskForForceAssign) {
              await api.post(`/housekeeping/tasks/${taskForForceAssign.id}/force-assign`, {
                staff_id: staffId,
                reason: reason,
                require_acceptance: requireAcceptance
              });
              showToast('Task force-assigned successfully', 'success');
            }
            setIsForceAssignModalOpen(false);
          } catch (err) {
            showToast('Failed to force-assign task', 'error');
          }
        }}
        taskType="housekeeping"
        taskId={taskForForceAssign?.id || ''}
        taskDescription={taskForForceAssign?.notes || 'Housekeeping Task'}
        busyStaff={staffAvailability.busyStaff}
        availableStaff={staffAvailability.availableStaff}
      />

      {/* Auto-Assign Results Modal */}
      <AutoAssignResultsModal
        isOpen={isAutoAssignResultsOpen}
        onClose={() => {
          setIsAutoAssignResultsOpen(false);
          setAutoAssignResults(null);
        }}
        results={autoAssignResults}
      />

      {/* Export Options Modal */}
      <ExportOptionsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {/* Request Cleaning Modal */}
      <RequestCleaningModal
        isOpen={!!cleaningRoom}
        onClose={() => setCleaningRoom(null)}
        onSuccess={() => {
          showToast('Cleaning request submitted', 'success');
          setCleaningRoom(null);
          refreshData();
        }}
        roomId={cleaningRoom?.id || 0}
        roomNumber={cleaningRoom?.number || cleaningRoom?.roomNumber || ''}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
