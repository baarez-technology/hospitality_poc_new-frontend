/**
 * NotificationDrawer Component
 *
 * This component maintains 100% backwards compatibility with the original API
 * while using the custom Drawer component.
 *
 * ORIGINAL PROPS (all preserved):
 * - isOpen: boolean controlling drawer visibility
 * - onClose: callback function
 */

import * as React from 'react'
import { useState } from 'react'
import { X, Check, Trash2 } from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import NotificationCard from './NotificationCard'
import { cn } from '@/lib/utils'
import Drawer from '../ui/Drawer'

export default function NotificationDrawer({ isOpen, onClose }) {
  const { notifications, markAllNotificationsRead, deleteNotification } = useAdmin()
  const [filter, setFilter] = useState('all')

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      description={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : ''}
      side="right"
      width="max-w-md"
    >
      {/* Header Custom Actions */}
      <div className="px-6 pt-6 pb-3">
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#A57865] hover:bg-[#A57865]/10 rounded-lg transition-colors"
          >
            <Check className="w-3 h-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 bg-white sticky top-0">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            filter === 'all'
              ? 'text-[#A57865] border-b-2 border-[#A57865]'
              : 'text-neutral-600 hover:text-neutral-900'
          )}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            filter === 'unread'
              ? 'text-[#A57865] border-b-2 border-[#A57865]'
              : 'text-neutral-600 hover:text-neutral-900'
          )}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">All caught up!</h3>
            <p className="text-xs text-neutral-500">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>
    </Drawer>
  )
}
