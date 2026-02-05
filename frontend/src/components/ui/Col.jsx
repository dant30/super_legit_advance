// frontend/src/components/ui/Col.jsx
import React from 'react';
import clsx from 'clsx';

/**
 * Grid Column Component
 *
 * Designed for Tailwind-based grid systems.
 * Assumes a 12-column layout.
 *
 * Example usage:
 * <Col md={6} lg={4} offsetLg={2} align="center">
 *   Content
 * </Col>
 */

const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl'];

const spanClass = (bp, value) => {
  if (value === 'auto') return bp === 'xs' ? 'flex-auto' : `${bp}:flex-auto`;
  if (!value) return null;

  const prefix = bp === 'xs' ? '' : `${bp}:`;
  return `${prefix}col-span-${value}`;
};

const offsetClass = (bp, value) => {
  if (!value) return null;
  const prefix = bp === 'xs' ? '' : `${bp}:`;
  return `${prefix}col-start-${value + 1}`;
};

const orderClass = (bp, value) => {
  if (value === undefined || value === null) return null;
  const prefix = bp === 'xs' ? '' : `${bp}:`;
  return `${prefix}order-${value}`;
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const Col = ({
  as: Component = 'div',
  className,
  children,

  // Spans
  xs,
  sm,
  md,
  lg,
  xl,

  // Offsets
  offsetXs,
  offsetSm,
  offsetMd,
  offsetLg,
  offsetXl,

  // Order
  orderXs,
  orderSm,
  orderMd,
  orderLg,
  orderXl,

  // Alignment
  align,

  // Flex grow control
  grow = false,

  ...props
}) => {
  const classes = clsx(
    'flex',
    'flex-col',

    // Span classes
    spanClass('xs', xs),
    spanClass('sm', sm),
    spanClass('md', md),
    spanClass('lg', lg),
    spanClass('xl', xl),

    // Offset classes
    offsetClass('xs', offsetXs),
    offsetClass('sm', offsetSm),
    offsetClass('md', offsetMd),
    offsetClass('lg', offsetLg),
    offsetClass('xl', offsetXl),

    // Order classes
    orderClass('xs', orderXs),
    orderClass('sm', orderSm),
    orderClass('md', orderMd),
    orderClass('lg', orderLg),
    orderClass('xl', orderXl),

    // Alignment
    align && alignMap[align],

    // Flex grow
    grow && 'flex-1',

    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Col;
