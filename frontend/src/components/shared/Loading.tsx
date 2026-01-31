// frontend/src/components/shared/Loading.tsx
import React from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  fullScreen?: boolean
  inline?: boolean
  className?: string
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  inline = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  const spinner = (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-2',
        !inline && 'p-6',
        className
      )}
    >
      <Loader2
        className={clsx(
          sizeClasses[size],
          'animate-spin text-primary-600 dark:text-primary-400',
          inline && 'inline-block'
        )}
        aria-hidden="true"
      />
      {text && (
        <p
          className={clsx(
            'mt-2 text-sm text-gray-600 dark:text-gray-400 text-center',
            inline && 'ml-2'
          )}
        >
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
        role="status"
        aria-label="Loading"
      >
        {spinner}
      </div>
    )
  }

  if (inline) {
    return (
      <div className="inline-flex items-center gap-2">
        <Loader2
          className={clsx(
            sizeClasses[size],
            'animate-spin text-primary-600 dark:text-primary-400'
          )}
          aria-hidden="true"
        />
        {text && <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>}
      </div>
    )
  }

  return spinner
}

// export default Loading