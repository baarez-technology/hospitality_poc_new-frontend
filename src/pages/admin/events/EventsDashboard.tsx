/**
 * Events Dashboard — Inquiry list matching Bookings page pattern.
 * Tabs + SearchBar + filters + table + drawer.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CalendarDays, Users, TrendingUp, FileText, Eye } from 'lucide-react';
import { useEvents } from '../../../hooks/admin/useEvents';
import InquiryDrawer from '../../../components/events/InquiryDrawer';
import { EVENT_TYPES, EVENT_STATUS_CONFIG } from '../../../utils/events';
import { formatCurrency } from '../../../utils/formatters';
import { SearchBar } from '../../../components/ui2/SearchBar';
import { Badge } from '../../../components/ui2/Badge';

const fmt = (v: number) => formatCurrency(v, 'INR');

const STATUS_VARIANTS: Record<string, string> = {
  inquiry: 'neutral', proposal_sent: 'info', confirmed: 'success',
  upcoming: 'warning', active: 'primary', completed: 'neutral', cancelled: 'danger',
};

export default function EventsDashboard() {
  const navigate = useNavigate();
  const {
    inquiries, loading, stats,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    searchQuery, setSearchQuery,
    createInquiry,
  } = useEvents();

  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleCreateInquiry = async (data: any) => {
    const result = await createInquiry(data);
    if (result) {
      setShowDrawer(false);
      navigate(`/admin/events/builder/${result.id}`);
    }
    return result;
  };

  // Tab-filtered inquiries
  const tabFiltered = activeTab === 'all' ? inquiries
    : activeTab === 'active' ? inquiries.filter(i => ['confirmed', 'upcoming', 'active'].includes(i.status))
    : activeTab === 'pipeline' ? inquiries.filter(i => ['inquiry', 'proposal_sent'].includes(i.status))
    : activeTab === 'completed' ? inquiries.filter(i => ['completed', 'cancelled'].includes(i.status))
    : inquiries;

  const tabs = [
    { id: 'all', label: 'All Inquiries', short: 'All', count: inquiries.length },
    { id: 'pipeline', label: 'Pipeline', short: 'Pipeline', count: stats.pipeline },
    { id: 'active', label: 'Confirmed', short: 'Active', count: stats.confirmed },
    { id: 'completed', label: 'Completed', short: 'Done', count: inquiries.filter(i => ['completed', 'cancelled'].includes(i.status)).length },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Events & Banquets</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              Manage event inquiries, proposals, and bookings.
            </p>
          </div>
          <button onClick={() => setShowDrawer(true)}
            className="h-9 px-4 rounded-lg bg-terra-600 text-white text-[13px] font-semibold flex items-center gap-1.5 hover:bg-terra-700 transition-colors self-start sm:self-auto">
            <Plus className="w-4 h-4" /> New Inquiry
          </button>
        </header>

        {/* KPIs — matching Dashboard LuxuryKPICard pattern */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Inquiries', value: String(stats.total), icon: FileText, color: 'ocean' },
            { label: 'Confirmed', value: String(stats.confirmed), icon: CalendarDays, color: 'sage' },
            { label: 'Pipeline', value: String(stats.pipeline), icon: Users, color: 'gold' },
            { label: 'Revenue', value: fmt(stats.revenue), icon: TrendingUp, color: 'terra' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-[10px] p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-${kpi.color}-50`}>
                  <kpi.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-${kpi.color}-600`} />
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">{kpi.label}</p>
              </div>
              <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 tabular-nums">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[10px] overflow-hidden">

          {/* Tabs — Bookings pattern */}
          <div className="border-b border-neutral-100">
            <div className="px-3 sm:px-6 pt-3 sm:pt-4 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
                  }`}>
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.short}</span>
                    <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold tabular-nums ${
                      activeTab === tab.id ? 'bg-terra-500 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}>{tab.count}</span>
                  </span>
                  {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-terra-500 rounded-t-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Search + Filters */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-full sm:flex-1 sm:max-w-md">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} placeholder="Search inquiries..." />
              </div>
              <div className="hidden sm:block sm:flex-1" />
              <div className="flex items-center gap-2">
                {/* Status filter pills */}
                <div className="flex items-center gap-1">
                  {[['', 'All'], ...Object.entries(EVENT_STATUS_CONFIG).slice(0, 4).map(([k, v]) => [k, v.label])].map(([val, label]) => (
                    <button key={val} onClick={() => setStatusFilter(val)}
                      className={`h-8 px-3 rounded-lg text-[12px] font-medium transition-colors ${
                        statusFilter === val
                          ? 'bg-terra-50 text-terra-700 border border-terra-200'
                          : 'text-neutral-500 hover:bg-neutral-100 border border-transparent'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-[3px] border-neutral-200 border-t-terra-600 rounded-full animate-spin" />
            </div>
          ) : tabFiltered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <CalendarDays className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-[13px] font-medium text-neutral-500">No inquiries found</p>
              <button onClick={() => setShowDrawer(true)} className="mt-3 text-[12px] text-terra-600 font-semibold hover:text-terra-700">+ New Inquiry</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Inquiry</th>
                    <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Event</th>
                    <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden md:table-cell">Contact</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden lg:table-cell">Dates</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden sm:table-cell">Guests</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                    <th className="w-10 py-3 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {tabFiltered.map(inq => {
                    const statusCfg = EVENT_STATUS_CONFIG[inq.status] || EVENT_STATUS_CONFIG.inquiry;
                    const typeCfg = EVENT_TYPES.find(t => t.value === inq.event_type);
                    return (
                      <tr key={inq.id} onClick={() => navigate(`/admin/events/builder/${inq.id}`)}
                        className="border-b border-neutral-50 cursor-pointer hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 sm:px-6">
                          <p className="text-[12px] text-neutral-400 font-mono">{inq.inquiry_number || `INQ-${inq.id}`}</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-[13px] font-medium text-neutral-900">{inq.event_name}</p>
                          <p className="text-[11px] text-neutral-400 mt-0.5 capitalize">{typeCfg?.label || inq.event_type}</p>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <p className="text-[12px] text-neutral-700">{inq.contact_name}</p>
                          <p className="text-[10px] text-neutral-400">{inq.contact_phone}</p>
                        </td>
                        <td className="py-3 px-3 text-center hidden lg:table-cell">
                          {inq.start_date && (
                            <span className="text-[11px] text-neutral-500">
                              {new Date(inq.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              {' – '}
                              {new Date(inq.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center hidden sm:table-cell">
                          <span className="text-[12px] font-medium text-neutral-700 tabular-nums">{inq.expected_guests}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={(STATUS_VARIANTS[inq.status] || 'neutral') as any} size="xs">
                            {statusCfg.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <button className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {tabFiltered.length > 0 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
              <p className="text-[11px] sm:text-[13px] text-neutral-500">
                Showing <span className="font-semibold text-neutral-700">{tabFiltered.length}</span> of <span className="font-semibold text-neutral-700">{inquiries.length}</span> inquiries
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Inquiry Drawer */}
      <InquiryDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} onSubmit={handleCreateInquiry} />
    </div>
  );
}
