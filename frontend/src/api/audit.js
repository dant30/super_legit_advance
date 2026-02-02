// frontend/src/api/audit.js
import axiosInstance from './axios'

class AuditAPI {
  constructor() {
    this.baseURL = '/audit'
  }

  /**
   * Get paginated audit logs
   */
  async getAuditLogs(params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get single audit log by ID
   */
  async getAuditLog(id) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Error fetching audit log ${id}:`, error)
      throw this.formatError(error)
    }
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(query, searchType = 'all', params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/search/`, {
        params: {
          query,
          search_type: searchType,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error searching audit logs:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get audit statistics and analytics
   */
  async getAuditStats(days = 30) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/stats/`, {
        params: { days },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching audit stats:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Export audit logs to various formats
   */
  async exportAuditLogs(format = 'excel', params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/export/`, {
        params: { format, ...params },
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get user activity details
   */
  async getUserActivity(userId, days = 30) {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/user/${userId}/activity/`,
        { params: { days } }
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching user activity for user ${userId}:`, error)
      throw this.formatError(error)
    }
  }

  /**
   * Get security events (high severity failures)
   */
  async getSecurityEvents(days = 30, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/security/`, {
        params: { days, ...params },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching security events:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get compliance events
   */
  async getComplianceEvents(days = 90, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/compliance/`, {
        params: { days, ...params },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching compliance events:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get audit logs by date range
   */
  async getAuditLogsByDateRange(startDate, endDate, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          start_date: startDate,
          end_date: endDate,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by date range:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get audit logs for specific model
   */
  async getAuditLogsByModel(modelName, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          model_name: modelName,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by model:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get failed actions only
   */
  async getFailedActions(params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          status: 'FAILURE',
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching failed actions:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get high severity events
   */
  async getHighSeverityEvents(params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          high_severity: true,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching high severity events:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Download exported file to browser
   */
  downloadExportFile(blob, filename) {
    try {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Generate filename for export with timestamp
   */
  generateExportFilename(format) {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, '-')
    return `audit_logs_${timestamp}.${format}`
  }

  /**
   * Format API errors
   */
  formatError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message:
          error.response.data?.detail ||
          error.response.data?.message ||
          'An error occurred',
        details: error.response.data,
        status: error.response.status,
      }
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'No response from server. Please check your connection.',
        details: null,
        status: null,
      }
    } else {
      // Error in setting up request
      return {
        message: error.message || 'An unexpected error occurred',
        details: null,
        status: null,
      }
    }
  }
}

export const auditAPI = new AuditAPI()
export default auditAPI