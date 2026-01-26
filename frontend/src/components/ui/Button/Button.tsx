// frontend/src/components/ui/Button/Button.tsx
import React from 'react'
import clsx from 'clsx'
import { LucideIcon } from 'lucide-react'

type ButtonVariant =
  | 'primary'
  | 'success'
  | 'danger'
  | 'outline'
  | 'ghost'

type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={clsx(
        'btn',
        {
          /* ================= VARIANTS ================= */
          'btn-primary': variant === 'primary',
          'btn-success': variant === 'success',
          'btn-danger': variant === 'danger',
          'btn-outline': variant === 'outline',
          'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700':
            variant === 'ghost',

          /* ================= SIZES ================= */
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-5 py-3 text-base': size === 'lg',

          /* ================= STATES ================= */
          'opacity-60 cursor-not-allowed': isDisabled,
          'w-full': fullWidth,
        },
        className
      )}
    >
      {/* Spinner */}
      {loading && (
        <svg
          className="animate-spin h-4 w-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}

      {/* Left Icon */}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="h-4 w-4 mr-2" />
      )}

      <span>{children}</span>

      {/* Right Icon */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="h-4 w-4 ml-2" />
      )}
    </button>
  )
}

export default Button
