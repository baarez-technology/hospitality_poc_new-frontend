import { useMemo } from 'react';
import { Hash, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

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
    return Math.max(...data.map(k => k.mentions));
  }, [data]);

  const stats = useMemo(() => {
    const positive = data.filter(k => k.sentiment === 'positive');
    const negative = data.filter(k => k.sentiment === 'negative');
    const neutral = data.filter(k => k.sentiment === 'neutral');

    return {
      positive: positive.reduce((sum, k) => sum + k.mentions, 0),
      negative: negative.reduce((sum, k) => sum + k.mentions, 0),
      neutral: neutral.reduce((sum, k) => sum + k.mentions, 0),
      total: data.reduce((sum, k) => sum + k.mentions, 0)
    };
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
            <Hash className="w-5 h-5 text-[#5C9BA4]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Keyword Analysis</h3>
            <p className="text-sm text-neutral-500">AI-detected topics from reviews</p>
          </div>
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
      <div className="mt-6 pt-4 border-t border-neutral-100">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ThumbsUp className="w-4 h-4 text-[#4E5840]" />
              <span className="text-lg font-bold text-[#4E5840]">
                {Math.round((stats.positive / stats.total) * 100)}%
              </span>
            </div>
            <p className="text-xs text-neutral-500">Positive Topics</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Minus className="w-4 h-4 text-[#C8B29D]" />
              <span className="text-lg font-bold text-[#C8B29D]">
                {Math.round((stats.neutral / stats.total) * 100)}%
              </span>
            </div>
            <p className="text-xs text-neutral-500">Neutral Topics</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ThumbsDown className="w-4 h-4 text-[#CDB261]" />
              <span className="text-lg font-bold text-[#CDB261]">
                {Math.round((stats.negative / stats.total) * 100)}%
              </span>
            </div>
            <p className="text-xs text-neutral-500">Negative Topics</p>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="mt-4 p-3 bg-[#FAF7F4] rounded-xl">
        <p className="text-xs text-neutral-700">
          <span className="font-semibold text-[#5C9BA4]">AI Insight:</span>
          {' '}
          {stats.positive > stats.negative
            ? `"${sortedData[0]?.keyword}" is your most mentioned topic. Focus on maintaining this strength while addressing "${sortedData.find(k => k.sentiment === 'negative')?.keyword || 'minor concerns'}".`
            : `Address "${sortedData.find(k => k.sentiment === 'negative')?.keyword}" as a priority - it's frequently mentioned in negative reviews.`
          }
        </p>
      </div>
    </div>
  );
}
