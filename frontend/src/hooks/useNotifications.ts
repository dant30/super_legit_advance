// frontend/src/hooks/useNotifications.ts
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import {
  fetchNotifications,
  fetchStats,
  fetchTemplates,
  fetchSMSLogs,
  fetchSMSStats,
  clearError,
  setCurrentPage,
  addNotification,
  updateNotification,
  markAsRead,
} from '@/store/slices/notificationSlice'
import { notificationsAPI } from '@/lib/api/notifications'
import type {
  Notification,
  Template,
  SMSLog,
  NotificationStats,
  SMSStats,
  NotificationListResponse,
  TemplateListResponse,
  SMSLogListResponse,
  CreateNotificationPayload,
  UpdateTemplatePayload,
  CreateTemplatePayload,
  BulkNotificationPayload,
  TestNotificationPayload,
  TemplatePreviewPayload,
  NotificationFilters,
  TemplateFilters,
  SMSLogFilters,
} from '@/lib/api/notifications'

interface UseNotificationsReturn {
  // State
  notifications: Notification[]
  templates: Template[]
  smsLogs: SMSLog[]
  stats: NotificationStats | null
  smsStats: SMSStats | null
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number

  // Redux actions
  getNotifications: (params?: NotificationFilters) => void
  getStats: (days?: number) => void
  getTemplates: (params?: TemplateFilters) => void
  getSMSLogs: (params?: SMSLogFilters) => void
  getSMSStats: (days?: number) => void

  // Direct API - Notifications
  createNotification: (data: CreateNotificationPayload) => Promise<Notification>
  sendNotification: (id: number) => Promise<any>
  markNotificationAsRead: (id: number) => Promise<any>
  markAllNotificationsAsRead: () => Promise<any>
  getNotificationDetail: (id: number) => Promise<Notification>

  // Direct API - Templates
  createTemplate: (data: CreateTemplatePayload) => Promise<Template>
  updateTemplate: (id: number, data: UpdateTemplatePayload) => Promise<Template>
  getTemplateDetail: (id: number) => Promise<Template>
  previewTemplate: (id: number, context: Record<string, any>) => Promise<any>
  duplicateTemplate: (id: number, newName: string) => Promise<Template>

  // Direct API - SMS Logs
  getSMSLogDetail: (id: number) => Promise<SMSLog>

  // Bulk operations
  sendBulkNotifications: (data: BulkNotificationPayload) => Promise<any>
  sendTestNotification: (data: TestNotificationPayload) => Promise<any>

  // Utilities
  clearNotificationError: () => void
  setNotificationPage: (page: number) => void
}

export const useNotifications = (): UseNotificationsReturn => {
  const dispatch = useDispatch<AppDispatch>()
  const notificationState = useSelector((state: RootState) => state.notifications)

  /* ===== REDUX ACTIONS ===== */

  const getNotifications = useCallback(
    (params?: NotificationFilters) => {
      dispatch(fetchNotifications(params))
    },
    [dispatch]
  )

  const getStats = useCallback(
    (days: number = 30) => {
      dispatch(fetchStats({ days }))
    },
    [dispatch]
  )

  const getTemplates = useCallback(
    (params?: TemplateFilters) => {
      dispatch(fetchTemplates(params))
    },
    [dispatch]
  )

  const getSMSLogs = useCallback(
    (params?: SMSLogFilters) => {
      dispatch(fetchSMSLogs(params))
    },
    [dispatch]
  )

  const getSMSStats = useCallback(
    (days: number = 30) => {
      dispatch(fetchSMSStats({ days }))
    },
    [dispatch]
  )

  /* ===== DIRECT API - NOTIFICATIONS ===== */

  const createNotification = useCallback(
    async (data: CreateNotificationPayload) => {
      try {
        const notification = await notificationsAPI.createNotification(data)
        dispatch(addNotification(notification))
        return notification
      } catch (error) {
        throw error
      }
    },
    [dispatch]
  )

  const sendNotification = useCallback(async (id: number) => {
    try {
      return await notificationsAPI.sendNotification(id)
    } catch (error) {
      throw error
    }
  }, [])

  const markNotificationAsRead = useCallback(async (id: number) => {
    try {
      const result = await notificationsAPI.markAsRead(id)
      dispatch(markAsRead(id))
      return result
    } catch (error) {
      throw error
    }
  }, [dispatch])

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      return await notificationsAPI.markAllAsRead()
    } catch (error) {
      throw error
    }
  }, [])

  const getNotificationDetail = useCallback(async (id: number) => {
    try {
      return await notificationsAPI.getNotification(id)
    } catch (error) {
      throw error
    }
  }, [])

  /* ===== DIRECT API - TEMPLATES ===== */

  const createTemplate = useCallback(async (data: CreateTemplatePayload) => {
    try {
      return await notificationsAPI.createTemplate(data)
    } catch (error) {
      throw error
    }
  }, [])

  const updateTemplate = useCallback(
    async (id: number, data: UpdateTemplatePayload) => {
      try {
        return await notificationsAPI.updateTemplate(id, data)
      } catch (error) {
        throw error
      }
    },
    []
  )

  const getTemplateDetail = useCallback(async (id: number) => {
    try {
      return await notificationsAPI.getTemplate(id)
    } catch (error) {
      throw error
    }
  }, [])

  const previewTemplate = useCallback(
    async (id: number, context: Record<string, any>) => {
      try {
        return await notificationsAPI.previewTemplate(id, { context })
      } catch (error) {
        throw error
      }
    },
    []
  )

  const duplicateTemplate = useCallback(
    async (id: number, newName: string) => {
      try {
        return await notificationsAPI.duplicateTemplate(id, newName)
      } catch (error) {
        throw error
      }
    },
    []
  )

  /* ===== DIRECT API - SMS LOGS ===== */

  const getSMSLogDetail = useCallback(async (id: number) => {
    try {
      return await notificationsAPI.getSMSLog(id)
    } catch (error) {
      throw error
    }
  }, [])

  /* ===== BULK OPERATIONS ===== */

  const sendBulkNotifications = useCallback(
    async (data: BulkNotificationPayload) => {
      try {
        return await notificationsAPI.sendBulkNotifications(data)
      } catch (error) {
        throw error
      }
    },
    []
  )

  const sendTestNotification = useCallback(
    async (data: TestNotificationPayload) => {
      try {
        return await notificationsAPI.sendTestNotification(data)
      } catch (error) {
        throw error
      }
    },
    []
  )

  /* ===== UTILITIES ===== */

  const clearNotificationError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const setNotificationPage = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page))
    },
    [dispatch]
  )

  return {
    // State
    notifications: notificationState.notifications,
    templates: notificationState.templates,
    smsLogs: notificationState.smsLogs,
    stats: notificationState.stats,
    smsStats: notificationState.smsStats,
    loading: notificationState.loading,
    error: notificationState.error,
    totalCount: notificationState.totalCount,
    currentPage: notificationState.currentPage,

    // Redux actions
    getNotifications,
    getStats,
    getTemplates,
    getSMSLogs,
    getSMSStats,

    // Direct API - Notifications
    createNotification,
    sendNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getNotificationDetail,

    // Direct API - Templates
    createTemplate,
    updateTemplate,
    getTemplateDetail,
    previewTemplate,
    duplicateTemplate,

    // Direct API - SMS Logs
    getSMSLogDetail,

    // Bulk operations
    sendBulkNotifications,
    sendTestNotification,

    // Utilities
    clearNotificationError,
    setNotificationPage,
  }
}

export default useNotifications