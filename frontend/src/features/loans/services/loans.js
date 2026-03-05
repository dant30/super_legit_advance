import axios from "@api/axios";
import {
  LOAN_STATUS,
  LOAN_APPLICATION_STATUS,
  LOAN_TYPE,
  INTEREST_TYPE,
  REPAYMENT_FREQUENCY,
  RISK_LEVEL,
  LOAN_STATUS_LABELS,
  LOAN_TYPE_LABELS,
} from "../types";

const LOAN_ENDPOINTS = Object.freeze({
  base: "/loans",
  list: () => `${LOAN_ENDPOINTS.base}/`,
  detail: (id) => `${LOAN_ENDPOINTS.base}/${id}/`,
  create: () => `${LOAN_ENDPOINTS.base}/create/`,
  approve: (id) => `${LOAN_ENDPOINTS.base}/${id}/approve/`,
  reject: (id) => `${LOAN_ENDPOINTS.base}/${id}/reject/`,
  disburse: (id) => `${LOAN_ENDPOINTS.base}/${id}/disburse/`,
  calculator: () => `${LOAN_ENDPOINTS.base}/calculator/`,
  stats: () => `${LOAN_ENDPOINTS.base}/stats/`,
  search: () => `${LOAN_ENDPOINTS.base}/search/`,
  export: () => `${LOAN_ENDPOINTS.base}/export/`,
  applications: () => `${LOAN_ENDPOINTS.base}/applications/`,
  applicationDetail: (id) => `${LOAN_ENDPOINTS.base}/applications/${id}/`,
  applicationCreate: () => `${LOAN_ENDPOINTS.base}/applications/create/`,
  applicationSubmit: (id) => `${LOAN_ENDPOINTS.base}/applications/${id}/submit/`,
  applicationReview: (id) => `${LOAN_ENDPOINTS.base}/applications/${id}/review/`,
  applicationApprove: (id) => `${LOAN_ENDPOINTS.base}/applications/${id}/approve/`,
  applicationReject: (id) => `${LOAN_ENDPOINTS.base}/applications/${id}/reject/`,
  collateralList: (loanId) => `${LOAN_ENDPOINTS.base}/${loanId}/collateral/`,
  collateralCreate: (loanId) => `${LOAN_ENDPOINTS.base}/${loanId}/collateral/create/`,
  collateralDetail: (id) => `${LOAN_ENDPOINTS.base}/collateral/${id}/`,
  collateralRelease: (id) => `${LOAN_ENDPOINTS.base}/collateral/${id}/release/`,
});

const unwrapData = (response) => {
  const raw = response?.data ?? response;
  return raw && typeof raw === "object" && raw.data !== undefined ? raw.data : raw;
};

export const normalizeLoanCollection = (payload) => {
  const data = unwrapData(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const unwrapListData = (response) => normalizeLoanCollection(response);

export const getLoanStatusColor = (status) => {
  switch (status) {
    case LOAN_STATUS.ACTIVE:
    case LOAN_STATUS.APPROVED:
    case LOAN_STATUS.COMPLETED:
      return "success";
    case LOAN_STATUS.PENDING:
    case LOAN_STATUS.UNDER_REVIEW:
    case LOAN_STATUS.DRAFT:
      return "warning";
    case LOAN_STATUS.REJECTED:
    case LOAN_STATUS.CANCELLED:
      return "danger";
    case LOAN_STATUS.OVERDUE:
    case LOAN_STATUS.DEFAULTED:
      return "error";
    default:
      return "default";
  }
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

class LoanAPI {
  async getLoans(filters = {}) {
    const res = await axios.get(LOAN_ENDPOINTS.list(), { params: filters });
    return unwrapData(res);
  }

  async getLoan(id) {
    const res = await axios.get(LOAN_ENDPOINTS.detail(id));
    return unwrapData(res);
  }

  async createLoan(data) {
    const res = await axios.post(LOAN_ENDPOINTS.create(), data);
    return unwrapData(res);
  }

  async updateLoan(id, data) {
    const res = await axios.patch(LOAN_ENDPOINTS.detail(id), data);
    return unwrapData(res);
  }

  async deleteLoan(id) {
    await axios.delete(LOAN_ENDPOINTS.detail(id));
    return { success: true };
  }

  async approveLoan(id, data = {}) {
    const res = await axios.post(LOAN_ENDPOINTS.approve(id), data);
    return unwrapData(res);
  }

  async rejectLoan(id, reason) {
    const res = await axios.post(LOAN_ENDPOINTS.reject(id), {
      rejection_reason: reason,
    });
    return unwrapData(res);
  }

  async disburseLoan(id, data = {}) {
    const res = await axios.post(LOAN_ENDPOINTS.disburse(id), data);
    return unwrapData(res);
  }

  async calculateLoan(payload) {
    const res = await axios.post(LOAN_ENDPOINTS.calculator(), payload);
    return unwrapData(res);
  }

  async getLoanStats() {
    const res = await axios.get(LOAN_ENDPOINTS.stats());
    return unwrapData(res);
  }

  async searchLoans(q = "", type = "basic", params = {}) {
    const res = await axios.get(LOAN_ENDPOINTS.search(), {
      params: { q, type, ...params },
    });
    return unwrapListData(res);
  }

  async exportLoans(format = "excel", filters = {}) {
    const res = await axios.get(LOAN_ENDPOINTS.export(), {
      params: { format, ...filters },
      responseType: "blob",
    });
    return unwrapData(res);
  }

  async getLoanApplications(filters = {}) {
    const res = await axios.get(LOAN_ENDPOINTS.applications(), { params: filters });
    return unwrapData(res);
  }

  async getLoanApplication(id) {
    const res = await axios.get(LOAN_ENDPOINTS.applicationDetail(id));
    return unwrapData(res);
  }

  async createLoanApplication(data) {
    const res = await axios.post(LOAN_ENDPOINTS.applicationCreate(), data);
    return unwrapData(res);
  }

  async updateLoanApplication(id, data) {
    const res = await axios.patch(LOAN_ENDPOINTS.applicationDetail(id), data);
    return unwrapData(res);
  }

  async submitLoanApplication(id) {
    const res = await axios.post(LOAN_ENDPOINTS.applicationSubmit(id));
    return unwrapData(res);
  }

  async reviewLoanApplication(id, data) {
    const res = await axios.post(LOAN_ENDPOINTS.applicationReview(id), data);
    return unwrapData(res);
  }

  async approveLoanApplication(id, data = {}) {
    const res = await axios.post(LOAN_ENDPOINTS.applicationApprove(id), data);
    return unwrapData(res);
  }

  async rejectLoanApplication(id, reason) {
    const res = await axios.post(LOAN_ENDPOINTS.applicationReject(id), {
      rejection_reason: reason,
    });
    return unwrapData(res);
  }

  async deleteLoanApplication(id) {
    const res = await axios.delete(LOAN_ENDPOINTS.applicationDetail(id));
    return unwrapData(res);
  }

  async getCollaterals(loanId, filters = {}) {
    const res = await axios.get(LOAN_ENDPOINTS.collateralList(loanId), {
      params: filters,
    });
    return unwrapData(res);
  }

  async getCollateral(id) {
    const res = await axios.get(LOAN_ENDPOINTS.collateralDetail(id));
    return unwrapData(res);
  }

  async createCollateral(loanId, data) {
    const res = await axios.post(LOAN_ENDPOINTS.collateralCreate(loanId), data);
    return unwrapData(res);
  }

  async updateCollateral(id, data) {
    const res = await axios.patch(LOAN_ENDPOINTS.collateralDetail(id), data);
    return unwrapData(res);
  }

  async deleteCollateral(id) {
    const res = await axios.delete(LOAN_ENDPOINTS.collateralDetail(id));
    return unwrapData(res);
  }

  async releaseCollateral(id, data = {}) {
    const res = await axios.post(LOAN_ENDPOINTS.collateralRelease(id), data);
    return unwrapData(res);
  }

  downloadExport(blob, filename = "export.xlsx") {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  validateLoanData(data) {
    const errors = {};
    if (!data.customer) errors.customer = "Customer is required";
    if (!data.amount_requested || Number(data.amount_requested) <= 0) {
      errors.amount_requested = "Amount requested must be > 0";
    }
    if (!data.term_months || Number(data.term_months) <= 0) {
      errors.term_months = "Term must be > 0";
    }
    if (!data.purpose) errors.purpose = "Purpose is required";
    return { isValid: Object.keys(errors).length === 0, errors };
  }

  calculateAffordability(
    monthlyIncome = 0,
    monthlyExpenses = 0,
    proposedInstallment = 0
  ) {
    const disposableIncome = Number(monthlyIncome) - Number(monthlyExpenses);
    const installmentRatio =
      monthlyIncome > 0
        ? (Number(proposedInstallment) / Number(monthlyIncome)) * 100
        : 100;
    const affordabilityScore = Math.max(0, 100 - installmentRatio);

    let affordabilityLevel = "GOOD";
    if (installmentRatio > 40) affordabilityLevel = "POOR";
    else if (installmentRatio > 20) affordabilityLevel = "MODERATE";

    return {
      disposableIncome,
      installmentRatio,
      affordabilityScore,
      affordabilityLevel,
      recommendation:
        installmentRatio > 40 ? "Reject" : installmentRatio > 20 ? "Review" : "Approve",
    };
  }
}

export const loanAPI = new LoanAPI();

export {
  LOAN_ENDPOINTS,
  LOAN_STATUS,
  LOAN_APPLICATION_STATUS,
  LOAN_TYPE,
  INTEREST_TYPE,
  REPAYMENT_FREQUENCY,
  RISK_LEVEL,
  LOAN_STATUS_LABELS,
  LOAN_TYPE_LABELS,
};
