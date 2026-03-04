import { Link } from "react-router-dom";

import { useOrganization } from "../context/OrganizationContext";
import InlineNotice from "../../shared/components/ui/InlineNotice";
import { routes } from "./routes";
import { t } from "../i18n/i18n";

export default function FeatureGate({
  children,
  requiredRoles,
  requiredPlans,
  requiredFeatures,
  message,
}) {
  const { canAccess, plan, activeRole } = useOrganization();
  const allowed = canAccess({
    roles: requiredRoles,
    plans: requiredPlans,
    features: requiredFeatures,
  });

  if (allowed) {
    return children;
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        {t("access.restrictedTitle", "Access Restricted")}
      </h2>
      <InlineNotice
        variant="warning"
        message={
          message ||
          t(
            "access.restrictedMessage",
            "Your current organization plan or role does not allow access to this module."
          )
        }
      />
      <p className="text-sm text-slate-600">
        {t("access.currentRole", "Current role:")}{" "}
        <span className="font-medium text-slate-800">{activeRole || "viewer"}</span>.{" "}
        {t("access.currentPlan", "Current plan:")}{" "}
        <span className="font-medium text-slate-800">{plan || "starter"}</span>.
      </p>
      <div>
        <Link
          to={routes.dashboard}
          className="inline-flex items-center rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {t("access.returnToDashboard", "Return to Dashboard")}
        </Link>
      </div>
    </section>
  );
}
