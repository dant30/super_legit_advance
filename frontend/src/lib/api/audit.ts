// frontend/src/lib/api/audit.ts
import axiosInstance from '@/lib/axios'
import type { AuditLogListResponse, AuditStats, SecurityEvent, UserActivity, ComplianceEvent } from '@/types/audit'

class AuditAPI {
  private baseURL = '/api/audit'

  // Get all audit logs with filters
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
    tags?: string[]
    ordering?: string
    search?: string
    search_type?: string
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

  // Get specific audit log by ID
  async getAuditLog(id: string): Promise<any> {
    try {
      const response = await axiosInstance.get<any>(
        `${this.baseURL}/${id}/`
      )
      return response.data
    } catch (error) {
      console.error('Error fetching audit log:', error)
      throw error
    }
  }

  // Search audit logs
  async searchLogs(query: string, searchType: string = 'all', params?: any): Promise<AuditLogListResponse> {
    try {
      const response = await axiosInstance.get<AuditLogListResponse>(
        `${this.baseURL}/search/`,
        { 
          params: { 
            q: query,
            type: searchType,
            ...params 
          } 
        }
      )
      return response.data
    } catch (error) {
      console.error('Error searching audit logs:', error)
      throw error
    }
  }

  // Get audit statistics
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

  // Export audit logs
  async exportAuditLogs(
    format: 'excel' | 'csv' | 'json' = 'excel',
    params?: any
  ): Promise<Blob> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/export/`,
        { 
          params: { format, ...params },
          responseType: 'blob'
        }
      )
      return response.data
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      throw error
    }
  }

  // Get user activity
  async getUserActivity(userId: number, days: number = 30): Promise<UserActivity> {
    try {
      const response = await axiosInstance.get<UserActivity>(
        `${this.baseURL}/user/${userId}/activity/`,
        { params: { days } }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching user activity:', error)
      throw error
    }
  }

  // Get security events
  async getSecurityEvents(days: number = 30, params?: any): Promise<AuditLogListResponse> {
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

  // Get compliance events
  async getComplianceEvents(days: number = 90, params?: any): Promise<AuditLogListResponse> {
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

  // Download exported file
  downloadExportFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Generate filename for export
  generateExportFilename(format: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')
    return `audit_logs_${timestamp}.${format}`
  }
}

export const auditAPI = new AuditAPI()