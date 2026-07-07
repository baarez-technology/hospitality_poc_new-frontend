import { useMemo } from 'react';
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { generateCRMInsights } from '../../utils/crm';

export default function CRMInsights({ guests, segments, campaigns, tiers }) {
  const insights = useMemo(() => {
    return generateCRMInsights(guests, segments, campaigns, tiers);
  }, [guests, segments, campaigns, tiers]);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-[18px] h-[18px] text-[#4E5840]" />;
      case 'warning':
        return <AlertTriangle className="w-[18px] h-[18px] text-[#CDB261]" />;
      case 'info':
        return <Info className="w-[18px] h-[18px] text-[#5C9BA4]" />;
      default:
        return <Lightbulb className="w-[18px] h-[18px] text-[#A57865]" />;
    }
  };

  const getInsightStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-[#4E5840]/5 border border-[#4E5840]/10';
      case 'warning':
        return 'bg-[#CDB261]/5 border border-[#CDB261]/10';
      case 'info':
        return 'bg-[#5C9BA4]/5 border border-[#5C9BA4]/10';
      default:
        return 'bg-neutral-50 border border-neutral-100';
    }
  };

  const defaultInsights = [
    {
      type: 'success',
      message: 'Guest retention is performing well this quarter.'
    },
    {
      type: 'info',
      message: 'Consider creating a segment for high-value recent guests.'
    },
    {
      type: 'warning',
      message: 'Some campaigns may benefit from A/B testing.'
    }
  ];

  const displayInsights = insights.length > 0 ? insights : defaultInsights;

  return (
    <div className="bg-white rounded-[10px] border border-neutral-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#A57865]/10 flex items-center justify-center">
            <Lightbulb className="w-[18px] h-[18px] text-[#A57865]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-neutral-900">CRM Insights</h3>
            <p className="text-[12px] text-neutral-400 mt-0.5">AI-powered recommendations</p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {displayInsights.map((insight, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3.5 rounded-[8px] ${getInsightStyle(insight.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getInsightIcon(insight.type)}
            </div>
            <p className="text-[13px] text-neutral-700 leading-relaxed">{insight.message}</p>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="px-5 py-4 border-t border-neutral-100">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#4E5840]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[15px] font-bold">
                {displayInsights.filter(i => i.type === 'success').length}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Positive</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#CDB261]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[15px] font-bold">
                {displayInsights.filter(i => i.type === 'warning').length}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Attention</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#5C9BA4]">
              <Info className="w-3.5 h-3.5" />
              <span className="text-[15px] font-bold">
                {displayInsights.filter(i => i.type === 'info').length}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Info</p>
          </div>
        </div>
      </div>
    </div>
  );
}
