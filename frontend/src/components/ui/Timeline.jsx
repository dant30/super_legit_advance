// frontend/src/components/ui/Timeline.jsx
// frontend/src/components/ui/Timeline.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Timeline Component
 * Fully self-contained. Supports vertical/horizontal layouts, badges, icons, colors.
 */
const Timeline = ({ events, layout = 'vertical', reversed = false, className }) => {
  const sortedEvents = reversed ? [...events].reverse() : events;

  /**
   * Internal TimelineEvent component
   */
  const TimelineEvent = ({ title, description, date, icon: Icon, color = 'primary', badge, isLast }) => {
    const colors = {
      primary: 'bg-blue-500',
      success: 'bg-green-500',
      danger: 'bg-red-500',
      warning: 'bg-yellow-500',
      neutral: 'bg-gray-400',
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="relative flex items-start gap-4"
      >
        {/* Line & Dot */}
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center text-white',
              colors[color]
            )}
          >
            {Icon && <Icon className="w-3 h-3" />}
          </div>
          {!isLast && <div className="w-px flex-1 bg-gray-300 mt-1"></div>}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm md:text-base font-semibold">{title}</h4>
            {badge && (
              <span
                className={cn(
                  'ml-2 px-2 py-0.5 text-xs rounded-full font-medium',
                  colors[color]
                )}
              >
                {badge}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm md:text-base mt-1">{description}</p>
          {date && <time className="text-gray-400 text-xs mt-1 block">{date}</time>}
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className={cn(
        'timeline flex gap-6',
        layout === 'vertical' ? 'flex-col' : 'flex-row overflow-x-auto',
        className
      )}
    >
      {sortedEvents.map((event, idx) => (
        <TimelineEvent
          key={idx}
          {...event}
          isLast={idx === sortedEvents.length - 1}
        />
      ))}
    </div>
  );
};

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
};

export default Timeline;