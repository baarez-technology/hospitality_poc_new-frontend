import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Wrench,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { getCalendarEvents, PRIORITY_CONFIG, PM_FREQUENCY } from '../../utils/maintenance';

export default function MaintenanceCalendar({ workOrders, pmTasks, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' or 'week'

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // Get events for calendar
  const events = useMemo(() => {
    return getCalendarEvents(workOrders, pmTasks);
  }, [workOrders, pmTasks]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = {};
    events.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  }, [events]);

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getEventColor = (event) => {
    if (event.type === 'workorder') {
      if (event.priority === 'high') return 'bg-rose-500';
      if (event.status === 'in_progress') return 'bg-[#5C9BA4]';
      if (event.status === 'completed') return 'bg-[#4E5840]';
      return 'bg-[#CDB261]';
    }
    return 'bg-[#A57865]'; // PM tasks
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#FAF8F6]">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#A57865]" />
          <h3 className="text-sm font-bold text-neutral-900">Maintenance Calendar</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-600" />
          </button>
          <span className="text-sm font-semibold text-neutral-900 min-w-[140px] text-center">
            {formatMonthYear(currentDate)}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-neutral-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            // Use local date components to avoid timezone shift (toISOString converts to UTC which shifts the day)
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={`min-h-[80px] p-1 border rounded-lg ${
                  isTodayDate
                    ? 'border-[#A57865] bg-[#A57865]/5'
                    : isCurrentMonthDay
                      ? 'border-neutral-100 bg-white'
                      : 'border-neutral-50 bg-neutral-50/50'
                }`}
              >
                <div className={`text-xs font-semibold mb-1 ${
                  isTodayDate
                    ? 'text-[#A57865]'
                    : isCurrentMonthDay
                      ? 'text-neutral-900'
                      : 'text-neutral-400'
                }`}>
                  {date.getDate()}
                </div>

                {/* Events */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <button
                      key={event.id || idx}
                      onClick={() => onEventClick(event)}
                      className={`w-full text-left px-1 py-0.5 rounded text-[10px] font-medium text-white truncate ${getEventColor(event)} hover:opacity-80 transition-opacity`}
                      title={event.title}
                    >
                      {event.type === 'workorder' ? (
                        <span className="flex items-center gap-0.5">
                          {event.priority === 'high' && <AlertTriangle className="w-2 h-2" />}
                          {event.room || 'WO'}: {event.title}
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5">
                          <Wrench className="w-2 h-2" />
                          {event.title}
                        </span>
                      )}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-neutral-500 font-medium px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#CDB261]" />
            <span className="text-xs text-neutral-600">Open WO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#5C9BA4]" />
            <span className="text-xs text-neutral-600">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#4E5840]" />
            <span className="text-xs text-neutral-600">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-500" />
            <span className="text-xs text-neutral-600">High Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#A57865]" />
            <span className="text-xs text-neutral-600">Preventive Maintenance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
