// frontend/src/lib/api/loans.js
import axios from './axios'

/**
 * LOAN STATUS CONSTANTS
 */
export const LOAN_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DEFAULTED: 'DEFAULTED',
  OVERDUE: 'OVERDUE',
  WRITTEN_OFF: 'WRITTEN_OFF',
  CANCELLED: 'CANCELLED'
}

export const LOAN_APPLICATION_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  DOCUMENTS_REQUESTED: 'DOCUMENTS_REQUESTED',
  DOCUMENTS_RECEIVED: 'DOCUMENTS_RECEIVED',
  CREDIT_CHECK: 'CREDIT_CHECK',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
}

export const LOAN_TYPE = {
  PERSONAL: 'PERSONAL',
  BUSINESS: 'BUSINESS',
  SALARY: 'SALARY',
  EMERGENCY: 'EMERGENCY',
  ASSET_FINANCING: 'ASSET_FINANCING',
  EDUCATION: 'EDUCATION',
  AGRICULTURE: 'AGRICULTURE'
}

export const INTEREST_TYPE = {
  FIXED: 'FIXED',
  REDUCING_BALANCE: 'REDUCING_BALANCE',
  FLAT_RATE: 'FLAT_RATE'
}

export const REPAYMENT_FREQUENCY = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  BIWEEKLY: 'BIWEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  BIANNUAL: 'BIANNUAL',
  ANNUAL: 'ANNUAL',
  BULLET: 'BULLET'
}

export const RISK_LEVEL = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
}

/**
 * STATUS LABELS FOR DISPLAY
 */
export const LOAN_STATUS_LABELS = {
  [LOAN_STATUS.DRAFT]: 'Draft',
  [LOAN_STATUS.PENDING]: 'Pending Approval',
  [LOAN_STATUS.UNDER_REVIEW]: 'Under Review',
  [LOAN_STATUS.APPROVED]: 'Approved',
  [LOAN_STATUS.REJECTED]: 'Rejected',
  [LOAN_STATUS.ACTIVE]: 'Active',
  [LOAN_STATUS.COMPLETED]: 'Completed',
  [LOAN_STATUS.DEFAULTED]: 'Defaulted',
  [LOAN_STATUS.OVERDUE]: 'Overdue',
  [LOAN_STATUS.WRITTEN_OFF]: 'Written Off',
  [LOAN_STATUS.CANCELLED]: 'Cancelled'
}

export const LOAN_TYPE_LABELS = {
  [LOAN_TYPE.PERSONAL]: 'Personal Loan',
  [LOAN_TYPE.BUSINESS]: 'Business Loan',
  [LOAN_TYPE.SALARY]: 'Salary Advance',
  [LOAN_TYPE.EMERGENCY]: 'Emergency Loan',
  [LOAN_TYPE.ASSET_FINANCING]: 'Asset Financing',
  [LOAN_TYPE.EDUCATION]: 'Education Loan',
  [LOAN_TYPE.AGRICULTURE]: 'Agricultural Loan'
}

/**
 * UTILITY FUNCTIONS
 */
export const getLoanStatusColor = (status) => {
  switch (status) {
    case LOAN_STATUS.ACTIVE:
    case LOAN_STATUS.APPROVED:
    case LOAN_STATUS.COMPLETED:
      return 'success'
    case LOAN_STATUS.PENDING:
    case LOAN_STATUS.UNDER_REVIEW:
    case LOAN_STATUS.DRAFT:
      return 'warning'
    case LOAN_STATUS.REJECTED:
    case LOAN_STATUS.CANCELLED:
      return 'danger'
    case LOAN_STATUS.OVERDUE:
    case LOAN_STATUS.DEFAULTED:
      return 'error'
    default:
      return 'default'
  }
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(Number(amount || 0))
}

export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * LOAN API FUNCTIONS (matches backend routes in backend/apps/loans/urls.py)
 */
class LoanAPI {
  constructor() {
    this.baseURL = '/loans'
  }

  async getLoans(filters = {}) {
    const res = await axios.get(`${this.baseURL}/`, { params: filters })
    return res.data
  }

  async getLoan(id) {
    const res = await axios.get(`${this.baseURL}/${id}/`)
    return res.data
  }

  async createLoan(data) {
    const res = await axios.post(`${this.baseURL}/create/`, data)
    return res.data
  }

  async updateLoan(id, data) {
    const res = await axios.patch(`${this.baseURL}/${id}/`, data)
    return res.data
  }

  async deleteLoan(id) {
    await axios.delete(`${this.baseURL}/${id}/`)
    return { success: true }
  }

  async approveLoan(id, data = {}) {
    const res = await axios.post(`${this.baseURL}/${id}/approve/`, data)
    return res.data
  }

