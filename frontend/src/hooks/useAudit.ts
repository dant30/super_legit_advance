// frontend/src/hooks/useAudit.ts
import { useState, useCallback } from 'react'
import { auditAPI } from '@/lib/api/audit'
import type { 
  AuditLog, 
  AuditLogListResponse, 
  AuditStats, 
  UserActivity,
  SecurityEvent 
} from '@/types/audit'

export const useAudit = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAuditLogs = useCallback(async (params?: any): Promise<AuditLogListResponse> => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditAPI.getAuditLogs(params)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch audit logs'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAuditLog = useCallback(async (id: string): Promise<AuditLog> => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditAPI.getAuditLog(id)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch audit log'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const searchLogs = useCallback(async (query: string, searchType: string = 'all', params?: any): Promise<AuditLogListResponse> => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditAPI.searchLogs(query, searchType, params)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search audit logs'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAuditStats = useCallback(async (days: number = 30): Promise<AuditStats> => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditAPI.getAuditStats(days)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch audit statistics'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const exportAuditLogs = useCallback(async (format: 'excel' | 'csv' | 'json' = 'excel', params?: any): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const blob = await auditAPI.exportAuditLogs(format, params)
      const filename = auditAPI.generateExportFilename(format)
      auditAPI.downloadExportFile(blob, filename)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export audit logs'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getUserActivity = useCallback(async (userId: number, days: number = 30): Promise<UserActivity> => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditAPI.getUserActivity(userId, days)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user activity'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getSecurityEvents = useCallback(async (days: number = 30, params?: any): Promise<AuditLogListResponse> => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditAPI.getSecurityEvents(days, params)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch security events'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getComplianceEvents = useCallback(async (days: number = 90, params?: any): Promise<AuditLogListResponse> => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditAPI.getComplianceEvents(days, params)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch compliance events'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    loading,
    error,
    
    // Methods
    getAuditLogs,
    getAuditLog,
    searchLogs,
    getAuditStats,
    exportAuditLogs,
    getUserActivity,
    getSecurityEvents,
    getComplianceEvents,
    
    // Utilities
    clearError,
  }
}