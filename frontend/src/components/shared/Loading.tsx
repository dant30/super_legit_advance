// frontend/src/components/shared/Loading.tsx
import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl'

export interface LoadingProps {
  /** Loading message/text */
  message?: string
  /** Size of loading spinner */
  size?: LoadingSize
  /** Show full screen loading overlay */
  fullScreen?: boolean
  /** Display inline (no container) */
  inline?: boolean
  /** Additional className */
  className?: string
  /** Show backdrop */
  withBackdrop?: boolean
}

export const Loading: React.FC<LoadingProps> = ({
  message,
  size = 'md',
  fullScreen = false,
  inline = false,
  className,
  withBackdrop = true,
}) => {
  const sizeClasses: Record<LoadingSize, string> = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  const spinner = (
    <>
      <Loader2
        className={cn(
          sizeClasses[size],
          'animate-spin text-primary-600 dark:text-primary-400',
          inline && 'inline-block'
        )}
        aria-hidden="true"
      />
      {message && (
        <span className={cn(
          'text-sm text-gray-600 dark:text-gray-400',
          !inline && 'mt-2 text-center',
          inline && 'ml-2'
        )}>
          {message}
        </span>
      )}
    </>
  )

  if (fullScreen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          withBackdrop && "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
        )}
        role="status"
        aria-label="Loading"
      >
        <div className={cn(
          'flex flex-col items-center justify-center gap-2',
          className
        )}>
          {spinner}
        </div>
      </div>
    )
  }

  if (inline) {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        {spinner}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-6', className)}>
      {spinner}
    </div>
  )
}
// export default Loading