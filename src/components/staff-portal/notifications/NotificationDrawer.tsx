import { useNavigate } from 'react-router-dom';
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Trash2,
  Check,
  ChevronRight
} from 'lucide-react';
import { useNotifications, useUnreadNotificationCount, useNotificationActions } from '@/hooks/staff-portal/useStaffApi';
import { useUI } from '@/hooks/staff-portal/useStaffPortal';
import { Button } from '../ui/Button';

export default function NotificationDrawer() {
  const navigate = useNavigate();
  const { data: apiNotifications, refetch: refetchNotifications } = useNotifications();
  const { count: unreadCount, refetch: refetchUnreadCount } = useUnreadNotificationCount();
  const { markAsRead, markAllAsRead, deleteNotification: apiDeleteNotification } = useNotificationActions();
  const { notificationDrawerOpen, toggleNotificationDrawer } = useUI();

  const notifications = apiNotifications || [];

  const refetchAll = async () => {
    await Promise.all([refetchNotifications(), refetchUnreadCount()]);
  };

  const markNotificationRead = async (id: any) => {
    await markAsRead(id);
    refetchAll();
  };

  const markAllNotificationsRead = async () => {
    await markAllAsRead();
    refetchAll();
  };

  const deleteNotification = async (id: any) => {
    await apiDeleteNotification(id);
    refetchAll();
  };

  const formatTimestamp = (timestamp: string) => {
    // Backend stores UTC times without Z suffix — append Z so JS interprets as UTC
    const utcTimestamp = timestamp && !timestamp.endsWith('Z') && !timestamp.includes('+') ? timestamp + 'Z' : timestamp;
    const date = new Date(utcTimestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type: string, priority?: string) => {
    if (priority === 'urgent') {
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }

    switch (type) {
      case 'task':
        return <CheckCircle className="w-5 h-5 text-teal" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-gold" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'system':
      default:
        return <Bell className="w-5 h-5 text-primary-500" />;
    }
  };

  const getNotificationUrl = (notification: any): string | null => {
    if (notification.actionUrl) return notification.actionUrl;
    // Derive navigation URL from entity references
    const type = notification.notification_type || '';
    if (type.includes('task') && notification.room_id) {
      return `/staff/housekeeping/rooms/${notification.room_id}`;
    }
    if (notification.room_id) {
      return `/staff/housekeeping/rooms/${notification.room_id}`;
    }
    return null;
  };

  const handleNotificationClick = (notification: any) => {
    markNotificationRead(notification.id);
    toggleNotificationDrawer();
    const url = getNotificationUrl(notification);
    if (url) {
      navigate(url);
    }
  };

  if (!notificationDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50 animate-fade-in"
        onClick={toggleNotificationDrawer}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg z-50 animate-slide-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-300">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-neutral-600">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsRead}
                icon={Check}
              >
                Mark all read
              </Button>
            )}
            <button
              onClick={toggleNotificationDrawer}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-neutral-500" />
              </div>
              <h3 className="font-medium text-neutral-900 mb-1">No notifications</h3>
              <p className="text-sm text-neutral-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-300">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`
                    relative p-4 cursor-pointer transition-colors
                    hover:bg-neutral-100/50
                    ${!notification.is_read ? 'bg-primary-500/5' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {!notification.is_read && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-500" />
                  )}

                  <div className="flex gap-3 pl-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.notification_type || notification.type, notification.priority)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm ${notification.is_read ? 'text-neutral-900' : 'font-semibold text-neutral-900'}`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-sm text-neutral-600 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-neutral-500">
                          {formatTimestamp(notification.created_at || notification.timestamp)}
                        </span>

                        {getNotificationUrl(notification) && (
                          <span className="text-xs text-primary-500 flex items-center gap-0.5">
                            View <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {notification.priority === 'urgent' && (
                    <div className="absolute top-2 right-2">
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        Urgent
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-neutral-300">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigate('/staff/notifications');
                toggleNotificationDrawer();
              }}
            >
              View All Notifications
            </Button>
          </div>
        )}
      </div>
    </>
  );
}





