import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react'

const alertVariants = cva(
  'rounded-lg border p-4 transition-all duration-200',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
        success: 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
        warning: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
        danger: 'bg-danger-50 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800',
      },
      size: {
        sm: 'p-3 text-sm',
        md: 'p-4',
        lg: 'p-5',
      },
    },
    defaultVariants: {
      variant: 'info',
      size: 'md',
    },
  }
)

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  danger: XCircle,
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  description?: string
  dismissible?: boolean
  onDismiss?: () => void
  showIcon?: boolean
  showBorder?: boolean
}

const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  size,
  title,
  description,
  dismissible = false,
  onDismiss,
  showIcon = true,
  showBorder = true,
  children,
  ...props
}) => {
  const Icon = iconMap[variant || 'info']

  const content = children || (
    <>
      <div className="flex items-start">
        {showIcon && (
          <Icon
            className={cn(
              'h-5 w-5 flex-shrink-0 mt-0.5',
              variant === 'info' && 'text-blue-500 dark:text-blue-400',
              variant === 'success' && 'text-success-600 dark:text-success-400',
              variant === 'warning' && 'text-warning-600 dark:text-warning-400',
              variant === 'danger' && 'text-danger-600 dark:text-danger-400'
            )}
          />
        )}
        <div className={cn('flex-1', showIcon && 'ml-3')}>
          {title && (
            <h3
              className={cn(
                'font-medium',
                variant === 'info' && 'text-blue-800 dark:text-blue-300',
                variant === 'success' && 'text-success-800 dark:text-success-300',
                variant === 'warning' && 'text-warning-800 dark:text-warning-300',
                variant === 'danger' && 'text-danger-800 dark:text-danger-300'
              )}
            >
              {title}
            </h3>
          )}
          {description && (
            <div
              className={cn(
                'mt-1',
                variant === 'info' && 'text-blue-700 dark:text-blue-400',
                variant === 'success' && 'text-success-700 dark:text-success-400',
                variant === 'warning' && 'text-warning-700 dark:text-warning-400',
                variant === 'danger' && 'text-danger-700 dark:text-danger-400'
              )}
            >
              {description}
            </div>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              'ml-3 inline-flex h-5 w-5 items-center justify-center rounded-md transition-colors',
              variant === 'info' && 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900',
              variant === 'success' && 'text-success-500 hover:bg-success-100 dark:hover:bg-success-900',
              variant === 'warning' && 'text-warning-500 hover:bg-warning-100 dark:hover:bg-warning-900',
              variant === 'danger' && 'text-danger-500 hover:bg-danger-100 dark:hover:bg-danger-900'
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  )

  return (
    <div
      role="alert"
      className={cn(
        alertVariants({ variant, size }),
        !showBorder && 'border-transparent',
        className
      )}
      {...props}
    >
      {content}
    </div>
  )
}

export default Alert