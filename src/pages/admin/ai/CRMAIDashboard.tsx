/**
 * CRM AI Dashboard - ReConnect AI Integration
 * Comprehensive dashboard for guest intelligence, churn prediction, LTV, sentiment, and campaigns
 * Glimmora Design System v5.0
 */
import React, { useState, useEffect } from 'react';
import {
  Brain,
  Users,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Heart,
  Target,
  RefreshCw,
  ChevronRight,
  Activity,
  Zap,
  Mail,
  MessageSquare,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  User,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui2/Button';
import crmAIService, {
  DashboardStats,
  AtRiskGuest,
  RecoveryOpportunity,
  CampaignRecommendations,
  AIAlert,
  SegmentAnalysis
} from '../../../api/services/crm-ai.service';

// --- Helper components (Glimmora v5.0 styled) ---

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  iconBgColor = 'bg-terra-50',
  iconColor = 'text-terra-600'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconBgColor?: string;
  iconColor?: string;
}) => (
  <div className="bg-white rounded-[10px] p-4 sm:p-5">
    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${iconColor}`} />
      </div>
      <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
        {title}
      </p>
    </div>
    <div className="flex items-end justify-between">
      <div>
        <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900">{value}</p>
        {subtitle && <p className="text-[11px] sm:text-[12px] text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
          trend === 'up' ? 'bg-sage-50' : trend === 'down' ? 'bg-rose-50' : 'bg-neutral-100'
        }`}>
          {trend === 'up' ? (
            <ArrowUpRight className="w-3 h-3 text-sage-600" />
          ) : trend === 'down' ? (
            <ArrowDownRight className="w-3 h-3 text-rose-500" />
          ) : null}
          <span className={`text-[10px] sm:text-[11px] font-semibold ${
            trend === 'up' ? 'text-sage-600' : trend === 'down' ? 'text-rose-500' : 'text-neutral-500'
          }`}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  </div>
);

