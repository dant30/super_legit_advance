import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import Toast, { ToastProps } from './Toast'

// Simple UUID generator (no external dependency needed)
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

type ToastInput = Omit<Partial<ToastProps>, 'id' | 'onClose'> & { message: string }

interface ToastContextValue {
  addToast: (t: ToastInput) => string
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([])

  const addToast = useCallback((t: ToastInput): string => {
    const id = generateId()
    const newToast: ToastProps & { id: string } = {
      ...t,
      id,
      onClose: () => removeToast(id),
    }
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const value: ToastContextValue = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider