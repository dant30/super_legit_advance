import React, { createContext, useContext, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Toast from './Toast'
import type { ToastProps } from './Toast'

export interface ToastMessage extends Omit<ToastProps, 'onClose'> {
  id: string
}

interface ToastContextType {
  toasts: ToastMessage[]
  showToast: (props: Omit<ToastMessage, 'id'>) => void
  hideToast: (id: string) => void
  hideAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let toastId = 0

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((props: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${++toastId}`
    const newToast = { ...props, id }
    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration if set
    if ((props.duration ?? 5000) !== 0) {
      setTimeout(() => {
        hideToast(id)
      }, props.duration ?? 5000)
    }
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const hideAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, hideToast, hideAllToasts }}
    >
      {children}
      {createPortal(
        <div className="fixed z-[9999]">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => hideToast(toast.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export default ToastProvider