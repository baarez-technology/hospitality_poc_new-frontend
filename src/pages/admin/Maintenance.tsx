import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Download,
  Calendar,
  Package,
  ClipboardList,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useMaintenance } from '../../hooks/admin/useMaintenance';
import { useRooms } from '../../hooks/admin/useRooms';
import {
  filterWorkOrders,
  searchWorkOrders,
  sortWorkOrders,
  exportMaintenanceToCSV,
  PM_FREQUENCY
} from '../../utils/maintenance';
import { ConfirmModal } from '../../components/ui2/Modal';
import { Button, IconButton } from '../../components/ui2/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions, TableEmpty } from '../../components/ui2/Table';
import { Badge, StatusBadge } from '../../components/ui2/Badge';

// Components
import WOKPI from '../../components/maintenance/WOKPI';
import WOFilters from '../../components/maintenance/WOFilters';
import WOTable from '../../components/maintenance/WOTable';
import WODrawer from '../../components/maintenance/WODrawer';
import MaintenanceCalendar from '../../components/maintenance/MaintenanceCalendar';
import InventoryTable from '../../components/maintenance/InventoryTable';

// Modals
import CreateWOModal from '../../components/maintenance/modals/CreateWOModal';
import EditWOModal from '../../components/maintenance/modals/EditWOModal';
import PreventiveModal from '../../components/maintenance/modals/PreventiveModal';
import AddInventoryModal from '../../components/admin-panel/maintenance/modals/AddInventoryModal';

