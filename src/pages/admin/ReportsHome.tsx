import { TrendingUp } from 'lucide-react';
import ReportCard from '../../components/reports/ReportCard';

const REPORTS = [
  {
    title: 'Bookings & Occupancy',
    description: 'Track booking trends, occupancy rates, ADR, and RevPAR metrics across all room categories.',
    href: '/admin/reports/bookings-occupancy'
  },
  {
    title: 'Housekeeping & Rooms',
    description: 'Monitor room status, housekeeping efficiency, maintenance issues, and turnover times.',
    href: '/admin/reports/housekeeping-rooms'
  },
  // {
  //   title: 'Revenue Snapshot',
  //   description: 'Comprehensive revenue analysis including daily trends, room type performance, and forecasts.',
  //   href: '/admin/reports/revenue-snapshot'
  // },
  // {
  //   title: 'Guest Experience',
  //   description: 'Analyze guest reviews, sentiment trends, and feedback across all booking channels.',
  //   href: '/admin/reports/guest-experience'
  // }
];

const QUICK_STATS = [
  { label: 'Reports Generated', value: 156, trend: '+12%', trendUp: true },
  { label: 'Last Report', value: '2h ago', trend: null },
  { label: 'Scheduled Reports', value: 8, trend: null },
  { label: 'Export Downloads', value: 42, trend: '+8%', trendUp: true }
];

export default function ReportsHome() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Reports
            </h1>
            <p className="text-[13px] text-neutral-500 mt-1">
              Operational insights and analytics for your property
            </p>
          </div>
        </header>


        {/* Quick Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {QUICK_STATS.map((stat, index) => (
            <div
              key={index}
              className="rounded-[10px] bg-white p-4 sm:p-6"
            >
              <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900">{stat.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[11px] text-neutral-400 font-medium">{stat.label}</p>
                {stat.trend && (
                  <span
                    className={`text-[11px] font-semibold ${
                      stat.trendUp ? 'text-sage-600' : 'text-gold-600'
                    }`}
                  >
                    {stat.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Report Cards Grid */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3 sm:mb-4">
            Available Reports
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {REPORTS.map((report, index) => (
              <ReportCard key={index} {...report} />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="rounded-[10px] bg-white p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-sage-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-800">Recent Activity</h3>
              <p className="text-[11px] text-neutral-400 font-medium">Latest report generations and exports</p>
            </div>
          </div>

          <div className="space-y-1">
            {[
              { action: 'Revenue Snapshot exported', user: 'Admin', time: '2 hours ago', type: 'export' },
              { action: 'Bookings & Occupancy viewed', user: 'Manager', time: '3 hours ago', type: 'view' },
              { action: 'Guest Experience report generated', user: 'Admin', time: '5 hours ago', type: 'generate' },
              { action: 'Housekeeping report scheduled', user: 'System', time: '1 day ago', type: 'schedule' }
            ].map((activity, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-neutral-100 last:border-b-0 gap-1 sm:gap-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.type === 'export'
                        ? 'bg-sage-500'
                        : activity.type === 'view'
                        ? 'bg-ocean-500'
                        : activity.type === 'generate'
                        ? 'bg-terra-500'
                        : 'bg-gold-500'
                    }`}
                  />
                  <span className="text-[12px] sm:text-[13px] text-neutral-700">{activity.action}</span>
                </div>
                <div className="flex items-center gap-4 ml-5 sm:ml-0">
                  <span className="text-[11px] text-neutral-500 font-medium">{activity.user}</span>
                  <span className="text-[11px] text-neutral-400">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
