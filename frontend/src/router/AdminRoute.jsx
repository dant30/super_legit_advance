// frontend/src/router/AdminRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Loading from '@components/shared/Loading'
import Unauthorized from '@pages/Unauthorized'

/**
 * 🔐 AdminRoute
 * Only allows admin users
 */
const AdminRoute = () => {
  const location = useLocation()
  const { isAuthenticated, isLoading, isAdmin } = useAuth()

  // ⏳ Still loading auth state
  if (isLoading) {
    return <Loading fullScreen size="xl" message="Checking admin access..." />
  }

  // 🔒 Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 🚫 Not admin
  if (!isAdmin()) {
    return <Unauthorized />
  }

  // ✅ Is admin - allow access
  return <Outlet />
}

export default AdminRoute