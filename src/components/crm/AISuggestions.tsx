import { useState, useEffect } from 'react';
import {
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  AlertCircle,
  Users,
  Mail,
  Globe,
  Star,
  Award,
  RefreshCw,
  Gift,
  MessageCircle,
  Layers,
  Loader2,
  Play,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { crmAIService, AISuggestions as AISuggestionsType, CampaignSuggestion } from '../../api/services/crm-ai.service';

interface AISuggestionsProps {
  onCreateCampaign?: (suggestion: CampaignSuggestion) => void;
  onActionClick?: (action: any) => void;
}

const ICON_MAP: Record<string, any> = {
  globe: Globe,
  refresh: RefreshCw,
  star: Star,
  award: Award,
  activity: TrendingUp,
  crown: Star,
  mail: Mail,
  'trending-up': TrendingUp,
  layers: Layers,
  zap: Zap,
  'message-circle': MessageCircle,
  gift: Gift,
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-rose-50 text-rose-600 border border-rose-100';
    case 'medium': return 'bg-[#CDB261]/10 text-[#CDB261] border border-[#CDB261]/20';
    case 'low': return 'bg-[#4E5840]/10 text-[#4E5840] border border-[#4E5840]/20';
    default: return 'bg-neutral-100 text-neutral-600 border border-neutral-200';
  }
};

const getUrgencyAccent = (urgency: string) => {
  switch (urgency) {
    case 'high': return 'border-l-rose-400';
    case 'medium': return 'border-l-[#CDB261]';
    case 'low': return 'border-l-[#4E5840]';
    default: return 'border-l-neutral-200';
  }
};

const getImpactDot = (impact: string) => {
  switch (impact) {
    case 'high': return 'bg-[#4E5840]';
    case 'medium': return 'bg-[#CDB261]';
    case 'low': return 'bg-neutral-400';
    default: return 'bg-neutral-300';
  }
};

