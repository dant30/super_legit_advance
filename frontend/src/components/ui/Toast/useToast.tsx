import { useContext } from 'react'
import { ToastContext } from './ToastProvider'

export const useToast = () => {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return {
    toast: (props: {
      title?: string
      description?: string
      variant?: 'default' | 'destructive'
    }) => {
      context.addToast({
        title: props.title,
        message: props.description || '',
        type: props.variant === 'destructive' ? 'error' : 'success',
      })
    },
  }
}