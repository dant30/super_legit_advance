// frontend/src/router/StaffRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Loading from '@components/shared/Loading'
import Unauthorized from '@pages/Unauthorized'

/**
 * 👥 StaffRoute
 * Only allows staff members (admin, staff, officer roles)
 */
const StaffRoute = () => {
  const location = useLocation()
  const { isAuthenticated, isLoading, isStaff } = useAuth()

  // ⏳ Still loading auth state
  if (isLoading) {
    return <Loading fullScreen size="xl" message="Checking permissions..." />
  }

  // 🔒 Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 🚫 Not staff member
  if (!isStaff()) {
    return <Unauthorized />
  }

  // ✅ Is staff - allow access
  return <Outlet />
}

export default StaffRoute