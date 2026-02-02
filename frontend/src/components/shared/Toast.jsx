// frontend/src/components/shared/Toast.jsx
import React from 'react'
import { useToast } from '@contexts/ToastContext'

// Toast Component for direct use
const Toast = ({ 
  title, 
  message, 
  variant = 'info', 
  duration = 5000,
  onClose,
  className 
}) => {
  const { addToast } = useToast()
  
  React.useEffect(() => {
    const id = addToast({
      title,
      message,
      variant,
      duration,
      onClose,
    })
    
    return () => {
      // Cleanup if needed
    }
  }, [addToast, title, message, variant, duration, onClose])
  
  return null
}

// Convenience hook that returns toast methods
export const useToaster = () => {
  const toast = useToast()
  
  return {
    toast,
    success: (message, options = {}) => toast.success(message, options),
    error: (message, options = {}) => toast.error(message, options),
    info: (message, options = {}) => toast.info(message, options),
    warning: (message, options = {}) => toast.warning(message, options),
    clear: () => toast.clearAll(),
  }
}

// Export the useToast hook for components that need it
export { useToast }

export default Toast