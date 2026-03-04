import React, { createContext, useContext, useId, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Minus, Plus } from 'lucide-react'
import { cn } from '@utils/cn'

const AccordionContext = createContext(null)
const AccordionItemContext = createContext(null)

const useAccordion = () => {
  const ctx = useContext(AccordionContext)
  if (!ctx) throw new Error('Accordion components must be used within <Accordion />')
  return ctx
}

const useAccordionItem = () => {
  const ctx = useContext(AccordionItemContext)
  if (!ctx) throw new Error('Accordion Trigger/Content must be used within <Accordion.Item />')
  return ctx
}

const Accordion = ({
  children,
  defaultValue = [],
  variant = 'default',
  size = 'md',
  allowMultiple = false,
  className,
}) => {
  const initial = Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  const [openItems, setOpenItems] = useState(initial)

  const toggleItem = (id) => {
    setOpenItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      }
      return prev.includes(id) ? [] : [id]
    })
  }

  const value = useMemo(
    () => ({ openItems, toggleItem, variant, size, allowMultiple }),
    [openItems, variant, size, allowMultiple]
  )

  return (
    <AccordionContext.Provider value={value}>
      <div className={cn('w-full', className)} data-accordion-root>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

const AccordionItem = ({ id: idProp, children, className, disabled = false }) => {
  const { openItems, variant } = useAccordion()
  const reactId = useId()
  const itemId = idProp || `acc-${reactId}`
  const isOpen = openItems.includes(itemId)
  const triggerId = `${itemId}-trigger`
  const panelId = `${itemId}-panel`

  const variantClasses = {
    default: '',
    border: 'border border-gray-200 dark:border-gray-700 rounded-lg',
    cards: 'rounded-lg border border-gray-200 dark:border-gray-700 shadow-soft',
  }

  return (
    <AccordionItemContext.Provider value={{ itemId, isOpen, disabled, triggerId, panelId }}>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          variantClasses[variant],
          disabled && 'opacity-50',
          className
        )}
        data-state={isOpen ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

const AccordionTrigger = ({
  children,
  className,
  showIcon = true,
  iconPosition = 'right',
  iconType = 'chevron',
}) => {
  const { toggleItem, variant, size } = useAccordion()
  const { itemId, isOpen, disabled, triggerId, panelId } = useAccordionItem()

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base',
  }

  const variantClasses = {
    default: cn(
      'w-full text-left font-medium transition-colors',
      'hover:bg-gray-50 dark:hover:bg-gray-800/50',
      isOpen && 'bg-gray-50 dark:bg-gray-800/50'
    ),
    border: 'w-full text-left font-medium transition-colors',
    cards: cn('w-full text-left font-medium transition-colors', isOpen && 'bg-gray-50 dark:bg-gray-800/50'),
  }

  const iconMap = {
    chevron: isOpen ? ChevronDown : ChevronRight,
    plus: isOpen ? Minus : Plus,
    arrow: isOpen ? ChevronDown : ChevronRight,
  }
  const Icon = iconMap[iconType]

  const handleKeyDown = (e) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(e.key)) return

    const root = e.currentTarget.closest('[data-accordion-root]')
    if (!root) return
    const triggers = Array.from(root.querySelectorAll('[data-accordion-trigger]')).filter(
      (btn) => !btn.hasAttribute('disabled')
    )
    const idx = triggers.indexOf(e.currentTarget)
    if (idx === -1) return
    e.preventDefault()

    if (e.key === 'Home') triggers[0]?.focus()
    if (e.key === 'End') triggers[triggers.length - 1]?.focus()
    if (e.key === 'ArrowDown') triggers[(idx + 1) % triggers.length]?.focus()
    if (e.key === 'ArrowUp') triggers[(idx - 1 + triggers.length) % triggers.length]?.focus()
  }

  return (
    <button
      id={triggerId}
      type="button"
      data-accordion-trigger
      onClick={() => !disabled && toggleItem(itemId)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={cn(
        'flex items-center justify-between gap-3 ui-focus',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'cursor-not-allowed',
        className
      )}
      aria-expanded={isOpen}
      aria-controls={panelId}
    >
      {showIcon && iconPosition === 'left' && (
        <Icon className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
      )}
      <span className="flex-1 text-left">{children}</span>
      {showIcon && iconPosition === 'right' && (
        <Icon className={cn('h-4 w-4 flex-shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
      )}
    </button>
  )
}

const AccordionContent = ({ children, className, unmountOnExit = false }) => {
  const { variant } = useAccordion()
  const { isOpen, triggerId, panelId } = useAccordionItem()

  if (unmountOnExit && !isOpen) return null

  const variantClasses = {
    default: '',
    border: 'border-t border-gray-200 dark:border-gray-700',
    cards: 'border-t border-gray-200 dark:border-gray-700',
  }

  return (
    <div
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      hidden={!isOpen}
      className={cn('overflow-hidden transition-all duration-200', variantClasses[variant])}
    >
      <div className={cn('p-4 text-sm text-gray-700 dark:text-gray-200', className)}>{children}</div>
    </div>
  )
}

Accordion.Item = AccordionItem
Accordion.Trigger = AccordionTrigger
Accordion.Content = AccordionContent

export default Accordion
