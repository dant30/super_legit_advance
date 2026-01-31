// frontend/src/components/ui/Button/Button.tsx
import React from 'react'
import { cn } from '@/lib/utils/cn'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'
  | 'default'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  /** Button style variant */
  variant?: ButtonVariant
  /** Button size */
  size?: ButtonSize
  /** Loading state */
  loading?: boolean
  /** Text to show when loading */
  loadingText?: string
  /** Make button full width */
  fullWidth?: boolean
  /** Icon element */
  icon?: React.ReactElement
  /** Icon position */
  iconPosition?: 'left' | 'right'
  /** Disabled state */
  disabled?: boolean
  /** Button type */
  type?: 'button' | 'submit' | 'reset'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      fullWidth = false,
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
      'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50 active:bg-gray-100',
      success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
      warning: 'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700',
      info: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
      default: 'bg-gray-800 text-white hover:bg-gray-900 active:bg-black',
    }

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs h-8',
      md: 'px-4 py-2 text-sm h-10',
      lg: 'px-5 py-3 text-base h-12',
      icon: 'p-2',
    }

    const isIconOnly = !children && icon && size === 'icon'

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          isIconOnly && 'aspect-square',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            <span>{loadingText || 'Loading...'}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="mr-2 flex items-center">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="ml-2 flex items-center">{icon}</span>
            )}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'