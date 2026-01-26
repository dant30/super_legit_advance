// frontend/src/store/slices/auditSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { auditAPI } from '@/lib/api/audit'
import type { 
  AuditLog, 
  AuditLogListResponse, 
  AuditStats, 
  UserActivity,
  RootState 
} from '@/types'

interface AuditState {
  logs: AuditLog[]
  currentLog: AuditLog | null
  stats: AuditStats | null
  userActivity: UserActivity | null
  securityEvents: AuditLog[]
  complianceEvents: AuditLog[]
  loading: boolean
  error: string | null
  pagination: {
    count: number
    next: string | null
    previous: string | null
  }
  filters: {
    action?: string
    severity?: string
    status?: string
    model_name?: string
    start_date?: string
    end_date?: string
    user_id?: number
    search?: string
  }
}

const initialState: AuditState = {
  logs: [],
  currentLog: null,
  stats: null,
  userActivity: null,
  securityEvents: [],
  complianceEvents: [],
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null
  },
  filters: {}
}

// Async Thunks
export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchAuditLogs',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await auditAPI.getAuditLogs(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchAuditLog = createAsyncThunk(
  'audit/fetchAuditLog',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await auditAPI.getAuditLog(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchAuditStats = createAsyncThunk(
  'audit/fetchAuditStats',
  async (days: number = 30, { rejectWithValue }) => {
    try {
      const response = await auditAPI.getAuditStats(days)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchUserActivity = createAsyncThunk(
  'audit/fetchUserActivity',
  async ({ userId, days }: { userId: number; days?: number }, { rejectWithValue }) => {
    try {
      const response = await auditAPI.getUserActivity(userId, days)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchSecurityEvents = createAsyncThunk(
  'audit/fetchSecurityEvents',
  async (days: number = 30, { rejectWithValue }) => {
    try {
      const response = await auditAPI.getSecurityEvents(days)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchComplianceEvents = createAsyncThunk(
  'audit/fetchComplianceEvents',
  async (days: number = 90, { rejectWithValue }) => {
    try {
      const response = await auditAPI.getComplianceEvents(days)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const searchAuditLogs = createAsyncThunk(
  'audit/searchAuditLogs',
  async ({ query, searchType, params }: { query: string; searchType?: string; params?: any }, { rejectWithValue }) => {
    try {
      const response = await auditAPI.searchLogs(query, searchType, params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<AuditState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    clearCurrentLog: (state) => {
      state.currentLog = null
    },
    clearError: (state) => {
      state.error = null
    },
    clearAll: (state) => {
      state.logs = []
      state.currentLog = null
      state.stats = null
      state.userActivity = null
      state.securityEvents = []
      state.complianceEvents = []
      state.error = null
      state.pagination = initialState.pagination
      state.filters = {}
    }
  },
  extraReducers: (builder) => {
    // Fetch audit logs
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.results
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous
        }
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch single audit log
    builder
      .addCase(fetchAuditLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAuditLog.fulfilled, (state, action) => {
        state.loading = false
        state.currentLog = action.payload
      })
      .addCase(fetchAuditLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch audit stats
    builder
      .addCase(fetchAuditStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAuditStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchAuditStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch user activity
    builder
      .addCase(fetchUserActivity.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.loading = false
        state.userActivity = action.payload
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch security events
    builder
      .addCase(fetchSecurityEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSecurityEvents.fulfilled, (state, action) => {
        state.loading = false
        state.securityEvents = action.payload.results
      })
      .addCase(fetchSecurityEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch compliance events
    builder
      .addCase(fetchComplianceEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComplianceEvents.fulfilled, (state, action) => {
        state.loading = false
        state.complianceEvents = action.payload.results
      })
      .addCase(fetchComplianceEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Search audit logs
    builder
      .addCase(searchAuditLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchAuditLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.results
        state.pagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous
        }
      })
      .addCase(searchAuditLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

// Selectors
export const selectAuditLogs = (state: RootState) => state.audit.logs
export const selectCurrentAuditLog = (state: RootState) => state.audit.currentLog
export const selectAuditStats = (state: RootState) => state.audit.stats
export const selectUserActivity = (state: RootState) => state.audit.userActivity
export const selectSecurityEvents = (state: RootState) => state.audit.securityEvents
export const selectComplianceEvents = (state: RootState) => state.audit.complianceEvents
export const selectAuditLoading = (state: RootState) => state.audit.loading
export const selectAuditError = (state: RootState) => state.audit.error
export const selectAuditPagination = (state: RootState) => state.audit.pagination
export const selectAuditFilters = (state: RootState) => state.audit.filters

// Actions
export const { 
  setFilters, 
  clearFilters, 
  clearCurrentLog, 
  clearError,
  clearAll 
} = auditSlice.actions

// Reducer
export default auditSlice.reducer