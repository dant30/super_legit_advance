// components/shared/ProgressBar.jsx
import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@utils/cn'

const ProgressBar = ({
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
  indeterminate = false,
  striped = false,
  showAnimation = false,
  labelPosition = 'right', // 'right' | 'left' | 'top' | 'bottom'
  labelFormat = (val) => `${val}%`,
}) => {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const barRef = useRef(null)
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
    xl: 'h-6',
  }
  
  const variantClasses = {
    default: 'bg-primary-600',
    primary: 'bg-primary-600',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-blue-500',
    dark: 'bg-neutral-800',
  }
  
  const containerClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }

  // Animate progress value
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setProgress(Math.min(100, Math.max(0, value)))
      }, 10)
      return () => clearTimeout(timer)
    } else {
      setProgress(Math.min(100, Math.max(0, value)))
    }
  }, [value, animated])

  // Intersection Observer for animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    
    if (barRef.current) {
      observer.observe(barRef.current)
    }
    
    return () => {
      if (barRef.current) {
        observer.unobserve(barRef.current)
      }
    }
  }, [])

  // Handle label position
  const renderLabel = () => {
    if (!showLabel && !showLabelInside) return null
    
    const label = labelFormat(progress)
    
    if (showLabelInside) {
      return (
        <div 
          className={cn(
            'absolute inset-0 flex items-center justify-center text-white font-medium',
            progress < 15 && 'justify-start pl-3',
            progress > 85 && 'justify-end pr-3',
            labelClassName
          )}
          aria-hidden="true"
        >
          {label}
        </div>
      )
    }
    
    const positionClasses = {
      right: 'ml-3',
      left: 'mr-3 order-first',
      top: 'mb-2',
      bottom: 'mt-2',
    }
    
    return (
      <div className={cn(
        'text-neutral-600 dark:text-neutral-400',
        positionClasses[labelPosition],
        containerClasses[size],
        labelClassName
      )}>
        {label}
      </div>
    )
  }

  // Render indeterminate progress
  if (indeterminate) {
    return (
      <div className={cn('w-full', className)} ref={barRef}>
        {showLabel && !showLabelInside && renderLabel()}
        
        <div
          role="progressbar"
          aria-label={ariaLabel}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuetext="Loading..."
          className={cn(
            'w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700 relative',
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              'absolute top-0 left-0 w-full h-full rounded-full',
              variantClasses[variant],
              'animate-indeterminate-progress'
            )}
            style={{
              background: striped 
                ? `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)`
                : undefined
            }}
          />
        </div>
      </div>
    )
  }

  // Render determinate progress
  return (
    <div 
      className={cn(
        'w-full',
        labelPosition === 'top' && 'flex flex-col',
        labelPosition === 'bottom' && 'flex flex-col-reverse',
        labelPosition === 'left' && 'flex items-center',
        labelPosition === 'right' && 'flex items-center',
        className
      )} 
      ref={barRef}
    >
      {showLabel && !showLabelInside && renderLabel()}
      
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
        className={cn(
          'w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700 relative',
          sizeClasses[size],
          showAnimation && isVisible && 'animate-scale-in'
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            variantClasses[variant],
            striped && 'progress-striped',
            barClassName
          )}
          style={{ 
            width: `${progress}%`,
            background: striped 
              ? `linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)`
              : undefined,
            backgroundSize: striped ? '1rem 1rem' : undefined,
            animation: striped ? 'progress-stripe 1s linear infinite' : undefined,
          }}
        />
        
        {showLabelInside && renderLabel()}
      </div>
    </div>
  )
}

// Progress steps component
export const ProgressSteps = ({
  steps = [],
  currentStep = 1,
  className,
  stepClassName,
  activeStepClassName,
  completedStepClassName,
  showLabels = true,
  showConnectors = true,
}) => {
  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isActive = stepNumber === currentStep
        const isUpcoming = stepNumber > currentStep
        
        return (
          <React.Fragment key={step.id || index}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                  isCompleted && 'bg-primary-600 border-primary-600 text-white',
                  isActive && 'border-primary-600 bg-white text-primary-600',
                  isUpcoming && 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-400',
                  stepClassName,
                  isCompleted && completedStepClassName,
                  isActive && activeStepClassName
                )}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              
              {/* Step label */}
              {showLabels && (
                <span className={cn(
                  'mt-2 text-sm font-medium',
                  isCompleted && 'text-primary-600',
                  isActive && 'text-primary-600 font-semibold',
                  isUpcoming && 'text-neutral-500 dark:text-neutral-400'
                )}>
                  {step.label}
                </span>
              )}
            </div>
            
            {/* Connector line */}
            {showConnectors && index < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-2',
                stepNumber < currentStep ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700'
              )} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// Progress circle component
export const ProgressCircle = ({
  value,
  size = 100,
  strokeWidth = 8,
  className,
  variant = 'default',
  showLabel = true,
  labelFormat = (val) => `${val}%`,
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference
  
  const variantColors = {
    default: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  }
  
  const color = variantColors[variant] || variantColors.default
  
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-neutral-200 dark:stroke-neutral-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-linecap-round transition-all duration-1000 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: color }}
        />
      </svg>
      
      {/* Center label */}
      {showLabel && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {labelFormat(value)}
          </span>
        </div>
      )}
    </div>
  )
}

// Custom hook for managing progress
export const useProgress = (initialValue = 0) => {
  const [value, setValue] = useState(initialValue)
  const [isComplete, setIsComplete] = useState(false)

  const increment = (amount = 1) => {
    setValue(prev => {
      const newValue = Math.min(100, prev + amount)
      if (newValue === 100) setIsComplete(true)
      return newValue
    })
  }

  const decrement = (amount = 1) => {
    setValue(prev => {
      const newValue = Math.max(0, prev - amount)
      if (newValue < 100) setIsComplete(false)
      return newValue
    })
  }

  const reset = (resetValue = initialValue) => {
    setValue(resetValue)
    setIsComplete(false)
  }

  const complete = () => {
    setValue(100)
    setIsComplete(true)
  }

  const setProgress = (newValue) => {
    const clampedValue = Math.min(100, Math.max(0, newValue))
    setValue(clampedValue)
    setIsComplete(clampedValue === 100)
  }

  return {
    value,
    isComplete,
    setProgress,
    increment,
    decrement,
    reset,
    complete,
  }
}

export default ProgressBar