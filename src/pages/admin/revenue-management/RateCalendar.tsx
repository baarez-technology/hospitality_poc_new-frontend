import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, RefreshCw, Download, Sparkles, TrendingUp, TrendingDown, Clock, AlertTriangle, IndianRupee, Users, CheckCircle, Edit3, Copy, ExternalLink, X, Loader2, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useRMS } from '../../../context/RMSContext';
import { useToast } from '../../../contexts/ToastContext';
import RateCalendarView from '../../../components/revenue-management/RateCalendarView';
import { RecommendationsPanel } from '../../../components/revenue-management/RecommendationCard';
import { Button } from '../../../components/ui2/Button';
import { DropdownMenu, DropdownMenuItem } from '../../../components/ui2/DropdownMenu';
import { useChannelManagerSSEEvents } from '../../../hooks/useChannelManagerSSEEvents';
import revenueIntelligenceService from '../../../api/services/revenue-intelligence.service';

// Local date to YYYY-MM-DD without UTC conversion
function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// KPI Card Component - Consistent with Design System
function KPICard({ title, value, trendValue, icon: Icon, accentColor = 'terra', subtitle, children }) {
  const isPositive = trendValue >= 0;

  const accentStyles = {
    terra: { bg: 'bg-terra-50', icon: 'text-terra-600' },
    sage: { bg: 'bg-sage-50', icon: 'text-sage-600' },
    gold: { bg: 'bg-gold-50', icon: 'text-gold-600' },
    ocean: { bg: 'bg-ocean-50', icon: 'text-ocean-600' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600' },
  };

  const style = accentStyles[accentColor] || accentStyles.terra;

  return (
    <div className="rounded-[10px] bg-white p-4 sm:p-6">
      {/* Header with Icon and Title */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${style.bg}`}>
          <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${style.icon}`} />
        </div>
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
          {title}
        </p>
      </div>

      {/* Value */}
      <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 mb-1.5 sm:mb-2">
        {value}
      </p>

      {/* Comparison */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">{subtitle || 'vs Last Week'}</p>
        {trendValue !== null && trendValue !== undefined ? (
          <div className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold ${
            isPositive ? 'text-sage-600' : 'text-rose-600'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            {isPositive ? '+' : ''}{trendValue}%
          </div>
        ) : children}
      </div>
    </div>
  );
}

const RateCalendar = () => {
  const toast = useToast();
  const location = useLocation();
  const {
    rateCalendar,
    roomTypes,
    runAllRules,
    lastRecalculation,
    recommendations,
    refreshRecommendations,
    refreshAll,
    bulkUpdateRates,
    isLoading,
    error,
    isSyncing,
  } = useRMS();

  const [selectedDate, setSelectedDate] = useState(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({ rateChange: '', changeType: 'amount' });
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);
  const [competitorSuggestion, setCompetitorSuggestion] = useState(null);

  // Handle navigation from Competitor Rates page
  useEffect(() => {
    if (location.state) {
      const { preselectedDate, suggestedRate, reason, currentRate, marketAvg, marketMin, marketMax } = location.state;

      if (preselectedDate) {
        setSelectedDate(preselectedDate);

        // Show suggestion banner
        if (suggestedRate || marketAvg) {
          setCompetitorSuggestion({
            date: preselectedDate,
            suggestedRate: suggestedRate || marketAvg,
            reason,
            currentRate,
            marketAvg,
            marketMin,
            marketMax,
          });
        }
      }

      // Clear navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // SSE Integration for real-time rates updates
  useChannelManagerSSEEvents({
    onRatesUpdated: () => {
      console.log('[Rate Calendar] 💰 Refreshing rates data due to SSE event');
      refreshAll?.();
      refreshRecommendations?.();
    },
    refetchData: () => {
      console.log('[Rate Calendar] 🔄 Refetching rates data due to SSE event');
      refreshAll?.();
      refreshRecommendations?.();
    },
  });

  const handleRecalculateAll = async () => {
    setIsRecalculating(true);
    toast.info('Recalculating rates...');
    try {
      await runAllRules();
      await refreshAll?.();
      toast.success('Rates recalculated successfully');
    } catch (error) {
      toast.error('Failed to recalculate rates');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const calendarEntries = Object.entries(rateCalendar || {});
      if (calendarEntries.length === 0) {
        toast.error('No data to export');
        setIsExporting(false);
        return;
      }

      if (format === 'pdf') {
        // Generate PDF using jsPDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 20;

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Rate Calendar Export', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        // Subtitle
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Summary Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('Summary (Next 7 Days)', 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryData = [
          ['Avg Occupancy:', `${avgOccupancy}%`],
          ['Avg BAR Rate:', `₹${avgRate}`],
          ['Revenue Forecast:', `₹${(totalRevenue / 1000).toFixed(1)}K`],
          ['Days with Restrictions:', `${restrictedDays}`],
          ['AI Suggestions:', `${recommendations.length}`],
        ];

        summaryData.forEach(([label, value]) => {
          doc.text(label, 14, yPos);
          doc.text(value, 80, yPos);
          yPos += 6;
        });
        yPos += 10;

        // Rate Calendar Data
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Daily Rates & Occupancy', 14, yPos);
        yPos += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Date', 14, yPos);
        doc.text('Occupancy', 50, yPos);
        doc.text('Rate', 85, yPos);
        doc.text('Available', 115, yPos);
        doc.text('Sold', 150, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        const today = toDateStr(new Date());
        const firstRoomTypeId = roomTypes.length > 0 ? roomTypes[0].id : 'STD';

        calendarEntries
          .filter(([date]) => date >= today)
          .slice(0, 30)
          .forEach(([date, data]) => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            const dateStr = new Date(date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            });
            const roomData = data.rooms?.[firstRoomTypeId];
            doc.text(dateStr, 14, yPos);
            doc.text(`${data.occupancy || 0}%`, 50, yPos);
            doc.text(`₹${roomData?.dynamicRate || 0}`, 85, yPos);
            doc.text(`${roomData?.available || 0}`, 115, yPos);
            doc.text(`${roomData?.sold || 0}`, 150, yPos);
            yPos += 5;
          });

        // Save PDF
        doc.save(`rate-calendar-${toDateStr(new Date())}.pdf`);
        toast.success('Rate calendar exported as PDF');
      } else {
        // CSV Export
        const csvData: (string | number)[][] = [];

        csvData.push(['Rate Calendar Export']);
        csvData.push(['Generated:', new Date().toLocaleString()]);
        csvData.push([]);

        csvData.push(['SUMMARY (Next 7 Days)']);
        csvData.push(['Avg Occupancy', `${avgOccupancy}%`]);
        csvData.push(['Avg BAR Rate', `₹${avgRate}`]);
        csvData.push(['Revenue Forecast', `₹${(totalRevenue / 1000).toFixed(1)}K`]);
        csvData.push(['Days with Restrictions', restrictedDays]);
        csvData.push(['AI Suggestions', recommendations.length]);
        csvData.push([]);

        csvData.push(['DAILY RATES & OCCUPANCY']);
        csvData.push(['Date', 'Occupancy %', 'Rate', 'Available', 'Sold']);

        const today = toDateStr(new Date());
        const firstRoomTypeId = roomTypes.length > 0 ? roomTypes[0].id : 'STD';

        calendarEntries
          .filter(([date]) => date >= today)
          .slice(0, 30)
          .forEach(([date, data]) => {
            const dateStr = new Date(date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            });
            const roomData = data.rooms?.[firstRoomTypeId];
            csvData.push([
              dateStr,
              `${data.occupancy || 0}%`,
              `₹${roomData?.dynamicRate || 0}`,
              roomData?.available || 0,
              roomData?.sold || 0
            ]);
          });

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rate-calendar-${toDateStr(new Date())}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Rate calendar exported as CSV');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export rate calendar');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleBulkEditMode = () => {
    setBulkEditMode(!bulkEditMode);
    setSelectedDates([]);
    if (bulkEditMode) {
      toast.info('Bulk edit mode disabled');
    } else {
      toast.info('Select dates to apply bulk changes');
    }
  };

  const handleDateSelection = (date) => {
    if (!bulkEditMode) return;

    setSelectedDates(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };

  const handleBulkEdit = () => {
    if (selectedDates.length === 0) {
      toast.warning('Please select at least one date');
      return;
    }
    setShowBulkEditModal(true);
  };

  const applyBulkChanges = async () => {
    const { rateChange, changeType } = bulkEditData;
    if (!rateChange || rateChange === '') {
      toast.warning('Please enter a rate change amount');
      return;
    }

    const changeNum = Number(rateChange);
    if (Number.isNaN(changeNum)) {
      toast.warning('Please enter a valid number');
      return;
    }

    const computeNewRate = (currentRate) => {
      if (changeType === 'amount') {
        // Fixed-amount mode: add the entered value to the current rate.
        // Positive → increase, negative → decrease.
        return Math.max(0, Math.round(currentRate + changeNum));
      }
      // Percentage mode: scale current rate by ± percentage.
      return Math.max(0, Math.round(currentRate * (1 + changeNum / 100)));
    };

    // Build updates from context rateCalendar; use room_type_id (dbId) for API
    let updates: Array<{ roomTypeId: string; room_type_id: number; date: string; rate: number }> = [];
    const calendar = rateCalendar || {};
    const selectedSet = new Set(selectedDates);
    for (const date of selectedDates) {
      const dayData = calendar[date];
      if (!dayData?.rooms) continue;
      for (const roomTypeId of Object.keys(dayData.rooms)) {
        const room = dayData.rooms[roomTypeId];
        const currentRate = room?.dynamicRate ?? room?.overrideRate ?? room?.rates?.BAR ?? 0;
        const dbId = roomTypes.find((r) => r.id === roomTypeId || String(r.dbId) === roomTypeId)?.dbId ?? parseInt(roomTypeId, 10);
        if (Number.isNaN(dbId)) continue;
        updates.push({ roomTypeId, room_type_id: dbId, date, rate: computeNewRate(currentRate) });
      }
    }

    // If context has no data for selected dates, fetch calendar for that range and build updates
    if (updates.length === 0 && selectedDates.length > 0) {
      const startDate = selectedDates.reduce((a, b) => (a < b ? a : b));
      const endDate = selectedDates.reduce((a, b) => (a > b ? a : b));
      try {
        const calendarData = await revenueIntelligenceService.getRateCalendar(startDate, endDate);
        if (calendarData?.days) {
          for (const day of calendarData.days) {
            if (!selectedSet.has(day.date)) continue;
            if (day.rooms && typeof day.rooms === 'object') {
              for (const [roomTypeId, room] of Object.entries(day.rooms)) {
                const currentRate = room?.dynamicRate ?? room?.baseRate ?? 0;
                const dbId = typeof (room as any).roomTypeId === 'number' ? (room as any).roomTypeId : parseInt(String(roomTypeId), 10);
                if (Number.isNaN(dbId)) continue;
                updates.push({ roomTypeId, room_type_id: dbId, date: day.date, rate: computeNewRate(currentRate) });
              }
            }
          }
        }
      } catch (fetchErr) {
        console.error('Failed to fetch calendar for bulk update:', fetchErr);
      }
    }

    if (updates.length === 0) {
      toast.warning('No rates to update for the selected dates. Ensure calendar data is loaded.');
      return;
    }

    const amountNum = Number(rateChange);
    toast.info(
      changeType === 'amount'
        ? `${amountNum >= 0 ? 'Adding' : 'Subtracting'} ₹${Math.abs(amountNum)} ${amountNum >= 0 ? 'to' : 'from'} ${selectedDates.length} date${selectedDates.length !== 1 ? 's' : ''}...`
        : `Applying ${rateChange}% change to ${selectedDates.length} date${selectedDates.length !== 1 ? 's' : ''}...`
    );
    setIsApplyingBulk(true);
    try {
      const { updated_count, failed_count } = await bulkUpdateRates(updates);
      if (failed_count > 0) {
        toast.warning(`Updated ${updated_count} rates; ${failed_count} failed.`);
      } else {
        toast.success(`Successfully updated ${updated_count} rate${updated_count !== 1 ? 's' : ''}`);
      }
      setShowBulkEditModal(false);
      setBulkEditMode(false);
      setSelectedDates([]);
      setBulkEditData({ rateChange: '', changeType: 'amount' });
    } catch (err: any) {
      console.error('Bulk rate update failed:', err);
      const message = err?.response?.data?.detail ?? err?.message ?? 'Failed to save rate updates. Please try again.';
      toast.error(typeof message === 'string' ? message : 'Failed to save rate updates. Please try again.');
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const selectDateRange = (startDate, endDate) => {
    const dates = Object.keys(rateCalendar).filter(date => date >= startDate && date <= endDate);
    setSelectedDates(dates);
    toast.success(`Selected ${dates.length} dates from ${startDate} to ${endDate}`);
  };

  // Calculate summary stats - handle empty data gracefully
  const today = toDateStr(new Date());
  const calendarEntries = Object.entries(rateCalendar || {});
  const hasCalendarData = calendarEntries.length > 0;

  const next7Days = calendarEntries
    .filter(([date]) => date >= today)
    .slice(0, 7);

  const next30Days = calendarEntries
    .filter(([date]) => date >= today)
    .slice(0, 30);

  const avgOccupancy = next7Days.length > 0
    ? Math.round(next7Days.reduce((sum, [, data]) => sum + (data.occupancy || 0), 0) / next7Days.length)
    : 0;

  // Get first room type to display average rate
  const firstRoomTypeId = roomTypes.length > 0 ? roomTypes[0].id : 'STD';
  const avgRate = next7Days.length > 0
    ? Math.round(next7Days.reduce((sum, [, data]) => sum + (data.rooms?.[firstRoomTypeId]?.dynamicRate || 0), 0) / next7Days.length)
    : 0;

  const restrictedDays = next7Days.filter(([, data]) =>
    Object.values(data.rooms || {}).some(r => r.restrictions?.stopSell || r.restrictions?.CTA)
  ).length;

  const totalRevenue = Math.round(
    next7Days.reduce((sum, [, data]) => {
      const dayRevenue = Object.values(data.rooms || {}).reduce((rSum: number, room: any) => {
        return rSum + (room.dynamicRate || 0) * (room.sold || 0);
      }, 0);
      return sum + dayRevenue;
    }, 0)
  );

  const criticalRecommendations = recommendations.filter(r => r.priority === 'critical').length;

  // Calculate occupancy trend
  const prevWeekData = calendarEntries
    .filter(([date]) => date >= today)
    .slice(7, 14);
  const prevWeekOccupancy = prevWeekData.length > 0
    ? Math.round(prevWeekData.reduce((sum, [, data]) => sum + (data.occupancy || 0), 0) / prevWeekData.length)
    : 0;
  const occupancyChange = avgOccupancy - prevWeekOccupancy;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-terra-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-800">Loading Rate Calendar</h2>
          <p className="text-sm text-neutral-500 mt-1">Fetching data from the server...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !hasCalendarData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-800">Failed to Load Rate Calendar</h2>
          <p className="text-sm text-neutral-500 mt-1 mb-4">{error}</p>
          <Button variant="primary" icon={RefreshCw} onClick={refreshAll}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="rounded-[10px] border border-rose-200 bg-rose-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <p className="text-sm text-rose-800">{error}</p>
            </div>
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={refreshAll}>
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!hasCalendarData && !isLoading && (
          <div className="rounded-[10px] border border-neutral-200 bg-white p-8 text-center">
            <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Rate Data Available</h3>
            <p className="text-sm text-neutral-500 mb-4">
              The rate calendar is currently empty. This could be because no room types are configured or the API is unavailable.
            </p>
            <Button variant="primary" icon={RefreshCw} onClick={refreshAll}>
              Refresh Data
            </Button>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Rate Calendar
              {isSyncing && <Loader2 className="w-5 h-5 animate-spin text-terra-500 inline-block ml-2" />}
            </h1>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5 sm:mt-1">
              <span className="hidden sm:inline">Manage rates, availability, and restrictions • Updated </span>
              <span className="sm:hidden">Updated </span>
              {new Date(lastRecalculation).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {bulkEditMode && selectedDates.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-terra-50 border border-terra-200">
                  <span className="text-xs sm:text-[13px] font-medium text-terra-700">
                    {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <Button
                  variant="success"
                  icon={Edit3}
                  onClick={handleBulkEdit}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Apply Changes</span>
                  <span className="sm:hidden">Apply</span>
                </Button>
              </>
            )}

            <Button
              variant={bulkEditMode ? 'warning' : 'outline'}
              icon={Copy}
              onClick={toggleBulkEditMode}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">{bulkEditMode ? 'Cancel Bulk Edit' : 'Bulk Edit'}</span>
              <span className="sm:hidden">{bulkEditMode ? 'Cancel' : 'Bulk'}</span>
            </Button>

            {!bulkEditMode && (
              <>
                {isExporting ? (
                  <Button
                    variant="outline"
                    icon={Download}
                    disabled
                    loading
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Exporting...</span>
                    <span className="sm:hidden">...</span>
                  </Button>
                ) : (
                  <DropdownMenu
                    trigger={
                      <Button
                        variant="outline"
                        icon={Download}
                        className="text-xs sm:text-sm"
                      >
                        Export
                      </Button>
                    }
                    align="end"
                  >
                    <DropdownMenuItem
                      icon={FileText}
                      onSelect={() => handleExport('pdf')}
                    >
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      icon={Download}
                      onSelect={() => handleExport('csv')}
                    >
                      Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenu>
                )}

                <Button
                  variant="primary"
                  icon={RefreshCw}
                  onClick={handleRecalculateAll}
                  disabled={isRecalculating}
                  loading={isRecalculating}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">{isRecalculating ? 'Recalculating...' : 'Run All Rules'}</span>
                  <span className="sm:hidden">{isRecalculating ? 'Running...' : 'Run Rules'}</span>
                </Button>
              </>
            )}
          </div>
        </header>

        {/* KPI Cards */}
        {/* Mobile: 1 col, sm: 2 col, xl: 5 col (iPad Pro with sidebar gets 2-col) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4">
          <KPICard
            title="Avg Occupancy"
            value={`${avgOccupancy}%`}
            trendValue={occupancyChange}
            icon={Users}
            accentColor="terra"
            subtitle="Next 7 days"
          />

          <KPICard
            title="Avg BAR Rate"
            value={`₹${avgRate}`}
            trendValue={null}
            icon={IndianRupee}
            accentColor="sage"
            subtitle="Standard room"
          />

          <KPICard
            title="Revenue Forecast"
            value={`₹${(totalRevenue / 1000).toFixed(1)}K`}
            trendValue={null}
            icon={TrendingUp}
            accentColor="ocean"
            subtitle="Next 7 days"
          />

          <KPICard
            title="Restrictions"
            value={restrictedDays}
            trendValue={null}
            icon={restrictedDays > 0 ? AlertTriangle : CheckCircle}
            accentColor={restrictedDays > 0 ? 'rose' : 'sage'}
            subtitle={restrictedDays === 1 ? 'Day affected' : 'Days affected'}
          />

          <KPICard
            title="AI Suggestions"
            value={recommendations.length}
            trendValue={null}
            icon={Sparkles}
            accentColor="gold"
            subtitle={criticalRecommendations ? `${criticalRecommendations} critical` : 'All reviewed'}
          />
        </section>

        {/* Competitor Suggestion Banner */}
        {competitorSuggestion && (
          <div className="rounded-[10px] border p-4 sm:p-5 bg-gradient-to-r from-terra-50 to-gold-50 border-terra-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-terra-100 flex-shrink-0">
                  <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-terra-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-[15px] font-semibold text-neutral-800">
                      <span className="hidden sm:inline">Competitor Analysis Suggestion</span>
                      <span className="sm:hidden">Market Suggestion</span>
                    </h3>
                    <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-full bg-gold-100 text-gold-700">
                      {new Date(competitorSuggestion.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-[12px] text-neutral-600 mt-1">
                    {competitorSuggestion.reason || 'Recommended rate adjustment based on market analysis'}
                  </p>

                  {competitorSuggestion.marketAvg && (
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-3">
                      <div>
                        <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">Your Rate</p>
                        <p className="text-lg sm:text-xl font-bold text-neutral-800">
                          ₹{competitorSuggestion.currentRate}
                        </p>
                      </div>
                      <div className="text-xl sm:text-2xl text-neutral-300 hidden sm:block">→</div>
                      <div>
                        <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">Suggested</p>
                        <p className="text-lg sm:text-xl font-bold text-terra-600">
                          ₹{competitorSuggestion.suggestedRate}
                        </p>
                      </div>
                      <div className="sm:pl-4 sm:border-l border-neutral-200">
                        <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">Market Avg</p>
                        <p className="text-base sm:text-lg font-semibold text-neutral-700">
                          ₹{competitorSuggestion.marketAvg}
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[11px] text-neutral-500 font-medium">Market Range</p>
                        <p className="text-[13px] font-medium text-neutral-600">
                          ₹{competitorSuggestion.marketMin} - ₹{competitorSuggestion.marketMax}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCompetitorSuggestion(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bulk Edit Mode Banner - Top */}
        {bulkEditMode && (
          <div className="p-3 sm:p-4 rounded-[10px] border-2 border-terra-400 bg-terra-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-terra-500 flex items-center justify-center flex-shrink-0">
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-[14px] font-semibold text-neutral-900">
                    Bulk Edit Mode Active
                  </p>
                  <p className="text-[11px] sm:text-[12px] text-neutral-600">
                    <span className="hidden sm:inline">Click calendar dates to select them for bulk editing</span>
                    <span className="sm:hidden">Tap dates to select</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-terra-500 text-white text-xs sm:text-[13px] font-semibold">
                  {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                </div>
                <Button
                  variant="outline"
                  onClick={toggleBulkEditMode}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Exit Bulk Edit</span>
                  <span className="sm:hidden">Exit</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar - Full Width */}
        <div className={bulkEditMode ? 'ring-2 ring-terra-400 ring-offset-4 rounded-[10px]' : ''}>
          <RateCalendarView
            onDateSelect={bulkEditMode ? handleDateSelection : setSelectedDate}
            bulkEditMode={bulkEditMode}
            selectedDates={selectedDates}
          />
        </div>

        {/* AI Recommendations - Full Width */}
        <section data-recommendations-panel className="rounded-[10px] bg-white overflow-hidden scroll-mt-4">
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">AI Recommendations</h3>
                {criticalRecommendations > 0 && (
                  <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase rounded bg-rose-100 text-rose-700">
                    {criticalRecommendations} Critical
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Automated pricing insights</p>
            </div>
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <RecommendationsPanel
              limit={4}
              recommendations={recommendations.map(r => ({
                id: `${r.room_type_id}_${r.date}`,
                type: r.change_percent >= 0 ? 'rate_increase' as const : 'rate_decrease' as const,
                priority: r.priority,
                date: r.date,
                title: `${r.room_type_name} - ${r.change_percent >= 0 ? '+' : ''}${r.change_percent.toFixed(0)}%`,
                message: r.reasoning,
                potentialRevenue: Math.abs(r.recommended_rate - r.current_rate),
                roomTypeId: r.room_type_id,
                currentRate: r.current_rate,
                suggestedRate: r.recommended_rate,
              }))}
              onRefresh={refreshRecommendations}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Room Type Summary - Full Width */}
        <section className="rounded-[10px] bg-white overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Room Types Today</h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Current rates & availability</p>
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3">
              {roomTypes.map((room, index) => {
                const todayData = rateCalendar[today]?.rooms?.[room.id];
                const rate = todayData?.dynamicRate || room.baseRate;
                const rateChange = rate - room.baseRate;
                const available = todayData?.available || 0;
                const sold = todayData?.sold || 0;
                const occupancyPct = sold > 0 ? Math.round((sold / (sold + available)) * 100) : 0;

                return (
                  <div
                    key={room.id}
                    className="group p-3 sm:p-4 rounded-lg border border-neutral-100 bg-neutral-50 hover:bg-white hover:border-neutral-200 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-xs sm:text-[13px] font-semibold text-neutral-900 truncate block">
                          {room.name}
                        </span>
                        <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">
                          Base: ₹{room.baseRate}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg sm:text-xl font-bold text-neutral-900">
                          ₹{rate}
                        </p>
                        {rateChange !== 0 && (
                          <p className={`text-[10px] sm:text-[11px] font-semibold ${
                            rateChange > 0 ? 'text-sage-600' : 'text-rose-600'
                          }`}>
                            {rateChange > 0 ? '+' : ''}{rateChange}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                          occupancyPct > 80 ? 'bg-sage-500' :
                          occupancyPct > 50 ? 'bg-gold-500' :
                          'bg-neutral-300'
                        }`} />
                        <span className="text-[10px] sm:text-[11px] text-neutral-600">
                          {occupancyPct}% occupied
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-medium text-neutral-700">
                        {available} avail
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bulk Edit Banner */}
        {bulkEditMode && (
          <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-neutral-200 shadow-xl rounded-[10px] p-3 sm:p-4 flex items-center gap-3 sm:gap-4 w-[calc(100%-2rem)] sm:w-auto sm:min-w-[400px] max-w-md">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-[13px] font-semibold text-neutral-900">
                Bulk Edit Mode Active
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">
                <span className="hidden sm:inline">Click dates in the calendar to select them</span>
                <span className="sm:hidden">Tap dates to select</span>
              </p>
            </div>
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold bg-terra-50 text-terra-600 flex-shrink-0">
              {selectedDates.length} selected
            </div>
          </div>
        )}

        {/* Bulk Edit Modal */}
        {showBulkEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[10px] p-4 sm:p-6 bg-white border border-neutral-200 shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1">
                Apply Bulk Changes
              </h3>
              <p className="text-xs sm:text-[13px] text-neutral-500 mb-4 sm:mb-6">
                Update rates for {selectedDates.length} selected date{selectedDates.length !== 1 ? 's' : ''}
              </p>

              <div className="space-y-3 sm:space-y-4">
                {/* Change Type */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 sm:mb-2">
                    Change Type
                  </label>
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100">
                    <button
                      onClick={() => setBulkEditData({ ...bulkEditData, changeType: 'amount' })}
                      className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-[13px] font-semibold transition-all duration-200 ${
                        bulkEditData.changeType === 'amount'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
                      }`}
                    >
                      <span className="hidden sm:inline">Fixed Amount (₹)</span>
                      <span className="sm:hidden">Amount (₹)</span>
                    </button>
                    <button
                      onClick={() => setBulkEditData({ ...bulkEditData, changeType: 'percentage' })}
                      className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-[13px] font-semibold transition-all duration-200 ${
                        bulkEditData.changeType === 'percentage'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
                      }`}
                    >
                      <span className="hidden sm:inline">Percentage (%)</span>
                      <span className="sm:hidden">Percent (%)</span>
                    </button>
                  </div>
                </div>

                {/* Rate Change Input */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 sm:mb-2">
                    Rate {bulkEditData.changeType === 'amount' ? 'Adjustment' : 'Change'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-[13px] font-medium text-neutral-500">
                      {bulkEditData.changeType === 'amount' ? '₹' : '%'}
                    </span>
                    <input
                      type="number"
                      value={bulkEditData.rateChange}
                      onChange={(e) => setBulkEditData({ ...bulkEditData, rateChange: e.target.value })}
                      placeholder={bulkEditData.changeType === 'amount' ? '50' : '10'}
                      className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-lg border border-neutral-200 text-xs sm:text-[13px] font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/40 focus:border-terra-400 transition-colors"
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-1 sm:mt-1.5">
                    {bulkEditData.changeType === 'amount'
                      ? 'Enter amount to add (+) or subtract (-) from current rates'
                      : 'Enter percentage to increase (+) or decrease (-) current rates'}
                  </p>
                </div>

                {/* Selected Dates Preview */}
                <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-50">
                  <p className="text-[10px] sm:text-[11px] font-medium text-neutral-600 mb-1.5 sm:mb-2">
                    Selected Dates:
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {selectedDates.slice(0, 8).map(date => (
                      <span
                        key={date}
                        className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-white text-neutral-700 border border-neutral-200"
                      >
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    ))}
                    {selectedDates.length > 8 && (
                      <span className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 sm:py-1 text-neutral-500">
                        +{selectedDates.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowBulkEditModal(false)}
                  fullWidth
                  className="text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={applyBulkChanges}
                  disabled={isApplyingBulk}
                  fullWidth
                  className="text-xs sm:text-sm"
                >
                  {isApplyingBulk ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2 shrink-0" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Apply to {selectedDates.length} Date{selectedDates.length !== 1 ? 's' : ''}</span>
                      <span className="sm:hidden">Apply ({selectedDates.length})</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RateCalendar;
