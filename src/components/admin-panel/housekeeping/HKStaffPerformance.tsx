import { useMemo } from 'react';
import { Star, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getStaffPerformanceMetrics, generateSparklineData } from '@/utils/admin/housekeeping';

export default function HKStaffPerformance({ staff, rooms }) {
  // Calculate metrics
  const staffMetrics = useMemo(() => {
    return getStaffPerformanceMetrics(staff, rooms);
  }, [staff, rooms]);

  // Generate sparkline data for each staff
  const sparklineData = useMemo(() => {
    const data = {};
    staffMetrics.forEach(s => {
      data[s.id] = generateSparklineData(s.efficiency, 7).map((value, index) => ({ value }));
    });
    return data;
  }, [staffMetrics]);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="p-4 border-b border-neutral-200 bg-[#FAF8F6]">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#A57865]" />
          Staff Performance
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Tasks Today</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Rooms Cleaned</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Avg Time</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Efficiency</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Delays</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {staffMetrics.map((member) => (
              <tr key={member.id} className="hover:bg-[#FAF8F6]/50 transition-colors">
                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white text-sm font-bold">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 text-sm">{member.name}</p>
                      <p className="text-xs text-neutral-500 capitalize">{member.shift} shift</p>
                    </div>
                  </div>
                </td>

                {/* Tasks Today */}
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-neutral-900">{member.tasksAssigned}</span>
                </td>

                {/* Rooms Cleaned */}
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-[#4E5840]">{member.tasksCompleted}</span>
                </td>

                {/* Avg Time */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-sm text-neutral-700">{member.avgCleaningTime || 25}m</span>
                  </div>
                </td>

                {/* Efficiency */}
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                    member.efficiency >= 90
                      ? 'bg-[#4E5840]/15 text-[#4E5840]'
                      : member.efficiency >= 75
                        ? 'bg-[#CDB261]/20 text-[#CDB261]'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {member.efficiency}%
                  </span>
                </td>

                {/* Delays */}
                <td className="px-4 py-3 text-center">
                  {member.delays > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                      <AlertTriangle className="w-3 h-3" />
                      {member.delays}
                    </span>
                  ) : (
                    <span className="text-sm text-[#4E5840]">0</span>
                  )}
                </td>

                {/* Rating */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= member.rating
                            ? 'text-[#CDB261] fill-[#CDB261]'
                            : 'text-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                </td>

                {/* Sparkline Trend */}
                <td className="px-4 py-3">
                  <div className="w-20 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData[member.id]}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={member.efficiency >= 85 ? '#4E5840' : member.efficiency >= 70 ? '#CDB261' : '#DC2626'}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {staffMetrics.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-neutral-500">No staff data available</p>
        </div>
      )}
    </div>
  );
}
