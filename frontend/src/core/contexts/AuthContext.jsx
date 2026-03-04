// frontend/src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@api/axios'
import { AUTH_ENDPOINTS, authAPI } from '@api/auth'
import { useToast } from './ToastContext'
import { t } from '../i18n/i18n'
import {
  AUTH_ROLE,
  AUTH_STATUS,
  AUTH_STORAGE_KEYS,
} from '../../features/auth/types'

// Create Auth Context
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const readStorage = useCallback((key) => localStorage.getItem(key), [])
  const writeStorage = useCallback((key, value) => localStorage.setItem(key, value), [])
  const removeStorage = useCallback((key) => localStorage.removeItem(key), [])
  const clearStoredAuth = useCallback(() => {
    removeStorage(AUTH_STORAGE_KEYS.accessToken)
    removeStorage(AUTH_STORAGE_KEYS.refreshToken)
    removeStorage(AUTH_STORAGE_KEYS.user)
  }, [removeStorage])

  // State
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEYS.user)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [isAuthenticated, setIsAuthenticated] = useState(!!user)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const notifySuccess = useCallback((message, options = {}) => {
    addToast({
      type: 'success',
      message,
      duration: options.duration ?? 3500,
      ...options,
    })
  }, [addToast])

  const notifyError = useCallback((message, options = {}) => {
    addToast({
      type: 'error',
      message,
      duration: options.duration ?? 6000,
      ...options,
    })
  }, [addToast])

  // Handle authentication errors
  const handleAuthError = useCallback((err) => {
    const msg = err?.message || t('errors.authFailed', 'Authentication failed.')
    setError(msg)

    // Clear stored tokens and user
    clearStoredAuth()
    delete axiosInstance.defaults.headers.common.Authorization

    setUser(null)
    setIsAuthenticated(false)

    // Optional redirect handled by callers (keeps context testable)
    return msg
  }, [clearStoredAuth])

  // React Query for fetching current user
  const {
    data: userData,
    isLoading: isFetchingUser,
    error: fetchError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = readStorage(AUTH_STORAGE_KEYS.accessToken)
      if (!token) {
        throw new Error('No access token')
      }
      // ensure axios header is set
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`
      return authAPI.getCurrentUser()
    },
    enabled: false,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      setIsBootstrapping(true)
      const token = readStorage(AUTH_STORAGE_KEYS.accessToken)
      const storedUser = readStorage(AUTH_STORAGE_KEYS.user)
      
      if (!token) {
        setIsBootstrapping(false)
        return
      }
      
      // Set auth header
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`
      
      // Set user from localStorage immediately for better UX
      if (storedUser && !userData) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
          
          // Only fetch fresh user data if we have a token
          if (token) {
            await refetchUser()
          }
        } catch {
          // Invalid JSON in localStorage, clear it
          removeStorage(AUTH_STORAGE_KEYS.user)
          setIsBootstrapping(false)
          return
        }
      } else {
        // Fetch user data if we have a token
        await refetchUser()
      }
      
      setIsBootstrapping(false)
    }

    checkAuth().catch((err) => {
      handleAuthError(err)
      setIsBootstrapping(false)
    })
  }, [refetchUser, handleAuthError, readStorage, removeStorage])

  useEffect(() => {
    if (!userData) return
    setUser(userData)
    setIsAuthenticated(true)
    setError(null)
    writeStorage(AUTH_STORAGE_KEYS.user, JSON.stringify(userData))
  }, [userData, writeStorage])

  // Update error state
  useEffect(() => {
    if (fetchError && fetchError.message !== 'No access token') {
      handleAuthError(fetchError)
    }
  }, [fetchError, handleAuthError])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => authAPI.login(credentials),
    onSuccess: (data) => {
      const { access, refresh, user: userData } = data
      writeStorage(AUTH_STORAGE_KEYS.accessToken, access)
      writeStorage(AUTH_STORAGE_KEYS.refreshToken, refresh)
      writeStorage(AUTH_STORAGE_KEYS.user, JSON.stringify(userData))
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`
      setUser(userData)
      setIsAuthenticated(true)
      setError(null)
      notifySuccess(t('auth.loginSuccess', 'Signed in successfully.'))
      queryClient.invalidateQueries(['currentUser'])
      return userData
    },
    onError: (err) => {
      clearStoredAuth()
      const msg = err?.message || t('auth.loginFailed', 'Sign in failed.')
      setError(msg)
      notifyError(msg)
      throw err
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      clearStoredAuth()
      delete axiosInstance.defaults.headers.common.Authorization
      setUser(null)
      setIsAuthenticated(false)
      setError(null)
      queryClient.clear()
      notifySuccess(t('auth.logoutSuccess', 'You have been signed out.'), { duration: 2500 })
    },
    onError: (err) => {
      console.error('Logout error:', err)
      clearStoredAuth()
      delete axiosInstance.defaults.headers.common.Authorization
      setUser(null)
      setIsAuthenticated(false)
      notifySuccess(t('auth.logoutSuccess', 'You have been signed out.'), { duration: 2500 })
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (updatedUser) => {
      writeStorage(AUTH_STORAGE_KEYS.user, JSON.stringify(updatedUser))
      setUser(updatedUser)
      setSuccessMessage(t('auth.profileUpdated', 'Profile updated successfully.'))
      setError(null)
      queryClient.setQueryData(['currentUser'], updatedUser)
      notifySuccess(t('auth.profileUpdated', 'Profile updated successfully.'))
      return updatedUser
    },
    onError: (err) => {
      const msg = err?.message || t('auth.profileUpdateFailed', 'Failed to update profile.')
      setError(msg)
      notifyError(msg)
      throw err
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ current_password, new_password, confirm_new_password }) =>
      authAPI.changePassword(current_password, new_password, confirm_new_password),
    onSuccess: (res) => {
      const message = res?.detail || t('auth.passwordChanged', 'Password changed successfully.')
      setSuccessMessage(message)
      setError(null)
      notifySuccess(message)
      return res
    },
    onError: (err) => {
      const msg = err?.message || t('auth.passwordChangeFailed', 'Failed to change password.')
      setError(msg)
      notifyError(msg)
      throw err
    },
  })

  // Check authentication (for manual refresh)
  const checkAuth = useCallback(async () => {
    setIsBootstrapping(true)
    const access = readStorage(AUTH_STORAGE_KEYS.accessToken)
    const refresh = readStorage(AUTH_STORAGE_KEYS.refreshToken)
    if (!access) {
      // try refresh if possible
      if (refresh) {
        try {
          const data = await authAPI.refreshToken(refresh)
          const newAccess = data.access
          writeStorage(AUTH_STORAGE_KEYS.accessToken, newAccess)
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccess}`
        } catch (err) {
          handleAuthError(err)
          notifyError(t('auth.sessionExpired', 'Your session has expired. Please sign in again.'))
          setIsBootstrapping(false)
          return false
        }
      } else {
        handleAuthError(new Error('No access token'))
        setIsBootstrapping(false)
        return false
      }
    } else {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`
    }

    try {
      await refetchUser()
      setIsBootstrapping(false)
      return true
    } catch (err) {
      handleAuthError(err)
      setIsBootstrapping(false)
      return false
    }
  }, [refetchUser, handleAuthError, notifyError, readStorage, writeStorage])

  // role & permission helpers
  const hasRole = useCallback((role) => {
    if (!user) return false
    if (Array.isArray(role)) return role.includes(user.role)
    return user.role === role
  }, [user])

  const hasPermission = useCallback((permission) => {
    if (!user) return false
    if (user.is_superuser) return true
    const staff = user.staff_profile
    if (!staff) return false
    const permissionMap = {
      can_approve_loans: staff?.can_approve_loans || false,
      can_manage_customers: staff?.can_manage_customers || false,
      can_process_payments: staff?.can_process_payments || false,
      can_generate_reports: staff?.can_generate_reports || false,
    }
    return permissionMap[permission] || false
  }, [user])

  const canApproveLoanAmount = useCallback((amount) => {
    if (!user?.staff_profile) return false
    const max = user.staff_profile.max_loan_approval_amount
    return max == null ? true : amount <= max
  }, [user])

  const isAdmin = useCallback(() => hasRole(AUTH_ROLE.admin), [hasRole])
  const isStaff = useCallback(
    () => hasRole([AUTH_ROLE.admin, AUTH_ROLE.staff, AUTH_ROLE.officer]),
    [hasRole]
  )
  const isOfficer = useCallback(() => hasRole(AUTH_ROLE.officer), [hasRole])
  const isCustomer = useCallback(() => hasRole(AUTH_ROLE.customer), [hasRole])

  const isVerified = useCallback(() => user?.is_verified || false, [user])
  const isLocked = useCallback(() => {
    if (!user?.locked_until) return false
    return new Date(user.locked_until) > new Date()
  }, [user])
  const requires2FA = useCallback(() => user?.two_factor_enabled || false, [user])
  const isStaffAvailable = useCallback(() => user?.staff_profile?.is_available || false, [user])
  const isStaffOnLeave = useCallback(() => user?.staff_profile?.is_on_leave || false, [user])

  const getVerificationStatus = useCallback(() => {
    if (!user) return {
      isVerified: false,
      emailVerified: false,
      phoneVerified: false,
      kycCompleted: false,
      allVerified: false,
    }
    return {
      isVerified: user.is_verified || false,
      emailVerified: user.email_verified || false,
      phoneVerified: user.phone_verified || false,
      kycCompleted: user.kyc_completed || false,
      allVerified: (user.email_verified && user.phone_verified && user.kyc_completed) || false,
    }
  }, [user])

  const getApprovalLimits = useCallback(() => {
    if (!user?.staff_profile) return null
    const sp = user.staff_profile
    return {
      maxLoanAmount: sp.max_loan_approval_amount,
      canApproveLoans: sp.can_approve_loans,
      canManageCustomers: sp.can_manage_customers,
      canProcessPayments: sp.can_process_payments,
      canGenerateReports: sp.can_generate_reports,
      approvalTier: sp.approval_tier,
    }
  }, [user])

  // Clear messages
  const clearError = useCallback(() => setError(null), [])
  const clearSuccess = useCallback(() => setSuccessMessage(null), [])

  const isLoading = isBootstrapping || isFetchingUser
  const authStatus = isLoading
    ? AUTH_STATUS.bootstrapping
    : isAuthenticated
      ? AUTH_STATUS.authenticated
      : AUTH_STATUS.unauthenticated

  // Context value
  const value = useMemo(() => ({
    // State
    user,
    isAuthenticated,
    isLoading,
    authStatus,
    error,
    successMessage,
    contract: {
      endpoints: AUTH_ENDPOINTS,
      storageKeys: AUTH_STORAGE_KEYS,
      roles: AUTH_ROLE,
      statuses: AUTH_STATUS,
    },
    
    // Methods
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    checkAuth,
    updateProfile: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    clearError,
    clearSuccess,
    
    // Permission checks
    hasRole,
    hasPermission,
    isAdmin,
    isStaff,
    isOfficer,
    isCustomer,
    
    // Status checks
    isVerified,
    isLocked,
    requires2FA,
    getVerificationStatus,
    getApprovalLimits,
    canApproveLoanAmount,
    isStaffAvailable,
    isStaffOnLeave,
    
    // Convenience getters
    staffProfile: user?.staff_profile || null,
    role: user?.role || null,
    
    // Mutation states
    isLoggingIn: loginMutation.isLoading,
    isLoggingOut: logoutMutation.isLoading,
    isUpdatingProfile: updateProfileMutation.isLoading,
    isChangingPassword: changePasswordMutation.isLoading,
  }), [
    user,
    isAuthenticated,
    isLoading,
    authStatus,
    error,
    successMessage,
    loginMutation,
    logoutMutation,
    updateProfileMutation,
    changePasswordMutation,
    checkAuth,
    clearError,
    clearSuccess,
    hasRole,
    hasPermission,
    isAdmin,
    isStaff,
    isOfficer,
    isCustomer,
    isVerified,
    isLocked,
    requires2FA,
    getVerificationStatus,
    getApprovalLimits,
    canApproveLoanAmount,
    isStaffAvailable,
    isStaffOnLeave,
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
