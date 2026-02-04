// frontend/src/contexts/AuditContext.jsx 
import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { auditAPI } from '../api/audit'

// Initial state
const initialState = {
  logs: [],
  currentLog: null,
  stats: null,
  summary: null,
  userActivity: null,
  securityEvents: [],
  complianceEvents: [],
  loading: false,
  error: null,
  filters: {},
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
  securityPagination: {
    count: 0,
    next: null,
    previous: null,
  },
  compliancePagination: {
    count: 0,
    next: null,
    previous: null,
  },
}

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_LOGS: 'SET_LOGS',
  SET_CURRENT_LOG: 'SET_CURRENT_LOG',
  SET_STATS: 'SET_STATS',
  SET_SUMMARY: 'SET_SUMMARY',
  SET_USER_ACTIVITY: 'SET_USER_ACTIVITY',
  SET_SECURITY_EVENTS: 'SET_SECURITY_EVENTS',
  SET_COMPLIANCE_EVENTS: 'SET_COMPLIANCE_EVENTS',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_CURRENT_LOG: 'CLEAR_CURRENT_LOG',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  RESET: 'RESET',
}

// Reducer function
function auditReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    
    case ACTIONS.SET_LOGS:
      return {
        ...state,
        logs: action.payload.logs,
        pagination: action.payload.pagination,
        summary: action.payload.summary || null,
        loading: false,
        error: null,
      }
    
    case ACTIONS.SET_CURRENT_LOG:
      return { ...state, currentLog: action.payload, loading: false, error: null }
    
    case ACTIONS.SET_STATS:
      return { ...state, stats: action.payload, loading: false, error: null }

    case ACTIONS.SET_SUMMARY:
      return { ...state, summary: action.payload, loading: false, error: null }
    
    case ACTIONS.SET_USER_ACTIVITY:
      return { ...state, userActivity: action.payload, loading: false, error: null }
    
    case ACTIONS.SET_SECURITY_EVENTS:
      return {
        ...state,
        securityEvents: action.payload.events,
        securityPagination: action.payload.pagination || initialState.securityPagination,
        loading: false,
        error: null,
      }
    
    case ACTIONS.SET_COMPLIANCE_EVENTS:
      return {
        ...state,
        complianceEvents: action.payload.events,
        compliancePagination: action.payload.pagination || initialState.compliancePagination,
        loading: false,
        error: null,
      }
    
    case ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: initialState.pagination,
      }
    
    case ACTIONS.SET_PAGINATION:
      return { ...state, pagination: action.payload }
    
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null }
    
    case ACTIONS.CLEAR_CURRENT_LOG:
      return { ...state, currentLog: null }
    
    case ACTIONS.CLEAR_FILTERS:
      return { ...state, filters: {}, pagination: initialState.pagination }
    
    case ACTIONS.RESET:
      return initialState
    
    default:
      return state
  }
}

// Create context
const AuditContext = createContext()

