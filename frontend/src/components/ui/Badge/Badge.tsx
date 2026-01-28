import React from 'react'
import clsx from 'clsx'

export interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

const Badge: React.FC<BadgeProps> = ({ variant = 'primary', size = 'md', className, children }) => {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-200',
    info: 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-200',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  )
}

export default Badge