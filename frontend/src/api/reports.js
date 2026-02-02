// frontend/src/lib/api/reports.ts

import axiosInstance from '@/lib/axios'
import {
  Report,
  ReportGenerationRequest,
  ReportGenerationResponse,
  ReportDetail,
  ReportHistory,
  ReportSchedule,
  ReportExportRequest,
} from '@/types/reports'

class ReportsAPI {
  private baseURL = '/reports'

  // ==================== LIST & RETRIEVE ====================

  async getReportTypes(): Promise<Report[]> {
    try {
      const response = await axiosInstance.get<Report[]>(`${this.baseURL}/`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getReports(params?: any): Promise<{ results: Report[]; count: number }> {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/`, { params })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ==================== REPORT GENERATION ====================

  async generateReport(
    data: ReportGenerationRequest
  ): Promise<ReportGenerationResponse> {
    try {
      const response = await axiosInstance.post<ReportGenerationResponse>(
        `${this.baseURL}/generate/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ==================== SPECIALIZED REPORTS ====================

  async getLoansReport(params?: any): Promise<ReportDetail> {
    try {
      const response = await axiosInstance.get<ReportDetail>(
        `${this.baseURL}/loans/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getPaymentsReport(params?: any): Promise<ReportDetail> {
    try {
      const response = await axiosInstance.get<ReportDetail>(
        `${this.baseURL}/payments/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getCustomersReport(params?: any): Promise<ReportDetail> {
    try {
      const response = await axiosInstance.get<ReportDetail>(
        `${this.baseURL}/customers/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getPerformanceReport(params?: any): Promise<ReportDetail> {
    try {
      const response = await axiosInstance.get<ReportDetail>(
        `${this.baseURL}/performance/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getDailySummary(params?: any): Promise<ReportDetail> {
    try {
      const response = await axiosInstance.get<ReportDetail>(
        `${this.baseURL}/daily-summary/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getMonthlySummary(params?: any): Promise<ReportDetail> {
    try {
      const response = await axiosInstance.get<ReportDetail>(
        `${this.baseURL}/monthly-summary/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getAuditReport(params?: any): Promise<ReportDetail> {
    try {
      const response = await axiosInstance.get<ReportDetail>(
        `${this.baseURL}/audit/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getCollectionReport(params?: any): Promise<ReportDetail> {
    try {
      const response = await axiosInstance.get<ReportDetail>(
        `${this.baseURL}/collection/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getRiskAssessment(params?: any): Promise<ReportDetail> {
    try {
      const response = await axiosInstance.get<ReportDetail>(
        `${this.baseURL}/risk-assessment/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ==================== EXPORTS ====================

  async exportToPDF(data: ReportExportRequest): Promise<Blob> {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/export/pdf/`,
        data,
        { responseType: 'blob' }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async exportToExcel(data: ReportExportRequest): Promise<Blob> {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/export/excel/`,
        data,
        { responseType: 'blob' }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ==================== HISTORY & MANAGEMENT ====================

  async getReportHistory(params?: any): Promise<ReportHistory[]> {
    try {
      const response = await axiosInstance.get<ReportHistory[]>(
        `${this.baseURL}/history/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async scheduleReport(data: {
    report_type: string
    schedule: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    format: 'pdf' | 'excel' | 'json'
    parameters?: any
  }): Promise<ReportSchedule> {
    try {
      const response = await axiosInstance.post<ReportSchedule>(
        `${this.baseURL}/schedule/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async downloadReport(reportId: number): Promise<Blob> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/download/${reportId}/`,
        { responseType: 'blob' }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Download file with automatic naming
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  /**
   * Generate filename with timestamp
   */
  generateFilename(reportName: string, format: 'pdf' | 'excel'): string {
    const timestamp = new Date().toISOString().split('T')[0]
    const extension = format === 'excel' ? 'xlsx' : 'pdf'
    return `${reportName}_${timestamp}.${extension}`
  }
}

export const reportsAPI = new ReportsAPI()