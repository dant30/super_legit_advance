// frontend/src/components/shared/StatusBadge.jsx
// frontend/src/components/shared/StatusBadge.jsx

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

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
    classes: 'bg-yellow-100 text-yellow-800 ring-yellow-300',
  },
  active: {
    label: 'Active',
    classes: 'bg-green-100 text-green-800 ring-green-300',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-blue-100 text-blue-800 ring-blue-300',
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-red-100 text-red-800 ring-red-300',
  },
  failed: {
    label: 'Failed',
    classes: 'bg-rose-100 text-rose-800 ring-rose-300',
  },
  paused: {
    label: 'Paused',
    classes: 'bg-gray-100 text-gray-800 ring-gray-300',
  },
  draft: {
    label: 'Draft',
    classes: 'bg-slate-100 text-slate-700 ring-slate-300',
  },
  unknown: {
    label: 'Unknown',
    classes: 'bg-neutral-100 text-neutral-700 ring-neutral-300',
  },
};

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
  const normalizedStatus = status?.toLowerCase?.() || 'unknown';
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.unknown;

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
  };

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
  );
};

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
};

export default StatusBadge;
