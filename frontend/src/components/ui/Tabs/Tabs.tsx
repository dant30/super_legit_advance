import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface TabsContextType {
  activeTab: string
  setActiveTab: (id: string) => void
  variant: 'underline' | 'pills' | 'cards'
  size: 'sm' | 'md' | 'lg'
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  defaultValue: string
  children: React.ReactNode
  variant?: 'underline' | 'pills' | 'cards'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onValueChange?: (value: string) => void
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  children,
  variant = 'underline',
  size = 'md',
  className,
  onValueChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    onValueChange?.(value)
  }

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab: handleTabChange, variant, size }}
    >
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

export const TabsList: React.FC<TabsListProps> = ({
  children,
  className,
  fullWidth = false,
}) => {
  const { variant } = useContext(TabsContext)!

  return (
    <div
      className={cn(
        'flex items-center',
        variant === 'underline' && 'border-b border-gray-200 dark:border-gray-700',
        variant === 'pills' && 'gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1',
        variant === 'cards' && 'gap-2',
        fullWidth && 'w-full',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  icon?: React.ReactNode
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
  disabled = false,
  icon,
}) => {
  const { activeTab, setActiveTab, variant, size } = useContext(TabsContext)!

  const isActive = activeTab === value

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  const variantClasses = {
    underline: cn(
      '-mb-px border-b-2 font-medium transition-colors',
      isActive
        ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300'
        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
    ),
    pills: cn(
      'rounded-md font-medium transition-colors',
      isActive
        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-sm'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
    ),
    cards: cn(
      'rounded-lg border font-medium transition-all',
      isActive
        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300 shadow-sm'
        : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
    ),
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
  lazy?: boolean
  unmountOnExit?: boolean
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
  lazy = false,
  unmountOnExit = false,
}) => {
  const { activeTab } = useContext(TabsContext)!

  const isActive = activeTab === value

  if (lazy && !isActive && unmountOnExit) {
    return null
  }

  if (lazy && !isActive) {
    return null
  }

  return (
    <div
      role="tabpanel"
      className={cn(
        'animate-fade-in',
        !isActive && 'hidden',
        className
      )}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  )
}

export default Tabs