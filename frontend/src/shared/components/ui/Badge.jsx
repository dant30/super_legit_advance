// frontend/src/components/ui/Badge.jsx
import React from 'react'
import { cn } from '@utils/cn'

/**
 * @typedef {Object} BadgeProps
 * @property {'primary'|'secondary'|'success'|'warning'|'danger'|'info'|'outline'} [variant]
 * @property {'sm'|'md'|'lg'} [size]
 * @property {'full'|'md'} [rounded]
 * @property {boolean} [dot]
 * @property {React.ReactNode} children
 * @property {string} [className]
 */

export const Badge = React.forwardRef(
  ({ children, variant = 'primary', size = 'md', rounded = 'full', dot = false, className }, ref) => {
    const base = 'inline-flex items-center font-medium whitespace-nowrap'

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    }

    const roundedClasses = {
      full: 'rounded-full',
      md: 'rounded-md',
    }

    const variants = {
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200',
      secondary: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200',
      success: 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200',
      warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200',
      danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      outline: 'border border-gray-300 text-gray-700 dark:border-slate-600 dark:text-gray-300',
    }

    const dotColor = {
      primary: 'bg-primary-600',
      secondary: 'bg-gray-500',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      danger: 'bg-danger-600',
      info: 'bg-blue-600',
      outline: 'bg-gray-500',
    }

    return (
      <span
        ref={ref}
        className={cn(base, sizeClasses[size], roundedClasses[rounded], variants[variant], className)}
      >
        {dot && <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', dotColor[variant])} />}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export const StatusBadge = ({ status, showDot = true, className }) => {
  const statusConfig = {
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'secondary' },
    pending: { label: 'Pending', variant: 'warning' },
    approved: { label: 'Approved', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'danger' },
    draft: { label: 'Draft', variant: 'info' },
    completed: { label: 'Completed', variant: 'success' },
    overdue: { label: 'Overdue', variant: 'danger' },
    defaulted: { label: 'Defaulted', variant: 'danger' },
  }

  const config = statusConfig[String(status || '').toLowerCase()] || {
    label: status,
    variant: 'secondary',
  }

  return (
    <Badge variant={config.variant} dot={showDot} className={className}>
      {config.label}
    </Badge>
  )
}

export default Badge
