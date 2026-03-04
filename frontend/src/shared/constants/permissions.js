export const ROLE = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  STAFF: "staff",
  OFFICER: "officer",
  ACCOUNTANT: "accountant",
  AUDITOR: "auditor",
  CUSTOMER: "customer",
  VIEWER: "viewer",
});

export const ROLE_LABELS = Object.freeze({
  [ROLE.SUPER_ADMIN]: "Super Admin",
  [ROLE.ADMIN]: "Administrator",
  [ROLE.STAFF]: "Staff",
  [ROLE.OFFICER]: "Loan Officer",
  [ROLE.ACCOUNTANT]: "Accountant",
  [ROLE.AUDITOR]: "Auditor",
  [ROLE.CUSTOMER]: "Customer",
  [ROLE.VIEWER]: "Viewer",
})

export const PERMISSIONS = Object.freeze({
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_CUSTOMERS: "view_customers",
  MANAGE_CUSTOMERS: "manage_customers",
  VIEW_LOANS: "view_loans",
  CREATE_LOANS: "create_loans",
  APPROVE_LOANS: "approve_loans",
  DISBURSE_LOANS: "disburse_loans",
  VIEW_REPAYMENTS: "view_repayments",
  PROCESS_REPAYMENTS: "process_repayments",
  VIEW_REPORTS: "view_reports",
  GENERATE_REPORTS: "generate_reports",
  MANAGE_NOTIFICATIONS: "manage_notifications",
  VIEW_ADMIN: "view_admin",
  MANAGE_STAFF: "manage_staff",
  MANAGE_SETTINGS: "manage_settings",
  VIEW_AUDIT_LOGS: "view_audit_logs",
});

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLE.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLE.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_LOANS,
    PERMISSIONS.CREATE_LOANS,
    PERMISSIONS.APPROVE_LOANS,
    PERMISSIONS.DISBURSE_LOANS,
    PERMISSIONS.VIEW_REPAYMENTS,
    PERMISSIONS.PROCESS_REPAYMENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.MANAGE_NOTIFICATIONS,
    PERMISSIONS.VIEW_ADMIN,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  [ROLE.STAFF]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_LOANS,
    PERMISSIONS.CREATE_LOANS,
    PERMISSIONS.VIEW_REPAYMENTS,
    PERMISSIONS.PROCESS_REPAYMENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS,
  ],
  [ROLE.OFFICER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_LOANS,
    PERMISSIONS.CREATE_LOANS,
    PERMISSIONS.VIEW_REPAYMENTS,
    PERMISSIONS.PROCESS_REPAYMENTS,
  ],
  [ROLE.ACCOUNTANT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_LOANS,
    PERMISSIONS.VIEW_REPAYMENTS,
    PERMISSIONS.PROCESS_REPAYMENTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS,
  ],
  [ROLE.AUDITOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],
  [ROLE.CUSTOMER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_LOANS,
    PERMISSIONS.VIEW_REPAYMENTS,
  ],
  [ROLE.VIEWER]: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_REPORTS],
});

export function hasPermission(role, permission) {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(role, permissions = []) {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role, permissions = []) {
  return permissions.every((permission) => hasPermission(role, permission))
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || "Unknown Role"
}
