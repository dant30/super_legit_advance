// frontend/src/lib/api/repayments.ts
import axiosInstance from '@/lib/axios'

/* =====================================================
 * Core Types
 * ===================================================== */

export type RepaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'OVERDUE'
  | 'PARTIAL'
  | 'WAIVED'

export type ScheduleStatus =
  | 'PENDING'
  | 'PAID'
  | 'OVERDUE'
  | 'SKIPPED'
  | 'ADJUSTED'
  | 'CANCELLED'

export type PenaltyStatus =
  | 'PENDING'
  | 'APPLIED'
  | 'WAIVED'
  | 'CANCELLED'
  | 'PAID'

export type PaymentMethod =
  | 'MPESA'
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'CREDIT_CARD'
  | 'OTHER'

export type RepaymentType =
  | 'PRINCIPAL'
  | 'INTEREST'
  | 'PENALTY'
  | 'FEE'
  | 'FULL'
  | 'PARTIAL'

export type PenaltyType =
  | 'LATE_PAYMENT'
  | 'DEFAULT'
  | 'EARLY_REPAYMENT'
  | 'ADMINISTRATIVE'
  | 'OTHER'

/* =====================================================
 * Main Interfaces
 * ===================================================== */

export interface Repayment {
  id: number
  repayment_number: string
  loan: number
  loan_number: string
  customer: number
  customer_name: string
  customer_number: string
  amount_due: number
  amount_paid: number
  amount_outstanding: number
  principal_amount: number
  interest_amount: number
  penalty_amount: number
  fee_amount: number
  payment_method: PaymentMethod
  repayment_type: RepaymentType
  status: RepaymentStatus
  due_date: string
  payment_date?: string
  scheduled_date?: string
  payment_reference: string
  transaction_id: string
  days_overdue: number
  late_fee_applied: boolean
  notes: string
  receipt_number: string
  collected_by?: number
  collected_by_name?: string
  verified_by?: number
  verified_by_name?: string
  verification_date?: string
  created_at: string
  updated_at: string
  is_paid: boolean
  is_overdue: boolean
  is_partial: boolean
  payment_percentage: number
  payment_status: string
}

export interface RepaymentSchedule {
  id: number
  loan: number
  loan_number: string
  customer: number
  customer_name: string
  customer_number: string
  installment_number: number
  due_date: string
  principal_amount: number
  interest_amount: number
  total_amount: number
  status: ScheduleStatus
  amount_paid: number
  amount_outstanding: number
  payment_date?: string
  days_overdue: number
  late_fee: number
  repayment?: number
  repayment_details?: Repayment
  is_adjusted: boolean
  adjustment_reason: string
  original_due_date?: string
  original_amount?: number
  notes: string
  is_paid: boolean
  is_overdue: boolean
  is_upcoming: boolean
  payment_percentage: number
  remaining_balance: number
  created_at: string
  updated_at: string
}

export interface Penalty {
  id: number
  penalty_number: string
  loan: number
  loan_number: string
  customer: number
  customer_name: string
  customer_number: string
  repayment?: number
  repayment_details?: Repayment
  penalty_type: PenaltyType
  amount: number
  reason: string
  status: PenaltyStatus
  calculation_method: string
  calculation_rate: number
  days_overdue: number
  base_amount?: number
  applied_date: string
  due_date: string
  paid_date?: string
  amount_paid: number
  amount_outstanding: number
  waived_by?: number
  waived_by_name?: string
  waiver_reason: string
  waiver_date?: string
  applied_by: number
  applied_by_name: string
  notes: string
  is_paid: boolean
  is_overdue: boolean
  days_until_due: number
  created_at: string
  updated_at: string
}

/* =====================================================
 * Pagination
 * ===================================================== */

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/* =====================================================
 * Request Interfaces
 * ===================================================== */

export interface CreateRepaymentRequest {
  loan: number
  amount_due: number
  principal_amount?: number
  interest_amount?: number
  penalty_amount?: number
  fee_amount?: number
  payment_method?: PaymentMethod
  repayment_type?: RepaymentType
  due_date: string
  scheduled_date?: string
  payment_reference?: string
  notes?: string
  receipt_file?: File
}

export interface ProcessRepaymentRequest {
  amount: number
  payment_method: PaymentMethod
  reference?: string
}

export interface CreatePenaltyRequest {
  loan: number
  repayment?: number
  penalty_type: PenaltyType
  amount: number
  reason: string
  calculation_method?: string
  calculation_rate?: number
  days_overdue?: number
  base_amount?: number
  due_date?: string
  notes?: string
}

/* =====================================================
 * Response Interfaces
 * ===================================================== */

