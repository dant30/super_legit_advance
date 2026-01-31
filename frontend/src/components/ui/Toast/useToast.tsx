// frontend/src/components/ui/Toast/useToast.tsx - FIXED VERSION
import { useContext } from 'react'
import { ToastContext } from './ToastProvider'

export const useToast = () => {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  // Create a compatible API
  const toast = (props: {
    title?: string
    description?: string
    variant?: 'default' | 'destructive' | 'success' | 'error' | 'info' | 'warning'
  }) => {
    const typeMap = {
      'default': 'info',
      'destructive': 'error',
      'success': 'success',
      'error': 'error',
      'info': 'info',
      'warning': 'warning'
    } as const

    context.addToast({
      title: props.title,
      message: props.description || props.title || '',
      type: typeMap[props.variant || 'default'],
    })
  }

  return {
    toast,
    success: (message: string, title?: string) => {
      context.addToast({ title, message, type: 'success' })
    },
    error: (message: string, title?: string) => {
      context.addToast({ title, message, type: 'error' })
    },
    info: (message: string, title?: string) => {
      context.addToast({ title, message, type: 'info' })
    },
    warning: (message: string, title?: string) => {
      context.addToast({ title, message, type: 'warning' })
    }
  }
}