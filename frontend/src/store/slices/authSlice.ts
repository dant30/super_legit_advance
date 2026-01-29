// frontend/src/store/slices/authSlice.ts - OPTIMIZED FOR DJANGO BACKEND
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authAPI } from '@/lib/api/auth'
import axiosInstance from '@/lib/axios'
import type { User, LoginCredentials, AuthResponse, PasswordChange } from '@/types/auth'

// ============================================================================
// STATE INTERFACE
// ============================================================================
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  successMessage: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check persisted auth
  isRefreshing: false,
  error: null,
  successMessage: null,
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Check if user is authenticated on app load
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token')

      if (!token) {
        return null
      }

      // Verify token is still valid and fetch user
      const user = await authAPI.getCurrentUser()
      return user
    } catch (error: any) {
      // Clear invalid tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      delete axiosInstance.defaults.headers.common.Authorization

      return rejectWithValue(
        error.message || 'Authentication check failed'
      )
    }
  }
)

/**
 * Login user with email, phone, or username
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Normalize email if provided
      const normalizedCredentials = {
        ...credentials,
        email: credentials.email?.trim().toLowerCase(),
      }

      const response = await authAPI.login(normalizedCredentials)

      const { access, refresh, user } = response

      // Persist tokens to localStorage
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(user))

      // Set default auth header
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`

      return user
    } catch (error: any) {
      // Clear any partial tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')

      return rejectWithValue(error.message || 'Login failed')
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

/**
 * Update user profile
 */
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const updatedUser = await authAPI.updateProfile(data)

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))

      return updatedUser
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile')
    }
  }
)

/**
 * Change password
 */
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    data: {
      current_password: string
      new_password: string
      confirm_new_password: string
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.changePassword(
        data.current_password,
        data.new_password,
        data.confirm_new_password
      )

      return response.detail
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change password')
    }
  }
)

/**
 * Request password reset
 */
export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestPasswordReset(email)
      return response.detail
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to request password reset')
    }
  }
)

/**
 * Confirm password reset
 */
export const confirmPasswordReset = createAsyncThunk(
  'auth/confirmPasswordReset',
  async (
    data: {
      uid: string
      token: string
      password: string
      confirm_password: string
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await authAPI.confirmPasswordReset(
        data.uid,
        data.token,
        data.password,
        data.confirm_password
      )

      return response.detail
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reset password')
    }
  }
)

/**
 * Verify email
 */
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (data: { uid: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmail(data.uid, data.token)
      return response.detail
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify email')
    }
  }
)

// ============================================================================
// SLICE
// ============================================================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set user directly (for manual updates)
     */
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload

      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload))
      } else {
        localStorage.removeItem('user')
      }
    },

    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null
    },

    /**
     * Clear success message
     */
    clearSuccessMessage: (state) => {
      state.successMessage = null
    },

    /**
     * Set refreshing state
     */
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload
    },

    /**
     * Reset auth state
     */
    resetAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.isRefreshing = false
      state.error = null
      state.successMessage = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      delete axiosInstance.defaults.headers.common.Authorization
    },
  },

  extraReducers: (builder) => {
    // ========================================================================
    // Check Auth
    // ========================================================================
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false

        if (action.payload) {
          state.user = action.payload
          state.isAuthenticated = true
          state.error = null
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        // Don't set error on page load - too noisy
        state.error = null
      })

    // ========================================================================
    // Login
    // ========================================================================
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
        state.successMessage = 'Login successful'
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload as string
        state.successMessage = null
      })

    // ========================================================================
    // Logout
    // ========================================================================
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
        state.successMessage = 'Logout successful'
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false
        // Still clear auth state on logout error
        state.user = null
        state.isAuthenticated = false
      })

    // ========================================================================
    // Update Profile
    // ========================================================================
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.successMessage = 'Profile updated successfully'
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.successMessage = null
      })

    // ========================================================================
    // Change Password
    // ========================================================================
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.successMessage = action.payload || 'Password changed successfully'
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.successMessage = null
      })

    // ========================================================================
    // Request Password Reset
    // ========================================================================
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.isLoading = false
        state.successMessage =
          action.payload || 'Password reset link sent to your email'
        state.error = null
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.successMessage = null
      })

    // ========================================================================
    // Confirm Password Reset
    // ========================================================================
    builder
      .addCase(confirmPasswordReset.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(confirmPasswordReset.fulfilled, (state, action) => {
        state.isLoading = false
        state.successMessage = action.payload || 'Password reset successfully'
        state.error = null
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.successMessage = null
      })

    // ========================================================================
    // Verify Email
    // ========================================================================
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false
        state.successMessage = action.payload || 'Email verified successfully'

        // Update user verification status if they exist
        if (state.user) {
          state.user.email_verified = true
        }

        state.error = null
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.successMessage = null
      })
  },
})

// ============================================================================
// EXPORTS
// ============================================================================
export const {
  setUser,
  clearError,
  clearSuccessMessage,
  setRefreshing,
  resetAuth,
} = authSlice.actions

export default authSlice.reducer