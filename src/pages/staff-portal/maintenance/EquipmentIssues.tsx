import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Settings,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Search,
  X,
  Loader2,
  Wrench,
  ThermometerSun,
  Zap,
  Droplets,
  Monitor,
  Hammer,
  Shield,
  Play,
  ChevronDown,
  Check
} from 'lucide-react';
import { useEquipmentIssues, useMaintenanceActions, useStaffProfile } from '@/hooks/staff-portal/useStaffApi';
import { StatCard } from '../../../components/staff-portal/ui/Card';
import { StatusBadge, SeverityBadge } from '../../../components/staff-portal/ui/Badge';
import Button from '../../../components/staff-portal/ui/Button';
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
        <span className={selectedOption ? 'text-neutral-700' : 'text-neutral-400'}>
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

const EquipmentIssues = () => {
  const { data: profile } = useStaffProfile();

  // API hooks for real data
  const { data: pendingIssues, loading: pendingLoading, refetch: refetchPending } = useEquipmentIssues({ status: 'pending' });
  const { data: inProgressIssues, loading: inProgressLoading, refetch: refetchInProgress } = useEquipmentIssues({ status: 'in_progress' });
  const { data: resolvedIssues, loading: resolvedLoading, refetch: refetchResolved } = useEquipmentIssues({ status: 'resolved' });
  const { acceptEquipmentIssue, resolveEquipmentIssue, loading: actionLoading } = useMaintenanceActions();

  // Combine all equipment issues
  const equipmentIssues = useMemo(() => {
    return [...(pendingIssues || []), ...(inProgressIssues || []), ...(resolvedIssues || [])];
  }, [pendingIssues, inProgressIssues, resolvedIssues]);

  const refetchAll = async () => {
    await Promise.all([refetchPending(), refetchInProgress(), refetchResolved()]);
  };

  const isLoading = pendingLoading || inProgressLoading || resolvedLoading;

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [newIssue, setNewIssue] = useState({
    equipment_name: '',
    equipment_type: 'hvac',
    location: '',
    description: '',
    severity: 'medium'
  });

  const issuesByStatus = useMemo(() => ({
    pending: equipmentIssues.filter(i => i.status === 'pending').length,
    in_progress: equipmentIssues.filter(i => i.status === 'in_progress').length,
    resolved: equipmentIssues.filter(i => i.status === 'resolved').length,
    critical: equipmentIssues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length
  }), [equipmentIssues]);

  const filteredIssues = useMemo(() => {
    return equipmentIssues.filter(issue => {
      const matchesSearch =
        issue.equipment_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.issue_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesType = typeFilter === 'all' || issue.equipment_category === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      const statusOrder: Record<string, number> = { in_progress: 0, pending: 1, resolved: 2 };

      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
    });
  }, [equipmentIssues, searchQuery, statusFilter, typeFilter]);

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

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'hvac':
        return <ThermometerSun className="w-5 h-5" />;
      case 'electrical':
        return <Zap className="w-5 h-5" />;
      case 'plumbing':
        return <Droplets className="w-5 h-5" />;
      case 'elevator':
        return <Monitor className="w-5 h-5" />;
      case 'structural':
        return <Hammer className="w-5 h-5" />;
      case 'safety':
        return <Shield className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const equipmentTypes = [
    { value: 'hvac', label: 'HVAC' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'elevator', label: 'Elevator' },
    { value: 'appliance', label: 'Appliance' },
    { value: 'structural', label: 'Structural' },
    { value: 'safety', label: 'Safety' },
    { value: 'general', label: 'General' }
  ];

  const handleStartIssue = async (issue: any) => {
    const success = await acceptEquipmentIssue(issue.id);
    if (success) refetchAll();
  };

  const handleResolveIssue = async (issue: any) => {
    const success = await resolveEquipmentIssue(issue.id);
    if (success) refetchAll();
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-text-light">Loading equipment issues...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">Equipment Issues</h1>
            <p className="text-[13px] sm:text-sm text-neutral-500 mt-0.5">Track and resolve equipment malfunctions</p>
          </div>
          <Button icon={Plus} onClick={() => setShowReportModal(true)} className="w-full sm:w-auto">
            Report Issue
          </Button>
        </div>
      </div>

      {/* Critical Alert */}
      {issuesByStatus.critical > 0 && (
        <div className="p-3 sm:p-4 rounded-lg bg-rose-50 border border-rose-100 mb-4 sm:mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold text-rose-900">Attention Required</h3>
              <p className="text-[11px] text-rose-700 mt-0.5">
                {issuesByStatus.critical} critical issue{issuesByStatus.critical > 1 ? 's' : ''} pending immediate action
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards - 12 Column Grid matching admin dashboard */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Pending"
            value={issuesByStatus.pending}
            subtitle="Awaiting action"
            icon={Clock}
            color="gold"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="In Progress"
            value={issuesByStatus.in_progress}
            subtitle="Being worked on"
            icon={Wrench}
            color="ocean"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Critical"
            value={issuesByStatus.critical}
            subtitle="Require immediate attention"
            icon={AlertTriangle}
            color="danger"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Resolved"
            value={issuesByStatus.resolved}
            subtitle="Successfully fixed"
            icon={CheckCircle}
            color="sage"
          />
        </div>
      </div>

      {/* Search & Filters - matching housekeeping Rooms style */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 sm:h-9 pl-10 pr-10 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-11 sm:h-9 w-full sm:w-[180px] px-3.5 pr-10 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all flex items-center justify-between"
          >
            <span>
              {statusFilter === 'all' && `All (${equipmentIssues.length})`}
              {statusFilter === 'pending' && `Pending (${issuesByStatus.pending})`}
              {statusFilter === 'in_progress' && `In Progress (${issuesByStatus.in_progress})`}
              {statusFilter === 'resolved' && `Resolved (${issuesByStatus.resolved})`}
            </span>
            <ChevronDown className={`w-4 h-4 text-neutral-400 absolute right-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute right-0 mt-2 w-[180px] bg-white rounded-lg border border-neutral-200 shadow-lg z-20 py-1 overflow-hidden">
                {[
                  { value: 'all', label: 'All', count: equipmentIssues.length },
                  { value: 'pending', label: 'Pending', count: issuesByStatus.pending },
                  { value: 'in_progress', label: 'In Progress', count: issuesByStatus.in_progress },
                  { value: 'resolved', label: 'Resolved', count: issuesByStatus.resolved }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(option.value);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-[13px] text-left transition-colors flex items-center justify-between ${
                      statusFilter === option.value
                        ? 'bg-terra-50 text-terra-600 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className={`text-[11px] tabular-nums ${
                      statusFilter === option.value ? 'text-terra-500' : 'text-neutral-400'
                    }`}>
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Equipment Type Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
            className="h-11 sm:h-9 w-full sm:w-[160px] px-3.5 pr-10 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all flex items-center justify-between"
          >
            <span>
              {typeFilter === 'all' ? 'All Types' : equipmentTypes.find(t => t.value === typeFilter)?.label}
            </span>
            <ChevronDown className={`w-4 h-4 text-neutral-400 absolute right-3 transition-transform ${isTypeFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTypeFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsTypeFilterOpen(false)} />
              <div className="absolute right-0 mt-2 w-[160px] bg-white rounded-lg border border-neutral-200 shadow-lg z-20 py-1 overflow-hidden max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('all');
                    setIsTypeFilterOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-[13px] text-left transition-colors flex items-center justify-between ${
                    typeFilter === 'all'
                      ? 'bg-terra-50 text-terra-600 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>All Types</span>
                  {typeFilter === 'all' && <Check className="w-4 h-4 text-terra-600" />}
                </button>
                {equipmentTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setTypeFilter(type.value);
                      setIsTypeFilterOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-[13px] text-left transition-colors flex items-center justify-between ${
                      typeFilter === type.value
                        ? 'bg-terra-50 text-terra-600 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{type.label}</span>
                    {typeFilter === type.value && <Check className="w-4 h-4 text-terra-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-[10px] bg-white overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-neutral-800">Equipment Issues</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{filteredIssues.length} issues</p>
          </div>
        </div>

        {/* Issues List */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-[13px] font-medium text-neutral-600 mb-1">No equipment issues found</p>
              <p className="text-[11px] text-neutral-400 mb-4">Report a new issue to get started</p>
              <Button size="sm" icon={Plus} onClick={() => setShowReportModal(true)}>
                Report Issue
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-3 sm:pt-4">
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`relative p-3 sm:p-4 rounded-lg transition-colors
                    ${issue.severity === 'critical' ? 'bg-rose-50/50 border-l-4 border-l-rose-500' :
                      issue.severity === 'high' ? 'bg-amber-50/30 border-l-4 border-l-amber-500' :
                      issue.status === 'in_progress' ? 'bg-ocean-50/30' :
                      issue.status === 'resolved' ? 'bg-sage-50/30' :
                      'bg-neutral-50/50 hover:bg-neutral-50'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    {/* Equipment Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      issue.severity === 'critical' ? 'bg-rose-50 text-rose-600' :
                      issue.severity === 'high' ? 'bg-amber-50 text-amber-600' :
                      'bg-terra-50 text-terra-600'
                    }`}>
                      {getEquipmentIcon(issue.equipment_category || 'general')}
                    </div>

                    {/* Issue Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-neutral-800">{issue.equipment_name}</span>
                        <SeverityBadge severity={issue.severity} />
                        <StatusBadge status={issue.status} />
                      </div>

                      {issue.issue_description && (
                        <p className="text-[11px] text-neutral-500 line-clamp-2 sm:line-clamp-1 mb-2">{issue.issue_description}</p>
                      )}

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] text-neutral-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          {issue.location}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          {formatDate(issue.reported_at)}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <Settings className="w-3.5 h-3.5 text-neutral-400" />
                          {issue.equipment_category || issue.issue_type}
                        </span>
                        {issue.affects_operations && (
                          <span className="flex items-center gap-1 text-rose-600 font-medium">
                            <Shield className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Affects Ops</span>
                          </span>
                        )}
                      </div>

                      {/* Resolution Info */}
                      {issue.status === 'resolved' && issue.resolution_notes && (
                        <div className="mt-2 p-2 bg-sage-50/50 rounded-lg">
                          <p className="text-[11px] text-sage-700">{issue.resolution_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                      {issue.status === 'pending' && (
                        <Button size="sm" icon={Play} onClick={() => handleStartIssue(issue)} className="w-full sm:w-auto">
                          Start
                        </Button>
                      )}
                      {issue.status === 'in_progress' && (
                        <Button size="sm" variant="success" icon={CheckCircle} onClick={() => handleResolveIssue(issue)} className="w-full sm:w-auto">
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Issue Side Drawer */}
      <Drawer
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Equipment Issue"
        subtitle="Report a new equipment problem or malfunction"
        size="xl"
        footer={
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full">
            <Button variant="outline-neutral" onClick={() => setShowReportModal(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={() => setShowReportModal(false)} className="w-full sm:w-auto">
              Report Issue
            </Button>
          </div>
        }
      >
        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5 sm:mb-2">Equipment Name</label>
            <input
              type="text"
              placeholder="e.g., AC Unit Room 305"
              value={newIssue.equipment_name}
              onChange={(e) => setNewIssue({ ...newIssue, equipment_name: e.target.value })}
              className="w-full h-11 sm:h-9 px-3.5 text-[13px] bg-white border border-neutral-200 rounded-lg text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5 sm:mb-2">Equipment Type</label>
              <SelectDropdown
                value={newIssue.equipment_type}
                onChange={(value) => setNewIssue({ ...newIssue, equipment_type: value })}
                placeholder="Select equipment type"
                options={equipmentTypes}
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5 sm:mb-2">Severity</label>
              <SelectDropdown
                value={newIssue.severity}
                onChange={(value) => setNewIssue({ ...newIssue, severity: value })}
                placeholder="Select severity"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' }
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5 sm:mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g., Room 305, Floor 3"
              value={newIssue.location}
              onChange={(e) => setNewIssue({ ...newIssue, location: e.target.value })}
              className="w-full h-11 sm:h-9 px-3.5 text-[13px] bg-white border border-neutral-200 rounded-lg text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5 sm:mb-2">Description</label>
            <textarea
              placeholder="Describe the issue in detail..."
              value={newIssue.description}
              onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
              rows={4}
              className="w-full px-3.5 py-2.5 sm:py-2 text-[13px] bg-white border border-neutral-200 rounded-lg text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all resize-none"
            />
          </div>

          {newIssue.severity === 'critical' && (
            <div className="p-3 sm:p-4 bg-rose-50 rounded-lg border border-rose-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-rose-900">Critical Issue</p>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                    This will be flagged for immediate attention. Make sure to notify your supervisor.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default EquipmentIssues;
