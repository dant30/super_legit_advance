// frontend/src/components/ui/Input/Input.tsx
import React, { forwardRef } from 'react'
import clsx from 'clsx'
import { LucideIcon } from 'lucide-react'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helpText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      size = 'md',
      label,
      error,
      helpText,
      icon: Icon,
      iconPosition = 'left',
      onIconClick,
      prefix,
      suffix,
      fullWidth = true,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    }

    const hasLeft = !!prefix || (Icon && iconPosition === 'left')
    const hasRight = !!suffix || (Icon && iconPosition === 'right')

    return (
      <div className={clsx(fullWidth && 'w-full', 'space-y-1')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          {/* Prefix */}
          {prefix && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 text-sm pointer-events-none">
              {prefix}
            </span>
          )}

          {/* Icon Left */}
          {Icon && iconPosition === 'left' && (
            <span
              onClick={onIconClick}
              className={clsx(
                'absolute inset-y-0 left-0 flex items-center pl-3',
                onIconClick ? 'cursor-pointer' : 'pointer-events-none',
                error ? 'text-danger-500' : 'text-neutral-400'
              )}
            >
              <Icon size={18} />
            </span>
          )}

          <input
            ref={ref}
            {...props}
            className={clsx(
              'w-full rounded-lg border',
              sizeClasses[size],
              hasLeft && 'pl-10',
              hasRight && 'pr-10',
              error ? 'border-red-500' : 'border-gray-300',
              className
            )}
          />

          {/* Icon Right */}
          {Icon && iconPosition === 'right' && (
            <span
              onClick={onIconClick}
              className={clsx(
                'absolute inset-y-0 right-0 flex items-center pr-3',
                onIconClick ? 'cursor-pointer' : 'pointer-events-none',
                error ? 'text-danger-500' : 'text-neutral-400'
              )}
            >
              <Icon size={18} />
            </span>
          )}

          {/* Suffix */}
          {suffix && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 text-sm pointer-events-none">
              {suffix}
            </span>
          )}
        </div>

        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        {helpText && !error && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
