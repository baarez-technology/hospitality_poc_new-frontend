/**
 * Member Tier Management - CRM AI Integration
 * Comprehensive tier management with dynamic pricing, member enrollment, and benefits editing
 */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Crown,
  Users,
  TrendingUp,
  Gift,
  Search,
  Plus,
  Edit2,
  ArrowUp,
  RefreshCw,
  X,
  Check,
  Star,
  DollarSign,
  Calendar,
  Award,
  Percent,
  ChevronRight,
  ArrowUpRight,
  Calculator,
  Settings,
  UserPlus,
  Mail,
  Sparkles,
  Trash2,
  Info
} from 'lucide-react';
import { guestsService, Guest } from '../../../api/services/guests.service';
import Toast from '../../../components/admin-panel/common/Toast';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface MemberTier {
  id: string;
  name: string;
  icon: string;
  color: string;
  memberCount: number;
  discountPercent: number;
  pointsMultiplier: number;
  minPoints: number;
  minSpend: number;
  benefits: string[];
}

interface Member {
  id: number;
  name: string;
  email: string;
  tier: string;
  tierColor: string;
  points: number;
  totalSpend: number;
  joinDate: string;
  lastVisit: string;
  pointsToNextTier: number;
  nextTier?: string;
}

interface MemberStats {
  totalMembers: number;
  newThisMonth: number;
  upgrades: number;
  pointsIssued: number;
}

// ============================================================================
// Default Data
// ============================================================================

const DEFAULT_TIERS: MemberTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    icon: 'Award',
    color: '#CD7F32',
    memberCount: 1250,
    discountPercent: 5,
    pointsMultiplier: 1,
    minPoints: 0,
    minSpend: 0,
    benefits: ['Welcome drink', '5% room discount', 'Early check-in (subject to availability)']
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: 'Star',
    color: '#C0C0C0',
    memberCount: 680,
    discountPercent: 10,
    pointsMultiplier: 1.25,
    minPoints: 1000,
    minSpend: 2000,
    benefits: ['10% room discount', 'Guaranteed early check-in', 'Late checkout 2pm', 'Free room upgrade (when available)']
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: 'Crown',
    color: '#FFD700',
    memberCount: 340,
    discountPercent: 15,
    pointsMultiplier: 1.5,
    minPoints: 5000,
    minSpend: 10000,
    benefits: ['15% room discount', 'Guaranteed room upgrade', 'Late checkout 4pm', 'Complimentary breakfast', 'Airport transfer']
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: 'Sparkles',
    color: '#E5E4E2',
    memberCount: 120,
    discountPercent: 20,
    pointsMultiplier: 2,
    minPoints: 15000,
    minSpend: 30000,
    benefits: ['20% room discount', 'Suite upgrade guarantee', 'Late checkout 6pm', 'Full board included', 'Personal concierge', 'Spa credits']
  },
  {
    id: 'diamond',
    name: 'Diamond',
    icon: 'Crown',
    color: '#B9F2FF',
    memberCount: 45,
    discountPercent: 25,
    pointsMultiplier: 3,
    minPoints: 50000,
    minSpend: 100000,
    benefits: ['25% room discount', 'Presidential suite access', '24/7 concierge', 'Unlimited spa', 'Private dining', 'Helicopter transfers', 'Exclusive events']
  }
];

