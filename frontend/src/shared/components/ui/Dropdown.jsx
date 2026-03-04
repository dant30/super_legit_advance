// frontend/src/components/ui/Dropdown.jsx
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@utils/cn'

const DropdownContext = createContext(null)

function useDropdownContext() {
  const ctx = useContext(DropdownContext)
  if (!ctx) throw new Error('Dropdown components must be used inside <Dropdown />')
  return ctx
}

/**
 * @typedef {Object} DropdownProps
 * @property {React.ReactNode} children
 * @property {boolean} [open]
 * @property {boolean} [defaultOpen]
 * @property {(open: boolean) => void} [onOpenChange]
 * @property {boolean} [closeOnSelect]
 */

const Dropdown = ({ children, open: controlledOpen, defaultOpen = false, onOpenChange, closeOnSelect = true }) => {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = useCallback(
    (value) => {
      if (!isControlled) setInternalOpen(value)
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange]
  )

  const rootRef = useRef(null)

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
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, setOpen])

  return (
    <DropdownContext.Provider value={{ open, setOpen, closeOnSelect }}>
      <div ref={rootRef} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

const DropdownTrigger = ({ children, asChild = false, className = '' }) => {
  const { open, setOpen } = useDropdownContext()

  const triggerProps = {
    role: 'button',
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    onClick: () => setOpen(!open),
    className,
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, triggerProps)
  }

  return (
    <button type="button" {...triggerProps}>
      {children}
    </button>
  )
}

const DropdownMenu = ({ children, className = '', align = 'left' }) => {
  const { open } = useDropdownContext()
  if (!open) return null

  const alignment = align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'

  return (
    <div
      role="menu"
      className={cn(
        'absolute z-50 mt-2 min-w-[180px] rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-medium focus:outline-none',
        alignment,
        className
      )}
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
      disabled={disabled}
      onClick={handleSelect}
      className={cn(
        'flex w-full items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-slate-700',
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
