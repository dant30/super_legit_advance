export const NOTIFICATION_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  QUEUED: "QUEUED",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  READ: "READ",
});

export const NOTIFICATION_PRIORITY = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
});

export const NOTIFICATION_CHANNEL = Object.freeze({
  IN_APP: "IN_APP",
  SMS: "SMS",
  EMAIL: "EMAIL",
  PUSH: "PUSH",
});

export const NOTIFICATION_TYPE = Object.freeze({
  LOAN_APPROVED: "LOAN_APPROVED",
  LOAN_REJECTED: "LOAN_REJECTED",
  LOAN_DISBURSED: "LOAN_DISBURSED",
  PAYMENT_REMINDER: "PAYMENT_REMINDER",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  PAYMENT_OVERDUE: "PAYMENT_OVERDUE",
  ACCOUNT_UPDATE: "ACCOUNT_UPDATE",
  SYSTEM_ALERT: "SYSTEM_ALERT",
  MARKETING: "MARKETING",
  OTHER: "OTHER",
});

export const NOTIFICATIONS_INITIAL_STATE = Object.freeze({
  notifications: [],
  totalNotifications: 0,
  unreadCount: 0,
  recentNotifications: [],
  notificationsLoading: false,
  notificationsError: null,

  selectedNotification: null,
  selectedNotificationLoading: false,
  selectedNotificationError: null,

  stats: null,
  statsLoading: false,
  statsError: null,

  templates: [],
  templatesLoading: false,
  templatesError: null,

  smsLogs: [],
  smsLogsLoading: false,
  smsLogsError: null,

  smsStats: null,
  smsStatsLoading: false,
  smsStatsError: null,

  successMessage: null,
});
