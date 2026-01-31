// frontend/src/components/shared/ConfirmDialog.tsx
import React from 'react'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void | Promise<void>
  onClose: () => void
  isDangerous?: boolean
  confirmText?: string
  cancelText?: string
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  isDangerous = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const [isLoading, setIsLoading] = React.useState(false)

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {isDangerous && (
              <AlertCircle className="h-6 w-6 text-danger-600 flex-shrink-0 mt-0.5" />
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close dialog" // ← ADD THIS LINE
            title="Close" // ← ALSO ADD THIS FOR VISUAL HINT
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog