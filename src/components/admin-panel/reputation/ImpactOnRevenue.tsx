import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function ImpactOnRevenue({ sentimentData, recommendations }) {
  const analysis = useMemo(() => {
    if (!sentimentData || sentimentData.length === 0) {
      return {
        avgSentiment: 0,
        trend: 0,
        impact: 'neutral',
        rateAdjustment: 0,
        confidence: 0
      };
    }

    const recent7 = sentimentData.slice(-7);
    const previous7 = sentimentData.slice(-14, -7);

    const recentAvg = recent7.reduce((sum, d) => sum + d.score, 0) / recent7.length;
    const previousAvg = previous7.length > 0
      ? previous7.reduce((sum, d) => sum + d.score, 0) / previous7.length
      : recentAvg;

    const trend = recentAvg - previousAvg;
    const trendPercent = previousAvg > 0 ? ((trend / previousAvg) * 100) : 0;

    let impact = 'neutral';
    let rateAdjustment = 0;
    let confidence = 'medium';

    if (recentAvg < 50) {
      impact = 'negative';
      rateAdjustment = -3;
      confidence = 'high';
    } else if (recentAvg > 80 && trend > 5) {
      impact = 'positive';
      rateAdjustment = 5;
      confidence = 'high';
    } else if (trend < -10) {
      impact = 'caution';
      rateAdjustment = 0;
      confidence = 'medium';
    }

    return {
      avgSentiment: Math.round(recentAvg),
      trend: Math.round(trend),
      trendPercent: Math.round(trendPercent),
      impact,
      rateAdjustment,
      confidence
    };
  }, [sentimentData]);

  const getImpactStyle = (impact) => {
    switch (impact) {
      case 'positive':
        return {
          bg: 'bg-[#4E5840]/10',
          border: 'border-[#4E5840]/30',
          text: 'text-[#4E5840]',
          icon: TrendingUp,
          label: 'Positive Impact'
        };
      case 'negative':
        return {
          bg: 'bg-[#CDB261]/10',
          border: 'border-[#CDB261]/30',
          text: 'text-[#CDB261]',
          icon: TrendingDown,
          label: 'Revenue Risk'
        };
      case 'caution':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          icon: AlertTriangle,
          label: 'Monitor Closely'
        };
      default:
        return {
          bg: 'bg-neutral-50',
          border: 'border-neutral-200',
          text: 'text-neutral-600',
          icon: CheckCircle,
          label: 'Stable'
        };
    }
  };

  const impactStyle = getImpactStyle(analysis.impact);
  const ImpactIcon = impactStyle.icon;

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[#A57865]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Revenue AI Impact</h3>
            <p className="text-sm text-neutral-500">Reputation-based rate intelligence</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${impactStyle.bg} ${impactStyle.border} border`}>
          <ImpactIcon className={`w-4 h-4 ${impactStyle.text}`} />
          <span className={`text-xs font-semibold ${impactStyle.text}`}>
            {impactStyle.label}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#FAF7F4] rounded-xl p-4 text-center">
          <p className="text-xs text-neutral-500 mb-1">Current Sentiment</p>
          <p className="text-2xl font-bold text-neutral-900">{analysis.avgSentiment}%</p>
        </div>
        <div className="bg-[#FAF7F4] rounded-xl p-4 text-center">
          <p className="text-xs text-neutral-500 mb-1">7-Day Change</p>
          <p className={`text-2xl font-bold ${analysis.trend >= 0 ? 'text-[#4E5840]' : 'text-[#CDB261]'}`}>
            {analysis.trend >= 0 ? '+' : ''}{analysis.trend}%
          </p>
        </div>
        <div className="bg-[#FAF7F4] rounded-xl p-4 text-center">
          <p className="text-xs text-neutral-500 mb-1">Rate Suggestion</p>
          <p className={`text-2xl font-bold ${
            analysis.rateAdjustment > 0 ? 'text-[#4E5840]' : analysis.rateAdjustment < 0 ? 'text-[#CDB261]' : 'text-neutral-600'
          }`}>
            {analysis.rateAdjustment > 0 ? '+' : ''}{analysis.rateAdjustment}%
          </p>
        </div>
      </div>

      {/* AI Insights */}
      <div className={`rounded-xl p-4 ${impactStyle.bg} border ${impactStyle.border}`}>
        <h4 className={`text-sm font-semibold ${impactStyle.text} mb-3 flex items-center gap-2`}>
          <Sparkles className="w-4 h-4" />
          Revenue AI Recommendation
        </h4>

        {analysis.impact === 'negative' && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-700">
              Due to a <span className="font-semibold">{Math.abs(analysis.trend)}% drop</span> in sentiment this week,
              Revenue AI recommends a <span className="font-semibold text-[#CDB261]">3% rate moderation</span> to maintain booking volume.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <ArrowRight className="w-3 h-3" />
              Reduce forecast confidence by 10%
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <ArrowRight className="w-3 h-3" />
              Consider promotional offers for low-demand periods
            </div>
          </div>
        )}

        {analysis.impact === 'positive' && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-700">
              OTA score improved with sentiment at <span className="font-semibold">{analysis.avgSentiment}%</span>.
              Revenue AI suggests <span className="font-semibold text-[#4E5840]">+5% rate increase</span> potential.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <ArrowRight className="w-3 h-3" />
              Increase pricing confidence by 15%
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <ArrowRight className="w-3 h-3" />
              Consider premium rate for high-demand periods
            </div>
          </div>
        )}

        {analysis.impact === 'caution' && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-700">
              Sentiment trend is declining (<span className="font-semibold">{analysis.trend}%</span>).
              Revenue AI recommends <span className="font-semibold text-amber-700">holding current rates</span> and monitoring closely.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <ArrowRight className="w-3 h-3" />
              Maintain current pricing strategy
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <ArrowRight className="w-3 h-3" />
              Focus on improving guest experience
            </div>
          </div>
        )}

        {analysis.impact === 'neutral' && (
          <div className="space-y-2">
            <p className="text-sm text-neutral-700">
              Sentiment is stable at <span className="font-semibold">{analysis.avgSentiment}%</span>.
              No immediate pricing action required.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <ArrowRight className="w-3 h-3" />
              Continue current revenue strategy
            </div>
          </div>
        )}
      </div>

      {/* Confidence Indicator */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-neutral-500">AI Confidence</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                analysis.confidence === 'high' ? 'bg-[#4E5840] w-full' :
                analysis.confidence === 'medium' ? 'bg-[#CDB261] w-2/3' : 'bg-[#C8B29D] w-1/3'
              }`}
            />
          </div>
          <span className={`text-xs font-semibold capitalize ${
            analysis.confidence === 'high' ? 'text-[#4E5840]' :
            analysis.confidence === 'medium' ? 'text-[#CDB261]' : 'text-[#C8B29D]'
          }`}>
            {analysis.confidence}
          </span>
        </div>
      </div>
    </div>
  );
}
