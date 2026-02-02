// frontend/src/api/repayments.js
import axiosInstance from './axios'

// Constants
export const REPAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  OVERDUE: 'OVERDUE',
  PARTIAL: 'PARTIAL',
  WAIVED: 'WAIVED'
}

export const SCHEDULE_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  SKIPPED: 'SKIPPED',
  ADJUSTED: 'ADJUSTED',
  CANCELLED: 'CANCELLED'
}

export const PENALTY_STATUS = {
  PENDING: 'PENDING',
  APPLIED: 'APPLIED',
  WAIVED: 'WAIVED',
  CANCELLED: 'CANCELLED',
  PAID: 'PAID'
}

export const PAYMENT_METHOD = {
  MPESA: 'MPESA',
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CHEQUE: 'CHEQUE',
  CREDIT_CARD: 'CREDIT_CARD',
  OTHER: 'OTHER'
}

export const REPAYMENT_TYPE = {
  PRINCIPAL: 'PRINCIPAL',
  INTEREST: 'INTEREST',
  PENALTY: 'PENALTY',
  FEE: 'FEE',
  FULL: 'FULL',
  PARTIAL: 'PARTIAL'
}

export const PENALTY_TYPE = {
  LATE_PAYMENT: 'LATE_PAYMENT',
  DEFAULT: 'DEFAULT',
  EARLY_REPAYMENT: 'EARLY_REPAYMENT',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  OTHER: 'OTHER'
}

class RepaymentsAPI {
  constructor() {
    this.baseURL = '/repayments'
  }

  // ===== REPAYMENTS =====

  async getRepayments(params = {}) {
    const response = await axiosInstance.get(this.baseURL, { params })
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
        } else if (typeof value === 'object') {
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

  // ===== CUSTOMER REPAYMENTS =====

  async getCustomerRepayments(customerId, params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/customer/${customerId}/`, { params })
    return response.data
  }

  // ===== LOAN REPAYMENTS =====

  async getLoanRepayments(loanId, params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/loan/${loanId}/`, { params })
    return response.data
  }

  // ===== REPAYMENT SCHEDULES =====

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

  async getOverdueRepayments(params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/overdue/`, { params })
    return response.data
  }

  async getUpcomingRepayments(params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/upcoming/`, { params })
    return response.data
  }

  // ===== STATISTICS & DASHBOARD =====

  async getStats() {
    const response = await axiosInstance.get(`${this.baseURL}/stats/`)
    return response.data
  }

  async getDashboard() {
    const response = await axiosInstance.get(`${this.baseURL}/dashboard/`)
    return response.data
  }

  // ===== BULK OPERATIONS =====

  async bulkCreateRepayments(data) {
    const response = await axiosInstance.post(`${this.baseURL}/bulk-create/`, data)
    return response.data
  }

  async sendReminders(data) {
    const response = await axiosInstance.post(`${this.baseURL}/reminders/`, data)
    return response.data
  }

  // ===== EXPORT & SEARCH =====

  async exportRepayments(params = {}) {
    const response = await axiosInstance.get(`${this.baseURL}/export/`, {
      params,
      responseType: 'blob',
    })
    return response.data
  }

  async searchRepayments(params) {
    const response = await axiosInstance.get(`${this.baseURL}/search/`, { params })
    return response.data
  }

  // ===== UTILITY METHODS =====

  formatPaymentMethod(method) {
    const methodLabels = {
      [PAYMENT_METHOD.MPESA]: 'M-Pesa',
      [PAYMENT_METHOD.CASH]: 'Cash',
      [PAYMENT_METHOD.BANK_TRANSFER]: 'Bank Transfer',
      [PAYMENT_METHOD.CHEQUE]: 'Cheque',
      [PAYMENT_METHOD.CREDIT_CARD]: 'Credit Card',
      [PAYMENT_METHOD.OTHER]: 'Other'
    }
    return methodLabels[method] || method
  }

  formatStatus(status) {
    const statusLabels = {
      [REPAYMENT_STATUS.PENDING]: 'Pending',
      [REPAYMENT_STATUS.PROCESSING]: 'Processing',
      [REPAYMENT_STATUS.COMPLETED]: 'Completed',
      [REPAYMENT_STATUS.FAILED]: 'Failed',
      [REPAYMENT_STATUS.CANCELLED]: 'Cancelled',
      [REPAYMENT_STATUS.OVERDUE]: 'Overdue',
      [REPAYMENT_STATUS.PARTIAL]: 'Partial',
      [REPAYMENT_STATUS.WAIVED]: 'Waived'
    }
    return statusLabels[status] || status
  }

  getStatusColor(status) {
    const colors = {
      [REPAYMENT_STATUS.PENDING]: 'warning',
      [REPAYMENT_STATUS.PROCESSING]: 'info',
      [REPAYMENT_STATUS.COMPLETED]: 'success',
      [REPAYMENT_STATUS.FAILED]: 'danger',
      [REPAYMENT_STATUS.CANCELLED]: 'neutral',
      [REPAYMENT_STATUS.OVERDUE]: 'danger',
      [REPAYMENT_STATUS.PARTIAL]: 'warning',
      [REPAYMENT_STATUS.WAIVED]: 'info'
    }
    return colors[status] || 'neutral'
  }

  calculateRemainingDays(dueDate) {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount)
  }
}

export const repaymentsAPI = new RepaymentsAPI()
export default repaymentsAPI