// frontend/src/store/slices/authSlice.ts
// frontend/src/store/slices/authSlice.ts - UPDATED
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '@/lib/api/auth'
import axiosInstance from '@/lib/axios'

export interface AuthState {
  user: any | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
}

/**
 * Check if user is authenticated
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token')

      if (!token) {
        return null
      }

      // Verify token and fetch user
      const user = await authAPI.getCurrentUser()
      return user
    } catch (error: any) {
      // Clear invalid tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      delete axiosInstance.defaults.headers.common.Authorization

      return rejectWithValue(
        error.response?.data?.detail || 'Authentication check failed'
      )
    }
  }
)

/**
 * Login user
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await authAPI.login({
        email: credentials.email?.trim().toLowerCase(),
        password: credentials.password,
      })

      const { access, refresh, user } = response

      // Persist tokens
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      // Set default auth header
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`

      return { access, refresh, user }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.message ||
        'Login failed'

      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Logout user
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with local logout even if API fails
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      delete axiosInstance.defaults.headers.common.Authorization
    }

    return null
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    reset: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.user = action.payload
          state.isAuthenticated = true
        }
        state.error = null
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.error = null // Don't show error on page load
      })

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.error = action.payload as string
      })

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
  },
})

export const { setUser, clearError, reset } = authSlice.actions
export default authSlice.reducer