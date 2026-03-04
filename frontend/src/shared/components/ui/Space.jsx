// frontend/src/components/ui/Space.jsx
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { motion } from 'framer-motion';

/**
 * Space
 * ---------------------------------------------------
 * A flexible spacing + layout utility component.
 *
 * Use cases:
 * - Vertical spacing between sections
 * - Horizontal spacing between buttons
 * - Layout wrapper with consistent gaps
 * - Optional animated appearance
 *
 * Philosophy:
 * - Layout primitives > random margins
 * - Predictable spacing scale
 * - Responsive-first
 */

/**
 * Spacing scale (px)
 * Keeps spacing consistent across the app
 */
const SPACE_SCALE = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

/**
 * Resolve spacing value
 */
const resolveSpace = (value) => {
  if (typeof value === 'number') return value;
  return SPACE_SCALE[value] ?? SPACE_SCALE.md;
};

const Space = ({
  children,
  direction = 'vertical',
  size = 'md',
  sizeSm,
  sizeMd,
  sizeLg,
  align = 'stretch',
  justify = 'flex-start',
  wrap = false,
  inline = false,
  divider = false,
  as: Component = 'div',
  animated = false,
  className,
  style,
}) => {
  const isVertical = direction === 'vertical';

  const baseSize = resolveSpace(size);

  const computedStyle = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    gap: baseSize,
    ...style,
  };

  /**
   * Responsive overrides
   * Uses CSS variables so it plays well with Tailwind or vanilla CSS
   */
  const responsiveVars = {
    ...(sizeSm && { '--space-sm': `${resolveSpace(sizeSm)}px` }),
    ...(sizeMd && { '--space-md': `${resolveSpace(sizeMd)}px` }),
    ...(sizeLg && { '--space-lg': `${resolveSpace(sizeLg)}px` }),
  };

  const responsiveStyles = {
    ...responsiveVars,
    gap: `
      var(--space-sm, ${baseSize}px)
    `,
  };

  const Wrapper = animated ? motion.div : Component;

  return (
    <Wrapper
      className={clsx(
        'ui-space',
        divider && 'ui-space--divider',
        className
      )}
      style={{
        ...computedStyle,
        ...responsiveStyles,
      }}
      {...(animated && {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25, ease: 'easeOut' },
      })}
    >
      {divider
        ? React.Children.toArray(children).map((child, index, arr) => (
            <React.Fragment key={index}>
              {child}
              {index < arr.length - 1 && (
                <div
                  className="ui-space__divider"
                  style={{
                    width: isVertical ? '100%' : 1,
                    height: isVertical ? 1 : '100%',
                    backgroundColor: 'rgba(0,0,0,0.08)',
                  }}
                />
              )}
            </React.Fragment>
          ))
        : children}
    </Wrapper>
  );
};

Space.propTypes = {
  children: PropTypes.node,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  size: PropTypes.oneOfType([
    PropTypes.oneOf(Object.keys(SPACE_SCALE)),
    PropTypes.number,
  ]),
  sizeSm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sizeMd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sizeLg: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  align: PropTypes.string,
  justify: PropTypes.string,
  wrap: PropTypes.bool,
  inline: PropTypes.bool,
  divider: PropTypes.bool,
  as: PropTypes.elementType,
  animated: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Space;
