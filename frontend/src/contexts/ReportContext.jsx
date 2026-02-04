// frontend/src/contexts/ReportsContext.jsx

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { useToast } from './ToastContext'
import { reportsAPI } from '@api/reports'

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
        generationProgress: Math.min(100, action.payload) 
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

  const dispatchAction = useCallback((type, payload) => dispatch({ type, payload }), [])

  // ==================== DISPATCH HELPERS ====================

  const setLoading = useCallback((v) => dispatchAction(ActionTypes.SET_LOADING, v), [dispatchAction])
  const setGenerating = useCallback((v) => dispatchAction(ActionTypes.SET_GENERATING, v), [dispatchAction])
  const setExporting = useCallback((v) => dispatchAction(ActionTypes.SET_EXPORTING, v), [dispatchAction])
  const setError = useCallback((v) => dispatchAction(ActionTypes.SET_ERROR, v), [dispatchAction])
  const setSuccess = useCallback((v) => dispatchAction(ActionTypes.SET_SUCCESS, v), [dispatchAction])
  const setReports = useCallback((v) => dispatchAction(ActionTypes.SET_REPORTS, v), [dispatchAction])
  const setCurrentReport = useCallback((v) => dispatchAction(ActionTypes.SET_CURRENT_REPORT, v), [dispatchAction])
  const setReportHistory = useCallback((v) => dispatchAction(ActionTypes.SET_REPORT_HISTORY, v), [dispatchAction])
  const setSchedules = useCallback((v) => dispatchAction(ActionTypes.SET_SCHEDULES, v), [dispatchAction])
  const setFilterParams = useCallback((v) => dispatchAction(ActionTypes.SET_FILTER_PARAMS, v), [dispatchAction])
  const setFormat = useCallback((v) => dispatchAction(ActionTypes.SET_FORMAT, v), [dispatchAction])
  const setGenerationProgress = useCallback((v) => dispatchAction(ActionTypes.SET_GENERATION_PROGRESS, v), [dispatchAction])
  const clearError = useCallback(() => dispatchAction(ActionTypes.CLEAR_ERROR), [dispatchAction])
  const clearSuccess = useCallback(() => dispatchAction(ActionTypes.CLEAR_SUCCESS), [dispatchAction])
  const clearCurrentReport = useCallback(() => dispatchAction(ActionTypes.CLEAR_CURRENT_REPORT), [dispatchAction])
  const clearFilters = useCallback(() => dispatchAction(ActionTypes.CLEAR_FILTERS), [dispatchAction])
  const resetProgress = useCallback(() => dispatchAction(ActionTypes.RESET_PROGRESS), [dispatchAction])

  // ==================== API METHODS ====================

  const getAvailableReports = useCallback(async () => {
    setLoading(true); clearError()
    try {
      const types = await reportsAPI.getReportTypes()
      setReports(types)
      addToast('Reports loaded', 'success')
      return types
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to fetch reports'
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setLoading(false) }
  }, [setLoading, clearError, setReports, setError, addToast])

  const generateReportByType = useCallback(async (reportType, format = 'json', parameters = {}) => {
    setGenerating(true); clearError(); setGenerationProgress(10)
    try {
      const payload = { report_type: reportType, format, parameters: reportsAPI.buildParams(parameters) }
      const resp = await reportsAPI.generateReport(payload)
      setGenerationProgress(100)
      if (format === 'json') {
        setCurrentReport(resp.report || resp)
        setSuccess('Report generated')
        addToast('Report generated', 'success')
        setTimeout(() => resetProgress(), 800)
        return resp
      } else {
        // blob download
        const filename = reportsAPI.generateFilename(reportType, format === 'excel' ? 'excel' : 'pdf')
        reportsAPI.downloadFile(resp, filename)
        setSuccess('Report downloaded')
        addToast('Report downloaded', 'success')
        return { filename }
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to generate report'
      setError(msg); setGenerationProgress(0); addToast(msg, 'error'); throw err
    } finally { setGenerating(false) }
  }, [setGenerating, clearError, setGenerationProgress, setCurrentReport, setSuccess, resetProgress, setError, addToast])

  const fetchReport = useCallback(async (reportType, params = {}) => {
    setLoading(true); clearError()
    try {
      const map = {
        loans: reportsAPI.getLoansReport.bind(reportsAPI),
        payments: reportsAPI.getPaymentsReport.bind(reportsAPI),
        customers: reportsAPI.getCustomersReport.bind(reportsAPI),
        performance: reportsAPI.getPerformanceReport.bind(reportsAPI),
        dailySummary: reportsAPI.getDailySummary.bind(reportsAPI),
        monthlySummary: reportsAPI.getMonthlySummary.bind(reportsAPI),
        audit: reportsAPI.getAuditReport.bind(reportsAPI),
        collection: reportsAPI.getCollectionReport.bind(reportsAPI),
        riskAssessment: reportsAPI.getRiskAssessment.bind(reportsAPI),
      }
      const fn = map[reportType]
      if (!fn) throw new Error('Unsupported report type')
      const res = await fn(reportsAPI.buildParams(params))
      setCurrentReport(res)
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || `Failed to fetch ${reportType}`
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setLoading(false) }
  }, [setLoading, clearError, setCurrentReport, setError, addToast])

  const exportData = useCallback(async (dataType, format = 'pdf', filters = {}) => {
    setExporting(true); clearError(); setGenerationProgress(15)
    try {
      const payload = { data_type: dataType, filters: reportsAPI.buildParams(filters) }
      const apiMethod = format === 'pdf' ? reportsAPI.exportToPDF.bind(reportsAPI) : reportsAPI.exportToExcel.bind(reportsAPI)
      const blob = await apiMethod(payload)
      const filename = reportsAPI.generateFilename(`${dataType}_export`, format === 'excel' ? 'excel' : 'pdf')
      reportsAPI.downloadFile(blob, filename)
      setGenerationProgress(100); setSuccess(`${format.toUpperCase()} exported`); addToast(`${format.toUpperCase()} exported`, 'success'); setTimeout(() => resetProgress(), 800)
      return { filename }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || `Failed to export ${format}`
      setError(msg); setGenerationProgress(0); addToast(msg, 'error'); throw err
    } finally { setExporting(false) }
  }, [setExporting, clearError, setGenerationProgress, setSuccess, resetProgress, setError, addToast])

  const fetchReportHistory = useCallback(async (params = {}) => {
    setLoading(true); clearError()
    try {
      const h = await reportsAPI.getReportHistory(reportsAPI.buildParams(params))
      setReportHistory(h)
      return h
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to fetch history'
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setLoading(false) }
  }, [setLoading, clearError, setReportHistory, setError, addToast])

  const fetchSchedules = useCallback(async () => {
    setLoading(true); clearError()
    try {
      const s = await reportsAPI.getSchedules()
      setSchedules(s)
      return s
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to fetch schedules'
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setLoading(false) }
  }, [setLoading, clearError, setSchedules, setError, addToast])

  const createSchedule = useCallback(async (data) => {
    setLoading(true); clearError()
    try {
      const res = await reportsAPI.scheduleReport(data)
      await fetchSchedules()
      addToast('Schedule created', 'success')
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to create schedule'
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setLoading(false) }
  }, [setLoading, clearError, setSchedules, setError, addToast, fetchSchedules])

  const cancelExport = useCallback(() => {
    // no-op for now; downloads handled by reportsAPI.downloadFile
    setExporting(false); resetProgress(); addToast('Export cancelled', 'warning')
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
    setFilterParams, setCurrentReport, setFormat, setGenerationProgress,

    // Actions
    getAvailableReports, generateReportByType, fetchReport,
    fetchLoansReport: (p) => fetchReport('loans', p),
    fetchPaymentsReport: (p) => fetchReport('payments', p),
    fetchCustomersReport: (p) => fetchReport('customers', p),
    fetchPerformanceReport: (p) => fetchReport('performance', p),
    fetchDailySummary: (p) => fetchReport('dailySummary', p),
    fetchMonthlySummary: (p) => fetchReport('monthlySummary', p),
    fetchAuditReport: (p) => fetchReport('audit', p),
    fetchCollectionReport: (p) => fetchReport('collection', p),
    fetchRiskAssessment: (p) => fetchReport('riskAssessment', p),
    exportPDF: (t, f) => exportData(t, 'pdf', f),
    exportExcel: (t, f) => exportData(t, 'excel', f),
    quickExport: (t, fmt, f) => exportData(t, fmt, f),
    updateFilters: (n) => setFilterParams(n),
    clearFilters, selectReport: setCurrentReport, clearCurrentReport,
    clearError, clearSuccess, resetProgress,
    fetchReportHistory, fetchSchedules, createSchedule, cancelExport
  }), [
    state, setFilterParams, setCurrentReport, setFormat, setGenerationProgress,
    getAvailableReports, generateReportByType, fetchReport, exportData,
    fetchReportHistory, fetchSchedules, createSchedule, cancelExport,
    clearFilters, clearError, clearSuccess, resetProgress
  ])

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  )
}

// Custom hook to use the report context
export const useReport = () => {
  const ctx = useContext(ReportContext)
  if (!ctx) throw new Error('useReport must be used within ReportProvider')
  return ctx
}

export default ReportContext