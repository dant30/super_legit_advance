import React, { useState, useCallback } from 'react'
import { AlertCircle, Inbox, Filter, ChevronDown } from 'lucide-react'
import NotificationCard from './NotificationCard'
import { cn } from '@utils/cn'

const NotificationList = ({
  notifications = [],
  isLoading = false,
  onMarkAsRead,
  onDelete,
  onNotificationClick,
  filters = {},
  onFilterChange,
  pagination,
  onPageChange,
}) => {
  const [sortBy, setSortBy] = useState('newest')
  const [filterOpen, setFilterOpen] = useState(false)

  const sortedNotifications = useCallback(() => {
    const sorted = [...notifications]
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      case 'unread':
        return sorted.sort(
          (a, b) =>
            (!a.read_at && a.read_at === b.read_at
              ? 0
              : !a.read_at
              ? -1
              : !b.read_at
              ? 1
              : 0) ||
            new Date(b.created_at) - new Date(a.created_at)
        )
      default:
        return sorted
    }
  }, [notifications, sortBy])

  const unreadCount = notifications.filter(
    (n) => !n.read_at && ['SENT', 'DELIVERED'].includes(n.status)
  ).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Inbox className="h-12 w-12 text-neutral-400 dark:text-neutral-600 mb-3" />
        <p className="text-neutral-600 dark:text-neutral-400 text-center">
          No notifications yet. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn(
                'px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700',
                'hover:bg-neutral-50 dark:hover:bg-neutral-800 transition',
                'flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300'
              )}
            >
              <Filter className="h-4 w-4" />
              Sort
              <ChevronDown className="h-4 w-4" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10">
                {[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                  { value: 'unread', label: 'Unread first' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value)
                      setFilterOpen(false)
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition',
                      sortBy === option.value
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {sortedNotifications().map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            onClick={() => onNotificationClick?.(notification)}
            isCompact={false}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          {[...Array(pagination.total_pages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange?.(i + 1)}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition',
                pagination.page === i + 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationList