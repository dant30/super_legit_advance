// frontend/src/lib/api/loans.js
import axios from './axios';

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
};

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
};

export const LOAN_TYPE = {
  PERSONAL: 'PERSONAL',
  BUSINESS: 'BUSINESS',
  SALARY: 'SALARY',
  EMERGENCY: 'EMERGENCY',
  ASSET_FINANCING: 'ASSET_FINANCING',
  EDUCATION: 'EDUCATION',
  AGRICULTURE: 'AGRICULTURE'
};

export const INTEREST_TYPE = {
  FIXED: 'FIXED',
  REDUCING_BALANCE: 'REDUCING_BALANCE',
  FLAT_RATE: 'FLAT_RATE'
};

export const REPAYMENT_FREQUENCY = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  BIWEEKLY: 'BIWEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  BIANNUAL: 'BIANNUAL',
  ANNUAL: 'ANNUAL',
  BULLET: 'BULLET'
};

export const RISK_LEVEL = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

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
};

export const LOAN_TYPE_LABELS = {
  [LOAN_TYPE.PERSONAL]: 'Personal Loan',
  [LOAN_TYPE.BUSINESS]: 'Business Loan',
  [LOAN_TYPE.SALARY]: 'Salary Advance',
  [LOAN_TYPE.EMERGENCY]: 'Emergency Loan',
  [LOAN_TYPE.ASSET_FINANCING]: 'Asset Financing',
  [LOAN_TYPE.EDUCATION]: 'Education Loan',
  [LOAN_TYPE.AGRICULTURE]: 'Agricultural Loan'
};

/**
 * UTILITY FUNCTIONS
 */
export const getLoanStatusColor = (status) => {
  switch (status) {
    case LOAN_STATUS.ACTIVE:
    case LOAN_STATUS.APPROVED:
    case LOAN_STATUS.COMPLETED:
      return 'success';
    case LOAN_STATUS.PENDING:
    case LOAN_STATUS.UNDER_REVIEW:
    case LOAN_STATUS.DRAFT:
      return 'warning';
    case LOAN_STATUS.REJECTED:
    case LOAN_STATUS.CANCELLED:
      return 'danger';
    case LOAN_STATUS.OVERDUE:
    case LOAN_STATUS.DEFAULTED:
      return 'error';
    default:
      return 'default';
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount);
};

export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * LOAN API FUNCTIONS
 */
class LoanAPI {
  constructor() {
    this.baseURL = '/loans';
  }

  // ========== LOAN MANAGEMENT ==========

