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
    <div
      className={cn(
        'mb-6 rounded-xl border px-5 py-4 md:px-6 md:py-5',
        'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
        'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm',
        className
      )}
      style={{ borderColor: 'var(--surface-border)' }}
    >
      <div className="flex-1">
        <h1 className={cn('text-2xl md:text-3xl font-semibold tracking-tight text-app-primary', titleClassName)}>
          {title}
        </h1>
        {subTitle && (
          <p className={cn('mt-1.5 text-sm text-app-secondary', subTitleClassName)}>
            {subTitle}
          </p>
        )}
      </div>
      {extra.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {extra.map((el, idx) => (
            <div key={idx}>{el}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PageHeader
