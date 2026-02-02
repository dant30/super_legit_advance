// frontend/src/hooks/useAuth.js - OPTIMIZED CUSTOM HOOK
import { useContext } from 'react'
import { AuthContext } from '@contexts/AuthContext'

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context value
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  // Note: Your AuthContext already includes these methods:
  // - hasRole()
  // - isAdmin()
  // - isStaff()
  // - isCustomer()
  // - isOfficer()
  // So we don't need to redefine them here
  
  return context
}

/**
 * Hook to check if user has specific role
 * @param {string|string[]} role - Role or array of roles to check
 * @returns {boolean} Whether user has the role
 */
export function useHasRole(role) {
  const { hasRole, user } = useAuth()
  return user ? hasRole(role) : false
}

/**
 * Hook to check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} Whether user has the permission
 */
export function useHasPermission(permission) {
  const { hasPermission, user } = useAuth()
  return user ? hasPermission(permission) : false
}

/**
 * Hook to check if user is admin
 * @returns {boolean} Whether user is admin
 */
export function useIsAdmin() {
  const { isAdmin, user } = useAuth()
  return user ? isAdmin() : false
}

/**
 * Hook to check if user is staff (admin, staff, or officer)
 * @returns {boolean} Whether user is staff
 */
export function useIsStaff() {
  const { isStaff, user } = useAuth()
  return user ? isStaff() : false
}

/**
 * Hook to check if user is officer
 * @returns {boolean} Whether user is officer
 */
export function useIsOfficer() {
  const { isOfficer, user } = useAuth()
  return user ? isOfficer() : false
}

/**
 * Hook to check if user is customer
 * @returns {boolean} Whether user is customer
 */
export function useIsCustomer() {
  const { isCustomer, user } = useAuth()
  return user ? isCustomer() : false
}

/**
 * Hook to check if user can approve loan amount
 * @param {number} amount - Loan amount to check
 * @returns {boolean} Whether user can approve the amount
 */
export function useCanApproveLoanAmount(amount) {
  const { canApproveLoanAmount, user } = useAuth()
  return user ? canApproveLoanAmount(amount) : false
}

/**
 * Hook to get user's approval tier limits
 * @returns {Object|null} Approval limits or null if not staff
 */
export function useApprovalLimits() {
  const { user } = useAuth()
  
  if (!user?.staff_profile) return null
  
  return {
    maxLoanAmount: user.staff_profile.max_loan_approval_amount,
    canApproveLoans: user.staff_profile.can_approve_loans,
    canManageCustomers: user.staff_profile.can_manage_customers,
    canProcessPayments: user.staff_profile.can_process_payments,
    canGenerateReports: user.staff_profile.can_generate_reports,
    approvalTier: user.staff_profile.approval_tier,
  }
}

/**
 * Hook to get user's staff profile
 * @returns {Object|null} Staff profile or null if not staff
 */
export function useStaffProfile() {
  const { user } = useAuth()
  return user?.staff_profile || null
}

/**
 * Hook to get user's authentication status
 * @returns {Object} Authentication status object
 */
export function useAuthStatus() {
  const { 
    isAuthenticated, 
    isLoading, 
    isVerified, 
    isLocked, 
    requires2FA,
    isStaffAvailable,
    isStaffOnLeave,
    user
  } = useAuth()
  
  return {
    isAuthenticated,
    isLoading,
    isVerified,
    isLocked,
    requires2FA,
    isStaffAvailable,
    isStaffOnLeave,
    hasStaffProfile: !!user?.staff_profile,
    role: user?.role,
  }
}

/**
 * Hook to check if user is verified (email, phone, KYC)
 * @returns {Object} Verification status object
 */
export function useVerificationStatus() {
  const { user } = useAuth()
  
  if (!user) {
    return {
      isVerified: false,
      emailVerified: false,
      phoneVerified: false,
      kycCompleted: false,
      allVerified: false,
    }
  }
  
  return {
    isVerified: user.is_verified || false,
    emailVerified: user.email_verified || false,
    phoneVerified: user.phone_verified || false,
    kycCompleted: user.kyc_completed || false,
    allVerified: (user.email_verified && user.phone_verified && user.kyc_completed) || false,
  }
}

/**
 * Hook to check if user can access specific feature
 * @param {string} feature - Feature to check (e.g., 'loans', 'customers', 'reports')
 * @returns {boolean} Whether user can access the feature
 */
export function useCanAccessFeature(feature) {
  const { user, hasPermission } = useAuth()
  
  if (!user) return false
  
  // Admin can access everything
  if (user.is_superuser || user.role === 'admin') return true
  
  // Map features to permissions
  const featurePermissions = {
    loans: ['can_approve_loans', 'view_own_loans'],
    customers: ['can_manage_customers'],
    repayments: ['can_process_payments', 'make_payments'],
    reports: ['can_generate_reports'],
    settings: user.is_staff,
    dashboard: true, // Everyone can see dashboard
  }
  
  const permissions = featurePermissions[feature]
  
  if (typeof permissions === 'boolean') {
    return permissions
  }
  
  if (Array.isArray(permissions)) {
    return permissions.some(permission => hasPermission(permission))
  }
  
  return false
}

/**
 * Hook to check if user can perform action on resource
 * @param {string} action - Action to perform (e.g., 'create', 'read', 'update', 'delete')
 * @param {string} resource - Resource type (e.g., 'loan', 'customer', 'repayment')
 * @returns {boolean} Whether user can perform the action
 */
export function useCanPerform(action, resource) {
  const { user, hasPermission } = useAuth()
  
  if (!user) return false
  
  // Admin can do everything
  if (user.is_superuser || user.role === 'admin') return true
  
  // Customer permissions
  if (user.role === 'customer') {
    const customerPermissions = {
      loan: {
        read: ['view_own_loans'],
        create: ['apply_for_loans'],
      },
      repayment: {
        read: ['view_own_repayments'],
        create: ['make_payments'],
      },
      customer: {
        read: ['view_own_profile'],
        update: ['update_own_profile'],
      },
    }
    
    const resourcePerms = customerPermissions[resource]
    if (!resourcePerms) return false
    
    const actionPerms = resourcePerms[action]
    if (!actionPerms) return false
    
    return actionPerms.some(permission => hasPermission(permission))
  }
  
  // Staff permissions
  if (['staff', 'officer'].includes(user.role)) {
    const staffPermissions = {
      loan: {
        create: ['can_approve_loans'],
        read: ['can_approve_loans'],
        update: ['can_approve_loans'],
        delete: user.is_staff, // Only some staff can delete
      },
      customer: {
        create: ['can_manage_customers'],
        read: ['can_manage_customers'],
        update: ['can_manage_customers'],
        delete: user.is_staff,
      },
      repayment: {
        create: ['can_process_payments'],
        read: ['can_process_payments'],
        update: ['can_process_payments'],
        delete: user.is_staff,
      },
      report: {
        read: ['can_generate_reports'],
        create: ['can_generate_reports'],
      },
    }
    
    const resourcePerms = staffPermissions[resource]
    if (!resourcePerms) return false
    
    const actionPerms = resourcePerms[action]
    if (typeof actionPerms === 'boolean') return actionPerms
    
    if (Array.isArray(actionPerms)) {
      return actionPerms.some(permission => hasPermission(permission))
    }
    
    return false
  }
  
  return false
}

export default useAuth