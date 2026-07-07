import { useMemo } from 'react';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const OTA_CONFIG = {
  google: { name: 'Google', color: '#4285F4', icon: 'G' },
  booking: { name: 'Booking.com', color: '#003580', icon: 'B' },
  expedia: { name: 'Expedia', color: '#F5B946', icon: 'E' },
  tripadvisor: { name: 'Tripadvisor', color: '#34E0A1', icon: 'T' },
  agoda: { name: 'Agoda', color: '#5C2D91', icon: 'A' }
};

export default function OTAScoreChart({ data }) {
  const chartData = useMemo(() => {
    return Object.entries(data).map(([key, value]) => ({
      id: key,
      name: OTA_CONFIG[key]?.name || key,
      rating: value.rating,
      reviews: value.reviews,
      trend: value.trend,
      color: OTA_CONFIG[key]?.color || '#A57865',
      icon: OTA_CONFIG[key]?.icon || key.charAt(0).toUpperCase()
    })).sort((a, b) => b.rating - a.rating);
  }, [data]);

  const avgRating = useMemo(() => {
    if (chartData.length === 0) return '0.0';
    const total = chartData.reduce((sum, item) => sum + (item.rating || 0), 0);
    return (total / chartData.length).toFixed(1);
  }, [chartData]);

  const totalReviews = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.reviews, 0);
  }, [chartData]);

  const bestPlatform = chartData[0];

  const TrendIndicator = ({ trend }) => {
    const trendValue = typeof trend === 'number' ? trend : 0;
    if (trendValue > 0) return (
      <span className="inline-flex items-center gap-0.5 text-sage-600">
        <TrendingUp className="w-3 h-3" />
        <span className="text-[11px] font-semibold">+{trendValue.toFixed(1)}</span>
      </span>
    );
    if (trendValue < 0) return (
      <span className="inline-flex items-center gap-0.5 text-rose-500">
        <TrendingDown className="w-3 h-3" />
        <span className="text-[11px] font-semibold">{trendValue.toFixed(1)}</span>
      </span>
    );
    return (
      <span className="inline-flex items-center gap-0.5 text-neutral-400">
        <Minus className="w-3 h-3" />
        <span className="text-[11px] font-semibold">0.0</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[10px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-neutral-900">OTA Score Analytics</h3>
            <p className="text-[13px] text-neutral-500 mt-0.5">Platform ratings overview</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-50 rounded-lg">
            <Star className="w-4 h-4 text-sage-600 fill-sage-600" />
            <span className="text-[13px] font-bold text-sage-700">{avgRating}</span>
            <span className="text-[11px] text-sage-600">avg</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 divide-x divide-neutral-100 border-b border-neutral-100">
        <div className="px-5 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Total Reviews</p>
          <p className="text-[22px] font-semibold text-neutral-900 tracking-tight">{totalReviews.toLocaleString()}</p>
        </div>
        <div className="px-5 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Best Platform</p>
          <p className="text-[14px] font-semibold text-neutral-900">{bestPlatform?.name || '-'}</p>
          <p className="text-[11px] text-neutral-500">{bestPlatform?.rating?.toFixed(1) || '0.0'} rating</p>
        </div>
        <div className="px-5 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Platforms</p>
          <p className="text-[22px] font-semibold text-neutral-900 tracking-tight">{chartData.length}</p>
        </div>
      </div>

      {/* Platform Ratings */}
      <div className="p-5 space-y-4">
        {chartData.map((platform, index) => {
          const barWidth = (platform.rating / 5) * 100;
          return (
            <div key={platform.id} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-neutral-900">{platform.name}</span>
                  <span className="text-[11px] text-neutral-400">({platform.reviews.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendIndicator trend={platform.trend} />
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                    <span className="text-[14px] font-bold text-neutral-900">{(platform.rating || 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: platform.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100">
        <p className="text-[11px] text-neutral-500 text-center">
          Ratings updated daily from connected OTA platforms
        </p>
      </div>
    </div>
  );
}
