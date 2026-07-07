import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardList,
  Plus,
  Play,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  RefreshCw,
  Square,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  AlertTriangle
} from 'lucide-react';
import { useMaintenance, useProfile } from '@/hooks/staff-portal/useStaffPortal';
import { StatCard } from '../../../components/staff-portal/ui/Card';
import { StatusBadge, PriorityBadge } from '../../../components/staff-portal/ui/Badge';
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

const MaintenanceTasks = () => {
  const { profile } = useProfile();
  const { tasks, addMTTask, updateMTTask, updateMTTaskStatus, updateMTTaskChecklist, stats } = useMaintenance();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    location: '',
    category: 'general',
    priority: 'normal',
    recurring: false,
    recurringSchedule: 'weekly'
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 0, normal: 1, low: 2 };
      const statusOrder: Record<string, number> = { in_progress: 0, todo: 1, completed: 2 };

      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, searchQuery, statusFilter]);

  const tasksByStatus = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed')
  }), [tasks]);

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

  const getChecklistProgress = (checklist: any) => {
    if (!Array.isArray(checklist) || checklist.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = checklist.filter(c => c.completed).length;
    return {
      completed,
      total: checklist.length,
      percentage: Math.round((completed / checklist.length) * 100)
    };
  };

  const handleAddTask = () => {
    addMTTask({
      ...newTask,
      status: 'todo',
      assignedTo: profile?.name,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      checklist: [
        { id: 'ck1', item: 'Initial inspection', completed: false },
        { id: 'ck2', item: 'Perform maintenance', completed: false },
        { id: 'ck3', item: 'Test operation', completed: false },
        { id: 'ck4', item: 'Document findings', completed: false }
      ]
    });
    setNewTask({
      title: '',
      description: '',
      location: '',
      category: 'general',
      priority: 'normal',
      recurring: false,
      recurringSchedule: 'weekly'
    });
    setShowAddModal(false);
  };

  const handleStartTask = (task: any) => {
    updateMTTaskStatus(task.id, 'in_progress');
  };

  const handleCompleteTask = (task: any) => {
    updateMTTaskStatus(task.id, 'completed');
  };

  const handleChecklistToggle = (taskId: string, checklistId: string, completed: boolean) => {
    updateMTTaskChecklist(taskId, checklistId, completed);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">Maintenance Tasks</h1>
            <p className="text-[13px] sm:text-sm text-neutral-500 mt-0.5">Schedule and track preventive maintenance tasks</p>
          </div>
          <Button icon={Plus} onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
            Add Task
          </Button>
        </div>
      </div>

      {/* KPI Cards - 12 Column Grid matching admin dashboard */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="To Do"
            value={tasksByStatus.todo.length}
            subtitle="Awaiting start"
            icon={Square}
            color="terra"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="In Progress"
            value={tasksByStatus.in_progress.length}
            subtitle="Currently working"
            icon={Clock}
            color="gold"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="High Priority"
            value={tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length}
            subtitle="Require attention"
            icon={AlertTriangle}
            color="danger"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Completed"
            value={tasksByStatus.completed.length}
            subtitle="This period"
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
            placeholder="Search tasks..."
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
              {statusFilter === 'all' && `All (${tasks.length})`}
              {statusFilter === 'todo' && `To Do (${tasksByStatus.todo.length})`}
              {statusFilter === 'in_progress' && `In Progress (${tasksByStatus.in_progress.length})`}
              {statusFilter === 'completed' && `Completed (${tasksByStatus.completed.length})`}
            </span>
            <ChevronDown className={`w-4 h-4 text-neutral-400 absolute right-3 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute right-0 mt-2 w-[180px] bg-white rounded-lg border border-neutral-200 shadow-lg z-20 py-1 overflow-hidden">
                {[
                  { value: 'all', label: 'All', count: tasks.length },
                  { value: 'todo', label: 'To Do', count: tasksByStatus.todo.length },
                  { value: 'in_progress', label: 'In Progress', count: tasksByStatus.in_progress.length },
                  { value: 'completed', label: 'Completed', count: tasksByStatus.completed.length }
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

      {/* Main Content Card */}
      <div className="rounded-[10px] bg-white overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-neutral-800">Maintenance Tasks</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{filteredTasks.length} tasks</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-[13px] font-medium text-neutral-600 mb-1">No tasks found</p>
              <p className="text-[11px] text-neutral-400 mb-4">Create a new task to get started</p>
              <Button size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
                Add Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-3 sm:pt-4">
              {filteredTasks.map((task) => {
                const progress = getChecklistProgress(task.checklist);
                const isExpanded = expandedTask === task.id;

                return (
                  <div
                    key={task.id}
                    className={`relative p-3 sm:p-4 rounded-lg transition-colors
                      ${task.priority === 'high' && task.status !== 'completed' ? 'bg-rose-50/50 border-l-4 border-l-rose-500' :
                        task.status === 'in_progress' ? 'bg-gold-50/30' :
                        task.status === 'completed' ? 'bg-sage-50/30' :
                        'bg-neutral-50/50 hover:bg-neutral-50'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      {/* Status Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        task.status === 'completed' ? 'bg-sage-50' :
                        task.status === 'in_progress' ? 'bg-gold-50' :
                        'bg-terra-50'
                      }`}>
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
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-neutral-800">{task.title}</span>
                          <StatusBadge status={task.status} />
                          <PriorityBadge priority={task.priority} />
                          {task.recurring && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-full font-medium">
                              <RefreshCw className="w-3 h-3" />
                              <span className="hidden xs:inline">{task.recurringSchedule}</span>
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-neutral-500 line-clamp-2 sm:line-clamp-1 mb-2">{task.description}</p>
                        )}

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] text-neutral-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            {task.location}
                          </span>
                          <span className="hidden sm:flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                            Due: {formatDate(task.dueDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClipboardList className="w-3.5 h-3.5 text-neutral-400" />
                            {progress.completed}/{progress.total}
                          </span>
                        </div>

                      {/* Progress Bar */}
                      {task.checklist && task.checklist.length > 0 && (
                        <div className="mt-3">
                          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                progress.percentage === 100 ? 'bg-sage-500' :
                                progress.percentage > 50 ? 'bg-ocean-500' :
                                progress.percentage > 0 ? 'bg-gold-500' :
                                'bg-neutral-200'
                              }`}
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Expandable Checklist */}
                      <button
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-terra-600 mt-2 hover:text-terra-700 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Hide checklist
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Show checklist
                          </>
                        )}
                      </button>

                      {isExpanded && task.checklist && (
                        <div className="mt-2 space-y-1.5">
                          {task.checklist.map((item: any) => (
                            <label
                              key={item.id}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                item.completed
                                  ? 'bg-sage-50/50'
                                  : 'bg-neutral-50 hover:bg-neutral-100'
                              }`}
                            >
                              <button
                                onClick={() => handleChecklistToggle(task.id, item.id, !item.completed)}
                                className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                                  item.completed
                                    ? 'bg-sage-500 text-white'
                                    : 'border border-neutral-300 bg-white hover:border-terra-400'
                                }`}
                              >
                                {item.completed && <Check className="w-2.5 h-2.5" />}
                              </button>
                              <span className={`text-[11px] ${item.completed ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
                                {item.item}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                      </div>

                      {/* Actions - Mobile: Full width at bottom, Desktop: Right aligned */}
                      <div className="flex items-center gap-2 flex-shrink-0 pl-0 sm:pl-0 mt-3 sm:mt-0">
                        {task.status === 'todo' && (
                          <Button size="sm" icon={Play} onClick={() => handleStartTask(task)} className="w-full sm:w-auto">
                            Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button size="sm" variant="success" icon={CheckCircle} onClick={() => handleCompleteTask(task)} className="w-full sm:w-auto">
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Task Side Drawer */}
      <Drawer
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Maintenance Task"
        subtitle="Create a new maintenance task"
        size="xl"
        footer={
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full">
            <Button variant="outline-neutral" onClick={() => setShowAddModal(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleAddTask} className="w-full sm:w-auto">
              Create Task
            </Button>
          </div>
        }
      >
        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5 sm:mb-2">Task Title</label>
            <input
              type="text"
              placeholder="Enter task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full h-11 sm:h-9 px-3.5 text-[13px] bg-white border border-neutral-200 rounded-lg text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5 sm:mb-2">Description</label>
            <textarea
              placeholder="Enter task description..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2.5 sm:py-2 text-[13px] bg-white border border-neutral-200 rounded-lg text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5 sm:mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g., Pool Area, Floors 1-3"
              value={newTask.location}
              onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
              className="w-full h-11 sm:h-9 px-3.5 text-[13px] bg-white border border-neutral-200 rounded-lg text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5 sm:mb-2">Category</label>
              <SelectDropdown
                value={newTask.category}
                onChange={(value) => setNewTask({ ...newTask, category: value })}
                placeholder="Select category"
                options={[
                  { value: 'general', label: 'General Maintenance' },
                  { value: 'safety', label: 'Safety Inspection' },
                  { value: 'equipment', label: 'Equipment Maintenance' },
                  { value: 'electrical', label: 'Electrical' },
                  { value: 'plumbing', label: 'Plumbing' },
                  { value: 'hvac', label: 'HVAC' },
                  { value: 'preventive', label: 'Preventive Maintenance' }
                ]}
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5 sm:mb-2">Priority</label>
              <SelectDropdown
                value={newTask.priority}
                onChange={(value) => setNewTask({ ...newTask, priority: value })}
                placeholder="Select priority"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' }
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <input
              type="checkbox"
              id="recurring"
              checked={newTask.recurring}
              onChange={(e) => setNewTask({ ...newTask, recurring: e.target.checked })}
              className="w-5 h-5 sm:w-4 sm:h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500/20"
            />
            <label htmlFor="recurring" className="text-[13px] font-medium text-neutral-700 cursor-pointer">
              This is a recurring task
            </label>
          </div>

          {newTask.recurring && (
            <div>
              <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5 sm:mb-2">Recurring Schedule</label>
              <SelectDropdown
                value={newTask.recurringSchedule}
                onChange={(value) => setNewTask({ ...newTask, recurringSchedule: value })}
                placeholder="Select schedule"
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'yearly', label: 'Yearly' }
                ]}
              />
            </div>
          )}

          {newTask.priority === 'high' && (
            <div className="p-3 sm:p-4 bg-rose-50 rounded-lg border border-rose-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-rose-900">High Priority Task</p>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                    This task will be prioritized in the queue.
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

export default MaintenanceTasks;
