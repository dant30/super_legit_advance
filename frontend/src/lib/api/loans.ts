// frontend/src/lib/api/loans.ts
import axiosInstance from '@/lib/axios'

/* =====================================================
 * Core Types
 * ===================================================== */

export interface Loan {
  id: number
  loan_number: string
  customer: number
  customer_name: string
  customer_number: string
  customer_phone: string
  loan_type: 'PERSONAL' | 'BUSINESS' | 'SALARY' | 'EMERGENCY' | 'ASSET_FINANCING' | 'EDUCATION' | 'AGRICULTURE'
  purpose: string
  purpose_description: string
  amount_requested: number
  amount_approved?: number
  amount_disbursed?: number
  term_months: number
  interest_rate: number
  interest_type: 'FIXED' | 'REDUCING_BALANCE' | 'FLAT_RATE'
  repayment_frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL' | 'BULLET'
  status: 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'OVERDUE' | 'WRITTEN_OFF' | 'CANCELLED'
  application_date: string
  approval_date?: string
  disbursement_date?: string
  start_date?: string
  maturity_date?: string
  completion_date?: string
  total_interest: number
  total_amount_due: number
  amount_paid: number
  outstanding_balance: number
  installment_amount?: number
  processing_fee: number
  processing_fee_percentage: number
  late_payment_penalty_rate: number
  total_penalties: number
  credit_score_at_application?: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  is_active: boolean
  is_overdue: boolean
  is_completed: boolean
  days_overdue: number
  loan_age_days: number
  repayment_progress: number
  payment_performance: number
  next_payment_date?: string
  approved_by?: number
  approved_by_name?: string
  disbursed_by?: number
  disbursed_by_name?: string
  rejection_reason?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface LoanApplication {
  id: number
  customer: number
  customer_name: string
  customer_number: string
  customer_phone: string
  loan_type: 'PERSONAL' | 'BUSINESS' | 'SALARY' | 'EMERGENCY' | 'ASSET_FINANCING'
  amount_requested: number
  term_months: number
  purpose: string
  purpose_description: string
  monthly_income: number
  other_income: number
  total_monthly_income: number
  total_monthly_expenses: number
  disposable_income: number
  existing_loans: boolean
  existing_loan_amount: number
  existing_loan_monthly: number
  has_guarantors: boolean
  guarantor_count: number
  has_collateral: boolean
  collateral_description: string
  collateral_value: number
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'DOCUMENTS_REQUESTED' | 'DOCUMENTS_RECEIVED' | 'CREDIT_CHECK' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  application_date: string
  reviewer?: number
  reviewer_name?: string
  review_date?: string
  review_notes?: string
  credit_score?: number
  credit_check_date?: string
  credit_check_notes?: string
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  risk_score: number
  approved_amount?: number
  approved_interest_rate?: number
  approved_by?: number
  approved_by_name?: string
  approval_date?: string
  approval_notes?: string
  rejection_reason?: string
  rejected_by?: number
  rejected_by_name?: string
  rejection_date?: string
  loan?: number
  loan_details?: Loan
  is_approved: boolean
  is_rejected: boolean
  is_pending: boolean
  application_age_days: number
  affordability_analysis?: {
    proposed_installment: number
    installment_to_income_ratio: number
    obligations_to_income_ratio: number
    affordability_score: number
    affordability_level: 'GOOD' | 'MODERATE' | 'POOR'
    recommendation: 'Approve' | 'Review' | 'Reject'
    recommendation_details: string
    factors_considered: {
      income_ratio: boolean
      existing_debts: boolean
      collateral: boolean
      guarantors: boolean
      credit_score: boolean
    }
  }
  created_at: string
  updated_at: string
}

export interface Collateral {
  id: number
  loan: number
  loan_number: string
  customer_name: string
  collateral_type: string
  description: string
  owner_name: string
  owner_id_number: string
  ownership_type: 'SOLE' | 'JOINT' | 'COMPANY' | 'FAMILY' | 'OTHER'
  estimated_value: number
  insured_value?: number
  insurance_company?: string
  insurance_policy_number?: string
  insurance_expiry?: string
  location: string
  registration_number?: string
  registration_date?: string
  registration_authority?: string
  status: 'ACTIVE' | 'RELEASED' | 'FORECLOSED' | 'SOLD' | 'DAMAGED' | 'LOST' | 'OTHER'
  pledged_date: string
  release_date?: string
  loan_to_value_ratio: number
  coverage_ratio: number
  is_active: boolean
  is_released: boolean
  is_insured: boolean
  insurance_status: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface LoanListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Loan[]
}

export interface LoanApplicationListResponse {
  count: number
  next: string | null
  previous: string | null
  results: LoanApplication[]
}

export interface CollateralListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Collateral[]
}

