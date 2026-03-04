import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import Loading from "@components/ui/Loading";

const StaffRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, isStaff } = useAuth();

  if (isLoading) {
    return <Loading fullScreen size="xl" message="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isStaff()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default StaffRoute;
