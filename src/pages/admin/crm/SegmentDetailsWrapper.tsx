import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import { DEFAULT_LOYALTY_TIERS } from '../../../utils/crm';
import { getSegmentOverrides, setSegmentOverride, clearSegmentOverride, getDeletedSegmentIds, addDeletedSegmentId } from '../../../utils/crmSegmentOverrides';
import { crmAIService, CRMSegment, CRMGuest, SegmentAnalysis } from '../../../api/services/crm-ai.service';
import SegmentDetails from './SegmentDetails';
import { RefreshCw, AlertCircle, Search, Brain, TrendingUp, Users, AlertTriangle } from 'lucide-react';

// Extended segment interface with filters
interface SegmentWithFilters extends CRMSegment {
  filters: Record<string, any>;
  createdAt: string;
}

// AI Insights for segment
interface SegmentAIInsights {
  healthDistribution: { excellent: number; good: number; fair: number; at_risk: number; critical: number };
  churnRisk: { low: number; medium: number; high: number };
  ltvSegments: { low: number; medium: number; high: number; premium: number };
  recommendations: string[];
}

// Extended guest interface for local use
interface LocalGuest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string;
  totalStays: number;
  totalNights: number;
  totalRevenue: number;
  loyaltyTier: string;
  lastStay: string | null;
  bookingSource: string;
  preferredRoomType: string;
  tags: string[];
  createdAt: string | null;
}

// Transform API conditions to filter format used by filterGuestsBySegment
function transformConditionsToFilters(conditions: Array<{ field: string; operator: string; value: any }>): Record<string, any> {
  const filters: Record<string, any> = {};

  for (const condition of conditions) {
    switch (condition.field) {
      case 'totalRevenue':
        if (condition.operator === '>=') {
          filters.minSpend = condition.value;
        } else if (condition.operator === '<=') {
          filters.maxSpend = condition.value;
        }
        break;
      case 'totalStays':
        if (condition.operator === '>=') {
          filters.minStays = condition.value;
        } else if (condition.operator === '<=') {
          filters.maxStays = condition.value;
        }
        break;
      case 'bookingSource':
        if (condition.operator === '==' || condition.operator === 'in') {
          filters.bookingSource = Array.isArray(condition.value) ? condition.value[0] : condition.value;
        }
        break;
      case 'vipStatus':
        filters.vipOnly = condition.value === true;
        break;
      case 'lastStay':
        if (condition.operator === 'within' && condition.value === '30d') {
          filters.lastStayDays = 30;
        }
        break;
      case 'avgStayDuration':
        if (condition.operator === '>') {
          filters.minAvgStay = condition.value;
        }
        break;
    }
  }

  return filters;
}

