// frontend/src/store/slices/notificationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { notificationsAPI } from '@/lib/api/notifications'
import type {
  Notification,
  Template,
  SMSLog,
  NotificationStats,
  SMSStats,
  TemplateFilters,
} from '@/lib/api/notifications'

/* =====================================================
 * State Interface
 * ===================================================== */

export interface NotificationState {
  // Data
  notifications: Notification[]
  templates: Template[]
  smsLogs: SMSLog[]

  // Statistics
  stats: NotificationStats | null
  smsStats: SMSStats | null

  // Loading & Errors
  loading: boolean
  error: string | null

  // Pagination
  totalCount: number
  currentPage: number
}

/* =====================================================
 * Initial State
 * ===================================================== */

const initialState: NotificationState = {
  notifications: [],
  templates: [],
  smsLogs: [],
  stats: null,
  smsStats: null,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
}

/* =====================================================
 * Async Thunks
 * ===================================================== */

/**
 * Fetch notifications with optional filters
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params?: any, { rejectWithValue } = {} as any) => {
    try {
      const response = await notificationsAPI.getNotifications(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail ||
        error.message ||
        'Failed to fetch notifications'
      )
    }
  }
)

/**
 * Fetch notification statistics
 */
export const fetchStats = createAsyncThunk(
  'notifications/fetchStats',
  async (params?: { days?: number }, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getStats(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 
        error.message || 
        'Failed to fetch notification statistics'
      )
    }
  }
)

/**
 * Fetch notification templates
 */
export const fetchTemplates = createAsyncThunk(
  'notifications/fetchTemplates',
  async (params?: TemplateFilters, { rejectWithValue } = {} as any) => {
    try {
      const response = await notificationsAPI.getTemplates(params)
      return response.results
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail ||
        error.message ||
        'Failed to fetch templates'
      )
    }
  }
)

/**
 * Fetch SMS logs
 */
export const fetchSMSLogs = createAsyncThunk(
  'notifications/fetchSMSLogs',
  async (params?: any, { rejectWithValue } = {} as any) => {
    try {
      const response = await notificationsAPI.getSMSLogs(params)
      return response.results
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail ||
        error.message ||
        'Failed to fetch SMS logs'
      )
    }
  }
)

/**
 * Fetch SMS statistics
 */
export const fetchSMSStats = createAsyncThunk(
  'notifications/fetchSMSStats',
  async (params?: { days?: number }, { rejectWithValue } = {} as any) => {
    try {
      const response = await notificationsAPI.getSMSStats(params)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail ||
        error.message ||
        'Failed to fetch SMS statistics'
      )
    }
  }
)

/* =====================================================
 * Slice
 * ===================================================== */

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },

    // Set current page
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },

    // Add notification to top of list
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      state.totalCount += 1
    },

    // Update existing notification
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload.id)
      if (index !== -1) {
        state.notifications[index] = action.payload
      }
    },

    // Mark notification as read
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find((n) => n.id === action.payload)
      if (notification) {
        notification.status = 'READ'
        notification.read_at = new Date().toISOString()
      }
    },

    // Remove notification
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
      state.totalCount -= 1
    },

    // Reset state
    resetNotificationState: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.results || []
        state.totalCount = action.payload.count || 0
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch stats
      .addCase(fetchStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch templates
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false
        state.templates = action.payload || []
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch SMS logs
      .addCase(fetchSMSLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSMSLogs.fulfilled, (state, action) => {
        state.loading = false
        state.smsLogs = action.payload || []
      })
      .addCase(fetchSMSLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch SMS stats
      .addCase(fetchSMSStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSMSStats.fulfilled, (state, action) => {
        state.loading = false
        state.smsStats = action.payload
      })
      .addCase(fetchSMSStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

/* =====================================================
 * Actions
 * ===================================================== */

export const {
  clearError,
  setCurrentPage,
  addNotification,
  updateNotification,
  markAsRead,
  removeNotification,
  resetNotificationState,
} = notificationSlice.actions

/* =====================================================
 * Export
 * ===================================================== */

export default notificationSlice.reducer