// Provider component
export function AuditProvider({ children }) {
  const [state, dispatch] = useReducer(auditReducer, initialState)

  // Action creators
  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading })
  }, [])

  const setError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR })
  }, [])

  const setFilters = useCallback((filters) => {
    dispatch({ type: ACTIONS.SET_FILTERS, payload: filters })
  }, [])

  const clearFilters = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_FILTERS })
  }, [])

  const clearCurrentLog = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_CURRENT_LOG })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: ACTIONS.RESET })
  }, [])

  // API methods
  const getAuditLogs = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const response = await auditAPI.getAuditLogs(params)
      dispatch({
        type: ACTIONS.SET_LOGS,
        payload: {
          logs: response.results || [],
          summary: response.summary || null,
          pagination: {
            count: response.count || 0,
            next: response.next,
            previous: response.previous,
          },
        },
      })
      return response
    } catch (error) {
      setError(error.message || 'Failed to fetch audit logs')
      throw error
    }
  }, [setLoading, setError])

  const getAuditLog = useCallback(async (id) => {
    setLoading(true)
    try {
      const log = await auditAPI.getAuditLog(id)
      dispatch({ type: ACTIONS.SET_CURRENT_LOG, payload: log })
      return log
    } catch (error) {
      setError(error.message || `Failed to fetch audit log ${id}`)
      throw error
    }
  }, [setLoading, setError])

  const searchLogs = useCallback(async (q, type = 'all', params = {}) => {
    setLoading(true)
    try {
      const response = await auditAPI.searchAuditLogs(q, type, params)
      dispatch({
        type: ACTIONS.SET_LOGS,
        payload: {
          logs: response.results || [],
          summary: response.summary || null,
          pagination: {
            count: response.count || 0,
            next: response.next,
            previous: response.previous,
          },
        },
      })
      return response
    } catch (error) {
      setError(error.message || 'Failed to search audit logs')
      throw error
    }
  }, [setLoading, setError])

  const getAuditStats = useCallback(async (days = 30) => {
    setLoading(true)
    try {
      const stats = await auditAPI.getAuditStats(days)
      dispatch({ type: ACTIONS.SET_STATS, payload: stats })
      return stats
    } catch (error) {
      setError(error.message || 'Failed to fetch audit statistics')
      throw error
    }
  }, [setLoading, setError])

  const exportAuditLogs = useCallback(async (format = 'excel', params = {}, options = {}) => {
    setLoading(true)
    try {
      const download = options.download !== false
      const data = await auditAPI.exportAuditLogs(format, params)
      const filename = auditAPI.generateExportFilename(format)

      if (download) {
        if (format === 'json') {
          const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
          })
          auditAPI.downloadExportFile(jsonBlob, filename)
        } else {
          auditAPI.downloadExportFile(data, filename)
        }
      }

      return { success: true, filename, data }
    } catch (error) {
      setError(error.message || 'Failed to export audit logs')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const getUserActivity = useCallback(async (userId, days = 30) => {
    setLoading(true)
    try {
      const activity = await auditAPI.getUserActivity(userId, days)
      dispatch({ type: ACTIONS.SET_USER_ACTIVITY, payload: activity })
      return activity
    } catch (error) {
      setError(error.message || `Failed to fetch user activity for user ${userId}`)
      throw error
    }
  }, [setLoading, setError])

  const getSecurityEvents = useCallback(async (days = 30, params = {}) => {
    setLoading(true)
    try {
      const response = await auditAPI.getSecurityEvents(days, params)
      dispatch({
        type: ACTIONS.SET_SECURITY_EVENTS,
        payload: {
          events: response.results || [],
          pagination: {
            count: response.count || 0,
            next: response.next,
            previous: response.previous,
          },
        },
      })
      return response
    } catch (error) {
      setError(error.message || 'Failed to fetch security events')
      throw error
    }
  }, [setLoading, setError])

  const getComplianceEvents = useCallback(async (days = 90, params = {}) => {
    setLoading(true)
    try {
      const response = await auditAPI.getComplianceEvents(days, params)
      dispatch({
        type: ACTIONS.SET_COMPLIANCE_EVENTS,
        payload: {
          events: response.results || [],
          pagination: {
            count: response.count || 0,
            next: response.next,
            previous: response.previous,
          },
        },
      })
      return response
    } catch (error) {
      setError(error.message || 'Failed to fetch compliance events')
      throw error
    }
  }, [setLoading, setError])

  const getAuditLogsByDateRange = useCallback(async (startDate, endDate, params = {}) => {
    return getAuditLogs({
      start_date: startDate,
      end_date: endDate,
      ...params,
    })
  }, [getAuditLogs])

  const getAuditLogsByModel = useCallback(async (modelName, params = {}) => {
    return getAuditLogs({
      model_name: modelName,
      ...params,
    })
  }, [getAuditLogs])

  const getAuditLogsByUser = useCallback(async (userId, params = {}) => {
    return getAuditLogs({
      user_id: userId,
      ...params,
    })
  }, [getAuditLogs])

  const getAuditLogsByObject = useCallback(async (objectId, params = {}) => {
    return getAuditLogs({
      object_id: objectId,
      ...params,
    })
  }, [getAuditLogs])

  const getAuditLogsByIp = useCallback(async (ipAddress, params = {}) => {
    return getAuditLogs({
      ip_address: ipAddress,
      ...params,
    })
  }, [getAuditLogs])

  const getAuditLogsByAction = useCallback(async (action, params = {}) => {
    return getAuditLogs({
      action,
      ...params,
    })
  }, [getAuditLogs])

  const getAuditLogsBySeverity = useCallback(async (severity, params = {}) => {
    return getAuditLogs({
      severity,
      ...params,
    })
  }, [getAuditLogs])

  const getAuditLogsByStatus = useCallback(async (status, params = {}) => {
    return getAuditLogs({
      status,
      ...params,
    })
  }, [getAuditLogs])

  const getAuditLogsByModule = useCallback(async (module, params = {}) => {
    return getAuditLogs({
      module,
      ...params,
    })
  }, [getAuditLogs])

  const getComplianceFlaggedLogs = useCallback(async (isComplianceEvent = true, params = {}) => {
    return getAuditLogs({
      is_compliance_event: isComplianceEvent,
      ...params,
    })
  }, [getAuditLogs])

  const getAuditLogsByTags = useCallback(async (tags = [], params = {}) => {
    return getAuditLogs({
      tags,
      ...params,
    })
  }, [getAuditLogs])

  const getFailedActions = useCallback(async (params = {}) => {
    return getAuditLogs({
      status: 'FAILURE',
      ...params,
    })
  }, [getAuditLogs])

  const getHighSeverityEvents = useCallback(async (params = {}) => {
    return getAuditLogs({
      high_severity: true,
      ...params,
    })
  }, [getAuditLogs])

  // Context value
  const value = useMemo(() => ({
    // State
    ...state,
    
    // Actions
    setFilters,
    clearFilters,
    clearCurrentLog,
    clearError,
    reset,
    
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
    getAuditLogsByUser,
    getAuditLogsByObject,
    getAuditLogsByIp,
    getAuditLogsByAction,
    getAuditLogsBySeverity,
    getAuditLogsByStatus,
    getAuditLogsByModule,
    getComplianceFlaggedLogs,
    getAuditLogsByTags,
    getFailedActions,
    getHighSeverityEvents,
  }), [
    state,
    setFilters,
    clearFilters,
    clearCurrentLog,
    clearError,
    reset,
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
    getAuditLogsByUser,
    getAuditLogsByObject,
    getAuditLogsByIp,
    getAuditLogsByAction,
    getAuditLogsBySeverity,
    getAuditLogsByStatus,
    getAuditLogsByModule,
    getComplianceFlaggedLogs,
    getAuditLogsByTags,
    getFailedActions,
    getHighSeverityEvents,
  ])

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
}

// Custom hook for using audit context
export function useAudit() {
  const context = useContext(AuditContext)
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider')
  }
  return context
}
