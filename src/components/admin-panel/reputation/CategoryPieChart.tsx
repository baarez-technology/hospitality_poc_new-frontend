import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChartIcon } from 'lucide-react';
import { countByCategory } from '@/utils/admin/reputation';

export default function CategoryPieChart({ reviews }) {
  const categoryData = useMemo(() => {
    const data = countByCategory(reviews);
    // Filter out categories with 0 count for cleaner chart
    return data.filter(d => d.count > 0);
  }, [reviews]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-neutral-200">
          <p className="text-sm font-semibold text-neutral-900">{data.label}</p>
          <p className="text-sm text-neutral-600">
            {data.count} reviews ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#CDB261]/10 flex items-center justify-center">
          <PieChartIcon className="w-5 h-5 text-[#CDB261]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Issue Categories</h3>
          <p className="text-xs text-neutral-500">Distribution of review topics</p>
        </div>
      </div>

      {categoryData.length > 0 ? (
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Pie Chart */}
          <div className="h-[250px] w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  innerRadius={40}
                  dataKey="count"
                  paddingAngle={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-3">
            {categoryData.map((cat) => (
              <div
                key={cat.value}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{cat.label}</p>
                  <p className="text-xs text-neutral-500">
                    {cat.count} ({cat.percentage}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[250px] flex items-center justify-center">
          <p className="text-neutral-500">No category data available</p>
        </div>
      )}
    </div>
  );
}
