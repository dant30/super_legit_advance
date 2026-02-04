// frontend/src/hooks/useReports.js

import { useState, useCallback, useRef } from 'react'
import { useToast } from '@contexts/ToastContext'
import { reportsAPI } from '@api/reports'

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

  const setPartial = useCallback((patch) => setState(prev => ({ ...prev, ...patch })), [])

  const setLoading = useCallback((loading) => setPartial({ loading }), [setPartial])
  const setGenerating = useCallback((generating) => setPartial({ generating }), [setPartial])
  const setExporting = useCallback((exporting) => setPartial({ exporting }), [setPartial])
  const setError = useCallback((error) => setPartial({ error }), [setPartial])
  const setSuccess = useCallback((success) => setPartial({ success }), [setPartial])
  const setCurrentReport = useCallback((r) => setPartial({ currentReport: r }), [setPartial])
  const setFilterParams = useCallback((p) => setPartial({ filterParams: { ...state.filterParams, ...p } }), [state.filterParams])
  const setGenerationProgress = useCallback((p) => setPartial({ generationProgress: Math.min(100, p) }), [setPartial])
  const setFormat = useCallback((f) => setPartial({ selectedFormat: f }), [setPartial])

  // Listing
  const getAvailableReports = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const types = await reportsAPI.getReportTypes()
      setPartial({ reports: types })
      addToast('Reports loaded', 'success')
      return types
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to fetch reports'
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setLoading(false) }
  }, [addToast, setLoading, setError])

  const listReports = useCallback(async (params = {}) => {
    setLoading(true); setError(null)
    try {
      const res = await reportsAPI.getReports(reportsAPI.buildParams(params))
      setPartial({ reports: res.results || res })
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to list reports'
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setLoading(false) }
  }, [addToast])

  // Generate
  const generateReportByType = useCallback(async (reportType, format = 'json', parameters = {}) => {
    setGenerating(true); setError(null); setGenerationProgress(10)
    try {
      const payload = { report_type: reportType, format, parameters: reportsAPI.buildParams(parameters) }
      const resp = await reportsAPI.generateReport(payload)
      setGenerationProgress(100)
      if (format === 'json') {
        setCurrentReport(resp.report || resp)
        setSuccess('Report generated')
        addToast('Report generated', 'success')
        setTimeout(() => setGenerationProgress(0), 800)
        return resp
      } else {
        // resp is a blob from backend
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
  }, [addToast])

  // Specialized fetch wrapper
  const fetchReport = useCallback(async (reportType, params = {}) => {
    setLoading(true); setError(null)
    try {
      const methodMap = {
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
      const m = methodMap[reportType]
      if (!m) throw new Error('Unsupported report type')
      const res = await m(reportsAPI.buildParams(params))
      setCurrentReport(res)
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || `Failed to fetch ${reportType}`
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setLoading(false) }
  }, [addToast])

  const fetchLoansReport = useCallback((p = {}) => fetchReport('loans', p), [fetchReport])
  const fetchPaymentsReport = useCallback((p = {}) => fetchReport('payments', p), [fetchReport])
  const fetchCustomersReport = useCallback((p = {}) => fetchReport('customers', p), [fetchReport])
  const fetchPerformanceReport = useCallback((p = {}) => fetchReport('performance', p), [fetchReport])

  // Exports
  const exportData = useCallback(async (dataType, format = 'pdf', filters = {}) => {
    setExporting(true); setError(null); setGenerationProgress(15)
    try {
      const payload = { data_type: dataType, filters: reportsAPI.buildParams(filters) }
      const apiMethod = format === 'pdf' ? reportsAPI.exportToPDF.bind(reportsAPI) : reportsAPI.exportToExcel.bind(reportsAPI)
      const blob = await apiMethod(payload)
      const filename = reportsAPI.generateFilename(`${dataType}_export`, format === 'excel' ? 'excel' : 'pdf')
      reportsAPI.downloadFile(blob, filename)
      setGenerationProgress(100)
      setSuccess(`${format.toUpperCase()} exported`)
      addToast(`${format.toUpperCase()} exported`, 'success')
      setTimeout(() => setGenerationProgress(0), 800)
      return { filename }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || `Failed to export ${format}`
      setError(msg); setGenerationProgress(0); addToast(msg, 'error'); throw err
    } finally { setExporting(false) }
  }, [addToast])

  const exportPDF = useCallback((type, filters = {}) => exportData(type, 'pdf', filters), [exportData])
  const exportExcel = useCallback((type, filters = {}) => exportData(type, 'excel', filters), [exportData])
  const quickExport = useCallback((type, format = 'pdf', filters = {}) => exportData(type, format, filters), [exportData])

  // History & schedules
  const fetchReportHistory = useCallback(async (params = {}) => {
    setLoading(true); setError(null)
    try {
      const h = await reportsAPI.getReportHistory(reportsAPI.buildParams(params))
      setPartial({ reportHistory: h })
      return h
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to fetch history'
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setLoading(false) }
  }, [addToast])

  const downloadHistoricalReport = useCallback(async (reportId) => {
    setExporting(true); setGenerationProgress(10)
    try {
      const blob = await reportsAPI.downloadReport(reportId)
      const filename = reportsAPI.generateFilename(`historical_report_${reportId}`, 'pdf')
      reportsAPI.downloadFile(blob, filename)
      setGenerationProgress(100); addToast('Report downloaded', 'success'); return filename
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Download failed'
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setExporting(false); setGenerationProgress(0) }
  }, [addToast])

  const fetchSchedules = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const s = await reportsAPI.getSchedules()
      setPartial({ schedules: s })
      return s
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to fetch schedules'
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setLoading(false) }
  }, [addToast])

  const createSchedule = useCallback(async (data) => {
    setLoading(true); setError(null)
    try {
      const res = await reportsAPI.scheduleReport(data)
      // optimistic update: fetchSchedules or append
      await fetchSchedules()
      addToast('Schedule created', 'success')
      return res
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to create schedule'
      setError(msg); addToast(msg, 'error'); throw err
    } finally { setLoading(false) }
  }, [addToast, fetchSchedules])

  const cancelExport = useCallback(() => {
    if (downloadAbortRef.current) {
      try { downloadAbortRef.current.abort() } catch { /* ignore abort errors */ }
      downloadAbortRef.current = null
    }
    setPartial({ exporting: false, generationProgress: 0 })
    addToast('Export cancelled', 'warning')
  }, [addToast])

  const updateFilters = useCallback((newFilters) => setFilterParams(newFilters), [setFilterParams])
  const resetFilters = useCallback(() => setPartial({ filterParams: {} }), [])
  const selectReport = useCallback((r) => setCurrentReport(r), [setCurrentReport])
  const clearCurrentReport = useCallback(() => setCurrentReport(null), [setCurrentReport])
  const clearError = useCallback(() => setError(null), [setError])
  const clearSuccess = useCallback(() => setSuccess(null), [setSuccess])
  const resetGenerationProgress = useCallback(() => setGenerationProgress(0), [setGenerationProgress])

  return {
    ...state,
    // setters
    setFilterParams, setCurrentReport, setFormat, setGenerationProgress,
    // listing
    getAvailableReports, listReports,
    // generation
    generateReportByType,
    // specialized
    fetchLoansReport, fetchPaymentsReport, fetchCustomersReport, fetchPerformanceReport,
    fetchDailySummary: (p) => fetchReport('dailySummary', p),
    fetchMonthlySummary: (p) => fetchReport('monthlySummary', p),
    fetchAuditReport: (p) => fetchReport('audit', p),
    fetchCollectionReport: (p) => fetchReport('collection', p),
    fetchRiskAssessment: (p) => fetchReport('riskAssessment', p),
    // exports
    exportPDF, exportExcel, quickExport,
    // history & schedules
    fetchReportHistory, downloadHistoricalReport, fetchSchedules, createSchedule,
    // filters & state
    updateFilters, resetFilters, selectReport, clearCurrentReport, clearError, clearSuccess,
    resetGenerationProgress,
    // cancellation
    cancelExport,
  }
}

export default useReports