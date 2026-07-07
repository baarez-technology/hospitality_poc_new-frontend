import { ChevronUp, ChevronDown, Minus } from 'lucide-react';

const getTrendIcon = (trend) => {
  if (trend > 0) return ChevronUp;
  if (trend < 0) return ChevronDown;
  return Minus;
};

const getTrendColor = (trend, inverse = false) => {
  if (inverse) {
    if (trend > 0) return 'text-[#CDB261]';
    if (trend < 0) return 'text-[#4E5840]';
  }
  if (trend > 0) return 'text-[#4E5840]';
  if (trend < 0) return 'text-[#CDB261]';
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5]">
              {showIndex && (
                <th className="text-left py-3 px-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  #
                </th>
              )}
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`py-3 px-2 text-xs font-medium text-neutral-500 uppercase tracking-wider ${
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
                className="border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#FAF7F4] transition-colors"
              >
                {showIndex && (
                  <td className="py-3 px-2 text-sm text-neutral-400">
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
                      className={`py-3 px-2 text-sm ${
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
        <p className="text-xs text-neutral-400 mt-4 text-center">
          Showing {maxRows} of {data.length} entries
        </p>
      )}
    </div>
  );
}
