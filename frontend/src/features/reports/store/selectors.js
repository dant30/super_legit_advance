export const selectReportsState = (state) => state?.reports || {};
const toErrorText = (value, fallback = null) => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message || fallback;
  if (typeof value?.message === "string") return value.message;
  if (typeof value?.detail === "string") return value.detail;
  if (typeof value?.error === "string") return value.error;
  return fallback;
};

export const selectReports = (state) => selectReportsState(state).reports || [];
export const selectCurrentReport = (state) =>
  selectReportsState(state).currentReport || null;
export const selectReportHistory = (state) =>
  selectReportsState(state).reportHistory || [];
export const selectReportSchedules = (state) =>
  selectReportsState(state).schedules || [];

export const selectReportsLoading = (state) =>
  Boolean(selectReportsState(state).loading);
export const selectReportsGenerating = (state) =>
  Boolean(selectReportsState(state).generating);
export const selectReportsExporting = (state) =>
  Boolean(selectReportsState(state).exporting);

export const selectReportsError = (state) =>
  toErrorText(selectReportsState(state).error, null);
export const selectReportsSuccess = (state) =>
  selectReportsState(state).success || null;

export const selectReportsFilters = (state) =>
  selectReportsState(state).filterParams || {};
export const selectReportsSelectedFormat = (state) =>
  selectReportsState(state).selectedFormat || "pdf";
export const selectReportsGenerationProgress = (state) =>
  Number(selectReportsState(state).generationProgress || 0);

export const selectLoansReportLoading = (state) =>
  Boolean(selectReportsState(state).loansLoading);
export const selectLoansReportError = (state) =>
  toErrorText(selectReportsState(state).loansError, null);

export const selectPaymentsReportLoading = (state) =>
  Boolean(selectReportsState(state).paymentsLoading);
export const selectPaymentsReportError = (state) =>
  toErrorText(selectReportsState(state).paymentsError, null);

export const selectCustomersReportLoading = (state) =>
  Boolean(selectReportsState(state).customersLoading);
export const selectCustomersReportError = (state) =>
  toErrorText(selectReportsState(state).customersError, null);

export const selectPerformanceReportLoading = (state) =>
  Boolean(selectReportsState(state).performanceLoading);
export const selectPerformanceReportError = (state) =>
  toErrorText(selectReportsState(state).performanceError, null);

export const selectAuditReportLoading = (state) =>
  Boolean(selectReportsState(state).auditLoading);
export const selectAuditReportError = (state) =>
  toErrorText(selectReportsState(state).auditError, null);

export const selectCollectionReportLoading = (state) =>
  Boolean(selectReportsState(state).collectionLoading);
export const selectCollectionReportError = (state) =>
  toErrorText(selectReportsState(state).collectionError, null);
