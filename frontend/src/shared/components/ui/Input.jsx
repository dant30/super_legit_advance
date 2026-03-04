// frontend/src/components/ui/Input.jsx
import React, { forwardRef, useId, useState } from 'react'
import { cn } from '@utils/cn'

/**
 * @typedef {Object} InputProps
 * @property {string} [label]
 * @property {string} [hint]
 * @property {string} [error]
 * @property {'sm'|'md'|'lg'} [size]
 * @property {'outline'|'filled'|'ghost'} [variant]
 * @property {boolean} [fullWidth]
 * @property {React.ReactNode} [prefix]
 * @property {React.ReactNode} [suffix]
 * @property {React.ReactNode} [action]
 * @property {string} [className]
 * @property {string} [containerClassName]
 * @property {boolean} [disabled]
 * @property {string} [id]
 * @property {string} [type]
 */

const Input = forwardRef(
  (
    {
      label,
      hint,
      error,
      size = 'md',
      variant = 'outline',
      fullWidth = true,
      prefix,
      suffix,
      action,
      className,
      containerClassName,
      disabled,
      id,
      type = 'text',
      onPressEnter,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const reactId = useId()
    const inputId = id || `input-${reactId}`
    const hintId = `${inputId}-hint`
    const errorId = `${inputId}-error`

    const sizeClasses = {
      sm: 'h-9 text-sm',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    }

    const variantClasses = {
      outline: 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800',
      filled: 'border-transparent bg-gray-50 dark:bg-slate-700',
      ghost: 'border-transparent bg-transparent',
    }

    const describedBy = error ? errorId : hint ? hintId : undefined

    const handleKeyDown = (e) => {
      if (typeof onKeyDown === 'function') {
        onKeyDown(e)
      }
      if (typeof onPressEnter === 'function' && (e.key === 'Enter' || e.keyCode === 13)) {
        onPressEnter(e)
      }
    }

    return (
      <div className={cn(fullWidth && 'w-full', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        <div
          className={cn(
            'relative flex items-center rounded-lg border transition-all',
            'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
            variantClasses[variant],
            error && 'border-danger-500 focus-within:ring-danger-500',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          {prefix && <span className="pl-3 flex items-center text-gray-400">{prefix}</span>}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className={cn(
              'w-full bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500',
              'text-gray-900 dark:text-white',
              sizeClasses[size],
              prefix ? 'pl-2' : 'pl-3',
              suffix || action ? 'pr-2' : 'pr-3',
              className
            )}
            onKeyDown={handleKeyDown}
            {...props}
          />

          {suffix && <span className="pr-3 flex items-center text-gray-400">{suffix}</span>}

          {action && <span className="pr-2 flex items-center">{action}</span>}
        </div>

        {error && (
          <p id={errorId} className="mt-1 text-sm text-danger-600 dark:text-danger-400">
            {error}
          </p>
        )}

        {!error && hint && (
          <p id={hintId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export const PasswordInput = forwardRef((props, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      }
      {...props}
    />
  )
})

PasswordInput.displayName = 'PasswordInput'

export const SearchInput = forwardRef((props, ref) => (
  <Input ref={ref} placeholder="Search..." {...props} />
))

SearchInput.displayName = 'SearchInput'

export default Input
