// frontend/src/types/customers.ts
// ===== CUSTOMER TYPES =====
export interface Customer {
  id: string
  customer_number: string
  first_name: string
  last_name: string
  middle_name?: string
  full_name: string
  email?: string
  phone_number: string
  date_of_birth: string
  gender: 'M' | 'F' | 'O'
  id_number: string
  id_type: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE' | 'ALIEN_CARD'
  id_expiry_date?: string
  nationality: string
  physical_address: string
  postal_address?: string
  county: string
  sub_county: string
  ward?: string
  bank_name?: string
  bank_account_number?: string
  bank_branch?: string
  marital_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED'
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED' | 'DECEASED'
  credit_score: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  age: number
  is_active: boolean
  is_blacklisted: boolean
  total_loans: number
  active_loans: number
  total_loan_amount: number
  outstanding_balance: number
  loan_performance: number
  registration_date: string
  last_updated: string
  created_at: string
  updated_at: string
  notes?: string
  referred_by?: string
  user?: string
  created_by?: string
  updated_by?: string

  // Added document fields
  id_document?: string
  passport_photo?: string
  signature?: string
}

// ===== EMPLOYMENT TYPES =====
export interface Employment {
  id: string
  customer: string
  employment_type: 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'RETIRED'
  sector: string
  occupation: string
  employer_name?: string
  employer_address?: string
  employer_phone?: string
  employer_email?: string
  job_title?: string
  department?: string
  employee_number?: string
  date_employed?: string
  years_of_service: number
  monthly_income: number
  other_income: number
  total_monthly_income: number
  payment_frequency: string
  next_pay_date?: string
  business_name?: string
  business_type?: string
  business_registration?: string
  business_start_date?: string
  number_of_employees: number
  is_verified: boolean
  verification_date?: string
  verification_method?: string
  verification_notes?: string
  employment_letter?: string
  pay_slips?: string
  business_permit?: string
  notes?: string
  created_at: string
  updated_at: string
}

// ===== GUARANTOR TYPES =====
export interface Guarantor {
  id: string
  customer: string
  first_name: string
  middle_name?: string
  last_name: string
  full_name: string
  phone_number: string
  email?: string
  physical_address: string
  county: string
  id_type: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE'
  id_number: string
  guarantor_type: 'PERSONAL' | 'CORPORATE' | 'INSTITUTIONAL'
  relationship: 'SPOUSE' | 'PARENT' | 'SIBLING' | 'FRIEND' | 'COLLEAGUE' | 'RELATIVE' | 'OTHER'
  occupation: string
  employer?: string
  monthly_income: number
  id_document?: string
  passport_photo?: string
  is_active: boolean
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  is_verified?: boolean
  verification_date?: string
  verification_notes?: string
  notes?: string
  created_at: string
  updated_at: string
}

// ===== API RESPONSE TYPES =====
export interface CustomerListResponse {
  results: Customer[]
  count: number
  next: string | null
  previous: string | null
}

export interface CustomerDetailResponse extends Customer {
  loan_statistics?: {
    total_loans: number
    active_loans: number
    total_borrowed: number
    total_outstanding: number
    total_repaid: number
  }
  guarantors?: Guarantor[]
  employment?: Employment
}

export interface CustomerStatsResponse {
  total_customers: number
  active_customers: number
  blacklisted_customers: number
  new_customers_today: number
  gender_distribution: Array<{ gender: string; count: number }>
  status_distribution: Array<{ status: string; count: number }>
  top_counties: Array<{ county: string; count: number }>
  monthly_registrations: Array<{ month: string; count: number }>
  loan_statistics: {
    customers_with_loans: number
    customers_with_active_loans: number
    customers_with_overdue_loans: number
  }
}

/* ===== FORM DATA TYPES ===== */
export interface CustomerFormData {
  first_name: string
  last_name: string
  middle_name?: string
  date_of_birth: string
  gender: 'M' | 'F' | 'O'
  marital_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED'
  id_type: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE' | 'ALIEN_CARD'
  id_number: string
  id_expiry_date?: string
  nationality?: string
  phone_number: string
  email?: string
  postal_address?: string
  physical_address: string
  county: string
  sub_county: string
  ward?: string
  bank_name?: string
  bank_account_number?: string
  bank_branch?: string
  notes?: string
  referred_by?: string
  create_user_account?: boolean
  user_password?: string
}

/* Alias to align with other modules that import CustomerCreateData from the API types */
export type CustomerCreateData = CustomerFormData

