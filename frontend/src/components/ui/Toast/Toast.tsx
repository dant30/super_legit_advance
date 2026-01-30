import React, { useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  title?: string
  message: string
  type?: ToastType
  duration?: number
  onClose: (id: string) => void
}

const defaultDuration = 5000

const Toast: React.FC<ToastProps> = ({ id, title, message, type = 'info', duration = defaultDuration, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const t = setTimeout(() => onClose(id), duration)
      return () => clearTimeout(t)
    }
  }, [id, duration, onClose])

  const typeClasses: Record<ToastType, string> = {
    success: 'bg-success-50 border-success-200 text-success-700',
    error: 'bg-danger-50 border-danger-200 text-danger-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-warning-50 border-warning-200 text-warning-700',
  }

  return (
    <div className={cn('rounded-md border p-3 shadow-sm flex items-start gap-3', typeClasses[type])} role="alert">
      <div className="flex-1">
        {title && <div className="font-medium text-sm">{title}</div>}
        <div className="text-sm mt-1">{message}</div>
      </div>
      <button aria-label="Close toast" onClick={() => onClose(id)} className="ml-2 p-1">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Toast