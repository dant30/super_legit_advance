// frontend/src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import useNotifications from '@/hooks/useNotifications'

/* =====================================================
 * Context
 * ===================================================== */

const NotificationContext = createContext(null)

/* =====================================================
 * Provider Component
 * ===================================================== */

export const NotificationProvider = ({ children }) => {
  const {
    useGetNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    error,
    clearError,
    successMessage,
    clearSuccess,
    NOTIFICATION_TYPES,
    NOTIFICATION_CHANNELS,
    NOTIFICATION_STATUSES,
    NOTIFICATION_PRIORITIES,
    getNotificationTypeDisplay,
    getNotificationStatusDisplay,
    getNotificationPriorityDisplay,
  } = useNotifications()

  // State for unread notifications
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  // Fetch notifications for the current user
  const { data: notificationsData, refetch: refetchNotifications } = useGetNotifications(
    { page_size: 10, ordering: '-created_at' },
    { refetchInterval: 30000 } // Auto-refresh every 30 seconds
  )

  // Update unread count and recent notifications
  useEffect(() => {
    if (notificationsData?.results) {
      const notifications = notificationsData.results
      const unread = notifications.filter(n => n.status === NOTIFICATION_STATUSES.SENT || 
                                              n.status === NOTIFICATION_STATUSES.DELIVERED).length
      
      setUnreadCount(unread)
      setRecentNotifications(notifications.slice(0, 5)) // Show only 5 most recent
    }
  }, [notificationsData, NOTIFICATION_STATUSES])

  /* ===== ACTIONS ===== */

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markAsRead(id)
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [markAsRead])

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead()
      setUnreadCount(0)
      refetchNotifications()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [markAllAsRead, refetchNotifications])

  const handleDeleteNotification = useCallback(async (id) => {
    try {
      await deleteNotification(id)
      refetchNotifications()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [deleteNotification, refetchNotifications])

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev)
  }, [])

  const closeNotifications = useCallback(() => {
    setShowNotifications(false)
  }, [])

  const addNotification = useCallback((notification) => {
    setRecentNotifications(prev => [notification, ...prev.slice(0, 4)])
    setUnreadCount(prev => prev + 1)
  }, [])

  // Simulate receiving a real-time notification (you would connect this to WebSockets)
  const simulateNewNotification = useCallback((type = NOTIFICATION_TYPES.SYSTEM_ALERT, title = 'New Notification', message = 'This is a test notification') => {
    const newNotification = {
      id: Date.now(),
      notification_type: type,
      title,
      message,
      status: NOTIFICATION_STATUSES.SENT,
      created_at: new Date().toISOString(),
      channel: NOTIFICATION_CHANNELS.IN_APP,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      is_read: false,
    }
    
    addNotification(newNotification)
  }, [NOTIFICATION_TYPES, NOTIFICATION_STATUSES, NOTIFICATION_CHANNELS, NOTIFICATION_PRIORITIES, addNotification])

  /* ===== CONTEXT VALUE ===== */

  const contextValue = {
    // State
    unreadCount,
    recentNotifications,
    showNotifications,
    notifications: notificationsData?.results || [],
    totalNotifications: notificationsData?.count || 0,
    isLoading: notificationsData === undefined,
    error,
    successMessage,
    
    // Actions
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    toggleNotifications,
    closeNotifications,
    addNotification,
    simulateNewNotification,
    refetchNotifications,
    
    // Clear functions
    clearError,
    clearSuccess,
    
    // Constants
    NOTIFICATION_TYPES,
    NOTIFICATION_CHANNELS,
    NOTIFICATION_STATUSES,
    NOTIFICATION_PRIORITIES,
    
    // Helper functions
    getNotificationTypeDisplay,
    getNotificationStatusDisplay,
    getNotificationPriorityDisplay,
    
    // Utility functions
    getUnreadNotifications: () => {
      return (notificationsData?.results || []).filter(
        n => n.status === NOTIFICATION_STATUSES.SENT || 
             n.status === NOTIFICATION_STATUSES.DELIVERED
      )
    },
    
    getNotificationColor: (type) => {
      const colorMap = {
        [NOTIFICATION_TYPES.LOAN_APPROVED]: 'bg-success-100 text-success-700',
        [NOTIFICATION_TYPES.LOAN_REJECTED]: 'bg-danger-100 text-danger-700',
        [NOTIFICATION_TYPES.LOAN_DISBURSED]: 'bg-primary-100 text-primary-700',
        [NOTIFICATION_TYPES.PAYMENT_RECEIVED]: 'bg-success-100 text-success-700',
        [NOTIFICATION_TYPES.PAYMENT_OVERDUE]: 'bg-danger-100 text-danger-700',
        [NOTIFICATION_TYPES.PAYMENT_REMINDER]: 'bg-warning-100 text-warning-700',
        [NOTIFICATION_TYPES.SYSTEM_ALERT]: 'bg-neutral-100 text-neutral-700',
        [NOTIFICATION_TYPES.ACCOUNT_UPDATE]: 'bg-primary-100 text-primary-700',
        [NOTIFICATION_TYPES.MARKETING]: 'bg-purple-100 text-purple-700',
        [NOTIFICATION_TYPES.OTHER]: 'bg-neutral-100 text-neutral-700',
      }
      return colorMap[type] || 'bg-neutral-100 text-neutral-700'
    },
    
    getNotificationIcon: (type) => {
      const iconMap = {
        [NOTIFICATION_TYPES.LOAN_APPROVED]: 'check-circle',
        [NOTIFICATION_TYPES.LOAN_REJECTED]: 'x-circle',
        [NOTIFICATION_TYPES.LOAN_DISBURSED]: 'dollar-sign',
        [NOTIFICATION_TYPES.PAYMENT_RECEIVED]: 'check-circle',
        [NOTIFICATION_TYPES.PAYMENT_OVERDUE]: 'alert-circle',
        [NOTIFICATION_TYPES.PAYMENT_REMINDER]: 'bell',
        [NOTIFICATION_TYPES.SYSTEM_ALERT]: 'alert-triangle',
        [NOTIFICATION_TYPES.ACCOUNT_UPDATE]: 'user',
        [NOTIFICATION_TYPES.MARKETING]: 'megaphone',
        [NOTIFICATION_TYPES.OTHER]: 'info',
      }
      return iconMap[type] || 'bell'
    },
    
    formatNotificationTime: (dateString) => {
      if (!dateString) return 'Just now'
      
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      
      return date.toLocaleDateString()
    },
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

/* =====================================================
 * Custom Hook for using the context
 * ===================================================== */

export const useNotificationContext = () => {
  const context = useContext(NotificationContext)
  
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  
  return context
}

/* =====================================================
 * Export
 * ===================================================== */

export default NotificationContext