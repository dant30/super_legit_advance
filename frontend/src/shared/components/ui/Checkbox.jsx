// frontend/src/components/ui/Checkbox.jsx
import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@utils/cn'

export const Checkbox = React.forwardRef(({
  className,
  label,
  error,
  disabled,
  onCheckedChange,
  onChange,
  ...props
}, ref) => {
  return (
    <label
      className={cn(
        'group inline-flex items-center gap-3 select-none',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <span className="relative flex items-center">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className={cn(
            'peer sr-only',
            className
          )}
          {...props}
          onChange={(e) => {
            // call native onChange if provided
            onChange?.(e)
            // call the more convenient onCheckedChange with boolean
            onCheckedChange?.(e.target.checked)
          }}
        />

        {/* Box */}
        <span
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-md border',
            'border-white/20 bg-white/5',
            'transition-all duration-200 ease-out',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500',
            'peer-checked:border-emerald-500 peer-checked:bg-emerald-500',
            'peer-hover:border-white/40'
          )}
        >
          <Check
            className={cn(
              'h-3.5 w-3.5 text-black scale-0 opacity-0',
              'transition-all duration-200 ease-out',
              'peer-checked:scale-100 peer-checked:opacity-100'
            )}
            strokeWidth={3}
          />
        </span>
      </span>

      {/* Label */}
      {label && (
        <span className="text-sm text-white/80 group-hover:text-white transition-colors">
          {label}
        </span>
      )}

      {/* Error */}
      {error && (
        <span className="block text-xs text-red-400 mt-1">
          {error}
        </span>
      )}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

// Alternative Checkbox with better Tailwind integration
export const Checkbox2 = React.forwardRef(({
  label,
  description,
  error,
  className,
  containerClassName,
  checked,
  disabled = false,
  onChange,
  ...props
}, ref) => {
  return (
    <div className={cn('space-y-2', containerClassName)}>
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-primary-600',
            'focus:ring-primary-500 focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-danger-500',
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              'ml-2 text-sm font-medium',
              disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
            )}
          >
            {label}
          </label>
        )}
      </div>
      {description && (
        <p className="ml-6 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {error && (
        <p className="ml-6 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  )
})

Checkbox2.displayName = 'Checkbox2'

export default Checkbox