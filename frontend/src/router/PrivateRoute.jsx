// frontend/src/router/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Loading from '@components/shared/Loading'

/**
 * 🔐 PrivateRoute
 * Waits for auth to resolve before allowing access.
 * Shows full-screen loader while checking auth.
 */
const PrivateRoute = () => {
  const location = useLocation()
  const { isAuthenticated, isLoading, user } = useAuth()

  // ⏳ Auth is still being resolved
  if (isLoading) {
    return <Loading fullScreen size="xl" message="Checking authentication..." />
  }

  // 🔒 Auth resolved but user not logged in
  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // ✅ Authenticated → allow access
  return <Outlet />
}

export default PrivateRoute