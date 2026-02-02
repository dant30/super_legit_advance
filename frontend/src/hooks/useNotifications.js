// frontend/src/hooks/useNotifications.js
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import notificationsAPI, {
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUSES,
  NOTIFICATION_PRIORITIES,
  TEMPLATE_TYPES,
  TEMPLATE_CATEGORIES,
  SMS_PROVIDERS,
  SMS_STATUSES
} from '@/api/notifications'

/* =====================================================
 * Query Keys
 * ===================================================== */

export const notificationKeys = {
  all: ['notifications'],
  lists: () => [...notificationKeys.all, 'list'],
  list: (filters) => [...notificationKeys.lists(), filters],
  details: () => [...notificationKeys.all, 'detail'],
  detail: (id) => [...notificationKeys.details(), id],
  stats: (params) => [...notificationKeys.all, 'stats', params],
  
  templates: {
    all: ['templates'],
    lists: () => [...notificationKeys.templates.all, 'list'],
    list: (filters) => [...notificationKeys.templates.lists(), filters],
    detail: (id) => [...notificationKeys.templates.all, 'detail', id],
  },
  
  sms: {
    all: ['sms-logs'],
    lists: () => [...notificationKeys.sms.all, 'list'],
    list: (filters) => [...notificationKeys.sms.lists(), filters],
    detail: (id) => [...notificationKeys.sms.all, 'detail', id],
    stats: (params) => [...notificationKeys.sms.all, 'stats', params],
  },
}

/* =====================================================
 * Constants Export
 * ===================================================== */

export {
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUSES,
  NOTIFICATION_PRIORITIES,
  TEMPLATE_TYPES,
  TEMPLATE_CATEGORIES,
  SMS_PROVIDERS,
  SMS_STATUSES
}

/* =====================================================
 * Main Hook
 * ===================================================== */

export const useNotifications = () => {
  const queryClient = useQueryClient()
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  /* ===== HELPER FUNCTIONS ===== */

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  const handleError = useCallback((error) => {
    const errorMessage = error?.message || 'An unexpected error occurred'
    setError(errorMessage)
    setTimeout(() => setError(null), 5000)
    throw error
  }, [])

  const handleSuccess = useCallback((message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }, [])

  /* ===== NOTIFICATIONS QUERIES ===== */

  const useGetNotifications = (filters = {}, options = {}) => {
    return useQuery({
      queryKey: notificationKeys.list(filters),
      queryFn: () => notificationsAPI.getNotifications(filters),
      onError: handleError,
      ...options
    })
  }

  const useGetNotification = (id, options = {}) => {
    return useQuery({
      queryKey: notificationKeys.detail(id),
      queryFn: () => notificationsAPI.getNotification(id),
      enabled: !!id,
      onError: handleError,
      ...options
    })
  }

  const useGetNotificationStats = (params = {}, options = {}) => {
    return useQuery({
      queryKey: notificationKeys.stats(params),
      queryFn: () => notificationsAPI.getStats(params),
      onError: handleError,
      ...options
    })
  }

  /* ===== TEMPLATES QUERIES ===== */

  const useGetTemplates = (filters = {}, options = {}) => {
    return useQuery({
      queryKey: notificationKeys.templates.list(filters),
      queryFn: () => notificationsAPI.getTemplates(filters),
      onError: handleError,
      ...options
    })
  }

  const useGetTemplate = (id, options = {}) => {
    return useQuery({
      queryKey: notificationKeys.templates.detail(id),
      queryFn: () => notificationsAPI.getTemplate(id),
      enabled: !!id,
      onError: handleError,
      ...options
    })
  }

  /* ===== SMS LOGS QUERIES ===== */

  const useGetSMSLogs = (filters = {}, options = {}) => {
    return useQuery({
      queryKey: notificationKeys.sms.list(filters),
      queryFn: () => notificationsAPI.getSMSLogs(filters),
      onError: handleError,
      ...options
    })
  }

  const useGetSMSLog = (id, options = {}) => {
    return useQuery({
      queryKey: notificationKeys.sms.detail(id),
      queryFn: () => notificationsAPI.getSMSLog(id),
      enabled: !!id,
      onError: handleError,
      ...options
    })
  }

  const useGetSMSStats = (params = {}, options = {}) => {
    return useQuery({
      queryKey: notificationKeys.sms.stats(params),
      queryFn: () => notificationsAPI.getSMSStats(params),
      onError: handleError,
      ...options
    })
  }

  /* ===== NOTIFICATIONS MUTATIONS ===== */

  const createNotificationMutation = useMutation({
    mutationFn: (data) => notificationsAPI.createNotification(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      handleSuccess('Notification created successfully')
      return data
    },
    onError: handleError
  })

  const sendNotificationMutation = useMutation({
    mutationFn: ({ id, payload }) => notificationsAPI.sendNotification(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      handleSuccess('Notification sent successfully')
      return data
    },
    onError: handleError
  })

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markAsRead(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      handleSuccess('Notification marked as read')
      return data
    },
    onError: handleError
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      handleSuccess('All notifications marked as read')
      return data
    },
    onError: handleError
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => notificationsAPI.deleteNotification(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      handleSuccess('Notification deleted successfully')
      return data
    },
    onError: handleError
  })

  const sendBulkNotificationsMutation = useMutation({
    mutationFn: (data) => notificationsAPI.sendBulkNotifications(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.sms.stats() })
      handleSuccess(`Bulk notifications sent: ${data.successful} successful, ${data.failed} failed`)
      return data
    },
    onError: handleError
  })

  const sendTestNotificationMutation = useMutation({
    mutationFn: (data) => notificationsAPI.sendTestNotification(data),
    onSuccess: (data) => {
      handleSuccess('Test notification sent successfully')
      return data
    },
    onError: handleError
  })

  /* ===== TEMPLATES MUTATIONS ===== */

  const createTemplateMutation = useMutation({
    mutationFn: (data) => notificationsAPI.createTemplate(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates.lists() })
      handleSuccess('Template created successfully')
      return data
    },
    onError: handleError
  })

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => notificationsAPI.updateTemplate(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates.lists() })
      handleSuccess('Template updated successfully')
      return data
    },
    onError: handleError
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => notificationsAPI.deleteTemplate(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates.lists() })
      handleSuccess('Template deleted successfully')
      return data
    },
    onError: handleError
  })

  const duplicateTemplateMutation = useMutation({
    mutationFn: ({ id, newName }) => notificationsAPI.duplicateTemplate(id, newName),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates.lists() })
      handleSuccess('Template duplicated successfully')
      return data
    },
    onError: handleError
  })

  /* ===== COMBINED HOOK RETURN ===== */

  return {
    // State
    error,
    successMessage,
    
    // Clear functions
    clearError: () => setError(null),
    clearSuccess: () => setSuccessMessage(null),
    clearMessages,

    // Constants
    NOTIFICATION_TYPES,
    NOTIFICATION_CHANNELS,
    NOTIFICATION_STATUSES,
    NOTIFICATION_PRIORITIES,
    TEMPLATE_TYPES,
    TEMPLATE_CATEGORIES,
    SMS_PROVIDERS,
    SMS_STATUSES,

    // Queries
    useGetNotifications,
    useGetNotification,
    useGetNotificationStats,
    useGetTemplates,
    useGetTemplate,
    useGetSMSLogs,
    useGetSMSLog,
    useGetSMSStats,

    // Notification Mutations
    createNotification: createNotificationMutation.mutateAsync,
    createNotificationIsLoading: createNotificationMutation.isPending,
    sendNotification: sendNotificationMutation.mutateAsync,
    sendNotificationIsLoading: sendNotificationMutation.isPending,
    markAsRead: markAsReadMutation.mutateAsync,
    markAsReadIsLoading: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    markAllAsReadIsLoading: markAllAsReadMutation.isPending,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    deleteNotificationIsLoading: deleteNotificationMutation.isPending,
    sendBulkNotifications: sendBulkNotificationsMutation.mutateAsync,
    sendBulkNotificationsIsLoading: sendBulkNotificationsMutation.isPending,
    sendTestNotification: sendTestNotificationMutation.mutateAsync,
    sendTestNotificationIsLoading: sendTestNotificationMutation.isPending,

    // Template Mutations
    createTemplate: createTemplateMutation.mutateAsync,
    createTemplateIsLoading: createTemplateMutation.isPending,
    updateTemplate: updateTemplateMutation.mutateAsync,
    updateTemplateIsLoading: updateTemplateMutation.isPending,
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    deleteTemplateIsLoading: deleteTemplateMutation.isPending,
    duplicateTemplate: duplicateTemplateMutation.mutateAsync,
    duplicateTemplateIsLoading: duplicateTemplateMutation.isPending,

    // Helper methods from API
    formatNotificationData: notificationsAPI.formatNotificationData,
    getNotificationTypeDisplay: notificationsAPI.getNotificationTypeDisplay,
    getNotificationStatusDisplay: notificationsAPI.getNotificationStatusDisplay,
    getNotificationPriorityDisplay: notificationsAPI.getNotificationPriorityDisplay,
  }
}

export default useNotifications