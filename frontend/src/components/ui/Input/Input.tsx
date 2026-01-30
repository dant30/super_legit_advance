// frontend/src/components/ui/Input/Input.tsx
import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, className, ...props },
    ref
  ) => {
    return (
      <label className="block">
        {label && (
          <span className="text-sm font-medium text-gray-700 mb-1 block">
            {label}
          </span>
        )}
        <input
          ref={ref}
          {...props}
          className={cn(
            'form-input block w-full rounded-md border px-3 py-2 transition',
            error
              ? 'border-danger-500 focus:border-danger-600'
              : 'border-gray-300 focus:border-primary-500',
            className
          )}
          aria-invalid={!!error}
        />
        {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
      </label>
    )
  }
)

Input.displayName = 'Input'

export default Input
