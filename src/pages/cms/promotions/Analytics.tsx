/**
 * CMS Promotion Analytics Page
 * Comprehensive analytics dashboard for individual promotions
 * Route: /admin/cms/promotions/:id/analytics
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Percent,
  BarChart3,
  Sparkles,
  Calendar,
  Globe,
  Bed,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Clock,
  Tag,
  Layers,
  ArrowUpRight,
  Copy,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';
import Breadcrumb from '../../../components/ui/Breadcrumb';
import {
  getPromotionById,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateRange
} from '../../../data/cmsPromotionAnalytics';

// Status badge component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Paused: 'bg-amber-100 text-amber-700 border-amber-200',
    Expired: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    Scheduled: 'bg-sky-100 text-sky-700 border-sky-200'
  };

  const darkStatusStyles = {
    Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Expired: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
    Scheduled: 'bg-sky-500/20 text-sky-400 border-sky-500/30'
  };

  const { isDark } = useTheme();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${
      isDark ? darkStatusStyles[status] : statusStyles[status]
    }`}>
      <span className={`w-2 h-2 rounded-full ${
        status === 'Active' ? 'bg-emerald-500' :
        status === 'Paused' ? 'bg-amber-500' :
        status === 'Expired' ? 'bg-neutral-400' :
        'bg-sky-500'
      }`} />
      {status}
    </span>
  );
};

// Trend badge component
const TrendBadge = ({ value, suffix = '%' }) => {
  const { isDark } = useTheme();
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
      isNeutral
        ? isDark ? 'bg-neutral-500/20 text-neutral-400' : 'bg-neutral-100 text-neutral-600'
        : isPositive
          ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
          : isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700'
    }`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : isNeutral ? null : <TrendingDown className="w-3 h-3" />}
      {isPositive ? '+' : ''}{value}{suffix}
    </span>
  );
};

// Premium KPI Card component
const KPICard = ({ icon: Icon, label, value, trend, trendLabel, iconBg, iconColor }) => {
  const { isDark } = useTheme();

  return (
    <div className={`group p-7 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${
      isDark
        ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm hover:border-white/[0.15]'
        : 'luxury-glass hover:shadow-xl'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
      <div>
        <p className={`text-3xl font-bold mb-2 group-hover:text-[#A57865] transition-colors ${isDark ? 'text-white' : 'text-neutral-900'}`}>
          {value}
        </p>
        <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
          {label}
        </p>
        {trendLabel && (
          <p className={`text-xs mt-2 ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
            {trendLabel}
          </p>
        )}
      </div>
    </div>
  );
};

// Section header component
const SectionHeader = ({ icon: Icon, title, subtitle, action }) => {
  const { isDark } = useTheme();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? 'bg-[#A57865]/20' : 'bg-[#A57865]/10'
          }`}>
            <Icon className={`w-5 h-5 ${isDark ? 'text-[#CDB261]' : 'text-[#A57865]'}`} />
          </div>
        )}
        <div>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, isDark, formatter }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className={`px-4 py-3 rounded-xl shadow-lg border ${
      isDark
        ? 'bg-[#1a1a1a] border-white/10'
        : 'bg-white border-neutral-200'
    }`}>
      <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className={isDark ? 'text-white/60' : 'text-neutral-600'}>
            {entry.name}:
          </span>
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Main Analytics Page Component
export default function PromotionAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = getPromotionById(id);
      setPromotion(data);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleEditPromotion = () => {
    console.log('Opening edit modal for promotion:', id);
    // In real app, open edit modal
  };

  const handleApplyRecommendation = (rec) => {
    console.log('Applying recommendation:', rec.title);
    // In real app, apply the recommendation
  };

  const scrollToInsights = () => {
    document.getElementById('ai-insights-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#FAF7F4]'}`}>
        <div className="max-w-[1440px] mx-auto px-8 py-6">
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-6 h-6 animate-spin ${isDark ? 'text-white/40' : 'text-neutral-400'}`} />
              <span className={isDark ? 'text-white/60' : 'text-neutral-600'}>Loading analytics...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#FAF7F4]'}`}>
        <div className="max-w-[1440px] mx-auto px-8 py-6">
          <div className="flex flex-col items-center justify-center h-96">
            <AlertCircle className={`w-12 h-12 mb-4 ${isDark ? 'text-white/30' : 'text-neutral-300'}`} />
            <p className={`text-lg font-semibold ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
              Promotion not found
            </p>
            <button
              onClick={() => navigate('/admin/cms/promotions')}
              className="mt-4 px-4 py-2 text-sm font-semibold text-[#A57865] hover:underline"
            >
              Back to Promotions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a]' : 'luxury-bg'}`}>
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-6">

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Central Management System' },
            { label: 'Promotions', href: '/admin/cbs/promotions' },
            { label: promotion?.name || 'Analytics' }
          ]}
        />

        {/* ==================== 1. PREMIUM PROMOTION HEADER ==================== */}
        <div className={`p-8 rounded-3xl ${
          isDark
            ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm'
            : 'luxury-glass'
        }`}>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Promotion Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {promotion.name}
                </h1>
                <StatusBadge status={promotion.status} />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                {/* Date Range */}
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-neutral-400'}`} />
                  <span className={`text-sm ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
                    {formatDateRange(promotion.dateRange.start, promotion.dateRange.end)}
                  </span>
                </div>

                {/* Channels */}
                <div className="flex items-center gap-2">
                  <Globe className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-neutral-400'}`} />
                  <div className="flex items-center gap-1">
                    {promotion.channels.map((channel, idx) => (
                      <span
                        key={channel}
                        className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                          isDark ? 'bg-[#5C9BA4]/20 text-[#5C9BA4]' : 'bg-[#5C9BA4]/10 text-[#5C9BA4]'
                        }`}
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Room Types */}
                <div className="flex items-center gap-2">
                  <Bed className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-neutral-400'}`} />
                  <div className="flex items-center gap-1">
                    {promotion.roomTypes.map((type) => (
                      <span
                        key={type}
                        className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                          isDark ? 'bg-[#CDB261]/20 text-[#CDB261]' : 'bg-[#CDB261]/10 text-[#B8A050]'
                        }`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleEditPromotion}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A57865] to-[#8E6554] hover:from-[#8E6554] hover:to-[#7A5745] text-white font-semibold text-sm transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit Promotion
              </button>
            </div>
          </div>
        </div>

        {/* ==================== 2. TOP KPI METRICS ROW ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard
            icon={Users}
            label="Total Redemptions"
            value={promotion.metrics.redemptions.toLocaleString()}
            trend={promotion.metrics.trend.redemptions}
            trendLabel="vs last period"
            iconBg={isDark ? 'bg-[#5C9BA4]/20' : 'bg-[#5C9BA4]/10'}
            iconColor="text-[#5C9BA4]"
          />
          <KPICard
            icon={DollarSign}
            label="Incremental Revenue"
            value={formatCurrency(promotion.metrics.revenue)}
            trend={promotion.metrics.trend.revenue}
            trendLabel="vs last period"
            iconBg={isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
            iconColor={isDark ? 'text-emerald-400' : 'text-emerald-600'}
          />
          <KPICard
            icon={Percent}
            label="ADR Uplift"
            value={`${promotion.metrics.adrUplift}%`}
            trend={promotion.metrics.trend.adr}
            trendLabel="vs BAR"
            iconBg={isDark ? 'bg-[#A57865]/20' : 'bg-[#A57865]/10'}
            iconColor="text-[#A57865]"
          />
          <KPICard
            icon={BarChart3}
            label="Occupancy Impact"
            value={`+${promotion.metrics.occupancyImpact}%`}
            trend={promotion.metrics.trend.occupancy}
            trendLabel="vs baseline"
            iconBg={isDark ? 'bg-[#CDB261]/20' : 'bg-[#CDB261]/10'}
            iconColor="text-[#CDB261]"
          />
        </div>

        {/* ==================== 3. AI INSIGHTS BANNER ==================== */}
        <div className={`relative overflow-hidden p-8 rounded-2xl ${
          isDark
            ? 'bg-gradient-to-r from-[#A57865]/20 via-[#A57865]/10 to-[#CDB261]/10 border border-white/[0.08] backdrop-blur-sm'
            : 'bg-gradient-to-r from-[#A57865]/10 via-[#C8B29D]/10 to-[#CDB261]/5 luxury-glass'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#CDB261]/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-[#CDB261]/20' : 'bg-[#CDB261]/15'
              }`}>
                <Sparkles className="w-7 h-7 text-[#CDB261]" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {promotion.aiInsights[0].headline}
                </h3>
                <p className={`text-sm mt-1 max-w-xl ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
                  {promotion.aiInsights[0].detail}
                </p>
              </div>
            </div>
            <button
              onClick={scrollToInsights}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/15'
                  : 'bg-white text-[#A57865] hover:bg-[#A57865]/5 border border-[#A57865]/20'
              }`}
            >
              View More Insights
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ==================== 4. REVENUE CHART ==================== */}
        <div className={`p-8 rounded-2xl ${
          isDark
            ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm'
            : 'luxury-glass'
        }`}>
          <SectionHeader
            icon={DollarSign}
            title="Revenue Performance"
            subtitle="Incremental revenue and rate comparison over time"
          />

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={promotion.revenueTimeline}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A57865" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A57865" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 12 }}
                  axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <CustomTooltip
                      active={active}
                      payload={payload}
                      label={formatDate(label)}
                      isDark={isDark}
                      formatter={(val, name) => name === 'Incremental Revenue' ? formatCurrency(val) : `₹${val}`}
                    />
                  )}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => (
                    <span className={isDark ? 'text-white/60' : 'text-neutral-600'}>{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="incrementalRevenue"
                  name="Incremental Revenue"
                  stroke="#A57865"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="barRate"
                  name="BAR Rate"
                  stroke="#5C9BA4"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="promoRate"
                  name="Promo Rate"
                  stroke="#CDB261"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ==================== 5. REDEMPTIONS CHART ==================== */}
        <div className={`p-8 rounded-2xl ${
          isDark
            ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm'
            : 'luxury-glass'
        }`}>
          <SectionHeader
            icon={Users}
            title="Redemptions Over Time"
            subtitle="Daily promotion usage and booking patterns"
          />

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={promotion.redemptionsTimeline}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5C9BA4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#5C9BA4" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 12 }}
                  axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <CustomTooltip
                      active={active}
                      payload={payload}
                      label={formatDate(label)}
                      isDark={isDark}
                    />
                  )}
                />
                <Bar
                  dataKey="redemptions"
                  name="Redemptions"
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ==================== 6 & 7. PERFORMANCE TABLES ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Channel Performance */}
          <div className={`p-8 rounded-2xl ${
            isDark
              ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm'
              : 'luxury-glass'
          }`}>
            <SectionHeader
              icon={Globe}
              title="Channel Performance"
              subtitle="Breakdown by distribution channel"
            />

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-white/[0.08]' : 'border-neutral-200'}`}>
                    <th className={`text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>Channel</th>
                    <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>Redemptions</th>
                    <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>Revenue</th>
                    <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>ADR</th>
                    <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>Conv.</th>
                    <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {promotion.channelPerformance.map((channel, idx) => (
                    <tr
                      key={channel.channel}
                      className={`border-b last:border-b-0 ${isDark ? 'border-white/[0.04]' : 'border-neutral-100'}`}
                    >
                      <td className={`py-3 px-2 font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {channel.channel}
                      </td>
                      <td className={`py-3 px-2 text-right ${isDark ? 'text-white/70' : 'text-neutral-700'}`}>
                        {channel.redemptions}
                      </td>
                      <td className={`py-3 px-2 text-right font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {formatCurrency(channel.revenue)}
                      </td>
                      <td className={`py-3 px-2 text-right ${isDark ? 'text-white/70' : 'text-neutral-700'}`}>
                        ${channel.adr}
                      </td>
                      <td className={`py-3 px-2 text-right ${isDark ? 'text-white/70' : 'text-neutral-700'}`}>
                        {channel.conversion}%
                      </td>
                      <td className="py-3 px-2 text-right">
                        <TrendBadge value={channel.trend} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Room Type Performance */}
          <div className={`p-8 rounded-2xl ${
            isDark
              ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm'
              : 'luxury-glass'
          }`}>
            <SectionHeader
              icon={Bed}
              title="Room Type Performance"
              subtitle="Breakdown by room category"
            />

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-white/[0.08]' : 'border-neutral-200'}`}>
                    <th className={`text-left py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>Room Type</th>
                    <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>Revenue</th>
                    <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>Redemptions</th>
                    <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>Uplift</th>
                    <th className={`text-right py-3 px-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {promotion.roomTypePerformance.map((room) => (
                    <tr
                      key={room.type}
                      className={`border-b last:border-b-0 ${isDark ? 'border-white/[0.04]' : 'border-neutral-100'}`}
                    >
                      <td className={`py-3 px-2 font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        <span className={`inline-flex items-center gap-2`}>
                          <span className={`w-2 h-2 rounded-full ${
                            room.type === 'Suite' ? 'bg-[#CDB261]' : 'bg-[#5C9BA4]'
                          }`} />
                          {room.type}
                        </span>
                      </td>
                      <td className={`py-3 px-2 text-right font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {formatCurrency(room.revenue)}
                      </td>
                      <td className={`py-3 px-2 text-right ${isDark ? 'text-white/70' : 'text-neutral-700'}`}>
                        {room.redemptions}
                      </td>
                      <td className={`py-3 px-2 text-right`}>
                        <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          +{room.uplift}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <TrendBadge value={room.trend} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ==================== 8. FORECAST SIMULATION ==================== */}
        <div className={`p-8 rounded-2xl ${
          isDark
            ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm'
            : 'luxury-glass'
        }`}>
          <SectionHeader
            icon={Target}
            title="AI Forecast Simulation"
            subtitle="Predicted performance if promotion continues"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-xl ${
              isDark ? 'bg-white/[0.03] shadow-md shadow-black/10' : 'bg-[#FAF7F4] shadow-md shadow-neutral-200/50'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-white/40' : 'text-neutral-500'
                }`}>Next 7 Days Revenue</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {formatCurrency(promotion.forecast.next7daysRevenue)}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                Projected increase
              </p>
            </div>

            <div className={`p-5 rounded-xl ${
              isDark ? 'bg-white/[0.03] shadow-md shadow-black/10' : 'bg-[#FAF7F4] shadow-md shadow-neutral-200/50'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Users className={`w-4 h-4 ${isDark ? 'text-[#5C9BA4]' : 'text-[#5C9BA4]'}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-white/40' : 'text-neutral-500'
                }`}>Predicted Redemptions</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {promotion.forecast.next7daysRedemptions}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#5C9BA4]' : 'text-[#5C9BA4]'}`}>
                Next week estimate
              </p>
            </div>

            <div className={`p-5 rounded-xl ${
              isDark ? 'bg-white/[0.03] shadow-md shadow-black/10' : 'bg-[#FAF7F4] shadow-md shadow-neutral-200/50'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className={`w-4 h-4 ${isDark ? 'text-[#A57865]' : 'text-[#A57865]'}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-white/40' : 'text-neutral-500'
                }`}>Forecasted ADR</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                ${promotion.forecast.predictedADR}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#A57865]' : 'text-[#A57865]'}`}>
                Average daily rate
              </p>
            </div>

            <div className={`p-5 rounded-xl ${
              isDark ? 'bg-white/[0.03] shadow-md shadow-black/10' : 'bg-[#FAF7F4] shadow-md shadow-neutral-200/50'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-[#CDB261]' : 'text-[#CDB261]'}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-white/40' : 'text-neutral-500'
                }`}>Confidence Score</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {(promotion.forecast.confidence * 100).toFixed(0)}%
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#CDB261]' : 'text-[#B8A050]'}`}>
                High confidence
              </p>
            </div>
          </div>
        </div>

        {/* ==================== 9. AI RECOMMENDATIONS ==================== */}
        <div id="ai-insights-section" className={`p-8 rounded-2xl ${
          isDark
            ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm'
            : 'luxury-glass'
        }`}>
          <SectionHeader
            icon={Sparkles}
            title="AI Recommendations"
            subtitle="Data-driven suggestions to optimize performance"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotion.recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  isDark
                    ? 'bg-white/[0.02] border-white/[0.08] hover:border-[#A57865]/30'
                    : 'bg-[#FAF7F4] border-neutral-200 hover:border-[#A57865]/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      rec.priority === 'high'
                        ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                        : rec.priority === 'medium'
                          ? isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                          : isDark ? 'bg-neutral-500/20' : 'bg-neutral-100'
                    }`}>
                      <Zap className={`w-4 h-4 ${
                        rec.priority === 'high'
                          ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                          : rec.priority === 'medium'
                            ? isDark ? 'text-amber-400' : 'text-amber-600'
                            : isDark ? 'text-neutral-400' : 'text-neutral-600'
                      }`} />
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      rec.priority === 'high'
                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                        : rec.priority === 'medium'
                          ? isDark ? 'text-amber-400' : 'text-amber-600'
                          : isDark ? 'text-neutral-400' : 'text-neutral-500'
                    }`}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    isDark ? 'bg-[#A57865]/20 text-[#CDB261]' : 'bg-[#A57865]/10 text-[#A57865]'
                  }`}>
                    {rec.impact}
                  </span>
                </div>

                <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {rec.title}
                </h4>
                <p className={`text-sm mb-4 ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
                  {rec.reason}
                </p>

                <button
                  onClick={() => handleApplyRecommendation(rec)}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isDark
                      ? 'bg-white/10 text-white hover:bg-white/15'
                      : 'bg-white text-[#A57865] hover:bg-[#A57865]/5 border border-[#A57865]/20'
                  }`}
                >
                  Apply Recommendation
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Additional AI Insights */}
          <div className="mt-6 pt-6 border-t border-dashed ${isDark ? 'border-white/[0.08]' : 'border-neutral-200'}">
            <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
              Additional Insights
            </h4>
            <div className="space-y-3">
              {promotion.aiInsights.slice(1).map((insight, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-xl ${
                    isDark ? 'bg-white/[0.02]' : 'bg-neutral-50'
                  }`}
                >
                  <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#5C9BA4]' : 'text-[#5C9BA4]'}`} />
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                      {insight.headline}
                    </p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                      {insight.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== 10. PROMOTION DETAILS EXPANDER ==================== */}
        <div className={`rounded-2xl overflow-hidden ${
          isDark
            ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm'
            : 'luxury-glass'
        }`}>
          <button
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            className={`w-full flex items-center justify-between p-6 transition-colors ${
              isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-[#A57865]/20' : 'bg-[#A57865]/10'
              }`}>
                <Layers className={`w-5 h-5 ${isDark ? 'text-[#CDB261]' : 'text-[#A57865]'}`} />
              </div>
              <div className="text-left">
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  Promotion Details
                </h2>
                <p className={`text-sm ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                  Full configuration and metadata
                </p>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isDark ? 'bg-white/[0.05]' : 'bg-neutral-100'
            }`}>
              {detailsExpanded ? (
                <ChevronUp className={`w-5 h-5 ${isDark ? 'text-white/60' : 'text-neutral-500'}`} />
              ) : (
                <ChevronDown className={`w-5 h-5 ${isDark ? 'text-white/60' : 'text-neutral-500'}`} />
              )}
            </div>
          </button>

          {detailsExpanded && (
            <div className={`px-6 pb-6 border-t ${isDark ? 'border-white/[0.08]' : 'border-neutral-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {/* Discount Info */}
                <div>
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                    isDark ? 'text-white/40' : 'text-neutral-500'
                  }`}>Discount</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={isDark ? 'text-white/60' : 'text-neutral-600'}>Type</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {promotion.discountType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDark ? 'text-white/60' : 'text-neutral-600'}>Value</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {promotion.discountValue}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stay Requirements */}
                <div>
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                    isDark ? 'text-white/40' : 'text-neutral-500'
                  }`}>Stay Requirements</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={isDark ? 'text-white/60' : 'text-neutral-600'}>Min LOS</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {promotion.minLOS} nights
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDark ? 'text-white/60' : 'text-neutral-600'}>Max LOS</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {promotion.maxLOS} nights
                      </span>
                    </div>
                  </div>
                </div>

                {/* Windows */}
                <div>
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                    isDark ? 'text-white/40' : 'text-neutral-500'
                  }`}>Booking Window</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={isDark ? 'text-white/60' : 'text-neutral-600'}>Book By</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {formatDate(promotion.bookingWindow.end)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDark ? 'text-white/60' : 'text-neutral-600'}>Stay Period</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {formatDateRange(promotion.stayWindow.start, promotion.stayWindow.end)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Channels */}
                <div>
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                    isDark ? 'text-white/40' : 'text-neutral-500'
                  }`}>Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {promotion.channels.map((channel) => (
                      <span
                        key={channel}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                          isDark ? 'bg-[#5C9BA4]/20 text-[#5C9BA4]' : 'bg-[#5C9BA4]/10 text-[#5C9BA4]'
                        }`}
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Room Types */}
                <div>
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                    isDark ? 'text-white/40' : 'text-neutral-500'
                  }`}>Room Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {promotion.roomTypes.map((type) => (
                      <span
                        key={type}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                          isDark ? 'bg-[#CDB261]/20 text-[#CDB261]' : 'bg-[#CDB261]/10 text-[#B8A050]'
                        }`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Promo Codes */}
                <div>
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                    isDark ? 'text-white/40' : 'text-neutral-500'
                  }`}>Promo Codes</h4>
                  <div className="flex flex-wrap gap-2">
                    {promotion.promoCodes.map((code) => (
                      <span
                        key={code}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-mono rounded-lg ${
                          isDark ? 'bg-white/[0.05] text-white/80' : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Restrictions */}
                <div className="md:col-span-2 lg:col-span-3">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                    isDark ? 'text-white/40' : 'text-neutral-500'
                  }`}>Restrictions & Settings</h4>
                  <div className="flex flex-wrap gap-3">
                    {promotion.restrictions.map((restriction) => (
                      <span
                        key={restriction}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg ${
                          isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        <AlertCircle className="w-3 h-3" />
                        {restriction}
                      </span>
                    ))}
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg ${
                      promotion.stackable
                        ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        : isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {promotion.stackable ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Stackable
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          Non-stackable
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
