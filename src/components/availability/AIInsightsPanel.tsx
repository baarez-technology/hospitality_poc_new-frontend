/**
 * AI Insights Panel Component
 * Displays AI-generated recommendations for availability and pricing
 */

import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  DollarSign, Calendar, Target, RefreshCw, ChevronRight,
  Flame, Snowflake, BarChart3, Activity
} from 'lucide-react';
import { Button } from '../ui2/Button';
import type { AIInsightsResponse } from '../../api/services/availability.service';

interface AIInsightsPanelProps {
  insights: AIInsightsResponse | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const PRIORITY_COLORS = {
  high: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    icon: 'text-rose-600'
  },
  medium: {
    bg: 'bg-gold-50',
    border: 'border-gold-200',
    text: 'text-gold-700',
    icon: 'text-gold-600'
  },
  low: {
    bg: 'bg-ocean-50',
    border: 'border-ocean-200',
    text: 'text-ocean-700',
    icon: 'text-ocean-600'
  }
};

const ACTION_ICONS = {
  increase_rates: DollarSign,
  create_promo: Target,
  set_min_stay: Calendar,
  adjust_pricing: TrendingUp,
  monitor: Activity
};

export function AIInsightsPanel({ insights, isLoading, onRefresh }: AIInsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'forecast' | 'pricing'>('recommendations');

  if (!insights && !isLoading) {
    return (
      <div className="bg-white rounded-[10px] p-6 text-center">
        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No AI insights available</p>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="mt-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Insights
          </Button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-[10px] p-6">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-terra-600" />
          <p className="text-gray-600">Analyzing availability patterns...</p>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-white rounded-[10px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-br from-terra-50 to-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-terra-500 to-terra-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
              <p className="text-sm text-gray-500">
                Updated {new Date(insights.generated_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex gap-1 px-6">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'recommendations'
                ? 'border-terra-600 text-terra-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            Recommendations ({insights.recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'forecast'
                ? 'border-terra-600 text-terra-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            Demand Forecast
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'pricing'
                ? 'border-terra-600 text-terra-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            Pricing Suggestions
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {/* Occupancy Trends Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-ocean-50 to-white p-4 rounded-lg border border-ocean-200">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-ocean-600" />
              <span className="text-xs font-medium text-ocean-900">Avg Occupancy</span>
            </div>
            <p className="text-2xl font-semibold text-ocean-900">
              {insights.occupancy_trends.average_occupancy}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-white p-4 rounded-lg border border-rose-200">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-medium text-rose-900">High Demand</span>
            </div>
            <p className="text-2xl font-semibold text-rose-900">
              {insights.occupancy_trends.high_demand_days} days
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Snowflake className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Low Demand</span>
            </div>
            <p className="text-2xl font-semibold text-blue-900">
              {insights.occupancy_trends.low_demand_days} days
            </p>
          </div>

          <div className="bg-gradient-to-br from-gold-50 to-white p-4 rounded-lg border border-gold-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-gold-600" />
              <span className="text-xs font-medium text-gold-900">Peak Date</span>
            </div>
            <p className="text-sm font-semibold text-gold-900">
              {insights.occupancy_trends.peak_occupancy_date
                ? new Date(insights.occupancy_trends.peak_occupancy_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-3">
            {insights.recommendations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">Everything looks good! No recommendations at this time.</p>
              </div>
            ) : (
              insights.recommendations.map((rec, index) => {
                const Icon = ACTION_ICONS[rec.action as keyof typeof ACTION_ICONS] || AlertTriangle;
                const colors = PRIORITY_COLORS[rec.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.low;

                return (
                  <div
                    key={index}
                    className={cn(
                      'p-4 rounded-lg border-2',
                      colors.bg,
                      colors.border
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('w-10 h-10 rounded-lg bg-white flex items-center justify-center', colors.border, 'border')}>
                        <Icon className={cn('w-5 h-5', colors.icon)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={cn('font-semibold', colors.text)}>{rec.title}</h4>
                          <span className={cn('text-xs font-medium px-2 py-1 rounded-full', colors.bg, colors.text)}>
                            {rec.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Impact:</span>
                          <span className="text-xs font-medium text-gray-700">{rec.impact.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Demand Forecast Tab */}
        {activeTab === 'forecast' && (
          <div className="space-y-2">
            {insights.demand_forecast.slice(0, 30).map((forecast, index) => {
              const demandColor =
                forecast.demand_level === 'high' ? 'bg-rose-500' :
                forecast.demand_level === 'low' ? 'bg-blue-500' :
                'bg-gold-500';

              return (
                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 w-24">
                    {new Date(forecast.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', demandColor)}
                        style={{ width: `${forecast.occupancy_forecast}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {forecast.occupancy_forecast}%
                    </span>
                  </div>
                  <span className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    forecast.demand_level === 'high' && 'bg-rose-100 text-rose-700',
                    forecast.demand_level === 'low' && 'bg-blue-100 text-blue-700',
                    forecast.demand_level === 'medium' && 'bg-gold-100 text-gold-700'
                  )}>
                    {forecast.demand_level}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Pricing Suggestions Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-3">
            {insights.pricing_suggestions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">Current pricing is optimal.</p>
              </div>
            ) : (
              insights.pricing_suggestions.map((suggestion, index) => {
                const isIncrease = suggestion.adjustment_percentage > 0;

                return (
                  <div key={index} className="p-4 rounded-lg border border-gray-200 hover:border-terra-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{suggestion.room_type_name}</h4>
                        <p className="text-sm text-gray-500 mt-0.5">{suggestion.reason}</p>
                      </div>
                      <div className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
                        isIncrease ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      )}>
                        {isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isIncrease ? '+' : ''}{suggestion.adjustment_percentage}%
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Current Rate</p>
                        <p className="text-lg font-semibold text-gray-900">₹{suggestion.current_rate}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Suggested Rate</p>
                        <p className="text-lg font-semibold text-terra-600">₹{suggestion.suggested_rate}</p>
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
