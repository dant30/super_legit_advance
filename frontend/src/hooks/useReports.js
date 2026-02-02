// frontend/src/hooks/useReports.js

import { useState, useCallback, useRef } from 'react'
import { useToast } from '../contexts/ToastContext'
import { reportsAPI } from '../api/reports'

export const useReports = () => {
  const [state, setState] = useState({
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
  })

  const { addToast } = useToast()
  const downloadAbortRef = useRef(null)

  // ==================== STATE MANAGEMENT ====================

  const setLoading = useCallback((loading) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setGenerating = useCallback((generating) => {
    setState(prev => ({ ...prev, generating }))
  }, [])

  const setExporting = useCallback((exporting) => {
    setState(prev => ({ ...prev, exporting }))
  }, [])

  const setError = useCallback((error) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const setSuccess = useCallback((success) => {
    setState(prev => ({ ...prev, success }))
  }, [])

  const setCurrentReport = useCallback((report) => {
    setState(prev => ({ ...prev, currentReport: report }))
  }, [])

  const setFilterParams = useCallback((params) => {
    setState(prev => ({ 
      ...prev, 
      filterParams: { ...prev.filterParams, ...params } 
    }))
  }, [])

  const setGenerationProgress = useCallback((progress) => {
    setState(prev => ({ 
      ...prev, 
      generationProgress: Math.min(progress, 100) 
    }))
  }, [])

  // ==================== REPORT LISTING ====================

  const getAvailableReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const reports = await reportsAPI.getReportTypes()
      setState(prev => ({ ...prev, reports }))
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
  }, [setLoading, setError, addToast])

  const listReports = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await reportsAPI.getReports(params)
      setState(prev => ({ ...prev, reports: response.results || response }))
      return response
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to list reports'
      setError(message)
      addToast(message, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, addToast])

  // ==================== REPORT GENERATION ====================

  const generateReportByType = useCallback(async (reportType, format = 'json', parameters = {}) => {
    try {
      setGenerating(true)
      setError(null)
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

      // Reset progress after delay
      setTimeout(() => {
        setGenerationProgress(0)
      }, 2000)

      return response
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to generate report'
      setError(message)
      setGenerationProgress(0)
      addToast(message, 'error')
      throw error
    } finally {
      setGenerating(false)
    }
  }, [setGenerating, setError, setSuccess, setCurrentReport, setGenerationProgress, addToast])

  // ==================== SPECIALIZED REPORTS ====================

  const fetchReport = useCallback(async (reportType, params = {}) => {
    try {
      setLoading(true)
      setError(null)

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
  }, [setLoading, setError, setCurrentReport, addToast])

  const fetchLoansReport = useCallback(async (params = {}) => {
    return fetchReport('loans', params)
  }, [fetchReport])

  const fetchPaymentsReport = useCallback(async (params = {}) => {
    return fetchReport('payments', params)
  }, [fetchReport])

  const fetchCustomersReport = useCallback(async (params = {}) => {
    return fetchReport('customers', params)
  }, [fetchReport])

  const fetchPerformanceReport = useCallback(async (params = {}) => {
    return fetchReport('performance', params)
  }, [fetchReport])

  const fetchDailySummary = useCallback(async (params = {}) => {
    return fetchReport('dailySummary', params)
  }, [fetchReport])

  const fetchMonthlySummary = useCallback(async (params = {}) => {
    return fetchReport('monthlySummary', params)
  }, [fetchReport])

  const fetchAuditReport = useCallback(async (params = {}) => {
    return fetchReport('audit', params)
  }, [fetchReport])

  const fetchCollectionReport = useCallback(async (params = {}) => {
    return fetchReport('collection', params)
  }, [fetchReport])

  const fetchRiskAssessment = useCallback(async (params = {}) => {
    return fetchReport('riskAssessment', params)
  }, [fetchReport])

  // ==================== EXPORTS ====================

  const exportData = useCallback(async (dataType, format, filters = {}) => {
    try {
      setExporting(true)
      setError(null)
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
        setGenerationProgress(0)
      }, 2000)

      return { success: true, filename }
    } catch (error) {
      const message = error.response?.data?.error || `Failed to export ${format}`
      setError(message)
      setGenerationProgress(0)
      addToast(message, 'error')
      throw error
    } finally {
      setExporting(false)
    }
  }, [setExporting, setError, setSuccess, setGenerationProgress, addToast])

  const exportPDF = useCallback(async (dataType, filters = {}) => {
    return exportData(dataType, 'pdf', filters)
  }, [exportData])

  const exportExcel = useCallback(async (dataType, filters = {}) => {
    return exportData(dataType, 'excel', filters)
  }, [exportData])

  const quickExport = useCallback(async (dataType, format = 'pdf', filters = {}) => {
    return exportData(dataType, format, filters)
  }, [exportData])

  // ==================== HISTORY & SCHEDULES ====================

  const fetchReportHistory = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const history = await reportsAPI.getReportHistory(params)
      setState(prev => ({ ...prev, reportHistory: history }))
      return history
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch report history'
      setError(message)
      addToast(message, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, addToast])

  const downloadHistoricalReport = useCallback(async (reportId) => {
    try {
      setExporting(true)
      setGenerationProgress(30)
      
      const blob = await reportsAPI.downloadReport(reportId)
      const filename = reportsAPI.generateFilename(`report_${reportId}`, 'pdf')
      reportsAPI.downloadFile(blob, filename)

      setGenerationProgress(100)
      addToast('Report downloaded successfully', 'success')

      setTimeout(() => {
        setGenerationProgress(0)
      }, 2000)

      return { success: true, filename }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to download report'
      setError(message)
      setGenerationProgress(0)
      addToast(message, 'error')
      throw error
    } finally {
      setExporting(false)
    }
  }, [setExporting, setError, setGenerationProgress, addToast])

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const schedules = await reportsAPI.getSchedules()
      setState(prev => ({ ...prev, schedules }))
      return schedules
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch schedules'
      setError(message)
      addToast(message, 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, addToast])

  const createSchedule = useCallback(async (data) => {
    try {
      setLoading(true)
      setError(null)
      const schedule = await reportsAPI.scheduleReport(data)
      setState(prev => ({ 
        ...prev, 
        schedules: [...prev.schedules, schedule] 
      }))
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
  }, [setLoading, setError, addToast])

  // ==================== FILTER & STATE MANAGEMENT ====================

  const updateFilters = useCallback((newFilters) => {
    setFilterParams(newFilters)
  }, [setFilterParams])

  const resetFilters = useCallback(() => {
    setState(prev => ({ ...prev, filterParams: {} }))
  }, [])

  const selectReport = useCallback((report) => {
    setCurrentReport(report)
  }, [setCurrentReport])

  const clearCurrentReport = useCallback(() => {
    setCurrentReport(null)
  }, [setCurrentReport])

  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  const clearSuccess = useCallback(() => {
    setSuccess(null)
  }, [setSuccess])

  const setFormat = useCallback((format) => {
    setState(prev => ({ ...prev, selectedFormat: format }))
  }, [])

  const resetGenerationProgress = useCallback(() => {
    setGenerationProgress(0)
  }, [setGenerationProgress])

  // ==================== CANCELLATION ====================

  const cancelExport = useCallback(() => {
    if (downloadAbortRef.current) {
      downloadAbortRef.current.abort()
      downloadAbortRef.current = null
    }
    setExporting(false)
    setGenerationProgress(0)
    addToast('Export cancelled', 'warning')
  }, [setExporting, setGenerationProgress, addToast])

  return {
    // State
    ...state,

    // State setters
    setFilterParams,
    setCurrentReport,
    setFormat,
    setGenerationProgress,

    // Listing
    getAvailableReports,
    listReports,

    // Generation
    generateReportByType,

    // Specialized Reports
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
    resetFilters,
    selectReport,
    clearCurrentReport,
    clearError,
    clearSuccess,
    resetGenerationProgress,

    // History & Schedules
    fetchReportHistory,
    downloadHistoricalReport,
    fetchSchedules,
    createSchedule,

    // Cancellation
    cancelExport
  }
}

export default useReports