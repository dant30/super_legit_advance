// frontend/src/lib/api/reports.js

import axios from './axios'

class ReportsAPI {
  constructor() {
    this.baseURL = '/reports'
  }

  // ==================== LIST & RETRIEVE ====================

  async getReportTypes() {
    try {
      const response = await axios.get(`${this.baseURL}/`)
      return response.data
    } catch (error) {
      console.error('Error fetching report types:', error)
      throw error
    }
  }

  async getReports(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching reports:', error)
      throw error
    }
  }

  // ==================== REPORT GENERATION ====================

  async generateReport(data) {
    try {
      const response = await axios.post(`${this.baseURL}/generate/`, data)
      return response.data
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  }

  // ==================== SPECIALIZED REPORTS ====================

  async getLoansReport(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/loans/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching loans report:', error)
      throw error
    }
  }

  async getPaymentsReport(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/payments/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching payments report:', error)
      throw error
    }
  }

  async getCustomersReport(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/customers/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching customers report:', error)
      throw error
    }
  }

  async getPerformanceReport(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/performance/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching performance report:', error)
      throw error
    }
  }

  async getDailySummary(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/daily-summary/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching daily summary:', error)
      throw error
    }
  }

  async getMonthlySummary(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/monthly-summary/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching monthly summary:', error)
      throw error
    }
  }

  async getAuditReport(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/audit/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching audit report:', error)
      throw error
    }
  }

  async getCollectionReport(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/collection/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching collection report:', error)
      throw error
    }
  }

  async getRiskAssessment(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/risk-assessment/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching risk assessment:', error)
      throw error
    }
  }

  // ==================== EXPORTS ====================

  async exportToPDF(data) {
    try {
      const response = await axios.post(`${this.baseURL}/export/pdf/`, data, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      throw error
    }
  }

  async exportToExcel(data) {
    try {
      const response = await axios.post(`${this.baseURL}/export/excel/`, data, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      throw error
    }
  }

  // ==================== HISTORY & MANAGEMENT ====================

  async getReportHistory(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/history/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching report history:', error)
      throw error
    }
  }

  async scheduleReport(data) {
    try {
      const response = await axios.post(`${this.baseURL}/schedule/`, data)
      return response.data
    } catch (error) {
      console.error('Error scheduling report:', error)
      throw error
    }
  }

  async downloadReport(reportId) {
    try {
      const response = await axios.get(`${this.baseURL}/download/${reportId}/`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error downloading report:', error)
      throw error
    }
  }

  async deleteReport(reportId) {
    try {
      const response = await axios.delete(`${this.baseURL}/${reportId}/`)
      return response.data
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    }
  }

  async getSchedules() {
    try {
      const response = await axios.get(`${this.baseURL}/schedules/`)
      return response.data
    } catch (error) {
      console.error('Error fetching schedules:', error)
      throw error
    }
  }

  async updateSchedule(scheduleId, data) {
    try {
      const response = await axios.put(`${this.baseURL}/schedules/${scheduleId}/`, data)
      return response.data
    } catch (error) {
      console.error('Error updating schedule:', error)
      throw error
    }
  }

  async deleteSchedule(scheduleId) {
    try {
      const response = await axios.delete(`${this.baseURL}/schedules/${scheduleId}/`)
      return response.data
    } catch (error) {
      console.error('Error deleting schedule:', error)
      throw error
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Download file with automatic naming
   */
  downloadFile(blob, filename) {
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
  generateFilename(reportName, format = 'pdf') {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const extension = format === 'excel' ? 'xlsx' : 'pdf'
    return `${reportName}_${timestamp}.${extension}`
  }

  /**
   * Format date for API parameters
   */
  formatDate(date) {
    return date ? new Date(date).toISOString().split('T')[0] : null
  }

  /**
   * Build query parameters from filters
   */
  buildParams(filters = {}) {
    const params = { ...filters }
    
    // Format date fields if present
    if (params.start_date) {
      params.start_date = this.formatDate(params.start_date)
    }
    if (params.end_date) {
      params.end_date = this.formatDate(params.end_date)
    }
    
    // Remove undefined or null values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        delete params[key]
      }
    })
    
    return params
  }
}

export const reportsAPI = new ReportsAPI()
export default reportsAPI