import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Power,
  ArrowRight
} from 'lucide-react';
import { useReputation } from '@/context/ReputationContext';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { SelectDropdown, Input } from '../ui2/Input';
import DatePicker from '../ui2/DatePicker';

const METRIC_OPTIONS = [
  { value: 'rating', label: 'Average Rating' },
  { value: 'response_rate', label: 'Response Rate' },
  { value: 'nps', label: 'NPS Score' }
];

interface Goal {
  id: number;
  metric_type: string;
  target_value: number;
  current_value: number | null;
  baseline_value: number;
  progress_percentage: number;
  status: string;
  start_date: string;
  end_date: string;
}

interface GoalFormData {
  metricType: string;
  targetValue: number;
  startDate: string;
  endDate: string;
}

interface GoalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => Promise<void>;
  initialData?: Goal | null;
  mode: 'create' | 'edit';
}

function GoalDrawer({ isOpen, onClose, onSubmit, initialData, mode }: GoalDrawerProps) {
  const today = new Date().toISOString().split('T')[0];
  const defaultEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [metricType, setMetricType] = useState(initialData?.metric_type || 'rating');
  const [targetValue, setTargetValue] = useState(initialData?.target_value || 4.5);
  const [startDate, setStartDate] = useState(initialData?.start_date || today);
  const [endDate, setEndDate] = useState(initialData?.end_date || defaultEndDate);
  const [errors, setErrors] = useState<{ targetValue?: string; dates?: string }>({});
  const [saving, setSaving] = useState(false);

  // Get max target value based on metric type
  const getMaxTargetValue = (metric: string): number => {
    switch (metric) {
      case 'rating': return 5;
      case 'response_rate': return 100;
      case 'nps': return 100;
      default: return 100;
    }
  };

  // Get min target value based on metric type
  const getMinTargetValue = (metric: string): number => {
    switch (metric) {
      case 'rating': return 1;
      case 'response_rate': return 0;
      case 'nps': return -100;
      default: return 0;
    }
  };

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setMetricType(initialData.metric_type || 'rating');
      setTargetValue(initialData.target_value || 4.5);
      setStartDate(initialData.start_date || today);
      setEndDate(initialData.end_date || defaultEndDate);
    } else {
      setMetricType('rating');
      setTargetValue(4.5);
      setStartDate(today);
      setEndDate(defaultEndDate);
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Validate and clamp target value when metric type changes
  useEffect(() => {
    const max = getMaxTargetValue(metricType);
    const min = getMinTargetValue(metricType);
    if (targetValue > max) {
      setTargetValue(max);
    } else if (targetValue < min) {
      setTargetValue(min);
    }
  }, [metricType]);

  const validateForm = (): boolean => {
    const newErrors: { targetValue?: string; dates?: string } = {};
    const max = getMaxTargetValue(metricType);
    const min = getMinTargetValue(metricType);

    if (targetValue > max || targetValue < min) {
      newErrors.targetValue = `Value must be between ${min} and ${max}`;
    }

    if (startDate > endDate) {
      newErrors.dates = 'Start date cannot be after end date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTargetValueChange = (value: number) => {
    const max = getMaxTargetValue(metricType);
    const min = getMinTargetValue(metricType);
    const clampedValue = Math.min(max, Math.max(min, value));
    setTargetValue(clampedValue);
    setErrors(prev => ({ ...prev, targetValue: undefined }));
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (endDate && value > endDate) {
      setEndDate(value);
    }
    setErrors(prev => ({ ...prev, dates: undefined }));
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setErrors(prev => ({ ...prev, dates: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      await onSubmit({ metricType, targetValue, startDate, endDate });
      onClose();
    } catch (error) {
      // Error toast handled by caller
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose} disabled={saving}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" form="goal-form" loading={saving}>
        {mode === 'create' ? 'Create Goal' : 'Save Changes'}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Performance Goal' : 'Edit Goal'}
      subtitle={mode === 'create' ? 'Set a new target to track' : 'Modify goal settings'}
      maxWidth="max-w-md"
      footer={footer}
    >
      <form id="goal-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Metric Type
          </label>
          <SelectDropdown
            value={metricType}
            onChange={(value) => setMetricType(value)}
            options={METRIC_OPTIONS}
            size="md"
            disabled={mode === 'edit'}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Target Value
          </label>
          <Input
            type="number"
            step="0.1"
            min={getMinTargetValue(metricType)}
            max={getMaxTargetValue(metricType)}
            value={targetValue}
            onChange={(e) => handleTargetValueChange(parseFloat(e.target.value) || 0)}
            className={errors.targetValue ? 'border-rose-500' : ''}
          />
          <p className={`text-[11px] mt-1 ${errors.targetValue ? 'text-rose-500' : 'text-neutral-400'}`}>
            {errors.targetValue || (
              <>
                {metricType === 'rating' && 'Rating target (1.0 - 5.0)'}
                {metricType === 'response_rate' && 'Response rate percentage (0 - 100)'}
                {metricType === 'nps' && 'Net Promoter Score (-100 to 100)'}
              </>
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
              Start Date
            </label>
            <DatePicker
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Select start date"
              minDate={mode === 'edit' ? (initialData?.start_date || today) : today}
              maxDate={endDate || undefined}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
              End Date
            </label>
            <DatePicker
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="Select end date"
              minDate={startDate || today}
              className="w-full"
            />
          </div>
          {errors.dates && (
            <p className="col-span-2 text-[11px] text-rose-500">{errors.dates}</p>
          )}
        </div>
      </form>
    </Drawer>
  );
}

// Circular Progress Component
function CircularProgress({ percentage, size = 48, strokeWidth = 4 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, percentage) / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return '#4E5840'; // Sage green for achieved
    if (percentage >= 75) return '#5C9BA4'; // Blue for good progress
    if (percentage >= 50) return '#CDB261'; // Gold for moderate
    return '#A57865'; // Terra for low
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#E5E5E5"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={getColor()}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-neutral-900">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// Calculate days remaining
function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function GoalsPanel() {
  const navigate = useNavigate();
  const { goals, createGoal, updateGoal, deleteGoal, toggleGoalStatus, updateGoalProgress, isLoading } = useReputation();
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [togglingGoal, setTogglingGoal] = useState<Goal | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const PREVIEW_LIMIT = 2;
  const displayedGoals = goals.slice(0, PREVIEW_LIMIT);
  const hasMore = goals.length > PREVIEW_LIMIT;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-[#4E5840]/10 text-[#4E5840] border border-[#4E5840]/20';
      case 'active':
        return 'bg-[#5C9BA4]/10 text-[#5C9BA4] border border-[#5C9BA4]/20';
      case 'inactive':
      case 'deactivated':
        return 'bg-neutral-100 text-neutral-400 border border-neutral-200';
      case 'expired':
        return 'bg-neutral-100 text-neutral-500 border border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-600 border border-neutral-200';
    }
  };

  const getMetricLabel = (metricType: string) => {
    switch (metricType) {
      case 'rating':
        return 'Average Rating';
      case 'response_rate':
        return 'Response Rate';
      case 'nps':
        return 'NPS Score';
      default:
        return metricType;
    }
  };

  const formatValue = (metricType: string, value: number | null) => {
    if (value === null) return '-';
    if (metricType === 'rating') return value.toFixed(1);
    if (metricType === 'response_rate') return `${value.toFixed(0)}%`;
    return value.toFixed(0);
  };

  const handleCreateGoal = async (data: GoalFormData) => {
    try {
      await createGoal(data.metricType, data.targetValue, data.startDate, data.endDate);
      toast.success('Goal created successfully');
    } catch (error) {
      console.error('Failed to create goal:', error);
      toast.error('Failed to create goal');
      throw error;
    }
  };

  const handleToggleStatus = async () => {
    if (!togglingGoal || isToggling) return;
    setIsToggling(true);
    try {
      await toggleGoalStatus(togglingGoal.id);
      const wasActive = togglingGoal.status === 'active';
      toast.success(wasActive ? 'Goal deactivated' : 'Goal activated');
      setTogglingGoal(null);
    } catch (error) {
      console.error('Failed to toggle goal status:', error);
      toast.error('Failed to update goal status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleEditGoal = async (data: GoalFormData) => {
    if (!editingGoal) return;
    try {
      await updateGoal(editingGoal.id, {
        target_value: data.targetValue,
        start_date: data.startDate,
        end_date: data.endDate,
      });
      toast.success('Goal updated successfully');
      setEditingGoal(null);
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast.error('Failed to update goal');
      throw error;
    }
  };

  const handleDeleteGoal = async () => {
    if (!deletingGoal || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteGoal(deletingGoal.id);
      toast.success('Goal deleted successfully');
      setDeletingGoal(null);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast.error('Failed to delete goal');
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreateDrawer = () => {
    setEditingGoal(null);
    setShowDrawer(true);
  };

  const openEditDrawer = (goal: Goal) => {
    setEditingGoal(goal);
    setShowDrawer(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[10px] border border-neutral-200 p-6 animate-pulse">
        <div className="h-5 bg-neutral-200 rounded w-1/3 mb-5" />
        <div className="space-y-3">
          <div className="h-24 bg-neutral-100 rounded-[8px]" />
          <div className="h-24 bg-neutral-100 rounded-[8px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[10px] border border-neutral-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-neutral-900">Performance Goals</h3>
            <p className="text-[13px] text-neutral-500 mt-0.5">Track and manage your targets</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openCreateDrawer}
          >
            Add Goal
          </Button>
        </div>
      </div>

      {/* Goals List */}
      <div className="p-6">
        {goals.length > 0 ? (
          <div className="space-y-4">
            {displayedGoals.map((goal) => {
              const daysRemaining = getDaysRemaining(goal.end_date);

              return (
                <div
                  key={goal.id}
                  className={`bg-neutral-50 rounded-[8px] p-5 border border-neutral-100 hover:border-neutral-200 transition-colors ${
                    goal.status === 'inactive' || goal.status === 'deactivated' ? 'opacity-60' : ''
                  }`}
                >
                  {/* Goal Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <CircularProgress percentage={goal.progress_percentage || 0} />
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-neutral-900 truncate">
                          {getMetricLabel(goal.metric_type)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wide whitespace-nowrap ${getStatusBadge(goal.status)}`}>
                            {goal.status === 'deactivated' ? 'inactive' : goal.status}
                          </span>
                          {goal.status === 'active' && daysRemaining > 0 && (
                            <span className="text-[11px] text-neutral-400 flex items-center gap-1 whitespace-nowrap">
                              <Clock className="w-3 h-3" />
                              {daysRemaining}d left
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {(goal.status === 'active' || goal.status === 'inactive' || goal.status === 'deactivated') && (
                        <button
                          onClick={() => setTogglingGoal(goal)}
                          className={`p-1.5 rounded-[6px] transition-colors ${
                            goal.status === 'active'
                              ? 'text-[#5C9BA4] hover:text-neutral-500 hover:bg-neutral-100'
                              : 'text-neutral-400 hover:text-[#5C9BA4] hover:bg-[#5C9BA4]/10'
                          }`}
                          title={goal.status === 'active' ? 'Deactivate goal' : 'Activate goal'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditDrawer(goal)}
                        className="p-1.5 rounded-[6px] text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                        title="Edit goal"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingGoal(goal)}
                        className="p-1.5 rounded-[6px] text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Values Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2.5 bg-white rounded-[6px] border border-neutral-100">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-0.5">Base</p>
                      <p className="text-[13px] font-bold text-neutral-600">
                        {formatValue(goal.metric_type, goal.baseline_value)}
                      </p>
                    </div>
                    <div className="text-center p-2.5 bg-white rounded-[6px] border border-neutral-100">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-0.5">Current</p>
                      <p className="text-[13px] font-bold text-[#5C9BA4]">
                        {formatValue(goal.metric_type, goal.current_value)}
                      </p>
                    </div>
                    <div className="text-center p-2.5 bg-white rounded-[6px] border border-neutral-100">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-0.5">Target</p>
                      <p className="text-[13px] font-bold text-[#4E5840]">
                        {formatValue(goal.metric_type, goal.target_value)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${goal.progress_percentage >= 100 ? 'bg-[#4E5840]' : 'bg-[#A57865]'
                          }`}
                        style={{ width: `${Math.min(100, goal.progress_percentage || 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(goal.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span>to</span>
                    <span>
                      {new Date(goal.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Update Button */}
                  {goal.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={TrendingUp}
                      onClick={() => updateGoalProgress(goal.id)}
                      className="w-full mt-3"
                    >
                      Refresh Progress
                    </Button>
                  )}
                </div>
              );
            })}

            {/* View More */}
            {hasMore && (
              <button
                onClick={() => navigate('/admin/reputation/goals')}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-[#A57865] hover:bg-[#A57865]/5 rounded-[8px] transition-colors"
              >
                View all {goals.length } goals
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-[10px] bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-[15px] font-medium text-neutral-600 mb-1">No goals set yet</p>
            <p className="text-[13px] text-neutral-400 mb-4">Create a performance goal to start tracking progress</p>
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateDrawer}>
              Create Your First Goal
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Drawer */}
      <GoalDrawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setEditingGoal(null);
        }}
        onSubmit={editingGoal ? handleEditGoal : handleCreateGoal}
        initialData={editingGoal}
        mode={editingGoal ? 'edit' : 'create'}
      />

      {/* Toggle Status Confirmation Dialog */}
      {!!togglingGoal && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center" onClick={() => !isToggling && setTogglingGoal(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-[400px] mx-4 bg-white rounded-[10px] border border-neutral-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 ${
                  togglingGoal.status === 'active' ? 'bg-neutral-100' : 'bg-[#5C9BA4]/10'
                }`}>
                  <Power className={`w-5 h-5 ${
                    togglingGoal.status === 'active' ? 'text-neutral-500' : 'text-[#5C9BA4]'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-neutral-900 mb-1">
                    {togglingGoal.status === 'active' ? 'Deactivate Goal' : 'Activate Goal'}
                  </h3>
                  <p className="text-[13px] text-neutral-500 leading-relaxed">
                    Are you sure you want to {togglingGoal.status === 'active' ? 'deactivate' : 'activate'} the "{getMetricLabel(togglingGoal.metric_type)}" goal?
                    {togglingGoal.status === 'active'
                      ? ' Progress tracking will be paused.'
                      : ' Progress tracking will resume.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setTogglingGoal(null)} disabled={isToggling}>
                Cancel
              </Button>
              <Button
                variant={togglingGoal.status === 'active' ? 'outline' : 'primary'}
                onClick={handleToggleStatus}
                loading={isToggling}
              >
                {togglingGoal.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {!!deletingGoal && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center" onClick={() => !isDeleting && setDeletingGoal(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-[400px] mx-4 bg-white rounded-[10px] border border-neutral-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-[8px] bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-neutral-900 mb-1">Delete Goal</h3>
                  <p className="text-[13px] text-neutral-500 leading-relaxed">
                    Are you sure you want to delete the "{deletingGoal ? getMetricLabel(deletingGoal.metric_type) : ''}" goal? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setDeletingGoal(null)} disabled={isDeleting}>
                Keep Goal
              </Button>
              <button
                onClick={handleDeleteGoal}
                disabled={isDeleting}
                className="h-9 px-4 text-[13px] font-semibold rounded-[8px] text-white bg-rose-500 hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Goal'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
