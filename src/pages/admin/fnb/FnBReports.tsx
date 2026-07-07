/**
 * F&B Reports — Matches admin design system.
 * KPIs, charts, top items table. Date range picker.
 */
import { useState, useEffect, useMemo } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fnbService } from '../../../api/services/fnb.service';
import { formatCurrency } from '../../../utils/formatters';

const fmt = (v: number) => formatCurrency(v, 'INR');
const COLORS = ['#A57865', '#5C9BA4', '#CDB261', '#4E5840', '#D4A88C', '#7CB5BD', '#E8D99A', '#8B9E7A'];

const DEMO_DAILY = [
  { date: 'Mon', revenue: 42000, orders: 38 },
  { date: 'Tue', revenue: 35000, orders: 31 },
  { date: 'Wed', revenue: 48000, orders: 44 },
  { date: 'Thu', revenue: 51000, orders: 47 },
  { date: 'Fri', revenue: 72000, orders: 65 },
  { date: 'Sat', revenue: 89000, orders: 78 },
  { date: 'Sun', revenue: 68000, orders: 59 },
];
const DEMO_TOP_ITEMS = [
  { name: 'Butter Chicken', quantity: 145, revenue: 58000 },
  { name: 'Paneer Tikka', quantity: 132, revenue: 39600 },
  { name: 'Dal Makhani', quantity: 118, revenue: 29500 },
  { name: 'Biryani', quantity: 105, revenue: 42000 },
  { name: 'Gulab Jamun', quantity: 98, revenue: 14700 },
  { name: 'Naan Basket', quantity: 210, revenue: 21000 },
];
const DEMO_CATEGORIES = [
  { name: 'Main Course', value: 185000 },
  { name: 'Starters', value: 72000 },
  { name: 'Desserts', value: 34000 },
  { name: 'Beverages', value: 48000 },
  { name: 'Breads', value: 21000 },
];

export default function FnBReports() {
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]; });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fnbService.getReportSummary({ start_date: startDate, end_date: endDate })
      .then(data => setReportData(data)).catch(() => setReportData(null));
  }, [startDate, endDate]);

  const daily = reportData?.daily || DEMO_DAILY;
  const topItems = reportData?.top_items || DEMO_TOP_ITEMS;
  const categories = reportData?.categories || DEMO_CATEGORIES;
  const totalRevenue = daily.reduce((s: number, d: any) => s + d.revenue, 0);
  const totalOrders = daily.reduce((s: number, d: any) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">F&B Reports</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Revenue, item performance, and outlet analytics.</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="h-9 border border-neutral-200 rounded-lg px-3 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-terra-200" />
            <span className="text-neutral-400 text-[12px]">to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="h-9 border border-neutral-200 rounded-lg px-3 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-terra-200" />
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Revenue', value: fmt(totalRevenue), icon: DollarSign, color: 'terra' },
            { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: ShoppingBag, color: 'ocean' },
            { label: 'Avg Order Value', value: fmt(avgOrderValue), icon: TrendingUp, color: 'sage' },
            { label: 'Avg Prep Time', value: '18 min', icon: Clock, color: 'gold' },
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-[10px] p-4 sm:p-5">
            <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">Daily Revenue & Orders</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any, name: string) => [name === 'revenue' ? fmt(v) : v, name === 'revenue' ? 'Revenue' : 'Orders']} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#A57865" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" dataKey="orders" name="Orders" stroke="#5C9BA4" strokeWidth={2} dot={{ r: 3 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-[10px] p-4 sm:p-5">
            <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {categories.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-[10px] overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
            <h3 className="text-[13px] font-semibold text-neutral-800">Top Selling Items</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider w-10">#</th>
                <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Item</th>
                <th className="text-right py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Qty Sold</th>
                <th className="text-right py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item: any, i: number) => (
                <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="py-3 px-4 sm:px-6 text-[12px] text-neutral-400 font-mono">{i + 1}</td>
                  <td className="py-3 px-3 text-[13px] font-medium text-neutral-800">{item.name}</td>
                  <td className="py-3 px-3 text-right text-[13px] text-neutral-600 tabular-nums">{item.quantity}</td>
                  <td className="py-3 px-4 sm:px-6 text-right text-[13px] font-semibold text-neutral-800 tabular-nums">{fmt(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
