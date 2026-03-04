import { createSlice } from "@reduxjs/toolkit";
import { REPAYMENTS_INITIAL_STATE } from "../types";

const repaymentsSlice = createSlice({
  name: "repayments",
  initialState: REPAYMENTS_INITIAL_STATE,
  reducers: {
    setRepaymentsState(state, action) {
      const patch = action.payload || {};
      Object.assign(state, patch);
    },
    setRepayments(state, action) {
      state.repayments = action.payload || [];
    },
    setRepaymentsLoading(state, action) {
      state.loading = Boolean(action.payload);
    },
    setRepaymentsError(state, action) {
      state.error = action.payload || null;
    },
    setSelectedRepayment(state, action) {
      state.selectedRepayment = action.payload || null;
    },
    setRepaymentSchedules(state, action) {
      state.schedules = action.payload || [];
    },
    setRepaymentPenalties(state, action) {
      state.penalties = action.payload || [];
    },
    setRepaymentDashboardStats(state, action) {
      state.dashboardStats = action.payload || null;
    },
    setRepaymentsPagination(state, action) {
      state.pagination = action.payload || state.pagination;
    },
    resetRepaymentsState() {
      return REPAYMENTS_INITIAL_STATE;
    },
  },
});

export const {
  setRepaymentsState,
  setRepayments,
  setRepaymentsLoading,
  setRepaymentsError,
  setSelectedRepayment,
  setRepaymentSchedules,
  setRepaymentPenalties,
  setRepaymentDashboardStats,
  setRepaymentsPagination,
  resetRepaymentsState,
} = repaymentsSlice.actions;

export default repaymentsSlice.reducer;
