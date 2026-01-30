// frontend/src/router/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import Loading from '@/components/shared/Loading'

export default function PrivateRoute() {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  )

  // Auth still being resolved
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  // Auth resolved but user not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Authenticated → allow access
  return <Outlet />
}
