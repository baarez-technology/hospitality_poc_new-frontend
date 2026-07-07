import { useMemo } from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

const getSentimentStyle = (sentiment) => {
  switch (sentiment) {
    case 'positive':
      return {
        bg: 'bg-[#4E5840]/15',
        text: 'text-[#4E5840]',
        icon: ThumbsUp,
        label: '+'
      };
    case 'negative':
      return {
        bg: 'bg-[#CDB261]/20',
        text: 'text-[#CDB261]',
        icon: ThumbsDown,
        label: '-'
      };
    default:
      return {
        bg: 'bg-[#C8B29D]/20',
        text: 'text-[#C8B29D]',
        icon: Minus,
        label: '~'
      };
  }
};

export default function KeywordFrequency({ data }) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.mentions - a.mentions);
  }, [data]);

  const maxMentions = useMemo(() => {
    if (!data || data.length === 0) return 1;
    const mentions = data.map(k => k.mentions || k.count || 0);
    return Math.max(...mentions, 1);
  }, [data]);

  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return { positive: 0, negative: 0, neutral: 0, total: 1 }; // total: 1 prevents NaN in percentage calculations
    }
    const positive = data.filter(k => k.sentiment === 'positive');
    const negative = data.filter(k => k.sentiment === 'negative');
    const neutral = data.filter(k => k.sentiment === 'neutral' || !k.sentiment);

    const getMentions = (items: any[]) => items.reduce((sum, k) => sum + (k.mentions || k.count || 0), 0);

    return {
      positive: getMentions(positive),
      negative: getMentions(negative),
      neutral: getMentions(neutral),
      total: getMentions(data) || 1 // Prevent division by zero
    };
  }, [data]);

  return (
    <div className="bg-white rounded-[10px] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[15px] font-semibold text-neutral-900">Keyword Analysis</h3>
          <p className="text-[13px] text-neutral-500 mt-0.5">AI-detected topics from reviews</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-[#4E5840]/15 text-[#4E5840] text-xs font-semibold rounded-full">
            {stats.positive} positive
          </span>
          <span className="px-2 py-1 bg-[#CDB261]/20 text-[#CDB261] text-xs font-semibold rounded-full">
            {stats.negative} negative
          </span>
        </div>
      </div>

      {/* Keyword List with Bars */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
        {sortedData.map((keyword, index) => {
          const style = getSentimentStyle(keyword.sentiment);
          const barWidth = (keyword.mentions / maxMentions) * 100;
          const Icon = style.icon;

          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                  <span className="text-sm font-medium text-neutral-900 capitalize">
                    {keyword.keyword}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className={`w-3 h-3 ${style.text}`} />
                  <span className="text-sm font-bold text-neutral-700">
                    {keyword.mentions}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    keyword.sentiment === 'positive'
                      ? 'bg-[#4E5840]'
                      : keyword.sentiment === 'negative'
                      ? 'bg-[#CDB261]'
                      : 'bg-[#C8B29D]'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-5 border-t border-neutral-100">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ThumbsUp className="w-4 h-4 text-sage-600" />
              <span className="text-[20px] font-semibold tracking-tight text-sage-600">
                {Math.round((stats.positive / stats.total) * 100)}%
              </span>
            </div>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Positive</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Minus className="w-4 h-4 text-neutral-400" />
              <span className="text-[20px] font-semibold tracking-tight text-neutral-500">
                {Math.round((stats.neutral / stats.total) * 100)}%
              </span>
            </div>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Neutral</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ThumbsDown className="w-4 h-4 text-gold-600" />
              <span className="text-[20px] font-semibold tracking-tight text-gold-600">
                {Math.round((stats.negative / stats.total) * 100)}%
              </span>
            </div>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Negative</p>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="mt-4 p-4 bg-ocean-50 rounded-[8px]">
        <p className="text-[12px] text-neutral-700 leading-relaxed">
          <span className="font-semibold text-ocean-600">AI Insight:</span>
          {' '}
          {sortedData.length === 0
            ? 'No keyword data available yet. As reviews come in, AI will analyze common topics and sentiments.'
            : stats.positive > stats.negative
            ? `"${sortedData[0]?.keyword || 'Your top topic'}" is your most mentioned topic. Focus on maintaining this strength while addressing "${sortedData.find(k => k.sentiment === 'negative')?.keyword || 'minor concerns'}".`
            : sortedData.find(k => k.sentiment === 'negative')?.keyword
            ? `Address "${sortedData.find(k => k.sentiment === 'negative')?.keyword}" as a priority - it's frequently mentioned in negative reviews.`
            : 'Monitor your reviews for emerging topics and sentiment patterns.'
          }
        </p>
      </div>
    </div>
  );
}
