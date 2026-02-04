// frontend/src/lib/api/reports.js

import axios from './axios'

class ReportsAPI {
  constructor() {
    this.baseURL = '/reports'
  }

  // List available report types
  async getReportTypes() {
    const resp = await axios.get(`${this.baseURL}/`)
    return resp.data
  }

  // Generic list / retrieve
  async getReports(params = {}) {
    const resp = await axios.get(`${this.baseURL}/`, { params })
    return resp.data
  }

  // Generate report: backend returns JSON for 'json' and blob for pdf/excel
  async generateReport({ report_type, format = 'json', parameters = {} } = {}) {
    const cfg = {}
    if (format !== 'json') cfg.responseType = 'blob'
    const resp = await axios.post(`${this.baseURL}/generate/`, { report_type, format, parameters }, cfg)
    return resp.data
  }

  // Specialized report endpoints (GET)
  async getLoansReport(params = {}) {
    const resp = await axios.get(`${this.baseURL}/loans/`, { params })
    return resp.data
  }

  async getPaymentsReport(params = {}) {
    const resp = await axios.get(`${this.baseURL}/payments/`, { params })
    return resp.data
  }

  async getCustomersReport(params = {}) {
    const resp = await axios.get(`${this.baseURL}/customers/`, { params })
    return resp.data
  }

  async getPerformanceReport(params = {}) {
    const resp = await axios.get(`${this.baseURL}/performance/`, { params })
    return resp.data
  }

  async getDailySummary(params = {}) {
    const resp = await axios.get(`${this.baseURL}/daily-summary/`, { params })
    return resp.data
  }

  async getMonthlySummary(params = {}) {
    const resp = await axios.get(`${this.baseURL}/monthly-summary/`, { params })
    return resp.data
  }

  async getAuditReport(params = {}) {
    const resp = await axios.get(`${this.baseURL}/audit/`, { params })
    return resp.data
  }

  async getCollectionReport(params = {}) {
    const resp = await axios.get(`${this.baseURL}/collection/`, { params })
    return resp.data
  }

  async getRiskAssessment(params = {}) {
    const resp = await axios.get(`${this.baseURL}/risk-assessment/`, { params })
    return resp.data
  }

  // Export endpoints (POST -> blob)
  async exportToPDF(payload = {}) {
    const resp = await axios.post(`${this.baseURL}/export/pdf/`, payload, { responseType: 'blob' })
    return resp.data
  }

  async exportToExcel(payload = {}) {
    const resp = await axios.post(`${this.baseURL}/export/excel/`, payload, { responseType: 'blob' })
    return resp.data
  }

  // History / schedule / download
  async getReportHistory(params = {}) {
    const resp = await axios.get(`${this.baseURL}/history/`, { params })
    return resp.data
  }

  async scheduleReport(data = {}) {
    const resp = await axios.post(`${this.baseURL}/schedule/`, data)
    return resp.data
  }

  async downloadReport(reportId) {
    const resp = await axios.get(`${this.baseURL}/download/${reportId}/`, { responseType: 'blob' })
    return resp.data
  }

  async deleteReport(reportId) {
    const resp = await axios.delete(`${this.baseURL}/${reportId}/`)
    return resp.data
  }

  async getSchedules() {
    const resp = await axios.get(`${this.baseURL}/schedules/`)
    return resp.data
  }

  async updateSchedule(scheduleId, data) {
    const resp = await axios.put(`${this.baseURL}/schedules/${scheduleId}/`, data)
    return resp.data
  }

  async deleteSchedule(scheduleId) {
    const resp = await axios.delete(`${this.baseURL}/schedules/${scheduleId}/`)
    return resp.data
  }

  // Helpers
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

  generateFilename(baseName = 'report', format = 'pdf') {
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const ext = format === 'excel' ? 'xlsx' : format === 'json' ? 'json' : 'pdf'
    return `${baseName}_${ts}.${ext}`
  }

  formatDate(date) {
    if (!date) return null
    return new Date(date).toISOString().split('T')[0]
  }

  buildParams(filters = {}) {
    const params = { ...filters }
    if (params.start_date) params.start_date = this.formatDate(params.start_date)
    if (params.end_date) params.end_date = this.formatDate(params.end_date)
    Object.keys(params).forEach(k => {
      if (params[k] === undefined || params[k] === null || params[k] === '') delete params[k]
    })
    return params
  }
}

export const reportsAPI = new ReportsAPI()
export default reportsAPI