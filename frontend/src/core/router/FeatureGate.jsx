import { Link } from "react-router-dom";
import { t } from "../i18n/i18n";
import { useAuth } from "@hooks/useAuth";

function normalizeList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default function FeatureGate({
  children,
  requiredRoles,
  requiredPermissions,
  message,
}) {
  const { hasRole, hasPermission } = useAuth();
  const roles = normalizeList(requiredRoles);
  const permissions = normalizeList(requiredPermissions);

  const roleAllowed = roles.length === 0 || hasRole(roles);
  const permissionAllowed =
    permissions.length === 0 || permissions.every((permission) => hasPermission(permission));
  const allowed = roleAllowed && permissionAllowed;

  if (allowed) {
    return children;
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        {t("access.restrictedTitle", "Access Restricted")}
      </h2>
      <p className="mt-3 text-sm text-slate-600">
        {message ||
          t(
            "access.restrictedMessage",
            "Your account does not have permission to open this section."
          )}
      </p>
      <div className="mt-5">
        <Link
          to="/"
          className="inline-flex items-center rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          {t("access.returnToDashboard", "Return to Dashboard")}
        </Link>
      </div>
    </section>
  );
}