export interface DashboardStats {
  overview: {
    total_repayments: number
    total_amount_paid: number
    monthly_repayments: number
    monthly_amount: number
    today_repayments: number
    today_amount: number
  }
  status_breakdown: Array<{
    status: string
    count: number
    amount: number
  }>
  method_breakdown: Array<{
    payment_method: string
    count: number
    amount: number
  }>
  overdue: {
    count: number
    amount: number
    average_days_overdue: number
  }
  upcoming: {
    count: number
    amount: number
  }
  top_collectors: Array<{
    collected_by__email: string
    collected_by__first_name: string
    collected_by__last_name: string
    count: number
    amount: number
  }>
  monthly_trend: Array<{
    month: string
    count: number
    amount: number
  }>
}

/* =====================================================
 * API Class
 * ===================================================== */

class RepaymentsAPI {
  private baseURL = '/repayments'

  /* -----------------------------
   * Repayments
   * ----------------------------- */

  async getRepayments(params?: {
    page?: number
    page_size?: number
    search?: string
    status?: RepaymentStatus
    payment_method?: PaymentMethod
    repayment_type?: RepaymentType
    loan_id?: number
    customer_id?: number
    start_date?: string
    end_date?: string
    due_start?: string
    due_end?: string
    min_amount?: number
    max_amount?: number
    overdue?: boolean
    collected_by?: number
    ordering?: string
  }): Promise<PaginatedResponse<Repayment>> {
    const response = await axiosInstance.get<PaginatedResponse<Repayment>>(
      this.baseURL,
      { params }
    )
    return response.data
  }

  async getRepayment(id: number): Promise<Repayment> {
    const response = await axiosInstance.get<Repayment>(
      `${this.baseURL}/${id}/`
    )
    return response.data
  }

