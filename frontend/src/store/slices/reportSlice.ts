// frontendsrc/store/slices/reportSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { reportsAPI, Report, ReportGeneratePayload } from '@/lib/api/reports'
import { ReportType, ReportFormat } from '@/types/reports'

interface ReportState {
  reports: Report[]
  currentReport: Report | null
  loading: boolean
  error: string | null
  generating: boolean
  reportData: any | null
  filterParams: {
    start_date?: string
    end_date?: string
    type?: ReportType
    [key: string]: any
  }
}

const initialState: ReportState = {
  reports: [],
  currentReport: null,
  loading: false,
  error: null,
  generating: false,
  reportData: null,
  filterParams: {},
}

// Async thunks
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (params?: any) => {
    const response = await reportsAPI.getReports(params)
    return response
  }
)

export const generateReport = createAsyncThunk(
  'reports/generateReport',
  async (payload: ReportGeneratePayload) => {
    const response = await reportsAPI.generateReport(payload)
    return response
  }
)

export const exportToPDF = createAsyncThunk(
  'reports/exportToPDF',
  async (data: any) => {
    const response = await reportsAPI.exportToPDF(data)
    return response
  }
)

export const exportToExcel = createAsyncThunk(
  'reports/exportToExcel',
  async (data: any) => {
    const response = await reportsAPI.exportToExcel(data)
    return response
  }
)

export const getLoansReport = createAsyncThunk(
  'reports/getLoansReport',
  async (params?: any) => {
    const response = await reportsAPI.getLoansReport(params)
    return response
  }
)

export const getPaymentsReport = createAsyncThunk(
  'reports/getPaymentsReport',
  async (params?: any) => {
    const response = await reportsAPI.getPaymentsReport(params)
    return response
  }
)

export const getCustomersReport = createAsyncThunk(
  'reports/getCustomersReport',
  async (params?: any) => {
    const response = await reportsAPI.getCustomersReport(params)
    return response
  }
)

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setCurrentReport: (state, action: PayloadAction<Report | null>) => {
      state.currentReport = action.payload
    },
    setFilterParams: (state, action: PayloadAction<any>) => {
      state.filterParams = { ...state.filterParams, ...action.payload }
    },
    clearFilterParams: (state) => {
      state.filterParams = {}
    },
    clearReportData: (state) => {
      state.reportData = null
      state.currentReport = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false
        state.reports = action.payload.results || []
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch reports'
      })

      // Generate report
      .addCase(generateReport.pending, (state) => {
        state.generating = true
        state.error = null
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.generating = false
        state.currentReport = action.payload
        // Add to reports list if not already there
        if (!state.reports.find(r => r.id === action.payload.id)) {
          state.reports.unshift(action.payload)
        }
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.generating = false
        state.error = action.error.message || 'Failed to generate report'
      })

      // Export to PDF
      .addCase(exportToPDF.pending, (state) => {
        state.generating = true
        state.error = null
      })
      .addCase(exportToPDF.fulfilled, (state) => {
        state.generating = false
      })
      .addCase(exportToPDF.rejected, (state, action) => {
        state.generating = false
        state.error = action.error.message || 'Failed to export to PDF'
      })

      // Export to Excel
      .addCase(exportToExcel.pending, (state) => {
        state.generating = true
        state.error = null
      })
      .addCase(exportToExcel.fulfilled, (state) => {
        state.generating = false
      })
      .addCase(exportToExcel.rejected, (state, action) => {
        state.generating = false
        state.error = action.error.message || 'Failed to export to Excel'
      })

      // Get loans report
      .addCase(getLoansReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLoansReport.fulfilled, (state, action) => {
        state.loading = false
        state.reportData = action.payload
      })
      .addCase(getLoansReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch loans report'
      })

      // Get payments report
      .addCase(getPaymentsReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPaymentsReport.fulfilled, (state, action) => {
        state.loading = false
        state.reportData = action.payload
      })
      .addCase(getPaymentsReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch payments report'
      })

      // Get customers report
      .addCase(getCustomersReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCustomersReport.fulfilled, (state, action) => {
        state.loading = false
        state.reportData = action.payload
      })
      .addCase(getCustomersReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch customers report'
      })
  },
})

export const {
  setCurrentReport,
  setFilterParams,
  clearFilterParams,
  clearReportData,
  clearError,
} = reportSlice.actions

export default reportSlice.reducer