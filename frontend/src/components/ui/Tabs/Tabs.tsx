// frontend/src/components/ui/Tabs/Tabs.tsx
import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils/cn'

/* ----------------------------- Types ----------------------------- */

export type TabsVariant = 'underline' | 'pills' | 'cards'
export type TabsSize = 'sm' | 'md' | 'lg'
export type TabsOrientation = 'horizontal' | 'vertical'

export interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  variant?: TabsVariant
  size?: TabsSize
  orientation?: TabsOrientation
  children: React.ReactNode
  className?: string
}

export interface TabsListProps {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  icon?: React.ReactNode
}

export interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
  forceMount?: boolean
}

interface TabItem {
  id: string
  label: string
  content: React.ReactNode
}

export interface TabsControlledProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: TabsVariant
  size?: TabsSize
  orientation?: TabsOrientation
  className?: string
}

/* ----------------------------- Context ----------------------------- */

interface TabsContextType {
  activeTab: string
  setActiveTab: (id: string) => void
  variant: TabsVariant
  size: TabsSize
  orientation: TabsOrientation
}

const TabsContext = createContext<TabsContextType | null>(null)

const useTabs = () => {
  const ctx = useContext(TabsContext)
  if (!ctx) {
    throw new Error('Tabs components must be used inside <Tabs />')
  }
  return ctx
}

/* ------------------------------ Root ------------------------------- */

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  variant = 'underline',
  size = 'md',
  orientation = 'horizontal',
  children,
  className,
}) => {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')

  const activeTab = isControlled ? value! : internalValue

  const setActiveTab = (val: string) => {
    if (!isControlled) setInternalValue(val)
    onValueChange?.(val)
  }

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab, variant, size, orientation }}
    >
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

/* -------------------------- Controlled Wrapper -------------------- */

export const TabsControlled: React.FC<TabsControlledProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
  size = 'md',
  orientation = 'horizontal',
  className,
}) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      variant={variant}
      size={size}
      orientation={orientation}
      className={className}
    >
      <TabsList fullWidth>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

/* ----------------------------- List -------------------------------- */

export const TabsList: React.FC<TabsListProps> = ({
  children,
  className,
  fullWidth,
}) => {
  const { variant, orientation } = useTabs()

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={cn(
        'flex',
        orientation === 'vertical' && 'flex-col',
        variant === 'underline' &&
          'border-b border-gray-200 dark:border-gray-700',
        variant === 'pills' &&
          'gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1',
        variant === 'cards' && 'gap-2',
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </div>
  )
}

/* ---------------------------- Trigger ------------------------------ */

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
  disabled,
  icon,
}) => {
  const { activeTab, setActiveTab, variant, size } = useTabs()
  const isActive = activeTab === value

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  const variantClasses = {
    underline: cn(
      '-mb-px border-b-2',
      isActive
        ? 'border-primary-500 text-primary-600'
        : 'border-transparent text-gray-500 hover:text-gray-800'
    ),
    pills: cn(
      'rounded-md',
      isActive
        ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
        : 'text-gray-500 hover:bg-white/50'
    ),
    cards: cn(
      'rounded-lg border',
      isActive
        ? 'border-primary-500 bg-primary-50 text-primary-700'
        : 'border-gray-200 text-gray-500 hover:border-gray-300'
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

/* ---------------------------- Content ------------------------------ */

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
  forceMount = false,
}) => {
  const { activeTab } = useTabs()
  const isActive = activeTab === value

  if (!isActive && !forceMount) return null

  return (
    <div
      role="tabpanel"
      aria-hidden={!isActive}
      className={cn(isActive ? 'block' : 'hidden', className)}
    >
      {children}
    </div>
  )
}