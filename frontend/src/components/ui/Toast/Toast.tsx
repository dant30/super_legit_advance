import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id?: string
  title?: string            // made optional for provider compatibility
  description?: string
  type?: ToastType
  duration?: number
  onClose?: () => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  showCloseButton?: boolean
}

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  type = 'info',
  duration = 5000,
  onClose,
  position = 'top-right',
  showCloseButton = true,
}) => {
  const [isClosing, setIsClosing] = useState(false)

  const iconMap = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertCircle,
  }

  const Icon = iconMap[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  const typeClasses = {
    success: 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
    error: 'bg-danger-50 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    warning: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
  }

  const iconColorClasses = {
    success: 'text-success-600 dark:text-success-400',
    error: 'text-danger-600 dark:text-danger-400',
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-warning-600 dark:text-warning-400',
  }

  return (
    <div
      id={id}
      className={cn(
        'fixed z-[9999] w-full max-w-sm animate-slide-up',
        positionClasses[position],
        isClosing && 'animate-fade-out'
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div
        className={cn(
          'rounded-lg border p-4 shadow-hard transition-transform duration-300',
          typeClasses[type]
        )}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', iconColorClasses[type])} />
          </div>
          <div className="ml-3 flex-1">
            <p
              className={cn(
                'text-sm font-medium',
                type === 'success' && 'text-success-800 dark:text-success-300',
                type === 'error' && 'text-danger-800 dark:text-danger-300',
                type === 'info' && 'text-blue-800 dark:text-blue-300',
                type === 'warning' && 'text-warning-800 dark:text-warning-300'
              )}
            >
              {title}
            </p>
            {description && (
              <p
                className={cn(
                  'mt-1 text-sm',
                  type === 'success' && 'text-success-700 dark:text-success-400',
                  type === 'error' && 'text-danger-700 dark:text-danger-400',
                  type === 'info' && 'text-blue-700 dark:text-blue-400',
                  type === 'warning' && 'text-warning-700 dark:text-warning-400'
                )}
              >
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                'ml-4 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md transition-colors',
                type === 'success' && 'text-success-500 hover:bg-success-100 dark:hover:bg-success-900',
                type === 'error' && 'text-danger-500 hover:bg-danger-100 dark:hover:bg-danger-900',
                type === 'info' && 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900',
                type === 'warning' && 'text-warning-500 hover:bg-warning-100 dark:hover:bg-warning-900'
              )}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {duration > 0 && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={cn(
                'h-full transition-all duration-100 ease-linear',
                type === 'success' && 'bg-success-500',
                type === 'error' && 'bg-danger-500',
                type === 'info' && 'bg-blue-500',
                type === 'warning' && 'bg-warning-500'
              )}
              style={{
                width: isClosing ? '0%' : '100%',
                transitionDuration: `${duration}ms`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Toast