import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import Loading from "@components/ui/Loading";

const AdminRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <Loading fullScreen size="xl" message="Checking admin access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
