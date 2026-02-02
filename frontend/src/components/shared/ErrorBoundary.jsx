// frontend/src/components/shared/ErrorBoundary.jsx
import React from 'react'
import { AlertCircle, RefreshCw, Home, HelpCircle } from 'lucide-react'
import Button from '@components/ui/Button'
import { cn } from '@utils/cn'

const ErrorBoundary = ({ 
  error, 
  resetErrorBoundary,
  fullScreen = false,
  showHomeButton = true,
  showHelpButton = true,
  className,
}) => {
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.response?.data?.detail) return error.response.data.detail
    if (error?.response?.data?.message) return error.response.data.message
    if (error?.response?.data?.error) return error.response.data.error
    
    try {
      return JSON.stringify(error)
    } catch {
      return 'An unexpected error occurred'
    }
  }

  const errorMessage = getErrorMessage(error)
  const errorStack = error?.stack || ''

  const handleReset = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary()
    } else {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleGetHelp = () => {
    // Implement help/contact logic
    console.log('Get help clicked')
    // Could open a modal, navigate to help page, etc.
  }

  const content = (
    <div className={cn('rounded-lg border border-danger-200 dark:border-danger-800 p-6', className)}>
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-4 rounded-full bg-danger-100 dark:bg-danger-900/30 p-3">
          <AlertCircle className="h-8 w-8 text-danger-600 dark:text-danger-400" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>

        {/* Error Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
          {errorMessage}
        </p>

        {/* Error Details (Dev only) */}
        {import.meta.env.DEV && errorStack && (
          <details className="mb-4 w-full max-w-2xl text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
              Error details
            </summary>
            <pre className="mt-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-60">
              {errorStack}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="primary"
            onClick={handleReset}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Try again
          </Button>

          {showHomeButton && (
            <Button
              variant="outline"
              onClick={handleGoHome}
              icon={<Home className="h-4 w-4" />}
            >
              Go to home
            </Button>
          )}

          {showHelpButton && (
            <Button
              variant="ghost"
              onClick={handleGetHelp}
              icon={<HelpCircle className="h-4 w-4" />}
            >
              Get help
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          If the problem persists, please contact support
        </p>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-lg w-full">
          {content}
        </div>
      </div>
    )
  }

  return content
}

// Error Component for displaying errors inline
export const ErrorMessage = ({
  message,
  title = 'Error',
  variant = 'danger',
  showIcon = true,
  className,
  onDismiss,
}) => {
  const variantClasses = {
    danger: 'bg-danger-50 border-danger-200 text-danger-800 dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-200',
    warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
  }

  return (
    <div className={cn(
      'rounded-lg border p-4',
      variantClasses[variant],
      className
    )}>
      <div className="flex items-start">
        {showIcon && (
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 mr-3" />
        )}
        <div className="flex-1">
          {title && (
            <h3 className="font-medium mb-1">{title}</h3>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorBoundary