import { useState, useEffect, useMemo, useCallback } from 'react';
import { Building, TrendingUp, TrendingDown, Minus, Star, MapPin, RefreshCw, Plus, Loader2, Trash2 } from 'lucide-react';
import { revenueIntelligenceService, Competitor, CreateCompetitorRequest } from '../../../api/services/revenue-intelligence.service';
import { useToast } from '../../../context/ToastContext';
import { useCurrency } from '@/hooks/useCurrency';

interface CompetitorTableProps {
  yourRate?: number;
}

export default function CompetitorTable({ yourRate = 150 }: CompetitorTableProps) {
  const { symbol } = useCurrency();
  const { showToast } = useToast();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Add competitor form state
  const [newCompetitor, setNewCompetitor] = useState<CreateCompetitorRequest>({
    name: '',
    rating: 4.0,
    distance: '',
    url: '',
  });
  const [isAdding, setIsAdding] = useState(false);

  // Fetch competitors from API
  const fetchCompetitors = useCallback(async () => {
    try {
      const data = await revenueIntelligenceService.getCompetitors();
      setCompetitors(data);
    } catch (error) {
      console.error('Failed to fetch competitors:', error);
      showToast('Failed to load competitor data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  // Refresh competitor rates
  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    try {
      await revenueIntelligenceService.refreshCompetitorRates();
      await fetchCompetitors();
      showToast('Competitor rates refreshed successfully', 'success');
    } catch (error) {
      console.error('Failed to refresh rates:', error);
      showToast('Failed to refresh competitor rates', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add new competitor
  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitor.name.trim()) {
      showToast('Please enter a competitor name', 'error');
      return;
    }

    setIsAdding(true);
    try {
      const added = await revenueIntelligenceService.addCompetitor(newCompetitor);
      setCompetitors(prev => [...prev, added]);
      setNewCompetitor({ name: '', rating: 4.0, distance: '', url: '' });
      setShowAddForm(false);
      showToast('Competitor added successfully', 'success');
    } catch (error) {
      console.error('Failed to add competitor:', error);
      showToast('Failed to add competitor', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  // Delete competitor
  const handleDeleteCompetitor = async (id: number) => {
    setDeletingId(id);
    try {
      await revenueIntelligenceService.deleteCompetitor(id);
      setCompetitors(prev => prev.filter(c => c.id !== id));
      showToast('Competitor removed', 'success');
    } catch (error) {
      console.error('Failed to delete competitor:', error);
      showToast('Failed to remove competitor', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Transform API data to display format
  const displayData = useMemo(() => {
    return competitors.map(c => ({
      id: c.id,
      hotel: c.name,
      rating: c.rating,
      distance: c.distance,
      today: c.todayRate,
      next7: c.avgRate7Day,
    }));
  }, [competitors]);

  const getPositionData = (competitor: { next7: number }) => {
    const avgCompetitorRate = competitor.next7;
    const diff = yourRate - avgCompetitorRate;
    const percentDiff = Math.round((diff / avgCompetitorRate) * 100);

    if (percentDiff > 5) {
      return {
        label: 'Above',
        color: '#A57865',
        bgColor: 'bg-[#A57865]/10',
        icon: TrendingUp,
        suggestion: '-5%',
        suggestionColor: '#DC2626'
      };
    } else if (percentDiff < -5) {
      return {
        label: 'Below',
        color: '#4E5840',
        bgColor: 'bg-[#4E5840]/10',
        icon: TrendingDown,
        suggestion: '+5%',
        suggestionColor: '#4E5840'
      };
    } else {
      return {
        label: 'Competitive',
        color: '#5C9BA4',
        bgColor: 'bg-[#5C9BA4]/10',
        icon: Minus,
        suggestion: 'Hold',
        suggestionColor: '#5C9BA4'
      };
    }
  };

  const avgCompetitorRate = useMemo(() => {
    if (displayData.length === 0) return 0;
    return Math.round(displayData.reduce((sum, c) => sum + c.next7, 0) / displayData.length);
  }, [displayData]);

  const yourPosition = useMemo(() => {
    if (avgCompetitorRate === 0) return { label: 'No Data', color: '#6B7280' };
    const diff = ((yourRate - avgCompetitorRate) / avgCompetitorRate) * 100;
    if (diff > 5) return { label: 'Above Market', color: '#A57865' };
    if (diff < -5) return { label: 'Below Market', color: '#4E5840' };
    return { label: 'At Market', color: '#5C9BA4' };
  }, [yourRate, avgCompetitorRate]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-200" />
              <div>
                <div className="h-5 w-40 bg-neutral-200 rounded mb-1" />
                <div className="h-4 w-24 bg-neutral-200 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-20 bg-neutral-200 rounded" />
              <div className="h-8 w-20 bg-neutral-200 rounded" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-neutral-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#CDB261]/10 flex items-center justify-center">
            <Building className="w-5 h-5 text-[#CDB261]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Competitor Rates</h3>
            <p className="text-sm text-neutral-500">Market intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-neutral-500">Your Rate</p>
            <p className="text-lg font-bold text-neutral-900">{symbol}{yourRate.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">Market Avg</p>
            <p className="text-lg font-bold text-neutral-600">
              {avgCompetitorRate > 0 ? `${symbol}${avgCompetitorRate.toLocaleString()}` : '-'}
            </p>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${yourPosition.color}20`, color: yourPosition.color }}>
            {yourPosition.label}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleRefreshRates}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Rates'}
        </button>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#4E5840] hover:bg-[#3d4633] rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Competitor
        </button>
      </div>

      {/* Add competitor form */}
      {showAddForm && (
        <form onSubmit={handleAddCompetitor} className="mb-4 p-4 bg-[#FAF7F4] rounded-lg border border-neutral-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Hotel name *"
              value={newCompetitor.name}
              onChange={(e) => setNewCompetitor(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20"
              required
            />
            <input
              type="number"
              placeholder="Rating (1-5)"
              value={newCompetitor.rating}
              onChange={(e) => setNewCompetitor(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
              min="1"
              max="5"
              step="0.1"
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20"
            />
            <input
              type="text"
              placeholder="Distance (e.g., 0.5 km)"
              value={newCompetitor.distance}
              onChange={(e) => setNewCompetitor(prev => ({ ...prev, distance: e.target.value }))}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20"
            />
            <input
              type="url"
              placeholder="Website URL"
              value={newCompetitor.url}
              onChange={(e) => setNewCompetitor(prev => ({ ...prev, url: e.target.value }))}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20"
            />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4E5840] hover:bg-[#3d4633] rounded-lg transition-colors disabled:opacity-50"
            >
              {isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
              {isAdding ? 'Adding...' : 'Add Competitor'}
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {displayData.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 mb-2">No competitors tracked yet</p>
          <p className="text-sm text-neutral-400">Add competitors to compare rates and market positioning</p>
        </div>
      )}

      {/* Table */}
      {displayData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAF7F4] border-b border-neutral-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Today's Rate
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  7-Day Avg
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Suggested Action
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">

                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {displayData.map((competitor) => {
                const position = getPositionData(competitor);
                const Icon = position.icon;

                return (
                  <tr key={competitor.id} className="hover:bg-[#FAF7F4]/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-lg font-bold text-neutral-500">
                          {competitor.hotel.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">{competitor.hotel}</p>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-[#CDB261] fill-[#CDB261]" />
                              <span>{competitor.rating}</span>
                            </div>
                            {competitor.distance && (
                              <div className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />
                                <span>{competitor.distance}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-neutral-900">
                        {symbol}{competitor.today.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-neutral-700">
                        {symbol}{competitor.next7.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${position.bgColor}`}>
                        <Icon className="w-3 h-3" style={{ color: position.color }} />
                        <span className="text-xs font-semibold" style={{ color: position.color }}>
                          {position.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold"
                        style={{ backgroundColor: `${position.suggestionColor}15`, color: position.suggestionColor }}
                      >
                        {position.suggestion}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDeleteCompetitor(competitor.id)}
                        disabled={deletingId === competitor.id}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove competitor"
                      >
                        {deletingId === competitor.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {displayData.length > 0 && (
        <div className="mt-4 p-4 bg-[#FAF7F4] rounded-xl">
          <p className="text-sm text-neutral-700">
            <span className="font-semibold text-[#CDB261]">Market Analysis:</span>
            {' '}
            {yourRate > avgCompetitorRate ? (
              <>
                Your rates are {Math.round(((yourRate - avgCompetitorRate) / avgCompetitorRate) * 100)}% above market average.
                Consider if your value proposition justifies the premium.
              </>
            ) : yourRate < avgCompetitorRate ? (
              <>
                Your rates are {Math.round(((avgCompetitorRate - yourRate) / avgCompetitorRate) * 100)}% below market average.
                There may be room to increase rates while remaining competitive.
              </>
            ) : (
              <>
                Your rates are competitive with the market. Monitor demand to optimize pricing.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
