// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useCallback, useEffect, useMemo, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '@api/auth'
import axiosInstance from '@api/axios'
import { useToast } from '@contexts/ToastContext'

// Create Auth Context
export const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const toast = useToast()

  // State
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Handle authentication errors
  const handleAuthError = (error) => {
    console.error('Auth Error:', error)
    const errorMessage = error.message || 'Authentication failed'
    setError(errorMessage)
    
    // Clear invalid tokens
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    
    // Remove auth header
    delete axiosInstance.defaults.headers.common.Authorization
    
    setUser(null)
    setIsAuthenticated(false)
    
    return errorMessage
  }

  // React Query for fetching current user
  const { 
    data: userData, 
    isLoading: isFetchingUser,
    error: fetchError,
    refetch: refetchUser 
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authAPI.getCurrentUser(),
    enabled: !!localStorage.getItem('access_token'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      setUser(data)
      setIsAuthenticated(true)
      setError(null)
      localStorage.setItem('user', JSON.stringify(data))
    },
    onError: (err) => {
      const errorMsg = handleAuthError(err)
      toast.error(errorMsg, {
        title: 'Authentication Error'
      })
    }
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
      
      // Set user from localStorage immediately for better UX
      if (storedUser && !userData) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
        } catch (e) {
          // Invalid JSON in localStorage, clear it
          localStorage.removeItem('user')
        }
      }
    }

    checkAuth()
  }, [userData])

  // Update loading state
  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      setIsLoading(isFetchingUser)
    } else {
      setIsLoading(false)
    }
  }, [isFetchingUser])

  // Update error state
  useEffect(() => {
    if (fetchError) {
      setError(fetchError.message)
    }
  }, [fetchError])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => authAPI.login(credentials),
    onSuccess: (data) => {
      const { access, refresh, user: userData } = data

      // Persist tokens
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(userData))

      // Set default auth header
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`

      // Update state
      setUser(userData)
      setIsAuthenticated(true)
      setError(null)
      setSuccessMessage('Login successful')
      
      // Invalidate and refetch user query
      queryClient.invalidateQueries(['currentUser'])
      
      // Show toast
      toast.success('Logged in successfully', {
        title: 'Success'
      })
      
      return userData
    },
    onError: (error) => {
      // Clear any partial tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      
      const errorMsg = error.message || 'Login failed'
      setError(errorMsg)
      
      toast.error(errorMsg, {
        title: 'Login Failed'
      })
      
      throw error
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      // Clear local storage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      delete axiosInstance.defaults.headers.common.Authorization
      
      // Reset state
      setUser(null)
      setIsAuthenticated(false)
      setSuccessMessage('Logout successful')
      setError(null)
      
      // Clear query cache
      queryClient.clear()
      
      toast.info('You have been logged out successfully', {
        title: 'Logged out'
      })
    },
    onError: (error) => {
      console.error('Logout error:', error)
      
      // Still clear local storage even if API fails
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      delete axiosInstance.defaults.headers.common.Authorization
      
      setUser(null)
      setIsAuthenticated(false)
      
      toast.info('You have been logged out', {
        title: 'Logged out'
      })
    }
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (updatedUser) => {
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setSuccessMessage('Profile updated successfully')
      setError(null)
      
      // Update query cache
      queryClient.setQueryData(['currentUser'], updatedUser)
      
      toast.success('Profile updated successfully', {
        title: 'Success'
      })
      
      return updatedUser
    },
    onError: (error) => {
      const errorMsg = error.message || 'Failed to update profile'
      setError(errorMsg)
      
      toast.error(errorMsg, {
        title: 'Update Failed'
      })
      
      throw error
    }
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ current_password, new_password, confirm_new_password }) =>
      authAPI.changePassword(current_password, new_password, confirm_new_password),
    onSuccess: (response) => {
      const message = response.detail || 'Password changed successfully'
      setSuccessMessage(message)
      setError(null)
      
      toast.success(message, {
        title: 'Success'
      })
      
      return response
    },
    onError: (error) => {
      const errorMsg = error.message || 'Failed to change password'
      setError(errorMsg)
      
      toast.error(errorMsg, {
        title: 'Password Change Failed'
      })
      
      throw error
    }
  })

  // Check if user has specific role(s)
  const hasRole = useCallback((role) => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }, [user])

  // Permission checks
  const hasPermission = useCallback((permission) => {
    if (!user) return false

    // Superadmin has all permissions
    if (user.is_superuser) return true

    const staffProfile = user.staff_profile

    if (!staffProfile) {
      // Non-staff users only have basic permissions
      return permission === 'view_own_loans' || permission === 'make_payments'
    }

    // Map permissions to staff profile flags
    const permissionMap = {
      can_approve_loans: staffProfile?.can_approve_loans || false,
      can_manage_customers: staffProfile?.can_manage_customers || false,
      can_process_payments: staffProfile?.can_process_payments || false,
      can_generate_reports: staffProfile?.can_generate_reports || false,
    }

    return permissionMap[permission] || false
  }, [user])

  // Staff-specific checks
  const canApproveLoanAmount = useCallback((amount) => {
    if (!user?.staff_profile) return false
    const maxAmount = user.staff_profile.max_loan_approval_amount
    return maxAmount ? amount <= maxAmount : false
  }, [user])

  // Convenience role checkers
  const isAdmin = useCallback(() => hasRole('admin'), [hasRole])
  const isStaff = useCallback(() => hasRole(['admin', 'staff', 'officer']), [hasRole])
  const isOfficer = useCallback(() => hasRole('officer'), [hasRole])
  const isCustomer = useCallback(() => hasRole('customer'), [hasRole])

  // Status checks
  const isVerified = useCallback(() => user?.is_verified || false, [user])
  const isLocked = useCallback(() => {
    if (!user?.locked_until) return false
    const lockedUntil = new Date(user.locked_until)
    return lockedUntil > new Date()
  }, [user])
  const requires2FA = useCallback(() => user?.two_factor_enabled || false, [user])
  const isStaffAvailable = useCallback(() => user?.staff_profile?.is_available || false, [user])
  const isStaffOnLeave = useCallback(() => user?.staff_profile?.is_on_leave || false, [user])

  // Check if user is verified (email, phone, KYC)
  const getVerificationStatus = useCallback(() => {
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
  }, [user])

  // Get user's approval tier limits
  const getApprovalLimits = useCallback(() => {
    if (!user?.staff_profile) return null
    
    return {
      maxLoanAmount: user.staff_profile.max_loan_approval_amount,
      canApproveLoans: user.staff_profile.can_approve_loans,
      canManageCustomers: user.staff_profile.can_manage_customers,
      canProcessPayments: user.staff_profile.can_process_payments,
      canGenerateReports: user.staff_profile.can_generate_reports,
      approvalTier: user.staff_profile.approval_tier,
    }
  }, [user])

  // Check if user can access specific feature
  const canAccessFeature = useCallback((feature) => {
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
  }, [user, hasPermission])

  // Check if user can perform action on resource
  const canPerform = useCallback((action, resource) => {
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
  }, [user, hasPermission])

  // Clear messages
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearSuccess = useCallback(() => {
    setSuccessMessage(null)
  }, [])

  // Check authentication (for manual refresh)
  const checkAuth = useCallback(async () => {
    setIsLoading(true)
    try {
      await refetchUser()
    } catch (error) {
      handleAuthError(error)
    } finally {
      setIsLoading(false)
    }
  }, [refetchUser])

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
    canAccessFeature,
    canPerform,
    
    // Staff-specific checks
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
    canAccessFeature,
    canPerform,
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