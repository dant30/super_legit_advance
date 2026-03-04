export const selectLoansState = (state) => state?.loans || {};

export const selectLoans = (state) => selectLoansState(state).loans || [];
export const selectLoansLoading = (state) =>
  Boolean(selectLoansState(state).loansLoading);
export const selectLoansError = (state) => selectLoansState(state).loansError || null;
export const selectLoansPagination = (state) =>
  selectLoansState(state).loansPagination || null;

export const selectSelectedLoan = (state) =>
  selectLoansState(state).selectedLoan || null;
export const selectSelectedLoanLoading = (state) =>
  Boolean(selectLoansState(state).selectedLoanLoading);
export const selectSelectedLoanError = (state) =>
  selectLoansState(state).selectedLoanError || null;

export const selectLoanStats = (state) => selectLoansState(state).stats || null;
export const selectLoanStatsLoading = (state) =>
  Boolean(selectLoansState(state).statsLoading);
export const selectLoanStatsError = (state) =>
  selectLoansState(state).statsError || null;

export const selectLoanApplications = (state) =>
  selectLoansState(state).loanApplications || [];
export const selectLoanApplicationsLoading = (state) =>
  Boolean(selectLoansState(state).loanApplicationsLoading);
export const selectLoanApplicationsError = (state) =>
  selectLoansState(state).loanApplicationsError || null;
export const selectSelectedLoanApplication = (state) =>
  selectLoansState(state).selectedLoanApplication || null;

export const selectCollaterals = (state) =>
  selectLoansState(state).collaterals || [];
export const selectCollateralsLoading = (state) =>
  Boolean(selectLoansState(state).collateralsLoading);
export const selectCollateralsError = (state) =>
  selectLoansState(state).collateralsError || null;

export const selectLoanSearchResults = (state) =>
  selectLoansState(state).searchResults || [];
export const selectLoanSearchLoading = (state) =>
  Boolean(selectLoansState(state).searchLoading);
export const selectLoanSearchError = (state) =>
  selectLoansState(state).searchError || null;

export const selectLoanCalculatorResult = (state) =>
  selectLoansState(state).calculatorResult || null;
export const selectLoanCalculatorLoading = (state) =>
  Boolean(selectLoansState(state).calculatorLoading);
export const selectLoanCalculatorError = (state) =>
  selectLoansState(state).calculatorError || null;

export const selectLoanFilters = (state) =>
  selectLoansState(state).loanFilters || {};
export const selectLoanApplicationFilters = (state) =>
  selectLoansState(state).applicationFilters || {};
