// frontend/src/hooks/useAudit.ts
import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { auditAPI } from '@/lib/api/audit'
import { RootState, AppDispatch } from '@/store/store'
import {
  fetchAuditLogs,
  fetchAuditLog,
  fetchAuditStats,
  fetchUserActivity,
  fetchSecurityEvents,
  fetchComplianceEvents,
  searchAuditLogs,
  setFilters,
  clearFilters,
  clearError,
} from '@/store/slices/auditSlice'
import type {
  AuditLog,
  AuditLogListResponse,
  AuditStats,
  UserActivity,
} from '@/types/audit'

export const useAudit = () => {
  const dispatch = useDispatch<AppDispatch>()
  const auditState = useSelector((state: RootState) => state.audit)
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  /**
   * Fetch audit logs with Redux
   */
  const getAuditLogs = useCallback(
    async (params?: any): Promise<AuditLogListResponse> => {
      try {
        return await dispatch(fetchAuditLogs(params)).unwrap()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch audit logs'
        setLocalError(message)
        throw err
      }
    },
    [dispatch]
  )

  /**
   * Fetch single audit log
   */
  const getAuditLog = useCallback(
    async (id: string): Promise<AuditLog> => {
      try {
        return await dispatch(fetchAuditLog(id)).unwrap()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch audit log'
        setLocalError(message)
        throw err
      }
    },
    [dispatch]
  )

  /**
   * Search audit logs
   */
  const searchLogs = useCallback(
    async (
      query: string,
      searchType: 'user' | 'object' | 'ip' | 'changes' | 'all' = 'all',
      params?: any
    ): Promise<AuditLogListResponse> => {
      try {
        return await dispatch(
          searchAuditLogs({ query, searchType, params })
        ).unwrap()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to search audit logs'
        setLocalError(message)
        throw err
      }
    },
    [dispatch]
  )

  /**
   * Get audit statistics
   */
  const getAuditStats = useCallback(
    async (days: number = 30): Promise<AuditStats> => {
      try {
        return await dispatch(fetchAuditStats(days)).unwrap()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch audit statistics'
        setLocalError(message)
        throw err
      }
    },
    [dispatch]
  )

  /**
   * Export audit logs to file
   */
  const exportAuditLogs = useCallback(
    async (format: 'excel' | 'csv' | 'json' = 'excel', params?: any): Promise<void> => {
      setLocalLoading(true)
      setLocalError(null)
      try {
        const blob = await auditAPI.exportAuditLogs(format, params)
        const filename = auditAPI.generateExportFilename(format)
        auditAPI.downloadExportFile(blob, filename)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to export audit logs'
        setLocalError(message)
        throw err
      } finally {
        setLocalLoading(false)
      }
    },
    []
  )

  /**
   * Get user activity
   */
  const getUserActivity = useCallback(
    async (userId: number, days: number = 30): Promise<UserActivity> => {
      try {
        return await dispatch(
          fetchUserActivity({ userId, days })
        ).unwrap()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch user activity'
        setLocalError(message)
        throw err
      }
    },
    [dispatch]
  )

  /**
   * Get security events
   */
  const getSecurityEvents = useCallback(
    async (days: number = 30, params?: any): Promise<AuditLogListResponse> => {
      try {
        return await dispatch(fetchSecurityEvents({ days, params })).unwrap()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch security events'
        setLocalError(message)
        throw err
      }
    },
    [dispatch]
  )

  /**
   * Get compliance events
   */
  const getComplianceEvents = useCallback(
    async (days: number = 90, params?: any): Promise<AuditLogListResponse> => {
      try {
        return await dispatch(fetchComplianceEvents({ days, params })).unwrap()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch compliance events'
        setLocalError(message)
        throw err
      }
    },
    [dispatch]
  )

  /**
   * Get audit logs by date range
   */
  const getAuditLogsByDateRange = useCallback(
    async (startDate: string, endDate: string, params?: any) => {
      return getAuditLogs({
        start_date: startDate,
        end_date: endDate,
        ...params,
      })
    },
    [getAuditLogs]
  )

  /**
   * Get audit logs by model
   */
  const getAuditLogsByModel = useCallback(
    async (modelName: string, params?: any) => {
      return getAuditLogs({
        model_name: modelName,
        ...params,
      })
    },
    [getAuditLogs]
  )

  /**
   * Get failed actions
   */
  const getFailedActions = useCallback(
    async (params?: any) => {
      return getAuditLogs({
        status: 'FAILURE',
        ...params,
      })
    },
    [getAuditLogs]
  )

  /**
   * Get high severity events
   */
  const getHighSeverityEvents = useCallback(
    async (params?: any) => {
      return getAuditLogs({
        high_severity: true,
        ...params,
      })
    },
    [getAuditLogs]
  )

  /**
   * Update audit filters
   */
  const updateFilters = useCallback(
    (filters: Record<string, any>) => {
      dispatch(setFilters(filters))
    },
    [dispatch]
  )

  /**
   * Clear all audit filters
   */
  const resetFilters = useCallback(() => {
    dispatch(clearFilters())
  }, [dispatch])

  /**
   * Clear error state
   */
  const handleClearError = useCallback(() => {
    setLocalError(null)
    dispatch(clearError())
  }, [dispatch])

  return {
    // State from Redux
    logs: auditState.logs,
    currentLog: auditState.currentLog,
    stats: auditState.stats,
    userActivity: auditState.userActivity,
    securityEvents: auditState.securityEvents,
    complianceEvents: auditState.complianceEvents,
    loading: auditState.loading || localLoading,
    error: localError || auditState.error,
    filters: auditState.filters,
    pagination: auditState.pagination,

    // Redux actions
    updateFilters,
    resetFilters,

    // API methods
    getAuditLogs,
    getAuditLog,
    searchLogs,
    getAuditStats,
    exportAuditLogs,
    getUserActivity,
    getSecurityEvents,
    getComplianceEvents,
    getAuditLogsByDateRange,
    getAuditLogsByModel,
    getFailedActions,
    getHighSeverityEvents,

    // Utilities
    clearError: handleClearError,
  }
}

export default useAudit