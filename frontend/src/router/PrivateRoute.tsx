// frontend/src/router/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import Loading from '@/components/shared/Loading'

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  )

  // While checking auth, show nothing (parent App handles loading)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Authenticated, render protected routes
  return <Outlet />
}