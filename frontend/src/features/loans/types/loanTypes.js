export const LOAN_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  DEFAULTED: "DEFAULTED",
  OVERDUE: "OVERDUE",
  WRITTEN_OFF: "WRITTEN_OFF",
  CANCELLED: "CANCELLED",
});

export const LOAN_APPLICATION_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  DOCUMENTS_REQUESTED: "DOCUMENTS_REQUESTED",
  DOCUMENTS_RECEIVED: "DOCUMENTS_RECEIVED",
  CREDIT_CHECK: "CREDIT_CHECK",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
});

export const LOAN_TYPE = Object.freeze({
  PERSONAL: "PERSONAL",
  BUSINESS: "BUSINESS",
  SALARY: "SALARY",
  EMERGENCY: "EMERGENCY",
  ASSET_FINANCING: "ASSET_FINANCING",
  EDUCATION: "EDUCATION",
  AGRICULTURE: "AGRICULTURE",
});

export const INTEREST_TYPE = Object.freeze({
  FIXED: "FIXED",
  REDUCING_BALANCE: "REDUCING_BALANCE",
  FLAT_RATE: "FLAT_RATE",
});

export const REPAYMENT_FREQUENCY = Object.freeze({
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  BIWEEKLY: "BIWEEKLY",
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  BIANNUAL: "BIANNUAL",
  ANNUAL: "ANNUAL",
  BULLET: "BULLET",
});

export const RISK_LEVEL = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
});

export const LOAN_SEARCH_TYPE = Object.freeze({
  basic: "basic",
  loanNumber: "loan_number",
  customerName: "customer_name",
  customerId: "customer_id",
  phone: "phone",
});

export const LOAN_EXPORT_FORMAT = Object.freeze({
  excel: "excel",
  csv: "csv",
});

export const LOAN_STATUS_LABELS = Object.freeze({
  [LOAN_STATUS.DRAFT]: "Draft",
  [LOAN_STATUS.PENDING]: "Pending Approval",
  [LOAN_STATUS.UNDER_REVIEW]: "Under Review",
  [LOAN_STATUS.APPROVED]: "Approved",
  [LOAN_STATUS.REJECTED]: "Rejected",
  [LOAN_STATUS.ACTIVE]: "Active",
  [LOAN_STATUS.COMPLETED]: "Completed",
  [LOAN_STATUS.DEFAULTED]: "Defaulted",
  [LOAN_STATUS.OVERDUE]: "Overdue",
  [LOAN_STATUS.WRITTEN_OFF]: "Written Off",
  [LOAN_STATUS.CANCELLED]: "Cancelled",
});

export const LOAN_TYPE_LABELS = Object.freeze({
  [LOAN_TYPE.PERSONAL]: "Personal Loan",
  [LOAN_TYPE.BUSINESS]: "Business Loan",
  [LOAN_TYPE.SALARY]: "Salary Advance",
  [LOAN_TYPE.EMERGENCY]: "Emergency Loan",
  [LOAN_TYPE.ASSET_FINANCING]: "Asset Financing",
  [LOAN_TYPE.EDUCATION]: "Education Loan",
  [LOAN_TYPE.AGRICULTURE]: "Agricultural Loan",
});

export const LOAN_DEFAULT_PAGINATION = Object.freeze({
  page: 1,
  page_size: 20,
  total: 0,
  total_pages: 0,
});

export const LOAN_DEFAULT_FILTERS = Object.freeze({
  status: "",
  loan_type: "",
  risk_level: "",
  search: "",
});

export const LOAN_INITIAL_STATE = Object.freeze({
  loans: [],
  loansLoading: false,
  loansError: null,
  loansPagination: LOAN_DEFAULT_PAGINATION,
  selectedLoan: null,
  selectedLoanLoading: false,
  selectedLoanError: null,
  stats: null,
  statsLoading: false,
  statsError: null,
  loanApplications: [],
  loanApplicationsLoading: false,
  loanApplicationsError: null,
  selectedLoanApplication: null,
  collaterals: [],
  collateralsLoading: false,
  collateralsError: null,
  searchResults: [],
  searchLoading: false,
  searchError: null,
  calculatorResult: null,
  calculatorLoading: false,
  calculatorError: null,
  loanFilters: LOAN_DEFAULT_FILTERS,
  applicationFilters: {},
});
