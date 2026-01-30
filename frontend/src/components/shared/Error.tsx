// frontend/src/components/shared/Error.tsx
import React from 'react'
import { AlertCircle } from 'lucide-react'
import clsx from 'clsx'

type ErrorVariant = 'default' | 'danger' | 'warning' | 'info'

interface ErrorProps {
  title?: string
  message: string
  variant?: ErrorVariant
  fullScreen?: boolean
  retry?: () => void
  className?: string
}

const Error: React.FC<ErrorProps> = ({
  title = 'Error',
  message,
  variant = 'default',
  fullScreen = false,
  retry,
  className = '',
}) => {
  const variants: Record<ErrorVariant, string> = {
    default: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/50 dark:border-gray-800 dark:text-gray-200',
    danger: 'bg-danger-50 border-danger-200 text-danger-800 dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-200',
    warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
  }

  const iconColors = {
    default: 'text-gray-600 dark:text-gray-400',
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

  const content = (
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
          <p className="text-sm mt-1 opacity-90">{message}</p>
          {retry && (
            <button
              onClick={retry}
              className="mt-3 text-sm font-medium hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">{content}</div>
      </div>
    )
  }

  return content
}

export default Error