  /**
   * Fetch all loans with optional filters
   */
  async getLoans(filters = {}) {
    try {
      const response = await axios.get(this.baseURL, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching loans:', error);
      throw error;
    }
  }

  /**
   * Fetch single loan by ID
   */
  async getLoan(id) {
    try {
      const response = await axios.get(`${this.baseURL}/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching loan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new loan
   */
  async createLoan(data) {
    try {
      const response = await axios.post(`${this.baseURL}/create/`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  }

  /**
   * Update an existing loan
   */
  async updateLoan(id, data) {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating loan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a loan
   */
  async deleteLoan(id) {
    try {
      await axios.delete(`${this.baseURL}/${id}/`);
      return { success: true, message: 'Loan deleted successfully' };
    } catch (error) {
      console.error(`Error deleting loan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Approve a loan
   */
  async approveLoan(id, data = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/${id}/approve/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error approving loan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reject a loan
   */
  async rejectLoan(id, reason) {
    try {
      const response = await axios.post(`${this.baseURL}/${id}/reject/`, {
        rejection_reason: reason
      });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting loan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Disburse a loan
   */
  async disburseLoan(id, data = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/${id}/disburse/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error disbursing loan ${id}:`, error);
      throw error;
    }
  }

  /**
   * Calculate loan terms
   */
  async calculateLoan(data) {
    try {
      const response = await axios.post(`${this.baseURL}/calculator/`, data);
      return response.data;
    } catch (error) {
      console.error('Error calculating loan:', error);
      throw error;
    }
  }

  /**
   * Get loan statistics
   */
  async getLoanStats() {
    try {
      const response = await axios.get(`${this.baseURL}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching loan stats:', error);
      throw error;
    }
  }

  /**
   * Search loans
   */
  async searchLoans(query, searchType = 'basic') {
    try {
      const response = await axios.get(`${this.baseURL}/search/`, {
        params: { q: query, type: searchType }
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Error searching loans:', error);
      throw error;
    }
  }

  /**
   * Export loans
   */
  async exportLoans(format = 'excel', filters = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/export/`, {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting loans:', error);
      throw error;
    }
  }

  // ========== LOAN APPLICATION MANAGEMENT ==========

  /**
   * Fetch all loan applications
   */
  async getLoanApplications(filters = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/applications/`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching loan applications:', error);
      throw error;
    }
  }

  /**
   * Fetch single loan application
   */
  async getLoanApplication(id) {
    try {
      const response = await axios.get(`${this.baseURL}/applications/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching loan application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new loan application
   */
  async createLoanApplication(data) {
    try {
      const response = await axios.post(
        `${this.baseURL}/applications/create/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating loan application:', error);
      throw error;
    }
  }

  /**
   * Update a loan application
   */
  async updateLoanApplication(id, data) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/applications/${id}/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating loan application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Submit a loan application for review
   */
  async submitLoanApplication(id) {
    try {
      const response = await axios.post(
        `${this.baseURL}/applications/${id}/submit/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error submitting loan application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Review a loan application
   */
  async reviewLoanApplication(id, data) {
    try {
      const response = await axios.post(
        `${this.baseURL}/applications/${id}/review/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error reviewing loan application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Approve a loan application
   */
  async approveLoanApplication(id, data = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/applications/${id}/approve/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error approving loan application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reject a loan application
   */
  async rejectLoanApplication(id, reason) {
    try {
      const response = await axios.post(
        `${this.baseURL}/applications/${id}/reject/`,
        { rejection_reason: reason }
      );
      return response.data;
    } catch (error) {
      console.error(`Error rejecting loan application ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a loan application
   */
  async deleteLoanApplication(id) {
    try {
      await axios.delete(`${this.baseURL}/applications/${id}/`);
      return { success: true, message: 'Application deleted successfully' };
    } catch (error) {
      console.error(`Error deleting loan application ${id}:`, error);
      throw error;
    }
  }

  // ========== COLLATERAL MANAGEMENT ==========

  /**
   * Fetch collaterals for a loan
   */
  async getCollaterals(loanId, filters = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/${loanId}/collateral/`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching collaterals for loan ${loanId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch single collateral
   */
  async getCollateral(id) {
    try {
      const response = await axios.get(`${this.baseURL}/collateral/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching collateral ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create collateral
   */
  async createCollateral(loanId, data) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${loanId}/collateral/create/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating collateral for loan ${loanId}:`, error);
      throw error;
    }
  }

  /**
   * Update collateral
   */
  async updateCollateral(id, data) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/collateral/${id}/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating collateral ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete collateral
   */
  async deleteCollateral(id) {
    try {
      await axios.delete(`${this.baseURL}/collateral/${id}/`);
      return { success: true, message: 'Collateral deleted successfully' };
    } catch (error) {
      console.error(`Error deleting collateral ${id}:`, error);
      throw error;
    }
  }

  /**
   * Release collateral
   */
  async releaseCollateral(id, data = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/collateral/${id}/release/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error releasing collateral ${id}:`, error);
      throw error;
    }
  }

  // ========== UTILITY FUNCTIONS ==========

  /**
   * Download exported file
   */
  downloadExport(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Validate loan data before submission
   */
  validateLoanData(data) {
    const errors = {};

    if (!data.customer) {
      errors.customer = 'Customer is required';
    }

    if (!data.amount_requested || data.amount_requested <= 0) {
      errors.amount_requested = 'Valid loan amount is required';
    }

    if (!data.term_months || data.term_months <= 0) {
      errors.term_months = 'Valid loan term is required';
    }

    if (!data.purpose) {
      errors.purpose = 'Loan purpose is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Calculate affordability
   */
  calculateAffordability(monthlyIncome, monthlyExpenses, proposedInstallment) {
    const disposableIncome = monthlyIncome - monthlyExpenses;
    const installmentRatio = (proposedInstallment / monthlyIncome) * 100;
    const affordabilityScore = Math.max(0, 100 - installmentRatio);

    let affordabilityLevel = 'GOOD';
    if (installmentRatio > 40) {
      affordabilityLevel = 'POOR';
    } else if (installmentRatio > 20) {
      affordabilityLevel = 'MODERATE';
    }

    return {
      disposableIncome,
      installmentRatio,
      affordabilityScore,
      affordabilityLevel,
      recommendation: installmentRatio > 40 ? 'Reject' : installmentRatio > 20 ? 'Review' : 'Approve'
    };
  }
}

// Create and export a singleton instance
export const loanAPI = new LoanAPI();

// Also export utility functions individually for easy importing
export {
  LOAN_STATUS,
  LOAN_APPLICATION_STATUS,
  LOAN_TYPE,
  INTEREST_TYPE,
  REPAYMENT_FREQUENCY,
  RISK_LEVEL,
  LOAN_STATUS_LABELS,
  LOAN_TYPE_LABELS,
  getLoanStatusColor,
  formatCurrency,
  calculateDaysBetween
};