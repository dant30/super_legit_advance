// frontend/src/components/shared/Divider.jsx
// frontend/src/components/shared/Divider.jsx
import React from 'react'
import { cn } from '@utils/cn'

const Divider = ({
  orientation = 'horizontal',
  label,
  labelPosition = 'center',
  variant = 'default',
  className,
  dashed = false,
  thickness = 'default',
  spacing = 'default',
}) => {
  const orientationClasses = {
    horizontal: 'w-full',
    vertical: 'h-full w-px',
  }

  const variantClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    subtle: 'bg-gray-100 dark:bg-gray-800',
    strong: 'bg-gray-300 dark:bg-gray-600',
    primary: 'bg-primary-200 dark:bg-primary-800',
    danger: 'bg-danger-200 dark:bg-danger-800',
    warning: 'bg-warning-200 dark:bg-warning-800',
    success: 'bg-success-200 dark:bg-success-800',
  }

  const thicknessClasses = {
    thin: orientation === 'horizontal' ? 'h-px' : 'w-px',
    default: orientation === 'horizontal' ? 'h-[2px]' : 'w-[2px]',
    thick: orientation === 'horizontal' ? 'h-1' : 'w-1',
  }

  const spacingClasses = {
    none: 'my-0 mx-0',
    tight: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    default: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    loose: orientation === 'horizontal' ? 'my-6' : 'mx-6',
    extra: orientation === 'horizontal' ? 'my-8' : 'mx-8',
  }

  const dashedClass = dashed ? 'border-dashed' : ''

  const labelPositionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  if (orientation === 'horizontal' && label) {
    return (
      <div className={cn('flex items-center', spacingClasses[spacing], className)}>
        {/* Left line */}
        <div
          className={cn(
            'flex-1',
            thicknessClasses[thickness],
            variantClasses[variant],
            dashedClass
          )}
        />

        {/* Label */}
        <div className={cn('px-3 flex', labelPositionClasses[labelPosition])}>
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {label}
          </span>
        </div>

        {/* Right line */}
        <div
          className={cn(
            'flex-1',
            thicknessClasses[thickness],
            variantClasses[variant],
            dashedClass
          )}
        />
      </div>
    )
  }

  if (orientation === 'horizontal') {
    return (
      <div
        className={cn(
          orientationClasses[orientation],
          thicknessClasses[thickness],
          variantClasses[variant],
          dashedClass,
          spacingClasses[spacing],
          className
        )}
        role="separator"
        aria-orientation="horizontal"
      />
    )
  }

  // Vertical divider
  return (
    <div
      className={cn(
        orientationClasses[orientation],
        thicknessClasses[thickness],
        variantClasses[variant],
        dashedClass,
        spacingClasses[spacing],
        'self-stretch',
        className
      )}
      role="separator"
      aria-orientation="vertical"
    />
  )
}

export default Divider