// frontend/src/components/ui/Row.jsx
import React, { forwardRef } from 'react'
import clsx from 'clsx'

/**
 * Row
 *
 * A flexible, accessible, and composable layout primitive.
 * Think of it as a smarter <div className="flex flex-row">.
 */
const Row = forwardRef(function Row(
  {
    as: Component = 'div',

    /** Layout */
    align = 'center',        // start | center | end | stretch | baseline
    justify = 'start',       // start | center | end | between | around | evenly
    gap = 0,                 // number | string
    wrap = false,            // true | false
    reverse = false,         // true | false

    /** Sizing */
    fullWidth = false,
    fullHeight = false,

    /** Behavior */
    clickable = false,
    disabled = false,
    onClick,

    /** Visibility */
    hidden = false,

    /** Styling */
    className,
    style,

    /** Content */
    children,

    ...rest
  },
  ref
) {
  if (hidden) return null

  const isClickable = clickable && !disabled && typeof onClick === 'function'

  const classes = clsx(
    'flex',

    // Direction
    reverse ? 'flex-row-reverse' : 'flex-row',

    // Alignment
    {
      'items-start': align === 'start',
      'items-center': align === 'center',
      'items-end': align === 'end',
      'items-stretch': align === 'stretch',
      'items-baseline': align === 'baseline',
    },

    // Justification
    {
      'justify-start': justify === 'start',
      'justify-center': justify === 'center',
      'justify-end': justify === 'end',
      'justify-between': justify === 'between',
      'justify-around': justify === 'around',
      'justify-evenly': justify === 'evenly',
    },

    // Wrapping
    wrap ? 'flex-wrap' : 'flex-nowrap',

    // Sizing
    fullWidth && 'w-full',
    fullHeight && 'h-full',

    // Interaction
    isClickable && 'cursor-pointer select-none',
    disabled && 'opacity-50 pointer-events-none',

    className
  )

  const computedStyle = {
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    ...style,
  }

  return (
    <Component
      ref={ref}
      className={classes}
      style={computedStyle}
      onClick={isClickable ? onClick : undefined}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {children}
    </Component>
  )
})

export default Row
