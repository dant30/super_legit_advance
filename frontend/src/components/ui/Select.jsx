// frontend/src/components/ui/Select.jsx
import React, { useId, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@utils/cn'

/**
 * @typedef {Object} SelectOption
 * @property {string|number} value
 * @property {string} label
 * @property {boolean} [disabled]
 */

/**
 * @typedef {Object} SelectProps
 * @property {string} [label]
 * @property {string} [hint]
 * @property {string} [error]
 * @property {SelectOption[]} [options]
 * @property {string} [placeholder]
 * @property {'sm'|'md'|'lg'} [size]
 * @property {'outline'|'filled'|'ghost'} [variant]
 * @property {boolean} [fullWidth]
 * @property {boolean} [disabled]
 * @property {boolean} [required]
 * @property {React.ReactNode} [startIcon]
 * @property {React.ReactNode} [endIcon]
 * @property {string} [id]
 * @property {(value: string) => void} [onValueChange]
 */

export const Select = React.forwardRef(
  (
    {
      label,
      hint,
      error,
      options = [],
      placeholder = 'Select an option',
      size = 'md',
      variant = 'outline',
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
    const reactId = useId()
    const selectId = id || `select-${reactId}`
    const errorId = `${selectId}-error`
    const hintId = `${selectId}-hint`

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base',
    }

    const variantClasses = {
      outline: 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800',
      filled: 'border-transparent bg-gray-50 dark:bg-slate-700',
      ghost: 'border-transparent bg-transparent',
    }

    const describedBy = useMemo(() => {
      if (error) return errorId
      if (hint) return hintId
      return undefined
    }, [error, hint, errorId, hintId])

    const handleChange = (e) => {
      onChange?.(e)
      onValueChange?.(e.target.value)
    }

    return (
      <div className={cn(fullWidth && 'w-full', className)}>
        {label && (
          <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
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
            className={cn(
              'w-full appearance-none rounded-lg transition-all',
              'text-gray-900 dark:text-gray-100',
              'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-slate-800/50',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              sizeClasses[size],
              variantClasses[variant],
              startIcon && 'pl-10',
              'pr-10',
              error && 'border-danger-500 focus:ring-danger-500'
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            {...selectProps}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}

            {options.map((opt) => (
              <option
                key={String(opt.value)}
                value={opt.value}
                disabled={opt.disabled}
                className={opt.disabled ? 'text-gray-400 dark:text-gray-600' : ''}
              >
                {opt.label}
              </option>
            ))}
          </select>

          {endIcon ? (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {endIcon}
            </div>
          ) : (
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          )}
        </div>

        {error && (
          <p id={errorId} className="mt-1 text-sm text-danger-600 dark:text-danger-400" role="alert">
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

Select.displayName = 'Select'

export const SelectSm = (props) => <Select size="sm" {...props} />
SelectSm.displayName = 'SelectSm'

export const SelectLg = (props) => <Select size="lg" {...props} />
SelectLg.displayName = 'SelectLg'

export default Select
