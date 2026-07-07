import { useMemo } from 'react';
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { generateCRMInsights } from '@/utils/admin/crm';

export default function CRMInsights({ guests, segments, campaigns, tiers }) {
  const insights = useMemo(() => {
    return generateCRMInsights(guests, segments, campaigns, tiers);
  }, [guests, segments, campaigns, tiers]);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#4E5840]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#CDB261]" />;
      case 'info':
        return <Info className="w-5 h-5 text-[#5C9BA4]" />;
      default:
        return <Lightbulb className="w-5 h-5 text-[#A57865]" />;
    }
  };

  const getInsightStyle = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-[#4E5840] bg-[#4E5840]/5';
      case 'warning':
        return 'border-l-[#CDB261] bg-[#CDB261]/5';
      case 'info':
        return 'border-l-[#5C9BA4] bg-[#5C9BA4]/5';
      default:
        return 'border-l-[#A57865] bg-[#FAF7F4]';
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
    <div className="bg-white rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-[#A57865]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-900">CRM Insights</h3>
          <p className="text-xs text-neutral-500">AI-powered recommendations</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {displayInsights.map((insight, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${getInsightStyle(insight.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getInsightIcon(insight.type)}
            </div>
            <p className="text-sm text-neutral-700">{insight.message}</p>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[#4E5840]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-lg font-bold">
                {displayInsights.filter(i => i.type === 'success').length}
              </span>
            </div>
            <p className="text-xs text-neutral-500">Positive</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[#CDB261]">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-lg font-bold">
                {displayInsights.filter(i => i.type === 'warning').length}
              </span>
            </div>
            <p className="text-xs text-neutral-500">Attention</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[#5C9BA4]">
              <Info className="w-4 h-4" />
              <span className="text-lg font-bold">
                {displayInsights.filter(i => i.type === 'info').length}
              </span>
            </div>
            <p className="text-xs text-neutral-500">Info</p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d4;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a3a3a3;
        }
      `}</style>
    </div>
  );
}
