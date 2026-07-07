import { Clock, Crown, CheckCircle, AlertCircle, Phone, MessageSquare } from 'lucide-react';

const statusConfig = {
  confirmed: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    icon: CheckCircle,
    label: 'Confirmed',
    hoverBg: 'hover:bg-teal-100',
  },
  pending: {
    bg: 'bg-sand-50',
    text: 'text-sand-700',
    border: 'border-sand-200',
    icon: Clock,
    label: 'Pending',
    hoverBg: 'hover:bg-sand-100',
  },
  completed: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-600',
    border: 'border-neutral-200',
    icon: CheckCircle,
    label: 'Completed',
    hoverBg: 'hover:bg-neutral-200',
  },
  late: {
    bg: 'bg-primary-50',
    text: 'text-primary-700',
    border: 'border-primary-200',
    icon: AlertCircle,
    label: 'Late Checkout',
    hoverBg: 'hover:bg-primary-100',
  },
};

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function TodaysDepartures({ departures, onGuestClick }) {
  const pendingCount = departures.filter(d => d.status === 'pending').length;
  const lateCount = departures.filter(d => d.status === 'late').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200/80 hover:shadow-md transition-all duration-200">
      {/* Enhanced Header with Quick Stats */}
      <div className="p-6 pb-4 border-b border-neutral-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-forest-900">
              Today's Departures
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              {departures.length} guests checking out
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-sand-50 border border-sand-200 rounded-full">
                <Clock className="w-3 h-3 text-sand-600" />
                <span className="text-xs font-bold text-sand-700">{pendingCount}</span>
              </div>
            )}
            {lateCount > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-primary-50 border border-primary-200 rounded-full">
                <AlertCircle className="w-3 h-3 text-primary-600" />
                <span className="text-xs font-bold text-primary-700">{lateCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Departure Cards */}
      <div className="p-5 pb-6" style={{ maxHeight: '280px', overflowY: 'auto' }}>
        <div className="space-y-2">
          {departures.map((departure) => {
            const StatusIcon = statusConfig[departure.status].icon;
            const config = statusConfig[departure.status];

            return (
              <div
                key={departure.id}
                className="group relative p-3.5 bg-neutral-50 rounded-lg hover:bg-white border border-transparent hover:border-forest-100 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {/* Main Content */}
                <div className="flex items-center justify-between mb-2">
                  {/* Left Side - Guest Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 bg-forest-500 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-forest-600 transition-colors shadow-sm cursor-pointer"
                      onClick={() => onGuestClick && onGuestClick(departure.guestName)}
                    >
                      <span className="text-white font-bold text-sm">
                        {departure.guestName.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className="font-semibold text-forest-900 text-sm group-hover:text-forest-700 transition-colors truncate"
                          onClick={() => onGuestClick && onGuestClick(departure.guestName)}
                        >
                          {departure.guestName}
                        </h4>
                        {departure.vip && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gold-50 border border-gold-200 rounded-md">
                            <Crown className="w-3 h-3 text-gold-600 flex-shrink-0" />
                            <span className="text-[9px] font-bold text-gold-700 uppercase">VIP</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <span className="font-medium">Room {departure.room}</span>
                        <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(departure.checkOut)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Status Badge */}
                  <div className="flex-shrink-0 ml-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-colors ${
                        config.bg
                      } ${config.text} ${config.border} ${config.hoverBg}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Quick Actions - Shown on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mt-2 pt-2 border-t border-neutral-200">
                  <button
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-forest-600 hover:text-forest-700 bg-forest-50 hover:bg-forest-100 rounded-md transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Call guest:', departure.guestName);
                    }}
                  >
                    <Phone className="w-3 h-3" />
                    Call
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Message guest:', departure.guestName);
                    }}
                  >
                    <MessageSquare className="w-3 h-3" />
                    Message
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onGuestClick && onGuestClick(departure.guestName);
                    }}
                  >
                    View Details →
                  </button>
                </div>

                {/* Subtle border accent for late checkouts */}
                {departure.status === 'late' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-l-lg"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State (if no departures) */}
      {departures.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-600">No departures today</p>
          <p className="text-xs text-neutral-500 mt-1">All guests have checked out</p>
        </div>
      )}
    </div>
  );
}
