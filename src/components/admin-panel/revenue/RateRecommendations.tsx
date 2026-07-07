import { useMemo } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Check, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui2/Button';

const ROOM_TYPES = [
  { id: 'minimalist-studio', name: 'Minimalist Studio', baseRate: 150 },
  { id: 'coastal-retreat', name: 'Coastal Retreat', baseRate: 199 },
  { id: 'urban-oasis', name: 'Urban Oasis', baseRate: 245 },
  { id: 'sunset-vista', name: 'Sunset Vista', baseRate: 315 },
  { id: 'pacific-suite', name: 'Pacific Suite', baseRate: 385 },
  { id: 'wellness-suite', name: 'Wellness Suite', baseRate: 425 },
  { id: 'family-sanctuary', name: 'Family Sanctuary', baseRate: 485 },
  { id: 'oceanfront-penthouse', name: 'Oceanfront Penthouse', baseRate: 750 }
];

export default function RateRecommendations({ forecastData, competitorData, settings }) {
  const recommendations = useMemo(() => {
    const avgDemand = forecastData.slice(0, 7).reduce((sum, d) => sum + d.demand, 0) / 7;
    const avgCompetitorRate = competitorData.reduce((sum, c) => sum + c.next7, 0) / competitorData.length;
    const yourAvgRate = 7800;

    return ROOM_TYPES.map(room => {
      let adjustment = 0;
      let reason = [];

      // Demand-based adjustment
      if (avgDemand > 0.8) {
        adjustment += Math.round(Math.random() * 8 + 10); // 10-18%
        reason.push('High demand');
      } else if (avgDemand >= 0.5) {
        adjustment += Math.round(Math.random() * 4 + 4); // 4-8%
        reason.push('Moderate demand');
      } else {
        adjustment -= Math.round(Math.random() * 7 + 5); // -5 to -12%
        reason.push('Low demand');
      }

      // Competitor-based adjustment
      if (yourAvgRate > avgCompetitorRate * 1.1) {
        adjustment -= 5;
        reason.push('Above market');
      } else if (yourAvgRate < avgCompetitorRate * 0.9) {
        adjustment += 5;
        reason.push('Below market');
      }

      const recommendedRate = Math.round(room.baseRate * (1 + adjustment / 100));
      const changePercent = Math.round(((recommendedRate - room.baseRate) / room.baseRate) * 100);

      return {
        ...room,
        recommendedRate,
        adjustment: changePercent,
        reason: reason.join(' + '),
        confidence: avgDemand > 0.7 ? 'high' : avgDemand > 0.4 ? 'medium' : 'low'
      };
    });
  }, [forecastData, competitorData]);

  const acceptedCount = useMemo(() => {
    return recommendations.filter(r => r.confidence === 'high').length;
  }, [recommendations]);

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#A57865]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">AI Rate Recommendations</h3>
            <p className="text-sm text-neutral-500">Optimized pricing suggestions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#4E5840]/10 text-[#4E5840] text-xs font-semibold rounded-full">
            {acceptedCount}/{recommendations.length} High Confidence
          </span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        {recommendations.map((rec) => {
          const isPositive = rec.adjustment > 0;
          const Icon = isPositive ? TrendingUp : TrendingDown;

          return (
            <div
              key={rec.id}
              className={`p-4 rounded-xl border-l-4 transition-colors ${
                rec.confidence === 'high'
                  ? 'bg-[#A57865]/5 border-l-[#A57865]'
                  : rec.confidence === 'medium'
                  ? 'bg-[#CDB261]/5 border-l-[#CDB261]'
                  : 'bg-neutral-50 border-l-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-neutral-900">{rec.name}</p>
                    <p className="text-xs text-neutral-500">Current: ${rec.baseRate.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Reason badges */}
                  <div className="flex items-center gap-2">
                    {rec.reason.split(' + ').map((r, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white border border-neutral-200 rounded text-xs text-neutral-600"
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  {/* Recommended rate */}
                  <div className="text-right min-w-[140px]">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-lg font-bold text-neutral-900">
                        ${rec.recommendedRate.toLocaleString()}
                      </span>
                      <span
                        className={`flex items-center gap-0.5 text-sm font-semibold ${
                          isPositive ? 'text-[#4E5840]' : 'text-red-600'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {isPositive ? '+' : ''}{rec.adjustment}%
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {rec.confidence === 'high' ? (
                        <span className="text-[#4E5840]">High confidence</span>
                      ) : rec.confidence === 'medium' ? (
                        <span className="text-[#CDB261]">Medium confidence</span>
                      ) : (
                        <span className="text-neutral-500">Low confidence</span>
                      )}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-[#4E5840] text-white rounded-lg hover:bg-[#4E5840]/90 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors">
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply All Button */}
      <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {settings?.autoRate ? (
            <span className="text-[#4E5840]">Auto-rate optimization is enabled</span>
          ) : (
            'Review and apply recommended rates'
          )}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="ghost">
            Reject All
          </Button>
          <Button variant="primary">
            Apply All Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
}
