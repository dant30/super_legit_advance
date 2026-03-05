import { createSlice } from "@reduxjs/toolkit";
import { REPORTS_INITIAL_STATE } from "../types";

const reportsSlice = createSlice({
  name: "reports",
  initialState: REPORTS_INITIAL_STATE,
  reducers: {
    setReportsState(state, action) {
      const patch = action.payload || {};
      Object.assign(state, patch);
    },
    setReports(state, action) {
      state.reports = action.payload || [];
    },
    setCurrentReport(state, action) {
      state.currentReport = action.payload || null;
    },
    setReportHistory(state, action) {
      state.reportHistory = action.payload || [];
    },
    setReportSchedules(state, action) {
      state.schedules = action.payload || [];
    },
    setReportsLoading(state, action) {
      state.loading = Boolean(action.payload);
    },
    setReportsGenerating(state, action) {
      state.generating = Boolean(action.payload);
    },
    setReportsExporting(state, action) {
      state.exporting = Boolean(action.payload);
    },
    setReportsError(state, action) {
      state.error = action.payload || null;
    },
    setReportsSuccess(state, action) {
      state.success = action.payload || null;
    },
    setReportsFilters(state, action) {
      state.filterParams = action.payload || {};
    },
    setReportsSelectedFormat(state, action) {
      state.selectedFormat = action.payload || state.selectedFormat;
    },
    setReportsGenerationProgress(state, action) {
      const value = Number(action.payload || 0);
      state.generationProgress = Math.max(0, Math.min(100, value));
    },
    resetReportsState() {
      return REPORTS_INITIAL_STATE;
    },
  },
});

export const {
  setReportsState,
  setReports,
  setCurrentReport,
  setReportHistory,
  setReportSchedules,
  setReportsLoading,
  setReportsGenerating,
  setReportsExporting,
  setReportsError,
  setReportsSuccess,
  setReportsFilters,
  setReportsSelectedFormat,
  setReportsGenerationProgress,
  resetReportsState,
} = reportsSlice.actions;

export default reportsSlice.reducer;
