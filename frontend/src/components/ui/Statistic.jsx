// frontend/src/components/ui/Statistic.jsx
import React from 'react'
import clsx from 'clsx'
import { de } from 'date-fns/locale'

/**
 * Statistic UI Component
 *
 * A reusable metric display for dashboards, reports, and analytics.
 */
export default function Statistic({
  label,
  value,
  prefix,
  suffix,
  icon,
  trend, // 'up' | 'down' | 'neutral'
  trendValue,
  variant = 'neutral', // primary | success | warning | danger | neutral
  size = 'md', // sm | md | lg
  loading = false,
  footer,
  className,
}) {
  const variantStyles = {
    primary: 'text-primary-600 bg-primary-50',
    success: 'text-success-600 bg-success-50',
    warning: 'text-warning-600 bg-warning-50',
    danger: 'text-danger-600 bg-danger-50',
    neutral: 'text-neutral-700 bg-neutral-100',
  }

  const trendStyles = {
    up: 'text-success-600',
    down: 'text-danger-600',
    neutral: 'text-neutral-500',
  }

  const sizeStyles = {
    sm: {
      container: 'p-4',
      value: 'text-xl',
      label: 'text-xs',
    },
    md: {
      container: 'p-5',
      value: 'text-2xl',
      label: 'text-sm',
    },
    lg: {
      container: 'p-6',
      value: 'text-3xl',
      label: 'text-sm',
    },
  }

  return (
    <div
      className={clsx(
        'rounded-2xl shadow-soft transition-all duration-200',
        'hover:shadow-medium',
        variantStyles[variant],
        sizeStyles[size].container,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          {label && (
            <p
              className={clsx(
                'uppercase tracking-wide font-medium',
                sizeStyles[size].label
              )}
            >
              {label}
            </p>
          )}
        </div>

        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 shadow-inner">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3 flex items-end gap-2">
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-neutral-300" />
        ) : (
          <span
            className={clsx(
              'font-semibold leading-none',
              sizeStyles[size].value
            )}
          >
            {prefix}
            {value ?? '—'}
            {suffix}
          </span>
        )}

        {/* Trend */}
        {trend && trendValue && !loading && (
          <span
            className={clsx(
              'text-sm font-medium',
              trendStyles[trend]
            )}
          >
            {trend === 'up' && '▲'}
            {trend === 'down' && '▼'}
            {trend === 'neutral' && '•'} {trendValue}
          </span>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-3 border-t border-black/5 pt-2 text-xs text-neutral-600">
          {footer}
        </div>
      )}
    </div>
  )
}