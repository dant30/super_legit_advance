// frontend/src/api/repayments.js
import axiosInstance from './axios'

export const REPAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  OVERDUE: 'OVERDUE',
  PARTIAL: 'PARTIAL',
  WAIVED: 'WAIVED',
}

export const SCHEDULE_STATUS = {
  PENDING: 'PENDING',
  OVERDUE: 'OVERDUE',
  PAID: 'PAID',
  ADJUSTED: 'ADJUSTED',
}

export const PENALTY_STATUS = {
  PENDING: 'PENDING',
  APPLIED: 'APPLIED',
  WAIVED: 'WAIVED',
  CANCELLED: 'CANCELLED',
}

export const PAYMENT_METHOD = {
  CASH: 'CASH',
  MPESA: 'MPESA',
  BANK: 'BANK',
  CHEQUE: 'CHEQUE',
}

export const REPAYMENT_TYPE = {
  FULL: 'FULL',
  PARTIAL: 'PARTIAL',
  INTEREST_ONLY: 'INTEREST_ONLY',
}

export const PENALTY_TYPE = {
  LATE_FEE: 'LATE_FEE',
  INTEREST: 'INTEREST',
  OTHER: 'OTHER',
}

class RepaymentsAPI {
  constructor() {
    this.baseURL = '/repayments'
  }

  // ===== REPAYMENTS =====

  async getRepayments(params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/`, { params })
    return response.data
  }

  async getRepayment(id) {
    const response = await axiosInstance.get(`${this.baseURL}/${id}/`)
    return response.data
  }

  async createRepayment(data) {
    const formData = new FormData()

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'receipt_file' && value instanceof File) {
          formData.append(key, value)
        } else if (typeof value === 'object' && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, String(value))
        }
      }
    })

    const response = await axiosInstance.post(`${this.baseURL}/create/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async updateRepayment(id, data) {
    const response = await axiosInstance.patch(`${this.baseURL}/${id}/`, data)
    return response.data
  }

  async deleteRepayment(id) {
    await axiosInstance.delete(`${this.baseURL}/${id}/`)
    return { success: true }
  }

  async processRepayment(id, data) {
    const response = await axiosInstance.post(`${this.baseURL}/${id}/process/`, data)
    return response.data
  }

  async waiveRepayment(id, data) {
    const response = await axiosInstance.post(`${this.baseURL}/${id}/waive/`, data)
    return response.data
  }

  async cancelRepayment(id, data) {
    const response = await axiosInstance.post(`${this.baseURL}/${id}/cancel/`, data)
    return response.data
  }

  // ===== SCHEDULES =====

  async getSchedules(loanId, params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/loan/${loanId}/schedule/`, { params })
    return response.data
  }

  async generateSchedule(loanId) {
    const response = await axiosInstance.post(`${this.baseURL}/loan/${loanId}/schedule/generate/`, {})
    return response.data
  }

  async adjustSchedule(scheduleId, data) {
    const response = await axiosInstance.post(`${this.baseURL}/schedule/${scheduleId}/adjust/`, data)
    return response.data
  }

  // ===== PENALTIES =====

  async getPenalties(params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/penalties/`, { params })
    return response.data
  }

  async getPenalty(id) {
    const response = await axiosInstance.get(`${this.baseURL}/penalties/${id}/`)
    return response.data
  }

  async createPenalty(data) {
    const response = await axiosInstance.post(`${this.baseURL}/penalties/create/`, data)
    return response.data
  }

  async applyPenalty(id) {
    const response = await axiosInstance.post(`${this.baseURL}/penalties/${id}/apply/`, {})
    return response.data
  }

  async waivePenalty(id, data) {
    const response = await axiosInstance.post(`${this.baseURL}/penalties/${id}/waive/`, data)
    return response.data
  }

  // ===== SPECIAL VIEWS =====

  async searchRepayments(params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/search/`, { params })
    return response.data
  }

  async getStats() {
    const response = await axiosInstance.get(`${this.baseURL}/stats/`)
    return response.data
  }

  async getDashboard() {
    const response = await axiosInstance.get(`${this.baseURL}/dashboard/`)
    return response.data
  }

  async getOverdueRepayments(params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/overdue/`, { params })
    return response.data
  }

  async getUpcomingRepayments(params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/upcoming/`, { params })
    return response.data
  }

  // ===== BULK & EXPORT =====

  async bulkCreateRepayments(data) {
    const response = await axiosInstance.post(`${this.baseURL}/bulk-create/`, data)
    return response.data
  }

  async exportRepayments(params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/export/`, {
      params,
      responseType: 'blob',
    })
    return response.data
  }

  // ===== CUSTOMER / LOAN SPECIFIC =====

  async getCustomerRepayments(customerId, params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/customer/${customerId}/`, { params })
    return response.data
  }

  async getLoanRepayments(loanId, params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/loan/${loanId}/`, { params })
    return response.data
  }

  // ===== UTILITIES =====

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
      minimumFractionDigits: 2
    }).format(Number(amount || 0))
  }
}

export const repaymentsAPI = new RepaymentsAPI()
export default repaymentsAPI
