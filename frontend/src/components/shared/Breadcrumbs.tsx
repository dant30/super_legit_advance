import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  showHomeIcon?: boolean
  maxItems?: number
  className?: string
  itemClassName?: string
  separatorClassName?: string
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = <ChevronRight className="h-4 w-4" />,
  showHomeIcon = true,
  maxItems = 5,
  className,
  itemClassName,
  separatorClassName,
}) => {
  const displayItems = items

  if (maxItems && items.length > maxItems) {
    const firstItems = items.slice(0, 1)
    const lastItems = items.slice(-2)
    displayItems = [
      ...firstItems,
      { label: '...', disabled: true },
      ...lastItems,
    ]
  }

  return (
    <nav className={cn('flex items-center', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {/* Home */}
        {showHomeIcon && (
          <>
            <li>
              <Link
                to="/"
                className={cn(
                  'inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors',
                  itemClassName
                )}
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Link>
            </li>
            <li className={separatorClassName} aria-hidden="true">
              {separator}
            </li>
          </>
        )}

        {/* Breadcrumb items */}
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1

          return (
            <li key={index} className="flex items-center">
              {item.disabled ? (
                <span
                  className={cn(
                    'text-gray-400 dark:text-gray-500 cursor-default',
                    itemClassName
                  )}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </span>
              ) : item.href && !isLast ? (
                <Link
                  to={item.href}
                  className={cn(
                    'inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors',
                    itemClassName
                  )}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'font-medium text-gray-900 dark:text-gray-100',
                    itemClassName
                  )}
                  aria-current="page"
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span className={cn('mx-2', separatorClassName)} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs