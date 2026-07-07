/**
 * CBS Calendar Page
 * 30-day availability calendar with inline editing - Glimmora Design System v5.0
 * Enhanced with refined editorial luxury aesthetic
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCBS } from '../../../context/CBSContext';
import { useToast } from '../../../contexts/ToastContext';
import useCMSAvailability from '../../../state/cms/useCMSAvailability';
import AvailabilityCalendar from '../../../components/cbs/AvailabilityCalendar';
import { ConfirmModal } from '../../../components/ui2/Modal';
import { Button } from '../../../components/ui2/Button';
import { MinStayConfigModal } from '../../../components/availability/MinStayConfigModal';
import { BulkUpdateDrawer } from '../../../components/availability/BulkUpdateDrawer';
import { StopSellConfigModal } from '../../../components/availability/StopSellConfigModal';
import { cn } from '../../../lib/utils';
import { useBookingsSSE } from '../../../hooks/useBookingsSSE';
import { useChannelManagerSSEEvents } from '../../../hooks/useChannelManagerSSEEvents';
import {
  Calendar, Download, TrendingUp, Percent, Home, CalendarX, Lock,
  AlertTriangle, Ban, Sparkles, LogIn, LogOut, ChevronRight,
  ChevronDown, ChevronUp, RefreshCw, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

export default function CBSCalendar() {
  const navigate = useNavigate();
  const { availability: cbsAvailability, updateAvailability, getCalendarData, bookings, refreshBookings } = useCBS();
  const cmsAvailability = useCMSAvailability();
  const { success, error: showError } = useToast();
  const calendarRef = useRef(null);
  const calendarSectionRef = useRef<HTMLElement>(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'primary'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);
  const [isMinStayModalOpen, setIsMinStayModalOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [isStopSellModalOpen, setIsStopSellModalOpen] = useState(false);

  const dates = useMemo(() => getCalendarData(30), [getCalendarData]);

  // Transform CMS availability data to the format expected by AvailabilityCalendar
  const availability = useMemo(() => {
    const result = {};
    const cmsData = cmsAvailability.availabilityData || {};

    Object.keys(cmsData).forEach(date => {
      result[date] = {};
      Object.keys(cmsData[date]).forEach(roomType => {
        const data = cmsData[date][roomType];
        result[date][roomType] = {
          available: data.remaining || 0,
          totalInventory: data.totalRooms || 0,
          rate: data.baseRate || 0,
          minStay: data.restrictions?.minStay || 1,
          stopSell: data.isClosed || false,
          cta: data.restrictions?.CTA || false,
          ctd: data.restrictions?.CTD || false,
          sold: (data.sold || 0) + (data.reserved || 0),
          notes: ''
        };
      });
    });

    return result;
  }, [cmsAvailability.availabilityData]);

  // Get room types from API data
  const roomTypes = useMemo(() => {
    return cmsAvailability.roomTypes?.map(rt => rt.name) || [];
  }, [cmsAvailability.roomTypes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calendarRef.current?.scrollToToday();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

// SSE Integration for real-time updates
  useBookingsSSE({
    onBookingCreated: (bookingData) => {
      console.log('[CBS Calendar] New booking received via SSE, refreshing calendar:', bookingData);
      if (refreshBookings) {
        refreshBookings();
      }
    },
    onBookingModified: (bookingId, changes) => {
      console.log('[CBS Calendar] Booking modified via SSE, refreshing calendar:', bookingId, changes);
      if (refreshBookings) {
        refreshBookings();
      }
    },
    onBookingCancelled: (bookingId) => {
      console.log('[CBS Calendar] Booking cancelled via SSE, refreshing calendar:', bookingId);
      if (refreshBookings) {
        refreshBookings();
      }
    },
    refetchBookings: refreshBookings,
  });

  // SSE Integration for availability and restrictions updates
  useChannelManagerSSEEvents({
    onAvailabilityUpdated: () => {
      console.log('[CBS Calendar] Availability updated via SSE, refreshing calendar');
      // Refresh bookings as availability changes may affect booking display
      if (refreshBookings) {
        refreshBookings();
      }
    },
    onRestrictionsUpdated: () => {
      console.log('[CBS Calendar] Restrictions updated via SSE, refreshing calendar');
      // Refresh bookings as restriction changes may affect booking display
      if (refreshBookings) {
        refreshBookings();
      }
    },
    refetchData: refreshBookings,
  });

  // Helper: Convert local date to YYYY-MM-DD string (avoids UTC timezone shift from toISOString)
  const toLocalDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Helper: Get room type ID by name
  const getRoomTypeId = (name: string): number | null => {
    const rt = cmsAvailability.roomTypes?.find(r => r.name === name);
    return rt?.id ?? null;
  };

  // Helper: Generate date strings between start and end (inclusive, timezone-safe)
  const generateDateRange = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    const current = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');
    while (current <= end) {
      dates.push(toLocalDateStr(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Export availability data as CSV
  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const sortedDates = Object.keys(availability).sort();
      if (sortedDates.length === 0 || roomTypes.length === 0) {
        showError('No availability data to export');
        return;
      }

      // Build CSV header
      const headers = ['Date', 'Day', 'Room Type', 'Available', 'Total Inventory', 'Sold', 'Rate ($)', 'Min Stay', 'Stop Sell', 'CTA', 'CTD'];
      const rows: string[] = [headers.join(',')];

      // Build CSV rows
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (const date of sortedDates) {
        const dayName = dayNames[new Date(date + 'T12:00:00').getDay()];
        for (const rt of roomTypes) {
          const cell = availability[date]?.[rt];
          if (!cell) continue;
          rows.push([
            date,
            dayName,
            `"${rt}"`,
            cell.available,
            cell.totalInventory,
            cell.sold || 0,
            cell.rate || 0,
            cell.minStay || 1,
            cell.stopSell ? 'Yes' : 'No',
            cell.cta ? 'Yes' : 'No',
            cell.ctd ? 'Yes' : 'No',
          ].join(','));
        }
      }

      // Download
      const csv = rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `availability-export-${toLocalDateStr(new Date())}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      success(`Exported ${rows.length - 1} records for ${roomTypes.length} room types`);
    } catch (err) {
      console.error('Export failed:', err);
      showError('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateAvailability = async (date, roomType, updates) => {
    try {
      // Transform updates back to CMS format
      const cmsUpdates = {
        isClosed: updates.stopSell,
        baseRate: updates.rate,
        restrictions: {
          minStay: updates.minStay,
          CTA: updates.cta,
          CTD: updates.ctd
        }
      };
      await cmsAvailability.updateAvailability(date, roomType, cmsUpdates);
      success('Availability updated successfully');
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  // Handler for applying min stay restrictions from modal — BATCH (single API call)
  const handleApplyMinStay = async ({ startDate, endDate, roomConfigs }) => {
    const updates: any[] = [];
    for (const { roomType, minStay } of roomConfigs) {
      const rtId = getRoomTypeId(roomType);
      if (!rtId) {
        console.warn(`[MinStay] Could not find room type ID for: "${roomType}"`);
        continue;
      }
      updates.push({
        room_type_id: rtId,
        start_date: startDate,
        end_date: endDate,
        min_stay: minStay,
      });
    }
    if (updates.length === 0) {
      showError('No valid room types found to update. Please try again.');
      setIsMinStayModalOpen(false);
      return;
    }
    try {
      await cmsAvailability.batchUpdate(updates);
      const dayCount = generateDateRange(startDate, endDate).length;
      success(`Minimum stay updated for ${updates.length} room types across ${dayCount} days`);
    } catch (err) {
      console.error('Error applying min stay:', err);
      showError('Failed to apply minimum stay changes. Please try again.');
    }
    setIsMinStayModalOpen(false);
  };

  // Helper: Get weekend dates for next 30 days (uses local dates to avoid UTC shift)
  const getWeekendDates = () => {
    const weekendDates: string[] = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      if (date.getDay() === 0 || date.getDay() === 6) {
        weekendDates.push(toLocalDateStr(date));
      }
    }
    return weekendDates;
  };

  // Handler: Close Weekends to Arrival (CTA) — BATCH
  const handleCloseWeekends = async () => {
    const weekendDates = getWeekendDates();
    const updates: any[] = [];
    for (const rtName of roomTypes) {
      const rtId = getRoomTypeId(rtName);
      if (!rtId) continue;
      for (const date of weekendDates) {
        updates.push({
          room_type_id: rtId,
          start_date: date,
          end_date: date,
          closed_to_arrival: true,
        });
      }
    }
    try {
      await cmsAvailability.batchUpdate(updates);
      success(`Closed ${weekendDates.length} weekend days to arrival for all room types`);
    } catch (error) {
      console.error('Error closing weekends:', error);
    }
  };

  // Handler: Apply Weekend +15% Rate — BATCH
  const handleWeekendPremium = async () => {
    const weekendDates = getWeekendDates();
    const updates: any[] = [];
    for (const rtName of roomTypes) {
      const rtId = getRoomTypeId(rtName);
      if (!rtId) continue;
      for (const date of weekendDates) {
        const currentRate = availability[date]?.[rtName]?.rate || 200;
        updates.push({
          room_type_id: rtId,
          start_date: date,
          end_date: date,
          base_rate: Math.round(currentRate * 1.15),
        });
      }
    }
    try {
      await cmsAvailability.batchUpdate(updates);
      success(`Applied 15% weekend premium to ${weekendDates.length} days for all room types`);
    } catch (error) {
      console.error('Error applying weekend premium:', error);
    }
  };

  // Handler: Stop Sell (selective via modal) — BATCH (one entry per room type using date range)
  const handleStopSell = async ({ startDate, endDate, roomTypes: selectedRoomTypes, action }: {
    startDate: string;
    endDate: string;
    roomTypes: string[];
    action: 'enable' | 'disable';
  }) => {
    const updates: any[] = [];
    for (const rtName of selectedRoomTypes) {
      const rtId = getRoomTypeId(rtName);
      if (!rtId) continue;
      updates.push({
        room_type_id: rtId,
        start_date: startDate,
        end_date: endDate,
        is_closed: action === 'enable',
      });
    }
    try {
      await cmsAvailability.batchUpdate(updates);
      const dayCount = generateDateRange(startDate, endDate).length;
      const verb = action === 'enable' ? 'applied' : 'removed';
      success(`Stop sell ${verb} for ${selectedRoomTypes.length} room types across ${dayCount} days`);
    } catch (error) {
      console.error('Error applying stop sell:', error);
    }
    setIsStopSellModalOpen(false);
  };

  // Handler: Bulk Update — BATCH (fixes case mismatch: drawer sends cta/ctd/stopSell lowercase)
  const handleBulkUpdate = async ({ startDate, endDate, roomTypes: selectedRoomTypes, updates }) => {
    const datesToUpdate = generateDateRange(startDate, endDate);
    const batchUpdates: any[] = [];

    for (const rtName of selectedRoomTypes) {
      const rtId = getRoomTypeId(rtName);
      if (!rtId) continue;

      // If rate type is relative (adjust/percent), need per-date current rate lookup
      if (updates.rate && updates.rate.type !== 'fixed') {
        for (const date of datesToUpdate) {
          const currentData = availability[date]?.[rtName] || {};
          const currentRate = currentData.rate || 200;
          const entry: any = { room_type_id: rtId, start_date: date, end_date: date };

          if (updates.rate.type === 'adjust') {
            entry.base_rate = currentRate + updates.rate.value;
          } else if (updates.rate.type === 'percent') {
            entry.base_rate = Math.round(currentRate * (1 + updates.rate.value / 100));
          }
          // Map restriction fields (lowercase from drawer → backend field names)
          if (updates.restrictions) {
            if (updates.restrictions.minStay) entry.min_stay = updates.restrictions.minStay;
            if (updates.restrictions.maxStay) entry.max_stay = updates.restrictions.maxStay;
            if (updates.restrictions.cta) entry.closed_to_arrival = true;
            if (updates.restrictions.ctd) entry.closed_to_departure = true;
            if (updates.restrictions.stopSell) entry.is_closed = true;
          }
          batchUpdates.push(entry);
        }
      } else {
        // Fixed rate or no rate — use date range (single entry per room type)
        const entry: any = { room_type_id: rtId, start_date: startDate, end_date: endDate };
        let hasFields = false;

        if (updates.rate && updates.rate.type === 'fixed') {
          entry.base_rate = updates.rate.value;
          hasFields = true;
        }
        if (updates.restrictions) {
          if (updates.restrictions.minStay) { entry.min_stay = updates.restrictions.minStay; hasFields = true; }
          if (updates.restrictions.maxStay) { entry.max_stay = updates.restrictions.maxStay; hasFields = true; }
          if (updates.restrictions.cta) { entry.closed_to_arrival = true; hasFields = true; }
          if (updates.restrictions.ctd) { entry.closed_to_departure = true; hasFields = true; }
          if (updates.restrictions.stopSell) { entry.is_closed = true; hasFields = true; }
        }
        if (hasFields) batchUpdates.push(entry);
      }
    }

    try {
      await cmsAvailability.batchUpdate(batchUpdates);
      const updateTypes: string[] = [];
      if (updates.rate) updateTypes.push('rates');
      if (updates.inventory !== undefined) updateTypes.push('inventory');
      if (updates.restrictions) updateTypes.push('restrictions');
      success(`Bulk update applied: ${updateTypes.join(', ')} updated for ${selectedRoomTypes.length} room types across ${datesToUpdate.length} days`);
    } catch (error) {
      console.error('Error applying bulk update:', error);
    }
    setIsBulkUpdateOpen(false);
  };

  const stats = useMemo(() => {
    let totalAvailable = 0;
    let totalInventory = 0;
    let soldOutDays = 0;
    let restrictedDays = 0;

    dates.forEach(dateInfo => {
      roomTypes.forEach(roomType => {
        const cell = availability[dateInfo.date]?.[roomType];
        if (cell) {
          totalAvailable += cell.available;
          totalInventory += cell.totalInventory;
          if (cell.available === 0) soldOutDays++;
          if (cell.stopSell || cell.cta || cell.ctd) restrictedDays++;
        }
      });
    });

    const occupancyRate = totalInventory > 0
      ? Math.round(((totalInventory - totalAvailable) / totalInventory) * 100)
      : 0;

    return { totalAvailable, totalInventory, occupancyRate, soldOutDays, restrictedDays };
  }, [availability, dates, roomTypes]);

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const arrivals = bookings.filter(b => b.checkIn === today && b.status !== 'CANCELLED').length;
    const departures = bookings.filter(b => b.checkOut === today && b.status !== 'CANCELLED').length;
    // In-house guests: bookings where today is between checkIn and checkOut
    const inHouseGuests = bookings.filter(b => {
      if (b.status === 'CANCELLED') return false;
      return b.checkIn <= today && b.checkOut > today;
    }).length;
    // Turnovers: rooms with both checkout and checkin today
    const turnovers = Math.min(arrivals, departures);
    return { arrivals, departures, inHouseGuests, turnovers };
  }, [bookings]);

  // KPI cards configuration — clickable for quick navigation
  const scrollToCalendar = () => calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const kpiCards = [
    {
      icon: Percent,
      title: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      change: '+12%',
      changeType: 'positive',
      subtitle: 'vs last month',
      accent: 'terra',
      onClick: scrollToCalendar
    },
    {
      icon: Home,
      title: 'Available Rooms',
      value: stats.totalAvailable,
      subtitle: `of ${stats.totalInventory} inventory`,
      accent: 'ocean',
      onClick: scrollToCalendar
    },
    {
      icon: CalendarX,
      title: 'Sold Out Days',
      value: stats.soldOutDays,
      change: stats.soldOutDays > 10 ? 'High demand' : stats.soldOutDays > 5 ? 'Moderate' : 'Low',
      changeType: stats.soldOutDays > 10 ? 'negative' : 'neutral',
      accent: 'gold',
      onClick: scrollToCalendar
    },
    {
      icon: Lock,
      title: 'Active Restrictions',
      value: stats.restrictedDays,
      change: stats.restrictedDays > 20 ? 'Review needed' : 'Normal',
      changeType: stats.restrictedDays > 20 ? 'negative' : 'neutral',
      accent: 'sage',
      onClick: () => navigate('/admin/channel-manager/restrictions')
    }
  ];

  // Quick actions configuration
  const quickActions = [
    {
      icon: Ban,
      title: 'Close Weekends',
      description: 'Block weekend arrivals',
      accent: 'terra',
      onClick: () => setConfirmDialog({
        isOpen: true,
        title: 'Close Weekends to Arrival',
        message: 'This will prevent check-ins on all Saturdays and Sundays for the next 30 days. This applies CTA (Closed to Arrival) restriction to all room types.',
        variant: 'warning',
        onConfirm: handleCloseWeekends
      })
    },
    {
      icon: TrendingUp,
      title: 'Weekend +15%',
      description: 'Apply premium pricing',
      accent: 'ocean',
      onClick: () => setConfirmDialog({
        isOpen: true,
        title: 'Apply Weekend Rate',
        message: 'This will increase rates by 15% for all weekends (Saturdays and Sundays) in the next 30 days for all room types.',
        variant: 'primary',
        onConfirm: handleWeekendPremium
      })
    },
    {
      icon: Calendar,
      title: 'Min 2-Night',
      description: 'Set length restriction',
      accent: 'gold',
      onClick: () => setIsMinStayModalOpen(true)
    },
    {
      icon: AlertTriangle,
      title: 'Stop Sell',
      description: 'Selective date control',
      accent: 'rose',
      onClick: () => setIsStopSellModalOpen(true)
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6">

        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Availability
            </h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              Manage rates, inventory, and restrictions
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              icon={isExporting ? RefreshCw : Download}
              onClick={handleExport}
              disabled={isExporting}
              className={cn("text-[12px] sm:text-[13px]", isExporting && "opacity-60 cursor-not-allowed")}
            >
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
              <span className="sm:hidden sr-only">Export</span>
            </Button>
            <Button
              variant="primary"
              icon={RefreshCw}
              onClick={() => setIsBulkUpdateOpen(true)}
            >
              <span className="hidden sm:inline">Bulk Update</span>
              <span className="sm:hidden">Update</span>
            </Button>
          </div>
        </header>

        {/* KPI Cards - Matching Dashboard Design */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          {kpiCards.map((kpi, index) => {
            const isPositive = kpi.changeType === 'positive';
            return (
              <div
                key={index}
                onClick={kpi.onClick}
                className="rounded-[10px] bg-white p-4 sm:p-6 cursor-pointer hover:shadow-md transition-all"
              >
                {/* Header with Icon */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center",
                    kpi.accent === 'terra' && 'bg-terra-50',
                    kpi.accent === 'sage' && 'bg-sage-50',
                    kpi.accent === 'gold' && 'bg-gold-50',
                    kpi.accent === 'ocean' && 'bg-ocean-50'
                  )}>
                    <kpi.icon className={cn(
                      "w-3.5 h-3.5 sm:w-4 sm:h-4",
                      kpi.accent === 'terra' && 'text-terra-600',
                      kpi.accent === 'sage' && 'text-sage-600',
                      kpi.accent === 'gold' && 'text-gold-600',
                      kpi.accent === 'ocean' && 'text-ocean-600'
                    )} />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                    {kpi.title}
                  </p>
                </div>

                {/* Value */}
                <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 mb-1 sm:mb-2">
                  {kpi.value}
                </p>

                {/* Comparison */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium truncate">
                    {kpi.subtitle || 'vs Last Month'}
                  </p>
                  {kpi.change && (
                    <div className={cn(
                      'flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-semibold flex-shrink-0',
                      isPositive
                        ? 'text-sage-600'
                        : kpi.changeType === 'negative'
                          ? 'text-rose-600'
                          : 'text-neutral-500'
                    )}>
                      {isPositive && <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                      {kpi.changeType === 'negative' && <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                      <span className="hidden sm:inline">{kpi.change}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Today's Activity - Horizontal Stats Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          {/* Arrivals */}
          <div className="rounded-[10px] bg-white p-3 sm:p-5 flex items-center gap-2.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0">
              <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-sage-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-neutral-900 tracking-tight">
                {todayStats.arrivals}
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium uppercase tracking-wider truncate">
                <span className="hidden sm:inline">Arrivals Today</span>
                <span className="sm:hidden">Arrivals</span>
              </p>
            </div>
          </div>

          {/* Departures */}
          <div className="rounded-[10px] bg-white p-3 sm:p-5 flex items-center gap-2.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-ocean-100 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-ocean-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-neutral-900 tracking-tight">
                {todayStats.departures}
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium uppercase tracking-wider truncate">
                <span className="hidden sm:inline">Departures Today</span>
                <span className="sm:hidden">Departs</span>
              </p>
            </div>
          </div>

          {/* In-House Guests */}
          <div className="rounded-[10px] bg-white p-3 sm:p-5 flex items-center gap-2.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-terra-100 flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-terra-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-neutral-900 tracking-tight">
                {todayStats.inHouseGuests}
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium uppercase tracking-wider truncate">
                <span className="hidden sm:inline">In-House Guests</span>
                <span className="sm:hidden">In-House</span>
              </p>
            </div>
          </div>

          {/* Turnovers */}
          <div className="rounded-[10px] bg-white p-3 sm:p-5 flex items-center gap-2.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-gold-600" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-semibold text-neutral-900 tracking-tight">
                {todayStats.turnovers}
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium uppercase tracking-wider truncate">
                <span className="hidden sm:inline">Turnovers Today</span>
                <span className="sm:hidden">Turnovers</span>
              </p>
            </div>
          </div>
        </section>

        {/* AI Insights */}
        <section className="rounded-[10px] bg-white overflow-hidden mb-4 sm:mb-6">
          <button
            onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
            className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors"
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">
                  AI Revenue Insights
                </h3>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-lg text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider bg-gold-50 text-gold-600">
                  Smart
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
                Personalized recommendations
              </p>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-neutral-50 flex-shrink-0">
              {isInsightsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
              )}
            </div>
          </button>

          <div className={`transition-all duration-300 ease-out overflow-hidden ${
            isInsightsExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 space-y-2 sm:space-y-2.5 border-t border-neutral-100">
              {stats.occupancyRate > 80 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-sage-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-sage-700">High Demand Alert</p>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Consider increasing rates by 10-15% for optimal revenue capture
                    </p>
                  </div>
                </div>
              )}
              {stats.soldOutDays > 10 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gold-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-gold-700">Sold Out Analysis</p>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Multiple sold-out dates ahead - review overbooking strategy
                    </p>
                  </div>
                </div>
              )}
              {stats.occupancyRate < 50 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-rose-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-rose-600">Low Occupancy Warning</p>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Consider promotional rates or flash sales to boost bookings
                    </p>
                  </div>
                </div>
              )}
              {stats.occupancyRate >= 50 && stats.occupancyRate <= 80 && stats.soldOutDays <= 10 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-terra-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-terra-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold text-terra-600">Healthy Performance</p>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Booking pace is on track - maintain current pricing strategy
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">Quick Actions</h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              Bulk operations for inventory management
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {quickActions.map((action, index) => {
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="group flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-[10px] bg-white"
                >
                  <div className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    action.accent === 'terra' && 'bg-terra-50',
                    action.accent === 'ocean' && 'bg-ocean-50',
                    action.accent === 'gold' && 'bg-gold-50',
                    action.accent === 'rose' && 'bg-rose-50'
                  )}>
                    <action.icon className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5",
                      action.accent === 'terra' && 'text-terra-600',
                      action.accent === 'ocean' && 'text-ocean-600',
                      action.accent === 'gold' && 'text-gold-600',
                      action.accent === 'rose' && 'text-rose-600'
                    )} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[12px] sm:text-[13px] font-semibold text-neutral-800 mb-0.5 truncate">
                      {action.title}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium truncate hidden sm:block">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300 flex-shrink-0 hidden sm:block" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Calendar Grid */}
        <section ref={calendarSectionRef}>
          {cmsAvailability.isLoading ? (
            <div className="rounded-[10px] bg-white p-12 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-terra-500 animate-spin mb-4" />
              <p className="text-sm font-medium text-neutral-600">Loading availability data...</p>
            </div>
          ) : cmsAvailability.error ? (
            <div className="rounded-[10px] bg-rose-50 border border-rose-200 p-8 text-center">
              <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-rose-700 mb-2">Unable to Load Data</h3>
              <p className="text-sm text-rose-600 mb-4">{cmsAvailability.error}</p>
              <Button variant="outline" onClick={() => cmsAvailability.refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : roomTypes.length === 0 ? (
            <div className="rounded-[10px] bg-white p-12 text-center">
              <Home className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">No Room Types Found</h3>
              <p className="text-sm text-neutral-500 mb-4">
                Please add room types in the database to manage availability.
              </p>
              <Button variant="outline" onClick={() => cmsAvailability.refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <AvailabilityCalendar
              ref={calendarRef}
              availability={availability}
              dates={dates}
              roomTypes={roomTypes}
              onUpdateAvailability={handleUpdateAvailability}
            />
          )}
        </section>
      </main>

      {/* Confirm Dialog */}
      <ConfirmModal
        open={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        title={confirmDialog.title}
        description={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText="Apply"
        cancelText="Cancel"
      />

      {/* Min Stay Configuration Modal */}
      <MinStayConfigModal
        isOpen={isMinStayModalOpen}
        onClose={() => setIsMinStayModalOpen(false)}
        roomTypes={roomTypes}
        availability={availability}
        onApply={handleApplyMinStay}
      />

      {/* Bulk Update Drawer */}
      <BulkUpdateDrawer
        isOpen={isBulkUpdateOpen}
        onClose={() => setIsBulkUpdateOpen(false)}
        roomTypes={roomTypes}
        availability={availability}
        onApply={handleBulkUpdate}
      />

      {/* Stop Sell Configuration Modal */}
      <StopSellConfigModal
        isOpen={isStopSellModalOpen}
        onClose={() => setIsStopSellModalOpen(false)}
        roomTypes={roomTypes}
        availability={availability}
        onApply={handleStopSell}
      />
    </div>
  );
}
