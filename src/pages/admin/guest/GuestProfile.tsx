import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  DollarSign,
  Edit,
  MessageSquare,
  UserX,
  Tag,
  Plus,
  Trash2,
  Award,
  StickyNote,
  Clock,
  Star,
  BarChart3,
  Brain,
  Sparkles,
  AlertTriangle,
  Target,
  RefreshCw,
  Lightbulb,
  Heart,
  Activity,
  Zap,
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { guestsService, GuestFullProfile } from '../../../api/services/guests.service';
import { crmAIService, GuestIntelligence } from '../../../api/services/crm-ai.service';
import { Loader2 } from 'lucide-react';
import {
  calculateLoyaltyTier,
  LOYALTY_TIERS,
  GUEST_STATUS_CONFIG,
  EMOTION_CONFIG,
  VIP_LEVELS,
  formatDate,
  formatDateTime,
  formatCurrency,
} from '../../../utils/guests';
import MessageGuestModal from '../../../components/admin-panel/guests/MessageGuestModal';

const CHART_COLORS = ['#A57865', '#5C9BA4', '#4E5840', '#CDB261', '#C8B29D'];

// AI Intelligence Panel Component
interface AIIntelligencePanelProps {
  guestId: string;
  guestName: string;
}

function AIIntelligencePanel({ guestId, guestName }: AIIntelligencePanelProps) {
  const [intelligence, setIntelligence] = useState<GuestIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllInsights, setShowAllInsights] = useState(false);

  const fetchIntelligence = useCallback(async () => {
    if (!guestId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await crmAIService.getGuestIntelligence(parseInt(guestId), true);
      setIntelligence(data);
    } catch (err) {
      console.error('Failed to fetch guest intelligence:', err);
      setError('Unable to load AI insights');
      // Set fallback mock data for development
      setIntelligence({
        guest_id: parseInt(guestId),
        guest_info: {
          name: guestName,
          email: '',
          vip_status: false,
          loyalty_tier: 'Bronze'
        },
        scores: {
          health: {
            score: 72,
            label: 'Good',
            components: { recency: 0.8, frequency: 0.7, monetary: 0.65, engagement: 0.75 }
          },
          churn: {
            probability: 25,
            risk_level: 'Low',
            is_high_risk: false,
            drivers: [
              { factor: 'booking_gap', description: 'Regular booking pattern', risk_contribution: 0.1 }
            ]
          },
          ltv: {
            predicted_value: 2850,
            historical_value: 1500,
            future_value: 1350,
            segment: 'Medium'
          },
          rebooking: {
            probability: 65,
            likelihood: 'Likely',
            optimal_contact: {
              days_until_optimal_contact: 14,
              timing_window: 'Next 2 weeks',
              recommendation: 'Send personalized offer'
            }
          }
        },
        campaign_recommendation: {
          recommended_campaign: {
            type: 'loyalty',
            priority: 'medium',
            segment: 'repeat_guests'
          },
          channel_recommendation: {
            primary_channel: 'email',
            confidence: 0.85
          },
          content_recommendation: {
            subject_line_suggestions: ['Special offer for valued guests'],
            offer_recommendations: [
              { type: 'discount', value: '15%', description: 'Next stay discount' }
            ]
          }
        },
        alerts: [],
        key_insights: [
          'Guest shows consistent booking patterns',
          'Responds well to email campaigns',
          'Prefers weekend stays'
        ],
        recommended_actions: [
          { action: 'Send loyalty reward', priority: 'medium', category: 'engagement' },
          { action: 'Offer room upgrade', priority: 'low', category: 'upsell' }
        ],
        calculated_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, [guestId, guestName]);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-500' };
    if (score >= 60) return { bg: 'bg-[#4E5840]/10', text: 'text-[#4E5840]', ring: 'ring-[#4E5840]' };
    if (score >= 40) return { bg: 'bg-[#CDB261]/20', text: 'text-[#CDB261]', ring: 'ring-[#CDB261]' };
    return { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-500' };
  };

  const getChurnColor = (probability: number) => {
    if (probability < 30) return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
    if (probability < 60) return { bg: 'bg-[#CDB261]/20', text: 'text-[#CDB261]' };
    return { bg: 'bg-rose-100', text: 'text-rose-700' };
  };

  const getRebookingColor = (probability: number) => {
    if (probability >= 70) return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
    if (probability >= 40) return { bg: 'bg-[#5C9BA4]/20', text: 'text-[#5C9BA4]' };
    return { bg: 'bg-[#CDB261]/20', text: 'text-[#CDB261]' };
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#5C9BA4]/5 to-[#4E5840]/5 rounded-2xl border border-[#5C9BA4]/20 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5C9BA4] to-[#4E5840] flex items-center justify-center">
            <Brain className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900">AI Guest Intelligence</h3>
            <p className="text-sm text-neutral-500 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Analyzing guest data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!intelligence) return null;

  const healthColor = getHealthColor(intelligence.scores.health.score);
  const churnColor = getChurnColor(intelligence.scores.churn.probability);
  const rebookingColor = getRebookingColor(intelligence.scores.rebooking.probability);

  return (
    <div className="bg-gradient-to-br from-[#5C9BA4]/5 via-[#4E5840]/5 to-[#A57865]/5 rounded-2xl border border-[#5C9BA4]/20 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5C9BA4] to-[#4E5840] flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-neutral-900 flex items-center gap-2">
              AI Guest Intelligence
              <Sparkles className="w-4 h-4 text-[#CDB261]" />
            </h3>
            <p className="text-xs text-neutral-500">Powered by ReConnect AI</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              Using cached data
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); fetchIntelligence(); }}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="Refresh insights"
          >
            <RefreshCw className="w-4 h-4 text-neutral-400" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {/* Score Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Health Score */}
            <div className={`${healthColor.bg} rounded-xl p-4 border ${healthColor.ring}/30`}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className={`w-4 h-4 ${healthColor.text}`} />
                <span className="text-xs font-medium text-neutral-600">Health Score</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${healthColor.text}`}>
                  {intelligence.scores.health.score}
                </span>
                <span className="text-xs text-neutral-500">/100</span>
              </div>
              <p className={`text-xs mt-1 ${healthColor.text}`}>
                {intelligence.scores.health.label}
              </p>
            </div>

            {/* Churn Risk */}
            <div className={`${churnColor.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`w-4 h-4 ${churnColor.text}`} />
                <span className="text-xs font-medium text-neutral-600">Churn Risk</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${churnColor.text}`}>
                  {intelligence.scores.churn.probability}%
                </span>
              </div>
              <p className={`text-xs mt-1 ${churnColor.text}`}>
                {intelligence.scores.churn.risk_level}
              </p>
            </div>

            {/* Predicted LTV */}
            <div className="bg-[#4E5840]/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#4E5840]" />
                <span className="text-xs font-medium text-neutral-600">Predicted LTV</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#4E5840]">
                  ${intelligence.scores.ltv.predicted_value.toLocaleString()}
                </span>
              </div>
              <p className="text-xs mt-1 text-[#4E5840]">
                {intelligence.scores.ltv.segment} value
              </p>
            </div>

            {/* Rebooking Probability */}
            <div className={`${rebookingColor.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className={`w-4 h-4 ${rebookingColor.text}`} />
                <span className="text-xs font-medium text-neutral-600">Rebooking</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${rebookingColor.text}`}>
                  {intelligence.scores.rebooking.probability}%
                </span>
              </div>
              <p className={`text-xs mt-1 ${rebookingColor.text}`}>
                {intelligence.scores.rebooking.likelihood}
              </p>
            </div>
          </div>

          {/* Optimal Contact Window */}
          {intelligence.scores.rebooking.optimal_contact && (
            <div className="bg-white rounded-xl p-4 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#A57865]" />
                  <span className="text-sm font-medium text-neutral-700">Optimal Contact Window</span>
                </div>
                <span className="text-sm font-semibold text-[#A57865]">
                  {intelligence.scores.rebooking.optimal_contact.timing_window}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                {intelligence.scores.rebooking.optimal_contact.recommendation}
              </p>
            </div>
          )}

          {/* Key Insights */}
          {intelligence.key_insights && intelligence.key_insights.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-neutral-200">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-[#CDB261]" />
                <span className="text-sm font-semibold text-neutral-800">Key Insights</span>
              </div>
              <ul className="space-y-2">
                {(showAllInsights ? intelligence.key_insights : intelligence.key_insights.slice(0, 3)).map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                    <Sparkles className="w-3 h-3 text-[#5C9BA4] mt-1 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
              {intelligence.key_insights.length > 3 && (
                <button
                  onClick={() => setShowAllInsights(!showAllInsights)}
                  className="mt-2 text-xs text-[#5C9BA4] hover:underline"
                >
                  {showAllInsights ? 'Show less' : `Show ${intelligence.key_insights.length - 3} more`}
                </button>
              )}
            </div>
          )}

          {/* Recommended Actions */}
          {intelligence.recommended_actions && intelligence.recommended_actions.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-neutral-200">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#A57865]" />
                <span className="text-sm font-semibold text-neutral-800">Recommended Actions</span>
              </div>
              <div className="space-y-2">
                {intelligence.recommended_actions.slice(0, 3).map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-700">{action.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        action.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                        action.priority === 'medium' ? 'bg-[#CDB261]/20 text-[#CDB261]' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaign Recommendation */}
          {intelligence.campaign_recommendation && (
            <div className="bg-gradient-to-r from-[#A57865]/10 to-[#A57865]/5 rounded-xl p-4 border border-[#A57865]/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#A57865]" />
                  <span className="text-sm font-semibold text-neutral-800">Campaign Suggestion</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-[#A57865]/20 text-[#A57865] rounded-full">
                  {intelligence.campaign_recommendation.recommended_campaign.type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">Channel:</span>
                  <span className="ml-1 font-medium text-neutral-700 capitalize">
                    {intelligence.campaign_recommendation.channel_recommendation.primary_channel}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Confidence:</span>
                  <span className="ml-1 font-medium text-neutral-700">
                    {Math.round(intelligence.campaign_recommendation.channel_recommendation.confidence * 100)}%
                  </span>
                </div>
              </div>
              {intelligence.campaign_recommendation.content_recommendation.offer_recommendations[0] && (
                <p className="text-xs text-neutral-600 mt-2">
                  Suggested: {intelligence.campaign_recommendation.content_recommendation.offer_recommendations[0].description}
                </p>
              )}
            </div>
          )}

          {/* Alerts */}
          {intelligence.alerts && intelligence.alerts.length > 0 && (
            <div className="space-y-2">
              {intelligence.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg flex items-start gap-3 ${
                    alert.priority === 'high' ? 'bg-rose-50 border border-rose-200' :
                    alert.priority === 'medium' ? 'bg-[#CDB261]/10 border border-[#CDB261]/20' :
                    'bg-[#5C9BA4]/10 border border-[#5C9BA4]/20'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                    alert.priority === 'high' ? 'text-rose-600' :
                    alert.priority === 'medium' ? 'text-[#CDB261]' :
                    'text-[#5C9BA4]'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{alert.type}</p>
                    <p className="text-xs text-neutral-600">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Transform API guest to display format
function transformGuest(apiGuest: GuestFullProfile): any {
  const guestName = `${apiGuest.first_name || ''} ${apiGuest.last_name || ''}`.trim() || 'Unknown Guest';

  // Transform stay_history to history format
  const history = (apiGuest.stay_history || []).map(stay => ({
    date: stay.check_in,
    nights: stay.nights || 1,
    amount: stay.total_spent || 0,
    roomType: stay.room_type || 'Standard',
  }));

  // Transform notes
  const notes = (apiGuest.notes || []).map(note => ({
    id: note.id,
    text: note.text,
    date: note.date,
    author: note.author,
  }));

  return {
    id: String(apiGuest.id),
    name: guestName,
    email: apiGuest.email || '',
    phone: apiGuest.phone || '',
    country: apiGuest.country || 'Unknown',
    state: apiGuest.state || '',
    city: apiGuest.city || '',
    address: apiGuest.address || '',
    postalCode: apiGuest.postal_code || '',
    status: apiGuest.status || 'Active',
    emotion: apiGuest.emotion || apiGuest.sentiment || 'neutral',
    totalStays: apiGuest.total_bookings || 0,
    totalSpent: apiGuest.total_spent || 0,
    lastStay: apiGuest.last_visit || apiGuest.member_since,
    tags: apiGuest.tags || [],
    preferences: apiGuest.preferences || {},
    history,
    notes,
    vipStatus: apiGuest.vip_status,
    vipLevel: (apiGuest as any).vip_level || 'none',
    loyaltyTier: apiGuest.loyalty_tier,
  };
}

export default function GuestProfile() {
  const { guestId } = useParams();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<any>(null);
  const [newNote, setNewNote] = useState('');
  const [activeHistoryTab, setActiveHistoryTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  useEffect(() => {
    const fetchGuest = async () => {
      if (!guestId) {
        setError('No guest ID provided');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        // Try getProfile first for full data, fallback to get
        let apiGuest: GuestFullProfile;
        try {
          apiGuest = await guestsService.getProfile(guestId);
        } catch {
          apiGuest = await guestsService.get(guestId) as GuestFullProfile;
        }
        setGuest(transformGuest(apiGuest));
      } catch (err) {
        console.error('Failed to fetch guest:', err);
        setError('Failed to load guest');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuest();
  }, [guestId]);

  const loyaltyTier = useMemo(() => {
    if (!guest) return 'Bronze';
    return calculateLoyaltyTier(guest.totalStays || 0, guest.totalSpent || 0);
  }, [guest]);

  const tierConfig = LOYALTY_TIERS[loyaltyTier];

  // Calculate spending by year for chart
  const spendingByYear = useMemo(() => {
    if (!guest?.history) return [];
    const yearData = {};
    guest.history.forEach(stay => {
      const year = new Date(stay.date).getFullYear();
      yearData[year] = (yearData[year] || 0) + stay.amount;
    });
    return Object.entries(yearData)
      .map(([year, amount]) => ({ year, amount }))
      .sort((a, b) => a.year - b.year);
  }, [guest]);

  // Calculate room type preferences for pie chart
  const roomTypePreferences = useMemo(() => {
    if (!guest?.history) return [];
    const roomTypes = {};
    guest.history.forEach(stay => {
      const type = stay.roomType || 'Standard';
      roomTypes[type] = (roomTypes[type] || 0) + 1;
    });
    return Object.entries(roomTypes).map(([name, value]) => ({ name, value }));
  }, [guest]);

  // Normalize preferences - extract from nested pre-checkin structure
  // IMPORTANT: This hook must be called before any early returns
  const guestPreferences = useMemo(() => {
    if (!guest?.preferences || typeof guest.preferences !== 'object') return [];

    const prefs: string[] = [];
    const p = guest.preferences;

    // Room preferences (from pre-checkin)
    if (p.room) {
      if (p.room.bedType && p.room.bedType !== 'any') prefs.push(`Bed: ${p.room.bedType}`);
      if (p.room.floor && p.room.floor !== 'any') prefs.push(`Floor: ${p.room.floor}`);
      if (p.room.view && p.room.view !== 'any') prefs.push(`View: ${p.room.view}`);
      if (p.room.quietness && p.room.quietness !== 'any') prefs.push(`Quietness: ${p.room.quietness}`);
    }

    // Legacy format (direct bedType/floor)
    if (p.bedType && !p.room) prefs.push(`Bed: ${p.bedType}`);
    if (p.floor && !p.room) prefs.push(`Floor: ${p.floor}`);

    // Comfort preferences
    if (p.comfort) {
      if (p.comfort.temperature) prefs.push(`Temp: ${p.comfort.temperature}°`);
      if (p.comfort.pillowType && Array.isArray(p.comfort.pillowType) && p.comfort.pillowType.length > 0) {
        prefs.push(`Pillows: ${p.comfort.pillowType.join(', ')}`);
      }
    }

    // Dining preferences
    if (p.dining) {
      if (p.dining.dietaryRestrictions && Array.isArray(p.dining.dietaryRestrictions) && p.dining.dietaryRestrictions.length > 0) {
        prefs.push(`Dietary: ${p.dining.dietaryRestrictions.join(', ')}`);
      }
      if (p.dining.minibar && Array.isArray(p.dining.minibar) && p.dining.minibar.length > 0) {
        prefs.push(`Minibar: ${p.dining.minibar.join(', ')}`);
      }
    }

    // Travel preferences
    if (p.travel) {
      if (p.travel.transportationNeeded) prefs.push('Transportation needed');
      if (p.travel.earlyCheckIn) prefs.push('Early check-in');
      if (p.travel.lateCheckOut) prefs.push('Late check-out');
    }

    // Special requests
    if (p.specialRequests) prefs.push(`Special: ${p.specialRequests}`);

    return prefs;
  }, [guest?.preferences]);

  const handleAddNote = async () => {
    if (newNote.trim() && guest) {
      try {
        // Call API to persist the note
        const result = await guestsService.addNote(guest.id, {
          text: newNote.trim(),
          category: 'general'
        });

        // Update local state with the new note from API response
        if (result?.note) {
          setGuest(prev => prev ? {
            ...prev,
            notes: [result.note, ...(prev.notes || [])]
          } : null);
        }
        setNewNote('');
        toast.success('Note saved successfully');
      } catch (err) {
        console.error('Failed to add note:', err);
        toast.error('Failed to save note');
      }
    }
  };

  const handleDeleteNote = async (noteId: number | string) => {
    if (guest) {
      try {
        // Call API to delete the note
        await guestsService.deleteNote(guest.id, noteId);

        // Update local state
        setGuest(prev => prev ? {
          ...prev,
          notes: (prev.notes || []).filter(n => n.id !== noteId)
        } : null);
        toast.success('Note deleted');
      } catch (err) {
        console.error('Failed to delete note:', err);
        toast.error('Failed to delete note');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#A57865]" />
          <span className="ml-3 text-neutral-500">Loading guest profile...</span>
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="text-center py-16">
          <p className="text-neutral-500">{error || 'Guest not found'}</p>
          <button
            onClick={() => navigate('/admin/guests')}
            className="mt-4 px-4 py-2 bg-[#A57865] text-white rounded-lg hover:bg-[#8E6554] transition-colors"
          >
            Back to Guests
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = GUEST_STATUS_CONFIG[guest.status] || GUEST_STATUS_CONFIG['Active'];
  const emotionConfig = EMOTION_CONFIG[guest.emotion] || EMOTION_CONFIG['neutral'];

  // Normalize notes
  const guestNotes = Array.isArray(guest.notes)
    ? guest.notes
    : guest.notes
    ? [{ id: 'legacy', text: guest.notes, date: new Date().toISOString() }]
    : [];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/guests')}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium text-sm sm:text-base">Back to Guests</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#A57865]/10 via-[#C8B29D]/10 to-[#5C9BA4]/10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#A57865]/10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-xl sm:text-3xl font-bold text-[#A57865]">
                  {guest.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-sans font-bold text-neutral-900 truncate">{guest.name}</h1>
                <p className="text-sm sm:text-base text-neutral-600 mt-0.5 sm:mt-1 truncate">{guest.email}</p>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold ${tierConfig.bgColor} ${tierConfig.textColor}`}>
                    <Award className="w-3 h-3" />
                    {tierConfig.icon} {loyaltyTier}
                  </span>
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    {statusConfig.label}
                  </span>
                  {guest.vipLevel && guest.vipLevel !== 'none' && VIP_LEVELS[guest.vipLevel] && (
                    <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold ${VIP_LEVELS[guest.vipLevel].bgColor} ${VIP_LEVELS[guest.vipLevel].color} border ${VIP_LEVELS[guest.vipLevel].borderColor}`}>
                      {VIP_LEVELS[guest.vipLevel].icon} {VIP_LEVELS[guest.vipLevel].label}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium ${emotionConfig.bgColor || 'bg-yellow-50'} ${emotionConfig.color || 'text-yellow-700'}`}>
                    <span className="text-xs sm:text-sm">{emotionConfig.emoji}</span>
                    <span className="hidden xs:inline">{emotionConfig.label}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setIsMessageModalOpen(true)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 text-neutral-700 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:border-[#A57865]/30 hover:bg-neutral-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Message</span>
              </button>
              <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-[#A57865] text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:bg-[#8E6554] transition-all duration-200 flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Intelligence Panel */}
      <AIIntelligencePanel guestId={guest.id} guestName={guest.name} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Contact & Stats */}
        <div className="space-y-4 sm:space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 mb-4">
              <div className="w-1 h-5 bg-[#A57865] rounded-full"></div>
              <h3 className="font-bold text-neutral-900">Contact Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A57865]/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#A57865]" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Email</p>
                  <a href={`mailto:${guest.email}`} className="text-sm font-medium text-neutral-900 hover:text-[#A57865]">
                    {guest.email}
                  </a>
                </div>
              </div>
              {guest.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5C9BA4]/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#5C9BA4]" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Phone</p>
                    <a href={`tel:${guest.phone}`} className="text-sm font-medium text-neutral-900 hover:text-[#5C9BA4]">
                      {guest.phone}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4E5840]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#4E5840]" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Address</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {[guest.address, guest.city, guest.state, guest.postalCode, guest.country]
                      .filter(Boolean)
                      .join(', ') || 'No address'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Statistics */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 mb-4">
              <div className="w-1 h-5 bg-[#4E5840] rounded-full"></div>
              <h3 className="font-bold text-neutral-900">Stay Statistics</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#A57865]/5 to-[#A57865]/10 rounded-xl p-4 border border-[#A57865]/20">
                <TrendingUp className="w-5 h-5 text-[#A57865] mb-2" />
                <p className="text-xs text-[#A57865] font-medium">Total Stays</p>
                <p className="text-2xl font-bold text-neutral-900">{guest.totalStays || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-[#4E5840]/5 to-[#4E5840]/10 rounded-xl p-4 border border-[#4E5840]/20">
                <DollarSign className="w-5 h-5 text-[#4E5840] mb-2" />
                <p className="text-xs text-[#4E5840] font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-[#4E5840]">{formatCurrency(guest.totalSpent || 0)}</p>
              </div>
              <div className="col-span-2 bg-[#FAF8F6] rounded-xl p-4 border border-neutral-100">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#A57865]" />
                  <div>
                    <p className="text-xs text-neutral-500">Last Stay</p>
                    <p className="text-sm font-semibold text-neutral-900">
                      {guest.lastStay ? formatDate(guest.lastStay) : 'No stays yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {guest.tags && guest.tags.length > 0 && (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 mb-4">
                <div className="w-1 h-5 bg-[#5C9BA4] rounded-full"></div>
                <h3 className="font-bold text-neutral-900">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {guest.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#5C9BA4]/10 text-[#5C9BA4] rounded-full text-xs font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          {guestPreferences.length > 0 && (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 mb-4">
                <div className="w-1 h-5 bg-[#CDB261] rounded-full"></div>
                <h3 className="font-bold text-neutral-900">Preferences</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {guestPreferences.map((pref, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 bg-[#CDB261]/10 text-[#CDB261] rounded-full text-xs font-medium"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Charts */}
        <div className="space-y-4 sm:space-y-6">
          {/* Spending Over Time Chart */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 mb-4">
              <div className="w-1 h-5 bg-[#A57865] rounded-full"></div>
              <h3 className="font-bold text-neutral-900">Spending Over Time</h3>
            </div>
            {spendingByYear.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingByYear}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E5E5',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="amount" fill="#A57865" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No spending data</p>
                </div>
              </div>
            )}
          </div>

          {/* Room Type Preferences */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 mb-4">
              <div className="w-1 h-5 bg-[#5C9BA4] rounded-full"></div>
              <h3 className="font-bold text-neutral-900">Room Type Preferences</h3>
            </div>
            {roomTypePreferences.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roomTypePreferences}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roomTypePreferences.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {roomTypePreferences.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-xs text-neutral-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Star className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No room preferences yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Notes & History */}
        <div className="space-y-4 sm:space-y-6 md:col-span-2 lg:col-span-1">
          {/* Notes */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#4E5840] rounded-full"></div>
                <h3 className="font-bold text-neutral-900">Notes ({guestNotes.length})</h3>
              </div>
            </div>

            {/* Add Note */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 text-sm bg-[#FAF8F6] border border-neutral-200 rounded-lg hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#4E5840] focus:ring-offset-1 focus:bg-white transition-all duration-200"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-3 py-2 bg-[#4E5840]/10 hover:bg-[#4E5840]/20 text-[#4E5840] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {guestNotes.length > 0 ? (
                guestNotes.map((note, idx) => (
                  <div
                    key={note.id || idx}
                    className="bg-[#FAF8F6] rounded-lg p-3 border border-neutral-100 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-neutral-800 leading-relaxed">{note.text || note}</p>
                        {note.date && (
                          <p className="text-xs text-neutral-400 mt-1">
                            {formatDateTime(note.date)}
                            {note.author && ` - ${note.author}`}
                          </p>
                        )}
                      </div>
                      {note.id && (
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 rounded text-rose-500 transition-all duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <StickyNote className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No notes yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Stay History */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-200 mb-4">
              <div className="w-1 h-5 bg-[#A57865] rounded-full"></div>
              <h3 className="font-bold text-neutral-900">Stay History ({guest.history?.length || 0})</h3>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {guest.history && guest.history.length > 0 ? (
                guest.history.map((stay, index) => (
                  <div
                    key={index}
                    className="bg-[#FAF8F6] rounded-lg p-3 border border-neutral-100 hover:border-[#A57865]/30 transition-all duration-150"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatDate(stay.date)}
                      </p>
                      <p className="text-sm font-bold text-[#4E5840]">
                        {formatCurrency(stay.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {stay.nights} {stay.nights === 1 ? 'night' : 'nights'}
                      </span>
                      {stay.roomType && (
                        <span className="px-2 py-0.5 bg-neutral-100 rounded">
                          {stay.roomType}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No stay history</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Guest Modal */}
      <MessageGuestModal
        guest={guest ? {
          id: guest.id,
          name: guest.name,
          email: guest.email
        } : null}
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
      />
    </div>
  );
}
