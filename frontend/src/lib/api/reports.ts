// frontend/src/lib/api/reports.ts
import axiosInstance from '@/lib/axios'
import { ReportType, ReportFormat } from '@/types/reports'

export interface Report {
  id: number
  name: string
  description: string
  type: ReportType
  format: ReportFormat
  generated_by: number
  generated_by_name: string
  generated_at: string
  file_path?: string
  file_size?: number
  download_url?: string
}

export interface ReportListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Report[]
}

export interface ReportGeneratePayload {
  report_type: string
  format: 'pdf' | 'excel' | 'json'
  parameters?: {
    start_date?: string
    end_date?: string
    loan_status?: string
    loan_officer?: number
    [key: string]: any
  }
}

class ReportsAPI {
  private baseURL = '/reports'

  async getReports(params?: any): Promise<ReportListResponse> {
    try {
      const response = await axiosInstance.get<ReportListResponse>(
        `${this.baseURL}/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async generateReport(data: ReportGeneratePayload): Promise<Report> {
    try {
      const response = await axiosInstance.post<Report>(
        `${this.baseURL}/generate/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getLoansReport(params?: any): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/loans/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getPaymentsReport(params?: any): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/payments/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getCustomersReport(params?: any): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/customers/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getPerformanceReport(params?: any): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/performance/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getDailySummary(params?: any): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/daily-summary/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getMonthlySummary(params?: any): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/monthly-summary/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getAuditReport(params?: any): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/audit/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getCollectionReport(params?: any): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/collection/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getRiskAssessment(params?: any): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/risk-assessment/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async exportToPDF(data: any): Promise<Blob> {
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

  async exportToExcel(data: any): Promise<Blob> {
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

  async getReportHistory(params?: any): Promise<any> {
    try {
      const response = await axiosInstance.get(
        `${this.baseURL}/history/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async scheduleReport(data: any): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `${this.baseURL}/schedule/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export const reportsAPI = new ReportsAPI()