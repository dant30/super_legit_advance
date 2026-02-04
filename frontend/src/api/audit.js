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
   * Export audit logs to various formats.
   * Returns blob for binary formats (excel/csv) and JSON for json.
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

  // Convenience list/filter helpers (delegating to list endpoint)
  async getAuditLogsByDateRange(startDate, endDate, params = {}) {
    return this.getAuditLogs({ start_date: startDate, end_date: endDate, ...params })
  }

  async getAuditLogsByModel(modelName, params = {}) {
    return this.getAuditLogs({ model_name: modelName, ...params })
  }

  async getAuditLogsByUser(userId, params = {}) {
    return this.getAuditLogs({ user_id: userId, ...params })
  }

  async getAuditLogsByObject(objectId, params = {}) {
    return this.getAuditLogs({ object_id: objectId, ...params })
  }

  async getAuditLogsByIp(ipAddress, params = {}) {
    return this.getAuditLogs({ ip_address: ipAddress, ...params })
  }

  async getAuditLogsByAction(action, params = {}) {
    return this.getAuditLogs({ action, ...params })
  }

  async getAuditLogsBySeverity(severity, params = {}) {
    return this.getAuditLogs({ severity, ...params })
  }

  async getAuditLogsByStatus(status, params = {}) {
    return this.getAuditLogs({ status, ...params })
  }

  async getAuditLogsByModule(module, params = {}) {
    return this.getAuditLogs({ module, ...params })
  }

  async getComplianceFlaggedLogs(isComplianceEvent = true, params = {}) {
    return this.getAuditLogs({ is_compliance_event: isComplianceEvent, ...params })
  }

  async getAuditLogsByTags(tags = [], params = {}) {
    return this.getAuditLogs({ tags, ...params })
  }

  async getFailedActions(params = {}) {
    return this.getAuditLogs({ status: 'FAILURE', ...params })
  }

  async getHighSeverityEvents(params = {}) {
    return this.getAuditLogs({ high_severity: true, ...params })
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
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    return `audit_logs_${timestamp}.${format}`
  }

  /**
   * Format API errors
   */
  formatError(error) {
    if (error.response) {
      return {
        message: error.response.data?.detail || error.response.data?.message || 'An error occurred',
        details: error.response.data,
        status: error.response.status,
      }
    } else if (error.request) {
      return {
        message: 'No response from server. Please check your connection.',
        details: null,
        status: null,
      }
    } else {
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
