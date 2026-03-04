import React, { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@utils/cn'

export default function Popconfirm({
  title = 'Are you sure?',
  description = '',
  onConfirm,
  onCancel,
  confirmText = 'Yes',
  cancelText = 'No',
  placement = 'top',
  disabled = false,
  children,
  icon,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const cancelRef = useRef(null)
  const panelId = `popconfirm-${useId()}`

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
        onCancel?.()
      }
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        onCancel?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    cancelRef.current?.focus()

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onCancel])

  const getPlacementStyle = () => {
    switch (placement) {
      case 'top':
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2'
      case 'bottom':
        return 'top-full mt-2 left-1/2 -translate-x-1/2'
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2'
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2'
      default:
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2'
    }
  }

  const handleConfirm = async () => {
    setOpen(false)
    try {
      await onConfirm?.()
    } catch (err) {
      console.error('Popconfirm onConfirm error:', err)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    onCancel?.()
  }

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        type="button"
        className={cn(disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer', 'ui-focus rounded-md')}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        {children}
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn('absolute z-50 w-64 ui-panel p-4 text-gray-800 dark:text-gray-100', getPlacementStyle())}
          >
            <div className="flex items-start gap-2">
              {icon && <div className="text-yellow-500">{icon}</div>}
              <div className="flex-1">
                <p className="text-sm font-semibold">{title}</p>
                {description && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                onClick={handleCancel}
                aria-label="Close popconfirm"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                className="ui-focus rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                onClick={handleCancel}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className="ui-focus flex items-center gap-1 rounded-md bg-warning-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-warning-600"
                onClick={handleConfirm}
              >
                {confirmText} <Check size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
