import { useMemo } from 'react';
import { Users, TrendingUp, TrendingDown, AlertTriangle, Heart, DollarSign, RefreshCw, UserCheck } from 'lucide-react';
// Note: Users icon kept for empty state

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
      <div className="bg-white rounded-[10px] p-6">
        <div className="mb-5">
          <h3 className="text-[15px] font-semibold text-neutral-900">CRM Guest Impact</h3>
          <p className="text-[13px] text-neutral-500 mt-0.5">Select a review to see impact</p>
        </div>
        <div className="text-center py-10 text-neutral-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-[14px] font-medium text-neutral-500">No review selected</p>
          <p className="text-[12px]">Click a review to analyze impact</p>
        </div>
      </div>
    );
  }

  const getChurnColor = (direction) => {
    if (direction === 'increase') return 'text-rose-600';
    if (direction === 'decrease') return 'text-[#4E5840]';
    return 'text-neutral-600';
  };

  const getChurnBg = (direction) => {
    if (direction === 'increase') return 'bg-rose-50';
    if (direction === 'decrease') return 'bg-[#4E5840]/10';
    return 'bg-neutral-50';
  };

  return (
    <div className="bg-white rounded-[10px] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[15px] font-semibold text-neutral-900">CRM Guest Impact</h3>
          <p className="text-[13px] text-neutral-500 mt-0.5">Review impact on guest metrics</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Guest</p>
          <p className="text-[13px] font-semibold text-neutral-900 mt-0.5">{review.guest}</p>
        </div>
      </div>

      {/* Guest Quick Stats */}
      <div className="bg-neutral-50 rounded-[8px] p-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-terra-500 to-terra-600 flex items-center justify-center text-white font-semibold text-[14px]">
            {review.guest?.split(' ').filter(n => n).map(n => n[0]).join('').substring(0, 2) || 'G'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-neutral-900 truncate">{review.guest}</p>
            <p className="text-[12px] text-neutral-500 truncate">{review.email}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Rating</p>
            <p className="text-[20px] font-semibold tracking-tight text-gold-600">{review.rating}/5</p>
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Churn Risk */}
        <div className={`rounded-[8px] p-4 ${getChurnBg(impactAnalysis.churnImpact.direction)}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-3.5 h-3.5 ${getChurnColor(impactAnalysis.churnImpact.direction)}`} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Churn Risk</span>
          </div>
          <div className="flex items-center gap-2">
            {impactAnalysis.churnImpact.direction === 'increase' ? (
              <TrendingUp className="w-4 h-4 text-rose-600" />
            ) : impactAnalysis.churnImpact.direction === 'decrease' ? (
              <TrendingDown className="w-4 h-4 text-sage-600" />
            ) : (
              <RefreshCw className="w-4 h-4 text-neutral-500" />
            )}
            <span className={`text-[20px] font-semibold tracking-tight ${getChurnColor(impactAnalysis.churnImpact.direction)}`}>
              {impactAnalysis.churnImpact.direction === 'increase' ? '+' :
               impactAnalysis.churnImpact.direction === 'decrease' ? '-' : ''}
              {impactAnalysis.churnImpact.change}%
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 capitalize">
            {impactAnalysis.churnImpact.direction}
          </p>
        </div>

        {/* Return Probability */}
        <div className="rounded-[8px] p-4 bg-sage-50">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-3.5 h-3.5 text-sage-600" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Return Prob.</span>
          </div>
          <span className="text-[20px] font-semibold tracking-tight text-sage-600">
            {impactAnalysis.returnProbability}%
          </span>
          <p className="text-[11px] text-neutral-400 mt-1">
            {impactAnalysis.returnProbability >= 70 ? 'Likely to return' :
             impactAnalysis.returnProbability >= 40 ? 'May return' : 'Unlikely'}
          </p>
        </div>
      </div>

      {/* LTV Impact */}
      <div className="bg-neutral-50 rounded-[8px] p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-terra-600" />
          <span className="text-[13px] font-semibold text-neutral-900">Lifetime Value Impact</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-0.5">Original</p>
            <p className="text-[16px] font-semibold tracking-tight text-neutral-600">
              ${impactAnalysis.originalLTV.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-0.5">Adjusted</p>
            <p className={`text-[16px] font-semibold tracking-tight ${
              impactAnalysis.ltvChange >= 0 ? 'text-sage-600' : 'text-gold-600'
            }`}>
              ${impactAnalysis.adjustedLTV.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-0.5">Change</p>
            <p className={`text-[16px] font-semibold tracking-tight ${
              impactAnalysis.ltvChangePercent >= 0 ? 'text-sage-600' : 'text-gold-600'
            }`}>
              {impactAnalysis.ltvChangePercent >= 0 ? '+' : ''}{impactAnalysis.ltvChangePercent}%
            </p>
          </div>
        </div>
      </div>

      {/* Upsell Likelihood */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-[8px]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[6px] bg-terra-100 flex items-center justify-center">
            <Heart className="w-4 h-4 text-terra-600" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-neutral-900">Upsell Likelihood</p>
            <p className="text-[11px] text-neutral-500">Based on sentiment</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-[12px] font-semibold ${
          impactAnalysis.upsellLikelihood === 'High' ? 'bg-sage-100 text-sage-700' :
          impactAnalysis.upsellLikelihood === 'Medium' ? 'bg-gold-100 text-gold-700' :
          'bg-neutral-200 text-neutral-600'
        }`}>
          {impactAnalysis.upsellLikelihood}
        </span>
      </div>

      {/* AI Recommendation */}
      <div className="mt-4 p-4 bg-ocean-50 rounded-[8px]">
        <p className="text-[12px] text-neutral-700 leading-relaxed">
          <span className="font-semibold text-ocean-600">CRM Action:</span>
          {' '}
          {review.rating <= 2 ? (
            <>
              Flag for immediate follow-up. Send personalized apology with service recovery offer.
            </>
          ) : review.rating <= 3 ? (
            <>
              Monitor guest for next booking. Consider sending feedback survey.
            </>
          ) : review.rating >= 4.5 ? (
            <>
              High-value guest. Add to VIP segment and consider for ambassador program.
            </>
          ) : (
            <>
              Satisfied guest. Send thank you and invite to loyalty program.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
