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

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending Approval',
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

export const LOAN_APPLICATION_STATUS_LABELS: Record<LoanApplicationStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  DOCUMENTS_REQUESTED: 'Documents Requested',
  DOCUMENTS_RECEIVED: 'Documents Received',
  CREDIT_CHECK: 'Credit Check',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
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

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  LOW: 'Low Risk',
  MEDIUM: 'Medium Risk',
  HIGH: 'High Risk',
}

export const COLLATERAL_TYPE_LABELS: Record<CollateralType, string> = {
  LAND: 'Land',
  BUILDING: 'Building',
  VEHICLE: 'Vehicle',
  EQUIPMENT: 'Equipment',
  INVENTORY: 'Inventory',
  RECEIVABLES: 'Accounts Receivable',
  SAVINGS: 'Savings Account',
  INSURANCE: 'Insurance Policy',
  SHARES: 'Shares/Stocks',
  BONDS: 'Bonds',
  GOLD: 'Gold/Jewelry',
  OTHER: 'Other',
}

export const COLLATERAL_STATUS_LABELS: Record<CollateralStatus, string> = {
  ACTIVE: 'Active',
  RELEASED: 'Released',
  FORECLOSED: 'Foreclosed',
  SOLD: 'Sold',
  DAMAGED: 'Damaged',
  LOST: 'Lost',
  OTHER: 'Other',
}

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