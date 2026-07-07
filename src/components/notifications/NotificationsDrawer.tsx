/**
 * NotificationsDrawer Component
 * Notifications panel - Glimmora Design System v5.0
 * Side drawer pattern matching other drawers in the system
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  Users,
  DoorOpen,
  Wrench,
  AlertCircle,
  MessageSquare,
  CreditCard,
  Star,
  Clock,
  Trash2,
  Settings,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Drawer } from '@/components/ui2/Drawer';
import { cn } from '@/lib/utils';
import { notificationsService, type StaffNotification } from '@/api/services/notifications.service';

interface Notification {
  id: string;
  type: 'booking' | 'guest' | 'housekeeping' | 'maintenance' | 'payment' | 'review' | 'system' | 'message';
  title: string;
  description: string;
  time: string;
  read: boolean;
  priority?: 'high' | 'medium' | 'low';
  link?: string;
  /** Guest ID for guest-related notifications — enables direct navigation */
  guestId?: string;
  /** Booking ID for booking-related notifications */
  bookingId?: string;
}

// Resolve notification type from any backend value (handles variations like
// 'booking', 'new_booking', 'booking_created', 'booking.created', etc.)
function resolveNotificationType(raw: string): Notification['type'] {
  const t = (raw || '').toLowerCase();
  if (t.includes('booking') || t.includes('reservation')) return 'booking';
  if (t.includes('guest') || t.includes('customer') || t.includes('check')) return 'guest';
  if (t.includes('housekeeping') || t.includes('cleaning') || t.includes('room_ready')) return 'housekeeping';
  if (t.includes('maintenance') || t.includes('repair') || t.includes('work_order')) return 'maintenance';
  if (t.includes('payment') || t.includes('invoice') || t.includes('charge')) return 'payment';
  if (t.includes('review') || t.includes('reputation') || t.includes('feedback')) return 'review';
  if (t.includes('message') || t.includes('chat')) return 'message';
  return 'system';
}

