/**
 * BookingRow Component v5.0
 * Modern Enterprise Design with Glimmora Brand Colors
 * Glimmora Hotel Management
 */

import { useState } from 'react';
import {
  Crown,
  MoreHorizontal,
  LogIn,
  LogOut,
  DoorOpen,
  X,
  Eye,
  CheckCircle,
  Moon
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import SearchHighlight from '../ui2/SearchHighlight';
import { StatusBadge, Badge } from '../ui2/Badge';
import { ActionMenu } from '../ui2/DropdownMenu';
import { Button, IconButton } from '../ui2/Button';
import { PreCheckInBadge } from '../shared/PreCheckInBadge';
import type { PrecheckinStatusValue } from '@/hooks/admin/usePrecheckinStatus';

// Source Badge - Using ui2 Badge with brand colors
function SourceBadge({ source }) {
  const sourceVariants = {
    'Booking.com': 'secondary',
    'Expedia': 'warning',
    'Direct': 'primary',
    'Agoda': 'danger',
    'Airbnb': 'primary',
  };

  const variant = sourceVariants[source] || 'neutral';

  return (
    <Badge variant={variant} size="sm" className="font-semibold">
      {source || 'Direct'}
    </Badge>
  );
}

// Payment Display
function PaymentDisplay({ amount, balance, symbol = '₹' }) {
  const isPaid = balance === 0 && amount > 0;

  return (
    <div className="text-right">
      <span className="text-[13px] font-semibold text-neutral-900 tabular-nums">
        {symbol}{amount.toLocaleString()}
      </span>
      {balance > 0 && (
        <span className="block text-[10px] font-semibold text-rose-600 tabular-nums">
          {symbol}{balance.toLocaleString()} due
        </span>
      )}
      {isPaid && (
        <span className="flex items-center justify-end gap-1 text-[10px] font-semibold text-sage-600">
          <CheckCircle className="w-2.5 h-2.5" />
          Paid
        </span>
      )}
    </div>
  );
}

export default function BookingRow({
  booking,
  onClick,
  onStatusChange,
  onAssignRoom,
  onCheckIn,
  onCheckOut,
  onCancel,
  isDark = false,
  searchQuery = '',
  isSelected = false,
  onSelect,
  animationDelay = 0,
  precheckinStatus = 'not_started' as PrecheckinStatusValue
}) {
  const { symbol } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);

  const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));

  // Get initials
  const initials = booking.guestName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (d) => {
    if (!d) return 'N/A';
    const safe = d.includes('T') ? d : `${d}T12:00:00`;
    return new Date(safe).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if booking is for today
  const today = new Date().toISOString().split('T')[0];
  const isArrivalToday = booking.checkIn === today;
  const isDepartureToday = booking.checkOut === today;

  // Avatar color - primary brand color
  const avatarColor = 'bg-terra-500';

  return (
    <tr
      onClick={() => onClick(booking)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`cursor-pointer transition-all duration-200 group border-b border-neutral-200/40 last:border-b-0 ${
        isSelected
          ? 'bg-terra-50/50'
          : 'hover:bg-neutral-50/30'
      }`}
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Checkbox */}
      <td className="px-6 py-3" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect?.(booking.id)}
          className="w-3.5 h-3.5 rounded border-neutral-300 text-terra-500 focus:ring-2 focus:ring-terra-500/20 focus:ring-offset-0 cursor-pointer transition-colors"
        />
      </td>

      {/* Guest */}
      <td className="px-6 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`relative w-8 h-8 rounded-lg ${avatarColor} flex items-center justify-center text-white text-[11px] font-semibold`}>
            {initials}
            {booking.isVip && (
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-gold-500 flex items-center justify-center border border-gold-300">
                <Crown className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-neutral-900 truncate leading-tight">
              <SearchHighlight text={booking.guestName} query={searchQuery} />
            </p>
            <p className="text-[10px] text-neutral-500 font-mono">
              <SearchHighlight text={booking.bookingNumber || booking.id} query={searchQuery} />
            </p>
          </div>
        </div>
      </td>

      {/* Room */}
      <td className="px-6 py-3">
        {booking.roomNumber ? (
          <div>
            <Badge variant="neutral" size="sm">
              <SearchHighlight text={booking.roomNumber} query={searchQuery} />
            </Badge>
            <p className="text-[10px] text-neutral-500 mt-0.5">{booking.roomType}</p>
          </div>
        ) : (
          <Button
            variant="outline"
            size="xs"
            icon={DoorOpen}
            onClick={(e) => {
              e.stopPropagation();
              onAssignRoom?.(booking);
            }}
            className="font-semibold text-[11px]"
          >
            Assign
          </Button>
        )}
      </td>

      {/* Check-in */}
      <td className="px-6 py-3">
        <div className="flex items-center gap-1.5">
          {isArrivalToday && (
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <span className={`text-[13px] font-semibold ${isArrivalToday ? 'text-sage-700' : 'text-neutral-900'}`}>
              {formatDate(booking.checkIn)}
            </span>
            {isArrivalToday && (
              <p className="text-[9px] font-semibold text-sage-600 uppercase tracking-wider">Today</p>
            )}
          </div>
        </div>
      </td>

      {/* Check-out */}
      <td className="px-6 py-3">
        <div className="flex items-center gap-1.5">
          {isDepartureToday && (
            <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <span className={`text-[13px] font-semibold ${isDepartureToday ? 'text-ocean-700' : 'text-neutral-900'}`}>
              {formatDate(booking.checkOut)}
            </span>
            <p className="text-[10px] text-neutral-500 flex items-center gap-1">
              {isDepartureToday ? (
                <span className="text-[9px] font-semibold text-ocean-600 uppercase tracking-wider">Today</span>
              ) : (
                <>
                  <Moon className="w-2.5 h-2.5 flex-shrink-0" />
                  {nights} night{nights !== 1 ? 's' : ''}
                </>
              )}
            </p>
          </div>
        </div>
      </td>

      {/* Source */}
      <td className="px-6 py-3">
        <SourceBadge source={booking.source} />
      </td>

      {/* Pre Check-In */}
      <td className="px-6 py-3">
        <PreCheckInBadge status={precheckinStatus} />
      </td>

      {/* Amount */}
      <td className="px-6 py-3">
        <PaymentDisplay
          amount={booking.totalPrice || booking.amount}
          balance={booking.balance || 0}
          symbol={symbol}
        />
      </td>

      {/* Status */}
      <td className="px-6 py-3">
        {/* A checked-in guest stays "In House" until actually checked out — a passed
            planned checkout date must not relabel them as "Checked Out". */}
        <StatusBadge status={booking.status} />
      </td>

      {/* Actions */}
      <td className="px-6 py-3" onClick={e => e.stopPropagation()}>
        <div>
          <ActionMenu
            trigger={
              <IconButton
                icon={MoreHorizontal}
                variant="ghost"
                size="sm"
                label="Actions"
              />
            }
            items={[
              {
                label: 'View Details',
                icon: Eye,
                onSelect: () => onClick(booking)
              },
              ...(booking.status === 'CONFIRMED' && booking.roomNumber ? [{
                label: 'Check In',
                icon: LogIn,
                onSelect: () => onCheckIn?.(booking)
              }] : []),
              ...(booking.status === 'CHECKED-IN' ? [{
                label: 'Check Out',
                icon: LogOut,
                onSelect: () => onCheckOut?.(booking)
              }] : []),
              ...(!booking.roomNumber && !['CANCELLED', 'CHECKED-OUT'].includes(booking.status) ? [{
                label: 'Assign Room',
                icon: DoorOpen,
                onSelect: () => onAssignRoom?.(booking)
              }] : []),
              ...(!['CANCELLED', 'CHECKED-OUT'].includes(booking.status) ? [
                { type: 'separator' },
                {
                  label: 'Cancel',
                  icon: X,
                  destructive: true,
                  onSelect: () => onCancel?.(booking)
                }
              ] : [])
            ]}
          />
        </div>
      </td>
    </tr>
  );
}
