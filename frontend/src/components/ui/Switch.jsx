// frontend/src/components/ui/switch.jsx
import React from 'react'

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
  size = 'md', // 'sm', 'md', 'lg'
  labelPosition = 'right', // 'left' or 'right'
  ...props
}) => {
  const handleChange = (e) => {
    if (!disabled && !loading && onChange) {
      onChange(e.target.checked)
    }
  }

  const sizeClasses = {
    sm: {
      switch: 'h-5 w-9',
      dot: 'h-4 w-4',
      dotTransform: checked ? 'translate-x-4' : 'translate-x-0.5',
      dotPosition: 'top-0.5',
    },
    md: {
      switch: 'h-6 w-11',
      dot: 'h-5 w-5',
      dotTransform: checked ? 'translate-x-5' : 'translate-x-0.5',
      dotPosition: 'top-0.5',
    },
    lg: {
      switch: 'h-7 w-14',
      dot: 'h-6 w-6',
      dotTransform: checked ? 'translate-x-7' : 'translate-x-0.5',
      dotPosition: 'top-0.5',
    },
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`flex items-start ${className}`}>
      {/* Label on the left */}
      {label && labelPosition === 'left' && (
        <div className="mr-3 text-sm">
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
        </div>
      )}

      <div className="relative flex items-center">
        {/* Hidden checkbox */}
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled || loading}
          required={required}
          className="sr-only"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
          {...props}
        />

        {/* Switch track */}
        <div
          className={`${currentSize.switch} flex items-center rounded-full transition-colors duration-200 ease-in-out ${
            checked
              ? 'bg-primary-600 dark:bg-primary-500'
              : 'bg-gray-300 dark:bg-gray-600'
          } ${
            disabled || loading
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          } ${error ? 'ring-2 ring-red-500 dark:ring-red-400' : ''}`}
          onClick={() => {
            if (!disabled && !loading) {
              handleChange({ target: { checked: !checked } })
            }
          }}
          aria-hidden="true"
        >
          {/* Switch dot */}
          <div
            className={`
              ${currentSize.dot}
              ${currentSize.dotPosition}
              absolute rounded-full bg-white dark:bg-gray-100
              shadow-lg transform transition-transform duration-200 ease-in-out
              ${currentSize.dotTransform}
              ${loading ? 'opacity-50' : ''}
            `}
          >
            {/* Loading spinner */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>

        {/* Status indicators (optional) */}
        {size === 'lg' && (
          <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
            <span
              className={`text-xs font-medium ${
                checked
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              ON
            </span>
            <span
              className={`text-xs font-medium ${
                !checked
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              OFF
            </span>
          </div>
        )}
      </div>

      {/* Label on the right (default) */}
      {label && labelPosition === 'right' && (
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
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-1">
          <p
            id={`${id}-error`}
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        </div>
      )}
    </div>
  )
}

// Switch Group Component
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
    <div className={className}>
      {(label || description) && (
        <div className="mb-3">
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

      <div className="space-y-3">
        {children}
      </div>

      {error && (
        <p
          className="mt-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}


export default Switch