import { Crown, Eye, Pencil, MoreHorizontal } from 'lucide-react';
import { statusConfig, sourceConfig } from '../../data/bookingsData';
import { useCurrency } from '@/hooks/useCurrency';

// Default fallback configs
const defaultStatus = {
  color: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  label: 'Unknown',
};

const defaultSource = {
  color: 'bg-neutral-100 text-neutral-700',
  icon: '📋',
};

export default function BookingRow({ booking, onClick }) {
  const { formatCurrency, symbol } = useCurrency();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return `${symbol}0`;
    return formatCurrency(Number(amount));
  };

  // Normalize status to uppercase for lookup
  const normalizedStatus = booking.status?.toUpperCase?.()?.replace(/[\s_]/g, '-') || 'CONFIRMED';
  const status = statusConfig[normalizedStatus] || statusConfig[booking.status] || defaultStatus;

  // Normalize source for lookup - preserve original source if not in config
  const normalizedSource = booking.source || '';
  const source = normalizedSource && sourceConfig[normalizedSource] 
    ? sourceConfig[normalizedSource] 
    : (normalizedSource ? { color: 'bg-[#7B68EE]/10 text-[#7B68EE]', icon: '💻', label: normalizedSource } : defaultSource);

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    // Handle action here
    console.log(`${action} clicked for booking ${booking.id}`);
  };

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[180px_120px_120px_80px_160px_120px_120px_100px_120px] gap-5 items-center py-3 px-6 hover:bg-neutral-50 cursor-pointer transition-all duration-150 border-b border-neutral-100 last:border-b-0 group"
    >
      {/* Guest Name */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold text-neutral-900 truncate group-hover:text-[#A57865] transition-colors">
          {booking.guest}
        </span>
        {booking.vip && (
          <Crown className="w-4 h-4 text-[#CDB261] flex-shrink-0" />
        )}
      </div>

      {/* Booking ID */}
      <div className="text-xs text-neutral-500 font-mono truncate">
        {booking.id}
      </div>

      {/* Check-in Date */}
      <div className="text-sm text-neutral-700 font-medium">
        {formatDate(booking.checkIn)}
      </div>

      {/* Nights */}
      <div className="text-sm text-neutral-600">
        {booking.nights}n
      </div>

      {/* Room */}
      <div className="text-sm min-w-0">
        {booking.room ? (
          <>
            <span className="font-semibold text-neutral-900">Room {booking.room}</span>
            <span className="text-neutral-400 text-xs ml-1.5">• {booking.roomType}</span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              Pending Assignment
            </span>
            <span className="text-neutral-400 text-xs ml-1.5">• {booking.roomType}</span>
          </>
        )}
      </div>

      {/* Status */}
      <div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Source */}
      <div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${source.color}`}>
          <span className="mr-1">{source.icon}</span>
          {booking.source}
        </span>
      </div>

      {/* Amount */}
      <div className="text-sm font-bold text-neutral-900">
        {formatAmount(booking.totalPrice || booking.amount)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 justify-end">
        <button
          onClick={(e) => handleActionClick(e, 'view')}
          className="p-1.5 text-neutral-400 hover:text-[#A57865] hover:bg-[#A57865]/10 rounded-md transition-colors"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => handleActionClick(e, 'edit')}
          className="p-1.5 text-neutral-400 hover:text-[#5C9BA4] hover:bg-[#5C9BA4]/10 rounded-md transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => handleActionClick(e, 'more')}
          className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
          title="More"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
