import axios from 'axios'
import { ENV } from '@utils/env'

const API_URL = ENV.API_URL?.replace(/\/$/, '') || 'http://localhost:8000/api'
const API_TIMEOUT = ENV.API_TIMEOUT || 30000

function generateCorrelationId(prefix = 'web') {
  if (globalThis?.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.headers) {
      config.headers['X-Correlation-ID'] = generateCorrelationId()
    }

    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
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

    const originalRequest = error?.config

    if (
      error?.response?.status === 401 &&
      originalRequest &&
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

        const refreshResponse = await axios.post(
          `${API_URL}/auth/token/refresh/`,
          { refresh: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Correlation-ID': generateCorrelationId('web-refresh'),
            },
          }
        )

        const nextAccess = refreshResponse?.data?.access
        if (!nextAccess) {
          throw new Error('No access token in refresh response')
        }

        localStorage.setItem('access_token', nextAccess)
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${nextAccess}`

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${nextAccess}`
        }

        return axiosInstance(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        delete axiosInstance.defaults.headers.common.Authorization

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    if (error?.response?.status === 403) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/unauthorized')) {
        window.location.href = '/unauthorized'
      }
    }

    return Promise.reject(error)
  }
)

export const api = axiosInstance
export default axiosInstance
