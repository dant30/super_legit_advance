// frontend/src/components/ui/Badge.tsx
import React from 'react'
import { cn } from '@utils/cn'

export const Badge = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'full',
  className,
}, ref) => {
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
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    destructive: 'bg-red-600 text-white dark:bg-red-700',
  }

  return (
    <span
      ref={ref}
      className={cn(
        base,
        sizeClasses[size],
        roundedClasses[rounded],
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'

// Status Badge Component
export const StatusBadge = ({ status, showDot = true, className }) => {
  const statusConfig = {
    active: {
      label: 'Active',
      variant: 'success',
    },
    inactive: {
      label: 'Inactive',
      variant: 'secondary',
    },
    pending: {
      label: 'Pending',
      variant: 'warning',
    },
    approved: {
      label: 'Approved',
      variant: 'success',
    },
    rejected: {
      label: 'Rejected',
      variant: 'danger',
    },
    draft: {
      label: 'Draft',
      variant: 'info',
    },
    completed: {
      label: 'Completed',
      variant: 'success',
    },
    overdue: {
      label: 'Overdue',
      variant: 'danger',
    },
    defaulted: {
      label: 'Defaulted',
      variant: 'destructive',
    },
  }

  const config = statusConfig[status?.toLowerCase()] || {
    label: status,
    variant: 'secondary',
  }

  return (
    <Badge variant={config.variant} className={cn('flex items-center gap-1', className)}>
      {showDot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            config.variant === 'success' && 'bg-green-500',
            config.variant === 'warning' && 'bg-yellow-500',
            config.variant === 'danger' && 'bg-red-500',
            config.variant === 'info' && 'bg-blue-500',
            config.variant === 'secondary' && 'bg-gray-500',
            config.variant === 'destructive' && 'bg-red-600',
          )}
        />
      )}
      {config.label}
    </Badge>
  )
}

export default Badge