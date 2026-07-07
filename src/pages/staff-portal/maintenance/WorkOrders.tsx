import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Wrench,
  Plus,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  MapPin,
  Calendar,
  User,
  Loader2,
  Search,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  X,
  Check
} from 'lucide-react';
import PageHeader from '../../../layouts/staff-portal/PageHeader';
import { StatCard } from '../../../components/staff-portal/ui/Card';
import { StatusBadge, SeverityBadge } from '../../../components/staff-portal/ui/Badge';
import Button from '../../../components/staff-portal/ui/Button';
import { useWorkOrders, useMaintenanceActions, useStaffProfile } from '@/hooks/staff-portal/useStaffApi';
import { normalizeUTCDate } from '@/utils/maintenance';

// Custom Select Dropdown Component - matching admin PromotionDrawer style
function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select...'
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const calculatePosition = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    };
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setPosition(null);
    } else {
      setPosition(calculatePosition());
      setIsOpen(true);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setPosition(null);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setPosition(null);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      setPosition(calculatePosition());
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full h-11 sm:h-9 px-3.5 rounded-lg text-[13px] bg-white border text-left flex items-center justify-between transition-all ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            zIndex: 9999
          }}
          className="bg-white rounded-lg border border-neutral-200 shadow-lg shadow-neutral-900/10 overflow-hidden"
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-2.5 text-left text-[13px] flex items-center justify-between transition-colors ${
                  value === option.value
                    ? 'bg-terra-50 text-terra-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4 text-terra-600" />
                )}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Drawer Component - matching admin dashboard style with createPortal
