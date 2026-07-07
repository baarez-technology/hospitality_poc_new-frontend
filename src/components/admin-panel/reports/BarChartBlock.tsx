import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label, valueFormatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-3 shadow-lg">
        <p className="text-xs text-neutral-500 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BarChartBlock({
  title,
  subtitle,
  data,
  bars,
  xAxisKey = 'name',
  height = 280,
  valueFormatter,
  yAxisFormatter,
  icon: Icon,
  iconColor = '#4E5840',
  layout = 'vertical',
  stacked = false,
  showLegend = true
}) {
  const chartData = useMemo(() => {
    if (data[0]?.[xAxisKey] && data[0][xAxisKey].includes('-')) {
      return data.map((item) => ({
        ...item,
        [xAxisKey]: new Date(item[xAxisKey]).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      }));
    }
    return data;
  }, [data, xAxisKey]);

  const isHorizontal = layout === 'horizontal';

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout={isHorizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 10, right: 10, left: isHorizontal ? 80 : 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" horizontal={!isHorizontal} vertical={isHorizontal} />
            {isHorizontal ? (
              <>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E5E5' }} tickLine={false} tickFormatter={yAxisFormatter} />
                <YAxis dataKey={xAxisKey} type="category" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={70} />
              </>
            ) : (
              <>
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E5E5' }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={yAxisFormatter} />
              </>
            )}
            <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
            {showLegend && bars.length > 1 && (
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-xs text-neutral-600">{value}</span>
                )}
              />
            )}
            {bars.map((bar, index) => (
              <Bar
                key={index}
                dataKey={bar.dataKey}
                name={bar.name}
                fill={bar.color}
                radius={[4, 4, 0, 0]}
                stackId={stacked ? 'stack' : undefined}
              >
                {bar.cellColors && chartData.map((entry, idx) => (
                  <Cell key={idx} fill={bar.cellColors[idx % bar.cellColors.length]} />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
