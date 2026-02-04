// frontend/src/contexts/ReportsContext.jsx

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { useToast } from './ToastContext'
import { reportsAPI } from '../api/reports'

// Initial state
const initialState = {
  reports: [],
  currentReport: null,
  reportHistory: [],
  schedules: [],
  loading: false,
  generating: false,
  exporting: false,
  error: null,
  success: null,
  filterParams: {},
  selectedFormat: 'pdf',
  generationProgress: 0
}

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_GENERATING: 'SET_GENERATING',
  SET_EXPORTING: 'SET_EXPORTING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  SET_REPORTS: 'SET_REPORTS',
  SET_CURRENT_REPORT: 'SET_CURRENT_REPORT',
  SET_REPORT_HISTORY: 'SET_REPORT_HISTORY',
  SET_SCHEDULES: 'SET_SCHEDULES',
  SET_FILTER_PARAMS: 'SET_FILTER_PARAMS',
  SET_FORMAT: 'SET_FORMAT',
  SET_GENERATION_PROGRESS: 'SET_GENERATION_PROGRESS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_SUCCESS: 'CLEAR_SUCCESS',
  CLEAR_CURRENT_REPORT: 'CLEAR_CURRENT_REPORT',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  RESET_PROGRESS: 'RESET_PROGRESS'
}

// Reducer function
const reportReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case ActionTypes.SET_GENERATING:
      return { ...state, generating: action.payload }
    
    case ActionTypes.SET_EXPORTING:
      return { ...state, exporting: action.payload }
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload }
    
    case ActionTypes.SET_SUCCESS:
      return { ...state, success: action.payload }
    
    case ActionTypes.SET_REPORTS:
      return { ...state, reports: action.payload }
    
    case ActionTypes.SET_CURRENT_REPORT:
      return { ...state, currentReport: action.payload }
    
    case ActionTypes.SET_REPORT_HISTORY:
      return { ...state, reportHistory: action.payload }
    
    case ActionTypes.SET_SCHEDULES:
      return { ...state, schedules: action.payload }
    
    case ActionTypes.SET_FILTER_PARAMS:
      return { 
        ...state, 
        filterParams: { ...state.filterParams, ...action.payload } 
      }
    
    case ActionTypes.SET_FORMAT:
      return { ...state, selectedFormat: action.payload }
    
    case ActionTypes.SET_GENERATION_PROGRESS:
      return { 
        ...state, 
        generationProgress: Math.min(action.payload, 100) 
      }
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null }
    
    case ActionTypes.CLEAR_SUCCESS:
      return { ...state, success: null }
    
    case ActionTypes.CLEAR_CURRENT_REPORT:
      return { ...state, currentReport: null }
    
    case ActionTypes.CLEAR_FILTERS:
      return { ...state, filterParams: {} }
    
    case ActionTypes.RESET_PROGRESS:
      return { ...state, generationProgress: 0 }
    
    default:
      return state
  }
}

// Create context
const ReportContext = createContext()

