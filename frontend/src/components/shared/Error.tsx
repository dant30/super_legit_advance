// frontend/src/components/shared/Error.tsx
import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import Button from '@/components/ui/Button'

interface ErrorProps {
  title?: string
  message: string
  retry?: () => void
  variant?: 'default' | 'danger' | 'warning' | 'info'
  className?: string
}

const Error: React.FC<ErrorProps> = ({
  title = 'Something went wrong',
  message,
  retry,
  variant = 'danger',
  className = '',
}) => {
  const variants = {
    default: 'border-neutral-200 bg-neutral-50 dark:bg-slate-800 dark:border-slate-700',
    danger: 'border-danger-200 bg-danger-50 dark:bg-danger-900/20 dark:border-danger-800',
    warning: 'border-warning-200 bg-warning-50 dark:bg-warning-900/20 dark:border-warning-800',
    info: 'border-primary-200 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800',
  }

  const iconColors = {
    default: 'text-neutral-600 dark:text-neutral-400',
    danger: 'text-danger-600 dark:text-danger-400',
    warning: 'text-warning-600 dark:text-warning-400',
    info: 'text-primary-600 dark:text-primary-400',
  }

  const textColors = {
    default: 'text-neutral-800 dark:text-neutral-200',
    danger: 'text-danger-800 dark:text-danger-200',
    warning: 'text-warning-800 dark:text-warning-200',
    info: 'text-primary-800 dark:text-primary-200',
  }

  return (
    <div
      className={clsx(
        'rounded-lg border p-4',
        variants[variant],
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', iconColors[variant])}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <h3 className={clsx('text-sm font-medium', textColors[variant])}>
            {title}
          </h3>
          <p className={clsx('mt-1 text-sm', textColors[variant])}>
            {message}
          </p>
          {retry && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={retry}
                className={variant !== 'default' ? 'border-current' : ''}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Error