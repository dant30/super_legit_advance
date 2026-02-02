// frontend/src/api/auth.js - COMPREHENSIVE AUTH API INTERACTIONS
import axiosInstance from './axios'
import { ENV } from '@utils/env'

class AuthAPI {
  constructor() {
    this.baseURL = '/users'
  }

  /**
   * Login with email, phone number, or username
   */
  async login(credentials) {
    try {
      // Prepare payload - support multiple identifier types
      const payload = {
        password: credentials.password,
      }

      // Add one of: email, phone_number, or username
      if (credentials.email) {
        payload.email = credentials.email.trim().toLowerCase()
      } else if (credentials.phone_number) {
        payload.phone_number = credentials.phone_number
      } else if (credentials.username) {
        payload.username = credentials.username
      } else {
        throw new Error('Email, phone number, or username is required')
      }

      const response = await axiosInstance.post(`${this.baseURL}/auth/login/`, payload)

      // Check response structure
      if (!response.data || !response.data.access || !response.data.refresh) {
        throw new Error('Invalid login response structure')
      }

      return response.data
    } catch (error) {
      // Extract error message from response
      let errorMsg = 'Login failed'
      
      if (error.response) {
        if (error.response.data?.detail) {
          errorMsg = error.response.data.detail
        } else if (error.response.data?.non_field_errors) {
          errorMsg = Array.isArray(error.response.data.non_field_errors) 
            ? error.response.data.non_field_errors[0]
            : error.response.data.non_field_errors
        } else if (typeof error.response.data === 'object') {
          // Extract first error message from validation errors
          const firstError = Object.values(error.response.data)[0]
          if (Array.isArray(firstError)) {
            errorMsg = firstError[0]
          } else if (typeof firstError === 'string') {
            errorMsg = firstError
          }
        }
      } else if (error.message) {
        errorMsg = error.message
      }

      throw new Error(errorMsg)
    }
  }

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser() {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/users/me/`)

      if (!response.data || !response.data.id) {
        throw new Error('Invalid user response structure')
      }

      return response.data
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        'Failed to fetch current user'

      throw new Error(errorMsg)
    }
  }

  /**
   * Logout user - blacklist refresh token
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        await axiosInstance.post(`${this.baseURL}/auth/logout/`, {
          refresh: refreshToken,
        })
      }
    } catch (error) {
      // Log but don't throw - logout should succeed even if API call fails
      if (ENV.ENVIRONMENT === 'development') {
        console.warn('Logout API call failed:', error)
      }
    }
  }

  /**
   * Refresh access token using refresh token
   * Note: This is handled by axios interceptor
   */
  async refreshToken(refresh) {
    try {
      const response = await axiosInstance.post('/auth/token/refresh/', { refresh })

      if (!response.data.access) {
        throw new Error('Invalid refresh response structure')
      }

      return response.data
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        'Token refresh failed'

      // Clear invalid tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')

      throw new Error(errorMsg)
    }
  }

  /**
   * Verify token validity
   */
  async verifyToken(token) {
    try {
      await axiosInstance.post('/auth/token/verify/', { token })
      return { valid: true }
    } catch (error) {
      return { valid: false }
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data) {
    try {
      const response = await axiosInstance.patch(`${this.baseURL}/users/me/update/`, data)

      if (!response.data || !response.data.id) {
        throw new Error('Invalid profile update response')
      }

      return response.data
    } catch (error) {
      let errorMsg = 'Failed to update profile'
      
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail
      } else if (error.response?.data) {
        // Flatten validation errors
        const errors = Object.values(error.response.data).flat()
        if (errors.length > 0) {
          errorMsg = errors.join(', ')
        }
      }

      throw new Error(errorMsg)
    }
  }

  /**
   * Change password
   */
  async changePassword(current_password, new_password, confirm_new_password) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/users/change-password/`, {
        current_password,
        new_password,
        confirm_new_password,
      })

      if (!response.data || !response.data.detail) {
        throw new Error('Invalid password change response')
      }

      return response.data
    } catch (error) {
      let errorMsg = 'Failed to change password'
      
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail
      } else if (error.response?.data) {
        const errors = Object.values(error.response.data).flat()
        if (errors.length > 0) {
          errorMsg = errors.join(', ')
        }
      }

      throw new Error(errorMsg)
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/auth/password-reset/`, { email })

      if (!response.data) {
        throw new Error('Invalid password reset response')
      }

      return response.data
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        'Failed to request password reset'

      throw new Error(errorMsg)
    }
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(uid, token, password, confirm_password) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/auth/password-reset-confirm/`, {
        uid,
        token,
        password,
        confirm_password,
      })

      if (!response.data) {
        throw new Error('Invalid password reset confirm response')
      }

      return response.data
    } catch (error) {
      let errorMsg = 'Failed to reset password'
      
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail
      } else if (error.response?.data) {
        const errors = Object.values(error.response.data).flat()
        if (errors.length > 0) {
          errorMsg = errors.join(', ')
        }
      }

      throw new Error(errorMsg)
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(uid, token) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/auth/verify-email/`, { uid, token })

      if (!response.data) {
        throw new Error('Invalid email verification response')
      }

      return response.data
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        'Failed to verify email'

      throw new Error(errorMsg)
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/auth/resend-verification/`, { email })
      return response.data
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        'Failed to resend verification email'

      throw new Error(errorMsg)
    }
  }
}

// Create singleton instance
export const authAPI = new AuthAPI()
export default authAPI