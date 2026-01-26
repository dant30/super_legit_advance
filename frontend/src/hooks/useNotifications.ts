// frontend/src/hooks/useNotifications.ts
// frontend/src/hooks/useNotifications.ts
import { useCallback } from 'react'
import axiosInstance from '@/lib/axios'
import { notificationsAPI } from '@/lib/api/notifications'

export const useNotifications = () => {
  const getNotifications = useCallback(async (params?: any) => {
    try {
      return await notificationsAPI.getNotifications(params)
    } catch (error) {
      throw error
    }
  }, [])

  const getStats = useCallback(async (params?: { days?: number }) => {
    try {
      return await notificationsAPI.getStats(params)
    } catch (error) {
      throw error
    }
  }, [])

  const createNotification = useCallback(async (data: any) => {
    try {
      return await notificationsAPI.createNotification(data)
    } catch (error) {
      throw error
    }
  }, [])

  const sendNotification = useCallback(async (id: number) => {
    try {
      return await notificationsAPI.sendNotification(id)
    } catch (error) {
      throw error
    }
  }, [])

  const sendBulkNotifications = useCallback(async (data: any) => {
    try {
      return await notificationsAPI.sendBulkNotifications(data)
    } catch (error) {
      throw error
    }
  }, [])

  const sendTestNotification = useCallback(async (data: any) => {
    try {
      return await notificationsAPI.sendTestNotification(data)
    } catch (error) {
      throw error
    }
  }, [])

  const getTemplates = useCallback(async (params?: any) => {
    try {
      return await notificationsAPI.getTemplates(params)
    } catch (error) {
      throw error
    }
  }, [])

  const getTemplate = useCallback(async (id: number) => {
    try {
      return await notificationsAPI.getTemplate(id)
    } catch (error) {
      throw error
    }
  }, [])

  const createTemplate = useCallback(async (data: any) => {
    try {
      return await notificationsAPI.createTemplate(data)
    } catch (error) {
      throw error
    }
  }, [])

  const updateTemplate = useCallback(async (id: number, data: any) => {
    try {
      return await notificationsAPI.updateTemplate(id, data)
    } catch (error) {
      throw error
    }
  }, [])

  const previewTemplate = useCallback(async (id: number, context: any) => {
    try {
      return await notificationsAPI.previewTemplate(id, context)
    } catch (error) {
      throw error
    }
  }, [])

  const getSMSLogs = useCallback(async (params?: any) => {
    try {
      return await notificationsAPI.getSMSLogs(params)
    } catch (error) {
      throw error
    }
  }, [])

  const getSMSStats = useCallback(async (params?: any) => {
    try {
      return await notificationsAPI.getSMSStats(params)
    } catch (error) {
      throw error
    }
  }, [])

  const markAsRead = useCallback(async (id: number) => {
    try {
      // Note: You need to add this endpoint to your Django API
      const response = await axiosInstance.patch(`/notifications/${id}/mark-read/`)
      return response.data
    } catch (error) {
      throw error
    }
  }, [])

  return {
    getNotifications,
    getStats,
    createNotification,
    sendNotification,
    sendBulkNotifications,
    sendTestNotification,
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    previewTemplate,
    getSMSLogs,
    getSMSStats,
    markAsRead,
  }
}