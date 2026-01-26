// frontend/src/lib/api/auth.ts
import axiosInstance from '@/lib/axios'
import type { User, LoginCredentials, AuthResponse, TokenRefreshResponse } from '@/types/auth'

class AuthAPI {
  // Endpoint base paths
  private readonly authBaseURL = '/auth'
  private readonly usersBaseURL = '/users'

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        `${this.usersBaseURL}/auth/login/`,
        credentials
      )
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      // OR better: use the correct endpoint from your backend
      const response = await axiosInstance.get<User>(
        `${this.usersBaseURL}/users/me/`
      )
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post(`${this.usersBaseURL}/auth/logout/`)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refresh: string): Promise<TokenRefreshResponse> {
    try {
      const response = await axiosInstance.post<TokenRefreshResponse>(
        `/auth/token/refresh/`,
        { refresh }
      )
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Verify token validity
   */
  async verifyToken(token: string): Promise<{ valid: boolean }> {
    try {
      await axiosInstance.post(`${this.authBaseURL}/token/verify/`, { token })
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
        `${this.usersBaseURL}/me/update/`,
        data
      )
      return response.data
    } catch (error: any) {
      throw error
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
        `${this.usersBaseURL}/change-password/`,
        { current_password, new_password, confirm_new_password }
      )
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ detail: string }> {
    try {
      const response = await axiosInstance.post<{ detail: string }>(
        `${this.authBaseURL}/password-reset/`,
        { email }
      )
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(
    uid: string,
    token: string,
    password: string,
    confirm_password: string
  ): Promise<{ detail: string }> {
    try {
      const response = await axiosInstance.post<{ detail: string }>(
        `${this.authBaseURL}/password-reset-confirm/`,
        { uid, token, password, confirm_password }
      )
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(uid: string, token: string): Promise<{ detail: string }> {
    try {
      const response = await axiosInstance.post<{ detail: string }>(
        `${this.authBaseURL}/verify-email/`,
        { uid, token }
      )
      return response.data
    } catch (error: any) {
      throw error
    }
  }
}

export const authAPI = new AuthAPI()