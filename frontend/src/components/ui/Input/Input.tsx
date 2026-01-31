// frontend/src/components/ui/Input/Input.tsx
import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

type InputSize = 'sm' | 'md' | 'lg'

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string

  /** UI extensions */
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  action?: React.ReactNode

  uiSize?: InputSize
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      prefix,
      suffix,
      action,
      uiSize = 'md',
      fullWidth = true,
      className,
      disabled,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const sizeClasses: Record<InputSize, string> = {
      sm: 'h-9 text-sm',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    }

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        <div
          className={cn(
            'relative flex items-center rounded-md border bg-white dark:bg-gray-800',
            'border-gray-300 dark:border-gray-600',
            'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
            error && 'border-danger-500 focus-within:ring-danger-500',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          {/* Prefix */}
          {prefix && (
            <span className="pl-3 flex items-center text-gray-400">
              {prefix}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              'w-full bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500',
              'text-gray-900 dark:text-white',
              sizeClasses[uiSize],
              prefix ? 'pl-2' : 'pl-3',
              suffix || action ? 'pr-2' : 'pr-3',
              className
            )}
            {...props}
          />

          {/* Suffix */}
          {suffix && (
            <span className="pr-3 flex items-center text-gray-400">
              {suffix}
            </span>
          )}

          {/* Action */}
          {action && (
            <span className="pr-2 flex items-center">
              {action}
            </span>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        )}

        {!error && helperText && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input