import { useState, useEffect, useRef, useCallback } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { createPortal } from 'react-dom';
import {
  X,
  Brain,
  User,
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Star,
  Crown,
  MessageSquare,
  Mail,
  Phone,
  Eye,
  Megaphone,
  Shield,
  ArrowUpCircle,
  Clock,
  Activity,
  Loader2,
  ExternalLink,
} from 'lucide-react';

// Types
interface GuestIntelligence {
  id: string;
  guestId: string;
  name: string;
  email: string;
  avatar?: string;
  isVIP: boolean;
  tier?: string;
  healthScore: number;
  churnRisk: number;
  ltv: number;
  rebookingProbability: number;
  sentimentTrend: number[];
  recentInteractions: {
    id: string;
    type: string;
    channel: string;
    description: string;
    timestamp: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }[];
}

interface GuestIntelligenceSidebarProps {
  guestId: string;
  isOpen: boolean;
  onClose: () => void;
  onViewFullProfile?: (guestId: string) => void;
  onSendCampaign?: (guestId: string) => void;
  onCreateRecovery?: (guestId: string) => void;
  onUpgradeTier?: (guestId: string) => void;
}

const TIER_CONFIG: Record<string, { color: string; bgColor: string; icon: typeof Star }> = {
  bronze: { color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Star },
  silver: { color: 'text-neutral-500', bgColor: 'bg-neutral-200', icon: Star },
  gold: { color: 'text-amber-500', bgColor: 'bg-amber-50', icon: Crown },
  platinum: { color: 'text-neutral-400', bgColor: 'bg-neutral-100', icon: Crown },
  diamond: { color: 'text-cyan-500', bgColor: 'bg-cyan-50', icon: Crown },
};

const INTERACTION_ICONS: Record<string, typeof MessageSquare> = {
  email: Mail,
  sms: MessageSquare,
  call: Phone,
  review: Star,
  booking: Calendar,
  complaint: AlertTriangle,
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const getHealthScoreColor = (score: number): { text: string; bg: string } => {
  if (score >= 70) return { text: 'text-emerald-600', bg: 'bg-emerald-500' };
  if (score >= 40) return { text: 'text-amber-600', bg: 'bg-amber-500' };
  return { text: 'text-rose-600', bg: 'bg-rose-500' };
};

const getChurnRiskColor = (risk: number): { text: string; bg: string } => {
  if (risk <= 30) return { text: 'text-emerald-600', bg: 'bg-emerald-500' };
  if (risk <= 60) return { text: 'text-amber-600', bg: 'bg-amber-500' };
  return { text: 'text-rose-600', bg: 'bg-rose-500' };
};

const getSentimentColor = (sentiment?: 'positive' | 'neutral' | 'negative'): string => {
  if (sentiment === 'positive') return 'text-emerald-600';
  if (sentiment === 'negative') return 'text-rose-600';
  return 'text-neutral-500';
};

// Simple sparkline component
const SparkLine = ({ data, height = 40 }: { data: number[]; height?: number }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const pointWidth = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * pointWidth;
    const y = height - ((value - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const trend = data[data.length - 1] - data[0];
  const strokeColor = trend >= 0 ? '#10b981' : '#ef4444';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Latest point */}
      <circle
        cx={(data.length - 1) * pointWidth}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 8) - 4}
        r="3"
        fill={strokeColor}
      />
    </svg>
  );
};

// Mock data fetcher - replace with actual API call
const fetchGuestIntelligence = async (guestId: string): Promise<GuestIntelligence> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    id: `intel_${guestId}`,
    guestId,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    isVIP: true,
    tier: 'gold',
    healthScore: 78,
    churnRisk: 25,
    ltv: 12500,
    rebookingProbability: 72,
    sentimentTrend: [65, 70, 68, 75, 78, 82, 80, 85],
    recentInteractions: [
      {
        id: '1',
        type: 'email',
        channel: 'email',
        description: 'Opened promotional email - Summer sale',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sentiment: 'positive',
      },
      {
        id: '2',
        type: 'booking',
        channel: 'booking',
        description: 'Completed booking for August 15-18',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        sentiment: 'positive',
      },
      {
        id: '3',
        type: 'review',
        channel: 'review',
        description: 'Left 5-star review on TripAdvisor',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        sentiment: 'positive',
      },
      {
        id: '4',
        type: 'call',
        channel: 'call',
        description: 'Inquiry about spa services',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        sentiment: 'neutral',
      },
      {
        id: '5',
        type: 'email',
        channel: 'email',
        description: 'Clicked on loyalty program link',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        sentiment: 'neutral',
      },
    ],
  };
};

