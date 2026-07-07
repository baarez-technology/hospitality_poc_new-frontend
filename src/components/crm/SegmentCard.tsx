import { Users, TrendingUp, RefreshCw, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/crm';

export default function SegmentCard({ segment, onClick }) {
  const filters = segment.filters || {};
  const filterBadges = Object.entries(filters)
    .filter(([, value]) => value && value !== 'all')
    .map(([key, value]) => {
      let label = '';
      switch (key) {
        case 'loyaltyTier':
          label = `Tier: ${value}`;
          break;
        case 'minStays':
          label = `≥${value} stays`;
          break;
        case 'maxStays':
          label = `≤${value} stays`;
          break;
        case 'bookingSource':
          label = `Source: ${value}`;
          break;
        case 'minSpend':
          label = `≥${formatCurrency(value)}`;
          break;
        case 'maxSpend':
          label = `≤${formatCurrency(value)}`;
          break;
        case 'lastStayDays':
          label = `Last ${value} days`;
          break;
        case 'country':
          label = `Country: ${value}`;
          break;
        case 'roomType':
          label = `Room: ${value}`;
          break;
        case 'tags':
          label = Array.isArray(value) ? value.join(', ') : value;
          break;
        default:
          label = `${key}: ${value}`;
      }
      return { key, label };
    });

  const segmentColor = segment.color || '#A57865';

  return (
    <div
      className="bg-white rounded-[10px] border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-all cursor-pointer group p-4"
      onClick={() => onClick(segment)}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${segmentColor}15` }}
        >
          <Users
            className="w-5 h-5"
            style={{ color: segmentColor }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-semibold text-neutral-900 group-hover:text-[#A57865] transition-colors truncate">
            {segment.name}
          </h3>
          <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{segment.description}</p>
        </div>
      </div>

      {/* Filter Badges */}
      {filterBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {filterBadges.slice(0, 3).map(({ key, label }) => (
            <span
              key={key}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200"
            >
              {label}
            </span>
          ))}
          {filterBadges.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-500">
              +{filterBadges.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="bg-neutral-50 rounded-[8px] p-3 mb-3 border border-neutral-100">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="w-7 h-7 rounded-[6px] bg-[#A57865]/10 flex items-center justify-center mx-auto mb-1.5">
              <Users className="w-3.5 h-3.5 text-[#A57865]" />
            </div>
            <p className="text-[15px] font-bold text-neutral-900">{segment.guestCount || 0}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Guests</p>
          </div>
          <div className="text-center border-x border-neutral-200">
            <div className="w-7 h-7 rounded-[6px] bg-[#4E5840]/10 flex items-center justify-center mx-auto mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#4E5840]" />
            </div>
            <p className="text-[15px] font-bold text-neutral-900">{formatCurrency(segment.avgRevenue || 0)}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Avg Revenue</p>
          </div>
          <div className="text-center">
            <div className="w-7 h-7 rounded-[6px] bg-[#5C9BA4]/10 flex items-center justify-center mx-auto mb-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#5C9BA4]" />
            </div>
            <p className="text-[15px] font-bold text-neutral-900">{segment.repeatRate || 0}%</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Repeat Rate</p>
          </div>
        </div>
      </div>

      {/* View Button */}
      <button
        className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#A57865] text-white rounded-[8px] text-[12px] font-semibold hover:bg-[#8E6554] transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        View Segment
      </button>
    </div>
  );
}
