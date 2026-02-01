// components/shared/ProgressBar.tsx
import React from 'react'
import { cn } from '@/lib/utils/cn'

type ProgressSize = 'sm' | 'md' | 'lg'

interface ProgressBarProps {
  /** Progress value between 0 and 100 */
  value: number
  /** Height of the bar */
  size?: ProgressSize
  /** Show percentage text */
  showLabel?: boolean
  /** Show percentage text inside the bar */
  showLabelInside?: boolean
  /** Animate width change */
  animated?: boolean
  /** Custom wrapper class */
  className?: string
  /** Custom bar class */
  barClassName?: string
  /** Custom label class */
  labelClassName?: string
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'error'
  /** Accessible label for screen readers */
  'aria-label'?: string
}

const SIZE_CLASSES: Record<ProgressSize, string> = {
  sm: 'h-1.5 text-xs',
  md: 'h-2.5 text-xs',
  lg: 'h-4 text-sm',
}

const VARIANT_CLASSES = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}

// Predefined width classes for common progress values
const WIDTH_CLASSES: Record<number, string> = {
  0: 'w-0',
  10: 'w-[10%]',
  20: 'w-1/5',
  25: 'w-1/4',
  30: 'w-[30%]',
  33: 'w-1/3',
  40: 'w-2/5',
  50: 'w-1/2',
  60: 'w-3/5',
  66: 'w-2/3',
  70: 'w-[70%]',
  75: 'w-3/4',
  80: 'w-4/5',
  90: 'w-[90%]',
  100: 'w-full',
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  showLabel = false,
  showLabelInside = false,
  animated = true,
  className,
  barClassName,
  labelClassName,
  variant = 'default',
  'aria-label': ariaLabel = 'Progress',
}) => {
  const progress = Math.min(100, Math.max(0, value))
  
  // Get the closest width class or generate a dynamic one
  const getWidthClass = (val: number): string => {
    // Try to find an exact match first
    if (WIDTH_CLASSES[val]) {
      return WIDTH_CLASSES[val]
    }
    
    // Find the closest predefined width
    const closest = Object.keys(WIDTH_CLASSES)
      .map(Number)
      .reduce((prev, curr) => 
        Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
      )
    
    // If close enough (within 2%), use the predefined class
    if (Math.abs(closest - val) <= 2) {
      return WIDTH_CLASSES[closest]
    }
    
    // Otherwise generate a dynamic Tailwind class
    // Note: This requires Tailwind JIT to be enabled
    return `w-[${val}%]`
  }
  
  const widthClass = getWidthClass(progress)
  
  return (
    <div className={cn('w-full', className)}>
      {showLabel && !showLabelInside && (
        <div className={cn('mb-1 text-muted-foreground text-right', labelClassName)}>
          {progress}%
        </div>
      )}

      <div
        role="progressbar"
        aria-label={`${ariaLabel}: ${progress}%`}
        className={cn(
          'w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 relative',
          SIZE_CLASSES[size]
        )}
      >
        <div
          className={cn(
            'rounded-full',
            VARIANT_CLASSES[variant],
            SIZE_CLASSES[size],
            widthClass,
            animated && 'transition-all duration-300 ease-out',
            barClassName
          )}
          role="presentation"
        />

        {showLabelInside && (
          <div 
            className={cn(
              'absolute inset-0 flex items-center justify-center text-white font-medium pointer-events-none',
              labelClassName
            )}
            aria-hidden="true"
          >
            {progress}%
          </div>
        )}
      </div>
    </div>
  )
}

// ✅ Alias for backward compatibility
export const ProgressBarWithProgress = (props: ProgressBarProps) => (
  <ProgressBar {...props} />
)

// ✅ Utility hook for managing progress state
export const useProgress = (initialValue = 0) => {
  const [value, setValue] = React.useState(initialValue)

  const increment = (amount = 1) => {
    setValue(prev => Math.min(100, prev + amount))
  }

  const decrement = (amount = 1) => {
    setValue(prev => Math.max(0, prev - amount))
  }

  const reset = () => {
    setValue(initialValue)
  }

  const complete = () => {
    setValue(100)
  }

  return {
    value,
    setValue,
    increment,
    decrement,
    reset,
    complete,
  }
}