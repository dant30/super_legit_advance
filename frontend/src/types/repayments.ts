// frontend/src/types/repayments.ts
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
  is_adjusted: boolean
  adjustment_reason: string
  original_due_date?: string
  original_amount?: number
  notes: string
  created_at: string
  updated_at: string
  is_paid: boolean
  is_overdue: boolean
  is_upcoming: boolean
  payment_percentage: number
  remaining_balance: number
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
  created_at: string
  updated_at: string
  is_paid: boolean
  is_overdue: boolean
  days_until_due: number
}

// Pagination interface
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Dashboard statistics
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
    amount_due: number
    amount_paid: number
    amount_outstanding: number
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

// Request interfaces
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