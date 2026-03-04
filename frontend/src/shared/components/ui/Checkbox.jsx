import React, { useId } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@utils/cn'

export const Checkbox = React.forwardRef(
  (
    { className, label, description, error, disabled, id, checked, onCheckedChange, onChange, required, ...props },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || `checkbox-${generatedId}`
    const errorId = `${inputId}-error`
    const descriptionId = `${inputId}-description`

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className={cn('group inline-flex items-start gap-3 select-none', disabled && 'cursor-not-allowed opacity-60')}
        >
          <span className="relative mt-0.5 flex items-center">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              required={required}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? errorId : description ? descriptionId : undefined}
              className={cn('peer sr-only', className)}
              {...props}
              onChange={(e) => {
                onChange?.(e)
                onCheckedChange?.(e.target.checked)
              }}
            />

            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-md border transition-all',
                'border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-800',
                'peer-checked:border-primary-600 peer-checked:bg-primary-600',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2',
                'group-hover:border-primary-400 dark:group-hover:border-primary-500'
              )}
            >
              <Check
                className={cn(
                  'h-3.5 w-3.5 text-white scale-0 opacity-0 transition-all',
                  'peer-checked:scale-100 peer-checked:opacity-100'
                )}
                strokeWidth={3}
              />
            </span>
          </span>

          {(label || description) && (
            <span className="space-y-0.5">
              {label && (
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                  {required && <span className="ml-1 text-danger-500">*</span>}
                </span>
              )}
              {description && (
                <span id={descriptionId} className="block text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </span>
              )}
            </span>
          )}
        </label>

        {error && (
          <p id={errorId} className="ui-error" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export const Checkbox2 = Checkbox
Checkbox2.displayName = 'Checkbox2'

export default Checkbox