export interface LoanCreatePayload {
  customer: number
  loan_type: string
  purpose: string
  purpose_description?: string
  amount_requested: number
  term_months: number
  interest_rate?: number
  interest_type?: string
  repayment_frequency?: string
  processing_fee_percentage?: number
  late_payment_penalty_rate?: number
  notes?: string
}

export interface LoanUpdatePayload {
  loan_type?: string
  purpose?: string
  purpose_description?: string
  amount_requested?: number
  term_months?: number
  interest_rate?: number
  interest_type?: string
  repayment_frequency?: string
  processing_fee_percentage?: number
  late_payment_penalty_rate?: number
  notes?: string
}

export interface LoanCalculatorPayload {
  principal: number
  interest_rate: number
  term_months: number
  interest_type?: string
  repayment_frequency?: string
  processing_fee_percentage?: number
}

export interface LoanCalculatorResponse {
  calculations: {
    installment_amount: number
    total_interest: number
    total_amount_due: number
    processing_fee: number
  }
  amortization_schedule: Array<{
    month: number
    payment: number
    principal: number
    interest: number
    balance: number
  }>
  summary: {
    principal: number
    net_disbursement: number
    processing_fee: number
    processing_fee_percentage: number
  }
}

export interface LoanStats {
  summary: {
    total_loans: number
    total_active_loans: number
    total_overdue_loans: number
    total_completed_loans: number
    total_pending_loans: number
    total_amount_approved: number
    total_amount_disbursed: number
    total_outstanding_balance: number
    total_amount_repaid: number
    total_interest_earned: number
    average_loan_size: number
    average_interest_rate: number
    repayment_rate: number
    overdue_rate: number
    portfolio_at_risk_rate: number
  }
  distributions: {
    status: Array<{ status: string; count: number; total_amount: number; avg_amount: number }>
    loan_type: Array<{ loan_type: string; count: number; total_amount: number; avg_amount: number }>
    risk_level: Array<{ risk_level: string; count: number; total_amount: number; avg_amount: number }>
  }
  trends: {
    monthly_applications: Array<{
      month: string
      applications: number
      approved: number
      disbursed: number
      total_amount: number
    }>
  }
  top_customers: Array<{
    customer__id: number
    customer__first_name: string
    customer__last_name: string
    customer__customer_number: string
    loan_count: number
    total_borrowed: number
    total_outstanding: number
    total_repaid: number
  }>
}

export interface LoanApplicationCreatePayload {
  customer?: number
  loan_type: string
  amount_requested: number
  term_months: number
  purpose: string
  purpose_description: string
  monthly_income: number
  other_income?: number
  total_monthly_expenses: number
  existing_loans?: boolean
  existing_loan_amount?: number
  existing_loan_monthly?: number
  has_guarantors?: boolean
  guarantor_count?: number
  has_collateral?: boolean
  collateral_description?: string
  collateral_value?: number
  notes?: string
}

export interface CollateralCreatePayload {
  collateral_type: string
  description: string
  owner_name: string
  owner_id_number: string
  ownership_type: 'SOLE' | 'JOINT' | 'COMPANY' | 'FAMILY' | 'OTHER'
  estimated_value: number
  insured_value?: number
  insurance_company?: string
  insurance_policy_number?: string
  insurance_expiry?: string
  location: string
  registration_number?: string
  registration_date?: string
  registration_authority?: string
  notes?: string
}

/* =====================================================
 * Loans API Class
 * ===================================================== */

class LoansAPI {
  private baseURL = '/loans'

  /* ---- LOAN ENDPOINTS ---- */

