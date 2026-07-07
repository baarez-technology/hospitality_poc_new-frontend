import { TrendingUp, TrendingDown, Minus, Globe } from 'lucide-react';
import { PLATFORMS } from '../../utils/reputation';

export default function OTATable({ otaStats }) {
  const getPlatformConfig = (platformId) => {
    return PLATFORMS.find(p => p.id === platformId) || { name: platformId, color: '#6B7280', icon: '?' };
  };

  const getRatingStatus = (rating) => {
    if (rating >= 4.5) {
      return { label: 'Excellent', bgColor: 'bg-[#4E5840]/15', textColor: 'text-[#4E5840]' };
    }
    if (rating >= 4.0) {
      return { label: 'Good', bgColor: 'bg-[#CDB261]/20', textColor: 'text-[#CDB261]' };
    }
    return { label: 'Needs Attention', bgColor: 'bg-rose-100', textColor: 'text-rose-700' };
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-[#4E5840]" />;
    }
    if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-rose-600" />;
    }
    return <Minus className="w-4 h-4 text-neutral-400" />;
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="p-4 border-b border-neutral-200 bg-[#FAF8F6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#5C9BA4]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">OTA Rating Comparison</h3>
            <p className="text-xs text-neutral-500">Performance across booking platforms</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Platform</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Reviews</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Trend</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {otaStats.map((stat) => {
              const platform = getPlatformConfig(stat.platform);
              const status = getRatingStatus(stat.rating);
              return (
                <tr key={stat.platform} className="hover:bg-[#FAF8F6]/50 transition-colors">
                  {/* Platform */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.icon}
                      </div>
                      <span className="font-semibold text-neutral-900">{platform.name}</span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xl font-bold text-neutral-900">{stat.rating.toFixed(1)}</span>
                      <span className="text-sm text-neutral-500">/5</span>
                    </div>
                    {/* Star visualization */}
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(stat.rating)
                              ? 'text-[#CDB261] fill-[#CDB261]'
                              : 'text-neutral-200 fill-neutral-200'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </td>

                  {/* Reviews Count */}
                  <td className="px-4 py-4 text-center">
                    <span className="text-lg font-semibold text-neutral-900">
                      {stat.reviewCount.toLocaleString()}
                    </span>
                  </td>

                  {/* Trend */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {getTrendIcon(stat.trend)}
                      <span className={`text-sm font-semibold ${
                        stat.trend > 0 ? 'text-[#4E5840]' : stat.trend < 0 ? 'text-rose-600' : 'text-neutral-500'
                      }`}>
                        {stat.trend > 0 ? '+' : ''}{stat.trend.toFixed(1)}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${status.bgColor} ${status.textColor}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