export default function GuestIntelligenceSidebar({
  guestId,
  isOpen,
  onClose,
  onViewFullProfile,
  onSendCampaign,
  onCreateRecovery,
  onUpgradeTier,
}: GuestIntelligenceSidebarProps) {
  const { formatCurrency } = useCurrency();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [intelligence, setIntelligence] = useState<GuestIntelligence | null>(null);

  // Fetch data when sidebar opens
  useEffect(() => {
    if (isOpen && guestId) {
      setIsLoading(true);
      fetchGuestIntelligence(guestId)
        .then(data => {
          setIntelligence(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, guestId]);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus trap
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !sidebarRef.current) return;

    const focusableElements = sidebarRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, handleTabKey]);

  if (!isOpen) return null;

  const tierConfig = intelligence?.tier ? TIER_CONFIG[intelligence.tier] : null;
  const healthColors = intelligence ? getHealthScoreColor(intelligence.healthScore) : null;
  const churnColors = intelligence ? getChurnRiskColor(intelligence.churnRisk) : null;

  const sidebarContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
        className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-white shadow-2xl z-[70] flex flex-col transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#4E5840]" />
              <h2 id="sidebar-title" className="text-lg font-semibold text-neutral-900">
                Guest Intelligence
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-[#4E5840] animate-spin" />
            </div>
          ) : intelligence ? (
            <div className="p-4 space-y-6">
              {/* Guest Header */}
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-full bg-[#A57865]/10 flex items-center justify-center flex-shrink-0">
                  {intelligence.avatar ? (
                    <img src={intelligence.avatar} alt={intelligence.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-[#A57865]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-neutral-900 truncate">{intelligence.name}</h3>
                    {intelligence.isVIP && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        VIP
                      </span>
                    )}
                    {tierConfig && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${tierConfig.bgColor} ${tierConfig.color}`}>
                        {intelligence.tier?.charAt(0).toUpperCase()}{intelligence.tier?.slice(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 truncate">{intelligence.email}</p>
                </div>
              </div>

              {/* Health Score Gauge */}
              <div className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      Health Score
                    </span>
                  </div>
                  <span className={`text-2xl font-bold ${healthColors?.text}`}>
                    {intelligence.healthScore}
                  </span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${healthColors?.bg}`}
                    style={{ width: `${intelligence.healthScore}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Churn Risk */}
                <div className="p-3 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-1 text-neutral-500 mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-xs uppercase tracking-wide">Churn Risk</span>
                  </div>
                  <p className={`text-xl font-bold ${churnColors?.text}`}>
                    {intelligence.churnRisk}%
                  </p>
                </div>

                {/* LTV */}
                <div className="p-3 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-1 text-neutral-500 mb-1">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-xs uppercase tracking-wide">LTV</span>
                  </div>
                  <p className="text-xl font-bold text-[#4E5840]">
                    {formatCurrency(intelligence.ltv)}
                  </p>
                </div>

                {/* Rebooking Probability */}
                <div className="p-3 bg-neutral-50 rounded-xl col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-neutral-500">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs uppercase tracking-wide">Rebooking Probability</span>
                    </div>
                    <p className={`text-lg font-bold ${
                      intelligence.rebookingProbability >= 60 ? 'text-emerald-600' :
                      intelligence.rebookingProbability >= 30 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {intelligence.rebookingProbability}%
                    </p>
                  </div>
                  <div className="mt-2 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        intelligence.rebookingProbability >= 60 ? 'bg-emerald-500' :
                        intelligence.rebookingProbability >= 30 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${intelligence.rebookingProbability}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sentiment Trend */}
              <div className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      Sentiment Trend
                    </span>
                  </div>
                  {intelligence.sentimentTrend.length > 1 && (
                    <div className="flex items-center gap-1">
                      {intelligence.sentimentTrend[intelligence.sentimentTrend.length - 1] >= intelligence.sentimentTrend[0] ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-500" />
                      )}
                      <span className={`text-xs font-medium ${
                        intelligence.sentimentTrend[intelligence.sentimentTrend.length - 1] >= intelligence.sentimentTrend[0]
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}>
                        {Math.abs(intelligence.sentimentTrend[intelligence.sentimentTrend.length - 1] - intelligence.sentimentTrend[0])}%
                      </span>
                    </div>
                  )}
                </div>
                <SparkLine data={intelligence.sentimentTrend} height={40} />
              </div>

              {/* Recent Interactions */}
              <div>
                <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent Interactions
                </h4>
                <div className="space-y-2">
                  {intelligence.recentInteractions.slice(0, 5).map((interaction) => {
                    const Icon = INTERACTION_ICONS[interaction.type] || MessageSquare;
                    return (
                      <div
                        key={interaction.id}
                        className="p-3 bg-white border border-neutral-100 rounded-lg"
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 ${getSentimentColor(interaction.sentiment)}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-neutral-700 line-clamp-2">
                              {interaction.description}
                            </p>
                            <p className="text-xs text-neutral-400 mt-1">
                              {formatRelativeTime(interaction.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => onViewFullProfile?.(guestId)}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Full Profile
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </button>
                  <button
                    onClick={() => onSendCampaign?.(guestId)}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Megaphone className="w-4 h-4" />
                    Send Campaign
                  </button>
                  {intelligence.churnRisk > 40 && (
                    <button
                      onClick={() => onCreateRecovery?.(guestId)}
                      className="w-full px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Create Recovery Campaign
                    </button>
                  )}
                  {intelligence.tier && intelligence.tier !== 'diamond' && (
                    <button
                      onClick={() => onUpgradeTier?.(guestId)}
                      className="w-full px-4 py-2.5 bg-[#4E5840]/5 border border-[#4E5840]/20 rounded-xl text-sm font-medium text-[#4E5840] hover:bg-[#4E5840]/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      Upgrade Tier
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-neutral-500">
              Failed to load guest intelligence
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(sidebarContent, document.body);
}
