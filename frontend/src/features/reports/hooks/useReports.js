// frontend/src/hooks/useReports.js

import { useState, useCallback, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useToast } from '@contexts/ToastContext'
import { reportsAPI } from '@api/reports'
import { setReportsState } from '../store'

const REPORT_ENDPOINT_BUCKET_MAP = Object.freeze({
  loans: 'loans',
  payments: 'payments',
  customers: 'customers',
  performance: 'performance',
  audit: 'audit',
  collection: 'collection',
})

export const normalizeReportError = (error, fallback = 'Request failed') => {
  if (!error) return fallback
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message || fallback

  const payload = error?.response?.data || error
  if (typeof payload === 'string') return payload

  const preferred =
    payload?.message ||
    payload?.detail ||
    payload?.error ||
    payload?.title

  if (typeof preferred === 'string' && preferred.trim()) return preferred

  if (typeof payload?.code === 'string') {
    return `${payload.code}: ${fallback}`
  }

  return fallback
}

export const useReports = () => {
  const dispatch = useDispatch()
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

  const setPartial = useCallback((patch) => {
    setState(prev => ({ ...prev, ...patch }))
    dispatch(setReportsState(patch))
  }, [dispatch])

  const setLoading = useCallback((loading) => setPartial({ loading }), [setPartial])
  const setGenerating = useCallback((generating) => setPartial({ generating }), [setPartial])
  const setExporting = useCallback((exporting) => setPartial({ exporting }), [setPartial])
  const setError = useCallback((error) => {
    setPartial({ error: normalizeReportError(error, 'Request failed') })
  }, [setPartial])
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
      const msg = normalizeReportError(err, 'Failed to fetch reports')
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
      const msg = normalizeReportError(err, 'Failed to list reports')
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
      const msg = normalizeReportError(err, 'Failed to generate report')
      setError(msg); setGenerationProgress(0); addToast(msg, 'error'); throw err
    } finally { setGenerating(false) }
  }, [addToast])

  // Specialized fetch wrapper
  const fetchReport = useCallback(async (reportType, params = {}) => {
    const bucket = REPORT_ENDPOINT_BUCKET_MAP[reportType]
    setLoading(true); setError(null)
    if (bucket) {
      setPartial({
        [`${bucket}Loading`]: true,
        [`${bucket}Error`]: null,
      })
    }
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
      const msg = normalizeReportError(err, `Failed to fetch ${reportType}`)
      setError(msg)
      if (bucket) {
        setPartial({
          [`${bucket}Error`]: msg,
        })
      }
      addToast(msg, 'error')
      throw err
    } finally {
      setLoading(false)
      if (bucket) {
        setPartial({
          [`${bucket}Loading`]: false,
        })
      }
    }
  }, [addToast, setLoading, setError, setPartial, setCurrentReport])

  const fetchLoansReport = useCallback((p = {}) => fetchReport('loans', p), [fetchReport])
  const fetchPaymentsReport = useCallback((p = {}) => fetchReport('payments', p), [fetchReport])
  const fetchCustomersReport = useCallback((p = {}) => fetchReport('customers', p), [fetchReport])
  const fetchPerformanceReport = useCallback((p = {}) => fetchReport('performance', p), [fetchReport])
  const fetchDailySummary = useCallback((p = {}) => fetchReport('dailySummary', p), [fetchReport])
  const fetchMonthlySummary = useCallback((p = {}) => fetchReport('monthlySummary', p), [fetchReport])
  const fetchAuditReport = useCallback((p = {}) => fetchReport('audit', p), [fetchReport])
  const fetchCollectionReport = useCallback((p = {}) => fetchReport('collection', p), [fetchReport])
  const fetchRiskAssessment = useCallback((p = {}) => fetchReport('riskAssessment', p), [fetchReport])

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
      const msg = normalizeReportError(err, `Failed to export ${format}`)
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
      const msg = normalizeReportError(err, 'Failed to fetch history')
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
      const msg = normalizeReportError(err, 'Download failed')
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
      const msg = normalizeReportError(err, 'Failed to fetch schedules')
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
      const msg = normalizeReportError(err, 'Failed to create schedule')
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
    fetchDailySummary, fetchMonthlySummary, fetchAuditReport, fetchCollectionReport, fetchRiskAssessment,
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
