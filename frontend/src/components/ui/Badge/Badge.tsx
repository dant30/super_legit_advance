// frontend/src/components/ui/Badge/Badge.tsx
import React from 'react'
import { cn } from '@/lib/utils/cn'

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'
  | 'destructive'

export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  rounded?: 'full' | 'md'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      rounded = 'full',
      className,
    },
    ref
  ) => {
    const base = 'inline-flex items-center font-medium whitespace-nowrap'

    const sizeClasses: Record<BadgeSize, string> = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    }

    const roundedClasses = {
      full: 'rounded-full',
      md: 'rounded-md',
    }

    const variants: Record<BadgeVariant, string> = {
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
  }
)

Badge.displayName = 'Badge'