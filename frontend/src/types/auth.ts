// frontend/src/types/auth.ts - COMPREHENSIVE AUTH TYPES
import type { StaffProfile } from './auth'

export type UserRole = 'admin' | 'staff' | 'officer' | 'customer'
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended'
export type Gender = 'M' | 'F' | 'O'
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED'
export type Language = 'en' | 'sw'
export type TwoFactorMethod = 'sms' | 'email' | 'app'

export interface User {
  // Identifiers
  id: string
  email: string
  phone_number: string

  // Personal Information
  first_name: string
  last_name: string
  full_name: string
  id_number?: string
  date_of_birth?: string
  gender?: Gender
  marital_status?: MaritalStatus

  // Role & Status
  role: UserRole
  status: UserStatus

  // Verification Flags
  is_verified: boolean
  email_verified: boolean
  phone_verified: boolean
  kyc_completed?: boolean

  // Django Auth Flags
  is_staff: boolean
  is_superuser?: boolean
  is_active: boolean

  // Security
  last_login_ip?: string
  last_login_at?: string
  failed_login_attempts?: number
  locked_until?: string

  // 2FA
  two_factor_enabled?: boolean
  two_factor_method?: TwoFactorMethod

  // Profile
  profile_picture?: string
  bio?: string

  // Preferences
  language?: Language
  notifications_enabled?: boolean
  marketing_emails?: boolean

  // Metadata
  last_password_change?: string
  terms_accepted?: boolean
  privacy_policy_accepted?: boolean
  created_at: string
  updated_at: string
  date_joined?: string
}

export interface LoginCredentials {
  email?: string
  phone_number?: string
  username?: string
  password: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export interface TokenRefreshResponse {
  access: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  uid: string
  token: string
  password: string
  confirm_password: string
}

export interface PasswordChange {
  current_password: string
  new_password: string
  confirm_new_password: string
}

export interface EmailVerification {
  uid: string
  token: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  successMessage: string | null
}

export interface StaffProfile {
  id: string
  user_id: string
  employee_id: string
  department: string
  position: string
  hire_date?: string
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern'
  supervisor_id?: string
  supervisor_name?: string
  approval_tier: 'junior' | 'senior' | 'manager' | 'director'
  can_approve_loans: boolean
  can_manage_customers: boolean
  can_process_payments: boolean
  can_generate_reports: boolean
  max_loan_approval_amount?: number
  is_available: boolean
  work_phone?: string
  work_email?: string
  performance_rating?: number
  performance_level?: string
  is_on_leave?: boolean
  created_at: string
  updated_at: string
}