import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Trophy, TrendingUp, Star } from 'lucide-react';

export default function CompetitorComparison({ competitors, ratingTrends, summary }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-neutral-200">
          <p className="font-semibold text-neutral-900 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                <span className="font-medium">{entry.name}:</span> {entry.value}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Your Rank</span>
          </div>
          <p className="text-4xl font-bold mb-1">#{summary.yourRank}</p>
          <p className="text-sm opacity-75">Out of {summary.totalCompetitors} competitors</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-amber-500" />
            <span className="text-sm font-medium text-neutral-600">Gap to Leader</span>
          </div>
          <p className="text-4xl font-bold text-neutral-900 mb-1">
            {summary.ratingGap.toLeader.toFixed(1)}
          </p>
          <p className="text-sm text-neutral-600">Rating points behind #1</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-[#4E5840]" />
            <span className="text-sm font-medium text-neutral-600">vs Average</span>
          </div>
          <p className="text-4xl font-bold text-[#4E5840] mb-1">
            +{summary.ratingGap.toAverage.toFixed(1)}
          </p>
          <p className="text-sm text-neutral-600">Above market average</p>
        </div>
      </div>

      {/* Competitor Comparison Table */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <h3 className="text-xl font-sans font-semibold text-neutral-900 mb-6">
          Competitor Benchmarking
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                  Rank
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                  Property
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                  Overall Rating
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                  Total Reviews
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                  Response Rate
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                  Price Range
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-600 uppercase">
                  Strengths
                </th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((comp, index) => (
                <tr
                  key={comp.id}
                  className={`border-b border-neutral-100 hover:bg-[#FAF8F6] transition-colors ${
                    comp.isYou ? 'bg-[#A57865]/5' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      comp.rank === 1
                        ? 'bg-yellow-100 text-yellow-700'
                        : comp.isYou
                        ? 'bg-[#8E6554] text-white'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {comp.rank}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${comp.isYou ? 'text-neutral-900' : 'text-neutral-900'}`}>
                        {comp.name}
                      </span>
                      {comp.isYou && (
                        <span className="px-2 py-0.5 bg-[#8E6554] text-white rounded text-xs font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold text-neutral-900">
                        {comp.overallRating.toFixed(1)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= Math.round(comp.overallRating)
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'fill-neutral-200 text-neutral-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="font-semibold text-neutral-900">{comp.totalReviews}</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-[#A57865] h-2 rounded-full"
                          style={{ width: `${comp.responseRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-neutral-700 w-10 text-right">
                        {comp.responseRate}%
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="font-mono text-sm text-neutral-700">{comp.priceRange}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {comp.strengths.slice(0, 2).map((strength, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-green-100 text-[#4E5840] rounded text-xs font-medium"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rating Trends Chart */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Rating Trends (6 Months)
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ratingTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              domain={[3.5, 5]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="Terra Suites"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Grand Luxe"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ fill: '#7c3aed', r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="Riverside"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="City Center"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="Budget Stay"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
