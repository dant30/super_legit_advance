// frontend/src/components/ui/Label.jsx
import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

/* -------------------------------------------
 * Base Label
 * ------------------------------------------- */
export const Label = React.forwardRef(function Label(
  { children, required = false, className, htmlFor, ...props },
  ref
) {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={clsx(
        'text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-danger-600 dark:text-danger-400">*</span>
      )}
    </label>
  )
})

Label.propTypes = {
  children: PropTypes.node.isRequired,
  htmlFor: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
}

Label.displayName = 'Label'

/* -------------------------------------------
 * Inline Label
 * ------------------------------------------- */
export const InlineLabel = React.forwardRef(function InlineLabel(
  { children, required = false, className, ...props },
  ref
) {
  return (
    <label
      ref={ref}
      className={clsx(
        'text-sm font-medium text-gray-700 dark:text-gray-300 inline-flex items-center gap-1',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-danger-600 dark:text-danger-400">*</span>
      )}
    </label>
  )
})

InlineLabel.propTypes = {
  children: PropTypes.node.isRequired,
  required: PropTypes.bool,
  className: PropTypes.string,
}

InlineLabel.displayName = 'InlineLabel'

/* -------------------------------------------
 * Label With Description
 * ------------------------------------------- */
export const LabelWithDescription = React.forwardRef(
  function LabelWithDescription(
    { label, description, required = false, className, ...props },
    ref
  ) {
    return (
      <div className={clsx('space-y-1', className)}>
        <label
          ref={ref}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          {...props}
        >
          {label}
          {required && (
            <span className="ml-1 text-danger-600 dark:text-danger-400">*</span>
          )}
        </label>

        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    )
  }
)

LabelWithDescription.propTypes = {
  label: PropTypes.node.isRequired,
  description: PropTypes.node,
  required: PropTypes.bool,
  className: PropTypes.string,
}

LabelWithDescription.displayName = 'LabelWithDescription'

export default Label
