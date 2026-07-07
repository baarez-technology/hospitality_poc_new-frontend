import { Bell, CalendarCheck, ClipboardCheck, TrendingUp, MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

const iconMap = {
  booking: CalendarCheck,
  housekeeping: ClipboardCheck,
  ai: TrendingUp,
  reputation: MessageSquare,
  default: Bell,
};

const colorMap = {
  booking: 'text-[#A57865] bg-[#A57865]/10',
  housekeeping: 'text-[#4E5840] bg-[#4E5840]/10',
  ai: 'text-[#5C9BA4] bg-[#5C9BA4]/10',
  reputation: 'text-[#CDB261] bg-[#CDB261]/10',
  default: 'text-neutral-600 bg-neutral-100',
};

function formatTimestamp(timestamp) {
  const now = new Date();
  // Backend stores UTC times without Z suffix — append Z so JS interprets as UTC
  const utcTs = timestamp && !timestamp.endsWith('Z') && !timestamp.includes('+')
    ? timestamp + 'Z'
    : timestamp;
  const time = new Date(utcTs);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return time.toLocaleDateString();
}

export default function NotificationCard({ notification, onDelete, onNavigate }) {
  const navigate = useNavigate();
  const { markNotificationRead } = useAdmin();

  const Icon = iconMap[notification.type] || iconMap.default;
  const colorClass = colorMap[notification.type] || colorMap.default;

  const getNotificationUrl = () => {
    // Use explicit link if provided (mock notifications)
    if (notification.link) return notification.link;
    // Derive URL from entity references (API notifications)
    const type = notification.type || notification.notification_type || '';
    if (type.includes('housekeeping') || type.includes('task')) {
      return '/admin/housekeeping';
    }
    if (notification.bookingId || notification.booking_id) {
      return '/admin/bookings';
    }
    if (notification.guestId || notification.guest_id) {
      return '/admin/guests';
    }
    if (type.includes('booking')) return '/admin/bookings';
    if (type.includes('maintenance')) return '/admin/maintenance';
    return null;
  };

  const handleClick = () => {
    markNotificationRead(notification.id);
    const url = getNotificationUrl();
    if (url) {
      if (onNavigate) onNavigate();
      const state: Record<string, string> = {};
      if (notification.guestId || notification.guest_id) state.guestId = String(notification.guestId || notification.guest_id);
      if (notification.bookingId || notification.booking_id) state.bookingId = String(notification.bookingId || notification.booking_id);
      navigate(url, Object.keys(state).length > 0 ? { state } : undefined);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-all duration-200 cursor-pointer ${
        !notification.read ? 'bg-[#A57865]/5' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-semibold ${!notification.read ? 'text-neutral-900' : 'text-neutral-700'}`}>
              {notification.title}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-200 rounded"
            >
              <X className="w-3 h-3 text-neutral-500" />
            </button>
          </div>

          <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-neutral-500">
              {formatTimestamp(notification.timestamp)}
            </span>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-[#A57865]"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
