import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import Loading from "@components/ui/Loading";
import { t } from "../i18n/i18n";

const AdminRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <Loading
        fullScreen
        size="xl"
        message={t("routes.checkingAdminAccess", "Checking admin access...")}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin()) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location.pathname, reason: "admin_access_required" }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default AdminRoute;
