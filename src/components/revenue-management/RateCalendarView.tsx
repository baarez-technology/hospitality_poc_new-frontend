import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Filter, Download, RefreshCw, Sparkles, ChevronDown, Check, HelpCircle, Loader2, Play, X } from 'lucide-react';
import { useRMS } from '../../context/RMSContext';
import { useToast } from '../../contexts/ToastContext';
import RateCell from './RateCell';
import revenueIntelligenceService, {
  RateCalendarData,
  ExecuteRulesResponse,
} from '../../api/services/revenue-intelligence.service';
import { useChannelManagerSSEEvents } from '../../hooks/useChannelManagerSSEEvents';
import { Modal } from '../ui2/Modal';
import DatePicker from '../ui2/DatePicker';

// Local date to YYYY-MM-DD without UTC conversion
function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface RateCalendarViewProps {
  onDateSelect?: (date: string) => void;
  onOpenDrawer?: () => void;
  bulkEditMode?: boolean;
  selectedDates?: string[];
}

const RateCalendarView = ({ onDateSelect, onOpenDrawer, bulkEditMode = false, selectedDates = [] }: RateCalendarViewProps) => {
  const {
    rateCalendar,
    roomTypes,
    getRateForDate,
    updateRate: localUpdateRate,
    applyRestriction,
    runAllRules,
    recommendations,
    refreshRecommendations,
    applyRecommendation,
    dismissRecommendation,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useRMS();

  const { success, error: showError, info } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Initialize with first room type ID from API, or empty string as fallback
  const [selectedRoomType, setSelectedRoomType] = useState(() => roomTypes?.[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isRunningRules, setIsRunningRules] = useState(false);
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [focusedDateIndex, setFocusedDateIndex] = useState<number | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiCalendarData, setApiCalendarData] = useState<RateCalendarData | null>(null);
  const [updatingRates, setUpdatingRates] = useState<Set<string>>(new Set());
  const [suggestionPopupDate, setSuggestionPopupDate] = useState<string | null>(null);
  const [pendingScrollToToday, setPendingScrollToToday] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownPortalRef = useRef<HTMLDivElement>(null);
  const [dropdownBounds, setDropdownBounds] = useState<{ top: number; left: number; width: number } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Date range filter state
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const isFilterActive = filterStartDate || filterEndDate;

  const handleFilterStartChange = (date: string) => {
    setFilterStartDate(date);
    if (date) {
      const d = new Date(date + 'T00:00:00');
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  const handleClearFilter = () => {
    setFilterStartDate('');
    setFilterEndDate('');
  };

  // Fetch rate calendar data from API
  const fetchCalendarData = useCallback(async () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startDate = toDateStr(new Date(year, month, 1));
    const endDate = toDateStr(new Date(year, month + 1, 0));

    setIsLoading(true);
    try {
      const data = await revenueIntelligenceService.getRateCalendar(startDate, endDate);
      setApiCalendarData(data);
    } catch (err) {
      console.error('Error fetching rate calendar:', err);
      // Fall back to local data on error
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  // Fetch data when month changes
  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Scroll to today's cell after month change + loading finishes
  useEffect(() => {
    if (!pendingScrollToToday || isLoading) return;
    const todayStr = toDateStr(new Date());
    requestAnimationFrame(() => {
      const cell = calendarRef.current?.querySelector(`[data-date="${todayStr}"]`);
      if (cell) {
        (cell as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    setPendingScrollToToday(false);
  }, [pendingScrollToToday, isLoading]);

  // SSE Integration for real-time rates updates
  useChannelManagerSSEEvents({
    onRatesUpdated: () => {
      console.log('[RateCalendarView] Rates updated via SSE, refreshing calendar view');
      fetchCalendarData();
    },
    refetchData: () => {
      console.log('[RateCalendarView] Refetching calendar data due to SSE event');
      fetchCalendarData();
    },
  });

  // Update selectedRoomType when roomTypes are loaded from API
  useEffect(() => {
    if (roomTypes && roomTypes.length > 0) {
      // If no room type selected, or current selection doesn't exist in new room types
      const currentExists = roomTypes.some((r) => r.id === selectedRoomType);
      if (!selectedRoomType || !currentExists) {
        setSelectedRoomType(roomTypes[0].id);
      }
    }
  }, [roomTypes, selectedRoomType]);

  // Capture dropdown trigger position when open (for portal positioning)
  useEffect(() => {
    if (!isRoomDropdownOpen || !dropdownRef.current) {
      setDropdownBounds(null);
      return;
    }
    const rect = dropdownRef.current.getBoundingClientRect();
    setDropdownBounds({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, [isRoomDropdownOpen]);

  // Close dropdown when clicking outside (trigger or portal content)
  useEffect(() => {
    if (!isRoomDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inTrigger = dropdownRef.current?.contains(target);
      const inPortal = dropdownPortalRef.current?.contains(target);
      if (!inTrigger && !inPortal) {
        setIsRoomDropdownOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoomDropdownOpen]);

  // Generate calendar days (must be before keyboard navigation useEffect)
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Previous month padding
    for (let i = 0; i < startPadding; i++) {
      const date = new Date(year, month, -startPadding + i + 1);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  const today = toDateStr(new Date());

  // Helper function for toast notifications
  const showToastSuccess = (message: string) => {
    success(message, { duration: 2000 });
  };

  const handleGoToToday = useCallback(() => {
    const now = new Date();
    const todayStr = toDateStr(now);
    const year = now.getFullYear();
    const month = now.getMonth();

    // Set focused index for today
    const firstDay = new Date(year, month, 1);
    const startPadding = firstDay.getDay();
    const todayIndex = startPadding + now.getDate() - 1;
    setFocusedDateIndex(todayIndex);

    // Check if already viewing the current month
    const alreadyOnMonth =
      currentMonth.getFullYear() === year && currentMonth.getMonth() === month;

    if (alreadyOnMonth) {
      // Already on correct month — scroll immediately
      const cell = calendarRef.current?.querySelector(`[data-date="${todayStr}"]`);
      if (cell) {
        (cell as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // Switch month, then scroll after loading finishes
      setCurrentMonth(new Date(year, month, 1));
      setPendingScrollToToday(true);
    }
  }, [currentMonth]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show keyboard help with ? or Shift+?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShowKeyboardHelp(prev => !prev);
        return;
      }

      // Don't handle keyboard nav if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      // Arrow key navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();

        if (focusedDateIndex === null) {
          // Start from today if available, otherwise first current month date
          const todayIndex = calendarDays.findIndex(({ date }) => {
            const dateStr = toDateStr(date);
            return dateStr === today;
          });

          if (todayIndex !== -1) {
            setFocusedDateIndex(todayIndex);
          } else {
            const firstCurrentMonthIndex = calendarDays.findIndex(({ isCurrentMonth }) => isCurrentMonth);
            setFocusedDateIndex(firstCurrentMonthIndex);
          }
          return;
        }

        let newIndex = focusedDateIndex;

        if (e.key === 'ArrowLeft') {
          newIndex = Math.max(0, focusedDateIndex - 1);
        } else if (e.key === 'ArrowRight') {
          newIndex = Math.min(calendarDays.length - 1, focusedDateIndex + 1);
        } else if (e.key === 'ArrowUp') {
          newIndex = Math.max(0, focusedDateIndex - 7);
        } else if (e.key === 'ArrowDown') {
          newIndex = Math.min(calendarDays.length - 1, focusedDateIndex + 7);
        }

        setFocusedDateIndex(newIndex);

        // Scroll focused date into view
        const calendarGrid = calendarRef.current;
        if (calendarGrid) {
          const cells = calendarGrid.querySelectorAll('[data-calendar-cell]');
          if (cells[newIndex]) {
            cells[newIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      }

      // Enter to select focused date
      if (e.key === 'Enter' && focusedDateIndex !== null) {
        e.preventDefault();
        const { date, isCurrentMonth } = calendarDays[focusedDateIndex];
        const dateStr = toDateStr(date);
        const isPast = dateStr < today;

        if (isCurrentMonth && !isPast) {
          handleDateSelect(date);
        }
      }

      // Ctrl/Cmd + Left/Right for month navigation
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        setFocusedDateIndex(null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        setFocusedDateIndex(null);
      }

      // T key to jump to today
      if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleGoToToday();
      }

      // R key to recalculate
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey && !isRecalculating) {
        e.preventDefault();
        handleRecalculate();
      }

      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          const undoResult = undo();
          if (undoResult) {
            showToastSuccess('Rate change undone');
          }
        }
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          const redoResult = redo();
          if (redoResult) {
            showToastSuccess('Rate change redone');
          }
        }
      }

      // Escape to clear focus
      if (e.key === 'Escape') {
        setFocusedDateIndex(null);
        setShowKeyboardHelp(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedDateIndex, calendarDays, today, isRecalculating, canUndo, canRedo, undo, redo, handleGoToToday]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      runAllRules();
      await fetchCalendarData();
      success('Rates recalculated successfully');
    } catch (err) {
      showError('Failed to recalculate rates');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Run all pricing rules via API
  const handleRunAllRules = async () => {
    setIsRunningRules(true);
    try {
      const result: ExecuteRulesResponse = await revenueIntelligenceService.executePricingRules();

      // Show results
      if (result.rulesTriggered > 0) {
        success(`Executed ${result.rulesTriggered} rules, updated ${result.ratesUpdated} rates`);
      } else {
        info('No rules were triggered');
      }

      // Refresh calendar data
      await fetchCalendarData();

      // Also update local context
      runAllRules();
    } catch (err) {
      showError('Failed to execute pricing rules');
      console.error('Error executing rules:', err);
    } finally {
      setIsRunningRules(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = toDateStr(date);
    setSelectedDate(dateStr);
    if (onDateSelect) onDateSelect(dateStr);
  };

  // Update rate via API (use backend room type id so persisted rate is returned on refetch)
  const handleUpdateRate = async (date: string, newRate: number, reason?: string) => {
    const rateKey = `${selectedRoomType}_${date}`;
    setUpdatingRates(prev => new Set(prev).add(rateKey));

    try {
      // Resolve the actual DB id for the room type so the API hits the right row.
      // selectedRoomType may be a frontend slug (e.g. "standard") or a numeric id;
      // the backend endpoint accepts the numeric DB id only.
      const roomType = (roomTypes ?? []).find(r => r.id === selectedRoomType);
      const apiRoomTypeId =
        roomType?.dbId ??
        (roomType?.id != null && !Number.isNaN(Number(roomType.id))
          ? Number(roomType.id)
          : undefined) ??
        1;

      // Single source of truth for the write + state refresh: the RMS context.
      // It calls the API once, does an optimistic update, and refetches the
      // calendar so the persisted rate is visible to the UI on next render.
      // (Previously we were also calling revenueIntelligenceService.updateRate
      // here with a different id path, causing a second write that could land
      // on the wrong room type and then stomp the first write on refetch.)
      await localUpdateRate(apiRoomTypeId as any, date, newRate, reason);

      success(`Rate updated to ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(newRate)}`);
    } catch (err: any) {
      console.error('Error updating rate:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Failed to update rate';
      showError(detail);
      // Re-throw so the caller (RateCell) doesn't announce a false success.
      throw err;
    } finally {
      setUpdatingRates(prev => {
        const next = new Set(prev);
        next.delete(rateKey);
        return next;
      });
    }
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get AI suggestions count for visible dates
  const visibleSuggestions = recommendations.filter(r => {
    const recDate = new Date(r.date);
    return recDate.getMonth() === currentMonth.getMonth() &&
           recDate.getFullYear() === currentMonth.getFullYear();
  });

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="p-2 sm:p-4 overflow-x-auto">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 min-w-[500px] sm:min-w-0">
        {dayNames.map(day => (
          <div key={day} className="text-center text-[9px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider py-1.5 sm:py-2">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[500px] sm:min-w-0">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-[80px] sm:min-h-[130px] rounded-lg border border-neutral-100 bg-neutral-50/50 animate-pulse">
            <div className="px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-white border-b border-neutral-100 rounded-t-lg">
              <div className="h-3 sm:h-4 w-5 sm:w-6 bg-neutral-200 rounded" />
            </div>
            <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
              <div className="h-4 sm:h-5 w-12 sm:w-16 bg-neutral-200 rounded" />
              <div className="h-2.5 sm:h-3 w-10 sm:w-12 bg-neutral-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[10px] overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-neutral-100 bg-white space-y-4 sm:space-y-5">
        {/* Top Row: Month Navigation + Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Date Range Filter */}
          <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
              {formatMonthYear(currentMonth)}
            </h2>
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-50 rounded-lg border border-neutral-200">
                <Filter className="w-3.5 h-3.5 text-neutral-400" />
                <DatePicker
                  value={filterStartDate}
                  onChange={handleFilterStartChange}
                  placeholder="From"
                  minDate={new Date().toISOString().split('T')[0]}
                  className="w-28"
                />
                <span className="text-neutral-300">—</span>
                <DatePicker
                  value={filterEndDate}
                  onChange={setFilterEndDate}
                  placeholder="To"
                  minDate={filterStartDate || new Date().toISOString().split('T')[0]}
                  className="w-28"
                />
              </div>
              {isFilterActive && (
                <button
                  onClick={handleClearFilter}
                  className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <button
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              className="hidden sm:block p-2 text-neutral-400 hover:text-terra-600 hover:bg-terra-50 rounded-lg transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleGoToToday}
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-[13px] font-medium text-terra-600 hover:bg-terra-50 rounded-lg transition-colors"
              aria-label="Go to today"
            >
              Today
            </button>

            {/* Run All Rules Button */}
            <button
              onClick={handleRunAllRules}
              disabled={isRunningRules}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-[13px] font-medium text-sage-700 bg-sage-50 border border-sage-200 rounded-lg hover:bg-sage-100 transition-colors disabled:opacity-50"
            >
              {isRunningRules ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">{isRunningRules ? 'Running...' : 'Run All Rules'}</span>
              <span className="sm:hidden">{isRunningRules ? 'Running' : 'Run Rules'}</span>
            </button>

            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-[13px] font-medium text-white bg-terra-500 rounded-lg hover:bg-terra-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRecalculating ? 'Recalculating...' : 'Recalculate'}</span>
              <span className="sm:hidden">{isRecalculating ? 'Calc...' : 'Calc'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Legend + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Legend - Scrollable on mobile */}
          <div className="flex items-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-white border border-neutral-200" />
              <span className="text-neutral-600">Available</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gold-50 border border-gold-200" />
              <span className="text-neutral-600">Low</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-terra-50 border border-terra-200" />
              <span className="text-neutral-600">Very Low</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-ocean-50 border border-ocean-200" />
              <span className="text-neutral-600">CTA</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-rose-50 border border-rose-200" />
              <span className="text-neutral-600">Stop Sell</span>
            </div>
          </div>

          {/* Filters and Insights */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Room Type Selector - Custom Dropdown */}
            <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRoomDropdownOpen(!isRoomDropdownOpen);
                }}
                className="w-full sm:w-auto flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-[13px] font-medium border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terra-500/40 bg-white hover:bg-neutral-50 transition-colors sm:min-w-[180px]"
              >
                <span className="truncate">{(roomTypes ?? []).find(r => r.id === selectedRoomType)?.name || 'Select Room'}</span>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 transition-transform flex-shrink-0 ${isRoomDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown content rendered in portal so it is not clipped by parent overflow-hidden */}
              {isRoomDropdownOpen &&
                dropdownBounds &&
                createPortal(
                  <div
                    ref={dropdownPortalRef}
                    className="bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden"
                    style={{
                      position: 'fixed',
                      top: dropdownBounds.top,
                      left: dropdownBounds.left,
                      minWidth: dropdownBounds.width,
                      maxHeight: 'min(280px, 50vh)',
                      overflowY: 'auto',
                      zIndex: 10000,
                    }}
                  >
                    {(roomTypes ?? []).length > 0 ? (
                      (roomTypes ?? []).map((room) => (
                        <button
                          key={room.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoomType(room.id);
                            setIsRoomDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-[13px] text-left hover:bg-neutral-50 transition-colors ${
                            selectedRoomType === room.id ? 'bg-terra-50 text-terra-600 font-medium' : 'text-neutral-700'
                          }`}
                        >
                          <span className="truncate">{room.name}</span>
                          {selectedRoomType === room.id && (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600 flex-shrink-0" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-neutral-500 text-center min-w-[180px]">
                        No room types available
                      </div>
                    )}
                  </div>,
                  document.body
                )}
            </div>

            {/* AI Suggestions Badge */}
            {visibleSuggestions.length > 0 && (
              <button
                onClick={() => {
                  // Find and scroll to the AI Recommendations section
                  const recommendationsSection = document.querySelector('[data-recommendations-panel]');
                  if (recommendationsSection) {
                    recommendationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    success(`${visibleSuggestions.length} AI suggestions available`);
                  } else {
                    // Fallback: scroll to bottom of page where recommendations typically are
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    success(`${visibleSuggestions.length} AI suggestions available`);
                  }
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-[13px] font-medium text-gold-700 bg-gold-50 border border-gold-200 rounded-lg hover:bg-gold-100 transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{visibleSuggestions.length} AI Suggestions</span>
                <span className="sm:hidden">{visibleSuggestions.length} AI</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {isLoading ? (
        renderLoadingSkeleton()
      ) : (
        <div className="p-2 sm:p-4 overflow-x-auto">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 min-w-[500px] sm:min-w-0">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[9px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider py-1.5 sm:py-2">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div ref={calendarRef} className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[500px] sm:min-w-0">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const dateStr = toDateStr(date);
              const calendarData = rateCalendar[dateStr];
              const roomData = calendarData?.rooms?.[selectedRoomType];
              const isToday = dateStr === today;
              const isPast = dateStr < today;
              const hasSuggestion = recommendations.some(r => r.date === dateStr);
              const isSelected = selectedDates.includes(dateStr);
              const isFocused = focusedDateIndex === index;
              const rateKey = `${selectedRoomType}_${dateStr}`;
              const isUpdating = updatingRates.has(rateKey);

              return (
                <div
                  key={index}
                  data-calendar-cell
                  data-date={dateStr}
                  className={`min-h-[80px] sm:min-h-[130px] rounded-lg border border-neutral-100 bg-neutral-50/50 transition-all ${!isCurrentMonth ? 'opacity-30' : ''} ${isPast ? 'opacity-50 bg-neutral-100' : ''} ${
                    bulkEditMode && isSelected ? 'ring-2 ring-terra-500 bg-terra-50/30' : ''
                  } ${isFocused ? 'ring-2 ring-terra-300 shadow-md scale-[1.02]' : ''}`}
                  onClick={bulkEditMode && !isPast ? () => onDateSelect?.(dateStr) : undefined}
                  style={{ cursor: bulkEditMode && !isPast ? 'pointer' : 'default' }}
                >
                  {/* Date Header */}
                  <div
                    className={`flex items-center justify-between px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-t-lg ${isToday ? 'bg-terra-500 text-white' : 'bg-white border-b border-neutral-100'}`}
                    onClick={(e) => {
                      // Prevent date header clicks from bubbling to parent cell
                      if (!bulkEditMode) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <span className={`text-[10px] sm:text-[12px] font-semibold ${isToday ? 'text-white' : 'text-neutral-600'}`}>
                      {date.getDate()}
                    </span>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {isUpdating && (
                        <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-terra-500 animate-spin" />
                      )}
                      {hasSuggestion && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSuggestionPopupDate(dateStr);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSuggestionPopupDate(dateStr);
                          }}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSuggestionPopupDate(dateStr);
                          }}
                          className="relative z-[20] p-1.5 rounded-md hover:bg-gold-100 active:bg-gold-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-300 cursor-pointer flex-shrink-0 touch-manipulation"
                          title="View AI suggestion"
                          aria-label="View AI suggestion"
                          style={{ pointerEvents: 'auto' }}
                        >
                          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-500 pointer-events-none" />
                        </button>
                      )}
                      {calendarData?.event && (
                        <span className="hidden sm:inline text-[9px] font-medium text-sage-700 bg-sage-50 px-1.5 py-0.5 rounded truncate max-w-[70px]">
                          {calendarData.event}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rate Cell */}
                  {roomData && !isPast ? (
                    <div onClick={bulkEditMode ? (e) => e.stopPropagation() : undefined}>
                      <RateCell
                        date={dateStr}
                        roomData={roomData}
                        isSelected={selectedDate === dateStr}
                        onSelect={() => handleDateSelect(date)}
                        onUpdateRate={(date, newRate) => handleUpdateRate(date, newRate)}
                        onApplyRestriction={(restriction) => applyRestriction(selectedRoomType, dateStr, restriction)}
                        compact={true}
                        isUpdating={isUpdating}
                      />
                    </div>
                  ) : (
                    <div className="p-2 sm:p-3 text-center text-[9px] sm:text-[11px] text-neutral-400">
                      {isPast ? 'Past' : 'No data'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Suggestion Popup - shown when clicking Sparkles icon on a date */}
      <Modal
        open={suggestionPopupDate !== null}
        onClose={() => setSuggestionPopupDate(null)}
        size="md"
        showClose={true}
        closeOnBackdrop={true}
        closeOnEsc={true}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-gold-500" />
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900">
              AI Suggestion{suggestionPopupDate ? ` for ${new Date(suggestionPopupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
            </h3>
          </div>
          {suggestionPopupDate && (() => {
            const recsForDate = (recommendations ?? []).filter(r => r.date === suggestionPopupDate);
            if (recsForDate.length === 0) {
              return (
                <p className="text-sm text-neutral-500 py-4">No suggestions for this date.</p>
              );
            }
            return (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {recsForDate.map((rec) => {
                  const recId = `${rec.room_type_id}_${rec.date}`;
                  const isIncrease = (rec.recommended_rate ?? 0) > (rec.current_rate ?? 0);
                  return (
                    <div
                      key={recId}
                      className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-800">{rec.room_type_name ?? 'Room'}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          rec.priority === 'critical' ? 'bg-rose-100 text-rose-700' :
                          rec.priority === 'high' ? 'bg-gold-100 text-gold-700' :
                          'bg-neutral-200 text-neutral-600'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-neutral-600">{rec.reasoning || 'Suggested rate adjustment.'}</p>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">Current</span>
                          <span className="text-sm font-semibold text-neutral-800">₹{rec.current_rate ?? '—'}</span>
                        </div>
                        <span className="text-neutral-400">→</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">Suggested</span>
                          <span className={`text-sm font-semibold ${isIncrease ? 'text-sage-600' : 'text-gold-600'}`}>
                            ₹{rec.recommended_rate ?? '—'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await applyRecommendation(rec);
                              success('Suggestion applied');
                              await refreshRecommendations?.();
                              setSuggestionPopupDate(null);
                            } catch {
                              showError('Failed to apply suggestion');
                            }
                          }}
                          className="flex-1 px-3 py-2 text-xs sm:text-[13px] font-medium text-white bg-terra-500 hover:bg-terra-600 rounded-lg transition-colors"
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await dismissRecommendation(recId);
                              success('Suggestion dismissed');
                              await refreshRecommendations?.();
                              setSuggestionPopupDate(null);
                            } catch {
                              showError('Failed to dismiss suggestion');
                            }
                          }}
                          className="flex-1 px-3 py-2 text-xs sm:text-[13px] font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </Modal>

      {/* Keyboard Help Overlay */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowKeyboardHelp(false)}>
          <div className="bg-white rounded-[10px] shadow-xl max-w-2xl w-full p-4 sm:p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-xl font-semibold text-neutral-900">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="p-1.5 sm:p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Navigation */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2 sm:mb-3">Navigation</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Arrow keys</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded">Arrow Keys</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Select date</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded">Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Clear focus</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded">Esc</kbd>
                  </div>
                </div>
              </div>

              {/* Month Controls */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2 sm:mb-3">Month Controls</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Previous month</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded">Ctrl + Left</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Next month</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded">Ctrl + Right</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Go to today</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded">T</kbd>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2 sm:mb-3">Actions</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Undo change</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded">Ctrl + Z</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Redo change</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded"><span className="hidden sm:inline">Ctrl + Shift + Z</span><span className="sm:hidden">Ctrl+⇧+Z</span></kbd>
                  </div>
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Recalculate rates</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded">R</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Show this help</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded">?</kbd>
                  </div>
                </div>
              </div>

              {/* Rate Editing */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2 sm:mb-3">Rate Editing</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Save rate</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded">Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 bg-neutral-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-neutral-700">Cancel editing</span>
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-white border border-neutral-300 rounded">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-200">
              <p className="text-xs sm:text-sm text-neutral-500 text-center">
                Press <kbd className="px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-neutral-600 bg-neutral-100 border border-neutral-300 rounded">Esc</kbd> or click outside to close
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RateCalendarView;