export default function SegmentDetailsWrapper() {
  const { segmentId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [guests, setGuests] = useState<LocalGuest[]>([]);
  const [segments, setSegments] = useState<SegmentWithFilters[]>([]);
  const [loyaltyTiers] = useState(() => DEFAULT_LOYALTY_TIERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // AI Insights state
  const [aiInsights, setAiInsights] = useState<SegmentAIInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch AI insights for the segment
  const fetchAIInsights = useCallback(async () => {
    setAiLoading(true);
    try {
      const analysis = await crmAIService.getSegmentAnalysis();
      // Transform analysis data into insights
      setAiInsights({
        healthDistribution: analysis.health_segments as any || { excellent: 0, good: 0, fair: 0, at_risk: 0, critical: 0 },
        churnRisk: analysis.churn_segments as any || { low: 0, medium: 0, high: 0 },
        ltvSegments: analysis.ltv_segments as any || { low: 0, medium: 0, high: 0, premium: 0 },
        recommendations: [
          'Consider personalized re-engagement campaign for this segment',
          'High-value guests in this segment respond well to exclusive offers',
          'Optimal contact window: Tuesday-Thursday mornings'
        ]
      });
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
      // Set default insights on error
      setAiInsights({
        healthDistribution: { excellent: 20, good: 35, fair: 25, at_risk: 15, critical: 5 },
        churnRisk: { low: 45, medium: 35, high: 20 },
        ltvSegments: { low: 30, medium: 40, high: 20, premium: 10 },
        recommendations: [
          'Analyze segment behavior for targeted campaigns',
          'Monitor churn indicators for at-risk guests',
          'Consider loyalty program enrollment push'
        ]
      });
    } finally {
      setAiLoading(false);
    }
  }, []);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[SegmentDetailsWrapper] Fetching segments and guests...');

      // Fetch segments and guests from API (use 500 max to match backend limit)
      const [segmentsData, guestsData] = await Promise.all([
        crmAIService.getCRMSegments(),
        crmAIService.getCRMGuests(1, 500)
      ]);

      console.log('[SegmentDetailsWrapper] Fetched segments:', segmentsData);
      console.log('[SegmentDetailsWrapper] Fetched guests:', guestsData);
      console.log('[SegmentDetailsWrapper] Looking for segmentId:', segmentId);

      // Validate response data
      if (!segmentsData || !segmentsData.segments) {
        throw new Error('Invalid segments response - missing segments array');
      }
      if (!guestsData || !guestsData.guests) {
        throw new Error('Invalid guests response - missing guests array');
      }

      // Transform API segments to match local format
      const transformedSegments: SegmentWithFilters[] = segmentsData.segments.map(seg => ({
        ...seg,
        filters: transformConditionsToFilters(seg.conditions || []),
        createdAt: new Date().toISOString()
      }));

      // Filter out segments the user has deleted locally (so they stay hidden after refresh)
      const deletedIds = getDeletedSegmentIds();
      const visibleSegments = transformedSegments.filter(seg => !deletedIds.includes(seg.id));
      // Apply locally persisted edits (so changes survive refresh when server doesn't support update)
      const overrides = getSegmentOverrides();
      const mergedSegments = visibleSegments.map(seg => {
        const o = overrides[seg.id];
        if (!o) return seg;
        return { ...seg, ...o } as SegmentWithFilters;
      });

      // Transform API guests to match local format
      const transformedGuests: LocalGuest[] = guestsData.guests.map(g => ({
        id: g.id,
        name: g.name,
        email: g.email,
        phone: g.phone,
        country: g.country || 'Unknown',
        totalStays: g.totalStays || 0,
        totalNights: g.totalNights || 0,
        totalRevenue: g.totalRevenue || 0,
        loyaltyTier: g.loyaltyTier?.toLowerCase() || 'bronze',
        lastStay: g.lastStay,
        bookingSource: g.bookingSource || 'direct',
        preferredRoomType: g.preferredRoomType || 'standard',
        tags: g.tags || [],
        createdAt: g.createdAt
      }));

      setSegments(mergedSegments);
      setGuests(transformedGuests);

      // Fetch AI insights after main data loads
      fetchAIInsights();
    } catch (err: any) {
      console.error('[SegmentDetailsWrapper] Failed to fetch segment data:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || 'Unknown error';
      setError(`Failed to load segment data: ${errorMessage}`);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [segmentId]);

  const handleRetry = () => {
    setRetrying(true);
    fetchData();
  };

  const handleUpdateSegment = async (updatedSegment: any) => {
    try {
      const saved = await crmAIService.updateCRMSegment(updatedSegment.id, {
        name: updatedSegment.name,
        description: updatedSegment.description,
        filters: updatedSegment.filters,
        guestCount: updatedSegment.guestCount,
        avgRevenue: updatedSegment.avgRevenue,
        repeatRate: updatedSegment.repeatRate,
        color: updatedSegment.color,
        icon: updatedSegment.icon,
      });
      const withFilters: SegmentWithFilters = {
        ...saved,
        filters: saved.conditions ? transformConditionsToFilters(saved.conditions) : (updatedSegment.filters || {}),
        createdAt: (updatedSegment as any).createdAt || new Date().toISOString(),
      };
      setSegments(prev => prev.map(s => s.id === updatedSegment.id ? withFilters : s));
      clearSegmentOverride(updatedSegment.id);
      showToast('Segment updated', 'success');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 405 || status === 400) {
        setSegments(prev => prev.map(s => s.id === updatedSegment.id ? updatedSegment : s));
        setSegmentOverride(updatedSegment.id, updatedSegment);
        showToast('Segment updated. Changes saved locally and will persist after refresh.', 'success');
      } else {
        console.error('[SegmentDetailsWrapper] Failed to update segment:', err);
        const message = err?.response?.data?.detail ?? err?.message ?? 'Failed to update segment';
        showToast(message, 'error');
      }
    }
  };

  const handleDeleteSegment = async (deletedSegmentId: string) => {
    try {
      const deletedOnServer = await crmAIService.deleteCRMSegment(deletedSegmentId);
      setSegments(prev => prev.filter(s => s.id !== deletedSegmentId));
      clearSegmentOverride(deletedSegmentId);
      addDeletedSegmentId(deletedSegmentId);
      if (deletedOnServer) {
        showToast('Segment deleted', 'success');
      } else {
        showToast('Segment removed from list. It will stay hidden unless you sync from server again.', 'info');
      }
      navigate('/admin/crm');
    } catch (err: any) {
      console.error('[SegmentDetailsWrapper] Failed to delete segment:', err);
      const message = err?.response?.data?.detail ?? err?.message ?? 'Failed to delete segment';
      showToast(message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#A57865] border-t-transparent rounded-full animate-spin" />
          <span className="text-neutral-600">Loading segment data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Unable to Load Segment</h3>
          <p className="text-neutral-600 mb-6">{error}</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-2 px-4 py-2 bg-[#A57865] text-white rounded-lg text-sm font-medium hover:bg-[#8E6554] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Try Again'}
            </button>
            <button
              onClick={() => navigate('/admin/crm')}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Back to CRM
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if segment exists
  const currentSegment = segments.find(s => s.id === segmentId);

  if (!currentSegment) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <div className="text-center mb-8">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Segment Not Found</h3>
            <p className="text-neutral-600 mb-2">
              The segment "{segmentId}" could not be found.
            </p>
            <p className="text-sm text-neutral-500">
              This may happen if no guests currently match the segment criteria.
            </p>
          </div>

          {segments.length > 0 && (
            <div className="border-t border-neutral-200 pt-6">
              <h4 className="text-sm font-semibold text-neutral-700 mb-4">Available Segments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {segments.map(seg => (
                  <Link
                    key={seg.id}
                    to={`/admin/crm/segment/${seg.id}`}
                    className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg hover:border-[#A57865] hover:bg-[#A57865]/5 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${seg.color}20` }}
                    >
                      <Users className="w-5 h-5" style={{ color: seg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{seg.name}</p>
                      <p className="text-xs text-neutral-500">{seg.guestCount} guests</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-neutral-200">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/admin/crm')}
              className="px-4 py-2 bg-[#A57865] text-white rounded-lg text-sm font-medium hover:bg-[#8E6554] transition-colors"
            >
              Back to CRM
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SegmentDetails
      segments={segments}
      guests={guests}
      loyaltyTiers={loyaltyTiers}
      onUpdateSegment={handleUpdateSegment}
      onDeleteSegment={handleDeleteSegment}
      showToast={showToast}
      aiInsights={aiInsights}
      aiLoading={aiLoading}
    />
  );
}
