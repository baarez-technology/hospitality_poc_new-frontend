import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, AlertTriangle, Lightbulb, Info, Loader2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { reportsService, HousekeepingRoomsReport as HousekeepingRoomsReportType, AIInsight, ExportFormat } from '../../api/services/reports.service';
import { useToast } from '@/contexts/ToastContext';

const STATUS_COLORS: Record<string, string> = {
  clean: '#4E5840',
  dirty: '#CDB261',
  inspecting: '#5C9BA4',
  maintenance: '#A57865',
  Clean: '#4E5840',
  Dirty: '#CDB261',
  Inspecting: '#5C9BA4',
  Maintenance: '#A57865'
};

const getInsightIcon = (type: AIInsight['type']) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'opportunity':
      return <Lightbulb className="w-4 h-4 text-green-500" />;
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const getInsightBgColor = (type: AIInsight['type']) => {
  switch (type) {
    case 'warning':
      return 'bg-amber-50 border-amber-200';
    case 'opportunity':
      return 'bg-green-50 border-green-200';
    default:
      return 'bg-blue-50 border-blue-200';
  }
};

const EXPORT_OPTIONS: { value: ExportFormat; label: string; icon: string }[] = [
  { value: 'csv', label: 'CSV Spreadsheet', icon: '📄' },
  { value: 'excel', label: 'Excel Workbook', icon: '📊' },
  { value: 'pdf', label: 'PDF Document', icon: '📑' },
];

