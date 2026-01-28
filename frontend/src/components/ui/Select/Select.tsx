// frontend/src/components/ui/Select/Select.tsx
import React, { useRef, useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  icon?: React.ReactNode
}

export interface SelectProps
  extends React.InputHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      error,
      helperText,
      fullWidth = true,
      className = '',
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
      options.find((opt) => opt.value === value) || null
    )

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (option: SelectOption) => {
      setSelectedOption(option)
      setIsOpen(false)
      if (onChange) {
        onChange({
          target: { value: option.value },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
    }

    return (
      <div ref={containerRef} className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`
              w-full px-3 py-2 border rounded-lg text-left
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-white
              border-gray-300 dark:border-gray-600
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${error ? 'border-danger-500' : ''}
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `}
          >
            <div className="flex items-center justify-between">
              <span>{selectedOption?.label || 'Select...'}</span>
              <ChevronDown
                className={`h-4 w-4 transition ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                  className={`
                    w-full px-3 py-2 text-left flex items-center gap-2
                    hover:bg-gray-100 dark:hover:bg-gray-600
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      selectedOption?.value === option.value
                        ? 'bg-primary-100 dark:bg-primary-900/20'
                        : ''
                    }
                  `}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
