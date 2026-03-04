function encode(value) {
  return encodeURIComponent(String(value));
}

export const API_ENDPOINTS = Object.freeze({
  auth: Object.freeze({
    register: "/api/v1/accounts/register/",
    login: "/api/v1/accounts/login/",
    logout: "/api/v1/accounts/logout/",
    me: "/api/v1/accounts/me/",
    profile: "/api/v1/accounts/profile/",
    entitlements: "/api/v1/accounts/entitlements/",
    token: "/api/v1/accounts/token/",
    refresh: "/api/v1/accounts/token/refresh/",
  }),
  customers: Object.freeze({
    list: "/api/v1/customers/",
    detail: (customerId) => `/api/v1/customers/${encode(customerId)}/`,
    import: "/api/v1/customers/import/",
    export: "/api/v1/customers/export/",
    guarantors: (customerId) => `/api/v1/customers/${encode(customerId)}/guarantors/`,
    documents: (customerId) => `/api/v1/customers/${encode(customerId)}/documents/`,
  }),
  loans: Object.freeze({
    list: "/api/v1/loans/",
    detail: (loanId) => `/api/v1/loans/${encode(loanId)}/`,
    approvals: "/api/v1/loans/approvals/",
    approve: (loanId) => `/api/v1/loans/${encode(loanId)}/approve/`,
    disburse: (loanId) => `/api/v1/loans/${encode(loanId)}/disburse/`,
    calculator: "/api/v1/loans/calculator/",
  }),
  repayments: Object.freeze({
    list: "/api/v1/repayments/",
    detail: (repaymentId) => `/api/v1/repayments/${encode(repaymentId)}/`,
    history: "/api/v1/repayments/history/",
    overdue: "/api/v1/repayments/overdue/",
    mpesaValidation: "/api/v1/repayments/mpesa/validate/",
    mpesaConfirmation: "/api/v1/repayments/mpesa/confirm/",
  }),
  notifications: Object.freeze({
    list: "/api/v1/notifications/",
    settings: "/api/v1/notifications/settings/",
    markRead: (notificationId) => `/api/v1/notifications/${encode(notificationId)}/read/`,
    markAllRead: "/api/v1/notifications/read-all/",
  }),
  reports: Object.freeze({
    dashboard: "/api/v1/reports/dashboard/",
    loans: "/api/v1/reports/loans/",
    payments: "/api/v1/reports/payments/",
    customers: "/api/v1/reports/customers/",
    performance: "/api/v1/reports/performance/",
    collections: "/api/v1/reports/collections/",
    audit: "/api/v1/reports/audit/",
  }),
  admin: Object.freeze({
    staff: "/api/v1/admin/staff/",
    roles: "/api/v1/admin/roles/",
    auditLogs: "/api/v1/admin/audit-logs/",
    settings: "/api/v1/admin/settings/",
    systemHealth: "/api/v1/admin/system-health/",
  }),
  support: Object.freeze({
    helpCenter: "/api/v1/support/help-center/",
    contact: "/api/v1/support/contact/",
  }),
  docs: Object.freeze({
    api: "/api/v1/docs/api/",
    userGuide: "/api/v1/docs/user-guide/",
  }),
});

export function resolveEndpoint(path, params = {}) {
  let output = String(path || "");
  for (const [key, value] of Object.entries(params)) {
    output = output.replace(`:${key}`, encode(value));
  }
  return output;
}

export function withQuery(path, query = {}) {
  const entries = Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!entries.length) return String(path || "");
  return `${path}?${new URLSearchParams(entries).toString()}`;
}