export default function HousekeepingRoomsReport() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<HousekeepingRoomsReportType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setError(null);
      const data = await reportsService.getHousekeepingRoomsReport();
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch housekeeping report:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReport();
  };

  const { success, error: showError } = useToast();

  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      setExportDropdownOpen(false);
      await reportsService.getHousekeepingRoomsReport(format);
      success(`Report exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export failed:', err);
      showError('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-terra-500" />
          <p className="text-neutral-600">Loading housekeeping report...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
          <p className="text-neutral-600">{error || 'Failed to load report'}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-terra-500 text-white rounded-lg text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, room_status_distribution, turnover_by_floor, room_details, active_issues, ai_insights } = reportData;

  const totalRooms = room_status_distribution.reduce((sum, s) => sum + s.value, 0);

  // Transform turnover data for bar chart
  const turnoverChartData = turnover_by_floor.map(f => ({
    name: f.floor,
    avgTurnover: f.turnover_time,
    rooms: f.rooms_cleaned
  }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/admin/reports')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-white border border-neutral-200 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-600" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-neutral-900">Housekeeping & Rooms</h1>
              <p className="text-[12px] sm:text-[13px] text-neutral-500">Room status and efficiency metrics</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-white border border-neutral-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-neutral-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                disabled={isExporting}
                className="h-8 sm:h-9 px-3 sm:px-4 pr-8 sm:pr-9 rounded-lg bg-terra-500 text-white text-[12px] sm:text-[13px] font-medium flex items-center gap-2 hover:bg-terra-600 transition-colors disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
                <ChevronDown className={`w-4 h-4 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 transition-transform flex-shrink-0 ${exportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {exportDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportDropdownOpen(false)} />
                  <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50">
                    {EXPORT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleExport(option.value)}
                        className="w-full px-3 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                      >
                        <span>{option.icon}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Clean</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.clean_rooms}</p>
            <p className="text-[10px] sm:text-[11px] text-sage-600 font-medium mt-1">Ready for guests</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Dirty</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.dirty_rooms}</p>
            <p className="text-[10px] sm:text-[11px] text-gold-600 font-medium mt-1">Needs cleaning</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Inspecting</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.inspecting_rooms}</p>
            <p className="text-[10px] sm:text-[11px] text-ocean-600 font-medium mt-1">Being checked</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Maintenance</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.maintenance_rooms}</p>
            <p className="text-[10px] sm:text-[11px] text-terra-600 font-medium mt-1">Under repair</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Avg Turnover</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.avg_turnover_time}<span className="text-xs sm:text-sm text-neutral-400 ml-1">min</span></p>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium mt-1">Per room</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Inspection Score</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.inspection_score}%</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${summary.inspection_score >= 90 ? 'text-sage-600' : summary.inspection_score >= 75 ? 'text-amber-500' : 'text-red-500'}`}>
              {summary.inspection_score >= 90 ? 'Excellent' : summary.inspection_score >= 75 ? 'Good' : 'Needs improvement'}
            </p>
          </div>
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Room Status Pie Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Room Status Distribution</h3>
            <p className="text-[12px] text-neutral-500 mb-4">{totalRooms} total rooms</p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={room_status_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {room_status_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || STATUS_COLORS[entry.name] || '#CDB261'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2 sm:space-y-3 w-full">
                {room_status_distribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || STATUS_COLORS[item.name] || '#CDB261' }} />
                      <span className="text-[12px] sm:text-[13px] text-neutral-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[12px] sm:text-[13px] font-medium text-neutral-900">{item.value}</span>
                      <span className="text-[10px] sm:text-[11px] text-neutral-400 w-8 sm:w-10 text-right">
                        {totalRooms > 0 ? ((item.value / totalRooms) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Turnover Bar Chart */}
          <div className="xl:col-span-3 bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Turnover Time by Floor</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Average minutes per room</p>

            <div className="h-44 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnoverChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#737373' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#737373' }}
                    width={30}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-neutral-900 text-white text-[12px] px-3 py-2 rounded-lg">
                            <p className="font-medium">{payload[0].payload.name}</p>
                            <p>{payload[0].value} min avg</p>
                            <p className="text-neutral-400">{payload[0].payload.rooms} rooms cleaned</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgTurnover" fill="#5C9BA4" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Tables Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Room Status Table */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Room Details</h3>
            <p className="text-[12px] text-neutral-500 mb-3 sm:mb-4">Current status of all rooms</p>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-neutral-100">
                    <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Room</th>
                    <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Type</th>
                    <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Status</th>
                    <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {room_details.slice(0, 10).map((room, index) => (
                    <tr key={index} className="border-b border-neutral-50 last:border-0">
                      <td className="py-3 text-[13px] font-medium text-neutral-900">{room.room_number}</td>
                      <td className="py-3 text-[13px] text-neutral-600">{room.room_type}</td>
                      <td className="py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium"
                          style={{ color: STATUS_COLORS[room.status] || STATUS_COLORS[room.status.toLowerCase()] || '#737373' }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: STATUS_COLORS[room.status] || STATUS_COLORS[room.status.toLowerCase()] || '#737373' }}
                          />
                          {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 text-[13px] text-neutral-600">{room.assigned_to || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Issues Table */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Active Issues</h3>
            <p className="text-[12px] text-neutral-500 mb-3 sm:mb-4">{active_issues.length} rooms need attention</p>

            {active_issues.length > 0 ? (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-neutral-100">
                      <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Room</th>
                      <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Issue</th>
                      <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Priority</th>
                      <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active_issues.slice(0, 10).map((issue, index) => (
                      <tr key={index} className="border-b border-neutral-50 last:border-0">
                        <td className="py-3 text-[13px] font-medium text-neutral-900">{issue.room}</td>
                        <td className="py-3 text-[13px] text-neutral-600 max-w-[200px] truncate">{issue.issue}</td>
                        <td className="py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                              issue.priority.toLowerCase() === 'high'
                                ? 'bg-terra-50 text-terra-700'
                                : issue.priority.toLowerCase() === 'medium'
                                ? 'bg-gold-50 text-gold-700'
                                : 'bg-neutral-50 text-neutral-700'
                            }`}
                          >
                            {issue.priority}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            issue.status.toLowerCase() === 'resolved' ? 'bg-sage-50 text-sage-700' :
                            issue.status.toLowerCase() === 'in progress' ? 'bg-ocean-50 text-ocean-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {issue.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-[13px] text-neutral-500">No active issues</p>
              </div>
            )}
          </div>
        </section>

        {/* AI Insights Section */}
        {ai_insights && ai_insights.length > 0 && (
          <section className="bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">AI Insights</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Intelligent recommendations for housekeeping operations</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {ai_insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 sm:p-4 rounded-lg border ${getInsightBgColor(insight.type)}`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-[12px] sm:text-[13px] font-semibold text-neutral-900 truncate">{insight.title}</h4>
                        <span className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                          insight.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-neutral-600 mb-2">{insight.message}</p>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500 italic">{insight.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
