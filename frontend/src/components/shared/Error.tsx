// frontend/src/components/shared/Error.tsx
import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type ErrorVariant = 'default' | 'danger' | 'warning' | 'info'

export interface ErrorProps {
  title?: string
  message?: string
  variant?: ErrorVariant
  fullScreen?: boolean
  retry?: () => void
  retryText?: string
  actionText?: string
  onAction?: () => void
  className?: string
  showIcon?: boolean
}

/**
 * MUST match react-error-boundary FallbackComponent props
 */
export interface FallbackProps {
  error: unknown
  resetErrorBoundary: (...args: unknown[]) => void
}

/* -------------------------------------------------------------------------- */
/*                              Type Guard Utils                              */
/* -------------------------------------------------------------------------- */

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasStringProp = (
  obj: Record<string, unknown>,
  key: string
): obj is Record<string, string> =>
  typeof obj[key] === 'string'

/* -------------------------------------------------------------------------- */
/*                         Error Message Extraction                            */
/* -------------------------------------------------------------------------- */

const getErrorMessage = (error: unknown): string => {
  // Direct string thrown
  if (typeof error === 'string') {
    return error
  }

  // Standard Error-like object
  if (isObject(error) && hasStringProp(error, 'message')) {
    return error.message
  }

  // Axios / API style errors
  if (isObject(error) && isObject(error.response)) {
    const response = error.response

    if (isObject(response.data)) {
      const data = response.data

      if (hasStringProp(data, 'detail')) return data.detail
      if (hasStringProp(data, 'message')) return data.message
      if (hasStringProp(data, 'error')) return data.error
    }
  }

  // Fallback: try to stringify
  try {
    return JSON.stringify(error)
  } catch {
    return 'An unexpected error occurred'
  }
}

/* -------------------------------------------------------------------------- */
/*                        Error Boundary Fallback                              */
/* -------------------------------------------------------------------------- */

export const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <Error
      title="Something went wrong"
      message={getErrorMessage(error)}
      variant="danger"
      fullScreen
      retry={() => resetErrorBoundary()}
      retryText="Try again"
      showIcon
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                 */
/* -------------------------------------------------------------------------- */

export const Error: React.FC<ErrorProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  variant = 'danger',
  fullScreen = false,
  retry,
  retryText = 'Try again',
  actionText,
  onAction,
  className,
  showIcon = true,
}) => {
  const variants: Record<ErrorVariant, string> = {
    default:
      'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/50 dark:border-gray-800 dark:text-gray-200',
    danger:
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning:
      'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    info:
      'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
  }

  const iconColors: Record<ErrorVariant, string> = {
    default: 'text-gray-600 dark:text-gray-400',
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  }

  const content = (
    <div
      className={cn('rounded-lg border p-6', variants[variant], className)}
      role="alert"
    >
      <div className="flex flex-col items-center text-center">
        {showIcon && (
          <AlertCircle
            className={cn('h-12 w-12 mb-4', iconColors[variant])}
            aria-hidden="true"
          />
        )}

        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        <p className="text-sm opacity-90 mb-6 max-w-md">{message}</p>

        <div className="flex gap-3">
          {retry && (
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              size="sm"
              onClick={retry}
              icon={<RefreshCw className="h-4 w-4" />}
            >
              {retryText}
            </Button>
          )}

          {actionText && onAction && (
            <Button variant="outline" size="sm" onClick={onAction}>
              {actionText}
            </Button>
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
