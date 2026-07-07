import { TrendingUp, TrendingDown, Minus, ExternalLink, Star } from 'lucide-react';

export default function PlatformTable({ platformData, summary }) {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-[#4E5840]" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-rose-600" />;
      default:
        return <Minus className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-[#4E5840]';
      case 'down':
        return 'text-rose-600';
      default:
        return 'text-neutral-600';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? 'fill-yellow-500 text-yellow-500'
                : 'fill-neutral-200 text-neutral-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-sans font-semibold text-neutral-900 mb-1">
            Platform Performance
          </h3>
          <p className="text-sm text-neutral-600">
            Review metrics across all platforms
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#A57865] hover:bg-[#A57865]/5 rounded-lg transition-colors">
          <ExternalLink className="w-4 h-4" />
          Manage Platforms
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                Platform
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                Rating
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                Total Reviews
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                Positive %
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                Response Rate
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                Verified %
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {platformData.map((platform, index) => (
              <tr
                key={platform.id}
                className={`border-b border-neutral-100 hover:bg-[#FAF8F6] transition-colors ${
                  index === 0 ? 'bg-[#A57865]/5/30' : ''
                }`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full bg-[#8E6554]" />
                    <div>
                      <p className="font-semibold text-neutral-900 text-sm">
                        {platform.platform}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Last: {new Date(platform.lastReview).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col items-center gap-1">
                    {renderStars(Math.round(platform.avgRating))}
                    <span className="text-sm font-semibold text-neutral-900">
                      {platform.avgRating.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="text-right py-4 px-4">
                  <p className="font-semibold text-neutral-900">{platform.totalReviews}</p>
                </td>
                <td className="text-right py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${platform.positivePercentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-neutral-700 w-10 text-right">
                      {platform.positivePercentage}%
                    </span>
                  </div>
                </td>
                <td className="text-right py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-[#A57865] h-2 rounded-full"
                        style={{ width: `${platform.responseRate}%` }}
                      />
                    </div>
                    <span className="text-sm text-neutral-700 w-10 text-right">
                      {platform.responseRate}%
                    </span>
                  </div>
                </td>
                <td className="text-right py-4 px-4">
                  <span className="text-sm text-neutral-700">{platform.verified}%</span>
                </td>
                <td className="text-center py-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    {getTrendIcon(platform.trend)}
                    <span className={`text-sm font-semibold ${getTrendColor(platform.trend)}`}>
                      {platform.growth}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#FAF8F6] font-semibold">
              <td className="py-4 px-4 text-neutral-900">Total / Average</td>
              <td className="text-center py-4 px-4 text-[#A57865]">
                {summary.avgRatingAcross}
              </td>
              <td className="text-right py-4 px-4 text-neutral-900">
                {summary.totalReviewsAcross}
              </td>
              <td className="text-right py-4 px-4 text-neutral-900">-</td>
              <td className="text-right py-4 px-4 text-neutral-900">
                {summary.avgResponseRate}%
              </td>
              <td className="text-right py-4 px-4 text-neutral-900">-</td>
              <td className="text-center py-4 px-4">-</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-[#A57865]/5 rounded-xl border border-[#A57865]/30">
          <p className="text-xs text-[#A57865] font-medium mb-1">Top Platform</p>
          <p className="text-lg font-bold text-neutral-900">{summary.topPlatform}</p>
          <p className="text-xs text-[#A57865] mt-1">Most reviews</p>
        </div>
        <div className="p-4 bg-[#4E5840]/10 rounded-xl border border-[#4E5840]/30">
          <p className="text-xs text-[#4E5840] font-medium mb-1">Avg Response Rate</p>
          <p className="text-lg font-bold text-green-900">{summary.avgResponseRate}%</p>
          <p className="text-xs text-[#4E5840] mt-1">Across all platforms</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-700 font-medium mb-1">Total Platforms</p>
          <p className="text-lg font-bold text-amber-900">{summary.totalPlatforms}</p>
          <p className="text-xs text-amber-600 mt-1">Active integrations</p>
        </div>
      </div>
    </div>
  );
}
