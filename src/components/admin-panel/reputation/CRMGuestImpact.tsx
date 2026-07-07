import { useMemo } from 'react';
import { Users, TrendingUp, TrendingDown, AlertTriangle, Heart, DollarSign, RefreshCw, UserCheck } from 'lucide-react';

export default function CRMGuestImpact({ review, influenceChurnProbability, influenceLTVCurve }) {
  const impactAnalysis = useMemo(() => {
    if (!review) return null;

    const churnImpact = influenceChurnProbability(review.rating);
    const mockLTV = 125000;
    const adjustedLTV = influenceLTVCurve(review.rating, mockLTV);

    const returnProbability = review.rating >= 4.5 ? 85 :
      review.rating >= 4 ? 70 :
      review.rating >= 3 ? 45 :
      review.rating >= 2 ? 25 : 10;

    const upsellLikelihood = review.sentiment >= 70 ? 'High' :
      review.sentiment >= 40 ? 'Medium' : 'Low';

    return {
      churnImpact,
      originalLTV: mockLTV,
      adjustedLTV,
      ltvChange: adjustedLTV - mockLTV,
      ltvChangePercent: Math.round(((adjustedLTV - mockLTV) / mockLTV) * 100),
      returnProbability,
      upsellLikelihood
    };
  }, [review, influenceChurnProbability, influenceLTVCurve]);

  if (!review || !impactAnalysis) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#5C9BA4]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">CRM Guest Impact</h3>
            <p className="text-sm text-neutral-500">Select a review to see impact</p>
          </div>
        </div>
        <div className="text-center py-8 text-neutral-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No review selected</p>
        </div>
      </div>
    );
  }

  const getChurnColor = (direction) => {
    if (direction === 'increase') return 'text-red-600';
    if (direction === 'decrease') return 'text-[#4E5840]';
    return 'text-neutral-600';
  };

  const getChurnBg = (direction) => {
    if (direction === 'increase') return 'bg-red-50';
    if (direction === 'decrease') return 'bg-[#4E5840]/10';
    return 'bg-neutral-50';
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#5C9BA4]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">CRM Guest Impact</h3>
            <p className="text-sm text-neutral-500">Review impact on guest metrics</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Guest</p>
          <p className="text-sm font-semibold text-neutral-900">{review.guest}</p>
        </div>
      </div>

      {/* Guest Quick Stats */}
      <div className="bg-[#FAF7F4] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white font-bold text-lg">
            {review.guest?.split(' ').filter(n => n).map(n => n[0]).join('') || 'G'.substring(0, 2)}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-neutral-900">{review.guest}</p>
            <p className="text-xs text-neutral-500">{review.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">Review Rating</p>
            <p className="text-lg font-bold text-[#CDB261]">{review.rating}/5</p>
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Churn Risk */}
        <div className={`rounded-xl p-4 ${getChurnBg(impactAnalysis.churnImpact.direction)}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-4 h-4 ${getChurnColor(impactAnalysis.churnImpact.direction)}`} />
            <span className="text-xs font-medium text-neutral-600">Churn Risk</span>
          </div>
          <div className="flex items-center gap-2">
            {impactAnalysis.churnImpact.direction === 'increase' ? (
              <TrendingUp className="w-5 h-5 text-red-600" />
            ) : impactAnalysis.churnImpact.direction === 'decrease' ? (
              <TrendingDown className="w-5 h-5 text-[#4E5840]" />
            ) : (
              <RefreshCw className="w-5 h-5 text-neutral-500" />
            )}
            <span className={`text-xl font-bold ${getChurnColor(impactAnalysis.churnImpact.direction)}`}>
              {impactAnalysis.churnImpact.direction === 'increase' ? '+' :
               impactAnalysis.churnImpact.direction === 'decrease' ? '-' : ''}
              {impactAnalysis.churnImpact.change}%
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 capitalize">
            {impactAnalysis.churnImpact.direction}
          </p>
        </div>

        {/* Return Probability */}
        <div className="rounded-xl p-4 bg-[#4E5840]/10">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-[#4E5840]" />
            <span className="text-xs font-medium text-neutral-600">Return Probability</span>
          </div>
          <span className="text-xl font-bold text-[#4E5840]">
            {impactAnalysis.returnProbability}%
          </span>
          <p className="text-xs text-neutral-500 mt-1">
            {impactAnalysis.returnProbability >= 70 ? 'Likely to return' :
             impactAnalysis.returnProbability >= 40 ? 'May return' : 'Unlikely to return'}
          </p>
        </div>
      </div>

      {/* LTV Impact */}
      <div className="bg-[#FAF7F4] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-[#A57865]" />
          <span className="text-sm font-semibold text-neutral-900">Lifetime Value Impact</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-neutral-500">Original LTV</p>
            <p className="text-lg font-bold text-neutral-600">
              ${impactAnalysis.originalLTV.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Adjusted LTV</p>
            <p className={`text-lg font-bold ${
              impactAnalysis.ltvChange >= 0 ? 'text-[#4E5840]' : 'text-[#CDB261]'
            }`}>
              ${impactAnalysis.adjustedLTV.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Change</p>
            <p className={`text-lg font-bold ${
              impactAnalysis.ltvChangePercent >= 0 ? 'text-[#4E5840]' : 'text-[#CDB261]'
            }`}>
              {impactAnalysis.ltvChangePercent >= 0 ? '+' : ''}{impactAnalysis.ltvChangePercent}%
            </p>
          </div>
        </div>
      </div>

      {/* Upsell Likelihood */}
      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-[#A57865]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Upsell Likelihood</p>
            <p className="text-xs text-neutral-500">Based on sentiment analysis</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
          impactAnalysis.upsellLikelihood === 'High' ? 'bg-[#4E5840]/15 text-[#4E5840]' :
          impactAnalysis.upsellLikelihood === 'Medium' ? 'bg-[#CDB261]/20 text-[#CDB261]' :
          'bg-neutral-100 text-neutral-600'
        }`}>
          {impactAnalysis.upsellLikelihood}
        </span>
      </div>

      {/* AI Recommendation */}
      <div className="mt-4 p-4 bg-[#5C9BA4]/5 rounded-xl border border-[#5C9BA4]/20">
        <p className="text-xs text-neutral-700">
          <span className="font-semibold text-[#5C9BA4]">CRM Action:</span>
          {' '}
          {review.rating <= 2 ? (
            <>
              Flag for immediate follow-up. Send personalized apology with service recovery offer.
              Consider adding to "At Risk" segment.
            </>
          ) : review.rating <= 3 ? (
            <>
              Monitor guest for next booking. Consider sending feedback survey and
              loyalty program invitation.
            </>
          ) : review.rating >= 4.5 ? (
            <>
              High-value guest with excellent satisfaction. Add to VIP segment and
              consider for ambassador program.
            </>
          ) : (
            <>
              Satisfied guest. Send thank you email and invite to join loyalty program
              for enhanced benefits.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
