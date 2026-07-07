import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardList,
  Plus,
  Play,
  CheckCircle,
  Clock,
  Trash2,
  ChevronRight,
  ChevronDown,
  Loader2,
  Check
} from 'lucide-react';
import { StatCard } from '../../../components/staff-portal/ui/Card';
import { StatusBadge, PriorityBadge } from '../../../components/staff-portal/ui/Badge';
import Button from '../../../components/staff-portal/ui/Button';
import { Drawer, ConfirmModal } from '../../../components/staff-portal/ui/Modal';
import { SearchInput } from '../../../components/staff-portal/ui/Input';
import { useMyHousekeepingTasks, useHousekeepingRooms, useHousekeepingActions } from '@/hooks/staff-portal/useStaffApi';
import { housekeepingService } from '@/api/services/housekeeping.service';

// Custom Select Dropdown Component - matching admin PromotionDrawer
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
                className={`w-full px-3 py-2.5 text-left text-[13px] flex items-center justify-between transition-colors ${
                  value === option.value
                    ? 'bg-terra-50 text-terra-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-terra-500" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

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

const HousekeepingTasks = () => {
  const { data: pendingTasks, loading: pendingLoading, refetch: refetchPending } = useMyHousekeepingTasks('pending');
  const { data: inProgressTasks, loading: inProgressLoading, refetch: refetchInProgress } = useMyHousekeepingTasks('in_progress');
  const { data: completedTasks, loading: completedLoading, refetch: refetchCompleted } = useMyHousekeepingTasks('completed');
  const { data: rooms } = useHousekeepingRooms();
  const { startTask, completeTask, cancelTask } = useHousekeepingActions();

  // Combine all tasks
  const tasks = useMemo(() => {
    return [...(pendingTasks || []), ...(inProgressTasks || []), ...(completedTasks || [])];
  }, [pendingTasks, inProgressTasks, completedTasks]);

  const refetchAll = async () => {
    await Promise.all([refetchPending(), refetchInProgress(), refetchCompleted()]);
  };

  const isLoading = pendingLoading || inProgressLoading || completedLoading;

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    room: '',
    priority: 'normal',
    category: 'cleaning',
    estimatedMinutes: 30
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task: any) => {
      const taskTitle = task.title || task.task_type || '';
      const taskDescription = task.description || task.notes || '';
      const taskRoom = task.room || task.room_number || '';
      const matchesSearch = taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        taskDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        taskRoom.toLowerCase().includes(searchQuery.toLowerCase());

      // Map backend statuses to frontend filter categories
      const effectiveStatus = (task.status === 'pending' || task.status === 'assigned') ? 'todo' : task.status;
      const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a: any, b: any) => {
      const priorityOrder: any = { urgent: 0, high: 1, normal: 2, low: 3 };
      const statusOrder: any = { in_progress: 0, todo: 1, completed: 2 };

      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, searchQuery, statusFilter]);

  const taskStats = useMemo(() => ({
    todo: tasks.filter((t: any) => t.status === 'todo' || t.status === 'pending' || t.status === 'assigned').length,
    in_progress: tasks.filter((t: any) => t.status === 'in_progress').length,
    completed: tasks.filter((t: any) => t.status === 'completed').length
  }), [tasks]);

  const formatDueTime = (dueTime: string) => {
    if (!dueTime) return null;
    const date = new Date(dueTime);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.room) return;
    setIsCreating(true);
    try {
      const room = roomsList.find((r: any) => (r.room_number || r.number) === newTask.room);
      await housekeepingService.createTask({
        room_id: room?.id,
        task_type: newTask.category,
        priority: newTask.priority,
        notes: newTask.description || undefined,
        estimated_duration: newTask.estimatedMinutes,
      });
      setNewTask({
        title: '',
        description: '',
        room: '',
        priority: 'normal',
        category: 'cleaning',
        estimatedMinutes: 30
      });
      setShowAddModal(false);
      refetchAll();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartTask = async (task: any) => {
    const success = await startTask(task.id);
    if (success) refetchAll();
  };

  const handleCompleteTask = async (task: any) => {
    const success = await completeTask(task.id);
    if (success) refetchAll();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTask) return;
    const success = await cancelTask(selectedTask.id);
    if (success) {
      refetchAll();
    }
    setSelectedTask(null);
    setShowDeleteModal(false);
  };

  const roomsList = rooms || [];
  const roomOptions = roomsList.map((r: any) => ({
    value: r.room_number || r.number,
    label: `Room ${r.room_number || r.number} - ${r.room_type || r.type}`
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-text-light">Loading tasks...</span>
      </div>
    );
  }

  const categoryOptions = [
    { value: 'cleaning', label: 'Regular Cleaning' },
    { value: 'deep_clean', label: 'Deep Cleaning' },
    { value: 'turndown', label: 'Turndown Service' },
    { value: 'restock', label: 'Restock Amenities' },
    { value: 'special_setup', label: 'Special Setup' },
    { value: 'maintenance', label: 'Light Maintenance' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <div>
      {/* Header with responsive Add Task button */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">
              My Tasks
            </h1>
            <p className="text-[13px] sm:text-sm text-neutral-500 mt-0.5">
              {taskStats.todo + taskStats.in_progress} pending tasks
            </p>
          </div>
          <Button
            icon={Plus}
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto"
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* KPI Cards - 12 Column Grid matching admin dashboard */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div
          className={`col-span-12 sm:col-span-6 xl:col-span-4 cursor-pointer transition-all active:scale-[0.98] ${
            statusFilter === 'todo' ? 'ring-2 ring-terra-500 rounded-[10px]' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'todo' ? 'all' : 'todo')}
        >
          <StatCard
            title="To Do"
            value={taskStats.todo}
            subtitle="Pending tasks"
            icon={ClipboardList}
            color="terra"
          />
        </div>
        <div
          className={`col-span-12 sm:col-span-6 xl:col-span-4 cursor-pointer transition-all active:scale-[0.98] ${
            statusFilter === 'in_progress' ? 'ring-2 ring-gold-500 rounded-[10px]' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
        >
          <StatCard
            title="In Progress"
            value={taskStats.in_progress}
            subtitle="Currently working"
            icon={Clock}
            color="gold"
          />
        </div>
        <div
          className={`col-span-12 sm:col-span-12 xl:col-span-4 cursor-pointer transition-all active:scale-[0.98] ${
            statusFilter === 'completed' ? 'ring-2 ring-sage-500 rounded-[10px]' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
        >
          <StatCard
            title="Completed"
            value={taskStats.completed}
            subtitle="Tasks done today"
            icon={CheckCircle}
            color="sage"
          />
        </div>
      </div>

      {/* Search - full width, touch-friendly */}
      <div className="mb-4 sm:mb-6">
        <SearchInput
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          className="w-full bg-white"
        />
      </div>

      {/* Tasks List - 12 Column Grid */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        <div className="col-span-12">
        <SectionCard
          title="All Tasks"
          subtitle={`${filteredTasks.length} tasks`}
        >
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ClipboardList className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-[13px] font-semibold text-neutral-800 mb-1">No tasks found</h3>
              <p className="text-[11px] text-neutral-500 mb-4">Create a new task to get started</p>
              <Button icon={Plus} onClick={() => setShowAddModal(true)} className="min-h-[44px] sm:min-h-0">
                Add Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-4">
              {filteredTasks.map((task: any) => (
                <div
                  key={task.id}
                  className={`
                    flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors
                    ${task.priority === 'urgent' ? 'bg-rose-50/50 border-l-4 border-l-rose-500' :
                      task.priority === 'high' ? 'bg-gold-50/50 border-l-4 border-l-gold-500' :
                      task.status === 'in_progress' ? 'bg-gold-50/30' :
                      task.status === 'completed' ? 'bg-sage-50/30' :
                      'bg-neutral-50/50 hover:bg-neutral-50'}
                  `}
                >
                  {/* Top row on mobile: Icon + Content */}
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* Status Icon */}
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${task.status === 'completed' ? 'bg-sage-50' :
                        task.status === 'in_progress' ? 'bg-gold-50' :
                        'bg-terra-50'}
                    `}>
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-4.5 h-4.5 text-sage-600" />
                      ) : task.status === 'in_progress' ? (
                        <Clock className="w-4.5 h-4.5 text-gold-600" />
                      ) : (
                        <ClipboardList className="w-4.5 h-4.5 text-terra-600" />
                      )}
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className={`text-[13px] font-semibold text-neutral-800 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                            {task.title || `${(task.task_type || 'cleaning').charAt(0).toUpperCase() + (task.task_type || 'cleaning').slice(1)} Task`}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                            <span className="text-[11px] text-neutral-500 font-medium">Room {task.room_number || task.room}</span>
                            <StatusBadge status={task.status === 'pending' || task.status === 'assigned' ? 'todo' : task.status} />
                            <PriorityBadge priority={task.priority} />
                          </div>
                        </div>

                        {/* Delete button - visible on desktop next to title */}
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowDeleteModal(true);
                          }}
                          className="hidden sm:flex p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {(task.description || task.notes) && (
                        <div className="text-[11px] text-gold-700 bg-gold-50 rounded px-2 py-1.5 mt-2 leading-relaxed">
                          <span className="font-semibold">Notes:</span> {task.description || task.notes}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3 text-[10px] text-neutral-400 font-medium">
                        <span className="truncate">Assigned by: {task.assigned_by_name || task.assignedBy || 'System'}</span>
                        {(task.due_time || task.dueTime) && (
                          <>
                            <span className="text-neutral-300 hidden sm:inline">•</span>
                            <span>Due: {formatDueTime(task.due_time || task.dueTime)}</span>
                          </>
                        )}
                        {(task.estimated_minutes || task.estimatedMinutes) && (
                          <>
                            <span className="text-neutral-300 hidden sm:inline">•</span>
                            <span>Est: {task.estimated_minutes || task.estimatedMinutes}min</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row on mobile: Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:flex-shrink-0 pl-13 sm:pl-0">
                    <div className="flex items-center gap-2">
                      {(task.status === 'todo' || task.status === 'pending' || task.status === 'assigned') && (
                        <Button
                          size="sm"
                          icon={Play}
                          onClick={() => handleStartTask(task)}
                        >
                          Start
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="success"
                          icon={CheckCircle}
                          onClick={() => handleCompleteTask(task)}
                        >
                          Complete
                        </Button>
                      )}
                      {task.status === 'completed' && (
                        <span className="text-[11px] text-sage-600 flex items-center gap-1 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}
                    </div>

                    {/* Delete button - visible on mobile */}
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowDeleteModal(true);
                      }}
                      className="sm:hidden p-2 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <ChevronRight className="w-3.5 h-3.5 text-neutral-300 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        </div>
      </div>

      {/* Add Task Drawer - matching admin PromotionDrawer */}
      <Drawer
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Task"
        subtitle="Create a new housekeeping task"
        size="2xl"
        footer={
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="task-form"
              variant="primary"
              className="w-full sm:w-auto"
              isLoading={isCreating}
              disabled={isCreating}
            >
              Create Task
            </Button>
          </div>
        }
      >
        <form id="task-form" onSubmit={(e) => { e.preventDefault(); handleAddTask(); }} className="space-y-5 sm:space-y-6">
          {/* Task Details Section */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3 sm:mb-4">
              Task Details
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  required
                  className="w-full h-11 sm:h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description (optional)"
                  rows={3}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3 sm:mb-4">
              Assignment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Room
                </label>
                <SelectDropdown
                  value={newTask.room}
                  onChange={(value) => setNewTask({ ...newTask, room: value })}
                  options={roomOptions}
                  placeholder="Select room"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Category
                </label>
                <SelectDropdown
                  value={newTask.category}
                  onChange={(value) => setNewTask({ ...newTask, category: value })}
                  options={categoryOptions}
                  placeholder="Select category"
                />
              </div>
            </div>
          </div>

          {/* Priority & Time Section */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3 sm:mb-4">
              Priority & Time
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Priority
                </label>
                <SelectDropdown
                  value={newTask.priority}
                  onChange={(value) => setNewTask({ ...newTask, priority: value })}
                  options={priorityOptions}
                  placeholder="Select priority"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Estimated Time (min)
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={newTask.estimatedMinutes}
                  onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) || 30 })}
                  className="w-full h-11 sm:h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTask(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${selectedTask?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        icon={Trash2}
      />
    </div>
  );
};

export default HousekeepingTasks;





