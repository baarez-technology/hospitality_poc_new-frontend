import { useState, useMemo, useCallback } from 'react';
import { Star, MapPin, TrendingUp, TrendingDown, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { revenueIntelligenceService, Competitor } from '../../api/services/revenue-intelligence.service';
import { useCompetitors } from '../../contexts/RevenueDataContext';

interface CompetitorTableProps {
  yourRate?: number;
}

export default function CompetitorTable({ yourRate = 150 }: CompetitorTableProps) {
  const { data: competitors, loading: isLoading, error, refresh: refreshCompetitors } = useCompetitors();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh competitor rates (this is a write operation, so it still calls API)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await revenueIntelligenceService.refreshCompetitorRates();
      await refreshCompetitors();
    } catch (err) {
      console.error('Failed to refresh rates:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Transform API data to display format (normalize: API may return array or { competitors: [] })
  const displayData = useMemo(() => {
    const list = Array.isArray(competitors)
      ? competitors
      : (competitors && typeof competitors === 'object' && Array.isArray((competitors as { competitors?: unknown }).competitors))
        ? (competitors as { competitors: Competitor[] }).competitors
        : [];
    return list.map(c => ({
      id: c?.id,
      hotel: c?.name,
      rating: c?.rating,
      distance: c?.distance,
      today: c?.todayRate,
      next7: c?.avgRate7Day,
    }));
  }, [competitors]);

  const avgCompetitorRate = useMemo(() => {
    if (displayData.length === 0) return 0;
    return Math.round(displayData.reduce((sum, c) => sum + c.next7, 0) / displayData.length);
  }, [displayData]);

  const marketDiff = useMemo(() => {
    if (avgCompetitorRate === 0) return 0;
    return Math.round(((yourRate - avgCompetitorRate) / avgCompetitorRate) * 100);
  }, [yourRate, avgCompetitorRate]);

  const getPositionInfo = (competitorRate: number) => {
    const diff = ((yourRate - competitorRate) / competitorRate) * 100;
    if (diff > 5) return { label: 'Higher', isHigher: true };
    if (diff < -5) return { label: 'Lower', isHigher: false };
    return { label: 'Similar', isHigher: null };
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div>
        <div className="px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-neutral-100 rounded animate-pulse mt-2" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-24 bg-neutral-100 rounded animate-pulse" />
              <div className="h-8 w-24 bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="divide-y divide-neutral-100">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="px-6 py-4">
              <div className="h-12 bg-neutral-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && displayData.length === 0) {
    return (
      <div>
        <div className="px-6 py-5 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-800">Competitor Rates</h3>
        </div>
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-neutral-500 mb-4">{error}</p>
          <button
            onClick={refreshCompetitors}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (displayData.length === 0) {
    return (
      <div>
        <div className="px-6 py-5 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-800">Competitor Rates</h3>
          <p className="text-[11px] text-neutral-400 font-medium mt-0.5">No competitors tracked</p>
        </div>
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-neutral-500">Add competitors to monitor their rates and market positioning.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">Competitor Rates</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{displayData.length} hotels monitored</p>
          </div>

          {/* Rate Comparison */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh rates"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
            <div className="text-right">
              <p className="text-[11px] text-neutral-400 font-medium">Your Rate</p>
              <p className="text-lg font-bold text-neutral-900">₹{yourRate.toLocaleString()}</p>
            </div>
            <div className="h-8 w-px bg-neutral-200" />
            <div className="text-right">
              <p className="text-[11px] text-neutral-400 font-medium">Market Avg</p>
              <p className="text-lg font-bold text-neutral-500">₹{avgCompetitorRate.toLocaleString()}</p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold ${
              marketDiff > 0 ? 'bg-gold-50 text-gold-700' : marketDiff < 0 ? 'bg-sage-50 text-sage-700' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {marketDiff !== 0 && (
                marketDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {marketDiff > 0 ? `${marketDiff}% above` : marketDiff < 0 ? `${Math.abs(marketDiff)}% below` : 'At market'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor List */}
      <div className="divide-y divide-neutral-100">
        {displayData.map((competitor) => {
          const position = getPositionInfo(competitor.next7 ?? 0);

          return (
            <div
              key={competitor.id}
              className="px-6 py-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Hotel Info */}
                <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[13px] font-bold text-neutral-500">
                    {(competitor.hotel ?? '?').charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-900">{competitor.hotel ?? '—'}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                      <span>{competitor.rating}</span>
                    </div>
                    {competitor.distance && (
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <MapPin className="w-3 h-3" />
                        <span>{competitor.distance}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rates */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Today</p>
                    <p className="text-[15px] font-bold text-neutral-900 mt-0.5">₹{(competitor.today ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">7-Day Avg</p>
                    <p className="text-[15px] font-bold text-neutral-600 mt-0.5">₹{(competitor.next7 ?? 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Position Badge */}
                <div className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold min-w-[60px] text-center ${
                  position.isHigher === true ? 'bg-gold-50 text-gold-700' :
                  position.isHigher === false ? 'bg-sage-50 text-sage-700' :
                  'bg-neutral-100 text-neutral-600'
                }`}>
                  {position.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Insight */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded bg-gold-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-neutral-800 mb-0.5">Market Insight</p>
            <p className="text-[13px] text-neutral-600 leading-relaxed">
              {marketDiff > 0 ? (
                <>Your rates are <span className="font-semibold text-gold-700">{marketDiff}% above</span> market average. Consider if your value proposition justifies the premium.</>
              ) : marketDiff < 0 ? (
                <>Your rates are <span className="font-semibold text-sage-700">{Math.abs(marketDiff)}% below</span> market average. There may be room to increase rates.</>
              ) : (
                <>Your rates are competitive with the market. Monitor demand to optimize pricing.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
