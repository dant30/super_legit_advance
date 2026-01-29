// frontend/src/lib/api/auth.ts - OPTIMIZED FOR DJANGO BACKEND
import axiosInstance from '@/lib/axios'
import type { User, LoginCredentials, AuthResponse, TokenRefreshResponse } from '@/types/auth'

class AuthAPI {
  private readonly baseURL = '/users'
  private readonly tokenURL = '/auth/token'

  /**
   * Login with email or phone number
   * Supports multiple login identifiers (email, phone_number, username)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Prepare payload - support multiple identifier types
      const payload: Record<string, any> = {
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

      const response = await axiosInstance.post<AuthResponse>(
        `${this.baseURL}/auth/login/`,
        payload
      )

      if (!response.data.access || !response.data.refresh || !response.data.user) {
        throw new Error('Invalid login response structure')
      }

      return response.data
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        error.message ||
        'Login failed'

      throw new Error(errorMsg)
    }
  }

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await axiosInstance.get<User>(
        `${this.baseURL}/users/me/`
      )

      if (!response.data.id || !response.data.email) {
        throw new Error('Invalid user response structure')
      }

      return response.data
    } catch (error: any) {
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
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        await axiosInstance.post(`${this.baseURL}/auth/logout/`, {
          refresh: refreshToken,
        })
      }
    } catch (error) {
      // Log but don't throw - logout should succeed even if API call fails
      console.warn('Logout API call failed:', error)
    }
  }

  /**
   * Refresh access token using refresh token
   * Called by axios interceptor when 401 is received
   */
  async refreshToken(refresh: string): Promise<TokenRefreshResponse> {
    try {
      // Use SimpleJWT standard endpoint
      const response = await axiosInstance.post<TokenRefreshResponse>(
        `${this.tokenURL}/refresh/`,
        { refresh }
      )

      if (!response.data.access) {
        throw new Error('Invalid refresh response structure')
      }

      return response.data
    } catch (error: any) {
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
  async verifyToken(token: string): Promise<{ valid: boolean }> {
    try {
      await axiosInstance.post(`${this.tokenURL}/verify/`, { token })
      return { valid: true }
    } catch (error) {
      return { valid: false }
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await axiosInstance.patch<User>(
        `${this.baseURL}/users/me/update/`,
        data
      )

      if (!response.data.id) {
        throw new Error('Invalid profile update response')
      }

      return response.data
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).flat().join(', ') ||
        error.message ||
        'Failed to update profile'

      throw new Error(errorMsg)
    }
  }

  /**
   * Change password
   */
  async changePassword(
    current_password: string,
    new_password: string,
    confirm_new_password: string
  ): Promise<{ detail: string }> {
    try {
      const response = await axiosInstance.post<{ detail: string }>(
        `${this.baseURL}/users/change-password/`,
        { current_password, new_password, confirm_new_password }
      )

      if (!response.data.detail) {
        throw new Error('Invalid password change response')
      }

      return response.data
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).flat().join(', ') ||
        error.message ||
        'Failed to change password'

      throw new Error(errorMsg)
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ detail: string }> {
    try {
      const response = await axiosInstance.post<{ detail: string }>(
        `${this.baseURL}/auth/password-reset/`,
        { email }
      )

      if (!response.data.detail) {
        throw new Error('Invalid password reset response')
      }

      return response.data
    } catch (error: any) {
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
  async confirmPasswordReset(
    uid: string,
    token: string,
    password: string,
    confirm_password: string
  ): Promise<{ detail: string }> {
    try {
      const response = await axiosInstance.post<{ detail: string }>(
        `${this.baseURL}/auth/password-reset-confirm/`,
        { uid, token, password, confirm_password }
      )

      if (!response.data.detail) {
        throw new Error('Invalid password reset confirm response')
      }

      return response.data
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).flat().join(', ') ||
        error.message ||
        'Failed to reset password'

      throw new Error(errorMsg)
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(uid: string, token: string): Promise<{ detail: string }> {
    try {
      const response = await axiosInstance.post<{ detail: string }>(
        `${this.baseURL}/auth/verify-email/`,
        { uid, token }
      )

      if (!response.data.detail) {
        throw new Error('Invalid email verification response')
      }

      return response.data
    } catch (error: any) {
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
  async resendVerificationEmail(email: string): Promise<{ detail: string }> {
    try {
      const response = await axiosInstance.post<{ detail: string }>(
        `${this.baseURL}/auth/resend-verification/`,
        { email }
      )

      return response.data
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        'Failed to resend verification email'

      throw new Error(errorMsg)
    }
  }

  /**
   * Two-factor authentication setup
   */
  async setupTwoFactor(method: 'sms' | 'email' | 'app'): Promise<any> {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/users/2fa/setup/`, {
        method,
      })
      return response.data
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        'Failed to setup 2FA'

      throw new Error(errorMsg)
    }
  }

  /**
   * Verify two-factor authentication
   */
  async verifyTwoFactor(code: string): Promise<{ detail: string }> {
    try {
      const response = await axiosInstance.post<{ detail: string }>(
        `${this.baseURL}/users/2fa/verify/`,
        { code }
      )

      return response.data
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        'Invalid 2FA code'

      throw new Error(errorMsg)
    }
  }
}

export const authAPI = new AuthAPI()