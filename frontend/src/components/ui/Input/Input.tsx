// frontend/src/components/ui/Input/Input.tsx
import React, { forwardRef } from 'react'
import clsx from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { error, label, helperText, className, type = 'text', ...props },
    ref
  ) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={clsx(
          'w-full px-3 py-2 border rounded-md',
          'text-gray-900 dark:text-white',
          'bg-white dark:bg-gray-800',
          'border-gray-300 dark:border-gray-600',
          'placeholder-gray-400 dark:placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          error && 'border-danger-500 focus:ring-danger-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      {helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  )
)

Input.displayName = 'Input'
