// frontend/src/hooks/useAuth.ts - OPTIMIZED CUSTOM HOOK
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/store/store'
import {
  login as loginAction,
  logout as logoutAction,
  checkAuth as checkAuthAction,
  clearError,
  clearSuccessMessage,
  changePassword as changePasswordAction,
  updateProfile as updateProfileAction,
} from '@/store/slices/authSlice'
import type { User, LoginCredentials, PasswordChange } from '@/types/auth'

interface UseAuthReturn {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  successMessage: string | null

  // Methods
  login: (credentials: LoginCredentials) => Promise<any>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
  clearSuccess: () => void

  // Permission checks
  hasRole: (role: UserRole | UserRole[]) => boolean
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
  isStaff: () => boolean
  isOfficer: () => boolean
  isCustomer: () => boolean

  // Profile management
  updateProfile: (data: Partial<User>) => Promise<any>
  changePassword: (data: PasswordChange) => Promise<any>

  // Status checks
  isVerified: () => boolean
  isLocked: () => boolean
  requires2FA: () => boolean

  // Staff-specific checks
  canApproveLoanAmount: (amount: number) => boolean
  isStaffAvailable: () => boolean
  isStaffOnLeave: () => boolean
}

type UserRole = 'admin' | 'staff' | 'officer' | 'customer'

export const useAuth = (): UseAuthReturn => {
  const dispatch = useDispatch<AppDispatch>()

  const authState = useSelector((state: RootState) => state.auth)

  /**
   * Initialize auth on app load
   */
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token && !authState.user) {
      dispatch(checkAuthAction())
    }
  }, [dispatch, authState.user])

  /**
   * Login with email, phone, or username
   */
  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      return dispatch(loginAction(credentials))
    },
    [dispatch]
  )

  /**
   * Logout user
   */
  const handleLogout = useCallback(async (): Promise<void> => {
    await dispatch(logoutAction()) // ✅ Await the dispatch
  }, [dispatch])

  /**
   * Check authentication status
   */
  const handleCheckAuth = useCallback(async (): Promise<void> => {
    await dispatch(checkAuthAction()) // ✅ Await the dispatch
  }, [dispatch])

  /**
   * Clear error message
   */
  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  /**
   * Clear success message
   */
  const handleClearSuccess = useCallback(() => {
    dispatch(clearSuccessMessage())
  }, [dispatch])

  /**
   * Update user profile
   */
  const handleUpdateProfile = useCallback(
    async (data: Partial<User>) => {
      return dispatch(updateProfileAction(data))
    },
    [dispatch]
  )

  /**
   * Change password
   */
  const handleChangePassword = useCallback(
    async (data: PasswordChange) => {
      return dispatch(changePasswordAction(data))
    },
    [dispatch]
  )

  /**
   * Check if user has specific role(s)
   */
  const checkRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!authState.user) return false

      if (Array.isArray(role)) {
        return role.includes(authState.user.role as UserRole)
      }

      return authState.user.role === role
    },
    [authState.user]
  )

  /**
   * Check if user has specific permission
   * Note: Implement based on your permission system
   */
  const checkPermission = useCallback(
    (permission: string): boolean => {
      if (!authState.user) return false

      // Superadmin has all permissions
      if (authState.user.is_superuser) return true

      const staffProfile = authState.user.staff_profile

      if (!staffProfile) {
        // Non-staff users only have basic permissions
        return permission === 'view_own_loans' || permission === 'make_payments'
      }

      // Map permissions to staff profile flags
      const permissionMap: Record<string, boolean> = {
        can_approve_loans: staffProfile.can_approve_loans,
        can_manage_customers: staffProfile.can_manage_customers,
        can_process_payments: staffProfile.can_process_payments,
        can_generate_reports: staffProfile.can_generate_reports,
      }

      return permissionMap[permission] ?? false
    },
    [authState.user]
  )

  /**
   * Check approval tier for loan amounts
   */
  const canApproveLoanAmount = useCallback(
    (amount: number): boolean => {
      if (!authState.user?.staff_profile) return false

      const maxAmount = authState.user.staff_profile.max_loan_approval_amount
      return maxAmount ? amount <= maxAmount : false
    },
    [authState.user]
  )

  /**
   * Check if staff is available
   */
  const isStaffAvailable = useCallback((): boolean => {
    const staffProfile = authState.user?.staff_profile
    return staffProfile?.is_available ?? false
  }, [authState.user])

  /**
   * Check if staff is on leave
   */
  const isStaffOnLeave = useCallback((): boolean => {
    const staffProfile = authState.user?.staff_profile
    return staffProfile?.is_on_leave ?? false
  }, [authState.user])

  /**
   * Check if user is admin
   */
  const isAdminUser = useCallback(() => checkRole('admin'), [checkRole])

  /**
   * Check if user is staff (admin, staff, or officer)
   */
  const isStaffUser = useCallback(
    () => checkRole(['admin', 'staff', 'officer']),
    [checkRole]
  )

  /**
   * Check if user is loan officer
   */
  const isOfficerUser = useCallback(() => checkRole('officer'), [checkRole])

  /**
   * Check if user is customer
   */
  const isCustomerUser = useCallback(() => checkRole('customer'), [checkRole])

  /**
   * Check if user is fully verified
   */
  const isUserVerified = useCallback(() => {
    return authState.user?.is_verified ?? false
  }, [authState.user])

  /**
   * Check if user account is locked
   */
  const isUserLocked = useCallback(() => {
    if (!authState.user?.locked_until) return false

    const lockedUntil = new Date(authState.user.locked_until)
    return lockedUntil > new Date()
  }, [authState.user])

  /**
   * Check if user has 2FA enabled and is required
   */
  const requiresTwoFactor = useCallback(() => {
    return authState.user?.two_factor_enabled ?? false
  }, [authState.user])

  return {
    // State
    user: authState.user || null,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    isRefreshing: authState.isRefreshing,
    error: authState.error,
    successMessage: authState.successMessage,

    // Methods
    login: handleLogin,
    logout: handleLogout,
    checkAuth: handleCheckAuth,
    clearError: handleClearError,
    clearSuccess: handleClearSuccess,

    // Permission checks
    hasRole: checkRole,
    hasPermission: checkPermission,
    isAdmin: isAdminUser,
    isStaff: isStaffUser,
    isOfficer: isOfficerUser,
    isCustomer: isCustomerUser,

    // Profile management
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,

    // Status checks
    isVerified: isUserVerified,
    isLocked: isUserLocked,
    requires2FA: requiresTwoFactor,

    // Staff-specific checks
    canApproveLoanAmount,
    isStaffAvailable,
    isStaffOnLeave,
  }
}

export default useAuth
