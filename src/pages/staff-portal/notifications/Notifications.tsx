import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Trash2,
  Loader2,
  BellOff,
  Search,
  X,
  ChevronRight,
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import PageHeader from '../../../layouts/staff-portal/PageHeader';
import Button from '../../../components/staff-portal/ui/Button';
import { ConfirmModal } from '../../../components/staff-portal/ui/Modal';
import { useNotifications, useUnreadNotificationCount, useNotificationActions } from '@/hooks/staff-portal/useStaffApi';

/**
 * Glimmora Design System v5.0 - Staff Portal Notifications Page
 * Matching admin dashboard styling patterns
 */

// Section Card matching admin LuxurySectionCard
function SectionCard({
  title,
  subtitle,
  action,
  actionLabel,
  children,
  className = '',
  noPadding = false
}: {
  title?: string;
  subtitle?: string;
  action?: () => void;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={`rounded-[10px] bg-white overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-neutral-800">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && (
            <button
              onClick={action}
              className="flex items-center gap-1 text-[11px] font-semibold text-terra-600 px-3 py-1.5 rounded-lg hover:bg-terra-50 transition-colors"
            >
              {actionLabel} <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'px-4 sm:px-6 pb-4 sm:pb-6'}>{children}</div>
    </div>
  );
}

// Notification Item Component - matching admin dashboard styling
interface NotificationItemProps {
  notification: {
    id: number;
    title: string;
    message: string;
    notification_type: string;
    is_read: boolean;
    created_at: string;
    actionUrl?: string;
    priority?: string;
  };
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigate: (url: string) => void;
  formatTimestamp: (timestamp: string) => string;
  getNotificationIcon: (type: string, priority?: string) => React.ReactNode;
  getTypeLabel: (type: string) => string;
  getIconBgClass: (type: string) => string;
  getBadgeClass: (type: string) => string;
}

const NotificationItem = ({
  notification,
  onRead,
  onDelete,
  onNavigate,
  formatTimestamp,
  getNotificationIcon,
  getTypeLabel,
  getIconBgClass,
  getBadgeClass
}: NotificationItemProps) => {
  const isUnread = !notification.is_read;

  const getActionUrl = (): string | null => {
    if (notification.actionUrl) return notification.actionUrl;
    const type = notification.notification_type || '';
    if (type.includes('task') && notification.room_id) {
      return `/staff/housekeeping/rooms/${notification.room_id}`;
    }
    if (notification.room_id) {
      return `/staff/housekeeping/rooms/${notification.room_id}`;
    }
    return null;
  };

  const hasAction = !!getActionUrl();

  const handleClick = () => {
    onRead(notification.id);
    const url = getActionUrl();
    if (url) {
      onNavigate(url);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg cursor-pointer
        transition-all duration-200
        ${isUnread
          ? 'bg-terra-50/30 hover:bg-terra-50/50'
          : 'bg-neutral-50/50 hover:bg-neutral-50'}
      `}
    >
      {/* Unread indicator */}
      {isUnread && (
        <span className="absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-terra-500" />
      )}

      {/* Icon */}
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBgClass(notification.notification_type)}`}>
        {getNotificationIcon(notification.notification_type, notification.priority)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <h4 className={`text-[13px] line-clamp-2 sm:line-clamp-1 ${isUnread ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-700'}`}>
            {notification.title}
          </h4>
          <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium whitespace-nowrap flex-shrink-0">
            {formatTimestamp(notification.created_at)}
          </span>
        </div>

        <p className={`text-[12px] line-clamp-2 mt-1 ${isUnread ? 'text-neutral-600' : 'text-neutral-500'}`}>
          {notification.message}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${getBadgeClass(notification.notification_type)}`}>
            {getTypeLabel(notification.notification_type)}
          </span>

          {hasAction && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-terra-600 font-medium">
              View details
              <ChevronRight className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Delete button - always visible on mobile for touch */}
      <button
        onClick={handleDelete}
        className="p-2 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 sm:opacity-0 sm:group-hover:opacity-100 transition-all flex-shrink-0"
        aria-label="Delete notification"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// Main Notifications Page Component
const Notifications = () => {
  const navigate = useNavigate();

  // State
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // API hooks
  const { data: notifications, loading, refetch: refetchNotifications } = useNotifications();
  const { count: unreadCount, refetch: refetchUnreadCount } = useUnreadNotificationCount();
  const { markAsRead, markAllAsRead, deleteNotification: apiDeleteNotification, deleteAllNotifications } = useNotificationActions();

  const notificationsList = notifications || [];

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notificationsList.filter(notif => {
      const matchesSearch =
        notif.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesReadFilter =
        filter === 'all' ||
        (filter === 'unread' && !notif.is_read) ||
        (filter === 'read' && notif.is_read);

      return matchesSearch && matchesReadFilter;
    });
  }, [notificationsList, filter, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    all: notificationsList.length,
    unread: notificationsList.filter(n => !n.is_read).length,
    read: notificationsList.filter(n => n.is_read).length
  }), [notificationsList]);

  const refetchAll = async () => {
    await Promise.all([refetchNotifications(), refetchUnreadCount()]);
  };

  // Loading state for bulk actions
  const [actionInProgress, setActionInProgress] = useState(false);

  // Actions
  const markNotificationRead = async (id: number) => {
    try {
      await markAsRead(id);
      refetchAll();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    setActionInProgress(true);
    try {
      await markAllAsRead();
      await refetchAll();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await apiDeleteNotification(id);
      refetchAll();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearNotifications = async () => {
    setActionInProgress(true);
    try {
      await deleteAllNotifications();
      await refetchAll();
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  // Helper functions
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
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getNotificationIcon = (type: string, priority?: string) => {
    if (priority === 'urgent') {
      return <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />;
    }

    switch (type) {
      case 'task_assigned':
      case 'task':
        return <CheckCircle className="w-4.5 h-4.5 text-sage-600" />;
      case 'alert':
        return <AlertTriangle className="w-4.5 h-4.5 text-gold-600" />;
      case 'task_reminder':
      case 'reminder':
        return <Clock className="w-4.5 h-4.5 text-ocean-600" />;
      case 'info':
        return <Info className="w-4.5 h-4.5 text-ocean-600" />;
      case 'system':
      default:
        return <Bell className="w-4.5 h-4.5 text-terra-600" />;
    }
  };

  const getIconBgClass = (type: string) => {
    if (type?.includes('task')) return 'bg-sage-50';
    if (type === 'alert') return 'bg-gold-50';
    if (type?.includes('reminder')) return 'bg-ocean-50';
    if (type === 'info') return 'bg-ocean-50';
    return 'bg-terra-50';
  };

  const getBadgeClass = (type: string) => {
    if (type?.includes('task')) return 'bg-sage-50 text-sage-700';
    if (type === 'alert') return 'bg-gold-50 text-gold-700';
    if (type?.includes('reminder')) return 'bg-ocean-50 text-ocean-700';
    if (type === 'info') return 'bg-ocean-50 text-ocean-700';
    return 'bg-terra-50 text-terra-700';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      task_assigned: 'Task',
      task_reminder: 'Reminder',
      task_update: 'Update',
      task: 'Task',
      alert: 'Alert',
      reminder: 'Reminder',
      info: 'Info',
      system: 'System'
    };
    return labels[type] || type;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-terra-50 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-terra-600" />
        </div>
        <span className="text-[13px] text-neutral-500 font-medium">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-hidden">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      />

      {/* Search & Filters - matching admin OTA Connections style */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 mb-6">
        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 min-h-[44px] pl-11 pr-10 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="h-11 min-h-[44px] w-full sm:w-[180px] px-4 pr-10 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all flex items-center justify-between"
            >
              <span>
                {filter === 'all' && `All (${stats.all})`}
                {filter === 'unread' && `Unread (${stats.unread})`}
                {filter === 'read' && `Read (${stats.read})`}
              </span>
              <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-[180px] bg-white rounded-lg border border-neutral-200 shadow-lg z-20 py-1 overflow-hidden">
                  {[
                    { value: 'all', label: 'All', count: stats.all },
                    { value: 'unread', label: 'Unread', count: stats.unread },
                    { value: 'read', label: 'Read', count: stats.read }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFilter(option.value);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full px-4 py-3 sm:py-2.5 text-[13px] text-left transition-colors flex items-center justify-between ${
                        filter === option.value
                          ? 'bg-terra-50 text-terra-600 font-medium'
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{option.label}</span>
                      <span className={`text-[11px] tabular-nums ${
                        filter === option.value ? 'text-terra-500' : 'text-neutral-400'
                      }`}>
                        {option.count}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCheck}
              onClick={markAllNotificationsRead}
              disabled={actionInProgress}
              isLoading={actionInProgress}
              className="flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
            >
              Mark all read
            </Button>
          )}
          {notificationsList.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Trash2}
              onClick={() => setShowClearModal(true)}
              disabled={actionInProgress}
              className="flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="col-span-1">
          <SectionCard
            title="All Notifications"
            subtitle={`${filteredNotifications.length} notification${filteredNotifications.length !== 1 ? 's' : ''}`}
            noPadding
          >
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                  <BellOff className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-400" />
                </div>
                <h3 className="text-[13px] font-semibold text-neutral-800 mb-1 text-center">
                  {filter === 'unread' ? 'No unread notifications' :
                   filter === 'read' ? 'No read notifications' :
                   searchQuery ? 'No results found' :
                   'No notifications yet'}
                </h3>
                <p className="text-[11px] text-neutral-500 text-center max-w-xs">
                  {filter === 'unread'
                    ? 'You\'ve read all your notifications.'
                    : filter === 'read'
                    ? 'Notifications you\'ve read will appear here.'
                    : searchQuery
                    ? `No notifications match "${searchQuery}".`
                    : 'New notifications will appear here.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2.5 min-h-[44px] text-[13px] font-medium text-terra-600 bg-terra-50 hover:bg-terra-100 rounded-lg transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markNotificationRead}
                    onDelete={deleteNotification}
                    onNavigate={navigate}
                    formatTimestamp={formatTimestamp}
                    getNotificationIcon={getNotificationIcon}
                    getTypeLabel={getTypeLabel}
                    getIconBgClass={getIconBgClass}
                    getBadgeClass={getBadgeClass}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Clear All Confirmation */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={clearNotifications}
        title="Clear All Notifications"
        message="Are you sure you want to clear all notifications? This action cannot be undone."
        confirmText="Clear All"
        variant="danger"
      />
    </div>
  );
};

export default Notifications;
