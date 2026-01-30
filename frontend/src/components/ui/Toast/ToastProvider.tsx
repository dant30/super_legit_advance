import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import Toast, { ToastProps } from './Toast'
import { v4 as uuidv4 } from 'uuid'

type ToastInput = Omit<Partial<ToastProps>, 'id' | 'onClose'> & { message: string }

type ToastContextValue = {
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

  const addToast = useCallback((t: ToastInput) => {
    const id = uuidv4()
    setToasts(prev => [...prev, { ...t, id, onClose: () => removeToast(id) }])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider