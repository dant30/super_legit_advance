// frontend/src/hooks/useAuth.js - OPTIMIZED CUSTOM HOOK
import { useContext } from 'react'
import { AuthContext } from '@contexts/AuthContext'

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/* helper hooks (implemented) */
export const useHasRole = () => {
  const { hasRole } = useAuth()
  return hasRole
}

export const useHasPermission = () => {
  const { hasPermission } = useAuth()
  return hasPermission
}

export const useIsAdmin = () => {
  const { isAdmin } = useAuth()
  return isAdmin
}

export const useIsStaff = () => {
  const { isStaff } = useAuth()
  return isStaff
}

export const useIsOfficer = () => {
  const { isOfficer } = useAuth()
  return isOfficer
}

export const useIsCustomer = () => {
  const { isCustomer } = useAuth()
  return isCustomer
}

export const useCanApproveLoanAmount = () => {
  const { canApproveLoanAmount } = useAuth()
  return canApproveLoanAmount
}

export const useApprovalLimits = () => {
  const { getApprovalLimits } = useAuth()
  return getApprovalLimits
}

export const useStaffProfile = () => {
  const { staffProfile } = useAuth()
  return staffProfile
}

export const useAuthStatus = () => {
  const { isAuthenticated, isLoading } = useAuth()
  return { isAuthenticated, isLoading }
}

export const useVerificationStatus = () => {
  const { getVerificationStatus } = useAuth()
  return getVerificationStatus
}

export const useCanAccessFeature = () => {
  const { hasPermission } = useAuth()
  return hasPermission
}

export const useCanPerform = () => {
  const { hasPermission } = useAuth()
  return hasPermission
}

export {
  useAuth,
}

export default useAuth