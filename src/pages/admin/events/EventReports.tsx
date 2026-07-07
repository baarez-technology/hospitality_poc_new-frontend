/**
 * Event Reports — Matches admin design: KPIs + charts + hall utilization + funnel.
 */
import { useState } from 'react';
import { CalendarDays, TrendingUp, Building2, Users } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../../utils/formatters';
import { Input } from '../../../components/ui2/Input';

const fmt = (v: number) => formatCurrency(v, 'INR');
const COLORS = ['#A57865', '#5C9BA4', '#CDB261', '#4E5840', '#D4A88C', '#7CB5BD'];

const DEMO_MONTHLY = [
  { month: 'Jan', events: 4, revenue: 820000 },
  { month: 'Feb', events: 6, revenue: 1240000 },
  { month: 'Mar', events: 8, revenue: 1680000 },
  { month: 'Apr', events: 5, revenue: 1050000 },
  { month: 'May', events: 7, revenue: 1520000 },
  { month: 'Jun', events: 9, revenue: 2100000 },
];
const DEMO_BY_TYPE = [
  { name: 'Wedding', value: 4200000 },
  { name: 'Corporate', value: 2800000 },
  { name: 'Conference', value: 1500000 },
  { name: 'Social', value: 900000 },
  { name: 'Birthday', value: 600000 },
];
const DEMO_HALL_UTIL = [
  { hall: 'Grand Ballroom', utilization: 78, bookings: 24 },
  { hall: 'Crystal Hall', utilization: 65, bookings: 18 },
  { hall: 'Garden Pavilion', utilization: 52, bookings: 14 },
  { hall: 'Board Room', utilization: 88, bookings: 42 },
  { hall: 'Terrace Deck', utilization: 35, bookings: 8 },
];
const DEMO_FUNNEL = [
  { stage: 'Inquiries', count: 85 },
  { stage: 'Proposals', count: 52 },
  { stage: 'Confirmed', count: 34 },
  { stage: 'Completed', count: 29 },
];

export default function EventReports() {
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() - 6); return d.toISOString().split('T')[0]; });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const totalRevenue = DEMO_MONTHLY.reduce((s, d) => s + d.revenue, 0);
  const totalEvents = DEMO_MONTHLY.reduce((s, d) => s + d.events, 0);
  const avgHallUtil = Math.round(DEMO_HALL_UTIL.reduce((s, h) => s + h.utilization, 0) / DEMO_HALL_UTIL.length);
  const conversionRate = Math.round((DEMO_FUNNEL[2].count / DEMO_FUNNEL[0].count) * 100);

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Event Reports</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Revenue, hall utilization, and inquiry analytics.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-36"><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} size="md" /></div>
            <span className="text-[12px] text-neutral-400">to</span>
            <div className="w-36"><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} size="md" /></div>
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Revenue', value: fmt(totalRevenue), icon: TrendingUp, color: 'terra' },
            { label: 'Total Events', value: String(totalEvents), icon: CalendarDays, color: 'ocean' },
            { label: 'Hall Utilization', value: `${avgHallUtil}%`, icon: Building2, color: 'sage' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Users, color: 'gold' },
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Revenue */}
          <div className="bg-white rounded-[10px] p-4 sm:p-5">
            <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">Monthly Event Revenue</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={DEMO_MONTHLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#A57865" radius={[4, 4, 0, 0]} />
                <Bar dataKey="events" name="Events" fill="#5C9BA4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Type */}
          <div className="bg-white rounded-[10px] p-4 sm:p-5">
            <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">Revenue by Event Type</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={DEMO_BY_TYPE} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {DEMO_BY_TYPE.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hall Utilization + Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Hall Utilization */}
          <div className="bg-white rounded-[10px] p-4 sm:p-5">
            <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">Hall Utilization</h3>
            <div className="space-y-3">
              {DEMO_HALL_UTIL.map(hall => (
                <div key={hall.hall}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-medium text-neutral-700">{hall.hall}</span>
                    <span className="text-[11px] text-neutral-500 tabular-nums">{hall.utilization}% · {hall.bookings} bookings</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${hall.utilization >= 75 ? 'bg-emerald-500' : hall.utilization >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                      style={{ width: `${hall.utilization}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-[10px] p-4 sm:p-5">
            <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">Inquiry-to-Booking Funnel</h3>
            <div className="space-y-3">
              {DEMO_FUNNEL.map((stage, i) => {
                const width = Math.round((stage.count / DEMO_FUNNEL[0].count) * 100);
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-neutral-700">{stage.stage}</span>
                      <span className="text-[13px] font-semibold text-neutral-800 tabular-nums">{stage.count}</span>
                    </div>
                    <div className="h-8 bg-neutral-100 rounded-lg overflow-hidden">
                      <div className="h-full rounded-lg flex items-center justify-center text-[11px] font-semibold text-white transition-all"
                        style={{ width: `${width}%`, backgroundColor: COLORS[i] }}>
                        {width}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
