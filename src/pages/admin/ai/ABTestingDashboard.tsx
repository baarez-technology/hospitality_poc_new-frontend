/**
 * A/B Testing Dashboard - ReConnect AI Integration
 * Comprehensive dashboard for managing A/B tests, viewing results, and deploying winners
 */
import React, { useState, useEffect } from 'react';
import {
  Brain,
  FlaskConical,
  PlayCircle,
  StopCircle,
  Trophy,
  TrendingUp,
  BarChart3,
  Plus,
  Filter,
  ChevronRight,
  X,
  RefreshCw,
  Eye,
  Rocket,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
  MessageSquare,
  Gift,
  Target
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { apiClient as api } from '../../../api/client';

// Types
interface ABTest {
  id: number;
  name: string;
  description: string;
  type: 'email_subject' | 'email_content' | 'offer_type' | 'send_time' | 'channel';
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ABTestVariant[];
  start_date: string | null;
  end_date: string | null;
  total_participants: number;
  winner_variant_id: number | null;
  created_at: string;
  updated_at: string;
}

interface ABTestVariant {
  id: number;
  name: string;
  description: string;
  content: Record<string, unknown>;
  participants: number;
  conversions: number;
  conversion_rate: number;
  revenue: number;
  is_control: boolean;
}

interface ABTestStats {
  active_tests: number;
  completed_tests: number;
  avg_conversion_lift: number;
  tests_with_winners: number;
}

interface ABTestCreateData {
  name: string;
  description: string;
  type: 'email_subject' | 'email_content' | 'offer_type' | 'send_time' | 'channel';
  variants: Array<{
    name: string;
    description: string;
    content: Record<string, unknown>;
    is_control: boolean;
  }>;
}

// API Service for A/B Testing
const abTestingService = {
  async getStats(): Promise<ABTestStats> {
    const response = await api.get('/api/v1/ab-testing/stats');
    return response.data.data;
  },

  async getTests(status?: string): Promise<ABTest[]> {
    const response = await api.get('/api/v1/ab-testing/tests', {
      params: { status }
    });
    return response.data.data;
  },

  async getTest(testId: number): Promise<ABTest> {
    const response = await api.get(`/api/v1/ab-testing/tests/${testId}`);
    return response.data.data;
  },

  async createTest(data: ABTestCreateData): Promise<ABTest> {
    const response = await api.post('/api/v1/ab-testing/tests', data);
    return response.data.data;
  },

  async startTest(testId: number): Promise<ABTest> {
    const response = await api.post(`/api/v1/ab-testing/tests/${testId}/start`);
    return response.data.data;
  },

  async stopTest(testId: number): Promise<ABTest> {
    const response = await api.post(`/api/v1/ab-testing/tests/${testId}/stop`);
    return response.data.data;
  },

  async deployWinner(testId: number): Promise<void> {
    await api.post(`/api/v1/ab-testing/tests/${testId}/deploy-winner`);
  },

  async deleteTest(testId: number): Promise<void> {
    await api.delete(`/api/v1/ab-testing/tests/${testId}`);
  }
};

// StatCard Component
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'terra' | 'sage';
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/10 to-blue-600/10 text-blue-600',
    green: 'from-emerald-500/10 to-emerald-600/10 text-emerald-600',
    amber: 'from-amber-500/10 to-amber-600/10 text-amber-600',
    red: 'from-red-500/10 to-red-600/10 text-red-600',
    purple: 'from-purple-500/10 to-purple-600/10 text-purple-600',
    terra: 'from-[#A57865]/10 to-[#8E6554]/10 text-[#A57865]',
    sage: 'from-[#4E5840]/10 to-[#3D4632]/10 text-[#4E5840]'
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-3">
          {trend === 'up' ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          ) : trend === 'down' ? (
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          ) : null}
          <span className={`text-xs font-medium ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-neutral-500'
          }`}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: ABTest['status'] }) => {
  const statusConfig: Record<ABTest['status'], { label: string; className: string; icon: React.ElementType }> = {
    draft: {
      label: 'Draft',
      className: 'bg-neutral-100 text-neutral-700 border-neutral-200',
      icon: Clock
    },
    running: {
      label: 'Running',
      className: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: PlayCircle
    },
    completed: {
      label: 'Completed',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: CheckCircle2
    },
    paused: {
      label: 'Paused',
      className: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: StopCircle
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Test Type Badge Component
const TestTypeBadge = ({ type }: { type: ABTest['type'] }) => {
  const typeConfig: Record<ABTest['type'], { label: string; icon: React.ElementType }> = {
    email_subject: { label: 'Email Subject', icon: Mail },
    email_content: { label: 'Email Content', icon: MessageSquare },
    offer_type: { label: 'Offer Type', icon: Gift },
    send_time: { label: 'Send Time', icon: Clock },
    channel: { label: 'Channel', icon: Target }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-[#A57865]/10 text-[#A57865] rounded-full">
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Test Card Component
const TestCard = ({
  test,
  onStart,
  onStop,
  onViewResults,
  onDeployWinner,
  onDelete
}: {
  test: ABTest;
  onStart: (test: ABTest) => void;
  onStop: (test: ABTest) => void;
  onViewResults: (test: ABTest) => void;
  onDeployWinner: (test: ABTest) => void;
  onDelete: (test: ABTest) => void;
}) => {
  const winnerVariant = test.winner_variant_id
    ? test.variants.find(v => v.id === test.winner_variant_id)
    : null;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900">{test.name}</h3>
            <StatusBadge status={test.status} />
          </div>
          <TestTypeBadge type={test.type} />
        </div>
        {winnerVariant && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Winner: {winnerVariant.name}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{test.description}</p>

      {/* Variants Summary */}
      <div className="space-y-2 mb-4">
        {test.variants.map((variant) => (
          <div
            key={variant.id}
            className={`flex items-center justify-between p-2 rounded-lg ${
              test.winner_variant_id === variant.id
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-neutral-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                test.winner_variant_id === variant.id ? 'text-amber-800' : 'text-neutral-700'
              }`}>
                {variant.name}
              </span>
              {variant.is_control && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">
                  Control
                </span>
              )}
              {test.winner_variant_id === variant.id && (
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {variant.participants.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 font-medium text-[#4E5840]">
                <Percent className="w-3 h-3" />
                {variant.conversion_rate.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4 pb-4 border-b border-neutral-100">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {test.total_participants.toLocaleString()} participants
        </span>
        {test.start_date && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Started {new Date(test.start_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {test.status === 'draft' && (
          <button
            onClick={() => onStart(test)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#4E5840] text-white rounded-lg hover:bg-[#3D4632] transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Start Test
          </button>
        )}
        {test.status === 'running' && (
          <button
            onClick={() => onStop(test)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <StopCircle className="w-3.5 h-3.5" />
            Stop Test
          </button>
        )}
        <button
          onClick={() => onViewResults(test)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View Results
        </button>
        {test.status === 'completed' && test.winner_variant_id && (
          <button
            onClick={() => onDeployWinner(test)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#A57865] text-white rounded-lg hover:bg-[#8E6554] transition-colors"
          >
            <Rocket className="w-3.5 h-3.5" />
            Deploy Winner
          </button>
        )}
        <button
          onClick={() => onDelete(test)}
          className="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ABTest Create Modal
const ABTestCreateModal = ({
  isOpen,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ABTestCreateData) => Promise<void>;
}) => {
  const [formData, setFormData] = useState<ABTestCreateData>({
    name: '',
    description: '',
    type: 'email_subject',
    variants: [
      { name: 'Control', description: 'Original version', content: {}, is_control: true },
      { name: 'Variant A', description: 'Test version', content: {}, is_control: false }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Test name is required');
      return;
    }
    if (formData.variants.length < 2) {
      setError('At least 2 variants are required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        name: '',
        description: '',
        type: 'email_subject',
        variants: [
          { name: 'Control', description: 'Original version', content: {}, is_control: true },
          { name: 'Variant A', description: 'Test version', content: {}, is_control: false }
        ]
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    const variantLetter = String.fromCharCode(65 + formData.variants.length - 1);
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { name: `Variant ${variantLetter}`, description: '', content: {}, is_control: false }
      ]
    });
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length <= 2) return;
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Create New A/B Test</h2>
              <p className="text-sm text-neutral-500">Set up your test variants and parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Test Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Test Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Email Subject Line Test Q1 2024"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/40 focus:border-[#A57865]"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the goal and hypothesis of this test..."
              rows={2}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/40 focus:border-[#A57865] resize-none"
            />
          </div>

          {/* Test Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Test Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ABTest['type'] })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/40 focus:border-[#A57865]"
            >
              <option value="email_subject">Email Subject Line</option>
              <option value="email_content">Email Content</option>
              <option value="offer_type">Offer Type</option>
              <option value="send_time">Send Time</option>
              <option value="channel">Communication Channel</option>
            </select>
          </div>

          {/* Variants */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-neutral-700">Test Variants</label>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#A57865] hover:bg-[#A57865]/10 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Variant
              </button>
            </div>
            <div className="space-y-3">
              {formData.variants.map((variant, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    variant.is_control ? 'bg-blue-50 border-blue-200' : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-700">
                        {variant.is_control ? 'Control Group' : `Variant ${index}`}
                      </span>
                      {variant.is_control && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">
                          Control
                        </span>
                      )}
                    </div>
                    {!variant.is_control && formData.variants.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      placeholder="Variant name"
                      className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/40 focus:border-[#A57865] bg-white"
                    />
                    <input
                      type="text"
                      value={variant.description}
                      onChange={(e) => updateVariant(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/40 focus:border-[#A57865] bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#A57865] to-[#8E6554] text-white rounded-lg hover:from-[#8E6554] hover:to-[#7D5443] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Test
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ABTest Results Modal
const ABTestResultsModal = ({
  isOpen,
  onClose,
  test
}: {
  isOpen: boolean;
  onClose: () => void;
  test: ABTest | null;
}) => {
  if (!isOpen || !test) return null;

  const winnerVariant = test.winner_variant_id
    ? test.variants.find(v => v.id === test.winner_variant_id)
    : null;

  const controlVariant = test.variants.find(v => v.is_control);
  const maxConversionRate = Math.max(...test.variants.map(v => v.conversion_rate));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4E5840] to-[#3D4632] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">{test.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={test.status} />
                <TestTypeBadge type={test.type} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-neutral-50 rounded-xl">
              <p className="text-xs text-neutral-500 mb-1">Total Participants</p>
              <p className="text-xl font-bold text-neutral-900">{test.total_participants.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl">
              <p className="text-xs text-neutral-500 mb-1">Test Duration</p>
              <p className="text-xl font-bold text-neutral-900">
                {test.start_date && test.end_date
                  ? `${Math.ceil((new Date(test.end_date).getTime() - new Date(test.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                  : test.start_date
                  ? 'Running'
                  : 'Not Started'}
              </p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl">
              <p className="text-xs text-neutral-500 mb-1">Total Conversions</p>
              <p className="text-xl font-bold text-neutral-900">
                {test.variants.reduce((sum, v) => sum + v.conversions, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl">
              <p className="text-xs text-neutral-500 mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-[#4E5840]">
                ₹{test.variants.reduce((sum, v) => sum + v.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Winner Banner */}
          {winnerVariant && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-amber-700 font-medium">Winner Determined</p>
                  <p className="text-lg font-bold text-amber-900">{winnerVariant.name}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-amber-900">{winnerVariant.conversion_rate.toFixed(1)}%</p>
                  <p className="text-xs text-amber-700">Conversion Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* Conversion Comparison Chart */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Conversion Rate Comparison</h3>
            <div className="space-y-4">
              {test.variants.map((variant) => {
                const barWidth = maxConversionRate > 0
                  ? (variant.conversion_rate / maxConversionRate) * 100
                  : 0;
                const lift = controlVariant && !variant.is_control && controlVariant.conversion_rate > 0
                  ? ((variant.conversion_rate - controlVariant.conversion_rate) / controlVariant.conversion_rate) * 100
                  : null;

                return (
                  <div key={variant.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-700">{variant.name}</span>
                        {variant.is_control && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">
                            Control
                          </span>
                        )}
                        {test.winner_variant_id === variant.id && (
                          <Trophy className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {lift !== null && (
                          <span className={`text-xs font-medium ${lift >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {lift >= 0 ? '+' : ''}{lift.toFixed(1)}% vs control
                          </span>
                        )}
                        <span className="text-sm font-bold text-neutral-900">
                          {variant.conversion_rate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-4 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          test.winner_variant_id === variant.id
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : variant.is_control
                            ? 'bg-blue-400'
                            : 'bg-[#A57865]'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>{variant.participants.toLocaleString()} participants</span>
                      <span>{variant.conversions.toLocaleString()} conversions</span>
                      <span>₹{variant.revenue.toLocaleString()} revenue</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Variant Table */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Detailed Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Variant</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Participants</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Conversions</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Conv. Rate</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {test.variants.map((variant) => (
                    <tr
                      key={variant.id}
                      className={test.winner_variant_id === variant.id ? 'bg-amber-50' : ''}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {test.winner_variant_id === variant.id && (
                            <Trophy className="w-4 h-4 text-amber-600" />
                          )}
                          <span className="font-medium text-neutral-900">{variant.name}</span>
                          {variant.is_control && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">
                              Control
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-700">
                        {variant.participants.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-700">
                        {variant.conversions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#4E5840]">
                        {variant.conversion_rate.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-neutral-900">
                        ₹{variant.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Close
          </button>
          {test.status === 'completed' && test.winner_variant_id && (
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#A57865] to-[#8E6554] text-white rounded-lg hover:from-[#8E6554] hover:to-[#7D5443] transition-colors">
              <Rocket className="w-4 h-4" />
              Deploy Winner
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function ABTestingDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState<ABTestStats | null>(null);
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      const [statsData, testsData] = await Promise.all([
        abTestingService.getStats(),
        abTestingService.getTests(statusFilter === 'all' ? undefined : statusFilter)
      ]);
      setStats(statsData);
      setTests(testsData);
    } catch (error) {
      console.error('Failed to fetch A/B testing data:', error);
      // Use mock data for demo
      setStats({
        active_tests: 3,
        completed_tests: 12,
        avg_conversion_lift: 18.5,
        tests_with_winners: 9
      });
      setTests([
        {
          id: 1,
          name: 'Email Subject Line Test - Win-Back Campaign',
          description: 'Testing different subject lines to improve open rates for win-back emails',
          type: 'email_subject',
          status: 'running',
          variants: [
            { id: 1, name: 'Control', description: 'Current subject line', content: {}, participants: 2500, conversions: 150, conversion_rate: 6.0, revenue: 15000, is_control: true },
            { id: 2, name: 'Personalized', description: 'Name in subject', content: {}, participants: 2500, conversions: 200, conversion_rate: 8.0, revenue: 20000, is_control: false },
            { id: 3, name: 'Urgency', description: 'Time-limited offer', content: {}, participants: 2500, conversions: 225, conversion_rate: 9.0, revenue: 22500, is_control: false }
          ],
          start_date: '2024-01-15T00:00:00Z',
          end_date: null,
          total_participants: 7500,
          winner_variant_id: null,
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-20T00:00:00Z'
        },
        {
          id: 2,
          name: 'Offer Type Test - Direct Booking Promotion',
          description: 'Comparing percentage discount vs fixed amount discount for direct booking offers',
          type: 'offer_type',
          status: 'completed',
          variants: [
            { id: 4, name: '15% Off', description: 'Percentage discount', content: {}, participants: 3000, conversions: 180, conversion_rate: 6.0, revenue: 27000, is_control: true },
            { id: 5, name: '₹50 Off', description: 'Fixed amount discount', content: {}, participants: 3000, conversions: 270, conversion_rate: 9.0, revenue: 40500, is_control: false }
          ],
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-01-14T00:00:00Z',
          total_participants: 6000,
          winner_variant_id: 5,
          created_at: '2023-12-25T00:00:00Z',
          updated_at: '2024-01-14T00:00:00Z'
        },
        {
          id: 3,
          name: 'Send Time Optimization',
          description: 'Testing optimal send times for promotional emails',
          type: 'send_time',
          status: 'draft',
          variants: [
            { id: 6, name: 'Morning (9 AM)', description: 'Send at 9 AM local time', content: {}, participants: 0, conversions: 0, conversion_rate: 0, revenue: 0, is_control: true },
            { id: 7, name: 'Afternoon (2 PM)', description: 'Send at 2 PM local time', content: {}, participants: 0, conversions: 0, conversion_rate: 0, revenue: 0, is_control: false },
            { id: 8, name: 'Evening (7 PM)', description: 'Send at 7 PM local time', content: {}, participants: 0, conversions: 0, conversion_rate: 0, revenue: 0, is_control: false }
          ],
          start_date: null,
          end_date: null,
          total_participants: 0,
          winner_variant_id: null,
          created_at: '2024-01-18T00:00:00Z',
          updated_at: '2024-01-18T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filter tests by status
  const filteredTests = statusFilter === 'all'
    ? tests
    : tests.filter(test => test.status === statusFilter);

  // Actions
  const handleStartTest = async (test: ABTest) => {
    try {
      await abTestingService.startTest(test.id);
      toast.success(`Test "${test.name}" started successfully`);
      fetchData();
    } catch (error) {
      console.error('Failed to start test:', error);
      toast.error('Failed to start test');
    }
  };

  const handleStopTest = async (test: ABTest) => {
    try {
      await abTestingService.stopTest(test.id);
      toast.success(`Test "${test.name}" stopped successfully`);
      fetchData();
    } catch (error) {
      console.error('Failed to stop test:', error);
      toast.error('Failed to stop test');
    }
  };

  const handleViewResults = (test: ABTest) => {
    setSelectedTest(test);
    setIsResultsModalOpen(true);
  };

  const handleDeployWinner = async (test: ABTest) => {
    try {
      await abTestingService.deployWinner(test.id);
      toast.success(`Winner deployed for "${test.name}"`);
      fetchData();
    } catch (error) {
      console.error('Failed to deploy winner:', error);
      toast.error('Failed to deploy winner');
    }
  };

  const handleDeleteTest = async (test: ABTest) => {
    if (!confirm(`Are you sure you want to delete "${test.name}"?`)) return;
    try {
      await abTestingService.deleteTest(test.id);
      toast.success(`Test "${test.name}" deleted successfully`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete test:', error);
      toast.error('Failed to delete test');
    }
  };

  const handleCreateTest = async (data: ABTestCreateData) => {
    await abTestingService.createTest(data);
    toast.success('Test created successfully');
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#A57865] animate-spin mx-auto mb-3" />
          <p className="text-neutral-500">Loading A/B Testing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-neutral-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5C9BA4] via-[#4E5840] to-[#A57865] flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">A/B Testing Dashboard</h1>
            <p className="text-sm text-neutral-500">
              Optimize campaigns with data-driven experiments
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
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#A57865] to-[#8E6554] text-white rounded-xl text-sm font-medium hover:from-[#8E6554] hover:to-[#7D5443] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Test
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Active Tests"
          value={stats?.active_tests || 0}
          subtitle="Currently running"
          icon={FlaskConical}
          color="amber"
        />
        <StatCard
          title="Completed Tests"
          value={stats?.completed_tests || 0}
          subtitle="All time"
          icon={CheckCircle2}
          color="sage"
        />
        <StatCard
          title="Avg Conversion Lift"
          value={`+${stats?.avg_conversion_lift || 0}%`}
          subtitle="Winners vs control"
          icon={TrendingUp}
          color="terra"
          trend="up"
          trendValue="from winning variants"
        />
        <StatCard
          title="Tests with Winners"
          value={stats?.tests_with_winners || 0}
          subtitle={`of ${stats?.completed_tests || 0} completed`}
          icon={Trophy}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <span className="text-sm text-neutral-600">Filter by status:</span>
          <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1">
            {['all', 'draft', 'running', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === status
                    ? 'bg-[#A57865] text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <span className="text-sm text-neutral-500">
          {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Test List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTests.map((test) => (
          <TestCard
            key={test.id}
            test={test}
            onStart={handleStartTest}
            onStop={handleStopTest}
            onViewResults={handleViewResults}
            onDeployWinner={handleDeployWinner}
            onDelete={handleDeleteTest}
          />
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <FlaskConical className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 mb-4">No tests found with the current filter</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#A57865] text-white rounded-lg hover:bg-[#8E6554] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Test
          </button>
        </div>
      )}

      {/* Modals */}
      <ABTestCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTest}
      />

      <ABTestResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => {
          setIsResultsModalOpen(false);
          setSelectedTest(null);
        }}
        test={selectedTest}
      />
    </div>
  );
}
