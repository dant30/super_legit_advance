// frontend/src/components/ui/Steps.jsx

import React from 'react'
import clsx from 'clsx'

/**
 * Steps Component
 *
 * @param {Array} steps - [{ title, description?, icon?, status? }]
 * @param {number} current - active step index
 * @param {function} onChange - callback when step clicked
 * @param {string} direction - horizontal | vertical
 * @param {boolean} clickable - allow clicking steps
 * @param {boolean} showProgress - show progress bar
 * @param {string} size - sm | md | lg
 * @param {string} className
 */

const SIZE_MAP = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export default function Steps({
  steps = [],
  current = 0,
  onChange,
  direction = 'horizontal',
  clickable = false,
  showProgress = false,
  size = 'md',
  className,
}) {
  const isVertical = direction === 'vertical'
  const progressPercent =
    steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0

  return (
    <div className={clsx('w-full', className)}>
      {showProgress && !isVertical && (
        <div className="mb-4 h-1 w-full bg-gray-200 rounded">
          <div
            className="h-1 bg-primary transition-all rounded"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <ol
        className={clsx(
          'flex',
          isVertical ? 'flex-col gap-6' : 'items-center justify-between',
          SIZE_MAP[size]
        )}
      >
        {steps.map((step, index) => {
          const status =
            step.status ||
            (index < current
              ? 'completed'
              : index === current
              ? 'active'
              : 'upcoming')

          const isClickable = clickable && typeof onChange === 'function'

          return (
            <li
              key={index}
              className={clsx(
                'flex',
                isVertical ? 'items-start gap-4' : 'flex-col items-center flex-1',
                isClickable && 'cursor-pointer'
              )}
              onClick={() => isClickable && onChange(index)}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
            >
              {/* Indicator */}
              <div
                className={clsx(
                  'flex items-center justify-center rounded-full border transition-all',
                  {
                    'bg-primary text-white border-primary':
                      status === 'active',
                    'bg-green-500 text-white border-green-500':
                      status === 'completed',
                    'bg-red-500 text-white border-red-500':
                      status === 'error',
                    'bg-white text-gray-400 border-gray-300':
                      status === 'upcoming',
                  },
                  size === 'sm' && 'h-6 w-6',
                  size === 'md' && 'h-8 w-8',
                  size === 'lg' && 'h-10 w-10'
                )}
              >
                {step.icon ? step.icon : index + 1}
              </div>

              {/* Connector */}
              {!isVertical && index !== steps.length - 1 && (
                <div className="absolute left-1/2 right-0 top-4 h-px bg-gray-300" />
              )}

              {/* Content */}
              <div
                className={clsx(
                  isVertical ? '' : 'mt-2 text-center',
                  'max-w-[180px]'
                )}
              >
                <div
                  className={clsx(
                    'font-medium',
                    status === 'active' && 'text-primary',
                    status === 'completed' && 'text-green-600',
                    status === 'error' && 'text-red-600'
                  )}
                >
                  {step.title}
                </div>

                {step.description && (
                  <div className="mt-1 text-gray-500 text-xs">
                    {step.description}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
