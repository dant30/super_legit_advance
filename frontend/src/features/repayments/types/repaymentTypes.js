export const REPAYMENT_STATUS = Object.freeze({
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  OVERDUE: "OVERDUE",
  PARTIAL: "PARTIAL",
  WAIVED: "WAIVED",
});

export const SCHEDULE_STATUS = Object.freeze({
  PENDING: "PENDING",
  OVERDUE: "OVERDUE",
  PAID: "PAID",
  ADJUSTED: "ADJUSTED",
});

export const PENALTY_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPLIED: "APPLIED",
  WAIVED: "WAIVED",
  CANCELLED: "CANCELLED",
});

export const PAYMENT_METHOD = Object.freeze({
  CASH: "CASH",
  MPESA: "MPESA",
  BANK: "BANK",
  CHEQUE: "CHEQUE",
});

export const REPAYMENT_TYPE = Object.freeze({
  FULL: "FULL",
  PARTIAL: "PARTIAL",
  INTEREST_ONLY: "INTEREST_ONLY",
});

export const PENALTY_TYPE = Object.freeze({
  LATE_FEE: "LATE_FEE",
  INTEREST: "INTEREST",
  OTHER: "OTHER",
});

export const REPAYMENTS_DEFAULT_PAGINATION = Object.freeze({
  count: 0,
  next: null,
  previous: null,
  page: 1,
  pageSize: 20,
});

export const REPAYMENTS_INITIAL_STATE = Object.freeze({
  repayments: [],
  schedules: [],
  penalties: [],
  selectedRepayment: null,
  loading: false,
  error: null,
  dashboardStats: null,
  pagination: REPAYMENTS_DEFAULT_PAGINATION,
});
