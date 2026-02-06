import React, { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import NotificationCard from './NotificationCard'
import { cn } from '@utils/cn'

const NotificationBell = ({
  unreadCount = 0,
  notifications = [],
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  isLoading = false,
  onBellClick,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const bellRef = useRef(null)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBellClick = () => {
    setIsOpen(!isOpen)
    onBellClick?.()
  }

  const recentNotifications = notifications.slice(0, 5)

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={handleBellClick}
        className={cn(
          'p-2 rounded-lg transition-all duration-200',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'relative group'
        )}
        aria-label="Notifications"
        title={`${unreadCount} unread notifications`}
      >
        <Bell className="h-5 w-5 text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-danger-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute right-0 top-full mt-2 w-96 bg-white dark:bg-neutral-900',
            'border border-neutral-200 dark:border-neutral-700',
            'rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col'
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  onMarkAllAsRead?.()
                  // Optionally close after marking all as read
                }}
                className="mt-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 animate-spin" />
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="space-y-2 p-3">
                {recentNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                    isCompact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Bell className="h-8 w-8 text-neutral-400 dark:text-neutral-600 mb-2" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  No notifications
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <button className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 py-2">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell