import { Crown, Mail, Phone, Calendar, DollarSign, Award, TrendingUp } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function TopGuests({ guests }) {
  const { symbol } = useCurrency();
  const getTierBadge = (tier) => {
    const styles = {
      Platinum: 'bg-purple-100 text-purple-700 border-purple-200',
      Gold: 'bg-amber-100 text-amber-700 border-amber-200',
      Silver: 'bg-neutral-100 text-neutral-700 border-neutral-200'
    };
    return styles[tier] || styles.Silver;
  };

  const getTierIcon = (tier) => {
    if (tier === 'Platinum') return '💎';
    if (tier === 'Gold') return '👑';
    return '⭐';
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-sunset-100 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Top Guests</h3>
            <p className="text-sm text-neutral-600">Highest lifetime value guests</p>
          </div>
        </div>
        <button className="text-sm text-[#A57865] hover:text-[#A57865] font-medium">
          View All
        </button>
      </div>

      {/* Top 5 Guests List */}
      <div className="space-y-4">
        {guests.slice(0, 5).map((guest) => (
          <div
            key={guest.id}
            className="p-4 rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow transition-all cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  guest.rank === 1 ? 'bg-amber-100 text-amber-700' :
                  guest.rank === 2 ? 'bg-neutral-200 text-neutral-700' :
                  guest.rank === 3 ? 'bg-orange-100 text-orange-700' :
                  'bg-neutral-100 text-neutral-600'
                }`}>
                  {guest.rank}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-neutral-900">{guest.guestName}</p>
                    <span className="text-lg">{getTierIcon(guest.tier)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">{guest.guestId}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getTierBadge(guest.tier)}`}>
                      {guest.tier}
                    </span>
                  </div>
                </div>
              </div>

              {/* Satisfaction Score */}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-[#4E5840]" />
                  <span className="text-sm font-bold text-[#4E5840]">{guest.satisfaction}%</span>
                </div>
                <p className="text-xs text-neutral-500">Satisfaction</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-2 bg-[#FAF8F6] rounded-lg">
                <p className="text-lg font-bold text-[#A57865]">
                  {symbol}{(guest.lifetimeValue / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-neutral-600">LTV</p>
              </div>
              <div className="text-center p-2 bg-[#FAF8F6] rounded-lg">
                <p className="text-lg font-bold text-blue-600">{guest.totalBookings}</p>
                <p className="text-xs text-neutral-600">Bookings</p>
              </div>
              <div className="text-center p-2 bg-[#FAF8F6] rounded-lg">
                <p className="text-lg font-bold text-[#4E5840]">
                  {symbol}{(guest.averageSpend / 100).toFixed(1) * 100}
                </p>
                <p className="text-xs text-neutral-600">Avg Spend</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-neutral-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>Last stay: {new Date(guest.lastStay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {guest.nextBooking !== 'TBD' && (
                <div className="flex items-center gap-2 text-[#4E5840]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Next: {new Date(guest.nextBooking).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-neutral-600">
                <Award className="w-3.5 h-3.5" />
                <span>Preferred: {guest.preferredRoom}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 pt-3 border-t border-neutral-200 flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium transition-colors">
                <Mail className="w-3.5 h-3.5" />
                Email
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium transition-colors">
                <Phone className="w-3.5 h-3.5" />
                Call
              </button>
              <button className="flex-1 px-3 py-1.5 bg-[#8E6554] hover:bg-[#A57865] text-white rounded-lg text-xs font-semibold transition-colors">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#A57865]">{symbol}286k</p>
          <p className="text-xs text-neutral-600 mt-1">Combined LTV</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#4E5840]">95.1%</p>
          <p className="text-xs text-neutral-600 mt-1">Avg Satisfaction</p>
        </div>
      </div>
    </div>
  );
}