export default function AISuggestions({ onCreateCampaign, onActionClick }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestionsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('campaigns');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmAIService.getAISuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error('Failed to fetch AI suggestions:', err);
      setError('Failed to load AI suggestions. Make sure the API is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: CampaignSuggestion) => {
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
    if (onCreateCampaign) {
      onCreateCampaign(suggestion);
    }
  };

  const handleActionClick = (action: any) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[10px] border border-neutral-200">
        <div className="px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#A57865]/10 flex items-center justify-center">
              <Sparkles className="w-[18px] h-[18px] text-[#A57865]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-900">ReConnect AI Suggestions</h3>
              <p className="text-[12px] text-neutral-400 mt-0.5">Analyzing your guest data...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 text-[#A57865] animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[10px] border border-neutral-200">
        <div className="px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#A57865]/10 flex items-center justify-center">
              <Sparkles className="w-[18px] h-[18px] text-[#A57865]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-900">ReConnect AI Suggestions</h3>
              <p className="text-[12px] text-neutral-400 mt-0.5">AI-powered campaign recommendations</p>
            </div>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-[10px] bg-[#CDB261]/10 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-[#CDB261]" />
          </div>
          <p className="text-[13px] text-neutral-600 mb-4">{error}</p>
          <button
            onClick={fetchSuggestions}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#A57865] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#8E6554] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!suggestions) return null;

  const { campaign_suggestions, segment_insights, action_items, quick_wins } = suggestions;

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', count: campaign_suggestions.length, icon: Target },
    { id: 'insights', label: 'Insights', count: segment_insights.length, icon: TrendingUp },
    { id: 'actions', label: 'Actions', count: action_items.length, icon: AlertCircle },
    { id: 'quickwins', label: 'Quick Wins', count: quick_wins.length, icon: Zap },
  ];

  return (
    <div className="bg-white rounded-[10px] border border-neutral-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#A57865]/10 flex items-center justify-center">
              <Sparkles className="w-[18px] h-[18px] text-[#A57865]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-900">ReConnect AI Suggestions</h3>
              <p className="text-[12px] text-neutral-400 mt-0.5">
                Based on {suggestions.analyzed_guests} guests analyzed
              </p>
            </div>
          </div>
          <button
            onClick={fetchSuggestions}
            className="p-2 hover:bg-neutral-100 rounded-[8px] transition-colors"
            title="Refresh suggestions"
          >
            <RefreshCw className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2.5 flex items-center justify-center gap-1.5 text-[12px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#A57865] border-b-2 border-[#A57865]'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === tab.id ? 'bg-[#A57865]/10 text-[#A57865]' : 'bg-neutral-100 text-neutral-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-[480px] overflow-y-auto custom-scrollbar">
        {/* Campaign Suggestions */}
        {activeTab === 'campaigns' && (
          <div className="space-y-3">
            {campaign_suggestions.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-[10px] bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-neutral-300" />
                </div>
                <p className="text-[13px] font-medium text-neutral-600">No campaign suggestions</p>
                <p className="text-[11px] text-neutral-400 mt-1">AI will suggest campaigns based on your guest data</p>
              </div>
            ) : (
              campaign_suggestions.map((suggestion) => {
                const IconComponent = ICON_MAP[suggestion.icon] || Target;
                const isApplied = appliedSuggestions.has(suggestion.id);
                return (
                  <div
                    key={suggestion.id}
                    className={`rounded-[8px] p-4 border transition-all ${
                      isApplied
                        ? 'bg-[#4E5840]/5 border-[#4E5840]/20'
                        : 'bg-neutral-50 border-neutral-100 hover:border-neutral-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 ${
                        isApplied ? 'bg-[#4E5840]/10' : 'bg-[#A57865]/10'
                      }`}>
                        {isApplied ? (
                          <CheckCircle2 className="w-[18px] h-[18px] text-[#4E5840]" />
                        ) : (
                          <IconComponent className="w-[18px] h-[18px] text-[#A57865]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[13px] font-semibold text-neutral-900">{suggestion.title}</h4>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getPriorityBadge(suggestion.priority)}`}>
                            {suggestion.priority}
                          </span>
                        </div>
                        <p className="text-[12px] text-neutral-500 mb-3">{suggestion.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-neutral-400" />
                            <span className="text-neutral-600">{suggestion.target_count} guests</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-neutral-400" />
                            <span className="text-neutral-600">{suggestion.estimated_impact}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Gift className="w-3 h-3 text-neutral-400" />
                            <span className="text-neutral-600">{suggestion.recommended_offer}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-neutral-400" />
                            <span className="text-neutral-600 capitalize">{suggestion.best_channel}</span>
                          </div>
                        </div>
                        {!isApplied ? (
                          <button
                            onClick={() => handleApplySuggestion(suggestion)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A57865] text-white rounded-[6px] text-[11px] font-semibold hover:bg-[#8E6554] transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            Create Campaign
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#4E5840] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Campaign created
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Segment Insights */}
        {activeTab === 'insights' && (
          <div className="space-y-3">
            {segment_insights.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-[10px] bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-neutral-300" />
                </div>
                <p className="text-[13px] font-medium text-neutral-600">No segment insights available</p>
              </div>
            ) : (
              segment_insights.map((insight, index) => {
                const IconComponent = ICON_MAP[insight.icon] || TrendingUp;
                return (
                  <div
                    key={index}
                    className="bg-neutral-50 rounded-[8px] p-4 border border-neutral-100 hover:border-neutral-200 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-[8px] bg-[#5C9BA4]/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-[18px] h-[18px] text-[#5C9BA4]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-semibold text-neutral-900 mb-1">{insight.title}</h4>
                        <p className="text-[12px] text-neutral-600 mb-2">{insight.insight}</p>
                        <div className="flex items-start gap-1.5 bg-[#5C9BA4]/5 rounded-[6px] p-2.5">
                          <Sparkles className="w-3 h-3 text-[#5C9BA4] flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-[#5C9BA4] font-medium">{insight.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Action Items */}
        {activeTab === 'actions' && (
          <div className="space-y-3">
            {action_items.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-[10px] bg-[#4E5840]/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-[#4E5840]" />
                </div>
                <p className="text-[13px] font-medium text-neutral-600">No action items</p>
                <p className="text-[11px] text-neutral-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              action_items.map((item, index) => {
                const IconComponent = ICON_MAP[item.icon] || AlertCircle;
                return (
                  <div
                    key={index}
                    className={`bg-neutral-50 rounded-[8px] p-4 border border-neutral-100 border-l-[3px] hover:border-neutral-200 transition-colors ${getUrgencyAccent(item.urgency)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[8px] bg-[#4E5840]/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-[18px] h-[18px] text-[#4E5840]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-semibold text-neutral-900">{item.title}</h4>
                        <p className="text-[12px] text-neutral-500 mt-0.5">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getPriorityBadge(item.urgency)}`}>
                          {item.urgency}
                        </span>
                        <button
                          onClick={() => handleActionClick(item)}
                          className="p-1.5 hover:bg-neutral-200 rounded-[6px] transition-colors"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Quick Wins */}
        {activeTab === 'quickwins' && (
          <div className="space-y-3">
            {quick_wins.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-[10px] bg-[#CDB261]/10 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-[#CDB261]" />
                </div>
                <p className="text-[13px] font-medium text-neutral-600">No quick wins available</p>
                <p className="text-[11px] text-neutral-400 mt-1">AI will identify quick wins based on your guest data</p>
              </div>
            ) : (
              quick_wins.map((win, index) => {
                const IconComponent = ICON_MAP[win.icon] || Zap;
                return (
                  <div
                    key={index}
                    className="bg-neutral-50 rounded-[8px] p-4 border border-neutral-100 hover:border-neutral-200 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-[8px] bg-[#CDB261]/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-[18px] h-[18px] text-[#CDB261]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[13px] font-semibold text-neutral-900">{win.title}</h4>
                        </div>
                        <p className="text-[12px] text-neutral-500 mb-3">{win.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold ${
                              win.effort === 'low'
                                ? 'bg-[#4E5840]/10 text-[#4E5840] border border-[#4E5840]/20'
                                : win.effort === 'medium'
                                  ? 'bg-[#CDB261]/10 text-[#CDB261] border border-[#CDB261]/20'
                                  : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                win.effort === 'low' ? 'bg-[#4E5840]' : win.effort === 'medium' ? 'bg-[#CDB261]' : 'bg-rose-500'
                              }`} />
                              {win.effort} effort
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold ${
                              win.impact === 'high'
                                ? 'bg-[#4E5840]/10 text-[#4E5840] border border-[#4E5840]/20'
                                : win.impact === 'medium'
                                  ? 'bg-[#CDB261]/10 text-[#CDB261] border border-[#CDB261]/20'
                                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${getImpactDot(win.impact)}`} />
                              {win.impact} impact
                            </span>
                          </div>
                          <button
                            onClick={() => handleActionClick(win)}
                            className="p-1.5 hover:bg-neutral-200 rounded-[6px] transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