const HealthDistributionChart = ({ distribution }: { distribution: Record<string, number> }) => {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
  const segments = [
    { key: 'excellent', label: 'Excellent', color: 'bg-sage-500' },
    { key: 'good', label: 'Good', color: 'bg-ocean-500' },
    { key: 'fair', label: 'Fair', color: 'bg-gold-500' },
    { key: 'at_risk', label: 'At Risk', color: 'bg-terra-500' },
    { key: 'critical', label: 'Critical', color: 'bg-rose-500' }
  ];

  return (
    <div className="space-y-3">
      <div className="flex h-3 rounded-full overflow-hidden bg-neutral-100">
        {segments.map((segment) => {
          const value = distribution[segment.key] || 0;
          const percentage = (value / total) * 100;
          if (percentage === 0) return null;
          return (
            <div
              key={segment.key}
              className={`${segment.color} transition-all`}
              style={{ width: `${percentage}%` }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        {segments.map((segment) => {
          const value = distribution[segment.key] || 0;
          return (
            <div key={segment.key} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${segment.color}`} />
              <span className="text-[11px] text-neutral-600">{segment.label}: <span className="font-semibold text-neutral-900">{value}</span></span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AtRiskGuestCard = ({ guest }: { guest: AtRiskGuest }) => (
  <div className="p-4 bg-white rounded-[10px] hover:shadow-sm transition-all">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-neutral-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-neutral-900">{guest.guest_name}</p>
            {guest.vip_status && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gold-100 text-gold-700 rounded">VIP</span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400">{guest.email}</p>
        </div>
      </div>
      <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
        guest.priority === 'critical' ? 'bg-rose-50 text-rose-600' : 'bg-terra-50 text-terra-600'
      }`}>
        {guest.churn_probability.toFixed(0)}% risk
      </span>
    </div>
    <p className="text-[12px] text-neutral-500 mt-3 line-clamp-2">{guest.alert_message}</p>
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
      <span className="text-[11px] text-neutral-400">Alert {guest.days_since_alert}d ago</span>
      <Link
        to={`/admin/guests/${guest.guest_id}`}
        className="text-[11px] font-semibold text-terra-600 hover:text-terra-700 flex items-center gap-0.5"
      >
        View Profile <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  </div>
);

const RecoveryCard = ({ opportunity }: { opportunity: RecoveryOpportunity }) => (
  <div className="p-4 bg-white rounded-[10px] hover:shadow-sm transition-all">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-[13px] font-semibold text-neutral-900">{opportunity.guest_name}</p>
        <p className="text-[11px] text-neutral-400 capitalize">{opportunity.issue_type.replace('_', ' ')}</p>
      </div>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-4 rounded-full ${
              i < Math.round(opportunity.severity * 5) ? 'bg-gold-500' : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>
    </div>
    <p className="text-[12px] text-neutral-500 line-clamp-2">{opportunity.issue_description}</p>
    {opportunity.recommended_actions.length > 0 && (
      <div className="mt-3">
        <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Recommended</p>
        <p className="text-[12px] text-sage-700">{opportunity.recommended_actions[0]}</p>
      </div>
    )}
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
      <span className="text-[11px] text-neutral-400">
        <Clock className="w-3 h-3 inline mr-1" />
        {new Date(opportunity.detected_at).toLocaleDateString()}
      </span>
      <button className="text-[11px] font-semibold text-terra-600 hover:text-terra-700">
        Take Action
      </button>
    </div>
  </div>
);

const CampaignSection = ({
  title,
  guests,
  icon: Icon,
  iconBg
}: {
  title: string;
  guests: Array<{ guest_id: number; guest_name: string; priority: string; channel: string; predicted_conversion: number; ltv: number }>;
  icon: React.ElementType;
  iconBg: string;
}) => (
  <div className="bg-white rounded-[10px] overflow-hidden">
    <div className="px-4 py-4 border-b border-neutral-100">
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-neutral-900">{title}</h3>
          <p className="text-[11px] text-neutral-400">{guests.length} guests targeted</p>
        </div>
      </div>
    </div>
    <div className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
      {guests.length > 0 ? guests.slice(0, 5).map((guest) => (
        <div key={guest.guest_id} className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg">
          <div>
            <p className="text-[12px] font-medium text-neutral-800">{guest.guest_name}</p>
            <p className="text-[11px] text-neutral-400">{guest.channel} | {guest.predicted_conversion.toFixed(1)}% conv.</p>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
            guest.priority === 'critical' ? 'bg-rose-50 text-rose-600' :
            guest.priority === 'high' ? 'bg-terra-50 text-terra-600' :
            'bg-ocean-50 text-ocean-600'
          }`}>
            {guest.priority}
          </span>
        </div>
      )) : (
        <div className="py-6 text-center text-[12px] text-neutral-400">No guests targeted</div>
      )}
    </div>
  </div>
);

const AlertItem = ({ alert, onAcknowledge }: { alert: AIAlert; onAcknowledge: (id: number) => void }) => (
  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
      alert.priority === 'critical' ? 'bg-rose-500' :
      alert.priority === 'high' ? 'bg-terra-500' :
      'bg-gold-500'
    }`} />
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-medium text-neutral-900">{alert.title}</p>
          <p className="text-[11px] text-neutral-400">{alert.guest_name}</p>
        </div>
        <button
          onClick={() => onAcknowledge(alert.id)}
          className="p-1 hover:bg-neutral-100 rounded transition-colors"
        >
          <CheckCircle2 className="w-4 h-4 text-neutral-400 hover:text-sage-500" />
        </button>
      </div>
      <p className="text-[12px] text-neutral-500 mt-1 line-clamp-2">{alert.message}</p>
      <p className="text-[10px] text-neutral-400 mt-1">
        {new Date(alert.created_at).toLocaleString()}
      </p>
    </div>
  </div>
);

// --- Section Header ---
const SectionHeader = ({
  title,
  badge,
  badgeColor = 'bg-rose-50 text-rose-600',
  action
}: {
  icon?: React.ElementType;
  iconColor?: string;
  title: string;
  badge?: number;
  badgeColor?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <h2 className="text-[15px] font-semibold text-neutral-900">{title}</h2>
      {badge !== undefined && badge > 0 && (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${badgeColor}`}>
          {badge}
        </span>
      )}
    </div>
    {action}
  </div>
);

// Default fallback data when API fails
const defaultStats: DashboardStats = {
  total_guests: 0,
  guests_analyzed: 0,
  health_distribution: { excellent: 0, good: 0, fair: 0, at_risk: 0, critical: 0 },
  average_health_score: 0,
  average_churn_risk: 0,
  open_alerts: 0,
  recovery_pending: 0,
  last_updated: new Date().toISOString()
};

const defaultCampaigns: CampaignRecommendations = {
  win_back: [],
  loyalty: [],
  upsell: [],
  direct_booking: []
};

export default function CRMAIDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [atRiskGuests, setAtRiskGuests] = useState<AtRiskGuest[]>([]);
  const [recoveryOpportunities, setRecoveryOpportunities] = useState<RecoveryOpportunity[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecommendations | null>(null);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [segments, setSegments] = useState<SegmentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialLoad, setPartialLoad] = useState(false);

  const fetchData = async () => {
    setError(null);
    const errors: string[] = [];
    let hasAnyData = false;

    try {
      const statsData = await crmAIService.getDashboardStats();
      setStats(statsData);
      hasAnyData = true;
    } catch (e) {
      console.error('Failed to fetch dashboard stats:', e);
      setStats(defaultStats);
      errors.push('dashboard stats');
    }

    try {
      const atRiskData = await crmAIService.getAtRiskGuests(10, 60);
      setAtRiskGuests(atRiskData.guests || []);
      hasAnyData = true;
    } catch (e) {
      console.error('Failed to fetch at-risk guests:', e);
      setAtRiskGuests([]);
      errors.push('at-risk guests');
    }

    try {
      const recoveryData = await crmAIService.getRecoveryOpportunities('detected', 10);
      setRecoveryOpportunities(recoveryData.opportunities || []);
      hasAnyData = true;
    } catch (e) {
      console.error('Failed to fetch recovery opportunities:', e);
      setRecoveryOpportunities([]);
      errors.push('recovery opportunities');
    }

    try {
      const campaignData = await crmAIService.getCampaignRecommendations();
      setCampaigns(campaignData);
      hasAnyData = true;
    } catch (e) {
      console.error('Failed to fetch campaign recommendations:', e);
      setCampaigns(defaultCampaigns);
      errors.push('campaign recommendations');
    }

    try {
      const alertData = await crmAIService.getAIAlerts('open', undefined, 10);
      setAlerts(alertData.alerts || []);
      hasAnyData = true;
    } catch (e) {
      console.error('Failed to fetch AI alerts:', e);
      setAlerts([]);
      errors.push('AI alerts');
    }

    try {
      const segmentData = await crmAIService.getSegmentAnalysis();
      setSegments(segmentData);
      hasAnyData = true;
    } catch (e) {
      console.error('Failed to fetch segment analysis:', e);
      setSegments(null);
      errors.push('segment analysis');
    }

    if (errors.length > 0 && !hasAnyData) {
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } else if (errors.length > 0) {
      setPartialLoad(true);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await crmAIService.updateAlert(alertId, 'acknowledged');
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-terra-500 animate-spin mx-auto mb-2" />
          <p className="text-sm sm:text-base text-neutral-600">Loading ReConnect AI Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <WifiOff className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-[13px] text-neutral-500 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="primary"
              icon={RefreshCw}
              loading={refreshing}
              onClick={handleRefresh}
            >
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Partial Load Warning */}
      {partialLoad && (
        <div className="flex items-center gap-3 p-3 bg-gold-50 border border-gold-200 rounded-[10px]">
          <AlertCircle className="w-4 h-4 text-gold-600 flex-shrink-0" />
          <p className="text-[12px] sm:text-[13px] text-gold-800 flex-1">
            Some data could not be loaded. The dashboard is showing available information.
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-gold-700 bg-gold-100 rounded-lg hover:bg-gold-200 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      )}

      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
            ReConnect AI
          </h1>
          <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
            <span className="hidden sm:inline">Guest intelligence, churn prediction & campaign optimization</span>
            <span className="sm:hidden">Guest intelligence & campaigns</span>
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            icon={RefreshCw}
            loading={refreshing}
            onClick={handleRefresh}
            className="text-[12px] sm:text-[13px]"
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Link to="/admin/ai/crm">
            <Button variant="primary" icon={MessageSquare} className="text-[12px] sm:text-[13px]">
              <span className="hidden sm:inline">AI Chat</span>
              <span className="sm:hidden">Chat</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Guests Analyzed"
          value={stats?.guests_analyzed || 0}
          subtitle={`of ${stats?.total_guests || 0} total`}
          icon={Users}
          iconBgColor="bg-ocean-50"
          iconColor="text-ocean-600"
        />
        <StatCard
          title="Avg Health Score"
          value={`${stats?.average_health_score?.toFixed(0) || 0}/100`}
          subtitle="Guest satisfaction"
          icon={Heart}
          iconBgColor="bg-sage-50"
          iconColor="text-sage-600"
          trend={stats?.average_health_score && stats.average_health_score >= 70 ? 'up' : 'down'}
          trendValue={stats?.average_health_score && stats.average_health_score >= 70 ? 'Healthy' : 'Needs attention'}
        />
        <StatCard
          title="Avg Churn Risk"
          value={`${stats?.average_churn_risk?.toFixed(0) || 0}%`}
          subtitle="Guest retention risk"
          icon={AlertTriangle}
          iconBgColor={stats?.average_churn_risk && stats.average_churn_risk > 40 ? 'bg-rose-50' : 'bg-gold-50'}
          iconColor={stats?.average_churn_risk && stats.average_churn_risk > 40 ? 'text-rose-600' : 'text-gold-600'}
        />
        <StatCard
          title="Open Alerts"
          value={stats?.open_alerts || 0}
          subtitle={`${stats?.recovery_pending || 0} recoveries pending`}
          icon={Zap}
          iconBgColor="bg-terra-50"
          iconColor="text-terra-600"
        />
      </div>

      {/* Health Distribution */}
      <div className="bg-white rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-neutral-900">Guest Health Distribution</h2>
              <p className="text-[13px] text-neutral-500 mt-0.5">Score breakdown across all analyzed guests</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <Clock className="w-3.5 h-3.5" />
              {stats?.last_updated ? new Date(stats.last_updated).toLocaleTimeString() : 'N/A'}
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          {stats?.health_distribution && (
            <HealthDistributionChart distribution={stats.health_distribution} />
          )}
        </div>
      </div>

      {/* Main Grid: At-Risk Guests + AI Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* At-Risk Guests */}
        <div className="lg:col-span-2">
          <SectionHeader
            icon={AlertTriangle}
            iconColor="text-rose-500"
            title="At-Risk Guests"
            badge={atRiskGuests.length}
            badgeColor="bg-rose-50 text-rose-600"
            action={
              <Link
                to="/admin/guests?filter=at-risk"
                className="text-[12px] font-semibold text-terra-600 hover:text-terra-700 flex items-center gap-0.5"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {atRiskGuests.length > 0 ? atRiskGuests.slice(0, 4).map((guest) => (
              <AtRiskGuestCard key={guest.guest_id} guest={guest} />
            )) : (
              <div className="md:col-span-2 bg-white rounded-[10px] p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                <p className="text-[13px] text-neutral-500">No at-risk guests detected</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Alerts */}
        <div>
          <SectionHeader
            icon={Zap}
            iconColor="text-terra-500"
            title="AI Alerts"
          />
          <div className="space-y-2 max-h-[360px] overflow-y-auto bg-neutral-50 rounded-[10px] p-3">
            {alerts.length > 0 ? alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} onAcknowledge={handleAcknowledgeAlert} />
            )) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                <p className="text-[13px] text-neutral-400">No open alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recovery Opportunities */}
      <div>
        <SectionHeader
          icon={Activity}
          iconColor="text-gold-600"
          title="Recovery Opportunities"
          badge={recoveryOpportunities.length}
          badgeColor="bg-gold-50 text-gold-700"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {recoveryOpportunities.length > 0 ? recoveryOpportunities.slice(0, 4).map((opp) => (
            <RecoveryCard key={opp.recovery_id} opportunity={opp} />
          )) : (
            <div className="md:col-span-2 lg:col-span-4 bg-white rounded-[10px] p-8 text-center">
              <Activity className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-[13px] text-neutral-400">No recovery opportunities detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Recommendations */}
      <div>
        <SectionHeader
          icon={Target}
          iconColor="text-sage-600"
          title="Campaign Recommendations"
          action={
            <Link
              to="/admin/crm"
              className="text-[12px] font-semibold text-terra-600 hover:text-terra-700 flex items-center gap-0.5"
            >
              Manage Campaigns <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {campaigns && (
            <>
              <CampaignSection
                title="Win-Back"
                guests={campaigns.win_back || []}
                icon={RefreshCw}
                iconBg="bg-rose-500"
              />
              <CampaignSection
                title="Loyalty"
                guests={campaigns.loyalty || []}
                icon={Award}
                iconBg="bg-gold-500"
              />
              <CampaignSection
                title="Upsell"
                guests={campaigns.upsell || []}
                icon={TrendingUp}
                iconBg="bg-sage-500"
              />
              <CampaignSection
                title="Direct Booking"
                guests={campaigns.direct_booking || []}
                icon={Mail}
                iconBg="bg-ocean-500"
              />
            </>
          )}
        </div>
      </div>

      {/* Segment Analysis */}
      {segments && (
        <div className="bg-white rounded-[10px] overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-neutral-900">Segment Analysis</h2>
            </div>
          </div>
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Churn Segments */}
              <div>
                <h3 className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">Churn Risk Distribution</h3>
                <div className="space-y-2.5">
                  {Object.entries(segments.churn_segments).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[13px] text-neutral-600 capitalize">{key}</span>
                      <span className="text-[13px] font-semibold text-neutral-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* LTV Segments */}
              <div>
                <h3 className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">LTV Segments</h3>
                <div className="space-y-2.5">
                  {Object.entries(segments.ltv_segments).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[13px] text-neutral-600 capitalize">{key.replace('_', ' ')}</span>
                      <span className="text-[13px] font-semibold text-neutral-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Summary */}
              <div className="flex flex-col justify-center items-center bg-neutral-50 rounded-lg p-5">
                <Sparkles className="w-7 h-7 text-terra-500 mb-2" />
                <p className="text-[28px] font-semibold tracking-tight text-neutral-900">{segments.total_analyzed}</p>
                <p className="text-[13px] text-neutral-500">Guests Analyzed</p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Last: {new Date(segments.analyzed_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
