// frontend/src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import useNotifications from '@hooks/useNotifications'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const {
    useGetNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkSend,
    sendTestNotification,
    createNotification,
    useGetStats,
    useGetTemplates,
    useGetSMSStats,
    error,
    clearError,
    successMessage,
    clearSuccess,
    notificationsAPI,
  } = useNotifications()

  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  const { data: notificationsData, refetch: refetchNotifications, isLoading: notificationsLoading } =
    useGetNotifications({ page_size: 10, ordering: '-created_at' }, { refetchInterval: 30000 })

  // derive unread + recent on data change
  useEffect(() => {
    const results = notificationsData?.results || []
    setRecentNotifications(results.slice(0, 5))
    const unread = results.filter(n => ['SENT', 'DELIVERED'].includes(n.status)).length
    setUnreadCount(unread)
  }, [notificationsData])

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markAsRead(id)
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) {
      console.error(e)
    }
  }, [markAsRead])

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead()
      setUnreadCount(0)
      await refetchNotifications()
    } catch (e) {
      console.error(e)
    }
  }, [markAllAsRead, refetchNotifications])

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNotification(id)
      await refetchNotifications()
    } catch (e) {
      console.error(e)
    }
  }, [deleteNotification, refetchNotifications])

  const addNotification = useCallback((notification) => {
    setRecentNotifications(prev => [notification, ...prev.slice(0, 4)])
    setUnreadCount(prev => prev + 1)
  }, [])

  const simulateNewNotification = useCallback((payload) => {
    // client-side simulated notification (for dev/testing)
    const n = {
      id: Date.now(),
      notification_type: payload?.type || 'SYSTEM_ALERT',
      title: payload?.title || 'Test',
      message: payload?.message || 'This is a simulated notification',
      status: 'SENT',
      created_at: new Date().toISOString(),
      recipient_name: payload?.recipient_name || 'You',
      channel: 'IN_APP',
      priority: 'MEDIUM',
      is_read: false,
    }
    addNotification(n)
  }, [addNotification])

  const toggleNotifications = useCallback(() => setShowNotifications(s => !s), [])
  const closeNotifications = useCallback(() => setShowNotifications(false), [])

  const contextValue = {
    // state
    unreadCount,
    recentNotifications,
    showNotifications,
    notifications: notificationsData?.results || [],
    totalNotifications: notificationsData?.count || 0,
    isLoading: notificationsLoading,
    error,
    successMessage,

    // actions
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    bulkSend: async (data) => bulkSend(data),
    sendTestNotification: async (data) => sendTestNotification(data),
    createNotification: async (data) => createNotification(data),

    // helpers
    addNotification,
    simulateNewNotification,
    toggleNotifications,
    closeNotifications,
    refetchNotifications,

    // clearers
    clearError,
    clearSuccess,

    // api helpers
    previewTemplate: notificationsAPI.previewTemplate?.bind(notificationsAPI),
    getTypeDisplay: notificationsAPI.getTypeDisplay?.bind(notificationsAPI),
    formatNotification: notificationsAPI.formatNotification?.bind(notificationsAPI),
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider')
  return ctx
}

export default NotificationContext