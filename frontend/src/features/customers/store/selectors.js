export const selectCustomersState = (state) => state?.customers || {};
export const selectCustomers = (state) => selectCustomersState(state).customers || [];
export const selectCustomersLoading = (state) =>
  Boolean(selectCustomersState(state).customersLoading);
export const selectSelectedCustomer = (state) =>
  selectCustomersState(state).selectedCustomer || null;
export const selectCustomerStats = (state) => selectCustomersState(state).stats || null;
