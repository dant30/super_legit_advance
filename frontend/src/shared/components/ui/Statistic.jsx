import React from 'react'
import clsx from 'clsx'

const isRenderableElement = (value) => React.isValidElement(value)

export default function Statistic({
  label,
  title,
  value,
  valueStyle,
  prefix,
  suffix,
  icon,
  trend,
  trendValue,
  variant = 'neutral',
  size = 'md',
  loading = false,
  footer,
  className,
}) {
  const resolvedLabel = title || label
  const iconNode = icon || (isRenderableElement(prefix) ? prefix : null)
  const inlinePrefix = iconNode ? null : prefix

  const variantValueStyles = {
    primary: 'text-brand-700',
    success: 'text-feedback-success',
    warning: 'text-feedback-warning',
    danger: 'text-feedback-danger',
    neutral: 'text-text-primary',
  }

  const trendStyles = {
    up: 'text-feedback-success',
    down: 'text-feedback-danger',
    neutral: 'text-text-muted',
  }

  const sizeStyles = {
    sm: { value: 'text-xl', label: 'text-[11px]' },
    md: { value: 'text-2xl', label: 'text-xs' },
    lg: { value: 'text-3xl', label: 'text-sm' },
  }

  return (
    <article
      className={clsx(
        'rounded-xl border bg-surface-panel p-5 shadow-soft transition-all duration-200',
        'hover:shadow-medium',
        className
      )}
      style={{ borderColor: 'var(--surface-border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {resolvedLabel && (
            <p className={clsx('font-semibold uppercase tracking-[0.08em] text-text-muted', sizeStyles[size].label)}>
              {resolvedLabel}
            </p>
          )}
        </div>
        {iconNode && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary">
            {iconNode}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end gap-2">
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
        ) : (
          <span
            className={clsx('font-semibold leading-none', sizeStyles[size].value, variantValueStyles[variant])}
            style={valueStyle}
          >
            {inlinePrefix}
            {value ?? '--'}
            {suffix}
          </span>
        )}

        {trend && trendValue && !loading && (
          <span className={clsx('text-sm font-medium', trendStyles[trend])}>
            {trend === 'up' && '^ '}
            {trend === 'down' && 'v '}
            {trend === 'neutral' && '* '}
            {trendValue}
          </span>
        )}
      </div>

      {footer && <div className="mt-3 border-t border-slate-200 pt-2 text-xs text-text-muted">{footer}</div>}
    </article>
  )
}
