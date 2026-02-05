// frontend/src/components/ui/Message.jsx
// frontend/src/components/ui/Message.jsx
import { useToast } from '@contexts/ToastContext'

// Singleton-style helper so you can call `message.success(...)` outside React components
let toastInstance = null
export const setToastInstance = (toast) => {
  toastInstance = toast
}

// Main message API
const message = {
  success: (msg, options = {}) => {
    if (!toastInstance) return console.warn('[Message] Toast instance not ready')
    toastInstance.success(msg, options)
  },
  error: (msg, options = {}) => {
    if (!toastInstance) return console.warn('[Message] Toast instance not ready')
    toastInstance.error(msg, options)
  },
  info: (msg, options = {}) => {
    if (!toastInstance) return console.warn('[Message] Toast instance not ready')
    toastInstance.info(msg, options)
  },
  warning: (msg, options = {}) => {
    if (!toastInstance) return console.warn('[Message] Toast instance not ready')
    toastInstance.warning(msg, options)
  },
  clear: () => {
    if (!toastInstance) return console.warn('[Message] Toast instance not ready')
    toastInstance.clearAll()
  },
}

// Provider wrapper to inject the toast instance
export const MessageProvider = ({ children }) => {
  const toast = useToast()

  // set the singleton instance
  setToastInstance(toast)

  return children
}

export default message
