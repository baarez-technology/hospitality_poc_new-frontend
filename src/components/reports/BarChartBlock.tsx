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
      <div className="bg-white rounded-lg p-3 shadow-lg border border-neutral-100">
        <p className="text-[11px] text-neutral-400 mb-2 font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-[13px] font-semibold" style={{ color: entry.color }}>
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
    <div className="rounded-[10px] bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-50">
            <Icon className="w-4 h-4 text-neutral-500" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
          {subtitle && <p className="text-[11px] text-neutral-400 font-medium">{subtitle}</p>}
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
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={!isHorizontal} vertical={isHorizontal} />
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
