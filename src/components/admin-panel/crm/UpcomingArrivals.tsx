import { Calendar, Clock, Bed, DollarSign, Star, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../ui2/Button';

export default function UpcomingArrivals({ arrivals }) {
  // Safety check for empty or undefined arrivals
  if (!arrivals || arrivals.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-aurora-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#4E5840]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Upcoming Arrivals</h3>
            <p className="text-sm text-neutral-600">Guests checking in soon</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-[200px] text-neutral-500">
          No upcoming arrivals
        </div>
      </div>
    );
  }

  const getTierBadge = (tier) => {
    const styles = {
      Platinum: 'bg-purple-100 text-purple-700 border-purple-200',
      Gold: 'bg-amber-100 text-amber-700 border-amber-200',
      Silver: 'bg-neutral-100 text-neutral-700 border-neutral-200',
      Member: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return styles[tier] || styles.Member;
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-[#4E5840] border-[#4E5840]/30',
      vip: 'bg-purple-100 text-purple-700 border-purple-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return styles[status] || styles.confirmed;
  };

  const getStatusIcon = (status) => {
    if (status === 'vip') return <Star className="w-3 h-3" />;
    if (status === 'confirmed') return <CheckCircle className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Show next 5 arrivals
  const displayArrivals = arrivals.slice(0, 5);

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-aurora-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#4E5840]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Upcoming Arrivals</h3>
            <p className="text-sm text-neutral-600">Guests checking in soon</p>
          </div>
        </div>
        <button className="text-sm text-[#A57865] hover:text-[#A57865] font-medium">
          View All
        </button>
      </div>

      {/* Arrivals List */}
      <div className="space-y-4">
        {displayArrivals.map((arrival) => (
          <div
            key={arrival.id}
            className="p-4 rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-neutral-900">{arrival.guestName}</p>
                  {arrival.isFirstTime && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">{arrival.guestId}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getTierBadge(arrival.tier)}`}>
                    {arrival.tier}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border flex items-center gap-1 ${getStatusBadge(arrival.status)}`}>
                    {getStatusIcon(arrival.status)}
                    {arrival.status}
                  </span>
                </div>
              </div>

              {/* ETA Badge */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-[#A57865]">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">{arrival.eta}</span>
                </div>
                <p className="text-xs text-neutral-500">ETA</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center gap-2 p-2 bg-[#FAF8F6] rounded-lg">
                <Calendar className="w-4 h-4 text-neutral-600" />
                <div>
                  <p className="text-xs text-neutral-600">Check-in</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {formatDate(arrival.checkIn)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-[#FAF8F6] rounded-lg">
                <Bed className="w-4 h-4 text-neutral-600" />
                <div>
                  <p className="text-xs text-neutral-600">Room</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {arrival.roomType}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-1.5 text-xs mb-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Nights:</span>
                <span className="font-semibold text-neutral-900">{arrival.nights} nights</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Total:</span>
                <span className="font-semibold text-[#4E5840]">
                  ${arrival.totalAmount ? arrival.totalAmount.toLocaleString() : '0'}
                </span>
              </div>
              {arrival.previousStays > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Previous stays:</span>
                  <span className="font-semibold text-[#A57865]">{arrival.previousStays}</span>
                </div>
              )}
            </div>

            {/* Special Requests */}
            {arrival.specialRequests && arrival.specialRequests.length > 0 && (
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-amber-900 mb-1">Special Requests:</p>
                    <div className="flex flex-wrap gap-1">
                      {arrival.specialRequests.slice(0, 3).map((request, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                          {request}
                        </span>
                      ))}
                      {arrival.specialRequests.length > 3 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                          +{arrival.specialRequests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {arrival.notes && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900">
                  <span className="font-semibold">Note:</span> {arrival.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 pt-3 border-t border-neutral-200 flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1">
                Assign Room
              </Button>
              <Button variant="primary" size="sm" className="flex-1">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#A57865]">34</p>
          <p className="text-xs text-neutral-600 mt-1">This Week</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#4E5840]">3</p>
          <p className="text-xs text-neutral-600 mt-1">Today</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">2</p>
          <p className="text-xs text-neutral-600 mt-1">VIP Arrivals</p>
        </div>
      </div>
    </div>
  );
}