// Resolve the admin route for a notification type
function resolveNotificationRoute(raw: string): string {
  const routeMap: Record<Notification['type'], string> = {
    booking: '/admin/bookings',
    guest: '/admin/guests',
    housekeeping: '/admin/housekeeping',
    maintenance: '/admin/maintenance',
    payment: '/admin/bookings',
    review: '/admin/ai/reputation',
    message: '/admin/guests',
    system: '/admin/dashboard',
  };
  return routeMap[resolveNotificationType(raw)] || '/admin/dashboard';
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

// Format time ago
const formatTimeAgo = (dateStr: string): string => {
  // Backend stores UTC times without Z suffix — append Z so JS interprets as UTC
  const utcStr = dateStr && !dateStr.endsWith('Z') && !dateStr.includes('+')
    ? dateStr + 'Z'
    : dateStr;
  const date = new Date(utcStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

// Extract booking ID from notification title/message as fallback (e.g., "#155" or "BK-155")
function extractBookingIdFromText(title?: string, message?: string): string | undefined {
  const text = `${title || ''} ${message || ''}`;
  const match = text.match(/#(\d+)/);
  return match ? match[1] : undefined;
}

// Transform API notification to local format
const transformNotification = (apiNotification: StaffNotification): Notification => {
  const type = resolveNotificationType(apiNotification.notification_type);
  return {
    id: String(apiNotification.id),
    type,
    title: apiNotification.title,
    description: apiNotification.message,
    time: formatTimeAgo(apiNotification.created_at),
    read: apiNotification.is_read,
    priority: apiNotification.task?.priority === 'urgent' ? 'high' :
              apiNotification.task?.priority === 'high' ? 'high' :
              apiNotification.task?.priority === 'medium' ? 'medium' : 'low',
    link: resolveNotificationRoute(apiNotification.notification_type),
    guestId: apiNotification.guest_id != null ? String(apiNotification.guest_id) : undefined,
    bookingId: apiNotification.booking_id != null
      ? String(apiNotification.booking_id)
      : (type === 'booking' ? extractBookingIdFromText(apiNotification.title, apiNotification.message) : undefined),
  };
};

const typeConfig = {
  booking: { icon: Calendar, color: 'text-neutral-600', bg: 'bg-neutral-100', border: 'border-neutral-200' },
  guest: { icon: Users, color: 'text-neutral-600', bg: 'bg-neutral-100', border: 'border-neutral-200' },
  housekeeping: { icon: DoorOpen, color: 'text-neutral-600', bg: 'bg-neutral-100', border: 'border-neutral-200' },
  maintenance: { icon: Wrench, color: 'text-neutral-600', bg: 'bg-neutral-100', border: 'border-neutral-200' },
  payment: { icon: CreditCard, color: 'text-neutral-600', bg: 'bg-neutral-100', border: 'border-neutral-200' },
  review: { icon: Star, color: 'text-neutral-600', bg: 'bg-neutral-100', border: 'border-neutral-200' },
  system: { icon: Settings, color: 'text-neutral-600', bg: 'bg-neutral-100', border: 'border-neutral-200' },
  message: { icon: MessageSquare, color: 'text-neutral-600', bg: 'bg-neutral-100', border: 'border-neutral-200' }
};

export function NotificationsDrawer({ isOpen, onClose, onUnreadCountChange }: NotificationsDrawerProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiNotifications = await notificationsService.getNotifications({ limit: 50 });
      const transformed = apiNotifications.map(transformNotification);
      setNotifications(transformed);

      // Notify parent of unread count
      const unread = transformed.filter(n => !n.read).length;
      onUnreadCountChange?.(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [onUnreadCountChange]);

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(Number(id));
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      // Update unread count
      const newUnread = notifications.filter(n => n.id !== id && !n.read).length;
      onUnreadCountChange?.(newUnread);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read in background — don't block navigation
    markAsRead(notification.id);
    // Close drawer first, then navigate
    onClose();
    if (notification.link) {
      // Pass entity IDs via navigation state so target pages can
      // auto-select/highlight the relevant guest or booking
      const state: Record<string, string> = {};
      if (notification.guestId) state.guestId = notification.guestId;
      if (notification.bookingId) state.bookingId = notification.bookingId;
      navigate(notification.link, Object.keys(state).length > 0 ? { state } : undefined);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onUnreadCountChange?.(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsService.deleteNotification(Number(id));
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Update unread count if the deleted notification was unread
      if (deletedNotification && !deletedNotification.read) {
        onUnreadCountChange?.(unreadCount - 1);
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearAll = async () => {
    try {
      await notificationsService.deleteAllNotifications();
      setNotifications([]);
      onUnreadCountChange?.(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  // Custom header
  const renderHeader = () => (
    <div>
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
          Notifications
        </h2>
        <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
            filter === 'all'
              ? 'bg-terra-500 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5',
            filter === 'unread'
              ? 'bg-terra-500 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          )}
        >
          Unread
          {unreadCount > 0 && (
            <span className={cn(
              'min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold',
              filter === 'unread' ? 'bg-white text-terra-600' : 'bg-terra-500 text-white'
            )}>
              {unreadCount}
            </span>
          )}
        </button>
        <div className="flex-1" />
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-[11px] font-semibold text-terra-600 hover:text-terra-700 transition-colors flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>
    </div>
  );

  // Footer
  const renderFooter = () => (
    notifications.length > 0 ? (
      <div className="flex items-center">
        <button
          onClick={clearAll}
          className="text-[11px] font-semibold text-neutral-500 hover:text-rose-600 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear all
        </button>
      </div>
    ) : null
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      header={renderHeader()}
      footer={renderFooter()}
      maxWidth="max-w-xl"
      noPadding
    >
      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <Loader2 className="w-8 h-8 text-terra-500 animate-spin mb-4" />
          <p className="text-[13px] text-neutral-500">Loading notifications...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-14 h-14 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-rose-500" />
          </div>
          <p className="text-[13px] font-semibold text-neutral-900 mb-1">Failed to load</p>
          <p className="text-[11px] text-neutral-500 text-center mb-4">{error}</p>
          <button
            onClick={fetchNotifications}
            className="text-[12px] font-semibold text-terra-600 hover:text-terra-700"
          >
            Try again
          </button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-neutral-400" />
          </div>
          <p className="text-[13px] font-semibold text-neutral-900 mb-1">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </p>
          <p className="text-[11px] text-neutral-500 text-center">
            {filter === 'unread'
              ? "You're all caught up!"
              : "You'll see notifications here when there's activity"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {filteredNotifications.map((notification) => {
            const config = typeConfig[notification.type];
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={cn(
                  'px-6 py-4 hover:bg-neutral-50/80 transition-colors cursor-pointer group',
                  !notification.read && 'bg-terra-50/40'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={cn(
                    'w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 border',
                    config.bg,
                    config.border
                  )}>
                    <Icon className={cn('w-[18px] h-[18px]', config.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            'text-[13px] truncate',
                            notification.read ? 'font-medium text-neutral-700' : 'font-semibold text-neutral-900'
                          )}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-terra-500 flex-shrink-0" />
                          )}
                          {notification.priority === 'high' && (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">
                          {notification.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-sage-600 hover:bg-sage-50 transition-all"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Time & View link */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span className="text-[10px] text-neutral-400 font-medium">{notification.time}</span>
                      </div>
                      {notification.link && (
                        <span className="text-[10px] font-semibold text-terra-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                          View <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
}

export default NotificationsDrawer;
