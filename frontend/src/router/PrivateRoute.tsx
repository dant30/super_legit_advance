// frontend/src/router/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { Loading } from '@/components/shared/Loading'

/**
 * 🔐 PrivateRoute
 * Waits for auth to resolve before allowing access.
 * Shows full-screen loader while checking auth.
 */
const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  )

  // ⏳ Auth is still being resolved
  if (isLoading) {
    return <Loading fullScreen size="xl" text="Checking authentication..." />
  }

  // 🔒 Auth resolved but user not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // ✅ Authenticated → allow access
  return <Outlet />
}

export default PrivateRoute
