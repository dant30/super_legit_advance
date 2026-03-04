// frontend/src/components/ui/Tabs.jsx
import React, { createContext, useContext, useId, useState } from 'react'
import { cn } from '@utils/cn'

const TabsContext = createContext(null)

const useTabs = () => {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within <Tabs />')
  return ctx
}

/**
 * @typedef {Object} TabsProps
 * @property {string} [defaultValue]
 * @property {string} [value]
 * @property {(value: string) => void} [onValueChange]
 * @property {'underline'|'pills'|'cards'} [variant]
 * @property {'sm'|'md'|'lg'} [size]
 * @property {'horizontal'|'vertical'} [orientation]
 * @property {string} [className]
 */

export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  variant = 'underline',
  size = 'md',
  orientation = 'horizontal',
  className,
  children,
}) => {
  const [internal, setInternal] = useState(defaultValue ?? '')
  const controlled = value !== undefined
  const activeTab = controlled ? value : internal
  const baseId = useId()

  const setActiveTab = (val) => {
    if (!controlled) setInternal(val)
    onValueChange?.(val)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant, size, orientation, baseId }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabsList = ({ children, className, fullWidth }) => {
  const { orientation, variant } = useTabs()

  const onKeyDown = (e) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
    if (!keys.includes(e.key)) return

    const list = e.currentTarget
    const tabs = Array.from(list.querySelectorAll('[role="tab"]'))
    const currentIndex = tabs.indexOf(document.activeElement)
    if (currentIndex === -1) return

    e.preventDefault()

    const horizontal = orientation === 'horizontal'
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown'
    const prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp'

    let nextIndex = currentIndex
    if (e.key === nextKey) nextIndex = Math.min(tabs.length - 1, currentIndex + 1)
    if (e.key === prevKey) nextIndex = Math.max(0, currentIndex - 1)
    if (e.key === 'Home') nextIndex = 0
    if (e.key === 'End') nextIndex = tabs.length - 1

    tabs[nextIndex]?.focus()
    tabs[nextIndex]?.click()
  }

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={onKeyDown}
      className={cn(
        'flex',
        orientation === 'vertical' && 'flex-col',
        variant === 'underline' && 'border-b border-gray-200 dark:border-slate-700',
        variant === 'pills' && 'gap-1 rounded-lg bg-gray-100 dark:bg-slate-800 p-1',
        variant === 'cards' && 'gap-2',
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </div>
  )
}

export const TabsTrigger = ({ value, children, className, disabled, icon }) => {
  const { activeTab, setActiveTab, variant, size, baseId } = useTabs()
  const isActive = activeTab === value

  const tabId = `${baseId}-tab-${value}`
  const panelId = `${baseId}-panel-${value}`

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  const variantClasses = {
    underline: cn(
      '-mb-px border-b-2',
      isActive
        ? 'border-primary-500 text-primary-600 dark:text-primary-300'
        : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'
    ),
    pills: cn(
      'rounded-md',
      isActive
        ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm'
        : 'text-gray-500 hover:bg-white/50 dark:hover:bg-slate-700'
    ),
    cards: cn(
      'rounded-lg border',
      isActive
        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-200'
        : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-slate-700 dark:text-gray-300'
    ),
  }

  return (
    <button
      id={tabId}
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(
        'inline-flex items-center gap-2 font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}

export const TabsContent = ({ value, children, className, forceMount = false }) => {
  const { activeTab, baseId } = useTabs()
  const isActive = activeTab === value

  const tabId = `${baseId}-tab-${value}`
  const panelId = `${baseId}-panel-${value}`

  if (!isActive && !forceMount) return null

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      hidden={!isActive}
      className={cn('mt-4', className)}
    >
      {children}
    </div>
  )
}

Tabs.List = TabsList
Tabs.Trigger = TabsTrigger
Tabs.Content = TabsContent

export default Tabs
