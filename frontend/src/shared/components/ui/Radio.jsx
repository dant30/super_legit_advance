import React, { useId } from 'react'
import { cn } from '@utils/cn'

const Radio = ({
  id,
  name,
  value,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  labelClassName = '',
  descriptionClassName = '',
  inputClassName = '',
  error,
  required = false,
  ...props
}) => {
  const generatedId = useId()
  const radioId = id || `radio-${generatedId}`
  const errorId = `${radioId}-error`
  const descriptionId = `${radioId}-description`

  const handleChange = (e) => {
    if (!disabled && onChange) onChange(e.target.value)
  }

  return (
    <div className={cn('relative flex items-start', className)}>
      <div className="flex items-center pt-0.5">
        <input
          id={radioId}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={cn(
            'h-4 w-4 border-gray-300 text-primary-600',
            'focus:ring-2 focus:ring-primary-500',
            'dark:border-slate-600 dark:bg-slate-800 dark:text-primary-400',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            error && 'border-danger-500 dark:border-danger-400',
            inputClassName
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : description ? descriptionId : undefined}
          {...props}
        />
      </div>

      <div className="ml-3 text-sm">
        <label
          htmlFor={radioId}
          className={cn(
            'font-medium text-gray-700 dark:text-gray-300',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
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

        {error && (
          <p id={errorId} className="ui-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export const RadioGroup = ({
  name,
  value,
  onChange,
  label,
  description,
  error,
  children,
  className = '',
  labelClassName = '',
  descriptionClassName = '',
  required = false,
  orientation = 'vertical',
}) => {
  const legendId = `${name}-legend`
  const descriptionId = `${name}-description`
  const errorId = `${name}-error`

  return (
    <fieldset className={cn(className)}>
      {(label || description) && (
        <div className="mb-2">
          {label && (
            <legend id={legendId} className={cn('text-sm font-medium text-gray-700 dark:text-gray-300', labelClassName)}>
              {label}
              {required && <span className="ml-1 text-danger-500">*</span>}
            </legend>
          )}

          {description && (
            <p id={descriptionId} className={cn('text-sm text-gray-500 dark:text-gray-400', descriptionClassName)}>
              {description}
            </p>
          )}
        </div>
      )}

      <div
        className={cn('space-y-3', orientation === 'horizontal' && 'flex flex-wrap gap-6 space-y-0')}
        role="radiogroup"
        aria-labelledby={label ? legendId : undefined}
        aria-describedby={error ? errorId : description ? descriptionId : undefined}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child
          return React.cloneElement(child, {
            name,
            checked: child.props.value === value,
            onChange,
          })
        })}
      </div>

      {error && (
        <p id={errorId} className="ui-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default Radio
