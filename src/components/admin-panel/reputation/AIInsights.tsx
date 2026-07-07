import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target, Award } from 'lucide-react';

export default function AIInsights({ insights = [] }) {
  // Default insights if none provided
  const defaultInsights = [
    {
      type: 'opportunity',
      title: 'Response Time Improvement Opportunity',
      message: 'Reviews responded to within 24 hours have 35% higher follow-up ratings. Currently, your average response time is 15 hours. Aim for under 12 hours to maximize positive impact.',
      impact: 'High',
      metric: '+18% satisfaction potential',
      actionRequired: true
    },
    {
      type: 'alert',
      icon: AlertTriangle,
      title: 'Negative Sentiment Spike Detected',
      description: 'Price-related complaints increased by 22% in the last 2 weeks. Keywords: "expensive", "overpriced", "not worth it". Consider reviewing weekend premium pricing strategy.',
      impact: 'Medium',
      impactColor: 'amber',
      action: 'Review Pricing',
      metric: '18 mentions in 14 days'
    },
    {
      type: 'strength',
      icon: Award,
      title: 'Staff Service Excellence',
      description: 'Your team receives 87% positive mentions for service quality, placing you #1 among local competitors. "Friendly", "helpful", and "professional" are top associated keywords.',
      impact: 'Positive',
      impactColor: 'primary',
      action: 'Share with Team',
      metric: '142 positive mentions'
    },
    {
      type: 'recommendation',
      icon: Lightbulb,
      title: 'Leverage High Performers',
      description: 'TripAdvisor shows strongest growth (+15%) with 4.6 average rating. Allocate more marketing resources to this platform and encourage satisfied guests to leave reviews there.',
      impact: 'High',
      impactColor: 'green',
      action: 'Update Strategy',
      metric: '+15% growth YoY'
    },
    {
      type: 'target',
      icon: Target,
      title: 'Close Rating Gap',
      description: 'You are 0.2 points behind market leader "Grand Luxe Hotel". Focus on addressing top 3 improvement areas: parking convenience, breakfast variety, and room size perception.',
      impact: 'High',
      impactColor: 'primary',
      action: 'Create Action Plan',
      metric: '0.2 points to #1'
    },
    {
      type: 'opportunity',
      icon: Sparkles,
      title: 'Increase Response Rate',
      description: 'Your response rate of 75% is good but below industry leaders (85%). Unanswered reviews miss relationship-building opportunities. Prioritize responding to 3-star and negative reviews first.',
      impact: 'Medium',
      impactColor: 'amber',
      action: 'Reply to Reviews',
      metric: '62 unanswered reviews'
    }
  ];

  // Use provided insights or fall back to default
  const displayInsights = insights.length > 0 ? insights : defaultInsights;

  // Map type to icon
  const getIcon = (type) => {
    const icons = {
      opportunity: TrendingUp,
      alert: AlertTriangle,
      strength: Award,
      recommendation: Lightbulb,
      target: Target
    };
    return icons[type] || Lightbulb;
  };

  const getIconColor = (type) => {
    const colors = {
      opportunity: 'text-[#4E5840] bg-green-100',
      alert: 'text-amber-600 bg-amber-100',
      strength: 'text-[#A57865] bg-[#A57865]/10',
      recommendation: 'text-[#5C9BA4] bg-[#5C9BA4]/15',
      target: 'text-blue-600 bg-blue-100'
    };
    return colors[type] || colors.recommendation;
  };

  const getImpactStyle = (color) => {
    const styles = {
      green: 'bg-green-100 text-[#4E5840] border-[#4E5840]/30',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      primary: 'bg-[#A57865]/10 text-[#A57865] border-[#A57865]/30'
    };
    return styles[color] || styles.primary;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-aurora-600 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif font-semibold">AI-Powered Insights</h2>
        </div>
        <p className="text-white/90 text-sm">
          Strategic recommendations based on analysis of your reviews, competitor data, and industry trends
        </p>
      </div>

      {/* AI Stats */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">AI Analysis Performance</h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#A57865] mb-1">250</p>
            <p className="text-xs text-neutral-600">Reviews Analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#4E5840] mb-1">94%</p>
            <p className="text-xs text-neutral-600">Sentiment Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#5C9BA4] mb-1">156</p>
            <p className="text-xs text-neutral-600">Keywords Identified</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-600 mb-1">6</p>
            <p className="text-xs text-neutral-600">Action Items</p>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayInsights.map((insight, index) => {
          const Icon = insight.icon || getIcon(insight.type);
          const impactColor = insight.impactColor || (
            insight.impact === 'High' ? 'green' :
            insight.impact === 'Medium' ? 'amber' : 'primary'
          );

          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow transition-shadow duration-200"
            >
              {/* Icon and Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${getIconColor(insight.type)} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {insight.title}
                  </h3>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${getImpactStyle(impactColor)}`}>
                    {insight.impact} Impact
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                {insight.message || insight.description}
              </p>

              {/* Metric */}
              <div className="mb-4 p-3 bg-[#FAF8F6] rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Key Metric</p>
                <p className="text-sm font-bold text-neutral-900">{insight.metric}</p>
              </div>

              {/* Action Button */}
              {(insight.action || insight.actionRequired) && (
                <button className="w-full py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg text-sm font-medium transition-colors duration-200">
                  {insight.action || (insight.actionRequired ? 'Take Action' : 'View Details')}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Wins */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-[#4E5840]/30">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Quick Wins (Next 7 Days)
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">Reply to all negative reviews (12 pending)</p>
              <p className="text-xs text-[#4E5840]">Estimated impact: +5% overall sentiment</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">Address pricing concerns in FAQ and confirmation emails</p>
              <p className="text-xs text-[#4E5840]">Estimated impact: -15% price complaints</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">Send review request to recent 5-star guests via email</p>
              <p className="text-xs text-[#4E5840]">Estimated impact: +25 new positive reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
