import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

const COLORS = ['#A57865', '#4E5840', '#5C9BA4', '#CDB261', '#C8B29D', '#8B7355'];

const CustomTooltip = ({ active, payload, valueFormatter }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white rounded-lg p-3 shadow-lg border border-neutral-100">
        <p className="text-[13px] font-semibold" style={{ color: data.payload.fill }}>
          {data.name}: {valueFormatter ? valueFormatter(data.value) : data.value}
        </p>
        <p className="text-[11px] text-neutral-400 font-medium">{data.payload.percent}%</p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function PieChartBlock({
  title,
  subtitle,
  data,
  dataKey = 'value',
  nameKey = 'name',
  height = 280,
  valueFormatter,
  icon: Icon,
  iconColor = '#A57865',
  colors = COLORS,
  showLegend = true,
  innerRadius = 0,
  showLabels = true
}) {
  const chartData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item[dataKey], 0);
    return data.map((item, index) => ({
      ...item,
      percent: ((item[dataKey] / total) * 100).toFixed(1),
      fill: colors[index % colors.length]
    }));
  }, [data, dataKey, colors]);

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
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={80}
              paddingAngle={2}
              dataKey={dataKey}
              nameKey={nameKey}
              label={showLabels ? renderCustomLabel : false}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
            {showLegend && (
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value, entry) => (
                  <span className="text-xs text-neutral-600">
                    {value} ({entry.payload.percent}%)
                  </span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
