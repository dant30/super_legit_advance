// frontend/src/router/StaffRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Loading from '@components/shared/Loading'
import Unauthorized from '@pages/Unauthorized'

/**
 * 👥 StaffRoute
 * Only allows access to staff members (admin, staff, officer)
 */
const StaffRoute = () => {
  const location = useLocation()
  const { isAuthenticated, isLoading, isStaff } = useAuth()

  // ⏳ Auth is still being resolved
  if (isLoading) {
    return <Loading fullScreen size="xl" message="Checking authentication..." />
  }

  // 🔒 Auth resolved but user not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 🔐 User is not staff
  if (!isStaff()) {
    return <Unauthorized />
  }

  // ✅ Staff member → allow access
  return <Outlet />
}

export default StaffRoute