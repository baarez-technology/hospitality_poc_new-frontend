import { TrendingUp, Hash } from 'lucide-react';

export default function KeywordCloud({ keywords, trendingKeywords }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <div className="mb-6">
        <h3 className="text-xl font-sans font-semibold text-neutral-900 mb-1">
          Keyword Analysis
        </h3>
        <p className="text-sm text-neutral-600">
          Most frequently mentioned words in reviews
        </p>
      </div>

      {/* Main Keyword Cloud */}
      <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl mb-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {keywords.slice(0, 30).map((keyword, index) => (
            <div
              key={index}
              className="px-3 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-110 cursor-pointer"
              style={{
                fontSize: `${keyword.size}px`,
                backgroundColor: `${keyword.color}20`,
                color: keyword.color,
                border: `2px solid ${keyword.color}`
              }}
            >
              {keyword.word}
            </div>
          ))}
        </div>
      </div>

      {/* Trending Keywords */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#A57865]" />
          <h4 className="text-lg font-semibold text-neutral-900">Trending Keywords</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {trendingKeywords.map((keyword, index) => {
            const isPositive = keyword.sentiment === 'positive';

            return (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  isPositive
                    ? 'bg-[#4E5840]/10 border-[#4E5840]/30'
                    : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Hash className={`w-4 h-4 ${isPositive ? 'text-[#4E5840]' : 'text-rose-600'}`} />
                    <span className={`font-semibold ${isPositive ? 'text-green-900' : 'text-rose-900'}`}>
                      {keyword.word}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    isPositive
                      ? 'bg-green-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {keyword.trend}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isPositive ? 'text-[#4E5840]' : 'text-rose-700'}`}>
                    {keyword.count} mentions
                  </span>
                  <span className={`text-xs uppercase font-semibold ${
                    isPositive ? 'text-[#4E5840]' : 'text-rose-600'
                  }`}>
                    {keyword.sentiment}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Positive/Negative Keywords */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-[#4E5840]/10 rounded-xl border border-[#4E5840]/30">
          <h5 className="text-sm font-semibold text-green-900 mb-3">Top Positive Words</h5>
          <div className="space-y-2">
            {keywords
              .filter(k => k.sentiment === 'positive')
              .slice(0, 5)
              .map((keyword, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-green-800 font-medium">{keyword.word}</span>
                  <span className="text-xs text-[#4E5840] font-semibold">{keyword.count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
          <h5 className="text-sm font-semibold text-rose-900 mb-3">Top Negative Words</h5>
          <div className="space-y-2">
            {keywords
              .filter(k => k.sentiment === 'negative')
              .slice(0, 5)
              .map((keyword, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-rose-800 font-medium">{keyword.word}</span>
                  <span className="text-xs text-rose-600 font-semibold">{keyword.count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
