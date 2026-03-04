import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

/**
 * ---------------------------------------------------------
 * STATUS CONFIG
 * ---------------------------------------------------------
 * Single source of truth for all status styles & labels.
 * Add new statuses here and you're done.
 */

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    classes: 'bg-warning-100 text-warning-800 ring-warning-300 dark:bg-warning-900/20 dark:text-warning-300',
  },
  active: {
    label: 'Active',
    classes: 'bg-success-100 text-success-800 ring-success-300 dark:bg-success-900/20 dark:text-success-300',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-primary-100 text-primary-800 ring-primary-300 dark:bg-primary-900/20 dark:text-primary-300',
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-danger-100 text-danger-800 ring-danger-300 dark:bg-danger-900/20 dark:text-danger-300',
  },
  failed: {
    label: 'Failed',
    classes: 'bg-danger-100 text-danger-800 ring-danger-300 dark:bg-danger-900/20 dark:text-danger-300',
  },
  paused: {
    label: 'Paused',
    classes: 'bg-gray-100 text-gray-800 ring-gray-300 dark:bg-slate-700 dark:text-gray-200',
  },
  draft: {
    label: 'Draft',
    classes: 'bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-700 dark:text-slate-200',
  },
  unknown: {
    label: 'Unknown',
    classes: 'bg-gray-100 text-gray-700 ring-gray-300 dark:bg-slate-700 dark:text-gray-200',
  },
}

/**
 * ---------------------------------------------------------
 * STATUS BADGE COMPONENT
 * ---------------------------------------------------------
 */

const StatusBadge = ({
  status,
  size = 'md',
  rounded = 'full',
  pulse = false,
  className,
}) => {
  const normalizedStatus = status?.toLowerCase?.() || 'unknown'
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.unknown

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    full: 'rounded-full',
  }

  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      className={clsx(
        'inline-flex items-center font-medium ring-1 ring-inset whitespace-nowrap',
        sizeClasses[size],
        roundedClasses[rounded],
        config.classes,
        pulse && 'animate-pulse',
        className
      )}
    >
      {config.label}
    </span>
  )
}

/**
 * ---------------------------------------------------------
 * PROP TYPES
 * ---------------------------------------------------------
 */

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'full']),
  pulse: PropTypes.bool,
  className: PropTypes.string,
}

export default StatusBadge
