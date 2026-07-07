import { useMemo } from 'react';
import { Star, Clock, AlertTriangle, Users } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getStaffPerformanceMetrics, generateSparklineData } from '../../utils/housekeeping';

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
    <div className="bg-white rounded-[10px] overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <h3 className="text-[15px] font-semibold text-neutral-900">Staff Performance</h3>
        <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Real-time performance metrics</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white border-b border-neutral-100">
              <th className="px-6 py-4 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-center text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Tasks</th>
              <th className="px-6 py-4 text-center text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Cleaned</th>
              <th className="px-6 py-4 text-center text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Avg Time</th>
              <th className="px-6 py-4 text-center text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Efficiency</th>
              <th className="px-6 py-4 text-center text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Delays</th>
              <th className="px-6 py-4 text-center text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-4 text-center text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {staffMetrics.map((member) => (
              <tr key={member.id} className="hover:bg-neutral-50 transition-colors">
                {/* Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-terra-100 flex items-center justify-center text-terra-600 text-[11px] font-bold">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 text-[13px]">{member.name}</p>
                      <p className="text-[10px] text-neutral-500 font-medium capitalize">{member.shift} shift</p>
                    </div>
                  </div>
                </td>

                {/* Tasks Today */}
                <td className="px-6 py-4 text-center">
                  <span className="text-[13px] font-semibold text-neutral-900">{member.tasksAssigned}</span>
                </td>

                {/* Rooms Cleaned */}
                <td className="px-6 py-4 text-center">
                  <span className="text-[13px] font-semibold text-sage-600">{member.tasksCompleted}</span>
                </td>

                {/* Avg Time */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span className="text-[13px] text-neutral-700 font-medium">{member.avgCleaningTime || 25}m</span>
                  </div>
                </td>

                {/* Efficiency */}
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                    member.efficiency >= 90
                      ? 'bg-sage-50 text-sage-700'
                      : member.efficiency >= 75
                        ? 'bg-gold-50 text-gold-700'
                        : 'bg-rose-50 text-rose-700'
                  }`}>
                    {member.efficiency}%
                  </span>
                </td>

                {/* Delays */}
                <td className="px-6 py-4 text-center">
                  {member.delays > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700">
                      <AlertTriangle className="w-3 h-3" />
                      {member.delays}
                    </span>
                  ) : (
                    <span className="text-[13px] text-sage-600 font-medium">0</span>
                  )}
                </td>

                {/* Rating */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= member.rating
                            ? 'text-gold-500 fill-gold-500'
                            : 'text-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                </td>

                {/* Sparkline Trend */}
                <td className="px-6 py-4">
                  <div className="w-20 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData[member.id]}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={member.efficiency >= 85 ? '#5C9BA4' : member.efficiency >= 70 ? '#CDB261' : '#C25B5B'}
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
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No staff data available</h3>
          <p className="text-sm text-neutral-600">Staff performance will appear here</p>
        </div>
      )}
    </div>
  );
}
