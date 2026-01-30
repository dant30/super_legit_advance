// frontend/src/store/slices/reportSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { reportsAPI } from '@/lib/api/reports'
import {
  ReportState,
  ReportFormat,
  ReportParameter,
  ReportGenerationRequest,
  ReportDetail,
  ReportExportRequest,
} from '@/types/reports'

const initialState: ReportState = {
  reports: [],
  currentReport: null,
  reportHistory: [],
  loading: false,
  generating: false,
  exporting: false,
  error: null,
  success: null,
  filterParams: {},
  selectedFormat: 'json',
  generationProgress: 0,
  schedules: [],
}

// ==================== ASYNC THUNKS ====================

export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getReports(params)
      return response.results || []
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch reports'
      )
    }
  }
)

export const generateReport = createAsyncThunk(
  'reports/generateReport',
  async (payload: ReportGenerationRequest, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.generateReport(payload)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to generate report'
      )
    }
  }
)

export const exportToPDF = createAsyncThunk(
  'reports/exportToPDF',
  async (data: ReportExportRequest, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.exportToPDF(data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to export to PDF'
      )
    }
  }
)

export const exportToExcel = createAsyncThunk(
  'reports/exportToExcel',
  async (data: ReportExportRequest, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.exportToExcel(data)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to export to Excel'
      )
    }
  }
)

export const getLoansReport = createAsyncThunk(
  'reports/getLoansReport',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getLoansReport(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch loans report'
      )
    }
  }
)

export const getPaymentsReport = createAsyncThunk(
  'reports/getPaymentsReport',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getPaymentsReport(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch payments report'
      )
    }
  }
)

export const getCustomersReport = createAsyncThunk(
  'reports/getCustomersReport',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getCustomersReport(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch customers report'
      )
    }
  }
)

export const getPerformanceReport = createAsyncThunk(
  'reports/getPerformanceReport',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getPerformanceReport(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch performance report'
      )
    }
  }
)

export const getDailySummary = createAsyncThunk(
  'reports/getDailySummary',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getDailySummary(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch daily summary'
      )
    }
  }
)

export const getMonthlySummary = createAsyncThunk(
  'reports/getMonthlySummary',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getMonthlySummary(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch monthly summary'
      )
    }
  }
)

export const getAuditReport = createAsyncThunk(
  'reports/getAuditReport',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getAuditReport(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch audit report'
      )
    }
  }
)

export const getCollectionReport = createAsyncThunk(
  'reports/getCollectionReport',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getCollectionReport(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch collection report'
      )
    }
  }
)

export const getRiskAssessment = createAsyncThunk(
  'reports/getRiskAssessment',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await reportsAPI.getRiskAssessment(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch risk assessment'
      )
    }
  }
)

