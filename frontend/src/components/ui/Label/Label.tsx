import React from 'react'
import clsx from 'clsx'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  required?: boolean
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required, className, ...props }, ref) => (
    <label
      ref={ref}
      className={clsx(
        'text-sm font-medium text-gray-700 dark:text-gray-300',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-danger-600 ml-1">*</span>}
    </label>
  )
)

Label.displayName = 'Label'