// frontend/src/components/ui/Button.jsx
import React from 'react'
import { cn } from '@utils/cn'

/**
 * @typedef {Object} ButtonProps
 * @property {'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'|'warning'|'info'} [variant]
 * @property {'xs'|'sm'|'md'|'lg'|'icon'} [size]
 * @property {boolean} [loading]
 * @property {string} [loadingText]
 * @property {boolean} [fullWidth]
 * @property {React.ReactNode} [leadingIcon]
 * @property {React.ReactNode} [trailingIcon]
 * @property {boolean} [disabled]
 * @property {React.ReactNode} [children]
 * @property {string} [className]
 * @property {'button'|'submit'|'reset'} [type]
 */

export const Button = React.forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      icon,
      iconPosition = 'left',
      disabled = false,
      children,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600',
      outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50 active:bg-gray-100 dark:border-slate-600 dark:text-gray-100 dark:hover:bg-slate-700',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-slate-700',
      danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800',
      success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800',
      warning: 'bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700',
      info: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    }

    const sizes = {
      xs: 'px-2.5 py-1.5 text-xs h-7',
      sm: 'px-3 py-2 text-xs h-8',
      md: 'px-4 py-2.5 text-sm h-10',
      lg: 'px-5 py-3 text-base h-12',
      icon: 'p-2 h-10 w-10',
    }

    const resolvedLeadingIcon = leadingIcon || (iconPosition === 'left' ? icon : null)
    const resolvedTrailingIcon = trailingIcon || (iconPosition === 'right' ? icon : null)
    const isDisabled = disabled || loading
    const hasOnlyIcon = !children && (resolvedLeadingIcon || resolvedTrailingIcon) && size === 'icon'

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          hasOnlyIcon && 'aspect-square',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>{loadingText || 'Loading...'}</span>
          </>
        ) : (
          <>
            {resolvedLeadingIcon && (
              <span className="mr-2 inline-flex items-center">{resolvedLeadingIcon}</span>
            )}
            {children}
            {resolvedTrailingIcon && (
              <span className="ml-2 inline-flex items-center">{resolvedTrailingIcon}</span>
            )}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
