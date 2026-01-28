import React from 'react'

export interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', size = 'md', children, className = '' }, ref) => {
    const variantClasses: Record<string, string> = {
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200',
      success: 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200',
      warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200',
      danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-200',
      info: 'bg-info-100 text-info-800 dark:bg-info-900/20 dark:text-info-200',
      neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200',
    }

    const sizeClasses: Record<string, string> = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    }

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge