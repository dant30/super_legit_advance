// frontend/src/components/ui/Card.jsx
import React from 'react'
import { cn } from '@utils/cn'

/**
 * @typedef {Object} CardProps
 * @property {React.ReactNode} children
 * @property {string} [className]
 * @property {boolean} [hoverable]
 * @property {boolean} [glass]
 */

export const Card = ({ children, className, hoverable = false, glass = false }) => (
  <div
    className={cn(
      glass ? 'glass' : 'card',
      hoverable && 'hover-lift transition-shadow hover:shadow-md',
      className
    )}
  >
    {children}
  </div>
)

/**
 * @typedef {Object} CardHeaderProps
 * @property {string|React.ReactNode} [title]
 * @property {string|React.ReactNode} [description]
 * @property {React.ComponentType<any>} [icon]
 * @property {React.ReactNode} [action]
 * @property {string} [className]
 */

export const CardHeader = ({ title, description, icon: Icon, action, className }) => {
  if (!title && !description && !action) return null

  return (
    <div className={cn('card-header flex items-start justify-between', className)}>
      <div className="space-y-1">
        {title && (
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-primary-600" />}
            <h4 className="text-base font-semibold text-app-primary">{title}</h4>
          </div>
        )}
        {description && <p className="text-sm text-app-muted">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

/**
 * @typedef {Object} CardContentProps
 * @property {React.ReactNode} children
 * @property {string} [className]
 * @property {boolean} [noPadding]
 */

export const CardContent = ({ children, className, noPadding = false }) => (
  <div className={cn(!noPadding && 'card-body', noPadding && 'px-5 py-4', className)}>
    {children}
  </div>
)

/**
 * @typedef {Object} CardFooterProps
 * @property {React.ReactNode} children
 * @property {string} [className]
 * @property {boolean} [bordered]
 */

export const CardFooter = ({ children, className, bordered = true }) => (
  <div className={cn('card-footer', !bordered && 'border-t-0', className)}>{children}</div>
)

export default Card
