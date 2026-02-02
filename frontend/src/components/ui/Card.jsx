// frontend/src/components/ui/Card.tsx
import React from 'react'
import clsx from 'clsx'

/* =========================
 * MAIN CARD
 * ========================= */

export const Card = ({
  children,
  className,
  hoverable = false,
  glass = false,
}) => {
  return (
    <div
      className={clsx(
        glass ? 'glass' : 'card',
        'animate-fade-in',
        hoverable && 'hover-lift',
        className
      )}
    >
      {children}
    </div>
  )
}

/* =========================
 * CARD HEADER
 * ========================= */

export const CardHeader = ({
  title,
  description,
  icon: Icon,
  action,
  className,
}) => {
  if (!title && !description && !action) return null

  return (
    <div className={clsx('card-header flex items-start justify-between', className)}>
      <div className="space-y-1">
        {title && (
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-primary-600" />}
            <h4>{title}</h4>
          </div>
        )}
        {description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  )
}

/* =========================
 * CARD CONTENT
 * ========================= */

export const CardContent = ({
  children,
  className,
  noPadding = false,
}) => {
  return (
    <div
      className={clsx(
        !noPadding && 'card-body',
        noPadding && 'px-5 py-4',
        className
      )}
    >
      {children}
    </div>
  )
}

/* =========================
 * CARD FOOTER
 * ========================= */

export const CardFooter = ({
  children,
  className,
  bordered = true,
}) => {
  return (
    <div
      className={clsx(
        'card-footer',
        !bordered && 'border-t-0',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Card