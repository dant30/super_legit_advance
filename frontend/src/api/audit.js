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
  async searchAuditLogs(q, type = 'all', params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/search/`, {
        params: {
          q,
          type,
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
        responseType: format === 'json' ? 'json' : 'blob',
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
   * Get audit logs for specific user
   */
  async getAuditLogsByUser(userId, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          user_id: userId,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by user:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get audit logs for specific object
   */
  async getAuditLogsByObject(objectId, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          object_id: objectId,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by object:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get audit logs by IP address
   */
  async getAuditLogsByIp(ipAddress, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          ip_address: ipAddress,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by IP:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get audit logs by action
   */
  async getAuditLogsByAction(action, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          action,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by action:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get audit logs by severity
   */
  async getAuditLogsBySeverity(severity, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          severity,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by severity:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get audit logs by status
   */
  async getAuditLogsByStatus(status, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          status,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by status:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get audit logs by module
   */
  async getAuditLogsByModule(module, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          module,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by module:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get audit logs by compliance event flag
   */
  async getComplianceFlaggedLogs(isComplianceEvent = true, params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          is_compliance_event: isComplianceEvent,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching compliance flagged logs:', error)
      throw this.formatError(error)
    }
  }

  /**
   * Get audit logs by tags
   */
  async getAuditLogsByTags(tags = [], params = {}) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, {
        params: {
          tags,
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by tags:', error)
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
