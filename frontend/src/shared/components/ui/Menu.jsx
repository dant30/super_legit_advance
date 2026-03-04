import React, { cloneElement, useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@utils/cn'

const Menu = ({ trigger, items = [], align = 'left', closeOnSelect = true, disabled = false, className = '' }) => {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)
  const menuId = `menu-${useId()}`

  const interactiveItems = useMemo(
    () => items.map((item, idx) => ({ ...item, originalIndex: idx })).filter((item) => !item.divider && !item.disabled),
    [items]
  )

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (!open) return
    const first = menuRef.current?.querySelector('[role="menuitem"]:not([disabled])')
    first?.focus()
  }, [open])

  const onKeyDown = (e) => {
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault()
      setOpen(true)
      return
    }

    if (!open) return
    if (!interactiveItems.length) return

    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (activeIndex + 1 + interactiveItems.length) % interactiveItems.length
      setActiveIndex(next)
      menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])')[next]?.focus()
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = (activeIndex - 1 + interactiveItems.length) % interactiveItems.length
      setActiveIndex(next)
      menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])')[next]?.focus()
      return
    }

    if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
      menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])')[0]?.focus()
      return
    }

    if (e.key === 'End') {
      e.preventDefault()
      const last = interactiveItems.length - 1
      setActiveIndex(last)
      menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])')[last]?.focus()
    }
  }

  const Trigger = cloneElement(trigger, {
    ref: triggerRef,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: (e) => {
      trigger.props.onClick?.(e)
      if (!disabled) setOpen((prev) => !prev)
    },
    onKeyDown: (e) => {
      trigger.props.onKeyDown?.(e)
      onKeyDown(e)
    },
  })

  return (
    <div className="relative inline-block">
      {Trigger}

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            ref={menuRef}
            role="menu"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.98, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -5 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 mt-2 min-w-[200px] ui-menu p-1',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            <ul onKeyDown={onKeyDown}>
              {items.map((item, index) => {
                if (item.divider) {
                  return <li key={`divider-${index}`} role="separator" className="my-1 h-px bg-gray-200 dark:bg-slate-700" />
                }

                const Icon = item.icon
                const isDisabled = item.disabled
                return (
                  <li key={index}>
                    <button
                      role="menuitem"
                      type="button"
                      disabled={isDisabled}
                      onFocus={() => {
                        const next = interactiveItems.findIndex((v) => v.originalIndex === index)
                        setActiveIndex(next)
                      }}
                      onClick={() => {
                        if (isDisabled) return
                        item.onClick?.()
                        if (closeOnSelect) {
                          setOpen(false)
                          setActiveIndex(-1)
                        }
                      }}
                      className={cn(
                        'ui-menu-item ui-menu-item-hover ui-focus',
                        item.danger && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
                        isDisabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
                      )}
                    >
                      {Icon && <Icon size={16} />}
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Menu
