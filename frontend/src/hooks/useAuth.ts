// frontend/src/hooks/useAuth.ts
import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { RootState, AppDispatch } from '@/store/store'
import {
  login as loginAction,
  logout as logoutAction,
  checkAuth as checkAuthAction,
  clearError,
} from '@/store/slices/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const authState = useSelector((state: RootState) => state.auth)

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      return dispatch(loginAction(credentials))
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    return dispatch(logoutAction())
  }, [dispatch])

  const checkAuth = useCallback(async () => {
    return dispatch(checkAuthAction())
  }, [dispatch])

  const resetError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const hasRole = useCallback(
    (role: string | string[]) => {
      if (!authState.user) return false

      if (Array.isArray(role)) {
        return role.includes(authState.user.role)
      }
      return authState.user.role === role
    },
    [authState.user]
  )

  const isAdmin = useCallback(() => {
    return hasRole('admin')
  }, [hasRole])

  const isStaff = useCallback(() => {
    return hasRole(['admin', 'staff', 'officer'])
  }, [hasRole])

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    checkAuth,
    resetError,
    hasRole,
    isAdmin,
    isStaff,
  }
}