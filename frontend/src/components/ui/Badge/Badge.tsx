import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
        secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
        warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
        danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
      rounded: {
        full: 'rounded-full',
        lg: 'rounded-lg',
        md: 'rounded-md',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'full',
    },
  }
)

export interface BadgeProps {
  variant?: 'success' | 'info' | 'warning' | 'danger' | 'primary' | 'outline' | 'secondary'
  children: React.ReactNode
}

const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  rounded,
  dot = false,
  dotColor,
  removable = false,
  onRemove,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(badgeVariants({ variant, size, rounded }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'mr-1.5 h-2 w-2 rounded-full',
            dotColor || 'bg-current opacity-60'
          )}
          aria-hidden="true"
        />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          aria-label="Remove badge"
        >
          <span className="sr-only">Remove</span>
          <svg
            className="h-2.5 w-2.5"
            fill="none"
            viewBox="0 0 14 14"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4l6 6m0-6l-6 6"
            />
          </svg>
        </button>
      )}
    </span>
  )
}

export default Badge