  async rejectLoan(id, reason) {
    const res = await axios.post(`${this.baseURL}/${id}/reject/`, {
      rejection_reason: reason
    })
    return res.data
  }

  async disburseLoan(id, data = {}) {
    const res = await axios.post(`${this.baseURL}/${id}/disburse/`, data)
    return res.data
  }

  async calculateLoan(payload) {
    const res = await axios.post(`${this.baseURL}/calculator/`, payload)
    return res.data
  }

  async getLoanStats() {
    const res = await axios.get(`${this.baseURL}/stats/`)
    return res.data
  }

  async searchLoans(q = '', type = 'basic', params = {}) {
    const res = await axios.get(`${this.baseURL}/search/`, {
      params: { q, type, ...params }
    })
    // backend returns list or paginated results; prefer results if present
    return res.data.results || res.data
  }

  async exportLoans(format = 'excel', filters = {}) {
    const res = await axios.get(`${this.baseURL}/export/`, {
      params: { format, ...filters },
      responseType: 'blob'
    })
    return res.data
  }

  // Applications
  async getLoanApplications(filters = {}) {
    const res = await axios.get(`${this.baseURL}/applications/`, { params: filters })
    return res.data
  }

  async getLoanApplication(id) {
    const res = await axios.get(`${this.baseURL}/applications/${id}/`)
    return res.data
  }

  async createLoanApplication(data) {
    const res = await axios.post(`${this.baseURL}/applications/create/`, data)
    return res.data
  }

  async updateLoanApplication(id, data) {
    const res = await axios.patch(`${this.baseURL}/applications/${id}/`, data)
    return res.data
  }

  async submitLoanApplication(id) {
    const res = await axios.post(`${this.baseURL}/applications/${id}/submit/`)
    return res.data
  }

  async reviewLoanApplication(id, data) {
    const res = await axios.post(`${this.baseURL}/applications/${id}/review/`, data)
    return res.data
  }

  async approveLoanApplication(id, data = {}) {
    const res = await axios.post(`${this.baseURL}/applications/${id}/approve/`, data)
    return res.data
  }

  async rejectLoanApplication(id, reason) {
    const res = await axios.post(`${this.baseURL}/applications/${id}/reject/`, {
      rejection_reason: reason
    })
    return res.data
  }

  async deleteLoanApplication(id) {
    const res = await axios.delete(`${this.baseURL}/applications/${id}/`)
    return res.data
  }

  // Collateral
  async getCollaterals(loanId, filters = {}) {
    const res = await axios.get(`${this.baseURL}/${loanId}/collateral/`, { params: filters })
    return res.data
  }

  async getCollateral(id) {
    const res = await axios.get(`${this.baseURL}/collateral/${id}/`)
    return res.data
  }

  async createCollateral(loanId, data) {
    const res = await axios.post(`${this.baseURL}/${loanId}/collateral/create/`, data)
    return res.data
  }

  async updateCollateral(id, data) {
    const res = await axios.patch(`${this.baseURL}/collateral/${id}/`, data)
    return res.data
  }

  async deleteCollateral(id) {
    const res = await axios.delete(`${this.baseURL}/collateral/${id}/`)
    return res.data
  }

  async releaseCollateral(id, data = {}) {
    const res = await axios.post(`${this.baseURL}/collateral/${id}/release/`, data)
    return res.data
  }

  // Utilities
  downloadExport(blob, filename = 'export.xlsx') {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  validateLoanData(data) {
    const errors = {}
    if (!data.customer) errors.customer = 'Customer is required'
    if (!data.amount_requested || Number(data.amount_requested) <= 0) errors.amount_requested = 'Amount requested must be > 0'
    if (!data.term_months || Number(data.term_months) <= 0) errors.term_months = 'Term must be > 0'
    if (!data.purpose) errors.purpose = 'Purpose is required'
    return { isValid: Object.keys(errors).length === 0, errors }
  }

  calculateAffordability(monthlyIncome = 0, monthlyExpenses = 0, proposedInstallment = 0) {
    const disposableIncome = Number(monthlyIncome) - Number(monthlyExpenses)
    const installmentRatio = monthlyIncome > 0 ? (Number(proposedInstallment) / Number(monthlyIncome)) * 100 : 100
    const affordabilityScore = Math.max(0, 100 - installmentRatio)

    let affordabilityLevel = 'GOOD'
    if (installmentRatio > 40) affordabilityLevel = 'POOR'
    else if (installmentRatio > 20) affordabilityLevel = 'MODERATE'

    return {
      disposableIncome,
      installmentRatio,
      affordabilityScore,
      affordabilityLevel,
      recommendation: installmentRatio > 40 ? 'Reject' : installmentRatio > 20 ? 'Review' : 'Approve'
    }
  }
}

export const loanAPI = new LoanAPI()