export interface EmploymentFormData {
  employment_type: 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'RETIRED'
  sector: string
  occupation: string
  employer_name?: string
  employer_address?: string
  employer_phone?: string
  employer_email?: string
  job_title?: string
  department?: string
  employee_number?: string
  date_employed?: string
  monthly_income: number
  other_income: number
  payment_frequency: string
  next_pay_date?: string
  business_name?: string
  business_type?: string
  business_registration?: string
  business_start_date?: string
  number_of_employees: number
  notes?: string
}

export interface GuarantorFormData {
  first_name: string
  middle_name?: string
  last_name: string
  phone_number: string
  email?: string
  physical_address: string
  county: string
  id_type: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE'
  id_number: string
  guarantor_type: 'PERSONAL' | 'CORPORATE' | 'INSTITUTIONAL'
  relationship: 'SPOUSE' | 'PARENT' | 'SIBLING' | 'FRIEND' | 'COLLEAGUE' | 'RELATIVE' | 'OTHER'
  occupation: string
  employer?: string
  monthly_income: number
  notes?: string
}

// ===== FILTER TYPES =====
export interface CustomerFilters {
  search?: string
  status?: string
  gender?: string
  marital_status?: string
  county?: string
  risk_level?: string
  active?: boolean | string
  blacklisted?: boolean | string
  has_loans?: boolean | string
  start_date?: string
  end_date?: string
}

// ===== SEARCH TYPES =====
export type SearchType = 'basic' | 'name' | 'phone' | 'id' | 'customer_number'

// ===== CONSTANTS =====

export const NATIONALITY_OPTIONS = [
  { value: 'KENYAN', label: 'Kenyan' },
  { value: 'OTHER', label: 'Other' },
]

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
]

export const ID_TYPE_OPTIONS = [
  { value: 'NATIONAL_ID', label: 'National ID' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENSE', label: 'Driving License' },
  { value: 'ALIEN_CARD', label: 'Alien Card' },
]

export const GUARANTOR_TYPE_OPTIONS = [
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'INSTITUTIONAL', label: 'Institutional' },
]

export const RELATIONSHIP_OPTIONS = [
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'SIBLING', label: 'Sibling' },
  { value: 'FRIEND', label: 'Friend' },
  { value: 'COLLEAGUE', label: 'Colleague' },
  { value: 'RELATIVE', label: 'Relative' },
  { value: 'OTHER', label: 'Other' },
]

export const MARITAL_STATUS_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
  { value: 'SEPARATED', label: 'Separated' },
]

export const CUSTOMER_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLACKLISTED', label: 'Blacklisted' },
  { value: 'DECEASED', label: 'Deceased' },
]

export const RISK_LEVEL_OPTIONS = [
  { value: 'LOW', label: 'Low Risk' },
  { value: 'MEDIUM', label: 'Medium Risk' },
  { value: 'HIGH', label: 'High Risk' },
]

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'EMPLOYED', label: 'Employed' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'UNEMPLOYED', label: 'Unemployed' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'RETIRED', label: 'Retired' },
]

export const SECTOR_OPTIONS = [
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'PRIVATE', label: 'Private Sector' },
  { value: 'NGO', label: 'Non-Governmental Organization' },
  { value: 'INFORMAL', label: 'Informal Sector' },
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'CONSTRUCTION', label: 'Construction' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'OTHER', label: 'Other' },
]

export const PAYMENT_FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' },
  { value: 'IRREGULAR', label: 'Irregular' },
]

// ===== HELPER FUNCTIONS =====

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ''
  // Ensure phone starts with +254
  if (phone.startsWith('0')) {
    return '+254' + phone.substring(1)
  }
  if (phone.startsWith('254')) {
    return '+' + phone
  }
  return phone
}

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'INACTIVE':
      return 'warning'
    case 'BLACKLISTED':
      return 'error'
    case 'DECEASED':
      return 'default'
    default:
      return 'default'
  }
}

export const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'LOW':
      return 'success'
    case 'MEDIUM':
      return 'warning'
    case 'HIGH':
      return 'error'
    default:
      return 'default'
  }
}

export const getVerificationStatusColor = (status: string): string => {
  switch (status) {
    case 'VERIFIED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'REJECTED':
      return 'error'
    default:
      return 'default'
  }
}

// Ensure these helper / alias types exist
export type CustomerUpdateData = Partial<CustomerCreateData>
export type EmploymentCreateData = EmploymentFormData
export type GuarantorCreateData = GuarantorFormData