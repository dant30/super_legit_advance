// frontend/src/router/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { Loader2 } from 'lucide-react'

const AdminRoute = () => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const isAdmin = user?.is_staff || user?.is_superuser

  return isAdmin ? <Outlet /> : <Navigate to="/" />
}

export default AdminRoute