export default function Maintenance() {
  const { showToast } = useToast();
  const {
    workOrders,
    pmTasks,
    technicians,
    inventory,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    startWorkOrder,
    completeWorkOrder,
    holdWorkOrder,
    reopenWorkOrder,
    assignTechnician,
    clearRoomOOO,
    addPMTask,
    updatePMTask,
    deletePMTask,
    completePMTask,
    togglePMActive,
    getOverduePMTasks,
    getUpcomingPMTasks,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStock
  } = useMaintenance();

  const { rawRooms: rooms } = useRooms();

  // View state
  const [activeTab, setActiveTab] = useState('workorders'); // 'workorders', 'preventive', 'calendar', 'inventory'
  const [woSubTab, setWoSubTab] = useState('active'); // 'active', 'completed', 'all'

  // Filters
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    category: 'all',
    technician: 'all',
    oooOnly: false,
    dateFrom: '',
    dateTo: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals
  const [showCreateWOModal, setShowCreateWOModal] = useState(false);
  const [showEditWOModal, setShowEditWOModal] = useState(false);
  const [showPMModal, setShowPMModal] = useState(false);
  const [pmModalMode, setPMModalMode] = useState('create');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState(null);

  // Drawer
  const [selectedWO, setSelectedWO] = useState(null);
  const [selectedPM, setSelectedPM] = useState(null);

  // Confirmation states
  const [deleteWOConfirm, setDeleteWOConfirm] = useState({ isOpen: false, woId: null });
  const [deletePMConfirm, setDeletePMConfirm] = useState({ isOpen: false, pmId: null });
  const [deleteInventoryConfirm, setDeleteInventoryConfirm] = useState({ isOpen: false, itemId: null });

  // PM dropdown menu state
  const [openPMMenuId, setOpenPMMenuId] = useState(null);
  const pmMenuRef = useRef(null);

  // BUG-025 FIX: Sync selectedWO with latest workOrders state
  // When workOrders updates (e.g., after assign, start, complete), keep the drawer in sync
  useEffect(() => {
    if (selectedWO) {
      const updated = workOrders.find(wo => wo.id === selectedWO.id);
      if (updated && updated !== selectedWO) {
        setSelectedWO(updated);
      }
    }
  }, [workOrders]);

  // Close PM menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pmMenuRef.current && !pmMenuRef.current.contains(e.target)) {
        setOpenPMMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Merge blocked rooms (OOS/OOO/maintenance) that don't have a work order into the list
  const mergedWorkOrders = useMemo(() => {
    // Use string IDs for comparison since rooms API returns id as string
    const woRoomIds = new Set(workOrders.map(wo => String(wo.roomId)).filter(id => id && id !== 'null' && id !== 'undefined'));
    const blockedRooms = rooms.filter(r =>
      (r.status === 'out_of_service' || r.status === 'out_of_order' || r.status === 'maintenance') &&
      !woRoomIds.has(String(r.id))
    );
    const statusLabels = { out_of_service: 'Out of Service', out_of_order: 'Out of Order', maintenance: 'Maintenance' };
    const roomEntries = blockedRooms.map(room => ({
      id: `room-${room.id}`,
      displayId: `${room.status === 'out_of_order' ? 'OOO' : room.status === 'out_of_service' ? 'OOS' : 'MNT'}-${room.roomNumber}`,
      roomNumber: room.roomNumber,
      roomId: room.id,
      roomType: room.type || 'Standard',
      category: room.status === 'out_of_order' ? 'structural' : 'general',
      priority: room.status === 'out_of_order' ? 'high' : 'medium',
      status: 'open',
      issue: statusLabels[room.status] || room.status,
      description: room.blockedReason || `Room ${room.roomNumber} is ${statusLabels[room.status] || room.status}`,
      assignedTo: null,
      technicianName: null,
      estimatedCost: null,
      actualCost: null,
      estimatedDuration: null,
      actualDuration: null,
      isOOO: room.status === 'out_of_order',
      isOOS: room.status === 'out_of_service',
      notes: room.blockedReason || '',
      resolutionNotes: '',
      scheduledDate: null,
      estimatedCompletion: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      activityLog: [],
      isRoomEntry: true,
    }));
    return [...workOrders, ...roomEntries];
  }, [workOrders, rooms]);

  // Process work orders
  const processedWorkOrders = useMemo(() => {
    let result = [...mergedWorkOrders];

    // Apply sub-tab filter (active vs completed vs all)
    if (woSubTab === 'active') {
      result = result.filter(wo => wo.status !== 'completed' && wo.status !== 'cancelled');
    } else if (woSubTab === 'completed') {
      result = result.filter(wo => wo.status === 'completed' || wo.status === 'cancelled');
    }
    // 'all' shows everything

    // Apply technician filter (special handling for unassigned)
    if (filters.technician === 'unassigned') {
      result = result.filter(wo => !wo.assignedTo);
    } else {
      result = filterWorkOrders(result, filters);
    }

    // Apply search
    result = searchWorkOrders(result, searchQuery);

    // Apply sort
    result = sortWorkOrders(result, sortField, sortDirection);

    return result;
  }, [mergedWorkOrders, filters, searchQuery, sortField, sortDirection, woSubTab]);

  // PM Tasks processed
  const overduePM = useMemo(() => getOverduePMTasks(), [getOverduePMTasks]);
  const upcomingPM = useMemo(() => getUpcomingPMTasks(7), [getUpcomingPMTasks]);

  // Handlers
  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleClearFilters = () => {
    setFilters({
      priority: 'all',
      status: 'all',
      category: 'all',
      technician: 'all',
      oooOnly: false,
      dateFrom: '',
      dateTo: ''
    });
    setSearchQuery('');
  };

  const handleCreateWO = async (data) => {
    try {
      await addWorkOrder(data);
    } catch (err) {
      // Error already handled by hook toast
    }
  };

  const handleUpdateWO = (woId, data) => {
    updateWorkOrder(woId, data, 'Work order updated');
    showToast('Work order updated successfully', 'success');
    setSelectedWO(null);
  };

  const handleDeleteWO = (woId) => {
    setDeleteWOConfirm({ isOpen: true, woId });
  };

  const confirmDeleteWO = () => {
    if (deleteWOConfirm.woId) {
      deleteWorkOrder(deleteWOConfirm.woId);
      showToast('Work order deleted', 'success');
      setSelectedWO(null);
    }
    setDeleteWOConfirm({ isOpen: false, woId: null });
  };

  const handleStartWO = (woId) => {
    startWorkOrder(woId, 'Manager');
    showToast('Work order started', 'info');
  };

  const handleCompleteWO = (woId) => {
    completeWorkOrder(woId, 'Manager');
    showToast('Work order completed', 'success');
    setSelectedWO(null);
  };

  const handleHoldWO = (woId) => {
    holdWorkOrder(woId, 'Awaiting parts/approval', 'Manager');
    showToast('Work order put on hold', 'info');
  };

  const handleReopenWO = (woId) => {
    reopenWorkOrder(woId, 'Manager');
    showToast('Work order reopened', 'info');
  };

  const handleAssignTech = (woId, techId) => {
    assignTechnician(woId, techId, 'Manager');
    showToast('Technician assigned', 'success');
  };

  const handleClearOOO = (roomNumber) => {
    clearRoomOOO(roomNumber, 'Manager');
    showToast(`Room ${roomNumber} OOO cleared`, 'success');
    setSelectedWO(null);
  };

  const handleExportCSV = () => {
    const result = exportMaintenanceToCSV(processedWorkOrders);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  // PM Handlers
  const handleCreatePM = async (data) => {
    try {
      await addPMTask(data);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleUpdatePM = async (pmId, data) => {
    try {
      await updatePMTask(pmId, data);
      setSelectedPM(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleCompletePM = async (pmId) => {
    try {
      await completePMTask(pmId);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDeletePM = (pmId) => {
    setDeletePMConfirm({ isOpen: true, pmId });
  };

  const confirmDeletePM = async () => {
    if (deletePMConfirm.pmId) {
      try {
        await deletePMTask(deletePMConfirm.pmId);
      } catch (err) {
        // Error handled by hook
      }
    }
    setDeletePMConfirm({ isOpen: false, pmId: null });
  };

  // Calendar event handler
  const handleCalendarEventClick = (event) => {
    if (event.type === 'workorder') {
      const wo = workOrders.find(w => w.id === event.id);
      if (wo) setSelectedWO(wo);
    } else if (event.type === 'preventive') {
      const pm = pmTasks.find(p => p.id === event.id);
      if (pm) {
        setSelectedPM(pm);
        setPMModalMode('edit');
        setShowPMModal(true);
      }
    }
  };

  // Inventory handlers
  const handleAddInventoryItem = () => {
    setEditingInventoryItem(null);
    setShowInventoryModal(true);
  };

  const handleEditInventoryItem = (item) => {
    setEditingInventoryItem(item);
    setShowInventoryModal(true);
  };

  const handleInventorySubmit = async (data) => {
    try {
      if (editingInventoryItem) {
        await updateInventoryItem(data.id, data);
      } else {
        await addInventoryItem(data);
      }
      setShowInventoryModal(false);
      setEditingInventoryItem(null);
    } catch {
      // Error toast already shown by useMaintenance hook
    }
  };

  const handleDeleteInventoryItem = (itemId) => {
    setDeleteInventoryConfirm({ isOpen: true, itemId });
  };

  const confirmDeleteInventory = async () => {
    if (deleteInventoryConfirm.itemId) {
      await deleteInventoryItem(deleteInventoryConfirm.itemId);
    }
    setDeleteInventoryConfirm({ isOpen: false, itemId: null });
  };

  const handleUpdateStock = async (itemId, quantity, isAddition) => {
    await updateStock(itemId, quantity, isAddition);
    // Success/error toasts are shown by updateStock itself
  };

  const tabs = [
    { id: 'workorders', label: 'Work Orders', shortLabel: 'Work Orders', icon: ClipboardList },
    { id: 'preventive', label: 'Preventive Maintenance', shortLabel: 'PM Tasks', icon: Calendar },
    { id: 'calendar', label: 'Calendar', shortLabel: 'Calendar', icon: Calendar },
    { id: 'inventory', label: 'Inventory', shortLabel: 'Inventory', icon: Package }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
            Maintenance
          </h1>
          <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
            Manage work orders, preventive maintenance, and inventory
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" icon={Download} onClick={handleExportCSV} className="text-[12px] sm:text-[13px]">
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            className="text-[12px] sm:text-[13px]"
            onClick={() => {
              if (activeTab === 'preventive') {
                setPMModalMode('create');
                setSelectedPM(null);
                setShowPMModal(true);
              } else if (activeTab === 'inventory') {
                handleAddInventoryItem();
              } else {
                setShowCreateWOModal(true);
              }
            }}
          >
            <span className="hidden sm:inline">{activeTab === 'preventive' ? 'Add PM Task' : activeTab === 'inventory' ? 'Add Item' : 'Create Work Order'}</span>
            <span className="sm:hidden">{activeTab === 'preventive' ? 'Add PM' : activeTab === 'inventory' ? 'Add' : 'Create WO'}</span>
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <WOKPI
        workOrders={mergedWorkOrders}
        technicians={technicians}
        blockedRoomsCount={rooms.filter(r => r.status === 'out_of_service' || r.status === 'out_of_order' || r.status === 'maintenance').length}
        inventory={inventory}
      />

      {/* Alerts */}
      {(overduePM.length > 0 || mergedWorkOrders.filter(wo => wo.priority === 'high' && wo.status !== 'completed').length > 0) && (
        <div className="bg-rose-50 border border-rose-100 rounded-[10px] p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-[12px] sm:text-[13px] font-semibold text-rose-900">Attention Required</h3>
              <ul className="mt-1 text-[11px] sm:text-[12px] text-rose-700 space-y-0.5">
                {overduePM.length > 0 && (
                  <li>{overduePM.length} overdue PM task{overduePM.length > 1 ? 's' : ''}</li>
                )}
                {mergedWorkOrders.filter(wo => wo.priority === 'high' && wo.status !== 'completed').length > 0 && (
                  <li>{mergedWorkOrders.filter(wo => wo.priority === 'high' && wo.status !== 'completed').length} high priority WO{mergedWorkOrders.filter(wo => wo.priority === 'high' && wo.status !== 'completed').length > 1 ? 's' : ''} pending</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Card (CMS-consistent) */}
      <div className="bg-white rounded-[10px] overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-neutral-100">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-6 pt-3 sm:pt-4">
            <div className="flex items-center gap-0.5 min-w-max">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'workorders' && (
          <>
            {/* Work Order Sub-Tabs: Active / Completed / All */}
            <div className="px-4 sm:px-6 pt-3 sm:pt-4 border-b border-neutral-100 bg-neutral-50/30">
              <div className="flex items-center gap-1">
                {[
                  { id: 'active', label: 'Active', count: mergedWorkOrders.filter(wo => wo.status !== 'completed' && wo.status !== 'cancelled').length },
                  { id: 'completed', label: 'Completed', count: mergedWorkOrders.filter(wo => wo.status === 'completed' || wo.status === 'cancelled').length },
                  { id: 'all', label: 'All', count: mergedWorkOrders.length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setWoSubTab(tab.id)}
                    className={`px-3 sm:px-4 py-2 text-[12px] sm:text-[13px] font-semibold rounded-t-lg transition-all ${
                      woSubTab === tab.id
                        ? 'bg-white text-neutral-900 border border-b-0 border-neutral-200 -mb-px'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full ${
                      woSubTab === tab.id ? 'bg-terra-100 text-terra-700' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
              <WOFilters
                filters={filters}
                setFilters={setFilters}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                technicians={technicians}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Table */}
            <WOTable
              workOrders={processedWorkOrders}
              technicians={technicians}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onRowClick={setSelectedWO}
              onStartWO={handleStartWO}
              onCompleteWO={handleCompleteWO}
              onHoldWO={handleHoldWO}
              onReopenWO={handleReopenWO}
              onDeleteWO={handleDeleteWO}
              onAssignTech={(wo) => {
                setSelectedWO(wo);
              }}
            />

            {/* Results count / Pagination area */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
              <p className="text-[12px] sm:text-sm text-neutral-500">
                Showing <span className="font-medium text-neutral-700">{processedWorkOrders.length}</span> of{' '}
                <span className="font-medium text-neutral-700">{mergedWorkOrders.length}</span> work orders
              </p>
            </div>
          </>
        )}

        {activeTab === 'preventive' && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Upcoming PM Tasks */}
            {upcomingPM.length > 0 && (
              <div className="bg-neutral-50/50 border border-neutral-100 rounded-lg p-3 sm:p-5">
                <h3 className="font-semibold text-neutral-900 mb-3 text-[13px] sm:text-[14px]">Upcoming Tasks (Next 7 Days)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {upcomingPM.map(pm => (
                    <div
                      key={pm.id}
                      onClick={() => {
                        setSelectedPM(pm);
                        setPMModalMode('edit');
                        setShowPMModal(true);
                      }}
                      className="bg-white rounded-lg p-3 sm:p-4 border border-neutral-200 cursor-pointer hover:border-terra-300 hover:shadow-sm transition-all"
                    >
                      <p className="font-medium text-neutral-900 text-[12px] sm:text-[13px]">{pm.equipment}</p>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-1">Due: {pm.nextDueDate}</p>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500">{pm.technicianName || 'Unassigned'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PM Tasks Table */}
            <div className="rounded-lg border border-neutral-100 overflow-hidden">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead width="100px">ID</TableHead>
                  <TableHead width="200px">Equipment</TableHead>
                  <TableHead width="120px">Frequency</TableHead>
                  <TableHead width="130px">Next Due</TableHead>
                  <TableHead width="130px">Last Done</TableHead>
                  <TableHead width="180px">Technician</TableHead>
                  <TableHead width="120px" align="center">Status</TableHead>
                  <TableHead width="140px" align="center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pmTasks.length === 0 ? (
                  <TableEmpty
                    icon={Calendar}
                    title="No preventive maintenance tasks"
                    description="Create one to get started"
                  />
                ) : (
                  pmTasks.map(pm => {
                    const isOverdue = pm.nextDueDate && pm.nextDueDate < new Date().toISOString().split('T')[0];
                    const freqLabel = PM_FREQUENCY.find(f => f.value === pm.frequency)?.label || pm.frequency;
                    return (
                      <TableRow key={pm.id} className={isOverdue ? 'bg-rose-50/30' : ''}>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold text-neutral-900">{pm.id}</span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-neutral-900">{pm.equipment}</p>
                          {pm.roomNumber && (
                            <p className="text-xs text-neutral-500">Room {pm.roomNumber}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="neutral" size="sm">{freqLabel}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm ${isOverdue ? 'text-rose-600 font-semibold' : 'text-neutral-700'}`}>
                            {pm.nextDueDate || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-neutral-500">{pm.lastCompleted || '-'}</span>
                        </TableCell>
                        <TableCell>
                          {pm.technicianName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-terra-100 flex items-center justify-center text-terra-600 text-xs font-bold">
                                {(pm.technicianName || '').split(' ').filter(n => n).map(n => n[0]).join('') || 'T'}
                              </div>
                              <span className="text-sm font-medium text-neutral-700">{pm.technicianName}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-neutral-400">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <StatusBadge status={pm.isActive ? 'active' : 'inactive'} size="sm" />
                        </TableCell>
                        <TableActions>
                          <div className="relative" ref={openPMMenuId === pm.id ? pmMenuRef : null}>
                            <IconButton
                              icon={MoreHorizontal}
                              size="sm"
                              variant="ghost"
                              label="Actions"
                              onClick={() => setOpenPMMenuId(openPMMenuId === pm.id ? null : pm.id)}
                            />

                            {openPMMenuId === pm.id && (
                              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-lg shadow-lg border border-neutral-200 py-1.5 z-20">
                                <button
                                  onClick={() => {
                                    setSelectedPM(pm);
                                    setPMModalMode('edit');
                                    setShowPMModal(true);
                                    setOpenPMMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                                >
                                  View / Edit
                                </button>
                                <button
                                  onClick={() => {
                                    handleCompletePM(pm.id);
                                    setOpenPMMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                                >
                                  Mark Complete
                                </button>
                                <div className="border-t border-neutral-100 my-1" />
                                <button
                                  onClick={() => {
                                    handleDeletePM(pm.id);
                                    setOpenPMMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-[13px] font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </TableActions>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="p-4 sm:p-6">
            <MaintenanceCalendar
              workOrders={workOrders}
              pmTasks={pmTasks}
              onEventClick={handleCalendarEventClick}
            />
          </div>
        )}

        {activeTab === 'inventory' && (
            <InventoryTable
              inventory={inventory}
              onUpdateStock={handleUpdateStock}
              onEditItem={handleEditInventoryItem}
              onDeleteItem={handleDeleteInventoryItem}
              onAddItem={handleAddInventoryItem}
              onUpdateMinStock={async (itemId, minStock) => {
                await updateInventoryItem(itemId, { minStock });
              }}
            />
        )}
      </div>

      {/* Drawer */}
      {selectedWO && (
        <WODrawer
          workOrder={selectedWO}
          technicians={technicians}
          onClose={() => setSelectedWO(null)}
          onEdit={(wo) => {
            setShowEditWOModal(true);
          }}
          onDelete={handleDeleteWO}
          onStartWO={handleStartWO}
          onCompleteWO={handleCompleteWO}
          onHoldWO={handleHoldWO}
          onReopenWO={handleReopenWO}
          onAssignTech={handleAssignTech}
          onClearOOO={handleClearOOO}
        />
      )}

      {/* Modals */}
      <CreateWOModal
        isOpen={showCreateWOModal}
        onClose={() => setShowCreateWOModal(false)}
        onSubmit={handleCreateWO}
        technicians={technicians}
        rooms={rooms}
      />

      <EditWOModal
        isOpen={showEditWOModal}
        onClose={() => setShowEditWOModal(false)}
        onSubmit={handleUpdateWO}
        workOrder={selectedWO}
        technicians={technicians}
        rooms={rooms}
      />

      <PreventiveModal
        isOpen={showPMModal}
        onClose={() => {
          setShowPMModal(false);
          setSelectedPM(null);
        }}
        onSubmit={pmModalMode === 'edit' ? handleUpdatePM : handleCreatePM}
        pmTask={selectedPM}
        technicians={technicians}
        rooms={rooms}
        mode={pmModalMode}
      />

      <AddInventoryModal
        isOpen={showInventoryModal}
        onClose={() => {
          setShowInventoryModal(false);
          setEditingInventoryItem(null);
        }}
        onSubmit={handleInventorySubmit}
        editItem={editingInventoryItem}
      />

      {/* Delete Work Order Confirmation */}
      <ConfirmModal
        open={deleteWOConfirm.isOpen}
        onClose={() => setDeleteWOConfirm({ isOpen: false, woId: null })}
        onConfirm={confirmDeleteWO}
        title="Delete Work Order"
        description="Are you sure you want to delete this work order? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Delete PM Task Confirmation */}
      <ConfirmModal
        open={deletePMConfirm.isOpen}
        onClose={() => setDeletePMConfirm({ isOpen: false, pmId: null })}
        onConfirm={confirmDeletePM}
        title="Delete PM Task"
        description="Are you sure you want to delete this preventive maintenance task? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Delete Inventory Item Confirmation */}
      <ConfirmModal
        open={deleteInventoryConfirm.isOpen}
        onClose={() => setDeleteInventoryConfirm({ isOpen: false, itemId: null })}
        onConfirm={confirmDeleteInventory}
        title="Delete Inventory Item"
        description="Are you sure you want to delete this inventory item?"
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
      </div>
    </div>
  );
}
