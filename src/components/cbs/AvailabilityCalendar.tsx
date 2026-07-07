/**
 * AvailabilityCalendar Component
 * 30-day horizontal calendar grid with room type rows - Glimmora Design
 */

import { useState, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Ban, Calendar,
  DollarSign, AlertTriangle, Bed, Clock,
  TrendingUp, RotateCcw, Unlock, CheckCircle,
  AlertCircle, XCircle, Filter, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '../ui2/Tooltip';
import { Button, IconButton } from '../ui2/Button';
import { Drawer } from '../ui2/Drawer';
import { Input, FormField } from '../ui2/Input';
import { Badge } from '../ui2/Badge';
import DatePicker from '../ui2/DatePicker';

// Default room types (fallback if not provided via props)
const defaultRoomTypes = [
  'Minimalist Studio',
  'Coastal Retreat',
  'Urban Oasis',
  'Sunset Vista',
  'Pacific Suite',
  'Wellness Suite',
  'Family Sanctuary',
  'Oceanfront Penthouse'
];

const roomTypeColors = {
  'Minimalist Studio': {
    bg: 'bg-neutral-50',
    border: 'border-neutral-300',
    text: 'text-neutral-700',
    icon: 'bg-neutral-100 text-neutral-600',
    gradient: 'from-neutral-400 to-neutral-500',
    accent: 'neutral',
    rowBg: 'bg-neutral-50/40',
    hoverBg: 'hover:bg-neutral-200'
  },
  'Coastal Retreat': {
    bg: 'bg-ocean-50',
    border: 'border-ocean-300',
    text: 'text-ocean-700',
    icon: 'bg-ocean-100 text-ocean-600',
    gradient: 'from-ocean-500 to-ocean-600',
    accent: 'ocean',
    rowBg: 'bg-ocean-50/40',
    hoverBg: 'hover:bg-neutral-200'
  },
  'Urban Oasis': {
    bg: 'bg-sage-50',
    border: 'border-sage-300',
    text: 'text-sage-700',
    icon: 'bg-sage-100 text-sage-600',
    gradient: 'from-sage-500 to-sage-600',
    accent: 'sage',
    rowBg: 'bg-sage-50/40',
    hoverBg: 'hover:bg-neutral-200'
  },
  'Sunset Vista': {
    bg: 'bg-gold-50',
    border: 'border-gold-300',
    text: 'text-gold-700',
    icon: 'bg-gold-100 text-gold-600',
    gradient: 'from-gold-500 to-gold-600',
    accent: 'gold',
    rowBg: 'bg-gold-50/40',
    hoverBg: 'hover:bg-neutral-200'
  },
  'Pacific Suite': {
    bg: 'bg-terra-50',
    border: 'border-terra-300',
    text: 'text-terra-700',
    icon: 'bg-terra-100 text-terra-600',
    gradient: 'from-terra-500 to-terra-600',
    accent: 'terra',
    rowBg: 'bg-terra-50/40',
    hoverBg: 'hover:bg-neutral-200'
  },
  'Wellness Suite': {
    bg: 'bg-sage-50',
    border: 'border-sage-300',
    text: 'text-sage-700',
    icon: 'bg-sage-100 text-sage-600',
    gradient: 'from-sage-500 to-sage-600',
    accent: 'sage',
    rowBg: 'bg-sage-50/40',
    hoverBg: 'hover:bg-neutral-200'
  },
  'Family Sanctuary': {
    bg: 'bg-ocean-50',
    border: 'border-ocean-300',
    text: 'text-ocean-700',
    icon: 'bg-ocean-100 text-ocean-600',
    gradient: 'from-ocean-500 to-ocean-600',
    accent: 'ocean',
    rowBg: 'bg-ocean-50/40',
    hoverBg: 'hover:bg-neutral-200'
  },
  'Oceanfront Penthouse': {
    bg: 'bg-gold-50',
    border: 'border-gold-300',
    text: 'text-gold-700',
    icon: 'bg-gold-100 text-gold-600',
    gradient: 'from-gold-500 to-gold-600',
    accent: 'gold',
    rowBg: 'bg-gold-50/40',
    hoverBg: 'hover:bg-neutral-200'
  }
};

const baseRates = {
  'Minimalist Studio': 150,
  'Coastal Retreat': 199,
  'Urban Oasis': 245,
  'Sunset Vista': 315,
  'Pacific Suite': 385,
  'Wellness Suite': 425,
  'Family Sanctuary': 485,
  'Oceanfront Penthouse': 750
};

const AvailabilityCalendar = forwardRef(({
  availability,
  dates: allDates,
  onUpdateAvailability,
  onBulkUpdate,
  roomTypes: propRoomTypes
}, ref) => {
  // Use room types from props if provided, otherwise use defaults
  const roomTypes = propRoomTypes && propRoomTypes.length > 0 ? propRoomTypes : defaultRoomTypes;
  const [selectedCell, setSelectedCell] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const contentScrollRef = useRef(null);

  // Date range filter state
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Filter dates based on selected range
  const dates = useMemo(() => {
    if (!filterStartDate && !filterEndDate) {
      return allDates;
    }

    return allDates.filter(dateInfo => {
      const date = new Date(dateInfo.date);
      const start = filterStartDate ? new Date(filterStartDate) : null;
      const end = filterEndDate ? new Date(filterEndDate) : null;

      if (start && end) {
        return date >= start && date <= end;
      } else if (start) {
        return date >= start;
      } else if (end) {
        return date <= end;
      }
      return true;
    });
  }, [allDates, filterStartDate, filterEndDate]);

  // Clear date filter
  const handleClearFilter = () => {
    setFilterStartDate('');
    setFilterEndDate('');
  };

  // Check if filter is active
  const isFilterActive = filterStartDate || filterEndDate;

  // Expose scrollToToday method to parent
  useImperativeHandle(ref, () => ({
    scrollToToday: () => {
      if (contentScrollRef.current) {
        const todayIndex = dates.findIndex(d => d.isToday);
        if (todayIndex !== -1) {
          const cellWidth = 112; // w-28 = 7rem = 112px
          const scrollPosition = todayIndex * cellWidth - 200; // Center it
          contentScrollRef.current.scrollTo({
            left: Math.max(0, scrollPosition),
            behavior: 'smooth'
          });
        }
      }
    }
  }));

  const handleCellClick = (date, roomType) => {
    const cellData = availability[date]?.[roomType];
    if (cellData) {
      const initialData = {
        rate: cellData.rate,
        available: cellData.available,
        minStay: cellData.minStay,
        stopSell: cellData.stopSell,
        cta: cellData.cta,
        ctd: cellData.ctd,
        notes: cellData.notes || ''
      };
      setSelectedCell({ date, roomType, data: cellData });
      setEditData(initialData);
      setOriginalData(initialData);
      setValidationErrors([]);
      setIsDrawerOpen(true);
    }
  };

  const validateData = () => {
    const errors = [];

    if (editData.rate === 0) {
      errors.push({
        field: 'rate',
        message: 'Rate cannot be $0. Consider using Stop Sell instead.'
      });
    }

    if (editData.rate < 0) {
      errors.push({
        field: 'rate',
        message: 'Rate cannot be negative.'
      });
    }

    if (editData.rate > 10000) {
      errors.push({
        field: 'rate',
        message: 'Rate seems unusually high. Please verify.'
      });
    }

    if (editData.stopSell && editData.available > 0) {
      errors.push({
        field: 'stopSell',
        message: 'Stop Sell is enabled but rooms are available. This will prevent new bookings.',
        severity: 'warning'
      });
    }

    return errors;
  };

  const hasChanges = () => {
    return JSON.stringify(editData) !== JSON.stringify(originalData);
  };

  const handleSave = () => {
    if (selectedCell) {
      const errors = validateData();
      const criticalErrors = errors.filter(e => e.severity !== 'warning');

      if (criticalErrors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      onUpdateAvailability(selectedCell.date, selectedCell.roomType, editData);
      setIsDrawerOpen(false);
      setSelectedCell(null);
      setValidationErrors([]);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCell(null);
  };

  const scrollCalendar = (direction) => {
    // Scroll the content area (which will sync the header)
    if (contentScrollRef.current) {
      const scrollAmount = 200;
      contentScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAvailabilityColor = (available, total) => {
    const ratio = available / total;
    if (ratio === 0) return 'bg-rose-500 text-white border border-rose-600 shadow-sm';
    if (ratio <= 0.25) return 'bg-rose-50 text-rose-700 border border-rose-200/60 font-semibold';
    if (ratio <= 0.5) return 'bg-gold-50 text-gold-700 border border-gold-200/60 font-semibold';
    return 'bg-sage-50 text-sage-700 border border-sage-200/60 font-semibold';
  };

  // Default color scheme for room types not in predefined list
  const defaultColors = {
    bg: 'bg-neutral-50',
    border: 'border-neutral-300',
    text: 'text-neutral-700',
    icon: 'bg-neutral-100 text-neutral-600',
    gradient: 'from-neutral-400 to-neutral-500',
    accent: 'neutral',
    rowBg: 'bg-neutral-50/40',
    hoverBg: 'hover:bg-neutral-200'
  };

  const getRoomTypeColors = (roomType) => {
    return roomTypeColors[roomType] || defaultColors;
  };

  const getRoomTypeBaseRate = (roomType) => {
    return baseRates[roomType] || 200;
  };


  return (
    <div className="bg-white rounded-[10px] overflow-hidden">
      {/* Calendar Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">Availability Calendar</h3>
          <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
            {isFilterActive ? (
              <span className="text-terra-600">Showing {dates.length} of {allDates.length} days</span>
            ) : (
              'Click any cell to edit rates & restrictions'
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-50 rounded-lg border border-neutral-200">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <DatePicker
                value={filterStartDate}
                onChange={setFilterStartDate}
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

          {/* Scroll Navigation */}
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
            <IconButton
              onClick={() => scrollCalendar('left')}
              icon={ChevronLeft}
              variant="outline"
              size="md"
              label="Scroll left"
            />
            <IconButton
              onClick={() => scrollCalendar('right')}
              icon={ChevronRight}
              variant="outline"
              size="md"
              label="Scroll right"
            />
          </div>
        </div>
      </div>

      {/* Calendar Grid - Single scroll container with sticky positioning */}
      <div
        ref={contentScrollRef}
        className="overflow-auto relative"
        style={{ height: '520px', scrollbarWidth: 'thin' }}
      >
        <div className="inline-block min-w-full">
          {/* Table-like structure with sticky header and column */}
          <div className="flex">
            {/* Sticky Left Column (Room Type Labels) */}
            <div className="sticky left-0 z-20 bg-white flex-shrink-0 w-52">
              {/* Corner cell - sticky both ways */}
              <div className="sticky top-0 z-30 h-16 bg-neutral-50 border-b border-r border-neutral-200/40 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-neutral-400" />
              </div>

              {/* Room type labels */}
              {roomTypes.map(roomType => {
                const colors = getRoomTypeColors(roomType);
                return (
                  <div key={roomType} className="border-b border-r border-neutral-200/40 last:border-b-0">
                    {/* Room Type Header */}
                    <div className={`h-14 px-5 flex items-center gap-3 border-l-4 ${colors.bg} ${colors.border} bg-gradient-to-r ${colors.bg} to-white`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm ${colors.icon}`}>
                        <Bed className={`w-5 h-5`} />
                      </div>
                      <span className={`font-semibold text-sm whitespace-nowrap ${colors.text}`}>{roomType}</span>
                    </div>
                    {/* Metric rows */}
                    {['Availability', 'Rate', 'Min Stay', 'Restrictions'].map((metric, idx) => (
                      <div key={metric} className={`h-11 px-5 flex items-center border-t border-neutral-200/40 ${idx % 2 === 0 ? 'bg-neutral-50/30' : 'bg-white'}`}>
                        <span className="text-xs whitespace-nowrap font-semibold uppercase tracking-[0.05em] text-neutral-500">{metric}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Scrollable Date Columns */}
            <div className="flex">
              {dates.map(dateInfo => (
                <div key={dateInfo.date} className="flex-shrink-0 w-28 border-r border-neutral-200/40 last:border-r-0">
                  {/* Sticky Date Header */}
                  <div className={`sticky top-0 z-10 h-16 flex flex-col items-center justify-center border-b border-neutral-200/40 ${
                    dateInfo.isToday
                      ? 'bg-terra-500 text-white shadow-md shadow-terra-500/20'
                      : dateInfo.isWeekend
                        ? 'bg-gold-50 border-l-2 border-gold-200'
                        : 'bg-white'
                  }`}>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${dateInfo.isToday ? 'text-white/90' : dateInfo.isWeekend ? 'text-gold-700' : 'text-neutral-500'}`}>
                      {dateInfo.dayOfWeek}
                    </span>
                    <span className={`text-xl font-bold tracking-tight ${dateInfo.isToday ? 'text-white' : dateInfo.isWeekend ? 'text-gold-800' : 'text-neutral-900'}`}>
                      {dateInfo.dayOfMonth}
                    </span>
                    <span className={`text-[10px] font-medium uppercase tracking-wider ${dateInfo.isToday ? 'text-white/80' : dateInfo.isWeekend ? 'text-gold-600/80' : 'text-neutral-400'}`}>
                      {dateInfo.month}
                    </span>
                  </div>

                  {/* Room type cells */}
                  {roomTypes.map(roomType => {
                    const cellData = availability[dateInfo.date]?.[roomType];
                    if (!cellData) return null;

                    const availColor = getAvailabilityColor(cellData.available, cellData.totalInventory);
                    const hasRestrictions = cellData.stopSell || cellData.cta || cellData.ctd;
                    const colors = getRoomTypeColors(roomType);

                    return (
                      <div
                        key={`${dateInfo.date}-${roomType}`}
                        className={`cursor-pointer transition-all duration-200 group border-b border-neutral-200/40 last:border-b-0 ${colors.rowBg} ${colors.hoverBg} hover:shadow-sm relative`}
                        onClick={() => handleCellClick(dateInfo.date, roomType)}
                      >
                        {/* Room Type Row Header - empty for scrolling alignment */}
                        <div className="h-14 relative">
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r ${colors.gradient} via-transparent to-transparent`} style={{ opacity: 0.05 }} />
                        </div>

                        {/* Availability */}
                        <div className="h-11 flex items-center justify-center border-t border-neutral-200/40 bg-white/30 transition-colors duration-200">
                          <span className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${availColor}`}>
                            {cellData.available}/{cellData.totalInventory}
                          </span>
                        </div>

                        {/* Rate */}
                        <div className="h-11 flex items-center justify-center border-t border-neutral-200/40 bg-white/20 transition-colors duration-200">
                          <span className={`text-sm font-semibold tracking-tight transition-colors duration-200 ${colors.text}`}>
                            ₹{cellData.rate}
                          </span>
                        </div>

                        {/* Min Stay */}
                        <div className="h-11 flex items-center justify-center border-t border-neutral-200/40 bg-white/30 transition-colors duration-200">
                          <span className="text-xs font-semibold text-neutral-600 transition-colors duration-200">
                            {cellData.minStay} night{cellData.minStay !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Restrictions */}
                        <div className="h-11 flex items-center justify-center gap-1.5 border-t border-neutral-200/40 bg-white/20 transition-colors duration-200">
                          {cellData.stopSell && (
                            <Tooltip content="Stop Sell - No bookings allowed" side="top">
                              <span className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                                S
                              </span>
                            </Tooltip>
                          )}
                          {cellData.cta && (
                            <Tooltip content="Closed to Arrival - No check-ins allowed" side="top">
                              <span className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold bg-gold-100 text-gold-700 border border-gold-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                                A
                              </span>
                            </Tooltip>
                          )}
                          {cellData.ctd && (
                            <Tooltip content="Closed to Departure - No check-outs allowed" side="top">
                              <span className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold bg-ocean-100 text-ocean-700 border border-ocean-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                                D
                              </span>
                            </Tooltip>
                          )}
                          {!hasRestrictions && (
                            <span className="text-xs text-neutral-300 transition-colors duration-200">—</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Legend</span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-sage-50 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sage-600" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-600 hidden sm:inline">Available</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gold-50 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-600" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-600 hidden sm:inline">Low Stock</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-rose-50 flex items-center justify-center">
              <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-600 hidden sm:inline">Sold Out</span>
          </div>
          <div className="h-4 w-px bg-neutral-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-rose-100 flex items-center justify-center">
              <span className="text-[9px] sm:text-[10px] font-semibold text-rose-700">S</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-600 hidden sm:inline">Stop Sell</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gold-100 flex items-center justify-center">
              <span className="text-[9px] sm:text-[10px] font-semibold text-gold-700">A</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-600 hidden sm:inline">CTA</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-ocean-100 flex items-center justify-center">
              <span className="text-[9px] sm:text-[10px] font-semibold text-ocean-700">D</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-600 hidden sm:inline">CTD</span>
          </div>
        </div>
      </div>

      {/* Edit Availability Drawer */}
      <Drawer
        isOpen={isDrawerOpen && !!selectedCell}
        onClose={handleCloseDrawer}
        maxWidth="max-w-2xl"
        title={selectedCell ? `${selectedCell.roomType} Room` : ''}
        subtitle={selectedCell ? new Date(selectedCell.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleCloseDrawer}
              className="px-5 py-2 text-[13px] font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges()}
              className="px-5 py-2 text-[13px] font-semibold"
            >
              Save Changes
            </Button>
          </div>
        }
      >
        {selectedCell && (
          <div className="space-y-6">
            {/* Room Availability Visual */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-neutral-800">Room Availability</p>
                <div className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                  editData.available === 0
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : editData.available <= selectedCell.data.totalInventory * 0.25
                      ? "bg-gold-50 text-gold-700 border-gold-200"
                      : "bg-sage-50 text-sage-700 border-sage-200"
                )}>
                  {editData.available === 0
                    ? "Sold Out"
                    : editData.available <= selectedCell.data.totalInventory * 0.25
                      ? "Low Stock"
                      : "Available"
                  }
                </div>
              </div>
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold tracking-tight text-neutral-900">{editData.available}</span>
                  <span className="text-[13px] text-neutral-400 font-medium">of {selectedCell.data.totalInventory} rooms</span>
                </div>
                {/* Progress Bar */}
                <div className="h-2.5 rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      editData.available === 0
                        ? "bg-rose-500"
                        : editData.available <= selectedCell.data.totalInventory * 0.25
                          ? "bg-gold-500"
                          : "bg-sage-500"
                    )}
                    style={{ width: `${(editData.available / selectedCell.data.totalInventory) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3 text-[11px] text-neutral-500 font-medium">
                  <span>{selectedCell.data.sold} sold</span>
                  <span>{editData.available} available</span>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-neutral-800">Nightly Rate</p>
                  <p className="text-[11px] text-neutral-400 font-medium">Base: ₹{getRoomTypeBaseRate(selectedCell.roomType)}/night</p>
                </div>
                {editData.rate !== getRoomTypeBaseRate(selectedCell.roomType) && (
                  <span className={cn(
                    "text-[11px] font-semibold px-2.5 py-1 rounded-lg",
                    editData.rate > getRoomTypeBaseRate(selectedCell.roomType)
                      ? "bg-sage-50 text-sage-700 border border-sage-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  )}>
                    {editData.rate > getRoomTypeBaseRate(selectedCell.roomType) ? '+' : ''}
                    {Math.round(((editData.rate - getRoomTypeBaseRate(selectedCell.roomType)) / getRoomTypeBaseRate(selectedCell.roomType)) * 100)}% from base
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-terra-500 font-semibold text-lg">₹</span>
                  <input
                    type="number"
                    value={editData.rate}
                    onChange={(e) => setEditData(prev => ({ ...prev, rate: parseInt(e.target.value) || 0 }))}
                    className="w-full h-14 pl-10 pr-4 text-3xl font-bold text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setEditData(prev => ({ ...prev, rate: Math.round(prev.rate * 1.1) }))}
                    className="w-16 py-2.5 text-[12px] font-semibold bg-sage-50 text-sage-700 border border-sage-200 rounded-lg hover:bg-sage-100 hover:border-sage-300 transition-all"
                  >
                    +10%
                  </button>
                  <button
                    onClick={() => setEditData(prev => ({ ...prev, rate: Math.round(prev.rate * 0.9) }))}
                    className="w-16 py-2.5 text-[12px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 hover:border-rose-300 transition-all"
                  >
                    -10%
                  </button>
                </div>
              </div>
            </div>

            {/* Min Stay */}
            <div className="space-y-3">
              <div>
                <p className="text-[13px] font-semibold text-neutral-800">Minimum Stay</p>
                <p className="text-[11px] text-neutral-400 font-medium">Required nights per booking</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEditData(prev => ({ ...prev, minStay: Math.max(1, prev.minStay - 1) }))}
                  disabled={editData.minStay <= 1}
                  className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-600 font-bold text-xl flex items-center justify-center hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-neutral-200"
                >
                  -
                </button>
                <div className="flex-1 text-center py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-3xl font-bold text-neutral-900">{editData.minStay}</span>
                  <span className="text-[13px] text-neutral-500 font-medium ml-2">night{editData.minStay !== 1 ? 's' : ''}</span>
                </div>
                <button
                  onClick={() => setEditData(prev => ({ ...prev, minStay: prev.minStay + 1 }))}
                  className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-600 font-bold text-xl flex items-center justify-center hover:bg-neutral-200 transition-all border border-neutral-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Booking Restrictions */}
            <div className="space-y-3">
              <div>
                <p className="text-[13px] font-semibold text-neutral-800">Booking Restrictions</p>
                <p className="text-[11px] text-neutral-400 font-medium">Control availability settings</p>
              </div>
              <div className="space-y-3">
                {/* Stop Sell Toggle */}
                <button
                  onClick={() => setEditData(prev => ({ ...prev, stopSell: !prev.stopSell }))}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all bg-neutral-50 hover:bg-neutral-100 border border-neutral-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-100">
                      <Ban className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-neutral-800">Stop Sell</p>
                      <p className="text-[11px] text-neutral-500">Block all new bookings</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-10 h-6 rounded-full p-0.5 transition-colors",
                    editData.stopSell ? "bg-terra-500" : "bg-neutral-300"
                  )}>
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white shadow transition-transform",
                      editData.stopSell ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </button>

                {/* CTA Toggle */}
                <button
                  onClick={() => setEditData(prev => ({ ...prev, cta: !prev.cta }))}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all bg-neutral-50 hover:bg-neutral-100 border border-neutral-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold bg-neutral-100 text-neutral-500">
                      CTA
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-neutral-800">Closed to Arrival</p>
                      <p className="text-[11px] text-neutral-500">No check-ins on this date</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-10 h-6 rounded-full p-0.5 transition-colors",
                    editData.cta ? "bg-terra-500" : "bg-neutral-300"
                  )}>
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white shadow transition-transform",
                      editData.cta ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </button>

                {/* CTD Toggle */}
                <button
                  onClick={() => setEditData(prev => ({ ...prev, ctd: !prev.ctd }))}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all bg-neutral-50 hover:bg-neutral-100 border border-neutral-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold bg-neutral-100 text-neutral-500">
                      CTD
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-neutral-800">Closed to Departure</p>
                      <p className="text-[11px] text-neutral-500">No check-outs on this date</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-10 h-6 rounded-full p-0.5 transition-colors",
                    editData.ctd ? "bg-terra-500" : "bg-neutral-300"
                  )}>
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white shadow transition-transform",
                      editData.ctd ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </button>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-4 rounded-[10px] bg-rose-50 border border-rose-200/60">
                <p className="font-semibold text-[13px] text-rose-700 mb-2">Please Review</p>
                <ul className="space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className="text-[11px] text-rose-600 font-medium">• {error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-4 border-t border-neutral-300">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditData(prev => ({ ...prev, available: 0, stopSell: true }))}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-50 text-rose-700 text-[12px] font-semibold hover:bg-rose-100 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Mark Sold Out
                </button>
                <button
                  onClick={() => setEditData(prev => ({
                    ...prev,
                    rate: getRoomTypeBaseRate(selectedCell.roomType),
                    minStay: 1,
                    stopSell: false,
                    cta: false,
                    ctd: false
                  }))}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-neutral-100 text-neutral-700 text-[12px] font-semibold hover:bg-neutral-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
});

AvailabilityCalendar.displayName = 'AvailabilityCalendar';

export default AvailabilityCalendar;
