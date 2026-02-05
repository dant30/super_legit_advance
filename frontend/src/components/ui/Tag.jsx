// frontend/src/components/ui/Tag.jsx
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Tag Component
 * ------------------------
 * A flexible, accessible, and animated tag/chip/badge component.
 * Works for labels, filters, statuses, categories, etc.
 */

const VARIANTS = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-cyan-100 text-cyan-800',
  dark: 'bg-gray-900 text-white',
};

const SIZES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

const Tag = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'full',
  icon: Icon,
  removable = false,
  onRemove,
  disabled = false,
  className,
  as: Component = 'span',
  ...props
}) => {
  const isInteractive = removable && !disabled;

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.15 }}
        className={clsx(
          'inline-flex items-center gap-1 font-medium select-none',
          VARIANTS[variant],
          SIZES[size],
          rounded === 'md' && 'rounded-md',
          rounded === 'lg' && 'rounded-lg',
          rounded === 'full' && 'rounded-full',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-default',
          className
        )}
        aria-disabled={disabled}
      >
        {/* Optional leading icon */}
        {Icon && (
          <Icon
            size={14}
            className="shrink-0 opacity-80"
            aria-hidden="true"
          />
        )}

        {/* Content */}
        <Component className="leading-none" {...props}>
          {children}
        </Component>

        {/* Remove button */}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remove tag"
            className={clsx(
              'ml-1 inline-flex items-center justify-center rounded-full transition',
              'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1',
              variant === 'dark'
                ? 'hover:bg-white/20 focus:ring-white'
                : 'focus:ring-gray-400',
              disabled && 'pointer-events-none'
            )}
          >
            <X size={12} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

Tag.propTypes = {
  children: PropTypes.node.isRequired,

  /** Visual style */
  variant: PropTypes.oneOf(Object.keys(VARIANTS)),
  size: PropTypes.oneOf(Object.keys(SIZES)),
  rounded: PropTypes.oneOf(['md', 'lg', 'full']),

  /** Optional icon (Lucide or custom SVG) */
  icon: PropTypes.elementType,

  /** Remove behavior */
  removable: PropTypes.bool,
  onRemove: PropTypes.func,

  /** Accessibility & state */
  disabled: PropTypes.bool,

  /** Polymorphism */
  as: PropTypes.elementType,

  /** Custom styling */
  className: PropTypes.string,
};

export default Tag;