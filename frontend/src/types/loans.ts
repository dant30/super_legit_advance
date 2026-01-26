// frontend/src/types/loans.ts
// frontend/src/types/loans.ts
export type LoanStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DEFAULTED'
  | 'OVERDUE'
  | 'WRITTEN_OFF'
  | 'CANCELLED'

export type LoanApplicationStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_REQUESTED'
  | 'DOCUMENTS_RECEIVED'
  | 'CREDIT_CHECK'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

export type LoanType = 
  | 'PERSONAL'
  | 'BUSINESS'
  | 'SALARY'
  | 'EMERGENCY'
  | 'ASSET_FINANCING'
  | 'EDUCATION'
  | 'AGRICULTURE'

export type Purpose = 
  | 'MEDICAL'
  | 'EDUCATION'
  | 'BUSINESS_CAPITAL'
  | 'HOME_IMPROVEMENT'
  | 'DEBT_CONSOLIDATION'
  | 'VEHICLE_PURCHASE'
  | 'RENT'
  | 'UTILITIES'
  | 'TRAVEL'
  | 'WEDDING'
  | 'OTHER'

export type InterestType = 
  | 'FIXED'
  | 'REDUCING_BALANCE'
  | 'FLAT_RATE'

export type RepaymentFrequency = 
  | 'DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'BIANNUAL'
  | 'ANNUAL'
  | 'BULLET'

export type RiskLevel = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'

export type CollateralType = 
  | 'LAND'
  | 'BUILDING'
  | 'VEHICLE'
  | 'EQUIPMENT'
  | 'INVENTORY'
  | 'RECEIVABLES'
  | 'SAVINGS'
  | 'INSURANCE'
  | 'SHARES'
  | 'BONDS'
  | 'GOLD'
  | 'OTHER'

export type CollateralStatus = 
  | 'ACTIVE'
  | 'RELEASED'
  | 'FORECLOSED'
  | 'SOLD'
  | 'DAMAGED'
  | 'LOST'
  | 'OTHER'

export type OwnershipType = 
  | 'SOLE'
  | 'JOINT'
  | 'COMPANY'
  | 'FAMILY'
  | 'OTHER'

export interface AmortizationScheduleEntry {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export interface LoanCalculatorResult {
  installment_amount: number
  total_interest: number
  total_amount_due: number
  amortization_schedule: AmortizationScheduleEntry[]
  processing_fee: number
  net_disbursement: number
}

export interface AffordabilityAnalysis {
  proposed_installment: number
  installment_to_income_ratio: number
  obligations_to_income_ratio: number
  affordability_score: number
  affordability_level: 'GOOD' | 'MODERATE' | 'POOR'
  recommendation: 'Approve' | 'Review' | 'Reject'
}

export interface LoanFilterOptions {
  status?: LoanStatus
  loan_type?: LoanType
  risk_level?: RiskLevel
  repayment_frequency?: RepaymentFrequency
  search?: string
  customer_id?: number
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
  active?: boolean
  overdue?: boolean
  page?: number
  page_size?: number
  ordering?: string
}

export interface LoanApplicationFilterOptions {
  status?: LoanApplicationStatus
  loan_type?: LoanType
  risk_level?: RiskLevel
  search?: string
  pending?: boolean
  my_applications?: boolean
  reviewer_id?: number
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
  ordering?: string
}

export interface LoanStatsSummary {
  total_loans: number
  total_active_loans: number
  total_overdue_loans: number
  total_completed_loans: number
  total_amount_approved: number
  total_amount_disbursed: number
  total_outstanding_balance: number
  total_amount_repaid: number
  average_loan_size: number
  repayment_rate: number
  overdue_rate: number
}

export interface DistributionItem {
  status?: string
  loan_type?: string
  risk_level?: string
  count: number
  total_amount: number
}

export interface MonthlyTrend {
  month: string
  applications: number
  approved: number
  disbursed: number
}

export interface TopCustomer {
  customer_id: number
  customer_name: string
  customer_number: string
  loan_count: number
  total_borrowed: number
  total_outstanding: number
}

export interface LoanStatistics {
  summary: LoanStatsSummary
  distributions: {
    status: DistributionItem[]
    loan_type: DistributionItem[]
    risk_level: DistributionItem[]
  }
  trends: {
    monthly_applications: MonthlyTrend[]
  }
  top_customers: TopCustomer[]
}

// Status badge colors
export const LOAN_STATUS_COLORS: Record<LoanStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  ACTIVE: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  DEFAULTED: 'bg-red-100 text-red-800',
  OVERDUE: 'bg-orange-100 text-orange-800',
  WRITTEN_OFF: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  DEFAULTED: 'Defaulted',
  OVERDUE: 'Overdue',
  WRITTEN_OFF: 'Written Off',
  CANCELLED: 'Cancelled',
}

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  PERSONAL: 'Personal Loan',
  BUSINESS: 'Business Loan',
  SALARY: 'Salary Advance',
  EMERGENCY: 'Emergency Loan',
  ASSET_FINANCING: 'Asset Financing',
  EDUCATION: 'Education Loan',
  AGRICULTURE: 'Agricultural Loan',
}

export const PURPOSE_LABELS: Record<Purpose, string> = {
  MEDICAL: 'Medical Expenses',
  EDUCATION: 'Education Fees',
  BUSINESS_CAPITAL: 'Business Capital',
  HOME_IMPROVEMENT: 'Home Improvement',
  DEBT_CONSOLIDATION: 'Debt Consolidation',
  VEHICLE_PURCHASE: 'Vehicle Purchase',
  RENT: 'Rent Payment',
  UTILITIES: 'Utilities',
  TRAVEL: 'Travel',
  WEDDING: 'Wedding',
  OTHER: 'Other',
}

export const INTEREST_TYPE_LABELS: Record<InterestType, string> = {
  FIXED: 'Fixed Interest',
  REDUCING_BALANCE: 'Reducing Balance',
  FLAT_RATE: 'Flat Rate',
}

export const REPAYMENT_FREQUENCY_LABELS: Record<RepaymentFrequency, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  BIANNUAL: 'Bi-Annual',
  ANNUAL: 'Annual',
  BULLET: 'Bullet Payment',
}

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  LOW: 'Low Risk',
  MEDIUM: 'Medium Risk',
  HIGH: 'High Risk',
}