import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@features/auth/hooks/useAuth";
import Loading from "@components/ui/Loading";
import { t } from "../i18n/i18n";

const PrivateRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Loading
        fullScreen
        size="xl"
        message={t("routes.verifyingAccess", "Verifying access...")}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
