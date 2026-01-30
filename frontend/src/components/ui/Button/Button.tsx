// frontend/src/components/ui/Button/Button.tsx
import React from 'react'
import { cn } from '@/lib/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactElement | null
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const base = 'inline-flex items-center justify-center rounded-md font-medium transition'
    const variants: Record<Variant, string> = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-50',
      danger: 'bg-danger-600 text-white hover:bg-danger-700',
    }
    const sizes: Record<Size, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          (disabled || loading) && 'opacity-60 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className="mr-2 flex items-center">{icon}</span>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className="ml-2 flex items-center">{icon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
