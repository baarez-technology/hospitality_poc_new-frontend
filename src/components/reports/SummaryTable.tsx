import { ChevronUp, ChevronDown, Minus } from 'lucide-react';

const getTrendIcon = (trend) => {
  if (trend > 0) return ChevronUp;
  if (trend < 0) return ChevronDown;
  return Minus;
};

const getTrendColor = (trend, inverse = false) => {
  if (inverse) {
    if (trend > 0) return 'text-gold-600';
    if (trend < 0) return 'text-sage-600';
  }
  if (trend > 0) return 'text-sage-600';
  if (trend < 0) return 'text-gold-600';
  return 'text-neutral-500';
};

export default function SummaryTable({
  title,
  subtitle,
  columns,
  data,
  icon: Icon,
  iconColor = '#A57865',
  maxRows = 10,
  showIndex = false
}) {
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              {showIndex && (
                <th className="text-left py-3 px-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
                  #
                </th>
              )}
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`py-3 px-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-widest ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, maxRows).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50/50 transition-colors"
              >
                {showIndex && (
                  <td className="py-3 px-2 text-[13px] text-neutral-400">
                    {rowIndex + 1}
                  </td>
                )}
                {columns.map((col, colIndex) => {
                  const value = row[col.key];
                  const TrendIcon = col.showTrend ? getTrendIcon(value) : null;
                  const trendColor = col.showTrend ? getTrendColor(value, col.inverseTrend) : '';

                  return (
                    <td
                      key={colIndex}
                      className={`py-3 px-2 text-[13px] ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {col.showTrend ? (
                        <div className={`flex items-center gap-1 ${trendColor} ${col.align === 'right' ? 'justify-end' : ''}`}>
                          <TrendIcon className="w-3 h-3" />
                          <span className="font-medium">
                            {value > 0 ? '+' : ''}{col.formatter ? col.formatter(value) : value}
                          </span>
                        </div>
                      ) : col.render ? (
                        col.render(value, row)
                      ) : (
                        <span className={col.highlight ? 'font-semibold text-neutral-900' : 'text-neutral-600'}>
                          {col.formatter ? col.formatter(value) : value}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > maxRows && (
        <p className="text-[11px] text-neutral-400 mt-4 text-center font-medium">
          Showing {maxRows} of {data.length} entries
        </p>
      )}
    </div>
  );
}
