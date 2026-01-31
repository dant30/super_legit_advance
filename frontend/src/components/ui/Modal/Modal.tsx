// frontend/src/components/ui/Modal/Modal.tsx
import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type ModalPadding = 'none' | 'sm' | 'md' | 'lg'

export interface ModalProps {
  /** Main prop for controlling visibility */
  isOpen?: boolean
  /** Alias for isOpen (compatibility) */
  open?: boolean
  /** Alias for isOpen (compatibility) */
  visible?: boolean
  /** Called when modal should close */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal description */
  description?: string
  /** Modal content */
  children: React.ReactNode
  /** Size of the modal */
  size?: ModalSize
  /** Padding inside modal */
  padding?: ModalPadding
  /** Show close button */
  showCloseButton?: boolean
  /** Close when clicking overlay */
  closeOnOverlayClick?: boolean
  /** Close when pressing escape */
  closeOnEscape?: boolean
  /** Additional className */
  className?: string
  /** Prevent body scroll when open */
  preventBodyScroll?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  open,
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
  const resolvedOpen = isOpen ?? open ?? visible ?? false

  useEffect(() => {
    if (!resolvedOpen || !closeOnEscape) return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
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

  const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  const paddingClasses: Record<ModalPadding, string> = {
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
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative w-full rounded-2xl bg-white dark:bg-neutral-800 shadow-xl',
              sizeClasses[size],
              className
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between border-b px-6 py-4">
                <div>
                  {title && (
                    <h3 id="modal-title" className="text-lg font-semibold">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p id="modal-description" className="mt-1 text-sm text-neutral-500">
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
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

/* ------------------------ Subcomponents --------------------------- */

export const ModalFooter: React.FC<{
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
}> = ({ children, align = 'right', className }) => {
  const alignMap = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  return (
    <div
      className={cn('mt-6 flex gap-3', alignMap[align], className)}
    >
      {children}
    </div>
  )
}

export const ModalSection: React.FC<{
  children: React.ReactNode
  title?: string
  border?: boolean
  className?: string
}> = ({ children, title, border = true, className }) => (
  <div
    className={cn(
      border && 'border-t pt-6',
      className
    )}
  >
    {title && <h4 className="mb-3 text-sm font-medium">{title}</h4>}
    {children}
  </div>
)