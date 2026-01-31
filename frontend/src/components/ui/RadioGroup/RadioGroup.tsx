import React from 'react'

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ value, onValueChange, children, className = '' }, ref) => {
    return (
      <div ref={ref} role="radiogroup" className={className}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                checked: child.props.value === value,
                onChange: () => onValueChange?.(child.props.value),
              } as any)
            : child
        )}
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'