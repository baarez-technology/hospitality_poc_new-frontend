import { useState } from 'react';
import { UserPlus, Download, Users, ClipboardList } from 'lucide-react';
import { useStaff } from '../../hooks/admin/useStaff';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../contexts/ToastContext';
import StaffTabs from '../../components/staff/StaffTabs';
import StaffSearch from '../../components/staff/StaffSearch';
import StaffFilters from '../../components/staff/StaffFilters';
import StaffGrid from '../../components/staff/StaffGrid';
import StaffDrawer from '../../components/staff/StaffDrawer';
import Pagination from '../../components/bookings/Pagination';
import AddStaffModal from '../../components/staff/modals/AddStaffModal';
import AssignShiftModal from '../../components/staff/modals/AssignShiftModal';
import MessageStaffModal from '../../components/staff/modals/MessageStaffModal';
import MarkLeaveModal from '../../components/staff/modals/MarkLeaveModal';
import EditStaffModal from '../../components/staff/modals/EditStaffModal';
import DisableStaffModal from '../../components/staff/modals/DisableStaffModal';
import { Button } from '../../components/ui2/Button';
import { AttendanceContent } from './Attendance';

// ── View tabs config (matching Maintenance tab pattern) ──
const VIEW_TABS = [
  { id: 'staff' as const, label: 'Staff Management', shortLabel: 'Staff', icon: Users },
  { id: 'attendance' as const, label: 'Attendance', shortLabel: 'Attendance', icon: ClipboardList },
];

