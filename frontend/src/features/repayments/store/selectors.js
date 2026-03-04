export const selectRepaymentsState = (state) => state?.repayments || {};

export const selectRepayments = (state) =>
  selectRepaymentsState(state).repayments || [];
export const selectRepaymentsLoading = (state) =>
  Boolean(selectRepaymentsState(state).loading);
export const selectRepaymentsError = (state) =>
  selectRepaymentsState(state).error || null;

export const selectSelectedRepayment = (state) =>
  selectRepaymentsState(state).selectedRepayment || null;
export const selectRepaymentSchedules = (state) =>
  selectRepaymentsState(state).schedules || [];
export const selectRepaymentPenalties = (state) =>
  selectRepaymentsState(state).penalties || [];
export const selectRepaymentDashboardStats = (state) =>
  selectRepaymentsState(state).dashboardStats || null;
export const selectRepaymentsPagination = (state) =>
  selectRepaymentsState(state).pagination || null;
export const selectRepaymentsTotalCount = (state) =>
  selectRepaymentsPagination(state)?.count || 0;
export const selectRepaymentsNextPage = (state) =>
  selectRepaymentsPagination(state)?.next || null;
export const selectRepaymentsPreviousPage = (state) =>
  selectRepaymentsPagination(state)?.previous || null;
export const selectRepaymentsPage = (state) =>
  selectRepaymentsPagination(state)?.page || 1;
export const selectRepaymentsPageSize = (state) =>
  selectRepaymentsPagination(state)?.pageSize || 20;
