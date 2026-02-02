// frontend/src/router/AdminRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Loading from '@components/shared/Loading'
import Unauthorized from '@pages/Unauthorized'

/**
 * 👑 AdminRoute
 * Only allows access to administrators
 */
const AdminRoute = () => {
  const location = useLocation()
  const { isAuthenticated, isLoading, isAdmin } = useAuth()

  // ⏳ Auth is still being resolved
  if (isLoading) {
    return <Loading fullScreen size="xl" message="Checking authentication..." />
  }

  // 🔒 Auth resolved but user not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 🔐 User is not admin
  if (!isAdmin()) {
    return <Unauthorized />
  }

  // ✅ Admin → allow access
  return <Outlet />
}

export default AdminRoute