// frontend/src/api/axios.js
import axios from 'axios'
import { ENV } from '@utils/env'

// Normalize API URL (remove trailing slash)
const API_URL = ENV.API_URL?.replace(/\/$/, '') || 'http://localhost:8000/api'
const API_TIMEOUT = ENV.API_TIMEOUT || 30000

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor - Add auth token
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Response Interceptor - Handle 401 and refresh token
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't log in production
    if (ENV.ENVIRONMENT === 'development') {
      console.error('[Axios Error]', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
        message: error.message,
      })
    }

    const originalRequest = error.config

    // Only refresh if 401 and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/auth/token/') &&
      !originalRequest.url.includes('/auth/login/')
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // Use SimpleJWT refresh endpoint
        const refreshResponse = await axios.post(
          `${API_URL}/auth/token/refresh/`,
          { refresh: refreshToken }
        )

        const { access } = refreshResponse.data

        // Update stored token
        localStorage.setItem('access_token', access)

        // Update default header
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`

        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Token refresh failed - clear auth and redirect
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        delete axiosInstance.defaults.headers.common.Authorization

        // Only redirect if not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    // Handle specific error statuses
    if (error.response?.status === 403) {
      // Forbidden - redirect to unauthorized page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/unauthorized')) {
        window.location.href = '/unauthorized'
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance