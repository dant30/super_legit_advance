export const APP_ROUTES = Object.freeze({
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  profile: "/profile",
  twoFactorAuth: "/two-factor-auth",
  dashboard: "/",
  customers: "/customers",
  customerCreate: "/customers/create",
  customerImport: "/customers/import",
  customerExport: "/customers/export",
  customerDetail: "/customers/:id",
  customerEdit: "/customers/:id/edit",
  loans: "/loans",
  loanCreate: "/loans/create",
  loanCalculator: "/loans/calculator",
  loanApprovals: "/loans/approvals",
  loanDetail: "/loans/:id",
  loanEdit: "/loans/:id/edit",
  repayments: "/repayments",
  repaymentCreate: "/repayments/create",
  repaymentHistory: "/repayments/history",
  overdueRepayments: "/repayments/overdue",
  repaymentDetail: "/repayments/:id",
  reports: "/reports",
  loansReport: "/reports/loans",
  paymentsReport: "/reports/payments",
  customersReport: "/reports/customers",
  performanceReport: "/reports/performance",
  collectionReport: "/reports/collection",
  auditReport: "/reports/audit",
  notifications: "/notifications",
  notificationSettings: "/notifications/settings",
  docsApi: "/docs/api",
  docsUserGuide: "/docs/user-guide",
  help: "/help",
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",
  admin: "/admin",
  adminDashboard: "/admin/dashboard",
  adminStaff: "/admin/staff",
  adminRoles: "/admin/roles",
  adminAudit: "/admin/audit",
  adminSettings: "/admin/settings",
  maintenance: "/maintenance",
  unauthorized: "/unauthorized",
});

export function withQuery(path, query = {}) {
  const entries = Object.entries(query).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (!entries.length) return path;
  const search = new URLSearchParams(entries).toString();
  return `${path}?${search}`;
}

export function withPathParams(path, params = {}) {
  let output = String(path || "");
  for (const [key, value] of Object.entries(params)) {
    output = output.replace(`:${key}`, encodeURIComponent(String(value)));
  }
  return output;
}
