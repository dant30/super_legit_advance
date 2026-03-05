export const REPORT_TYPE = Object.freeze({
  LOANS: "loans",
  PAYMENTS: "payments",
  CUSTOMERS: "customers",
  PERFORMANCE: "performance",
  AUDIT: "audit",
  COLLECTION: "collection",
  RISK_ASSESSMENT: "riskAssessment",
  DAILY_SUMMARY: "dailySummary",
  MONTHLY_SUMMARY: "monthlySummary",
});

export const REPORT_EXPORT_FORMAT = Object.freeze({
  PDF: "pdf",
  EXCEL: "excel",
  JSON: "json",
});

export const REPORTS_INITIAL_STATE = Object.freeze({
  reports: [],
  currentReport: null,
  reportHistory: [],
  schedules: [],

  loading: false,
  generating: false,
  exporting: false,

  error: null,
  success: null,

  filterParams: {},
  selectedFormat: REPORT_EXPORT_FORMAT.PDF,
  generationProgress: 0,

  loansLoading: false,
  loansError: null,
  paymentsLoading: false,
  paymentsError: null,
  customersLoading: false,
  customersError: null,
  performanceLoading: false,
  performanceError: null,
  auditLoading: false,
  auditError: null,
  collectionLoading: false,
  collectionError: null,
});
