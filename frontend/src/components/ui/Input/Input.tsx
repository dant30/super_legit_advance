// frontend/src/components/ui/Input/Input.tsx
import React, { forwardRef } from 'react'
import clsx from 'clsx'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  help?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  onIconClick?: () => void
  prefix?: string
  suffix?: string
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      help,
      icon: Icon,
      iconPosition = 'left',
      onIconClick,
      prefix,
      suffix,
      fullWidth = true,
      size = 'md',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasLeft = !!prefix || (Icon && iconPosition === 'left')
    const hasRight = !!suffix || (Icon && iconPosition === 'right')

    return (
      <div className={clsx(fullWidth && 'w-full', 'space-y-1')}>
        {label && <label className="form-label">{label}</label>}

        <div className="relative">
          {/* Prefix */}
          {prefix && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 text-sm pointer-events-none">
              {prefix}
            </span>
          )}

          {/* Icon Left */}
          {Icon && iconPosition === 'left' && (
            <span
              onClick={onIconClick}
              className={clsx(
                'absolute inset-y-0 left-0 flex items-center pl-3',
                onIconClick ? 'cursor-pointer' : 'pointer-events-none',
                error ? 'text-danger-500' : 'text-neutral-400'
              )}
            >
              <Icon size={18} />
            </span>
          )}

          <input
            ref={ref}
            disabled={disabled}
            {...props}
            className={clsx(
              'form-input',
              sizeClasses[size],
              hasLeft && 'pl-10',
              hasRight && 'pr-10',
              error && 'border-danger-500 focus:ring-danger-200',
              disabled && 'opacity-60 cursor-not-allowed',
              className
            )}
          />

          {/* Icon Right */}
          {Icon && iconPosition === 'right' && (
            <span
              onClick={onIconClick}
              className={clsx(
                'absolute inset-y-0 right-0 flex items-center pr-3',
                onIconClick ? 'cursor-pointer' : 'pointer-events-none',
                error ? 'text-danger-500' : 'text-neutral-400'
              )}
            >
              <Icon size={18} />
            </span>
          )}

          {/* Suffix */}
          {suffix && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 text-sm pointer-events-none">
              {suffix}
            </span>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}
        {help && !error && <p className="form-help">{help}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
