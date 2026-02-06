import React, { useState } from 'react'
import { format } from 'date-fns'
import {
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@utils/cn'

const NotificationCard = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
  isCompact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  if (!notification) return null

  const { id, title, message, status, notification_type, created_at, read_at, priority, channel } =
    notification

  const isUnread = !read_at && ['SENT', 'DELIVERED'].includes(status)

  // Icon and color mapping
  const typeConfig = {
    LOAN_APPROVED: {
      icon: CheckCircle,
      color: 'text-success-600 dark:text-success-400',
      bg: 'bg-success-50 dark:bg-success-900/20',
    },
    LOAN_REJECTED: {
      icon: AlertCircle,
      color: 'text-danger-600 dark:text-danger-400',
      bg: 'bg-danger-50 dark:bg-danger-900/20',
    },
    PAYMENT_REMINDER: {
      icon: Clock,
      color: 'text-warning-600 dark:text-warning-400',
      bg: 'bg-warning-50 dark:bg-warning-900/20',
    },
    PAYMENT_OVERDUE: {
      icon: AlertCircle,
      color: 'text-danger-600 dark:text-danger-400',
      bg: 'bg-danger-50 dark:bg-danger-900/20',
    },
    SYSTEM_ALERT: {
      icon: Info,
      color: 'text-primary-600 dark:text-primary-400',
      bg: 'bg-primary-50 dark:bg-primary-900/20',
    },
  }

  const config = typeConfig[notification_type] || typeConfig.SYSTEM_ALERT
  const Icon = config.icon

  const truncateMessage = (text, maxLength = 100) =>
    text && text.length > maxLength ? `${text.slice(0, maxLength)}...` : text

  const handleMarkAsRead = (e) => {
    e.stopPropagation()
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(id)
    }
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(id)
    }
  }

  if (isCompact) {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'p-3 rounded-lg border border-neutral-200 dark:border-neutral-700',
          'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer',
          'transition-all duration-200 group',
          isUnread && 'bg-primary-50/50 dark:bg-primary-900/10'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn('mt-1 flex-shrink-0', config.bg, 'p-2 rounded-lg')}>
            <Icon className={cn('h-4 w-4', config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-medium',
                isUnread ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
              )}
            >
              {title || 'Notification'}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
              {truncateMessage(message, 60)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
              {format(new Date(created_at), 'MMM d, HH:mm')}
            </p>
          </div>

          {/* Status & Actions */}
          {isHovered && (
            <div className="flex gap-1 flex-shrink-0">
              {isUnread && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                  title="Mark as read"
                >
                  <Eye className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-danger-600 dark:text-danger-400" />
              </button>
            </div>
          )}

          {/* Unread indicator */}
          {isUnread && !isHovered && (
            <div className="h-2 w-2 rounded-full bg-primary-600 flex-shrink-0 mt-2" />
          )}
        </div>
      </div>
    )
  }

  // Full card view
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'p-4 rounded-lg border transition-all duration-200 cursor-pointer',
        isUnread
          ? 'border-primary-300 dark:border-primary-700 bg-primary-50/30 dark:bg-primary-900/15'
          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50'
      )}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={cn('mt-1 flex-shrink-0', config.bg, 'p-3 rounded-lg h-fit')}>
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={cn(
                  'font-semibold text-sm',
                  isUnread
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-800 dark:text-neutral-200'
                )}
              >
                {title || 'Notification'}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                {message}
              </p>
            </div>

            {/* Status Badge & Close */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {priority === 'HIGH' && (
                <span className="px-2 py-1 text-xs font-medium bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 rounded">
                  Urgent
                </span>
              )}
              {isHovered && (
                <button
                  onClick={handleDelete}
                  className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition"
                >
                  <X className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span>{channel}</span>
              <span>•</span>
              <span>{format(new Date(created_at), 'MMM d, yyyy HH:mm')}</span>
            </div>

            {isUnread && (
              <button
                onClick={handleMarkAsRead}
                className="px-3 py-1 text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white rounded transition"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationCard