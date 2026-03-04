import React, { useId } from 'react'
import { cn } from '@utils/cn'

const Switch = ({
  id,
  name,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  loading = false,
  className = '',
  labelClassName = '',
  descriptionClassName = '',
  error,
  required = false,
  size = 'md',
  labelPosition = 'right',
  ...props
}) => {
  const generatedId = useId()
  const switchId = id || `switch-${generatedId}`
  const descriptionId = `${switchId}-description`
  const errorId = `${switchId}-error`

  const sizeClasses = {
    sm: {
      track: 'h-5 w-9',
      thumb: 'h-4 w-4',
      transform: checked ? 'translate-x-4' : 'translate-x-0.5',
    },
    md: {
      track: 'h-6 w-11',
      thumb: 'h-5 w-5',
      transform: checked ? 'translate-x-5' : 'translate-x-0.5',
    },
    lg: {
      track: 'h-7 w-14',
      thumb: 'h-6 w-6',
      transform: checked ? 'translate-x-7' : 'translate-x-0.5',
    },
  }

  const currentSize = sizeClasses[size]

  const handleChange = (nextChecked) => {
    if (!disabled && !loading) onChange?.(nextChecked)
  }

  return (
    <div className={cn('flex items-start', className)}>
      {label && labelPosition === 'left' && (
        <div className="mr-3 text-sm">
          <label
            htmlFor={switchId}
            className={cn(
              'font-medium text-gray-700 dark:text-gray-300',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              labelClassName
            )}
          >
            {label}
            {required && <span className="ml-1 text-danger-500">*</span>}
          </label>
          {description && (
            <p id={descriptionId} className={cn('text-gray-500 dark:text-gray-400', disabled && 'opacity-50', descriptionClassName)}>
              {description}
            </p>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        <input
          id={switchId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => handleChange(e.target.checked)}
          disabled={disabled || loading}
          required={required}
          role="switch"
          className="peer sr-only"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : description ? descriptionId : undefined}
          {...props}
        />

        <button
          type="button"
          onClick={() => handleChange(!checked)}
          disabled={disabled || loading}
          className={cn(
            currentSize.track,
            'relative rounded-full transition-colors ui-focus',
            checked ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-slate-600',
            disabled || loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            error && 'ring-2 ring-danger-500'
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              currentSize.thumb,
              currentSize.transform,
              'absolute top-0.5 rounded-full bg-white shadow-md transition-transform'
            )}
          />
        </button>
      </div>

      {label && labelPosition === 'right' && (
        <div className="ml-3 text-sm">
          <label
            htmlFor={switchId}
            className={cn(
              'font-medium text-gray-700 dark:text-gray-300',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              labelClassName
            )}
          >
            {label}
            {required && <span className="ml-1 text-danger-500">*</span>}
          </label>
          {description && (
            <p id={descriptionId} className={cn('text-gray-500 dark:text-gray-400', disabled && 'opacity-50', descriptionClassName)}>
              {description}
            </p>
          )}
        </div>
      )}

      {error && (
        <p id={errorId} className="ml-2 ui-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export const SwitchGroup = ({
  label,
  description,
  error,
  children,
  className = '',
  labelClassName = '',
  descriptionClassName = '',
  required = false,
}) => {
  return (
    <fieldset className={className}>
      {(label || description) && (
        <div className="mb-3">
          {label && (
            <legend className={cn('text-sm font-medium text-gray-700 dark:text-gray-300', labelClassName)}>
              {label}
              {required && <span className="ml-1 text-danger-500">*</span>}
            </legend>
          )}
          {description && <p className={cn('text-sm text-gray-500 dark:text-gray-400', descriptionClassName)}>{description}</p>}
        </div>
      )}
      <div className="space-y-3">{children}</div>
      {error && (
        <p className="ui-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default Switch
