export const selectDashboardState = (state) => state?.dashboard || {};

export const selectDashboardLoading = (state) =>
  Boolean(selectDashboardState(state).loading);
export const selectDashboardError = (state) =>
  selectDashboardState(state).error || null;
export const selectDashboardOverview = (state) =>
  selectDashboardState(state).overview || null;
export const selectDashboardCustomers = (state) =>
  selectDashboardState(state).customers || [];
export const selectDashboardLoans = (state) =>
  selectDashboardState(state).loans || [];
export const selectDashboardPendingApprovals = (state) =>
  selectDashboardState(state).pendingApprovals || [];
export const selectDashboardCollections = (state) =>
  selectDashboardState(state).collections || null;
export const selectDashboardPerformance = (state) =>
  selectDashboardState(state).performance || [];
export const selectDashboardRecentActivity = (state) =>
  selectDashboardState(state).recentActivity || [];
export const selectDashboardLastUpdatedAt = (state) =>
  selectDashboardState(state).lastUpdatedAt || null;
