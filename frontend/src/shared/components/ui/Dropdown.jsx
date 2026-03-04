import React, { createContext, useContext, useEffect, useId, useMemo, useRef, useState, useCallback } from 'react'
import { cn } from '@utils/cn'

const DropdownContext = createContext(null)

function useDropdownContext() {
  const ctx = useContext(DropdownContext)
  if (!ctx) throw new Error('Dropdown components must be used inside <Dropdown />')
  return ctx
}

const Dropdown = ({ children, open: controlledOpen, defaultOpen = false, onOpenChange, closeOnSelect = true }) => {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = isControlled ? controlledOpen : internalOpen
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const baseId = useId()

  const setOpen = useCallback(
    (value) => {
      if (!isControlled) setInternalOpen(value)
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange]
  )

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, setOpen])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, setOpen])

  useEffect(() => {
    if (!open || !menuRef.current) return
    const firstItem = menuRef.current.querySelector('[role="menuitem"]:not([disabled])')
    firstItem?.focus()
  }, [open])

  const value = useMemo(
    () => ({ open, setOpen, closeOnSelect, triggerRef, menuRef, baseId }),
    [open, setOpen, closeOnSelect, baseId]
  )

  return (
    <DropdownContext.Provider value={value}>
      <div ref={rootRef} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

const DropdownTrigger = ({ children, asChild = false, className = '' }) => {
  const { open, setOpen, triggerRef, baseId } = useDropdownContext()
  const menuId = `${baseId}-menu`

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    }
  }

  const triggerProps = {
    ref: triggerRef,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: () => setOpen(!open),
    onKeyDown,
    className: cn('ui-focus', className),
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...triggerProps,
      onClick: (e) => {
        children.props.onClick?.(e)
        triggerProps.onClick()
      },
      onKeyDown: (e) => {
        children.props.onKeyDown?.(e)
        onKeyDown(e)
      },
    })
  }

  return (
    <button type="button" {...triggerProps}>
      {children}
    </button>
  )
}

const DropdownMenu = ({ children, className = '', align = 'left' }) => {
  const { open, menuRef, baseId } = useDropdownContext()
  if (!open) return null

  const alignment = align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'

  const onKeyDown = (e) => {
    const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])') || [])
    if (!items.length) return
    const idx = items.indexOf(document.activeElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(idx + 1 + items.length) % items.length]?.focus()
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(idx - 1 + items.length) % items.length]?.focus()
    }
    if (e.key === 'Home') {
      e.preventDefault()
      items[0]?.focus()
    }
    if (e.key === 'End') {
      e.preventDefault()
      items[items.length - 1]?.focus()
    }
  }

  return (
    <div
      id={`${baseId}-menu`}
      ref={menuRef}
      role="menu"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={cn('absolute z-50 mt-2 min-w-[180px] ui-menu p-1', alignment, className)}
    >
      {children}
    </div>
  )
}

const DropdownItem = ({ children, onSelect, disabled = false, className = '' }) => {
  const { setOpen, closeOnSelect } = useDropdownContext()

  const handleSelect = () => {
    if (disabled) return
    onSelect?.()
    if (closeOnSelect) setOpen(false)
  }

  return (
    <button
      role="menuitem"
      type="button"
      disabled={disabled}
      onClick={handleSelect}
      className={cn(
        'ui-menu-item ui-menu-item-hover ui-focus',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
        className
      )}
    >
      {children}
    </button>
  )
}

const DropdownDivider = ({ className = '' }) => (
  <div role="separator" className={cn('my-1 h-px bg-gray-200 dark:bg-slate-700', className)} />
)

export default Dropdown
export { DropdownTrigger, DropdownMenu, DropdownItem, DropdownDivider }
