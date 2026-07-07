import { Crown } from 'lucide-react';
import { statusConfig, sourceConfig } from '@/data/bookingsData';
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
    // Append T12:00:00 to date-only strings to prevent UTC midnight timezone shift
    const safe = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
    const date = new Date(safe);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return `${symbol}0`;
    return formatCurrency(Number(amount));
  };

  // Normalize status to uppercase for lookup
  // C-06: Show "Guaranteed" for confirmed bookings with future arrival date
  let normalizedStatus = booking.status?.toUpperCase?.() || 'UNKNOWN';
  if (normalizedStatus === 'CONFIRMED' && booking.checkIn) {
    const today = new Date().toISOString().split('T')[0];
    if (booking.checkIn > today) {
      normalizedStatus = 'GUARANTEED';
    }
  }
  const status = statusConfig[normalizedStatus] || statusConfig[booking.status] || defaultStatus;

  // Normalize source for lookup
  const normalizedSource = booking.source || 'Website';
  const source = sourceConfig[normalizedSource] || defaultSource;

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[170px_110px_120px_70px_150px_110px_110px_120px] gap-4 items-center h-16 px-5 hover:bg-neutral-50 cursor-pointer transition-all duration-150 border-b border-neutral-100 last:border-b-0 group"
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
        {booking.bookingNumber || booking.id}
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
      <div className="text-sm font-bold text-neutral-900 text-right">
        {formatAmount(booking.totalPrice || booking.total || booking.amount)}
      </div>
    </div>
  );
}