  async getLoans(params?: {
    page?: number
    page_size?: number
    search?: string
    status?: string
    loan_type?: string
    risk_level?: string
    repayment_frequency?: string
    active?: boolean
    overdue?: boolean
    start_date?: string
    end_date?: string
    min_amount?: number
    max_amount?: number
    customer_id?: number
    ordering?: string
  }): Promise<LoanListResponse> {
    try {
      const response = await axiosInstance.get<LoanListResponse>(this.baseURL, {
        params,
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getLoan(id: number): Promise<Loan> {
    try {
      const response = await axiosInstance.get<Loan>(`${this.baseURL}/${id}/`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async createLoan(data: LoanCreatePayload): Promise<Loan> {
    try {
      const response = await axiosInstance.post<Loan>(`${this.baseURL}/create/`, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async updateLoan(id: number, data: LoanUpdatePayload): Promise<Loan> {
    try {
      const response = await axiosInstance.patch<Loan>(`${this.baseURL}/${id}/`, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async deleteLoan(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseURL}/${id}/`)
    } catch (error) {
      throw error
    }
  }

  async approveLoan(
    id: number,
    data: { approved_amount?: number; notes?: string }
  ): Promise<Loan> {
    try {
      const response = await axiosInstance.post<Loan>(`${this.baseURL}/${id}/approve/`, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async rejectLoan(id: number, data: { rejection_reason: string }): Promise<Loan> {
    try {
      const response = await axiosInstance.post<Loan>(`${this.baseURL}/${id}/reject/`, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async disburseLoan(
    id: number,
    data: { disbursement_amount?: number; disbursement_date?: string }
  ): Promise<Loan> {
    try {
      const response = await axiosInstance.post<Loan>(`${this.baseURL}/${id}/disburse/`, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async calculateLoan(data: LoanCalculatorPayload): Promise<LoanCalculatorResponse> {
    try {
      const response = await axiosInstance.post<LoanCalculatorResponse>(
        `${this.baseURL}/calculator/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getLoanStats(): Promise<LoanStats> {
    try {
      const response = await axiosInstance.get<LoanStats>(`${this.baseURL}/stats/`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async searchLoans(query: string, searchType?: string): Promise<Loan[]> {
    try {
      const response = await axiosInstance.get<{ results: Loan[] }>(`${this.baseURL}/search/`, {
        params: {
          q: query,
          type: searchType,
        },
      })
      return response.data.results
    } catch (error) {
      throw error
    }
  }

  async exportLoans(format: 'excel' | 'csv', filters?: any): Promise<Blob> {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/export/`, {
        params: {
          format,
          ...filters,
        },
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /* ---- LOAN APPLICATION ENDPOINTS ---- */

  async getLoanApplications(params?: {
    page?: number
    page_size?: number
    search?: string
    status?: string
    loan_type?: string
    risk_level?: string
    pending?: boolean
    my_applications?: boolean
    reviewer_id?: number
    start_date?: string
    end_date?: string
    ordering?: string
  }): Promise<LoanApplicationListResponse> {
    try {
      const response = await axiosInstance.get<LoanApplicationListResponse>(
        `${this.baseURL}/applications/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getLoanApplication(id: number): Promise<LoanApplication> {
    try {
      const response = await axiosInstance.get<LoanApplication>(
        `${this.baseURL}/applications/${id}/`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async createLoanApplication(data: LoanApplicationCreatePayload): Promise<LoanApplication> {
    try {
      const response = await axiosInstance.post<LoanApplication>(
        `${this.baseURL}/applications/create/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async updateLoanApplication(
    id: number,
    data: Partial<LoanApplicationCreatePayload>
  ): Promise<LoanApplication> {
    try {
      const response = await axiosInstance.patch<LoanApplication>(
        `${this.baseURL}/applications/${id}/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async deleteLoanApplication(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseURL}/applications/${id}/`)
    } catch (error) {
      throw error
    }
  }

  async submitLoanApplication(id: number): Promise<LoanApplication> {
    try {
      const response = await axiosInstance.post<LoanApplication>(
        `${this.baseURL}/applications/${id}/submit/`
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async reviewLoanApplication(
    id: number,
    data: { action: 'assign' | 'request_docs' | 'receive_docs' | 'credit_check'; notes?: string; score?: number }
  ): Promise<LoanApplication> {
    try {
      const response = await axiosInstance.post<LoanApplication>(
        `${this.baseURL}/applications/${id}/review/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async approveLoanApplication(
    id: number,
    data: { approved_amount?: number; interest_rate?: number; notes?: string }
  ): Promise<LoanApplication> {
    try {
      const response = await axiosInstance.post<LoanApplication>(
        `${this.baseURL}/applications/${id}/approve/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async rejectLoanApplication(
    id: number,
    data: { rejection_reason: string }
  ): Promise<LoanApplication> {
    try {
      const response = await axiosInstance.post<LoanApplication>(
        `${this.baseURL}/applications/${id}/reject/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  /* ---- COLLATERAL ENDPOINTS ---- */

  async getCollaterals(
    loanId: number,
    params?: {
      page?: number
      page_size?: number
      search?: string
      collateral_type?: string
      status?: string
      ownership_type?: string
    }
  ): Promise<CollateralListResponse> {
    try {
      const response = await axiosInstance.get<CollateralListResponse>(
        `${this.baseURL}/${loanId}/collateral/`,
        { params }
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getCollateral(id: number): Promise<Collateral> {
    try {
      const response = await axiosInstance.get<Collateral>(`${this.baseURL}/collateral/${id}/`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async createCollateral(
    loanId: number,
    data: CollateralCreatePayload
  ): Promise<Collateral> {
    try {
      const response = await axiosInstance.post<Collateral>(
        `${this.baseURL}/${loanId}/collateral/create/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async updateCollateral(id: number, data: Partial<CollateralCreatePayload>): Promise<Collateral> {
    try {
      const response = await axiosInstance.patch<Collateral>(
        `${this.baseURL}/collateral/${id}/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  async deleteCollateral(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseURL}/collateral/${id}/`)
    } catch (error) {
      throw error
    }
  }

  async releaseCollateral(id: number, data?: { release_date?: string }): Promise<Collateral> {
    try {
      const response = await axiosInstance.post<Collateral>(
        `${this.baseURL}/collateral/${id}/release/`,
        data
      )
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export const loansAPI = new LoansAPI()