// Provider component
export const ReportProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reportReducer, initialState)
  const { addToast } = useToast()
  const downloadAbortRef = React.useRef(null)

  // ==================== DISPATCH HELPERS ====================

  const dispatchAction = useCallback((type, payload) => {
    dispatch({ type, payload })
  }, [])

  const setLoading = useCallback((loading) => {
    dispatchAction(ActionTypes.SET_LOADING, loading)
  }, [dispatchAction])

  const setGenerating = useCallback((generating) => {
    dispatchAction(ActionTypes.SET_GENERATING, generating)
  }, [dispatchAction])

  const setExporting = useCallback((exporting) => {
    dispatchAction(ActionTypes.SET_EXPORTING, exporting)
  }, [dispatchAction])

  const setError = useCallback((error) => {
    dispatchAction(ActionTypes.SET_ERROR, error)
  }, [dispatchAction])

  const setSuccess = useCallback((success) => {
    dispatchAction(ActionTypes.SET_SUCCESS, success)
  }, [dispatchAction])

  const setReports = useCallback((reports) => {
    dispatchAction(ActionTypes.SET_REPORTS, reports)
  }, [dispatchAction])

  const setCurrentReport = useCallback((report) => {
    dispatchAction(ActionTypes.SET_CURRENT_REPORT, report)
  }, [dispatchAction])

  const setReportHistory = useCallback((history) => {
    dispatchAction(ActionTypes.SET_REPORT_HISTORY, history)
  }, [dispatchAction])

  const setSchedules = useCallback((schedules) => {
    dispatchAction(ActionTypes.SET_SCHEDULES, schedules)
  }, [dispatchAction])

  const setFilterParams = useCallback((params) => {
    dispatchAction(ActionTypes.SET_FILTER_PARAMS, params)
  }, [dispatchAction])

  const setFormat = useCallback((format) => {
    dispatchAction(ActionTypes.SET_FORMAT, format)
  }, [dispatchAction])

  const setGenerationProgress = useCallback((progress) => {
    dispatchAction(ActionTypes.SET_GENERATION_PROGRESS, progress)
  }, [dispatchAction])

  const clearError = useCallback(() => {
    dispatchAction(ActionTypes.CLEAR_ERROR)
  }, [dispatchAction])

  const clearSuccess = useCallback(() => {
    dispatchAction(ActionTypes.CLEAR_SUCCESS)
  }, [dispatchAction])

  const clearCurrentReport = useCallback(() => {
    dispatchAction(ActionTypes.CLEAR_CURRENT_REPORT)
  }, [dispatchAction])

  const clearFilters = useCallback(() => {
    dispatchAction(ActionTypes.CLEAR_FILTERS)
  }, [dispatchAction])

  const resetProgress = useCallback(() => {
    dispatchAction(ActionTypes.RESET_PROGRESS)
  }, [dispatchAction])

  // ==================== API METHODS ====================

  const getAvailableReports = useCallback(async () => {
    try {
      setLoading(true)
      clearError()
      const reports = await reportsAPI.getReportTypes()
      setReports(reports)
      addToast('Reports loaded successfully', 'success')
      return reports
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch reports'
      setError(message)
      addToast(message, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setReports, setError, addToast])

  const generateReportByType = useCallback(async (reportType, format = 'json', parameters = {}) => {
    try {
      setGenerating(true)
      clearError()
      setGenerationProgress(10)

      const payload = {
        report_type: reportType,
        format,
        parameters: reportsAPI.buildParams(parameters)
      }

      const response = await reportsAPI.generateReport(payload)
      
      setGenerationProgress(100)
      setCurrentReport(response.report || response)
      setSuccess('Report generated successfully')
      addToast('Report generated successfully', 'success')

      setTimeout(() => {
        resetProgress()
      }, 2000)

      return response
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to generate report'
      setError(message)
      resetProgress()
      addToast(message, 'error')
      throw error
    } finally {
      setGenerating(false)
    }
  }, [setGenerating, clearError, setGenerationProgress, setCurrentReport, setSuccess, resetProgress, setError, addToast])

  const fetchReport = useCallback(async (reportType, params = {}) => {
    try {
      setLoading(true)
      clearError()

      const apiMethod = reportsAPI[`get${reportType.charAt(0).toUpperCase() + reportType.slice(1)}Report`]
      if (!apiMethod) {
        throw new Error(`Report type ${reportType} not supported`)
      }

      const response = await apiMethod.call(reportsAPI, reportsAPI.buildParams(params))
      setCurrentReport(response)
      return response
    } catch (error) {
      const message = error.response?.data?.error || `Failed to fetch ${reportType} report`
      setError(message)
      addToast(message, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setCurrentReport, setError, addToast])

  const exportData = useCallback(async (dataType, format, filters = {}) => {
    try {
      setExporting(true)
      clearError()
      setGenerationProgress(20)

      const payload = {
        data_type: dataType,
        filters: reportsAPI.buildParams(filters)
      }

      const apiMethod = format === 'pdf' ? 'exportToPDF' : 'exportToExcel'
      const blob = await reportsAPI[apiMethod](payload)

      setGenerationProgress(100)
      
      const filename = reportsAPI.generateFilename(`${dataType}_export`, format)
      reportsAPI.downloadFile(blob, filename)

      setSuccess(`${format.toUpperCase()} exported successfully`)
      addToast(`${format.toUpperCase()} exported successfully`, 'success')

      setTimeout(() => {
        resetProgress()
      }, 2000)

      return { success: true, filename }
    } catch (error) {
      const message = error.response?.data?.error || `Failed to export ${format}`
      setError(message)
      resetProgress()
      addToast(message, 'error')
      throw error
    } finally {
      setExporting(false)
    }
  }, [setExporting, clearError, setGenerationProgress, setSuccess, resetProgress, setError, addToast])

  const fetchReportHistory = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      clearError()
      const history = await reportsAPI.getReportHistory(params)
      setReportHistory(history)
      return history
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch report history'
      setError(message)
      addToast(message, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setReportHistory, setError, addToast])

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true)
      clearError()
      const schedules = await reportsAPI.getSchedules()
      setSchedules(schedules)
      return schedules
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch schedules'
      setError(message)
      addToast(message, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setSchedules, setError, addToast])

  const createSchedule = useCallback(async (data) => {
    try {
      setLoading(true)
      clearError()
      const schedule = await reportsAPI.scheduleReport(data)
      setSchedules(prev => [...prev, schedule])
      addToast('Schedule created successfully', 'success')
      return schedule
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create schedule'
      setError(message)
      addToast(message, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setSchedules, setError, addToast])

  const cancelExport = useCallback(() => {
    if (downloadAbortRef.current) {
      downloadAbortRef.current.abort()
      downloadAbortRef.current = null
    }
    setExporting(false)
    resetProgress()
    addToast('Export cancelled', 'warning')
  }, [setExporting, resetProgress, addToast])

  // ==================== CONVENIENCE METHODS ====================

  const updateFilters = useCallback((newFilters) => {
    setFilterParams(newFilters)
  }, [setFilterParams])

  const selectReport = useCallback((report) => {
    setCurrentReport(report)
  }, [setCurrentReport])

  const exportPDF = useCallback((dataType, filters = {}) => {
    return exportData(dataType, 'pdf', filters)
  }, [exportData])

  const exportExcel = useCallback((dataType, filters = {}) => {
    return exportData(dataType, 'excel', filters)
  }, [exportData])

  const quickExport = useCallback((dataType, format = 'pdf', filters = {}) => {
    return exportData(dataType, format, filters)
  }, [exportData])

  // Report-specific methods
  const fetchLoansReport = useCallback((params = {}) => {
    return fetchReport('loans', params)
  }, [fetchReport])

  const fetchPaymentsReport = useCallback((params = {}) => {
    return fetchReport('payments', params)
  }, [fetchReport])

  const fetchCustomersReport = useCallback((params = {}) => {
    return fetchReport('customers', params)
  }, [fetchReport])

  const fetchPerformanceReport = useCallback((params = {}) => {
    return fetchReport('performance', params)
  }, [fetchReport])

  const fetchDailySummary = useCallback((params = {}) => {
    return fetchReport('dailySummary', params)
  }, [fetchReport])

  const fetchMonthlySummary = useCallback((params = {}) => {
    return fetchReport('monthlySummary', params)
  }, [fetchReport])

  const fetchAuditReport = useCallback((params = {}) => {
    return fetchReport('audit', params)
  }, [fetchReport])

  const fetchCollectionReport = useCallback((params = {}) => {
    return fetchReport('collection', params)
  }, [fetchReport])

  const fetchRiskAssessment = useCallback((params = {}) => {
    return fetchReport('riskAssessment', params)
  }, [fetchReport])

  // Context value
  const value = useMemo(() => ({
    // State
    ...state,

    // Dispatch helpers
    setFilterParams,
    setCurrentReport,
    setFormat,
    setGenerationProgress,

    // Actions
    getAvailableReports,
    generateReportByType,
    
    // Specialized reports
    fetchLoansReport,
    fetchPaymentsReport,
    fetchCustomersReport,
    fetchPerformanceReport,
    fetchDailySummary,
    fetchMonthlySummary,
    fetchAuditReport,
    fetchCollectionReport,
    fetchRiskAssessment,

    // Exports
    exportPDF,
    exportExcel,
    quickExport,

    // Filters & State
    updateFilters,
    clearFilters,
    selectReport,
    clearCurrentReport,
    clearError,
    clearSuccess,
    resetProgress,

    // History & Schedules
    fetchReportHistory,
    fetchSchedules,
    createSchedule,

    // Cancellation
    cancelExport
  }), [
    state,
    setFilterParams,
    setCurrentReport,
    setFormat,
    setGenerationProgress,
    getAvailableReports,
    generateReportByType,
    fetchLoansReport,
    fetchPaymentsReport,
    fetchCustomersReport,
    fetchPerformanceReport,
    fetchDailySummary,
    fetchMonthlySummary,
    fetchAuditReport,
    fetchCollectionReport,
    fetchRiskAssessment,
    exportPDF,
    exportExcel,
    quickExport,
    updateFilters,
    clearFilters,
    selectReport,
    clearCurrentReport,
    clearError,
    clearSuccess,
    resetProgress,
    fetchReportHistory,
    fetchSchedules,
    createSchedule,
    cancelExport
  ])

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  )
}

// Custom hook to use the report context
export const useReport = () => {
  const context = useContext(ReportContext)
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider')
  }
  return context
}

export default ReportContext