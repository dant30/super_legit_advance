// frontend/src/router/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Loading from '@components/ui/Loading'

/**
 * 🔐 PrivateRoute
 * Protects routes that require authentication
 */
const PrivateRoute = () => {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  // ⏳ Still loading auth state
  if (isLoading) {
    return <Loading fullScreen size="xl" message="Verifying access..." />
  }

  // 🔒 Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // ✅ Authenticated - allow access
  return <Outlet />
}

export default PrivateRoute

