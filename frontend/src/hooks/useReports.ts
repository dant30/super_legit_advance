// frontend/src/hooks/useReports.ts

import { useCallback, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchReports,
  generateReport,
  exportToPDF,
  exportToExcel,
  getLoansReport,
  getPaymentsReport,
  getCustomersReport,
  getPerformanceReport,
  getDailySummary,
  getMonthlySummary,
  getAuditReport,
  getCollectionReport,
  getRiskAssessment,
  setCurrentReport,
  setFilterParams,
  clearError,
} from '@/store/slices/reportSlice'
import { RootState } from '@/store/store'
import {
  ReportType,
  ReportFormat,
  ReportParameter,
  ReportGenerationRequest,
  ReportExportRequest,
} from '@/types/reports'
import { reportsAPI } from '@/lib/api/reports'

export const useReports = () => {
  const dispatch = useAppDispatch()
  const downloadAbortRef = useRef<AbortController | null>(null)

  const {
    reports,
    currentReport,
    reportHistory,
    loading,
    generating,
    exporting,
    error,
    success,
    filterParams,
    selectedFormat,
    generationProgress,
  } = useAppSelector((state: RootState) => state.reports)

  // ==================== REPORT LISTING ====================

  const getAvailableReports = useCallback(async () => {
    try {
      return await reportsAPI.getReportTypes()
    } catch (err) {
      console.error('Failed to fetch available reports:', err)
      throw err
    }
  }, [])

  const listReports = useCallback(
    async (params?: any) => {
      return await dispatch(fetchReports(params)).unwrap()
    },
    [dispatch]
  )

  // ==================== REPORT GENERATION ====================

  const generateReportByType = useCallback(
    async (
      reportType: ReportType,
      format: ReportFormat = 'json',
      parameters?: ReportParameter
    ) => {
      try {
        const payload: ReportGenerationRequest = {
          report_type: reportType,
          format,
          parameters,
        }
        return await dispatch(generateReport(payload)).unwrap()
      } catch (err) {
        console.error('Failed to generate report:', err)
        throw err
      }
    },
    [dispatch]
  )

  // ==================== SPECIALIZED REPORTS ====================

  const fetchLoansReport = useCallback(
    async (params?: any) => {
      try {
        return await dispatch(getLoansReport(params)).unwrap()
      } catch (err) {
        console.error('Failed to fetch loans report:', err)
        throw err
      }
    },
    [dispatch]
  )

  const fetchPaymentsReport = useCallback(
    async (params?: any) => {
      try {
        return await dispatch(getPaymentsReport(params)).unwrap()
      } catch (err) {
        console.error('Failed to fetch payments report:', err)
        throw err
      }
    },
    [dispatch]
  )

  const fetchCustomersReport = useCallback(
    async (params?: any) => {
      try {
        return await dispatch(getCustomersReport(params)).unwrap()
      } catch (err) {
        console.error('Failed to fetch customers report:', err)
        throw err
      }
    },
    [dispatch]
  )

  const fetchPerformanceReport = useCallback(
    async (params?: any) => {
      try {
        return await dispatch(getPerformanceReport(params)).unwrap()
      } catch (err) {
        console.error('Failed to fetch performance report:', err)
        throw err
      }
    },
    [dispatch]
  )

  const fetchDailySummary = useCallback(
    async (params?: any) => {
      try {
        return await dispatch(getDailySummary(params)).unwrap()
      } catch (err) {
        console.error('Failed to fetch daily summary:', err)
        throw err
      }
    },
    [dispatch]
  )

  const fetchMonthlySummary = useCallback(
    async (params?: any) => {
      try {
        return await dispatch(getMonthlySummary(params)).unwrap()
      } catch (err) {
        console.error('Failed to fetch monthly summary:', err)
        throw err
      }
    },
    [dispatch]
  )

  const fetchAuditReport = useCallback(
    async (params?: any) => {
      try {
        return await dispatch(getAuditReport(params)).unwrap()
      } catch (err) {
        console.error('Failed to fetch audit report:', err)
        throw err
      }
    },
    [dispatch]
  )

  const fetchCollectionReport = useCallback(
    async (params?: any) => {
      try {
        return await dispatch(getCollectionReport(params)).unwrap()
      } catch (err) {
        console.error('Failed to fetch collection report:', err)
        throw err
      }
    },
    [dispatch]
  )

  const fetchRiskAssessment = useCallback(
    async (params?: any) => {
      try {
        return await dispatch(getRiskAssessment(params)).unwrap()
      } catch (err) {
        console.error('Failed to fetch risk assessment:', err)
        throw err
      }
    },
    [dispatch]
  )

  // ==================== EXPORTS ====================

  const exportPDF = useCallback(
    async (dataType: 'loans' | 'payments' | 'customers', filters?: any) => {
      try {
        const payload: ReportExportRequest = {
          data_type: dataType,
          filters,
        }
        const blob = await dispatch(exportToPDF(payload)).unwrap()

        const filename = reportsAPI.generateFilename(
          `${dataType}_export`,
          'pdf'
        )
        reportsAPI.downloadFile(blob, filename)

        return { success: true, filename }
      } catch (err) {
        console.error('Failed to export PDF:', err)
        throw err
      }
    },
    [dispatch]
  )

  const exportExcel = useCallback(
    async (dataType: 'loans' | 'payments' | 'customers', filters?: any) => {
      try {
        const payload: ReportExportRequest = {
          data_type: dataType,
          filters,
        }
        const blob = await dispatch(exportToExcel(payload)).unwrap()

        const filename = reportsAPI.generateFilename(
          `${dataType}_export`,
          'excel'
        )
        reportsAPI.downloadFile(blob, filename)

        return { success: true, filename }
      } catch (err) {
        console.error('Failed to export Excel:', err)
        throw err
      }
    },
    [dispatch]
  )

  const quickExport = useCallback(
    async (
      dataType: 'loans' | 'payments' | 'customers',
      format: 'pdf' | 'excel' = 'pdf',
      filters?: any
    ) => {
      if (format === 'pdf') {
        return exportPDF(dataType, filters)
      } else {
        return exportExcel(dataType, filters)
      }
    },
    [exportPDF, exportExcel]
  )

  // ==================== FILTER & STATE MANAGEMENT ====================

  const updateFilters = useCallback(
    (newFilters: ReportParameter) => {
      dispatch(setFilterParams(newFilters))
    },
    [dispatch]
  )

  const resetFilters = useCallback(() => {
    dispatch(clearFilterParams())
  }, [dispatch])

  const selectReport = useCallback(
    (report: any) => {
      dispatch(setCurrentReport(report))
    },
    [dispatch]
  )

  const clearCurrentReport = useCallback(() => {
    dispatch(setCurrentReport(null))
    dispatch(clearReportData())
  }, [dispatch])

  const handleError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  // ==================== UTILITY METHODS ====================

  const getReportFilters = useCallback((): ReportParameter => {
    return filterParams
  }, [filterParams])

  const buildReportParams = useCallback(
    (overrides?: Partial<ReportParameter>): ReportParameter => {
      return {
        ...filterParams,
        ...overrides,
      }
    },
    [filterParams]
  )

  const formatReportData = useCallback((data: any): any => {
    // Add any data transformation logic here
    return data
  }, [])

  // ==================== BATCH OPERATIONS ====================

  const generateMultipleReports = useCallback(
    async (
      reportConfigs: Array<{
        type: ReportType
        format: ReportFormat
        parameters?: ReportParameter
      }>
    ) => {
      const results = []
      for (const config of reportConfigs) {
        try {
          const result = await generateReportByType(
            config.type,
            config.format,
            config.parameters
          )
          results.push({ success: true, report: result })
        } catch (err) {
          results.push({ success: false, error: err })
        }
      }
      return results
    },
    [generateReportByType]
  )

  const exportMultipleFormats = useCallback(
    async (
      dataType: 'loans' | 'payments' | 'customers',
      formats: ReportFormat[],
      filters?: any
    ) => {
      const results = []
      for (const format of formats) {
        try {
          const result = await quickExport(dataType, format as any, filters)
          results.push({ success: true, format, ...result })
        } catch (err) {
          results.push({ success: false, format, error: err })
        }
      }
      return results
    },
    [quickExport]
  )

  // ==================== HISTORY ====================

  const fetchReportHistory = useCallback(
    async (params?: any) => {
      try {
        return await reportsAPI.getReportHistory(params)
      } catch (err) {
        console.error('Failed to fetch report history:', err)
        throw err
      }
    },
    []
  )

  const downloadHistoricalReport = useCallback(async (reportId: number) => {
    try {
      const blob = await reportsAPI.downloadReport(reportId)
      const filename = reportsAPI.generateFilename(
        `report_${reportId}`,
        'pdf'
      )
      reportsAPI.downloadFile(blob, filename)
      return { success: true, filename }
    } catch (err) {
      console.error('Failed to download report:', err)
      throw err
    }
  }, [])

  // ==================== CANCELLATION ====================

  const cancelExport = useCallback(() => {
    if (downloadAbortRef.current) {
      downloadAbortRef.current.abort()
      downloadAbortRef.current = null
    }
  }, [])

  return {
    // State
    reports,
    currentReport,
    reportHistory,
    loading,
    generating,
    exporting,
    error,
    success,
    filterParams,
    selectedFormat,
    generationProgress,

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

    // Filters & State
    updateFilters,
    resetFilters,
    selectReport,
    clearCurrentReport,
    handleError,

    // History
    fetchReportHistory,
    downloadHistoricalReport,

    // Cancellation
    cancelExport,
  }
}