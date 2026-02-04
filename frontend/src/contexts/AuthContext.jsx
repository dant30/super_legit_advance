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
import { authAPI } from '@api/auth'
import { useToast } from './ToastContext'

// Create Auth Context
export const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // State
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [isAuthenticated, setIsAuthenticated] = useState(!!user)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Handle authentication errors
  const handleAuthError = useCallback((err) => {
    const msg = err?.message || 'Authentication error'
    setError(msg)

    // Clear stored tokens and user
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    delete axiosInstance.defaults.headers.common.Authorization

    setUser(null)
    setIsAuthenticated(false)

    // Optional redirect handled by callers (keeps context testable)
    return msg
  }, [])

  // React Query for fetching current user
  const {
    data: userData,
    isLoading: isFetchingUser,
    error: fetchError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
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
    onSuccess: (data) => {
      setUser(data)
      setIsAuthenticated(true)
      setError(null)
      localStorage.setItem('user', JSON.stringify(data))
    },
    onError: (err) => {
      if (err.message !== 'No access token') {
        // propagate the error quietly
        console.error('Fetch current user failed:', err)
      }
    },
  })

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      const storedUser = localStorage.getItem('user')
      
      if (!token) {
        setIsLoading(false)
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
        } catch (e) {
          // Invalid JSON in localStorage, clear it
          localStorage.removeItem('user')
          setIsLoading(false)
        }
      } else if (token) {
        // Fetch user data if we have a token
        await refetchUser()
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [userData])

  // Update loading state
  useEffect(() => {
    setIsLoading(isFetchingUser)
  }, [isFetchingUser])

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
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(userData))
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`
      setUser(userData)
      setIsAuthenticated(true)
      setError(null)
      addToast('Logged in successfully', { title: 'Success' })
      queryClient.invalidateQueries(['currentUser'])
      return userData
    },
    onError: (err) => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      const msg = err?.message || 'Login failed'
      setError(msg)
      addToast(msg, { title: 'Login Failed' })
      throw err
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      delete axiosInstance.defaults.headers.common.Authorization
      setUser(null)
      setIsAuthenticated(false)
      setError(null)
      queryClient.clear()
      addToast('You have been logged out', { title: 'Logged out' })
    },
    onError: (err) => {
      console.error('Logout error:', err)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      delete axiosInstance.defaults.headers.common.Authorization
      setUser(null)
      setIsAuthenticated(false)
      addToast('You have been logged out', { title: 'Logged out' })
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (updatedUser) => {
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setSuccessMessage('Profile updated successfully')
      setError(null)
      queryClient.setQueryData(['currentUser'], updatedUser)
      addToast('Profile updated successfully', { title: 'Success' })
      return updatedUser
    },
    onError: (err) => {
      const msg = err?.message || 'Failed to update profile'
      setError(msg)
      addToast(msg, { title: 'Update Failed' })
      throw err
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ current_password, new_password, confirm_new_password }) =>
      authAPI.changePassword(current_password, new_password, confirm_new_password),
    onSuccess: (res) => {
      const message = res?.detail || 'Password changed successfully'
      setSuccessMessage(message)
      setError(null)
      addToast(message, { title: 'Success' })
      return res
    },
    onError: (err) => {
      const msg = err?.message || 'Failed to change password'
      setError(msg)
      addToast(msg, { title: 'Password Change Failed' })
      throw err
    },
  })

  // Check authentication (for manual refresh)
  const checkAuth = useCallback(async () => {
    const access = localStorage.getItem('access_token')
    const refresh = localStorage.getItem('refresh_token')
    if (!access) {
      // try refresh if possible
      if (refresh) {
        try {
          const data = await authAPI.refreshToken(refresh)
          const newAccess = data.access
          localStorage.setItem('access_token', newAccess)
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccess}`
        } catch (err) {
          handleAuthError(err)
          return false
        }
      } else {
        handleAuthError(new Error('No access token'))
        return false
      }
    } else {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`
    }

    try {
      await refetchUser()
      return true
    } catch (err) {
      handleAuthError(err)
      return false
    }
  }, [refetchUser, handleAuthError])

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

  const isAdmin = useCallback(() => hasRole('admin'), [hasRole])
  const isStaff = useCallback(() => hasRole(['admin', 'staff', 'officer']), [hasRole])
  const isOfficer = useCallback(() => hasRole('officer'), [hasRole])
  const isCustomer = useCallback(() => hasRole('customer'), [hasRole])

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

  // Context value
  const value = useMemo(() => ({
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    successMessage,
    
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