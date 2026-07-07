import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StatusBadge } from '../ui/Badge';
import { formatCurrency } from '../../utils/dashboardUtils';

/**
 * RecentBookings - Premium table with guest avatars
 * Features: Colored avatars, hover states, status badges, responsive
 */

const avatarColors = [
  'bg-terra-500',
  'bg-gold-500',
  'bg-ocean-500',
  'bg-sage-500',
  'bg-rose-500',
];

function BookingRow({ booking, index }) {
  const initials = (booking.guest || '').split(' ').filter(n => n).map(n => n[0]).join('').slice(0, 2) || 'G';
  const avatarColor = avatarColors[index % avatarColors.length];

  return (
    <tr className="group hover:bg-gradient-to-r hover:from-terra-50/50 hover:to-transparent transition-colors">
      {/* Guest */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            "text-white text-sm font-semibold",
            "shadow-sm transition-transform duration-300",
            "group-hover:scale-110 group-hover:shadow-md",
            avatarColor
          )}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">{booking.guest}</p>
            <p className="text-xs text-neutral-400 font-mono">{booking.id}</p>
          </div>
        </div>
      </td>

      {/* Room */}
      <td className="py-4 px-6">
        <p className="text-sm font-medium text-neutral-900">{booking.room}</p>
        <p className="text-xs text-neutral-400">{booking.roomType}</p>
      </td>

      {/* Check-in */}
      <td className="py-4 px-6">
        <p className="text-sm text-neutral-600">
          {new Date(booking.checkIn).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </td>

      {/* Check-out */}
      <td className="py-4 px-6">
        <p className="text-sm text-neutral-600">
          {new Date(booking.checkOut).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </td>

      {/* Source */}
      <td className="py-4 px-6">
        <span className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-lg",
          "text-xs font-medium",
          "bg-neutral-100 text-neutral-600"
        )}>
          {booking.source || 'Direct'}
        </span>
      </td>

      {/* Amount */}
      <td className="py-4 px-6 text-right">
        <p className="text-sm font-semibold text-neutral-900">
          {formatCurrency(booking.totalAmount || 324)}
        </p>
      </td>

      {/* Status */}
      <td className="py-4 px-6">
        <StatusBadge status={booking.status} />
      </td>

      {/* Action */}
      <td className="py-4 px-6">
        <button className={cn(
          "p-2 rounded-lg",
          "text-neutral-400 hover:text-terra-600",
          "hover:bg-terra-50",
          "opacity-0 group-hover:opacity-100",
          "transition-all duration-300"
        )}>
          <ExternalLink className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

export default function RecentBookings({ bookings, className }) {
  const navigate = useNavigate();

  const headers = ['Guest', 'Room', 'Check-in', 'Check-out', 'Source', 'Amount', 'Status', ''];

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-neutral-100",
      "shadow-sm hover:shadow-lg transition-all duration-300",
      "overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terra-100 to-terra-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-terra-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Recent Bookings</h3>
              <p className="text-xs text-neutral-400">Latest reservations and check-ins</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/cms/bookings')}
            className={cn(
              "flex items-center gap-1 text-xs font-semibold",
              "text-terra-500 hover:text-terra-600",
              "transition-colors"
            )}
          >
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-neutral-50 to-terra-50/30">
              {headers.map((header, i) => (
                <th
                  key={header || i}
                  className={cn(
                    "py-3 px-6",
                    "text-[10px] font-semibold uppercase tracking-widest text-neutral-400",
                    i === 5 ? 'text-right' : 'text-left'
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {bookings.map((booking, index) => (
              <BookingRow key={booking.id} booking={booking} index={index} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50/50">
        <p className="text-xs text-neutral-400">
          Showing {bookings.length} of {bookings.length} recent bookings
        </p>
      </div>
    </div>
  );
}
