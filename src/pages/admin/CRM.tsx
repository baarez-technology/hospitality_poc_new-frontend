import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  RefreshCw,
  Download,
  Plus,
  TrendingUp,
  Award,
  Send,
  Target,
  DollarSign,
  BarChart2,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui2/Button';
import {
  exportSegmentsToCSV,
  exportGuestsToCSV,
  exportCampaignsToCSV,
  generateLTVTrendData,
  generateStayFrequencyData,
  DEFAULT_LOYALTY_TIERS
} from '../../utils/crm';
import { getSegmentOverrides, getDeletedSegmentIds } from '../../utils/crmSegmentOverrides';
import {
  sampleCampaigns,
  sampleTemplates
} from '../../data/crmData';
import crmAIService, { CRMGuest, CRMSegment, CRMStats, CampaignSuggestion } from '../../api/services/crm-ai.service';
import { generateId } from '../../utils/crm';

// Components
import SegmentList from '../../components/crm/SegmentList';
import CreateSegmentModal from '../../components/crm/CreateSegmentModal';
import LoyaltyTiers from '../../components/crm/LoyaltyTiers';
import TemplateCenter from '../../components/crm/TemplateCenter';
import CRMTabCampaigns from '../../components/crm/CRMTabCampaigns';
import CRMInsights from '../../components/crm/CRMInsights';
import AISuggestions from '../../components/crm/AISuggestions';

// Storage keys for campaigns and templates (still use localStorage for these)
const CAMPAIGNS_STORAGE_KEY = 'glimmora_crm_campaigns';
const TEMPLATES_STORAGE_KEY = 'glimmora_crm_templates';
const TIERS_STORAGE_KEY = 'glimmora_crm_tiers';

function loadFromStorage(key: string, defaultValue: any) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
  }
  return defaultValue;
}

function saveToStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
}

