import { Users, TrendingUp, RefreshCw, Eye } from 'lucide-react';
import { formatCurrency } from '@/utils/admin/crm';

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

  return (
    <div
      className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={() => onClick(segment)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${segment.color || '#A57865'}20` }}
          >
            <Users
              className="w-6 h-6"
              style={{ color: segment.color || '#A57865' }}
            />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 group-hover:text-[#A57865] transition-colors">
              {segment.name}
            </h3>
            <p className="text-sm text-neutral-500">{segment.description}</p>
          </div>
        </div>
      </div>

      {/* Filter Badges */}
      {filterBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filterBadges.map(({ key, label }) => (
            <span
              key={key}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#FAF7F4] rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[#A57865] mb-1">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-neutral-900">{segment.guestCount || 0}</p>
          <p className="text-xs text-neutral-500">Guests</p>
        </div>
        <div className="bg-[#FAF7F4] rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[#4E5840] mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-neutral-900">{formatCurrency(segment.avgRevenue || 0)}</p>
          <p className="text-xs text-neutral-500">Avg Revenue</p>
        </div>
        <div className="bg-[#FAF7F4] rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[#5C9BA4] mb-1">
            <RefreshCw className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-neutral-900">{segment.repeatRate || 0}%</p>
          <p className="text-xs text-neutral-500">Repeat Rate</p>
        </div>
      </div>

      {/* View Button */}
      <button
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#A57865]/10 text-[#A57865] rounded-lg text-sm font-medium hover:bg-[#A57865] hover:text-white transition-colors"
      >
        <Eye className="w-4 h-4" />
        View Segment
      </button>
    </div>
  );
}
