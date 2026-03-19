import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@features/auth/hooks/useAuth";
import Loading from "@components/ui/Loading";
import { t } from "../i18n/i18n";

const StaffRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, isStaff } = useAuth();

  if (isLoading) {
    return (
      <Loading
        fullScreen
        size="xl"
        message={t("routes.checkingPermissions", "Checking permissions...")}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isStaff()) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location.pathname, reason: "staff_access_required" }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default StaffRoute;
