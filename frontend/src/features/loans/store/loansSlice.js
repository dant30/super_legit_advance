import { createSlice } from "@reduxjs/toolkit";
import { LOAN_INITIAL_STATE } from "../types";

const loansSlice = createSlice({
  name: "loans",
  initialState: LOAN_INITIAL_STATE,
  reducers: {
    setLoansState(state, action) {
      const patch = action.payload || {};
      Object.assign(state, patch);
    },
    setLoans(state, action) {
      state.loans = action.payload || [];
    },
    setLoansLoading(state, action) {
      state.loansLoading = Boolean(action.payload);
    },
    setSelectedLoan(state, action) {
      state.selectedLoan = action.payload || null;
    },
    setLoanStats(state, action) {
      state.stats = action.payload || null;
    },
    setLoanApplications(state, action) {
      state.loanApplications = action.payload || [];
    },
    setSelectedLoanApplication(state, action) {
      state.selectedLoanApplication = action.payload || null;
    },
    setCollaterals(state, action) {
      state.collaterals = action.payload || [];
    },
    setLoanSearchResults(state, action) {
      state.searchResults = action.payload || [];
    },
    setLoanCalculatorResult(state, action) {
      state.calculatorResult = action.payload || null;
    },
    setLoanFilters(state, action) {
      state.loanFilters = action.payload || {};
    },
    setApplicationFilters(state, action) {
      state.applicationFilters = action.payload || {};
    },
    resetLoansState() {
      return LOAN_INITIAL_STATE;
    },
  },
});

export const {
  setLoansState,
  setLoans,
  setLoansLoading,
  setSelectedLoan,
  setLoanStats,
  setLoanApplications,
  setSelectedLoanApplication,
  setCollaterals,
  setLoanSearchResults,
  setLoanCalculatorResult,
  setLoanFilters,
  setApplicationFilters,
  resetLoansState,
} = loansSlice.actions;

export default loansSlice.reducer;
