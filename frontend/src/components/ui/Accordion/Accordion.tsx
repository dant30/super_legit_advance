import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react'

interface AccordionContextType {
  openItems: string[]
  toggleItem: (id: string) => void
  variant: 'default' | 'border' | 'cards'
  size: 'sm' | 'md' | 'lg'
  allowMultiple?: boolean
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined)

interface AccordionProps {
  children: React.ReactNode
  defaultValue?: string[]
  variant?: 'default' | 'border' | 'cards'
  size?: 'sm' | 'md' | 'lg'
  allowMultiple?: boolean
  className?: string
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  defaultValue = [],
  variant = 'default',
  size = 'md',
  allowMultiple = false,
  className,
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultValue)

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      } else {
        return prev.includes(id) ? [] : [id]
      }
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, variant, size, allowMultiple }}>
      <div className={cn('w-full', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  id: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  children,
  className,
  disabled = false,
}) => {
  const { openItems, variant } = useContext(AccordionContext)!
  const isOpen = openItems.includes(id)

  const variantClasses = {
    default: '',
    border: 'border border-gray-200 dark:border-gray-700 rounded-lg',
    cards: 'rounded-lg border border-gray-200 dark:border-gray-700 shadow-soft',
  }

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-200',
        variantClasses[variant],
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
    >
      {children}
    </div>
  )
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  showIcon?: boolean
  iconPosition?: 'left' | 'right'
  iconType?: 'chevron' | 'plus' | 'arrow'
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  className,
  showIcon = true,
  iconPosition = 'right',
  iconType = 'chevron',
}) => {
  const { openItems, toggleItem, variant, size } = useContext(AccordionContext)!
  const id = React.useId()
  const isOpen = openItems.includes(id)

  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  }

  const variantClasses = {
    default: cn(
      'w-full text-left font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
      isOpen && 'bg-gray-50 dark:bg-gray-800/50'
    ),
    border: 'w-full text-left font-medium transition-colors',
    cards: cn(
      'w-full text-left font-medium transition-colors',
      isOpen && 'bg-gray-50 dark:bg-gray-800/50'
    ),
  }

  const iconMap = {
    chevron: isOpen ? ChevronDown : ChevronRight,
    plus: isOpen ? Minus : Plus,
    arrow: isOpen ? ChevronDown : ChevronRight,
  }

  const Icon = iconMap[iconType]

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => toggleItem(id)}
      className={cn(
        'flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-expanded={isOpen}
    >
      {showIcon && iconPosition === 'left' && (
        <Icon className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
      )}
      <span className="flex-1 text-left">{children}</span>
      {showIcon && iconPosition === 'right' && (
        <Icon className={cn(
          'h-4 w-4 flex-shrink-0 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      )}
    </button>
  )
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
  unmountOnExit?: boolean
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className,
  unmountOnExit = false,
}) => {
  const { openItems, variant } = useContext(AccordionContext)!
  const id = React.useId()
  const isOpen = openItems.includes(id)

  const [height, setHeight] = useState(0)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  if (unmountOnExit && !isOpen) {
    return null
  }

  const variantClasses = {
    default: '',
    border: 'border-t border-gray-200 dark:border-gray-700',
    cards: 'border-t border-gray-200 dark:border-gray-700',
  }

  return (
    <div
      ref={contentRef}
      className={cn(
        'overflow-hidden transition-all duration-200',
        variantClasses[variant]
      )}
      style={{ height: unmountOnExit ? 'auto' : `${height}px` }}
    >
      <div className={cn('p-4', className)}>{children}</div>
    </div>
  )
}

export default Accordion