// ==================== SLICE ====================

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setCurrentReport: (state, action: PayloadAction<ReportDetail | null>) => {
      state.currentReport = action.payload
    },
    setFilterParams: (state, action: PayloadAction<ReportParameter>) => {
      state.filterParams = { ...state.filterParams, ...action.payload }
    },
    clearFilterParams: (state) => {
      state.filterParams = {}
    },
    clearReportData: (state) => {
      state.currentReport = null
    },
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = null
    },
    setSelectedFormat: (state, action: PayloadAction<ReportFormat>) => {
      state.selectedFormat = action.payload
    },
    setGenerationProgress: (state, action: PayloadAction<number>) => {
      state.generationProgress = Math.min(action.payload, 100)
    },
    resetGenerationProgress: (state) => {
      state.generationProgress = 0
    },
  },
  extraReducers: (builder) => {
    // ==================== FETCH REPORTS ====================

    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false
        state.reports = action.payload
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ==================== GENERATE REPORT ====================

    builder
      .addCase(generateReport.pending, (state) => {
        state.generating = true
        state.error = null
        state.generationProgress = 10
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.generating = false
        state.generationProgress = 100
        state.currentReport = action.payload as any
        state.success = 'Report generated successfully'
        // Reset progress after delay
        setTimeout(() => {
          state.generationProgress = 0
        }, 2000)
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.generating = false
        state.generationProgress = 0
        state.error = action.payload as string
      })

    // ==================== EXPORT PDF ====================

    builder
      .addCase(exportToPDF.pending, (state) => {
        state.exporting = true
        state.error = null
        state.generationProgress = 20
      })
      .addCase(exportToPDF.fulfilled, (state) => {
        state.exporting = false
        state.generationProgress = 100
        state.success = 'PDF exported successfully'
        setTimeout(() => {
          state.generationProgress = 0
        }, 2000)
      })
      .addCase(exportToPDF.rejected, (state, action) => {
        state.exporting = false
        state.generationProgress = 0
        state.error = action.payload as string
      })

    // ==================== EXPORT EXCEL ====================

    builder
      .addCase(exportToExcel.pending, (state) => {
        state.exporting = true
        state.error = null
        state.generationProgress = 20
      })
      .addCase(exportToExcel.fulfilled, (state) => {
        state.exporting = false
        state.generationProgress = 100
        state.success = 'Excel exported successfully'
        setTimeout(() => {
          state.generationProgress = 0
        }, 2000)
      })
      .addCase(exportToExcel.rejected, (state, action) => {
        state.exporting = false
        state.generationProgress = 0
        state.error = action.payload as string
      })

    // ==================== GET LOANS REPORT ====================

    builder
      .addCase(getLoansReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLoansReport.fulfilled, (state, action) => {
        state.loading = false
        state.currentReport = action.payload
      })
      .addCase(getLoansReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ==================== GET PAYMENTS REPORT ====================

    builder
      .addCase(getPaymentsReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPaymentsReport.fulfilled, (state, action) => {
        state.loading = false
        state.currentReport = action.payload
      })
      .addCase(getPaymentsReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ==================== GET CUSTOMERS REPORT ====================

    builder
      .addCase(getCustomersReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCustomersReport.fulfilled, (state, action) => {
        state.loading = false
        state.currentReport = action.payload
      })
      .addCase(getCustomersReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ==================== GET PERFORMANCE REPORT ====================

    builder
      .addCase(getPerformanceReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPerformanceReport.fulfilled, (state, action) => {
        state.loading = false
        state.currentReport = action.payload
      })
      .addCase(getPerformanceReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ==================== GET DAILY SUMMARY ====================

    builder
      .addCase(getDailySummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDailySummary.fulfilled, (state, action) => {
        state.loading = false
        state.currentReport = action.payload
      })
      .addCase(getDailySummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ==================== GET MONTHLY SUMMARY ====================

    builder
      .addCase(getMonthlySummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMonthlySummary.fulfilled, (state, action) => {
        state.loading = false
        state.currentReport = action.payload
      })
      .addCase(getMonthlySummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ==================== GET AUDIT REPORT ====================

    builder
      .addCase(getAuditReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAuditReport.fulfilled, (state, action) => {
        state.loading = false
        state.currentReport = action.payload
      })
      .addCase(getAuditReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ==================== GET COLLECTION REPORT ====================

    builder
      .addCase(getCollectionReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCollectionReport.fulfilled, (state, action) => {
        state.loading = false
        state.currentReport = action.payload
      })
      .addCase(getCollectionReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // ==================== GET RISK ASSESSMENT ====================

    builder
      .addCase(getRiskAssessment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRiskAssessment.fulfilled, (state, action) => {
        state.loading = false
        state.currentReport = action.payload
      })
      .addCase(getRiskAssessment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setCurrentReport,
  setFilterParams,
  clearFilterParams,
  clearReportData,
  clearError,
  clearSuccess,
  setSelectedFormat,
  setGenerationProgress,
  resetGenerationProgress,
} = reportSlice.actions

export default reportSlice.reducer