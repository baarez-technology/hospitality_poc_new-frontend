/**
 * AI Segmentation Studio - CRM AI Integration
 * AI-powered guest segmentation with clustering algorithms and campaign recommendations
 */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Users,
  Target,
  TrendingUp,
  RefreshCw,
  X,
  Play,
  Settings,
  Download,
  Trash2,
  ChevronRight,
  BarChart3,
  Activity,
  Heart,
  AlertTriangle,
  DollarSign,
  Clock,
  User,
  Mail,
  Zap,
  Filter,
  Layers,
  Brain,
  PieChart,
  ArrowUpRight,
  Check,
  Info,
  Sliders,
  Loader2
} from 'lucide-react';
import Toast from '../../../components/admin-panel/common/Toast';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface SegmentCharacteristic {
  label: string;
  value: string | number;
  type: 'value' | 'frequency' | 'recency' | 'sentiment' | 'risk';
  score?: number;
}

interface SegmentMember {
  id: number;
  name: string;
  email: string;
  ltv: number;
  healthScore: number;
  lastVisit: string;
}

interface FeatureImportance {
  feature: string;
  importance: number;
  direction: 'positive' | 'negative';
}

interface AISegment {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  characteristics: SegmentCharacteristic[];
  avgLTV: number;
  healthScore: number;
  churnRisk: number;
  recommendedCampaigns: string[];
  featureImportance: FeatureImportance[];
  sampleMembers: SegmentMember[];
  createdAt: string;
  color: string;
}

interface GenerationConfig {
  numClusters: number;
  minClusterSize: number;
  algorithm: 'kmeans' | 'hdbscan';
}

// ============================================================================
// Default Data
// ============================================================================

const DEFAULT_SEGMENTS: AISegment[] = [
  {
    id: 'seg-1',
    name: 'High-Value Loyalists',
    description: 'Frequent visitors with high spending and excellent engagement. Core revenue drivers.',
    memberCount: 245,
    characteristics: [
      { label: 'Avg Spend', value: '₹4,500', type: 'value', score: 95 },
      { label: 'Visit Frequency', value: '8.5/year', type: 'frequency', score: 90 },
      { label: 'Last Visit', value: '<30 days', type: 'recency', score: 85 },
      { label: 'Sentiment', value: 'Very Positive', type: 'sentiment', score: 92 }
    ],
    avgLTV: 15200,
    healthScore: 92,
    churnRisk: 8,
    recommendedCampaigns: ['VIP Exclusive Offers', 'Early Access Events', 'Personalized Upgrades'],
    featureImportance: [
      { feature: 'Total Spend', importance: 0.95, direction: 'positive' },
      { feature: 'Visit Frequency', importance: 0.88, direction: 'positive' },
      { feature: 'Avg Order Value', importance: 0.82, direction: 'positive' },
      { feature: 'Loyalty Points', importance: 0.78, direction: 'positive' },
      { feature: 'Days Since Visit', importance: 0.65, direction: 'negative' }
    ],
    sampleMembers: [
      { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', ltv: 18500, healthScore: 95, lastVisit: '2024-12-20' },
      { id: 2, name: 'Michael Chen', email: 'm.chen@email.com', ltv: 16200, healthScore: 91, lastVisit: '2024-12-18' },
      { id: 3, name: 'Emily Williams', email: 'emily.w@email.com', ltv: 14800, healthScore: 89, lastVisit: '2024-12-15' }
    ],
    createdAt: '2024-12-20T10:30:00Z',
    color: '#4E5840'
  },
  {
    id: 'seg-2',
    name: 'At-Risk High Value',
    description: 'Previously high spenders showing declining engagement. Priority for retention.',
    memberCount: 128,
    characteristics: [
      { label: 'Avg Spend', value: '₹3,200', type: 'value', score: 80 },
      { label: 'Visit Decline', value: '-45%', type: 'frequency', score: 35 },
      { label: 'Last Visit', value: '60-90 days', type: 'recency', score: 40 },
      { label: 'Sentiment', value: 'Declining', type: 'sentiment', score: 55 }
    ],
    avgLTV: 8900,
    healthScore: 45,
    churnRisk: 72,
    recommendedCampaigns: ['Win-Back Offer', 'Personal Outreach', 'Feedback Request'],
    featureImportance: [
      { feature: 'Days Since Visit', importance: 0.92, direction: 'negative' },
      { feature: 'Visit Decline Rate', importance: 0.85, direction: 'negative' },
      { feature: 'Historical Spend', importance: 0.80, direction: 'positive' },
      { feature: 'Response Rate', importance: 0.72, direction: 'negative' },
      { feature: 'NPS Score', importance: 0.68, direction: 'negative' }
    ],
    sampleMembers: [
      { id: 4, name: 'James Rodriguez', email: 'j.rod@email.com', ltv: 12500, healthScore: 42, lastVisit: '2024-10-15' },
      { id: 5, name: 'Amanda Foster', email: 'a.foster@email.com', ltv: 9800, healthScore: 48, lastVisit: '2024-10-20' },
      { id: 6, name: 'David Kim', email: 'd.kim@email.com', ltv: 7200, healthScore: 45, lastVisit: '2024-10-25' }
    ],
    createdAt: '2024-12-20T10:30:00Z',
    color: '#DC2626'
  },
  {
    id: 'seg-3',
    name: 'Emerging Enthusiasts',
    description: 'New guests with high engagement potential. Growing spend trajectory.',
    memberCount: 312,
    characteristics: [
      { label: 'Avg Spend', value: '₹850', type: 'value', score: 55 },
      { label: 'Growth Rate', value: '+120%', type: 'frequency', score: 95 },
      { label: 'Last Visit', value: '<14 days', type: 'recency', score: 92 },
      { label: 'Sentiment', value: 'Positive', type: 'sentiment', score: 78 }
    ],
    avgLTV: 2400,
    healthScore: 78,
    churnRisk: 22,
    recommendedCampaigns: ['Welcome Series', 'Loyalty Enrollment', 'First Upgrade Offer'],
    featureImportance: [
      { feature: 'Spend Growth Rate', importance: 0.90, direction: 'positive' },
      { feature: 'Recent Activity', importance: 0.85, direction: 'positive' },
      { feature: 'Email Engagement', importance: 0.78, direction: 'positive' },
      { feature: 'Account Age', importance: 0.65, direction: 'negative' },
      { feature: 'Booking Lead Time', importance: 0.58, direction: 'positive' }
    ],
    sampleMembers: [
      { id: 7, name: 'Lisa Thompson', email: 'l.thompson@email.com', ltv: 2800, healthScore: 82, lastVisit: '2024-12-22' },
      { id: 8, name: 'Robert Martinez', email: 'r.mart@email.com', ltv: 2200, healthScore: 76, lastVisit: '2024-12-21' },
      { id: 9, name: 'Jennifer Lee', email: 'j.lee@email.com', ltv: 2000, healthScore: 79, lastVisit: '2024-12-19' }
    ],
    createdAt: '2024-12-20T10:30:00Z',
    color: '#5C9BA4'
  },
  {
    id: 'seg-4',
    name: 'Occasional Visitors',
    description: 'Infrequent but consistent guests. Opportunity for increased engagement.',
    memberCount: 456,
    characteristics: [
      { label: 'Avg Spend', value: '₹1,200', type: 'value', score: 60 },
      { label: 'Visit Frequency', value: '1.5/year', type: 'frequency', score: 45 },
      { label: 'Last Visit', value: '90-180 days', type: 'recency', score: 35 },
      { label: 'Sentiment', value: 'Neutral', type: 'sentiment', score: 65 }
    ],
    avgLTV: 3600,
    healthScore: 58,
    churnRisk: 38,
    recommendedCampaigns: ['Seasonal Promotions', 'Anniversary Offers', 'Referral Program'],
    featureImportance: [
      { feature: 'Visit Regularity', importance: 0.82, direction: 'positive' },
      { feature: 'Booking Pattern', importance: 0.75, direction: 'positive' },
      { feature: 'Season Preference', importance: 0.70, direction: 'positive' },
      { feature: 'Price Sensitivity', importance: 0.68, direction: 'negative' },
      { feature: 'Direct Booking Rate', importance: 0.55, direction: 'positive' }
    ],
    sampleMembers: [
      { id: 10, name: 'Chris Anderson', email: 'c.anderson@email.com', ltv: 4200, healthScore: 62, lastVisit: '2024-09-15' },
      { id: 11, name: 'Nancy Wilson', email: 'n.wilson@email.com', ltv: 3800, healthScore: 55, lastVisit: '2024-08-20' },
      { id: 12, name: 'Kevin Brown', email: 'k.brown@email.com', ltv: 3100, healthScore: 58, lastVisit: '2024-10-01' }
    ],
    createdAt: '2024-12-20T10:30:00Z',
    color: '#A57865'
  },
  {
    id: 'seg-5',
    name: 'Budget Conscious',
    description: 'Price-sensitive guests who respond well to promotions and deals.',
    memberCount: 389,
    characteristics: [
      { label: 'Avg Spend', value: '₹520', type: 'value', score: 35 },
      { label: 'Promo Response', value: '85%', type: 'frequency', score: 88 },
      { label: 'Last Visit', value: '<60 days', type: 'recency', score: 65 },
      { label: 'Sentiment', value: 'Positive', type: 'sentiment', score: 72 }
    ],
    avgLTV: 1800,
    healthScore: 65,
    churnRisk: 32,
    recommendedCampaigns: ['Flash Sales', 'Early Bird Discounts', 'Package Deals'],
    featureImportance: [
      { feature: 'Discount Usage', importance: 0.92, direction: 'positive' },
      { feature: 'Price Comparison', importance: 0.85, direction: 'positive' },
      { feature: 'Promo Response Time', importance: 0.78, direction: 'positive' },
      { feature: 'Avg Order Value', importance: 0.65, direction: 'negative' },
      { feature: 'Direct Booking Rate', importance: 0.45, direction: 'negative' }
    ],
    sampleMembers: [
      { id: 13, name: 'Patricia Davis', email: 'p.davis@email.com', ltv: 2100, healthScore: 68, lastVisit: '2024-11-15' },
      { id: 14, name: 'Thomas Garcia', email: 't.garcia@email.com', ltv: 1650, healthScore: 62, lastVisit: '2024-12-01' },
      { id: 15, name: 'Sandra Miller', email: 's.miller@email.com', ltv: 1500, healthScore: 65, lastVisit: '2024-11-28' }
    ],
    createdAt: '2024-12-20T10:30:00Z',
    color: '#CDB261'
  }
];

// ============================================================================
// Helper Components
// ============================================================================

const CharacteristicBadge = ({ characteristic }: { characteristic: SegmentCharacteristic }) => {
  const getColorByType = (type: string, score?: number) => {
    if (score !== undefined) {
      if (score >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
      if (score >= 60) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
    }

    switch (type) {
      case 'value': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'frequency': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      case 'recency': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
      case 'sentiment': return { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' };
      case 'risk': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
      default: return { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200' };
    }
  };

  const colors = getColorByType(characteristic.type, characteristic.score);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
      <span className="text-[10px] opacity-70">{characteristic.label}:</span>
      {characteristic.value}
    </span>
  );
};

const FeatureImportanceChart = ({ features }: { features: FeatureImportance[] }) => {
  const maxImportance = Math.max(...features.map(f => f.importance));

  return (
    <div className="space-y-2">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 w-28 truncate">{feature.feature}</span>
          <div className="flex-1 h-4 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                feature.direction === 'positive' ? 'bg-emerald-500' : 'bg-red-400'
              }`}
              style={{ width: `${(feature.importance / maxImportance) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-neutral-700 w-12 text-right">
            {(feature.importance * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
};

const MemberPreviewList = ({ members }: { members: SegmentMember[] }) => (
  <div className="space-y-2">
    {members.map((member) => (
      <div key={member.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
            <User className="w-4 h-4 text-neutral-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">{member.name}</p>
            <p className="text-xs text-neutral-500">{member.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-neutral-900">₹{member.ltv.toLocaleString()}</p>
          <p className="text-xs text-neutral-500">Health: {member.healthScore}%</p>
        </div>
      </div>
    ))}
  </div>
);

const LoadingState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-4 border-[#5C9BA4]/20 border-t-[#5C9BA4] animate-spin" />
      <Brain className="absolute inset-0 m-auto w-6 h-6 text-[#5C9BA4]" />
    </div>
    <p className="mt-4 text-neutral-600 font-medium">{message}</p>
    <p className="text-sm text-neutral-400 mt-1">This may take a few moments...</p>
  </div>
);

// ============================================================================
// Segment Card Component
// ============================================================================

const SegmentCard = ({
  segment,
  onViewDetails,
  onDelete
}: {
  segment: AISegment;
  onViewDetails: (segment: AISegment) => void;
  onDelete: (segmentId: string) => void;
}) => (
  <div
    className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-lg transition-all group"
    style={{ borderLeftColor: segment.color, borderLeftWidth: '4px' }}
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${segment.color}15` }}
        >
          <Layers className="w-5 h-5" style={{ color: segment.color }} />
        </div>
        <div>
          <h3 className="font-bold text-neutral-900">{segment.name}</h3>
          <p className="text-sm text-neutral-500">{segment.memberCount.toLocaleString()} members</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(segment.id)}
          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete segment"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>

    {/* Description */}
    <p className="text-xs text-neutral-600 mb-4 line-clamp-2">{segment.description}</p>

    {/* Characteristics */}
    <div className="flex flex-wrap gap-1.5 mb-4">
      {segment.characteristics.slice(0, 3).map((char, index) => (
        <CharacteristicBadge key={index} characteristic={char} />
      ))}
      {segment.characteristics.length > 3 && (
        <span className="text-xs text-neutral-400 self-center">+{segment.characteristics.length - 3} more</span>
      )}
    </div>

    {/* Metrics */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-neutral-50 rounded-lg p-2.5 text-center">
        <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
          <DollarSign className="w-3.5 h-3.5" />
        </div>
        <p className="text-sm font-bold text-neutral-900">₹{(segment.avgLTV / 1000).toFixed(1)}k</p>
        <p className="text-[10px] text-neutral-500">Avg LTV</p>
      </div>
      <div className="bg-neutral-50 rounded-lg p-2.5 text-center">
        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
          <Heart className="w-3.5 h-3.5" />
        </div>
        <p className="text-sm font-bold text-neutral-900">{segment.healthScore}%</p>
        <p className="text-[10px] text-neutral-500">Health</p>
      </div>
      <div className="bg-neutral-50 rounded-lg p-2.5 text-center">
        <div className={`flex items-center justify-center gap-1 mb-1 ${segment.churnRisk > 50 ? 'text-red-500' : 'text-amber-500'}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
        <p className="text-sm font-bold text-neutral-900">{segment.churnRisk}%</p>
        <p className="text-[10px] text-neutral-500">Churn Risk</p>
      </div>
    </div>

    {/* Recommended Campaigns */}
    <div className="mb-4">
      <p className="text-[10px] font-medium text-neutral-500 uppercase mb-2">Recommended Campaigns</p>
      <div className="flex flex-wrap gap-1">
        {segment.recommendedCampaigns.slice(0, 2).map((campaign, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#4E5840]/10 text-[#4E5840]"
          >
            <Target className="w-3 h-3" />
            {campaign}
          </span>
        ))}
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
      <span className="text-[10px] text-neutral-400">
        <Clock className="w-3 h-3 inline mr-1" />
        {new Date(segment.createdAt).toLocaleDateString()}
      </span>
      <button
        onClick={() => onViewDetails(segment)}
        className="text-xs font-medium text-[#A57865] hover:text-[#8E6554] flex items-center gap-1"
      >
        View Details <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  </div>
);

// ============================================================================
// Modal Components
// ============================================================================

const GenerateSegmentsPanel = ({
  config,
  onConfigChange,
  onGenerate,
  isGenerating
}: {
  config: GenerationConfig;
  onConfigChange: (config: GenerationConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) => (
  <div className="bg-white rounded-xl border border-neutral-200 p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5C9BA4]/20 to-[#4E5840]/20 flex items-center justify-center">
        <Sliders className="w-5 h-5 text-[#5C9BA4]" />
      </div>
      <div>
        <h3 className="font-bold text-neutral-900">Segmentation Configuration</h3>
        <p className="text-sm text-neutral-500">Configure AI clustering parameters</p>
      </div>
    </div>

    <div className="space-y-4">
      {/* Number of Clusters */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">Number of Segments</label>
          <span className="text-sm font-bold text-[#5C9BA4]">{config.numClusters}</span>
        </div>
        <input
          type="range"
          min={2}
          max={20}
          value={config.numClusters}
          onChange={(e) => onConfigChange({ ...config, numClusters: parseInt(e.target.value) })}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#5C9BA4]"
        />
        <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
          <span>2 (Broad)</span>
          <span>20 (Granular)</span>
        </div>
      </div>

      {/* Minimum Cluster Size */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Minimum Segment Size</label>
        <input
          type="number"
          min={10}
          value={config.minClusterSize}
          onChange={(e) => onConfigChange({ ...config, minClusterSize: parseInt(e.target.value) || 10 })}
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C9BA4]/20 focus:border-[#5C9BA4]"
        />
        <p className="text-[10px] text-neutral-400 mt-1">Minimum members per segment</p>
      </div>

      {/* Algorithm Selector */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Algorithm</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onConfigChange({ ...config, algorithm: 'kmeans' })}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              config.algorithm === 'kmeans'
                ? 'border-[#5C9BA4] bg-[#5C9BA4]/5'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <p className="font-medium text-sm text-neutral-900">K-Means</p>
            <p className="text-[10px] text-neutral-500">Fast, equal-sized clusters</p>
          </button>
          <button
            onClick={() => onConfigChange({ ...config, algorithm: 'hdbscan' })}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              config.algorithm === 'hdbscan'
                ? 'border-[#5C9BA4] bg-[#5C9BA4]/5'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <p className="font-medium text-sm text-neutral-900">HDBSCAN</p>
            <p className="text-[10px] text-neutral-500">Density-based, varied sizes</p>
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#5C9BA4] to-[#4E5840] text-white rounded-xl text-sm font-medium hover:from-[#4A8891] hover:to-[#3D4733] transition-colors disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Segments...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Segments
          </>
        )}
      </button>
    </div>
  </div>
);

const SegmentDetailModal = ({
  isOpen,
  onClose,
  segment,
  onCreateCampaign,
  onExportMembers
}: {
  isOpen: boolean;
  onClose: () => void;
  segment: AISegment | null;
  onCreateCampaign: (segment: AISegment) => void;
  onExportMembers: (segment: AISegment) => void;
}) => {
  if (!isOpen || !segment) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b border-neutral-200"
          style={{ backgroundColor: `${segment.color}08` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${segment.color}20` }}
            >
              <Layers className="w-6 h-6" style={{ color: segment.color }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">{segment.name}</h2>
              <p className="text-sm text-neutral-500">{segment.memberCount.toLocaleString()} members</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-4 space-y-6">
          {/* Description */}
          <div>
            <p className="text-sm text-neutral-600">{segment.description}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-neutral-900">₹{segment.avgLTV.toLocaleString()}</p>
              <p className="text-xs text-neutral-500">Average LTV</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Heart className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-neutral-900">{segment.healthScore}%</p>
              <p className="text-xs text-neutral-500">Health Score</p>
            </div>
            <div className={`rounded-xl p-4 text-center ${segment.churnRisk > 50 ? 'bg-red-50' : 'bg-amber-50'}`}>
              <AlertTriangle className={`w-5 h-5 mx-auto mb-2 ${segment.churnRisk > 50 ? 'text-red-600' : 'text-amber-600'}`} />
              <p className="text-xl font-bold text-neutral-900">{segment.churnRisk}%</p>
              <p className="text-xs text-neutral-500">Churn Risk</p>
            </div>
          </div>

          {/* Characteristics */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Characteristics</h3>
            <div className="flex flex-wrap gap-2">
              {segment.characteristics.map((char, index) => (
                <CharacteristicBadge key={index} characteristic={char} />
              ))}
            </div>
          </div>

          {/* Feature Importance */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Feature Importance</h3>
            <div className="bg-neutral-50 rounded-xl p-4">
              <FeatureImportanceChart features={segment.featureImportance} />
            </div>
          </div>

          {/* Recommended Campaigns */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Recommended Campaigns</h3>
            <div className="space-y-2">
              {segment.recommendedCampaigns.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-[#4E5840]" />
                    </div>
                    <span className="text-sm font-medium text-neutral-900">{campaign}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Sample Members */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Sample Members</h3>
            <MemberPreviewList members={segment.sampleMembers} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={() => onExportMembers(segment)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Members
          </button>
          <button
            onClick={() => onCreateCampaign(segment)}
            className="flex items-center gap-2 px-6 py-2 bg-[#4E5840] text-white text-sm font-medium rounded-lg hover:bg-[#4E5840]/90 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>,
    document.body
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function AISegmentationStudio() {
  // State
  const [segments, setSegments] = useState<AISegment[]>(DEFAULT_SEGMENTS);
  const [config, setConfig] = useState<GenerationConfig>({
    numClusters: 5,
    minClusterSize: 50,
    algorithm: 'kmeans'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<AISegment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Handlers
  const handleGenerateSegments = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate new segment names based on config
      const newSegments = [...DEFAULT_SEGMENTS].slice(0, config.numClusters);
      newSegments.forEach(seg => {
        seg.createdAt = new Date().toISOString();
        seg.memberCount = Math.floor(seg.memberCount * (0.8 + Math.random() * 0.4));
      });

      setSegments(newSegments);
      setToast({ message: `Generated ${newSegments.length} segments successfully`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to generate segments', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefreshSegments = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setToast({ message: 'Segments refreshed successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to refresh segments', type: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = (segment: AISegment) => {
    setSelectedSegment(segment);
    setDetailModalOpen(true);
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
    setToast({ message: 'Segment deleted', type: 'info' });
  };

  const handleCreateCampaign = (segment: AISegment) => {
    setToast({ message: `Creating campaign for ${segment.name}...`, type: 'info' });
    setDetailModalOpen(false);
    // In a real app, this would navigate to campaign creation
  };

  const handleExportMembers = (segment: AISegment) => {
    // Simulate export
    const csv = segment.sampleMembers.map(m => `${m.name},${m.email},${m.ltv},${m.healthScore}`).join('\n');
    const blob = new Blob([`Name,Email,LTV,Health Score\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${segment.name.toLowerCase().replace(/\s+/g, '-')}-members.csv`;
    a.click();
    setToast({ message: `Exported ${segment.sampleMembers.length} members`, type: 'success' });
  };

  // Calculate summary stats
  const totalMembers = segments.reduce((sum, s) => sum + s.memberCount, 0);
  const avgHealthScore = segments.length > 0
    ? Math.round(segments.reduce((sum, s) => sum + s.healthScore, 0) / segments.length)
    : 0;
  const avgChurnRisk = segments.length > 0
    ? Math.round(segments.reduce((sum, s) => sum + s.churnRisk, 0) / segments.length)
    : 0;
  const totalLTV = segments.reduce((sum, s) => sum + (s.avgLTV * s.memberCount), 0);

  return (
    <div className="flex-1 overflow-auto bg-neutral-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5C9BA4] via-purple-500 to-[#A57865] flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">AI Segmentation Studio</h1>
            <p className="text-sm text-neutral-500">
              AI-powered guest clustering and segment analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshSegments}
            disabled={refreshing || isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4E5840]/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-[#4E5840]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{segments.length}</p>
              <p className="text-sm text-neutral-500">Active Segments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C9BA4]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#5C9BA4]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{totalMembers.toLocaleString()}</p>
              <p className="text-sm text-neutral-500">Total Members</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{avgHealthScore}%</p>
              <p className="text-sm text-neutral-500">Avg Health Score</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">₹{(totalLTV / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-neutral-500">Total LTV</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Configuration Panel */}
        <div className="xl:col-span-1">
          <GenerateSegmentsPanel
            config={config}
            onConfigChange={setConfig}
            onGenerate={handleGenerateSegments}
            isGenerating={isGenerating}
          />

          {/* Quick Info */}
          <div className="mt-6 bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">Segmentation Tips</h3>
                <p className="text-sm text-neutral-500">Best practices</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Start with 5-7 segments for balanced granularity</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Use K-Means for faster processing of large datasets</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>HDBSCAN works better for identifying outliers</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Review feature importance to understand segment drivers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Segments Grid */}
        <div className="xl:col-span-3">
          {isGenerating ? (
            <div className="bg-white rounded-xl border border-neutral-200">
              <LoadingState message="Analyzing guests and generating segments..." />
            </div>
          ) : segments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segments.map((segment) => (
                <SegmentCard
                  key={segment.id}
                  segment={segment}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDeleteSegment}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Segments Generated</h3>
              <p className="text-sm text-neutral-500 mb-4">
                Configure your parameters and generate AI-powered segments
              </p>
              <button
                onClick={handleGenerateSegments}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C9BA4] text-white rounded-lg text-sm font-medium hover:bg-[#4A8891] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Generate Segments
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Segment Detail Modal */}
      <SegmentDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedSegment(null);
        }}
        segment={selectedSegment}
        onCreateCampaign={handleCreateCampaign}
        onExportMembers={handleExportMembers}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
