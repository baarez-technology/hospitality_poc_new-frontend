import { Clock, Crown, CheckCircle, AlertCircle, LogIn, LogOut } from 'lucide-react';

const statusConfig = {
  confirmed: {
    bg: 'bg-[#4E5840]/10',
    text: 'text-[#4E5840]',
    border: 'border-[#4E5840]/20',
    icon: CheckCircle,
    label: 'Confirmed',
  },
  pending: {
    bg: 'bg-[#CDB261]/10',
    text: 'text-[#CDB261]',
    border: 'border-[#CDB261]/20',
    icon: Clock,
    label: 'Pending',
  },
  completed: {
    bg: 'bg-[#4E5840]/10',
    text: 'text-[#4E5840]',
    border: 'border-[#4E5840]/20',
    icon: CheckCircle,
    label: 'Completed',
  },
  late: {
    bg: 'bg-[#CDB261]/10',
    text: 'text-[#CDB261]',
    border: 'border-[#CDB261]/20',
    icon: AlertCircle,
    label: 'Late',
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

export default function ArrivalsDepartures({ arrivals, departures, onGuestClick }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Arrivals */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/60 hover:border-[#A57865]/30 transition-all duration-300 ease-out group">
        <div className="mb-6 flex items-start gap-3">
          <div className="p-2 bg-[#A57865]/10 rounded-lg group-hover:scale-105 transition-transform duration-200">
            <LogIn className="w-4 h-4 text-[#A57865]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              Today's Arrivals
            </h3>
            <p className="text-xs text-neutral-600 font-medium">
              {arrivals.length} guests expected to check in
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {arrivals.map((arrival) => {
            const StatusIcon = statusConfig[arrival.status].icon;

            return (
              <div
                key={arrival.id}
                className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 hover:border-[#A57865]/30 border border-transparent transition-all duration-200 ease-out cursor-pointer group/item"
              >
                <div className="flex items-center justify-between w-full">
                  {/* Left Side */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-[#A57865] rounded-lg flex items-center justify-center flex-shrink-0 group-hover/item:scale-105 transition-all duration-200">
                      <span className="text-white font-bold text-xs">
                        {arrival.guestName?.split(' ').map((n) => n[0]).join('') || 'G'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className="font-bold text-neutral-900 text-sm group-hover/item:text-[#A57865] transition-colors cursor-pointer truncate"
                          onClick={(e) => {
                            e.stopPropagation();
                            onGuestClick && onGuestClick(arrival.guestName);
                          }}
                        >
                          {arrival.guestName}
                        </h4>
                        {arrival.vip && (
                          <Crown className="w-3.5 h-3.5 text-[#CDB261] flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
                        <span className="font-semibold">Room {arrival.room}</span>
                        <span>•</span>
                        <span className="truncate">{arrival.roomType}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{formatTime(arrival.checkIn)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border uppercase tracking-wide ${
                        statusConfig[arrival.status].bg
                      } ${statusConfig[arrival.status].text} ${
                        statusConfig[arrival.status].border
                      }`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[arrival.status].label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Departures */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200/60 hover:border-[#A57865]/30 transition-all duration-300 ease-out group">
        <div className="mb-6 flex items-start gap-3">
          <div className="p-2 bg-[#A57865]/10 rounded-lg group-hover:scale-105 transition-transform duration-200">
            <LogOut className="w-4 h-4 text-[#A57865]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              Today's Departures
            </h3>
            <p className="text-xs text-neutral-600 font-medium">
              {departures.length} guests checking out
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {departures.map((departure) => {
            const StatusIcon = statusConfig[departure.status].icon;

            return (
              <div
                key={departure.id}
                className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 hover:border-[#A57865]/30 border border-transparent transition-all duration-200 ease-out cursor-pointer group/item"
              >
                <div className="flex items-center justify-between w-full">
                  {/* Left Side */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-[#4E5840] rounded-lg flex items-center justify-center flex-shrink-0 group-hover/item:scale-105 transition-all duration-200">
                      <span className="text-white font-bold text-xs">
                        {departure.guestName?.split(' ').map((n) => n[0]).join('') || 'G'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-neutral-900 text-sm group-hover/item:text-[#A57865] transition-colors mb-1 truncate">
                        {departure.guestName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
                        <span className="font-semibold">Room {departure.room}</span>
                        <span>•</span>
                        <span className="truncate">{departure.roomType}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{formatTime(departure.checkOut)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border uppercase tracking-wide ${
                        statusConfig[departure.status].bg
                      } ${statusConfig[departure.status].text} ${
                        statusConfig[departure.status].border
                      }`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[departure.status].label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
