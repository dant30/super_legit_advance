import axiosInstance from '@api/axios'
import { ENV } from '@utils/env'

const AUTH_ENDPOINTS = Object.freeze({
  login: '/users/auth/login/',
  logout: '/users/auth/logout/',
  currentUser: '/users/users/me/',
  refreshToken: '/auth/token/refresh/',
  verifyToken: '/auth/token/verify/',
  updateProfile: '/users/users/me/update/',
  changePassword: '/users/users/change-password/',
  requestPasswordReset: '/users/auth/password-reset/',
  confirmPasswordReset: '/users/auth/password-reset-confirm/',
  verifyEmail: '/users/auth/verify-email/',
  resendVerificationEmail: '/users/auth/resend-verification/',
})

function firstFieldError(payload) {
  if (!payload || typeof payload !== 'object') return null
  const firstValue = Object.values(payload)[0]
  if (Array.isArray(firstValue)) return firstValue[0] || null
  if (typeof firstValue === 'string') return firstValue
  return null
}

function resolveErrorMessage(error, fallback) {
  const payload = error?.response?.data

  if (payload?.detail) return payload.detail
  if (payload?.message) return payload.message
  if (payload?.non_field_errors) {
    return Array.isArray(payload.non_field_errors)
      ? payload.non_field_errors[0]
      : payload.non_field_errors
  }

  const fieldError = firstFieldError(payload)
  if (fieldError) return fieldError

  return error?.message || fallback
}

function normalizeCurrentUser(payload) {
  if (payload && payload.id) return payload
  if (payload?.data?.id) return payload.data
  if (payload?.user?.id) return payload.user
  if (payload?.data?.user?.id) return payload.data.user
  return null
}

class AuthAPI {
  async login(credentials = {}) {
    try {
      const payload = { password: credentials.password }

      if (credentials.email) {
        payload.email = String(credentials.email).trim().toLowerCase()
      } else if (credentials.phone_number) {
        payload.phone_number = credentials.phone_number
      } else if (credentials.username) {
        payload.username = credentials.username
      } else {
        throw new Error('Email, phone number, or username is required')
      }

      const response = await axiosInstance.post(AUTH_ENDPOINTS.login, payload)
      const data = response.data

      if (!data?.access || !data?.refresh) {
        throw new Error('Invalid login response structure')
      }

      return data
    } catch (error) {
      throw new Error(resolveErrorMessage(error, 'Login failed'))
    }
  }

  async getCurrentUser() {
    try {
      const response = await axiosInstance.get(AUTH_ENDPOINTS.currentUser)
      const user = normalizeCurrentUser(response.data)

      if (!user) {
        throw new Error('Invalid user response structure')
      }

      return user
    } catch (error) {
      throw new Error(resolveErrorMessage(error, 'Failed to fetch current user'))
    }
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await axiosInstance.post(AUTH_ENDPOINTS.logout, { refresh: refreshToken })
      }
    } catch (error) {
      if (ENV.ENVIRONMENT === 'development') {
        console.warn('Logout API call failed:', error)
      }
    }
  }

  async refreshToken(refresh) {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.refreshToken, { refresh })
      const data = response.data

      if (!data?.access) {
        throw new Error('Invalid refresh response structure')
      }

      return data
    } catch (error) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      throw new Error(resolveErrorMessage(error, 'Token refresh failed'))
    }
  }

  async verifyToken(token) {
    try {
      await axiosInstance.post(AUTH_ENDPOINTS.verifyToken, { token })
      return { valid: true }
    } catch {
      return { valid: false }
    }
  }

  async updateProfile(data) {
    try {
      const response = await axiosInstance.patch(AUTH_ENDPOINTS.updateProfile, data)
      const payload = response.data

      if (!payload?.id) {
        throw new Error('Invalid profile update response')
      }

      return payload
    } catch (error) {
      throw new Error(resolveErrorMessage(error, 'Failed to update profile'))
    }
  }

  async changePassword(current_password, new_password, confirm_new_password) {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.changePassword, {
        current_password,
        new_password,
        confirm_new_password,
      })
      const payload = response.data

      if (!payload?.detail) {
        throw new Error('Invalid password change response')
      }

      return payload
    } catch (error) {
      throw new Error(resolveErrorMessage(error, 'Failed to change password'))
    }
  }

  async requestPasswordReset(email) {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.requestPasswordReset, { email })
      if (!response.data) throw new Error('Invalid password reset response')
      return response.data
    } catch (error) {
      throw new Error(resolveErrorMessage(error, 'Failed to request password reset'))
    }
  }

  async confirmPasswordReset(uid, token, password, confirm_password) {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.confirmPasswordReset, {
        uid,
        token,
        // Use canonical backend fields and keep aliases for compatibility.
        new_password: password,
        confirm_new_password: confirm_password,
        password,
        confirm_password,
      })
      if (!response.data) throw new Error('Invalid password reset confirm response')
      return response.data
    } catch (error) {
      throw new Error(resolveErrorMessage(error, 'Failed to reset password'))
    }
  }

  async verifyEmail(uid, token) {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.verifyEmail, { uid, token })
      if (!response.data) throw new Error('Invalid email verification response')
      return response.data
    } catch (error) {
      throw new Error(resolveErrorMessage(error, 'Failed to verify email'))
    }
  }

  async resendVerificationEmail(email) {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.resendVerificationEmail, { email })
      return response.data
    } catch (error) {
      throw new Error(resolveErrorMessage(error, 'Failed to resend verification email'))
    }
  }
}

export { AUTH_ENDPOINTS }
export const authAPI = new AuthAPI()
export default authAPI
