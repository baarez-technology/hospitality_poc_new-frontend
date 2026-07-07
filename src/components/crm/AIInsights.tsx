import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target, ChevronRight } from 'lucide-react';

export default function AIInsights({ insights }) {
  const getIcon = (type) => {
    const icons = {
      opportunity: TrendingUp,
      alert: AlertTriangle,
      recommendation: Lightbulb,
      insight: Target
    };
    return icons[type] || Sparkles;
  };

  const getIconColor = (type) => {
    const colors = {
      opportunity: 'text-[#4E5840] bg-green-100',
      alert: 'text-amber-600 bg-amber-100',
      recommendation: 'text-[#A57865] bg-[#A57865]/10',
      insight: 'text-blue-600 bg-blue-100'
    };
    return colors[type] || 'text-neutral-600 bg-neutral-100';
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-rose-100 text-rose-700 border-rose-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return styles[priority] || styles.medium;
  };

  // Show top 6 insights
  const displayInsights = insights.slice(0, 6);

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-aurora-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#A57865]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">AI Insights</h3>
            <p className="text-sm text-neutral-600">Actionable recommendations for your CRM</p>
          </div>
        </div>
        <button className="text-sm text-[#A57865] hover:text-[#A57865] font-medium">
          View All
        </button>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {displayInsights.map((insight) => {
          const Icon = getIcon(insight.type);

          return (
            <div
              key={insight.id}
              className="p-4 bg-[#FAF8F6] rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer border border-neutral-200"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${getIconColor(insight.type)} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-neutral-900">{insight.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityBadge(insight.priority)}`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-4 ml-13 mb-3">
                <div className="px-3 py-1.5 bg-white rounded-lg border border-neutral-200">
                  <p className="text-xs text-neutral-600">Key Metric</p>
                  <p className="text-sm font-bold text-neutral-900">{insight.metric}</p>
                </div>
                {insight.estimatedRevenue && (
                  <div className="px-3 py-1.5 bg-[#4E5840]/10 rounded-lg border border-[#4E5840]/30">
                    <p className="text-xs text-[#4E5840]">Potential Revenue</p>
                    <p className="text-sm font-bold text-[#4E5840]">{insight.estimatedRevenue}</p>
                  </div>
                )}
                {insight.estimatedLoss && (
                  <div className="px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-200">
                    <p className="text-xs text-rose-600">Potential Loss</p>
                    <p className="text-sm font-bold text-rose-700">{insight.estimatedLoss}</p>
                  </div>
                )}
                <div className="ml-auto">
                  <span className="text-xs text-neutral-600">
                    Confidence: <span className="font-semibold">{insight.confidence}%</span>
                  </span>
                </div>
              </div>

              {/* Action Items */}
              {insight.actionItems && insight.actionItems.length > 0 && (
                <div className="ml-13">
                  <p className="text-xs font-semibold text-neutral-700 mb-2">Recommended Actions:</p>
                  <ul className="space-y-1">
                    {insight.actionItems.slice(0, 2).map((action, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-neutral-600">
                        <ChevronRight className="w-3 h-3 text-[#A57865]" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-aurora-50 rounded-xl border border-[#A57865]/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Ready to take action?</p>
            <p className="text-xs text-[#A57865]">Implement these insights to maximize guest value</p>
          </div>
          <button className="px-4 py-2 bg-[#8E6554] hover:bg-[#A57865] text-white rounded-lg text-sm font-semibold transition-colors">
            Create Action Plan
          </button>
        </div>
      </div>
    </div>
  );
}
