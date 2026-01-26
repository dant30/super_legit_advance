// frontend/src/components/ui/Select/Select.tsx
import React, { forwardRef, useState, useEffect, useRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import clsx from 'clsx'

export interface Option {
  value: string | number
  label: string
  disabled?: boolean
  icon?: React.ReactNode
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  helperText?: string
  options: Option[]
  placeholder?: string
  value?: string | number | (string | number)[]
  onChange?: (value: string | number | (string | number)[]) => void
  searchable?: boolean
  multiple?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  disabled?: boolean
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder = 'Select...',
      value,
      onChange,
      searchable = false,
      multiple = false,
      fullWidth = false,
      size = 'md',
      icon,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedValues, setSelectedValues] = useState<(string | number)[]>([])
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (multiple) {
        setSelectedValues(Array.isArray(value) ? value : value ? [value] : [])
      }
    }, [value, multiple])

    // Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
          setSearchQuery('')
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const sizes = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    }

    const widthClass = fullWidth ? 'w-full' : 'inline-block'
    const errorClass = error
      ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-200'
      : ''

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options

    const getSelectedLabel = () => {
      if (multiple) {
        if (selectedValues.length === 0) return placeholder
        if (selectedValues.length === 1) {
          const option = options.find((opt) => opt.value === selectedValues[0])
          return option?.label || placeholder
        }
        return `${selectedValues.length} selected`
      }

      const option = options.find((opt) => opt.value === value)
      return option?.label || placeholder
    }

    const handleSelect = (optionValue: string | number) => {
      if (disabled) return

      if (multiple) {
        const newSelected = selectedValues.includes(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue]

        setSelectedValues(newSelected)
        onChange?.(newSelected)
      } else {
        onChange?.(optionValue)
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    const isSelected = (optionValue: string | number) =>
      multiple ? selectedValues.includes(optionValue) : value === optionValue

    return (
      <div ref={(node) => { containerRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) (ref as React.MutableRefObject<HTMLDivElement>).current = node }} className={clsx('relative', widthClass)}>
        {label && <label className="form-label mb-1 block">{label}</label>}

        <button
          type="button"
          className={clsx(
            'relative w-full bg-white border rounded-xl shadow-sm text-left cursor-default focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all flex items-center justify-between',
            sizes[size],
            errorClass,
            disabled && 'bg-neutral-100 cursor-not-allowed opacity-70',
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            {icon && <span>{icon}</span>}
            <span className={clsx(!getSelectedLabel() && 'text-gray-400 truncate')}>
              {getSelectedLabel()}
            </span>
          </div>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg max-h-60 overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none">
            {searchable && (
              <div className="sticky top-0 bg-white px-3 py-2 border-b">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                  autoFocus
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded hover:bg-gray-50 transition-colors',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    isSelected(option.value) ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span>{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected(option.value) && <Check className="h-4 w-4 text-primary-600" />}
                </button>
              ))
            )}
          </div>
        )}

        {error && <p className="form-error mt-1">{error}</p>}
        {!error && helperText && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
