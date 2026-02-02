// frontend/src/components/ui/Accordion.jsx
import React, { createContext, useContext, useState } from 'react'
import { cn } from '@utils/cn'
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react'

const AccordionContext = createContext()

const Accordion = ({
  children,
  defaultValue = [],
  variant = 'default',
  size = 'md',
  allowMultiple = false,
  className,
}) => {
  const [openItems, setOpenItems] = useState(defaultValue)

  const toggleItem = (id) => {
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

const AccordionItem = ({
  id,
  children,
  className,
  disabled = false,
}) => {
  const { openItems, variant } = useContext(AccordionContext)
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

const AccordionTrigger = ({
  children,
  className,
  showIcon = true,
  iconPosition = 'right',
  iconType = 'chevron',
}) => {
  const { openItems, toggleItem, variant, size } = useContext(AccordionContext)
  const [id] = useState(() => `accordion-${Math.random().toString(36).substr(2, 9)}`)
  const isOpen = openItems.includes(id)

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

const AccordionContent = ({
  children,
  className,
  unmountOnExit = false,
}) => {
  const { openItems } = useContext(AccordionContext)
  const [id] = useState(() => `accordion-${Math.random().toString(36).substr(2, 9)}`)
  const isOpen = openItems.includes(id)
  const [height, setHeight] = useState(0)
  const contentRef = React.useRef(null)

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
        variantClasses
      )}
      style={{ height: unmountOnExit ? 'auto' : `${height}px` }}
    >
      <div className={cn('p-4', className)}>{children}</div>
    </div>
  )
}

// Export all components
Accordion.Item = AccordionItem
Accordion.Trigger = AccordionTrigger
Accordion.Content = AccordionContent

export default Accordion