import React from 'react'
import { Circle } from 'lucide-react'

interface RadioGroupItemProps {
  value: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, checked = false, onChange, disabled = false, className = '', id }, ref) => {
    return (
      <div className={`flex items-center ${className}`}>
        <input
          ref={ref}
          type="radio"
          value={value}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          id={id}
          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
    )
  }
)

RadioGroupItem.displayName = 'RadioGroupItem'