function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'lg'
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes: Record<string, string> = {
    sm: 'w-full sm:w-80',
    md: 'w-full sm:w-96',
    lg: 'w-full sm:w-[480px]',
    xl: 'w-full sm:w-[600px]',
    '2xl': 'w-full sm:w-[672px]'
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        className={`
          fixed top-0 right-0 bottom-0 bg-white h-full overflow-hidden flex flex-col
          border-l border-neutral-200 shadow-xl z-[51]
          ${sizes[size]}
          animate-[slideInRight_0.3s_ease-out]
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-700 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

const WorkOrders = () => {
  const navigate = useNavigate();
  const { data: profile } = useStaffProfile();

  // API hooks for real data
  const { data: pendingWorkOrders, loading: pendingLoading, refetch: refetchPending } = useWorkOrders({ status: 'pending' });
  const { data: inProgressWorkOrders, loading: inProgressLoading, refetch: refetchInProgress } = useWorkOrders({ status: 'in_progress' });
  const { data: completedWorkOrders, loading: completedLoading, refetch: refetchCompleted } = useWorkOrders({ status: 'completed' });
  const { acceptWorkOrder, completeWorkOrder, loading: actionLoading } = useMaintenanceActions();

  // Combine all work orders
  const workOrders = useMemo(() => {
    return [...(pendingWorkOrders || []), ...(inProgressWorkOrders || []), ...(completedWorkOrders || [])];
  }, [pendingWorkOrders, inProgressWorkOrders, completedWorkOrders]);

  // Stats
  const stats = useMemo(() => ({
    pendingWorkOrders: pendingWorkOrders?.length || 0,
    inProgressWorkOrders: inProgressWorkOrders?.length || 0,
    completedWorkOrders: completedWorkOrders?.length || 0,
    criticalWorkOrders: workOrders.filter(wo => wo.priority === 'critical' && wo.status !== 'completed').length
  }), [pendingWorkOrders, inProgressWorkOrders, completedWorkOrders, workOrders]);

  const refetchAll = async () => {
    await Promise.all([refetchPending(), refetchInProgress(), refetchCompleted()]);
  };

  const isLoading = pendingLoading || inProgressLoading || completedLoading;

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [newWorkOrder, setNewWorkOrder] = useState({
    title: '',
    description: '',
    location: '',
    room: '',
    issueType: 'General',
    severity: 'medium',
    estimatedHours: 1
  });

  // Derived counts for tabs
  const activeCount = (pendingWorkOrders?.length || 0) + (inProgressWorkOrders?.length || 0);

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const matchesSearch =
        wo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'active' && wo.status !== 'completed' && wo.status !== 'inspected') ||
        (activeTab === 'completed' && (wo.status === 'completed' || wo.status === 'inspected'));

      return matchesSearch && matchesTab;
    }).sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      const statusOrder: Record<string, number> = { in_progress: 0, pending: 1, completed: 2, inspected: 2 };

      if ((statusOrder[a.status] ?? 2) !== (statusOrder[b.status] ?? 2)) {
        return (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2);
      }
      return (severityOrder[a.priority] || 2) - (severityOrder[b.priority] || 2);
    });
  }, [workOrders, searchQuery, activeTab]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = normalizeUTCDate(dateString);
    if (!date || isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleStartWorkOrder = async (wo: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const success = await acceptWorkOrder(wo.id);
    if (success) refetchAll();
  };

  const handleCompleteWorkOrder = async (wo: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const success = await completeWorkOrder(wo.id);
    if (success) refetchAll();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-text-light">Loading work orders...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header with responsive button */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">
              Work Orders
            </h1>
            <p className="text-[13px] sm:text-sm text-neutral-500 mt-0.5">
              Manage and track all maintenance work orders
            </p>
          </div>
          <Button
            icon={Plus}
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto"
          >
            Create Work Order
          </Button>
        </div>
      </div>

      {/* KPI Cards - 12 Column Grid matching admin dashboard */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Pending"
            value={stats.pendingWorkOrders}
            subtitle="Awaiting action"
            icon={Clock}
            color="gold"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="In Progress"
            value={stats.inProgressWorkOrders}
            subtitle="Currently working"
            icon={Wrench}
            color="ocean"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Critical Issues"
            value={stats.criticalWorkOrders}
            subtitle="Require immediate action"
            icon={AlertTriangle}
            color="danger"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Completed"
            value={stats.completedWorkOrders}
            subtitle="This period"
            icon={CheckCircle}
            color="sage"
          />
        </div>
      </div>

      {/* Status Tabs - matching admin maintenance tab pattern */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        {[
          { key: 'active' as const, label: 'Active', count: activeCount },
          { key: 'completed' as const, label: 'Completed', count: stats.completedWorkOrders },
          { key: 'all' as const, label: 'All', count: workOrders.length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-terra-600 text-white shadow-sm'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-[11px] tabular-nums ${
              activeTab === tab.key ? 'text-white/80' : 'text-neutral-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search work orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-10 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
            >
              <span className="sr-only">Clear search</span>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-[10px] bg-white overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-neutral-800">
              {activeTab === 'active' ? 'Active Work Orders' : activeTab === 'completed' ? 'Completed Work Orders' : 'All Work Orders'}
            </h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{filteredWorkOrders.length} orders</p>
          </div>
        </div>

        {/* Work Orders List */}
        <div className="px-4 sm:px-6 py-4 sm:pb-6">
          {filteredWorkOrders.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Wrench className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-[13px] font-medium text-neutral-600 mb-1">No work orders found</p>
              <p className="text-[11px] text-neutral-400 mb-4">Create a new work order to get started</p>
              <Button size="sm" icon={Plus} onClick={() => setShowAddModal(true)} className="min-h-[44px] sm:min-h-0">
                Create Work Order
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-0 sm:pt-4">
              {filteredWorkOrders.map((wo) => (
                <div
                  key={wo.id}
                  className={`
                    relative p-3 sm:p-4 rounded-lg transition-colors cursor-pointer
                    ${wo.priority === 'critical' ? 'bg-rose-50/50 border-l-4 border-l-rose-500' :
                      wo.priority === 'high' ? 'bg-amber-50/30 border-l-4 border-l-amber-500' :
                      wo.status === 'in_progress' ? 'bg-ocean-50/30' :
                      wo.status === 'completed' ? 'bg-sage-50/30' :
                      'bg-neutral-50/50 hover:bg-neutral-50'}
                  `}
                  onClick={() => navigate(`/staff/maintenance/work-orders/${wo.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        wo.priority === 'critical' ? 'bg-rose-50' :
                        wo.priority === 'high' ? 'bg-amber-50' :
                        'bg-terra-50'
                      }`}>
                        {wo.priority === 'critical' ? (
                          <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
                        ) : (
                          <Wrench className={`w-4.5 h-4.5 ${wo.priority === 'high' ? 'text-amber-600' : 'text-terra-600'}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-neutral-800 truncate">{wo.title}</span>
                          <SeverityBadge severity={wo.priority} />
                          <StatusBadge status={wo.status} />
                        </div>

                        {wo.description && (
                          <p className="text-[11px] text-neutral-500 line-clamp-2 sm:line-clamp-1 mb-2">{wo.description}</p>
                        )}

                        {/* Details - responsive grid on mobile */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:gap-4 text-[11px] text-neutral-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            {wo.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="truncate max-w-[80px] sm:max-w-none">{wo.assigned_to_name || 'Unassigned'}</span>
                          </span>
                          <span className="hidden sm:flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                            {formatDate(wo.reported_at)}
                          </span>
                          {wo.room_number && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-neutral-400" />
                              Room {wo.room_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pl-13 sm:pl-0">
                      <div className="flex items-center gap-2">
                        {wo.status === 'pending' && (
                          <Button
                            size="sm"
                            icon={Play}
                            onClick={(e) => handleStartWorkOrder(wo, e)}
                          >
                            Start
                          </Button>
                        )}
                        {wo.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="success"
                            icon={CheckCircle}
                            onClick={(e) => handleCompleteWorkOrder(wo, e)}
                          >
                            Complete
                          </Button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkOrder(wo);
                            setShowCommentModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          {(wo as any).comments?.length || 0}
                        </button>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-300 hidden sm:block" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Work Order Side Drawer */}
      <Drawer
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Work Order"
        subtitle="Fill in the details for the new work order"
        size="xl"
        footer={
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full">
            <Button variant="outline-neutral" onClick={() => setShowAddModal(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={() => setShowAddModal(false)} className="w-full sm:w-auto">
              Create Work Order
            </Button>
          </div>
        }
      >
        <div className="space-y-5 sm:space-y-6">
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3 sm:mb-4">
              Work Order Details
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Brief description of the issue"
                  value={newWorkOrder.title}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, title: e.target.value })}
                  className="w-full h-11 sm:h-9 px-3.5 text-[13px] bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">Description</label>
                <textarea
                  placeholder="Detailed description of the problem..."
                  value={newWorkOrder.description}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 sm:py-2 text-[13px] bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3 sm:mb-4">
              Location
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Room 305, Lobby"
                  value={newWorkOrder.location}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, location: e.target.value })}
                  className="w-full h-11 sm:h-9 px-3.5 text-[13px] bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g., 305"
                  value={newWorkOrder.room}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, room: e.target.value })}
                  className="w-full h-11 sm:h-9 px-3.5 text-[13px] bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3 sm:mb-4">
              Classification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">Issue Type</label>
                <SelectDropdown
                  value={newWorkOrder.issueType}
                  onChange={(value) => setNewWorkOrder({ ...newWorkOrder, issueType: value })}
                  placeholder="Select issue type"
                  options={[
                    { value: 'General', label: 'General' },
                    { value: 'HVAC', label: 'HVAC' },
                    { value: 'Plumbing', label: 'Plumbing' },
                    { value: 'Electrical', label: 'Electrical' },
                    { value: 'Elevator', label: 'Elevator' },
                    { value: 'Structural', label: 'Structural' },
                    { value: 'Appliance', label: 'Appliance' },
                    { value: 'Safety', label: 'Safety' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">Priority</label>
                <SelectDropdown
                  value={newWorkOrder.severity}
                  onChange={(value) => setNewWorkOrder({ ...newWorkOrder, severity: value })}
                  placeholder="Select priority"
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'critical', label: 'Critical' }
                  ]}
                />
              </div>
            </div>
          </div>

          {newWorkOrder.severity === 'critical' && (
            <div className="p-3 sm:p-4 bg-rose-50 rounded-lg border border-rose-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-rose-900">Critical Issue</p>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                    This will be flagged for immediate attention and prioritized.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* Comment Side Drawer */}
      <Drawer
        isOpen={showCommentModal && !!selectedWorkOrder}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedWorkOrder(null);
          setNewComment('');
        }}
        title="Comments"
        subtitle={selectedWorkOrder?.title}
        size="lg"
        footer={
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full">
            <Button
              variant="outline-neutral"
              onClick={() => {
                setShowCommentModal(false);
                setSelectedWorkOrder(null);
                setNewComment('');
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowCommentModal(false);
                setSelectedWorkOrder(null);
                setNewComment('');
              }}
              className="w-full sm:w-auto"
            >
              Add Comment
            </Button>
          </div>
        }
      >
        <div className="space-y-5 sm:space-y-6">
          {/* Existing Comments */}
          {selectedWorkOrder?.comments && selectedWorkOrder.comments.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Previous Comments</p>
              {selectedWorkOrder.comments.map((comment: any) => (
                <div key={comment.id} className="p-3 sm:p-4 bg-neutral-50 rounded-lg">
                  <p className="text-[13px] text-neutral-700">{comment.text}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {comment.author} • {formatDate(comment.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">New Comment</label>
            <textarea
              placeholder="Add your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 sm:py-2 text-[13px] bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all resize-none"
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default WorkOrders;
