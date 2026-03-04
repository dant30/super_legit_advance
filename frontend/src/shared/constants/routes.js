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

export const ROUTE_LABELS = Object.freeze({
  [APP_ROUTES.dashboard]: "Dashboard",
  [APP_ROUTES.customers]: "Borrowers",
  [APP_ROUTES.customerCreate]: "Register Borrower",
  [APP_ROUTES.customerImport]: "Import Borrowers",
  [APP_ROUTES.customerExport]: "Export Borrowers",
  [APP_ROUTES.loans]: "Loans",
  [APP_ROUTES.loanCreate]: "Create Loan",
  [APP_ROUTES.loanCalculator]: "Affordability Calculator",
  [APP_ROUTES.loanApprovals]: "Loan Approvals",
  [APP_ROUTES.repayments]: "Repayments",
  [APP_ROUTES.repaymentCreate]: "Record Repayment",
  [APP_ROUTES.repaymentHistory]: "Repayment History",
  [APP_ROUTES.overdueRepayments]: "Overdue Repayments",
  [APP_ROUTES.reports]: "Reports",
  [APP_ROUTES.notifications]: "Notifications",
  [APP_ROUTES.profile]: "My Profile",
  [APP_ROUTES.adminDashboard]: "Admin Dashboard",
  [APP_ROUTES.adminStaff]: "Staff Management",
  [APP_ROUTES.adminRoles]: "Role Management",
  [APP_ROUTES.adminAudit]: "Audit Logs",
  [APP_ROUTES.adminSettings]: "System Settings",
})

export const PUBLIC_ROUTES = Object.freeze([
  APP_ROUTES.login,
  APP_ROUTES.register,
  APP_ROUTES.forgotPassword,
  APP_ROUTES.resetPassword,
  APP_ROUTES.verifyEmail,
  APP_ROUTES.twoFactorAuth,
])

export const isPublicRoute = (path = "") => {
  return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
}

export const getRouteLabel = (path = "", fallback = "Page") => {
  if (ROUTE_LABELS[path]) return ROUTE_LABELS[path]
  const dynamicMatch = Object.keys(ROUTE_LABELS).find((route) => route.includes(":") && path.startsWith(route.split(":")[0]))
  return dynamicMatch ? ROUTE_LABELS[dynamicMatch] : fallback
}

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
