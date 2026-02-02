// frontend/src/components/shared/ConfirmDialog.jsx
import React, { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import Button from '@components/ui/Button'
import { cn } from '@utils/cn'

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  isDangerous = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  size = 'sm',
  showIcon = true,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm p-6',
    md: 'max-w-md p-7',
    lg: 'max-w-lg p-8',
    xl: 'max-w-xl p-8',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        'bg-white dark:bg-slate-800 rounded-xl shadow-hard w-full mx-auto',
        sizeClasses[size]
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {showIcon && isDangerous && (
              <AlertCircle className="h-6 w-6 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1"
            aria-label="Close dialog"
            title="Close"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            size="sm"
          >
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={isLoading}
            size="sm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Confirmation Hook
export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState({})

  const confirm = (config) => {
    setConfig(config)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setConfig({})
  }

  const ConfirmDialogWrapper = () => (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={close}
      {...config}
    />
  )

  return { confirm, close, ConfirmDialogWrapper }
}

export default ConfirmDialog