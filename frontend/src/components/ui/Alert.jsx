// frontend/src/components/ui/Alert.jsx
import React, { useState } from 'react'
import { cn } from '@utils/cn'
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react'

/**
 * @typedef {Object} AlertProps
 * @property {'info'|'success'|'warning'|'danger'} [variant]
 * @property {'sm'|'md'|'lg'} [size]
 * @property {string|React.ReactNode} [title]
 * @property {string|React.ReactNode} [description]
 * @property {boolean} [dismissible]
 * @property {() => void} [onDismiss]
 * @property {boolean} [showIcon]
 * @property {boolean} [showBorder]
 * @property {string} [className]
 */

const Alert = ({
  className,
  variant = 'info',
  size = 'md',
  title,
  description,
  dismissible = false,
  onDismiss,
  showIcon = true,
  showBorder = true,
  children,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  const iconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    danger: XCircle,
  }

  const Icon = iconMap[variant]

  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    success: 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
    warning: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
    danger: 'bg-danger-50 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800',
  }

  const textClasses = {
    info: {
      title: 'text-blue-800 dark:text-blue-300',
      description: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500 dark:text-blue-400',
      dismiss: 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900',
    },
    success: {
      title: 'text-success-800 dark:text-success-300',
      description: 'text-success-700 dark:text-success-400',
      icon: 'text-success-600 dark:text-success-400',
      dismiss: 'text-success-500 hover:bg-success-100 dark:hover:bg-success-900',
    },
    warning: {
      title: 'text-warning-800 dark:text-warning-300',
      description: 'text-warning-700 dark:text-warning-400',
      icon: 'text-warning-600 dark:text-warning-400',
      dismiss: 'text-warning-500 hover:bg-warning-100 dark:hover:bg-warning-900',
    },
    danger: {
      title: 'text-danger-800 dark:text-danger-300',
      description: 'text-danger-700 dark:text-danger-400',
      icon: 'text-danger-600 dark:text-danger-400',
      dismiss: 'text-danger-500 hover:bg-danger-100 dark:hover:bg-danger-900',
    },
  }

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4',
    lg: 'p-5',
  }

  const content = children || (
    <div className="flex items-start">
      {showIcon && (
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', textClasses[variant].icon)} />
      )}
      <div className={cn('flex-1', showIcon && 'ml-3')}>
        {title && <h3 className={cn('font-medium', textClasses[variant].title)}>{title}</h3>}
        {description && <div className={cn('mt-1', textClasses[variant].description)}>{description}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            'ml-3 inline-flex h-5 w-5 items-center justify-center rounded-md transition-colors',
            textClasses[variant].dismiss
          )}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )

  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border transition-all duration-200',
        variantClasses[variant],
        sizeClasses[size],
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
