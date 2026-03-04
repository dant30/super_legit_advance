import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { cn } from '@utils/cn'

const Timeline = ({ events = [], layout = 'vertical', reversed = false, className }) => {
  const sortedEvents = reversed ? [...events].reverse() : events

  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    danger: 'bg-danger-600',
    warning: 'bg-warning-500',
    neutral: 'bg-gray-400',
  }

  return (
    <ol
      className={cn(
        'flex gap-6',
        layout === 'vertical' ? 'flex-col' : 'flex-row overflow-x-auto pb-2',
        className
      )}
      aria-label="Timeline"
    >
      {sortedEvents.map((event, idx) => {
        const isLast = idx === sortedEvents.length - 1
        const DotIcon = event.icon
        const dotColor = colors[event.color] || colors.primary

        return (
          <motion.li
            key={`${event.title}-${idx}`}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex min-w-[220px] items-start gap-4"
          >
            <div className="flex flex-col items-center">
              <div className={cn('flex h-4 w-4 items-center justify-center rounded-full text-white', dotColor)}>
                {DotIcon && <DotIcon className="h-3 w-3" />}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'mt-1 bg-gray-300 dark:bg-slate-600',
                    layout === 'vertical' ? 'h-full w-px min-h-8' : 'h-px w-16 mt-2'
                  )}
                />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white md:text-base">{event.title}</h4>
                {event.badge && (
                  <span className={cn('badge badge-neutral', event.color === 'success' && 'badge-success', event.color === 'danger' && 'badge-danger', event.color === 'warning' && 'badge-warning', event.color === 'primary' && 'badge-primary')}>
                    {event.badge}
                  </span>
                )}
              </div>

              {event.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{event.description}</p>}

              {event.date && (
                <time className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  {event.date}
                </time>
              )}
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}

Timeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      date: PropTypes.string,
      icon: PropTypes.elementType,
      color: PropTypes.oneOf(['primary', 'success', 'danger', 'warning', 'neutral']),
      badge: PropTypes.string,
    })
  ).isRequired,
  layout: PropTypes.oneOf(['vertical', 'horizontal']),
  reversed: PropTypes.bool,
  className: PropTypes.string,
}

export default Timeline
