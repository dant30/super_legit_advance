// frontend/src/components/shared/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Filter, ChevronDown } from 'lucide-react'
import Button from '@components/ui/Button'
import { cn } from '@utils/cn'

const SearchBar = ({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  onClear,
  className,
  size = 'md',
  variant = 'default',
  disabled = false,
  loading = false,
  autoFocus = false,
  debounce = 300,
  showClear = true,
  showFilters = false,
  onFilterClick,
  filters,
  filterLabel = 'Filters',
  filterCount = 0,
  showSearchButton = false,
  searchButtonText = 'Search',
  suggestions = [],
  onSuggestionSelect,
  maxSuggestions = 5,
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '')
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceTimer = useRef(null)

  const value = controlledValue !== undefined ? controlledValue : internalValue

  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base',
    lg: 'h-14 text-lg',
  }

  const variantClasses = {
    default: 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800',
    filled: 'border-transparent bg-neutral-100 dark:bg-neutral-700',
    outline: 'border-primary-500 bg-transparent',
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (onChange && debounce > 0) {
      debounceTimer.current = setTimeout(() => {
        onChange(value)
      }, debounce)
    } else if (onChange) {
      onChange(value)
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [value, debounce, onChange])

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleChange = (e) => {
    const newValue = e.target.value
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    if (onChange) {
      onChange(newValue)
    }
    setShowSuggestions(newValue.length > 0 && suggestions.length > 0)
  }

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalValue('')
    }
    if (onChange) {
      onChange('')
    }
    if (onClear) {
      onClear()
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
    setShowSuggestions(false)
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(value)
    }
    setShowSuggestions(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
      setShowSuggestions(false)
    } else if (e.key === 'Escape') {
      if (showSuggestions) {
        setShowSuggestions(false)
      } else if (value) {
        handleClear()
      }
    }
  }

  const handleSuggestionSelect = (suggestion) => {
    if (controlledValue === undefined) {
      setInternalValue(suggestion)
    }
    if (onChange) {
      onChange(suggestion)
    }
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion)
    }
    setShowSuggestions(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const filteredSuggestions = suggestions
    .filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    )
    .slice(0, maxSuggestions)

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'flex items-center rounded-lg border transition-all duration-200',
          sizeClasses[size],
          variantClasses[variant],
          isFocused && !disabled && 'ring-2 ring-primary-500 ring-offset-1',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Search Icon */}
        <div className="pl-3 pr-2 text-neutral-400">
          <Search className={cn(
            'transition-colors',
            isFocused && 'text-primary-500',
            loading && 'animate-pulse'
          )} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 100)}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={cn(
            'flex-1 bg-transparent outline-none placeholder-neutral-400 dark:placeholder-neutral-500',
            disabled && 'cursor-not-allowed'
          )}
          aria-label="Search"
        />

        {/* Clear Button */}
        {showClear && value && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || loading}
            className="pr-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Filter Button */}
        {showFilters && (
          <button
            type="button"
            onClick={onFilterClick}
            disabled={disabled || loading}
            className={cn(
              'px-3 border-l h-full flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors',
              disabled && 'cursor-not-allowed'
            )}
          >
            <Filter className="h-4 w-4" />
            {filterCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 text-xs bg-primary-100 text-primary-800 rounded-full">
                {filterCount}
              </span>
            )}
          </button>
        )}

        {/* Search Button */}
        {showSearchButton && (
          <Button
            type="button"
            onClick={handleSearch}
            disabled={disabled || loading || !value}
            loading={loading}
            className="ml-2 rounded-l-none"
            size={size === 'lg' ? 'lg' : 'md'}
          >
            {searchButtonText}
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden"
        >
          <ul className="py-1">
            {filteredSuggestions.map((suggestion, index) => (
              <li key={`${suggestion}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter Dropdown */}
      {filters && (
        <div className="absolute right-0 top-0 h-full flex items-center pr-2">
          <div className="relative group">
            <button
              type="button"
              onClick={onFilterClick}
              className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300"
            >
              {filterLabel}
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-4 min-w-[200px]">
              {filters}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Advanced Search Bar with more features
export const AdvancedSearchBar = ({
  onSearch,
  fields = [],
  initialValues = {},
  className,
}) => {
  const [searchCriteria, setSearchCriteria] = useState(initialValues)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchCriteria)
    }
  }

  const handleReset = () => {
    setSearchCriteria(initialValues)
    if (onSearch) {
      onSearch(initialValues)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="flex gap-2">
        <SearchBar
          placeholder="Search..."
          value={searchCriteria.search || ''}
          onChange={(value) => handleChange('search', value)}
          showFilters
          onFilterClick={() => setShowAdvanced(!showAdvanced)}
          className="flex-1"
        />
        <Button type="submit" variant="primary">
          Search
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {showAdvanced && fields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  value={searchCriteria[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2"
                >
                  <option value="">All</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={searchCriteria[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </form>
  )
}

export default SearchBar