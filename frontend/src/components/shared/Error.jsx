// frontend/src/components/shared/Error.jsx
// frontend/src/components/shared/Error.jsx
import React from 'react'
import { AlertCircle, RefreshCw, Info } from 'lucide-react'
import Button from '@components/ui/Button'
import { cn } from '@utils/cn'

const Error = ({
  title = 'Error',
  message = 'Something went wrong',
  variant = 'danger',
  showIcon = true,
  showAction = false,
  actionLabel = 'Try again',
  onAction,
  fullWidth = false,
  className,
  children,
}) => {
  const variantClasses = {
    danger: {
      container: 'bg-danger-50 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800',
      icon: 'text-danger-600 dark:text-danger-400',
      title: 'text-danger-800 dark:text-danger-200',
      message: 'text-danger-700 dark:text-danger-300',
      button: 'danger',
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
      icon: 'text-warning-600 dark:text-warning-400',
      title: 'text-warning-800 dark:text-warning-200',
      message: 'text-warning-700 dark:text-warning-300',
      button: 'warning',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-200',
      message: 'text-blue-700 dark:text-blue-300',
      button: 'primary',
    },
  }

  const variantConfig = variantClasses[variant] || variantClasses.danger

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        variantConfig.container,
        fullWidth && 'w-full',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0 mr-3">
            {variant === 'info' ? (
              <Info className={cn('h-5 w-5', variantConfig.icon)} />
            ) : (
              <AlertCircle className={cn('h-5 w-5', variantConfig.icon)} />
            )}
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <h3 className={cn('font-medium mb-1', variantConfig.title)}>
              {title}
            </h3>
          )}
          
          <div className={cn('text-sm', variantConfig.message)}>
            {typeof message === 'string' ? <p>{message}</p> : message}
            {children}
          </div>
          
          {showAction && onAction && (
            <div className="mt-3">
              <Button
                variant={variantConfig.button}
                size="sm"
                onClick={onAction}
                icon={<RefreshCw className="h-3 w-3" />}
              >
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Convenience components
export const ErrorMessage = ({ message, ...props }) => (
  <Error message={message} {...props} />
)

export const LoadingError = ({ onRetry, ...props }) => (
  <Error
    title="Failed to load"
    message="Unable to load data. Please try again."
    showAction
    actionLabel="Retry"
    onAction={onRetry}
    {...props}
  />
)

export const NotFoundError = ({ resource = 'resource', ...props }) => (
  <Error
    title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`}
    message={`The ${resource} you're looking for doesn't exist or has been removed.`}
    variant="info"
    {...props}
  />
)

export const NetworkError = ({ onRetry, ...props }) => (
  <Error
    title="Connection lost"
    message="Unable to connect to the server. Please check your internet connection."
    showAction
    actionLabel="Reconnect"
    onAction={onRetry}
    {...props}
  />
)

export default Error