const MOCK_MEMBERS: Member[] = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@email.com', tier: 'Gold', tierColor: '#FFD700', points: 7500, totalSpend: 15200, joinDate: '2023-01-15', lastVisit: '2024-12-20', pointsToNextTier: 7500, nextTier: 'Platinum' },
  { id: 2, name: 'Michael Chen', email: 'michael.chen@email.com', tier: 'Platinum', tierColor: '#E5E4E2', points: 22000, totalSpend: 45000, joinDate: '2022-06-10', lastVisit: '2024-12-18', pointsToNextTier: 28000, nextTier: 'Diamond' },
  { id: 3, name: 'Emily Williams', email: 'emily.w@email.com', tier: 'Silver', tierColor: '#C0C0C0', points: 2100, totalSpend: 4500, joinDate: '2023-08-22', lastVisit: '2024-12-15', pointsToNextTier: 2900, nextTier: 'Gold' },
  { id: 4, name: 'James Rodriguez', email: 'j.rodriguez@email.com', tier: 'Diamond', tierColor: '#B9F2FF', points: 75000, totalSpend: 156000, joinDate: '2021-03-05', lastVisit: '2024-12-22', pointsToNextTier: 0, nextTier: undefined },
  { id: 5, name: 'Amanda Foster', email: 'amanda.f@email.com', tier: 'Bronze', tierColor: '#CD7F32', points: 450, totalSpend: 900, joinDate: '2024-09-10', lastVisit: '2024-11-30', pointsToNextTier: 550, nextTier: 'Silver' },
  { id: 6, name: 'David Kim', email: 'david.kim@email.com', tier: 'Gold', tierColor: '#FFD700', points: 8200, totalSpend: 17800, joinDate: '2023-04-18', lastVisit: '2024-12-19', pointsToNextTier: 6800, nextTier: 'Platinum' },
  { id: 7, name: 'Lisa Thompson', email: 'lisa.t@email.com', tier: 'Silver', tierColor: '#C0C0C0', points: 3500, totalSpend: 7200, joinDate: '2023-11-02', lastVisit: '2024-12-10', pointsToNextTier: 1500, nextTier: 'Gold' },
  { id: 8, name: 'Robert Martinez', email: 'r.martinez@email.com', tier: 'Bronze', tierColor: '#CD7F32', points: 200, totalSpend: 400, joinDate: '2024-11-15', lastVisit: '2024-12-01', pointsToNextTier: 800, nextTier: 'Silver' },
];

// ============================================================================
// Helper Components
// ============================================================================

const TierIcon = ({ tier, size = 'md' }: { tier: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  switch (tier.toLowerCase()) {
    case 'diamond':
      return <Sparkles className={sizeClasses[size]} />;
    case 'platinum':
      return <Star className={sizeClasses[size]} />;
    case 'gold':
      return <Crown className={sizeClasses[size]} />;
    case 'silver':
      return <Award className={sizeClasses[size]} />;
    default:
      return <Award className={sizeClasses[size]} />;
  }
};

const TierBadge = ({ tier, color, size = 'md' }: { tier: string; color: string; size?: 'sm' | 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full ${sizeClasses[size]}`}
      style={{ backgroundColor: `${color}20`, color: color }}
    >
      <TierIcon tier={tier} size="sm" />
      {tier}
    </span>
  );
};

const ProgressBar = ({ current, max, color }: { current: number; max: number; color: string }) => {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  return (
    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
};

const PointsDisplay = ({ points, label }: { points: number; label?: string }) => (
  <div className="flex items-center gap-1">
    <Star className="w-4 h-4 text-amber-500" />
    <span className="font-bold text-neutral-900">{points.toLocaleString()}</span>
    {label && <span className="text-xs text-neutral-500">{label}</span>}
  </div>
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'terra'
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'terra' | 'sage' | 'amber' | 'teal';
}) => {
  const colorClasses = {
    terra: 'from-[#A57865]/10 to-[#8E6554]/10 text-[#A57865]',
    sage: 'from-[#4E5840]/10 to-[#3D4733]/10 text-[#4E5840]',
    amber: 'from-amber-500/10 to-amber-600/10 text-amber-600',
    teal: 'from-[#5C9BA4]/10 to-[#4A8891]/10 text-[#5C9BA4]'
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-3">
          <ArrowUpRight className={`w-4 h-4 ${trend === 'up' ? 'text-emerald-500' : 'text-red-500 rotate-90'}`} />
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Tier Card Component
// ============================================================================

const TierCard = ({
  tier,
  onEdit
}: {
  tier: MemberTier;
  onEdit: (tier: MemberTier) => void;
}) => (
  <div
    className="relative bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-lg transition-all overflow-hidden group"
    style={{ borderTopColor: tier.color, borderTopWidth: '3px' }}
  >
    {/* Gradient background */}
    <div
      className="absolute inset-0 opacity-5"
      style={{
        background: `linear-gradient(135deg, ${tier.color} 0%, transparent 60%)`
      }}
    />

    <div className="relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${tier.color}20` }}
          >
            <TierIcon tier={tier.name} size="lg" />
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: tier.color }}>
              {tier.name}
            </h3>
            <p className="text-sm text-neutral-500">{tier.memberCount.toLocaleString()} members</p>
          </div>
        </div>
        <button
          onClick={() => onEdit(tier)}
          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-neutral-100 rounded-lg transition-all"
        >
          <Edit2 className="w-4 h-4 text-neutral-500" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-neutral-500 mb-1">
            <Percent className="w-3.5 h-3.5" />
            <span className="text-xs">Discount</span>
          </div>
          <p className="text-lg font-bold text-neutral-900">{tier.discountPercent}%</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-neutral-500 mb-1">
            <Star className="w-3.5 h-3.5" />
            <span className="text-xs">Points x</span>
          </div>
          <p className="text-lg font-bold text-neutral-900">{tier.pointsMultiplier}x</p>
        </div>
      </div>

      {/* Benefits Preview */}
      <div>
        <p className="text-xs font-medium text-neutral-500 mb-2">Key Benefits</p>
        <div className="space-y-1.5">
          {tier.benefits.slice(0, 3).map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5" style={{ color: tier.color }} />
              <span className="text-xs text-neutral-700 truncate">{benefit}</span>
            </div>
          ))}
          {tier.benefits.length > 3 && (
            <p className="text-xs text-neutral-400 pl-5">+{tier.benefits.length - 3} more</p>
          )}
        </div>
      </div>

      {/* Requirements */}
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <p className="text-[10px] font-medium text-neutral-400 uppercase mb-2">Requirements</p>
        <div className="flex items-center gap-4 text-xs text-neutral-600">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            {tier.minPoints.toLocaleString()} pts
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            ₹{tier.minSpend.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// Modal Components
// ============================================================================

const EnrollMemberModal = ({
  isOpen,
  onClose,
  onEnroll,
  tiers
}: {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (data: { name: string; email: string; phone?: string; tier: string }) => void;
  tiers: MemberTier[];
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tier: 'bronze'
  });

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    onEnroll(formData);
    setFormData({ name: '', email: '', phone: '', tier: 'bronze' });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#FAF7F4] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4E5840]/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#4E5840]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Enroll New Member</h2>
              <p className="text-sm text-neutral-500">Add a guest to the loyalty program</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter guest name"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="guest@email.com"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Starting Tier</label>
            <div className="grid grid-cols-5 gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setFormData(prev => ({ ...prev, tier: tier.id }))}
                  className={`p-2 rounded-lg text-center transition-all ${
                    formData.tier === tier.id
                      ? 'ring-2 ring-offset-2'
                      : 'hover:bg-neutral-50'
                  }`}
                  style={{
                    backgroundColor: formData.tier === tier.id ? `${tier.color}15` : undefined,
                    borderColor: formData.tier === tier.id ? tier.color : 'transparent',
                    ringColor: tier.color
                  }}
                >
                  <TierIcon tier={tier.name} size="sm" />
                  <p className="text-[10px] font-medium mt-1" style={{ color: tier.color }}>{tier.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || !formData.email.trim()}
            className="px-6 py-2 bg-[#4E5840] text-white text-sm font-medium rounded-lg hover:bg-[#4E5840]/90 transition-colors disabled:opacity-50"
          >
            Enroll Member
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

const TierUpgradeModal = ({
  isOpen,
  onClose,
  onUpgrade,
  member,
  tiers
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (memberId: number, newTier: string, reason: string) => void;
  member: Member | null;
  tiers: MemberTier[];
}) => {
  const [selectedTier, setSelectedTier] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (member?.nextTier) {
      setSelectedTier(member.nextTier.toLowerCase());
    }
  }, [member]);

  const handleSubmit = () => {
    if (!member || !selectedTier) return;
    onUpgrade(member.id, selectedTier, reason);
    setSelectedTier('');
    setReason('');
  };

  if (!isOpen || !member) return null;

  const currentTierIndex = tiers.findIndex(t => t.name.toLowerCase() === member.tier.toLowerCase());

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#FAF7F4] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Manual Tier Upgrade</h2>
              <p className="text-sm text-neutral-500">Upgrade {member.name}'s tier</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current Status */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs font-medium text-neutral-500 mb-2">Current Status</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TierBadge tier={member.tier} color={member.tierColor} />
                <span className="text-sm text-neutral-600">{member.points.toLocaleString()} points</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>
          </div>

          {/* Tier Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Select New Tier</label>
            <div className="space-y-2">
              {tiers.map((tier, index) => {
                const isUpgrade = index > currentTierIndex;
                const isCurrent = tier.name.toLowerCase() === member.tier.toLowerCase();

                return (
                  <button
                    key={tier.id}
                    onClick={() => isUpgrade && setSelectedTier(tier.id)}
                    disabled={!isUpgrade}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                      selectedTier === tier.id
                        ? 'border-[#4E5840] bg-[#4E5840]/5'
                        : isCurrent
                          ? 'border-neutral-300 bg-neutral-100 opacity-60'
                          : isUpgrade
                            ? 'border-neutral-200 hover:border-neutral-300'
                            : 'border-neutral-100 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${tier.color}20` }}
                        >
                          <TierIcon tier={tier.name} size="sm" />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: tier.color }}>{tier.name}</p>
                          <p className="text-xs text-neutral-500">{tier.discountPercent}% discount</p>
                        </div>
                      </div>
                      {isCurrent && <span className="text-xs text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">Current</span>}
                      {selectedTier === tier.id && <Check className="w-5 h-5 text-[#4E5840]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Upgrade Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional: Enter reason for manual upgrade..."
              rows={3}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedTier}
            className="px-6 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            Upgrade to {tiers.find(t => t.id === selectedTier)?.name || 'Tier'}
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

const TierBenefitsEditorModal = ({
  isOpen,
  onClose,
  onSave,
  tier
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tierId: string, updates: Partial<MemberTier>) => void;
  tier: MemberTier | null;
}) => {
  const [formData, setFormData] = useState<{
    discountPercent: number;
    pointsMultiplier: number;
    minPoints: number;
    minSpend: number;
    benefits: string[];
  }>({
    discountPercent: 0,
    pointsMultiplier: 1,
    minPoints: 0,
    minSpend: 0,
    benefits: []
  });

  useEffect(() => {
    if (tier) {
      setFormData({
        discountPercent: tier.discountPercent,
        pointsMultiplier: tier.pointsMultiplier,
        minPoints: tier.minPoints,
        minSpend: tier.minSpend,
        benefits: [...tier.benefits]
      });
    }
  }, [tier]);

  const handleAddBenefit = () => {
    setFormData(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleBenefitChange = (index: number, value: string) => {
    setFormData(prev => {
      const newBenefits = [...prev.benefits];
      newBenefits[index] = value;
      return { ...prev, benefits: newBenefits };
    });
  };

  const handleSubmit = () => {
    if (!tier) return;
    onSave(tier.id, {
      ...formData,
      benefits: formData.benefits.filter(b => b.trim())
    });
  };

  if (!isOpen || !tier) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#FAF7F4]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${tier.color}20` }}
            >
              <Settings className="w-5 h-5" style={{ color: tier.color }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Edit {tier.name} Tier</h2>
              <p className="text-sm text-neutral-500">Modify benefits and requirements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-4 space-y-4">
          {/* Discount & Multiplier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <Percent className="w-4 h-4 inline mr-1" />
                Discount %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountPercent}
                onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                <Star className="w-4 h-4 inline mr-1" />
                Points Multiplier
              </label>
              <input
                type="number"
                min="1"
                step="0.25"
                value={formData.pointsMultiplier}
                onChange={(e) => setFormData(prev => ({ ...prev, pointsMultiplier: parseFloat(e.target.value) || 1 }))}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Minimum Points
              </label>
              <input
                type="number"
                min="0"
                value={formData.minPoints}
                onChange={(e) => setFormData(prev => ({ ...prev, minPoints: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Minimum Spend ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minSpend}
                onChange={(e) => setFormData(prev => ({ ...prev, minSpend: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Gift className="w-4 h-4 inline mr-1" />
              Benefits
            </label>
            <div className="space-y-2">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    placeholder="Enter benefit..."
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  />
                  <button
                    onClick={() => handleRemoveBenefit(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddBenefit}
                className="flex items-center gap-1 text-sm text-[#A57865] hover:text-[#A57865]/80"
              >
                <Plus className="w-4 h-4" />
                Add benefit
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#A57865] text-white text-sm font-medium rounded-lg hover:bg-[#A57865]/90 transition-colors"
          >
            Save Changes
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
// Dynamic Pricing Calculator Panel
// ============================================================================

const DynamicPricingCalculator = ({ tiers }: { tiers: MemberTier[] }) => {
  const [baseRate, setBaseRate] = useState(250);
  const [selectedTier, setSelectedTier] = useState('gold');
  const [nights, setNights] = useState(3);

  const tier = tiers.find(t => t.id === selectedTier) || tiers[0];
  const discount = tier.discountPercent / 100;
  const discountedRate = baseRate * (1 - discount);
  const totalOriginal = baseRate * nights;
  const totalDiscounted = discountedRate * nights;
  const savings = totalOriginal - totalDiscounted;
  const pointsEarned = Math.floor(totalDiscounted * tier.pointsMultiplier);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#5C9BA4]/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-[#5C9BA4]" />
        </div>
        <div>
          <h3 className="font-bold text-neutral-900">Dynamic Pricing Calculator</h3>
          <p className="text-sm text-neutral-500">Preview tier-based pricing</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Inputs */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Base Rate ($)</label>
            <input
              type="number"
              value={baseRate}
              onChange={(e) => setBaseRate(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C9BA4]/20 focus:border-[#5C9BA4]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Nights</label>
            <input
              type="number"
              min={1}
              value={nights}
              onChange={(e) => setNights(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C9BA4]/20 focus:border-[#5C9BA4]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C9BA4]/20 focus:border-[#5C9BA4]"
            >
              {tiers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-r from-[#5C9BA4]/5 to-[#4E5840]/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-600">Original Total</span>
            <span className="text-sm text-neutral-500 line-through">₹{totalOriginal.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-600">
              <TierBadge tier={tier.name} color={tier.color} size="sm" /> Rate
            </span>
            <span className="text-lg font-bold text-neutral-900">₹{totalDiscounted.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Save ₹{savings.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                <Star className="w-4 h-4" />
                Earn {pointsEarned.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function MemberTierManagement() {
  // State
  const [tiers, setTiers] = useState<MemberTier[]>(DEFAULT_TIERS);
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [stats, setStats] = useState<MemberStats>({
    totalMembers: 2435,
    newThisMonth: 156,
    upgrades: 42,
    pointsIssued: 125000
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [benefitsModalOpen, setBenefitsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedTierForEdit, setSelectedTierForEdit] = useState<MemberTier | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Filter members based on search
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setToast({ message: 'Data refreshed successfully', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to refresh data', type: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleEnrollMember = (data: { name: string; email: string; phone?: string; tier: string }) => {
    const tier = tiers.find(t => t.id === data.tier) || tiers[0];
    const newMember: Member = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      tier: tier.name,
      tierColor: tier.color,
      points: 0,
      totalSpend: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0],
      pointsToNextTier: tier.minPoints,
      nextTier: tiers[tiers.findIndex(t => t.id === data.tier) + 1]?.name
    };
    setMembers(prev => [newMember, ...prev]);
    setStats(prev => ({ ...prev, totalMembers: prev.totalMembers + 1, newThisMonth: prev.newThisMonth + 1 }));
    setEnrollModalOpen(false);
    setToast({ message: `${data.name} enrolled as ${tier.name} member`, type: 'success' });
  };

  const handleUpgradeMember = (memberId: number, newTierId: string, reason: string) => {
    const newTier = tiers.find(t => t.id === newTierId);
    if (!newTier) return;

    setMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        const nextTierIndex = tiers.findIndex(t => t.id === newTierId) + 1;
        return {
          ...member,
          tier: newTier.name,
          tierColor: newTier.color,
          nextTier: tiers[nextTierIndex]?.name,
          pointsToNextTier: tiers[nextTierIndex]?.minPoints - member.points || 0
        };
      }
      return member;
    }));

    setStats(prev => ({ ...prev, upgrades: prev.upgrades + 1 }));
    setUpgradeModalOpen(false);
    setSelectedMember(null);
    setToast({ message: `Member upgraded to ${newTier.name}`, type: 'success' });
  };

  const handleEditTier = (tier: MemberTier) => {
    setSelectedTierForEdit(tier);
    setBenefitsModalOpen(true);
  };

  const handleSaveTierChanges = (tierId: string, updates: Partial<MemberTier>) => {
    setTiers(prev => prev.map(tier =>
      tier.id === tierId ? { ...tier, ...updates } : tier
    ));
    setBenefitsModalOpen(false);
    setSelectedTierForEdit(null);
    setToast({ message: 'Tier settings updated', type: 'success' });
  };

  const openUpgradeModal = (member: Member) => {
    setSelectedMember(member);
    setUpgradeModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-auto bg-neutral-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-[#A57865] to-[#4E5840] flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Member Tier Management</h1>
            <p className="text-sm text-neutral-500">
              Manage loyalty tiers, member benefits, and dynamic pricing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setEnrollModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4E5840] to-[#3D4733] text-white rounded-xl text-sm font-medium hover:from-[#3D4733] hover:to-[#2C3626] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Enroll Member
          </button>
        </div>
      </div>

      {/* Tier Overview Cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Tier Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} onEdit={handleEditTier} />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Members"
          value={stats.totalMembers.toLocaleString()}
          icon={Users}
          color="sage"
          trend="up"
          trendValue="8.5% from last month"
        />
        <StatCard
          title="New This Month"
          value={stats.newThisMonth}
          icon={UserPlus}
          color="teal"
          trend="up"
          trendValue="12 more than last month"
        />
        <StatCard
          title="Tier Upgrades"
          value={stats.upgrades}
          icon={TrendingUp}
          color="amber"
          trend="up"
          trendValue="5 upgrades pending"
        />
        <StatCard
          title="Points Issued"
          value={stats.pointsIssued.toLocaleString()}
          icon={Star}
          color="terra"
          trend="up"
          trendValue="15% increase"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-neutral-200">
            {/* Search Header */}
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-neutral-900">Members</h3>
                <span className="text-sm text-neutral-500">{filteredMembers.length} members</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Member</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Tier</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Points</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Spend</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Joined</th>
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-neutral-900">{member.name}</p>
                          <p className="text-xs text-neutral-500">{member.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <TierBadge tier={member.tier} color={member.tierColor} />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <PointsDisplay points={member.points} />
                          {member.nextTier && (
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              {member.pointsToNextTier.toLocaleString()} to {member.nextTier}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-900">₹{member.totalSpend.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-600">
                          {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openUpgradeModal(member)}
                            className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Upgrade Tier"
                          >
                            <ArrowUp className="w-4 h-4 text-amber-600" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No members found</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dynamic Pricing Calculator */}
          <DynamicPricingCalculator tiers={tiers} />

          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">Tier Progression</h3>
                <p className="text-sm text-neutral-500">How members advance</p>
              </div>
            </div>
            <div className="space-y-3">
              {tiers.slice(0, 4).map((tier, index) => (
                <div key={tier.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${tier.color}20` }}
                  >
                    <TierIcon tier={tier.name} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: tier.color }}>{tier.name}</span>
                      <span className="text-xs text-neutral-500">{tier.minPoints.toLocaleString()} pts</span>
                    </div>
                    {index < tiers.length - 1 && (
                      <ProgressBar
                        current={tier.minPoints}
                        max={tiers[index + 1].minPoints}
                        color={tier.color}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EnrollMemberModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        onEnroll={handleEnrollMember}
        tiers={tiers}
      />

      <TierUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => {
          setUpgradeModalOpen(false);
          setSelectedMember(null);
        }}
        onUpgrade={handleUpgradeMember}
        member={selectedMember}
        tiers={tiers}
      />

      <TierBenefitsEditorModal
        isOpen={benefitsModalOpen}
        onClose={() => {
          setBenefitsModalOpen(false);
          setSelectedTierForEdit(null);
        }}
        onSave={handleSaveTierChanges}
        tier={selectedTierForEdit}
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