export default function CRM() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Real API Data State
  const [guests, setGuests] = useState<CRMGuest[]>([]);
  const [segments, setSegments] = useState<CRMSegment[]>([]);
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local Storage Data (campaigns, templates, tiers)
  const [campaigns, setCampaigns] = useState(() => loadFromStorage(CAMPAIGNS_STORAGE_KEY, sampleCampaigns));
  const [templates, setTemplates] = useState(() => loadFromStorage(TEMPLATES_STORAGE_KEY, sampleTemplates));
  const [loyaltyTiers, setLoyaltyTiers] = useState(() => loadFromStorage(TIERS_STORAGE_KEY, DEFAULT_LOYALTY_TIERS));

  // UI State
  const [activeTab, setActiveTab] = useState('segments');
  const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);

  // Fetch real data from API
  const fetchCRMData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [guestsData, segmentsData, statsData] = await Promise.all([
        crmAIService.getCRMGuests(1, 500),
        crmAIService.getCRMSegments(),
        crmAIService.getCRMStats()
      ]);
      setGuests(guestsData.guests);
      const deletedIds = getDeletedSegmentIds();
      const visibleSegments = (segmentsData.segments || []).filter((seg: CRMSegment) => !deletedIds.includes(seg.id));
      const overrides = getSegmentOverrides();
      const mergedSegments = visibleSegments.map((seg: CRMSegment) => {
        const o = overrides[seg.id];
        if (!o) return seg;
        return { ...seg, ...o } as CRMSegment;
      });
      setSegments(mergedSegments);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch CRM data:', error);
      showToast('Failed to load CRM data from server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Fetch data on mount
  useEffect(() => {
    fetchCRMData();
  }, [fetchCRMData]);

  // Persist campaigns, templates, tiers to localStorage
  useEffect(() => { saveToStorage(CAMPAIGNS_STORAGE_KEY, campaigns); }, [campaigns]);
  useEffect(() => { saveToStorage(TEMPLATES_STORAGE_KEY, templates); }, [templates]);
  useEffect(() => { saveToStorage(TIERS_STORAGE_KEY, loyaltyTiers); }, [loyaltyTiers]);

  // Computed KPIs (use API stats when available)
  const kpis = useMemo(() => {
    if (stats) {
      return {
        totalGuests: stats.totalGuests,
        repeatGuests: stats.repeatGuests,
        avgLTV: stats.avgLTV,
        loyaltyCount: stats.loyaltyMembers,
        activeSegments: segments.length,
        engagementRate: stats.engagementRate
      };
    }
    // Fallback to calculated values
    return {
      totalGuests: guests.length,
      repeatGuests: guests.filter(g => g.totalStays > 1).length,
      avgLTV: guests.length > 0 ? guests.reduce((sum, g) => sum + g.totalRevenue, 0) / guests.length : 0,
      loyaltyCount: guests.filter(g => g.loyaltyTier).length,
      activeSegments: segments.length,
      engagementRate: 44
    };
  }, [guests, segments, stats]);

  // Chart data
  const ltvTrendData = useMemo(() => generateLTVTrendData(guests), [guests]);
  const frequencyData = useMemo(() => generateStayFrequencyData(guests), [guests]);

  // Handlers
  const handleRefresh = async () => {
    showToast('Syncing CRM data...', 'info');
    await fetchCRMData();
    showToast('CRM data synced successfully', 'success');
  };

  const handleExportCSV = () => {
    let result;
    switch (activeTab) {
      case 'segments':
        result = exportSegmentsToCSV(segments);
        break;
      case 'campaigns':
        result = exportCampaignsToCSV(campaigns);
        break;
      default:
        result = exportGuestsToCSV(guests);
    }
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleCreateSegment = async (segment) => {
    try {
      const created = await crmAIService.createCRMSegment({
        name: segment.name,
        description: segment.description,
        filters: segment.filters,
        guestCount: segment.guestCount,
        avgRevenue: segment.avgRevenue,
        repeatRate: segment.repeatRate,
        color: segment.color,
        icon: segment.icon,
      });
      setSegments(prev => [...prev, created]);
      showToast('Segment created successfully', 'success');
    } catch (err) {
      console.error('Failed to create segment:', err);
      const message = err?.response?.data?.detail ?? err?.message ?? 'Failed to create segment';
      showToast(typeof message === 'string' ? message : 'Failed to create segment', 'error');
    }
  };

  const handleViewSegment = (segment) => {
    navigate(`/admin/crm/segment/${segment.id}`);
  };

  const handleSaveTiers = (newTiers) => {
    setLoyaltyTiers(newTiers);
    showToast('Loyalty tiers updated', 'success');
  };

  const handleDeleteTier = (tierId) => {
    setLoyaltyTiers(prev => prev.filter(t => t.id !== tierId));
    showToast('Tier deleted', 'success');
  };

  const handleSaveTemplates = (newTemplates) => {
    setTemplates(newTemplates);
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    showToast('Template deleted', 'success');
  };

  const handleSaveCampaigns = (newCampaigns) => {
    setCampaigns(newCampaigns);
  };

  const handleDeleteCampaign = (campaignId) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    showToast('Campaign deleted', 'success');
  };

  // Handler for creating campaigns from AI suggestions
  const handleCreateCampaignFromSuggestion = (suggestion: CampaignSuggestion) => {
    const channelMap: Record<string, string> = {
      'email': 'Email',
      'sms': 'SMS',
      'push': 'Push Notification',
      'whatsapp': 'WhatsApp'
    };

    const typeMap: Record<string, string> = {
      'win_back': 'Win-Back',
      'loyalty': 'Loyalty',
      'upsell': 'Upsell',
      'direct_booking': 'Direct Booking',
      'retention': 'Retention',
      'engagement': 'Engagement'
    };

    const newCampaign = {
      id: generateId(),
      name: suggestion.title,
      type: typeMap[suggestion.type] || suggestion.type,
      status: 'draft',
      channel: channelMap[suggestion.best_channel.toLowerCase()] || suggestion.best_channel,
      targetSegment: 'All Guests',
      targetCount: suggestion.target_count,
      scheduledDate: null,
      subject: suggestion.title,
      content: `${suggestion.description}\n\nRecommended Offer: ${suggestion.recommended_offer}\nEstimated Impact: ${suggestion.estimated_impact}`,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString(),
      aiGenerated: true,
      priority: suggestion.priority
    };

    setCampaigns(prev => [...prev, newCampaign]);
    showToast(`Campaign "${suggestion.title}" created from AI suggestion`, 'success');
    setActiveTab('campaigns');
  };

  // Handler for AI action items
  const handleAIActionClick = (action: any) => {
    showToast(`Action: ${action.title}`, 'info');
    // Could navigate to relevant section based on action type
    if (action.action_type === 'campaign') {
      setActiveTab('campaigns');
    } else if (action.action_type === 'segment') {
      setActiveTab('segments');
    }
  };

  const tabs = [
    { id: 'segments', label: 'Segments', shortLabel: 'Seg', icon: Target },
    { id: 'loyalty', label: 'Loyalty Tiers', shortLabel: 'Loyalty', icon: Award },
    { id: 'campaigns', label: 'Campaigns', shortLabel: 'Camp', icon: Send },
    { id: 'templates', label: 'Templates', shortLabel: 'Temp', icon: BarChart2 }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-terra-500 mx-auto mb-3 sm:mb-4" />
          <p className="text-[12px] sm:text-[13px] text-neutral-600">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
            CRM & Loyalty
          </h1>
          <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-0.5 sm:mt-1 hidden sm:block">
            Guest segmentation, loyalty performance and communication tools.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button variant="outline" icon={RefreshCw} onClick={handleRefresh} className="text-[12px] sm:text-[13px]">
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" icon={Download} onClick={handleExportCSV} className="text-[12px] sm:text-[13px]">
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowCreateSegmentModal(true)} className="text-[12px] sm:text-[13px]">
            <span className="hidden sm:inline">Create Segment</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-[10px] p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-terra-50 flex items-center justify-center flex-shrink-0">
              <Users className="w-3.5 h-3.5 text-terra-600" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 truncate">Guests</p>
          </div>
          <p className="text-xl sm:text-[26px] font-semibold tracking-tight text-neutral-900">{kpis.totalGuests.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-[10px] p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-sage-50 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-3.5 h-3.5 text-sage-600" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 truncate">Repeat</p>
          </div>
          <p className="text-xl sm:text-[26px] font-semibold tracking-tight text-neutral-900">{kpis.repeatGuests}</p>
        </div>

        <div className="bg-white rounded-[10px] p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-3.5 h-3.5 text-gold-600" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 truncate">Avg LTV</p>
          </div>
          <p className="text-xl sm:text-[26px] font-semibold tracking-tight text-sage-700 truncate">₹{kpis.avgLTV.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-[10px] p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-ocean-50 flex items-center justify-center flex-shrink-0">
              <Award className="w-3.5 h-3.5 text-ocean-600" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 truncate">Loyalty</p>
          </div>
          <p className="text-xl sm:text-[26px] font-semibold tracking-tight text-neutral-900">{kpis.loyaltyCount}</p>
        </div>

        <div className="bg-white rounded-[10px] p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-terra-50 flex items-center justify-center flex-shrink-0">
              <Target className="w-3.5 h-3.5 text-terra-600" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 truncate">Segments</p>
          </div>
          <p className="text-xl sm:text-[26px] font-semibold tracking-tight text-neutral-900">{kpis.activeSegments}</p>
        </div>

        <div className="bg-white rounded-[10px] p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-sage-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-sage-600" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 truncate">Engage</p>
          </div>
          <p className="text-xl sm:text-[26px] font-semibold tracking-tight text-sage-700">{kpis.engagementRate}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* LTV Trend */}
        <div className="bg-white rounded-[10px] p-3 sm:p-4">
          <h3 className="text-[12px] sm:text-[13px] font-semibold text-neutral-900 mb-3 sm:mb-4">LTV Trend</h3>
          <div className="h-[180px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ltvTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 10 }} stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`₹${value?.toLocaleString() ?? 0}`, 'Avg LTV']}
                />
                <Line
                  type="monotone"
                  dataKey="ltv"
                  stroke="#A57865"
                  strokeWidth={2}
                  dot={{ fill: '#A57865', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stay Frequency */}
        <div className="bg-white rounded-[10px] p-3 sm:p-4">
          <h3 className="text-[12px] sm:text-[13px] font-semibold text-neutral-900 mb-3 sm:mb-4">Stay Frequency Distribution</h3>
          <div className="h-[180px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="range" tick={{ fontSize: 9 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 10 }} stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#4E5840" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[10px]">
        <div className="px-2 sm:px-5 pt-1 sm:pt-0 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-shrink-0 px-3 sm:px-4 py-3 sm:py-3.5 text-[11px] sm:text-[13px] font-semibold transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'text-[#A57865]'
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-[#A57865]' : ''}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#A57865] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content - Full Width */}
      <div>
        {activeTab === 'segments' && (
          <SegmentList
            segments={segments}
            onViewSegment={handleViewSegment}
            onCreateSegment={() => setShowCreateSegmentModal(true)}
          />
        )}

        {activeTab === 'loyalty' && (
          <LoyaltyTiers
            tiers={loyaltyTiers}
            guests={guests}
            onSave={handleSaveTiers}
            onDelete={handleDeleteTier}
          />
        )}

        {activeTab === 'campaigns' && (
          <CRMTabCampaigns
            campaigns={campaigns}
            segments={segments}
            templates={templates}
            onSave={handleSaveCampaigns}
            onDelete={handleDeleteCampaign}
          />
        )}

        {activeTab === 'templates' && (
          <TemplateCenter
            templates={templates}
            onSave={handleSaveTemplates}
            onDelete={handleDeleteTemplate}
          />
        )}
      </div>

      {/* AI Suggestions & CRM Insights Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-6">
        {/* AI Suggestions - Connected to campaign creation */}
        <AISuggestions
          onCreateCampaign={handleCreateCampaignFromSuggestion}
          onActionClick={handleAIActionClick}
        />

        {/* CRM Insights */}
        <CRMInsights
          guests={guests}
          segments={segments}
          campaigns={campaigns}
          tiers={loyaltyTiers}
        />
      </div>

      {/* Create Segment Modal */}
      <CreateSegmentModal
        isOpen={showCreateSegmentModal}
        onClose={() => setShowCreateSegmentModal(false)}
        onSave={handleCreateSegment}
        guests={guests}
        loyaltyTiers={loyaltyTiers}
      />
    </div>
  );
}
