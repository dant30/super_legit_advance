// frontend/src/components/ui/Input/Input.tsx
import React, { forwardRef } from 'react'
import clsx from 'clsx'
import { LucideIcon } from 'lucide-react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            px-3 py-2 border rounded-lg
            bg-white dark:bg-gray-700
            text-gray-900 dark:text-white
            border-gray-300 dark:border-gray-600
            focus:outline-none focus:ring-2 focus:ring-primary-500
            disabled:bg-gray-100 dark:disabled:bg-gray-800
            disabled:cursor-not-allowed
            ${error ? 'border-danger-500' : ''}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
