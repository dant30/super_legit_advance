// frontend/src/store/slices/repaymentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { repaymentsAPI } from '@/lib/api/repayments'
import type { 
  Repayment, 
  RepaymentSchedule, 
  Penalty,
  DashboardStats,
  PaginatedResponse
} from '@/lib/api/repayments'

export interface RepaymentState {
  repayments: Repayment[]
  schedules: RepaymentSchedule[]
  penalties: Penalty[]
  selectedRepayment: Repayment | null
  loading: boolean
  error: string | null
  dashboardStats: DashboardStats | null
  pagination: {
    count: number
    next: string | null
    previous: string | null
    page: number
    pageSize: number
  }
}

const initialState: RepaymentState = {
  repayments: [],
  schedules: [],
  penalties: [],
  selectedRepayment: null,
  loading: false,
  error: null,
  dashboardStats: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pageSize: 20,
  },
}

export const fetchRepayments = createAsyncThunk(
  'repayments/fetchRepayments',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await repaymentsAPI.getRepayments(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch repayments')
    }
  }
)

export const fetchRepayment = createAsyncThunk(
  'repayments/fetchRepayment',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await repaymentsAPI.getRepayment(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch repayment')
    }
  }
)

export const fetchSchedules = createAsyncThunk(
  'repayments/fetchSchedules',
  async (loanId: number, { rejectWithValue }) => {
    try {
      const response = await repaymentsAPI.getSchedules(loanId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch schedules')
    }
  }
)

export const fetchPenalties = createAsyncThunk(
  'repayments/fetchPenalties',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await repaymentsAPI.getPenalties(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch penalties')
    }
  }
)

export const fetchDashboardStats = createAsyncThunk(
  'repayments/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await repaymentsAPI.getDashboard()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch dashboard stats')
    }
  }
)

export const fetchOverdueRepayments = createAsyncThunk(
  'repayments/fetchOverdueRepayments',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await repaymentsAPI.getOverdueRepayments(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch overdue repayments')
    }
  }
)

export const fetchUpcomingRepayments = createAsyncThunk(
  'repayments/fetchUpcomingRepayments',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await repaymentsAPI.getUpcomingRepayments(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch upcoming repayments')
    }
  }
)

const repaymentSlice = createSlice({
  name: 'repayments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedRepayment: (state) => {
      state.selectedRepayment = null
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch repayments
      .addCase(fetchRepayments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRepayments.fulfilled, (state, action) => {
        state.loading = false
        state.repayments = action.payload.results
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
          page: state.pagination.page,
          pageSize: state.pagination.pageSize,
        }
      })
      .addCase(fetchRepayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch single repayment
      .addCase(fetchRepayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRepayment.fulfilled, (state, action) => {
        state.loading = false
        state.selectedRepayment = action.payload
      })
      .addCase(fetchRepayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false
        state.schedules = action.payload.results
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch penalties
      .addCase(fetchPenalties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPenalties.fulfilled, (state, action) => {
        state.loading = false
        state.penalties = action.payload.results
      })
      .addCase(fetchPenalties.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardStats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch overdue repayments
      .addCase(fetchOverdueRepayments.fulfilled, (state, action) => {
        // You might want to store these separately or replace the main list
        // For now, just update the repayments list
        state.repayments = action.payload.results
      })

      // Fetch upcoming repayments
      .addCase(fetchUpcomingRepayments.fulfilled, (state, action) => {
        // You might want to store these separately or replace the main list
        // For now, just update the repayments list
        state.repayments = action.payload.results
      })
  },
})

export const { clearError, clearSelectedRepayment, setPage, setPageSize } = repaymentSlice.actions
export default repaymentSlice.reducer