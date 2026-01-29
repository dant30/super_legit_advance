// frontend/src/lib/api/audit.ts
import axiosInstance from '@/lib/axios'
import type { 
  AuditLogListResponse, 
  AuditStats, 
  UserActivity,
  SecurityEvent,
  ComplianceEvent 
} from '@/types/audit'

class AuditAPI {
  private baseURL = '/api/audit'

  /**
   * Get all audit logs with comprehensive filtering
   */
  async getAuditLogs(params?: {
    page?: number
    page_size?: number
    action?: string
    severity?: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    status?: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'PARTIAL'
    model_name?: string
    user_id?: number
    start_date?: string
    end_date?: string
    success?: boolean
    high_severity?: boolean
    ip_address?: string
    object_id?: string
    tags?: string[]
    ordering?: string
    search?: string
  }): Promise<AuditLogListResponse> {
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
   * Get specific audit log by ID
   */
  async getAuditLog(id: string): Promise<any> {
    try {
      const response = await axiosInstance.get<any>(
        `${this.baseURL}/${id}/`
      )
      return response.data
    } catch (error) {
      console.error(`Error fetching audit log ${id}:`, error)
      throw error
    }
  }

  /**
   * Search audit logs with advanced filters
   */
  async searchLogs(
    query: string,
    searchType: 'user' | 'object' | 'ip' | 'changes' | 'all' = 'all',
    params?: any
  ): Promise<AuditLogListResponse> {
    try {
      const response = await axiosInstance.get<AuditLogListResponse>(
        `${this.baseURL}/search/`,
        {
          params: {
            q: query,
            type: searchType,
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
    return this.getAuditLogs({
      start_date: startDate,
      end_date: endDate,
      ...params,
    })
  }

  /**
   * Get audit logs for specific model
   */
  async getAuditLogsByModel(
    modelName: string,
    params?: any
  ): Promise<AuditLogListResponse> {
    return this.getAuditLogs({
      model_name: modelName,
      ...params,
    })
  }

  /**
   * Get failed actions
   */
  async getFailedActions(params?: any): Promise<AuditLogListResponse> {
    return this.getAuditLogs({
      status: 'FAILURE',
      ...params,
    })
  }

  /**
   * Get high severity events
   */
  async getHighSeverityEvents(params?: any): Promise<AuditLogListResponse> {
    return this.getAuditLogs({
      high_severity: true,
      ...params,
    })
  }
}

export const auditAPI = new AuditAPI()
export default auditAPI