import axiosInstance from '@api/axios'
import {
  PENALTY_STATUS,
  PENALTY_TYPE,
  PAYMENT_METHOD,
  REPAYMENT_STATUS,
  REPAYMENT_TYPE,
  SCHEDULE_STATUS,
} from '../types'

export const REPAYMENT_ENDPOINTS = Object.freeze({
  list: '/repayments/',
  detail: (id) => `/repayments/${id}/`,
  create: '/repayments/create/',
  process: (id) => `/repayments/${id}/process/`,
  waive: (id) => `/repayments/${id}/waive/`,
  cancel: (id) => `/repayments/${id}/cancel/`,
  search: '/repayments/search/',
  stats: '/repayments/stats/',
  dashboard: '/repayments/dashboard/',
  overdue: '/repayments/overdue/',
  upcoming: '/repayments/upcoming/',
  bulkCreate: '/repayments/bulk-create/',
  export: '/repayments/export/',
  customerRepayments: (customerId) => `/repayments/customer/${customerId}/`,
  loanRepayments: (loanId) => `/repayments/loan/${loanId}/`,
  schedules: (loanId) => `/repayments/loan/${loanId}/schedule/`,
  scheduleGenerate: (loanId) => `/repayments/loan/${loanId}/schedule/generate/`,
  scheduleAdjust: (scheduleId) => `/repayments/schedule/${scheduleId}/adjust/`,
  penalties: '/repayments/penalties/',
  penaltyDetail: (id) => `/repayments/penalties/${id}/`,
  penaltyCreate: '/repayments/penalties/create/',
  penaltyApply: (id) => `/repayments/penalties/${id}/apply/`,
  penaltyWaive: (id) => `/repayments/penalties/${id}/waive/`,
})

const appendMultipartValue = (formData, key, value) => {
  if (value === undefined || value === null || value === '') return

  if (value instanceof File) {
    formData.append(key, value)
    return
  }

  if (typeof value === 'object') {
    formData.append(key, JSON.stringify(value))
    return
  }

  formData.append(key, String(value))
}

class RepaymentsAPI {
  constructor() {
    this.endpoints = REPAYMENT_ENDPOINTS
  }

  async getRepayments(params = {}) {
    const response = await axiosInstance.get(this.endpoints.list, { params })
    return response.data
  }

  async getRepayment(id) {
    const response = await axiosInstance.get(this.endpoints.detail(id))
    return response.data
  }

  async createRepayment(data) {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      const normalizedKey = key === 'loan_id' ? 'loan' : key
      appendMultipartValue(formData, normalizedKey, value)
    })

    const response = await axiosInstance.post(this.endpoints.create, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async updateRepayment(id, data) {
    const hasFile = data?.receipt_file instanceof File

    if (hasFile) {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        appendMultipartValue(formData, key, value)
      })

      const response = await axiosInstance.patch(this.endpoints.detail(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    }

    const response = await axiosInstance.patch(this.endpoints.detail(id), data)
    return response.data
  }

  async deleteRepayment(id) {
    await axiosInstance.delete(this.endpoints.detail(id))
    return { success: true }
  }

  async processRepayment(id, data) {
    const response = await axiosInstance.post(this.endpoints.process(id), data)
    return response.data
  }

  async waiveRepayment(id, data) {
    const response = await axiosInstance.post(this.endpoints.waive(id), data)
    return response.data
  }

  async cancelRepayment(id, data) {
    const response = await axiosInstance.post(this.endpoints.cancel(id), data)
    return response.data
  }

  async getSchedules(loanId, params = {}) {
    const response = await axiosInstance.get(this.endpoints.schedules(loanId), { params })
    return response.data
  }

  async generateSchedule(loanId) {
    const response = await axiosInstance.post(this.endpoints.scheduleGenerate(loanId), {})
    return response.data
  }

  async adjustSchedule(scheduleId, data) {
    const response = await axiosInstance.post(this.endpoints.scheduleAdjust(scheduleId), data)
    return response.data
  }

  async getPenalties(params = {}) {
    const response = await axiosInstance.get(this.endpoints.penalties, { params })
    return response.data
  }

  async getPenalty(id) {
    const response = await axiosInstance.get(this.endpoints.penaltyDetail(id))
    return response.data
  }

  async createPenalty(data) {
    const response = await axiosInstance.post(this.endpoints.penaltyCreate, data)
    return response.data
  }

  async applyPenalty(id) {
    const response = await axiosInstance.post(this.endpoints.penaltyApply(id), {})
    return response.data
  }

  async waivePenalty(id, data) {
    const response = await axiosInstance.post(this.endpoints.penaltyWaive(id), data)
    return response.data
  }

  async searchRepayments(params = {}) {
    const response = await axiosInstance.get(this.endpoints.search, { params })
    return response.data
  }

  async getStats() {
    const response = await axiosInstance.get(this.endpoints.stats)
    return response.data
  }

  async getDashboard() {
    const response = await axiosInstance.get(this.endpoints.dashboard)
    return response.data
  }

  async getOverdueRepayments(params = {}) {
    const response = await axiosInstance.get(this.endpoints.overdue, { params })
    return response.data
  }

  async getUpcomingRepayments(params = {}) {
    const response = await axiosInstance.get(this.endpoints.upcoming, { params })
    return response.data
  }

  async bulkCreateRepayments(data) {
    const response = await axiosInstance.post(this.endpoints.bulkCreate, data)
    return response.data
  }

  async exportRepayments(params = {}) {
    const response = await axiosInstance.get(this.endpoints.export, {
      params,
      responseType: 'blob',
    })
    return response.data
  }

  async getCustomerRepayments(customerId, params = {}) {
    const response = await axiosInstance.get(this.endpoints.customerRepayments(customerId), { params })
    return response.data
  }

  async getLoanRepayments(loanId, params = {}) {
    const response = await axiosInstance.get(this.endpoints.loanRepayments(loanId), { params })
    return response.data
  }

  downloadExport(blob, filename = 'repayments_export.xlsx') {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  formatStatus(status) {
    const mapping = {
      PENDING: 'Pending',
      PROCESSING: 'Processing',
      COMPLETED: 'Completed',
      FAILED: 'Failed',
      CANCELLED: 'Cancelled',
      OVERDUE: 'Overdue',
      PARTIAL: 'Partial',
      WAIVED: 'Waived',
    }
    return mapping[status] || status
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(Number(amount || 0))
  }
}

export const repaymentsAPI = new RepaymentsAPI()
export {
  REPAYMENT_STATUS,
  SCHEDULE_STATUS,
  PENALTY_STATUS,
  PAYMENT_METHOD,
  REPAYMENT_TYPE,
  PENALTY_TYPE,
}
export default repaymentsAPI
