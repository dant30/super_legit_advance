// frontend/src/store/slices/notificationSlice.ts
// frontend/src/store/slices/notificationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { notificationsAPI } from '@/lib/api/notifications'
import { Notification, Template, SMSLog, Stats } from '@/lib/api/notifications'

export interface NotificationState {
  notifications: Notification[]
  templates: Template[]
  smsLogs: SMSLog[]
  stats: Stats | null
  smsStats: any
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
}

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

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getNotifications(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch notifications')
    }
  }
)

export const fetchStats = createAsyncThunk(
  'notifications/fetchStats',
  async (params?: { days?: number }, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getStats(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch stats')
    }
  }
)

export const fetchTemplates = createAsyncThunk(
  'notifications/fetchTemplates',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getTemplates(params)
      return response.results
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch templates')
    }
  }
)

export const fetchSMSLogs = createAsyncThunk(
  'notifications/fetchSMSLogs',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getSMSLogs(params)
      return response.results
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch SMS logs')
    }
  }
)

export const fetchSMSStats = createAsyncThunk(
  'notifications/fetchSMSStats',
  async (params?: any, { rejectWithValue }) => {
    try {
      const response = await notificationsAPI.getSMSStats(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch SMS stats')
    }
  }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      state.totalCount += 1
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id)
      if (index !== -1) {
        state.notifications[index] = action.payload
      }
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.status = 'READ'
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.results
        state.totalCount = action.payload.count
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch stats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })

      // Fetch templates
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templates = action.payload
      })

      // Fetch SMS logs
      .addCase(fetchSMSLogs.fulfilled, (state, action) => {
        state.smsLogs = action.payload
      })

      // Fetch SMS stats
      .addCase(fetchSMSStats.fulfilled, (state, action) => {
        state.smsStats = action.payload
      })
  },
})

export const {
  clearError,
  setCurrentPage,
  addNotification,
  updateNotification,
  markAsRead,
} = notificationSlice.actions

export default notificationSlice.reducer