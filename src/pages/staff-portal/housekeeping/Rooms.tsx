import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BedDouble,
  ChevronRight,
  AlertTriangle,
  Clock,
  Loader2,
  Sparkles,
  Search,
  ChevronDown
} from 'lucide-react';
import PageHeader from '../../../layouts/staff-portal/PageHeader';
import { StatCard } from '../../../components/staff-portal/ui/Card';
import { StatusBadge, PriorityBadge } from '../../../components/staff-portal/ui/Badge';
import Button from '../../../components/staff-portal/ui/Button';
import { useMyHousekeepingRooms, useMyHousekeepingTasks, useHousekeepingActions } from '@/hooks/staff-portal/useStaffApi';

// Section Card matching admin LuxurySectionCard
function SectionCard({
  title,
  subtitle,
  action,
  actionLabel,
  children,
  className = '',
  noPadding = false
}: {
  title?: string;
  subtitle?: string;
  action?: () => void;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={`rounded-[10px] bg-white overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100 flex-shrink-0">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-neutral-800">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && (
            <button
              onClick={action}
              className="flex items-center gap-1 text-[11px] font-semibold text-terra-600 px-3 py-1.5 rounded-lg hover:bg-terra-50 transition-colors flex-shrink-0"
            >
              <span className="hidden xs:inline">{actionLabel}</span>
              <span className="xs:hidden">View</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'px-4 sm:px-6 pb-4 sm:pb-6'}>{children}</div>
    </div>
  );
}

const HousekeepingRooms = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // API hooks - BUG-002 FIX: Use useMyHousekeepingRooms to only show rooms assigned to current user
  const { data: dirtyRooms, loading: dirtyLoading, refetch: refetchDirty } = useMyHousekeepingRooms('dirty');
  const { data: inProgressRooms, loading: inProgressLoading, refetch: refetchInProgress } = useMyHousekeepingRooms('in_progress');
  const { data: cleanRooms, loading: cleanLoading, refetch: refetchClean } = useMyHousekeepingRooms('clean');
  const { data: inspectedRooms, loading: inspectedLoading, refetch: refetchInspected } = useMyHousekeepingRooms('inspected');
  const { data: myTasks, refetch: refetchTasks } = useMyHousekeepingTasks();
  const { updateRoomStatus, startTask, completeTask } = useHousekeepingActions();

  // Combine all rooms (BUG-034 FIX: include inspected rooms so they don't disappear after inspection)
  const rooms = useMemo(() => {
    return [...(dirtyRooms || []), ...(inProgressRooms || []), ...(cleanRooms || []), ...(inspectedRooms || [])];
  }, [dirtyRooms, inProgressRooms, cleanRooms, inspectedRooms]);

  const refetchAll = async () => {
    await Promise.all([refetchDirty(), refetchInProgress(), refetchClean(), refetchInspected(), refetchTasks()]);
  };

  const isLoading = dirtyLoading || inProgressLoading || cleanLoading || inspectedLoading;

  // Calculate stats from data
  const stats = useMemo(() => ({
    dirtyRooms: dirtyRooms?.length || 0,
    inProgressRooms: inProgressRooms?.length || 0,
    cleanRooms: cleanRooms?.length || 0,
    inspectedRooms: inspectedRooms?.length || 0,
    urgentRooms: rooms.filter(r => r.priority === 'urgent' && r.status !== 'clean' && r.status !== 'inspected').length
  }), [dirtyRooms, inProgressRooms, cleanRooms, inspectedRooms, rooms]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const priorityFilter = searchParams.get('priority') || 'all';

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const roomNumber = room.room_number || room.number || '';
      const roomType = room.room_type || room.type || '';
      const guestName = room.guest_name || room.guestName || '';

      const matchesSearch = roomNumber.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guestName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || room.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [rooms, searchQuery, statusFilter, priorityFilter]);

  const getChecklistProgress = (checklist: any, roomStatus?: string) => {
    // BUG-022 FIX: Clean/inspected rooms should ALWAYS show 100% regardless of stale checklist data
    if (roomStatus === 'clean' || roomStatus === 'inspected') {
      const total = Array.isArray(checklist) && checklist.length > 0 ? checklist.length : 8;
      return { completed: total, total, percentage: 100 };
    }
    if (!Array.isArray(checklist) || checklist.length === 0) {
      return { completed: 0, total: 8, percentage: 0 };
    }
    const completed = checklist.filter(c => c.completed).length;
    return {
      completed,
      total: checklist.length,
      percentage: Math.round((completed / checklist.length) * 100)
    };
  };

  const handleStartCleaning = async (room: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // BUG-002 FIX: Find task for this room and start it (backend updates room status too)
    const roomTask = myTasks?.find((t: any) =>
      t.room_id === room.id && (t.status === 'pending' || t.status === 'assigned')
    );
    if (roomTask) {
      const success = await startTask(roomTask.id);
      if (success) refetchAll();
    } else {
      // Fallback if no task found
      const success = await updateRoomStatus(room.id, 'in_progress');
      if (success) refetchAll();
    }
  };

  const handleMarkClean = async (room: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Find in-progress task for this room and complete it (backend updates room status too)
    const roomTask = myTasks?.find((t: any) =>
      t.room_id === room.id && t.status === 'in_progress'
    );
    if (roomTask) {
      const success = await completeTask(roomTask.id);
      if (success) refetchAll();
    } else {
      const success = await updateRoomStatus(room.id, 'clean');
      if (success) refetchAll();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-text-light">Loading rooms...</span>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Rooms"
        subtitle={`${rooms.length} rooms assigned to you`}
      />

      {/* KPI Cards - 12 Column Grid matching admin dashboard */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Dirty Rooms"
            value={stats.dirtyRooms}
            subtitle="Need cleaning"
            icon={AlertTriangle}
            color="danger"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="In Progress"
            value={stats.inProgressRooms}
            subtitle="Currently cleaning"
            icon={Clock}
            color="gold"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Clean / Inspected"
            value={stats.cleanRooms + stats.inspectedRooms}
            subtitle="Ready for guests"
            icon={Sparkles}
            color="sage"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="High Priority"
            value={stats.urgentRooms}
            subtitle="Require attention"
            icon={AlertTriangle}
            color="terra"
          />
        </div>
      </div>

      {/* Search & Filters - matching admin OTA Connections style */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
            >
              <span className="sr-only">Clear search</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-11 w-full sm:w-[180px] px-4 pr-10 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all flex items-center justify-between"
          >
            <span>
              {statusFilter === 'all' && `All (${rooms.length})`}
              {statusFilter === 'dirty' && `Dirty (${stats.dirtyRooms})`}
              {statusFilter === 'in_progress' && `In Progress (${stats.inProgressRooms})`}
              {statusFilter === 'clean' && `Clean (${stats.cleanRooms})`}
              {statusFilter === 'inspected' && `Inspected (${stats.inspectedRooms})`}
            </span>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterOpen(false)}
              />
              {/* Dropdown menu */}
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-[180px] bg-white rounded-lg border border-neutral-200 shadow-lg z-20 py-1 overflow-hidden">
                {[
                  { value: 'all', label: 'All', count: rooms.length },
                  { value: 'dirty', label: 'Dirty', count: stats.dirtyRooms },
                  { value: 'in_progress', label: 'In Progress', count: stats.inProgressRooms },
                  { value: 'clean', label: 'Clean', count: stats.cleanRooms },
                  { value: 'inspected', label: 'Inspected', count: stats.inspectedRooms }
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
      </div>

      {/* Rooms Grid - 12 Column Grid */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        <div className="col-span-12">
          <SectionCard
            title="All Rooms"
            subtitle={`${filteredRooms.length} rooms`}
          >
            {filteredRooms.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <BedDouble className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-[13px] font-semibold text-neutral-800 mb-1">No rooms found</h3>
                <p className="text-[11px] text-neutral-500">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pt-4">
                {filteredRooms.map((room: any) => {
                  const progress = getChecklistProgress(room.checklist, room.status);

                  return (
                    <div
                      key={room.id}
                      onClick={() => navigate(`/staff/housekeeping/rooms/${room.id}`)}
                      className={`
                        relative flex flex-col p-3 sm:p-4 rounded-lg transition-all cursor-pointer
                        ${room.status === 'in_progress' ? 'bg-gold-50/30' :
                          room.status === 'clean' || room.status === 'inspected' ? 'bg-sage-50/30' :
                          'bg-neutral-50/50 hover:bg-neutral-50'}
                      `}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                            ${room.status === 'dirty' ? 'bg-rose-100' :
                              room.status === 'in_progress' ? 'bg-gold-100' :
                              'bg-sage-100'}
                          `}>
                            <BedDouble className={`w-4 h-4 ${
                              room.status === 'dirty' ? 'text-rose-600' :
                              room.status === 'in_progress' ? 'text-gold-600' :
                              'text-sage-600'
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-[13px] font-semibold text-neutral-800 truncate">Room {room.room_number || room.number}</h3>
                            <p className="text-[11px] text-neutral-500 font-medium truncate">{room.room_type || room.type}</p>
                          </div>
                        </div>
                        <StatusBadge status={room.status} />
                      </div>

                      {/* Room Info — always show floor + guest + next check-in rows for consistent height */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400 font-medium">Floor</span>
                          <span className="font-semibold text-neutral-700">{room.floor}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400 font-medium">Guest</span>
                          <span className="font-semibold text-neutral-700 truncate max-w-[120px]">
                            {room.guest_name || room.guestName || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400 font-medium">Next Check-in</span>
                          <span className="font-semibold text-neutral-700">
                            {room.next_checkin || room.nextCheckin || '—'}
                          </span>
                        </div>
                      </div>

                      {/* Checklist Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-neutral-400 font-medium">Checklist</span>
                          <span className="font-semibold text-neutral-700">{progress.completed}/{progress.total}</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              progress.percentage === 100 ? 'bg-sage-500' :
                              progress.percentage > 50 ? 'bg-ocean-500' :
                              progress.percentage > 0 ? 'bg-gold-500' :
                              'bg-neutral-300'
                            }`}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Special Requests / Task Notes (BUG-018 FIX) */}
                      {(room.special_requests || room.specialRequests || room.notes) && (
                        <div className="p-2.5 rounded-lg bg-gold-50/50 border border-gold-100 mb-3">
                          <p className="text-[10px] text-gold-700 font-semibold uppercase tracking-wide">
                            {room.special_requests || room.specialRequests ? 'Special Request' : 'Task Notes'}
                          </p>
                          <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-2">{room.special_requests || room.specialRequests || room.notes}</p>
                        </div>
                      )}

                      {/* Priority Badge */}
                      {room.priority && room.priority !== 'normal' && (
                        <div className="mb-3">
                          <PriorityBadge priority={room.priority} />
                        </div>
                      )}

                      {/* Actions — pinned to bottom */}
                      <div className="flex items-center gap-2 mt-auto pt-1">
                        {room.status === 'dirty' && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => handleStartCleaning(room, e)}
                          >
                            Start Cleaning
                          </Button>
                        )}
                        {room.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="success"
                            className="flex-1"
                            onClick={(e) => handleMarkClean(room, e)}
                          >
                            Mark Clean
                          </Button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/staff/housekeeping/rooms/${room.id}`);
                          }}
                          className={`
                            inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium rounded-[var(--brand-radius-sm)] transition-colors
                            text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100
                            ${room.status !== 'dirty' && room.status !== 'in_progress' ? 'flex-1 justify-center' : ''}
                          `}
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default HousekeepingRooms;





