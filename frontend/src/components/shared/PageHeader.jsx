// frontend/src/components/shared/PageHeader.jsx
// frontend/src/components/shared/PageHeader.jsx
import React from 'react'
import { cn } from '@utils/cn'

/**
 * Reusable Page Header Component
 * Props:
 *  - title: string (main page title)
 *  - subTitle: string (optional subtitle)
 *  - extra: array of React elements (buttons, links, icons)
 *  - className: additional class names for the container
 *  - titleClassName: additional class names for title
 *  - subTitleClassName: additional class names for subtitle
 */
const PageHeader = ({
  title,
  subTitle,
  extra = [],
  className,
  titleClassName,
  subTitleClassName,
}) => {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between mb-6', className)}>
      <div className="flex-1">
        <h1 className={cn('text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white', titleClassName)}>
          {title}
        </h1>
        {subTitle && (
          <p className={cn('mt-1 text-sm text-gray-500 dark:text-gray-300', subTitleClassName)}>
            {subTitle}
          </p>
        )}
      </div>
      {extra.length > 0 && (
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          {extra.map((el, idx) => (
            <div key={idx}>{el}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PageHeader
