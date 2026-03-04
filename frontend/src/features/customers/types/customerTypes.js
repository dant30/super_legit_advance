export const CUSTOMER_STATUS = Object.freeze({
  active: "ACTIVE",
  blacklisted: "BLACKLISTED",
  pending: "PENDING",
});

export const CUSTOMER_SEARCH_TYPE = Object.freeze({
  basic: "basic",
  advanced: "advanced",
});

export const CUSTOMER_EXPORT_FORMAT = Object.freeze({
  excel: "excel",
  csv: "csv",
});

export const CUSTOMER_DEFAULT_PAGINATION = Object.freeze({
  page: 1,
  page_size: 20,
  total: 0,
  total_pages: 0,
});

export const CUSTOMER_INITIAL_STATE = Object.freeze({
  customers: [],
  customersLoading: false,
  customersError: null,
  customersPagination: CUSTOMER_DEFAULT_PAGINATION,
  selectedCustomer: null,
  selectedCustomerLoading: false,
  selectedCustomerError: null,
  stats: null,
  statsLoading: false,
  statsError: null,
  employment: null,
  employmentLoading: false,
  employmentError: null,
  guarantors: [],
  selectedGuarantor: null,
  guarantorsLoading: false,
  guarantorsError: null,
  searchResults: [],
  searchLoading: false,
  searchError: null,
  filters: {},
});
