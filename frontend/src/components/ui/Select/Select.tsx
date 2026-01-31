// frontend/src/components/ui/Select/Select.tsx
import React, { useState, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  variant?: 'default' | 'filled' | 'outline'
  uiSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  onValueChange?: (value: string) => void
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder = 'Select an option',
      variant = 'default',
      uiSize = 'md',
      className,
      disabled,
      required,
      value,
      onChange,
      onValueChange,
      fullWidth = true,
      startIcon,
      endIcon,
      id,
      ...selectProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const generatedId = useId()
    const selectId = id || generatedId
    const errorId = `${selectId}-error`
    const helperId = `${selectId}-helper`

    const sizeClasses: Record<NonNullable<typeof uiSize>, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-4 py-3 text-lg',
    }

    const variantClasses = {
      default: clsx(
        'bg-white dark:bg-gray-800',
        'border border-gray-300 dark:border-gray-600',
        'hover:border-gray-400 dark:hover:border-gray-500'
      ),
      filled: clsx(
        'bg-gray-50 dark:bg-gray-800/50',
        'border border-gray-200 dark:border-gray-700'
      ),
      outline: clsx(
        'bg-transparent',
        'border-2 border-gray-300 dark:border-gray-600',
        'hover:border-gray-400 dark:hover:border-gray-500'
      ),
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e)
      onValueChange?.(e.target.value)
    }

    // Build aria-describedby string
    const describedBy = []
    if (error) describedBy.push(errorId)
    if (helperText && !error) describedBy.push(helperId)
    const ariaDescribedBy = describedBy.length > 0 ? describedBy.join(' ') : undefined

    return (
      <div className={clsx(fullWidth && 'w-full', className)}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {startIcon}
            </div>
          )}

          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            required={required}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={clsx(
              'w-full appearance-none rounded-lg transition-all',
              'text-gray-900 dark:text-gray-100',
              'disabled:cursor-not-allowed disabled:opacity-60',
              'focus:outline-none focus:ring-2',
              sizeClasses[uiSize],
              variantClasses[variant],
              startIcon && 'pl-10',
              endIcon ? 'pr-10' : 'pr-10',
              error
                ? clsx(
                    'border-red-500 dark:border-red-400',
                    'focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30'
                  )
                : isFocused
                ? clsx(
                    'border-blue-500 dark:border-blue-400',
                    'focus:ring-blue-200 dark:focus:ring-blue-900/30'
                  )
                : ''
            )}
            {...(error && { 'aria-invalid': 'true' })}
            aria-describedby={ariaDescribedBy}
            {...selectProps}
          >
            <option value="" disabled hidden={!placeholder}>
              {placeholder}
            </option>

            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={opt.disabled ? 'text-gray-400' : ''}
              >
                {opt.label}
              </option>
            ))}
          </select>

          {endIcon ? (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {endIcon}
            </div>
          ) : (
            <ChevronDown
              className={clsx(
                'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400',
                uiSize === 'lg' && 'h-5 w-5'
              )}
            />
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

// Variant exports for convenience
export const SelectSm = (props: Omit<SelectProps, 'uiSize'>) => (
  <Select uiSize="sm" {...props} />
)

export const SelectLg = (props: Omit<SelectProps, 'uiSize'>) => (
  <Select uiSize="lg" {...props} />
)

export default Select