// frontend/src/components/ui/Select/Select.tsx
import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export interface SelectOption {
  value: string | number
  label: string
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  variant?: 'default' | 'filled'
  uiSize?: 'sm' | 'md' | 'lg'
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      variant = 'default',
      uiSize = 'md',
      className,
      disabled,
      required,
      ...selectProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)

    const sizeClasses: Record<NonNullable<SelectProps['uiSize']>, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    }

    const variantClasses = {
      default: 'border border-gray-300 dark:border-gray-600',
      filled:
        'bg-gray-100 dark:bg-gray-900 border-b-2 border-gray-400 dark:border-gray-600',
    }

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            {label}
            {required && <span className="ml-1 text-danger-600">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            required={required}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={clsx(
              'w-full appearance-none rounded-lg transition-colors',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-white',
              'disabled:cursor-not-allowed disabled:opacity-50',
              sizeClasses[uiSize],
              variantClasses[variant],
              error
                ? 'border-danger-500'
                : isFocused
                ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-900'
                : '',
              className
            )}
            {...selectProps}
          >
            <option value="">Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>

        {error && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
