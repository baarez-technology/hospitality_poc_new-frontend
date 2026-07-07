import { Clock, MapPin, User, Calendar } from 'lucide-react';
import { formatDate, formatCurrency, formatDate as formatTime } from '@/utils/admin/formatters';

const TableCard = ({ title, subtitle, data, type = 'arrivals' }) => {
  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-[#4E5840]/10 text-[#4E5840] border-[#4E5840]/30',
      pending: 'bg-[#5C9BA4]/10 text-[#5C9BA4] border-[#5C9BA4]/30',
      'checked-out': 'bg-neutral-100 text-neutral-600 border-neutral-200',
      'pending-checkout': 'bg-[#CDB261]/20 text-[#CDB261] border-[#CDB261]/30',
      'late-checkout': 'bg-[#CDB261]/20 text-[#CDB261] border-[#CDB261]/30',
      'in-house': 'bg-[#4E5840]/10 text-[#4E5840] border-midnight-200',
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      <div className="mb-6">
        <h3 className="text-lg font-serif font-bold text-neutral-900">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-[#FAF8F6] rounded-xl hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#A57865] rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">
                    {item.guestName}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-neutral-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Room {item.room}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.nights} {item.nights === 1 ? 'night' : 'nights'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-neutral-900 mb-1">
                  {formatCurrency(item.amount)}
                </div>
                <span
                  className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                    item.status
                  )}`}
                >
                  {getStatusLabel(item.status)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600">{item.roomType}</span>
              {type === 'arrivals' && item.checkIn && (
                <div className="flex items-center gap-1 text-neutral-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(item.checkIn).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
              )}
              {item.specialRequests && (
                <span className="text-[#5C9BA4] italic">
                  {item.specialRequests}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm">No {type} scheduled</p>
        </div>
      )}
    </div>
  );
};

export default TableCard;