export default function Staff() {
  // View tab state
  const [activeView, setActiveView] = useState<'staff' | 'attendance'>('staff');

  // Master state management via useStaff hook
  const {
    staff,
    activeDepartment,
    setActiveDepartment,
    departmentCounts,
    availableRoles,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    sortField,
    sortDirection,
    handleSort,
    updateStatus,
    assignShift,
    markLeave,
    sendMessage,
    addStaff,
    editStaff,
    disableStaff,
    rawStaff
  } = useStaff();

  // Pagination
  const pagination = usePagination(staff, 12);

  // Toast notifications
  const toast = useToast();

  // Drawer state
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignShiftModalOpen, setIsAssignShiftModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isMarkLeaveModalOpen, setIsMarkLeaveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [staffForAction, setStaffForAction] = useState(null);

  // Event handlers

  const handleStaffClick = (staff) => {
    setSelectedStaff(staff);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedStaff(null), 300);
  };

  const handleAssignShiftClick = (staff) => {
    setStaffForAction(staff);
    setIsAssignShiftModalOpen(true);
  };

  const handleAssignShiftFromDrawer = () => {
    setStaffForAction(selectedStaff);
    setIsDrawerOpen(false);
    setIsAssignShiftModalOpen(true);
  };

  const handleMessageClick = () => {
    setStaffForAction(selectedStaff);
    setIsDrawerOpen(false);
    setIsMessageModalOpen(true);
  };

  const handleMarkLeaveClick = () => {
    setStaffForAction(selectedStaff);
    setIsDrawerOpen(false);
    setIsMarkLeaveModalOpen(true);
  };

  const handleEditClick = () => {
    setStaffForAction(selectedStaff);
    setIsDrawerOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDisableClick = (staff) => {
    setStaffForAction(staff || selectedStaff);
    setIsDrawerOpen(false);
    setIsDisableModalOpen(true);
  };

  // CRUD Operations

  const handleUpdateStatus = (id, newStatus) => {
    updateStatus(id, newStatus);
    toast.success('Status updated successfully');
    // Update drawer if currently viewing this staff
    if (selectedStaff && selectedStaff.id === id) {
      setSelectedStaff(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleAssignShift = (id, shiftData) => {
    // Handle multiple days if it's an array
    if (Array.isArray(shiftData)) {
      // Assign each day individually
      shiftData.forEach(dayData => {
        assignShift(id, dayData);
      });
      toast.success(`Shift assigned for ${shiftData.length} days`);
    } else {
      assignShift(id, shiftData);
      toast.success('Shift assigned successfully');
    }
  };

  const handleMarkLeave = (id, leaveData) => {
    markLeave(id, leaveData);
    toast.success('Leave recorded successfully');
    handleCloseDrawer();
  };

  const handleSendMessage = (id, messageData) => {
    sendMessage(id, messageData);
    toast.success('Message sent successfully');
  };

  const handleAddStaff = (formData) => {
    addStaff(formData);
    toast.success('Staff member added successfully');
  };

  const handleEditStaff = (id, updates) => {
    editStaff(id, updates);
    toast.success('Staff details updated');
    // Update drawer if currently viewing this staff
    if (selectedStaff && selectedStaff.id === id) {
      setSelectedStaff(prev => ({ ...prev, ...updates }));
    }
  };

  const handleDisableStaff = (id) => {
    disableStaff(id);
    toast.warning('Staff member disabled');
    handleCloseDrawer();
  };

  const handleExport = () => {
    // CSV Export with fields: Name, Role, Department, Phone, Email, Performance, Total Tasks, Attendance Summary
    if (!rawStaff || rawStaff.length === 0) {
      toast.warning('No staff data to export');
      return;
    }

    const headers = [
      'Name',
      'Role',
      'Department',
      'Phone',
      'Email',
      'Performance Score',
      'Total Tasks',
      'Status',
      'Shift'
    ];

    const rows = rawStaff.map(s => {
      const totalTasks = s.performance?.tasksCompleted || s.tasksToday || 0;
      const performanceScore = s.efficiency || s.performance?.punctuality || 0;

      return [
        s.name || '',
        s.role || '',
        s.department || '',
        s.phone || '',
        s.email || '',
        performanceScore,
        totalTasks,
        s.status || '',
        s.shift || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `staff_export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${rawStaff.length} staff members to CSV`);
  };

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Staff
            </h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              {activeView === 'staff'
                ? 'Manage your hotel staff, assign shifts, and monitor performance'
                : 'Monitor daily staff attendance, clock-in/out status, and trends'}
            </p>
          </div>

        </header>

        {/* ── View Tabs (matching Maintenance tab pattern) ── */}
        <div className="flex items-center gap-0.5 border-b border-neutral-200">
          {VIEW_TABS.map(tab => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`relative px-3 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold transition-all duration-150 whitespace-nowrap ${
                  isActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-terra-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* ── Staff Management Tab Content ── */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeView === 'staff' && (
          <>
            {/* Department Tabs + Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <div className="flex items-center gap-1 p-1.5 bg-white rounded-lg w-fit">
                  <StaffTabs
                    activeTab={activeDepartment}
                    onTabChange={setActiveDepartment}
                    counts={departmentCounts}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <Button variant="outline" icon={Download} onClick={handleExport} className="hidden sm:flex">
                  Export
                </Button>
                <Button variant="primary" icon={UserPlus} onClick={() => setIsAddModalOpen(true)}>
                  <span className="hidden sm:inline">Add Staff</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="w-full sm:w-[400px]">
                <StaffSearch value={searchQuery} onChange={setSearchQuery} />
              </div>
              <StaffFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                availableRoles={availableRoles}
              />
            </div>

            {/* Staff Grid */}
            <StaffGrid
              staff={pagination.currentPageData}
              onStaffClick={handleStaffClick}
              onAssignShift={handleAssignShiftClick}
            />

            {/* Pagination */}
            {staff.length > 0 && (
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
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* ── Attendance Tab Content ── */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeView === 'attendance' && (
          <AttendanceContent />
        )}
      </div>

      {/* Staff Drawer */}
      <StaffDrawer
        staff={selectedStaff}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onAssignShift={handleAssignShiftFromDrawer}
        onMessage={handleMessageClick}
        onUpdateStatus={handleUpdateStatus}
        onMarkLeave={handleMarkLeaveClick}
        onEdit={handleEditClick}
        onDisable={handleDisableClick}
      />

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddStaff}
      />

      {/* Assign Shift Modal */}
      <AssignShiftModal
        staff={staffForAction}
        isOpen={isAssignShiftModalOpen}
        onClose={() => {
          setIsAssignShiftModalOpen(false);
          setStaffForAction(null);
        }}
        onAssign={handleAssignShift}
      />

      {/* Message Staff Modal */}
      <MessageStaffModal
        staff={staffForAction}
        isOpen={isMessageModalOpen}
        onClose={() => {
          setIsMessageModalOpen(false);
          setStaffForAction(null);
        }}
        onSend={handleSendMessage}
      />

      {/* Mark Leave Modal */}
      <MarkLeaveModal
        staff={staffForAction}
        isOpen={isMarkLeaveModalOpen}
        onClose={() => {
          setIsMarkLeaveModalOpen(false);
          setStaffForAction(null);
        }}
        onMarkLeave={handleMarkLeave}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        staff={staffForAction}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setStaffForAction(null);
        }}
        onSave={handleEditStaff}
      />

      {/* Disable Staff Modal */}
      <DisableStaffModal
        staff={staffForAction}
        isOpen={isDisableModalOpen}
        onClose={() => {
          setIsDisableModalOpen(false);
          setStaffForAction(null);
        }}
        onDisable={handleDisableStaff}
      />
    </div>
  );
}
