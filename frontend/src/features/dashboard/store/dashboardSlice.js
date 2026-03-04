import { createSlice } from "@reduxjs/toolkit";
import { DASHBOARD_INITIAL_STATE } from "../types";

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: DASHBOARD_INITIAL_STATE,
  reducers: {
    setDashboardState(state, action) {
      const patch = action.payload || {};
      Object.assign(state, patch);
    },
    setDashboardLoading(state, action) {
      state.loading = Boolean(action.payload);
    },
    setDashboardError(state, action) {
      state.error = action.payload || null;
    },
    setOverview(state, action) {
      state.overview = action.payload || null;
    },
    setDashboardCustomers(state, action) {
      state.customers = action.payload || [];
    },
    setDashboardLoans(state, action) {
      state.loans = action.payload || [];
    },
    setPendingApprovals(state, action) {
      state.pendingApprovals = action.payload || [];
    },
    setCollections(state, action) {
      state.collections = action.payload || null;
    },
    setPerformance(state, action) {
      state.performance = action.payload || [];
    },
    setRecentActivity(state, action) {
      state.recentActivity = action.payload || [];
    },
    resetDashboardState() {
      return DASHBOARD_INITIAL_STATE;
    },
  },
});

export const {
  setDashboardState,
  setDashboardLoading,
  setDashboardError,
  setOverview,
  setDashboardCustomers,
  setDashboardLoans,
  setPendingApprovals,
  setCollections,
  setPerformance,
  setRecentActivity,
  resetDashboardState,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
