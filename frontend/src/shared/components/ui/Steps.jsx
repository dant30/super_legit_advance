import React from 'react'
import clsx from 'clsx'

const SIZE_MAP = {
  sm: { text: 'text-xs', dot: 'h-6 w-6' },
  md: { text: 'text-sm', dot: 'h-8 w-8' },
  lg: { text: 'text-base', dot: 'h-10 w-10' },
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
  const progressPercent = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0

  return (
    <div className={clsx('w-full', className)}>
      {showProgress && !isVertical && (
        <div className="mb-4 h-1 w-full rounded bg-gray-200 dark:bg-slate-700">
          <div className="h-1 rounded bg-primary-600 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      )}

      <ol className={clsx('flex', isVertical ? 'flex-col gap-6' : 'items-start', SIZE_MAP[size].text)} role="list">
        {steps.map((step, index) => {
          const status =
            step.status || (index < current ? 'completed' : index === current ? 'active' : 'upcoming')
          const isClickable = clickable && typeof onChange === 'function'

          const statusClasses = {
            active: 'bg-primary-600 text-white border-primary-600',
            completed: 'bg-success-600 text-white border-success-600',
            error: 'bg-danger-600 text-white border-danger-600',
            upcoming: 'bg-white text-gray-400 border-gray-300 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-600',
          }

          return (
            <li
              key={index}
              className={clsx(
                'relative',
                isVertical ? 'flex items-start gap-4' : 'flex flex-1 items-start justify-center',
                isClickable && 'cursor-pointer'
              )}
            >
              <div
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onClick={() => isClickable && onChange(index)}
                onKeyDown={(e) => {
                  if (!isClickable) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onChange(index)
                  }
                }}
                aria-current={index === current ? 'step' : undefined}
                className="flex flex-col items-center"
              >
                <div
                  className={clsx(
                    'flex items-center justify-center rounded-full border font-medium transition-all',
                    SIZE_MAP[size].dot,
                    statusClasses[status],
                    isClickable && 'ui-focus'
                  )}
                >
                  {step.icon ? step.icon : index + 1}
                </div>

                <div className={clsx('mt-2 max-w-[180px] text-center', isVertical && 'text-left')}>
                  <div
                    className={clsx(
                      'font-medium',
                      status === 'active' && 'text-primary-600 dark:text-primary-400',
                      status === 'completed' && 'text-success-600 dark:text-success-400',
                      status === 'error' && 'text-danger-600 dark:text-danger-400',
                      status === 'upcoming' && 'text-gray-600 dark:text-gray-300'
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{step.description}</div>}
                </div>
              </div>

              {!isVertical && index !== steps.length - 1 && (
                <span className="mt-4 h-px flex-1 bg-gray-300 dark:bg-slate-600" aria-hidden="true" />
              )}
              {isVertical && index !== steps.length - 1 && (
                <span className="absolute left-4 top-9 h-8 w-px bg-gray-300 dark:bg-slate-600" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
