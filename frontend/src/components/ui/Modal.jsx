// frontend/src/components/ui/Modal.jsx
import React, { useEffect, useId } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@utils/cn'

/**
 * @typedef {Object} ModalProps
 * @property {boolean} [open]
 * @property {boolean} [isOpen]
 * @property {boolean} [visible]
 * @property {() => void} onClose
 * @property {string} [title]
 * @property {string} [description]
 * @property {'sm'|'md'|'lg'|'xl'|'full'} [size]
 * @property {'none'|'sm'|'md'|'lg'} [padding]
 * @property {boolean} [showCloseButton]
 * @property {boolean} [closeOnOverlayClick]
 * @property {boolean} [closeOnEscape]
 * @property {boolean} [preventBodyScroll]
 * @property {string} [className]
 */

export const Modal = ({
  open,
  isOpen,
  visible,
  onClose,
  title,
  description,
  children,
  size = 'md',
  padding = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  preventBodyScroll = true,
}) => {
  const resolvedOpen = open ?? isOpen ?? visible ?? false
  const reactId = useId()
  const titleId = `modal-title-${reactId}`
  const descId = `modal-desc-${reactId}`

  useEffect(() => {
    if (!resolvedOpen || !closeOnEscape) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [resolvedOpen, closeOnEscape, onClose])

  useEffect(() => {
    if (!preventBodyScroll) return

    if (resolvedOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [resolvedOpen, preventBodyScroll])

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <AnimatePresence>
      {resolvedOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative w-full rounded-2xl bg-white dark:bg-slate-800 shadow-hard',
              sizeClasses[size],
              className
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                <div>
                  {title && (
                    <h3 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p id={descId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            <div className={paddingClasses[padding]}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const ModalFooter = ({ children, align = 'right', className }) => {
  const alignMap = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  return <div className={cn('mt-6 flex gap-3', alignMap[align], className)}>{children}</div>
}

Modal.Footer = ModalFooter

export const ModalSection = ({ children, title, border = true, className }) => (
  <div className={cn(border && 'border-t border-gray-200 dark:border-slate-700 pt-6', className)}>
    {title && <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h4>}
    {children}
  </div>
)

Modal.Section = ModalSection

export const ConfirmationModal = ({
  open,
  isOpen,
  visible,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) => {
  const confirmButtonClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700',
    danger: 'bg-danger-600 hover:bg-danger-700',
    warning: 'bg-warning-600 hover:bg-warning-700',
    success: 'bg-success-600 hover:bg-success-700',
  }

  return (
    <Modal
      open={open}
      isOpen={isOpen}
      visible={visible}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
    >
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-700"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50',
            confirmButtonClasses[confirmVariant]
          )}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default Modal
