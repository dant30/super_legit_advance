// frontend/src/components/ui/Breadcrumb.jsx
import React from 'react'
import { Home, ChevronRight } from 'lucide-react'
import { cn } from '@utils/cn'

const Breadcrumb = ({ items = [], className }) => {
  if (!items || items.length === 0) return null

  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {/* Home link (always first) */}
        <li>
          <a
            href="/"
            className="flex items-center text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors duration-150"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </a>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <React.Fragment key={item.href || item.label || index}>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </li>
              <li>
                {isLast ? (
                  <span className="text-neutral-900 dark:text-neutral-300 font-medium">
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href}
                    className="text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors duration-150"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

// Alternative: Structured Breadcrumb with more customization
export const Breadcrumb2 = ({ items = [], separator = '/', className }) => {
  if (!items || items.length === 0) return null

  return (
    <nav className={cn('flex items-center', className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isFirst = index === 0

          return (
            <li key={item.label || index} className="inline-flex items-center">
              {!isFirst && (
                <span className="mx-2 text-neutral-400 dark:text-neutral-500">
                  {separator}
                </span>
              )}
              {isLast ? (
                <span className="text-neutral-900 dark:text-neutral-300 font-medium">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="inline-flex items-center text-neutral-600 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors duration-150"
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb