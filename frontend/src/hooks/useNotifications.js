// frontend/src/hooks/useNotifications.js
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsAPI } from '@api/notifications'

/* Query keys */
export const notificationKeys = {
  all: ['notifications'],
  lists: () => [...notificationKeys.all, 'list'],
  list: (filters = {}) => [...notificationKeys.lists(), JSON.stringify(filters)],
  detail: (id) => [...notificationKeys.all, 'detail', id],
  stats: (params = {}) => [...notificationKeys.all, 'stats', JSON.stringify(params)],
  templates: {
    list: (filters = {}) => [...notificationKeys.all, 'templates', JSON.stringify(filters)],
    detail: (id) => [...notificationKeys.all, 'templates', 'detail', id],
  },
  sms: {
    list: (filters = {}) => [...notificationKeys.all, 'sms-logs', JSON.stringify(filters)],
    detail: (id) => [...notificationKeys.all, 'sms-logs', 'detail', id],
    stats: (params = {}) => [...notificationKeys.all, 'sms-stats', JSON.stringify(params)],
  }
}

/* Main hook */
export const useNotifications = () => {
  const qc = useQueryClient()

  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleError = useCallback((err) => {
    const msg = err?.message || 'An unexpected error occurred'
    setError(msg)
    setTimeout(() => setError(null), 5000)
    throw err
  }, [])

  const handleSuccess = useCallback((msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }, [])

  // ----- Queries -----

  const useGetNotifications = (filters = {}, options = {}) =>
    useQuery({
      queryKey: notificationKeys.list(filters),
      queryFn: () => notificationsAPI.getNotifications(filters),
      onError: handleError,
      keepPreviousData: true,
      ...options,
    })

  const useGetNotification = (id, options = {}) =>
    useQuery({
      queryKey: notificationKeys.detail(id),
      queryFn: () => notificationsAPI.getNotification(id),
      enabled: !!id,
      onError: handleError,
      ...options,
    })

  const useGetStats = (params = {}, options = {}) =>
    useQuery({
      queryKey: notificationKeys.stats(params),
      queryFn: () => notificationsAPI.getStats(params),
      onError: handleError,
      ...options,
    })

  const useGetTemplates = (filters = {}, options = {}) =>
    useQuery({
      queryKey: notificationKeys.templates.list(filters),
      queryFn: () => notificationsAPI.getTemplates(filters),
      onError: handleError,
      ...options,
    })

  const useGetTemplate = (id, options = {}) =>
    useQuery({
      queryKey: notificationKeys.templates.detail(id),
      queryFn: () => notificationsAPI.getTemplate(id),
      enabled: !!id,
      onError: handleError,
      ...options,
    })

  const useGetSMSLogs = (filters = {}, options = {}) =>
    useQuery({
      queryKey: notificationKeys.sms.list(filters),
      queryFn: () => notificationsAPI.getSMSLogs(filters),
      onError: handleError,
      ...options,
    })

  const useGetSMSLog = (id, options = {}) =>
    useQuery({
      queryKey: notificationKeys.sms.detail(id),
      queryFn: () => notificationsAPI.getSMSLog(id),
      enabled: !!id,
      onError: handleError,
      ...options,
    })

  const useGetSMSStats = (params = {}, options = {}) =>
    useQuery({
      queryKey: notificationKeys.sms.stats(params),
      queryFn: () => notificationsAPI.getSMSStats(params),
      onError: handleError,
      ...options,
    })

  // ----- Mutations -----

  const createNotification = useMutation({
    mutationFn: (data) => notificationsAPI.createNotification(data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      handleSuccess('Notification created')
    },
    onError: handleError,
  })

  const sendNotification = useMutation({
    mutationFn: ({ id, payload }) => notificationsAPI.sendNotification(id, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: notificationKeys.detail(vars.id) })
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      handleSuccess('Notification sent')
    },
    onError: handleError,
  })

  const markAsRead = useMutation({
    mutationFn: (id) => notificationsAPI.markAsRead(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: notificationKeys.detail(id) })
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      handleSuccess('Marked as read')
    },
    onError: handleError,
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      handleSuccess('All marked as read')
    },
    onError: handleError,
  })

  const deleteNotification = useMutation({
    mutationFn: (id) => notificationsAPI.deleteNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      handleSuccess('Notification deleted')
    },
    onError: handleError,
  })

  const bulkSend = useMutation({
    mutationFn: (data) => notificationsAPI.bulkSend(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      qc.invalidateQueries({ queryKey: notificationKeys.stats() })
      handleSuccess(`Bulk send: ${res.successful || 0} successful`)
    },
    onError: handleError,
  })

  const sendTestNotification = useMutation({
    mutationFn: (data) => notificationsAPI.sendTestNotification(data),
    onSuccess: () => handleSuccess('Test notification sent'),
    onError: handleError,
  })

  // Templates mutations
  const createTemplate = useMutation({
    mutationFn: (data) => notificationsAPI.createTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.templates.lists() })
      handleSuccess('Template created')
    },
    onError: handleError,
  })

  const updateTemplate = useMutation({
    mutationFn: ({ id, data }) => notificationsAPI.updateTemplate(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: notificationKeys.templates.detail(vars.id) })
      qc.invalidateQueries({ queryKey: notificationKeys.templates.lists() })
      handleSuccess('Template updated')
    },
    onError: handleError,
  })

  const previewTemplate = useMutation({
    mutationFn: ({ id, context }) => notificationsAPI.previewTemplate(id, context),
    onError: handleError,
  })

  const duplicateTemplate = useMutation({
    mutationFn: ({ id, newName }) => notificationsAPI.duplicateTemplate(id, newName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.templates.lists() })
      handleSuccess('Template duplicated')
    },
    onError: handleError,
  })

  return {
    // state
    error,
    successMessage,
    clearError: () => setError(null),
    clearSuccess: () => setSuccessMessage(null),

    // queries
    useGetNotifications,
    useGetNotification,
    useGetStats,
    useGetTemplates,
    useGetTemplate,
    useGetSMSLogs,
    useGetSMSLog,
    useGetSMSStats,

    // mutations
    createNotification: createNotification.mutateAsync,
    createNotificationLoading: createNotification.isLoading,

    sendNotification: sendNotification.mutateAsync,
    sendNotificationLoading: sendNotification.isLoading,

    markAsRead: markAsRead.mutateAsync,
    markAsReadLoading: markAsRead.isLoading,

    markAllAsRead: markAllAsRead.mutateAsync,
    markAllAsReadLoading: markAllAsRead.isLoading,

    deleteNotification: deleteNotification.mutateAsync,
    deleteNotificationLoading: deleteNotification.isLoading,

    bulkSend: bulkSend.mutateAsync,
    bulkSendLoading: bulkSend.isLoading,

    sendTestNotification: sendTestNotification.mutateAsync,
    sendTestNotificationLoading: sendTestNotification.isLoading,

    // templates
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    previewTemplate: previewTemplate.mutateAsync,
    duplicateTemplate: duplicateTemplate.mutateAsync,

    // API utils
    notificationsAPI,
  }
}

export default useNotifications