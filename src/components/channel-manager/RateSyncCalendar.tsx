/**
 * RateSyncCalendar Component
 * 14-day horizontal calendar for rate and availability sync - Glimmora Design System v5.0
 * Consistent with AvailabilityCalendar design patterns
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  DollarSign, Calendar,
  AlertCircle, Ban, ChevronDown, CheckCircle, XCircle, Clock, Bed, Filter, X
} from 'lucide-react';
import { useChannelManager } from '../../context/ChannelManagerContext';
import { DropdownMenu, DropdownMenuItem } from '../ui2/DropdownMenu';
import { Tooltip } from '../ui2/Tooltip';
import DatePicker from '../ui2/DatePicker';

export default function RateSyncCalendar({ selectedRoomType = null }) {
  const { rateCalendar, otas, roomTypes, updateRateForOTA, updateAvailabilityForOTA, toggleStopSell } = useChannelManager();
  const [viewStartDate, setViewStartDate] = useState(new Date());
  const [internalRoomType, setInternalRoomType] = useState(null);
  const [selectedOTA, setSelectedOTA] = useState('ALL');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const scrollContainerRef = useRef(null);

  // Date range filter state
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const isFilterActive = filterStartDate || filterEndDate;

  const handleFilterStartChange = (date: string) => {
    setFilterStartDate(date);
    if (date) {
      setViewStartDate(new Date(date + 'T00:00:00'));
    }
  };

  const handleClearFilter = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setViewStartDate(new Date());
  };

  // Use prop if provided, otherwise use internal state (first room type from API)
  const activeRoomType = selectedRoomType || internalRoomType || (roomTypes.length > 0 ? roomTypes[0].name : null);
  
  // Use room types from API, extract names for dropdown
  const roomTypeNames = roomTypes.length > 0 ? roomTypes.map(rt => rt.name) : [];
  const connectedOTAs = otas.filter(o => o.status === 'connected');
  
  // Set default room type when roomTypes are loaded
  useEffect(() => {
    if (!internalRoomType && roomTypes.length > 0) {
      setInternalRoomType(roomTypes[0].name);
    }
  }, [roomTypes, internalRoomType]);

  // Generate 14 visible days, filtered by date range if active
  const visibleDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(viewStartDate);
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }

    // Apply end date filter if set
    if (filterEndDate) {
      return days.filter(d => d.date <= filterEndDate);
    }
    return days;
  }, [viewStartDate, filterEndDate]);

  const handleEditStart = (date, roomType, otaCode, field, currentValue) => {
    setEditingCell({ date, roomType, otaCode, field });
    setEditValue(currentValue.toString());
  };

  const handleEditSave = () => {
    if (!editingCell) return;

    const { date, roomType, otaCode, field } = editingCell;
    const numValue = parseInt(editValue);

    if (field === 'rate' && !isNaN(numValue)) {
      updateRateForOTA(date, roomType, otaCode, numValue);
    } else if (field === 'availability' && !isNaN(numValue)) {
      updateAvailabilityForOTA(date, roomType, numValue);
    }

    setEditingCell(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getCellData = (date, roomType) => {
    const dayData = rateCalendar[date]?.[roomType];
    if (!dayData) return null;
    return dayData;
  };

  const getOTARate = (date, roomType, otaCode) => {
    const dayData = getCellData(date, roomType);
    if (!dayData) return null;
    if (otaCode === 'ALL') return dayData.rates?.BAR;
    return dayData.otaRates?.[otaCode] || dayData.rates?.OTA;
  };

  const checkRateParity = (date, roomType) => {
    const dayData = getCellData(date, roomType);
    if (!dayData?.otaRates) return true;

    const rates = Object.values(dayData.otaRates);
    const baseRate = dayData.rates?.BAR;
    return rates.every(r => Math.abs(r - baseRate) < baseRate * 0.1);
  };

  const getOTALabel = () => {
    if (selectedOTA === 'ALL') return 'All OTAs (BAR)';
    const ota = connectedOTAs.find(o => o.code === selectedOTA);
    return ota?.name || selectedOTA;
  };

  // Availability color logic - Glimmora Design System v5.0
  const getAvailabilityColor = (available, total) => {
    const ratio = available / total;
    if (ratio === 0) return 'bg-rose-500 text-white border border-rose-600 shadow-sm';
    if (ratio <= 0.25) return 'bg-rose-50 text-rose-700 border border-rose-200/60 font-semibold';
    if (ratio <= 0.5) return 'bg-gold-50 text-gold-700 border border-gold-200/60 font-semibold';
    return 'bg-sage-50 text-sage-700 border border-sage-200/60 font-semibold';
  };

  return (
    <div className="bg-white rounded-[10px] overflow-hidden">
      {/* Calendar Header - matches AvailabilityCalendar */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Rate Calendar</h3>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
            {isFilterActive ? (
              <span className="text-terra-600">
                Showing {visibleDays.length} days {filterStartDate && `from ${new Date(filterStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                {filterEndDate && ` to ${new Date(filterEndDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </span>
            ) : (
              <>
                <span className="hidden sm:inline">Click any cell to edit rates & restrictions</span>
                <span className="sm:hidden">Tap to edit rates</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
          {/* Date Range Filter */}
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
          {/* Filters */}
          {!selectedRoomType && (
            <DropdownMenu
              align="end"
              trigger={
                <button className="h-8 sm:h-9 px-2 sm:px-3 pr-1.5 sm:pr-2 rounded-lg text-[11px] sm:text-[12px] bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" />
                  <span className="truncate max-w-[80px] sm:max-w-none">{activeRoomType}</span>
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" />
                </button>
              }
            >
              {roomTypeNames.map(roomName => (
                <DropdownMenuItem key={roomName} onSelect={() => setInternalRoomType(roomName)}>
                  {roomName}
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
          )}

          <DropdownMenu
            align="end"
            trigger={
              <button className="h-8 sm:h-9 px-2 sm:px-3 pr-1.5 sm:pr-2 rounded-lg text-[11px] sm:text-[12px] bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <span className="truncate max-w-[70px] sm:max-w-none">{getOTALabel()}</span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" />
              </button>
            }
          >
            <DropdownMenuItem onSelect={() => setSelectedOTA('ALL')}>
              All OTAs (BAR)
            </DropdownMenuItem>
            {connectedOTAs.map(ota => (
              <DropdownMenuItem key={ota.code} onSelect={() => setSelectedOTA(ota.code)}>
                {ota.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenu>

        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex">
        {/* Metric Labels Column */}
        <div className="flex-shrink-0 border-r border-neutral-200/40 bg-white">
          {/* Corner cell with Calendar icon */}
          <div className="h-14 sm:h-16 bg-neutral-50 border-b border-neutral-200/40 flex items-center justify-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
          </div>

          {/* Metric row labels */}
          {['Rate', 'Avail', 'Min', 'Rest.'].map((metric, idx) => (
            <div
              key={metric}
              className={`h-10 sm:h-11 px-2 sm:px-5 flex items-center border-b border-neutral-200/40 ${
                idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/30'
              }`}
            >
              <span className="text-[10px] sm:text-xs whitespace-nowrap font-semibold uppercase tracking-[0.05em] text-neutral-500">
                {metric}
              </span>
            </div>
          ))}
        </div>

        {/* Scrollable Date Columns */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="inline-flex min-w-full">
            {visibleDays.map(day => {
              const cellData = getCellData(day.date, activeRoomType);
              const rate = getOTARate(day.date, activeRoomType, selectedOTA);
              const availability = cellData?.availability || 0;
              const total = cellData?.totalInventory || 10;
              const minStay = cellData?.minStay || 1;
              const isStopSell = cellData?.stopSell || false;
              const isCTA = cellData?.cta || false;
              const isCTD = cellData?.ctd || false;
              const hasRestrictions = isStopSell || isCTA || isCTD;
              const hasParity = checkRateParity(day.date, activeRoomType);

              const isEditingRate = editingCell?.date === day.date &&
                                    editingCell?.roomType === activeRoomType &&
                                    editingCell?.field === 'rate';
              const isEditingAvail = editingCell?.date === day.date &&
                                     editingCell?.roomType === activeRoomType &&
                                     editingCell?.field === 'availability';

              return (
                <div key={day.date} className="flex-shrink-0 w-16 sm:w-20 border-r border-neutral-200/40 last:border-r-0">
                  {/* Date Header */}
                  <div className={`h-14 sm:h-16 flex flex-col items-center justify-center transition-all duration-200 border-b border-neutral-200/40 ${
                    day.isToday
                      ? 'bg-gradient-to-br from-terra-500 to-terra-600 text-white shadow-md shadow-terra-500/20'
                      : day.isWeekend
                        ? 'bg-gradient-to-br from-gold-50 to-gold-100/50 border-l-2 border-gold-200'
                        : 'bg-white'
                  }`}>
                    <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                      day.isToday ? 'text-white/90' : day.isWeekend ? 'text-gold-700' : 'text-neutral-500'
                    }`}>
                      {day.dayName}
                    </span>
                    <span className={`text-lg sm:text-xl font-bold tracking-tight ${
                      day.isToday ? 'text-white' : day.isWeekend ? 'text-gold-800' : 'text-neutral-900'
                    }`}>
                      {day.dayNum}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-medium uppercase tracking-wider ${
                      day.isToday ? 'text-white/80' : day.isWeekend ? 'text-gold-600/80' : 'text-neutral-400'
                    }`}>
                      {day.month}
                    </span>
                  </div>

                  {/* Rate Cell */}
                  <div className={`h-10 sm:h-11 flex items-center justify-center border-b border-neutral-200/40 transition-colors duration-200 ${
                    day.isToday ? 'bg-terra-50/30' : day.isWeekend ? 'bg-gold-50/20' : 'bg-white'
                  } hover:bg-white group cursor-pointer relative`}>
                    {isEditingRate ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-12 sm:w-14 h-6 sm:h-7 px-1 text-[11px] sm:text-[12px] text-center rounded-lg bg-white border border-terra-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-terra-500/20"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave();
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        onBlur={handleEditSave}
                      />
                    ) : (
                      <button
                        onClick={() => handleEditStart(day.date, activeRoomType, selectedOTA, 'rate', rate || 0)}
                        className={`w-full h-full flex items-center justify-center transition-all ${
                          !hasParity ? 'ring-1 ring-inset ring-gold-400' : ''
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-semibold tracking-tight text-neutral-900 group-hover:text-terra-600 transition-colors">
                          ${rate || 0}
                        </span>
                        {!hasParity && (
                          <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-gold-500" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Availability Cell */}
                  <div className={`h-10 sm:h-11 flex items-center justify-center border-b border-neutral-200/40 transition-colors duration-200 ${
                    day.isToday ? 'bg-terra-50/30' : day.isWeekend ? 'bg-gold-50/20' : 'bg-neutral-50/30'
                  } hover:bg-white group cursor-pointer`}>
                    {isEditingAvail ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-12 sm:w-14 h-6 sm:h-7 px-1 text-[11px] sm:text-[12px] text-center rounded-lg bg-white border border-terra-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-terra-500/20"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave();
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        onBlur={handleEditSave}
                      />
                    ) : (
                      <button
                        onClick={() => handleEditStart(day.date, activeRoomType, selectedOTA, 'availability', availability)}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <span className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-lg transition-all duration-200 ${getAvailabilityColor(availability, total)}`}>
                          {availability}/{total}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Min Stay Cell */}
                  <div className={`h-10 sm:h-11 flex items-center justify-center border-b border-neutral-200/40 transition-colors duration-200 ${
                    day.isToday ? 'bg-terra-50/30' : day.isWeekend ? 'bg-gold-50/20' : 'bg-white'
                  } hover:bg-white`}>
                    <span className="text-[10px] sm:text-xs font-semibold text-neutral-600">
                      {minStay}n
                    </span>
                  </div>

                  {/* Restrictions Cell */}
                  <div className={`h-10 sm:h-11 flex items-center justify-center gap-0.5 sm:gap-1 border-b border-neutral-200/40 transition-colors duration-200 ${
                    day.isToday ? 'bg-terra-50/30' : day.isWeekend ? 'bg-gold-50/20' : 'bg-neutral-50/30'
                  } hover:bg-white`}>
                    {isStopSell && (
                      <Tooltip content="Stop Sell - No bookings allowed" side="top">
                        <button
                          onClick={() => toggleStopSell(day.date, activeRoomType, selectedOTA === 'ALL' ? null : selectedOTA)}
                          className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-[10px] sm:text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          S
                        </button>
                      </Tooltip>
                    )}
                    {isCTA && (
                      <Tooltip content="Closed to Arrival - No check-ins" side="top">
                        <span className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-[10px] sm:text-xs font-semibold bg-gold-100 text-gold-700 border border-gold-200/60 shadow-sm">
                          A
                        </span>
                      </Tooltip>
                    )}
                    {isCTD && (
                      <Tooltip content="Closed to Departure - No check-outs" side="top">
                        <span className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-[10px] sm:text-xs font-semibold bg-sage-100 text-sage-700 border border-sage-200/60 shadow-sm">
                          D
                        </span>
                      </Tooltip>
                    )}
                    {!hasRestrictions && (
                      <button
                        onClick={() => toggleStopSell(day.date, activeRoomType, selectedOTA === 'ALL' ? null : selectedOTA)}
                        className="text-[10px] sm:text-xs text-neutral-300 hover:text-neutral-400 transition-colors duration-200"
                      >
                        —
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend - matches AvailabilityCalendar */}
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
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-sage-100 flex items-center justify-center">
              <span className="text-[9px] sm:text-[10px] font-semibold text-sage-700">D</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-600 hidden sm:inline">CTD</span>
          </div>
          <div className="h-4 w-px bg-neutral-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gold-50 flex items-center justify-center border border-gold-200">
              <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-600" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-600 hidden sm:inline">Parity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
