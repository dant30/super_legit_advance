// frontend/src/components/ui/Select.jsx
import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@utils/cn'

export const Select = React.forwardRef(({
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
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
  const errorId = `${selectId}-error`
  const helperId = `${selectId}-helper`

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  }

  const variantClasses = {
    default: cn(
      'bg-white dark:bg-gray-800',
      'border border-gray-300 dark:border-gray-600',
      'hover:border-gray-400 dark:hover:border-gray-500'
    ),
    filled: cn(
      'bg-gray-50 dark:bg-gray-800/50',
      'border border-gray-200 dark:border-gray-700'
    ),
    outline: cn(
      'bg-transparent',
      'border-2 border-gray-300 dark:border-gray-600',
      'hover:border-gray-400 dark:hover:border-gray-500'
    ),
  }

  const handleChange = (e) => {
    onChange?.(e)
    onValueChange?.(e.target.value)
  }

  // Build aria-describedby string
  const describedBy = []
  if (error) describedBy.push(errorId)
  if (helperText && !error) describedBy.push(helperId)
  const ariaDescribedBy = describedBy.length > 0 ? describedBy.join(' ') : undefined

  return (
    <div className={cn(fullWidth && 'w-full', className)}>
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'w-full appearance-none rounded-lg transition-all',
            'text-gray-900 dark:text-gray-100',
            'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800/50',
            'focus:outline-none focus:ring-2',
            sizeClasses[uiSize],
            variantClasses[variant],
            startIcon && 'pl-10',
            endIcon ? 'pr-10' : 'pr-10',
            error
              ? cn(
                  'border-red-500 dark:border-red-400',
                  'focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30'
                )
              : isFocused
              ? cn(
                  'border-primary-500 dark:border-primary-400',
                  'focus:ring-primary-200 dark:focus:ring-primary-900/30'
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
          <ChevronDown
            className={cn(
              'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500',
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
})

Select.displayName = 'Select'

// Variant exports for convenience
export const SelectSm = (props) => (
  <Select uiSize="sm" {...props} />
)

SelectSm.displayName = 'SelectSm'

export const SelectLg = (props) => (
  <Select uiSize="lg" {...props} />
)

SelectLg.displayName = 'SelectLg'

// Multi-select component
export const MultiSelect = ({
  label,
  options,
  selected = [],
  onChange,
  placeholder = "Select options...",
  className,
  ...props
}) => {
  const handleSelectChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value)
    onChange?.(selectedValues)
  }

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        multiple
        value={selected}
        onChange={handleSelectChange}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500"
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="px-3 py-2"
          >
            {option.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Hold Ctrl (or Cmd on Mac) to select multiple options
      </p>
    </div>
  )
}

MultiSelect.displayName = 'MultiSelect'

export default Select