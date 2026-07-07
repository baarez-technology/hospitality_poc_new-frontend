import { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Plus,
  User,
  MapPin,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  ChevronRight,
  X
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { runnerService, PickupRequest, Delivery, RunnerDashboard } from '@/api/services/runner.service';
import { staffService, Staff } from '@/api/services/staff.service';

interface RunnerStats extends RunnerDashboard {
  runners_on_duty: number;
}

export default function Runner() {
  const { showToast } = useToast();

  // Data state
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [runners, setRunners] = useState<Staff[]>([]);
  const [dashboard, setDashboard] = useState<RunnerStats | null>(null);
  const [loading, setLoading] = useState(true);

  // View state
  const [activeTab, setActiveTab] = useState<'pickups' | 'deliveries' | 'staff'>('pickups');

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer state
  const [selectedItem, setSelectedItem] = useState<PickupRequest | Delivery | null>(null);
  const [drawerType, setDrawerType] = useState<'pickup' | 'delivery' | null>(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pickupsData, deliveriesData, dashboardData, initialStaffData] = await Promise.all([
        runnerService.getPickups(),
        runnerService.getDeliveries(),
        runnerService.getDashboard(),
        staffService.list({ department: 'runner' })
      ]);

      // If no staff found by department, try filtering by roles
      let staffData = initialStaffData;
      if (!Array.isArray(staffData) || staffData.length === 0) {
        const allStaff = await staffService.list();
        if (Array.isArray(allStaff)) {
          const runnerRoles = ['runner', 'bellhop', 'valet'];
          staffData = allStaff.filter((s: any) =>
            runnerRoles.includes(s.role?.toLowerCase()) ||
            s.department?.toLowerCase() === 'runner'
          );
        }
      }

      setPickups(pickupsData || []);
      setDeliveries(deliveriesData || []);
      setDashboard({
        ...dashboardData,
        runners_on_duty: (staffData || []).filter(s => s.status === 'active').length
      });
      setRunners(staffData || []);
    } catch (error) {
      console.error('Failed to fetch runner data:', error);
      showToast('Failed to load runner data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter pickups
  const filteredPickups = useMemo(() => {
    let result = [...pickups];

    if (filters.status !== 'all') {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters.priority !== 'all') {
      result = result.filter(p => p.priority === filters.priority);
    }
    if (filters.assignee === 'unassigned') {
      result = result.filter(p => !p.assigned_to);
    } else if (filters.assignee !== 'all') {
      result = result.filter(p => p.assigned_to?.toString() === filters.assignee);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.room_number?.toLowerCase().includes(query) ||
        p.guest_name?.toLowerCase().includes(query) ||
        p.items_description?.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => {
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
  }, [pickups, filters, searchQuery]);

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    let result = [...deliveries];

    if (filters.status !== 'all') {
      result = result.filter(d => d.status === filters.status);
    }
    if (filters.priority !== 'all') {
      result = result.filter(d => d.priority === filters.priority);
    }
    if (filters.assignee === 'unassigned') {
      result = result.filter(d => !d.assigned_to);
    } else if (filters.assignee !== 'all') {
      result = result.filter(d => d.assigned_to?.toString() === filters.assignee);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.room_number?.toLowerCase().includes(query) ||
        d.guest_name?.toLowerCase().includes(query) ||
        d.items_description?.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => {
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
  }, [deliveries, filters, searchQuery]);

  // Assign runner to pickup
  const assignPickup = async (pickupId: number, runnerId: number) => {
    try {
      await runnerService.updatePickup(pickupId, { assigned_to: runnerId });
      showToast('success', 'Runner assigned to pickup');
      fetchData();
    } catch (error) {
      console.error('Failed to assign pickup:', error);
      showToast('error', 'Failed to assign pickup');
    }
  };

  // Assign runner to delivery
  const assignDelivery = async (deliveryId: number, runnerId: number) => {
    try {
      await runnerService.updateDelivery(deliveryId, { assigned_to: runnerId });
      showToast('success', 'Runner assigned to delivery');
      fetchData();
    } catch (error) {
      console.error('Failed to assign delivery:', error);
      showToast('error', 'Failed to assign delivery');
    }
  };

  // Update pickup status
  const updatePickupStatus = async (pickupId: number, status: string) => {
    try {
      await runnerService.updatePickup(pickupId, { status });
      showToast('success', `Pickup ${status === 'completed' ? 'completed' : 'updated'}`);
      fetchData();
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to update pickup:', error);
      showToast('error', 'Failed to update pickup');
    }
  };

  // Update delivery status
  const updateDeliveryStatus = async (deliveryId: number, status: string) => {
    try {
      await runnerService.updateDelivery(deliveryId, { status });
      showToast('success', `Delivery ${status === 'completed' ? 'completed' : 'updated'}`);
      fetchData();
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to update delivery:', error);
      showToast('error', 'Failed to update delivery');
    }
  };

  const handleClearFilters = () => {
    setFilters({ status: 'all', priority: 'all', assignee: 'all' });
    setSearchQuery('');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-[#CDB261]/15 text-[#CDB261]',
      assigned: 'bg-[#5C9BA4]/15 text-[#5C9BA4]',
      in_progress: 'bg-[#A57865]/15 text-[#A57865]',
      completed: 'bg-[#4E5840]/15 text-[#4E5840]',
      cancelled: 'bg-neutral-200 text-neutral-600'
    };
    return styles[status] || 'bg-neutral-200 text-neutral-600';
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      normal: 'bg-[#5C9BA4]/15 text-[#5C9BA4]',
      low: 'bg-neutral-100 text-neutral-600'
    };
    return styles[priority] || 'bg-neutral-100 text-neutral-600';
  };

  const tabs = [
    { id: 'pickups', label: 'Pickup Requests', icon: Package, count: pickups.length },
    { id: 'deliveries', label: 'Deliveries', icon: Truck, count: deliveries.length },
    { id: 'staff', label: 'Runner Staff', icon: User, count: runners.length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F6]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A57865]/20 border-t-[#A57865] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading runner data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A57865]/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#A57865]" />
            </div>
            Runner Manager
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage pickup requests, deliveries, and runner assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => {/* TODO: Add export */}}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#5C9BA4]/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-[#5C9BA4]" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Active Pickups</p>
              <p className="text-2xl font-bold text-neutral-900">{dashboard?.active_pickups || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#A57865]/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-[#A57865]" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Active Deliveries</p>
              <p className="text-2xl font-bold text-neutral-900">{dashboard?.active_deliveries || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#CDB261]/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#CDB261]" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Pending Tasks</p>
              <p className="text-2xl font-bold text-neutral-900">{dashboard?.pending_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#4E5840]/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#4E5840]" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Completed Today</p>
              <p className="text-2xl font-bold text-neutral-900">{dashboard?.completed_today || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#5C9BA4]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#5C9BA4]" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Runners on Duty</p>
              <p className="text-2xl font-bold text-neutral-900">{dashboard?.runners_on_duty || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Alerts */}
      {pickups.filter(p => p.priority === 'urgent' && p.status !== 'completed').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Urgent Attention Required</h3>
              <ul className="mt-1 text-sm text-red-700 space-y-1">
                <li>{pickups.filter(p => p.priority === 'urgent' && p.status !== 'completed').length} urgent pickup request{pickups.filter(p => p.priority === 'urgent' && p.status !== 'completed').length > 1 ? 's' : ''} pending</li>
                {deliveries.filter(d => d.priority === 'urgent' && d.status !== 'completed').length > 0 && (
                  <li>{deliveries.filter(d => d.priority === 'urgent' && d.status !== 'completed').length} urgent deliver{deliveries.filter(d => d.priority === 'urgent' && d.status !== 'completed').length > 1 ? 'ies' : 'y'} pending</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#A57865] text-[#A57865]'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                activeTab === tab.id ? 'bg-[#A57865]/10 text-[#A57865]' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {(activeTab === 'pickups' || activeTab === 'deliveries') && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by room, guest, or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all cursor-pointer"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={filters.assignee}
              onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
              className="px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all cursor-pointer"
            >
              <option value="all">All Runners</option>
              <option value="unassigned">Unassigned</option>
              {runners.map(r => (
                <option key={r.id} value={r.id.toString()}>{r.name}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {(filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all' || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 text-sm font-medium text-[#A57865] hover:bg-[#A57865]/5 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'pickups' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAF8F6] border-b border-neutral-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Request #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredPickups.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-neutral-500">No pickup requests found</p>
                      <p className="text-sm text-neutral-400 mt-1">Requests will appear here when created</p>
                    </td>
                  </tr>
                ) : (
                  filteredPickups.map((pickup) => (
                    <tr
                      key={pickup.id}
                      onClick={() => { setSelectedItem(pickup); setDrawerType('pickup'); }}
                      className="hover:bg-[#FAF8F6]/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-neutral-900">{pickup.request_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-900">{pickup.room_number}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-700">{pickup.guest_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-700 capitalize">{pickup.pickup_type?.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-600 max-w-[200px] truncate block">{pickup.items_description}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${getPriorityBadge(pickup.priority)}`}>
                          {pickup.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${getStatusBadge(pickup.status)}`}>
                          {pickup.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {pickup.assigned_to_name ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#A57865]/10 flex items-center justify-center">
                              <span className="text-xs font-semibold text-[#A57865]">
                                {(pickup.assigned_to_name || '').split(' ').filter(n => n).map(n => n[0]).join('') || 'U'}
                              </span>
                            </div>
                            <span className="text-sm text-neutral-700">{pickup.assigned_to_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {!pickup.assigned_to && (
                            <select
                              onChange={(e) => e.target.value && assignPickup(pickup.id, parseInt(e.target.value))}
                              className="px-2 py-1.5 text-xs font-medium bg-[#FAF8F6] border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A57865] cursor-pointer"
                              defaultValue=""
                            >
                              <option value="">Assign Runner</option>
                              {runners.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          )}
                          {pickup.status !== 'completed' && pickup.assigned_to && (
                            <button
                              onClick={() => updatePickupStatus(pickup.id, 'completed')}
                              className="px-2 py-1 text-xs font-medium text-[#4E5840] hover:bg-[#4E5840]/10 rounded transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results count */}
          <div className="px-4 py-3 border-t border-neutral-100 bg-[#FAF8F6]/50">
            <p className="text-sm text-neutral-500">
              Showing {filteredPickups.length} of {pickups.length} pickup requests
            </p>
          </div>
        </div>
      )}

      {activeTab === 'deliveries' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAF8F6] border-b border-neutral-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Delivery #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <Truck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-neutral-500">No deliveries found</p>
                      <p className="text-sm text-neutral-400 mt-1">Deliveries will appear here when created</p>
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      onClick={() => { setSelectedItem(delivery); setDrawerType('delivery'); }}
                      className="hover:bg-[#FAF8F6]/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-neutral-900">{delivery.delivery_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-900">{delivery.room_number}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-700">{delivery.guest_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-700 capitalize">{delivery.delivery_type?.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-600 max-w-[200px] truncate block">{delivery.items_description}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${getPriorityBadge(delivery.priority)}`}>
                          {delivery.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${getStatusBadge(delivery.status)}`}>
                          {delivery.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {delivery.assigned_to_name ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#A57865]/10 flex items-center justify-center">
                              <span className="text-xs font-semibold text-[#A57865]">
                                {(delivery.assigned_to_name || '').split(' ').filter(n => n).map(n => n[0]).join('') || 'U'}
                              </span>
                            </div>
                            <span className="text-sm text-neutral-700">{delivery.assigned_to_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {!delivery.assigned_to && (
                            <select
                              onChange={(e) => e.target.value && assignDelivery(delivery.id, parseInt(e.target.value))}
                              className="px-2 py-1.5 text-xs font-medium bg-[#FAF8F6] border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A57865] cursor-pointer"
                              defaultValue=""
                            >
                              <option value="">Assign Runner</option>
                              {runners.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          )}
                          {delivery.status !== 'completed' && delivery.assigned_to && (
                            <button
                              onClick={() => updateDeliveryStatus(delivery.id, 'completed')}
                              className="px-2 py-1 text-xs font-medium text-[#4E5840] hover:bg-[#4E5840]/10 rounded transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results count */}
          <div className="px-4 py-3 border-t border-neutral-100 bg-[#FAF8F6]/50">
            <p className="text-sm text-neutral-500">
              Showing {filteredDeliveries.length} of {deliveries.length} deliveries
            </p>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {runners.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-neutral-200">
              <User className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No runner staff found</p>
              <p className="text-sm text-neutral-400 mt-1">Add staff with runner role to see them here</p>
            </div>
          ) : (
            runners.map((runner) => {
              const assignedPickups = pickups.filter(p => p.assigned_to === runner.id && p.status !== 'completed').length;
              const assignedDeliveries = deliveries.filter(d => d.assigned_to === runner.id && d.status !== 'completed').length;
              const totalActive = assignedPickups + assignedDeliveries;

              return (
                <div key={runner.id} className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-all hover:border-[#A57865]/30">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#A57865]/20 to-[#A57865]/5 flex items-center justify-center flex-shrink-0">
                      {runner.avatar ? (
                        <img src={runner.avatar} alt={runner.name} className="w-14 h-14 rounded-xl object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-[#A57865]">
                          {(runner.name || '').split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase() || 'R'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 truncate">{runner.name}</h3>
                      <p className="text-sm text-neutral-500 capitalize">{runner.role?.replace('_', ' ')}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                          runner.status === 'active' ? 'bg-[#4E5840]/15 text-[#4E5840]' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {runner.status}
                        </span>
                        {runner.clocked_in && (
                          <span className="flex items-center gap-1 text-xs text-[#4E5840]">
                            <span className="w-1.5 h-1.5 bg-[#4E5840] rounded-full animate-pulse" />
                            Clocked In
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-neutral-900">{totalActive}</p>
                        <p className="text-xs text-neutral-500">Active</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#5C9BA4]">{assignedPickups}</p>
                        <p className="text-xs text-neutral-500">Pickups</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#A57865]">{assignedDeliveries}</p>
                        <p className="text-xs text-neutral-500">Deliveries</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  {(runner.phone || runner.email) && (
                    <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
                      {runner.phone && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Phone className="w-4 h-4 text-neutral-400" />
                          {runner.phone}
                        </div>
                      )}
                      {runner.email && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600 truncate">
                          <Mail className="w-4 h-4 text-neutral-400" />
                          {runner.email}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Detail Drawer */}
      {selectedItem && drawerType && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => { setSelectedItem(null); setDrawerType(null); }}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-neutral-200 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    {drawerType === 'pickup' ? 'Pickup Request' : 'Delivery'} Details
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1 font-mono">
                    {drawerType === 'pickup' ? (selectedItem as PickupRequest).request_number : (selectedItem as Delivery).delivery_number}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedItem(null); setDrawerType(null); }}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status and Priority */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${getStatusBadge(selectedItem.status)}`}>
                    {selectedItem.status?.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold capitalize ${getPriorityBadge(selectedItem.priority)}`}>
                    {selectedItem.priority} Priority
                  </span>
                </div>

                {/* Location */}
                <div className="bg-[#FAF8F6] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#A57865]" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Room</p>
                      <p className="text-lg font-bold text-neutral-900">{selectedItem.room_number}</p>
                    </div>
                  </div>
                </div>

                {/* Guest Info */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3">Guest Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-700">{selectedItem.guest_name}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3">Items</h3>
                  <p className="text-sm text-neutral-600 bg-[#FAF8F6] rounded-lg p-3">{selectedItem.items_description}</p>
                </div>

                {/* Assigned Runner */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3">Assigned Runner</h3>
                  {selectedItem.assigned_to_name ? (
                    <div className="flex items-center gap-3 bg-[#FAF8F6] rounded-lg p-3">
                      <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#A57865]">
                          {(selectedItem.assigned_to_name || '').split(' ').filter(n => n).map(n => n[0]).join('') || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{selectedItem.assigned_to_name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#FAF8F6] rounded-lg p-3">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            if (drawerType === 'pickup') {
                              assignPickup(selectedItem.id, parseInt(e.target.value));
                            } else {
                              assignDelivery(selectedItem.id, parseInt(e.target.value));
                            }
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]"
                        defaultValue=""
                      >
                        <option value="">Select a runner to assign...</option>
                        {runners.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedItem.special_instructions && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-3">Special Instructions</h3>
                    <p className="text-sm text-neutral-600 bg-[#FAF8F6] rounded-lg p-3">{selectedItem.special_instructions}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-neutral-200 space-y-3">
                {selectedItem.status === 'pending' && selectedItem.assigned_to && (
                  <button
                    onClick={() => {
                      if (drawerType === 'pickup') {
                        updatePickupStatus(selectedItem.id, 'in_progress');
                      } else {
                        updateDeliveryStatus(selectedItem.id, 'in_progress');
                      }
                    }}
                    className="w-full py-3 bg-[#5C9BA4] text-white rounded-xl font-medium hover:bg-[#5C9BA4]/90 transition-colors"
                  >
                    Start {drawerType === 'pickup' ? 'Pickup' : 'Delivery'}
                  </button>
                )}
                {(selectedItem.status === 'in_progress' || selectedItem.status === 'assigned') && (
                  <button
                    onClick={() => {
                      if (drawerType === 'pickup') {
                        updatePickupStatus(selectedItem.id, 'completed');
                      } else {
                        updateDeliveryStatus(selectedItem.id, 'completed');
                      }
                    }}
                    className="w-full py-3 bg-[#4E5840] text-white rounded-xl font-medium hover:bg-[#4E5840]/90 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
                {selectedItem.status !== 'completed' && selectedItem.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      if (drawerType === 'pickup') {
                        updatePickupStatus(selectedItem.id, 'cancelled');
                      } else {
                        updateDeliveryStatus(selectedItem.id, 'cancelled');
                      }
                    }}
                    className="w-full py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                  >
                    Cancel {drawerType === 'pickup' ? 'Pickup' : 'Delivery'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
