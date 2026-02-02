// frontend/src/lib/api/audit.ts
import axiosInstance from '@/lib/axios'
import type { 
  AuditLogListResponse, 
  AuditStats, 
  UserActivity,
} from '@/types/audit'

class AuditAPI {
  private readonly baseURL = '/audit'

  // ==================== AUDIT LOGS ====================

  /**
   * Get paginated audit logs
   */
  async getAuditLogs(params?: any): Promise<AuditLogListResponse> {
    try {
      const response = await axiosInstance.get<AuditLogListResponse>(
        `${this.baseURL}/`,
        { params }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw error
    }
  }

  /**
   * Get single audit log by ID
   */
  async getAuditLog(id: string): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/${id}/`
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching audit log ${id}:`, error)
      throw error
    }
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(
    query: string,
    searchType: 'user' | 'object' | 'ip' | 'changes' | 'all' = 'all',
    params?: any
  ): Promise<AuditLogListResponse> {
    try {
      const response = await axiosInstance.get<AuditLogListResponse>(
        `${this.baseURL}/search/`,
        {
          params: {
            query,
            search_type: searchType,
            ...params,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error searching audit logs:', error)
      throw error
    }
  }

  /**
   * Get audit statistics and analytics
   */
  async getAuditStats(days: number = 30): Promise<AuditStats> {
    try {
      const response = await axiosInstance.get<AuditStats>(
        `${this.baseURL}/stats/`,
        { params: { days } }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching audit stats:', error)
      throw error
    }
  }

  /**
   * Export audit logs to various formats
   */
  async exportAuditLogs(
    format: 'excel' | 'csv' | 'json' = 'excel',
    params?: any
  ): Promise<Blob> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/export/`,
        {
          params: { format, ...params },
          responseType: 'blob',
        }
      )
      return response.data
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      throw error
    }
  }

  /**
   * Get user activity details
   */
  async getUserActivity(userId: number, days: number = 30): Promise<UserActivity> {
    try {
      const response = await axiosInstance.get<UserActivity>(
        `${this.baseURL}/user/${userId}/activity/`,
        { params: { days } }
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching user activity for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get security events (high severity failures)
   */
  async getSecurityEvents(
    days: number = 30,
    params?: any
  ): Promise<AuditLogListResponse> {
    try {
      const response = await axiosInstance.get<AuditLogListResponse>(
        `${this.baseURL}/security/`,
        { params: { days, ...params } }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching security events:', error)
      throw error
    }
  }

  /**
   * Get compliance events
   */
  async getComplianceEvents(
    days: number = 90,
    params?: any
  ): Promise<AuditLogListResponse> {
    try {
      const response = await axiosInstance.get<AuditLogListResponse>(
        `${this.baseURL}/compliance/`,
        { params: { days, ...params } }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching compliance events:', error)
      throw error
    }
  }

  /**
   * Download exported file to browser
   */
  downloadExportFile(blob: Blob, filename: string): void {
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
      throw error
    }
  }

  /**
   * Generate filename for export with timestamp
   */
  generateExportFilename(format: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    return `audit_logs_${timestamp}.${format}`
  }

  /**
   * Get audit logs by date range
   */
  async getAuditLogsByDateRange(
    startDate: string,
    endDate: string,
    params?: any
  ): Promise<AuditLogListResponse> {
    try {
      const response = await axiosInstance.get<AuditLogListResponse>(
        `${this.baseURL}/`,
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            ...params,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by date range:', error)
      throw error
    }
  }

  /**
   * Get audit logs for specific model
   */
  async getAuditLogsByModel(
    modelName: string,
    params?: any
  ): Promise<AuditLogListResponse> {
    try {
      const response = await axiosInstance.get<AuditLogListResponse>(
        `${this.baseURL}/`,
        {
          params: {
            model_name: modelName,
            ...params,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs by model:', error)
      throw error
    }
  }

  /**
   * Get failed actions only
   */
  async getFailedActions(params?: any): Promise<AuditLogListResponse> {
    try {
      const response = await axiosInstance.get<AuditLogListResponse>(
        `${this.baseURL}/`,
        {
          params: {
            status: 'FAILURE',
            ...params,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching failed actions:', error)
      throw error
    }
  }
}

export const auditAPI = new AuditAPI()
export default auditAPI