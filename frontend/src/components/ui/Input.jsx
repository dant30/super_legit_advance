// frontend/src/components/ui/Input.jsx
import React, { forwardRef } from 'react'
import { cn } from '@utils/cn'

export const Input = forwardRef(({
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
}, ref) => {
  const sizeClasses = {
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
        <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// Password Input Component
export const PasswordInput = forwardRef((props, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      }
      {...props}
    />
  )
})

PasswordInput.displayName = 'PasswordInput'

// Search Input Component
export const SearchInput = forwardRef((props, ref) => {
  return (
    <Input
      ref={ref}
      prefix="🔍"
      placeholder="Search..."
      {...props}
    />
  )
})

SearchInput.displayName = 'SearchInput'

export default Input