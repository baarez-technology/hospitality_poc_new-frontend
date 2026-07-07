import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Download,
  FileText,
  CreditCard,
  Building2,
  CalendarClock,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { revenueIntelligenceService, DashboardResponse, PricingRecommendation, PricingRule, KPISummary } from '../../../api/services/revenue-intelligence.service';
import { reportsService, RevenueByRoomType } from '../../../api/services/reports.service';
import { useToast } from '../../../contexts/ToastContext';
import { DemandLevelBadge } from '../../../components/revenue-management/DemandChart';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, ConfirmModal } from '../../../components/ui2/Modal';
import { Button } from '../../../components/ui2/Button';
import { DropdownMenu, DropdownMenuItem } from '../../../components/ui2/DropdownMenu';
import { useBookingsSSE } from '../../../hooks/useBookingsSSE';
import { bookingService } from '../../../api/services/booking.service';
import { dashboardsService, FinanceDashboard } from '../../../api/services/dashboards.service';
import { useCurrency } from '../../../hooks/useCurrency';
import { DatePicker } from '../../../components/ui2/DatePicker';

// Skeleton Loader Component
function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-100 ${className}`} />
  );
}

// KPI Card Component - Consistent with Design System
interface KPICardProps {
  title: string;
  value: string | number;
  trendValue?: number | null;
  icon: React.ElementType;
  accentColor?: 'terra' | 'sage' | 'gold' | 'ocean';
  index?: number;
  children?: React.ReactNode;
  isLoading?: boolean;
  subtitle?: string;
}

function KPICard({ title, value, trendValue, icon: Icon, accentColor = 'terra', index = 0, children, isLoading, subtitle }: KPICardProps) {
  const isPositive = trendValue !== null && trendValue !== undefined && trendValue >= 0;

  const accentStyles = {
    terra: { bg: 'bg-terra-50', icon: 'text-terra-600' },
    sage: { bg: 'bg-sage-50', icon: 'text-sage-600' },
    gold: { bg: 'bg-gold-50', icon: 'text-gold-600' },
    ocean: { bg: 'bg-ocean-50', icon: 'text-ocean-600' },
  };

  const style = accentStyles[accentColor] || accentStyles.terra;

  if (isLoading) {
    return (
      <div className="rounded-[10px] bg-white p-4 sm:p-6" style={{ animationDelay: `${index * 100}ms` }}>
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <SkeletonLoader className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
          <SkeletonLoader className="h-4 w-20 sm:w-24" />
        </div>
        <SkeletonLoader className="h-7 sm:h-9 w-24 sm:w-32 mb-2" />
        <SkeletonLoader className="h-5 w-24 sm:w-28" />
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[10px] bg-white p-4 sm:p-6"
      style={{ animationDelay: `${index * 100}ms` }}
    >
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
      <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 mb-2">
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

const PAYMENT_MODE_COLORS: Record<string, string> = {
  Card: '#4E5840',
  Cash: '#A57865',
  UPI: '#5C9BA4',
  Online: '#CDB261',
  'Bank Transfer': '#C8B29D',
  'Pay at Hotel': '#8B7355',
};
const PAYMENT_COLOR_LIST = ['#4E5840', '#A57865', '#5C9BA4', '#CDB261', '#C8B29D', '#8B7355'];

const RevenueDashboard = () => {
  const toast = useToast();
  const { symbol } = useCurrency();

  // State for API data
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [pickupMetrics, setPickupMetrics] = useState<{
    strong_days: number;
    critical_days: number;
    total_remaining: number;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timePeriod, setTimePeriod] = useState('7d');
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState(() => {
    const today = new Date();
    const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { start: fmt(today), end: fmt(end) };
  });
  const [exportLoading, setExportLoading] = useState(false);

  // Future Revenue / KPI Summary state
  const [kpiSummary, setKpiSummary] = useState<KPISummary | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  // Revenue by Room Type state
  const [roomTypeData, setRoomTypeData] = useState<RevenueByRoomType[]>([]);
  const [roomTypeLoading, setRoomTypeLoading] = useState(true);

  // Payment mode analysis state
  const [allBookingsRaw, setAllBookingsRaw] = useState<any[]>([]);
  const [financeData, setFinanceData] = useState<FinanceDashboard | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(true);

  // Build date range params based on selected period
  const getDateRangeParams = useCallback(() => {
    const today = new Date();
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    switch (timePeriod) {
      case '30d':
        return { startDate: fmt(today), endDate: fmt(new Date(today.getTime() + 30 * 86400000)) };
      case '90d':
        return { startDate: fmt(today), endDate: fmt(new Date(today.getTime() + 90 * 86400000)) };
      case 'custom':
        return { startDate: customDateRange.start, endDate: customDateRange.end };
      case '7d':
      default:
        return undefined; // Use default backend behaviour
    }
  }, [timePeriod, customDateRange]);

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const dateParams = getDateRangeParams();
      const [dashboard, recsResponse, pricingRules, pickupData, segmentsData] = await Promise.all([
        revenueIntelligenceService.getDashboard(dateParams),
        revenueIntelligenceService.getPricingRecommendations(),
        revenueIntelligenceService.getPricingRules(),
        revenueIntelligenceService.getPickupMetrics(7).catch(() => null),
        revenueIntelligenceService.getSegmentPerformance().catch(() => []),
      ]);

      setDashboardData(dashboard);
      setRecommendations(recsResponse?.recommendations || []);
      setRules(Array.isArray(pricingRules) ? pricingRules : []);
      setSegments(Array.isArray(segmentsData) ? segmentsData : []);
      if (pickupData?.summary) {
        setPickupMetrics({
          strong_days: pickupData.summary.strong_pace_days || 0,
          critical_days: pickupData.summary.critical_pace_days || 0,
          total_remaining: pickupData.summary.total_remaining_rooms || 0,
        });
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getDateRangeParams]); // re-fetch when period selection changes

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch payment mode data (bookings + finance)
  useEffect(() => {
    const fetchPaymentData = async () => {
      setPaymentLoading(true);
      try {
        const [finance, bookingsRes] = await Promise.all([
          dashboardsService.getFinanceDashboard().catch(() => null),
          bookingService.getBookings(1, 200).catch(() => null),
        ]);
        setFinanceData(finance);
        const rawBookings = bookingsRes?.items || (Array.isArray(bookingsRes) ? bookingsRes : []);
        setAllBookingsRaw(rawBookings);
      } catch (err) {
        console.error('Failed to fetch payment data:', err);
      } finally {
        setPaymentLoading(false);
      }
    };
    fetchPaymentData();
  }, []);

  // Fetch KPI Summary (future revenue projections)
  useEffect(() => {
    const fetchKpiSummary = async () => {
      setKpiLoading(true);
      try {
        const summary = await revenueIntelligenceService.getKPISummary();
        setKpiSummary(summary);
      } catch (err) {
        console.error('Failed to fetch KPI summary:', err);
      } finally {
        setKpiLoading(false);
      }
    };
    fetchKpiSummary();
  }, []);

  // Revenue by Room Type — compute from the same bookings array that feeds
  // Revenue by Payment Mode so both charts always show consistent totals.
  // The previous /reports/revenue-snapshot endpoint filtered to last_30_days
  // on the backend, which silently dropped bookings whose arrival is even one
  // day in the future and caused the two charts to disagree on the same page.
  useEffect(() => {
    setRoomTypeLoading(true);
    const isRevenueBooking = (b: any) => {
      const s = String(b.status || b.bookingStatus || '').toLowerCase();
      return s !== 'cancelled' && s !== 'canceled' && s !== 'no_show' && s !== 'no-show';
    };
    const totals: Record<string, { revenue: number; rooms: number }> = {};
    for (const b of allBookingsRaw.filter(isRevenueBooking)) {
      const name =
        b.roomTypeName ||
        b.room_type_name ||
        b.roomType ||
        b.room_type ||
        'Unknown';
      const amount = b.totalPrice || b.total_price || b.total_amount || b.amount || 0;
      if (!totals[name]) totals[name] = { revenue: 0, rooms: 0 };
      totals[name].revenue += amount;
      totals[name].rooms += 1;
    }
    const computed: RevenueByRoomType[] = Object.entries(totals).map(
      ([name, data]) => ({
        name,
        revenue: Math.round(data.revenue * 100) / 100,
        rooms: data.rooms,
        adr: data.rooms > 0 ? Math.round((data.revenue / data.rooms) * 100) / 100 : 0,
      })
    );
    setRoomTypeData(computed);
    setRoomTypeLoading(false);
  }, [allBookingsRaw]);

  // SSE Integration for real-time booking updates (affects revenue dashboard)
  useBookingsSSE({
    onBookingCreated: (bookingData) => {
      console.log('[Revenue Dashboard] 🎉 New booking received via SSE, refreshing dashboard:', bookingData);
      // Refresh dashboard when new booking is created (affects revenue metrics)
      fetchDashboardData();
    },
    onBookingCancelled: (bookingId) => {
      console.log('[Revenue Dashboard] 🚫 Booking cancelled via SSE, refreshing dashboard:', bookingId);
      // Refresh dashboard when booking is cancelled (affects revenue metrics)
      fetchDashboardData();
    },
    refetchBookings: () => {
      // Refresh dashboard data which includes booking-related metrics
      fetchDashboardData();
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + R - Refresh
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        setShowRefreshConfirm(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    setShowRefreshConfirm(false);
    try {
      // Run all pricing rules via API
      await revenueIntelligenceService.executePricingRules();
      // Refetch dashboard data
      await fetchDashboardData();
      toast.success('Dashboard data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh dashboard data');
      setIsRefreshing(false);
    }
  };

  // Handle export with format selection
  const handleExport = async (format: 'csv' | 'pdf') => {
    if (exportLoading) return;

    setExportLoading(true);
    try {
      if (!dashboardData) {
        toast.error('No data to export');
        setExportLoading(false);
        return;
      }

      const kpis = dashboardData.kpis?.next_7_days;

      if (format === 'pdf') {
        // Generate PDF using jsPDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 20;

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Revenue Management Dashboard', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        // Subtitle
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()} | Period: ${getPeriodDays()} Days`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Key Metrics Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('Key Metrics', 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const metrics = [
          [`${getPeriodDays()}-Day Revenue:`, `₹${getPeriodRevenue().toLocaleString()}`, `${kpis?.revenue_trend || 0}%`],
          ['Avg Occupancy:', `${kpis?.occupancy || 0}%`, `${kpis?.occupancy_trend || 0}%`],
          ['Avg ADR:', `₹${kpis?.adr || 0}`, `${kpis?.adr_trend || 0}%`],
          ['Active Pricing Rules:', `${Array.isArray(rules) ? rules.filter(r => r.isActive).length : 0}`, ''],
        ];

        metrics.forEach(([label, value, trend]) => {
          doc.text(label, 14, yPos);
          doc.text(value, 80, yPos);
          if (trend) doc.text(`(${trend} vs last week)`, 120, yPos);
          yPos += 6;
        });
        yPos += 10;

        // Revenue Forecast Section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Revenue Forecast (14 Days)', 14, yPos);
        yPos += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Date', 14, yPos);
        doc.text('Revenue', 60, yPos);
        doc.text('Occupancy', 100, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        revenueChartData.forEach(day => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(day.date, 14, yPos);
          doc.text(`₹${day.revenue.toLocaleString()}`, 60, yPos);
          doc.text(`${day.occupancy}%`, 100, yPos);
          yPos += 5;
        });
        yPos += 10;

        // High Demand Days Section
        if (dashboardData.high_impact_days && dashboardData.high_impact_days.length > 0) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('High Demand Days', 14, yPos);
          yPos += 8;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('Date', 14, yPos);
          doc.text('Demand Level', 70, yPos);
          doc.text('Occupancy', 120, yPos);
          yPos += 5;

          doc.setFont('helvetica', 'normal');
          dashboardData.high_impact_days.slice(0, 5).forEach(day => {
            const dateStr = new Date(day.date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            });
            doc.text(dateStr, 14, yPos);
            doc.text(day.demand_level, 70, yPos);
            doc.text(`${day.forecasted_occupancy}%`, 120, yPos);
            yPos += 5;
          });
        }

        // Save PDF
        doc.save(`rms-dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Dashboard exported successfully as PDF');
      } else {
        // CSV Export
        const csvData: (string | number)[][] = [];

        csvData.push(['Revenue Management Dashboard Export']);
        csvData.push(['Generated:', new Date().toLocaleString()]);
        csvData.push(['Period:', `${getPeriodDays()} Days`]);
        csvData.push([]);

        csvData.push(['KEY METRICS']);
        csvData.push(['Metric', 'Value', 'Change']);
        csvData.push([`${getPeriodDays()}-Day Revenue`, `₹${getPeriodRevenue().toLocaleString()}`, `${kpis?.revenue_trend || 0}%`]);
        csvData.push(['Avg Occupancy', `${kpis?.occupancy || 0}%`, `${kpis?.occupancy_trend || 0}%`]);
        csvData.push(['Avg ADR', `₹${kpis?.adr || 0}`, `${kpis?.adr_trend || 0}%`]);
        csvData.push(['Active Pricing Rules', Array.isArray(rules) ? rules.filter(r => r.isActive).length : 0, '']);
        csvData.push([]);

        csvData.push(['REVENUE FORECAST (14 Days)']);
        csvData.push(['Date', 'Revenue', 'Occupancy %']);
        revenueChartData.forEach(day => {
          csvData.push([day.date, `₹${day.revenue}`, `${day.occupancy}%`]);
        });
        csvData.push([]);

        if (dashboardData.high_impact_days && dashboardData.high_impact_days.length > 0) {
          csvData.push(['HIGH DEMAND DAYS']);
          csvData.push(['Date', 'Demand Level', 'Occupancy %']);
          dashboardData.high_impact_days.slice(0, 5).forEach(day => {
            const date = new Date(day.date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric'
            });
            csvData.push([date, day.demand_level, `${day.forecasted_occupancy}%`]);
          });
        }

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rms-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Dashboard exported successfully as CSV');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export dashboard');
    } finally {
      setExportLoading(false);
    }
  };

  // Format last updated time
  const getLastUpdatedText = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  // Time period options
  const periodOptions = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: 'Custom', value: 'custom' },
  ];

  // Calculate revenue based on time period
  const getPeriodRevenue = () => {
    if (!dashboardData?.kpis) return 0;

    switch (timePeriod) {
      case '30d':
        return dashboardData.kpis.custom?.total_revenue ?? dashboardData.kpis.month?.total_revenue ?? 0;
      case '90d':
        return dashboardData.kpis.custom?.total_revenue ?? (dashboardData.kpis.month?.total_revenue || 0) * 3;
      case 'custom':
        return dashboardData.kpis.custom?.total_revenue ?? 0;
      case '7d':
      default:
        return dashboardData.kpis.week?.total_revenue || 0;
    }
  };

  // Get occupancy based on selected time period
  const getPeriodOccupancy = () => {
    if (!dashboardData?.kpis) return 0;
    switch (timePeriod) {
      case '30d':
      case '90d':
        return dashboardData.kpis.custom?.occupancy ?? dashboardData.kpis.month?.occupancy ?? dashboardData.kpis.week?.occupancy ?? 0;
      case 'custom':
        return dashboardData.kpis.custom?.occupancy ?? dashboardData.kpis.week?.occupancy ?? 0;
      case '7d':
      default:
        return dashboardData.kpis.week?.occupancy || 0;
    }
  };

  // Get ADR based on selected time period
  const getPeriodADR = () => {
    if (!dashboardData?.kpis) return 0;
    switch (timePeriod) {
      case '30d':
      case '90d':
        return dashboardData.kpis.custom?.adr ?? dashboardData.kpis.month?.adr ?? dashboardData.kpis.week?.adr ?? 0;
      case 'custom':
        return dashboardData.kpis.custom?.adr ?? dashboardData.kpis.week?.adr ?? 0;
      case '7d':
      default:
        return dashboardData.kpis.week?.adr || 0;
    }
  };

  const getPeriodDays = () => {
    switch (timePeriod) {
      case '30d': return 30;
      case '90d': return 90;
      case 'custom': {
        const days = Math.ceil((new Date(customDateRange.end).getTime() - new Date(customDateRange.start).getTime()) / (1000 * 60 * 60 * 24));
        return days;
      }
      case '7d':
      default: return 7;
    }
  };

  const handlePeriodChange = (value: string) => {
    if (value === 'custom') {
      setShowDatePicker(true);
    } else {
      setIsLoading(true);
      setTimePeriod(value);
    }
  };

  const handleCustomDateApply = () => {
    setTimePeriod('custom');
    setShowDatePicker(false);
    toast.success(`Custom range applied: ${getPeriodDays()} days`);
  };

  // Get critical alerts count
  const criticalAlerts = recommendations.filter(r => r.priority === 'critical').length;
  const highAlerts = recommendations.filter(r => r.priority === 'high').length;

  // Chart data for revenue trend (using forecast array from API)
  // Get total rooms from KPI data (occupied_room_nights / days gives average, but we need capacity)
  const totalRooms = 70; // Default room count - should come from API
  const avgAdr = dashboardData?.kpis?.custom?.adr || dashboardData?.kpis?.next_7_days?.adr || 200;

  // Use full forecast data — backend now returns forecast sized to the selected period
  const chartDays = getPeriodDays();
  const revenueChartData = dashboardData?.forecast?.slice(0, chartDays).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    // Revenue = (occupancy% / 100) * rooms * ADR
    revenue: Math.round((item.forecasted_occupancy / 100) * totalRooms * avgAdr),
    occupancy: item.forecasted_occupancy,
  })) || [];

  // Calculate total opportunity from recommendations
  const totalOpportunity = recommendations.reduce((sum, rec) => sum + (rec.potential_revenue || 0), 0);

  // Segment pie data - use API data or fallback to defaults
  const segmentColors: Record<string, string> = {
    'Corporate': '#4E5840',
    'Leisure': '#A57865',
    'OTA': '#5C9BA4',
    'Direct': '#CDB261',
    'Group': '#C8B29D',
    'Business': '#4E5840',
    'default': '#888888'
  };

  // Revenue by Segment — driven entirely by the backend /segments/performance
  // response. No hardcoded fallback so the card honestly shows "no data" when
  // there are no real segment contributions (e.g. just after a DB cleanup).
  const segmentPieData = segments.length > 0
    ? segments.slice(0, 5).map(seg => ({
        name: seg.segmentName,
        value: Math.round(seg.revenueContribution || 0),
        color: segmentColors[seg.segmentName] || segmentColors['default']
      }))
    : [];

  // ── Payment Mode Analysis ──
  const normalizePaymentMethod = (method: string): string => {
    const lower = (method || '').toLowerCase().trim();
    if (!lower) return '';
    if (lower === 'cash') return 'Cash';
    if (['card', 'credit_card', 'debit_card', 'credit card', 'debit card'].includes(lower)) return 'Card';
    if (lower === 'upi') return 'UPI';
    if (['online', 'net_banking', 'net banking', 'wallet'].includes(lower)) return 'Online';
    if (['bank_transfer', 'bank transfer'].includes(lower)) return 'Bank Transfer';
    if (['pay_at_hotel', 'pay at hotel'].includes(lower)) return 'Pay at Hotel';
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const paymentModeData = useMemo(() => {
    let modeMap: Record<string, number> = {};
    // Cancelled / no-show bookings didn't generate revenue — exclude them.
    const isRevenueBooking = (b: any) => {
      const s = String(b.status || b.bookingStatus || '').toLowerCase();
      return s !== 'cancelled' && s !== 'canceled' && s !== 'no_show' && s !== 'no-show';
    };

    // Primary: Finance Dashboard's pre-aggregated payment_methods
    if (financeData?.payment_methods && Object.keys(financeData.payment_methods).length > 0) {
      for (const [method, amount] of Object.entries(financeData.payment_methods)) {
        const mode = normalizePaymentMethod(method);
        if (mode) modeMap[mode] = (modeMap[mode] || 0) + (amount || 0);
      }
    }
    // Secondary: All bookings from bookings API (excluding cancelled/no-show)
    else if (allBookingsRaw.length > 0) {
      for (const b of allBookingsRaw.filter(isRevenueBooking)) {
        const method = b.paymentMethod || b.payment_method || '';
        const amount = b.totalPrice || b.total_price || b.total_amount || b.amount || 0;
        const mode = normalizePaymentMethod(method);
        if (mode) modeMap[mode] = (modeMap[mode] || 0) + amount;
      }
    }

    const total = Object.values(modeMap).reduce((s, v) => s + v, 0);
    const entries = Object.entries(modeMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], index) => ({
        name,
        amount: Math.round(amount),
        percent: total > 0 ? parseFloat(((amount / total) * 100).toFixed(1)) : 0,
        color: PAYMENT_MODE_COLORS[name] || PAYMENT_COLOR_LIST[index % PAYMENT_COLOR_LIST.length],
      }));

    if (entries.length === 0) {
      return [
        { name: 'Cash', amount: 0, percent: 0, color: '#A57865' },
        { name: 'Card', amount: 0, percent: 0, color: '#4E5840' },
        { name: 'UPI', amount: 0, percent: 0, color: '#5C9BA4' },
        { name: 'Online', amount: 0, percent: 0, color: '#CDB261' },
      ];
    }
    return entries;
  }, [financeData, allBookingsRaw]);

  const totalPaymentRevenue = paymentModeData.reduce((s, d) => s + d.amount, 0);

  // ── Future Revenue computations (EN-1 + EN-14) ──
  const futureRevenueData = useMemo(() => {
    const next7 = kpiSummary?.next_7_days;
    const next30 = kpiSummary?.next_30_days;
    const currentWeek = kpiSummary?.week;
    const currentMonth = kpiSummary?.month;

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    // Step 1: Aggregate future bookings by calendar month
    const monthlyMap: Record<string, { confirmed: number; count: number }> = {};
    let totalFutureRevenue = 0;
    let totalFutureCount = 0;

    for (const b of allBookingsRaw) {
      const checkIn = (b.checkIn || b.check_in || '').slice(0, 10);
      if (checkIn > todayStr) {
        const amount = b.totalPrice || b.total_price || b.total_amount || b.amount || 0;
        const monthKey = checkIn.slice(0, 7); // "YYYY-MM"
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { confirmed: 0, count: 0 };
        }
        monthlyMap[monthKey].confirmed += amount;
        monthlyMap[monthKey].count++;
        totalFutureRevenue += amount;
        totalFutureCount++;
      }
    }

    // Step 2: Build next-3-months breakdown
    const dailyForecast = next30?.total_revenue && next30?.period?.days
      ? next30.total_revenue / next30.period.days
      : 0;

    const monthBreakdown: Array<{
      monthKey: string;
      label: string;
      shortLabel: string;
      confirmed: number;
      forecast: number;
      total: number;
      bookingCount: number;
      daysInMonth: number;
      daysRemaining: number;
    }> = [];

    for (let i = 0; i < 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const shortLabel = d.toLocaleDateString('en-US', { month: 'short' });

      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const daysRemaining = i === 0
        ? Math.max(0, lastDay - today.getDate())
        : lastDay;

      const confirmed = Math.round(monthlyMap[monthKey]?.confirmed || 0);
      const bookingCount = monthlyMap[monthKey]?.count || 0;

      // Decay factor for months further out
      const decayFactor = i === 0 ? 1.0 : i === 1 ? 0.9 : 0.8;
      const forecastForMonth = Math.round(dailyForecast * daysRemaining * decayFactor);
      const forecast = Math.max(0, forecastForMonth - confirmed);

      monthBreakdown.push({
        monthKey,
        label,
        shortLabel,
        confirmed,
        forecast,
        total: confirmed + forecast,
        bookingCount,
        daysInMonth: lastDay,
        daysRemaining,
      });
    }

    // Step 3: Monthly Projection (EN-14) — booking-based
    const currentMonthData = monthBreakdown[0];
    const monthlyProjectedFromBookings = currentMonthData
      ? currentMonthData.confirmed + currentMonthData.forecast
      : 0;

    return {
      next7Revenue: next7?.total_revenue || 0,
      next7Trend: next7?.revenue_trend || 0,
      next7Occupancy: next7?.occupancy || 0,
      next7Adr: next7?.adr || 0,
      next30Revenue: next30?.total_revenue || 0,
      next30Trend: next30?.revenue_trend || 0,
      next30Occupancy: next30?.occupancy || 0,
      next30Adr: next30?.adr || 0,
      currentWeekRevenue: currentWeek?.total_revenue || 0,
      currentMonthRevenue: currentMonth?.total_revenue || 0,
      futureBookingRevenue: Math.round(totalFutureRevenue),
      futureBookingCount: totalFutureCount,
      monthlyProjected: Math.round(monthlyProjectedFromBookings),
      avgDailyProjected: Math.round(dailyForecast),
      monthBreakdown,
    };
  }, [kpiSummary, allBookingsRaw]);

  // ── Room Type chart colors ──
  const ROOM_TYPE_COLORS = ['#4E5840', '#A57865', '#5C9BA4', '#CDB261', '#C8B29D', '#8B7355', '#7C9885', '#D4A574'];

  const roomTypeChartData = useMemo(() => {
    if (!roomTypeData.length) return [];
    const total = roomTypeData.reduce((s, r) => s + r.revenue, 0);
    return roomTypeData
      .sort((a, b) => b.revenue - a.revenue)
      .map((rt, i) => ({
        name: rt.name,
        revenue: Math.round(rt.revenue),
        rooms: rt.rooms,
        adr: Math.round(rt.adr),
        percent: total > 0 ? parseFloat(((rt.revenue / total) * 100).toFixed(1)) : 0,
        color: ROOM_TYPE_COLORS[i % ROOM_TYPE_COLORS.length],
      }));
  }, [roomTypeData]);

  const totalRoomTypeRevenue = roomTypeChartData.reduce((s, r) => s + r.revenue, 0);
  const topRoomType = roomTypeChartData[0];

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-rose-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-base sm:text-lg font-semibold text-neutral-800 mb-1.5 sm:mb-2">Failed to Load Dashboard</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mb-3 sm:mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="primary" className="text-xs sm:text-sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
                Revenue Management
              </h1>
              <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5 sm:mt-1">
                <span className="hidden sm:inline">AI-powered pricing optimization - Updated {getLastUpdatedText()}</span>
                <span className="sm:hidden">Updated {getLastUpdatedText()}</span>
              </p>
            </div>

            {/* Action Buttons - Always visible */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Export Button */}
              {exportLoading ? (
                <Button
                  variant="outline"
                  icon={Download}
                  disabled
                  loading
                  className="text-xs sm:text-sm pointer-events-none"
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
                      <span className="hidden sm:inline">Export</span>
                      <span className="sm:hidden">Export</span>
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

              {/* Refresh Button */}
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={() => setShowRefreshConfirm(true)}
                disabled={isRefreshing}
                loading={isRefreshing}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
            </div>
          </div>

          {/* Time Period Selector - Full width on mobile */}
          <div className="flex items-center gap-1 p-1 sm:p-1.5 rounded-lg bg-neutral-100 w-full sm:w-fit overflow-x-auto">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[13px] font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  timePeriod === option.value
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        {/* Alerts Banner */}
        {(criticalAlerts > 0 || highAlerts > 0) && !isLoading && (
          <div className={`rounded-[10px] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
            criticalAlerts > 0 ? 'bg-rose-50' : 'bg-gold-50'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                criticalAlerts > 0 ? 'bg-rose-100' : 'bg-gold-100'
              }`}>
                <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 ${criticalAlerts > 0 ? 'text-rose-600' : 'text-gold-600'}`} />
              </div>
              <div>
                <p className={`text-xs sm:text-[13px] font-semibold ${
                  criticalAlerts > 0 ? 'text-rose-800' : 'text-gold-800'
                }`}>
                  {criticalAlerts + highAlerts} Pricing Action{criticalAlerts + highAlerts !== 1 ? 's' : ''} Needed
                </p>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">
                  {criticalAlerts > 0 && `${criticalAlerts} critical`}
                  {criticalAlerts > 0 && highAlerts > 0 && ', '}
                  {highAlerts > 0 && `${highAlerts} high priority`}
                </p>
              </div>
            </div>
            <Link
              to="/admin/revenue/calendar"
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-[13px] font-semibold rounded-lg text-white transition-colors text-center ${
                criticalAlerts > 0 ? 'bg-rose-600 hover:bg-rose-700' : 'bg-gold-600 hover:bg-gold-700'
              }`}
            >
              Take Action
            </Link>
          </div>
        )}

        {/* Key Metrics — based on actual bookings, not AI projections */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            title={`${getPeriodDays()}-Day Revenue`}
            value={`₹${(getPeriodRevenue() / 1000).toFixed(0)}K`}
            trendValue={dashboardData?.kpis?.custom?.revenue_trend ?? dashboardData?.kpis?.week?.revenue_trend ?? null}
            icon={DollarSign}
            accentColor="sage"
            index={0}
            isLoading={isLoading}
            subtitle={`Actual · Last ${getPeriodDays()} days`}
          />

          <KPICard
            title="Avg Occupancy"
            value={`${getPeriodOccupancy()}%`}
            trendValue={dashboardData?.kpis?.custom?.occupancy_trend ?? dashboardData?.kpis?.week?.occupancy_trend ?? null}
            icon={BarChart3}
            accentColor="terra"
            index={1}
            isLoading={isLoading}
            subtitle={`Last ${getPeriodDays()} days`}
          />

          <KPICard
            title="Avg ADR"
            value={`₹${getPeriodADR()}`}
            trendValue={dashboardData?.kpis?.custom?.adr_trend ?? dashboardData?.kpis?.week?.adr_trend ?? null}
            icon={TrendingUp}
            accentColor="ocean"
            index={2}
            isLoading={isLoading}
            subtitle={`Last ${getPeriodDays()} days`}
          />

          <KPICard
            title="Active Rules"
            value={Array.isArray(rules) ? rules.filter(r => r.isActive).length : 0}
            trendValue={null}
            icon={Sparkles}
            accentColor="gold"
            index={3}
            isLoading={isLoading}
            subtitle="Pricing rules"
          >
            <Link
              to="/admin/revenue/pricing"
              className="text-[10px] sm:text-[11px] font-semibold text-terra-600 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </KPICard>
        </section>

        {/* Revenue Forecast Chart - Full Width */}
        <section className="rounded-[10px] bg-white overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Revenue & Occupancy Forecast</h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">14-day outlook</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Legend - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-sage-500" />
                  <span className="text-[11px] text-neutral-600 font-medium">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-terra-500" style={{ borderStyle: 'dashed', borderWidth: '1.5px', borderColor: '#A57865' }} />
                  <span className="text-[11px] text-neutral-600 font-medium">Occupancy</span>
                </div>
              </div>
              <Link to="/admin/revenue/forecast">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">View</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Stats */}
          {!isLoading && (
            <div className="px-4 sm:px-6 pb-3 sm:pb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-50">
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">Total Projected</p>
                <p className="text-base sm:text-lg font-semibold text-neutral-800">
                  {symbol}{(revenueChartData.reduce((sum, d) => sum + d.revenue, 0) / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-50">
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">Avg Daily Revenue</p>
                <p className="text-base sm:text-lg font-semibold text-neutral-800">
                  {symbol}{(revenueChartData.reduce((sum, d) => sum + d.revenue, 0) / Math.max(revenueChartData.length, 1) / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-50">
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">Avg Occupancy</p>
                <p className="text-base sm:text-lg font-semibold text-neutral-800">
                  {(revenueChartData.reduce((sum, d) => sum + d.occupancy, 0) / Math.max(revenueChartData.length, 1)).toFixed(0)}%
                </p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-50">
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">Peak Day</p>
                <p className="text-base sm:text-lg font-semibold text-sage-600">
                  {revenueChartData.length > 0 ? revenueChartData.reduce((max, d) => d.revenue > max.revenue ? d : max, revenueChartData[0]).date : '-'}
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <SkeletonLoader className="h-60 sm:h-80 w-full rounded-lg" />
            </div>
          ) : revenueChartData.length === 0 ? (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="h-60 sm:h-80 flex items-center justify-center bg-neutral-50 rounded-lg">
                <p className="text-xs sm:text-[13px] text-neutral-400">No forecast data available</p>
              </div>
            </div>
          ) : (
            <div className="h-60 sm:h-80 px-4 sm:px-6 pb-4 sm:pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4E5840" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4E5840" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A57865" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#A57865" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#E5E4E0' }}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
                    dx={-5}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    dx={5}
                  />
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #E5E4E0',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? `₹${value.toLocaleString()}` : `${value}%`,
                      name === 'revenue' ? 'Revenue' : 'Occupancy'
                    ]}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4E5840"
                    strokeWidth={2.5}
                    fill="url(#colorRevenue)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#4E5840', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#A57865"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    fill="url(#colorOccupancy)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#A57865', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FUTURE REVENUE OUTLOOK — EN-1 + EN-14 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="rounded-[10px] bg-white overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-sage-600" />
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Future Revenue Outlook</h3>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Projected revenue from upcoming bookings & forecasts</p>
              </div>
            </div>
          </div>

          {kpiLoading ? (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <SkeletonLoader className="h-48 w-full rounded-lg" />
            </div>
          ) : (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
              {/* Future Revenue KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Next 7 Days Projected */}
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-sage-50 to-white border border-sage-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">Next 7 Days</p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-ocean-50 text-ocean-600 border border-ocean-100">AI Forecast</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {symbol}{futureRevenueData.next7Revenue >= 1000 ? `${(futureRevenueData.next7Revenue / 1000).toFixed(1)}K` : futureRevenueData.next7Revenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {futureRevenueData.next7Trend >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-sage-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-rose-500" />
                    )}
                    <span className={`text-[10px] font-semibold ${futureRevenueData.next7Trend >= 0 ? 'text-sage-600' : 'text-rose-500'}`}>
                      {futureRevenueData.next7Trend >= 0 ? '+' : ''}{futureRevenueData.next7Trend.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-neutral-400">vs last week</span>
                  </div>
                </div>

                {/* Next 30 Days Projected */}
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-terra-50 to-white border border-terra-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">Next 30 Days</p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-ocean-50 text-ocean-600 border border-ocean-100">AI Forecast</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {symbol}{futureRevenueData.next30Revenue >= 1000 ? `${(futureRevenueData.next30Revenue / 1000).toFixed(1)}K` : futureRevenueData.next30Revenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {futureRevenueData.next30Trend >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-sage-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-rose-500" />
                    )}
                    <span className={`text-[10px] font-semibold ${futureRevenueData.next30Trend >= 0 ? 'text-sage-600' : 'text-rose-500'}`}>
                      {futureRevenueData.next30Trend >= 0 ? '+' : ''}{futureRevenueData.next30Trend.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-neutral-400">vs last month</span>
                  </div>
                </div>

                {/* Confirmed Future Bookings Revenue */}
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-ocean-50 to-white border border-ocean-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">Confirmed Bookings</p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-sage-50 text-sage-600 border border-sage-100">Confirmed</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {symbol}{futureRevenueData.futureBookingRevenue >= 1000 ? `${(futureRevenueData.futureBookingRevenue / 1000).toFixed(1)}K` : futureRevenueData.futureBookingRevenue.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1.5">
                    {futureRevenueData.futureBookingCount} upcoming bookings
                  </p>
                </div>

                {/* This Month Outlook (EN-14: booking-based projection) */}
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-gold-50 to-white border border-gold-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">This Month Outlook</p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-gold-50 text-gold-600 border border-gold-100">Bookings + AI</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {symbol}{futureRevenueData.monthlyProjected >= 1000 ? `${(futureRevenueData.monthlyProjected / 1000).toFixed(1)}K` : futureRevenueData.monthlyProjected.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1.5">
                    {symbol}{(futureRevenueData.monthBreakdown[0]?.confirmed || 0).toLocaleString()} confirmed + {symbol}{(futureRevenueData.monthBreakdown[0]?.forecast || 0).toLocaleString()} forecast
                  </p>
                </div>
              </div>

              {/* Detail Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="p-2.5 rounded-lg bg-neutral-50">
                  <p className="text-[10px] text-neutral-400 font-medium">7-Day Occupancy</p>
                  <p className="text-sm font-semibold text-neutral-800">{futureRevenueData.next7Occupancy.toFixed(1)}%</p>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-50">
                  <p className="text-[10px] text-neutral-400 font-medium">7-Day ADR</p>
                  <p className="text-sm font-semibold text-neutral-800">{symbol}{futureRevenueData.next7Adr.toFixed(0)}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-50">
                  <p className="text-[10px] text-neutral-400 font-medium">30-Day Occupancy</p>
                  <p className="text-sm font-semibold text-neutral-800">{futureRevenueData.next30Occupancy.toFixed(1)}%</p>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-50">
                  <p className="text-[10px] text-neutral-400 font-medium">30-Day ADR</p>
                  <p className="text-sm font-semibold text-neutral-800">{symbol}{futureRevenueData.next30Adr.toFixed(0)}</p>
                </div>
              </div>

              {/* Monthly Revenue Breakdown — EN-14 */}
              <div className="p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-semibold text-neutral-600">Monthly Revenue Breakdown</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-sage-500" />
                      <span className="text-[10px] text-neutral-500">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-ocean-300 opacity-60" />
                      <span className="text-[10px] text-neutral-500">AI Forecast</span>
                    </div>
                  </div>
                </div>

                {/* Stacked Horizontal Bar Chart */}
                <div className="h-36 sm:h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={futureRevenueData.monthBreakdown}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" horizontal={false} vertical={true} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
                      />
                      <YAxis
                        dataKey="shortLabel"
                        type="category"
                        tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <ChartTooltip
                        content={({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof futureRevenueData.monthBreakdown[0] }> }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0]?.payload;
                          if (!data) return null;
                          return (
                            <div className="bg-white border border-neutral-200 rounded-xl p-3 shadow-lg text-xs">
                              <p className="font-semibold text-neutral-800 mb-1.5">{data.label}</p>
                              <p className="text-sage-600">Confirmed: {symbol}{data.confirmed.toLocaleString()} ({data.bookingCount} bookings)</p>
                              <p className="text-ocean-500">AI Forecast: {symbol}{data.forecast.toLocaleString()}</p>
                              <p className="font-semibold text-neutral-700 mt-1 pt-1 border-t border-neutral-100">Total: {symbol}{data.total.toLocaleString()}</p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="confirmed" stackId="revenue" fill="#4E5840" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="forecast" stackId="revenue" fill="#5C9BA4" fillOpacity={0.5} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Inline Month Summaries */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {futureRevenueData.monthBreakdown.map((m) => (
                    <div key={m.monthKey} className="text-center p-2 rounded-lg bg-white">
                      <p className="text-[10px] text-neutral-400 font-medium">{m.label}</p>
                      <p className="text-sm font-semibold text-neutral-800 mt-0.5">
                        {symbol}{m.total >= 1000 ? `${(m.total / 1000).toFixed(1)}K` : m.total.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-neutral-400 mt-0.5">
                        {m.bookingCount} booking{m.bookingCount !== 1 ? 's' : ''} confirmed
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current vs Projected Comparison Bar */}
              <div className="p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                <p className="text-[11px] font-semibold text-neutral-600 mb-3">Current Period vs Future Projection</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-neutral-500">This Week (Actual)</span>
                      <span className="text-[11px] font-semibold text-neutral-800">
                        {symbol}{futureRevenueData.currentWeekRevenue >= 1000 ? `${(futureRevenueData.currentWeekRevenue / 1000).toFixed(1)}K` : futureRevenueData.currentWeekRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sage-500 transition-all duration-700"
                        style={{ width: `${Math.min(100, futureRevenueData.next7Revenue > 0 ? (futureRevenueData.currentWeekRevenue / Math.max(futureRevenueData.next7Revenue, futureRevenueData.currentWeekRevenue)) * 100 : 0)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-neutral-500">Next 7 Days (Projected)</span>
                      <span className="text-[11px] font-semibold text-terra-700">
                        {symbol}{futureRevenueData.next7Revenue >= 1000 ? `${(futureRevenueData.next7Revenue / 1000).toFixed(1)}K` : futureRevenueData.next7Revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-terra-500 transition-all duration-700"
                        style={{ width: `${Math.min(100, futureRevenueData.currentWeekRevenue > 0 ? (futureRevenueData.next7Revenue / Math.max(futureRevenueData.next7Revenue, futureRevenueData.currentWeekRevenue)) * 100 : 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* REVENUE OVERVIEW — Payment Modes + Room Types (side by side) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* Payment Mode Overview */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-terra-600" />
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Revenue by Payment Mode</h3>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Breakdown by method</p>
                </div>
              </div>
              <Link to="/admin/revenue/payment-analytics">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">Details</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {paymentLoading ? (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <SkeletonLoader className="h-52 w-full rounded-lg" />
              </div>
            ) : (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Donut Chart */}
                <div className="h-44 sm:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentModeData.filter(d => d.amount > 0)}
                        cx="50%" cy="50%"
                        innerRadius={42} outerRadius={66}
                        paddingAngle={3} dataKey="amount"
                      >
                        {paymentModeData.filter(d => d.amount > 0).map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        formatter={(v: number, n: string) => [`${symbol}${v.toLocaleString()}`, n]}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E4E0', borderRadius: '10px', padding: '10px 14px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      />
                      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="central" className="fill-neutral-800 text-sm sm:text-base font-semibold">
                        {symbol}{totalPaymentRevenue >= 1000 ? `${(totalPaymentRevenue / 1000).toFixed(1)}K` : totalPaymentRevenue.toLocaleString()}
                      </text>
                      <text x="50%" y="57%" textAnchor="middle" dominantBaseline="central" className="fill-neutral-400 text-[9px] sm:text-[10px]">
                        Total
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="space-y-2 mt-3 pt-3 border-t border-neutral-100">
                  {paymentModeData.filter(d => d.amount > 0).map(mode => (
                    <div key={mode.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: mode.color }} />
                        <span className="text-[11px] sm:text-xs text-neutral-700 font-medium">{mode.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] sm:text-xs font-semibold text-neutral-800">{symbol}{mode.amount.toLocaleString()}</span>
                        <span className="text-[9px] sm:text-[10px] text-neutral-400 w-9 text-right">{mode.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Room Type Overview */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-ocean-600" />
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Revenue by Room Type</h3>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Last 30 days</p>
                </div>
              </div>
              <Link to="/admin/revenue/payment-analytics?tab=roomtype">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">Details</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {roomTypeLoading ? (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <SkeletonLoader className="h-52 w-full rounded-lg" />
              </div>
            ) : roomTypeChartData.length === 0 ? (
              <div className="px-4 sm:px-6 pb-6">
                <div className="h-40 flex items-center justify-center bg-neutral-50 rounded-lg">
                  <p className="text-[11px] sm:text-xs text-neutral-400">No room type data available</p>
                </div>
              </div>
            ) : (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Donut Chart */}
                <div className="h-44 sm:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roomTypeChartData}
                        cx="50%" cy="50%"
                        innerRadius={42} outerRadius={66}
                        paddingAngle={3} dataKey="revenue"
                      >
                        {roomTypeChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        formatter={(v: number, n: string) => [`${symbol}${v.toLocaleString()}`, n]}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E4E0', borderRadius: '10px', padding: '10px 14px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      />
                      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="central" className="fill-neutral-800 text-sm sm:text-base font-semibold">
                        {symbol}{totalRoomTypeRevenue >= 1000 ? `${(totalRoomTypeRevenue / 1000).toFixed(1)}K` : totalRoomTypeRevenue.toLocaleString()}
                      </text>
                      <text x="50%" y="57%" textAnchor="middle" dominantBaseline="central" className="fill-neutral-400 text-[9px] sm:text-[10px]">
                        Total
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="space-y-2 mt-3 pt-3 border-t border-neutral-100">
                  {roomTypeChartData.map(rt => (
                    <div key={rt.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: rt.color }} />
                        <span className="text-[11px] sm:text-xs text-neutral-700 font-medium truncate max-w-[120px] sm:max-w-[160px]">{rt.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] sm:text-xs font-semibold text-neutral-800">{symbol}{rt.revenue.toLocaleString()}</span>
                        <span className="text-[9px] sm:text-[10px] text-neutral-400 w-9 text-right">{rt.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* High Demand Days - Full Width */}
        <section className="rounded-[10px] bg-white overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">High Demand Days</h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Peak occupancy opportunities</p>
            </div>
            <Link to="/admin/revenue/forecast">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">View</span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
              {[...Array(5)].map((_, i) => (
                <SkeletonLoader key={i} className={`h-24 sm:h-28 w-full rounded-lg ${i >= 3 ? 'hidden sm:block' : ''}`} />
              ))}
            </div>
          ) : (dashboardData?.high_impact_days || []).length === 0 ? (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="p-4 sm:p-6 rounded-lg bg-neutral-50 border border-neutral-100 text-center">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-neutral-300 mb-2" />
                <p className="text-xs sm:text-sm font-medium text-neutral-600">No High Demand Days</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-1">
                  No dates with 80%+ forecasted occupancy in the next 14 days
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
              {(dashboardData?.high_impact_days || []).slice(0, 5).map((day, index) => (
                <div
                  key={day.date}
                  className={`p-2 sm:p-3 rounded-lg bg-rose-50 border border-rose-100 text-center hover:bg-rose-100 transition-colors ${index >= 3 ? 'hidden sm:block' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-neutral-800">
                    {new Date(day.date).getDate()}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <div className="flex justify-center mt-1">
                    <DemandLevelBadge level={day.demand_level} />
                  </div>
                  <p className="text-xs sm:text-[13px] font-bold text-rose-600 mt-1">
                    {day.forecasted_occupancy}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Two Column Grid: Segment, Pickup Summary (Market Position hidden) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Segment Pie Chart */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Revenue by Segment</h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Top 5 segments</p>
            </div>
            {isLoading ? (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <SkeletonLoader className="h-40 sm:h-48 w-full rounded-lg" />
              </div>
            ) : segmentPieData.length === 0 ? (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="h-32 sm:h-36 flex items-center justify-center bg-neutral-50 rounded-lg">
                  <p className="text-[10px] sm:text-[11px] text-neutral-400">No segment data available</p>
                </div>
              </div>
            ) : (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="h-32 sm:h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={segmentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {segmentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        formatter={(value: number) => [`${value}%`, 'Share']}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #E5E4E0',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Segment Indicators */}
                <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                  {segmentPieData.slice(0, 5).map((segment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-[10px] sm:text-[11px] text-neutral-600 truncate max-w-[80px] sm:max-w-[100px]">
                          {segment.name}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-800">
                        {segment.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Market Position — hidden for now (set SHOW_MARKET_POSITION = true to restore) */}
          {false && (
            <section className="rounded-[10px] bg-white overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5">
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Market Position</h3>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Competitive analysis</p>
              </div>
              {isLoading ? (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonLoader key={i} className="h-5 sm:h-6 w-full" />
                  ))}
                </div>
              ) : (() => {
                const underpricedDays = recommendations.filter(r => r.change_percent > 0).length;
                const overpricedDays = recommendations.filter(r => r.change_percent < 0).length;
                const avgGap = recommendations.length > 0
                  ? Math.round(recommendations.reduce((sum, r) => sum + r.change_percent, 0) / recommendations.length)
                  : 0;

                return (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between py-1.5 sm:py-2">
                      <span className="text-xs sm:text-[13px] text-neutral-600">Avg Gap vs Market</span>
                      <span className={`text-sm sm:text-[15px] font-bold ${avgGap >= 0 ? 'text-sage-600' : 'text-rose-600'}`}>
                        {avgGap >= 0 ? '+' : ''}{avgGap}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 sm:py-2">
                      <span className="text-xs sm:text-[13px] text-neutral-600">Days Underpriced</span>
                      <span className="text-sm sm:text-[15px] font-bold text-sage-600">
                        {underpricedDays}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 sm:py-2">
                      <span className="text-xs sm:text-[13px] text-neutral-600">Days Overpriced</span>
                      <span className="text-sm sm:text-[15px] font-bold text-rose-600">
                        {overpricedDays}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 sm:py-2 border-t border-neutral-100 pt-2 sm:pt-3">
                      <span className="text-xs sm:text-[13px] text-neutral-600">Revenue Opportunity</span>
                      <span className="text-sm sm:text-[15px] font-bold text-gold-600">
                        ${totalOpportunity.toLocaleString()}
                      </span>
                    </div>
                    <Link to="/admin/revenue/competitors" className="block">
                      <Button variant="outline" size="sm" fullWidth className="text-xs sm:text-sm">
                        View Analysis
                      </Button>
                    </Link>
                  </div>
                );
              })()}
            </section>
          )}

          {/* Pickup Summary */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Pickup Summary</h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Booking pace</p>
            </div>
            {isLoading ? (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
                {[...Array(3)].map((_, i) => (
                  <SkeletonLoader key={i} className="h-5 sm:h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between py-1.5 sm:py-2">
                  <span className="text-xs sm:text-[13px] text-neutral-600">Strong Pace Days (7d)</span>
                  <span className="text-sm sm:text-[15px] font-bold text-sage-600">
                    {pickupMetrics?.strong_days || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 sm:py-2">
                  <span className="text-xs sm:text-[13px] text-neutral-600">Critical Pace Days</span>
                  <span className="text-sm sm:text-[15px] font-bold text-rose-600">
                    {pickupMetrics?.critical_days || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 sm:py-2">
                  <span className="text-xs sm:text-[13px] text-neutral-600">Rooms to Sell (7d)</span>
                  <span className="text-sm sm:text-[15px] font-bold text-neutral-800">
                    {pickupMetrics?.total_remaining || 0}
                  </span>
                </div>
                <Link to="/admin/revenue/pickup" className="block mt-1.5 sm:mt-2">
                  <Button variant="outline" size="sm" fullWidth className="text-xs sm:text-sm">
                    View Analysis
                  </Button>
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* AI Insights Summary Card */}
        <section className="rounded-[10px] bg-white overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">AI Insights</h3>
              <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider bg-gold-100 text-gold-700">
                Smart
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">
              Automated pricing recommendations
            </p>
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            {isLoading ? (
              <SkeletonLoader className="h-20 sm:h-24 w-full rounded-lg" />
            ) : recommendations.length === 0 ? (
              <div className="p-3 sm:p-4 rounded-lg bg-sage-50 border border-sage-100 text-center">
                <p className="text-xs sm:text-[13px] font-medium text-sage-700">All Optimized!</p>
                <p className="text-[10px] sm:text-[11px] text-sage-600 mt-1">No pending recommendations</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {/* Summary Stats */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 p-2.5 sm:p-3 rounded-lg bg-terra-50 border border-terra-100">
                    <p className="text-[9px] sm:text-[10px] text-terra-600 font-medium uppercase tracking-wide">
                      Recommendations
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-terra-700">
                      {recommendations.length}
                    </p>
                  </div>
                  <div className="flex-1 p-2.5 sm:p-3 rounded-lg bg-sage-50 border border-sage-100">
                    <p className="text-[9px] sm:text-[10px] text-sage-600 font-medium uppercase tracking-wide">
                      Potential Revenue
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-sage-700">
                      +${totalOpportunity.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Priority Badges */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {recommendations.filter(r => r.priority === 'critical').length > 0 && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide rounded-full bg-rose-100 text-rose-700">
                      {recommendations.filter(r => r.priority === 'critical').length} Critical
                    </span>
                  )}
                  {recommendations.filter(r => r.priority === 'high').length > 0 && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide rounded-full bg-gold-100 text-gold-700">
                      {recommendations.filter(r => r.priority === 'high').length} High
                    </span>
                  )}
                </div>

                {/* Link to Rate Calendar */}
                <Link to="/admin/revenue/calendar">
                  <Button variant="outline" size="sm" fullWidth iconRight={ChevronRight} className="text-xs sm:text-sm">
                    View in Rate Calendar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Refresh Confirmation Dialog */}
      <ConfirmModal
        open={showRefreshConfirm}
        onClose={() => setShowRefreshConfirm(false)}
        onConfirm={handleRefreshAll}
        title="Refresh All Data?"
        description="This will refresh all pricing rules, forecasts, and recommendations. Any unsaved manual adjustments may be overwritten."
        confirmText="Refresh"
        cancelText="Cancel"
        variant="warning"
      />

      {/* Custom Date Range Picker Dialog */}
      <Modal open={showDatePicker} onClose={() => setShowDatePicker(false)} size="sm">
        <ModalHeader>
          <ModalTitle className="text-base sm:text-lg">Select Date Range</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 sm:mb-2">
                Start Date
              </label>
              <DatePicker
                value={customDateRange.start}
                onChange={(val) => setCustomDateRange(prev => ({ ...prev, start: val }))}
                placeholder="Select start date"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 sm:mb-2">
                End Date
              </label>
              <DatePicker
                value={customDateRange.end}
                onChange={(val) => setCustomDateRange(prev => ({ ...prev, end: val }))}
                placeholder="Select end date"
                minDate={customDateRange.start}
                className="w-full"
              />
            </div>
            <div className="p-2.5 sm:p-3 rounded-lg bg-terra-50">
              <p className="text-xs sm:text-[13px] text-terra-700 font-medium">
                Selected range: <span className="font-semibold">{
                  customDateRange.start && customDateRange.end
                    ? Math.max(1, Math.ceil((new Date(customDateRange.end).getTime() - new Date(customDateRange.start).getTime()) / (1000 * 60 * 60 * 24)))
                    : 0
                } days</span>
              </p>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDatePicker(false)} className="text-xs sm:text-sm">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCustomDateApply} className="text-xs sm:text-sm">
            Apply
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RevenueDashboard;
