// frontend/src/store/slices/auditSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { auditAPI } from '@/lib/api/audit'
import type {
  AuditLog,
  AuditStats,
  UserActivity,
} from '@/types/audit'

type RootState = any // Import from your store

/* =====================================================
 * ASYNC THUNKS
 * ===================================================== */

/**
 * Fetch audit logs with pagination and filters
 */
export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchLogs',
  async (params?: any, { rejectWithValue } = {} as any) => {
    try {
      const response = await auditAPI.getAuditLogs(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || error.message || 'Failed to fetch audit logs'
      )
    }
  }
)

/**
 * Fetch single audit log by ID
 */
export const fetchAuditLog = createAsyncThunk(
  'audit/fetchAuditLog',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await auditAPI.getAuditLog(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message || 'Failed to fetch audit log')
    }
  }
)

/**
 * Fetch audit statistics
 */
export const fetchAuditStats = createAsyncThunk(
  'audit/fetchAuditStats',
  async (days: number = 30, { rejectWithValue } = {} as any) => {
    try {
      const response = await auditAPI.getAuditStats(days)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || error.message || 'Failed to fetch audit statistics'
      )
    }
  }
)

/**
 * Fetch user activity
 */
export const fetchUserActivity = createAsyncThunk(
  'audit/fetchUserActivity',
  async (
    { userId, days }: { userId: number; days?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await auditAPI.getUserActivity(userId, days)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || error.message || 'Failed to fetch user activity'
      )
    }
  }
)

/**
 * Fetch security events
 */
export const fetchSecurityEvents = createAsyncThunk(
  'audit/fetchSecurityEvents',
  async (
    { days, params }: { days?: number; params?: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await auditAPI.getSecurityEvents(days, params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || error.message || 'Failed to fetch security events'
      )
    }
  }
)

/**
 * Fetch compliance events
 */
export const fetchComplianceEvents = createAsyncThunk(
  'audit/fetchComplianceEvents',
  async (
    { days, params }: { days?: number; params?: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await auditAPI.getComplianceEvents(days, params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || error.message || 'Failed to fetch compliance events'
      )
    }
  }
)

/**
 * Search audit logs
 */
export const searchAuditLogs = createAsyncThunk(
  'audit/searchAuditLogs',
  async (
    {
      query,
      searchType,
      params,
    }: { query: string; searchType?: string; params?: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await auditAPI.searchAuditLogs(
        query,
        searchType as any,
        params
      )
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || error.message || 'Failed to search audit logs'
      )
    }
  }
)

/* =====================================================
 * STATE INTERFACE
 * ===================================================== */

interface AuditState {
  logs: AuditLog[]
  currentLog: AuditLog | null
  stats: AuditStats | null
  userActivity: UserActivity | null
  securityEvents: AuditLog[]
  complianceEvents: AuditLog[]
  loading: boolean
  error: string | null
  filters: Record<string, any>
  pagination: {
    count: number
    next: string | null
    previous: string | null
  }
}

/* =====================================================
 * INITIAL STATE
 * ===================================================== */

const initialState: AuditState = {
  logs: [],
  currentLog: null,
  stats: null,
  userActivity: null,
  securityEvents: [],
  complianceEvents: [],
  loading: false,
  error: null,
  filters: {},
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
}

/* =====================================================
 * SLICE
 * ===================================================== */

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    /**
     * Set audit filters
     */
    setFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    /**
     * Clear all filters
     */
    clearFilters: (state) => {
      state.filters = {}
    },

    /**
     * Clear current log
     */
    clearCurrentLog: (state) => {
      state.currentLog = null
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null
    },

    /**
     * Clear all audit data
     */
    clearAll: () => initialState, // removed unused 'state' parameter to avoid TS6133

    /**
     * Update pagination
     */
    setPagination: (
      state,
      action: PayloadAction<{
        count: number
        next: string | null
        previous: string | null
      }>
    ) => {
      state.pagination = action.payload
    },
  },

  extraReducers: (builder) => {
    /* ---- Fetch Audit Logs ---- */
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
          previous: action.payload.previous,
        }
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.logs = []
      })

    /* ---- Fetch Single Audit Log ---- */
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
        state.currentLog = null
      })

    /* ---- Fetch Audit Stats ---- */
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
        state.stats = null
      })

    /* ---- Fetch User Activity ---- */
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
        state.userActivity = null
      })

    /* ---- Fetch Security Events ---- */
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
        state.securityEvents = []
      })

    /* ---- Fetch Compliance Events ---- */
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
        state.complianceEvents = []
      })

    /* ---- Search Audit Logs ---- */
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
          previous: action.payload.previous,
        }
      })
      .addCase(searchAuditLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.logs = []
      })
  },
})

/* =====================================================
 * SELECTORS
 * ===================================================== */

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

/* =====================================================
 * EXPORTS
 * ===================================================== */

export const {
  setFilters,
  clearFilters,
  clearCurrentLog,
  clearError,
  clearAll,
  setPagination,
} = auditSlice.actions

export default auditSlice.reducer