  async createRepayment(data: CreateRepaymentRequest): Promise<Repayment> {
    const formData = new FormData()
    
    // Append all fields to form data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'receipt_file' && value instanceof File) {
          formData.append(key, value)
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    const response = await axiosInstance.post<Repayment>(
      `${this.baseURL}/create/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  }

  async updateRepayment(id: number, data: Partial<Repayment>): Promise<Repayment> {
    const response = await axiosInstance.patch<Repayment>(
      `${this.baseURL}/${id}/`,
      data
    )
    return response.data
  }

  async deleteRepayment(id: number): Promise<void> {
    await axiosInstance.delete(`${this.baseURL}/${id}/`)
  }

  async processRepayment(id: number, data: ProcessRepaymentRequest): Promise<Repayment> {
    const response = await axiosInstance.post<Repayment>(
      `${this.baseURL}/${id}/process/`,
      data
    )
    return response.data
  }

  async waiveRepayment(id: number, data: { amount: number; reason: string }): Promise<Repayment> {
    const response = await axiosInstance.post<Repayment>(
      `${this.baseURL}/${id}/waive/`,
      data
    )
    return response.data
  }

  async cancelRepayment(id: number, data: { reason: string }): Promise<Repayment> {
    const response = await axiosInstance.post<Repayment>(
      `${this.baseURL}/${id}/cancel/`,
      data
    )
    return response.data
  }

  /* -----------------------------
   * Customer Repayments
   * ----------------------------- */

  async getCustomerRepayments(
    customerId: number,
    params?: {
      page?: number
      page_size?: number
      status?: RepaymentStatus
      start_date?: string
      end_date?: string
    }
  ): Promise<PaginatedResponse<Repayment>> {
    const response = await axiosInstance.get<PaginatedResponse<Repayment>>(
      `${this.baseURL}/customer/${customerId}/`,
      { params }
    )
    return response.data
  }

  /* -----------------------------
   * Loan Repayments
   * ----------------------------- */

  async getLoanRepayments(
    loanId: number,
    params?: {
      page?: number
      page_size?: number
      status?: RepaymentStatus
    }
  ): Promise<PaginatedResponse<Repayment>> {
    const response = await axiosInstance.get<PaginatedResponse<Repayment>>(
      `${this.baseURL}/loan/${loanId}/`,
      { params }
    )
    return response.data
  }

  /* -----------------------------
   * Repayment Schedules
   * ----------------------------- */

  async getSchedules(
    loanId: number,
    params?: {
      page?: number
      page_size?: number
      status?: ScheduleStatus
      overdue?: boolean
    }
  ): Promise<PaginatedResponse<RepaymentSchedule>> {
    const response = await axiosInstance.get<PaginatedResponse<RepaymentSchedule>>(
      `${this.baseURL}/loan/${loanId}/schedule/`,
      { params }
    )
    return response.data
  }

  async generateSchedule(loanId: number): Promise<RepaymentSchedule[]> {
    const response = await axiosInstance.post<RepaymentSchedule[]>(
      `${this.baseURL}/loan/${loanId}/schedule/generate/`,
      {}
    )
    return response.data
  }

  async adjustSchedule(
    scheduleId: number,
    data: {
      new_due_date?: string
      new_amount?: number
      reason: string
    }
  ): Promise<RepaymentSchedule> {
    const response = await axiosInstance.post<RepaymentSchedule>(
      `${this.baseURL}/schedule/${scheduleId}/adjust/`,
      data
    )
    return response.data
  }

  /* -----------------------------
   * Penalties
   * ----------------------------- */

  async getPenalties(params?: {
    page?: number
    page_size?: number
    search?: string
    status?: PenaltyStatus
    penalty_type?: PenaltyType
    loan_id?: number
    customer_id?: number
    start_date?: string
    end_date?: string
    overdue?: boolean
  }): Promise<PaginatedResponse<Penalty>> {
    const response = await axiosInstance.get<PaginatedResponse<Penalty>>(
      `${this.baseURL}/penalties/`,
      { params }
    )
    return response.data
  }

  async getPenalty(id: number): Promise<Penalty> {
    const response = await axiosInstance.get<Penalty>(
      `${this.baseURL}/penalties/${id}/`
    )
    return response.data
  }

  async createPenalty(data: CreatePenaltyRequest): Promise<Penalty> {
    const response = await axiosInstance.post<Penalty>(
      `${this.baseURL}/penalties/create/`,
      data
    )
    return response.data
  }

  async applyPenalty(id: number): Promise<Penalty> {
    const response = await axiosInstance.post<Penalty>(
      `${this.baseURL}/penalties/${id}/apply/`,
      {}
    )
    return response.data
  }

  async waivePenalty(id: number, data: { reason: string }): Promise<Penalty> {
    const response = await axiosInstance.post<Penalty>(
      `${this.baseURL}/penalties/${id}/waive/`,
      data
    )
    return response.data
  }

  /* -----------------------------
   * Special Views
   * ----------------------------- */

  async getOverdueRepayments(params?: {
    page?: number
    page_size?: number
    min_days?: number
    max_days?: number
    start_date?: string
    end_date?: string
  }): Promise<PaginatedResponse<Repayment>> {
    const response = await axiosInstance.get<PaginatedResponse<Repayment>>(
      `${this.baseURL}/overdue/`,
      { params }
    )
    return response.data
  }

  async getUpcomingRepayments(params?: {
    page?: number
    page_size?: number
    customer_id?: number
  }): Promise<PaginatedResponse<Repayment>> {
    const response = await axiosInstance.get<PaginatedResponse<Repayment>>(
      `${this.baseURL}/upcoming/`,
      { params }
    )
    return response.data
  }

  /* -----------------------------
   * Dashboard & Statistics
   * ----------------------------- */

  async getStats(): Promise<any> {
    const response = await axiosInstance.get(`${this.baseURL}/stats/`)
    return response.data
  }

  async getDashboard(): Promise<DashboardStats> {
    const response = await axiosInstance.get(`${this.baseURL}/dashboard/`)
    return response.data
  }

  /* -----------------------------
   * Bulk Operations
   * ----------------------------- */

  async bulkCreateRepayments(data: { repayments: CreateRepaymentRequest[] }): Promise<{
    message: string
    created_count: number
    error_count: number
    errors?: string[]
  }> {
    const response = await axiosInstance.post(
      `${this.baseURL}/bulk-create/`,
      data
    )
    return response.data
  }

  async sendReminders(data: {
    type: 'upcoming' | 'overdue'
    customer_id?: number
    loan_id?: number
  }): Promise<{
    message: string
    sent_count: number
    failed_count: number
  }> {
    const response = await axiosInstance.post(
      `${this.baseURL}/reminders/`,
      data
    )
    return response.data
  }

  /* -----------------------------
   * Export
   * ----------------------------- */

  async exportRepayments(params?: {
    format?: 'excel' | 'csv'
    status?: RepaymentStatus
    start_date?: string
    end_date?: string
  }): Promise<Blob> {
    const response = await axiosInstance.get(
      `${this.baseURL}/export/`,
      {
        params,
        responseType: 'blob',
      }
    )
    return response.data
  }

  /* -----------------------------
   * Search
   * ----------------------------- */

  async searchRepayments(params: {
    q: string
    type?: 'basic' | 'repayment_number' | 'loan_number' | 'customer_name' | 'customer_number' | 'phone' | 'reference'
  }): Promise<PaginatedResponse<Repayment>> {
    const response = await axiosInstance.get<PaginatedResponse<Repayment>>(
      `${this.baseURL}/search/`,
      { params }
    )
    return response.data
  }
}

/* =====================================================
 * Export singleton
 * ===================================================== */

export const repaymentsAPI = new RepaymentsAPI()
