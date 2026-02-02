// frontend/src/components/shared/Loading.jsx
import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@utils/cn'

/**
 * Main Loading Component
 * Supports spinner, dots, pulse, full-screen, inline, and custom messages
 */
export const Loading = ({
  message,
  size = 'md',
  fullScreen = false,
  inline = false,
  className,
  withBackdrop = true,
  variant = 'spinner', // 'spinner' | 'dots' | 'pulse'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex items-center justify-center space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-primary-600 animate-pulse',
                  size === 'sm' && 'h-2 w-2',
                  size === 'md' && 'h-3 w-3',
                  size === 'lg' && 'h-4 w-4',
                  size === 'xl' && 'h-5 w-5'
                )}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )

      case 'pulse':
        return (
          <div className="relative">
            <div className={cn('rounded-full bg-primary-600 opacity-75', sizeClasses[size])} />
            <div
              className={cn(
                'absolute inset-0 rounded-full bg-primary-600 animate-ping',
                sizeClasses[size]
              )}
            />
          </div>
        )

      default: // spinner
        return (
          <Loader2
            className={cn(
              sizeClasses[size],
              'animate-spin text-primary-600 dark:text-primary-400',
              inline && 'inline-block'
            )}
            aria-hidden="true"
          />
        )
    }
  }

  const content = (
    <>
      {renderVariant()}
      {message && (
        <span
          className={cn(
            'text-sm text-neutral-600 dark:text-neutral-400',
            inline ? 'ml-2' : 'mt-2 text-center'
          )}
        >
          {message}
        </span>
      )}
    </>
  )

  if (fullScreen) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          withBackdrop && 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm'
        )}
        role="status"
        aria-label="Loading"
      >
        <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
          {content}
        </div>
      </div>
    )
  }

  if (inline) {
    return <div className={cn('inline-flex items-center gap-2', className)}>{content}</div>
  }

  return <div className={cn('flex flex-col items-center justify-center p-8', className)}>{content}</div>
}

/**
 * Skeleton Loader Component
 */
export const Skeleton = ({
  className,
  count = 1,
  height = 20,
  width,
  circle = false,
  rounded = true,
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn(
        'animate-pulse bg-neutral-200 dark:bg-neutral-700',
        circle && 'rounded-full',
        rounded && !circle && 'rounded-lg',
        className
      )}
      style={{
        height: `${height}px`,
        width: width ? `${width}px` : '100%',
        ...(circle && { width: `${height}px` }),
      }}
    />
  ))

  return count === 1 ? skeletons[0] : <div className="space-y-3">{skeletons}</div>
}

/**
 * Loading Overlay for async content
 */
export const LoadingOverlay = ({
  isLoading,
  children,
  message = 'Loading...',
  backdropClassName,
}) => {
  if (!isLoading) return children

  return (
    <div className="relative">
      <div
        className={cn(
          'absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-neutral-900/50',
          backdropClassName
        )}
      >
        <Loading message={message} size="md" />
      </div>
      <div className="opacity-50 pointer-events-none">{children}</div>
    </div>
  )
}

export default Loading
