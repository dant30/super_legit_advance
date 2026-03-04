// frontend/src/components/ui/Popconfirm.jsx
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'

/**
 * Popconfirm Component
 * Props:
 * - title: string, main message
 * - description: string, optional additional text
 * - onConfirm: function, called when user confirms
 * - onCancel: function, called when user cancels
 * - confirmText: string, default 'Yes'
 * - cancelText: string, default 'No'
 * - placement: 'top' | 'bottom' | 'left' | 'right', default 'top'
 * - disabled: boolean, default false
 * - children: JSX, element to wrap the popconfirm trigger
 * - icon: JSX, optional icon to show in popconfirm
 */
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
  const ref = useRef(null)

  // Close popconfirm when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
        onCancel?.()
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onCancel])

  // Positioning logic
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

  // Handle confirm click
  const handleConfirm = async () => {
    setOpen(false)
    if (onConfirm) {
      try {
        await onConfirm()
      } catch (err) {
        console.error('Popconfirm onConfirm error:', err)
      }
    }
  }

  // Handle cancel click
  const handleCancel = () => {
    setOpen(false)
    onCancel?.()
  }

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Trigger */}
      <div
        className={`cursor-pointer ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        {children}
      </div>

      {/* Popconfirm panel */}
      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-64 rounded-lg shadow-lg bg-white border border-gray-200 p-4 text-gray-800 ${getPlacementStyle()}`}
          >
            {/* Header */}
            <div className="flex items-start gap-2">
              {icon && <div className="text-yellow-500">{icon}</div>}
              <div className="flex-1">
                <p className="font-semibold text-sm">{title}</p>
                {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={handleCancel}
                aria-label="Close popconfirm"
              >
                <X size={16} />
              </button>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                onClick={handleCancel}
              >
                {cancelText}
              </button>
              <button
                className="px-3 py-1.5 rounded-md text-sm bg-yellow-500 text-white hover:bg-yellow-600 transition-colors flex items-center gap-1"
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
