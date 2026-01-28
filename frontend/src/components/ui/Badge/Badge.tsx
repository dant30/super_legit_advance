import React from 'react'
import clsx from 'clsx'

interface BadgeProps {
  variant?: 'success' | 'info' | 'warning' | 'primary' | 'danger' | 'outline' | 'secondary'
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'primary', children }) => {
  const variantClasses = {
    success: 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-200',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}