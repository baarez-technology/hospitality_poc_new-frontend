import { useState, useEffect } from 'react';
import {
  Activity,
  Brain,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Cpu,
  Loader2
} from 'lucide-react';
import { useReputation } from '@/context/ReputationContext';

interface StatsData {
  status: 'active' | 'inactive' | 'error';
  nlp_model_version: string;
  sentiment_accuracy: number;
  auto_replies_sent_today: number;
  auto_replies_sent_week: number;
  reviews_processed_today: number;
  avg_response_time_hours: number;
  last_sync: string;
  queue_size: number;
  error_rate: number;
}

const STATUS_CONFIG = {
  active: { color: 'text-sage-600', bg: 'bg-sage-100', label: 'Active' },
  inactive: { color: 'text-neutral-500', bg: 'bg-neutral-100', label: 'Inactive' },
  error: { color: 'text-rose-600', bg: 'bg-rose-100', label: 'Error' }
};

interface EngineStatsProps {
  compact?: boolean;
}

export default function EngineStats({ compact = false }: EngineStatsProps) {
  const { engineStats, loadEngineStats, isLoading } = useReputation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Demo data when API not connected
  const stats: StatsData = engineStats || {
    status: 'active',
    nlp_model_version: 'GPT-3.5-turbo',
    sentiment_accuracy: 94.2,
    auto_replies_sent_today: 12,
    auto_replies_sent_week: 87,
    reviews_processed_today: 45,
    avg_response_time_hours: 1.5,
    last_sync: new Date().toISOString(),
    queue_size: 3,
    error_rate: 0.8
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadEngineStats();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const statusConfig = STATUS_CONFIG[stats.status];

  const statItems = [
    {
      label: 'Sentiment Accuracy',
      value: `${stats.sentiment_accuracy.toFixed(1)}%`,
      icon: Brain,
      color: 'text-[#5C9BA4]',
      bgColor: 'bg-[#5C9BA4]/10'
    },
    {
      label: 'Reviews Today',
      value: stats.reviews_processed_today.toString(),
      icon: BarChart3,
      color: 'text-[#A57865]',
      bgColor: 'bg-[#A57865]/10'
    },
    {
      label: 'Auto-Replies Today',
      value: stats.auto_replies_sent_today.toString(),
      icon: Zap,
      color: 'text-[#CDB261]',
      bgColor: 'bg-[#CDB261]/10'
    },
    {
      label: 'Avg Response Time',
      value: `${stats.avg_response_time_hours.toFixed(1)}h`,
      icon: Clock,
      color: 'text-[#4E5840]',
      bgColor: 'bg-[#4E5840]/10'
    }
  ];

  // Compact mode shows just the essential info in a simpler layout
  if (compact) {
    return (
      <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-ocean-50 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ocean-600" />
            </div>
            <div>
              <h3 className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">AI Engine</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${statusConfig.bg}`}>
                  <Activity className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${statusConfig.color}`} />
                  <span className={`text-[9px] sm:text-[10px] font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-neutral-400">
                  {stats.nlp_model_version}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px]">
            <div className="flex items-center gap-1.5 text-neutral-500">
              <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-ocean-500" />
              <span>{stats.sentiment_accuracy.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-500">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-500" />
              <span>{stats.auto_replies_sent_today} today</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-500">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sage-500" />
              <span>{stats.avg_response_time_hours.toFixed(1)}h avg</span>
            </div>
            {stats.queue_size > 0 && (
              <div className="flex items-center gap-1 text-amber-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{stats.queue_size}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[10px] border border-neutral-100">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-ocean-50 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ocean-600" />
            </div>
            <div>
              <h3 className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">AI Engine Status</h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">Real-time processing metrics</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-50/30 border-b border-neutral-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${statusConfig.bg}`}>
              {stats.status === 'active' ? (
                <Activity className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${statusConfig.color}`} />
              ) : stats.status === 'error' ? (
                <AlertTriangle className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${statusConfig.color}`} />
              ) : (
                <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${statusConfig.color}`} />
              )}
              <span className={`text-[10px] sm:text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-neutral-500">
              Model: <span className="hidden sm:inline">{stats.nlp_model_version}</span><span className="sm:hidden">GPT-3.5</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {stats.auto_replies_sent_week} <span className="hidden sm:inline">replies this week</span><span className="sm:hidden">/wk</span>
            </span>
            <span>
              Queue: {stats.queue_size}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="p-3 sm:p-4 rounded-lg border border-neutral-100 bg-neutral-50/50"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${item.color}`} />
                </div>
                <span className="text-[9px] sm:text-[10px] font-medium text-neutral-500 uppercase tracking-wide truncate">{item.label}</span>
              </div>
              <div className="text-lg sm:text-xl font-semibold text-neutral-900">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-neutral-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 text-[10px] sm:text-[11px]">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-neutral-500">
                Error Rate: <span className={stats.error_rate < 2 ? 'text-sage-600' : 'text-rose-600'}>
                  {stats.error_rate.toFixed(1)}%
                </span>
              </span>
              <span className="text-neutral-500">
                Last Sync: {new Date(stats.last_sync).toLocaleTimeString()}
              </span>
            </div>
            {stats.queue_size > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing {stats.queue_size} items
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
