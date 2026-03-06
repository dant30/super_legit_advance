import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { notificationsAPI } from '@api/notifications'
import {
  setNotificationSmsLogs,
  setNotificationSmsStats,
  setNotificationStats,
  setNotificationSuccessMessage,
  setNotificationTemplates,
  setNotifications,
  setNotificationsError,
  setNotificationsLoading,
  setNotificationsState,
  setRecentNotifications,
  setSelectedNotification,
  setTotalNotifications,
  setUnreadCount,
} from '../store'

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
  },
}

export const useNotifications = () => {
  const qc = useQueryClient()
  const dispatch = useDispatch()
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleError = useCallback((err) => {
    const msg = err?.message || 'An unexpected error occurred'
    setError(msg)
    dispatch(setNotificationsError(msg))
    setTimeout(() => {
      setError(null)
      dispatch(setNotificationsError(null))
    }, 5000)
    throw err
  }, [dispatch])

  const handleSuccess = useCallback((msg) => {
    setSuccessMessage(msg)
    dispatch(setNotificationSuccessMessage(msg))
    setTimeout(() => {
      setSuccessMessage(null)
      dispatch(setNotificationSuccessMessage(null))
    }, 3000)
  }, [dispatch])

  const normalizeCollection = useCallback((payload) => {
    if (!payload) {
      return { items: [], count: 0, pagination: null }
    }

    if (Array.isArray(payload)) {
      return { items: payload, count: payload.length, pagination: null }
    }

    if (Array.isArray(payload.results)) {
      return {
        items: payload.results,
        count: Number(payload.count ?? payload.results.length ?? 0),
        pagination: payload.pagination || null,
      }
    }

    if (Array.isArray(payload.data)) {
      return {
        items: payload.data,
        count: Number(payload?.pagination?.total ?? payload.data.length ?? 0),
        pagination: payload.pagination || null,
      }
    }

    if (payload.data && Array.isArray(payload.data.results)) {
      return {
        items: payload.data.results,
        count: Number(payload.data.count ?? payload.data.results.length ?? 0),
        pagination: payload.data.pagination || null,
      }
    }

    return { items: [], count: 0, pagination: payload.pagination || null }
  }, [])

  const useGetNotifications = (filters = {}, options = {}) => {
    const { syncToStore = true, ...queryOptions } = options
    const query = useQuery({
      queryKey: notificationKeys.list(filters),
      queryFn: () => notificationsAPI.getNotifications(filters),
      keepPreviousData: true,
      onError: handleError,
      ...queryOptions,
    })

    useEffect(() => {
      if (!syncToStore) return
      dispatch(setNotificationsLoading(query.isLoading))
    }, [dispatch, query.isLoading, syncToStore])

    useEffect(() => {
      if (!syncToStore) return
      const data = query.data
      if (!data) return

      const { items: results, count } = normalizeCollection(data)
      const unread = results.filter((n) => ['SENT', 'DELIVERED'].includes(n.status)).length
      dispatch(setNotifications(results))
      dispatch(setTotalNotifications(count))
      dispatch(setUnreadCount(unread))
      dispatch(setRecentNotifications(results.slice(0, 5)))
      dispatch(setNotificationsError(null))
    }, [dispatch, normalizeCollection, query.data, syncToStore])

    return query
  }

  const useGetNotification = (id, options = {}) => {
    const query = useQuery({
      queryKey: notificationKeys.detail(id),
      queryFn: () => notificationsAPI.getNotification(id),
      enabled: !!id,
      onError: handleError,
      ...options,
    })

    useEffect(() => {
      dispatch(
        setNotificationsState({
          selectedNotificationLoading: query.isLoading,
        })
      )
    }, [dispatch, query.isLoading])

    useEffect(() => {
      if (query.data) {
        dispatch(setSelectedNotification(query.data))
      }
      if (query.error) {
        dispatch(
          setNotificationsState({
            selectedNotificationError:
              query.error?.response?.data?.detail || query.error?.message || 'Failed to fetch notification',
          })
        )
      } else if (query.data) {
        dispatch(
          setNotificationsState({
            selectedNotificationError: null,
          })
        )
      }
    }, [dispatch, query.data, query.error])

    return query
  }

  const useGetStats = (params = {}, options = {}) => {
    const query = useQuery({
      queryKey: notificationKeys.stats(params),
      queryFn: () => notificationsAPI.getStats(params),
      onError: handleError,
      ...options,
    })

    useEffect(() => {
      dispatch(
        setNotificationsState({
          statsLoading: query.isLoading,
        })
      )
    }, [dispatch, query.isLoading])

    useEffect(() => {
      if (query.data) {
        dispatch(setNotificationStats(query.data))
      }
      if (query.error) {
        dispatch(
          setNotificationsState({
            statsError: query.error?.response?.data?.detail || query.error?.message || 'Failed to fetch stats',
          })
        )
      } else if (query.data) {
        dispatch(
          setNotificationsState({
            statsError: null,
          })
        )
      }
    }, [dispatch, query.data, query.error])

    return query
  }

  const useGetTemplates = (filters = {}, options = {}) => {
    const query = useQuery({
      queryKey: notificationKeys.templates.list(filters),
      queryFn: () => notificationsAPI.getTemplates(filters),
      onError: handleError,
      ...options,
    })

    useEffect(() => {
      dispatch(
        setNotificationsState({
          templatesLoading: query.isLoading,
        })
      )
    }, [dispatch, query.isLoading])

    useEffect(() => {
      const data = query.data
      if (data) {
        dispatch(setNotificationTemplates(normalizeCollection(data).items))
      }
      if (query.error) {
        dispatch(
          setNotificationsState({
            templatesError:
              query.error?.response?.data?.detail || query.error?.message || 'Failed to fetch templates',
          })
        )
      } else if (data) {
        dispatch(
          setNotificationsState({
            templatesError: null,
          })
        )
      }
    }, [dispatch, normalizeCollection, query.data, query.error])

    return query
  }

  const useGetTemplate = (id, options = {}) =>
    useQuery({
      queryKey: notificationKeys.templates.detail(id),
      queryFn: () => notificationsAPI.getTemplate(id),
      enabled: !!id,
      onError: handleError,
      ...options,
    })

  const useGetSMSLogs = (filters = {}, options = {}) => {
    const query = useQuery({
      queryKey: notificationKeys.sms.list(filters),
      queryFn: () => notificationsAPI.getSMSLogs(filters),
      onError: handleError,
      ...options,
    })

    useEffect(() => {
      dispatch(
        setNotificationsState({
          smsLogsLoading: query.isLoading,
        })
      )
    }, [dispatch, query.isLoading])

    useEffect(() => {
      const data = query.data
      if (data) {
        dispatch(setNotificationSmsLogs(normalizeCollection(data).items))
      }
      if (query.error) {
        dispatch(
          setNotificationsState({
            smsLogsError:
              query.error?.response?.data?.detail || query.error?.message || 'Failed to fetch SMS logs',
          })
        )
      } else if (data) {
        dispatch(
          setNotificationsState({
            smsLogsError: null,
          })
        )
      }
    }, [dispatch, normalizeCollection, query.data, query.error])

    return query
  }

  const useGetSMSLog = (id, options = {}) =>
    useQuery({
      queryKey: notificationKeys.sms.detail(id),
      queryFn: () => notificationsAPI.getSMSLog(id),
      enabled: !!id,
      onError: handleError,
      ...options,
    })

  const useGetSMSStats = (params = {}, options = {}) => {
    const query = useQuery({
      queryKey: notificationKeys.sms.stats(params),
      queryFn: () => notificationsAPI.getSMSStats(params),
      onError: handleError,
      ...options,
    })

    useEffect(() => {
      dispatch(
        setNotificationsState({
          smsStatsLoading: query.isLoading,
        })
      )
    }, [dispatch, query.isLoading])

    useEffect(() => {
      if (query.data) {
        dispatch(setNotificationSmsStats(query.data))
      }
      if (query.error) {
        dispatch(
          setNotificationsState({
            smsStatsError:
              query.error?.response?.data?.detail || query.error?.message || 'Failed to fetch SMS stats',
          })
        )
      } else if (query.data) {
        dispatch(
          setNotificationsState({
            smsStatsError: null,
          })
        )
      }
    }, [dispatch, query.data, query.error])

    return query
  }

  const createNotification = useMutation({
    mutationFn: (data) => notificationsAPI.createNotification(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      qc.invalidateQueries({ queryKey: notificationKeys.stats() })
      handleSuccess('Notification created')
    },
    onError: handleError,
  })

  const sendNotification = useMutation({
    mutationFn: ({ id, payload }) => notificationsAPI.sendNotification(id, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: notificationKeys.detail(vars.id) })
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      qc.invalidateQueries({ queryKey: notificationKeys.stats() })
      handleSuccess('Notification sent')
    },
    onError: handleError,
  })

  const markAsRead = useMutation({
    mutationFn: (id) => notificationsAPI.markAsRead(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: notificationKeys.detail(id) })
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      qc.invalidateQueries({ queryKey: notificationKeys.stats() })
      handleSuccess('Marked as read')
    },
    onError: handleError,
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      qc.invalidateQueries({ queryKey: notificationKeys.stats() })
      handleSuccess('All marked as read')
    },
    onError: handleError,
  })

  const deleteNotification = useMutation({
    mutationFn: (id) => notificationsAPI.deleteNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      qc.invalidateQueries({ queryKey: notificationKeys.stats() })
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

  const createTemplate = useMutation({
    mutationFn: (data) => notificationsAPI.createTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.templates.list() })
      handleSuccess('Template created')
    },
    onError: handleError,
  })

  const updateTemplate = useMutation({
    mutationFn: ({ id, data }) => notificationsAPI.updateTemplate(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: notificationKeys.templates.detail(vars.id) })
      qc.invalidateQueries({ queryKey: notificationKeys.templates.list() })
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
      qc.invalidateQueries({ queryKey: notificationKeys.templates.list() })
      handleSuccess('Template duplicated')
    },
    onError: handleError,
  })

  return {
    error,
    successMessage,
    clearError: () => {
      setError(null)
      dispatch(setNotificationsError(null))
    },
    clearSuccess: () => {
      setSuccessMessage(null)
      dispatch(setNotificationSuccessMessage(null))
    },

    useGetNotifications,
    useGetNotification,
    useGetStats,
    useGetTemplates,
    useGetTemplate,
    useGetSMSLogs,
    useGetSMSLog,
    useGetSMSStats,

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

    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    previewTemplate: previewTemplate.mutateAsync,
    duplicateTemplate: duplicateTemplate.mutateAsync,

    notificationsAPI,
  }
}

export default useNotifications
