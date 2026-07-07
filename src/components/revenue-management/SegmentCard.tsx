import { TrendingUp, TrendingDown, Minus, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const SegmentCard = ({ segment, performance, onClick, isSelected }) => {
  if (!performance) return null;

  const { ytd, metrics, monthlyTrend, optimizations } = performance;

  const getTrendIcon = (variance) => {
    if (variance > 5) return <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-500" />;
    if (variance < -5) return <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />;
    return <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />;
  };

  const getTrendColor = (variance) => {
    if (variance > 5) return 'text-sage-600';
    if (variance < -5) return 'text-rose-500';
    return 'text-neutral-600';
  };

  // Mini sparkline data from monthly trend
  const sparklineData = monthlyTrend?.slice(-6).map(m => ({
    revenue: m.revenue,
  })) || [];

  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-[10px] cursor-pointer transition-all ${
        isSelected
          ? 'bg-white border-2 border-terra-500 ring-2 ring-terra-500/20'
          : 'bg-white border border-neutral-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div>
          <h3 className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">{segment.name}</h3>
          <p className="text-[10px] sm:text-[11px] mt-0.5 text-neutral-500">{segment.description}</p>
        </div>

        {optimizations.length > 0 && (
          <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] font-bold bg-gold-100 text-gold-700">
            {optimizations.length}
          </span>
        )}
      </div>

      {/* Mini Sparkline */}
      <div className="h-10 sm:h-12 mb-3 sm:mb-4 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id={`gradient-${segment.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={segment.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={segment.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={segment.color}
              strokeWidth={2}
              fill={`url(#gradient-${segment.id})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-neutral-400">YTD Revenue</p>
          <p className="text-lg sm:text-xl font-bold text-neutral-900">
            ₹{(ytd.revenue / 1000).toFixed(0)}K
          </p>
        </div>
        <div>
          <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-neutral-400">ADR</p>
          <p className="text-lg sm:text-xl font-bold text-neutral-900">₹{ytd.adr}</p>
        </div>
        <div>
          <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-neutral-400">Contribution</p>
          <p className="text-base sm:text-lg font-semibold" style={{ color: segment.color }}>
            {metrics.revenueContribution}%
          </p>
        </div>
        <div>
          <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-neutral-400">YoY Growth</p>
          <div className="flex items-center gap-1">
            {getTrendIcon(metrics.yoyVariance)}
            <span className={`text-base sm:text-lg font-semibold ${getTrendColor(metrics.yoyVariance)}`}>
              {metrics.yoyVariance > 0 ? '+' : ''}{metrics.yoyVariance}%
            </span>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-xs border-t border-neutral-100 pt-2.5 sm:pt-3">
        <div className="text-center">
          <p className="font-semibold text-neutral-800">{ytd.roomNights}</p>
          <p className="text-neutral-500">Room Nights</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-neutral-800">{metrics.avgLeadTime}d</p>
          <p className="text-neutral-500">Avg Lead</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-neutral-800">{ytd.cancelRate}%</p>
          <p className="text-neutral-500">Cancel Rate</p>
        </div>
      </div>

      {/* Priority Optimization */}
      {optimizations.length > 0 && (
        <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-neutral-100">
          <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 text-gold-500" />
            <p className="text-neutral-600">
              {optimizations[0].message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Segment Detail Panel
export const SegmentDetailPanel = ({ segment, performance }) => {
  if (!performance) return null;

  const { mtd, ytd, metrics, optimizations } = performance;

  const getTrendIcon = (variance) => {
    if (variance > 0) return <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
    if (variance < 0) return <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
    return <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
  };

  return (
    <div className="rounded-[10px] bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-5">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900">{segment.name}</h2>
        <p className="text-[12px] sm:text-[13px] mt-1 text-neutral-500">{segment.description}</p>
      </div>

      {/* Key Stats */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-5">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-500 whitespace-nowrap mb-1">YTD Revenue</p>
            <p className="text-lg sm:text-xl font-bold text-neutral-900">₹{(ytd.revenue / 1000000).toFixed(2)}M</p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-500 whitespace-nowrap mb-1">Room Nights</p>
            <p className="text-lg sm:text-xl font-bold text-neutral-900">{ytd.roomNights.toLocaleString()}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-500 whitespace-nowrap mb-1">ADR</p>
            <p className="text-lg sm:text-xl font-bold text-neutral-900">₹{ytd.adr}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-500 whitespace-nowrap mb-1">YoY Growth</p>
            <div className="flex items-center gap-1" style={{ color: metrics.yoyVariance >= 0 ? '#4E5840' : '#E11D48' }}>
              {getTrendIcon(metrics.yoyVariance)}
              <span className="text-lg sm:text-xl font-bold">{metrics.yoyVariance > 0 ? '+' : ''}{metrics.yoyVariance}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* MTD vs YTD Comparison */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-5">
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {/* MTD Card */}
          <div className="p-3 sm:p-4 rounded-lg border border-neutral-100">
            <h4 className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2 sm:mb-3">Month to Date</h4>
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-[12px] text-neutral-500">Revenue</span>
                <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">₹{mtd.revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-[12px] text-neutral-500">Room Nights</span>
                <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">{mtd.roomNights}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-[12px] text-neutral-500">ADR</span>
                <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">₹{mtd.adr}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-[11px] sm:text-[12px] font-medium text-neutral-600">RevPAR</span>
                <span className="text-[13px] sm:text-[14px] font-bold" style={{ color: segment.color }}>₹{mtd.revPAR}</span>
              </div>
            </div>
          </div>

          {/* YTD Card */}
          <div className="p-3 sm:p-4 rounded-lg border border-neutral-100">
            <h4 className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2 sm:mb-3">Year to Date</h4>
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-[12px] text-neutral-500">Revenue</span>
                <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">₹{ytd.revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-[12px] text-neutral-500">Room Nights</span>
                <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">{ytd.roomNights}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-[12px] text-neutral-500">ADR</span>
                <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">₹{ytd.adr}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-[11px] sm:text-[12px] font-medium text-neutral-600">RevPAR</span>
                <span className="text-[13px] sm:text-[14px] font-bold" style={{ color: segment.color }}>₹{ytd.revPAR}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-5">
        <h4 className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2 sm:mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Revenue Share */}
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
            <div className="flex items-start justify-between mb-1.5 sm:mb-2">
              <p className="text-[10px] sm:text-[11px] font-medium text-neutral-500">Revenue Share</p>
              <p className="text-lg sm:text-xl font-bold text-neutral-900">{metrics.revenueContribution}%</p>
            </div>
            <div className="h-1.5 sm:h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metrics.revenueContribution * 2, 100)}%`, backgroundColor: segment.color }}
              />
            </div>
          </div>

          {/* Booking Pace */}
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
            <div className="flex items-start justify-between mb-1.5 sm:mb-2">
              <p className="text-[10px] sm:text-[11px] font-medium text-neutral-500">Booking Pace</p>
              <p className={`text-lg sm:text-xl font-bold ${metrics.bookingPace >= 90 ? 'text-sage-600' : metrics.bookingPace >= 70 ? 'text-gold-600' : 'text-rose-600'}`}>
                {metrics.bookingPace}%
              </p>
            </div>
            <div className="h-1.5 sm:h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${metrics.bookingPace >= 90 ? 'bg-sage-500' : metrics.bookingPace >= 70 ? 'bg-gold-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(metrics.bookingPace, 100)}%` }}
              />
            </div>
          </div>

          {/* Avg Lead Time */}
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-500 mb-1">Avg Lead Time</p>
            <p className="text-lg sm:text-xl font-bold text-neutral-900">
              {metrics.avgLeadTime}
              <span className="text-[11px] sm:text-[12px] font-medium text-neutral-400 ml-1">days</span>
            </p>
          </div>

          {/* Avg LOS */}
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-500 mb-1">Avg Length of Stay</p>
            <p className="text-lg sm:text-xl font-bold text-neutral-900">
              {metrics.avgLOS}
              <span className="text-[11px] sm:text-[12px] font-medium text-neutral-400 ml-1">nights</span>
            </p>
          </div>
        </div>
      </div>

      {/* Optimizations */}
      {optimizations.length > 0 && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <h4 className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2 sm:mb-3">Optimization Opportunities</h4>
          <div className="space-y-2">
            {optimizations.map((opt, index) => (
              <div
                key={index}
                className="p-2.5 sm:p-3 rounded-lg bg-neutral-50"
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] sm:text-[12px] font-semibold text-neutral-800">
                      {opt.message}
                    </p>
                    <p className="text-[10px] sm:text-[11px] mt-0.5 text-neutral-500 truncate">{opt.action}</p>
                  </div>
                  <button className="p-1 sm:p-1.5 rounded-md flex-shrink-0 transition-colors hover:bg-white/70">
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentCard;
