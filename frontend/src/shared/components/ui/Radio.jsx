// frontend/src/components/ui/Radio.jsx
import React from 'react'

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
  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <div className={`relative flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={id}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={`h-4 w-4 border-gray-300 dark:border-gray-600 text-primary-600 dark:text-primary-500 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-2 ${
            disabled
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50'
              : 'bg-white dark:bg-gray-800 cursor-pointer'
          } ${error ? 'border-red-500 dark:border-red-400' : ''} ${inputClassName}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
          {...props}
        />
      </div>

      <div className="ml-3 text-sm">
        <label
          htmlFor={id}
          className={`font-medium text-gray-700 dark:text-gray-300 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>

        {description && (
          <p
            id={`${id}-description`}
            className={`text-gray-500 dark:text-gray-400 ${
              disabled ? 'opacity-50' : ''
            } ${descriptionClassName}`}
          >
            {description}
          </p>
        )}

        {error && (
          <p
            id={`${id}-error`}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

// Radio Group Component
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
  orientation = 'vertical', // 'vertical' or 'horizontal'
}) => {
  return (
    <div className={className}>
      {(label || description) && (
        <div className="mb-2">
          {label && (
            <legend className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}>
              {label}
              {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
            </legend>
          )}
          
          {description && (
            <p className={`text-sm text-gray-500 dark:text-gray-400 ${descriptionClassName}`}>
              {description}
            </p>
          )}
        </div>
      )}

      <div
        className={`space-y-3 ${orientation === 'horizontal' ? 'flex flex-wrap gap-6' : ''}`}
        role="radiogroup"
        aria-labelledby={label ? `${name}-label` : undefined}
        aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              name,
              checked: child.props.value === value,
              onChange,
            })
          }
          return child
        })}
      </div>

      {error && (
        <p
          id={`${name}-error`}
          className="mt-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}


export default Radio